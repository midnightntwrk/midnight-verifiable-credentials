import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  buildUniversityDataArtifacts,
  writeUniversityDataArtifacts,
} from "../../scripts/data-profile-registry.mjs";
import { UseUniversityScenario } from "../features/support/university-scenario.ts";

export type UniversityBatchSweepRun = {
  readonly studentCount: number;
  readonly batchSize: number;
  readonly batchCount: number;
  readonly issuedCredentialCount: number;
  readonly acceptedRequestCount: number;
  readonly issuanceWallClockMs: number;
  readonly credentialsPerSecond: number;
  readonly phaseTotalsMs: {
    readonly queueWait: number;
    readonly compile: number;
    readonly sign: number;
    readonly delivery: number;
  };
  readonly phaseAverageMs: {
    readonly queueWait: number;
    readonly compile: number;
    readonly sign: number;
    readonly delivery: number;
  };
  readonly phaseMaxMs: {
    readonly queueWait: number;
    readonly compile: number;
    readonly sign: number;
    readonly delivery: number;
  };
};

export type UniversityBatchSweepSummary = {
  readonly schemaVersion: "midnight-university-batch-sweep-summary.v1";
  readonly sweepConfig: {
    readonly studentCount: number;
    readonly batchSizes: readonly number[];
  };
  readonly runs: readonly UniversityBatchSweepRun[];
  readonly fastestBatchSizeByCredentialsPerSecond: number;
  readonly artifactRetention: {
    readonly targetDir: "use-cases/university/scenarios/target/batch-sweep";
    readonly files: readonly ["summary.json", "summary.md"];
  };
  readonly notes: readonly [
    "This sweep exercises the issuance harness only so compile/sign/delivery phase timings stay visible.",
    "All timings are machine-local measurements and should be compared by relative trend, not exact value.",
  ];
};

const fixedArtifactFiles = ["summary.json", "summary.md"] as const;
const fixedNotes = [
  "This sweep exercises the issuance harness only so compile/sign/delivery phase timings stay visible.",
  "All timings are machine-local measurements and should be compared by relative trend, not exact value.",
] as const;

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const average = (values: readonly number[]): number =>
  values.length === 0 ? 0 : sum(values) / values.length;

const max = (values: readonly number[]): number =>
  values.length === 0 ? 0 : Math.max(...values);

const formatMeasured = (value: number): string => value.toFixed(2);

const dataPathsForDirectory = (directory: string) => ({
  university: path.join(directory, "university.json"),
  students: path.join(directory, "students.json"),
  companies: path.join(directory, "companies.json"),
  mall: path.join(directory, "mall.json"),
  issuanceBatches: path.join(directory, "issuance-batches.json"),
  discountApplicants: path.join(directory, "discount-applicants.json"),
});

const normalizeBatchSizes = (batchSizes: readonly number[]): readonly number[] => {
  const unique = [...new Set(batchSizes.map((value) => Number(value)))];
  for (const batchSize of unique) {
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      throw new Error(`Invalid batch size ${String(batchSize)}`);
    }
  }
  return unique.sort((left, right) => left - right);
};

const runSweepProfile = async (
  studentCount: number,
  batchSize: number,
): Promise<UniversityBatchSweepRun> => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "university-batch-sweep-"));

  try {
    writeUniversityDataArtifacts(
      tempDir,
      buildUniversityDataArtifacts({ studentCount, batchSize }),
    );

    const scenario = UseUniversityScenario.locally({
      dataPaths: dataPathsForDirectory(tempDir),
    });

    const startedAt = performance.now();
    await scenario.runBatchIssuance();
    const issuanceWallClockMs = performance.now() - startedAt;
    const result = scenario.issuanceResult();

    const queueWaitValues = result.batchMetrics.map((metric) => metric.queueWaitMs);
    const compileValues = result.batchMetrics.map((metric) => metric.compileMs);
    const signValues = result.batchMetrics.map((metric) => metric.signMs);
    const deliveryValues = result.batchMetrics.map((metric) => metric.deliveryMs);

    return {
      studentCount,
      batchSize,
      batchCount: result.batchCount,
      issuedCredentialCount: result.issuedCredentialCount,
      acceptedRequestCount: result.acceptedRequestCount,
      issuanceWallClockMs,
      credentialsPerSecond: result.credentialsPerSecond,
      phaseTotalsMs: {
        queueWait: sum(queueWaitValues),
        compile: sum(compileValues),
        sign: sum(signValues),
        delivery: sum(deliveryValues),
      },
      phaseAverageMs: {
        queueWait: average(queueWaitValues),
        compile: average(compileValues),
        sign: average(signValues),
        delivery: average(deliveryValues),
      },
      phaseMaxMs: {
        queueWait: max(queueWaitValues),
        compile: max(compileValues),
        sign: max(signValues),
        delivery: max(deliveryValues),
      },
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

export const buildUniversityBatchSweepSummary = async (options: {
  readonly studentCount?: number;
  readonly batchSizes?: readonly number[];
} = {}): Promise<UniversityBatchSweepSummary> => {
  const studentCount = options.studentCount ?? 100;
  const batchSizes = normalizeBatchSizes(options.batchSizes ?? [2, 5, 10, 20]);
  const runs: UniversityBatchSweepRun[] = [];

  for (const batchSize of batchSizes) {
    runs.push(await runSweepProfile(studentCount, batchSize));
  }

  const fastestRun = runs.reduce((best, current) =>
    current.credentialsPerSecond > best.credentialsPerSecond ? current : best,
  );

  return {
    schemaVersion: "midnight-university-batch-sweep-summary.v1",
    sweepConfig: {
      studentCount,
      batchSizes,
    },
    runs,
    fastestBatchSizeByCredentialsPerSecond: fastestRun.batchSize,
    artifactRetention: {
      targetDir: "use-cases/university/scenarios/target/batch-sweep",
      files: fixedArtifactFiles,
    },
    notes: fixedNotes,
  };
};

export const renderUniversityBatchSweepMarkdown = (
  summary: UniversityBatchSweepSummary,
): string => {
  const lines = [
    "# University Batch Sweep Summary",
    "",
    `- schema version: ${summary.schemaVersion}`,
    `- student count: ${summary.sweepConfig.studentCount}`,
    `- batch sizes: ${summary.sweepConfig.batchSizes.join(", ")}`,
    `- fastest batch size by credentials/sec: ${summary.fastestBatchSizeByCredentialsPerSecond}`,
    "",
    "## Runs",
    "| batch size | batches | issued | wall clock ms | compile avg ms | sign avg ms | delivery avg ms | credentials/sec |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...summary.runs.map(
      (run) =>
        `| ${run.batchSize} | ${run.batchCount} | ${run.issuedCredentialCount} | ${formatMeasured(run.issuanceWallClockMs)} | ${formatMeasured(run.phaseAverageMs.compile)} | ${formatMeasured(run.phaseAverageMs.sign)} | ${formatMeasured(run.phaseAverageMs.delivery)} | ${formatMeasured(run.credentialsPerSecond)} |`,
    ),
    "",
    "## Phase Totals (ms)",
    "| batch size | queue wait total | compile total | sign total | delivery total |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...summary.runs.map(
      (run) =>
        `| ${run.batchSize} | ${formatMeasured(run.phaseTotalsMs.queueWait)} | ${formatMeasured(run.phaseTotalsMs.compile)} | ${formatMeasured(run.phaseTotalsMs.sign)} | ${formatMeasured(run.phaseTotalsMs.delivery)} |`,
    ),
    "",
    "## Notes",
    ...summary.notes.map((note) => `- ${note}`),
    "",
    "## Artifact Retention",
    `- target directory: ${summary.artifactRetention.targetDir}`,
    `- files: ${summary.artifactRetention.files.join(", ")}`,
  ];

  return `${lines.join("\n")}\n`;
};

export const writeUniversityBatchSweepArtifacts = (
  targetDir: string,
  summary: UniversityBatchSweepSummary,
): void => {
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(path.join(targetDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(path.join(targetDir, "summary.md"), renderUniversityBatchSweepMarkdown(summary), "utf8");
};
