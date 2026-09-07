import type { AggregateDecisionProfileV1 } from "./composition-types.js";
import { CredentialModelError } from "./errors.js";

const semanticVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;

const invalid = (path: string, message: string): never => {
  throw new CredentialModelError("INVALID_DESCRIPTOR", path, message);
};

const identifier = (value: unknown, path: string): void => {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    invalid(path, "must be a non-empty trimmed identifier");
  }
};

const exactKeys = (
  value: unknown,
  path: string,
  keys: readonly string[],
): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    invalid(path, "must be an object");
  }
  const candidate = value as Record<string, unknown>;
  if (
    keys.some((key) => !Object.hasOwn(candidate, key)) ||
    Object.keys(candidate).some((key) => !keys.includes(key))
  ) {
    invalid(path, `must contain exactly: ${keys.join(", ")}`);
  }
  return candidate;
};

export function assertAggregateDecisionProfileV1(
  value: unknown,
): asserts value is AggregateDecisionProfileV1 {
  const profile = exactKeys(value, "", [
    "formatVersion",
    "id",
    "version",
    "childCount",
    "requiredAuthority",
    "sameHolder",
    "mutation",
  ]);
  if (profile.formatVersion !== 1) invalid("formatVersion", "must be 1");
  identifier(profile.id, "id");
  if (
    typeof profile.version !== "string" ||
    !semanticVersionPattern.test(profile.version)
  ) {
    invalid("version", "must be an exact semantic version");
  }

  const childCount = exactKeys(profile.childCount, "childCount", [
    "minimum",
    "maximum",
  ]);
  if (childCount.minimum !== 2 || childCount.maximum !== 3) {
    invalid("childCount", "aggregate v1 is fixed to two or three children");
  }
  if (
    profile.requiredAuthority !== "ledger-local" &&
    profile.requiredAuthority !== "ledger-attested" &&
    profile.requiredAuthority !== "local-process"
  ) {
    invalid("requiredAuthority", "must select one exact authority");
  }

  const sameHolder = exactKeys(
    profile.sameHolder,
    "sameHolder",
    (profile.sameHolder as { mode?: unknown })?.mode === "required"
      ? ["mode", "capability"]
      : ["mode"],
  );
  if (sameHolder.mode === "required") {
    const capability = exactKeys(sameHolder.capability, "sameHolder.capability", [
      "id",
      "version",
    ]);
    identifier(capability.id, "sameHolder.capability.id");
    if (
      typeof capability.version !== "string" ||
      !semanticVersionPattern.test(capability.version)
    ) {
      invalid("sameHolder.capability.version", "must be an exact semantic version");
    }
  } else if (sameHolder.mode !== "not-required") {
    invalid("sameHolder.mode", "must be required or not-required");
  }

  const mutation = exactKeys(profile.mutation, "mutation", [
    "location",
    "nullifier",
    "consumption",
  ]);
  if (profile.requiredAuthority === "local-process") {
    if (
      mutation.location !== "none" ||
      mutation.nullifier !== "none" ||
      mutation.consumption !== "none"
    ) {
      invalid("mutation", "local-process aggregates cannot mutate state");
    }
  } else {
    const readOnly =
      mutation.location === "none" &&
      mutation.nullifier === "none" &&
      mutation.consumption === "none";
    const sideEffecting =
      mutation.location === "ledger" &&
      mutation.nullifier === "contract-derived" &&
      mutation.consumption === "atomic";
    if (!readOnly && !sideEffecting) {
      invalid(
        "mutation",
        "ledger aggregates require either an explicit read-only tuple or an atomically consumed contract-derived nullifier",
      );
    }
  }
}
