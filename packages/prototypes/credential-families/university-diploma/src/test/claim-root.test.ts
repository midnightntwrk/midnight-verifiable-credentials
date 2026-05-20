import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const claimsSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "university-diploma-credential",
      "claims.compact",
    ),
    "utf8",
  ),
);

describe("university-diploma claim surface", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:uni-diploma:v1");
  });

  it("models the academic record fields needed by the prototype use case", () => {
    expect(claimsSource).toContain("diplomaId: Bytes<32>");
    expect(claimsSource).toContain("studentId: Bytes<16>");
    expect(claimsSource).toContain("graduateName: Bytes<32>");
    expect(claimsSource).toContain("universityName: Bytes<32>");
    expect(claimsSource).toContain("awardName: Bytes<32>");
    expect(claimsSource).toContain("graduationYear: Uint<16>");
    expect(claimsSource).toContain("graduationMonth: Uint<8>");
    expect(claimsSource).toContain("finalGrade: Uint<8>");
    expect(claimsSource).toContain("creditsEarned: Uint<16>");
  });
});
