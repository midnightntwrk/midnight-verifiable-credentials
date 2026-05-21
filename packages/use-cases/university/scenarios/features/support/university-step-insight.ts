import { type Actor, Interaction } from "@serenity-js/core";
import { LogEntry, Name } from "@serenity-js/core/model";

export const UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION =
  "midnight-university-step-insight.v1" as const;

export type UniversityStepInsightPayload = {
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

export type UniversityStepInsightReport = {
  readonly schemaVersion: typeof UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION;
  readonly title: string;
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

const normalizeReportString = (value: string): string =>
  value.replaceAll(/\s*(?:\r\n|\r|\n)\s*/gu, " ");

// Step insight DTOs are expected to be JSON-like plain values plus bigint.
export const sanitizeForStepInsight = (value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    return normalizeReportString(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForStepInsight(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeForStepInsight(entry),
      ]),
    );
  }

  return value;
};

export const buildStepInsightReport = (
  title: string,
  payload: UniversityStepInsightPayload,
): UniversityStepInsightReport => ({
  schemaVersion: UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION,
  title,
  request: sanitizeForStepInsight(payload.request) as string,
  response: sanitizeForStepInsight(payload.response) as string,
  checks: payload.checks.map(
    (check) => sanitizeForStepInsight(check) as string,
  ),
  dto: sanitizeForStepInsight(payload.dto),
});

export const serializeStepInsightReport = (
  report: UniversityStepInsightReport,
): string => JSON.stringify(report);

export const recordStepInsight = (
  actor: Actor,
  title: string,
  payload: UniversityStepInsightPayload,
) =>
  actor.attemptsTo(
    Interaction.where(`#actor records ${title}`, (currentActor) => {
      currentActor.collect(
        LogEntry.fromJSON({
          data: serializeStepInsightReport(
            buildStepInsightReport(title, payload),
          ),
        }),
        new Name(title),
      );
    }),
  );
