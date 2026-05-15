import { readFileSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  buildUniversityProtocolStressSummary,
  renderUniversityProtocolStressSummaryMarkdown,
  UniversityProtocolFlowRunner,
} from "../index.js";

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "golden",
);

const readGolden = (name: string): string =>
  readFileSync(path.join(fixtureDir, name), "utf8");

const buildStressRunner = (): UniversityProtocolFlowRunner =>
  new UniversityProtocolFlowRunner({
    dataPaths: {
      university: "use-cases/university/data/stress-100/university.json",
      students: "use-cases/university/data/stress-100/students.json",
      companies: "use-cases/university/data/stress-100/companies.json",
      mall: "use-cases/university/data/stress-100/mall.json",
      issuanceBatches: "use-cases/university/data/stress-100/issuance-batches.json",
      discountApplicants:
        "use-cases/university/data/stress-100/discount-applicants.json",
    },
  });

const buildCohortRunner = (): UniversityProtocolFlowRunner =>
  new UniversityProtocolFlowRunner({
    dataPaths: {
      university: "use-cases/university/data/cohort-30/university.json",
      students: "use-cases/university/data/cohort-30/students.json",
      companies: "use-cases/university/data/cohort-30/companies.json",
      mall: "use-cases/university/data/cohort-30/mall.json",
      issuanceBatches:
        "use-cases/university/data/cohort-30/issuance-batches.json",
      discountApplicants:
        "use-cases/university/data/cohort-30/discount-applicants.json",
    },
  });

const normalizeStressSummaryForGolden = (
  summary: ReturnType<typeof buildUniversityProtocolStressSummary>,
): unknown => ({
  ...summary,
  sampledTranscript: {
    ...summary.sampledTranscript,
    threads: Object.fromEntries(
      Object.entries(summary.sampledTranscript.threads).map(
        ([phase, threads]) => [
          phase,
          threads.map((thread) => ({
            ...thread,
            threadIdHex: "<thread-id>",
          })),
        ],
      ),
    ),
  },
  timingsMs: {
    issuance: "<measured>",
    jobApplications: "<measured>",
    discounts: "<measured>",
    runnerTotal: "<measured>",
    wallClock: "<measured>",
  },
  throughput: {
    issuanceCredentialsPerSecond: "<measured>",
    jobApplicationResultsPerSecond: "<measured>",
    discountEvaluationsPerSecond: "<measured>",
    transcriptEntriesPerSecond: "<measured>",
  },
});

const normalizeStressMarkdownForGolden = (markdown: string): string =>
  markdown
    .replace(/^(- issuance: ).+$/mu, "$1<measured>")
    .replace(/^(- jobApplications: ).+$/mu, "$1<measured>")
    .replace(/^(- discounts: ).+$/mu, "$1<measured>")
    .replace(/^(- runnerTotal: ).+$/mu, "$1<measured>")
    .replace(/^(- wallClock: ).+$/mu, "$1<measured>")
    .replace(/^(- issuanceCredentialsPerSecond: ).+$/mu, "$1<measured>")
    .replace(/^(- jobApplicationResultsPerSecond: ).+$/mu, "$1<measured>")
    .replace(/^(- discountEvaluationsPerSecond: ).+$/mu, "$1<measured>")
    .replace(/^(- transcriptEntriesPerSecond: ).+$/mu, "$1<measured>");

const STRESS_TEST_TIMEOUT_MS = 15_000;

describe("university protocol stress summary exporter", () => {
  it("builds the committed stress summary schema and control-sample notes", () => {
    setNetworkId("undeployed");
    const runner = buildStressRunner();
    const startedAt = performance.now();
    const result = runner.runAll();
    const wallClockMs = performance.now() - startedAt;
    const summary = buildUniversityProtocolStressSummary(
      runner,
      result,
      wallClockMs,
    );

    expect(summary.schemaVersion).toBe(
      "midnight-university-protocol-stress-summary.v2",
    );
    expect(summary.datasetProfile).toBe("stress-100");
    expect(summary.dataset.studentCount).toBe(100);
    expect(summary.dataset.companyCount).toBe(3);
    expect(summary.dataset.discountApplicantCount).toBe(5);
    expect(summary.dataset.batchCount).toBe(5);
    expect(summary.dataset.batchSize).toBe(20);
    expect(summary.counts.issuanceRequests).toBe(100);
    expect(summary.counts.jobApplicationResults).toBe(100);
    expect(summary.counts.discountResults).toBe(5);
    expect(summary.counts.totalThreads).toBe(205);
    expect(summary.outcomes.acceptedJobApplications).toBe(100);
    expect(summary.outcomes.acceptedDiscounts).toBe(3);
    expect(summary.outcomes.rejectedDiscounts).toBe(2);
    expect(summary.rejections.jobApplications).toEqual({
      verificationFailed: 0,
      duplicate: 0,
    });
    expect(summary.rejections.discounts.byReason).toEqual([
      {
        reason:
          "failed assert: University-diploma disclosed final grade is below the verifier minimum",
        count: 2,
      },
    ]);
    expect(summary.timingsMs.issuance).toBeGreaterThan(0);
    expect(summary.timingsMs.jobApplications).toBeGreaterThan(0);
    expect(summary.timingsMs.discounts).toBeGreaterThan(0);
    expect(summary.throughput.issuanceCredentialsPerSecond).toBeGreaterThan(0);
    expect(summary.sampledTranscript.threads.issuance).toHaveLength(3);
    expect(summary.sampledTranscript.threads.jobApplications).toHaveLength(5);
    expect(summary.sampledTranscript.threads.discounts).toHaveLength(5);
    expect(summary.sampledTranscript.omittedThreadCounts).toEqual({
      issuance: 97,
      jobApplications: 95,
      discounts: 0,
    });
    expect(summary.artifactRetention.files).toEqual(["summary.json", "summary.md"]);
  }, STRESS_TEST_TIMEOUT_MS);

  it("builds the intermediate cohort summary with richer verifier and discount diversity", () => {
    setNetworkId("undeployed");
    const runner = buildCohortRunner();
    const startedAt = performance.now();
    const result = runner.runAll();
    const wallClockMs = performance.now() - startedAt;
    const summary = buildUniversityProtocolStressSummary(
      runner,
      result,
      wallClockMs,
      {
        datasetProfile: "cohort-30",
        artifactTargetDir: "use-cases/university/protocol/target/cohort-30",
      },
    );

    expect(summary.datasetProfile).toBe("cohort-30");
    expect(summary.dataset.studentCount).toBe(30);
    expect(summary.dataset.companyCount).toBe(6);
    expect(summary.dataset.discountApplicantCount).toBe(10);
    expect(summary.dataset.batchCount).toBe(3);
    expect(summary.dataset.batchSize).toBe(10);
    expect(summary.counts.issuanceRequests).toBe(30);
    expect(summary.counts.jobApplicationResults).toBe(30);
    expect(summary.counts.discountResults).toBe(10);
    expect(summary.counts.totalThreads).toBe(70);
    expect(summary.outcomes.acceptedJobApplications).toBe(30);
    expect(summary.outcomes.acceptedDiscounts).toBe(5);
    expect(summary.outcomes.rejectedDiscounts).toBe(5);
    expect(summary.rejections.discounts.byReason).toEqual([
      {
        reason:
          "failed assert: University-diploma disclosed final grade is below the verifier minimum",
        count: 5,
      },
    ]);
    expect(Object.keys(summary.outcomes.companyAcceptedCounts)).toEqual([
      "company-blue-ocean-analytics",
      "company-copper-bridge-security",
      "company-harbor-product-studio",
      "company-northwind-robotics",
      "company-pioneer-systems",
      "company-summit-quant-labs",
    ]);
    expect(new Set(runner.students.map((student) => student.requestedJobRole)).size).toBe(8);
    expect(
      new Set(runner.students.map((student) => student.diplomaClaimValues.awardName)).size,
    ).toBe(8);
    expect(summary.sampledTranscript.omittedThreadCounts).toEqual({
      issuance: 27,
      jobApplications: 25,
      discounts: 5,
    });
    expect(summary.notes).toEqual(
      expect.arrayContaining([
        "The cohort-30 profile increases company, award, role, and mall-discount diversity without making human review as heavy as stress-100.",
        "Sampled transcript views keep profile summaries readable; use transcript exports when full DTO payloads are required.",
      ]),
    );
    expect(summary.notes).not.toContain(
      "Mall discount evaluation remains a fixed-size five-applicant control sample.",
    );
    for (const thread of summary.sampledTranscript.threads.jobApplications) {
      expect(thread.entrySummaries).toEqual(
        expect.arrayContaining([
          expect.stringContaining("requested a diploma presentation"),
          expect.stringContaining("submitted a jobApplication presentation"),
        ]),
      );
      expect(thread.acceptedCount + thread.rejectedCount).toBeGreaterThan(0);
    }
    expect(summary.artifactRetention.targetDir).toBe(
      "use-cases/university/protocol/target/cohort-30",
    );
  }, STRESS_TEST_TIMEOUT_MS);

  it("matches the checked-in normalized JSON golden export", () => {
    setNetworkId("undeployed");
    const runner = buildStressRunner();
    const startedAt = performance.now();
    const summary = buildUniversityProtocolStressSummary(
      runner,
      runner.runAll(),
      performance.now() - startedAt,
    );

    expect(
      `${JSON.stringify(normalizeStressSummaryForGolden(summary), null, 2)}\n`,
    ).toBe(readGolden("stress-summary.golden.json"));
  }, STRESS_TEST_TIMEOUT_MS);

  it("matches the checked-in normalized Markdown golden export", () => {
    setNetworkId("undeployed");
    const runner = buildStressRunner();
    const startedAt = performance.now();
    const summary = buildUniversityProtocolStressSummary(
      runner,
      runner.runAll(),
      performance.now() - startedAt,
    );

    expect(
      normalizeStressMarkdownForGolden(
        renderUniversityProtocolStressSummaryMarkdown(summary),
      ),
    ).toBe(readGolden("stress-summary.golden.md"));
  }, STRESS_TEST_TIMEOUT_MS);
});
