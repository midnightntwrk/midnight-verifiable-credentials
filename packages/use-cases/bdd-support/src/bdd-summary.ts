import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type CucumberJsonStep = {
  readonly keyword?: string;
  readonly name?: string;
  readonly result?: {
    readonly status?: string;
    readonly duration?: number;
    readonly error_message?: string;
  };
};

export type CucumberJsonScenario = {
  readonly keyword?: string;
  readonly name?: string;
  readonly type?: string;
  readonly tags?: ReadonlyArray<{ readonly name?: string }>;
  readonly steps?: readonly CucumberJsonStep[];
};

export type CucumberJsonFeature = {
  readonly uri?: string;
  readonly name?: string;
  readonly description?: string;
  readonly elements?: readonly CucumberJsonScenario[];
};

export type BddSummaryStatus =
  | "passed"
  | "failed"
  | "ambiguous"
  | "undefined"
  | "pending"
  | "skipped"
  | "unknown";

export type BddScenarioSummary = {
  readonly featureName: string;
  readonly featureUri: string;
  readonly scenarioName: string;
  readonly tags: readonly string[];
  readonly status: BddSummaryStatus;
  readonly stepCounts: Readonly<Record<BddSummaryStatus, number>>;
  readonly stepCount: number;
  readonly durationMs: number;
  readonly failedStep?: {
    readonly keyword: string;
    readonly name: string;
    readonly status: BddSummaryStatus;
    readonly errorMessage?: string;
  };
};

export type BddSummary = {
  readonly schemaVersion: "midnight-bdd-summary.v1";
  readonly title: string;
  readonly generatedAtIso: string;
  readonly source: {
    readonly cucumberJsonPath: string;
    readonly featureRoot?: string;
  };
  readonly totals: {
    readonly features: number;
    readonly scenarios: number;
    readonly steps: number;
    readonly durationMs: number;
    readonly statuses: Readonly<Record<BddSummaryStatus, number>>;
  };
  readonly scenarios: readonly BddScenarioSummary[];
};

export type BuildBddSummaryOptions = {
  readonly title: string;
  readonly cucumberJsonPath: string;
  readonly featureRoot?: string;
  readonly generatedAtIso?: string;
};

export type WriteBddSummaryArtifactsOptions = {
  readonly targetDir: string;
  readonly summary: BddSummary;
};

const statusOrder = [
  "failed",
  "ambiguous",
  "undefined",
  "pending",
  "skipped",
  "passed",
  "unknown",
] as const satisfies readonly BddSummaryStatus[];

const emptyStatusCounts = (): Record<BddSummaryStatus, number> => ({
  passed: 0,
  failed: 0,
  ambiguous: 0,
  undefined: 0,
  pending: 0,
  skipped: 0,
  unknown: 0,
});

const normalizeStatus = (status: string | undefined): BddSummaryStatus => {
  const normalized = status?.trim().toLowerCase();
  if (
    normalized === "passed" ||
    normalized === "failed" ||
    normalized === "ambiguous" ||
    normalized === "undefined" ||
    normalized === "pending" ||
    normalized === "skipped"
  ) {
    return normalized;
  }
  return "unknown";
};

const scenarioStatus = (
  stepCounts: Readonly<Record<BddSummaryStatus, number>>,
): BddSummaryStatus => {
  // Cucumber reports skipped/pending/undefined steps as non-passing evidence;
  // the first non-passing status wins so a mostly green scenario is not hidden.
  for (const status of statusOrder) {
    if (stepCounts[status] > 0) {
      return status;
    }
  }
  return "unknown";
};

const durationNanosToMs = (durationNanos: number | undefined): number =>
  typeof durationNanos === "number" && Number.isFinite(durationNanos)
    ? durationNanos / 1_000_000
    : 0;

const roundMilliseconds = (durationMs: number): number =>
  Number(durationMs.toFixed(3));

const normalizeText = (value: string | undefined, fallback: string): string => {
  const normalized = value?.replaceAll(/\s+/gu, " ").trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
};

const tableCell = (value: string): string =>
  value.replaceAll(/\s+/gu, " ").replaceAll("|", "\\|").trim();

export const buildBddSummary = (
  features: readonly CucumberJsonFeature[],
  options: BuildBddSummaryOptions,
): BddSummary => {
  const scenarios = features.flatMap((feature) => {
    const featureName = normalizeText(feature.name, "(unnamed feature)");
    const featureUri = normalizeText(feature.uri, "(unknown feature path)");
    const scenarioElements =
      feature.elements?.filter(
        (element) => element.type === undefined || element.type === "scenario",
      ) ?? [];

    return scenarioElements.map((scenario) => {
      const stepCounts = emptyStatusCounts();
      const steps = scenario.steps ?? [];
      let durationMs = 0;
      let failedStep: BddScenarioSummary["failedStep"];

      for (const step of steps) {
        const status = normalizeStatus(step.result?.status);
        stepCounts[status] += 1;
        durationMs += durationNanosToMs(step.result?.duration);

        if (!failedStep && status !== "passed" && status !== "skipped") {
          failedStep = {
            keyword: normalizeText(step.keyword, ""),
            name: normalizeText(step.name, "(unnamed step)"),
            status,
            errorMessage: step.result?.error_message,
          };
        }
      }

      return {
        featureName,
        featureUri,
        scenarioName: normalizeText(scenario.name, "(unnamed scenario)"),
        tags:
          scenario.tags
            ?.map((tag) => normalizeText(tag.name, ""))
            .filter((tag) => tag.length > 0) ?? [],
        status: scenarioStatus(stepCounts),
        stepCounts,
        stepCount: steps.length,
        durationMs: roundMilliseconds(durationMs),
        ...(failedStep ? { failedStep } : {}),
      };
    });
  });

  const statuses = emptyStatusCounts();
  let stepCount = 0;
  let durationMs = 0;
  for (const scenario of scenarios) {
    statuses[scenario.status] += 1;
    stepCount += scenario.stepCount;
    durationMs += scenario.durationMs;
  }

  return {
    schemaVersion: "midnight-bdd-summary.v1",
    title: options.title,
    generatedAtIso: options.generatedAtIso ?? new Date().toISOString(),
    source: {
      cucumberJsonPath: options.cucumberJsonPath,
      ...(options.featureRoot ? { featureRoot: options.featureRoot } : {}),
    },
    totals: {
      features: features.length,
      scenarios: scenarios.length,
      steps: stepCount,
      durationMs: roundMilliseconds(durationMs),
      statuses,
    },
    scenarios,
  };
};

export const buildBddSummaryFromCucumberJsonFile = async (
  options: BuildBddSummaryOptions,
): Promise<BddSummary> => {
  const raw = await readFile(options.cucumberJsonPath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected Cucumber JSON array in ${options.cucumberJsonPath}`,
    );
  }
  return buildBddSummary(parsed as CucumberJsonFeature[], options);
};

export const renderBddSummaryMarkdown = (summary: BddSummary): string => {
  const statusLine = statusOrder
    .map((status) => `${status}: ${summary.totals.statuses[status]}`)
    .join(", ");
  const scenarioRows = summary.scenarios.map((scenario) => {
    const tags = scenario.tags.length > 0 ? scenario.tags.join(", ") : "-";
    const failedStep = scenario.failedStep
      ? `${scenario.failedStep.keyword} ${scenario.failedStep.name}`.trim()
      : "-";
    return [
      tableCell(scenario.featureName),
      tableCell(scenario.scenarioName),
      tableCell(tags),
      scenario.status,
      String(scenario.stepCount),
      scenario.durationMs.toFixed(3),
      tableCell(failedStep),
    ].join(" | ");
  });

  return [
    `# ${summary.title}`,
    "",
    `- Schema: \`${summary.schemaVersion}\``,
    `- Generated: ${summary.generatedAtIso}`,
    `- Source: \`${summary.source.cucumberJsonPath}\``,
    summary.source.featureRoot
      ? `- Feature root: \`${summary.source.featureRoot}\``
      : undefined,
    `- Totals: ${summary.totals.features} features, ${summary.totals.scenarios} scenarios, ${summary.totals.steps} steps, ${summary.totals.durationMs.toFixed(3)} ms`,
    `- Scenario statuses: ${statusLine}`,
    "",
    "| feature | scenario | tags | status | steps | duration ms | first non-passing step |",
    "| --- | --- | --- | --- | ---: | ---: | --- |",
    ...scenarioRows.map((row) => `| ${row} |`),
    "",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
};

export const writeBddSummaryArtifacts = async ({
  targetDir,
  summary,
}: WriteBddSummaryArtifactsOptions): Promise<void> => {
  await mkdir(targetDir, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(targetDir, "summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(targetDir, "summary.md"),
      renderBddSummaryMarkdown(summary),
      "utf8",
    ),
  ]);
};
