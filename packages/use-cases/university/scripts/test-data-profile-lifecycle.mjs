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
  assert(
    findings.some((finding) => finding.includes(expected)),
    `${name} should emit finding containing "${expected}", got:\n${findings.join("\n")}`,
  );
}

console.log(
  `[data-profile-lifecycle] ${cases.length} negative cases plus baseline passed.`,
);
