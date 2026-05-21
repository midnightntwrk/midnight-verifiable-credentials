import { describe, expect, it } from "vitest";

import {
  buildUniversityProtocolFlowResult,
  type IssuanceFlowExecutionResult,
} from "../flow-result-builder";
import type { UniversityProtocolMessage } from "../model";

const protocolMessage = (
  type: UniversityProtocolMessage["type"],
  body: Record<string, unknown> = {},
): UniversityProtocolMessage =>
  ({
    type,
    body,
  }) as UniversityProtocolMessage;

describe("university protocol result builder", () => {
  it("aggregates message counts, verifier counters, and canonical discount outcomes", () => {
    const issuanceResult: IssuanceFlowExecutionResult = {
      issuedStudentIds: ["STU-0001"],
      duplicateRequestCount: 1,
      idempotentReplayCount: 1,
      idempotentReplayStudentIds: ["STU-0001"],
    };

    const result = buildUniversityProtocolFlowResult({
      issuanceResult,
      issuanceMs: 10,
      jobApplicationsMs: 20,
      discountsMs: 30,
      totalMs: 60,
      issuanceBatches: [
        { batchId: "BATCH-1", studentIds: ["STU-0001"], size: 1 },
      ],
      discountApplicants: [
        {
          studentId: "STU-0001",
          fullName: "Student One",
          finalGrade: 96,
          expectedDiscountEligibility: true,
          explanation: "eligible control applicant",
        },
        {
          studentId: "STU-0002",
          fullName: "Student Two",
          finalGrade: 60,
          expectedDiscountEligibility: false,
          explanation: "ineligible control applicant",
        },
      ],
      issuanceMessages: [
        protocolMessage("issuance:request"),
        protocolMessage("issuance:result"),
      ],
      jobMessages: [
        protocolMessage("presentation:request"),
        protocolMessage("presentation:submission"),
        protocolMessage("presentation:result", {
          kind: "jobApplication",
          studentId: "STU-0001",
          accepted: true,
          rejectionKind: "none",
        }),
      ],
      discountMessages: [
        protocolMessage("presentation:request"),
        protocolMessage("presentation:submission"),
        protocolMessage("presentation:result", {
          kind: "mallDiscount",
          studentId: "STU-0001",
          accepted: true,
          rejectionKind: "none",
        }),
        protocolMessage("presentation:result", {
          kind: "mallDiscount",
          studentId: "STU-0001",
          accepted: false,
          rejectionKind: "duplicate",
        }),
        protocolMessage("presentation:result", {
          kind: "mallDiscount",
          studentId: "STU-0002",
          accepted: false,
          rejectionKind: "verificationFailed",
        }),
      ],
      companyAgents: new Map([
        [
          "COMPANY-A",
          {
            acceptedCount: 2,
            duplicateRejectedCount: 1,
            verificationRejectedCount: 0,
          },
        ],
        [
          "COMPANY-B",
          {
            acceptedCount: 1,
            duplicateRejectedCount: 0,
            verificationRejectedCount: 2,
          },
        ],
      ]),
      mallAgent: {
        acceptedCount: 1,
        duplicateRejectedCount: 1,
        verificationRejectedCount: 1,
      },
      transcriptEntries: [],
    });

    expect(result.metrics).toEqual({
      issuanceMs: 10,
      jobApplicationsMs: 20,
      discountsMs: 30,
      totalMs: 60,
    });
    expect(result.issuance).toMatchObject({
      requestCount: 1,
      resultCount: 1,
      batchCount: 1,
      duplicateRequestCount: 1,
      idempotentReplayCount: 1,
      issuedStudentIds: ["STU-0001"],
    });
    expect(result.jobApplications).toMatchObject({
      requestCount: 1,
      submissionCount: 1,
      resultCount: 1,
      acceptedCount: 3,
      duplicateRejectedCount: 1,
      verificationRejectedCount: 2,
      rejectedCount: 3,
      companyAcceptedCounts: {
        "COMPANY-A": 2,
        "COMPANY-B": 1,
      },
    });
    expect(result.discounts).toMatchObject({
      requestCount: 1,
      submissionCount: 1,
      resultCount: 3,
      acceptedCount: 1,
      duplicateRejectedCount: 1,
      verificationRejectedCount: 1,
      rejectedCount: 2,
      outcomes: {
        "STU-0001": "accepted",
        "STU-0002": "rejected",
      },
    });
  });
});
