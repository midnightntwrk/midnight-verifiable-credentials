import { CredentialModelError } from "./errors.js";
import type { CredentialFamilyDefinition } from "./types.js";

const semanticVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;
const claimDisclosures = new Set([
  "public",
  "selective",
  "committed",
  "predicate-only",
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

const assertOptionalText = (value: string | undefined, path: string): void => {
  if (
    value !== undefined &&
    (typeof value !== "string" || value.trim() !== value || value.length === 0)
  ) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      path,
      "must be a non-empty trimmed string when present",
    );
  }
};

const assertUniqueIds = (
  values: readonly unknown[],
  path: string,
): void => {
  const ids = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (typeof value !== "object" || value === null) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `${path}[${index}]`,
        "must be an object",
      );
    }
    const identified = value as { readonly id?: unknown };
    assertIdentifier(identified.id as string, `${path}[${index}].id`);
    if (ids.has(identified.id as string)) {
      throw new CredentialModelError(
        "DUPLICATE_ID",
        `${path}[${index}].id`,
        `duplicates '${identified.id}'`,
      );
    }
    ids.add(identified.id as string);
  }
};

export const assertCredentialFamilyDefinition = (
  definition: CredentialFamilyDefinition,
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
  assertOptionalText(definition.name, "name");
  assertOptionalText(definition.description, "description");
  assertIdentifier(definition.schema.id, "schema.id");
  assertVersion(definition.schema.version, "schema.version");
  assertOptionalText(definition.schema.name, "schema.name");
  assertOptionalText(definition.schema.description, "schema.description");

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
  for (const [index, credentialType] of
    definition.schema.credentialTypes.entries()) {
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
};

export const defineCredentialFamily = (
  definition: CredentialFamilyDefinition,
): CredentialFamilyDefinition => {
  assertCredentialFamilyDefinition(definition);
  return definition;
};
