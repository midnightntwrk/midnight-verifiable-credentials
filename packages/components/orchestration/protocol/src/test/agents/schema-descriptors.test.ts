import {
  pureCircuits as genericPureCircuits,
  type SchemaCapabilities,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import { describe, expect, it } from "vitest";

import {
  assertProtocolFeaturesMatchSchemaDescriptor,
  BIRTH_PROTOCOL_FEATURES,
  BIRTH_SCHEMA_CAPABILITIES,
  BIRTH_SCHEMA_DESCRIPTOR,
  CLOSED_ECOSYSTEM_RESOLUTION_HINT,
  createClosedEcosystemSchemaDescriptor,
  protocolFeaturesFromSchemaCapabilities,
  SECRET_BIRTH_PROTOCOL_FEATURES,
  SECRET_BIRTH_SCHEMA_CAPABILITIES,
  SECRET_BIRTH_SCHEMA_DESCRIPTOR,
} from "../../agents/schema-descriptors.js";
import { padText } from "../../shared/crypto.js";

const EXPECTED_PROTOCOL_FEATURE_KEYS = [
  "supportsPredicateProofs",
  "supportsSameHolderProof",
  "supportsSelectiveDisclosure",
  "supportsVerifierScopedPseudonym",
];

describe("protocol schema descriptors", () => {
  it("keeps reference family descriptors valid", () => {
    expect(() =>
      genericPureCircuits.assertValidSchemaDescriptor(BIRTH_SCHEMA_DESCRIPTOR),
    ).not.toThrow();
    expect(() =>
      genericPureCircuits.assertValidSchemaDescriptor(
        SECRET_BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).not.toThrow();
  });

  it("derives protocol compatibility features from schema capabilities", () => {
    expect(BIRTH_PROTOCOL_FEATURES).toEqual(
      protocolFeaturesFromSchemaCapabilities(BIRTH_SCHEMA_CAPABILITIES),
    );
    expect(SECRET_BIRTH_PROTOCOL_FEATURES).toEqual(
      protocolFeaturesFromSchemaCapabilities(SECRET_BIRTH_SCHEMA_CAPABILITIES),
    );
  });

  it("accepts protocol feature hints that match trusted schema descriptors", () => {
    expect(() =>
      assertProtocolFeaturesMatchSchemaDescriptor(
        BIRTH_PROTOCOL_FEATURES,
        BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).not.toThrow();
    expect(() =>
      assertProtocolFeaturesMatchSchemaDescriptor(
        SECRET_BIRTH_PROTOCOL_FEATURES,
        SECRET_BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).not.toThrow();
  });

  it("keeps protocol feature derivation explicit when generated fields change", () => {
    expect(Object.keys(BIRTH_PROTOCOL_FEATURES).sort()).toEqual(
      EXPECTED_PROTOCOL_FEATURE_KEYS,
    );
  });

  it("rejects protocol feature hints that drift from schema descriptors", () => {
    expect(() =>
      assertProtocolFeaturesMatchSchemaDescriptor(
        {
          ...BIRTH_PROTOCOL_FEATURES,
          supportsPredicateProofs: false,
        },
        BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).toThrow();
  });

  it("uses a no-hint resolver descriptor for closed ecosystem families", () => {
    expect(BIRTH_SCHEMA_DESCRIPTOR.familyResolutionHint).toEqual(
      CLOSED_ECOSYSTEM_RESOLUTION_HINT,
    );
    expect(
      BIRTH_SCHEMA_DESCRIPTOR.familyResolutionHint.resolverHint,
    ).toEqual(genericPureCircuits.noSchemaFamilyResolverHint());
    expect(
      BIRTH_SCHEMA_DESCRIPTOR.familyResolutionHint.hasResolverHint,
    ).toBe(false);
  });

  it("creates validated closed-ecosystem descriptors for local adapters", () => {
    const capabilities: SchemaCapabilities = {
      supportsSelectiveDisclosure: true,
      supportsPredicateProofs: false,
      supportsVerifierScopedPseudonym: false,
      supportsSameHolderProof: false,
    };
    const descriptor = createClosedEcosystemSchemaDescriptor(
      {
        packageId: padText("midnight-did:vc:test-family"),
        schemaId: padText("test-family:v1"),
        majorVersion: 1n,
        minorVersion: 0n,
      },
      capabilities,
    );

    expect(descriptor.capabilities).toEqual(capabilities);
    expect(descriptor.familyResolutionHint).toEqual(
      CLOSED_ECOSYSTEM_RESOLUTION_HINT,
    );
    expect(() =>
      genericPureCircuits.assertValidSchemaDescriptor(descriptor),
    ).not.toThrow();
  });
});
