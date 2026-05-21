import { LogEntry, Name } from "@serenity-js/core/model";

export const AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION =
  "midnight-age-gate-step-insight.v1" as const;

export type AgeGateStepInsightPayload = {
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

export type AgeGateStepInsightReport = {
  readonly schemaVersion: typeof AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION;
  readonly title: string;
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

type SerenityArtifactCollector = {
  collect: (artifact: LogEntry, name: Name) => void;
};

const normalizeReportString = (value: string): string =>
  value.replaceAll(/\s*(?:\r\n|\r|\n)\s*/gu, " ");

const bytesToHex = (value: Uint8Array): string =>
  Buffer.from(value).toString("hex");

// Step insight DTOs are expected to be plain JSON-like values plus bigint/bytes.
export const sanitizeForAgeGateStepInsight = (value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    return normalizeReportString(value);
  }

  if (value instanceof Uint8Array) {
    return bytesToHex(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForAgeGateStepInsight(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeForAgeGateStepInsight(entry),
      ]),
    );
  }

  return value;
};

export const buildAgeGateStepInsightReport = (
  title: string,
  payload: AgeGateStepInsightPayload,
): AgeGateStepInsightReport => ({
  schemaVersion: AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION,
  title,
  request: sanitizeForAgeGateStepInsight(payload.request) as string,
  response: sanitizeForAgeGateStepInsight(payload.response) as string,
  checks: payload.checks.map(
    (check) => sanitizeForAgeGateStepInsight(check) as string,
  ),
  dto: sanitizeForAgeGateStepInsight(payload.dto),
});

export const serializeAgeGateStepInsightReport = (
  report: AgeGateStepInsightReport,
): string => JSON.stringify(report);

export const collectAgeGateStepInsight = (
  actor: SerenityArtifactCollector,
  title: string,
  payload: AgeGateStepInsightPayload,
): void => {
  actor.collect(
    LogEntry.fromJSON({
      data: serializeAgeGateStepInsightReport(
        buildAgeGateStepInsightReport(title, payload),
      ),
    }),
    new Name(title),
  );
};
