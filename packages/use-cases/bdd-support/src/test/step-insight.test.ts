import { describe, expect, it } from "vitest";

import {
  buildVersionedStepInsightReport,
  collectVersionedStepInsight,
  sanitizeStepInsightValue,
  serializeStepInsightReport,
  type StepInsightArtifactCollector,
} from "../step-insight.ts";

describe("BDD step insight support", () => {
  it("normalizes report DTOs into compact JSON-safe values", () => {
    const dto = {
      count: 2n,
      root: new Uint8Array([0, 1, 2, 255]),
      nested: [{ note: "line one\nline two", accepted: true }],
      nullable: null,
    };

    expect(sanitizeStepInsightValue(dto)).toEqual({
      count: "2",
      root: "000102ff",
      nested: [{ note: "line one line two", accepted: true }],
      nullable: null,
    });
  });

  it("builds stable versioned compact report envelopes", () => {
    const report = buildVersionedStepInsightReport(
      "midnight-test-step-insight.v1",
      "Contract check step insight",
      {
        request: "request line one\nrequest line two",
        response: "response line one\nresponse line two",
        checks: ["check line one\ncheck line two"],
        dto: { amount: 3n },
      },
    );

    expect(report).toEqual({
      schemaVersion: "midnight-test-step-insight.v1",
      title: "Contract check step insight",
      request: "request line one request line two",
      response: "response line one response line two",
      checks: ["check line one check line two"],
      dto: { amount: "3" },
    });
    expect(serializeStepInsightReport(report)).not.toContain("\\n");
  });

  it("collects a serialized LogEntry with the expected Serenity artifact name", () => {
    const collected: Array<Parameters<StepInsightArtifactCollector["collect"]>> =
      [];
    const collector: StepInsightArtifactCollector = {
      collect: (...args) => {
        collected.push(args);
      },
    };

    collectVersionedStepInsight(
      collector,
      "midnight-test-step-insight.v1",
      "Collector step insight",
      {
        request: "request",
        response: "response",
        checks: ["check"],
        dto: { ok: true },
      },
    );

    expect(collected).toHaveLength(1);
    const [[artifact, name]] = collected;
    expect(name.value).toBe("Collector step insight");
    expect(artifact.map((value) => value)).toEqual({
      data: JSON.stringify({
        schemaVersion: "midnight-test-step-insight.v1",
        title: "Collector step insight",
        request: "request",
        response: "response",
        checks: ["check"],
        dto: { ok: true },
      }),
    });
  });
});
