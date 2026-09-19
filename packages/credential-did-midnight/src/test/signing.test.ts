import {
  type Proof,
  pureCircuits as credentialPureCircuits,
} from "@midnight-ntwrk/credential-compact";
import {
  createMidnightDIDDocument,
  createMidnightDIDString,
  LedgerToDomain,
  type MidnightDIDResolverInterface,
  MidnightNetwork,
  parseContractAddress,
} from "@midnight-ntwrk/midnight-did";
import { VerificationMethodType } from "@midnight-ntwrk/midnight-did-domain";
import {
  deriveJubjubPublicKey,
  JUBJUB_ORDER,
  seedBytesToJubjubSecretScalar,
} from "@midnight-ntwrk/midnight-did-jubjub-schnorr";
import { describe, expect, it } from "vitest";

import {
  resolveMidnightDIDMethodBinding,
  signMidnightDIDCredentialProof,
  signMidnightDIDPresentationProof,
} from "../index.js";
import { pureCircuits as didBindingPureCircuits } from "../managed/did-midnight/contract/index.js";

const bytes = (value: number): Uint8Array =>
  Uint8Array.from({ length: 32 }, () => value);
const seed = bytes(0x42);
const secretScalar = seedBytesToJubjubSecretScalar(seed);
const publicKey = deriveJubjubPublicKey(secretScalar);
const address = parseContractAddress("11".repeat(32));
const did = createMidnightDIDString(address, MidnightNetwork.Testnet);
const publicKeyJwk = LedgerToDomain.schnorrJubjubPublicKeyJwk({
  id: "#proof-key",
  publicKey,
} as never);
const document = createMidnightDIDDocument({
  id: did,
  verificationMethod: [
    {
      id: "#proof-key",
      type: VerificationMethodType.JsonWebKey,
      controller: did,
      publicKeyJwk,
    } as never,
  ],
  authentication: ["#proof-key"],
  assertionMethod: ["#proof-key"],
});
const resolver: Pick<MidnightDIDResolverInterface, "resolveResult"> = {
  resolveResult: async () => ({
    didDocument: document,
    didDocumentMetadata: { versionId: "7" },
  }),
};

const bodyRoot = bytes(0xa1);
const challengeHash = bytes(0xb2);

describe("Midnight DID proof signing", () => {
  it("signs a credential proof with a resolved Midnight DID key", async () => {
    const methodBinding = await resolveMidnightDIDMethodBinding({
      resolver,
      did,
      verificationMethodId: "#proof-key",
      relationship: "assertionMethod",
    });
    const proof = signMidnightDIDCredentialProof({
      methodBinding,
      secretScalar,
      bodyRoot,
      createdAt: 42n,
      challengeHash,
    });

    expect(proof.publicKey).toEqual(publicKey);
    expect(
      credentialPureCircuits.issuanceProofChallenge(bodyRoot, proof),
    ).toBeLessThan(JUBJUB_ORDER);
    expect(() =>
      credentialPureCircuits.assertValidIssuanceContextProof(bodyRoot, proof),
    ).not.toThrow();
    expect(() =>
      didBindingPureCircuits.assertMidnightDIDProofMatchesMethod(
        proof,
        methodBinding,
      ),
    ).not.toThrow();
    expect(() =>
      credentialPureCircuits.assertValidIssuanceContextProof(
        bytes(0xff),
        proof,
      ),
    ).toThrow("Signature verification failed");
    expect(() =>
      credentialPureCircuits.assertValidPresentationContextProof(
        bodyRoot,
        proof,
      ),
    ).toThrow("Signature verification failed");
  });

  it("signs a presentation proof and rejects signature substitution", async () => {
    const methodBinding = await resolveMidnightDIDMethodBinding({
      resolver,
      did,
      verificationMethodId: "#proof-key",
      relationship: "authentication",
    });
    const proof = signMidnightDIDPresentationProof({
      methodBinding,
      secretScalar,
      bodyRoot,
      createdAt: 43n,
      challengeHash,
    });
    const substituted: Proof = {
      ...proof,
      signature: { ...proof.signature, s: proof.signature.s + 1n },
    };

    expect(() =>
      credentialPureCircuits.assertValidPresentationContextProof(
        bodyRoot,
        proof,
      ),
    ).not.toThrow();
    expect(
      credentialPureCircuits.presentationProofChallenge(bodyRoot, proof),
    ).toBeLessThan(JUBJUB_ORDER);
    const secondProof = signMidnightDIDPresentationProof({
      methodBinding,
      secretScalar,
      bodyRoot,
      createdAt: 43n,
      challengeHash,
    });
    expect(secondProof.signature.r).not.toEqual(proof.signature.r);
    expect(() =>
      credentialPureCircuits.assertValidPresentationContextProof(
        bodyRoot,
        substituted,
      ),
    ).toThrow("Signature verification failed");

    for (const changed of [
      { ...proof, challengeHash: bytes(0xee) },
      { ...proof, createdAt: proof.createdAt + 1n },
      {
        ...proof,
        signature: {
          ...proof.signature,
          r: deriveJubjubPublicKey(17n),
        },
      },
    ]) {
      expect(() =>
        credentialPureCircuits.assertValidPresentationContextProof(
          bodyRoot,
          changed,
        ),
      ).toThrow("Signature verification failed");
    }
    expect(() =>
      credentialPureCircuits.assertValidIssuanceContextProof(bodyRoot, proof),
    ).toThrow("Signature verification failed");
  });

  it("rejects wrong keys, relationships, and malformed signed inputs", async () => {
    const assertionMethod = await resolveMidnightDIDMethodBinding({
      resolver,
      did,
      verificationMethodId: "#proof-key",
      relationship: "assertionMethod",
    });
    const authentication = await resolveMidnightDIDMethodBinding({
      resolver,
      did,
      verificationMethodId: "#proof-key",
      relationship: "authentication",
    });
    const options = {
      methodBinding: assertionMethod,
      secretScalar,
      bodyRoot,
      createdAt: 42n,
      challengeHash,
    };

    expect(() =>
      signMidnightDIDCredentialProof({ ...options, secretScalar: 1n }),
    ).toThrow("does not match method binding");
    expect(() =>
      signMidnightDIDCredentialProof({ ...options, secretScalar: 0n }),
    ).toThrow("must be nonzero");
    expect(() =>
      signMidnightDIDCredentialProof({
        ...options,
        methodBinding: authentication,
      }),
    ).toThrow("requires assertionMethod");
    expect(() =>
      signMidnightDIDPresentationProof({
        ...options,
        methodBinding: assertionMethod,
      }),
    ).toThrow("requires authentication");
    expect(() =>
      signMidnightDIDCredentialProof({
        ...options,
        bodyRoot: bytes(1).slice(1),
      }),
    ).toThrow("bodyRoot must contain exactly 32 bytes");
    expect(() =>
      signMidnightDIDCredentialProof({
        ...options,
        challengeHash: bytes(1).slice(1),
      }),
    ).toThrow("challengeHash must contain exactly 32 bytes");
    expect(() =>
      signMidnightDIDCredentialProof({ ...options, createdAt: -1n }),
    ).toThrow("createdAt must fit into uint64");
    expect(() =>
      signMidnightDIDCredentialProof({
        ...options,
        createdAt: 1n << 64n,
      }),
    ).toThrow("createdAt must fit into uint64");
    expect(() =>
      signMidnightDIDCredentialProof({
        ...options,
        createdAt: (1n << 64n) - 1n,
      }),
    ).not.toThrow();
  });
});
