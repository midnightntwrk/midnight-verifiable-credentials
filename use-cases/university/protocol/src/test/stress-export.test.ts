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

const normalizeStressSummaryForGolden = (
  summary: ReturnType<typeof buildUniversityProtocolStressSummary>,
): unknown => ({
  ...summary,
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
      "midnight-university-protocol-stress-summary.v1",
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
    expect(summary.artifactRetention.files).toEqual(["summary.json", "summary.md"]);
  });

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
  });

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
  });
});
