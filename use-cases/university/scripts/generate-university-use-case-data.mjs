import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
mkdirSync(dataDir, { recursive: true });

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
  batchSize: 20,
  claimEncoding: {
    stringLikeFields: "fixed-width Bytes<N> in Compact, canonical JSON strings in scenario data",
    integerFields: "Uint<n> in Compact, JSON numbers in scenario data"
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
  minimumFinalGrade: 91,
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

const students = Array.from({ length: 100 }, (_, index) => {
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

const discountApplicants = students.slice(0, 5).map((student) => ({
  studentId: student.studentId,
  fullName: student.fullName,
  finalGrade: student.diplomaClaimValues.finalGrade,
  expectedDiscountEligibility: student.diplomaClaimValues.finalGrade >= mall.minimumFinalGrade,
  explanation:
    student.diplomaClaimValues.finalGrade >= mall.minimumFinalGrade
      ? "grade is strictly greater than 90"
      : "grade does not satisfy the mall threshold"
}));

const writeJson = (filename, value) => {
  writeFileSync(path.join(dataDir, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

writeJson("university.json", university);
writeJson("companies.json", companies);
writeJson("mall.json", mall);
writeJson("students.json", students);
writeJson("issuance-batches.json", issuanceBatches);
writeJson("discount-applicants.json", discountApplicants);
