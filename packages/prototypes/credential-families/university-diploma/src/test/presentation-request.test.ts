import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const modelSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "university-diploma-credential",
      "model.compact",
    ),
    "utf8",
  ),
);

const helpersSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "university-diploma-credential",
      "helpers.compact",
    ),
    "utf8",
  ),
);

describe("university-diploma presentation request", () => {
  it("keeps an explicit verifier challenge in the request shape", () => {
    expect(modelSource).toContain("verifierChallengeHash");
  });

  it("models selective-disclosure gates for the academic fields", () => {
    expect(modelSource).toContain("requireGraduateNameDisclosure");
    expect(modelSource).toContain("requireUniversityNameDisclosure");
    expect(modelSource).toContain("requireAwardNameDisclosure");
    expect(modelSource).toContain("requireGraduationYearDisclosure");
    expect(modelSource).toContain("requireFinalGradeDisclosure");
    expect(modelSource).toContain("requireCreditsEarnedDisclosure");
    expect(helpersSource).toContain(
      "University-diploma request requires graduate name disclosure",
    );
    expect(helpersSource).toContain(
      "University-diploma request requires final grade disclosure",
    );
  });

  it("supports a verifier-side minimum-grade predicate for the discount flow", () => {
    expect(modelSource).toContain("enforceMinimumFinalGrade");
    expect(modelSource).toContain("minimumFinalGrade");
    expect(helpersSource).toContain(
      "University-diploma minimum-grade request must require final grade disclosure",
    );
    expect(helpersSource).toContain(
      "University-diploma disclosed final grade is below the verifier minimum",
    );
  });
});
