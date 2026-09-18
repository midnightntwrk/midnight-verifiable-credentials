import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  AuthorizationState,
  SignerRole,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import {
  createMidnightDIDDocument,
  createMidnightDIDString,
  type MidnightDIDResolverInterface,
  MidnightNetwork,
  parseContractAddress,
} from "@midnight-ntwrk/midnight-did";
import {
  CurveType,
  encodeBase64Url,
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

const bigintToLittleEndian32 = (value: bigint): Uint8Array => {
  const bytes = new Uint8Array(32);
  let remaining = value;
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return bytes;
};

const address = parseContractAddress("11".repeat(32));
const did = createMidnightDIDString(address, MidnightNetwork.Testnet);
const publicKey = ecMulGenerator(7n);
const document = createMidnightDIDDocument({
  id: did,
  verificationMethod: [
    {
      id: "#issuer-key",
      type: VerificationMethodType.JsonWebKey,
      controller: did,
      publicKeyJwk: {
        kty: KeyType.EC,
        crv: CurveType.Jubjub,
        x: encodeBase64Url(bigintToLittleEndian32(publicKey.x)),
        y: encodeBase64Url(bigintToLittleEndian32(publicKey.y)),
      },
    } as never,
  ],
  authentication: ["#issuer-key"],
  assertionMethod: ["#issuer-key"],
});

const resolver = (
  overrides: Partial<
    NonNullable<
      Awaited<ReturnType<MidnightDIDResolverInterface["resolveResult"]>>
    >
  > = {},
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
  });
});
