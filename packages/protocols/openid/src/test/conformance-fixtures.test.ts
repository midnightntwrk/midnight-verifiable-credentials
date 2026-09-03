import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  evaluateConformanceFixture,
  materializeConformanceFixtures,
} from "../index.js";

const load = (name: string): readonly unknown[] =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../conformance/fixtures/${name}`, import.meta.url)), "utf8")) as readonly unknown[];

const positiveDefinitions = load("positive.json");
const negativeDefinitions = load("negative.json");
const fixtures = materializeConformanceFixtures(positiveDefinitions, negativeDefinitions);

describe("independently stored OpenID Final profile vectors", () => {
  it("rejects unknown fixture kinds instead of evaluating another schema", () => {
    expect(evaluateConformanceFixture({ kind: "oid4vpp-typo", value: {} })).toBe(false);
    expect(() => materializeConformanceFixtures([
      { id: "unknown", kind: "oid4vpp-typo", valid: true, value: {} },
    ], [])).toThrow(/kind/i);
  });

  it("derives every negative from a conformant positive by mutating only its named field", () => {
    const positivesById = new Map(fixtures.filter((fixture) => fixture.valid).map((fixture) => [fixture.id, fixture]));
    for (const definition of negativeDefinitions as readonly Record<string, unknown>[]) {
      expect(typeof definition.baseId).toBe("string");
      expect(definition).not.toHaveProperty("value");
      const base = positivesById.get(definition.baseId as string);
      expect(base, `${String(definition.id)} base`).toBeDefined();
      expect(evaluateConformanceFixture(base), `${String(definition.id)} base must otherwise pass`).toBe(true);
      expect(definition.mutation).toMatchObject({ path: expect.any(Array) });
    }
  });

  for (const fixture of fixtures) {
    it(`${fixture.valid ? "accepts" : "rejects"} ${fixture.id}`, () => {
      expect(evaluateConformanceFixture(fixture)).toBe(fixture.valid);
    });
  }
});
