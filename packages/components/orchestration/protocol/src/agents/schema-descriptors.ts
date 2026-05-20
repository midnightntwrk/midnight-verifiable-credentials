import {
  type CredentialProtocolFeatures,
  pureCircuits as genericPureCircuits,
  type SchemaCapabilities,
  type SchemaDescriptor,
  type SchemaFamilyResolutionHint,
  type SchemaRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

import { padText } from "../shared/crypto.js";

export const createClosedEcosystemResolutionHint =
  (): SchemaFamilyResolutionHint => ({
    hasResolverHint: false,
    resolverHint: genericPureCircuits.noSchemaFamilyResolverHint(),
  });

export const CLOSED_ECOSYSTEM_RESOLUTION_HINT =
  createClosedEcosystemResolutionHint();

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

export const protocolFeaturesFromSchemaCapabilities = (
  capabilities: SchemaCapabilities,
): CredentialProtocolFeatures => ({
  supportsSelectiveDisclosure: capabilities.supportsSelectiveDisclosure,
  supportsPredicateProofs: capabilities.supportsPredicateProofs,
  supportsVerifierScopedPseudonym:
    capabilities.supportsVerifierScopedPseudonym,
  supportsSameHolderProof: capabilities.supportsSameHolderProof,
});

export const assertProtocolFeaturesMatchSchemaDescriptor = (
  features: CredentialProtocolFeatures,
  descriptor: SchemaDescriptor,
): void => {
  genericPureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(
    features,
    descriptor.capabilities,
  );
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

export const BIRTH_PROTOCOL_FEATURES =
  protocolFeaturesFromSchemaCapabilities(BIRTH_SCHEMA_DESCRIPTOR.capabilities);

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

export const SECRET_BIRTH_PROTOCOL_FEATURES =
  protocolFeaturesFromSchemaCapabilities(
    SECRET_BIRTH_SCHEMA_DESCRIPTOR.capabilities,
  );
