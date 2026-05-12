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

describe("university protocol-style multi-party flow", () => {
  beforeAll(() => {
    setNetworkId("undeployed");
  });

  it("issues 100 diploma credentials, completes 100 job applications, and evaluates 5 discount requests", () => {
    const runner = new UniversityProtocolFlowRunner();
    const result = runner.runAll();

    expect(result.issuance.requestCount).toEqual(100);
    expect(result.issuance.resultCount).toEqual(100);
    expect(result.issuance.batchCount).toEqual(5);
    expect(result.issuance.issuedStudentIds).toHaveLength(100);

    expect(result.jobApplications.requestCount).toEqual(100);
    expect(result.jobApplications.submissionCount).toEqual(100);
    expect(result.jobApplications.resultCount).toEqual(100);
    expect(result.jobApplications.acceptedCount).toEqual(100);
    expect(
      Object.values(result.jobApplications.companyAcceptedCounts).reduce(
        (sum, count) => sum + count,
        0,
      ),
    ).toEqual(100);

    expect(result.discounts.requestCount).toEqual(5);
    expect(result.discounts.submissionCount).toEqual(5);
    expect(result.discounts.resultCount).toEqual(5);
    expect(result.discounts.acceptedCount).toEqual(3);
    expect(result.discounts.rejectedCount).toEqual(2);
    expect(result.discounts.outcomes).toEqual({
      "STU-0001": "accepted",
      "STU-0002": "accepted",
      "STU-0003": "accepted",
      "STU-0004": "rejected",
      "STU-0005": "rejected",
    });
  });

  it("preserves company-specific disclosure policy semantics in the protocol transcript", () => {
    const runner = new UniversityProtocolFlowRunner();
    const result = runner.runAll();

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
    const runner = new UniversityProtocolFlowRunner();
    const result = runner.runAll();

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
    const requestByThread = new Map(
      requestMessages.map((message) => [threadKey(message.envelope.threadId), message]),
    );

    for (const message of [...result.jobApplications.messages, ...result.discounts.messages].filter(
      (entry) => entry.type === "presentation:result",
    )) {
      const request = requestByThread.get(threadKey(message.envelope.threadId));
      expect(request).toBeDefined();
    }
  });
});
