import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("holder-binding boundary", () => {
  it("keeps generic holder bindings and excludes family semantics", () => {
    const source = readFileSync(
      resolve(root, "src/credentials/holder-bindings.compact"),
      "utf8",
    );
    expect(source).toContain("assertValidExplicitHolderBinding");
    expect(source).not.toMatch(
      /birth|passport|university|secretKey|provingKey/i,
    );
  });
});
