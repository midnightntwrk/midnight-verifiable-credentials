import {
  type CredentialProtocolFeatures,
  pureCircuits as genericPureCircuits,
  type SchemaCapabilities,
  type SchemaDescriptor,
  type SchemaFamilyResolutionHint,
  type SchemaRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

import { padText } from "../shared/crypto.js";

const schemaRefText = (value: Uint8Array): string =>
  new TextDecoder().decode(value).replace(/\0+$/g, "");

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export type SchemaFamilyAdapterDescriptor = {
  readonly familyId: string;
  readonly descriptor: SchemaDescriptor;
  readonly compatibilityFeatureHints: CredentialProtocolFeatures;
};

export const createClosedEcosystemResolutionHint =
  (): SchemaFamilyResolutionHint => ({
    hasResolverHint: false,
    resolverHint: genericPureCircuits.noSchemaFamilyResolverHint(),
  });

export const createSchemaFamilyResolutionHint = (
  resolverHint: string | Uint8Array,
): SchemaFamilyResolutionHint => {
  const hint: SchemaFamilyResolutionHint = {
    hasResolverHint: true,
    resolverHint:
      typeof resolverHint === "string" ? padText(resolverHint) : resolverHint,
  };
  genericPureCircuits.assertValidSchemaFamilyResolutionHint(hint);
  return hint;
};

export const createClosedEcosystemSchemaDescriptor = (
  schema: SchemaRef,
  capabilities: SchemaCapabilities,
): SchemaDescriptor => {
  const descriptor: SchemaDescriptor = {
    schema,
    capabilities,
    familyResolutionHint: createClosedEcosystemResolutionHint(),
  };
  genericPureCircuits.assertValidSchemaDescriptor(descriptor);
  return descriptor;
};

export const createResolvableSchemaDescriptor = (
  schema: SchemaRef,
  capabilities: SchemaCapabilities,
  resolverHint: string | Uint8Array,
): SchemaDescriptor => {
  const descriptor: SchemaDescriptor = {
    schema,
    capabilities,
    familyResolutionHint: createSchemaFamilyResolutionHint(resolverHint),
  };
  genericPureCircuits.assertValidSchemaDescriptor(descriptor);
  return descriptor;
};

export const createSchemaFamilyAdapterDescriptor = (input: {
  readonly familyId: string;
  readonly schema: SchemaRef;
  readonly capabilities: SchemaCapabilities;
  readonly resolverHint: string | Uint8Array;
}): SchemaFamilyAdapterDescriptor => {
  const descriptor = createResolvableSchemaDescriptor(
    input.schema,
    input.capabilities,
    input.resolverHint,
  );

  return {
    familyId: input.familyId,
    descriptor,
    compatibilityFeatureHints: compatibilityFeatureHintsFromSchemaCapabilities(
      descriptor.capabilities,
    ),
  };
};

export const compatibilityFeatureHintsFromSchemaCapabilities = (
  capabilities: SchemaCapabilities,
): CredentialProtocolFeatures => ({
  supportsSelectiveDisclosure: capabilities.supportsSelectiveDisclosure,
  supportsPredicateProofs: capabilities.supportsPredicateProofs,
  supportsVerifierScopedPseudonym:
    capabilities.supportsVerifierScopedPseudonym,
  supportsSameHolderProof: capabilities.supportsSameHolderProof,
});

export const assertCompatibilityFeatureHintsMatchSchemaDescriptor = (
  features: CredentialProtocolFeatures,
  descriptor: SchemaDescriptor,
): void => {
  genericPureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(
    features,
    descriptor.capabilities,
  );
};

export const formatSchemaRef = (schema: SchemaRef): string =>
  `${schemaRefText(schema.packageId)}#${schemaRefText(schema.schemaId)}@${schema.majorVersion}.${schema.minorVersion}`;

export const schemaRefsEqual = (
  left: SchemaRef,
  right: SchemaRef,
): boolean =>
  left.majorVersion === right.majorVersion &&
  left.minorVersion === right.minorVersion &&
  bytesEqual(left.packageId, right.packageId) &&
  bytesEqual(left.schemaId, right.schemaId);

export const resolveSchemaFamilyAdapter = (
  schema: SchemaRef,
  adapters: ReadonlyArray<SchemaFamilyAdapterDescriptor>,
): SchemaFamilyAdapterDescriptor => {
  const matches = adapters.filter((adapter) =>
    schemaRefsEqual(adapter.descriptor.schema, schema),
  );

  if (matches.length === 0) {
    throw new Error(
      `No schema family adapter registered for ${formatSchemaRef(schema)}.`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple schema family adapters registered for ${formatSchemaRef(schema)}.`,
    );
  }

  return matches[0];
};

export const BIRTH_SCHEMA: SchemaRef = {
  packageId: padText("midnight-did:vc:birth"),
  schemaId: padText("birth-credential:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

export const BIRTH_SCHEMA_CAPABILITIES: SchemaCapabilities = {
  supportsSelectiveDisclosure: true,
  supportsPredicateProofs: true,
  supportsVerifierScopedPseudonym: false,
  supportsSameHolderProof: false,
};

export const BIRTH_SCHEMA_DESCRIPTOR = createClosedEcosystemSchemaDescriptor(
  BIRTH_SCHEMA,
  BIRTH_SCHEMA_CAPABILITIES,
);

export const BIRTH_COMPATIBILITY_FEATURE_HINTS =
  compatibilityFeatureHintsFromSchemaCapabilities(BIRTH_SCHEMA_DESCRIPTOR.capabilities);

export const BIRTH_SCHEMA_FAMILY_ADAPTER =
  createSchemaFamilyAdapterDescriptor({
    familyId: "birth",
    schema: BIRTH_SCHEMA,
    capabilities: BIRTH_SCHEMA_CAPABILITIES,
    resolverHint: "registry:birth-family",
  });

export const SECRET_BIRTH_SCHEMA: SchemaRef = {
  packageId: padText("midnight-did:vc:birth-secret"),
  schemaId: padText("birth-credential:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

export const SECRET_BIRTH_SCHEMA_CAPABILITIES: SchemaCapabilities = {
  supportsSelectiveDisclosure: true,
  supportsPredicateProofs: true,
  supportsVerifierScopedPseudonym: true,
  supportsSameHolderProof: true,
};

export const SECRET_BIRTH_SCHEMA_DESCRIPTOR =
  createClosedEcosystemSchemaDescriptor(
    SECRET_BIRTH_SCHEMA,
    SECRET_BIRTH_SCHEMA_CAPABILITIES,
  );

export const SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS =
  compatibilityFeatureHintsFromSchemaCapabilities(
    SECRET_BIRTH_SCHEMA_DESCRIPTOR.capabilities,
  );

export const SECRET_BIRTH_SCHEMA_FAMILY_ADAPTER =
  createSchemaFamilyAdapterDescriptor({
    familyId: "birth-secret",
    schema: SECRET_BIRTH_SCHEMA,
    capabilities: SECRET_BIRTH_SCHEMA_CAPABILITIES,
    resolverHint: "registry:birth-secret-family",
  });

export const REFERENCE_SCHEMA_FAMILY_ADAPTERS = [
  BIRTH_SCHEMA_FAMILY_ADAPTER,
  SECRET_BIRTH_SCHEMA_FAMILY_ADAPTER,
] as const satisfies ReadonlyArray<SchemaFamilyAdapterDescriptor>;
