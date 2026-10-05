import { CredentialModelError } from "./errors.js";
import type { CredentialSchemaDefinition } from "./types.js";

const numericIdentifier = String.raw`(?:0|[1-9]\d*)`;
const nonNumericIdentifier = String.raw`(?:\d*[A-Za-z-][0-9A-Za-z-]*)`;
const prereleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
const semanticVersionPattern = new RegExp(
  `^${numericIdentifier}[.]${numericIdentifier}[.]${numericIdentifier}` +
    `(?:-${prereleaseIdentifier}(?:[.]${prereleaseIdentifier})*)?` +
    `(?:[+][0-9A-Za-z-]+(?:[.][0-9A-Za-z-]+)*)?$`,
  "u",
);
const claimDisclosures: ReadonlySet<unknown> = new Set([
  "public",
  "selective",
  "committed",
  "predicate-only",
]);

type UnknownRecord = Readonly<Record<string, unknown>>;

function assertRecord(
  value: unknown,
  path: string,
  message = "must be an object",
): asserts value is UnknownRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CredentialModelError("INVALID_DESCRIPTOR", path, message);
  }
}

function assertIdentifier(
  value: unknown,
  path: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new CredentialModelError(
      "INVALID_IDENTIFIER",
      path,
      "must be a non-empty trimmed string",
    );
  }
}

function assertVersion(
  value: unknown,
  path: string,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim() !== value ||
    !semanticVersionPattern.test(value)
  ) {
    throw new CredentialModelError(
      "INVALID_VERSION",
      path,
      "must be a semantic version",
    );
  }
}

function assertOptionalText(
  value: unknown,
  path: string,
): asserts value is string | undefined {
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
}

export function assertCredentialSchemaDefinition(
  definition: unknown,
): asserts definition is CredentialSchemaDefinition {
  assertRecord(definition, "definition");
  assertIdentifier(definition.id, "id");
  assertVersion(definition.version, "version");
  assertOptionalText(definition.name, "name");
  assertOptionalText(definition.description, "description");

  if (
    !Array.isArray(definition.credentialTypes) ||
    definition.credentialTypes.length === 0
  ) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "credentialTypes",
      "must contain at least one credential type",
    );
  }
  for (const [index, credentialType] of definition.credentialTypes.entries()) {
    assertIdentifier(credentialType, `credentialTypes[${index}]`);
  }

  if (!Array.isArray(definition.claims)) {
    throw new CredentialModelError(
      "INVALID_DESCRIPTOR",
      "claims",
      "must be an array",
    );
  }

  const claimIds = new Set<string>();
  for (const [index, claim] of definition.claims.entries()) {
    const claimPath = `claims[${index}]`;
    assertRecord(claim, claimPath);
    assertIdentifier(claim.id, `${claimPath}.id`);
    if (claimIds.has(claim.id)) {
      throw new CredentialModelError(
        "DUPLICATE_ID",
        `${claimPath}.id`,
        `duplicates '${claim.id}'`,
      );
    }
    claimIds.add(claim.id);

    if (!claimDisclosures.has(claim.disclosure)) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `${claimPath}.disclosure`,
        "must be public, selective, committed, or predicate-only",
      );
    }
    if (typeof claim.required !== "boolean") {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `${claimPath}.required`,
        "must be a boolean",
      );
    }
    if (claim.valueType !== undefined) {
      assertIdentifier(claim.valueType, `${claimPath}.valueType`);
    }
    if (!Array.isArray(claim.path) || claim.path.length === 0) {
      throw new CredentialModelError(
        "INVALID_DESCRIPTOR",
        `${claimPath}.path`,
        "must contain at least one path segment",
      );
    }
    for (const [pathIndex, segment] of claim.path.entries()) {
      assertIdentifier(segment, `${claimPath}.path[${pathIndex}]`);
    }
  }
}

export const defineCredentialSchema = <
  const Definition extends CredentialSchemaDefinition,
>(
  definition: Definition,
): Definition => {
  assertCredentialSchemaDefinition(definition);
  return definition;
};
