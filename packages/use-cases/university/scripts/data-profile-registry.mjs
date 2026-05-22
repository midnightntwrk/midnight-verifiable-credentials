import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveUniversityRequestPolicyPreset } from "./request-policy-presets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const universityRootDir = path.resolve(__dirname, "..");
const staticCompanionJsonFiles = new Set(["request-policy-presets.json"]);
const dataProfilesMarkdownPath = path.resolve(
  universityRootDir,
  "data",
  "data-profiles.md",
);

const universityDataProfiles = {
  "readable-10": {
    profileId: "readable-10",
    studentCount: 10,
    batchSize: 5,
    companySet: "standard",
    discountApplicantCount: 5,
    outputDir: "data",
    purpose: "Human-readable BDD and transcript narrative profile.",
  },
  "cohort-30": {
    profileId: "cohort-30",
    studentCount: 30,
    batchSize: 10,
    companySet: "expanded",
    discountApplicantCount: 10,
    outputDir: "data/cohort-30",
    purpose:
      "Intermediate rich cohort for readable throughput, diversity, and sampled transcript reporting.",
  },
  "stress-100": {
    profileId: "stress-100",
    studentCount: 100,
    batchSize: 20,
    companySet: "standard",
    discountApplicantCount: 5,
    outputDir: "data/stress-100",
    purpose: "Throughput-oriented protocol stress profile.",
  },
};

const companyCountForProfile = (profile) =>
  profile.companySet === "expanded" ? 6 : 3;

export const listUniversityDataProfiles = () =>
  Object.values(universityDataProfiles).map((profile) => ({
    ...profile,
    expectedCompanyCount: companyCountForProfile(profile),
  }));

export const resolveUniversityDataProfile = (profileId) => {
  const profile = universityDataProfiles[profileId];
  if (!profile) {
    const supported = Object.keys(universityDataProfiles).sort().join(", ");
    throw new Error(
      `Unknown university data profile ${profileId}. Supported profiles: ${supported}`,
    );
  }
  return {
    ...profile,
    expectedCompanyCount: companyCountForProfile(profile),
    absoluteOutputDir: path.resolve(universityRootDir, profile.outputDir),
  };
};

const firstNames = [
  "Ada",
  "Ben",
  "Cara",
  "Dion",
  "Ella",
  "Finn",
  "Gia",
  "Hugo",
  "Iris",
  "Jude",
  "Kira",
  "Liam",
  "Maya",
  "Nico",
  "Oona",
  "Pia",
  "Quin",
  "Rhea",
  "Sami",
  "Tara",
];
const lastNames = [
  "Avery",
  "Bennett",
  "Carter",
  "Diaz",
  "Edwards",
  "Foster",
  "Gray",
  "Hayes",
  "Irwin",
  "Jordan",
];
const awards = [
  "BSc Computer Science",
  "BSc Data Science",
  "BEng Electrical Eng",
  "BA Business Analytics",
];
const faculties = ["Engineering", "Science", "Engineering", "Business"];
const expandedAwards = [
  ...awards,
  "BSc Cybersecurity",
  "BSc Applied Mathematics",
  "BEng Robotics",
  "BA Digital Economics",
];
// Keep faculty positions aligned with expandedAwards so generated claims stay
// deterministic while several awards intentionally share a faculty label.
const expandedFaculties = [
  ...faculties,
  "Engineering",
  "Science",
  "Engineering",
  "Business",
];
const roles = [
  "junior-platform-engineer",
  "data-analyst-trainee",
  "robotics-software-intern",
  "business-operations-analyst",
];
const expandedRoles = [
  ...roles,
  "security-analyst-associate",
  "quantitative-research-intern",
  "robotics-controls-engineer",
  "digital-economics-analyst",
];
const gradeOverrides = [98, 94, 91, 90, 72];

const honorsCodeForGrade = (grade) => {
  if (grade >= 95) return "high-distinction";
  if (grade >= 90) return "distinction";
  if (grade >= 80) return "merit";
  if (grade >= 70) return "pass";
  return "ordinary";
};

const gradeForIndex = (index) => {
  if (index < gradeOverrides.length) {
    return gradeOverrides[index];
  }
  return 65 + ((index * 7) % 36);
};

export const buildUniversityDataArtifacts = ({ studentCount, batchSize }) => {
  return buildUniversityDataArtifactsForProfile({
    studentCount,
    batchSize,
    companySet: "standard",
    discountApplicantCount: 5,
  });
};

export const buildUniversityDataArtifactsForProfile = ({
  studentCount,
  batchSize,
  companySet = "standard",
  discountApplicantCount = 5,
}) => {
  const northwindPolicyPreset = resolveUniversityRequestPolicyPreset(
    "job-application-grade-and-award",
  );
  const blueOceanPolicyPreset = resolveUniversityRequestPolicyPreset(
    "job-application-honors-without-grade",
  );
  const pioneerPolicyPreset = resolveUniversityRequestPolicyPreset(
    "job-application-credits-and-grade",
  );
  const mallPolicyPreset = resolveUniversityRequestPolicyPreset(
    "mall-discount-grade-over-90",
  );
  const university = {
    universityId: "uni-example-001",
    universityName: "Example University",
    issuerDidUrl: "did:midnight:university:example-university",
    issuerMethodId: "#issuer-key-1",
    credentialFamilyPackage:
      "@midnight-ntwrk/midnight-did-credentials-university-diploma",
    schemaId: "uni-diploma:v1",
    holderBindingProfile: "ExplicitHolderBinding",
    statusModel: "NoStatusBinding",
    isRevocable: false,
    graduationYear: 2030,
    graduationMonth: 6,
    supportsBatchIssuance: true,
    batchSize,
    claimEncoding: {
      stringLikeFields:
        "fixed-width Bytes<N> in Compact, canonical JSON strings in scenario data",
      integerFields: "Uint<n> in Compact, JSON numbers in scenario data",
      fieldLengths: {
        diplomaId: 32,
        studentId: 16,
        graduateName: 32,
        universityName: 32,
        facultyName: 32,
        awardName: 32,
        honorsCode: 16,
      },
    },
  };

  const standardCompanies = [
    {
      companyId: "company-northwind-robotics",
      companyName: "Northwind Robotics",
      verifierDidUrl: "did:midnight:company:northwind-robotics",
      verifierMethodId: "#verifier-key-1",
      hiringStream: "robotics-software",
      requestPresetId: northwindPolicyPreset.presetId,
      requestPresetTitle: northwindPolicyPreset.title,
      requestPolicyPurpose: northwindPolicyPreset.purpose,
      requestPolicy: northwindPolicyPreset.requestPolicy,
    },
    {
      companyId: "company-blue-ocean-analytics",
      companyName: "Blue Ocean Analytics",
      verifierDidUrl: "did:midnight:company:blue-ocean-analytics",
      verifierMethodId: "#verifier-key-1",
      hiringStream: "data-analytics",
      requestPresetId: blueOceanPolicyPreset.presetId,
      requestPresetTitle: blueOceanPolicyPreset.title,
      requestPolicyPurpose: blueOceanPolicyPreset.purpose,
      requestPolicy: blueOceanPolicyPreset.requestPolicy,
    },
    {
      companyId: "company-pioneer-systems",
      companyName: "Pioneer Systems",
      verifierDidUrl: "did:midnight:company:pioneer-systems",
      verifierMethodId: "#verifier-key-1",
      hiringStream: "platform-engineering",
      requestPresetId: pioneerPolicyPreset.presetId,
      requestPresetTitle: pioneerPolicyPreset.title,
      requestPolicyPurpose: pioneerPolicyPreset.purpose,
      requestPolicy: pioneerPolicyPreset.requestPolicy,
    },
  ];
  const companies =
    companySet === "expanded"
      ? [
          ...standardCompanies,
          {
            companyId: "company-copper-bridge-security",
            companyName: "Copper Bridge Security",
            verifierDidUrl: "did:midnight:company:copper-bridge-security",
            verifierMethodId: "#verifier-key-1",
            hiringStream: "security-engineering",
            requestPresetId: blueOceanPolicyPreset.presetId,
            requestPresetTitle: blueOceanPolicyPreset.title,
            requestPolicyPurpose: blueOceanPolicyPreset.purpose,
            requestPolicy: blueOceanPolicyPreset.requestPolicy,
          },
          {
            companyId: "company-summit-quant-labs",
            companyName: "Summit Quant Labs",
            verifierDidUrl: "did:midnight:company:summit-quant-labs",
            verifierMethodId: "#verifier-key-1",
            hiringStream: "quantitative-research",
            requestPresetId: pioneerPolicyPreset.presetId,
            requestPresetTitle: pioneerPolicyPreset.title,
            requestPolicyPurpose: pioneerPolicyPreset.purpose,
            requestPolicy: pioneerPolicyPreset.requestPolicy,
          },
          {
            companyId: "company-harbor-product-studio",
            companyName: "Harbor Product Studio",
            verifierDidUrl: "did:midnight:company:harbor-product-studio",
            verifierMethodId: "#verifier-key-1",
            hiringStream: "product-analytics",
            requestPresetId: northwindPolicyPreset.presetId,
            requestPresetTitle: northwindPolicyPreset.title,
            requestPolicyPurpose: northwindPolicyPreset.purpose,
            requestPolicy: northwindPolicyPreset.requestPolicy,
          },
        ]
      : standardCompanies;
  const selectedAwards = companySet === "expanded" ? expandedAwards : awards;
  const selectedFaculties =
    companySet === "expanded" ? expandedFaculties : faculties;
  const selectedRoles = companySet === "expanded" ? expandedRoles : roles;

  const mall = {
    mallId: "mall-student-square",
    mallName: "Student Square Mall",
    verifierDidUrl: "did:midnight:mall:student-square",
    verifierMethodId: "#verifier-key-1",
    offerId: "discount-grade-over-90",
    requestPresetId: mallPolicyPreset.presetId,
    requestPresetTitle: mallPolicyPreset.title,
    requestPolicyPurpose: mallPolicyPreset.purpose,
    requestPolicy: mallPolicyPreset.requestPolicy,
  };

  const students = Array.from({ length: studentCount }, (_, index) => {
    const ordinal = String(index + 1).padStart(4, "0");
    const firstName = firstNames[index % firstNames.length];
    const lastName =
      lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const fullName = `${firstName} ${lastName} ${ordinal}`;
    const awardIndex = index % selectedAwards.length;
    const finalGrade = gradeForIndex(index);
    const company = companies[index % companies.length];
    const diplomaId = `DIP-2030-${ordinal}`;
    const studentId = `STU-${ordinal}`;

    return {
      studentId,
      fullName,
      holderDidUrl: `did:midnight:student:${ordinal}`,
      holderMethodId: "#holder-key-1",
      graduationEligible: true,
      assignedCompanyId: company.companyId,
      requestedJobRole: selectedRoles[index % selectedRoles.length],
      diplomaClaimValues: {
        diplomaId,
        studentId,
        graduateName: fullName,
        universityName: university.universityName,
        facultyName: selectedFaculties[awardIndex],
        awardName: selectedAwards[awardIndex],
        honorsCode: honorsCodeForGrade(finalGrade),
        graduationYear: university.graduationYear,
        graduationMonth: university.graduationMonth,
        finalGrade,
        creditsEarned:
          companySet === "expanded" ? 180 + (awardIndex % 3) * 15 : 180,
      },
    };
  });

  const issuanceBatches = [];
  for (let index = 0; index < students.length; index += university.batchSize) {
    const batchStudents = students.slice(index, index + university.batchSize);
    issuanceBatches.push({
      batchId: `batch-${String(issuanceBatches.length + 1).padStart(2, "0")}`,
      studentIds: batchStudents.map((student) => student.studentId),
      size: batchStudents.length,
    });
  }

  const discountApplicants = students
    .slice(0, Math.min(discountApplicantCount, students.length))
    .map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      finalGrade: student.diplomaClaimValues.finalGrade,
      expectedDiscountEligibility:
        student.diplomaClaimValues.finalGrade >=
        mall.requestPolicy.minimumFinalGrade,
      explanation:
        student.diplomaClaimValues.finalGrade >=
        mall.requestPolicy.minimumFinalGrade
          ? "grade is at least 91"
          : "grade does not satisfy the mall threshold",
    }));

  return {
    "university.json": university,
    "companies.json": companies,
    "mall.json": mall,
    "students.json": students,
    "issuance-batches.json": issuanceBatches,
    "discount-applicants.json": discountApplicants,
  };
};

export const writeUniversityDataArtifacts = (targetDir, artifacts) => {
  mkdirSync(targetDir, { recursive: true });
  for (const [filename, value] of Object.entries(artifacts)) {
    writeFileSync(
      path.join(targetDir, filename),
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
  }
};

export const checkUniversityDataArtifacts = (targetDir, artifacts) => {
  let mismatches = 0;
  const expectedFiles = Object.keys(artifacts).sort();
  const committedFiles = readdirSync(targetDir)
    .filter(
      (filename) =>
        filename.endsWith(".json") && !staticCompanionJsonFiles.has(filename),
    )
    .sort();

  if (expectedFiles.join("\n") !== committedFiles.join("\n")) {
    console.error(
      `University use-case data file set does not match the generator output in ${targetDir}`,
    );
    mismatches += 1;
  }

  for (const filename of expectedFiles) {
    const committed = readFileSync(path.join(targetDir, filename), "utf8");
    const regenerated = `${JSON.stringify(artifacts[filename], null, 2)}\n`;
    if (committed !== regenerated) {
      console.error(
        `University use-case data drift detected in ${path.join(targetDir, filename)}`,
      );
      mismatches += 1;
    }
  }

  return mismatches;
};

export const validateUniversityDataProfileArtifacts = (profile, artifacts) => {
  const findings = [];
  const addFinding = (message) =>
    findings.push(`[${profile.profileId}] ${message}`);
  const university = artifacts["university.json"];
  const companies = artifacts["companies.json"];
  const mall = artifacts["mall.json"];
  const students = artifacts["students.json"];
  const issuanceBatches = artifacts["issuance-batches.json"];
  const discountApplicants = artifacts["discount-applicants.json"];
  const expectedCompanyCount = companyCountForProfile(profile);
  const expectedDiscountApplicantCount = Math.min(
    profile.discountApplicantCount,
    profile.studentCount,
  );

  if (university.batchSize !== profile.batchSize) {
    addFinding(
      `university.batchSize=${university.batchSize} does not match profile batchSize=${profile.batchSize}`,
    );
  }
  if (students.length !== profile.studentCount) {
    addFinding(
      `students.json contains ${students.length} students, expected ${profile.studentCount}`,
    );
  }
  if (companies.length !== expectedCompanyCount) {
    addFinding(
      `companies.json contains ${companies.length} companies, expected ${expectedCompanyCount}`,
    );
  }
  if (discountApplicants.length !== expectedDiscountApplicantCount) {
    addFinding(
      `discount-applicants.json contains ${discountApplicants.length} applicants, expected ${expectedDiscountApplicantCount}`,
    );
  }

  const companyIds = new Set(companies.map((company) => company.companyId));
  const studentIds = new Set();
  for (const student of students) {
    if (studentIds.has(student.studentId)) {
      addFinding(`duplicate studentId ${student.studentId}`);
    }
    studentIds.add(student.studentId);
    if (!companyIds.has(student.assignedCompanyId)) {
      addFinding(
        `student ${student.studentId} references unknown company ${student.assignedCompanyId}`,
      );
    }
    if (student.diplomaClaimValues?.studentId !== student.studentId) {
      addFinding(
        `student ${student.studentId} diplomaClaimValues.studentId does not match the fixture studentId`,
      );
    }
  }

  const coveredStudentIds = new Set();
  for (const batch of issuanceBatches) {
    if (batch.size !== batch.studentIds.length) {
      addFinding(
        `${batch.batchId} declares size ${batch.size}, but contains ${batch.studentIds.length} student ids`,
      );
    }
    if (batch.studentIds.length > profile.batchSize) {
      addFinding(
        `${batch.batchId} contains ${batch.studentIds.length} students, exceeding profile batchSize=${profile.batchSize}`,
      );
    }
    for (const studentId of batch.studentIds) {
      if (!studentIds.has(studentId)) {
        addFinding(`${batch.batchId} references unknown student ${studentId}`);
      }
      if (coveredStudentIds.has(studentId)) {
        addFinding(`${batch.batchId} repeats student ${studentId}`);
      }
      coveredStudentIds.add(studentId);
    }
  }
  if (coveredStudentIds.size !== studentIds.size) {
    addFinding(
      `issuance batches cover ${coveredStudentIds.size} unique students, expected ${studentIds.size}`,
    );
  }

  const discountThreshold = mall.requestPolicy.minimumFinalGrade;
  for (const applicant of discountApplicants) {
    const student = students.find(
      (candidate) => candidate.studentId === applicant.studentId,
    );
    if (!student) {
      addFinding(
        `discount applicant ${applicant.studentId} does not exist in students.json`,
      );
      continue;
    }
    if (applicant.fullName !== student.fullName) {
      addFinding(
        `discount applicant ${applicant.studentId} has stale fullName`,
      );
    }
    if (applicant.finalGrade !== student.diplomaClaimValues.finalGrade) {
      addFinding(
        `discount applicant ${applicant.studentId} has stale finalGrade`,
      );
    }
    const expectedEligibility =
      student.diplomaClaimValues.finalGrade >= discountThreshold;
    if (applicant.expectedDiscountEligibility !== expectedEligibility) {
      addFinding(
        `discount applicant ${applicant.studentId} expectedDiscountEligibility does not match threshold ${discountThreshold}`,
      );
    }
  }

  return findings;
};

export const checkUniversityDataProfileLifecycle = (profile, artifacts) => {
  const findings = validateUniversityDataProfileArtifacts(profile, artifacts);
  for (const finding of findings) {
    console.error(finding);
  }
  return findings.length;
};

export const summarizeUniversityDataProfile = (profile, artifacts) => {
  const students = artifacts["students.json"];
  const companies = artifacts["companies.json"];
  const issuanceBatches = artifacts["issuance-batches.json"];
  const discountApplicants = artifacts["discount-applicants.json"];
  const acceptedDiscountApplicants = discountApplicants.filter(
    (applicant) => applicant.expectedDiscountEligibility,
  ).length;

  return {
    profileId: profile.profileId,
    purpose: profile.purpose,
    outputDir: profile.outputDir,
    studentCount: students.length,
    batchSize: profile.batchSize,
    issuanceBatchCount: issuanceBatches.length,
    companySet: profile.companySet,
    companyCount: companies.length,
    expectedCompanyCount: companyCountForProfile(profile),
    discountApplicantCount: discountApplicants.length,
    acceptedDiscountApplicants,
    rejectedDiscountApplicants:
      discountApplicants.length - acceptedDiscountApplicants,
  };
};

const renderProfileSummary = (summary) =>
  [
    `## \`${summary.profileId}\``,
    "",
    `- Purpose: ${summary.purpose}`,
    `- Fixture directory: \`${summary.outputDir}\``,
    `- Students: ${summary.studentCount}`,
    `- Issuance batches: ${summary.issuanceBatchCount} of up to ${summary.batchSize} students`,
    `- Companies: ${summary.companyCount} (\`${summary.companySet}\` set)`,
    `- Discount applicants: ${summary.discountApplicantCount} (${summary.acceptedDiscountApplicants} accepted, ${summary.rejectedDiscountApplicants} rejected)`,
    "",
  ].join("\n");

export const renderUniversityDataProfilesMarkdown = () => {
  const lines = [
    "# University Data Profiles",
    "",
    "Status: generated from `data-profile-registry.mjs` and the deterministic fixture generator.",
    "",
    "Regenerate with:",
    "",
    "```bash",
    "npm run update:university-data-profiles",
    "npm run check:university-data-profiles",
    "```",
    "",
  ];

  for (const profile of listUniversityDataProfiles()) {
    const resolved = resolveUniversityDataProfile(profile.profileId);
    const artifacts = buildUniversityDataArtifactsForProfile(resolved);
    lines.push(
      renderProfileSummary(summarizeUniversityDataProfile(resolved, artifacts)),
    );
  }

  return lines.join("\n");
};

export const updateUniversityDataProfilesMarkdown = () => {
  writeFileSync(
    dataProfilesMarkdownPath,
    renderUniversityDataProfilesMarkdown(),
    "utf8",
  );
};

export const checkUniversityDataProfilesMarkdown = () => {
  const expected = renderUniversityDataProfilesMarkdown();
  let actual;
  try {
    actual = readFileSync(dataProfilesMarkdownPath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ENOENT") {
        throw new Error(
          "Missing packages/use-cases/university/data/data-profiles.md; run `npm run update:university-data-profiles`.",
        );
      }
    }
    throw error;
  }
  if (actual !== expected) {
    throw new Error(
      "packages/use-cases/university/data/data-profiles.md is out of sync; run `npm run update:university-data-profiles`.",
    );
  }
};

export const universityProfileDataPaths = (profileId) => {
  const profile = resolveUniversityDataProfile(profileId);
  return {
    university: path.join(profile.absoluteOutputDir, "university.json"),
    students: path.join(profile.absoluteOutputDir, "students.json"),
    companies: path.join(profile.absoluteOutputDir, "companies.json"),
    mall: path.join(profile.absoluteOutputDir, "mall.json"),
    issuanceBatches: path.join(
      profile.absoluteOutputDir,
      "issuance-batches.json",
    ),
    discountApplicants: path.join(
      profile.absoluteOutputDir,
      "discount-applicants.json",
    ),
  };
};
