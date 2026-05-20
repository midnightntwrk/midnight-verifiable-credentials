import { Buffer } from "node:buffer";

import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
} from "@midnight-ntwrk/compact-runtime";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  buildAuthorityAttestedStatusProofProtocol,
  buildAuthorityAttestedStatusRequest,
  buildAuthorityAttestedStatusStatement,
  buildObservedRevocationRegistryState,
  buildRegistryBoundStatusBinding,
  Contract,
  signAuthorityAttestedStatusProof,
  StatusCapabilityKind,
  statusVerificationErrorCodes,
  verifyAuthorityAttestedStatus,
  verifyLiveContractStateStatus,
  verifyObservedRevokedSetStatus,
} from "../index.js";
import { createSigner } from "./proof-fixtures.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const authoritySigner = createSigner("status-authority", 321n);

const createRegistryFixture = () => {
  const contract = new Contract({});
  const initialState = contract.initialState(
    createConstructorContext({}, { bytes: new Uint8Array(32) }),
  );
  const context = createCircuitContext(
    dummyContractAddress(),
    initialState.currentZswapLocalState,
    initialState.currentContractState.data,
    initialState.currentPrivateState,
  );

  return { contract, context };
};

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

const authorityAttestedPolicy = {
  requireStatus: true,
  acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
  enforceRegistryId: true,
  acceptedRegistryId: bytes32("registry:hidden-holder"),
  enforceAttestationMaxAge: false,
  maxAttestationAge: 0n,
};

const buildAuthorityFixture = () => {
  const request = buildAuthorityAttestedStatusRequest({
    registryState: {
      registryId: bytes32("registry:hidden-holder"),
      revokedRoot: bytes32("revoked-root:current"),
      registryVersion: 2n,
    },
    verifierChallengeHash: bytes32("challenge:status"),
  });
  const statusBinding = buildRegistryBoundStatusBinding({
    registryRef: {
      registryId: request.registryState.registryId,
      authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
    },
    statusHandleCommitment: bytes32("status-handle-commitment"),
  });
  const statement = buildAuthorityAttestedStatusStatement({
    request,
    statusHandleCommitment: statusBinding.statusHandleCommitment,
    expiresAt: 200n,
  });
  const attestation = signAuthorityAttestedStatusProof({
    statement,
    signer: authoritySigner,
    createdAt: 100n,
  });
  const protocol = buildAuthorityAttestedStatusProofProtocol({
    request,
    attestation,
  });

  return {
    request,
    protocol,
    statusBinding,
  };
};

const expectFailureCode = (
  result:
    | ReturnType<typeof verifyObservedRevokedSetStatus>
    | ReturnType<typeof verifyLiveContractStateStatus>
    | ReturnType<typeof verifyAuthorityAttestedStatus>,
  code: string,
): void => {
  expect(result.ok).toEqual(false);
  if (!result.ok) {
    expect(result.error.code).toEqual(code);
  }
};

describe("status verifier mode parity", () => {
  it("returns unknownRegistry across observed, live, and authority-attested modes", () => {
    const observed = verifyObservedRevokedSetStatus({
      observedState: buildObservedRevocationRegistryState({
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 2n,
        },
        observedAt: 100n,
      }),
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 120n,
      snapshotFreshnessPolicy: {
        enforceSnapshotMaxAge: true,
        maxSnapshotAge: 20n,
      },
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
      registryAcceptancePolicy: {
        acceptedRegistryIds: [bytes32("registry:other")],
      },
    });

    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const live = verifyLiveContractStateStatus({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
      registryAcceptancePolicy: {
        acceptedRegistryIds: [bytes32("registry:other")],
      },
    });

    const authorityFixture = buildAuthorityFixture();
    const authority = verifyAuthorityAttestedStatus({
      statusBinding: authorityFixture.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: authorityFixture.request,
      protocol: authorityFixture.protocol,
      currentTime: 110n,
      registryAcceptancePolicy: {
        acceptedRegistryIds: [bytes32("registry:other")],
      },
    });

    expectFailureCode(observed, statusVerificationErrorCodes.unknownRegistry);
    expectFailureCode(live, statusVerificationErrorCodes.unknownRegistry);
    expectFailureCode(authority, statusVerificationErrorCodes.unknownRegistry);
  });

  it("returns staleRegistryState across observed, live, and authority-attested version-floor failures", () => {
    const observed = verifyObservedRevokedSetStatus({
      observedState: buildObservedRevocationRegistryState({
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 2n,
        },
        observedAt: 100n,
      }),
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 120n,
      snapshotFreshnessPolicy: {
        enforceSnapshotMaxAge: true,
        maxSnapshotAge: 20n,
      },
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
      registryAcceptancePolicy: {
        minimumRegistryVersion: 3n,
      },
    });

    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const live = verifyLiveContractStateStatus({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
      registryAcceptancePolicy: {
        minimumRegistryVersion: 1n,
      },
    });

    const authorityFixture = buildAuthorityFixture();
    const authority = verifyAuthorityAttestedStatus({
      statusBinding: authorityFixture.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: authorityFixture.request,
      protocol: authorityFixture.protocol,
      currentTime: 110n,
      registryAcceptancePolicy: {
        minimumRegistryVersion: 3n,
      },
    });

    expectFailureCode(
      observed,
      statusVerificationErrorCodes.staleRegistryState,
    );
    expectFailureCode(live, statusVerificationErrorCodes.staleRegistryState);
    expectFailureCode(
      authority,
      statusVerificationErrorCodes.staleRegistryState,
    );
  });

  it("returns unsupportedStatusProofMode across observed, live, and authority-attested mode mismatches", () => {
    const observed = verifyObservedRevokedSetStatus({
      observedState: buildObservedRevocationRegistryState({
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 2n,
        },
        observedAt: 100n,
      }),
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 120n,
      snapshotFreshnessPolicy: {
        enforceSnapshotMaxAge: true,
        maxSnapshotAge: 20n,
      },
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: noStatusPolicy,
    });

    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const live = verifyLiveContractStateStatus({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: authorityAttestedPolicy,
    });

    const authorityFixture = buildAuthorityFixture();
    const authority = verifyAuthorityAttestedStatus({
      statusBinding: authorityFixture.statusBinding,
      verifierStatusPolicy: revokedSetPolicy,
      request: authorityFixture.request,
      protocol: authorityFixture.protocol,
      currentTime: 110n,
    });

    expectFailureCode(
      observed,
      statusVerificationErrorCodes.unsupportedStatusProofMode,
    );
    expectFailureCode(
      live,
      statusVerificationErrorCodes.unsupportedStatusProofMode,
    );
    expectFailureCode(
      authority,
      statusVerificationErrorCodes.unsupportedStatusProofMode,
    );
  });
});
