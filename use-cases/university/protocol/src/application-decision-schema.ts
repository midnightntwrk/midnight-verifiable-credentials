import type { UniversityPresentationResultBody } from "./model.js";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type UniversityProtocolApplicationDecisionMessage = {
  readonly threadIdHex: string;
  readonly messageIdHex: string;
  readonly respondsToHex: string;
  readonly from: string;
  readonly to: string;
  readonly summary: string;
  readonly dto: JsonValue;
};

export type UniversityProtocolDecisionResultEntry = {
  readonly sequence: number;
  readonly message: UniversityProtocolApplicationDecisionMessage;
  readonly accepted: boolean;
  readonly reason: string;
  readonly rejectionKind: UniversityPresentationResultBody["rejectionKind"];
};

export type UniversityProtocolApplicationDecisionFinalRejectionKind =
  | UniversityPresentationResultBody["rejectionKind"]
  | "noResultReceived";

export type UniversityProtocolApplicationDecisionRecord = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly studentName: string;
  readonly studentDidUrl: string;
  readonly studentMethodId: string;
  readonly verifierId: string;
  readonly verifierName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly requestedRole: string | null;
  readonly request: UniversityProtocolApplicationDecisionMessage;
  readonly submissions: readonly UniversityProtocolApplicationDecisionMessage[];
  readonly results: readonly UniversityProtocolDecisionResultEntry[];
  readonly finalAccepted: boolean;
  readonly finalReason: string;
  readonly finalRejectionKind: UniversityProtocolApplicationDecisionFinalRejectionKind;
};

export type UniversityProtocolIssuanceDecisionRecord = {
  readonly studentId: string;
  readonly studentName: string;
  readonly holderDidUrl: string;
  readonly holderMethodId: string;
  readonly request: UniversityProtocolApplicationDecisionMessage;
  readonly result: UniversityProtocolApplicationDecisionMessage;
  readonly credential: {
    readonly issuerVerificationMethodRef: string;
    readonly issuedAt: string;
    readonly credentialProofCreatedAt: string;
    readonly presentationProofCreatedAt: string;
    readonly universityName: string;
    readonly awardName: string;
    readonly finalGrade: string;
  };
};

export type UniversityProtocolApplicationDecisionCompanyBreakdown = {
  readonly companyId: string;
  readonly companyName: string;
  readonly accepted: number;
  readonly verificationFailed: number;
  readonly duplicate: number;
};

export type UniversityProtocolApplicationDecisionArtifact = {
  readonly schemaId: typeof UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID;
  readonly schemaVersion: typeof UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION;
  readonly compatibility: typeof UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY;
  readonly dataset: {
    readonly studentCount: number;
    readonly companyCount: number;
    readonly discountApplicantCount: number;
    readonly batchCount: number;
    readonly batchSize: number;
  };
  readonly participants: {
    readonly university: {
      readonly partyId: string;
      readonly didUrl: string;
      readonly methodId: string;
    };
    readonly companies: readonly {
      readonly companyId: string;
      readonly companyName: string;
      readonly verifierDidUrl: string;
      readonly verifierMethodId: string;
    }[];
    readonly mall: {
      readonly mallId: string;
      readonly mallName: string;
      readonly verifierDidUrl: string;
      readonly verifierMethodId: string;
    };
  };
  readonly issuance: {
    readonly byStudent: readonly UniversityProtocolIssuanceDecisionRecord[];
  };
  readonly jobApplications: {
    readonly byStudentCompany: readonly UniversityProtocolApplicationDecisionRecord[];
  };
  readonly discounts: {
    readonly byApplicant: readonly UniversityProtocolApplicationDecisionRecord[];
  };
  readonly summary: {
    readonly jobApplications: {
      readonly requested: number;
      readonly accepted: number;
      readonly rejected: number;
      readonly duplicate: number;
      readonly verificationFailed: number;
      readonly byCompany: readonly UniversityProtocolApplicationDecisionCompanyBreakdown[];
    };
    readonly discounts: {
      readonly requested: number;
      readonly accepted: number;
      readonly rejected: number;
      readonly duplicate: number;
      readonly verificationFailed: number;
      readonly byReason: readonly {
        readonly reason: string;
        readonly count: number;
      }[];
    };
  };
};

export const UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID =
  "midnight-university-protocol-application-decisions" as const;

export const UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION =
  "midnight-university-protocol-application-decisions.v1" as const;

export const UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY =
  Object.freeze({
    minimumReaderVersion:
      UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
    maximumReaderVersion:
      UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
  });

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown, label: string): UnknownRecord => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as UnknownRecord;
};

const expectString = (value: unknown, label: string): string => {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  return value;
};

const expectFiniteNumber = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
};

const expectBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean`);
  }
  return value;
};

const expectNullableString = (value: unknown, label: string): string | null => {
  if (value === null) {
    return null;
  }
  return expectString(value, label);
};

const expectArray = (value: unknown, label: string): readonly unknown[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
};

const expectOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T => {
  const candidate = expectString(value, label);
  if (!allowed.includes(candidate as T)) {
    throw new Error(`${label} must be one of ${allowed.join(", ")}`);
  }
  return candidate as T;
};

const assertJsonValue = (value: unknown, label: string): void => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      assertJsonValue(entry, `${label}[${index}]`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [field, entry] of Object.entries(value as UnknownRecord)) {
      assertJsonValue(entry, `${label}.${field}`);
    }
    return;
  }
  throw new Error(`${label} must be JSON-serializable`);
};

const assertDecisionMessage = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectString(record.threadIdHex, `${label}.threadIdHex`);
  expectString(record.messageIdHex, `${label}.messageIdHex`);
  expectString(record.respondsToHex, `${label}.respondsToHex`);
  expectString(record.from, `${label}.from`);
  expectString(record.to, `${label}.to`);
  expectString(record.summary, `${label}.summary`);
  assertJsonValue(record.dto, `${label}.dto`);
};

const assertByCompany = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectString(record.companyId, `${label}.companyId`);
  expectString(record.companyName, `${label}.companyName`);
  expectFiniteNumber(record.accepted, `${label}.accepted`);
  expectFiniteNumber(record.verificationFailed, `${label}.verificationFailed`);
  expectFiniteNumber(record.duplicate, `${label}.duplicate`);
};

const assertDecisionResultEntry = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectFiniteNumber(record.sequence, `${label}.sequence`);
  assertDecisionMessage(record.message, `${label}.message`);
  expectBoolean(record.accepted, `${label}.accepted`);
  expectString(record.reason, `${label}.reason`);
  expectOneOf(
    record.rejectionKind,
    ["none", "verificationFailed", "duplicate"],
    `${label}.rejectionKind`,
  );
};

const assertIssuanceRecord = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectString(record.studentId, `${label}.studentId`);
  expectString(record.studentName, `${label}.studentName`);
  expectString(record.holderDidUrl, `${label}.holderDidUrl`);
  expectString(record.holderMethodId, `${label}.holderMethodId`);
  assertDecisionMessage(record.request, `${label}.request`);
  assertDecisionMessage(record.result, `${label}.result`);
  const credential = asRecord(record.credential, `${label}.credential`);
  expectString(
    credential.issuerVerificationMethodRef,
    `${label}.credential.issuerVerificationMethodRef`,
  );
  expectString(credential.issuedAt, `${label}.credential.issuedAt`);
  expectString(
    credential.credentialProofCreatedAt,
    `${label}.credential.credentialProofCreatedAt`,
  );
  expectString(
    credential.presentationProofCreatedAt,
    `${label}.credential.presentationProofCreatedAt`,
  );
  expectString(credential.universityName, `${label}.credential.universityName`);
  expectString(credential.awardName, `${label}.credential.awardName`);
  expectString(credential.finalGrade, `${label}.credential.finalGrade`);
};

const assertDecisionRecord = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectOneOf(
    record.kind,
    ["jobApplication", "mallDiscount"],
    `${label}.kind`,
  );
  expectString(record.studentId, `${label}.studentId`);
  expectString(record.studentName, `${label}.studentName`);
  expectString(record.studentDidUrl, `${label}.studentDidUrl`);
  expectString(record.studentMethodId, `${label}.studentMethodId`);
  expectString(record.verifierId, `${label}.verifierId`);
  expectString(record.verifierName, `${label}.verifierName`);
  expectString(record.verifierDidUrl, `${label}.verifierDidUrl`);
  expectString(record.verifierMethodId, `${label}.verifierMethodId`);
  expectNullableString(record.requestedRole, `${label}.requestedRole`);
  assertDecisionMessage(record.request, `${label}.request`);
  const submissions = expectArray(record.submissions, `${label}.submissions`);
  for (const [index, submission] of submissions.entries()) {
    assertDecisionMessage(submission, `${label}.submissions[${index}]`);
  }
  const results = expectArray(record.results, `${label}.results`);
  for (const [index, result] of results.entries()) {
    assertDecisionResultEntry(result, `${label}.results[${index}]`);
  }
  expectBoolean(record.finalAccepted, `${label}.finalAccepted`);
  expectString(record.finalReason, `${label}.finalReason`);
  const finalRejectionKind = expectOneOf(
    record.finalRejectionKind,
    ["none", "verificationFailed", "duplicate", "noResultReceived"],
    `${label}.finalRejectionKind`,
  );
  if (finalRejectionKind === "none" && !record.finalAccepted) {
    throw new Error(
      `${label}.finalAccepted must be true when finalRejectionKind is none`,
    );
  }
  if (record.finalAccepted && finalRejectionKind !== "none") {
    throw new Error(
      `${label}.finalRejectionKind must be none when finalAccepted is true`,
    );
  }
};

export const isUniversityProtocolApplicationDecisionsSchemaVersion = (
  value: unknown,
): value is typeof UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION =>
  value === UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION;

export const assertUniversityProtocolApplicationDecisionsConforms: (
  value: unknown,
) => asserts value is UniversityProtocolApplicationDecisionArtifact = (
  value,
) => {
  const record = asRecord(value, "application decision export");
  if (
    expectString(record.schemaId, "application decision export.schemaId") !==
    UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID
  ) {
    throw new Error("Unsupported application decisions schema id");
  }
  if (
    !isUniversityProtocolApplicationDecisionsSchemaVersion(record.schemaVersion)
  ) {
    throw new Error("Unsupported application decisions schema version");
  }

  const compatibility = asRecord(
    record.compatibility,
    "application decisions export.compatibility",
  );
  if (
    expectString(
      compatibility.minimumReaderVersion,
      "application decisions export.compatibility.minimumReaderVersion",
    ) !==
    UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY.minimumReaderVersion
  ) {
    throw new Error("Unsupported application decisions minimum reader version");
  }
  if (
    expectString(
      compatibility.maximumReaderVersion,
      "application decisions export.compatibility.maximumReaderVersion",
    ) !==
    UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY.maximumReaderVersion
  ) {
    throw new Error("Unsupported application decisions maximum reader version");
  }

  const dataset = asRecord(
    record.dataset,
    "application decisions export.dataset",
  );
  expectFiniteNumber(
    dataset.studentCount,
    "application decisions export.dataset.studentCount",
  );
  expectFiniteNumber(
    dataset.companyCount,
    "application decisions export.dataset.companyCount",
  );
  expectFiniteNumber(
    dataset.discountApplicantCount,
    "application decisions export.dataset.discountApplicantCount",
  );
  expectFiniteNumber(
    dataset.batchCount,
    "application decisions export.dataset.batchCount",
  );
  expectFiniteNumber(
    dataset.batchSize,
    "application decisions export.dataset.batchSize",
  );

  const participants = asRecord(
    record.participants,
    "application decisions export.participants",
  );
  const university = asRecord(
    participants.university,
    "application decisions export.participants.university",
  );
  expectString(
    university.partyId,
    "application decisions export.participants.university.partyId",
  );
  expectString(
    university.didUrl,
    "application decisions export.participants.university.didUrl",
  );
  expectString(
    university.methodId,
    "application decisions export.participants.university.methodId",
  );

  const companies = expectArray(
    participants.companies,
    "application decisions export.participants.companies",
  );
  for (const [index, company] of companies.entries()) {
    const companyRecord = asRecord(
      company,
      `application decisions export.participants.companies[${index}]`,
    );
    expectString(
      companyRecord.companyId,
      `application decisions export.participants.companies[${index}].companyId`,
    );
    expectString(
      companyRecord.companyName,
      `application decisions export.participants.companies[${index}].companyName`,
    );
    expectString(
      companyRecord.verifierDidUrl,
      `application decisions export.participants.companies[${index}].verifierDidUrl`,
    );
    expectString(
      companyRecord.verifierMethodId,
      `application decisions export.participants.companies[${index}].verifierMethodId`,
    );
  }

  const mall = asRecord(
    participants.mall,
    "application decisions export.participants.mall",
  );
  expectString(
    mall.mallId,
    "application decisions export.participants.mall.mallId",
  );
  expectString(
    mall.mallName,
    "application decisions export.participants.mall.mallName",
  );
  expectString(
    mall.verifierDidUrl,
    "application decisions export.participants.mall.verifierDidUrl",
  );
  expectString(
    mall.verifierMethodId,
    "application decisions export.participants.mall.verifierMethodId",
  );

  const issuance = asRecord(
    record.issuance,
    "application decisions export.issuance",
  );
  const byStudent = expectArray(
    issuance.byStudent,
    "application decisions export.issuance.byStudent",
  );
  for (const [index, item] of byStudent.entries()) {
    assertIssuanceRecord(
      item,
      `application decisions export.issuance.byStudent[${index}]`,
    );
  }

  const jobApplications = asRecord(
    record.jobApplications,
    "application decisions export.jobApplications",
  );
  const byStudentCompany = expectArray(
    jobApplications.byStudentCompany,
    "application decisions export.jobApplications.byStudentCompany",
  );
  for (const [index, item] of byStudentCompany.entries()) {
    assertDecisionRecord(
      item,
      `application decisions export.jobApplications.byStudentCompany[${index}]`,
    );
    if ((item as UnknownRecord).kind !== "jobApplication") {
      throw new Error(
        `application decisions export.jobApplications.byStudentCompany[${index}].kind must be jobApplication`,
      );
    }
  }

  const discounts = asRecord(
    record.discounts,
    "application decisions export.discounts",
  );
  const byApplicant = expectArray(
    discounts.byApplicant,
    "application decisions export.discounts.byApplicant",
  );
  for (const [index, item] of byApplicant.entries()) {
    assertDecisionRecord(
      item,
      `application decisions export.discounts.byApplicant[${index}]`,
    );
    if ((item as UnknownRecord).kind !== "mallDiscount") {
      throw new Error(
        `application decisions export.discounts.byApplicant[${index}].kind must be mallDiscount`,
      );
    }
  }

  const summary = asRecord(
    record.summary,
    "application decisions export.summary",
  );
  const jobSummary = asRecord(
    summary.jobApplications,
    "application decisions export.summary.jobApplications",
  );
  expectFiniteNumber(
    jobSummary.requested,
    "application decisions export.summary.jobApplications.requested",
  );
  expectFiniteNumber(
    jobSummary.accepted,
    "application decisions export.summary.jobApplications.accepted",
  );
  expectFiniteNumber(
    jobSummary.rejected,
    "application decisions export.summary.jobApplications.rejected",
  );
  expectFiniteNumber(
    jobSummary.duplicate,
    "application decisions export.summary.jobApplications.duplicate",
  );
  expectFiniteNumber(
    jobSummary.verificationFailed,
    "application decisions export.summary.jobApplications.verificationFailed",
  );
  const byCompany = expectArray(
    jobSummary.byCompany,
    "application decisions export.summary.jobApplications.byCompany",
  );
  for (const [index, entry] of byCompany.entries()) {
    assertByCompany(
      entry,
      `application decisions export.summary.jobApplications.byCompany[${index}]`,
    );
  }

  const discountSummary = asRecord(
    summary.discounts,
    "application decisions export.summary.discounts",
  );
  expectFiniteNumber(
    discountSummary.requested,
    "application decisions export.summary.discounts.requested",
  );
  expectFiniteNumber(
    discountSummary.accepted,
    "application decisions export.summary.discounts.accepted",
  );
  expectFiniteNumber(
    discountSummary.rejected,
    "application decisions export.summary.discounts.rejected",
  );
  expectFiniteNumber(
    discountSummary.duplicate,
    "application decisions export.summary.discounts.duplicate",
  );
  expectFiniteNumber(
    discountSummary.verificationFailed,
    "application decisions export.summary.discounts.verificationFailed",
  );
  const byReason = expectArray(
    discountSummary.byReason,
    "application decisions export.summary.discounts.byReason",
  );
  for (const [index, reason] of byReason.entries()) {
    const reasonRecord = asRecord(
      reason,
      `application decisions export.summary.discounts.byReason[${index}]`,
    );
    expectString(
      reasonRecord.reason,
      `application decisions export.summary.discounts.byReason[${index}].reason`,
    );
    expectFiniteNumber(
      reasonRecord.count,
      `application decisions export.summary.discounts.byReason[${index}].count`,
    );
  }
};

export const isUniversityProtocolApplicationDecisions = (
  value: unknown,
): value is UniversityProtocolApplicationDecisionArtifact => {
  try {
    assertUniversityProtocolApplicationDecisionsConforms(value);
    return true;
  } catch {
    return false;
  }
};
