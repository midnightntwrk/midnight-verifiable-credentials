import type { UniversityProtocolFlowResult, UniversityProtocolFlowRunner } from "./flow.js";
import {
  assertUniversityProtocolTranscriptExportConforms,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID,
  UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION,
} from "./transcript-schema.js";

type FlowMessage = UniversityProtocolFlowResult["issuance"]["messages"][number];
type FlowResultBody = Extract<FlowMessage, { type: "presentation:result" }>["body"];

type JsonPrimitive = boolean | number | string | null;
type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

type TranscriptEntryExport = {
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly messageIdHex: string;
  readonly respondsToHex: string;
  readonly summary: string;
  readonly dto: JsonValue;
};

export type UniversityProtocolThreadExport = {
  readonly phase: "issuance" | "jobApplications" | "discounts";
  readonly threadIdHex: string;
  readonly studentId: string | null;
  readonly studentName: string | null;
  readonly verifierId: string | null;
  readonly verifierName: string | null;
  readonly requestedRole: string | null;
  readonly messageCount: number;
  readonly messageTypes: readonly string[];
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly rejectionKinds: readonly (FlowResultBody["rejectionKind"])[];
  readonly entries: readonly TranscriptEntryExport[];
};

export type UniversityProtocolTranscriptExport = {
  readonly schemaId: typeof UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID;
  readonly schemaVersion: typeof UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION;
  readonly compatibility: typeof UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY;
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
  readonly counts: {
    readonly issuanceRequests: number;
    readonly issuanceResults: number;
    readonly jobApplicationRequests: number;
    readonly jobApplicationSubmissions: number;
    readonly jobApplicationResults: number;
    readonly discountRequests: number;
    readonly discountSubmissions: number;
    readonly discountResults: number;
    readonly transcriptEntries: number;
    readonly totalThreads: number;
  };
  readonly rejectionBreakdown: {
    readonly jobApplications: {
      readonly accepted: number;
      readonly verificationFailed: number;
      readonly duplicate: number;
      readonly byCompany: readonly {
        readonly companyId: string;
        readonly companyName: string;
        readonly accepted: number;
        readonly verificationFailed: number;
        readonly duplicate: number;
      }[];
    };
    readonly discounts: {
      readonly accepted: number;
      readonly verificationFailed: number;
      readonly duplicate: number;
      readonly byReason: readonly {
        readonly reason: string;
        readonly count: number;
      }[];
    };
  };
  readonly threads: {
    readonly issuance: readonly UniversityProtocolThreadExport[];
    readonly jobApplications: readonly UniversityProtocolThreadExport[];
    readonly discounts: readonly UniversityProtocolThreadExport[];
  };
};

const bytesToHex = (value: Uint8Array): string => Buffer.from(value).toString("hex");

const paddedTextToString = (value: Uint8Array): string =>
  Buffer.from(value).toString("utf8").replace(/\0+$/u, "");

const verificationMethodRefToString = (value: {
  readonly didContractAddress: { readonly bytes: Uint8Array };
  readonly methodId: Uint8Array;
}): string =>
  `${bytesToHex(value.didContractAddress.bytes)}:${paddedTextToString(value.methodId)}`;

const disclosureNamesForRequest = (
  request: {
    readonly requireDiplomaIdDisclosure?: boolean;
    readonly requireStudentIdDisclosure?: boolean;
    readonly requireGraduateNameDisclosure?: boolean;
    readonly requireUniversityNameDisclosure?: boolean;
    readonly requireFacultyNameDisclosure?: boolean;
    readonly requireAwardNameDisclosure?: boolean;
    readonly requireHonorsCodeDisclosure?: boolean;
    readonly requireGraduationYearDisclosure?: boolean;
    readonly requireGraduationMonthDisclosure?: boolean;
    readonly requireFinalGradeDisclosure?: boolean;
    readonly requireCreditsEarnedDisclosure?: boolean;
  },
): readonly string[] =>
  [
    request.requireDiplomaIdDisclosure ? "diplomaId" : undefined,
    request.requireStudentIdDisclosure ? "studentId" : undefined,
    request.requireGraduateNameDisclosure ? "graduateName" : undefined,
    request.requireUniversityNameDisclosure ? "universityName" : undefined,
    request.requireFacultyNameDisclosure ? "facultyName" : undefined,
    request.requireAwardNameDisclosure ? "awardName" : undefined,
    request.requireHonorsCodeDisclosure ? "honorsCode" : undefined,
    request.requireGraduationYearDisclosure ? "graduationYear" : undefined,
    request.requireGraduationMonthDisclosure ? "graduationMonth" : undefined,
    request.requireFinalGradeDisclosure ? "finalGrade" : undefined,
    request.requireCreditsEarnedDisclosure ? "creditsEarned" : undefined,
  ].filter((value): value is string => value !== undefined);

const compareText = (left: string, right: string): number => left.localeCompare(right);

const normalizeJson = (value: unknown): JsonValue => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  if (value instanceof Uint8Array) {
    return bytesToHex(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJson(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nextValue]) => [key, normalizeJson(nextValue)]),
    );
  }
  return String(value);
};

const jsonObject = (
  value: JsonValue,
): Readonly<Record<string, JsonValue>> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Readonly<Record<string, JsonValue>>)
    : null;

const jsonStringField = (value: JsonValue, field: string): string | null => {
  const objectValue = jsonObject(value);
  const candidate = objectValue?.[field];
  return typeof candidate === "string" ? candidate : null;
};

const jsonBooleanField = (value: JsonValue, field: string): boolean | null => {
  const objectValue = jsonObject(value);
  const candidate = objectValue?.[field];
  return typeof candidate === "boolean" ? candidate : null;
};

const dtoForMessage = (message: FlowMessage): JsonValue => {
  switch (message.type) {
    case "issuance:request": {
      const body = message.body as {
        readonly studentId: string;
        readonly holderDidUrl: string;
        readonly holderMethodId: string;
        readonly claimValues: {
          readonly diplomaId: string;
          readonly graduateName: string;
          readonly universityName: string;
          readonly awardName: string;
          readonly finalGrade: number;
          readonly creditsEarned: number;
        };
      };
      return normalizeJson({
        studentId: body.studentId,
        holderDidUrl: body.holderDidUrl,
        holderMethodId: body.holderMethodId,
        claimValues: {
          diplomaId: body.claimValues.diplomaId,
          graduateName: body.claimValues.graduateName,
          universityName: body.claimValues.universityName,
          awardName: body.claimValues.awardName,
          finalGrade: body.claimValues.finalGrade,
          creditsEarned: body.claimValues.creditsEarned,
        },
      });
    }
    case "issuance:result": {
      const body = message.body as {
        readonly studentId: string;
        readonly issuedAt: bigint;
        readonly credential: {
          readonly issuerVerificationMethodRef: {
            readonly didContractAddress: { readonly bytes: Uint8Array };
            readonly methodId: Uint8Array;
          };
          readonly claims: {
            readonly universityName: Uint8Array;
            readonly awardName: Uint8Array;
            readonly finalGrade: bigint;
          };
        };
      };
      return normalizeJson({
        studentId: body.studentId,
        issuedAt: body.issuedAt,
        issuerVerificationMethodRef: verificationMethodRefToString(
          body.credential.issuerVerificationMethodRef,
        ),
        universityName: paddedTextToString(body.credential.claims.universityName),
        awardName: paddedTextToString(body.credential.claims.awardName),
        finalGrade: body.credential.claims.finalGrade,
      });
    }
    case "presentation:request": {
      const body = message.body as {
        readonly kind: "jobApplication" | "mallDiscount";
        readonly studentId: string;
        readonly verifierId: string;
        readonly requestedRole?: string;
        readonly request: {
          readonly requireDiplomaIdDisclosure?: boolean;
          readonly requireStudentIdDisclosure?: boolean;
          readonly requireGraduateNameDisclosure?: boolean;
          readonly requireUniversityNameDisclosure?: boolean;
          readonly requireFacultyNameDisclosure?: boolean;
          readonly requireAwardNameDisclosure?: boolean;
          readonly requireHonorsCodeDisclosure?: boolean;
          readonly requireGraduationYearDisclosure?: boolean;
          readonly requireGraduationMonthDisclosure?: boolean;
          readonly requireFinalGradeDisclosure?: boolean;
          readonly requireCreditsEarnedDisclosure?: boolean;
          readonly enforceMinimumFinalGrade: boolean;
          readonly minimumFinalGrade: bigint;
          readonly verifierChallengeHash: Uint8Array;
        };
      };
      return normalizeJson({
        kind: body.kind,
        studentId: body.studentId,
        verifierId: body.verifierId,
        requestedRole: body.requestedRole ?? null,
        disclosures: disclosureNamesForRequest(body.request),
        enforceMinimumFinalGrade: body.request.enforceMinimumFinalGrade,
        minimumFinalGrade: body.request.minimumFinalGrade,
        verifierChallengeHashHex: bytesToHex(body.request.verifierChallengeHash),
      });
    }
    case "presentation:submission": {
      const body = message.body as {
        readonly kind: "jobApplication" | "mallDiscount";
        readonly studentId: string;
        readonly request: {
          readonly requireDiplomaIdDisclosure?: boolean;
          readonly requireStudentIdDisclosure?: boolean;
          readonly requireGraduateNameDisclosure?: boolean;
          readonly requireUniversityNameDisclosure?: boolean;
          readonly requireFacultyNameDisclosure?: boolean;
          readonly requireAwardNameDisclosure?: boolean;
          readonly requireHonorsCodeDisclosure?: boolean;
          readonly requireGraduationYearDisclosure?: boolean;
          readonly requireGraduationMonthDisclosure?: boolean;
          readonly requireFinalGradeDisclosure?: boolean;
          readonly requireCreditsEarnedDisclosure?: boolean;
          readonly verifierChallengeHash: Uint8Array;
        };
        readonly credential: {
          readonly issuerVerificationMethodRef: {
            readonly didContractAddress: { readonly bytes: Uint8Array };
            readonly methodId: Uint8Array;
          };
        };
      };
      return normalizeJson({
        kind: body.kind,
        studentId: body.studentId,
        disclosures: disclosureNamesForRequest(body.request),
        issuerVerificationMethodRef: verificationMethodRefToString(
          body.credential.issuerVerificationMethodRef,
        ),
        verifierChallengeHashHex: bytesToHex(body.request.verifierChallengeHash),
      });
    }
    case "presentation:result":
      return normalizeJson(message.body);
    default:
      throw new Error(`Unsupported transcript message type ${(message as FlowMessage).type}`);
  }
};

const groupMessagesByThread = (
  messages: readonly FlowMessage[],
): Readonly<Record<string, readonly FlowMessage[]>> => {
  const grouped = new Map<string, FlowMessage[]>();
  for (const message of messages) {
    const threadIdHex = bytesToHex(message.envelope.threadId);
    const existing = grouped.get(threadIdHex);
    if (existing) {
      existing.push(message);
    } else {
      grouped.set(threadIdHex, [message]);
    }
  }
  return Object.fromEntries(
    [...grouped.entries()].map(([threadIdHex, threadMessages]) => [
      threadIdHex,
      [...threadMessages],
    ]),
  );
};

const buildThreadExport = (
  phase: UniversityProtocolThreadExport["phase"],
  transcriptEntries: UniversityProtocolFlowResult["transcript"],
  messagesByThread: Readonly<Record<string, readonly FlowMessage[]>>,
  studentNames: Readonly<Record<string, string>>,
  verifierNames: Readonly<Record<string, string>>,
): readonly UniversityProtocolThreadExport[] => {
  const threadIds = [...new Set(transcriptEntries.map((entry) => entry.threadIdHex))].sort(
    compareText,
  );
  const threadExports = threadIds.map((threadIdHex) => {
    const entries = transcriptEntries.filter((entry) => entry.threadIdHex === threadIdHex);
    const messages = messagesByThread[threadIdHex] ?? [];
    const enrichedEntries = entries.map((entry) => {
      const message = messages.find(
        (candidate) => bytesToHex(candidate.envelope.messageId) === entry.messageIdHex,
      );
      return {
        type: entry.type,
        from: entry.from,
        to: entry.to,
        messageIdHex: entry.messageIdHex,
        respondsToHex: entry.respondsToHex,
        summary: entry.summary,
        dto: message ? dtoForMessage(message) : normalizeJson({ missingMessage: true }),
      } satisfies TranscriptEntryExport;
    });
    const requestEntry = enrichedEntries.find((entry) => entry.type === "presentation:request");
    const studentId =
      jsonStringField(enrichedEntries[0]?.dto ?? null, "studentId") ??
      jsonStringField(requestEntry?.dto ?? null, "studentId");
    const verifierId = jsonStringField(requestEntry?.dto ?? null, "verifierId");
    const requestedRole = jsonStringField(
      requestEntry?.dto ?? null,
      "requestedRole",
    );
    const resultEntries = enrichedEntries.filter((entry) => entry.type === "presentation:result");
    const rejectionKinds = resultEntries
      .map(
        (entry) =>
          jsonStringField(entry.dto, "rejectionKind") as FlowResultBody["rejectionKind"] | null,
      )
      .filter((kind): kind is FlowResultBody["rejectionKind"] => kind !== null)
      .filter((kind) => kind !== "none");
    const acceptedCount = resultEntries.filter(
      (entry) => jsonBooleanField(entry.dto, "accepted") === true,
    ).length;
    return {
      phase,
      threadIdHex,
      studentId,
      studentName: studentId ? studentNames[studentId] ?? null : null,
      verifierId,
      verifierName: verifierId ? verifierNames[verifierId] ?? null : null,
      requestedRole,
      messageCount: enrichedEntries.length,
      messageTypes: enrichedEntries.map((entry) => entry.type),
      acceptedCount,
      rejectedCount: resultEntries.length - acceptedCount,
      rejectionKinds,
      entries: enrichedEntries,
    };
  });
  return threadExports.sort(
    (left, right) =>
      compareText(left.studentId ?? "", right.studentId ?? "") ||
      compareText(left.verifierId ?? "", right.verifierId ?? "") ||
      compareText(left.threadIdHex, right.threadIdHex),
  );
};

const byReasonBreakdown = (
  resultsByStudent: UniversityProtocolFlowResult["discounts"]["resultsByStudent"],
): readonly { readonly reason: string; readonly count: number }[] => {
  const counts = new Map<string, number>();
  for (const results of Object.values(resultsByStudent)) {
    for (const result of results) {
      if (result.accepted) {
        continue;
      }
      counts.set(result.reason, (counts.get(result.reason) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => compareText(left.reason, right.reason));
};

export const buildUniversityProtocolTranscriptExport = (
  runner: UniversityProtocolFlowRunner,
  result: UniversityProtocolFlowResult = runner.runAll(),
): UniversityProtocolTranscriptExport => {
  const allMessages = [
    ...result.issuance.messages,
    ...result.jobApplications.messages,
    ...result.discounts.messages,
  ];
  const messagesByThread = groupMessagesByThread(allMessages);
  const studentNames = Object.fromEntries(
    runner.students.map((student) => [student.studentId, student.fullName]),
  );
  const verifierNames = Object.fromEntries([
    ...runner.companies.map((company) => [company.companyId, company.companyName]),
    [runner.mall.mallId, runner.mall.mallName],
  ]);
  const issuanceThreads = buildThreadExport(
    "issuance",
    result.transcript.filter((entry) => entry.phase === "issuance"),
    messagesByThread,
    studentNames,
    verifierNames,
  );
  const jobThreads = buildThreadExport(
    "jobApplications",
    result.transcript.filter((entry) => entry.phase === "jobApplications"),
    messagesByThread,
    studentNames,
    verifierNames,
  );
  const discountThreads = buildThreadExport(
    "discounts",
    result.transcript.filter((entry) => entry.phase === "discounts"),
    messagesByThread,
    studentNames,
    verifierNames,
  );

  const exported: UniversityProtocolTranscriptExport = {
    schemaId: UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_ID,
    schemaVersion: UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_VERSION,
    compatibility: {
      ...UNIVERSITY_PROTOCOL_TRANSCRIPT_SCHEMA_COMPATIBILITY,
    },
    dataset: {
      studentCount: runner.students.length,
      companyCount: runner.companies.length,
      discountApplicantCount: runner.discountApplicants.length,
      batchCount: runner.issuanceBatches.length,
      batchSize: runner.university.batchSize,
    },
    participants: {
      university: {
        partyId: runner.university.universityId,
        didUrl: runner.university.issuerDidUrl,
        methodId: runner.university.issuerMethodId,
      },
      companies: runner.companies
        .map((company) => ({
          companyId: company.companyId,
          companyName: company.companyName,
          verifierDidUrl: company.verifierDidUrl,
          verifierMethodId: company.verifierMethodId,
        }))
        .sort((left, right) => compareText(left.companyId, right.companyId)),
      mall: {
        mallId: runner.mall.mallId,
        mallName: runner.mall.mallName,
        verifierDidUrl: runner.mall.verifierDidUrl,
        verifierMethodId: runner.mall.verifierMethodId,
      },
    },
    counts: {
      issuanceRequests: result.issuance.requestCount,
      issuanceResults: result.issuance.resultCount,
      jobApplicationRequests: result.jobApplications.requestCount,
      jobApplicationSubmissions: result.jobApplications.submissionCount,
      jobApplicationResults: result.jobApplications.resultCount,
      discountRequests: result.discounts.requestCount,
      discountSubmissions: result.discounts.submissionCount,
      discountResults: result.discounts.resultCount,
      transcriptEntries: result.transcript.length,
      totalThreads: issuanceThreads.length + jobThreads.length + discountThreads.length,
    },
    rejectionBreakdown: {
      jobApplications: {
        accepted: result.jobApplications.acceptedCount,
        verificationFailed: result.jobApplications.verificationRejectedCount,
        duplicate: result.jobApplications.duplicateRejectedCount,
        byCompany: runner.companies
          .map((company) => {
            const routedResults = runner.students
              .filter((student) => student.assignedCompanyId === company.companyId)
              .flatMap(
                (student) => result.jobApplications.resultsByStudent[student.studentId] ?? [],
              );
            return {
              companyId: company.companyId,
              companyName: company.companyName,
              accepted: routedResults.filter((candidate) => candidate.accepted).length,
              verificationFailed: routedResults.filter(
                (candidate) => candidate.rejectionKind === "verificationFailed",
              ).length,
              duplicate: routedResults.filter(
                (candidate) => candidate.rejectionKind === "duplicate",
              ).length,
            };
          })
          .sort((left, right) => compareText(left.companyId, right.companyId)),
      },
      discounts: {
        accepted: result.discounts.acceptedCount,
        verificationFailed: result.discounts.verificationRejectedCount,
        duplicate: result.discounts.duplicateRejectedCount,
        byReason: byReasonBreakdown(result.discounts.resultsByStudent),
      },
    },
    threads: {
      issuance: issuanceThreads,
      jobApplications: jobThreads,
      discounts: discountThreads,
    },
  };

  assertUniversityProtocolTranscriptExportConforms(exported);
  return exported;
};

const renderThreadSection = (
  heading: string,
  threads: readonly UniversityProtocolThreadExport[],
): string => {
  const lines = [`## ${heading}`, ""];
  for (const thread of threads) {
    const threadLabel =
      thread.studentName && thread.studentId
        ? `${thread.studentName} (${thread.studentId})`
        : thread.threadIdHex;
    lines.push(`### ${threadLabel}`);
    lines.push(`- phase: ${thread.phase}`);
    lines.push(`- thread id: ${thread.threadIdHex}`);
    lines.push(`- student: ${thread.studentName ?? "unknown"} (${thread.studentId ?? "n/a"})`);
    if (thread.verifierId) {
      lines.push(
        `- verifier: ${thread.verifierName ?? thread.verifierId} (${thread.verifierId})`,
      );
    }
    if (thread.requestedRole) {
      lines.push(`- requested role: ${thread.requestedRole}`);
    }
    lines.push(`- message count: ${thread.messageCount}`);
    lines.push(`- accepted results: ${thread.acceptedCount}`);
    lines.push(`- rejected results: ${thread.rejectedCount}`);
    lines.push(
      `- rejection kinds: ${thread.rejectionKinds.length > 0 ? thread.rejectionKinds.join(", ") : "none"}`,
    );
    lines.push(`- message types: ${thread.messageTypes.join(", ")}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
};

export const renderUniversityProtocolTranscriptMarkdown = (
  exported: UniversityProtocolTranscriptExport,
): string => {
  const lines = [
    "# University Protocol Transcript Export",
    "",
    `- schema id: ${exported.schemaId}`,
    `- schema version: ${exported.schemaVersion}`,
    `- compatible reader floor: ${exported.compatibility.minimumReaderVersion}`,
    `- compatible reader ceiling: ${exported.compatibility.maximumReaderVersion}`,
    `- students: ${exported.dataset.studentCount}`,
    `- companies: ${exported.dataset.companyCount}`,
    `- discount applicants: ${exported.dataset.discountApplicantCount}`,
    `- issuance batches: ${exported.dataset.batchCount}`,
    `- batch size: ${exported.dataset.batchSize}`,
    `- total transcript entries: ${exported.counts.transcriptEntries}`,
    `- total threads: ${exported.counts.totalThreads}`,
    "",
    "## Rejection Breakdown",
    "",
    `- job applications accepted: ${exported.rejectionBreakdown.jobApplications.accepted}`,
    `- job applications verification failed: ${exported.rejectionBreakdown.jobApplications.verificationFailed}`,
    `- job applications duplicate: ${exported.rejectionBreakdown.jobApplications.duplicate}`,
    `- discounts accepted: ${exported.rejectionBreakdown.discounts.accepted}`,
    `- discounts verification failed: ${exported.rejectionBreakdown.discounts.verificationFailed}`,
    `- discounts duplicate: ${exported.rejectionBreakdown.discounts.duplicate}`,
    "",
    "## Company Breakdown",
    "",
  ];
  for (const company of exported.rejectionBreakdown.jobApplications.byCompany) {
    lines.push(
      `- ${company.companyName} (${company.companyId}): accepted=${company.accepted}, verificationFailed=${company.verificationFailed}, duplicate=${company.duplicate}`,
    );
  }
  lines.push("", "## Discount Rejection Reasons", "");
  for (const entry of exported.rejectionBreakdown.discounts.byReason) {
    lines.push(`- ${entry.reason}: ${entry.count}`);
  }
  lines.push("");
  return [
    `${lines.join("\n")}\n`,
    renderThreadSection("Issuance Threads", exported.threads.issuance),
    renderThreadSection("Job Application Threads", exported.threads.jobApplications),
    renderThreadSection("Discount Threads", exported.threads.discounts),
  ].join("");
};
