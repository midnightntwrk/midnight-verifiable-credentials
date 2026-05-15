import {
  mkdtempSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  buildUniversityDataArtifacts,
  writeUniversityDataArtifacts,
} from "../../scripts/data-profile-registry.mjs";
import { UseUniversityScenario } from "../features/support/university-scenario.ts";

type PhaseStats = {
  readonly queueWait: number;
  readonly compile: number;
  readonly sign: number;
  readonly delivery: number;
};

export type UniversityBatchSweepConcurrencyProjection = {
  readonly compileConcurrency: number;
  readonly workerLoadsMs: readonly number[];
  readonly estimatedCompileWallClockMs: number;
  readonly estimatedIssuerWallClockMs: number;
  readonly projectedCredentialsPerSecond: number;
  readonly projectedSpeedupVsSequential: number;
  readonly compileEfficiency: number;
};

export type UniversityBatchSweepRun = {
  readonly studentCount: number;
  readonly batchSize: number;
  readonly batchCount: number;
  readonly issuedCredentialCount: number;
  readonly acceptedRequestCount: number;
  readonly issuanceWallClockMs: number;
  readonly wallClockCredentialsPerSecond: number;
  readonly credentialsPerSecond: number;
  readonly phaseTotalsMs: PhaseStats;
  readonly phaseAverageMs: PhaseStats;
  readonly phaseMaxMs: PhaseStats;
  readonly compileConcurrencyProjections: readonly UniversityBatchSweepConcurrencyProjection[];
};

export type UniversityBatchSweepSummary = {
  readonly schemaVersion: "midnight-university-batch-sweep-summary.v2";
  readonly sweepConfig: {
    readonly studentCount: number;
    readonly batchSizes: readonly number[];
    readonly compileConcurrencyLevels: readonly number[];
  };
  readonly runs: readonly UniversityBatchSweepRun[];
  readonly fastestBatchSizeByWallClockCredentialsPerSecond: number;
  readonly artifactRetention: {
    readonly targetDir: string;
    readonly files: readonly ["summary.json", "summary.md"];
  };
  readonly notes: readonly [
    "This sweep exercises the issuance harness only so compile/sign/delivery phase timings stay visible.",
    "Compile-concurrency projections keep actual issuance sequential and estimate only the fixture-construction phase.",
    "All timings are machine-local measurements and should be compared by relative trend, not exact value.",
  ];
};

const fixedArtifactFiles = ["summary.json", "summary.md"] as const;
const fixedNotes = [
  "This sweep exercises the issuance harness only so compile/sign/delivery phase timings stay visible.",
  "Compile-concurrency projections keep actual issuance sequential and estimate only the fixture-construction phase.",
  "All timings are machine-local measurements and should be compared by relative trend, not exact value.",
] as const;
const defaultBatchSweepArtifactTargetDir =
  "use-cases/university/scenarios/target/batch-sweep";

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const average = (values: readonly number[]): number =>
  values.length === 0 ? 0 : sum(values) / values.length;

const max = (values: readonly number[]): number =>
  values.length === 0 ? 0 : Math.max(...values);

const formatMeasured = (value: number): string => value.toFixed(2);

const formatWorkerLoads = (workerLoadsMs: readonly number[]): string => {
  const visibleLoads = workerLoadsMs.slice(0, 4).map(formatMeasured);
  if (workerLoadsMs.length <= visibleLoads.length) {
    return visibleLoads.join(", ");
  }
  return `${visibleLoads.join(", ")}, ... (+${workerLoadsMs.length - visibleLoads.length} more)`;
};

const dataPathsForDirectory = (directory: string) => ({
  university: path.join(directory, "university.json"),
  students: path.join(directory, "students.json"),
  companies: path.join(directory, "companies.json"),
  mall: path.join(directory, "mall.json"),
  issuanceBatches: path.join(directory, "issuance-batches.json"),
  discountApplicants: path.join(directory, "discount-applicants.json"),
});

const normalizeBatchSizes = (
  batchSizes: readonly number[],
): readonly number[] => {
  const unique = [...new Set(batchSizes.map((value) => Number(value)))];
  if (unique.length === 0) {
    throw new Error("At least one batch size is required");
  }
  for (const batchSize of unique) {
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      throw new Error(`Invalid batch size ${String(batchSize)}`);
    }
  }
  return unique.sort((left, right) => left - right);
};

const normalizeConcurrencyLevels = (
  concurrencyLevels: readonly number[],
): readonly number[] => {
  const unique = [...new Set(concurrencyLevels.map((value) => Number(value)))];
  if (unique.length === 0) {
    throw new Error("At least one compile concurrency level is required");
  }
  for (const concurrency of unique) {
    if (!Number.isInteger(concurrency) || concurrency <= 0) {
      throw new Error(
        `Invalid compile concurrency level ${String(concurrency)}`,
      );
    }
  }
  return unique.sort((left, right) => left - right);
};

const effectiveConcurrencyLevels = (
  requestedLevels: readonly number[],
  batchCount: number,
): readonly number[] => {
  const cappedBatchCount = Math.max(1, batchCount);
  // Requested concurrency above the observed batch count cannot create more
  // useful workers, so the artifact reports the effective clamped/deduped set.
  return [
    ...new Set(
      requestedLevels.map((level) => Math.min(level, cappedBatchCount)),
    ),
  ];
};

export const projectCompileConcurrency = (options: {
  readonly compileDurationsMs: readonly number[];
  readonly compileConcurrency: number;
  readonly sequentialIssuerWallClockMs: number;
  readonly issuedCredentialCount: number;
}): UniversityBatchSweepConcurrencyProjection => {
  if (
    !Number.isInteger(options.compileConcurrency) ||
    options.compileConcurrency <= 0
  ) {
    throw new Error(
      `Invalid compile concurrency level ${String(options.compileConcurrency)}`,
    );
  }

  const workerLoads = Array.from(
    { length: options.compileConcurrency },
    () => 0,
  );

  for (const durationMs of options.compileDurationsMs) {
    // Assign each measured batch to the least-loaded worker in measured arrival
    // order. This models a simple online work-stealing queue rather than an
    // offline LPT scheduler the current issuer harness does not implement.
    let selectedWorker = 0;
    for (const [workerIndex, loadMs] of workerLoads.entries()) {
      if (loadMs < workerLoads[selectedWorker]!) {
        selectedWorker = workerIndex;
      }
    }
    workerLoads[selectedWorker]! += durationMs;
  }

  const sequentialCompileMs = sum(options.compileDurationsMs);
  const estimatedCompileWallClockMs = max(workerLoads);
  const estimatedIssuerWallClockMs = Math.max(
    0,
    options.sequentialIssuerWallClockMs -
      sequentialCompileMs +
      estimatedCompileWallClockMs,
  );
  const projectedCredentialsPerSecond =
    estimatedIssuerWallClockMs === 0
      ? 0
      : (options.issuedCredentialCount * 1000) / estimatedIssuerWallClockMs;

  return {
    compileConcurrency: options.compileConcurrency,
    workerLoadsMs: workerLoads,
    estimatedCompileWallClockMs,
    estimatedIssuerWallClockMs,
    projectedCredentialsPerSecond,
    projectedSpeedupVsSequential:
      estimatedIssuerWallClockMs === 0
        ? 1
        : options.sequentialIssuerWallClockMs / estimatedIssuerWallClockMs,
    compileEfficiency:
      estimatedCompileWallClockMs === 0
        ? 1
        : sequentialCompileMs /
          (estimatedCompileWallClockMs * options.compileConcurrency),
  };
};

const runSweepProfile = async (
  studentCount: number,
  batchSize: number,
  compileConcurrencyLevels: readonly number[],
): Promise<UniversityBatchSweepRun> => {
  const tempDir = mkdtempSync(
    path.join(os.tmpdir(), "university-batch-sweep-"),
  );

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
    const wallClockCredentialsPerSecond =
      issuanceWallClockMs === 0
        ? 0
        : (result.issuedCredentialCount * 1000) / issuanceWallClockMs;

    const queueWaitValues = result.batchMetrics.map(
      (metric) => metric.queueWaitMs,
    );
    const compileValues = result.batchMetrics.map((metric) => metric.compileMs);
    const signValues = result.batchMetrics.map((metric) => metric.signMs);
    const deliveryValues = result.batchMetrics.map(
      (metric) => metric.deliveryMs,
    );
    const compileConcurrencyProjections = effectiveConcurrencyLevels(
      compileConcurrencyLevels,
      result.batchCount,
    ).map((compileConcurrency) =>
      projectCompileConcurrency({
        compileDurationsMs: compileValues,
        compileConcurrency,
        sequentialIssuerWallClockMs: issuanceWallClockMs,
        issuedCredentialCount: result.issuedCredentialCount,
      }),
    );

    return {
      studentCount,
      batchSize,
      batchCount: result.batchCount,
      issuedCredentialCount: result.issuedCredentialCount,
      acceptedRequestCount: result.acceptedRequestCount,
      issuanceWallClockMs,
      wallClockCredentialsPerSecond,
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
      compileConcurrencyProjections,
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

export const buildUniversityBatchSweepSummary = async (
  options: {
    readonly studentCount?: number;
    readonly batchSizes?: readonly number[];
    readonly compileConcurrencyLevels?: readonly number[];
    readonly artifactTargetDir?: string;
  } = {},
): Promise<UniversityBatchSweepSummary> => {
  const studentCount = options.studentCount ?? 100;
  const batchSizes = normalizeBatchSizes(options.batchSizes ?? [2, 5, 10, 20]);
  const compileConcurrencyLevels = normalizeConcurrencyLevels(
    options.compileConcurrencyLevels ?? [1, 2, 4],
  );
  const runs: UniversityBatchSweepRun[] = [];
  const artifactTargetDir =
    options.artifactTargetDir ?? defaultBatchSweepArtifactTargetDir;

  for (const batchSize of batchSizes) {
    runs.push(
      await runSweepProfile(studentCount, batchSize, compileConcurrencyLevels),
    );
  }

  const [firstRun, ...remainingRuns] = runs;
  const fastestRun = remainingRuns.reduce(
    (best, current) =>
      current.wallClockCredentialsPerSecond > best.wallClockCredentialsPerSecond
        ? current
        : best,
    firstRun,
  );

  return {
    schemaVersion: "midnight-university-batch-sweep-summary.v2",
    sweepConfig: {
      studentCount,
      batchSizes,
      compileConcurrencyLevels,
    },
    runs,
    fastestBatchSizeByWallClockCredentialsPerSecond: fastestRun.batchSize,
    artifactRetention: {
      targetDir: artifactTargetDir,
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
    `- fastest batch size by wall-clock credentials/sec: ${summary.fastestBatchSizeByWallClockCredentialsPerSecond}`,
    "",
    "## Runs",
    "| batch size | batches | issued | wall clock ms | queue wait avg ms | compile avg ms | sign avg ms | delivery avg ms | wall-clock credentials/sec | reported credentials/sec |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...summary.runs.map(
      (run) =>
        `| ${run.batchSize} | ${run.batchCount} | ${run.issuedCredentialCount} | ${formatMeasured(run.issuanceWallClockMs)} | ${formatMeasured(run.phaseAverageMs.queueWait)} | ${formatMeasured(run.phaseAverageMs.compile)} | ${formatMeasured(run.phaseAverageMs.sign)} | ${formatMeasured(run.phaseAverageMs.delivery)} | ${formatMeasured(run.wallClockCredentialsPerSecond)} | ${formatMeasured(run.credentialsPerSecond)} |`,
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
    "## Phase Maximums (ms)",
    "| batch size | queue wait max | compile max | sign max | delivery max |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...summary.runs.map(
      (run) =>
        `| ${run.batchSize} | ${formatMeasured(run.phaseMaxMs.queueWait)} | ${formatMeasured(run.phaseMaxMs.compile)} | ${formatMeasured(run.phaseMaxMs.sign)} | ${formatMeasured(run.phaseMaxMs.delivery)} |`,
    ),
    "",
    "## Compile Concurrency Projection",
    "| batch size | compile concurrency | estimated compile wall clock ms | estimated issuer wall clock ms | projected credentials/sec | projected speedup | compile efficiency | worker loads ms |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...summary.runs.flatMap((run) =>
      run.compileConcurrencyProjections.map(
        (projection) =>
          `| ${run.batchSize} | ${projection.compileConcurrency} | ${formatMeasured(projection.estimatedCompileWallClockMs)} | ${formatMeasured(projection.estimatedIssuerWallClockMs)} | ${formatMeasured(projection.projectedCredentialsPerSecond)} | ${formatMeasured(projection.projectedSpeedupVsSequential)} | ${formatMeasured(projection.compileEfficiency)} | ${formatWorkerLoads(projection.workerLoadsMs)} |`,
      ),
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

const writeFileAtomically = (filePath: string, contents: string): void => {
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  try {
    writeFileSync(tmpPath, contents, "utf8");
    renameSync(tmpPath, filePath);
  } catch (error) {
    rmSync(tmpPath, { force: true });
    throw error;
  }
};

export const writeUniversityBatchSweepArtifacts = (
  targetDir: string,
  summary: UniversityBatchSweepSummary,
): void => {
  mkdirSync(targetDir, { recursive: true });
  const summaryJsonPath = path.join(targetDir, "summary.json");
  const summaryMarkdownPath = path.join(targetDir, "summary.md");
  writeFileAtomically(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  writeFileAtomically(
    summaryMarkdownPath,
    renderUniversityBatchSweepMarkdown(summary),
  );
};
