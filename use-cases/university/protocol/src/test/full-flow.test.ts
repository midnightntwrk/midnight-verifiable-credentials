import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, it } from "vitest";

import { UniversityProtocolFlowRunner } from "../testing.js";

const threadKey = (value: Uint8Array): string => Buffer.from(value).toString("hex");
type CompanyRequestShape = {
  readonly body: {
    readonly request: {
      readonly requireHonorsCodeDisclosure: boolean;
      readonly requireFinalGradeDisclosure: boolean;
      readonly requireCreditsEarnedDisclosure: boolean;
    };
  };
};
type PresentationResultShape = {
  readonly body: {
    readonly accepted: boolean;
    readonly reason: string;
  };
};

describe("university protocol-style multi-party flow", () => {
  let result: ReturnType<UniversityProtocolFlowRunner["runAll"]>;
  const expectedStudentCount = 10;
  const expectedBatchCount = 2;
  const expectedDiscountCount = 5;
  const expectedAcceptedDiscountCount = 3;
  const expectedRejectedDiscountCount = 2;

  beforeAll(() => {
    setNetworkId("undeployed");
    result = new UniversityProtocolFlowRunner().runAll();
  });

  it("issues 10 diploma credentials, completes 10 job applications, and evaluates 5 discount requests", () => {
    expect(result.issuance.requestCount).toEqual(expectedStudentCount);
    expect(result.issuance.resultCount).toEqual(expectedStudentCount);
    expect(result.issuance.batchCount).toEqual(expectedBatchCount);
    expect(result.issuance.issuedStudentIds).toHaveLength(expectedStudentCount);

    expect(result.jobApplications.requestCount).toEqual(expectedStudentCount);
    expect(result.jobApplications.submissionCount).toEqual(expectedStudentCount);
    expect(result.jobApplications.resultCount).toEqual(expectedStudentCount);
    expect(result.jobApplications.acceptedCount).toEqual(expectedStudentCount);
    expect(
      Object.values(result.jobApplications.companyAcceptedCounts).reduce(
        (sum, count) => sum + count,
        0,
      ),
    ).toEqual(expectedStudentCount);

    expect(result.discounts.requestCount).toEqual(expectedDiscountCount);
    expect(result.discounts.submissionCount).toEqual(expectedDiscountCount);
    expect(result.discounts.resultCount).toEqual(expectedDiscountCount);
    expect(result.discounts.acceptedCount).toEqual(expectedAcceptedDiscountCount);
    expect(result.discounts.rejectedCount).toEqual(expectedRejectedDiscountCount);
    expect(result.discounts.outcomes).toEqual({
      "STU-0001": "accepted",
      "STU-0002": "accepted",
      "STU-0003": "accepted",
      "STU-0004": "rejected",
      "STU-0005": "rejected",
    });

    const rejectedDiscountReasons = result.discounts.messages
      .filter(
        (message): message is typeof message & PresentationResultShape =>
          message.type === "presentation:result",
      )
      .filter((message) => message.body.accepted === false)
      .map((message) => message.body.reason);
    expect(rejectedDiscountReasons).toHaveLength(expectedRejectedDiscountCount);
    expect(rejectedDiscountReasons.every((reason) => reason.includes("disclosed final grade is below the verifier minimum"))).toBe(true);
  });

  it("preserves company-specific disclosure policy semantics in the protocol transcript", () => {
    const blueOceanRequest = result.jobApplications.messages.find(
      (message) =>
        message.type === "presentation:request" &&
        message.from === "company-blue-ocean-analytics" &&
        message.to === "STU-0002",
    );
    const pioneerRequest = result.jobApplications.messages.find(
      (message) =>
        message.type === "presentation:request" &&
        message.from === "company-pioneer-systems" &&
        message.to === "STU-0003",
    );
    const northwindRequest = result.jobApplications.messages.find(
      (message) =>
        message.type === "presentation:request" &&
        message.from === "company-northwind-robotics" &&
        message.to === "STU-0001",
    );

    if (
      !blueOceanRequest ||
      blueOceanRequest.type !== "presentation:request" ||
      !pioneerRequest ||
      pioneerRequest.type !== "presentation:request" ||
      !northwindRequest ||
      northwindRequest.type !== "presentation:request"
    ) {
      throw new Error("Expected company presentation requests");
    }

    const blueOceanPresentationRequest = blueOceanRequest as CompanyRequestShape;
    const pioneerPresentationRequest = pioneerRequest as CompanyRequestShape;
    const northwindPresentationRequest = northwindRequest as CompanyRequestShape;

    expect(blueOceanPresentationRequest.body.request.requireHonorsCodeDisclosure).toBe(true);
    expect(blueOceanPresentationRequest.body.request.requireFinalGradeDisclosure).toBe(false);
    expect(pioneerPresentationRequest.body.request.requireCreditsEarnedDisclosure).toBe(true);
    expect(pioneerPresentationRequest.body.request.requireFinalGradeDisclosure).toBe(true);
    expect(northwindPresentationRequest.body.request.requireFinalGradeDisclosure).toBe(true);
    expect(northwindPresentationRequest.body.request.requireHonorsCodeDisclosure).toBe(false);
  });

  it("threads result messages back to the originating issuance and presentation requests", () => {
    const issuanceRequestByThread = new Map(
      result.issuance.messages
        .filter((message) => message.type === "issuance:request")
        .map((message) => [threadKey(message.envelope.threadId), message]),
    );

    for (const message of result.issuance.messages.filter(
      (entry) => entry.type === "issuance:result",
    )) {
      const request = issuanceRequestByThread.get(threadKey(message.envelope.threadId));
      expect(request).toBeDefined();
      expect(Buffer.from(message.envelope.respondsToMessageId)).toEqual(
        Buffer.from(request!.envelope.messageId),
      );
    }

    const requestMessages = [...result.jobApplications.messages, ...result.discounts.messages].filter(
      (message) => message.type === "presentation:request",
    );
    const submissionMessages = [
      ...result.jobApplications.messages,
      ...result.discounts.messages,
    ].filter((message) => message.type === "presentation:submission");
    const requestByThread = new Map(
      requestMessages.map((message) => [threadKey(message.envelope.threadId), message]),
    );
    const submissionByThread = new Map(
      submissionMessages.map((message) => [threadKey(message.envelope.threadId), message]),
    );

    for (const message of submissionMessages) {
      const request = requestByThread.get(threadKey(message.envelope.threadId));
      expect(request).toBeDefined();
      expect(Buffer.from(message.envelope.respondsToMessageId)).toEqual(
        Buffer.from(request!.envelope.messageId),
      );
    }

    for (const message of [...result.jobApplications.messages, ...result.discounts.messages].filter(
      (entry) => entry.type === "presentation:result",
    )) {
      const submission = submissionByThread.get(threadKey(message.envelope.threadId));
      expect(submission).toBeDefined();
      expect(Buffer.from(message.envelope.respondsToMessageId)).toEqual(
        Buffer.from(submission!.envelope.messageId),
      );
    }
  });
});
