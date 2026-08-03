import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("same-holder audit gate", () => {
  it("passes standalone/composable include boundary", () => {
    const standalone = readFileSync(
      resolve(root, "src/holder-binding/same-holder.compact"),
      "utf8",
    );
    const composable = readFileSync(
      resolve(root, "src/holder-binding/same-holder/composable.compact"),
      "utf8",
    );
    expect(standalone).toContain('include "../credentials"');
    expect(composable).not.toMatch(/^\s*include\s+"/m);
    expect(composable).not.toMatch(/primitives\/credentials|\.\.\/\.\.\//);
  });
});
