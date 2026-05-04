import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusCapabilityKind,
  StatusSupportLevel,
} from "../managed/credentials/contract/index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("credentials core: verifier status policy", () => {
  it("accepts the explicit NoStatusCapability policy", () => {
    const policy = {
      requireStatus: false,
      minimumStatusSupportLevel: StatusSupportLevel.level0,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: false,
      acceptedRegistryId: new Uint8Array(32),
      hasMinimumAcceptedEpoch: false,
      minimumAcceptedEpoch: 0n,
    };

    expect(() =>
      pureCircuits.assertValidVerifierStatusPolicy(policy),
    ).not.toThrow();
  });

  it("accepts a required non-revocation policy", () => {
    const policy = {
      requireStatus: true,
      minimumStatusSupportLevel: StatusSupportLevel.level2,
      acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:hidden-holder"),
      hasMinimumAcceptedEpoch: true,
      minimumAcceptedEpoch: 42n,
    };

    expect(() =>
      pureCircuits.assertValidVerifierStatusPolicy(policy),
    ).not.toThrow();
  });

  it("rejects an optional policy that still constrains status", () => {
    const policy = {
      requireStatus: false,
      minimumStatusSupportLevel: StatusSupportLevel.level0,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:hidden-holder"),
      hasMinimumAcceptedEpoch: false,
      minimumAcceptedEpoch: 0n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /must not enforce a registry/i,
    );
  });

  it("rejects a required policy that still claims NoStatusCapability", () => {
    const policy = {
      requireStatus: true,
      minimumStatusSupportLevel: StatusSupportLevel.level2,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: false,
      acceptedRegistryId: new Uint8Array(32),
      hasMinimumAcceptedEpoch: false,
      minimumAcceptedEpoch: 0n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /must request a real status capability/i,
    );
  });
});
