import {
  buildUniversityDataArtifactsForProfile,
  listUniversityDataProfiles,
  validateUniversityDataProfileArtifacts,
} from "./data-profile-registry.mjs";

const profiles = listUniversityDataProfiles();

const buildArtifacts = (profile) =>
  structuredClone(buildUniversityDataArtifactsForProfile(profile));

const findingsFor = (profile, mutate) => {
  const artifacts = buildArtifacts(profile);
  mutate(artifacts, profile);
  return {
    artifacts,
    findings: validateUniversityDataProfileArtifacts(profile, artifacts),
  };
};

const expectedDiscountApplicantCount = (profile) =>
  profile.discountApplicantCount;

const cases = [
  {
    name: "missing university artifact",
    mutate: (artifacts) => {
      delete artifacts["university.json"];
    },
    expected: () => "university.json must be an object",
  },
  {
    name: "missing students artifact",
    mutate: (artifacts) => {
      delete artifacts["students.json"];
    },
    expected: () => "students.json must be an array",
  },
  {
    name: "missing mall threshold",
    mutate: (artifacts) => {
      delete artifacts["mall.json"].requestPolicy.minimumFinalGrade;
    },
    expected: () =>
      "mall.json requestPolicy.minimumFinalGrade must be a number",
  },
  {
    name: "university batch size drift",
    mutate: (artifacts) => {
      artifacts["university.json"].batchSize = 99;
    },
    expected: ({ profile }) =>
      `university.batchSize=99 does not match profile batchSize=${profile.batchSize}`,
  },
  {
    name: "student count drift",
    mutate: (artifacts) => {
      artifacts["students.json"].pop();
    },
    expected: ({ profile, artifacts }) =>
      `students.json contains ${artifacts["students.json"].length} students, expected ${profile.studentCount}`,
  },
  {
    name: "company count drift",
    mutate: (artifacts) => {
      artifacts["companies.json"].pop();
    },
    expected: ({ profile, artifacts }) =>
      `companies.json contains ${artifacts["companies.json"].length} companies, expected ${profile.expectedCompanyCount}`,
  },
  {
    name: "discount applicant count drift",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"].pop();
    },
    expected: ({ profile, artifacts }) =>
      `discount-applicants.json contains ${artifacts["discount-applicants.json"].length} applicants, expected ${expectedDiscountApplicantCount(profile)}`,
  },
  {
    name: "duplicate student fixture id",
    mutate: (artifacts) => {
      artifacts["students.json"][1].studentId =
        artifacts["students.json"][0].studentId;
    },
    expected: ({ artifacts }) =>
      `duplicate studentId ${artifacts["students.json"][0].studentId}`,
  },
  {
    name: "batch coverage gap",
    mutate: (artifacts) => {
      const lastBatch = artifacts["issuance-batches.json"].at(-1);
      lastBatch.studentIds.pop();
      lastBatch.size -= 1;
    },
    expected: ({ profile, artifacts }) =>
      `issuance batches cover ${profile.studentCount - 1} unique students, expected ${artifacts["students.json"].length}`,
  },
  {
    name: "duplicate batch membership",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][1].studentIds[0] =
        artifacts["issuance-batches.json"][0].studentIds[0];
    },
    expected: ({ artifacts }) =>
      `${artifacts["issuance-batches.json"][1].batchId} repeats student ${artifacts["issuance-batches.json"][0].studentIds[0]}`,
  },
  {
    name: "batch declared size drift",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][0].size += 1;
    },
    expected: ({ artifacts }) => {
      const batch = artifacts["issuance-batches.json"][0];
      return `${batch.batchId} declares size ${batch.size}, but contains ${batch.studentIds.length} student ids`;
    },
  },
  {
    name: "batch exceeds profile size",
    mutate: (artifacts) => {
      const batch = artifacts["issuance-batches.json"][0];
      const overflowStudentId =
        artifacts["issuance-batches.json"][1]?.studentIds[0] ?? "STU-9999";
      batch.studentIds.push(overflowStudentId);
      batch.size = batch.studentIds.length;
    },
    expected: ({ profile, artifacts }) => {
      const batch = artifacts["issuance-batches.json"][0];
      return `${batch.batchId} contains ${batch.studentIds.length} students, exceeding profile batchSize=${profile.batchSize}`;
    },
  },
  {
    name: "batch references unknown student",
    mutate: (artifacts) => {
      artifacts["issuance-batches.json"][0].studentIds[0] = "STU-9999";
    },
    expected: ({ artifacts }) =>
      `${artifacts["issuance-batches.json"][0].batchId} references unknown student STU-9999`,
  },
  {
    name: "unknown company assignment",
    mutate: (artifacts) => {
      artifacts["students.json"][0].assignedCompanyId = "company-missing";
    },
    expected: ({ artifacts }) =>
      `student ${artifacts["students.json"][0].studentId} references unknown company company-missing`,
  },
  {
    name: "stale diploma student id",
    mutate: (artifacts) => {
      artifacts["students.json"][0].diplomaClaimValues.studentId = "STU-9999";
    },
    expected: ({ artifacts }) =>
      `student ${artifacts["students.json"][0].studentId} diplomaClaimValues.studentId does not match the fixture studentId`,
  },
  {
    name: "unknown discount applicant",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].studentId = "STU-9999";
    },
    expected: () =>
      "discount applicant STU-9999 does not exist in students.json",
  },
  {
    name: "stale discount full name",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].fullName = "Stale Name";
    },
    expected: ({ artifacts }) =>
      `discount applicant ${artifacts["discount-applicants.json"][0].studentId} has stale fullName`,
  },
  {
    name: "stale discount final grade",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].finalGrade -= 1;
    },
    expected: ({ artifacts }) =>
      `discount applicant ${artifacts["discount-applicants.json"][0].studentId} has stale finalGrade`,
  },
  {
    name: "stale discount eligibility",
    mutate: (artifacts) => {
      artifacts["discount-applicants.json"][0].expectedDiscountEligibility =
        !artifacts["discount-applicants.json"][0].expectedDiscountEligibility;
    },
    expected: ({ artifacts }) =>
      `discount applicant ${artifacts["discount-applicants.json"][0].studentId} expectedDiscountEligibility does not match threshold ${artifacts["mall.json"].requestPolicy.minimumFinalGrade}`,
  },
];

const failures = [];

try {
  buildUniversityDataArtifactsForProfile({
    studentCount: 1,
    batchSize: 1,
    discountApplicantCount: 2,
  });
  failures.push(
    "over-declared discount applicant profile should fail instead of clamping",
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (
    !message.includes("Cannot generate 2 discount applicants for 1 students")
  ) {
    failures.push(
      `over-declared discount applicant profile emitted unexpected error: ${message}`,
    );
  }
}

for (const profile of profiles) {
  const baselineFindings = validateUniversityDataProfileArtifacts(
    profile,
    buildArtifacts(profile),
  );
  if (baselineFindings.length > 0) {
    failures.push(
      `[${profile.profileId}] baseline should be lifecycle-valid before mutation, got:\n${baselineFindings.join("\n")}`,
    );
  }

  for (const { name, mutate, expected } of cases) {
    const { artifacts, findings } = findingsFor(profile, mutate);
    const expectedFinding = `[${profile.profileId}] ${expected({
      profile,
      artifacts,
    })}`;
    if (!findings.includes(expectedFinding)) {
      failures.push(
        `[${profile.profileId}] ${name} should emit finding "${expectedFinding}", got:\n${findings.join("\n")}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(
    `[data-profile-lifecycle] ${failures.length} validation self-test failure(s):`,
  );
  for (const failure of failures) {
    console.error(`\n- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `[data-profile-lifecycle] ${cases.length} negative cases across ${profiles.length} profiles plus baselines passed.`,
);
