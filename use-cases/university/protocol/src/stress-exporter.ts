import type { UniversityProtocolFlowResult, UniversityProtocolFlowRunner } from "./flow.js";

type FlowResultBody =
  UniversityProtocolFlowResult["discounts"]["resultsByStudent"][string][number];

export type UniversityProtocolStressSummary = {
  readonly schemaVersion: "midnight-university-protocol-stress-summary.v1";
  readonly datasetProfile: "stress-100";
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
  readonly artifactRetention: {
    readonly targetDir: "use-cases/university/protocol/target/stress-100";
    readonly files: readonly ["summary.json", "summary.md"];
    readonly ciRecommendation: "Upload target/stress-100 as a workflow artifact directory.";
  };
  readonly notes: readonly [
    "Mall discount evaluation remains a fixed-size five-applicant control sample.",
    "Timing and throughput figures are machine-local measurements and should be compared in bands, not as exact constants.",
  ];
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
const fixedNotes = [
  "Mall discount evaluation remains a fixed-size five-applicant control sample.",
  "Timing and throughput figures are machine-local measurements and should be compared in bands, not as exact constants.",
] as const;

export const buildUniversityProtocolStressSummary = (
  runner: UniversityProtocolFlowRunner,
  result: UniversityProtocolFlowResult,
  wallClockMs: number,
): UniversityProtocolStressSummary => ({
  schemaVersion: "midnight-university-protocol-stress-summary.v1",
  datasetProfile: "stress-100",
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
  artifactRetention: {
    targetDir: "use-cases/university/protocol/target/stress-100",
    files: fixedArtifactFiles,
    ciRecommendation: "Upload target/stress-100 as a workflow artifact directory.",
  },
  notes: fixedNotes,
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
    "## Artifact Retention",
    `- target directory: ${summary.artifactRetention.targetDir}`,
    `- files: ${summary.artifactRetention.files.join(", ")}`,
    `- CI recommendation: ${summary.artifactRetention.ciRecommendation}`,
    "",
    "## Notes",
    ...summary.notes.map((note) => `- ${note}`),
    "",
  ].join("\n");
