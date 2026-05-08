import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusCapabilityKind,
} from "../managed/credentials/contract/index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("credentials core: verifier status policy", () => {
  it("accepts the explicit NoStatusCapability policy", () => {
    const policy = {
      requireStatus: false,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: false,
      acceptedRegistryId: new Uint8Array(32),
      enforceAttestationMaxAge: false,
      maxAttestationAge: 0n,
    };

    expect(() =>
      pureCircuits.assertValidVerifierStatusPolicy(policy),
    ).not.toThrow();
  });

  it("accepts a required authority-attested policy with freshness enforcement", () => {
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:hidden-holder"),
      enforceAttestationMaxAge: true,
      maxAttestationAge: 50n,
    };

    expect(() =>
      pureCircuits.assertValidVerifierStatusPolicy(policy),
    ).not.toThrow();
  });

  it("rejects an optional policy that still constrains status", () => {
    const policy = {
      requireStatus: false,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:hidden-holder"),
      enforceAttestationMaxAge: false,
      maxAttestationAge: 0n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /must not enforce a registry/i,
    );
  });

  it("rejects a required policy that still claims NoStatusCapability", () => {
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: false,
      acceptedRegistryId: new Uint8Array(32),
      enforceAttestationMaxAge: false,
      maxAttestationAge: 0n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /must request a real status capability/i,
    );
  });

  it("rejects an optional policy that still enforces attestation max-age", () => {
    const policy = {
      requireStatus: false,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: false,
      acceptedRegistryId: new Uint8Array(32),
      enforceAttestationMaxAge: true,
      maxAttestationAge: 50n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /must not enforce attestation max-age/i,
    );
  });

  it("rejects attestation max-age on non-authority-attested status", () => {
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:hidden-holder"),
      enforceAttestationMaxAge: true,
      maxAttestationAge: 50n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /only applies to authority-attested status/i,
    );
  });

  it("rejects a zero freshness window when attestation max-age is enabled", () => {
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:hidden-holder"),
      enforceAttestationMaxAge: true,
      maxAttestationAge: 0n,
    };

    expect(() => pureCircuits.assertValidVerifierStatusPolicy(policy)).toThrow(
      /must request a real freshness window/i,
    );
  });
});
