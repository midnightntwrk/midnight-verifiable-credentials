import { type Actor } from "@serenity-js/core";

import {
  buildVersionedStepInsightReport,
  recordVersionedStepInsight,
  sanitizeStepInsightValue,
  serializeStepInsightReport as serializeVersionedStepInsightReport,
  type StepInsightPayload,
  type StepInsightReport,
} from "../../../../bdd-support/step-insight.ts";

export const UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION =
  "midnight-university-step-insight.v1" as const;

export type UniversityStepInsightPayload = StepInsightPayload;

export type UniversityStepInsightReport = StepInsightReport<
  typeof UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION
>;

export const sanitizeForStepInsight = sanitizeStepInsightValue;

export const buildStepInsightReport = (
  title: string,
  payload: UniversityStepInsightPayload,
): UniversityStepInsightReport =>
  buildVersionedStepInsightReport(
    UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION,
    title,
    payload,
  );

export const serializeStepInsightReport = (
  report: UniversityStepInsightReport,
): string => serializeVersionedStepInsightReport(report);

export const recordStepInsight = (
  actor: Actor,
  title: string,
  payload: UniversityStepInsightPayload,
) =>
  recordVersionedStepInsight(
    actor,
    UNIVERSITY_STEP_INSIGHT_SCHEMA_VERSION,
    title,
    payload,
  );
