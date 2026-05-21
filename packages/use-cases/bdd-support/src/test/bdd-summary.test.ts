import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildBddSummary,
  buildBddSummaryFromCucumberJsonFile,
  renderBddSummaryMarkdown,
  writeBddSummaryArtifacts,
  type CucumberJsonFeature,
} from "../bdd-summary.ts";

const cucumberJsonFixture: readonly CucumberJsonFeature[] = [
  {
    uri: "features/age_gate_happy_path.feature",
    name: "Age gate proof",
    elements: [
      {
        type: "scenario",
        name: "Holder proves age",
        tags: [{ name: "@smoke" }],
        steps: [
          {
            keyword: "Given ",
            name: "a holder credential",
            result: { status: "passed", duration: 1_000_000 },
          },
          {
            keyword: "Then ",
            name: "the verifier accepts it",
            result: { status: "passed", duration: 2_500_000 },
          },
        ],
      },
      {
        type: "scenario",
        name: "Revoked holder is rejected",
        tags: [{ name: "@negative" }],
        steps: [
          {
            keyword: "Given ",
            name: "a revoked holder credential",
            result: { status: "passed", duration: 1_000_000 },
          },
          {
            keyword: "Then ",
            name: "the verifier rejects it",
            result: {
              status: "failed",
              duration: 3_000_000,
              error_message: "expected rejection",
            },
          },
        ],
      },
    ],
  },
];

describe("BDD summary support", () => {
  it("builds compact scenario totals from Cucumber JSON features", () => {
    const summary = buildBddSummary(cucumberJsonFixture, {
      title: "Age Gate BDD Summary",
      cucumberJsonPath: "target/cucumber-report.json",
      featureRoot: "features",
      generatedAtIso: "2030-01-01T00:00:00.000Z",
    });

    expect(summary).toMatchObject({
      schemaVersion: "midnight-bdd-summary.v1",
      title: "Age Gate BDD Summary",
      totals: {
        features: 1,
        scenarios: 2,
        steps: 4,
        durationMs: 7.5,
        statuses: {
          passed: 1,
          failed: 1,
        },
      },
    });
    expect(summary.scenarios.map((scenario) => scenario.status)).toEqual([
      "passed",
      "failed",
    ]);
    expect(summary.scenarios[1]?.failedStep).toEqual({
      keyword: "Then",
      name: "the verifier rejects it",
      status: "failed",
      errorMessage: "expected rejection",
    });
  });

  it("renders and writes JSON plus Markdown summary artifacts", async () => {
    const summary = buildBddSummary(cucumberJsonFixture, {
      title: "Age Gate BDD Summary",
      cucumberJsonPath: "target/cucumber-report.json",
      generatedAtIso: "2030-01-01T00:00:00.000Z",
    });
    const markdown = renderBddSummaryMarkdown(summary);
    expect(markdown).toContain("# Age Gate BDD Summary");
    expect(markdown).toContain("| Age gate proof | Holder proves age |");
    expect(markdown).toContain("failed: 1");

    const targetDir = await mkdtemp(path.join(os.tmpdir(), "bdd-summary-"));
    try {
      await writeBddSummaryArtifacts({ targetDir, summary });
      await expect(
        readFile(path.join(targetDir, "summary.json"), "utf8"),
      ).resolves.toContain("midnight-bdd-summary.v1");
      await expect(
        readFile(path.join(targetDir, "summary.md"), "utf8"),
      ).resolves.toContain("Age Gate BDD Summary");
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });

  it("reads Cucumber JSON files and rejects non-array payloads", async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), "bdd-summary-"));
    try {
      const reportPath = path.join(targetDir, "cucumber-report.json");
      await writeFile(reportPath, JSON.stringify(cucumberJsonFixture), "utf8");

      await expect(
        buildBddSummaryFromCucumberJsonFile({
          title: "Age Gate BDD Summary",
          cucumberJsonPath: reportPath,
        }),
      ).resolves.toMatchObject({
        totals: { features: 1, scenarios: 2 },
      });

      const invalidReportPath = path.join(targetDir, "invalid-report.json");
      await writeFile(invalidReportPath, JSON.stringify({}), "utf8");
      await expect(
        buildBddSummaryFromCucumberJsonFile({
          title: "Invalid BDD Summary",
          cucumberJsonPath: invalidReportPath,
        }),
      ).rejects.toThrow(/Expected Cucumber JSON array/);
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});
