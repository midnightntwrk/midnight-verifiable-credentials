import { Buffer } from "node:buffer";

import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
} from "@midnight-ntwrk/compact-runtime";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertCanonicalNonMembershipBundle,
  buildCanonicalLiveNonMembershipBundleFromContractState,
  buildCanonicalObservedNonMembershipBundle,
  buildObservedRevocationRegistryState,
  Contract,
  StatusCapabilityKind,
  StatusHelperError,
  statusVerificationErrorCodes,
} from "../index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const authorityVerificationMethodRef = {
  didContractAddress: { bytes: bytes32("did-contract:status-authority") },
  methodId: bytes32("#status-authority-key-1"),
};

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

const verifierStatusPolicy = {
  requireStatus: true,
  acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
  enforceRegistryId: true,
  acceptedRegistryId: bytes32("registry:hidden-holder"),
  enforceAttestationMaxAge: false,
  maxAttestationAge: 0n,
};

describe("canonical non-membership bundles", () => {
  it("builds and validates the canonical observed-state bundle", () => {
    const bundle = buildCanonicalObservedNonMembershipBundle({
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
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy,
      revokedStatusHandles: [bytes32("revoked-handle:someone-else")],
    });

    expect(bundle.mode).toEqual("revokedSetObservedState");
    expect(bundle.protocol.request.registryState.registryVersion).toEqual(2n);
    expect(bundle.protocol.witnessInput.statusHandle).toEqual(
      bundle.statusHandle,
    );

    expect(() => assertCanonicalNonMembershipBundle(bundle)).not.toThrow();
  });

  it("fails closed when the canonical observed-state bundle request drifts from the protocol request", () => {
    const bundle = buildCanonicalObservedNonMembershipBundle({
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
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy,
    });

    const drifted = {
      ...bundle,
      request: {
        ...bundle.request,
        verifierChallengeHash: bytes32("challenge:drifted"),
      },
    };

    expect(() => assertCanonicalNonMembershipBundle(drifted)).toThrow(
      /request challenge does not match the protocol request challenge/i,
    );
    try {
      assertCanonicalNonMembershipBundle(drifted);
    } catch (error) {
      expect(error).toBeInstanceOf(StatusHelperError);
      expect((error as StatusHelperError).code).toEqual(
        statusVerificationErrorCodes.statusRequestMismatch,
      );
    }
  });

  it("builds and validates the canonical live-state bundle from contract state", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const bundle = buildCanonicalLiveNonMembershipBundleFromContractState({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy,
    });

    expect(bundle.mode).toEqual("liveContractState");
    expect(bundle.registryState.registryId).toEqual(
      bytes32("registry:hidden-holder"),
    );
    expect(bundle.witness.witnessInput.statusHandle).toEqual(
      bundle.witness.statusHandle,
    );

    expect(() => assertCanonicalNonMembershipBundle(bundle)).not.toThrow();
  });

  it("fails closed when the live bundle registry state drifts away from the witness binding", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const bundle = buildCanonicalLiveNonMembershipBundleFromContractState({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot: bytes32("credential-root:alice"),
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef,
      },
      issuerStatusSalt: bytes32("issuer-salt:alpha"),
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy,
    });

    const drifted = {
      ...bundle,
      registryState: {
        ...bundle.registryState,
        registryId: bytes32("registry:other"),
      },
    };

    expect(() => assertCanonicalNonMembershipBundle(drifted)).toThrow(
      /live revocation registry state does not match the status binding registry/i,
    );
    try {
      assertCanonicalNonMembershipBundle(drifted);
    } catch (error) {
      expect(error).toBeInstanceOf(StatusHelperError);
      expect((error as StatusHelperError).code).toEqual(
        statusVerificationErrorCodes.statusBindingMismatch,
      );
    }
  });
});
