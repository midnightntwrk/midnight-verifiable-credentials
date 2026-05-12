import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const checkMode = process.argv.includes("--check");

const readStringArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return fallback;
  }
  return process.argv[index + 1];
};

const readIntegerArg = (name, fallback) => {
  const raw = readStringArg(name, String(fallback));
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${name}: ${raw}`);
  }
  return parsed;
};

const outputDirArg = readStringArg("--output-dir", "data");
const dataDir = path.isAbsolute(outputDirArg)
  ? outputDirArg
  : path.resolve(rootDir, outputDirArg);
const studentCount = readIntegerArg("--student-count", 10);
const batchSize = readIntegerArg("--batch-size", 5);

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
      honorsCode: 16
    }
  }
};

const companies = [
  {
    companyId: "company-northwind-robotics",
    companyName: "Northwind Robotics",
    verifierDidUrl: "did:midnight:company:northwind-robotics",
    verifierMethodId: "#verifier-key-1",
    hiringStream: "robotics-software",
    requestPolicy: {
      requireGraduateNameDisclosure: true,
      requireUniversityNameDisclosure: true,
      requireAwardNameDisclosure: true,
      requireGraduationYearDisclosure: true,
      requireFinalGradeDisclosure: true
    }
  },
  {
    companyId: "company-blue-ocean-analytics",
    companyName: "Blue Ocean Analytics",
    verifierDidUrl: "did:midnight:company:blue-ocean-analytics",
    verifierMethodId: "#verifier-key-1",
    hiringStream: "data-analytics",
    requestPolicy: {
      requireGraduateNameDisclosure: true,
      requireUniversityNameDisclosure: true,
      requireAwardNameDisclosure: true,
      requireGraduationYearDisclosure: true,
      requireHonorsCodeDisclosure: true,
      requireFinalGradeDisclosure: false
    }
  },
  {
    companyId: "company-pioneer-systems",
    companyName: "Pioneer Systems",
    verifierDidUrl: "did:midnight:company:pioneer-systems",
    verifierMethodId: "#verifier-key-1",
    hiringStream: "platform-engineering",
    requestPolicy: {
      requireGraduateNameDisclosure: true,
      requireUniversityNameDisclosure: true,
      requireAwardNameDisclosure: true,
      requireGraduationYearDisclosure: true,
      requireCreditsEarnedDisclosure: true,
      requireFinalGradeDisclosure: true
    }
  }
];

const mall = {
  mallId: "mall-student-square",
  mallName: "Student Square Mall",
  verifierDidUrl: "did:midnight:mall:student-square",
  verifierMethodId: "#verifier-key-1",
  offerId: "discount-grade-over-90",
  requestPolicy: {
    requireUniversityNameDisclosure: true,
    requireFinalGradeDisclosure: true,
    enforceMinimumFinalGrade: true,
    minimumFinalGrade: 91
  }
};

const firstNames = [
  "Ada", "Ben", "Cara", "Dion", "Ella", "Finn", "Gia", "Hugo", "Iris", "Jude",
  "Kira", "Liam", "Maya", "Nico", "Oona", "Pia", "Quin", "Rhea", "Sami", "Tara"
];
const lastNames = [
  "Avery", "Bennett", "Carter", "Diaz", "Edwards", "Foster", "Gray", "Hayes", "Irwin", "Jordan"
];
const awards = [
  "BSc Computer Science",
  "BSc Data Science",
  "BEng Electrical Eng",
  "BA Business Analytics"
];
const faculties = ["Engineering", "Science", "Engineering", "Business"];
const roles = [
  "junior-platform-engineer",
  "data-analyst-trainee",
  "robotics-software-intern",
  "business-operations-analyst"
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
      creditsEarned: 180
    }
  };
});

const issuanceBatches = [];
for (let index = 0; index < students.length; index += university.batchSize) {
  const batchStudents = students.slice(index, index + university.batchSize);
  issuanceBatches.push({
    batchId: `batch-${String(issuanceBatches.length + 1).padStart(2, "0")}`,
    studentIds: batchStudents.map((student) => student.studentId),
    size: batchStudents.length
  });
}

const discountApplicants = students.slice(0, Math.min(5, students.length)).map((student) => ({
  studentId: student.studentId,
  fullName: student.fullName,
  finalGrade: student.diplomaClaimValues.finalGrade,
  expectedDiscountEligibility:
    student.diplomaClaimValues.finalGrade >=
    mall.requestPolicy.minimumFinalGrade,
  explanation:
    student.diplomaClaimValues.finalGrade >=
    mall.requestPolicy.minimumFinalGrade
      ? "grade is strictly greater than 90"
      : "grade does not satisfy the mall threshold"
}));

const dataArtifacts = {
  "university.json": university,
  "companies.json": companies,
  "mall.json": mall,
  "students.json": students,
  "issuance-batches.json": issuanceBatches,
  "discount-applicants.json": discountApplicants
};

const writeJson = (targetDir, filename, value) => {
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(path.join(targetDir, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const writeAllDataArtifacts = (targetDir) => {
  for (const [filename, value] of Object.entries(dataArtifacts)) {
    writeJson(targetDir, filename, value);
  }
};

if (checkMode) {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "university-use-case-data-"));
  let mismatches = 0;

  try {
    writeAllDataArtifacts(tempDir);

    const expectedFiles = Object.keys(dataArtifacts).sort();
    const committedFiles = readdirSync(dataDir).sort();

    if (expectedFiles.join("\n") !== committedFiles.join("\n")) {
      console.error("University use-case data file set does not match the generator output");
      mismatches += 1;
    }

    for (const filename of expectedFiles) {
      const committed = readFileSync(path.join(dataDir, filename), "utf8");
      const regenerated = readFileSync(path.join(tempDir, filename), "utf8");
      if (committed !== regenerated) {
        console.error(`University use-case data drift detected in ${filename}`);
        mismatches += 1;
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  if (mismatches > 0) {
    process.exit(1);
  }
} else {
  writeAllDataArtifacts(dataDir);
}
