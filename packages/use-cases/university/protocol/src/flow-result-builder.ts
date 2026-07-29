import { resultBodiesByStudent } from "./flow-messages.js";
import type {
  DiscountApplicantRecord,
  IssuanceBatchRecord,
  UniversityProtocolFlowResult,
  UniversityProtocolMessage,
  UniversityProtocolTranscriptEntry,
} from "./model.js";

export type IssuanceFlowExecutionResult = {
  readonly issuedStudentIds: readonly string[];
  readonly duplicateRequestCount: number;
  readonly idempotentReplayCount: number;
  readonly idempotentReplayStudentIds: readonly string[];
};

type VerifierCounters = {
  readonly acceptedCount: number;
  readonly duplicateRejectedCount: number;
  readonly verificationRejectedCount: number;
};

export type UniversityProtocolResultBuildInput = {
  readonly issuanceResult: IssuanceFlowExecutionResult;
  readonly issuanceMs: number;
  readonly jobApplicationsMs: number;
  readonly discountsMs: number;
  readonly totalMs: number;
  readonly issuanceBatches: readonly IssuanceBatchRecord[];
  readonly discountApplicants: readonly DiscountApplicantRecord[];
  readonly issuanceMessages: readonly UniversityProtocolMessage[];
  readonly jobMessages: readonly UniversityProtocolMessage[];
  readonly discountMessages: readonly UniversityProtocolMessage[];
  readonly companyAgents: ReadonlyMap<string, VerifierCounters>;
  readonly mallAgent: VerifierCounters;
  readonly transcriptEntries: readonly UniversityProtocolTranscriptEntry[];
};

const countMessages = (
  messages: readonly UniversityProtocolMessage[],
  type: UniversityProtocolMessage["type"],
): number => messages.filter((message) => message.type === type).length;

const sumCompanyAgentCounts = (
  agents: Iterable<VerifierCounters>,
  selector: (agent: VerifierCounters) => number,
): number => {
  let sum = 0;
  for (const agent of agents) {
    sum += selector(agent);
  }
  return sum;
};

const buildIssuanceResult = (
  input: Pick<
    UniversityProtocolResultBuildInput,
    "issuanceResult" | "issuanceBatches" | "issuanceMessages"
  >,
): UniversityProtocolFlowResult["issuance"] => ({
  requestCount: countMessages(input.issuanceMessages, "issuance:request"),
  resultCount: countMessages(input.issuanceMessages, "issuance:result"),
  batchCount: input.issuanceBatches.length,
  duplicateRequestCount: input.issuanceResult.duplicateRequestCount,
  idempotentReplayCount: input.issuanceResult.idempotentReplayCount,
  idempotentReplayStudentIds:
    input.issuanceResult.idempotentReplayStudentIds,
  issuedStudentIds: input.issuanceResult.issuedStudentIds,
  messages: input.issuanceMessages,
});

const buildDiscountResult = (
  input: Pick<
    UniversityProtocolResultBuildInput,
    "discountApplicants" | "discountMessages" | "mallAgent"
  >,
): UniversityProtocolFlowResult["discounts"] => {
  const discountResultsByStudent = resultBodiesByStudent(
    input.discountMessages,
    "mallDiscount",
  );
  const discountOutcomes = Object.fromEntries(
    input.discountApplicants.map((applicant) => {
      const discountResults = discountResultsByStudent[applicant.studentId];
      const firstResult = discountResults?.at(0);
      // The first result is the canonical business decision; duplicate
      // rejections emitted by the protocol guard must not overwrite it.
      return [
        applicant.studentId,
        firstResult?.accepted ? "accepted" : "rejected",
      ] as const;
    }),
  );

  return {
    requestCount: countMessages(input.discountMessages, "presentation:request"),
    submissionCount: countMessages(
      input.discountMessages,
      "presentation:submission",
    ),
    resultCount: countMessages(input.discountMessages, "presentation:result"),
    acceptedCount: input.mallAgent.acceptedCount,
    rejectedCount:
      input.mallAgent.duplicateRejectedCount +
      input.mallAgent.verificationRejectedCount,
    duplicateRejectedCount: input.mallAgent.duplicateRejectedCount,
    verificationRejectedCount: input.mallAgent.verificationRejectedCount,
    outcomes: discountOutcomes,
    resultsByStudent: discountResultsByStudent,
    messages: input.discountMessages,
  };
};

export const buildUniversityProtocolFlowResult = (
  input: UniversityProtocolResultBuildInput,
): UniversityProtocolFlowResult => {
  const companyAcceptedCounts = Object.fromEntries(
    [...input.companyAgents.entries()].map(([companyId, agent]) => [
      companyId,
      agent.acceptedCount,
    ]),
  );
  const companyAcceptedCount = Object.values(companyAcceptedCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const companyDuplicateRejectedCount = sumCompanyAgentCounts(
    input.companyAgents.values(),
    (agent) => agent.duplicateRejectedCount,
  );
  const companyVerificationRejectedCount = sumCompanyAgentCounts(
    input.companyAgents.values(),
    (agent) => agent.verificationRejectedCount,
  );
  const jobResultsByStudent = resultBodiesByStudent(
    input.jobMessages,
    "jobApplication",
  );

  return {
    metrics: {
      issuanceMs: input.issuanceMs,
      jobApplicationsMs: input.jobApplicationsMs,
      discountsMs: input.discountsMs,
      totalMs: input.totalMs,
    },
    issuance: buildIssuanceResult(input),
    jobApplications: {
      requestCount: countMessages(input.jobMessages, "presentation:request"),
      submissionCount: countMessages(
        input.jobMessages,
        "presentation:submission",
      ),
      resultCount: countMessages(input.jobMessages, "presentation:result"),
      acceptedCount: companyAcceptedCount,
      rejectedCount:
        companyDuplicateRejectedCount + companyVerificationRejectedCount,
      duplicateRejectedCount: companyDuplicateRejectedCount,
      verificationRejectedCount: companyVerificationRejectedCount,
      companyAcceptedCounts,
      resultsByStudent: jobResultsByStudent,
      messages: input.jobMessages,
    },
    discounts: buildDiscountResult(input),
    transcript: input.transcriptEntries,
  };
};
