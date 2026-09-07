import { createUniversityDiplomaFixture } from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";
import { describe, expect, it } from "vitest";

import {
  MIDNIGHT_OPENID_PROFILE_V1,
  resolveUniversityProductionEvidenceProfile,
  UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY,
  UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
} from "../index.js";

describe("University production-shaped evidence profile", () => {
  it("resolves a validated profile and exact package export graph", () => {
    const resolved = resolveUniversityProductionEvidenceProfile();

    expect(resolved.profile).toEqual({
      id: "profile.use-case.university-production-evidence",
      version: "1.0.0",
    });
    expect(resolved.conformance.evidenceDisposition).toBe("tested");
    expect(resolved.exports).toEqual(
      expect.arrayContaining([
        {
          packageName: "@midnight-ntwrk/credential-model",
          exportPath: ".",
        },
        {
          packageName: "@midnight-ntwrk/credential-exchange",
          exportPath: ".",
        },
        {
          packageName: "@midnight-ntwrk/credential-proofs",
          exportPath: ".",
        },
        {
          packageName: "@midnight-ntwrk/midnight-did-credentials-openid",
          exportPath: ".",
        },
        {
          packageName: "@midnight-ntwrk/midnight-did-university-protocol",
          exportPath: ".",
        },
      ]),
    );
    expect(MIDNIGHT_OPENID_PROFILE_V1).toBe(
      "org.midnight.credentials.openid.v1",
    );
    expect(UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE.maturity.production.value).toBe(
      "experimental",
    );
  });

  it("round-trips a real diploma credential with bigint and byte fields", () => {
    const credential = createUniversityDiplomaFixture().credential;
    const encoded =
      UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY.credentialCodec.encode(credential);
    const decoded =
      UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY.credentialCodec.decode(
        encoded,
      );

    expect(decoded).toEqual(credential);
    expect((decoded as typeof credential).version).toBeTypeOf("bigint");
    expect((decoded as typeof credential).claimRoot).toBeInstanceOf(Uint8Array);
    expect(
      (decoded as typeof credential).issuerVerificationMethodRef.didContractAddress
        .bytes,
    ).toBeInstanceOf(Uint8Array);
  });

  it("fails closed when the declared profile is tampered", () => {
    expect(() =>
      resolveUniversityProductionEvidenceProfile({
        ...UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
        family: {
          ...UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE.family,
          schemaVersion: "tampered",
        },
      }),
    ).toThrow(/family|schema/i);
  });
});
