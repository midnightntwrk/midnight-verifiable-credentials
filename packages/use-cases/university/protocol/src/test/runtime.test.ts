import {
  secureProtocolEnvelopeIdentifierSource,
  unsafeReferenceDeterministicEnvelopeIdentifierSource,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { describe, expect, it } from "vitest";

import { UniversityProtocolFlowRunner } from "../flow.js";
import {
  DeterministicUniversityPartyRuntime,
  loadUniversityFixtureData,
  PreloadedUniversityPartyRuntime,
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
    expect(issuer).not.toHaveProperty("secretKey");
    expect(student).not.toHaveProperty("secretKey");
    expect(verifier).not.toHaveProperty("secretKey");
    expect(runtime.signerOptionsFor(issuer).secretKey).not.toBe(
      runtime.signerOptionsFor(student).secretKey,
    );
  });

  it("supports CRUD-style party registration and updates", () => {
    const runtime = new DeterministicUniversityPartyRuntime();

    const created = runtime.createParty(
      {
        partyId: "verifier-1",
        didUrl: "did:midnight:test:verifier-1",
        methodId: "#verifier-key-1",
        role: "verifier",
        source: "deterministic-fixture",
      },
      {
        label: "did:midnight:test:verifier-1",
        methodId: "#verifier-key-1",
        secretKey: 123n,
      },
    );
    const updated = runtime.updateParty(
      "verifier-1",
      {
        methodId: "#verifier-key-2",
        verificationMethodRef: "did:midnight:test:verifier-1#verifier-key-2",
      },
      {
        label: "did:midnight:test:verifier-1",
        methodId: "#verifier-key-2",
        secretKey: 456n,
      },
    );

    expect(created.methodId).toBe("#verifier-key-1");
    expect(runtime.readParty("verifier-1")?.methodId).toBe("#verifier-key-2");
    expect(updated.verificationMethodRef).toBe(
      "did:midnight:test:verifier-1#verifier-key-2",
    );
    expect(runtime.listParties()).toHaveLength(1);
    expect(runtime.signerOptionsFor(updated).secretKey).toBe(456n);
    expect(runtime.deleteParty("verifier-1")).toBe(true);
    expect(runtime.readParty("verifier-1")).toBeUndefined();
    expect(() => runtime.signerOptionsFor(updated)).toThrow(/unavailable/u);
    expect(
      runtime.createParty(created, {
        label: created.didUrl,
        methodId: created.methodId,
        secretKey: 789n,
      }),
    ).toEqual(created);
  });

  it("uses preloaded provisioned party records without re-deriving them", () => {
    const fixture = loadUniversityFixtureData();
    const university = fixture.university;
    const student = fixture.students[0]!;
    const company = fixture.companies[0]!;
    const runtime = new PreloadedUniversityPartyRuntime([
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
    const issuer = runtime.issuerProfileForUniversity(university);
    const holder = runtime.studentProfileForStudent(student);
    const verifier = runtime.verifierProfile(
      company.companyId,
      company.verifierDidUrl,
      company.verifierMethodId,
    );
    expect(issuer).not.toHaveProperty("secretKey");
    expect(runtime.signerOptionsFor(issuer).secretKey).toBe(11n);
    expect(runtime.signerOptionsFor(holder).secretKey).toBe(22n);
    expect(runtime.signerOptionsFor(verifier).secretKey).toBe(33n);
  });

  it("uses deterministic envelope IDs only for the fixture runtime", () => {
    const fixture = loadUniversityFixtureData();
    const seedRuntime = new DeterministicUniversityPartyRuntime();
    seedRuntime.issuerProfileForUniversity(fixture.university);
    for (const student of fixture.students) {
      seedRuntime.studentProfileForStudent(student);
    }
    for (const company of fixture.companies) {
      seedRuntime.verifierProfile(
        company.companyId,
        company.verifierDidUrl,
        company.verifierMethodId,
      );
    }
    seedRuntime.verifierProfile(
      fixture.mall.mallId,
      fixture.mall.verifierDidUrl,
      fixture.mall.verifierMethodId,
    );
    const provisionedRuntime = new PreloadedUniversityPartyRuntime(
      seedRuntime.listParties().map((party) => ({
        ...party,
        secretKey: seedRuntime.signerOptionsFor(party).secretKey,
        source: "standalone-provisioned" as const,
      })),
    );

    expect(
      new UniversityProtocolFlowRunner().envelopeIdentifierSource,
    ).toBe(unsafeReferenceDeterministicEnvelopeIdentifierSource);
    expect(
      new UniversityProtocolFlowRunner({
        partyRuntime: provisionedRuntime,
      }).envelopeIdentifierSource,
    ).toBe(secureProtocolEnvelopeIdentifierSource);
  });
});
