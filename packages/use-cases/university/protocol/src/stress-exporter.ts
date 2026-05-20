import {
  buildUniversityProtocolTranscriptExport,
  type UniversityProtocolThreadExport,
} from "./exporter.js";
import type { UniversityProtocolFlowResult, UniversityProtocolFlowRunner } from "./flow.js";

type FlowResultBody =
  UniversityProtocolFlowResult["discounts"]["resultsByStudent"][string][number];

export type UniversityProtocolSummaryProfileId =
  // readable-10 uses the BDD/reporting path; this stress summary exporter only
  // writes the larger protocol summary artifacts.
  | "cohort-30"
  | "stress-100";

export type UniversityProtocolStressSummary = {
  readonly schemaVersion: "midnight-university-protocol-stress-summary.v2";
  readonly datasetProfile: UniversityProtocolSummaryProfileId;
  readonly dataset: {
    readonly studentCount: number;
    readonly companyCount: number;
    readonly discountApplicantCount: number;
    readonly batchCount: number;
    readonly batchSize: number;
  };
  readonly counts: {
    readonly issuanceRequests: number;
    readonly issuanceResults: number;
    readonly jobApplicationRequests: number;
    readonly jobApplicationSubmissions: number;
    readonly jobApplicationResults: number;
    readonly discountRequests: number;
    readonly discountSubmissions: number;
    readonly discountResults: number;
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
  readonly sampledTranscript: UniversityProtocolSampledTranscriptSummary;
  readonly artifactRetention: {
    readonly targetDir: string;
    readonly files: readonly ["summary.json", "summary.md"];
    readonly ciRecommendation: string;
  };
  readonly notes: readonly string[];
};

type UniversityProtocolTranscriptPhase = "issuance" | "jobApplications" | "discounts";

export type UniversityProtocolThreadSample = {
  readonly phase: UniversityProtocolTranscriptPhase;
  readonly threadIdHex: string;
  readonly studentId: string | null;
  readonly studentName: string | null;
  readonly verifierId: string | null;
  readonly verifierName: string | null;
  readonly requestedRole: string | null;
  readonly messageTypes: readonly string[];
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly entrySummaries: readonly string[];
};

export type UniversityProtocolSampledTranscriptSummary = {
  readonly sampleSizeByPhase: Readonly<Record<UniversityProtocolTranscriptPhase, number>>;
  readonly omittedThreadCounts: Readonly<Record<UniversityProtocolTranscriptPhase, number>>;
  readonly threads: Readonly<
    Record<UniversityProtocolTranscriptPhase, readonly UniversityProtocolThreadSample[]>
  >;
};

export type UniversityProtocolStressSummaryOptions = {
  readonly datasetProfile?: UniversityProtocolSummaryProfileId;
  readonly artifactTargetDir?: string;
  readonly sampledThreadCounts?: Partial<
    Readonly<Record<UniversityProtocolTranscriptPhase, number>>
  >;
};

const compareText = (left: string, right: string): number => left.localeCompare(right);

const companyAcceptedCountsForSummary = (
  counts: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> =>
  Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => compareText(left, right)),
  );

const rejectionReasonsForSummary = (
  messages: readonly UniversityProtocolFlowResult["discounts"]["messages"][number][],
): readonly {
  readonly reason: string;
  readonly count: number;
}[] => {
  const counts = new Map<string, number>();
  for (const message of messages) {
    if (message.type !== "presentation:result") {
      continue;
    }
    const body = message.body as FlowResultBody;
    if (body.accepted || body.rejectionKind !== "verificationFailed") {
      continue;
    }
    counts.set(body.reason, (counts.get(body.reason) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => compareText(left, right))
    .map(([reason, count]) => ({ reason, count }));
};

const uniqueThreadCount = (
  transcript: readonly UniversityProtocolFlowResult["transcript"][number][],
): number =>
  new Set(transcript.map((entry) => entry.threadIdHex)).size;

const ratePerSecond = (count: number, elapsedMs: number): number =>
  elapsedMs > 0 ? count / (elapsedMs / 1000) : count;

const fixedArtifactFiles = ["summary.json", "summary.md"] as const;
const stressProfileNotes = [
  "Mall discount evaluation remains a fixed-size five-applicant control sample.",
  "Timing and throughput figures are machine-local measurements and should be compared in bands, not as exact constants.",
] as const;
const cohortProfileNotes = [
  "The cohort-30 profile increases company, award, role, and mall-discount diversity without making human review as heavy as stress-100.",
  "Timing and throughput figures are machine-local measurements and should be compared in bands, not as exact constants.",
] as const;
const notesForProfile = (
  datasetProfile: UniversityProtocolSummaryProfileId,
): readonly string[] =>
  datasetProfile === "cohort-30" ? cohortProfileNotes : stressProfileNotes;
// Keep summaries scan-friendly: enough examples to show each phase shape
// without turning cohort/stress artifacts into a full transcript dump.
const defaultSampledThreadCounts = {
  issuance: 3,
  jobApplications: 5,
  discounts: 5,
} as const;

const threadSample = (
  thread: UniversityProtocolThreadExport,
): UniversityProtocolThreadSample => ({
  phase: thread.phase,
  threadIdHex: thread.threadIdHex,
  studentId: thread.studentId,
  studentName: thread.studentName,
  verifierId: thread.verifierId,
  verifierName: thread.verifierName,
  requestedRole: thread.requestedRole,
  messageTypes: thread.messageTypes,
  acceptedCount: thread.acceptedCount,
  rejectedCount: thread.rejectedCount,
  entrySummaries: thread.entries.map((entry) => entry.summary),
});

const sampleThreads = (
  threads: readonly UniversityProtocolThreadExport[],
  requestedCount: number,
): readonly UniversityProtocolThreadSample[] =>
  threads.slice(0, requestedCount).map(threadSample);

const buildSampledTranscriptSummary = (
  runner: UniversityProtocolFlowRunner,
  result: UniversityProtocolFlowResult,
  sampledThreadCounts:
    | UniversityProtocolStressSummaryOptions["sampledThreadCounts"]
    | undefined,
): UniversityProtocolSampledTranscriptSummary => {
  const resolvedCounts = {
    ...defaultSampledThreadCounts,
    ...(sampledThreadCounts ?? {}),
  };
  // Build the complete transcript export first so sampled summaries reuse the
  // same grouping/sorting contract as the full transcript artifacts.
  const transcriptExport = buildUniversityProtocolTranscriptExport(runner, result);
  return {
    sampleSizeByPhase: resolvedCounts,
    omittedThreadCounts: {
      issuance: Math.max(
        0,
        transcriptExport.threads.issuance.length - resolvedCounts.issuance,
      ),
      jobApplications: Math.max(
        0,
        transcriptExport.threads.jobApplications.length -
          resolvedCounts.jobApplications,
      ),
      discounts: Math.max(
        0,
        transcriptExport.threads.discounts.length - resolvedCounts.discounts,
      ),
    },
    threads: {
      issuance: sampleThreads(
        transcriptExport.threads.issuance,
        resolvedCounts.issuance,
      ),
      jobApplications: sampleThreads(
        transcriptExport.threads.jobApplications,
        resolvedCounts.jobApplications,
      ),
      discounts: sampleThreads(
        transcriptExport.threads.discounts,
        resolvedCounts.discounts,
      ),
    },
  };
};

export const buildUniversityProtocolStressSummary = (
  runner: UniversityProtocolFlowRunner,
  result: UniversityProtocolFlowResult,
  wallClockMs: number,
  options: UniversityProtocolStressSummaryOptions = {},
): UniversityProtocolStressSummary => ({
  schemaVersion: "midnight-university-protocol-stress-summary.v2",
  datasetProfile: options.datasetProfile ?? "stress-100",
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
    totalThreads: uniqueThreadCount(result.transcript),
  },
  outcomes: {
    acceptedJobApplications: result.jobApplications.acceptedCount,
    companyAcceptedCounts: companyAcceptedCountsForSummary(
      result.jobApplications.companyAcceptedCounts,
    ),
    acceptedDiscounts: result.discounts.acceptedCount,
    rejectedDiscounts: result.discounts.rejectedCount,
  },
  rejections: {
    jobApplications: {
      verificationFailed: result.jobApplications.verificationRejectedCount,
      duplicate: result.jobApplications.duplicateRejectedCount,
    },
    discounts: {
      verificationFailed: result.discounts.verificationRejectedCount,
      duplicate: result.discounts.duplicateRejectedCount,
      byReason: rejectionReasonsForSummary(result.discounts.messages),
    },
  },
  timingsMs: {
    issuance: result.metrics.issuanceMs,
    jobApplications: result.metrics.jobApplicationsMs,
    discounts: result.metrics.discountsMs,
    runnerTotal: result.metrics.totalMs,
    wallClock: wallClockMs,
  },
  throughput: {
    issuanceCredentialsPerSecond: ratePerSecond(
      result.issuance.resultCount,
      result.metrics.issuanceMs,
    ),
    jobApplicationResultsPerSecond: ratePerSecond(
      result.jobApplications.resultCount,
      result.metrics.jobApplicationsMs,
    ),
    discountEvaluationsPerSecond: ratePerSecond(
      result.discounts.resultCount,
      result.metrics.discountsMs,
    ),
    transcriptEntriesPerSecond: ratePerSecond(result.transcript.length, wallClockMs),
  },
  sampledTranscript: buildSampledTranscriptSummary(
    runner,
    result,
    options.sampledThreadCounts,
  ),
  artifactRetention: {
    targetDir:
      options.artifactTargetDir ??
      `packages/use-cases/university/protocol/target/${options.datasetProfile ?? "stress-100"}`,
    files: fixedArtifactFiles,
    ciRecommendation: `Upload target/${options.datasetProfile ?? "stress-100"} as a workflow artifact directory.`,
  },
  notes: [
    ...notesForProfile(options.datasetProfile ?? "stress-100"),
    "Sampled transcript views keep profile summaries readable; use transcript exports when full DTO payloads are required.",
  ],
});

const formatMeasured = (value: number): string => value.toFixed(2);

const renderRecordLines = (
  heading: string,
  value: Readonly<Record<string, number>>,
): string[] => [
  heading,
  ...Object.entries(value)
    .sort(([left], [right]) => compareText(left, right))
    .map(([key, count]) => `  - ${key}: ${count}`),
];

export const renderUniversityProtocolStressSummaryMarkdown = (
  summary: UniversityProtocolStressSummary,
): string =>
  [
    "# University Protocol Stress Summary",
    "",
    `- schema version: ${summary.schemaVersion}`,
    `- dataset profile: ${summary.datasetProfile}`,
    "",
    "## Dataset",
    `- students: ${summary.dataset.studentCount}`,
    `- companies: ${summary.dataset.companyCount}`,
    `- discount applicants: ${summary.dataset.discountApplicantCount}`,
    `- issuance batches: ${summary.dataset.batchCount}`,
    `- configured batch size: ${summary.dataset.batchSize}`,
    "",
    "## Counts",
    `- issuance requests: ${summary.counts.issuanceRequests}`,
    `- issuance results: ${summary.counts.issuanceResults}`,
    `- job application requests: ${summary.counts.jobApplicationRequests}`,
    `- job application submissions: ${summary.counts.jobApplicationSubmissions}`,
    `- job application results: ${summary.counts.jobApplicationResults}`,
    `- discount requests: ${summary.counts.discountRequests}`,
    `- discount submissions: ${summary.counts.discountSubmissions}`,
    `- discount results: ${summary.counts.discountResults}`,
    `- transcript entries: ${summary.counts.transcriptEntries}`,
    `- total threads: ${summary.counts.totalThreads}`,
    "",
    "## Outcomes",
    `- accepted job applications: ${summary.outcomes.acceptedJobApplications}`,
    ...renderRecordLines(
      "- company accepted counts:",
      summary.outcomes.companyAcceptedCounts,
    ),
    `- accepted discounts: ${summary.outcomes.acceptedDiscounts}`,
    `- rejected discounts: ${summary.outcomes.rejectedDiscounts}`,
    "",
    "## Rejections",
    "- job applications:",
    `  - verificationFailed: ${summary.rejections.jobApplications.verificationFailed}`,
    `  - duplicate: ${summary.rejections.jobApplications.duplicate}`,
    "- discounts:",
    `  - verificationFailed: ${summary.rejections.discounts.verificationFailed}`,
    `  - duplicate: ${summary.rejections.discounts.duplicate}`,
    "  - by reason:",
    ...summary.rejections.discounts.byReason.map(
      ({ reason, count }) => `    - ${reason}: ${count}`,
    ),
    "",
    "## Timings (ms)",
    `- issuance: ${formatMeasured(summary.timingsMs.issuance)}`,
    `- jobApplications: ${formatMeasured(summary.timingsMs.jobApplications)}`,
    `- discounts: ${formatMeasured(summary.timingsMs.discounts)}`,
    `- runnerTotal: ${formatMeasured(summary.timingsMs.runnerTotal)}`,
    `- wallClock: ${formatMeasured(summary.timingsMs.wallClock)}`,
    "",
    "## Throughput",
    `- issuanceCredentialsPerSecond: ${formatMeasured(
      summary.throughput.issuanceCredentialsPerSecond,
    )}`,
    `- jobApplicationResultsPerSecond: ${formatMeasured(
      summary.throughput.jobApplicationResultsPerSecond,
    )}`,
    `- discountEvaluationsPerSecond: ${formatMeasured(
      summary.throughput.discountEvaluationsPerSecond,
    )}`,
    `- transcriptEntriesPerSecond: ${formatMeasured(
      summary.throughput.transcriptEntriesPerSecond,
    )}`,
    "",
    "## Sampled Transcript",
    `- issuance samples: ${summary.sampledTranscript.threads.issuance.length} shown, ${summary.sampledTranscript.omittedThreadCounts.issuance} omitted`,
    `- job application samples: ${summary.sampledTranscript.threads.jobApplications.length} shown, ${summary.sampledTranscript.omittedThreadCounts.jobApplications} omitted`,
    `- discount samples: ${summary.sampledTranscript.threads.discounts.length} shown, ${summary.sampledTranscript.omittedThreadCounts.discounts} omitted`,
    "",
    "### Issuance Samples",
    ...summary.sampledTranscript.threads.issuance.flatMap((thread) => [
      `- ${thread.studentName ?? thread.studentId ?? thread.threadIdHex}: ${thread.entrySummaries.join(" -> ")}`,
    ]),
    "",
    "### Job Application Samples",
    ...summary.sampledTranscript.threads.jobApplications.flatMap((thread) => [
      `- ${thread.studentName ?? thread.studentId ?? thread.threadIdHex} to ${thread.verifierName ?? thread.verifierId ?? "unknown verifier"}: ${thread.entrySummaries.join(" -> ")}`,
    ]),
    "",
    "### Discount Samples",
    ...summary.sampledTranscript.threads.discounts.flatMap((thread) => [
      `- ${thread.studentName ?? thread.studentId ?? thread.threadIdHex} to ${thread.verifierName ?? thread.verifierId ?? "unknown verifier"}: ${thread.entrySummaries.join(" -> ")}`,
    ]),
    "",
    "## Artifact Retention",
    `- target directory: ${summary.artifactRetention.targetDir}`,
    `- files: ${summary.artifactRetention.files.join(", ")}`,
    `- CI recommendation: ${summary.artifactRetention.ciRecommendation}`,
    "",
    "## Notes",
    ...summary.notes.map((note) => `- ${note}`),
    "",
  ].join("\n");
