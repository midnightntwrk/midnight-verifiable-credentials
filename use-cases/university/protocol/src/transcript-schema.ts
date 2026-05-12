import type {
  UniversityProtocolThreadExport,
  UniversityProtocolTranscriptExport,
} from "./exporter.js";

type UnknownRecord = Record<string, unknown>;

const TRANSCRIPT_PHASES = ["issuance", "jobApplications", "discounts"] as const;
const REJECTION_KINDS = ["duplicate", "verificationFailed"] as const;

export const UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID =
  "midnight-university-protocol-export" as const;

export const UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION =
  "midnight-university-protocol-export.v1" as const;

export const UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY = Object.freeze({
  minimumReaderVersion: UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION,
  maximumReaderVersion: UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION,
});

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

const assertTranscriptEntry = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectString(record.type, `${label}.type`);
  expectString(record.from, `${label}.from`);
  expectString(record.to, `${label}.to`);
  expectString(record.messageIdHex, `${label}.messageIdHex`);
  expectString(record.respondsToHex, `${label}.respondsToHex`);
  expectString(record.summary, `${label}.summary`);
  assertJsonValue(record.dto, `${label}.dto`);
};

const assertThreadExport = (value: unknown, label: string): void => {
  const record = asRecord(value, label);
  expectOneOf(record.phase, TRANSCRIPT_PHASES, `${label}.phase`);
  expectString(record.threadIdHex, `${label}.threadIdHex`);
  expectNullableString(record.studentId, `${label}.studentId`);
  expectNullableString(record.studentName, `${label}.studentName`);
  expectNullableString(record.verifierId, `${label}.verifierId`);
  expectNullableString(record.verifierName, `${label}.verifierName`);
  expectNullableString(record.requestedRole, `${label}.requestedRole`);
  expectFiniteNumber(record.messageCount, `${label}.messageCount`);
  expectFiniteNumber(record.acceptedCount, `${label}.acceptedCount`);
  expectFiniteNumber(record.rejectedCount, `${label}.rejectedCount`);
  for (const [index, messageType] of expectArray(
    record.messageTypes,
    `${label}.messageTypes`,
  ).entries()) {
    expectString(messageType, `${label}.messageTypes[${index}]`);
  }
  for (const [index, kind] of expectArray(
    record.rejectionKinds,
    `${label}.rejectionKinds`,
  ).entries()) {
    expectOneOf(kind, REJECTION_KINDS, `${label}.rejectionKinds[${index}]`);
  }
  for (const [index, entry] of expectArray(record.entries, `${label}.entries`).entries()) {
    assertTranscriptEntry(entry, `${label}.entries[${index}]`);
  }
};

const threadTotal = (
  threads: readonly UniversityProtocolThreadExport[],
): number =>
  threads.reduce((sum, thread) => sum + thread.entries.length, 0);

export const isSupportedUniversityProtocolTranscriptSchemaVersion = (
  value: unknown,
): value is typeof UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION =>
  value === UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION;

export const assertUniversityProtocolTranscriptExportConforms: (
  value: unknown,
) => asserts value is UniversityProtocolTranscriptExport = (value) => {
  const record = asRecord(value, "transcript export");
  if (
    expectString(record.schemaId, "transcript export.schemaId") !==
    UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID
  ) {
    throw new Error("Unsupported transcript export schema id");
  }
  if (
    !isSupportedUniversityProtocolTranscriptSchemaVersion(
      record.schemaVersion,
    )
  ) {
    throw new Error("Unsupported transcript export schema version");
  }

  const compatibility = asRecord(
    record.compatibility,
    "transcript export.compatibility",
  );
  if (
    expectString(
      compatibility.minimumReaderVersion,
      "transcript export.compatibility.minimumReaderVersion",
    ) !== UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY.minimumReaderVersion
  ) {
    throw new Error("Unsupported transcript export minimum reader version");
  }
  if (
    expectString(
      compatibility.maximumReaderVersion,
      "transcript export.compatibility.maximumReaderVersion",
    ) !== UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY.maximumReaderVersion
  ) {
    throw new Error("Unsupported transcript export maximum reader version");
  }

  const dataset = asRecord(record.dataset, "transcript export.dataset");
  expectFiniteNumber(dataset.studentCount, "transcript export.dataset.studentCount");
  expectFiniteNumber(dataset.companyCount, "transcript export.dataset.companyCount");
  expectFiniteNumber(
    dataset.discountApplicantCount,
    "transcript export.dataset.discountApplicantCount",
  );
  expectFiniteNumber(dataset.batchCount, "transcript export.dataset.batchCount");
  expectFiniteNumber(dataset.batchSize, "transcript export.dataset.batchSize");

  const participants = asRecord(
    record.participants,
    "transcript export.participants",
  );
  const university = asRecord(
    participants.university,
    "transcript export.participants.university",
  );
  expectString(university.partyId, "transcript export.participants.university.partyId");
  expectString(university.didUrl, "transcript export.participants.university.didUrl");
  expectString(
    university.methodId,
    "transcript export.participants.university.methodId",
  );
  for (const [index, company] of expectArray(
    participants.companies,
    "transcript export.participants.companies",
  ).entries()) {
    const companyRecord = asRecord(
      company,
      `transcript export.participants.companies[${index}]`,
    );
    expectString(
      companyRecord.companyId,
      `transcript export.participants.companies[${index}].companyId`,
    );
    expectString(
      companyRecord.companyName,
      `transcript export.participants.companies[${index}].companyName`,
    );
    expectString(
      companyRecord.verifierDidUrl,
      `transcript export.participants.companies[${index}].verifierDidUrl`,
    );
    expectString(
      companyRecord.verifierMethodId,
      `transcript export.participants.companies[${index}].verifierMethodId`,
    );
  }
  const mall = asRecord(participants.mall, "transcript export.participants.mall");
  expectString(mall.mallId, "transcript export.participants.mall.mallId");
  expectString(mall.mallName, "transcript export.participants.mall.mallName");
  expectString(
    mall.verifierDidUrl,
    "transcript export.participants.mall.verifierDidUrl",
  );
  expectString(
    mall.verifierMethodId,
    "transcript export.participants.mall.verifierMethodId",
  );

  const counts = asRecord(record.counts, "transcript export.counts");
  const issuanceRequests = expectFiniteNumber(
    counts.issuanceRequests,
    "transcript export.counts.issuanceRequests",
  );
  const issuanceResults = expectFiniteNumber(
    counts.issuanceResults,
    "transcript export.counts.issuanceResults",
  );
  const jobApplicationRequests = expectFiniteNumber(
    counts.jobApplicationRequests,
    "transcript export.counts.jobApplicationRequests",
  );
  const jobApplicationSubmissions = expectFiniteNumber(
    counts.jobApplicationSubmissions,
    "transcript export.counts.jobApplicationSubmissions",
  );
  const jobApplicationResults = expectFiniteNumber(
    counts.jobApplicationResults,
    "transcript export.counts.jobApplicationResults",
  );
  const discountRequests = expectFiniteNumber(
    counts.discountRequests,
    "transcript export.counts.discountRequests",
  );
  const discountSubmissions = expectFiniteNumber(
    counts.discountSubmissions,
    "transcript export.counts.discountSubmissions",
  );
  const discountResults = expectFiniteNumber(
    counts.discountResults,
    "transcript export.counts.discountResults",
  );
  const transcriptEntries = expectFiniteNumber(
    counts.transcriptEntries,
    "transcript export.counts.transcriptEntries",
  );
  const totalThreads = expectFiniteNumber(
    counts.totalThreads,
    "transcript export.counts.totalThreads",
  );

  const rejectionBreakdown = asRecord(
    record.rejectionBreakdown,
    "transcript export.rejectionBreakdown",
  );
  const jobApplications = asRecord(
    rejectionBreakdown.jobApplications,
    "transcript export.rejectionBreakdown.jobApplications",
  );
  expectFiniteNumber(
    jobApplications.accepted,
    "transcript export.rejectionBreakdown.jobApplications.accepted",
  );
  expectFiniteNumber(
    jobApplications.verificationFailed,
    "transcript export.rejectionBreakdown.jobApplications.verificationFailed",
  );
  expectFiniteNumber(
    jobApplications.duplicate,
    "transcript export.rejectionBreakdown.jobApplications.duplicate",
  );
  for (const [index, company] of expectArray(
    jobApplications.byCompany,
    "transcript export.rejectionBreakdown.jobApplications.byCompany",
  ).entries()) {
    const companyRecord = asRecord(
      company,
      `transcript export.rejectionBreakdown.jobApplications.byCompany[${index}]`,
    );
    expectString(
      companyRecord.companyId,
      `transcript export.rejectionBreakdown.jobApplications.byCompany[${index}].companyId`,
    );
    expectString(
      companyRecord.companyName,
      `transcript export.rejectionBreakdown.jobApplications.byCompany[${index}].companyName`,
    );
    expectFiniteNumber(
      companyRecord.accepted,
      `transcript export.rejectionBreakdown.jobApplications.byCompany[${index}].accepted`,
    );
    expectFiniteNumber(
      companyRecord.verificationFailed,
      `transcript export.rejectionBreakdown.jobApplications.byCompany[${index}].verificationFailed`,
    );
    expectFiniteNumber(
      companyRecord.duplicate,
      `transcript export.rejectionBreakdown.jobApplications.byCompany[${index}].duplicate`,
    );
  }

  const discounts = asRecord(
    rejectionBreakdown.discounts,
    "transcript export.rejectionBreakdown.discounts",
  );
  expectFiniteNumber(
    discounts.accepted,
    "transcript export.rejectionBreakdown.discounts.accepted",
  );
  expectFiniteNumber(
    discounts.verificationFailed,
    "transcript export.rejectionBreakdown.discounts.verificationFailed",
  );
  expectFiniteNumber(
    discounts.duplicate,
    "transcript export.rejectionBreakdown.discounts.duplicate",
  );
  for (const [index, entry] of expectArray(
    discounts.byReason,
    "transcript export.rejectionBreakdown.discounts.byReason",
  ).entries()) {
    const reasonRecord = asRecord(
      entry,
      `transcript export.rejectionBreakdown.discounts.byReason[${index}]`,
    );
    expectString(
      reasonRecord.reason,
      `transcript export.rejectionBreakdown.discounts.byReason[${index}].reason`,
    );
    expectFiniteNumber(
      reasonRecord.count,
      `transcript export.rejectionBreakdown.discounts.byReason[${index}].count`,
    );
  }

  const threads = asRecord(record.threads, "transcript export.threads");
  const issuanceThreads = expectArray(
    threads.issuance,
    "transcript export.threads.issuance",
  );
  const jobThreads = expectArray(
    threads.jobApplications,
    "transcript export.threads.jobApplications",
  );
  const discountThreads = expectArray(
    threads.discounts,
    "transcript export.threads.discounts",
  );
  for (const [index, thread] of issuanceThreads.entries()) {
    assertThreadExport(thread, `transcript export.threads.issuance[${index}]`);
  }
  for (const [index, thread] of jobThreads.entries()) {
    assertThreadExport(
      thread,
      `transcript export.threads.jobApplications[${index}]`,
    );
  }
  for (const [index, thread] of discountThreads.entries()) {
    assertThreadExport(thread, `transcript export.threads.discounts[${index}]`);
  }

  const typedThreads = {
    issuance: issuanceThreads as readonly UniversityProtocolThreadExport[],
    jobApplications: jobThreads as readonly UniversityProtocolThreadExport[],
    discounts: discountThreads as readonly UniversityProtocolThreadExport[],
  };
  const actualThreadCount =
    typedThreads.issuance.length +
    typedThreads.jobApplications.length +
    typedThreads.discounts.length;
  if (totalThreads !== actualThreadCount) {
    throw new Error(
      `transcript export.counts.totalThreads must equal ${actualThreadCount}`,
    );
  }

  const actualTranscriptEntryCount =
    threadTotal(typedThreads.issuance) +
    threadTotal(typedThreads.jobApplications) +
    threadTotal(typedThreads.discounts);
  if (transcriptEntries !== actualTranscriptEntryCount) {
    throw new Error(
      `transcript export.counts.transcriptEntries must equal ${actualTranscriptEntryCount}`,
    );
  }

  if (issuanceRequests < issuanceResults) {
    throw new Error("issuance request count must be >= issuance result count");
  }
  if (jobApplicationRequests < jobApplicationSubmissions) {
    throw new Error(
      "job-application request count must be >= job-application submission count",
    );
  }
  if (jobApplicationSubmissions < jobApplicationResults) {
    throw new Error(
      "job-application submission count must be >= job-application result count",
    );
  }
  if (discountRequests < discountSubmissions) {
    throw new Error("discount request count must be >= discount submission count");
  }
  if (discountSubmissions < discountResults) {
    throw new Error("discount submission count must be >= discount result count");
  }
};

export const isUniversityProtocolTranscriptExport = (
  value: unknown,
): value is UniversityProtocolTranscriptExport => {
  try {
    assertUniversityProtocolTranscriptExportConforms(value);
    return true;
  } catch {
    return false;
  }
};
