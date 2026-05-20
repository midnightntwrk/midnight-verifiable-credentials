import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  assertUniversityArtifactSummaryConforms,
  buildUniversityArtifactSummary,
  renderUniversityArtifactManifestMarkdown,
  renderUniversityArtifactSummaryMarkdown,
  UNIVERSITY_ARTIFACT_MANIFEST_SCHEMA_VERSION,
  UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID,
  UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION,
} from "../index.js";

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);
const goldenDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "golden",
);
const serenityDirectory = path.join(fixtureDir, "serenity");

const readGolden = (name: string): string =>
  readFileSync(path.join(goldenDir, name), "utf8");

const normalizeFixturePaths = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replaceAll(fixtureDir, "<fixtures>");
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeFixturePaths(entry));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nextValue]) => [
        key,
        normalizeFixturePaths(nextValue),
      ]),
    );
  }
  return value;
};

const renderFixtureSummary = () =>
  buildUniversityArtifactSummary({
    artifactBaseDirectory: fixtureDir,
    serenityDirectory,
    transcriptExportPath: path.join(fixtureDir, "transcript-export.json"),
    stressSummaryPath: path.join(fixtureDir, "stress-summary.json"),
    batchSweepSummaryPath: path.join(fixtureDir, "batch-sweep-summary.json"),
  });

describe("university artifact report summarizer", () => {
  it("builds a conforming one-page summary from the committed fixtures", () => {
    const summary = renderFixtureSummary();

    expect(summary.schemaId).toBe(UNIVERSITY_REPORT_SUMMARY_SCHEMA_ID);
    expect(summary.schemaVersion).toBe(
      UNIVERSITY_REPORT_SUMMARY_SCHEMA_VERSION,
    );
    expect(summary.actors.universityPartyId).toBe("uni-example-001");
    expect(summary.actors.companyNames).toEqual([
      "Blue Ocean Analytics",
      "Northwind Robotics",
      "Pioneer Systems",
    ]);
    expect(summary.readableBdd.scenarioCount).toBe(13);
    expect(summary.artifactManifest.manifestSchemaVersion).toBe(
      UNIVERSITY_ARTIFACT_MANIFEST_SCHEMA_VERSION,
    );
    expect(summary.artifactManifest.entries).toHaveLength(4);
    expect(summary.artifactManifest.entries.map((entry) => entry.artifactId))
      .toEqual([
        "readable-bdd-serenity",
        "readable-protocol-transcript",
        "stress-protocol-summary",
        "issuer-batch-sweep-summary",
      ]);
    expect(summary.readableBdd.passedCount).toBe(13);
    expect(summary.readableBdd.failedCount).toBe(0);
    expect(summary.transcriptExport.counts.totalThreads).toBe(25);
    expect(summary.stressSummary.datasetProfile).toBe("stress-100");
    expect(
      summary.batchSweep.fastestBatchSizeByWallClockCredentialsPerSecond,
    ).toBe(10);
    expect(summary.batchSweep.compileConcurrencyLevels).toEqual([1, 2, 4]);
    expect(summary.batchSweep.bestCompileConcurrencyProjection).toMatchObject({
      batchSize: 5,
      compileConcurrency: 4,
    });
    expect(summary.bottlenecks.slowestStressPhase.phase).toBe(
      "jobApplications",
    );
    expect(() =>
      assertUniversityArtifactSummaryConforms(summary),
    ).not.toThrow();
  });

  it("deduplicates Serenity scenarios by title and keeps the latest run", () => {
    const tempRoot = mkdtempSync(
      path.join(os.tmpdir(), "university-reporting-"),
    );
    const tempSerenityDirectory = path.join(tempRoot, "serenity");
    cpSync(serenityDirectory, tempSerenityDirectory, { recursive: true });

    const duplicatedTitle =
      "10 students successfully create job applications across 3 verifier companies";
    writeFileSync(
      path.join(tempSerenityDirectory, "99.json"),
      `${JSON.stringify(
        {
          title: duplicatedTitle,
          startTime: "2026-05-13T00:00:00.000Z",
          result: "FAILED",
          duration: 999,
          testSource: "synthetic-duplicate.json",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    try {
      const summary = buildUniversityArtifactSummary({
        artifactBaseDirectory: process.cwd(),
        serenityDirectory: tempSerenityDirectory,
        transcriptExportPath: path.join(fixtureDir, "transcript-export.json"),
        stressSummaryPath: path.join(fixtureDir, "stress-summary.json"),
        batchSweepSummaryPath: path.join(
          fixtureDir,
          "batch-sweep-summary.json",
        ),
      });

      expect(summary.readableBdd.scenarioCount).toBe(13);
      expect(summary.readableBdd.failedCount).toBe(1);
      expect(summary.bottlenecks.slowestReadableScenario).toEqual({
        title: duplicatedTitle,
        result: "FAILED",
        durationMs: 999,
        startTime: "2026-05-13T00:00:00.000Z",
      });
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails fast when a required source artifact is missing", () => {
    const tempRoot = mkdtempSync(
      path.join(os.tmpdir(), "university-reporting-"),
    );

    try {
      const validPaths = {
        artifactBaseDirectory: fixtureDir,
        serenityDirectory,
        transcriptExportPath: path.join(fixtureDir, "transcript-export.json"),
        stressSummaryPath: path.join(fixtureDir, "stress-summary.json"),
        batchSweepSummaryPath: path.join(
          fixtureDir,
          "batch-sweep-summary.json",
        ),
      };
      const missingPathCases = [
        {
          label: "Serenity directory",
          override: { serenityDirectory: path.join(tempRoot, "serenity") },
          expectedError: /serenity/u,
        },
        {
          label: "protocol transcript export",
          override: {
            transcriptExportPath: path.join(
              tempRoot,
              "missing-transcript.json",
            ),
          },
          expectedError: /missing-transcript\.json/u,
        },
        {
          label: "stress summary",
          override: {
            stressSummaryPath: path.join(tempRoot, "missing-stress.json"),
          },
          expectedError: /missing-stress\.json/u,
        },
        {
          label: "batch-sweep summary",
          override: {
            batchSweepSummaryPath: path.join(
              tempRoot,
              "missing-batch-sweep.json",
            ),
          },
          expectedError: /missing-batch-sweep\.json/u,
        },
      ];

      for (const { label, override, expectedError } of missingPathCases) {
        expect(
          () =>
            buildUniversityArtifactSummary({
              ...validPaths,
              ...override,
            }),
          label,
        ).toThrow(expectedError);
      }
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("matches the checked-in JSON and Markdown golden summaries", () => {
    const summary = renderFixtureSummary();
    const normalizedSummary = normalizeFixturePaths(summary);
    const normalizedMarkdown = renderUniversityArtifactSummaryMarkdown(
      summary,
    ).replaceAll(fixtureDir, "<fixtures>");
    const normalizedManifestMarkdown = renderUniversityArtifactManifestMarkdown(
      summary.artifactManifest,
    ).replaceAll(fixtureDir, "<fixtures>");

    expect(`${JSON.stringify(normalizedSummary, null, 2)}\n`).toBe(
      readGolden("report-summary.golden.json"),
    );
    expect(normalizedMarkdown).toBe(readGolden("report-summary.golden.md"));
    expect(normalizedManifestMarkdown).toBe(
      readGolden("artifact-manifest.golden.md"),
    );
  });
});
