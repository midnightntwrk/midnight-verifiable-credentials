import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  assertCredentialSchemaDefinition,
  CredentialModelError,
} from "../index.js";

type VectorPatch =
  | Readonly<{ path: string; value: unknown }>
  | Readonly<{ op: "remove"; path: string }>;

interface ModelVector {
  readonly id: string;
  readonly input?: unknown;
  readonly patches?: readonly VectorPatch[];
  readonly error?: Readonly<{ code: string; path: string }>;
}

interface ModelVectors {
  readonly formatVersion: number;
  readonly category: string;
  readonly fixture: unknown;
  readonly positive: readonly ModelVector[];
  readonly negative: readonly ModelVector[];
}

const vectorPath = new URL(
  "../../../../../conformance/vectors/credential-schema-definition.json",
  import.meta.url,
);
const vectors = JSON.parse(readFileSync(vectorPath, "utf8")) as ModelVectors;
const patchPathPattern =
  /^\/(?:[A-Za-z][A-Za-z0-9]*|\d+)(?:\/(?:[A-Za-z][A-Za-z0-9]*|\d+))*$/u;
const cloneJson = <Value>(value: Value): Value =>
  JSON.parse(JSON.stringify(value)) as Value;

const applyVectorPatches = (
  fixture: unknown,
  patches: readonly VectorPatch[],
): unknown => {
  const value = cloneJson(fixture);
  for (const patch of patches) {
    expect(patch.path).toMatch(patchPathPattern);
    const segments = patch.path.slice(1).split("/");
    const property = segments.pop();
    if (property === undefined) {
      throw new Error(`vector patch has no property: ${patch.path}`);
    }
    let target = value;
    for (const segment of segments) {
      expect(target).not.toBeNull();
      expect(typeof target).toBe("object");
      expect(Object.hasOwn(target as object, segment)).toBe(true);
      target = (target as Record<string, unknown>)[segment];
    }
    expect(target).not.toBeNull();
    expect(typeof target).toBe("object");
    expect(Object.hasOwn(target as object, property)).toBe(true);
    if ("op" in patch) {
      expect(Object.keys(patch).sort()).toEqual(["op", "path"]);
      expect(patch.op).toBe("remove");
      expect(Array.isArray(target)).toBe(false);
      delete (target as Record<string, unknown>)[property];
    } else {
      expect(Object.keys(patch).sort()).toEqual(["path", "value"]);
      (target as Record<string, unknown>)[property] = cloneJson(patch.value);
    }
  }
  return value;
};

const modelVectorInput = (vector: ModelVector): unknown => {
  const hasInput = Object.hasOwn(vector, "input");
  const hasPatches = Object.hasOwn(vector, "patches");
  expect(Number(hasInput) + Number(hasPatches)).toBe(1);
  if (hasInput) return cloneJson(vector.input);
  if (!Array.isArray(vector.patches)) {
    throw new Error(`${vector.id} has no vector patches`);
  }
  return applyVectorPatches(vectors.fixture, vector.patches);
};

describe("credential schema definition conformance", () => {
  it("uses the expected vector document", () => {
    expect(vectors.formatVersion).toBe(2);
    expect(vectors.category).toBe("credential-schema-definition");
    expect(vectors.positive.length).toBeGreaterThan(0);
    expect(vectors.negative.length).toBeGreaterThan(0);
    const vectorIds = [...vectors.positive, ...vectors.negative].map(
      ({ id }) => id,
    );
    expect(new Set(vectorIds).size).toBe(vectorIds.length);
  });

  it.each(vectors.positive)("accepts $id", (vector) => {
    expect(() =>
      assertCredentialSchemaDefinition(modelVectorInput(vector)),
    ).not.toThrow();
  });

  it.each(vectors.negative)("rejects $id", (vector) => {
    const expectedError = vector.error;
    if (expectedError === undefined) {
      throw new Error(`${vector.id} has no expected model error`);
    }
    let validationError: unknown;
    try {
      assertCredentialSchemaDefinition(modelVectorInput(vector));
    } catch (error) {
      validationError = error;
    }
    if (validationError === undefined) {
      throw new Error(`${vector.id} unexpectedly passed validation`);
    }
    if (!(validationError instanceof CredentialModelError)) {
      throw validationError;
    }
    expect(validationError.code).toBe(expectedError.code);
    expect(validationError.path).toBe(expectedError.path);
  });
});
