import assert from "node:assert/strict";

import {
  buildUniversityDataArtifactsForProfile,
  resolveUniversityDataProfile,
  validateUniversityDataProfileArtifacts,
} from "./data-profile-registry.mjs";

const profile = resolveUniversityDataProfile("readable-10");

const buildArtifacts = () =>
  structuredClone(buildUniversityDataArtifactsForProfile(profile));

const findingsFor = (mutate) => {
  const artifacts = buildArtifacts();
  mutate(artifacts);
  return validateUniversityDataProfileArtifacts(profile, artifacts);
};

assert.deepEqual(
  validateUniversityDataProfileArtifacts(profile, buildArtifacts()),
  [],
  "the readable profile fixture should be lifecycle-valid before mutation",
);

const cases = [
  {
    name: "university batch size drift",
    mutate: (artifacts) => {
      artifacts["university.json"].batchSize = 99;
    },
    expected: "university.batchSize=99 does not match profile batchSize=5",
  },
  {
    name: "student count drift",
    mutate: (artifacts) => {
      artifacts["students.json"].pop();
    },
    expected: "students.json contains 9 students, expected 10",
  },
  {
    name: "company count drift",
    mutate: (artifacts) => {
      artifacts["companies.json"].pop();
    },
    expected: "companies.json contains 2 companies, expected 3",
  },
  {
    name: "discount applicant count drift",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"].pop();
    },
    expected: "discount-applicants.json contains 4 applicants, expected 5",
  },
  {
    name: "duplicate student fixture id",
    mutate: (artifacts) => {
      artifacts["students.json"][1].studentId = "STU-0001";
    },
    expected: "duplicate studentId STU-0001",
  },
  {
    name: "batch coverage gap",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][1].studentIds.pop();
      artifacts["issuance-batches.json"][1].size -= 1;
    },
    expected: "issuance batches cover 9 unique students, expected 10",
  },
  {
    name: "duplicate batch membership",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][1].studentIds[0] = "STU-0001";
    },
    expected: "batch-02 repeats student STU-0001",
  },
  {
    name: "batch declared size drift",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][0].size += 1;
    },
    expected: "batch-01 declares size 6, but contains 5 student ids",
  },
  {
    name: "batch exceeds profile size",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][0].studentIds.push("STU-0006");
      artifacts["issuance-batches.json"][0].size += 1;
    },
    expected: "batch-01 contains 6 students, exceeding profile batchSize=5",
  },
  {
    name: "batch references unknown student",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][0].studentIds[0] = "STU-9999";
    },
    expected: "batch-01 references unknown student STU-9999",
  },
  {
    name: "unknown company assignment",
    mutate: (artifacts) => {
      artifacts["students.json"][0].assignedCompanyId = "company-missing";
    },
    expected: "student STU-0001 references unknown company company-missing",
  },
  {
    name: "stale diploma student id",
    mutate: (artifacts) => {
      artifacts["students.json"][0].diplomaClaimValues.studentId = "STU-9999";
    },
    expected:
      "student STU-0001 diplomaClaimValues.studentId does not match the fixture studentId",
  },
  {
    name: "unknown discount applicant",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].studentId = "STU-9999";
    },
    expected: "discount applicant STU-9999 does not exist in students.json",
  },
  {
    name: "stale discount full name",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].fullName = "Stale Name";
    },
    expected: "discount applicant STU-0001 has stale fullName",
  },
  {
    name: "stale discount final grade",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].finalGrade -= 1;
    },
    expected: "discount applicant STU-0001 has stale finalGrade",
  },
  {
    name: "stale discount eligibility",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].expectedDiscountEligibility =
        false;
    },
    expected:
      "discount applicant STU-0001 expectedDiscountEligibility does not match threshold 91",
  },
];

for (const { name, mutate, expected } of cases) {
  const findings = findingsFor(mutate);
  const expectedFinding = `[${profile.profileId}] ${expected}`;
  assert(
    findings.includes(expectedFinding),
    `${name} should emit finding "${expectedFinding}", got:\n${findings.join("\n")}`,
  );
}

console.log(
  `[data-profile-lifecycle] ${cases.length} negative cases plus baseline passed.`,
);
