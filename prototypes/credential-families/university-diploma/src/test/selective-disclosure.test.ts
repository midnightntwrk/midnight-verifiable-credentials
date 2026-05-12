import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/university-diploma-credential/contract/index.js";
import { createUniversityDiplomaFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("university-diploma selective disclosure", () => {
  it("verifies a company-style presentation over the academic fields required for a job application", () => {
    const fixture = createUniversityDiplomaFixture({
      request: {
        requireGraduateNameDisclosure: true,
        requireUniversityNameDisclosure: true,
        requireAwardNameDisclosure: true,
        requireGraduationYearDisclosure: true,
        requireFinalGradeDisclosure: true,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("allows hidden faculty and honors fields when the verifier does not ask for them", () => {
    const fixture = createUniversityDiplomaFixture({
      disclosure: {
        revealFacultyName: false,
        revealHonorsCode: false,
      },
      request: {
        requireFacultyNameDisclosure: false,
        requireHonorsCodeDisclosure: false,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects a hidden graduate name when the verifier requires it", () => {
    const fixture = createUniversityDiplomaFixture({
      disclosure: {
        revealGraduateName: false,
      },
      request: {
        requireGraduateNameDisclosure: true,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/University-diploma request requires graduate name disclosure/);
  });

  it("accepts a mall-style presentation when the disclosed grade meets the minimum threshold", () => {
    const fixture = createUniversityDiplomaFixture({
      request: {
        requireGraduateNameDisclosure: false,
        requireUniversityNameDisclosure: true,
        requireAwardNameDisclosure: false,
        requireGraduationYearDisclosure: false,
        requireFinalGradeDisclosure: true,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 90n,
      },
      disclosure: {
        revealGraduateName: false,
        revealAwardName: false,
        revealGraduationYear: false,
        revealFinalGrade: true,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).not.toThrow();
  });

  it("rejects a mall-style presentation when the final grade is below the threshold", () => {
    const fixture = createUniversityDiplomaFixture({
      claimOverrides: {
        finalGrade: 89n,
      },
      request: {
        requireGraduateNameDisclosure: false,
        requireUniversityNameDisclosure: true,
        requireAwardNameDisclosure: false,
        requireGraduationYearDisclosure: false,
        requireFinalGradeDisclosure: true,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 90n,
      },
      disclosure: {
        revealGraduateName: false,
        revealAwardName: false,
        revealGraduationYear: false,
        revealFinalGrade: true,
      },
    });

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /University-diploma disclosed final grade is below the verifier minimum/,
    );
  });
});
