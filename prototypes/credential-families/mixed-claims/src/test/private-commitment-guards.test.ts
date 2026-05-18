import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const helpersSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "mixed-claims-credential",
      "helpers.compact",
    ),
    "utf8",
  ),
);

describe("mixed-claims private commitment guards", () => {
  it("rejects subject-id disclosure unless it opens the signed commitment", () => {
    expect(helpersSource).toContain(
      "mixedClaimsSubjectIdCommitment(disclosed.subjectId, disclosed.subjectIdOpening) == claims.privateClaims.subjectIdCommitment",
    );
    expect(helpersSource).toContain(
      "Mixed-claims subject-id disclosure does not open the credential commitment",
    );
  });

  it("rejects birth-date disclosure unless it opens the signed commitment", () => {
    expect(helpersSource).toContain(
      "mixedClaimsBirthDateCommitment(disclosed.birthDateDays, disclosed.birthDateOpening) == claims.privateClaims.birthDateCommitment",
    );
    expect(helpersSource).toContain(
      "Mixed-claims birth-date disclosure does not open the credential commitment",
    );
  });

  it("rejects account-tier predicates unless the witness opens the signed commitment", () => {
    expect(helpersSource).toContain(
      "mixedClaimsAccountTierCommitment(accountTierWitness, accountTierOpening) == claims.privateClaims.accountTierCommitment",
    );
    expect(helpersSource).toContain(
      "Mixed-claims account-tier witness does not open the credential commitment",
    );
  });

  it("requires inactive disclosure and predicate slots to be canonical empty values", () => {
    expect(helpersSource).toContain(
      "Mixed-claims hidden subject-id disclosure slot must be empty",
    );
    expect(helpersSource).toContain(
      "Mixed-claims hidden birth-date disclosure slot must be zero",
    );
    expect(helpersSource).toContain(
      "Mixed-claims inactive account-tier witness must be zero",
    );
  });
});
