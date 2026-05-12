import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { UniversityProtocolFlowRunner } from "../dist/testing.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const stressDataDir = path.join(
  repoRoot,
  "use-cases",
  "university",
  "data",
  "stress-100",
);

const targetDir = path.join(
  repoRoot,
  "use-cases",
  "university",
  "protocol",
  "target",
  "stress-100",
);

const dataPaths = {
  university: path.relative(repoRoot, path.join(stressDataDir, "university.json")),
  students: path.relative(repoRoot, path.join(stressDataDir, "students.json")),
  companies: path.relative(repoRoot, path.join(stressDataDir, "companies.json")),
  mall: path.relative(repoRoot, path.join(stressDataDir, "mall.json")),
  issuanceBatches: path.relative(
    repoRoot,
    path.join(stressDataDir, "issuance-batches.json"),
  ),
  discountApplicants: path.relative(
    repoRoot,
    path.join(stressDataDir, "discount-applicants.json"),
  ),
};

const startedAt = performance.now();
const runner = new UniversityProtocolFlowRunner({ dataPaths });
const result = runner.runAll();
const wallClockMs = performance.now() - startedAt;

const summary = {
  dataset: {
    studentCount: runner.students.length,
    companyCount: runner.companies.length,
    discountApplicantCount: runner.discountApplicants.length,
    batchCount: runner.issuanceBatches.length,
    batchSize: runner.university.batchSize,
  },
  counts: {
    issuanceRequests: result.issuance.requestCount,
    issuanceResults: result.issuance.resultCount,
    jobApplicationRequests: result.jobApplications.requestCount,
    jobApplicationSubmissions: result.jobApplications.submissionCount,
    jobApplicationResults: result.jobApplications.resultCount,
    discountRequests: result.discounts.requestCount,
    discountSubmissions: result.discounts.submissionCount,
    discountResults: result.discounts.resultCount,
    transcriptEntries: result.transcript.length,
  },
  outcomes: {
    acceptedJobApplications: result.jobApplications.acceptedCount,
    companyAcceptedCounts: result.jobApplications.companyAcceptedCounts,
    acceptedDiscounts: result.discounts.acceptedCount,
    rejectedDiscounts: result.discounts.rejectedCount,
  },
  timingsMs: {
    issuance: result.metrics.issuanceMs,
    jobApplications: result.metrics.jobApplicationsMs,
    discounts: result.metrics.discountsMs,
    runnerTotal: result.metrics.totalMs,
    wallClock: wallClockMs,
  },
  throughput: {
    issuanceCredentialsPerSecond:
      result.metrics.issuanceMs > 0
        ? result.issuance.resultCount / (result.metrics.issuanceMs / 1000)
        : result.issuance.resultCount,
    jobApplicationsPerSecond:
      result.metrics.jobApplicationsMs > 0
        ? result.jobApplications.resultCount /
          (result.metrics.jobApplicationsMs / 1000)
        : result.jobApplications.resultCount,
    transcriptEntriesPerSecond:
      wallClockMs > 0 ? result.transcript.length / (wallClockMs / 1000) : 0,
  },
};

mkdirSync(targetDir, { recursive: true });
const summaryPath = path.join(targetDir, "summary.json");
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote stress summary to ${summaryPath}`);
