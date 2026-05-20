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

  it("rejects absent resolver hints with arbitrary bytes", () => {
    expect(() =>
      pureCircuits.assertValidSchemaFamilyResolutionHint({
        hasResolverHint: false,
        resolverHint: bytes32("not-the-sentinel"),
      }),
    ).toThrow(/Absent schema resolver hint must use the no-hint sentinel/);
  });

  it("compares protocol feature hints with schema capabilities during migration", () => {
    expect(() =>
      pureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(
        capabilities,
        capabilities,
      ),
    ).not.toThrow();

    expect(() =>
      pureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(
        {
          ...capabilities,
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
});
