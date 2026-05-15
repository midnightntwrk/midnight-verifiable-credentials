import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID =
  "midnight-university-report-summary" as const;
export const UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION =
  "midnight-university-report-summary.v2" as const;

type SerenityScenarioRecord = {
  readonly title: string;
  readonly startTime: string;
  readonly result: string;
  readonly duration: number;
  readonly testSource?: string;
};

type UniversityProtocolTranscriptExport = {
  readonly schemaVersion: string;
  readonly dataset: {
    readonly studentCount: number;
    readonly companyCount: number;
    readonly discountApplicantCount: number;
    readonly batchCount: number;
    readonly batchSize: number;
  };
  readonly participants: {
    readonly university: {
      readonly partyId: string;
      readonly didUrl: string;
      readonly methodId: string;
    };
    readonly companies: readonly {
      readonly companyId: string;
      readonly companyName: string;
      readonly verifierDidUrl: string;
      readonly verifierMethodId: string;
    }[];
    readonly mall: {
      readonly mallId: string;
      readonly mallName: string;
      readonly verifierDidUrl: string;
      readonly verifierMethodId: string;
    };
  };
  readonly counts: {
    readonly transcriptEntries: number;
    readonly totalThreads: number;
    readonly issuanceRequests: number;
    readonly issuanceResults: number;
    readonly jobApplicationRequests: number;
    readonly jobApplicationSubmissions: number;
    readonly jobApplicationResults: number;
    readonly discountRequests: number;
    readonly discountSubmissions: number;
    readonly discountResults: number;
  };
  readonly rejectionBreakdown: {
    readonly jobApplications: {
      readonly accepted: number;
      readonly verificationFailed: number;
      readonly duplicate: number;
      readonly byCompany: readonly {
        readonly companyId: string;
        readonly companyName: string;
        readonly accepted: number;
        readonly verificationFailed: number;
        readonly duplicate: number;
      }[];
    };
    readonly discounts: {
      readonly accepted: number;
      readonly verificationFailed: number;
      readonly duplicate: number;
      readonly byReason: readonly {
        readonly reason: string;
        readonly count: number;
      }[];
    };
  };
};

type UniversityProtocolStressSummary = {
  readonly schemaVersion: string;
  readonly datasetProfile: string;
  readonly dataset: {
    readonly studentCount: number;
    readonly companyCount: number;
    readonly discountApplicantCount: number;
    readonly batchCount: number;
    readonly batchSize: number;
  };
  readonly counts: {
    readonly transcriptEntries: number;
    readonly totalThreads: number;
  };
  readonly outcomes: {
    readonly acceptedJobApplications: number;
    readonly companyAcceptedCounts: Readonly<Record<string, number>>;
    readonly acceptedDiscounts: number;
    readonly rejectedDiscounts: number;
  };
  readonly rejections: {
    readonly jobApplications: {
      readonly verificationFailed: number;
      readonly duplicate: number;
    };
    readonly discounts: {
      readonly verificationFailed: number;
      readonly duplicate: number;
      readonly byReason: readonly {
        readonly reason: string;
        readonly count: number;
      }[];
    };
  };
  readonly timingsMs: {
    readonly issuance: number;
    readonly jobApplications: number;
    readonly discounts: number;
    readonly runnerTotal: number;
    readonly wallClock: number;
  };
  readonly throughput: {
    readonly issuanceCredentialsPerSecond: number;
    readonly jobApplicationResultsPerSecond: number;
    readonly discountEvaluationsPerSecond: number;
    readonly transcriptEntriesPerSecond: number;
  };
};

type UniversityBatchSweepSummary = {
  readonly schemaVersion: string;
  readonly sweepConfig: {
    readonly studentCount: number;
    readonly batchSizes: readonly number[];
    readonly compileConcurrencyLevels?: readonly number[];
  };
  readonly runs: readonly {
    readonly batchSize: number;
    readonly batchCount: number;
    readonly issuedCredentialCount: number;
    readonly issuanceWallClockMs: number;
    readonly wallClockCredentialsPerSecond: number;
    readonly credentialsPerSecond: number;
    readonly compileConcurrencyProjections?: readonly {
      readonly compileConcurrency: number;
      readonly workerLoadsMs: readonly number[];
      readonly estimatedCompileWallClockMs: number;
      readonly estimatedIssuerWallClockMs: number;
      readonly projectedCredentialsPerSecond: number;
      readonly projectedSpeedupVsSequential: number;
      readonly compileEfficiency: number;
    }[];
    readonly phaseAverageMs: {
      readonly queueWait: number;
      readonly compile: number;
      readonly sign: number;
      readonly delivery: number;
    };
  }[];
  readonly fastestBatchSizeByWallClockCredentialsPerSecond: number;
};

// Reporting keeps a compact projection subset so the one-page summary stays
// readable while the batch-sweep artifact remains the source of detailed worker
// load vectors.
type BatchSweepReportProjection = {
  readonly batchSize: number;
  readonly compileConcurrency: number;
  readonly estimatedCompileWallClockMs: number;
  readonly estimatedIssuerWallClockMs: number;
  readonly projectedCredentialsPerSecond: number;
  readonly projectedSpeedupVsSequential: number;
  readonly compileEfficiency: number;
};

type LatestScenarioSummary = {
  readonly title: string;
  readonly result: string;
  readonly durationMs: number;
  readonly startTime: string;
};

export type UniversityArtifactSummary = {
  readonly schemaId: typeof UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID;
  readonly schemaVersion: typeof UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION;
  readonly actors: {
    readonly universityPartyId: string;
    readonly studentCount: number;
    readonly companyCount: number;
    readonly companyNames: readonly string[];
    readonly mallId: string;
    readonly mallName: string;
    readonly discountApplicantCount: number;
  };
  readonly sources: {
    readonly serenityDirectory: string;
    readonly transcriptExportPath: string;
    readonly stressSummaryPath: string;
    readonly batchSweepSummaryPath: string;
  };
  readonly readableBdd: {
    readonly scenarioCount: number;
    readonly passedCount: number;
    readonly failedCount: number;
    readonly totalDurationMs: number;
    readonly categories: Readonly<Record<string, number>>;
    readonly slowestScenarios: readonly LatestScenarioSummary[];
  };
  readonly transcriptExport: {
    readonly schemaVersion: string;
    readonly dataset: UniversityProtocolTranscriptExport["dataset"];
    readonly counts: UniversityProtocolTranscriptExport["counts"];
    readonly rejections: UniversityProtocolTranscriptExport["rejectionBreakdown"];
  };
  readonly stressSummary: {
    readonly schemaVersion: string;
    readonly datasetProfile: string;
    readonly dataset: UniversityProtocolStressSummary["dataset"];
    readonly counts: UniversityProtocolStressSummary["counts"];
    readonly outcomes: UniversityProtocolStressSummary["outcomes"];
    readonly rejections: UniversityProtocolStressSummary["rejections"];
    readonly timingsMs: UniversityProtocolStressSummary["timingsMs"];
    readonly throughput: UniversityProtocolStressSummary["throughput"];
  };
  readonly batchSweep: {
    readonly schemaVersion: string;
    readonly studentCount: number;
    readonly batchSizes: readonly number[];
    readonly compileConcurrencyLevels: readonly number[];
    readonly fastestBatchSizeByWallClockCredentialsPerSecond: number;
    readonly bestCompileConcurrencyProjection: BatchSweepReportProjection | null;
    readonly runs: readonly {
      readonly batchSize: number;
      readonly batchCount: number;
      readonly issuedCredentialCount: number;
      readonly issuanceWallClockMs: number;
      readonly wallClockCredentialsPerSecond: number;
      readonly compileAverageMs: number;
      readonly queueWaitAverageMs: number;
      readonly compileConcurrencyProjections: readonly BatchSweepReportProjection[];
    }[];
  };
  readonly bottlenecks: {
    readonly slowestReadableScenario: LatestScenarioSummary | null;
    readonly slowestBatchSweepCompileAverage: {
      readonly batchSize: number;
      readonly compileAverageMs: number;
    } | null;
    readonly slowestStressPhase: {
      readonly phase: keyof UniversityProtocolStressSummary["timingsMs"];
      readonly durationMs: number;
    };
  };
  readonly notes: readonly string[];
};

export type UniversityArtifactPaths = {
  readonly serenityDirectory: string;
  readonly transcriptExportPath: string;
  readonly stressSummaryPath: string;
  readonly batchSweepSummaryPath: string;
};

const readJson = <T>(filePath: string): T => {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON artifact at ${filePath}`, {
      cause: error,
    });
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const latestScenarioRecords = (
  serenityDirectory: string,
): readonly SerenityScenarioRecord[] => {
  const latestByTitle = new Map<string, SerenityScenarioRecord>();

  for (const entry of readdirSync(serenityDirectory)) {
    if (!entry.endsWith(".json")) {
      continue;
    }

    const record = readJson<Partial<SerenityScenarioRecord>>(
      path.join(serenityDirectory, entry),
    );
    if (
      typeof record.title !== "string" ||
      typeof record.startTime !== "string" ||
      typeof record.result !== "string" ||
      typeof record.duration !== "number"
    ) {
      continue;
    }

    const previous = latestByTitle.get(record.title);
    if (!previous || record.startTime > previous.startTime) {
      latestByTitle.set(record.title, {
        title: record.title,
        startTime: record.startTime,
        result: record.result,
        duration: record.duration,
        testSource:
          typeof record.testSource === "string" ? record.testSource : undefined,
      });
    }
  }

  return [...latestByTitle.values()].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
};

const scenarioCategory = (title: string): string => {
  // Order matters here: narrower negative-path matches should win before the
  // generic "tampered" bucket catches them.
  const lower = title.toLowerCase();
  if (lower.includes("duplicate job-application")) {
    return "duplicateJobApplication";
  }
  if (lower.includes("duplicate mall discount")) {
    return "duplicateMallDiscount";
  }
  if (lower.includes("invalid company verifier policy")) {
    return "invalidPolicy";
  }
  if (lower.includes("replayed issuance request")) {
    return "issuanceReplay";
  }
  if (
    lower.includes("tampered holder") ||
    lower.includes("tampered proof signer")
  ) {
    return "holderBindingTampering";
  }
  if (lower.includes("tampered")) {
    return "tamperedPresentation";
  }
  if (lower.includes("job applications")) {
    return "jobApplications";
  }
  if (lower.includes("mall discount")) {
    return "mallDiscount";
  }
  if (lower.includes("issues 10 diploma credentials")) {
    return "batchIssuance";
  }
  return "other";
};

const topSlowestScenarios = (
  records: readonly SerenityScenarioRecord[],
  limit = 5,
): readonly LatestScenarioSummary[] =>
  [...records]
    .sort(
      (left, right) =>
        right.duration - left.duration || left.title.localeCompare(right.title),
    )
    .slice(0, limit)
    .map((record) => ({
      title: record.title,
      result: record.result,
      durationMs: record.duration,
      startTime: record.startTime,
    }));

const slowestStressPhase = (
  timingsMs: UniversityProtocolStressSummary["timingsMs"],
): {
  readonly phase: "issuance" | "jobApplications" | "discounts";
  readonly durationMs: number;
} => {
  const entries = [
    ["issuance", timingsMs.issuance],
    ["jobApplications", timingsMs.jobApplications],
    ["discounts", timingsMs.discounts],
  ] as ["issuance" | "jobApplications" | "discounts", number][];

  return entries.reduce(
    (best, current) =>
      current[1] > best.durationMs
        ? { phase: current[0], durationMs: current[1] }
        : best,
    {
      phase: entries[0]?.[0] ?? "jobApplications",
      durationMs: entries[0]?.[1] ?? 0,
    },
  );
};

export const buildUniversityArtifactSummary = (
  artifactPaths: UniversityArtifactPaths,
): UniversityArtifactSummary => {
  const serenityRecords = latestScenarioRecords(
    artifactPaths.serenityDirectory,
  );
  const transcriptExport = readJson<UniversityProtocolTranscriptExport>(
    artifactPaths.transcriptExportPath,
  );
  const stressSummary = readJson<UniversityProtocolStressSummary>(
    artifactPaths.stressSummaryPath,
  );
  const batchSweep = readJson<UniversityBatchSweepSummary>(
    artifactPaths.batchSweepSummaryPath,
  );

  const categories = serenityRecords.reduce<Record<string, number>>(
    (acc, record) => {
      const category = scenarioCategory(record.title);
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const batchSweepRuns = batchSweep.runs.map((run) => {
    const compileConcurrencyProjections = (
      run.compileConcurrencyProjections ?? []
    ).map((projection) => ({
      batchSize: run.batchSize,
      compileConcurrency: projection.compileConcurrency,
      estimatedCompileWallClockMs: projection.estimatedCompileWallClockMs,
      estimatedIssuerWallClockMs: projection.estimatedIssuerWallClockMs,
      projectedCredentialsPerSecond: projection.projectedCredentialsPerSecond,
      projectedSpeedupVsSequential: projection.projectedSpeedupVsSequential,
      compileEfficiency: projection.compileEfficiency,
    }));

    return {
      batchSize: run.batchSize,
      batchCount: run.batchCount,
      issuedCredentialCount: run.issuedCredentialCount,
      issuanceWallClockMs: run.issuanceWallClockMs,
      wallClockCredentialsPerSecond: run.wallClockCredentialsPerSecond,
      compileAverageMs: run.phaseAverageMs.compile,
      queueWaitAverageMs: run.phaseAverageMs.queueWait,
      compileConcurrencyProjections,
    };
  });

  const batchSweepProjectionRows = batchSweepRuns.flatMap(
    (run) => run.compileConcurrencyProjections,
  );
  const isBetterBatchSweepProjection = (
    current: BatchSweepReportProjection,
    best: BatchSweepReportProjection,
  ): boolean => {
    if (
      current.projectedCredentialsPerSecond !==
      best.projectedCredentialsPerSecond
    ) {
      return (
        current.projectedCredentialsPerSecond >
        best.projectedCredentialsPerSecond
      );
    }
    if (current.compileConcurrency !== best.compileConcurrency) {
      return current.compileConcurrency < best.compileConcurrency;
    }
    return current.batchSize < best.batchSize;
  };
  const bestCompileConcurrencyProjection =
    batchSweepProjectionRows.length === 0
      ? null
      : batchSweepProjectionRows.reduce((best, current) =>
          isBetterBatchSweepProjection(current, best) ? current : best,
        );

  const slowestBatchSweepCompileAverage =
    batchSweepRuns.length === 0
      ? null
      : batchSweepRuns.reduce((best, current) =>
          current.compileAverageMs > best.compileAverageMs ? current : best,
        );

  return {
    schemaId: UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID,
    schemaVersion: UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION,
    actors: {
      universityPartyId: transcriptExport.participants.university.partyId,
      studentCount: transcriptExport.dataset.studentCount,
      companyCount: transcriptExport.dataset.companyCount,
      companyNames: transcriptExport.participants.companies.map(
        (company) => company.companyName,
      ),
      mallId: transcriptExport.participants.mall.mallId,
      mallName: transcriptExport.participants.mall.mallName,
      discountApplicantCount: transcriptExport.dataset.discountApplicantCount,
    },
    sources: { ...artifactPaths },
    readableBdd: {
      scenarioCount: serenityRecords.length,
      passedCount: serenityRecords.filter(
        (record) => record.result === "SUCCESS",
      ).length,
      failedCount: serenityRecords.filter(
        (record) => record.result !== "SUCCESS",
      ).length,
      totalDurationMs: serenityRecords.reduce(
        (sum, record) => sum + record.duration,
        0,
      ),
      categories,
      slowestScenarios: topSlowestScenarios(serenityRecords),
    },
    transcriptExport: {
      schemaVersion: transcriptExport.schemaVersion,
      dataset: { ...transcriptExport.dataset },
      counts: { ...transcriptExport.counts },
      rejections: transcriptExport.rejectionBreakdown,
    },
    stressSummary: {
      schemaVersion: stressSummary.schemaVersion,
      datasetProfile: stressSummary.datasetProfile,
      dataset: { ...stressSummary.dataset },
      counts: { ...stressSummary.counts },
      outcomes: stressSummary.outcomes,
      rejections: stressSummary.rejections,
      timingsMs: { ...stressSummary.timingsMs },
      throughput: { ...stressSummary.throughput },
    },
    batchSweep: {
      schemaVersion: batchSweep.schemaVersion,
      studentCount: batchSweep.sweepConfig.studentCount,
      batchSizes: [...batchSweep.sweepConfig.batchSizes],
      compileConcurrencyLevels: [
        ...(batchSweep.sweepConfig.compileConcurrencyLevels ?? [1]),
      ],
      fastestBatchSizeByWallClockCredentialsPerSecond:
        batchSweep.fastestBatchSizeByWallClockCredentialsPerSecond,
      bestCompileConcurrencyProjection,
      runs: batchSweepRuns,
    },
    bottlenecks: {
      slowestReadableScenario:
        topSlowestScenarios(serenityRecords, 1)[0] ?? null,
      slowestBatchSweepCompileAverage:
        slowestBatchSweepCompileAverage === null
          ? null
          : {
              batchSize: slowestBatchSweepCompileAverage.batchSize,
              compileAverageMs:
                slowestBatchSweepCompileAverage.compileAverageMs,
            },
      slowestStressPhase: slowestStressPhase(stressSummary.timingsMs),
    },
    notes: [
      "Readable BDD counts are deduplicated by scenario title and keep only the latest recorded run per title.",
      "This report summarizes existing artifacts; it does not rerun issuance, protocol, or verifier logic internally.",
      "Batch-sweep and stress timings remain machine-local measurements and should be compared by trend, not by exact absolute value.",
      "Batch compile-concurrency projections parallelize only the fixture-construction phase in the model; the underlying readable issuance lane remains sequential.",
    ],
  };
};

// This is a lightweight runtime sanity check for the package's own emitted
// artifact shape, not a recursive schema validator.
export const isUniversityArtifactSummary = (
  value: unknown,
): value is UniversityArtifactSummary => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaId === UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID &&
    value.schemaVersion === UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION &&
    isRecord(value.actors) &&
    typeof value.actors.universityPartyId === "string" &&
    typeof value.actors.studentCount === "number" &&
    typeof value.actors.companyCount === "number" &&
    Array.isArray(value.actors.companyNames) &&
    typeof value.actors.mallId === "string" &&
    typeof value.actors.mallName === "string" &&
    typeof value.actors.discountApplicantCount === "number" &&
    isRecord(value.readableBdd) &&
    typeof value.readableBdd.scenarioCount === "number" &&
    typeof value.readableBdd.passedCount === "number" &&
    typeof value.readableBdd.failedCount === "number" &&
    typeof value.readableBdd.totalDurationMs === "number" &&
    isRecord(value.transcriptExport) &&
    typeof value.transcriptExport.schemaVersion === "string" &&
    isRecord(value.stressSummary) &&
    typeof value.stressSummary.schemaVersion === "string" &&
    isRecord(value.batchSweep) &&
    typeof value.batchSweep.schemaVersion === "string" &&
    isRecord(value.bottlenecks) &&
    Array.isArray(value.notes)
  );
};

export const assertUniversityArtifactSummaryConforms = (
  value: unknown,
): asserts value is UniversityArtifactSummary => {
  if (!isUniversityArtifactSummary(value)) {
    throw new TypeError(
      "University artifact summary does not match the expected schema",
    );
  }
};

const format2dp = (value: number): string => value.toFixed(2);

export const renderUniversityArtifactSummaryMarkdown = (
  summary: UniversityArtifactSummary,
): string => {
  const lines = [
    "# University Report Summary",
    "",
    `- schema id: ${summary.schemaId}`,
    `- schema version: ${summary.schemaVersion}`,
    `- university issuer: ${summary.actors.universityPartyId}`,
    `- students: ${summary.actors.studentCount}`,
    `- companies: ${summary.actors.companyCount} (${summary.actors.companyNames.join(", ")})`,
    `- mall: ${summary.actors.mallName} (${summary.actors.mallId})`,
    `- discount applicants: ${summary.actors.discountApplicantCount}`,
    "",
    "## Readable BDD Lane",
    `- scenarios: ${summary.readableBdd.scenarioCount}`,
    `- passed: ${summary.readableBdd.passedCount}`,
    `- failed: ${summary.readableBdd.failedCount}`,
    `- total duration ms: ${format2dp(summary.readableBdd.totalDurationMs)}`,
    "- categories:",
    ...Object.entries(summary.readableBdd.categories)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, count]) => `  - ${category}: ${count}`),
    "",
    "## Slowest Scenarios",
    ...summary.readableBdd.slowestScenarios.map(
      (scenario) =>
        `- ${scenario.title}: ${format2dp(scenario.durationMs)} ms (${scenario.result})`,
    ),
    "",
    "## Transcript Export",
    `- schema version: ${summary.transcriptExport.schemaVersion}`,
    `- transcript entries: ${summary.transcriptExport.counts.transcriptEntries}`,
    `- total threads: ${summary.transcriptExport.counts.totalThreads}`,
    `- issuance results: ${summary.transcriptExport.counts.issuanceResults}`,
    `- job application accepted: ${summary.transcriptExport.rejections.jobApplications.accepted}`,
    `- job application verification failed: ${summary.transcriptExport.rejections.jobApplications.verificationFailed}`,
    `- discount accepted: ${summary.transcriptExport.rejections.discounts.accepted}`,
    `- discount verification failed: ${summary.transcriptExport.rejections.discounts.verificationFailed}`,
    ...summary.transcriptExport.rejections.discounts.byReason.map(
      (entry) =>
        `- discount rejection reason: ${entry.reason} (${entry.count})`,
    ),
    "",
    "## Stress Summary",
    `- dataset profile: ${summary.stressSummary.datasetProfile}`,
    `- students: ${summary.stressSummary.dataset.studentCount}`,
    `- transcript entries: ${summary.stressSummary.counts.transcriptEntries}`,
    `- total threads: ${summary.stressSummary.counts.totalThreads}`,
    `- accepted job applications: ${summary.stressSummary.outcomes.acceptedJobApplications}`,
    `- accepted discounts: ${summary.stressSummary.outcomes.acceptedDiscounts}`,
    `- rejected discounts: ${summary.stressSummary.outcomes.rejectedDiscounts}`,
    `- issuance ms: ${format2dp(summary.stressSummary.timingsMs.issuance)}`,
    `- job applications ms: ${format2dp(summary.stressSummary.timingsMs.jobApplications)}`,
    `- discounts ms: ${format2dp(summary.stressSummary.timingsMs.discounts)}`,
    `- wall clock ms: ${format2dp(summary.stressSummary.timingsMs.wallClock)}`,
    `- issuance credentials/sec: ${format2dp(summary.stressSummary.throughput.issuanceCredentialsPerSecond)}`,
    `- job application results/sec: ${format2dp(summary.stressSummary.throughput.jobApplicationResultsPerSecond)}`,
    `- discount evaluations/sec: ${format2dp(summary.stressSummary.throughput.discountEvaluationsPerSecond)}`,
    "",
    "## Batch Sweep",
    `- fastest batch size by wall-clock credentials/sec: ${summary.batchSweep.fastestBatchSizeByWallClockCredentialsPerSecond}`,
    `- compile concurrency levels: ${summary.batchSweep.compileConcurrencyLevels.join(", ")}`,
    ...(summary.batchSweep.bestCompileConcurrencyProjection
      ? [
          `- best projected compile concurrency: batch size ${summary.batchSweep.bestCompileConcurrencyProjection.batchSize}, ${summary.batchSweep.bestCompileConcurrencyProjection.compileConcurrency} workers (${format2dp(summary.batchSweep.bestCompileConcurrencyProjection.projectedCredentialsPerSecond)} projected credentials/sec, ${format2dp(summary.batchSweep.bestCompileConcurrencyProjection.projectedSpeedupVsSequential)}x speedup)`,
        ]
      : ["- best projected compile concurrency: unavailable"]),
    "",
    "| batch size | batches | issued | wall clock ms | compile avg ms | queue wait avg ms | wall-clock credentials/sec |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...summary.batchSweep.runs.map(
      (run) =>
        `| ${run.batchSize} | ${run.batchCount} | ${run.issuedCredentialCount} | ${format2dp(run.issuanceWallClockMs)} | ${format2dp(run.compileAverageMs)} | ${format2dp(run.queueWaitAverageMs)} | ${format2dp(run.wallClockCredentialsPerSecond)} |`,
    ),
    "",
    "## Batch Sweep Compile Projection",
    "| batch size | compile concurrency | estimated issuer wall clock ms | projected credentials/sec | projected speedup | compile efficiency |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...summary.batchSweep.runs.flatMap((run) =>
      run.compileConcurrencyProjections.map(
        (projection) =>
          `| ${projection.batchSize} | ${projection.compileConcurrency} | ${format2dp(projection.estimatedIssuerWallClockMs)} | ${format2dp(projection.projectedCredentialsPerSecond)} | ${format2dp(projection.projectedSpeedupVsSequential)} | ${format2dp(projection.compileEfficiency)} |`,
      ),
    ),
    "",
    "## Bottlenecks",
    ...(summary.bottlenecks.slowestReadableScenario
      ? [
          `- slowest readable scenario: ${summary.bottlenecks.slowestReadableScenario.title} (${format2dp(summary.bottlenecks.slowestReadableScenario.durationMs)} ms)`,
        ]
      : []),
    ...(summary.bottlenecks.slowestBatchSweepCompileAverage
      ? [
          `- slowest batch compile average: batch size ${summary.bottlenecks.slowestBatchSweepCompileAverage.batchSize} (${format2dp(summary.bottlenecks.slowestBatchSweepCompileAverage.compileAverageMs)} ms)`,
        ]
      : []),
    `- slowest stress phase: ${summary.bottlenecks.slowestStressPhase.phase} (${format2dp(summary.bottlenecks.slowestStressPhase.durationMs)} ms)`,
    "",
    "## Notes",
    ...summary.notes.map((note) => `- ${note}`),
    "",
  ];

  return `${lines.join("\n")}\n`;
};
