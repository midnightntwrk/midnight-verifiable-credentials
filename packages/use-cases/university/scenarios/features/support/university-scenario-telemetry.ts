import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

export type UniversityScenarioTimingMetric = {
  readonly name: string;
  readonly durationMs: number;
  readonly tags?: Record<string, string | number | boolean>;
};

export type UniversityStandaloneTimingSummary = {
  readonly schemaVersion: "midnight-university-standalone-timing.v1";
  readonly backendMode: "standalone-hybrid";
  readonly generatedAtIso: string;
  readonly overlayDataDirectory: string;
  readonly artifactRetention: {
    readonly targetDir: string;
    readonly files: readonly ["summary.json", "summary.md"];
  };
  readonly backendMetrics: readonly UniversityScenarioTimingMetric[];
  readonly proofBackendMetrics: readonly UniversityScenarioTimingMetric[];
  readonly metricTotalsMs: Readonly<Record<string, number>>;
  readonly metricCounts: Readonly<Record<string, number>>;
  readonly unclassifiedMetricNames: readonly string[];
  readonly phaseTotalsMs: {
    readonly environmentStart: number;
    readonly walletSync: number;
    readonly didProvision: number;
    readonly overlayGeneration: number;
    readonly environmentShutdown: number;
    readonly proofIssuance: number;
    readonly proofRequestBuild: number;
    readonly proofPresentationBuild: number;
    readonly proofVerification: number;
  };
  readonly notes: readonly string[];
};

export const standaloneTimingArtifactFiles = [
  "summary.json",
  "summary.md",
] as const;

const fixedNotes = [
  "The standalone-hybrid lane provisions real Midnight DIDs, then runs the university credential semantics through the local simulator path.",
  "Proof backend timings are accumulated across Cucumber scenario resets so the artifact can be compared between local standalone runs.",
  "All timings are machine-local measurements and should be compared by relative trend, not exact value.",
] as const;

const cloneMetric = (
  metric: UniversityScenarioTimingMetric,
): UniversityScenarioTimingMetric => ({
  ...metric,
  ...(metric.tags ? { tags: { ...metric.tags } } : {}),
});

const standaloneDidProvisionMetricNames = new Set([
  "standalone_issuer_did_provision_ms",
  "standalone_student_did_provision_ms",
  "standalone_company_did_provision_ms",
  "standalone_mall_did_provision_ms",
]);

const totalMatching = (
  metrics: readonly UniversityScenarioTimingMetric[],
  predicate: (metric: UniversityScenarioTimingMetric) => boolean,
): number =>
  metrics
    .filter(predicate)
    .reduce((total, metric) => total + metric.durationMs, 0);

const isEnvironmentStartMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name === "standalone_environment_start_ms";

const isWalletSyncMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name === "standalone_wallet_sync_ms";

const isDidProvisionMetric = (metric: UniversityScenarioTimingMetric) =>
  standaloneDidProvisionMetricNames.has(metric.name);

const isOverlayGenerationMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name === "standalone_overlay_generation_ms";

const isEnvironmentShutdownMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name === "standalone_environment_shutdown_ms";

const isProofIssuanceMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name === "proof_issue_diploma_ms";

const isProofRequestBuildMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name.startsWith("proof_build_") && metric.name.endsWith("_request_ms");

const isProofPresentationBuildMetric = (
  metric: UniversityScenarioTimingMetric,
) => metric.name === "proof_build_presentation_submission_ms";

const isProofVerificationMetric = (metric: UniversityScenarioTimingMetric) =>
  metric.name.startsWith("proof_verify_");

const isClassifiedMetric = (metric: UniversityScenarioTimingMetric): boolean =>
  isEnvironmentStartMetric(metric) ||
  isWalletSyncMetric(metric) ||
  isDidProvisionMetric(metric) ||
  isOverlayGenerationMetric(metric) ||
  isEnvironmentShutdownMetric(metric) ||
  isProofIssuanceMetric(metric) ||
  isProofRequestBuildMetric(metric) ||
  isProofPresentationBuildMetric(metric) ||
  isProofVerificationMetric(metric);

const unclassifiedMetricNames = (
  metrics: readonly UniversityScenarioTimingMetric[],
): string[] =>
  [
    ...new Set(
      metrics
        .filter((metric) => !isClassifiedMetric(metric))
        .map((metric) => metric.name),
    ),
  ].sort();

const metricTotals = (
  metrics: readonly UniversityScenarioTimingMetric[],
): Record<string, number> => {
  const totals: Record<string, number> = {};
  for (const metric of metrics) {
    totals[metric.name] = (totals[metric.name] ?? 0) + metric.durationMs;
  }
  return totals;
};

const metricCounts = (
  metrics: readonly UniversityScenarioTimingMetric[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const metric of metrics) {
    counts[metric.name] = (counts[metric.name] ?? 0) + 1;
  }
  return counts;
};

export const buildStandaloneTimingSummary = (options: {
  readonly generatedAtIso?: string;
  readonly overlayDataDirectory: string;
  readonly artifactTargetDir: string;
  readonly backendMetrics: readonly UniversityScenarioTimingMetric[];
  readonly proofBackendMetrics: readonly UniversityScenarioTimingMetric[];
}): UniversityStandaloneTimingSummary => {
  const backendMetrics = options.backendMetrics.map(cloneMetric);
  const proofBackendMetrics = options.proofBackendMetrics.map(cloneMetric);
  const allMetrics = [...backendMetrics, ...proofBackendMetrics];

  // Phase totals are intentionally a closed operator-facing view. New protocol
  // metric names should either match one of these predicates or be added here.
  return {
    schemaVersion: "midnight-university-standalone-timing.v1",
    backendMode: "standalone-hybrid",
    generatedAtIso: options.generatedAtIso ?? new Date().toISOString(),
    overlayDataDirectory: options.overlayDataDirectory,
    artifactRetention: {
      targetDir: options.artifactTargetDir,
      files: standaloneTimingArtifactFiles,
    },
    backendMetrics,
    proofBackendMetrics,
    metricTotalsMs: metricTotals(allMetrics),
    metricCounts: metricCounts(allMetrics),
    unclassifiedMetricNames: unclassifiedMetricNames(allMetrics),
    phaseTotalsMs: {
      environmentStart: totalMatching(backendMetrics, isEnvironmentStartMetric),
      walletSync: totalMatching(backendMetrics, isWalletSyncMetric),
      didProvision: totalMatching(backendMetrics, isDidProvisionMetric),
      overlayGeneration: totalMatching(
        backendMetrics,
        isOverlayGenerationMetric,
      ),
      environmentShutdown: totalMatching(
        backendMetrics,
        isEnvironmentShutdownMetric,
      ),
      proofIssuance: totalMatching(proofBackendMetrics, isProofIssuanceMetric),
      proofRequestBuild: totalMatching(
        proofBackendMetrics,
        isProofRequestBuildMetric,
      ),
      proofPresentationBuild: totalMatching(
        proofBackendMetrics,
        isProofPresentationBuildMetric,
      ),
      proofVerification: totalMatching(
        proofBackendMetrics,
        isProofVerificationMetric,
      ),
    },
    notes: fixedNotes,
  };
};

const formatMeasured = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(3) : "n/a";

const renderMetricRows = (
  totals: Readonly<Record<string, number>>,
  counts: Readonly<Record<string, number>>,
): string[] =>
  Object.keys(totals)
    .sort()
    .map(
      (name) =>
        `| ${name} | ${counts[name] ?? 0} | ${formatMeasured(totals[name])} |`,
    );

export const renderStandaloneTimingMarkdown = (
  summary: UniversityStandaloneTimingSummary,
): string => {
  const lines = [
    "# University Standalone Timing Summary",
    "",
    `- schema version: ${summary.schemaVersion}`,
    `- generated at: ${summary.generatedAtIso}`,
    `- backend mode: ${summary.backendMode}`,
    `- overlay data directory: ${summary.overlayDataDirectory}`,
    "",
    "## Phase Totals (ms)",
    "| phase | total ms |",
    "| --- | ---: |",
    `| environment start | ${formatMeasured(summary.phaseTotalsMs.environmentStart)} |`,
    `| wallet sync | ${formatMeasured(summary.phaseTotalsMs.walletSync)} |`,
    `| DID provisioning | ${formatMeasured(summary.phaseTotalsMs.didProvision)} |`,
    `| overlay generation | ${formatMeasured(summary.phaseTotalsMs.overlayGeneration)} |`,
    `| environment shutdown | ${formatMeasured(summary.phaseTotalsMs.environmentShutdown)} |`,
    `| proof issuance | ${formatMeasured(summary.phaseTotalsMs.proofIssuance)} |`,
    `| proof request build | ${formatMeasured(summary.phaseTotalsMs.proofRequestBuild)} |`,
    `| proof presentation build | ${formatMeasured(summary.phaseTotalsMs.proofPresentationBuild)} |`,
    `| proof verification | ${formatMeasured(summary.phaseTotalsMs.proofVerification)} |`,
    "",
    "## Metric Totals (ms)",
    "| metric | count | total ms |",
    "| --- | ---: | ---: |",
    ...renderMetricRows(summary.metricTotalsMs, summary.metricCounts),
    "",
    "## Unclassified Metrics",
    ...(summary.unclassifiedMetricNames.length > 0
      ? summary.unclassifiedMetricNames.map((name) => `- ${name}`)
      : ["- none"]),
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

const writeFileAtomic = (filePath: string, contents: string): void => {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, contents, "utf8");
  renameSync(temporaryPath, filePath);
};

export const writeStandaloneTimingArtifacts = (
  targetDir: string,
  summary: UniversityStandaloneTimingSummary,
): void => {
  // Keep teardown artifact persistence deterministic after the async backend stops.
  mkdirSync(targetDir, { recursive: true });
  writeFileAtomic(
    path.join(targetDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  writeFileAtomic(
    path.join(targetDir, "summary.md"),
    renderStandaloneTimingMarkdown(summary),
  );
};
