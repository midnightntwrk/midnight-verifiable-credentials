import path from "node:path";

import {
  loadUniversityProductionEvidencePolicies,
  UniversityProductionEvidenceRunner,
} from "@midnight-ntwrk/midnight-did-university-protocol";
import packagedPolicies from "@midnight-ntwrk/midnight-did-university-protocol/production-evidence-policies.json" with { type: "json" };

const dataRoot = process.env.UNIVERSITY_DATA_ROOT;
if (!dataRoot) throw new Error("UNIVERSITY_DATA_ROOT is required");

const loadedPolicies = loadUniversityProductionEvidencePolicies();
if (JSON.stringify(loadedPolicies) !== JSON.stringify(packagedPolicies)) {
  throw new Error("installed University policy export does not match the loader");
}

const evidence = new UniversityProductionEvidenceRunner().run({
  correlationId: "clean-consumer-e2e",
  policy: loadedPolicies[0],
  dataPaths: {
    university: path.join(dataRoot, "university.json"),
    students: path.join(dataRoot, "students.json"),
    companies: path.join(dataRoot, "companies.json"),
    mall: path.join(dataRoot, "mall.json"),
    issuanceBatches: path.join(dataRoot, "issuance-batches.json"),
    discountApplicants: path.join(dataRoot, "discount-applicants.json"),
  },
});

if (
  evidence.qualification !== "production-shaped-evidence-only" ||
  evidence.productionApproved !== false ||
  evidence.verificationV1Decisions.some(
    ({ result }) => result.proofStatus !== "valid",
  ) ||
  !evidence.verificationV1Decisions.some(
    ({ result }) => result.decisionStatus === "approved",
  ) ||
  evidence.checkpoints.length !== 3
) {
  throw new Error("clean University consumer did not produce approved local evidence");
}

console.log(
  JSON.stringify({
    qualification: evidence.qualification,
    productionApproved: evidence.productionApproved,
    profile: evidence.profile,
    openIdProfile: evidence.openIdProfile,
    decisions: evidence.verificationV1Decisions.length,
    checkpoints: evidence.checkpoints.length,
  }),
);
