import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("proof and envelope boundary", () => {
  it("retains generic proof, VC, VP, and linkage modules", () => {
    for (const name of [
      "proofs",
      "vc",
      "vp",
      "relations",
      "issue",
      "present",
    ]) {
      expect(
        readFileSync(
          resolve(root, "src/credentials", `${name}.compact`),
          "utf8",
        ),
      ).toContain("export");
    }
  });
});
