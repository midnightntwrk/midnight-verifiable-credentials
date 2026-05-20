import { Buffer } from "node:buffer";

import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
} from "@midnight-ntwrk/compact-runtime";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertObservedRevocationRegistryStateFreshEnough,
  assertObservedRevocationRegistryVersionAtLeast,
  assertRevocationRegistryVersionAtLeast,
  assertStatusHandleNotRevokedInContractState,
  buildFreshRevokedSetNonMembershipInputs,
  buildFreshRevokedSetNonMembershipInputsFromContractState,
  buildLiveStatusWitnessFromContractState,
  buildObservedRevocationRegistryState,
  buildObservedRevocationRegistryStateFromContractState,
  buildRevokedSetStatusRequestFromObservedState,
  Contract,
  pureCircuits,
  readCurrentRevocationRegistryStateFromContractState,
  StatusCapabilityKind,
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

describe("revocation registry observed-root helpers", () => {
  it("accepts a snapshot observed at the current verifier time", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 150n,
    });

    expect(() =>
      assertObservedRevocationRegistryStateFreshEnough({
        observedState,
        currentTime: 150n,
        policy: {
          enforceSnapshotMaxAge: true,
          maxSnapshotAge: 0n,
        },
      }),
    ).not.toThrow();
  });

  it("accepts a snapshot at the verifier max-age boundary", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 100n,
    });

    const request = buildRevokedSetStatusRequestFromObservedState({
      observedState,
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 150n,
      snapshotFreshnessPolicy: {
        enforceSnapshotMaxAge: true,
        maxSnapshotAge: 50n,
      },
    });

    expect(request.registryState.revokedRoot).toEqual(
      bytes32("revoked-root:current"),
    );
  });

  it("rejects a stale observed snapshot", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 100n,
    });

    expect(() =>
      buildRevokedSetStatusRequestFromObservedState({
        observedState,
        verifierChallengeHash: bytes32("challenge:status"),
        currentTime: 151n,
        snapshotFreshnessPolicy: {
          enforceSnapshotMaxAge: true,
          maxSnapshotAge: 50n,
        },
      }),
    ).toThrow(/snapshot exceeds the verifier max-age policy/i);
  });

  it("skips snapshot max-age enforcement when the verifier disables it", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 100n,
    });

    expect(() =>
      assertObservedRevocationRegistryStateFreshEnough({
        observedState,
        currentTime: 1_000n,
        policy: {
          enforceSnapshotMaxAge: false,
          maxSnapshotAge: 0n,
        },
      }),
    ).not.toThrow();
  });

  it("rejects a future-dated observed snapshot", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 200n,
    });

    expect(() =>
      buildRevokedSetStatusRequestFromObservedState({
        observedState,
        verifierChallengeHash: bytes32("challenge:status"),
        currentTime: 199n,
        snapshotFreshnessPolicy: {
          enforceSnapshotMaxAge: true,
          maxSnapshotAge: 50n,
        },
      }),
    ).toThrow(/snapshot time cannot be in the future/i);
  });

  it("rejects an observed snapshot version older than the required minimum", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 2n,
      },
      observedAt: 100n,
    });

    expect(() =>
      assertObservedRevocationRegistryVersionAtLeast({
        observedState,
        minimumRegistryVersion: 3n,
      }),
    ).toThrow(/snapshot version is older than the required minimum/i);
  });

  it("accepts an observed snapshot version at or above the required minimum", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 3n,
      },
      observedAt: 100n,
    });

    expect(() =>
      assertObservedRevocationRegistryVersionAtLeast({
        observedState,
        minimumRegistryVersion: 3n,
      }),
    ).not.toThrow();

    expect(() =>
      assertObservedRevocationRegistryVersionAtLeast({
        observedState,
        minimumRegistryVersion: 2n,
      }),
    ).not.toThrow();
  });

  it("accepts a live registry-state version at or above the required minimum", () => {
    const registryState = {
      registryId: bytes32("registry:hidden-holder"),
      revokedRoot: bytes32("revoked-root:current"),
      registryVersion: 3n,
    };

    expect(() =>
      assertRevocationRegistryVersionAtLeast({
        registryState,
        minimumRegistryVersion: 3n,
      }),
    ).not.toThrow();

    expect(() =>
      assertRevocationRegistryVersionAtLeast({
        registryState,
        minimumRegistryVersion: 2n,
      }),
    ).not.toThrow();
  });

  it("rejects a live registry-state version older than the required minimum", () => {
    const registryState = {
      registryId: bytes32("registry:hidden-holder"),
      revokedRoot: bytes32("revoked-root:current"),
      registryVersion: 2n,
    };

    expect(() =>
      assertRevocationRegistryVersionAtLeast({
        registryState,
        minimumRegistryVersion: 3n,
      }),
    ).toThrow(/state version is older than the required minimum/i);
  });

  it("rejects negative timing inputs and malformed observed states", () => {
    expect(() =>
      buildObservedRevocationRegistryState({
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        observedAt: -1n,
      }),
    ).toThrow(/must be >= 0/i);

    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 100n,
    });

    expect(() =>
      assertObservedRevocationRegistryStateFreshEnough({
        observedState,
        currentTime: -1n,
        policy: {
          enforceSnapshotMaxAge: true,
          maxSnapshotAge: 0n,
        },
      }),
    ).toThrow(/must be >= 0/i);

    expect(() =>
      assertObservedRevocationRegistryStateFreshEnough({
        observedState,
        currentTime: 100n,
        policy: {
          enforceSnapshotMaxAge: true,
          maxSnapshotAge: -1n,
        },
      }),
    ).toThrow(/must be >= 0/i);

    expect(() =>
      assertObservedRevocationRegistryVersionAtLeast({
        observedState,
        minimumRegistryVersion: -1n,
      }),
    ).toThrow(/must be >= 0/i);

    expect(() =>
      assertRevocationRegistryVersionAtLeast({
        registryState: observedState.registryState,
        minimumRegistryVersion: -1n,
      }),
    ).toThrow(/must be >= 0/i);

    expect(() =>
      buildObservedRevocationRegistryState({
        registryState: {
          registryId: new Uint8Array(),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        observedAt: 100n,
      }),
    ).toThrow();
  });

  it("builds a fresh canonical non-membership bundle from an observed snapshot", () => {
    const observedState = buildObservedRevocationRegistryState({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      observedAt: 100n,
    });

    const built = buildFreshRevokedSetNonMembershipInputs({
      observedState,
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 150n,
      snapshotFreshnessPolicy: {
        enforceSnapshotMaxAge: true,
        maxSnapshotAge: 50n,
      },
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

    expect(built.request.registryState.revokedRoot).toEqual(
      bytes32("revoked-root:current"),
    );
    expect(built.protocol.request.registryState.registryId).toEqual(
      bytes32("registry:hidden-holder"),
    );
    expect(built.observedState.observedAt).toEqual(100n);
  });

  it("reads the current typed registry state directly from live contract state", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const state = readCurrentRevocationRegistryStateFromContractState({
      state: initialized.context.currentQueryContext.state,
    });

    expect(state.registryId).toEqual(bytes32("registry:hidden-holder"));
    expect(state.registryVersion).toEqual(0n);
    expect(state.revokedRoot).toBeInstanceOf(Uint8Array);
    expect(state.revokedRoot.length).toEqual(32);
  });

  it("tracks live root and version changes when observing contract state", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const before = buildObservedRevocationRegistryStateFromContractState({
      state: initialized.context.currentQueryContext.state,
      observedAt: 100n,
    });

    const revoked = contract.impureCircuits.revokeStatusHandle(
      initialized.context,
      bytes32("status-handle:alice"),
    );
    const after = buildObservedRevocationRegistryStateFromContractState({
      state: revoked.context.currentQueryContext.state,
      observedAt: 101n,
    });

    expect(after.registryState.registryVersion).toEqual(1n);
    expect(after.registryState.revokedRoot).not.toEqual(
      before.registryState.revokedRoot,
    );
  });

  it("rejects a status handle already present in the live revocation registry state", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const revoked = contract.impureCircuits.revokeStatusHandle(
      initialized.context,
      bytes32("status-handle:alice"),
    );

    expect(() =>
      assertStatusHandleNotRevokedInContractState({
        state: revoked.context.currentQueryContext.state,
        statusHandle: bytes32("status-handle:alice"),
      }),
    ).toThrow(/already present in the live revocation registry state/i);

    expect(() =>
      assertStatusHandleNotRevokedInContractState({
        state: revoked.context.currentQueryContext.state,
        statusHandle: bytes32("status-handle:bob"),
      }),
    ).not.toThrow();
  });

  it("builds a fresh canonical non-membership bundle directly from live contract state", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    const built = buildFreshRevokedSetNonMembershipInputsFromContractState({
      state: initialized.context.currentQueryContext.state,
      observedAt: 100n,
      verifierChallengeHash: bytes32("challenge:status"),
      currentTime: 150n,
      snapshotFreshnessPolicy: {
        enforceSnapshotMaxAge: true,
        maxSnapshotAge: 50n,
      },
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
    });

    expect(built.request.registryState.registryId).toEqual(
      bytes32("registry:hidden-holder"),
    );
    expect(built.request.registryState.registryVersion).toEqual(0n);
    expect(built.protocol.witnessInput.statusHandle).toEqual(
      built.statusHandle,
    );
  });

  it("rejects a fresh canonical non-membership bundle when the derived handle is already revoked in live contract state", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const credentialClaimRoot = bytes32("credential-root:alice");
    const issuerStatusSalt = bytes32("issuer-salt:alpha");
    const revokedHandle = Buffer.from(
      pureCircuits.revokedSetStatusHandle(
        credentialClaimRoot,
        bytes32("registry:hidden-holder"),
        issuerStatusSalt,
      ),
    );
    const revoked = contract.impureCircuits.revokeStatusHandle(
      initialized.context,
      new Uint8Array(revokedHandle),
    );

    expect(() =>
      buildFreshRevokedSetNonMembershipInputsFromContractState({
        state: revoked.context.currentQueryContext.state,
        observedAt: 100n,
        verifierChallengeHash: bytes32("challenge:status"),
        currentTime: 150n,
        snapshotFreshnessPolicy: {
          enforceSnapshotMaxAge: true,
          maxSnapshotAge: 50n,
        },
        credentialClaimRoot,
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef,
        },
        issuerStatusSalt,
        statusHandleOpening: bytes32("status-opening:alpha"),
      }),
    ).toThrow(/already present in the live revocation registry state/i);
  });

  it("builds a live-status witness directly from live contract state and rejects revoked handles", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const credentialClaimRoot = bytes32("credential-root:alice");
    const issuerStatusSalt = bytes32("issuer-salt:alpha");

    const built = buildLiveStatusWitnessFromContractState({
      state: initialized.context.currentQueryContext.state,
      credentialClaimRoot,
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef,
      },
      issuerStatusSalt,
      statusHandleOpening: bytes32("status-opening:alpha"),
      verifierStatusPolicy: {
        requireStatus: true,
        acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
        enforceRegistryId: true,
        acceptedRegistryId: bytes32("registry:hidden-holder"),
        enforceAttestationMaxAge: false,
        maxAttestationAge: 0n,
      },
    });

    expect(built.witnessInput.statusHandle).toEqual(built.statusHandle);

    const revoked = contract.impureCircuits.revokeStatusHandle(
      initialized.context,
      built.statusHandle,
    );

    expect(() =>
      buildLiveStatusWitnessFromContractState({
        state: revoked.context.currentQueryContext.state,
        credentialClaimRoot,
        registryRef: {
          registryId: bytes32("registry:hidden-holder"),
          authorityVerificationMethodRef,
        },
        issuerStatusSalt,
        statusHandleOpening: bytes32("status-opening:alpha"),
      }),
    ).toThrow(/already present in the live revocation registry state/i);
  });
});
