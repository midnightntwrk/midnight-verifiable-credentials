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
      "mixedClaimsAccountTierCommitment(disclosed.accountTier, disclosed.accountTierOpening) == claims.privateClaims.accountTierCommitment",
    );
    expect(helpersSource).toContain(
      "Mixed-claims account-tier witness does not open the credential commitment",
    );
  });
});
