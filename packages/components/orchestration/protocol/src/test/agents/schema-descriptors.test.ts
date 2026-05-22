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
  BIRTH_SCHEMA_FAMILY_ADAPTER,
  compatibilityFeatureHintsFromSchemaCapabilities,
  createClosedEcosystemResolutionHint,
  createClosedEcosystemSchemaDescriptor,
  createResolvableSchemaDescriptor,
  createSchemaFamilyResolutionHint,
  formatSchemaRef,
  REFERENCE_SCHEMA_FAMILY_ADAPTERS,
  resolveSchemaFamilyAdapter,
  SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS,
  SECRET_BIRTH_SCHEMA_CAPABILITIES,
  SECRET_BIRTH_SCHEMA_DESCRIPTOR,
  SECRET_BIRTH_SCHEMA_FAMILY_ADAPTER,
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

  it("creates bounded resolver hints for open or semi-open adapters", () => {
    const hint = createSchemaFamilyResolutionHint("registry:test-family");

    expect(hint.hasResolverHint).toBe(true);
    expect(hint.resolverHint).toEqual(padText("registry:test-family"));
    expect(() =>
      genericPureCircuits.assertValidSchemaFamilyResolutionHint(hint),
    ).not.toThrow();
  });

  it("rejects no-hint sentinels when callers claim a resolver hint exists", () => {
    expect(() =>
      createSchemaFamilyResolutionHint(
        genericPureCircuits.noSchemaFamilyResolverHint(),
      ),
    ).toThrow(/Schema resolver hint must be set/);
  });

  it("rejects resolver hints that do not fit the Compact byte bound", () => {
    expect(() =>
      createSchemaFamilyResolutionHint(
        "registry:family-name-that-is-longer-than-thirty-two-bytes",
      ),
    ).toThrow(/expected at most 32 bytes/);
    expect(() => createSchemaFamilyResolutionHint(new Uint8Array(31))).toThrow(
      /expected exactly 32 bytes/,
    );
    expect(() => createSchemaFamilyResolutionHint(new Uint8Array(33))).toThrow(
      /expected exactly 32 bytes/,
    );
  });

  it("copies caller-supplied resolver hint bytes", () => {
    const resolverHintBytes = padText("registry:test-family");
    const hint = createSchemaFamilyResolutionHint(resolverHintBytes);

    resolverHintBytes[0] = 0;

    expect(hint.resolverHint).toEqual(padText("registry:test-family"));
  });

  it("creates resolvable descriptors without changing closed ecosystem defaults", () => {
    const descriptor = createResolvableSchemaDescriptor(
      BIRTH_SCHEMA_DESCRIPTOR.schema,
      BIRTH_SCHEMA_CAPABILITIES,
      "registry:birth-family",
    );

    expect(descriptor.familyResolutionHint.hasResolverHint).toBe(true);
    expect(BIRTH_SCHEMA_DESCRIPTOR.familyResolutionHint).toEqual(
      createClosedEcosystemResolutionHint(),
    );
    expect(() =>
      genericPureCircuits.assertValidSchemaDescriptor(descriptor),
    ).not.toThrow();
  });

  it("resolves reference schema family adapters by schema ref", () => {
    expect(
      resolveSchemaFamilyAdapter(
        BIRTH_SCHEMA_DESCRIPTOR.schema,
        REFERENCE_SCHEMA_FAMILY_ADAPTERS,
      ),
    ).toBe(BIRTH_SCHEMA_FAMILY_ADAPTER);
    expect(
      resolveSchemaFamilyAdapter(
        SECRET_BIRTH_SCHEMA_DESCRIPTOR.schema,
        REFERENCE_SCHEMA_FAMILY_ADAPTERS,
      ),
    ).toBe(SECRET_BIRTH_SCHEMA_FAMILY_ADAPTER);
    expect(BIRTH_SCHEMA_FAMILY_ADAPTER.compatibilityFeatureHints).toEqual(
      BIRTH_COMPATIBILITY_FEATURE_HINTS,
    );
    expect(BIRTH_SCHEMA_FAMILY_ADAPTER.descriptor).not.toEqual(
      BIRTH_SCHEMA_DESCRIPTOR,
    );
    expect(
      BIRTH_SCHEMA_FAMILY_ADAPTER.descriptor.familyResolutionHint,
    ).toMatchObject({
      hasResolverHint: true,
      resolverHint: padText("registry:birth-family"),
    });
  });

  it("reports unknown and duplicate schema-family adapter registrations", () => {
    const unknownSchema = {
      ...BIRTH_SCHEMA_DESCRIPTOR.schema,
      schemaId: padText("unknown:v1"),
    };

    expect(formatSchemaRef(BIRTH_SCHEMA_DESCRIPTOR.schema)).toBe(
      "midnight-did:vc:birth#birth-credential:v1@1.0",
    );
    expect(() =>
      resolveSchemaFamilyAdapter(unknownSchema, REFERENCE_SCHEMA_FAMILY_ADAPTERS),
    ).toThrow(/No schema family adapter registered/);
    expect(() =>
      resolveSchemaFamilyAdapter(BIRTH_SCHEMA_DESCRIPTOR.schema, [
        BIRTH_SCHEMA_FAMILY_ADAPTER,
        BIRTH_SCHEMA_FAMILY_ADAPTER,
      ]),
    ).toThrow(/Multiple schema family adapters registered/);
  });
});
