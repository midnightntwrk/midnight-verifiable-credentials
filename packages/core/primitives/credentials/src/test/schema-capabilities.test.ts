import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/credentials/contract/index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const schema = {
  packageId: bytes32("midnight:vc:example"),
  schemaId: bytes32("example:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

const capabilities = {
  supportsSelectiveDisclosure: true,
  supportsPredicateProofs: true,
  supportsVerifierScopedPseudonym: false,
  supportsSameHolderProof: false,
};

const protocolFeatures = {
  supportsSelectiveDisclosure: true,
  supportsPredicateProofs: true,
  supportsVerifierScopedPseudonym: false,
  supportsSameHolderProof: false,
};

describe("credentials core: schema capabilities", () => {
  it("accepts a schema descriptor with an explicit resolver hint", () => {
    expect(() =>
      pureCircuits.assertValidSchemaDescriptor({
        schema,
        capabilities,
        familyResolutionHint: {
          hasResolverHint: true,
          resolverHint: bytes32("registry:example-family"),
        },
      }),
    ).not.toThrow();
  });

  it("accepts the no-hint sentinel when resolver discovery is closed ecosystem", () => {
    expect(() =>
      pureCircuits.assertValidSchemaFamilyResolutionHint({
        hasResolverHint: false,
        resolverHint: pureCircuits.noSchemaFamilyResolverHint(),
      }),
    ).not.toThrow();
  });

  it("accepts a schema descriptor without an open-ecosystem resolver hint", () => {
    expect(() =>
      pureCircuits.assertValidSchemaDescriptor({
        schema,
        capabilities,
        familyResolutionHint: {
          hasResolverHint: false,
          resolverHint: pureCircuits.noSchemaFamilyResolverHint(),
        },
      }),
    ).not.toThrow();
  });

  it("rejects absent resolver hints with arbitrary bytes", () => {
    expect(() =>
      pureCircuits.assertValidSchemaFamilyResolutionHint({
        hasResolverHint: false,
        resolverHint: bytes32("not-the-sentinel"),
      }),
    ).toThrow(/Absent schema resolver hint must use the no-hint sentinel/);
  });

  it("rejects set resolver hints with empty bytes", () => {
    expect(() =>
      pureCircuits.assertValidSchemaFamilyResolutionHint({
        hasResolverHint: true,
        resolverHint: new Uint8Array(32),
      }),
    ).toThrow(/Schema resolver hint must not be empty/);
  });

  it("rejects schema descriptors with invalid resolver hints", () => {
    expect(() =>
      pureCircuits.assertValidSchemaDescriptor({
        schema,
        capabilities,
        familyResolutionHint: {
          hasResolverHint: false,
          resolverHint: bytes32("not-the-sentinel"),
        },
      }),
    ).toThrow(/Absent schema resolver hint must use the no-hint sentinel/);
  });

  it("compares protocol feature hints with schema capabilities during migration", () => {
    expect(() =>
      pureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(
        protocolFeatures,
        capabilities,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(
        {
          ...protocolFeatures,
          supportsPredicateProofs: false,
        },
        capabilities,
      ),
    ).toThrow(/Schema capabilities mismatch/);
  });

  it("rejects empty schema identities", () => {
    expect(() =>
      pureCircuits.assertValidSchemaRef({
        ...schema,
        packageId: new Uint8Array(32),
      }),
    ).toThrow(/Schema package id must be set/);
  });

  it("rejects matching schema refs when both refs are empty", () => {
    const emptySchema = {
      ...schema,
      packageId: new Uint8Array(32),
      schemaId: new Uint8Array(32),
    };

    expect(() =>
      pureCircuits.assertMatchingSchemaRefs(emptySchema, emptySchema),
    ).toThrow(/Schema package id must be set/);
  });
});
