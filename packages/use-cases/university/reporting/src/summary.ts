import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID =
  "midnight-university-report-summary" as const;
export const UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION =
  "midnight-university-report-summary.v4" as const;
export const UNIVERSITY_ARTIFACT_MANIFEST_SCHEMA_VERSION =
  "midnight-university-artifact-manifest.v1" as const;

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

type UniversityArtifactManifestEntry = {
  readonly artifactId: string;
  readonly label: string;
  readonly path: string;
  readonly format: "serenity-json-directory" | "university-json-artifact";
  readonly schemaVersion: string | null;
  readonly producedBy: string;
  readonly purpose: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly fileCount: number;
};

type UniversityReportHandoffArtifact = {
  readonly artifactId: string;
  readonly label: string;
  readonly path: string;
  readonly format: "json" | "markdown";
  readonly producedBy: string;
  readonly purpose: string;
};

export type UniversityArtifactManifest = {
  readonly manifestSchemaVersion: typeof UNIVERSITY_ARTIFACT_MANIFEST_SCHEMA_VERSION;
  readonly artifactSet: "midnight-university-reporting-inputs";
  readonly totalBytes: number;
  readonly entries: readonly UniversityArtifactManifestEntry[];
  readonly notes: readonly string[];
};

export type UniversityReportHandoff = {
  readonly primaryHuman: UniversityReportHandoffArtifact;
  readonly primaryMachine: UniversityReportHandoffArtifact;
  readonly sourceManifestJson: UniversityReportHandoffArtifact;
  readonly sourceManifestMarkdown: UniversityReportHandoffArtifact;
  readonly sourceArtifactIds: readonly string[];
  readonly notes: readonly string[];
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
  readonly handoff: UniversityReportHandoff;
  readonly artifactManifest: UniversityArtifactManifest;
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

const universityReportHandoffArtifacts = {
  primaryHuman: {
    artifactId: "university-report-summary-markdown",
    label: "Primary human handoff",
    path: "packages/use-cases/university/reporting/target/summary.md",
    format: "markdown",
    producedBy: "./run.sh university-summary",
    purpose:
      "One-page Markdown digest for engineers, operators, and reviewers.",
  },
  primaryMachine: {
    artifactId: "university-report-summary-json",
    label: "Primary machine handoff",
    path: "packages/use-cases/university/reporting/target/summary.json",
    format: "json",
    producedBy: "./run.sh university-summary",
    purpose:
      "Stable JSON summary for tooling, CI artifacts, and downstream dashboards.",
  },
  sourceManifestJson: {
    artifactId: "university-report-artifact-manifest-json",
    label: "Source artifact manifest",
    path: "packages/use-cases/university/reporting/target/artifact-manifest.json",
    format: "json",
    producedBy: "./run.sh university-summary",
    purpose:
      "Machine-readable source-artifact index with schema versions, sizes, and SHA-256 digests.",
  },
  sourceManifestMarkdown: {
    artifactId: "university-report-artifact-manifest-markdown",
    label: "Source artifact manifest digest",
    path: "packages/use-cases/university/reporting/target/artifact-manifest.md",
    format: "markdown",
    producedBy: "./run.sh university-summary",
    purpose:
      "Human-readable source-artifact index for quick provenance checks.",
  },
} as const satisfies Omit<
  UniversityReportHandoff,
  "sourceArtifactIds" | "notes"
>;

const buildUniversityReportHandoff = (
  manifest: UniversityArtifactManifest,
): UniversityReportHandoff => ({
  ...universityReportHandoffArtifacts,
  sourceArtifactIds: manifest.entries.map((entry) => entry.artifactId),
  notes: [
    "Use summary.md as the human handoff and summary.json as the tool handoff.",
    "Use artifact-manifest.json when a consumer needs to verify which source artifacts were summarized.",
    "The Serenity site and raw transcript/stress/batch artifacts remain source evidence, not the default handoff surface.",
  ],
});

export type UniversityArtifactPaths = {
  readonly serenityDirectory: string;
  readonly transcriptExportPath: string;
  readonly stressSummaryPath: string;
  readonly batchSweepSummaryPath: string;
  readonly artifactBaseDirectory: string;
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
  typeof value === "object" && value !== null && !Array.isArray(value);

const hashBuffer = (buffer: Uint8Array): string =>
  createHash("sha256").update(buffer).digest("hex");

const portableArtifactPath = (
  artifactPath: string,
  artifactBaseDirectory: string,
): string =>
  (path.relative(artifactBaseDirectory, artifactPath) || ".")
    .split(path.sep)
    .join("/");

const buildFileArtifactManifestEntry = ({
  artifactId,
  label,
  filePath,
  artifactBaseDirectory,
  schemaVersion,
  producedBy,
  purpose,
}: {
  readonly artifactId: string;
  readonly label: string;
  readonly filePath: string;
  readonly artifactBaseDirectory: string;
  readonly schemaVersion: string;
  readonly producedBy: string;
  readonly purpose: string;
}): UniversityArtifactManifestEntry => {
  const bytes = readFileSync(filePath);

  return {
    artifactId,
    label,
    path: portableArtifactPath(filePath, artifactBaseDirectory),
    format: "university-json-artifact",
    schemaVersion,
    producedBy,
    purpose,
    bytes: bytes.byteLength,
    sha256: hashBuffer(bytes),
    fileCount: 1,
  };
};

const buildSerenityArtifactManifestEntry = (
  serenityDirectory: string,
  artifactBaseDirectory: string,
  scenarioCount: number,
): UniversityArtifactManifestEntry => {
  const jsonFiles = readdirSync(serenityDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const hash = createHash("sha256");
  let totalBytes = 0;

  for (const jsonFile of jsonFiles) {
    const filePath = path.join(serenityDirectory, jsonFile);
    const bytes = readFileSync(filePath);
    totalBytes += bytes.byteLength;
    hash.update(jsonFile);
    hash.update("\0");
    hash.update(bytes);
  }

  return {
    artifactId: "readable-bdd-serenity",
    label: "Readable BDD Serenity JSON",
    path: portableArtifactPath(serenityDirectory, artifactBaseDirectory),
    format: "serenity-json-directory",
    schemaVersion: null,
    producedBy: "./run.sh university-bdd",
    purpose: `Readable university BDD scenario JSON; ${scenarioCount} latest scenario titles are summarized by the report`,
    bytes: totalBytes,
    sha256: hash.digest("hex"),
    fileCount: jsonFiles.length,
  };
};

const buildUniversityArtifactManifest = ({
  artifactPaths,
  serenityScenarioCount,
  transcriptSchemaVersion,
  stressSchemaVersion,
  batchSweepSchemaVersion,
}: {
  readonly artifactPaths: UniversityArtifactPaths;
  readonly serenityScenarioCount: number;
  readonly transcriptSchemaVersion: string;
  readonly stressSchemaVersion: string;
  readonly batchSweepSchemaVersion: string;
}): UniversityArtifactManifest => {
  const artifactBaseDirectory = path.resolve(
    artifactPaths.artifactBaseDirectory,
  );
  const entries = [
    buildSerenityArtifactManifestEntry(
      artifactPaths.serenityDirectory,
      artifactBaseDirectory,
      serenityScenarioCount,
    ),
    buildFileArtifactManifestEntry({
      artifactId: "readable-protocol-transcript",
      label: "Readable protocol transcript export",
      filePath: artifactPaths.transcriptExportPath,
      artifactBaseDirectory,
      schemaVersion: transcriptSchemaVersion,
      producedBy: "./run.sh university-protocol-export",
      purpose: "student, issuer, employer, and mall protocol DTO transcript",
    }),
    buildFileArtifactManifestEntry({
      artifactId: "stress-protocol-summary",
      label: "Stress protocol summary",
      filePath: artifactPaths.stressSummaryPath,
      artifactBaseDirectory,
      schemaVersion: stressSchemaVersion,
      producedBy: "./run.sh university-protocol-stress",
      purpose: "100-student throughput and rejection summary",
    }),
    buildFileArtifactManifestEntry({
      artifactId: "issuer-batch-sweep-summary",
      label: "Issuer batch-sweep summary",
      filePath: artifactPaths.batchSweepSummaryPath,
      artifactBaseDirectory,
      schemaVersion: batchSweepSchemaVersion,
      producedBy: "./run.sh university-batch-sweep",
      purpose: "batch size and compile-concurrency projection summary",
    }),
  ];

  return {
    manifestSchemaVersion: UNIVERSITY_ARTIFACT_MANIFEST_SCHEMA_VERSION,
    artifactSet: "midnight-university-reporting-inputs",
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    entries,
    notes: [
      "Hashes are deterministic SHA-256 digests over source artifact bytes.",
      "The Serenity directory hash includes each JSON filename before its file bytes so renamed files change the digest.",
      "The manifest is an index over already-rendered artifacts; missing source artifacts fail summary rendering instead of producing partial reports.",
    ],
  };
};

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
  const artifactManifest = buildUniversityArtifactManifest({
    artifactPaths,
    serenityScenarioCount: serenityRecords.length,
    transcriptSchemaVersion: transcriptExport.schemaVersion,
    stressSchemaVersion: stressSummary.schemaVersion,
    batchSweepSchemaVersion: batchSweep.schemaVersion,
  });

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
    sources: {
      serenityDirectory: artifactPaths.serenityDirectory,
      transcriptExportPath: artifactPaths.transcriptExportPath,
      stressSummaryPath: artifactPaths.stressSummaryPath,
      batchSweepSummaryPath: artifactPaths.batchSweepSummaryPath,
    },
    handoff: buildUniversityReportHandoff(artifactManifest),
    artifactManifest,
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

const isUniversityArtifactManifestEntry = (
  value: unknown,
): value is UniversityArtifactManifestEntry =>
  isRecord(value) &&
  typeof value.artifactId === "string" &&
  typeof value.label === "string" &&
  typeof value.path === "string" &&
  (value.format === "serenity-json-directory" ||
    value.format === "university-json-artifact") &&
  (typeof value.schemaVersion === "string" || value.schemaVersion === null) &&
  typeof value.producedBy === "string" &&
  typeof value.purpose === "string" &&
  typeof value.bytes === "number" &&
  Number.isInteger(value.bytes) &&
  value.bytes >= 0 &&
  typeof value.sha256 === "string" &&
  /^[a-f0-9]{64}$/u.test(value.sha256) &&
  typeof value.fileCount === "number" &&
  Number.isInteger(value.fileCount) &&
  value.fileCount >= 0;

const isUniversityArtifactManifest = (
  value: unknown,
): value is UniversityArtifactManifest =>
  isRecord(value) &&
  value.manifestSchemaVersion === UNIVERSITY_ARTIFACT_MANIFEST_SCHEMA_VERSION &&
  value.artifactSet === "midnight-university-reporting-inputs" &&
  typeof value.totalBytes === "number" &&
  Number.isInteger(value.totalBytes) &&
  value.totalBytes >= 0 &&
  Array.isArray(value.entries) &&
  value.entries.every(isUniversityArtifactManifestEntry) &&
  Array.isArray(value.notes) &&
  value.notes.every((entry) => typeof entry === "string");

const isUniversityReportHandoffArtifact = (
  value: unknown,
): value is UniversityReportHandoffArtifact =>
  isRecord(value) &&
  typeof value.artifactId === "string" &&
  typeof value.label === "string" &&
  typeof value.path === "string" &&
  (value.format === "json" || value.format === "markdown") &&
  typeof value.producedBy === "string" &&
  typeof value.purpose === "string";

const isUniversityReportHandoff = (
  value: unknown,
): value is UniversityReportHandoff =>
  isRecord(value) &&
  isUniversityReportHandoffArtifact(value.primaryHuman) &&
  isUniversityReportHandoffArtifact(value.primaryMachine) &&
  isUniversityReportHandoffArtifact(value.sourceManifestJson) &&
  isUniversityReportHandoffArtifact(value.sourceManifestMarkdown) &&
  Array.isArray(value.sourceArtifactIds) &&
  value.sourceArtifactIds.every((entry) => typeof entry === "string") &&
  Array.isArray(value.notes) &&
  value.notes.every((entry) => typeof entry === "string");

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
    isUniversityReportHandoff(value.handoff) &&
    isUniversityArtifactManifest(value.artifactManifest) &&
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

export const renderUniversityArtifactManifestMarkdown = (
  manifest: UniversityArtifactManifest,
): string => {
  const lines = [
    "# University Artifact Manifest",
    "",
    `- schema version: ${manifest.manifestSchemaVersion}`,
    `- artifact set: ${manifest.artifactSet}`,
    `- total bytes: ${manifest.totalBytes}`,
    "",
    "| artifact | format | schema version | files | bytes | sha256 | produced by |",
    "| --- | --- | --- | ---: | ---: | --- | --- |",
    ...manifest.entries.map(
      (entry) =>
        `| ${entry.label} | ${entry.format} | ${entry.schemaVersion ?? "n/a"} | ${entry.fileCount} | ${entry.bytes} | ${entry.sha256} | \`${entry.producedBy}\` |`,
    ),
    "",
    "## Purposes",
    ...manifest.entries.map(
      (entry) => `- ${entry.artifactId}: ${entry.purpose}`,
    ),
    "",
    "## Notes",
    ...manifest.notes.map((note) => `- ${note}`),
    "",
  ];

  return `${lines.join("\n")}\n`;
};

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
    "## Handoff Contract",
    `- human handoff: ${summary.handoff.primaryHuman.path}`,
    `- machine handoff: ${summary.handoff.primaryMachine.path}`,
    `- source manifest: ${summary.handoff.sourceManifestJson.path}`,
    `- source artifact ids: ${summary.handoff.sourceArtifactIds.join(", ")}`,
    ...summary.handoff.notes.map((note) => `- ${note}`),
    "",
    "## Source Artifact Manifest",
    `- total bytes: ${summary.artifactManifest.totalBytes}`,
    "",
    "| artifact | schema version | files | bytes | sha256 |",
    "| --- | --- | ---: | ---: | --- |",
    ...summary.artifactManifest.entries.map(
      (entry) =>
        `| ${entry.label} | ${entry.schemaVersion ?? "n/a"} | ${entry.fileCount} | ${entry.bytes} | ${entry.sha256} |`,
    ),
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
