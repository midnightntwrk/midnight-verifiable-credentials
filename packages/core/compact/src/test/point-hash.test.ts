// SPDX-License-Identifier: Apache-2.0
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

import {
  CompactTypeBytes,
  CompactTypeField,
  CompactTypeJubjubPoint,
  CompactTypeVector,
  degradeToTransient,
  persistentHash,
  transientHash,
  upgradeFromTransient,
} from "@midnight-ntwrk/compact-runtime";
import { describe, expect, it } from "vitest";

import { type Proof, pureCircuits } from "../index.js";

// Public synthetic known-answer data, shared with the conformance gate.
const { fixture } = JSON.parse(
  readFileSync(
    new URL(
      "../../../../../conformance/vectors/signer-authorization.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const fromHex = (value: string): Uint8Array =>
  Uint8Array.from(Buffer.from(value, "hex"));
const point = (value: { x: string; y: string }) => ({
  x: BigInt(value.x),
  y: BigInt(value.y),
});
const points = [
  fixture.issuer.publicKey,
  fixture.verifier.publicKey,
  fixture.authority.publicKey,
  fixture.proofNoncePoint,
].map(point);
const coordinates = new CompactTypeVector(2, CompactTypeField);
const outer = new CompactTypeVector(3, new CompactTypeBytes(32));
const body = new Uint8Array(32).fill(0xab);
const proof: Proof = {
  signerVerificationMethodRef: {
    controllerAddress: { bytes: fromHex(fixture.issuer.controllerAddressHex) },
    methodId: fromHex(fixture.issuer.methodIdHex),
  },
  createdAt: BigInt(fixture.decisionSequence),
  challengeHash: fromHex(fixture.challengeHashHex),
  publicKey: points[0]!,
  signature: {
    r: points[3]!,
    s: BigInt(fixture.knownAnswers.issuerSignatureS),
  },
};
const subgroupOrder =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

// Reconstruct the pre-adaptation challenge using the PUBLIC runtime point
// descriptor. Public payload roots and every surrounding operation stay intact.
const originalChallenge = (payload: Uint8Array, input: Proof): bigint =>
  degradeToTransient(
    persistentHash(outer, [
      payload,
      upgradeFromTransient(
        transientHash(CompactTypeJubjubPoint, input.publicKey),
      ),
      upgradeFromTransient(
        transientHash(CompactTypeJubjubPoint, input.signature.r),
      ),
    ]),
  );

describe("private canonical Jubjub point hashing", () => {
  it("has exactly the existing x-then-y Field alignment/value preimage", () => {
    expect(CompactTypeJubjubPoint.alignment()).toEqual(coordinates.alignment());
    for (const value of points) {
      const fields = [value.x, value.y];
      expect(CompactTypeJubjubPoint.toValue(value)).toEqual(
        coordinates.toValue(fields),
      );
      expect(transientHash(CompactTypeJubjubPoint, value)).toBe(
        transientHash(coordinates, fields),
      );
    }
  });

  it("preserves both direct point hashes through public challenge entrypoints", () => {
    for (const publicKey of points)
      for (const r of points) {
        const input = {
          ...proof,
          publicKey,
          signature: { ...proof.signature, r },
        };
        expect(pureCircuits.issuanceProofChallenge(body, input)).toBe(
          originalChallenge(
            pureCircuits.issuanceProofPayloadRoot(body, input),
            input,
          ),
        );
        expect(pureCircuits.presentationProofChallenge(body, input)).toBe(
          originalChallenge(
            pureCircuits.presentationProofPayloadRoot(body, input),
            input,
          ),
        );
      }
    expect("transientHashJubjubPoint" in pureCircuits).toBe(false);
  });

  it("keeps the fixed challenge/signature known answers and domain separation", () => {
    const challenge = pureCircuits.issuanceProofChallenge(body, proof);
    expect(challenge).toBe(BigInt(fixture.knownAnswers.issuerChallenge));
    expect(pureCircuits.assertValidIssuanceContextProof(body, proof)).toEqual(
      [],
    );
    expect(pureCircuits.presentationProofChallenge(body, proof)).not.toBe(
      challenge,
    );
    expect(() =>
      pureCircuits.assertValidIssuanceContextProof(
        new Uint8Array(32).fill(0xac),
        proof,
      ),
    ).toThrow(/Signature verification failed/);
    expect(() =>
      pureCircuits.assertValidPresentationContextProof(body, proof),
    ).toThrow(/Signature verification failed/);
  });

  it("retains Field-response modulo-subgroup semantics and rejects tampering", () => {
    const challenge = BigInt(fixture.knownAnswers.issuerChallenge);
    expect(
      pureCircuits.verifySignature(proof.publicKey, proof.signature, challenge),
    ).toBe(true);
    expect(
      pureCircuits.verifySignature(
        proof.publicKey,
        { ...proof.signature, s: proof.signature.s + subgroupOrder },
        challenge,
      ),
    ).toBe(true);
    for (const s of [
      0n,
      1n,
      subgroupOrder - 1n,
      subgroupOrder,
      subgroupOrder + 1n,
    ]) {
      expect(() =>
        pureCircuits.verifySignature(
          proof.publicKey,
          { ...proof.signature, s },
          challenge,
        ),
      ).toThrow(/Signature verification failed/);
    }
    expect(() =>
      pureCircuits.verifySignature(
        { x: 0n, y: 1n },
        proof.signature,
        challenge,
      ),
    ).toThrow(/identity point/);
    expect(() =>
      pureCircuits.verifySignature(
        { x: 1n, y: 1n },
        proof.signature,
        challenge,
      ),
    ).toThrow(/EmbeddedGroupAffine/);
    expect(() =>
      pureCircuits.verifySignature(
        {
          x: 0n,
          y: 52435875175126190479447740508185965837690552500527637822603658699938581184512n,
        },
        proof.signature,
        challenge,
      ),
    ).toThrow(/unreachable/);
  });
});
