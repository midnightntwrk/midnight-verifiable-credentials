import {
  buildVersionedStepInsightReport,
  collectVersionedStepInsight,
  sanitizeStepInsightValue,
  serializeStepInsightReport,
  type StepInsightArtifactCollector,
  type StepInsightPayload,
  type StepInsightReport,
} from "../../../../bdd-support/step-insight.ts";

export const AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION =
  "midnight-age-gate-step-insight.v1" as const;

export type AgeGateStepInsightPayload = StepInsightPayload;

export type AgeGateStepInsightReport = StepInsightReport<
  typeof AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION
>;

export const sanitizeForAgeGateStepInsight = sanitizeStepInsightValue;

export const buildAgeGateStepInsightReport = (
  title: string,
  payload: AgeGateStepInsightPayload,
): AgeGateStepInsightReport =>
  buildVersionedStepInsightReport(
    AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION,
    title,
    payload,
  );

export const serializeAgeGateStepInsightReport = (
  report: AgeGateStepInsightReport,
): string => serializeStepInsightReport(report);

export const collectAgeGateStepInsight = (
  actor: StepInsightArtifactCollector,
  title: string,
  payload: AgeGateStepInsightPayload,
): void => {
  // Serenity's Interaction callback exposes the narrower CollectsArtifacts
  // capability shape, not the concrete Actor class used by step definitions.
  collectVersionedStepInsight(
    actor,
    AGE_GATE_STEP_INSIGHT_SCHEMA_VERSION,
    title,
    payload,
  );
};
