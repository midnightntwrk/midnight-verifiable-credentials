import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const entrypoints = ["credentials.compact"];

describe("Compact entrypoints", () => {
  it("use only package-local includes", () => {
    for (const entrypoint of entrypoints) {
      const source = readFileSync(resolve(root, "src", entrypoint), "utf8");
      expect(source).not.toMatch(
        /(?:\.\.\/){2,}|primitives\/credentials|verification-v1/,
      );
    }
  });
});
