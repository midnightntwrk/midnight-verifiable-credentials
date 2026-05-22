import {
  type CredentialProtocolFeatures,
  pureCircuits as genericPureCircuits,
  type SchemaCapabilities,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import { describe, expect, it } from "vitest";

import {
  assertCompatibilityFeatureHintsMatchSchemaDescriptor,
  BIRTH_COMPATIBILITY_FEATURE_HINTS,
  BIRTH_SCHEMA_CAPABILITIES,
  BIRTH_SCHEMA_DESCRIPTOR,
  createClosedEcosystemResolutionHint,
  createClosedEcosystemSchemaDescriptor,
  compatibilityFeatureHintsFromSchemaCapabilities,
  SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
  SECRET_BIRTH_SCHEMA_CAPABILITIES,
  SECRET_BIRTH_SCHEMA_DESCRIPTOR,
} from "../../agents/schema-descriptors.js";
import { padText } from "../../shared/crypto.js";

const EXPECTED_COMPATIBILITY_FEATURE_HINT_KEYS: ReadonlyArray<
  keyof CredentialProtocolFeatures
> = [
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

  it("derives compatibility feature hints from schema capabilities", () => {
    expect(BIRTH_COMPATIBILITY_FEATURE_HINTS).toEqual(
      compatibilityFeatureHintsFromSchemaCapabilities(BIRTH_SCHEMA_CAPABILITIES),
    );
    expect(SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS).toEqual(
      compatibilityFeatureHintsFromSchemaCapabilities(SECRET_BIRTH_SCHEMA_CAPABILITIES),
    );
  });

  it("accepts compatibility feature hints that match trusted schema descriptors", () => {
    expect(() =>
      assertCompatibilityFeatureHintsMatchSchemaDescriptor(
        BIRTH_COMPATIBILITY_FEATURE_HINTS,
        BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).not.toThrow();
    expect(() =>
      assertCompatibilityFeatureHintsMatchSchemaDescriptor(
        SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
        SECRET_BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).not.toThrow();
  });

  it("keeps compatibility hint derivation explicit when generated fields change", () => {
    expect(Object.keys(BIRTH_COMPATIBILITY_FEATURE_HINTS).sort()).toEqual(
      EXPECTED_COMPATIBILITY_FEATURE_HINT_KEYS,
    );
  });

  it("rejects compatibility feature hints that drift from schema descriptors", () => {
    for (const featureKey of EXPECTED_COMPATIBILITY_FEATURE_HINT_KEYS) {
      expect(() =>
        assertCompatibilityFeatureHintsMatchSchemaDescriptor(
          {
            ...BIRTH_COMPATIBILITY_FEATURE_HINTS,
            [featureKey]: !BIRTH_COMPATIBILITY_FEATURE_HINTS[featureKey],
          },
          BIRTH_SCHEMA_DESCRIPTOR,
        ),
      ).toThrow();
    }
  });

  it("rejects both disabled and enabled feature drift", () => {
    expect(() =>
      assertCompatibilityFeatureHintsMatchSchemaDescriptor(
        {
          ...BIRTH_COMPATIBILITY_FEATURE_HINTS,
          supportsVerifierScopedPseudonym: true,
        },
        BIRTH_SCHEMA_DESCRIPTOR,
      ),
    ).toThrow();
  });

  it("uses a no-hint resolver descriptor for closed ecosystem families", () => {
    expect(BIRTH_SCHEMA_DESCRIPTOR.familyResolutionHint).toEqual(
      createClosedEcosystemResolutionHint(),
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
      createClosedEcosystemResolutionHint(),
    );
    expect(() =>
      genericPureCircuits.assertValidSchemaDescriptor(descriptor),
    ).not.toThrow();
  });
});
