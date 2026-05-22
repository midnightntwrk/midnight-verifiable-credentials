import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertUniversityProtocolTranscriptExportConforms,
  buildUniversityProtocolTranscriptExport,
  isUniversityProtocolTranscriptExport,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID,
  UniversityProtocolFlowRunner,
} from "../index.js";

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "golden",
);

const readGolden = (name: string): unknown =>
  JSON.parse(readFileSync(path.join(fixtureDir, name), "utf8")) as unknown;

describe("university protocol transcript schema contract", () => {
  it("accepts the current live export and the checked-in golden export", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolTranscriptExport(
      runner,
      runner.runAll(),
    );

    expect(isUniversityProtocolTranscriptExport(exported)).toBe(true);
    expect(() => assertUniversityProtocolTranscriptExportConforms(exported)).not.toThrow();
    expect(() =>
      assertUniversityProtocolTranscriptExportConforms(
        readGolden("transcript-export.golden.json"),
      ),
    ).not.toThrow();
  });

  it("rejects an unsupported schema id", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolTranscriptExport(
      runner,
      runner.runAll(),
    );

    expect(() =>
      assertUniversityProtocolTranscriptExportConforms({
        ...exported,
        schemaId: `${UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID}-v2`,
      }),
    ).toThrow(/schema id/);
  });

  it("rejects an unsupported schema version or compatibility window", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolTranscriptExport(
      runner,
      runner.runAll(),
    );

    expect(() =>
      assertUniversityProtocolTranscriptExportConforms({
        ...exported,
        schemaVersion: "midnight-university-protocol-export.v2",
      }),
    ).toThrow(/schema version/);

    expect(() =>
      assertUniversityProtocolTranscriptExportConforms({
        ...exported,
        compatibility: {
          ...UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
          minimumReaderVersion: "midnight-university-protocol-export.v0",
        },
      }),
    ).toThrow(/minimum reader version/);

    expect(() =>
      assertUniversityProtocolTranscriptExportConforms({
        ...exported,
        compatibility: {
          ...UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
          maximumReaderVersion: "midnight-university-protocol-export.v2",
        },
      }),
    ).toThrow(/maximum reader version/);
  });

  it("rejects malformed privacy profile metadata", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolTranscriptExport(
      runner,
      runner.runAll(),
    );

    expect(() =>
      assertUniversityProtocolTranscriptExportConforms({
        ...exported,
        privacyProfile: {
          ...exported.privacyProfile,
          productionPublicClaimFields: "universityName",
        },
      }),
    ).toThrow(/productionPublicClaimFields/);

    expect(() =>
      assertUniversityProtocolTranscriptExportConforms({
        ...exported,
        privacyProfile: {
          ...exported.privacyProfile,
          predicateOnlyFields: ["finalGrade", 120],
        },
      }),
    ).toThrow(/predicateOnlyFields\[1\]/);
  });
});
