import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const modelSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "mixed-claims-credential",
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
      "mixed-claims-credential",
      "helpers.compact",
    ),
    "utf8",
  ),
);

describe("mixed-claims presentation request", () => {
  it("mirrors public claims in the presentation disclosure surface", () => {
    expect(modelSource).toContain("publicClaims: MixedClaimsPublicClaims");
    expect(helpersSource).toContain(
      "disclosed.publicClaims == claims.publicClaims",
    );
    expect(helpersSource).toContain(
      "Mixed-claims public claims disclosure does not match the credential",
    );
  });

  it("keeps explicit request gates for committed private disclosures", () => {
    expect(modelSource).toContain("requireSubjectIdDisclosure");
    expect(modelSource).toContain("requireBirthDateDisclosure");
    expect(helpersSource).toContain(
      "Mixed-claims request requires subject-id disclosure",
    );
    expect(helpersSource).toContain(
      "Mixed-claims request requires birth-date disclosure",
    );
  });

  it("supports a predicate-only account-tier witness", () => {
    expect(modelSource).toContain("enforceMinimumAccountTier");
    expect(modelSource).toContain("minimumAccountTier: Uint<8>");
    expect(helpersSource).toContain(
      "presentation.disclosed.accountTier >= request.minimumAccountTier",
    );
    expect(helpersSource).toContain(
      "Mixed-claims account tier is below the verifier minimum",
    );
  });

  it("keeps verifier challenge and issuer matching in the request contract", () => {
    expect(modelSource).toContain("verifierChallengeHash");
    expect(helpersSource).toContain(
      "Mixed-claims verifier challenge must be set",
    );
    expect(helpersSource).toContain(
      "Mixed-claims request issuer contract does not match the credential issuer",
    );
    expect(helpersSource).toContain(
      "Mixed-claims presentation proof challenge does not match the request",
    );
  });
});
