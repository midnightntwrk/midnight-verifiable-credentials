import { describe, expect, it } from "vitest";

import {
  DeterministicUniversityPartyRuntime,
  ProvisionedUniversityPartyRuntime,
  loadUniversityFixtureData,
} from "../runtime.js";

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

  it("supports CRUD-style party registration and updates", () => {
    const runtime = new DeterministicUniversityPartyRuntime();

    const created = runtime.createParty({
      partyId: "verifier-1",
      didUrl: "did:midnight:test:verifier-1",
      methodId: "#verifier-key-1",
      secretKey: 123n,
      role: "verifier",
      source: "deterministic-fixture",
    });
    const updated = runtime.updateParty("verifier-1", {
      methodId: "#verifier-key-2",
      verificationMethodRef: "did:midnight:test:verifier-1#verifier-key-2",
    });

    expect(created.methodId).toBe("#verifier-key-1");
    expect(runtime.readParty("verifier-1")?.methodId).toBe("#verifier-key-2");
    expect(updated.verificationMethodRef).toBe(
      "did:midnight:test:verifier-1#verifier-key-2",
    );
    expect(runtime.listParties()).toHaveLength(1);
    expect(runtime.deleteParty("verifier-1")).toBe(true);
    expect(runtime.readParty("verifier-1")).toBeUndefined();
  });

  it("uses provisioned party records without re-deriving them", () => {
    const fixture = loadUniversityFixtureData();
    const university = fixture.university;
    const student = fixture.students[0]!;
    const company = fixture.companies[0]!;
    const runtime = new ProvisionedUniversityPartyRuntime([
      {
        partyId: university.universityId,
        didUrl: university.issuerDidUrl,
        methodId: university.issuerMethodId,
        secretKey: 11n,
        role: "issuer",
        source: "standalone-provisioned",
        contractAddress: "abc123",
        verificationMethodRef: `${university.issuerDidUrl}${university.issuerMethodId}`,
      },
      {
        partyId: student.studentId,
        didUrl: student.holderDidUrl,
        methodId: student.holderMethodId,
        secretKey: 22n,
        role: "holder",
        source: "standalone-provisioned",
      },
      {
        partyId: company.companyId,
        didUrl: company.verifierDidUrl,
        methodId: company.verifierMethodId,
        secretKey: 33n,
        role: "verifier",
        source: "standalone-provisioned",
      },
    ]);

    expect(runtime.descriptor().usesRealDidInstances).toBe(true);
    expect(runtime.issuerProfileForUniversity(university).secretKey).toBe(11n);
    expect(runtime.studentProfileForStudent(student).secretKey).toBe(22n);
    expect(
      runtime.verifierProfile(
        company.companyId,
        company.verifierDidUrl,
        company.verifierMethodId,
      ).secretKey,
    ).toBe(33n);
  });
});
