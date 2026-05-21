import { type Actor, Interaction } from "@serenity-js/core";
import { LogEntry, Name } from "@serenity-js/core/model";

export type StepInsightPayload = {
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

export type StepInsightReport<TSchemaVersion extends string> = {
  readonly schemaVersion: TSchemaVersion;
  readonly title: string;
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

export type StepInsightArtifactCollector = {
  collect: (artifact: LogEntry, name: Name) => void;
};

const normalizeReportString = (value: string): string =>
  value.replaceAll(/\s*(?:\r\n|\r|\n)\s*/gu, " ");

const bytesToHex = (value: Uint8Array): string =>
  Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");

const normalizeStepInsightString = (value: string): string =>
  normalizeReportString(value);

// Step insight DTOs are report artifacts, not source-of-truth transcripts.
// Strings are normalized recursively to keep Serenity logs readable; checks are
// human-readable narration of the assertions performed by the scenario code.
export const sanitizeStepInsightValue = (value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    return normalizeStepInsightString(value);
  }

  if (value instanceof Uint8Array) {
    return bytesToHex(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeStepInsightValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeStepInsightValue(entry),
      ]),
    );
  }

  return value;
};

export const buildVersionedStepInsightReport = <
  const TSchemaVersion extends string,
>(
  schemaVersion: TSchemaVersion,
  title: string,
  payload: StepInsightPayload,
): StepInsightReport<TSchemaVersion> => ({
  schemaVersion,
  title,
  request: normalizeStepInsightString(payload.request),
  response: normalizeStepInsightString(payload.response),
  checks: payload.checks.map(normalizeStepInsightString),
  dto: sanitizeStepInsightValue(payload.dto),
});

export const serializeStepInsightReport = <TSchemaVersion extends string>(
  report: StepInsightReport<TSchemaVersion>,
): string => JSON.stringify(report);

export const collectVersionedStepInsight = <TSchemaVersion extends string>(
  actor: StepInsightArtifactCollector,
  schemaVersion: TSchemaVersion,
  title: string,
  payload: StepInsightPayload,
): void => {
  actor.collect(
    LogEntry.fromJSON({
      data: serializeStepInsightReport(
        buildVersionedStepInsightReport(schemaVersion, title, payload),
      ),
    }),
    new Name(title),
  );
};

export const recordVersionedStepInsight = <TSchemaVersion extends string>(
  actor: Actor,
  schemaVersion: TSchemaVersion,
  title: string,
  payload: StepInsightPayload,
) =>
  actor.attemptsTo(
    Interaction.where(`#actor records ${title}`, (currentActor) => {
      collectVersionedStepInsight(currentActor, schemaVersion, title, payload);
    }),
  );
