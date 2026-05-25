import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const modelSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "passport-kyc-credential",
    "model.compact",
  ),
  "utf8",
);

describe("passport-kyc scaffold presentation request", () => {
  it("keeps an explicit verifier challenge in the request shape", () => {
    expect(modelSource).toContain("verifierChallengeHash");
  });
});
