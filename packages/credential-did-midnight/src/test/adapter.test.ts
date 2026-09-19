import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  AuthorizationState,
  SignerRole,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import {
  createMidnightDIDDocument,
  createMidnightDIDString,
  LedgerToDomain,
  type MidnightDIDResolverInterface,
  MidnightNetwork,
  parseContractAddress,
} from "@midnight-ntwrk/midnight-did";
import {
  CurveType,
  KeyType,
  VerificationMethodType,
} from "@midnight-ntwrk/midnight-did-domain";
import { describe, expect, it } from "vitest";

import {
  createMidnightDIDHolderBinding,
  createMidnightDIDSignerDescriptor,
  midnightDIDMethodId,
  resolveMidnightDIDMethodBinding,
} from "../index.js";

const address = parseContractAddress("11".repeat(32));
const did = createMidnightDIDString(address, MidnightNetwork.Testnet);
const publicKey = ecMulGenerator(7n);
const publicKeyJwk = LedgerToDomain.schnorrJubjubPublicKeyJwk({
  id: "#issuer-key",
  publicKey,
} as never);
const document = createMidnightDIDDocument({
  id: did,
  verificationMethod: [
    {
      id: "#issuer-key",
      type: VerificationMethodType.JsonWebKey,
      controller: did,
      publicKeyJwk,
    } as never,
  ],
  authentication: ["#issuer-key"],
  assertionMethod: ["#issuer-key"],
});

type ResolutionResult = NonNullable<
  Awaited<ReturnType<MidnightDIDResolverInterface["resolveResult"]>>
>;
type VerificationMethod = NonNullable<
  ResolutionResult["didDocument"]["verificationMethod"]
>[number];

const documentWith = (
  overrides: Partial<ResolutionResult["didDocument"]>,
): ResolutionResult["didDocument"] => ({ ...document, ...overrides });

const documentWithMethod = (
  overrides: Partial<VerificationMethod>,
): ResolutionResult["didDocument"] => ({
  ...document,
  verificationMethod: [
    { ...document.verificationMethod?.[0], ...overrides } as VerificationMethod,
  ],
});

const resolver = (
  overrides: Partial<ResolutionResult> = {},
): Pick<MidnightDIDResolverInterface, "resolveResult"> => ({
  resolveResult: async () => ({
    didDocument: document,
    didDocumentMetadata: { versionId: "12" },
    ...overrides,
  }),
});

describe("resolveMidnightDIDMethodBinding", () => {
  it("maps a subject-bound native Jubjub method to Compact values", async () => {
    const binding = await resolveMidnightDIDMethodBinding({
      resolver: resolver(),
      did,
      verificationMethodId: "#issuer-key",
      relationship: "assertionMethod",
    });

    expect(binding.verificationMethodRef.controllerAddress.bytes).toEqual(
      Uint8Array.from({ length: 32 }, () => 0x11),
    );
    expect(binding.verificationMethodRef.methodId).toEqual(
      midnightDIDMethodId("#issuer-key"),
    );
    expect(binding.publicKey).toEqual(publicKey);
    expect(binding.didStateVersion).toBe(12n);
    expect(binding.verificationRelationship).toBe(
      VerificationRelationship.assertionMethod,
    );
    expect(publicKeyJwk).toEqual({
      kty: KeyType.EC,
      crv: CurveType.Jubjub,
      x: "2LaxH9UXm4bl4V_1cwWXRMhmZzjBtZ2FZqABjGP7sGk",
      y: "JsacxJLhN6OKsp2Ac4fM1wAhqxQ8II7RIel9ks8MEBg",
    });
  });

  it("hashes the exact case-sensitive canonical fragment", () => {
    expect(midnightDIDMethodId("#issuer-key")).not.toEqual(
      midnightDIDMethodId("#Issuer-Key"),
    );
    expect(() => midnightDIDMethodId("issuer-key")).toThrow(
      "canonical fragment",
    );
  });

  it("rejects a method absent from the requested relationship", async () => {
    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver(),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "capabilityInvocation",
      }),
    ).rejects.toThrow("not authorized for capabilityInvocation");
  });

  it("rejects deactivated and unversioned DID state", async () => {
    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocumentMetadata: { deactivated: true, versionId: "13" },
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "authentication",
      }),
    ).rejects.toThrow("deactivated");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({ didDocumentMetadata: {} }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "authentication",
      }),
    ).rejects.toThrow("positive versionId");
  });

  it("rejects unresolved, mismatched, and offchain DID subjects", async () => {
    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: { resolveResult: async () => null },
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("could not be resolved");

    const otherDid = createMidnightDIDString(
      parseContractAddress("22".repeat(32)),
      MidnightNetwork.Testnet,
    );
    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWith({ id: otherDid as typeof document.id }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("subject does not match");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver(),
        did: `did:midnight:offchain:${"ab".repeat(32)}` as typeof did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("Offchain Midnight DIDs");
  });

  it("rejects methods outside the subject-owned native Jubjub profile", async () => {
    const otherDid = createMidnightDIDString(
      parseContractAddress("22".repeat(32)),
      MidnightNetwork.Testnet,
    );
    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWith({ verificationMethod: [] }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("absent from the DID document");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWithMethod({
            controller: otherDid as unknown as VerificationMethod["controller"],
          }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("controller does not match");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWithMethod({
            type: VerificationMethodType.Undefined,
          }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("must use JsonWebKey");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWithMethod({
            publicKeyJwk: {
              kty: KeyType.OKP,
              crv: CurveType.Ed25519,
              x: "AA",
            },
          }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("native EC/Jubjub");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWithMethod({
            publicKeyJwk: {
              kty: KeyType.EC,
              crv: CurveType.Jubjub,
              x: publicKeyJwk.x,
            },
          }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("native EC/Jubjub");
  });

  it("rejects malformed native coordinates and non-fragment method ids", async () => {
    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver({
          didDocument: documentWithMethod({
            publicKeyJwk: { ...publicKeyJwk, x: "AA" },
          }),
        }),
        did,
        verificationMethodId: "#issuer-key",
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("exactly 32 bytes");

    await expect(
      resolveMidnightDIDMethodBinding({
        resolver: resolver(),
        did,
        verificationMethodId: `${did}/keys/issuer-key`,
        relationship: "assertionMethod",
      }),
    ).rejects.toThrow("must be a fragment");
  });

  it.each(["0", "-1", "1.0", "18446744073709551616"])(
    "rejects invalid DID state version %s",
    async (versionId) => {
      await expect(
        resolveMidnightDIDMethodBinding({
          resolver: resolver({ didDocumentMetadata: { versionId } }),
          did,
          verificationMethodId: "#issuer-key",
          relationship: "assertionMethod",
        }),
      ).rejects.toThrow(/positive versionId|fit into uint64/u);
    },
  );
});

describe("binding composition helpers", () => {
  it("creates holder and issuer authorization inputs from one binding", async () => {
    const authentication = await resolveMidnightDIDMethodBinding({
      resolver: resolver(),
      did,
      verificationMethodId: "#issuer-key",
      relationship: "authentication",
    });
    const holder = createMidnightDIDHolderBinding(authentication);
    expect(holder.explicitBinding.holderVerificationMethodRef).toEqual(
      authentication.verificationMethodRef,
    );

    const assertion = await resolveMidnightDIDMethodBinding({
      resolver: resolver(),
      did,
      verificationMethodId: "#issuer-key",
      relationship: "assertionMethod",
    });
    const descriptor = createMidnightDIDSignerDescriptor(assertion, {
      authorizationId: Uint8Array.from({ length: 32 }, () => 1),
      decisionSequence: 1n,
      state: AuthorizationState.active,
      role: SignerRole.issuer,
      scopeCommitment: Uint8Array.from({ length: 32 }, () => 2),
      policyCommitment: Uint8Array.from({ length: 32 }, () => 3),
    });
    expect(descriptor.signerVerificationMethodRef).toEqual(
      assertion.verificationMethodRef,
    );
    expect(descriptor.signerPublicKey).toEqual(assertion.publicKey);
    expect(descriptor.didStateVersion).toBe(12n);
  });

  it("rejects a relationship that does not satisfy the requested role", async () => {
    const authentication = await resolveMidnightDIDMethodBinding({
      resolver: resolver(),
      did,
      verificationMethodId: "#issuer-key",
      relationship: "authentication",
    });
    expect(() =>
      createMidnightDIDSignerDescriptor(authentication, {
        authorizationId: Uint8Array.from({ length: 32 }, () => 1),
        decisionSequence: 1n,
        state: AuthorizationState.active,
        role: SignerRole.issuer,
        scopeCommitment: Uint8Array.from({ length: 32 }, () => 2),
        policyCommitment: Uint8Array.from({ length: 32 }, () => 3),
      }),
    ).toThrow("requires assertionMethod");

    const assertion = await resolveMidnightDIDMethodBinding({
      resolver: resolver(),
      did,
      verificationMethodId: "#issuer-key",
      relationship: "assertionMethod",
    });
    expect(() => createMidnightDIDHolderBinding(assertion)).toThrow(
      "requires authentication",
    );
    expect(() =>
      createMidnightDIDSignerDescriptor(assertion, {
        authorizationId: Uint8Array.from({ length: 32 }, () => 1),
        decisionSequence: 1n,
        state: AuthorizationState.active,
        role: SignerRole.verifier,
        scopeCommitment: Uint8Array.from({ length: 32 }, () => 2),
        policyCommitment: Uint8Array.from({ length: 32 }, () => 3),
      }),
    ).toThrow("requires authentication or capabilityInvocation");
  });

  it("rejects decision sequences outside the positive uint64 range", async () => {
    const assertion = await resolveMidnightDIDMethodBinding({
      resolver: resolver(),
      did,
      verificationMethodId: "#issuer-key",
      relationship: "assertionMethod",
    });
    const options = {
      authorizationId: Uint8Array.from({ length: 32 }, () => 1),
      state: AuthorizationState.active,
      role: SignerRole.issuer,
      scopeCommitment: Uint8Array.from({ length: 32 }, () => 2),
      policyCommitment: Uint8Array.from({ length: 32 }, () => 3),
    } as const;

    for (const decisionSequence of [0n, -1n, 1n << 64n]) {
      expect(() =>
        createMidnightDIDSignerDescriptor(assertion, {
          ...options,
          decisionSequence,
        }),
      ).toThrow("decisionSequence must be a positive uint64");
    }
  });
});
