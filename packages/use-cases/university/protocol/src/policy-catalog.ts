import { readFileSync } from "node:fs";

import type {
  UniversityFixtureData,
  VerifierRequestPolicy,
} from "./model.js";
import { resolveUniversityProtocolRepoPath } from "./runtime.js";

export const UNIVERSITY_POLICY_CATALOG_AUDIT_SCHEMA_VERSION =
  "midnight-university-policy-catalog-audit.v1" as const;

export const defaultUniversityRequestPolicyPresetCatalogPath =
  "packages/use-cases/university/data/request-policy-presets.json" as const;

export const universityRequestPolicyFields = [
  "requireDiplomaIdDisclosure",
  "requireStudentIdDisclosure",
  "requireGraduateNameDisclosure",
  "requireUniversityNameDisclosure",
  "requireFacultyNameDisclosure",
  "requireAwardNameDisclosure",
  "requireHonorsCodeDisclosure",
  "requireGraduationYearDisclosure",
  "requireGraduationMonthDisclosure",
  "requireFinalGradeDisclosure",
  "requireCreditsEarnedDisclosure",
  "enforceMinimumFinalGrade",
  "minimumFinalGrade",
] as const satisfies readonly (keyof VerifierRequestPolicy)[];

const universityRequestPolicyFieldSet = new Set<string>(
  universityRequestPolicyFields,
);

export type UniversityRequestPolicyField =
  (typeof universityRequestPolicyFields)[number];

type MissingUniversityRequestPolicyField = Exclude<
  keyof VerifierRequestPolicy,
  UniversityRequestPolicyField
>;
type UniversityRequestPolicyFieldCoverageGuard =
  MissingUniversityRequestPolicyField extends never
    ? true
    : ["Missing university request policy field", MissingUniversityRequestPolicyField];

const universityRequestPolicyFieldCoverageGuard: UniversityRequestPolicyFieldCoverageGuard =
  true;
void universityRequestPolicyFieldCoverageGuard;

export type UniversityRequestPolicyPresetKind =
  | "jobApplication"
  | "mallDiscount";

export type UniversityRequestPolicyPreset = {
  readonly presetId: string;
  readonly kind: UniversityRequestPolicyPresetKind;
  readonly title: string;
  readonly purpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
  readonly policyRationale: Readonly<
    Partial<Record<UniversityRequestPolicyField, string>>
  >;
};

export type UniversityRequestPolicyPresetCatalog = Readonly<
  Record<string, UniversityRequestPolicyPreset>
>;

export type UniversityPolicyCatalogAuditFinding = {
  readonly severity: "error";
  readonly code:
    | "missing-preset"
    | "kind-mismatch"
    | "title-mismatch"
    | "purpose-mismatch"
    | "policy-mismatch"
    | "unknown-policy-field"
    | "missing-rationale"
    | "unused-preset";
  readonly message: string;
  readonly presetId?: string;
  readonly participantId?: string;
  readonly field?: string;
};

export type UniversityPolicyCatalogCoverageRecord = {
  readonly participantKind: "company" | "mall";
  readonly participantId: string;
  readonly participantName: string;
  readonly presetId: string;
  readonly presetTitle: string;
  readonly policyKind: UniversityRequestPolicyPresetKind;
  readonly explicitPolicyFields: readonly UniversityRequestPolicyField[];
  readonly policyRationale: Readonly<
    Partial<Record<UniversityRequestPolicyField, string>>
  >;
};

export type UniversityPolicyCatalogAudit = {
  readonly schemaVersion: typeof UNIVERSITY_POLICY_CATALOG_AUDIT_SCHEMA_VERSION;
  readonly profileId: string;
  readonly presetCount: number;
  readonly verifierCount: number;
  readonly usedPresetIds: readonly string[];
  readonly unusedPresetIds: readonly string[];
  readonly coverage: readonly UniversityPolicyCatalogCoverageRecord[];
  readonly findings: readonly UniversityPolicyCatalogAuditFinding[];
  readonly checks: {
    readonly allFixturePresetsKnown: boolean;
    readonly allFixtureKindsMatch: boolean;
    readonly allEmbeddedPoliciesMatchCatalog: boolean;
    readonly allCatalogPresetsUsed: boolean;
    readonly allExplicitPolicyFieldsHaveRationale: boolean;
  };
};

export type UniversityPolicyCatalogAuditOptions = {
  readonly profileId?: string;
  readonly fixtureData: UniversityFixtureData;
  readonly presetCatalog?: UniversityRequestPolicyPresetCatalog;
};

type VerifierPolicyParticipant =
  | {
      readonly participantKind: "company";
      readonly participantId: string;
      readonly participantName: string;
      readonly expectedKind: "jobApplication";
      readonly requestPresetId: string;
      readonly requestPresetTitle: string;
      readonly requestPolicyPurpose: string;
      readonly requestPolicy: VerifierRequestPolicy;
    }
  | {
      readonly participantKind: "mall";
      readonly participantId: string;
      readonly participantName: string;
      readonly expectedKind: "mallDiscount";
      readonly requestPresetId: string;
      readonly requestPresetTitle: string;
      readonly requestPolicyPurpose: string;
      readonly requestPolicy: VerifierRequestPolicy;
    };

const readJson = <T>(relativePath: string): T =>
  JSON.parse(
    readFileSync(resolveUniversityProtocolRepoPath(relativePath), "utf8"),
  ) as T;

export const loadUniversityRequestPolicyPresetCatalog = (
  relativePath = defaultUniversityRequestPolicyPresetCatalogPath,
): UniversityRequestPolicyPresetCatalog => readJson(relativePath);

const participantsForFixture = (
  fixtureData: UniversityFixtureData,
): readonly VerifierPolicyParticipant[] => [
  ...fixtureData.companies.map((company): VerifierPolicyParticipant => ({
    participantKind: "company",
    participantId: company.companyId,
    participantName: company.companyName,
    expectedKind: "jobApplication",
    requestPresetId: company.requestPresetId,
    requestPresetTitle: company.requestPresetTitle,
    requestPolicyPurpose: company.requestPolicyPurpose,
    requestPolicy: company.requestPolicy,
  })),
  {
    participantKind: "mall",
    participantId: fixtureData.mall.mallId,
    participantName: fixtureData.mall.mallName,
    expectedKind: "mallDiscount",
    requestPresetId: fixtureData.mall.requestPresetId,
    requestPresetTitle: fixtureData.mall.requestPresetTitle,
    requestPolicyPurpose: fixtureData.mall.requestPolicyPurpose,
    requestPolicy: fixtureData.mall.requestPolicy,
  },
];

const unknownPolicyFields = (
  policy: VerifierRequestPolicy,
): readonly string[] =>
  Object.keys(policy as Record<string, unknown>)
    .filter((field) => !universityRequestPolicyFieldSet.has(field))
    .sort();

const explicitPolicyFields = (
  policy: VerifierRequestPolicy,
): readonly UniversityRequestPolicyField[] =>
  universityRequestPolicyFields.filter((field) => {
    // The threshold value is meaningful only when the threshold is enforced.
    if (field === "minimumFinalGrade") {
      return policy.enforceMinimumFinalGrade === true;
    }
    // Explicit false values document intentional non-disclosure decisions.
    return policy[field] !== undefined;
  });

const policyDifferenceFields = (
  actual: VerifierRequestPolicy,
  expected: VerifierRequestPolicy,
): readonly UniversityRequestPolicyField[] =>
  universityRequestPolicyFields.filter((field) => {
    if (
      field === "minimumFinalGrade" &&
      actual.enforceMinimumFinalGrade !== true &&
      expected.enforceMinimumFinalGrade !== true
    ) {
      return false;
    }
    return actual[field] !== expected[field];
  });

const policyValueLabel = (
  policy: VerifierRequestPolicy,
  field: UniversityRequestPolicyField,
): string => {
  const value = policy[field];
  return value === undefined ? "undefined" : JSON.stringify(value);
};

const missingRationaleFields = (
  preset: UniversityRequestPolicyPreset,
): readonly UniversityRequestPolicyField[] =>
  explicitPolicyFields(preset.requestPolicy).filter((field) => {
    const rationale = (preset.policyRationale ?? {})[field];
    return typeof rationale !== "string" || rationale.trim().length === 0;
  });

const coverageRecord = (
  participant: VerifierPolicyParticipant,
  preset: UniversityRequestPolicyPreset,
): UniversityPolicyCatalogCoverageRecord => ({
  participantKind: participant.participantKind,
  participantId: participant.participantId,
  participantName: participant.participantName,
  presetId: preset.presetId,
  presetTitle: preset.title,
  policyKind: preset.kind,
  explicitPolicyFields: explicitPolicyFields(preset.requestPolicy),
  policyRationale: preset.policyRationale ?? {},
});

export const buildUniversityPolicyCatalogAudit = ({
  profileId = "readable-10",
  fixtureData,
  presetCatalog = loadUniversityRequestPolicyPresetCatalog(),
}: UniversityPolicyCatalogAuditOptions): UniversityPolicyCatalogAudit => {
  const participants = participantsForFixture(fixtureData);
  const findings: UniversityPolicyCatalogAuditFinding[] = [];
  const coverage: UniversityPolicyCatalogCoverageRecord[] = [];
  const usedPresetIds = new Set<string>();

  for (const participant of participants) {
    usedPresetIds.add(participant.requestPresetId);
    const preset = presetCatalog[participant.requestPresetId];

    for (const field of unknownPolicyFields(participant.requestPolicy)) {
      findings.push({
        severity: "error",
        code: "unknown-policy-field",
        message: `Fixture policy for ${participant.participantId} uses unknown field ${field}.`,
        participantId: participant.participantId,
        field,
      });
    }

    if (!preset) {
      findings.push({
        severity: "error",
        code: "missing-preset",
        message: `Fixture participant ${participant.participantId} references missing preset ${participant.requestPresetId}.`,
        presetId: participant.requestPresetId,
        participantId: participant.participantId,
      });
      continue;
    }

    coverage.push(coverageRecord(participant, preset));

    if (preset.kind !== participant.expectedKind) {
      findings.push({
        severity: "error",
        code: "kind-mismatch",
        message: `Preset ${preset.presetId} is ${preset.kind}, but ${participant.participantId} requires ${participant.expectedKind}.`,
        presetId: preset.presetId,
        participantId: participant.participantId,
      });
    }

    if (preset.title !== participant.requestPresetTitle) {
      findings.push({
        severity: "error",
        code: "title-mismatch",
        message: `Fixture title for ${participant.participantId} does not match preset ${preset.presetId}.`,
        presetId: preset.presetId,
        participantId: participant.participantId,
      });
    }

    if (preset.purpose !== participant.requestPolicyPurpose) {
      findings.push({
        severity: "error",
        code: "purpose-mismatch",
        message: `Fixture purpose for ${participant.participantId} does not match preset ${preset.presetId}.`,
        presetId: preset.presetId,
        participantId: participant.participantId,
      });
    }

    for (const field of policyDifferenceFields(
      participant.requestPolicy,
      preset.requestPolicy,
    )) {
      findings.push({
        severity: "error",
        code: "policy-mismatch",
        message: `Fixture policy for ${participant.participantId} field ${field} is ${policyValueLabel(
          participant.requestPolicy,
          field,
        )}, expected ${policyValueLabel(preset.requestPolicy, field)} from preset ${preset.presetId}.`,
        presetId: preset.presetId,
        participantId: participant.participantId,
        field,
      });
    }
  }

  for (const [presetId, preset] of Object.entries(presetCatalog)) {
    for (const field of unknownPolicyFields(preset.requestPolicy)) {
      findings.push({
        severity: "error",
        code: "unknown-policy-field",
        message: `Preset ${presetId} uses unknown field ${field}.`,
        presetId,
        field,
      });
    }

    for (const field of missingRationaleFields(preset)) {
      findings.push({
        severity: "error",
        code: "missing-rationale",
        message: `Preset ${presetId} is missing policy rationale for ${field}.`,
        presetId,
        field,
      });
    }

    if (!usedPresetIds.has(presetId)) {
      findings.push({
        severity: "error",
        code: "unused-preset",
        message: `Preset ${presetId} is not referenced by the fixture profile ${profileId}.`,
        presetId,
      });
    }
  }

  const unusedPresetIds = Object.keys(presetCatalog)
    .filter((presetId) => !usedPresetIds.has(presetId))
    .sort();
  const knownFindingCodes = new Set(
    findings.map((finding) => finding.code),
  );

  return {
    schemaVersion: UNIVERSITY_POLICY_CATALOG_AUDIT_SCHEMA_VERSION,
    profileId,
    presetCount: Object.keys(presetCatalog).length,
    verifierCount: participants.length,
    usedPresetIds: [...usedPresetIds].sort(),
    unusedPresetIds,
    coverage: coverage.sort((left, right) =>
      left.participantId.localeCompare(right.participantId),
    ),
    findings,
    checks: {
      allFixturePresetsKnown: !knownFindingCodes.has("missing-preset"),
      allFixtureKindsMatch: !knownFindingCodes.has("kind-mismatch"),
      allEmbeddedPoliciesMatchCatalog:
        !knownFindingCodes.has("title-mismatch") &&
        !knownFindingCodes.has("purpose-mismatch") &&
        !knownFindingCodes.has("policy-mismatch") &&
        !knownFindingCodes.has("unknown-policy-field"),
      allCatalogPresetsUsed: unusedPresetIds.length === 0,
      allExplicitPolicyFieldsHaveRationale:
        !knownFindingCodes.has("missing-rationale"),
    },
  };
};

export const assertUniversityPolicyCatalogAuditPasses = (
  audit: UniversityPolicyCatalogAudit,
): void => {
  const failures = audit.findings.filter(
    (finding) => finding.severity === "error",
  );
  if (failures.length > 0) {
    throw new Error(
      `University policy catalog audit failed for ${audit.profileId}: ${failures
        .map((finding) => finding.message)
        .join("; ")}`,
    );
  }
};
