import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertObservedRevocationRegistryStateFreshEnough,
  assertObservedRevocationRegistryVersionAtLeast,
  buildFreshRevokedSetNonMembershipInputs,
  buildObservedRevocationRegistryState,
  buildRevokedSetStatusRequestFromObservedState,
  StatusCapabilityKind,
} from "../index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const authorityVerificationMethodRef = {
  didContractAddress: { bytes: bytes32("did-contract:status-authority") },
  methodId: bytes32("#status-authority-key-1"),
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
});
