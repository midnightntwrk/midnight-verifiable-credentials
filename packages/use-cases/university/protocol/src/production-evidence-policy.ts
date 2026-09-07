import { readFileSync } from "node:fs";

import type {
  UniversityPresentationTamperingMode,
  UniversityProtocolExerciseOptions,
} from "./model.js";
import type { UniversityProtocolRestartPoint } from "./persistence.js";

export type UniversityProductionEvidencePolicy = {
  readonly id: string;
  readonly description: string;
  readonly restartPoints: readonly UniversityProtocolRestartPoint[];
  readonly duplicateIssuanceRequestStudentIds: readonly string[];
  readonly duplicateJobApplicationSubmissionStudentIds: readonly string[];
  readonly jobApplicationTamperingByStudentId: Readonly<
    Record<string, UniversityPresentationTamperingMode>
  >;
};

const restartPoints = new Set<UniversityProtocolRestartPoint>([
  "afterIssuanceRequests",
  "afterJobApplicationRequests",
  "afterMallDiscountRequests",
]);
const tamperingModes = new Set<UniversityPresentationTamperingMode>([
  "credentialClaimRoot",
  "requestChallenge",
  "requestPolicy",
  "issuerVerificationMethodRef",
  "holderBindingDidContractAddress",
  "holderBindingMethodRef",
  "proofSignerDidContractAddress",
  "proofSignerMethodRef",
]);

const assertStringArray: (
  value: unknown,
  name: string,
) => asserts value is string[] = (value, name) => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`University production evidence policy ${name} must be text[]`);
  }
};

const assertPolicy: (
  value: unknown,
) => asserts value is UniversityProductionEvidencePolicy = (value) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("University production evidence policy must be an object");
  }
  const policy = value as Record<string, unknown>;
  if (
    typeof policy.id !== "string" ||
    policy.id.length === 0 ||
    typeof policy.description !== "string" ||
    policy.description.length === 0
  ) {
    throw new Error("University production evidence policy identity is malformed");
  }
  assertStringArray(policy.restartPoints, "restartPoints");
  if (policy.restartPoints.some((entry) => !restartPoints.has(entry as UniversityProtocolRestartPoint))) {
    throw new Error("University production evidence policy restart point is unsupported");
  }
  assertStringArray(
    policy.duplicateIssuanceRequestStudentIds,
    "duplicateIssuanceRequestStudentIds",
  );
  assertStringArray(
    policy.duplicateJobApplicationSubmissionStudentIds,
    "duplicateJobApplicationSubmissionStudentIds",
  );
  if (
    typeof policy.jobApplicationTamperingByStudentId !== "object" ||
    policy.jobApplicationTamperingByStudentId === null ||
    Array.isArray(policy.jobApplicationTamperingByStudentId) ||
    Object.values(policy.jobApplicationTamperingByStudentId).some(
      (mode) => !tamperingModes.has(mode as UniversityPresentationTamperingMode),
    )
  ) {
    throw new Error("University production evidence policy tampering map is malformed");
  }
};

export const loadUniversityProductionEvidencePolicies = (): readonly UniversityProductionEvidencePolicy[] => {
  const values = JSON.parse(
    readFileSync(
      new URL("./production-evidence-policies.json", import.meta.url),
      "utf8",
    ),
  ) as unknown;
  if (!Array.isArray(values)) {
    throw new Error("University production evidence policies must be an array");
  }
  values.forEach(assertPolicy);
  if (new Set(values.map((value) => value.id)).size !== values.length) {
    throw new Error("University production evidence policy ids must be unique");
  }
  return values;
};

export const exerciseOptionsForProductionEvidencePolicy = (
  policy: UniversityProductionEvidencePolicy,
): UniversityProtocolExerciseOptions => ({
  duplicateIssuanceRequestStudentIds: policy.duplicateIssuanceRequestStudentIds,
  duplicateJobApplicationSubmissionStudentIds:
    policy.duplicateJobApplicationSubmissionStudentIds,
  jobApplicationTamperingByStudentId: policy.jobApplicationTamperingByStudentId,
});
