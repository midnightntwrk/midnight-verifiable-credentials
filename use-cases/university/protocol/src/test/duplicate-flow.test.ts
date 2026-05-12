import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { UniversityProtocolFlowRunner } from "../testing.js";

type PresentationRequestShape = {
  readonly body: {
    readonly kind: "jobApplication" | "mallDiscount";
  };
};

type PresentationResultShape = {
  readonly type: "presentation:result";
  readonly body: {
    readonly accepted: boolean;
    readonly studentId: string;
    readonly reason: string;
  };
};

describe("university protocol duplicate submission guard", () => {
  it("rejects duplicate job-application submissions without reducing the accepted application count", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const duplicateStudent = runner.students[0];
    const studentAgent = runner.studentAgents.get(duplicateStudent.studentId);
    if (!studentAgent) {
      throw new Error(`Missing student agent ${duplicateStudent.studentId}`);
    }

    const original =
      studentAgent.receivePresentationRequestAndSendSubmission.bind(
        studentAgent,
      );
    studentAgent.receivePresentationRequestAndSendSubmission = (
      bus,
      message,
      issuerProfile,
      transcript,
      messages,
    ) => {
      original(bus, message, issuerProfile, transcript, messages);
      const request = message as typeof message & PresentationRequestShape;
      if (request.body.kind === "jobApplication") {
        original(bus, message, issuerProfile, transcript, messages);
      }
    };

    const result = runner.runAll();
    const duplicateResults = result.jobApplications.messages.filter(
      (message): message is typeof message & PresentationResultShape =>
        message.type === "presentation:result" &&
        message.body.studentId === duplicateStudent.studentId,
    );

    expect(result.jobApplications.acceptedCount).toEqual(runner.students.length);
    expect(result.jobApplications.resultCount).toEqual(runner.students.length + 1);
    expect(duplicateResults).toHaveLength(2);
    expect(duplicateResults.filter((message) => message.body.accepted)).toHaveLength(1);
    expect(duplicateResults.filter((message) => !message.body.accepted)).toHaveLength(1);
    expect(
      duplicateResults.some((message) =>
        message.body.reason.includes("duplicate job application submission"),
      ),
    ).toBe(true);
  });

  it("rejects duplicate mall discount submissions while preserving the original discount outcome", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const duplicateStudentId = "STU-0001";
    const studentAgent = runner.studentAgents.get(duplicateStudentId);
    if (!studentAgent) {
      throw new Error(`Missing student agent ${duplicateStudentId}`);
    }

    const original =
      studentAgent.receivePresentationRequestAndSendSubmission.bind(
        studentAgent,
      );
    studentAgent.receivePresentationRequestAndSendSubmission = (
      bus,
      message,
      issuerProfile,
      transcript,
      messages,
    ) => {
      original(bus, message, issuerProfile, transcript, messages);
      const request = message as typeof message & PresentationRequestShape;
      if (request.body.kind === "mallDiscount") {
        original(bus, message, issuerProfile, transcript, messages);
      }
    };

    const result = runner.runAll();
    const duplicateResults = result.discounts.messages.filter(
      (message): message is typeof message & PresentationResultShape =>
        message.type === "presentation:result" &&
        message.body.studentId === duplicateStudentId,
    );

    expect(duplicateResults).toHaveLength(2);
    expect(duplicateResults.filter((message) => message.body.accepted)).toHaveLength(1);
    expect(duplicateResults.filter((message) => !message.body.accepted)).toHaveLength(1);
    expect(
      duplicateResults.some((message) =>
        message.body.reason.includes("duplicate mall discount submission"),
      ),
    ).toBe(true);
    expect(result.discounts.outcomes[duplicateStudentId]).toBe("accepted");
  });
});
