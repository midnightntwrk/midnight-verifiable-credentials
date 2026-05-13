import { describe, expect, it } from "vitest";

import { DeterministicUniversityPartyRuntime, loadUniversityFixtureData } from "../runtime.js";

describe("university party runtime", () => {
  it("derives stable issuer, student, and verifier profiles from fixture DIDs", () => {
    const fixture = loadUniversityFixtureData();
    const runtime = new DeterministicUniversityPartyRuntime();

    const issuer = runtime.issuerProfileForUniversity(fixture.university);
    const student = runtime.studentProfileForStudent(fixture.students[0]!);
    const verifier = runtime.verifierProfile(
      fixture.companies[0]!.companyId,
      fixture.companies[0]!.verifierDidUrl,
      fixture.companies[0]!.verifierMethodId,
    );

    expect(issuer.didUrl).toBe(fixture.university.issuerDidUrl);
    expect(issuer.methodId).toBe(fixture.university.issuerMethodId);
    expect(student.didUrl).toBe(fixture.students[0]!.holderDidUrl);
    expect(student.methodId).toBe(fixture.students[0]!.holderMethodId);
    expect(verifier.didUrl).toBe(fixture.companies[0]!.verifierDidUrl);
    expect(verifier.methodId).toBe(fixture.companies[0]!.verifierMethodId);
    expect(issuer.secretKey).not.toBe(student.secretKey);
    expect(student.secretKey).not.toBe(verifier.secretKey);
  });
});
