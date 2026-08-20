import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { UniversityProtocolFlowRunner } from "../testing.js";

type PresentationResultShape = {
  readonly type: "presentation:result";
  readonly body: {
    readonly accepted: boolean;
    readonly rejectionKind: "none" | "verificationFailed" | "duplicate";
    readonly studentId: string;
    readonly reason: string;
  };
};

const isPresentationResult = (
  message: ReturnType<UniversityProtocolFlowRunner["runAll"]>["jobApplications"]["messages"][number],
): message is typeof message & PresentationResultShape => message.type === "presentation:result";

describe("university protocol duplicate submission guard", () => {
  it("rejects a replay of the original request-bound job-application submission without reducing the accepted application count", () => {
    setNetworkId("undeployed");
    const baselineRunner = new UniversityProtocolFlowRunner();
    const duplicateStudent = baselineRunner.students[0];
    const runner = new UniversityProtocolFlowRunner({
      exerciseOptions: {
        duplicateJobApplicationSubmissionStudentIds: [
          duplicateStudent.studentId,
        ],
      },
    });

    const result = runner.runAll();
    const originalRequest = result.jobApplications.messages.find(
      (message) =>
        message.type === "presentation:request" &&
        message.body.studentId === duplicateStudent.studentId,
    );
    if (!originalRequest || originalRequest.type !== "presentation:request") {
      throw new Error("Missing original job-application request");
    }
    const duplicateResults = result.jobApplications.messages
      .filter(isPresentationResult)
      .filter((message) => message.body.studentId === duplicateStudent.studentId);

    const replayedSubmissions = result.jobApplications.messages.filter(
      (message) =>
        message.type === "presentation:submission" &&
        message.body.studentId === duplicateStudent.studentId,
    );
    expect(replayedSubmissions).toHaveLength(2);
    for (const submission of replayedSubmissions) {
      expect(Buffer.from(submission.envelope.threadId)).toEqual(
        Buffer.from(originalRequest.envelope.threadId),
      );
      expect(Buffer.from(submission.envelope.respondsToMessageId)).toEqual(
        Buffer.from(originalRequest.envelope.messageId),
      );
    }
    expect(result.jobApplications.acceptedCount).toEqual(runner.students.length);
    expect(result.jobApplications.duplicateRejectedCount).toEqual(1);
    expect(result.jobApplications.verificationRejectedCount).toEqual(0);
    expect(result.jobApplications.resultCount).toEqual(runner.students.length + 1);
    expect(duplicateResults).toHaveLength(2);
    expect(duplicateResults.filter((message) => message.body.accepted)).toHaveLength(1);
    expect(duplicateResults.filter((message) => !message.body.accepted)).toHaveLength(1);
    expect(
      duplicateResults.some(
        (message) => message.body.rejectionKind === "duplicate",
      ),
    ).toBe(true);
  });

  it("rejects duplicate mall discount submissions while preserving the original discount outcome", () => {
    setNetworkId("undeployed");
    const baselineRunner = new UniversityProtocolFlowRunner();
    const duplicateApplicant = baselineRunner.discountApplicants.find(
      (applicant) => applicant.expectedDiscountEligibility,
    );
    if (!duplicateApplicant) {
      throw new Error("Missing eligible discount applicant");
    }
    const duplicateStudentId = duplicateApplicant.studentId;
    const runner = new UniversityProtocolFlowRunner({
      exerciseOptions: {
        duplicateMallDiscountSubmissionStudentIds: [duplicateStudentId],
      },
    });

    const result = runner.runAll();
    const duplicateResults = result.discounts.messages
      .filter(isPresentationResult)
      .filter((message) => message.body.studentId === duplicateStudentId);

    expect(result.discounts.duplicateRejectedCount).toEqual(1);
    expect(result.discounts.verificationRejectedCount).toBeGreaterThanOrEqual(0);
    expect(duplicateResults).toHaveLength(2);
    expect(duplicateResults.filter((message) => message.body.accepted)).toHaveLength(1);
    expect(duplicateResults.filter((message) => !message.body.accepted)).toHaveLength(1);
    expect(
      duplicateResults.some(
        (message) => message.body.rejectionKind === "duplicate",
      ),
    ).toBe(true);
    expect(result.discounts.outcomes[duplicateStudentId]).toBe("accepted");
  });
});
