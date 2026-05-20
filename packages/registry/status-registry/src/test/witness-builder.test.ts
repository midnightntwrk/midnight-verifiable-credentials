import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  buildLiveStatusWitness,
  buildRevokedSetNonMembershipInputs,
  buildRevokedSetStatusWitness,
  deriveRevokedSetStatusHandle,
  StatusCapabilityKind,
  StatusType,
} from "../index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const authorityVerificationMethodRef = {
  didContractAddress: { bytes: bytes32("did-contract:status-authority") },
  methodId: bytes32("#status-authority-key-1"),
};

describe("revoked-set witness builder", () => {
  it("derives a deterministic status handle from the credential root, registry, and issuer salt", () => {
    const first = deriveRevokedSetStatusHandle({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryId: bytes32("registry:hidden-holder"),
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
    });
    const second = deriveRevokedSetStatusHandle({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryId: bytes32("registry:hidden-holder"),
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
    });

    expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
  });

  it("builds a witness/binding pair when the snapshot does not list the handle as revoked", () => {
    const built = buildRevokedSetStatusWitness({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierStatusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
        enforceRegistryId: true,
        acceptedRegistryId: bytes32("registry:hidden-holder"),
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
      revokedStatusHandles: [bytes32("revoked-handle:someone-else")],
    });

    expect(built.statusHandle).toBeInstanceOf(Uint8Array);
    expect(built.statusBinding.registryRef.registryId).toEqual(
      bytes32("registry:hidden-holder"),
    );
    expect(built.statusBinding.statusType).toEqual(
      StatusType.revocationRegistry,
    );
    expect(built.witnessInput.registryState.revokedRoot).toEqual(
      bytes32("revoked-root:current"),
    );
  });

  it("builds a live status witness/binding pair without an external registry snapshot", () => {
    const built = buildLiveStatusWitness({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
        enforceRegistryId: true,
        acceptedRegistryId: bytes32("registry:hidden-holder"),
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
      revokedStatusHandles: [bytes32("revoked-handle:someone-else")],
    });

    expect(built.statusHandle).toBeInstanceOf(Uint8Array);
    expect(built.statusBinding.registryRef.registryId).toEqual(
      bytes32("registry:hidden-holder"),
    );
    expect(built.statusBinding.statusType).toEqual(
      StatusType.revocationRegistry,
    );
    expect(built.witnessInput.statusHandle).toEqual(built.statusHandle);
  });

  it("builds the canonical revoked-set request, binding, witness, and protocol bundle", () => {
    const built = buildRevokedSetNonMembershipInputs({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
      verifierStatusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
        enforceRegistryId: true,
        acceptedRegistryId: bytes32("registry:hidden-holder"),
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
      revokedStatusHandles: [bytes32("revoked-handle:someone-else")],
    });

    expect(built.request.registryState.revokedRoot).toEqual(
      bytes32("revoked-root:current"),
    );
    expect(built.protocol.request.verifierChallengeHash).toEqual(
      bytes32("challenge:status"),
    );
    expect(built.protocol.witnessInput.statusHandle).toEqual(
      built.statusHandle,
    );
    expect(built.statusBinding.statusType).toEqual(
      StatusType.revocationRegistry,
    );
    expect(built.statusBinding.statusHandleCommitment).toBeInstanceOf(
      Uint8Array,
    );
  });

  it("rejects the canonical revoked-set bundle when verifier policy expects another registry", () => {
    expect(() =>
      buildRevokedSetNonMembershipInputs({
        credentialClaimRoot: bytes32("credential-root:alice"),
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef,
        },
        issuerStatusSalt: bytes32("issuer-salt:alpha"),
        statusHandleOpening: bytes32("status-opening:alpha"),
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
        verifierStatusPolicy: {
          requireStatus: true,
          acceptedStatusCapability:
            StatusCapabilityKind.revokedSetNonMembership,
          enforceRegistryId: true,
          acceptedRegistryId: bytes32("registry:other"),
          enforceAttestationMaxAge: false,
          maxAttestationAge: 0n,
        },
      }),
    ).toThrow(/registry id does not match/i);
  });

  it("rejects a snapshot that already lists the derived handle as revoked", () => {
    const revokedHandle = deriveRevokedSetStatusHandle({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryId: bytes32("registry:hidden-holder"),
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
    });

    expect(() =>
      buildRevokedSetStatusWitness({
        credentialClaimRoot: bytes32("credential-root:alice"),
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef,
        },
        issuerStatusSalt: bytes32("issuer-salt:alpha"),
        statusHandleOpening: bytes32("status-opening:alpha"),
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        revokedStatusHandles: [revokedHandle],
      }),
    ).toThrow(/already present in the revoked set snapshot/i);
  });

  it("rejects a live status witness when the verifier policy expects another registry", () => {
    expect(() =>
      buildLiveStatusWitness({
        credentialClaimRoot: bytes32("credential-root:alice"),
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef,
        },
        issuerStatusSalt: bytes32("issuer-salt:alpha"),
        statusHandleOpening: bytes32("status-opening:alpha"),
        verifierStatusPolicy: {
          requireStatus: true,
          acceptedStatusCapability:
            StatusCapabilityKind.revokedSetNonMembership,
          enforceRegistryId: true,
          acceptedRegistryId: bytes32("registry:other"),
          enforceAttestationMaxAge: false,
          maxAttestationAge: 0n,
        },
      }),
    ).toThrow(/registry id does not match/i);
  });
});
