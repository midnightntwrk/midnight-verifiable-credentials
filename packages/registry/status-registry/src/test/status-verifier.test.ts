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
  deriveRevokedSetStatusHandle,
  signAuthorityAttestedStatusProof,
  StatusCapabilityKind,
  StatusHelperError,
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
const alternateAuthoritySigner = createSigner("other-authority", 654n);

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

const buildAuthorityFixture = ({
  signer = authoritySigner,
  expiresAt = 200n,
  createdAt = 100n,
}: {
  readonly signer?: typeof authoritySigner;
  readonly expiresAt?: bigint;
  readonly createdAt?: bigint;
} = {}) => {
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
    expiresAt,
  });
  const attestation = signAuthorityAttestedStatusProof({
    statement,
    signer,
    createdAt,
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

describe("status verifier", () => {
  it("returns a success result for a fresh observed revoked-set snapshot", () => {
    const result = verifyObservedRevokedSetStatus({
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
        acceptedRegistryIds: [bytes32("registry:hidden-holder")],
        minimumRegistryVersion: 2n,
      },
      revokedStatusHandles: [bytes32("revoked-handle:someone-else")],
    });

    expect(result.ok).toEqual(true);
    if (result.ok) {
      expect(
        result.details.protocol.request.registryState.registryVersion,
      ).toEqual(2n);
    }
  });

  it("returns a revoked error for an observed snapshot that already contains the derived handle", () => {
    const credentialClaimRoot = bytes32("credential-root:alice");
    const issuerStatusSalt = bytes32("issuer-salt:alpha");
    const revokedHandle = deriveRevokedSetStatusHandle({
      credentialClaimRoot,
      registryId: bytes32("registry:hidden-holder"),
      issuerStatusSalt,
    });

    const result = verifyObservedRevokedSetStatus({
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
      credentialClaimRoot,
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt,
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
      revokedStatusHandles: [revokedHandle],
    });

    expect(result).toMatchObject({
      ok: false,
      mode: "revokedSetObservedState",
    });
    if (!result.ok) {
      expect(result.error.code).toEqual(statusVerificationErrorCodes.revoked);
    }
  });

  it("returns a stale-registry-state error for an observed snapshot beyond the verifier freshness window", () => {
    const result = verifyObservedRevokedSetStatus({
      observedState: buildObservedRevocationRegistryState({
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 2n,
        },
        observedAt: 100n,
      }),
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 121n,
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
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.staleRegistryState,
      );
    }
  });

  it("returns an unknown-registry error for an observed snapshot outside the verifier acceptance set", () => {
    const result = verifyObservedRevokedSetStatus({
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

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.unknownRegistry,
      );
      expect(result.error.cause).toBeInstanceOf(StatusHelperError);
    }
  });

  it("returns an unknown-registry error when the verifier acceptance policy lists no accepted registries", () => {
    const result = verifyObservedRevokedSetStatus({
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
        acceptedRegistryIds: [],
      },
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.unknownRegistry,
      );
      expect(result.error.cause).toBeInstanceOf(StatusHelperError);
    }
  });

  it("returns an unsupported-status-proof-mode error for an observed snapshot when policy disables revoked-set proofs", () => {
    const result = verifyObservedRevokedSetStatus({
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

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.unsupportedStatusProofMode,
      );
    }
  });

  it("returns a success result for live same-contract status verification", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const result = verifyLiveContractStateStatus({
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
        acceptedRegistryIds: [bytes32("registry:hidden-holder")],
        minimumRegistryVersion: 0n,
      },
    });

    expect(result.ok).toEqual(true);
    if (result.ok) {
      expect(result.details.registryState.registryVersion).toEqual(0n);
    }
  });

  it("returns a revoked error for live same-contract status when the derived handle is already revoked", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const revokedHandle = deriveRevokedSetStatusHandle({
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryId: bytes32("registry:hidden-holder"),
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
    });
    const revoked = contract.impureCircuits.revokeStatusHandle(
      initialized.context,
      revokedHandle,
    );

    const result = verifyLiveContractStateStatus({
      state: revoked.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(statusVerificationErrorCodes.revoked);
    }
  });

  it("returns a status-binding-mismatch error when the live contract registry does not match the VC binding registry", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const result = verifyLiveContractStateStatus({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:other"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: revokedSetPolicy,
      registryAcceptancePolicy: {
        acceptedRegistryIds: [bytes32("registry:hidden-holder")],
      },
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.statusBindingMismatch,
      );
    }
  });

  it("returns a success result for an authority-attested status proof", () => {
    const fixture = buildAuthorityFixture();

    const result = verifyAuthorityAttestedStatus({
      statusBinding: fixture.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: fixture.request,
      protocol: fixture.protocol,
      currentTime: 110n,
      registryAcceptancePolicy: {
        acceptedRegistryIds: [bytes32("registry:hidden-holder")],
        minimumRegistryVersion: 2n,
      },
    });

    expect(result.ok).toEqual(true);
  });

  it("returns a status-binding-mismatch error when verifier policy rejects the observed registry binding domain", () => {
    const result = verifyObservedRevokedSetStatus({
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
      verifierStatusPolicy: {
        ...revokedSetPolicy,
        acceptedRegistryId: bytes32("registry:other"),
      },
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.statusBindingMismatch,
      );
    }
  });

  it("returns an unsupported-status-proof-mode error when live contract verification disables the live revoked-set mode", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const result = verifyLiveContractStateStatus({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: noStatusPolicy,
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.unsupportedStatusProofMode,
      );
    }
  });

  it("returns a stale-registry-state error when live contract state is below the verifier version floor", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const result = verifyLiveContractStateStatus({
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

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.staleRegistryState,
      );
    }
  });

  it("returns a status-request-mismatch error when the external verifier request diverges from the authority-attested protocol request", () => {
    const fixture = buildAuthorityFixture();

    const result = verifyAuthorityAttestedStatus({
      statusBinding: fixture.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: {
        ...fixture.request,
        registryState: {
          ...fixture.request.registryState,
          revokedRoot: bytes32("revoked-root:other"),
        },
      },
      protocol: fixture.protocol,
      currentTime: 110n,
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.statusRequestMismatch,
      );
    }
  });

  it("returns an unclassified-failure error when verifier-side acceptance policy throws outside the canonical taxonomy", () => {
    const result = verifyObservedRevokedSetStatus({
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
        acceptedRegistryIds: [undefined as unknown as Uint8Array],
      },
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.unclassifiedFailure,
      );
      expect(result.error.cause).toBeInstanceOf(TypeError);
    }
  });

  it("returns an authority-mismatch error for an attestation signed by another authority", () => {
    const fixture = buildAuthorityFixture({ signer: alternateAuthoritySigner });

    const result = verifyAuthorityAttestedStatus({
      statusBinding: fixture.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: fixture.request,
      protocol: fixture.protocol,
      currentTime: 110n,
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.authorityMismatch,
      );
    }
  });

  it("returns an unsupported-status-proof-mode error when the verifier policy disables authority-attested proofs", () => {
    const fixture = buildAuthorityFixture();

    const result = verifyAuthorityAttestedStatus({
      statusBinding: fixture.statusBinding,
      verifierStatusPolicy: revokedSetPolicy,
      request: fixture.request,
      protocol: fixture.protocol,
      currentTime: 110n,
    });

    expect(result.ok).toEqual(false);
    if (!result.ok) {
      expect(result.error.code).toEqual(
        statusVerificationErrorCodes.unsupportedStatusProofMode,
      );
    }
  });

  it("returns attestation freshness errors for expired, stale, and future-dated authority attestations", () => {
    const expired = buildAuthorityFixture({ expiresAt: 105n, createdAt: 100n });
    const tooOld = buildAuthorityFixture({ expiresAt: 200n, createdAt: 100n });
    const futureDated = buildAuthorityFixture({
      expiresAt: 200n,
      createdAt: 120n,
    });

    const expiredResult = verifyAuthorityAttestedStatus({
      statusBinding: expired.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: expired.request,
      protocol: expired.protocol,
      currentTime: 106n,
    });
    const staleResult = verifyAuthorityAttestedStatus({
      statusBinding: tooOld.statusBinding,
      verifierStatusPolicy: {
        ...authorityAttestedPolicy,
        enforceAttestationMaxAge: true,
        maxAttestationAge: 5n,
      },
      request: tooOld.request,
      protocol: tooOld.protocol,
      currentTime: 106n,
    });
    const futureResult = verifyAuthorityAttestedStatus({
      statusBinding: futureDated.statusBinding,
      verifierStatusPolicy: authorityAttestedPolicy,
      request: futureDated.request,
      protocol: futureDated.protocol,
      currentTime: 119n,
    });

    expect(expiredResult.ok).toEqual(false);
    expect(staleResult.ok).toEqual(false);
    expect(futureResult.ok).toEqual(false);

    if (!expiredResult.ok) {
      expect(expiredResult.error.code).toEqual(
        statusVerificationErrorCodes.attestationExpired,
      );
    }
    if (!staleResult.ok) {
      expect(staleResult.error.code).toEqual(
        statusVerificationErrorCodes.attestationTooOld,
      );
    }
    if (!futureResult.ok) {
      expect(futureResult.error.code).toEqual(
        statusVerificationErrorCodes.futureDatedAttestation,
      );
    }
  });
});
