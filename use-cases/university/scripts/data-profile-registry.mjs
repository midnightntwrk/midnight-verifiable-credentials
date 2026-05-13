import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveUniversityRequestPolicyPreset } from "./request-policy-presets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const universityRootDir = path.resolve(__dirname, "..");
const staticCompanionJsonFiles = new Set(["request-policy-presets.json"]);

const universityDataProfiles = {
  "readable-10": {
    profileId: "readable-10",
    studentCount: 10,
    batchSize: 5,
    outputDir: "data",
    purpose: "Human-readable BDD and transcript narrative profile.",
  },
  "stress-100": {
    profileId: "stress-100",
    studentCount: 100,
    batchSize: 20,
    outputDir: "data/stress-100",
    purpose: "Throughput-oriented protocol stress profile.",
  },
};

export const listUniversityDataProfiles = () =>
  Object.values(universityDataProfiles).map((profile) => ({ ...profile }));

export const resolveUniversityDataProfile = (profileId) => {
  const profile = universityDataProfiles[profileId];
  if (!profile) {
    const supported = Object.keys(universityDataProfiles).sort().join(", ");
    throw new Error(`Unknown university data profile ${profileId}. Supported profiles: ${supported}`);
  }
  return {
    ...profile,
    absoluteOutputDir: path.resolve(universityRootDir, profile.outputDir),
  };
};

const firstNames = [
  "Ada", "Ben", "Cara", "Dion", "Ella", "Finn", "Gia", "Hugo", "Iris", "Jude",
  "Kira", "Liam", "Maya", "Nico", "Oona", "Pia", "Quin", "Rhea", "Sami", "Tara",
];
const lastNames = [
  "Avery", "Bennett", "Carter", "Diaz", "Edwards", "Foster", "Gray", "Hayes", "Irwin", "Jordan",
];
const awards = [
  "BSc Computer Science",
  "BSc Data Science",
  "BEng Electrical Eng",
  "BA Business Analytics",
];
const faculties = ["Engineering", "Science", "Engineering", "Business"];
const roles = [
  "junior-platform-engineer",
  "data-analyst-trainee",
  "robotics-software-intern",
  "business-operations-analyst",
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
    credentialFamilyPackage: "@midnight-ntwrk/midnight-did-credentials-university-diploma",
    schemaId: "uni-diploma:v1",
    holderBindingProfile: "ExplicitHolderBinding",
    statusModel: "NoStatusBinding",
    isRevocable: false,
    graduationYear: 2030,
    graduationMonth: 6,
    supportsBatchIssuance: true,
    batchSize,
    claimEncoding: {
      stringLikeFields: "fixed-width Bytes<N> in Compact, canonical JSON strings in scenario data",
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

  const companies = [
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
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const fullName = `${firstName} ${lastName} ${ordinal}`;
    const awardIndex = index % awards.length;
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
      requestedJobRole: roles[index % roles.length],
      diplomaClaimValues: {
        diplomaId,
        studentId,
        graduateName: fullName,
        universityName: university.universityName,
        facultyName: faculties[awardIndex],
        awardName: awards[awardIndex],
        honorsCode: honorsCodeForGrade(finalGrade),
        graduationYear: university.graduationYear,
        graduationMonth: university.graduationMonth,
        finalGrade,
        creditsEarned: 180,
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

  const discountApplicants = students.slice(0, Math.min(5, students.length)).map((student) => ({
    studentId: student.studentId,
    fullName: student.fullName,
    finalGrade: student.diplomaClaimValues.finalGrade,
    expectedDiscountEligibility:
      student.diplomaClaimValues.finalGrade >= mall.requestPolicy.minimumFinalGrade,
    explanation:
      student.diplomaClaimValues.finalGrade >= mall.requestPolicy.minimumFinalGrade
        ? "grade is strictly greater than 90"
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
    writeFileSync(path.join(targetDir, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
    console.error(`University use-case data file set does not match the generator output in ${targetDir}`);
    mismatches += 1;
  }

  for (const filename of expectedFiles) {
    const committed = readFileSync(path.join(targetDir, filename), "utf8");
    const regenerated = `${JSON.stringify(artifacts[filename], null, 2)}\n`;
    if (committed !== regenerated) {
      console.error(`University use-case data drift detected in ${path.join(targetDir, filename)}`);
      mismatches += 1;
    }
  }

  return mismatches;
};

export const universityProfileDataPaths = (profileId) => {
  const profile = resolveUniversityDataProfile(profileId);
  return {
    university: path.join(profile.absoluteOutputDir, "university.json"),
    students: path.join(profile.absoluteOutputDir, "students.json"),
    companies: path.join(profile.absoluteOutputDir, "companies.json"),
    mall: path.join(profile.absoluteOutputDir, "mall.json"),
    issuanceBatches: path.join(profile.absoluteOutputDir, "issuance-batches.json"),
    discountApplicants: path.join(profile.absoluteOutputDir, "discount-applicants.json"),
  };
};
