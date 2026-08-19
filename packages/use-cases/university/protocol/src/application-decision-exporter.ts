import type {
  UniversityProtocolApplicationDecisionArtifact,
  UniversityProtocolApplicationDecisionMessage,
  UniversityProtocolApplicationDecisionRecord,
  UniversityProtocolDecisionResultEntry,
} from "./application-decision-schema.js";
import {
  assertUniversityProtocolApplicationDecisionsConforms,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
} from "./application-decision-schema.js";
import type {
  UniversityProtocolFlowResult,
  UniversityProtocolFlowRunner,
} from "./flow.js";
import type {
  CompanyRecord,
  MallRecord,
  StudentRecord,
  UniversityIssuanceRequestBody,
  UniversityIssuanceResultBody,
  UniversityPresentationRequestBody,
  UniversityPresentationResultBody,
  UniversityPresentationSubmissionBody,
  UniversityProtocolMessage,
} from "./model.js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

type DecisionResultsByStudent = Readonly<
  Record<string, readonly UniversityPresentationResultBody[]>
>;

type MessageWithBody<TBody> = UniversityProtocolMessage & { body: TBody };
type VerifierSummary = {
  readonly id: string;
  readonly name: string;
};

const verifierIdentity = (
  verifier: CompanyRecord | MallRecord,
): VerifierSummary =>
  "companyId" in verifier
    ? { id: verifier.companyId, name: verifier.companyName }
    : { id: verifier.mallId, name: verifier.mallName };

const compareText = (left: string, right: string): number =>
  left.localeCompare(right);
const bytesToHex = (value: Uint8Array): string =>
  Buffer.from(value).toString("hex");
const paddedTextToString = (value: Uint8Array): string =>
  Buffer.from(value).toString("utf8").replace(/\0+$/gu, "");
const assertNever = (value: never): never => {
  throw new Error(`Unhandled university protocol message: ${String(value)}`);
};

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
      Object.entries(value).map(([key, nextValue]) => [
        key,
        normalizeJson(nextValue),
      ]),
    );
  }
  return String(value);
};

const verificationMethodRefToString = (value: {
  readonly didContractAddress: { readonly bytes: Uint8Array };
  readonly methodId: Uint8Array;
}): string =>
  `${bytesToHex(value.didContractAddress.bytes)}:${paddedTextToString(
    value.methodId,
  )}`;

const disclosureNamesForRequest = (request: {
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
}): readonly string[] =>
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

const disclosureNamesForPresentation = (presentation: {
  readonly disclosed: {
    readonly revealDiplomaId: boolean;
    readonly revealStudentId: boolean;
    readonly revealGraduateName: boolean;
    readonly revealUniversityName: boolean;
    readonly revealFacultyName: boolean;
    readonly revealAwardName: boolean;
    readonly revealHonorsCode: boolean;
    readonly revealGraduationYear: boolean;
    readonly revealGraduationMonth: boolean;
    readonly revealFinalGrade: boolean;
    readonly revealCreditsEarned: boolean;
  };
}): readonly string[] =>
  [
    presentation.disclosed.revealDiplomaId ? "diplomaId" : undefined,
    presentation.disclosed.revealStudentId ? "studentId" : undefined,
    presentation.disclosed.revealGraduateName ? "graduateName" : undefined,
    presentation.disclosed.revealUniversityName ? "universityName" : undefined,
    presentation.disclosed.revealFacultyName ? "facultyName" : undefined,
    presentation.disclosed.revealAwardName ? "awardName" : undefined,
    presentation.disclosed.revealHonorsCode ? "honorsCode" : undefined,
    presentation.disclosed.revealGraduationYear ? "graduationYear" : undefined,
    presentation.disclosed.revealGraduationMonth ? "graduationMonth" : undefined,
    presentation.disclosed.revealFinalGrade ? "finalGrade" : undefined,
    presentation.disclosed.revealCreditsEarned ? "creditsEarned" : undefined,
  ].filter((value): value is string => value !== undefined);

const normalizedBody = (message: UniversityProtocolMessage): unknown => {
  switch (message.type) {
    case "issuance:request": {
      const body = message.body;
      return {
        studentId: body.studentId,
        holderDidUrl: body.holderDidUrl,
        holderMethodId: body.holderMethodId,
        claimValues: {
          diplomaId: body.claimValues.diplomaId,
          graduateName: body.claimValues.graduateName,
          universityName: body.claimValues.universityName,
          awardName: body.claimValues.awardName,
          finalGrade: body.claimValues.finalGrade,
        },
      };
    }
    case "issuance:result": {
      const body = message.body;
      return {
        studentId: body.studentId,
        issuedAt: body.issuedAt,
        issuerVerificationMethodRef: verificationMethodRefToString(
          body.credential.issuerVerificationMethodRef,
        ),
        universityName: paddedTextToString(
          body.credential.claims.universityName,
        ),
        awardName: paddedTextToString(body.credential.claims.awardName),
        finalGrade: body.credential.claims.finalGrade,
      };
    }
    case "presentation:request": {
      const body = message.body;
      return {
        kind: body.kind,
        studentId: body.studentId,
        verifierId: body.verifierId,
        requestedRole: body.requestedRole ?? null,
        disclosures: disclosureNamesForRequest(body.request),
        requestedDisclosures: disclosureNamesForRequest(body.request),
        enforceMinimumFinalGrade: body.request.enforceMinimumFinalGrade,
        minimumFinalGrade: body.request.minimumFinalGrade,
        verifierChallengeHashHex: bytesToHex(
          body.request.verifierChallengeHash,
        ),
      };
    }
    case "presentation:submission": {
      const body = message.body;
      return {
        kind: body.kind,
        studentId: body.studentId,
        requestedDisclosures: disclosureNamesForRequest(body.request),
        disclosures: disclosureNamesForPresentation(body.presentation),
        presentationDisclosures: disclosureNamesForPresentation(body.presentation),
        directCredentialClaimFields: Object.keys(body.credential.claims).sort(),
        directCredentialClaimsTransported: true,
        issuerVerificationMethodRef: verificationMethodRefToString(
          body.credential.issuerVerificationMethodRef,
        ),
        verifierChallengeHashHex: bytesToHex(
          body.request.verifierChallengeHash,
        ),
      };
    }
    case "presentation:result": {
      const body = message.body;
      return {
        kind: body.kind,
        studentId: body.studentId,
        accepted: body.accepted,
        reason: body.reason,
        rejectionKind: body.rejectionKind,
      };
    }
    default:
      return assertNever(message);
  }
};

const messageSummary = (
  message: UniversityProtocolMessage,
): UniversityProtocolApplicationDecisionMessage => ({
  threadIdHex: bytesToHex(message.envelope.threadId),
  messageIdHex: bytesToHex(message.envelope.messageId),
  respondsToHex: bytesToHex(message.envelope.respondsToMessageId),
  from: message.from,
  to: message.to,
  summary: (() => {
    switch (message.type) {
      case "issuance:request": {
        const body = message.body;
        return `Student ${body.studentId} requested diploma issuance`;
      }
      case "issuance:result": {
        const body = message.body;
        return `University issued diploma credential to ${body.studentId}`;
      }
      case "presentation:request": {
        const body = message.body;
        return `${body.kind} request from ${message.from} for ${body.studentId}`;
      }
      case "presentation:submission": {
        const body = message.body;
        return `${body.kind} submission from ${message.from} for ${body.studentId}`;
      }
      case "presentation:result": {
        const body = message.body;
        return `${body.kind} result for ${body.studentId}`;
      }
      default:
        return assertNever(message);
    }
  })(),
  dto: normalizeJson(normalizedBody(message)),
});

const filterMessagesByStudent = <T extends UniversityProtocolMessage>(
  messages: readonly UniversityProtocolMessage[],
  studentId: string,
  type: T["type"],
): readonly T[] =>
  messages.filter(
    (message): message is T =>
      message.type === type &&
      "studentId" in message.body &&
      message.body.studentId === studentId,
  );

const firstMessageForStudent = <T extends UniversityProtocolMessage>(
  messages: readonly UniversityProtocolMessage[],
  studentId: string,
  messageType: T["type"],
): T => {
  const found = messages.find(
    (message) =>
      message.type === messageType &&
      "studentId" in message.body &&
      message.body.studentId === studentId,
  );
  if (!found) {
    throw new Error(`Missing ${messageType} message for ${studentId}`);
  }
  return found as T;
};

const buildDecisionRecord = (
  kind: "jobApplication" | "mallDiscount",
  student: StudentRecord,
  verifier: CompanyRecord | MallRecord,
  request: UniversityProtocolMessage,
  messages: readonly UniversityProtocolMessage[],
  studentDidUrl: string,
  studentMethodId: string,
  verifierName: string,
): UniversityProtocolApplicationDecisionRecord => {
  const requestDto = messageSummary(request);
  const verifierIdentitySummary = verifierIdentity(verifier);
  const submissions = [
    ...filterMessagesByStudent<
      MessageWithBody<UniversityPresentationSubmissionBody>
    >(messages, student.studentId, "presentation:submission"),
  ].sort((left, right) =>
    compareText(
      bytesToHex(left.envelope.messageId),
      bytesToHex(right.envelope.messageId),
    ),
  );

  const resultMessages = [
    ...filterMessagesByStudent<
      MessageWithBody<UniversityPresentationResultBody>
    >(messages, student.studentId, "presentation:result"),
  ].sort((left, right) =>
    compareText(
      bytesToHex(left.envelope.messageId),
      bytesToHex(right.envelope.messageId),
    ),
  );

  const results = resultMessages.map((resultMessage, index) => {
    const body = resultMessage.body as UniversityPresentationResultBody;
    return {
      sequence: index + 1,
      message: messageSummary(resultMessage),
      accepted: body.accepted,
      reason: body.reason,
      rejectionKind: body.rejectionKind,
    } satisfies UniversityProtocolDecisionResultEntry;
  });

  const firstResult = results.at(0);

  return {
    kind,
    studentId: student.studentId,
    studentName: student.fullName,
    studentDidUrl,
    studentMethodId,
    verifierId: verifierIdentitySummary.id,
    verifierName,
    verifierDidUrl: verifier.verifierDidUrl,
    verifierMethodId: verifier.verifierMethodId,
    requestedRole: kind === "jobApplication" ? student.requestedJobRole : null,
    request: requestDto,
    submissions: submissions.map(messageSummary),
    results,
    finalAccepted: firstResult?.accepted ?? false,
    finalReason: firstResult?.reason ?? "No result received",
    finalRejectionKind: firstResult?.rejectionKind ?? "noResultReceived",
  };
};

const buildDecisionSummaryByCompany = (
  students: readonly StudentRecord[],
  companies: readonly CompanyRecord[],
  resultsByStudent: DecisionResultsByStudent,
): readonly {
  readonly companyId: string;
  readonly companyName: string;
  readonly accepted: number;
  readonly verificationFailed: number;
  readonly duplicate: number;
}[] =>
  companies
    .map((company) => {
      const routedResults = students
        .filter((student) => student.assignedCompanyId === company.companyId)
        .flatMap((student) => resultsByStudent[student.studentId] ?? []);
      return {
        companyId: company.companyId,
        companyName: company.companyName,
        accepted: routedResults.filter((candidate) => candidate.accepted)
          .length,
        verificationFailed: routedResults.filter(
          (candidate) => candidate.rejectionKind === "verificationFailed",
        ).length,
        duplicate: routedResults.filter(
          (candidate) => candidate.rejectionKind === "duplicate",
        ).length,
      };
    })
    .sort((left, right) => compareText(left.companyId, right.companyId));

const byReasonBreakdown = (
  resultsByStudent: DecisionResultsByStudent,
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
    .sort(([left], [right]) => compareText(left, right))
    .map(([reason, count]) => ({ reason, count }));
};

export const buildUniversityProtocolApplicationDecisionsExport = (
  runner: UniversityProtocolFlowRunner,
  result: UniversityProtocolFlowResult = runner.runAll(),
): UniversityProtocolApplicationDecisionArtifact => {
  const issuanceByStudent: UniversityProtocolApplicationDecisionArtifact["issuance"]["byStudent"] =
    runner.students
      .map((student) => {
        const request = firstMessageForStudent<
          UniversityProtocolMessage & { body: UniversityIssuanceRequestBody }
        >(result.issuance.messages, student.studentId, "issuance:request");
        const resultMessage = firstMessageForStudent<
          UniversityProtocolMessage & { body: UniversityIssuanceResultBody }
        >(result.issuance.messages, student.studentId, "issuance:result");

        const issuanceResultBody =
          resultMessage.body as UniversityIssuanceResultBody;

        return {
          studentId: student.studentId,
          studentName: student.fullName,
          holderDidUrl: student.holderDidUrl,
          holderMethodId: student.holderMethodId,
          request: messageSummary(request),
          result: messageSummary(resultMessage),
          credential: {
            issuerVerificationMethodRef: verificationMethodRefToString(
              issuanceResultBody.credential.issuerVerificationMethodRef,
            ),
            issuedAt: issuanceResultBody.issuedAt.toString(),
            credentialProofCreatedAt:
              issuanceResultBody.credentialProofCreatedAt.toString(),
            presentationProofCreatedAt:
              issuanceResultBody.presentationProofCreatedAt.toString(),
            universityName: paddedTextToString(
              issuanceResultBody.credential.claims.universityName,
            ),
            awardName: paddedTextToString(
              issuanceResultBody.credential.claims.awardName,
            ),
            finalGrade:
              issuanceResultBody.credential.claims.finalGrade.toString(),
          },
        };
      })
      .sort((left, right) => compareText(left.studentId, right.studentId));

  const jobApplicationDecisions: UniversityProtocolApplicationDecisionRecord[] =
    runner.students
      .map((student) => {
        const company = runner.companies.find(
          (candidate) => candidate.companyId === student.assignedCompanyId,
        );
        if (!company) {
          throw new Error(
            `Missing company ${student.assignedCompanyId} for student ${student.studentId}`,
          );
        }

        const request = firstMessageForStudent<
          UniversityProtocolMessage & {
            body: UniversityPresentationRequestBody;
          }
        >(
          result.jobApplications.messages,
          student.studentId,
          "presentation:request",
        );

        return buildDecisionRecord(
          "jobApplication",
          student,
          company,
          request,
          result.jobApplications.messages,
          student.holderDidUrl,
          student.holderMethodId,
          company.companyName,
        );
      })
      .sort((left, right) => compareText(left.studentId, right.studentId));

  const discountDecisions: UniversityProtocolApplicationDecisionRecord[] =
    runner.discountApplicants
      .map((applicant) => {
        const student = runner.students.find(
          (candidate) => candidate.studentId === applicant.studentId,
        );
        if (!student) {
          throw new Error(
            `Missing student ${applicant.studentId} for discount applicant`,
          );
        }

        const request = firstMessageForStudent<
          UniversityProtocolMessage & {
            body: UniversityPresentationRequestBody;
          }
        >(result.discounts.messages, student.studentId, "presentation:request");

        return buildDecisionRecord(
          "mallDiscount",
          student,
          runner.mall,
          request,
          result.discounts.messages,
          student.holderDidUrl,
          student.holderMethodId,
          runner.mall.mallName,
        );
      })
      .sort((left, right) => compareText(left.studentId, right.studentId));

  const companySummaries = buildDecisionSummaryByCompany(
    runner.students,
    runner.companies,
    result.jobApplications.resultsByStudent,
  );

  const exported: UniversityProtocolApplicationDecisionArtifact = {
    schemaId: UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID,
    schemaVersion: UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
    compatibility: {
      ...UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
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
    issuance: {
      byStudent: issuanceByStudent,
    },
    jobApplications: {
      byStudentCompany: jobApplicationDecisions,
    },
    discounts: {
      byApplicant: discountDecisions,
    },
    summary: {
      jobApplications: {
        requested: result.jobApplications.requestCount,
        accepted: result.jobApplications.acceptedCount,
        rejected: result.jobApplications.rejectedCount,
        duplicate: result.jobApplications.duplicateRejectedCount,
        verificationFailed: result.jobApplications.verificationRejectedCount,
        byCompany: companySummaries,
      },
      discounts: {
        requested: result.discounts.requestCount,
        accepted: result.discounts.acceptedCount,
        rejected: result.discounts.rejectedCount,
        duplicate: result.discounts.duplicateRejectedCount,
        verificationFailed: result.discounts.verificationRejectedCount,
        byReason: byReasonBreakdown(result.discounts.resultsByStudent),
      },
    },
  };

  assertUniversityProtocolApplicationDecisionsConforms(exported);
  return exported;
};

const formatMessageBlock = (
  heading: string,
  message: UniversityProtocolApplicationDecisionMessage,
): string[] => [
  `#### ${heading}`,
  `- thread: ${message.threadIdHex}`,
  `- from: ${message.from}`,
  `- to: ${message.to}`,
  `- message: ${message.messageIdHex}`,
  `- responds-to: ${message.respondsToHex}`,
  `- summary: ${message.summary}`,
  `- dto: ${JSON.stringify(message.dto)}`,
];

const formatDecision = (
  decision: UniversityProtocolApplicationDecisionRecord,
): string[] => {
  const lines = [
    `### ${decision.studentName} (${decision.studentId}) -> ${decision.verifierName} (${decision.verifierId})`,
    `- kind: ${decision.kind}`,
    `- role: ${decision.requestedRole ?? "n/a"}`,
    `- final decision: ${decision.finalAccepted ? "accepted" : "rejected"}`,
    `- final reason: ${decision.finalReason}`,
    `- final rejection kind: ${decision.finalRejectionKind}`,
  ];

  lines.push(...formatMessageBlock("Request", decision.request));
  if (decision.submissions.length === 0) {
    lines.push("- submissions: none");
  } else {
    lines.push("- submissions:");
    for (const submission of decision.submissions) {
      lines.push(
        ...formatMessageBlock("submission", submission).map(
          (line) => `  ${line}`,
        ),
      );
    }
  }

  if (decision.results.length === 0) {
    lines.push("- results: none");
  } else {
    lines.push("- results:");
    for (const result of decision.results) {
      lines.push(
        `  - sequence ${result.sequence}: ${result.accepted ? "accepted" : "rejected"} (${result.rejectionKind})`,
      );
      lines.push(`    - reason: ${result.reason}`);
      lines.push(`    - response: ${result.message.messageIdHex}`);
    }
  }
  return lines;
};

export const renderUniversityProtocolApplicationDecisionsMarkdown = (
  exported: UniversityProtocolApplicationDecisionArtifact,
): string => {
  const lines = [
    "# University Protocol Application Decisions",
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
    "",
    "## Issuance Traces",
  ];

  for (const student of exported.issuance.byStudent) {
    lines.push(`### ${student.studentName} (${student.studentId})`);
    lines.push(`- holder did: ${student.holderDidUrl}`);
    lines.push(`- holder method: ${student.holderMethodId}`);
    lines.push(
      `- credential: ${student.credential.universityName} / ${student.credential.awardName}`,
    );
    lines.push(
      ...formatMessageBlock("Request", student.request).map(
        (line) => `- ${line}`,
      ),
    );
    lines.push(
      ...formatMessageBlock("Result", student.result).map(
        (line) => `- ${line}`,
      ),
    );
  }

  lines.push("", "## Job-Application Decisions", "");
  for (const decision of exported.jobApplications.byStudentCompany) {
    lines.push(...formatDecision(decision));
  }

  lines.push("", "## Discount Decisions", "");
  for (const decision of exported.discounts.byApplicant) {
    lines.push(...formatDecision(decision));
  }

  lines.push(
    "",
    "## Decision Summaries",
    `- Job applications requested: ${exported.summary.jobApplications.requested}`,
    `- Job applications accepted: ${exported.summary.jobApplications.accepted}`,
    `- Job applications rejected: ${exported.summary.jobApplications.rejected}`,
    `- Job applications verification failed: ${exported.summary.jobApplications.verificationFailed}`,
    `- Job applications duplicate: ${exported.summary.jobApplications.duplicate}`,
    `- Discounts requested: ${exported.summary.discounts.requested}`,
    `- Discounts accepted: ${exported.summary.discounts.accepted}`,
    `- Discounts rejected: ${exported.summary.discounts.rejected}`,
    `- Discounts verification failed: ${exported.summary.discounts.verificationFailed}`,
    `- Discounts duplicate: ${exported.summary.discounts.duplicate}`,
    "",
    "### Job application by company",
  );

  for (const entry of exported.summary.jobApplications.byCompany) {
    lines.push(
      `- ${entry.companyName} (${entry.companyId}): accepted=${entry.accepted}, verificationFailed=${entry.verificationFailed}, duplicate=${entry.duplicate}`,
    );
  }

  lines.push("", "### Discount rejection reasons");
  if (exported.summary.discounts.byReason.length === 0) {
    lines.push("- none");
  } else {
    for (const reason of exported.summary.discounts.byReason) {
      lines.push(`- ${reason.reason}: ${reason.count}`);
    }
  }

  return `${lines.join("\n")}\n`;
};
