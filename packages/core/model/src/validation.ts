import { CredentialModelError } from "./errors.js";
import type {
  CredentialCompositionManifest,
  CredentialFamilyDefinition,
} from "./types.js";

const semanticVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;
const packageVersionPattern =
  /^(?:[~^]|>=|<=|>|<)?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u;
const packageNamePattern =
  /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u;
const claimDisclosures = new Set([
  "public",
  "selective",
  "committed",
  "predicate-only",
]);
const capabilityKinds = new Set([
  "holder-binding",
  "status",
  "proof",
  "presentation",
]);
const artifactPurposes = new Set([
  "prover",
  "verifier",
  "circuit",
  "metadata",
]);

const assertIdentifier = (value: string, path: string): void => {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new CredentialModelError(
      "INVALID_IDENTIFIER",
      path,
      "must be a non-empty trimmed string",
    );
  }
};

const assertVersion = (value: string, path: string): void => {
  if (typeof value !== "string" || !semanticVersionPattern.test(value)) {
    throw new CredentialModelError(
      "INVALID_VERSION",
      path,
      "must be a semantic version",
    );
  }
};

const assertUniqueIds = (
  values: readonly { readonly id: string }[],
  path: string,
): void => {
  const ids = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertIdentifier(value.id, `${path}[${index}].id`);
    if (ids.has(value.id)) {
      throw new CredentialModelError(
        "DUPLICATE_ID",
        `${path}[${index}].id`,
        `duplicates '${value.id}'`,
      );
    }
    ids.add(value.id);
  }
};

export const assertCredentialCompositionManifest = (
  manifest: CredentialCompositionManifest,
): void => {
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    manifest.formatVersion !== 1 ||
    !Array.isArray(manifest.packages)
  ) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "composition",
      "must use formatVersion 1 and declare a packages array",
    );
  }

  const packageNames = new Set<string>();
  for (const [index, requirement] of manifest.packages.entries()) {
    const requirementPath = `composition.packages[${index}]`;
    if (!packageNamePattern.test(requirement.name)) {
      throw new CredentialModelError(
        "INVALID_PACKAGE_REQUIREMENT",
        `${requirementPath}.name`,
        "must be a valid npm package name",
      );
    }
    if (
      /^(?:file|link|workspace|git|https?):/u.test(requirement.version) ||
      !packageVersionPattern.test(requirement.version)
    ) {
      throw new CredentialModelError(
        "INVALID_PACKAGE_REQUIREMENT",
        `${requirementPath}.version`,
        "must be a registry-resolvable exact or bounded semantic version",
      );
    }
    if (packageNames.has(requirement.name)) {
      throw new CredentialModelError(
        "DUPLICATE_ID",
        `${requirementPath}.name`,
        `duplicates '${requirement.name}'`,
      );
    }
    packageNames.add(requirement.name);

    if (
      requirement.exports !== undefined &&
      !Array.isArray(requirement.exports)
    ) {
      throw new CredentialModelError(
        "INVALID_PACKAGE_REQUIREMENT",
        `${requirementPath}.exports`,
        "must be an array of explicit package export paths",
      );
    }
    for (const [exportIndex, exportPath] of (
      requirement.exports ?? []
    ).entries()) {
      assertIdentifier(
        exportPath,
        `${requirementPath}.exports[${exportIndex}]`,
      );
      if (exportPath !== "." && !exportPath.startsWith("./")) {
        throw new CredentialModelError(
          "INVALID_PACKAGE_REQUIREMENT",
          `${requirementPath}.exports[${exportIndex}]`,
          "must be '.' or an explicit package subpath starting with './'",
        );
      }
    }
  }
};

export const assertCredentialFamilyDefinition = <
  TCredential,
  TPresentation,
  TEncodedCredential,
  TEncodedPresentation,
>(
  definition: CredentialFamilyDefinition<
    TCredential,
    TPresentation,
    TEncodedCredential,
    TEncodedPresentation
  >,
): void => {
  if (
    typeof definition !== "object" ||
    definition === null ||
    typeof definition.schema !== "object" ||
    definition.schema === null
  ) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "definition",
      "must declare a credential schema",
    );
  }
  assertIdentifier(definition.id, "id");
  assertVersion(definition.version, "version");
  assertIdentifier(definition.schema.id, "schema.id");
  assertVersion(definition.schema.version, "schema.version");

  if (
    !Array.isArray(definition.schema.credentialTypes) ||
    definition.schema.credentialTypes.length === 0
  ) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "schema.credentialTypes",
      "must contain at least one credential type",
    );
  }
  for (const [index, credentialType] of definition.schema.credentialTypes.entries()) {
    assertIdentifier(credentialType, `schema.credentialTypes[${index}]`);
  }

  if (!Array.isArray(definition.schema.claims)) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "schema.claims",
      "must be an array",
    );
  }
  assertUniqueIds(definition.schema.claims, "schema.claims");
  for (const [index, claim] of definition.schema.claims.entries()) {
    if (!claimDisclosures.has(claim.disclosure)) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `schema.claims[${index}].disclosure`,
        "must be public, selective, committed, or predicate-only",
      );
    }
    if (typeof claim.required !== "boolean") {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `schema.claims[${index}].required`,
        "must be a boolean",
      );
    }
    if (claim.valueType !== undefined) {
      assertIdentifier(
        claim.valueType,
        `schema.claims[${index}].valueType`,
      );
    }
    if (!Array.isArray(claim.path) || claim.path.length === 0) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `schema.claims[${index}].path`,
        "must contain at least one path segment",
      );
    }
    for (const [pathIndex, segment] of claim.path.entries()) {
      assertIdentifier(segment, `schema.claims[${index}].path[${pathIndex}]`);
    }
  }

  if (
    !Array.isArray(definition.capabilities) ||
    !Array.isArray(definition.artifacts)
  ) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "definition",
      "capabilities and artifacts must be arrays",
    );
  }
  assertUniqueIds(definition.capabilities, "capabilities");
  assertUniqueIds(definition.artifacts, "artifacts");
  for (const [index, capability] of definition.capabilities.entries()) {
    if (!capabilityKinds.has(capability.kind)) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `capabilities[${index}].kind`,
        "must be holder-binding, status, proof, or presentation",
      );
    }
    if (typeof capability.required !== "boolean") {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `capabilities[${index}].required`,
        "must be a boolean",
      );
    }
    if (capability.version !== undefined) {
      assertVersion(capability.version, `capabilities[${index}].version`);
    }
  }
  for (const [index, artifact] of definition.artifacts.entries()) {
    assertIdentifier(artifact.mediaType, `artifacts[${index}].mediaType`);
    if (!artifactPurposes.has(artifact.purpose)) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `artifacts[${index}].purpose`,
        "must be prover, verifier, circuit, or metadata",
      );
    }
    if (
      artifact.optional !== undefined &&
      typeof artifact.optional !== "boolean"
    ) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `artifacts[${index}].optional`,
        "must be a boolean when present",
      );
    }
  }

  assertCredentialCompositionManifest(definition.composition);
  for (const [name, codec] of [
    ["credentialCodec", definition.credentialCodec],
    ["presentationCodec", definition.presentationCodec],
  ] as const) {
    if (
      typeof codec !== "object" ||
      codec === null ||
      typeof codec.mediaType !== "string" ||
      codec.mediaType.trim() !== codec.mediaType ||
      codec.mediaType.length === 0 ||
      typeof codec.encode !== "function" ||
      typeof codec.decode !== "function"
    ) {
      throw new CredentialModelError(
        "INVALID_CODEC",
        name,
        "must declare a media type and encode/decode functions",
      );
    }
  }
};

export const defineCredentialFamily = <
  TCredential,
  TPresentation,
  TEncodedCredential = unknown,
  TEncodedPresentation = unknown,
>(
  definition: CredentialFamilyDefinition<
    TCredential,
    TPresentation,
    TEncodedCredential,
    TEncodedPresentation
  >,
): CredentialFamilyDefinition<
  TCredential,
  TPresentation,
  TEncodedCredential,
  TEncodedPresentation
> => {
  assertCredentialFamilyDefinition(definition);
  return definition;
};
