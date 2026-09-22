import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  AuthorizationState,
  SignerRole,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/did-midnight/contract/index.js";

const bytes = (value: number): Uint8Array =>
  Uint8Array.from({ length: 32 }, () => value);
const reference = {
  controllerAddress: { bytes: bytes(1) },
  methodId: bytes(2),
};
const publicKey = ecMulGenerator(7n);
const methodBinding = {
  verificationMethodRef: reference,
  publicKey,
  didStateVersion: 12n,
  verificationRelationship: VerificationRelationship.authentication,
};
const proof = {
  signerVerificationMethodRef: reference,
  createdAt: 1n,
  challengeHash: bytes(3),
  publicKey,
  signature: { r: ecMulGenerator(9n), s: 1n },
};

describe("Midnight DID Compact extension", () => {
  it("binds a proof and explicit holder to the same DID method and key", () => {
    expect(() =>
      pureCircuits.assertMidnightDIDProofMatchesMethod(proof, methodBinding),
    ).not.toThrow();
    expect(() =>
      pureCircuits.assertMidnightDIDHolderBinding(
        {
          explicitBinding: { holderVerificationMethodRef: reference },
          methodBinding,
        },
        proof,
      ),
    ).not.toThrow();
    expect(
      pureCircuits.midnightDIDMethodBindingRoot(methodBinding),
    ).toHaveLength(32);
  });

  it("rejects proof method and key substitution", () => {
    expect(() =>
      pureCircuits.assertMidnightDIDProofMatchesMethod(
        {
          ...proof,
          signerVerificationMethodRef: { ...reference, methodId: bytes(4) },
        },
        methodBinding,
      ),
    ).toThrow();
    expect(() =>
      pureCircuits.assertMidnightDIDProofMatchesMethod(
        { ...proof, publicKey: ecMulGenerator(8n) },
        methodBinding,
      ),
    ).toThrow();
  });

  it("rejects non-authentication holder binding", () => {
    expect(() =>
      pureCircuits.assertMidnightDIDHolderBinding(
        {
          explicitBinding: { holderVerificationMethodRef: reference },
          methodBinding: {
            ...methodBinding,
            verificationRelationship: VerificationRelationship.assertionMethod,
          },
        },
        proof,
      ),
    ).toThrow();
  });

  it("binds authorization to the exact method, key, state, and relationship", () => {
    const descriptor = {
      version: 1n,
      authorizationId: bytes(5),
      decisionSequence: 1n,
      state: AuthorizationState.active,
      role: SignerRole.verifier,
      signerVerificationMethodRef: reference,
      signerPublicKey: publicKey,
      didStateVersion: 12n,
      verificationRelationship: VerificationRelationship.authentication,
      scopeCommitment: bytes(6),
      policyCommitment: bytes(7),
    };
    expect(() =>
      pureCircuits.assertMidnightDIDSignerAuthorization(
        methodBinding,
        descriptor,
      ),
    ).not.toThrow();
    expect(() =>
      pureCircuits.assertMidnightDIDSignerAuthorization(methodBinding, {
        ...descriptor,
        didStateVersion: 13n,
      }),
    ).toThrow();
  });
});
