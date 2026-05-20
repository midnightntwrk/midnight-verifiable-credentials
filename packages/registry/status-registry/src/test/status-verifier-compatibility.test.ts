import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  buildAuthorityAttestedStatusProofProtocol,
  buildAuthorityAttestedStatusRequest,
  buildAuthorityAttestedStatusStatement,
  buildRegistryBoundStatusBinding,
  buildRevokedSetNonMembershipInputs,
  signAuthorityAttestedStatusProof,
  StatusCapabilityKind,
  StatusType,
} from "../index.js";
import { pureCircuits } from "../managed/revocation-registry/contract/index.js";
import { createSigner } from "./proof-fixtures.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const authoritySigner = createSigner("status-authority", 321n);
const alternateAuthoritySigner = createSigner("other-authority", 654n);

const revokedSetPolicy = {
  requireStatus: true,
  acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
  enforceRegistryId: true,
  acceptedRegistryId: bytes32("registry:hidden-holder"),
  enforceAttestationMaxAge: false,
  maxAttestationAge: 0n,
};

const noStatusPolicy = {
  requireStatus: true,
  acceptedStatusCapability: StatusCapabilityKind.noStatus,
  enforceRegistryId: true,
  acceptedRegistryId: bytes32("registry:hidden-holder"),
  enforceAttestationMaxAge: false,
  maxAttestationAge: 0n,
};

describe("status verifier compatibility", () => {
  it("pins the compact policy message for an observed revoked-set registry-id mismatch against the supplied status binding", () => {
    expect(() =>
      buildRevokedSetNonMembershipInputs({
        credentialClaimRoot: bytes32("credential-root:alice"),
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
        },
        issuerStatusSalt: bytes32("issuer-salt:alpha"),
        statusHandleOpening: bytes32("status-opening:alpha"),
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 2n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
        verifierStatusPolicy: {
          ...revokedSetPolicy,
          acceptedRegistryId: bytes32("registry:other"),
        },
      }),
    ).toThrow(/registry id does not match the supplied status binding/i);
  });

  it("pins the compact policy message for a status policy that does not request a real status capability", () => {
    expect(() =>
      buildRevokedSetNonMembershipInputs({
        credentialClaimRoot: bytes32("credential-root:alice"),
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
        },
        issuerStatusSalt: bytes32("issuer-salt:alpha"),
        statusHandleOpening: bytes32("status-opening:alpha"),
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 2n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
        verifierStatusPolicy: noStatusPolicy,
      }),
    ).toThrow(/request a real status capability/i);
  });

  it("pins the compact authority-mismatch message for authority-attested verification", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 2n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const binding = buildRegistryBoundStatusBinding({
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });
    expect(binding.statusType).toEqual(StatusType.revocationRegistry);
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: binding.statusHandleCommitment,
      expiresAt: 200n,
    });
    const protocol = buildAuthorityAttestedStatusProofProtocol({
      request,
      attestation: signAuthorityAttestedStatusProof({
        statement,
        signer: alternateAuthoritySigner,
        createdAt: 100n,
      }),
    });

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(
        {
          requireStatus: true,
          acceptedStatusCapability:
            StatusCapabilityKind.authorityAttestedStatus,
          enforceRegistryId: true,
          acceptedRegistryId: bytes32("registry:hidden-holder"),
          enforceAttestationMaxAge: false,
          maxAttestationAge: 0n,
        },
        binding,
        protocol,
        110n,
      ),
    ).toThrow(/contract address does not match the status authority/i);
  });

  it("pins the compact max-age message for an authority attestation that is too old", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 2n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const binding = buildRegistryBoundStatusBinding({
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: binding.statusHandleCommitment,
      expiresAt: 300n,
    });
    const protocol = buildAuthorityAttestedStatusProofProtocol({
      request,
      attestation: signAuthorityAttestedStatusProof({
        statement,
        signer: authoritySigner,
        createdAt: 100n,
      }),
    });

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(
        {
          requireStatus: true,
          acceptedStatusCapability:
            StatusCapabilityKind.authorityAttestedStatus,
          enforceRegistryId: true,
          acceptedRegistryId: bytes32("registry:hidden-holder"),
          enforceAttestationMaxAge: true,
          maxAttestationAge: 10n,
        },
        binding,
        protocol,
        111n,
      ),
    ).toThrow(/status proof exceeds the verifier max-age policy/i);
  });

  it("pins the compact future-dated message for an authority attestation created after the verifier time", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 2n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const binding = buildRegistryBoundStatusBinding({
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: binding.statusHandleCommitment,
      expiresAt: 300n,
    });
    const protocol = buildAuthorityAttestedStatusProofProtocol({
      request,
      attestation: signAuthorityAttestedStatusProof({
        statement,
        signer: authoritySigner,
        createdAt: 101n,
      }),
    });

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(
        {
          requireStatus: true,
          acceptedStatusCapability:
            StatusCapabilityKind.authorityAttestedStatus,
          enforceRegistryId: true,
          acceptedRegistryId: bytes32("registry:hidden-holder"),
          enforceAttestationMaxAge: false,
          maxAttestationAge: 0n,
        },
        binding,
        protocol,
        100n,
      ),
    ).toThrow(/proof creation time cannot be in the future/i);
  });
});
