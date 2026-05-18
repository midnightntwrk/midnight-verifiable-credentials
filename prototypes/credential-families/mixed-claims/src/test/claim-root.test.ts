import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const claimsSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "mixed-claims-credential",
      "claims.compact",
    ),
    "utf8",
  ),
);

describe("mixed-claims claim representation", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:mixed-claims:v1");
  });

  it("separates direct public claims from private commitments", () => {
    expect(claimsSource).toContain("struct MixedClaimsPublicClaims");
    expect(claimsSource).toContain("credentialTypeCode: Uint<16>");
    expect(claimsSource).toContain("issuerJurisdictionCode: Bytes<2>");
    expect(claimsSource).toContain("assuranceLevel: Uint<8>");
    expect(claimsSource).toContain("struct MixedClaimsPrivateClaimCommitments");
    expect(claimsSource).toContain("subjectIdCommitment: Bytes<32>");
    expect(claimsSource).toContain("birthDateCommitment: Bytes<32>");
    expect(claimsSource).toContain("accountTierCommitment: Bytes<32>");
    expect(claimsSource).toContain("publicClaims: MixedClaimsPublicClaims");
    expect(claimsSource).toContain(
      "privateClaims: MixedClaimsPrivateClaimCommitments",
    );
  });

  it("hashes public and private roots independently before composing the claim root", () => {
    expect(claimsSource).toContain("midnight:vc:mixed-claims:public");
    expect(claimsSource).toContain("midnight:vc:mixed-claims:private");
    expect(claimsSource).toContain(
      "persistentHash<MixedClaimsPublicClaims>(publicClaims)",
    );
    expect(claimsSource).toContain(
      "persistentHash<MixedClaimsPrivateClaimCommitments>(privateClaims)",
    );
    expect(claimsSource).toContain(
      "mixedClaimsPublicClaimsRoot(claims.publicClaims)",
    );
    expect(claimsSource).toContain(
      "mixedClaimsPrivateClaimCommitmentsRoot(claims.privateClaims)",
    );
  });

  it("keeps private source facts behind commitment helper circuits", () => {
    expect(claimsSource).toContain("mixedClaimsSubjectIdCommitment");
    expect(claimsSource).toContain("persistentCommit<Bytes<32>>(subjectId");
    expect(claimsSource).toContain("mixedClaimsBirthDateCommitment");
    expect(claimsSource).toContain("persistentCommit<Uint<32>>(birthDateDays");
    expect(claimsSource).toContain("mixedClaimsAccountTierCommitment");
    expect(claimsSource).toContain("persistentCommit<Uint<8>>(accountTier");
  });
});
