import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertUniversityProtocolTranscriptExportConforms,
  buildUniversityProtocolTranscriptExport,
  renderUniversityProtocolTranscriptMarkdown,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION,
  UniversityProtocolFlowRunner,
} from "../index.js";

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "golden",
);

const readGolden = (name: string): string =>
  readFileSync(path.join(fixtureDir, name), "utf8");

const redactHexStrings = (value: string): string =>
  value.replace(/\b[0-9a-f]{64}\b/gu, "<hex>");

const normalizeGoldenValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return redactHexStrings(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeGoldenValue(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nextValue]) => [
        key,
        normalizeGoldenValue(nextValue),
      ]),
    );
  }
  return value;
};

describe("university protocol transcript exporter", () => {
  it("builds stable thread summaries and rejection breakdowns", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const result = runner.runAll();
    const exported = buildUniversityProtocolTranscriptExport(runner, result);

    expect(exported.schemaId).toBe(
      UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID,
    );
    expect(exported.schemaVersion).toBe(
      UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION,
    );
    expect(exported.compatibility).toEqual(
      UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
    );
    expect(exported.dataset.studentCount).toBe(10);
    expect(exported.dataset.companyCount).toBe(3);
    expect(exported.dataset.discountApplicantCount).toBe(5);
    expect(exported.rejectionBreakdown.jobApplications.byCompany).toHaveLength(3);
    expect(exported.threads.issuance).toHaveLength(10);
    expect(exported.threads.jobApplications).toHaveLength(10);
    expect(exported.threads.discounts).toHaveLength(5);
    expect(exported.counts.totalThreads).toBe(25);
    expect(exported.rejectionBreakdown.discounts.byReason).toEqual([
      {
        reason: "failed assert: University-diploma disclosed final grade is below the verifier minimum",
        count: 2,
      },
    ]);
    expect(() => assertUniversityProtocolTranscriptExportConforms(exported)).not.toThrow();
  });

  it("matches the checked-in JSON golden export", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolTranscriptExport(
      runner,
      runner.runAll(),
    );

    expect(
      `${JSON.stringify(normalizeGoldenValue(exported), null, 2)}\n`,
    ).toBe(
      readGolden("transcript-export.golden.json"),
    );
  });

  it("matches the checked-in Markdown golden export", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const markdown = renderUniversityProtocolTranscriptMarkdown(
      buildUniversityProtocolTranscriptExport(runner, runner.runAll()),
    );

    expect(redactHexStrings(markdown)).toBe(
      readGolden("transcript-export.golden.md"),
    );
  });
});
