import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const claimsSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "passport-kyc-credential",
    "claims.compact",
  ),
  "utf8",
);

describe("passport-kyc scaffold claim root", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:passport-kyc:v1");
  });
});
