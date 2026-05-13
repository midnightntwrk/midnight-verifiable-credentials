import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertUniversityProtocolApplicationDecisionsConforms,
  buildUniversityProtocolApplicationDecisionsExport,
  isUniversityProtocolApplicationDecisions,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
  UniversityProtocolFlowRunner,
} from "../index.js";

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "golden",
);

const readGolden = (name: string): unknown =>
  JSON.parse(readFileSync(path.join(fixtureDir, name), "utf8")) as unknown;

describe("university protocol application decision schema contract", () => {
  it("accepts the current live export and the checked-in golden export", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolApplicationDecisionsExport(
      runner,
      runner.runAll(),
    );

    expect(isUniversityProtocolApplicationDecisions(exported)).toBe(true);
    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms(exported),
    ).not.toThrow();
    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms(
        readGolden("application-decisions-export.golden.json"),
      ),
    ).not.toThrow();
  });

  it("rejects an unsupported schema id", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolApplicationDecisionsExport(
      runner,
      runner.runAll(),
    );

    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms({
        ...exported,
        schemaId: `${UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID}-v2`,
      }),
    ).toThrow(/schema id/);
  });

  it("rejects an unsupported schema version or compatibility window", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolApplicationDecisionsExport(
      runner,
      runner.runAll(),
    );

    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms({
        ...exported,
        schemaVersion: `${UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION}-bad`,
      }),
    ).toThrow(/schema version/);

    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms({
        ...exported,
        compatibility: {
          ...UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
          minimumReaderVersion:
            "midnight-university-protocol-application-decisions.v0",
        },
      }),
    ).toThrow(/minimum reader version/);

    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms({
        ...exported,
        compatibility: {
          ...UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
          maximumReaderVersion:
            "midnight-university-protocol-application-decisions.v2",
        },
      }),
    ).toThrow(/maximum reader version/);
  });
});
