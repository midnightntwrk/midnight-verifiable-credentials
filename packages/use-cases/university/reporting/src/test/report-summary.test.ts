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
  UNIVERSITY_REPORT_ARTIFACT_MANIFEST_JSON_PATH,
  UNIVERSITY_REPORT_ARTIFACT_MANIFEST_MARKDOWN_PATH,
  UNIVERSITY_REPORT_SUMMARY_JSON_PATH,
  UNIVERSITY_REPORT_SUMMARY_MARKDOWN_PATH,
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
const transcriptExportPath = path.join(fixtureDir, "transcript-export.json");

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
    transcriptExportPath,
    stressSummaryPath: path.join(fixtureDir, "stress-summary.json"),
    batchSweepSummaryPath: path.join(fixtureDir, "batch-sweep-summary.json"),
  });

const buildSummaryWithTranscript = (nextTranscriptExportPath: string) =>
  buildUniversityArtifactSummary({
    artifactBaseDirectory: fixtureDir,
    serenityDirectory,
    transcriptExportPath: nextTranscriptExportPath,
    stressSummaryPath: path.join(fixtureDir, "stress-summary.json"),
    batchSweepSummaryPath: path.join(fixtureDir, "batch-sweep-summary.json"),
  });

const withMutatedTranscript = (
  mutate: (transcript: Record<string, unknown>) => void,
  assert: (transcriptPath: string) => void,
): void => {
  const tempRoot = mkdtempSync(
    path.join(os.tmpdir(), "university-reporting-"),
  );
  const staleTranscriptPath = path.join(tempRoot, "transcript-export.json");
  const transcript = JSON.parse(
    readFileSync(transcriptExportPath, "utf8"),
  ) as Record<string, unknown>;
  mutate(transcript);
  writeFileSync(staleTranscriptPath, JSON.stringify(transcript, null, 2));

  try {
    assert(staleTranscriptPath);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
};

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
    expect(
      summary.artifactManifest.entries.map((entry) => entry.artifactId),
    ).toEqual([
      "readable-bdd-serenity",
      "readable-protocol-transcript",
      "stress-protocol-summary",
      "issuer-batch-sweep-summary",
    ]);
    expect(summary.handoff.primaryHuman).toMatchObject({
      artifactId: "university-report-summary-markdown",
      path: UNIVERSITY_REPORT_SUMMARY_MARKDOWN_PATH,
      format: "markdown",
    });
    expect(summary.handoff.primaryMachine).toMatchObject({
      artifactId: "university-report-summary-json",
      path: UNIVERSITY_REPORT_SUMMARY_JSON_PATH,
      format: "json",
    });
    expect(summary.handoff.sourceManifestJson).toMatchObject({
      artifactId: "university-report-artifact-manifest-json",
      path: UNIVERSITY_REPORT_ARTIFACT_MANIFEST_JSON_PATH,
      format: "json",
    });
    expect(summary.handoff.sourceManifestMarkdown).toMatchObject({
      artifactId: "university-report-artifact-manifest-markdown",
      path: UNIVERSITY_REPORT_ARTIFACT_MANIFEST_MARKDOWN_PATH,
      format: "markdown",
    });
    expect(summary.handoff.sourceArtifactIds).toEqual(
      summary.artifactManifest.entries.map((entry) => entry.artifactId),
    );
    expect(summary.readableBdd.passedCount).toBe(13);
    expect(summary.readableBdd.failedCount).toBe(0);
    expect(summary.transcriptExport.counts.totalThreads).toBe(25);
    expect(summary.transcriptExport.privacyProfile).toMatchObject({
      currentProfile: "direct-claim-prototype",
      claimCommitmentModel: "none",
      productionProfile: "production-commitment-v2",
    });
    expect(
      summary.transcriptExport.privacyProfile.productionPublicClaimFields,
    ).toEqual(["universityName", "awardName", "graduationYear"]);
    expect(
      summary.transcriptExport.privacyProfile.productionCommitmentFields,
    ).toContain("finalGradeCommitment");
    expect(summary.transcriptExport.privacyProfile.predicateOnlyFields).toEqual(
      ["finalGrade", "creditsEarned"],
    );
    expect(summary.transcriptExport.privacyProfile.openingPolicy).toBe(
      "Production issuance must use high-entropy field-domain-separated openings; deterministic fixture openings are only for tests.",
    );
    expect(summary.transcriptExport.privacyProfile.statement).toBe(
      "The production profile keeps routing facts public and moves stable identifiers plus sensitive academic facts into claim commitments.",
    );
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

  it("rejects a transcript export missing the privacy profile contract", () => {
    withMutatedTranscript(
      (transcript) => {
        delete transcript.privacyProfile;
      },
      (staleTranscriptPath) => {
        expect(() => buildSummaryWithTranscript(staleTranscriptPath)).toThrow(
          /valid privacyProfile block/u,
        );
      },
    );
  });

  it("rejects a stale transcript export schema version", () => {
    withMutatedTranscript(
      (transcript) => {
        transcript.schemaVersion = "midnight-university-protocol-export.v1";
      },
      (staleTranscriptPath) => {
        expect(() => buildSummaryWithTranscript(staleTranscriptPath)).toThrow(
          /midnight-university-protocol-export\.v2/u,
        );
      },
    );
  });

  it("rejects a transcript export with stale reader compatibility", () => {
    withMutatedTranscript(
      (transcript) => {
        transcript.compatibility = {
          minimumReaderVersion: "midnight-university-protocol-export.v2",
          maximumReaderVersion: "midnight-university-protocol-export.v1",
        };
      },
      (staleTranscriptPath) => {
        expect(() => buildSummaryWithTranscript(staleTranscriptPath)).toThrow(
          /reader compatibility/u,
        );
      },
    );
  });

  it("rejects a summary whose privacy profile arrays are malformed", () => {
    const summary = renderFixtureSummary();
    const malformedSummary = {
      ...summary,
      transcriptExport: {
        ...summary.transcriptExport,
        privacyProfile: {
          ...summary.transcriptExport.privacyProfile,
          productionCommitmentCandidates: ["diplomaId", 42],
        },
      },
    };

    expect(() =>
      assertUniversityArtifactSummaryConforms(malformedSummary),
    ).toThrow(/University artifact summary does not match/u);
  });

  it("rejects a handoff contract whose source artifact ids are reordered", () => {
    const summary = renderFixtureSummary();
    const staleSummary = {
      ...summary,
      handoff: {
        ...summary.handoff,
        sourceArtifactIds: [...summary.handoff.sourceArtifactIds].reverse(),
      },
    };

    expect(() => assertUniversityArtifactSummaryConforms(staleSummary)).toThrow(
      /University artifact summary does not match the expected schema/u,
    );
  });

  it("rejects a handoff artifact whose path drifts from the canonical target", () => {
    const summary = renderFixtureSummary();
    const staleSummary = {
      ...summary,
      handoff: {
        ...summary.handoff,
        primaryMachine: {
          ...summary.handoff.primaryMachine,
          path: "packages/use-cases/university/reporting/target/stale-summary.json",
        },
      },
    };

    expect(() => assertUniversityArtifactSummaryConforms(staleSummary)).toThrow(
      /University artifact summary does not match the expected schema/u,
    );
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
