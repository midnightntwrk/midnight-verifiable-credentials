import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import type {
  UniversityPresentationRequestMessage,
  UniversityPresentationResultMessage,
  UniversityPresentationSubmissionMessage,
} from "../flow-messages.js";
import { UniversityProtocolFlowRunner } from "../testing.js";

describe("university protocol request binding", () => {
  it("rejects an old proof re-enveloped for a later job-application request", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const initialResult = runner.runAll();
    const student = runner.studentAgents.get("STU-0001");
    if (!student?.storedIssuedCredential) {
      throw new Error("Expected an issued credential for STU-0001");
    }
    const company = runner.companyAgents.get(student.record.assignedCompanyId);
    if (!company) {
      throw new Error("Expected the assigned company verifier for STU-0001");
    }
    const originalRequest = initialResult.jobApplications.messages.find(
      (message): message is UniversityPresentationRequestMessage =>
        message.type === "presentation:request" &&
        message.body.studentId === student.record.studentId,
    );
    const originalSubmission = initialResult.jobApplications.messages.find(
      (message): message is UniversityPresentationSubmissionMessage =>
        message.type === "presentation:submission" &&
        message.body.studentId === student.record.studentId,
    );
    if (!originalRequest || !originalSubmission) {
      throw new Error("Expected an initial request and submission for STU-0001");
    }

    company.sendRequest(
      runner.bus,
      student,
      student.storedIssuedCredential.credential.issuerVerificationMethodRef,
      runner.transcript,
      runner.jobMessages,
    );
    const laterRequest = runner.bus.receive(
      student.profile.partyId,
    ) as UniversityPresentationRequestMessage | undefined;
    if (!laterRequest || laterRequest.type !== "presentation:request") {
      throw new Error("Expected a later job-application request for STU-0001");
    }
    expect(Buffer.from(laterRequest.body.request.verifierChallengeHash)).not.toEqual(
      Buffer.from(originalRequest.body.request.verifierChallengeHash),
    );

    const replay: UniversityPresentationSubmissionMessage = {
      ...originalSubmission,
      envelope: {
        ...originalSubmission.envelope,
        threadId: laterRequest.envelope.threadId,
        respondsToMessageId: laterRequest.envelope.messageId,
      },
    };
    company.receiveSubmissionAndSendResult(
      runner.bus,
      replay,
      runner.transcript,
      runner.jobMessages,
    );
    const replayResult = runner.bus.receive(
      student.profile.partyId,
    ) as UniversityPresentationResultMessage | undefined;

    expect(replayResult?.body).toMatchObject({
      accepted: false,
      rejectionKind: "verificationFailed",
    });
    expect(replayResult?.body.reason).toContain(
      "Presentation submission request does not match original request",
    );
  });
  it("does not consume a request thread when binding verification fails", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    runner.runAll();
    const student = runner.studentAgents.get("STU-0001");
    if (!student?.storedIssuedCredential) {
      throw new Error("Expected an issued credential for STU-0001");
    }
    const company = runner.companyAgents.get(student.record.assignedCompanyId);
    if (!company) {
      throw new Error("Expected the assigned company verifier for STU-0001");
    }

    company.sendRequest(
      runner.bus,
      student,
      student.storedIssuedCredential.credential.issuerVerificationMethodRef,
      runner.transcript,
      runner.jobMessages,
    );
    const request = runner.bus.receive(
      student.profile.partyId,
    ) as UniversityPresentationRequestMessage | undefined;
    if (!request || request.type !== "presentation:request") {
      throw new Error("Expected a job-application request for STU-0001");
    }
    student.receivePresentationRequestAndSendSubmission(
      runner.bus,
      request,
      runner.issuer.profile,
      runner.transcript,
      runner.jobMessages,
    );
    const validSubmission = runner.bus.receive(
      company.profile.partyId,
    ) as UniversityPresentationSubmissionMessage | undefined;
    if (!validSubmission || validSubmission.type !== "presentation:submission") {
      throw new Error("Expected a valid job-application submission for STU-0001");
    }
    const malformedSubmission: UniversityPresentationSubmissionMessage = {
      ...validSubmission,
      body: {
        ...validSubmission.body,
        request: {
          ...validSubmission.body.request,
          verifierChallengeHash: new Uint8Array(
            validSubmission.body.request.verifierChallengeHash.length,
          ).fill(9),
        },
      },
    };

    company.receiveSubmissionAndSendResult(
      runner.bus,
      malformedSubmission,
      runner.transcript,
      runner.jobMessages,
    );
    company.receiveSubmissionAndSendResult(
      runner.bus,
      validSubmission,
      runner.transcript,
      runner.jobMessages,
    );
    const results = runner.bus.drain(
      student.profile.partyId,
    ) as UniversityPresentationResultMessage[];

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.body.rejectionKind)).toEqual([
      "verificationFailed",
      "none",
    ]);
    expect(company.duplicateRejectedCount).toBe(0);
  });
  it("retains the family-level proof challenge check after request binding", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    runner.runAll();
    const student = runner.studentAgents.get("STU-0001");
    if (!student?.storedIssuedCredential) {
      throw new Error("Expected an issued credential for STU-0001");
    }
    const company = runner.companyAgents.get(student.record.assignedCompanyId);
    if (!company) {
      throw new Error("Expected the assigned company verifier for STU-0001");
    }

    company.sendRequest(
      runner.bus,
      student,
      student.storedIssuedCredential.credential.issuerVerificationMethodRef,
      runner.transcript,
      runner.jobMessages,
    );
    const request = runner.bus.receive(
      student.profile.partyId,
    ) as UniversityPresentationRequestMessage | undefined;
    if (!request || request.type !== "presentation:request") {
      throw new Error("Expected a job-application request for STU-0001");
    }
    student.receivePresentationRequestAndSendSubmission(
      runner.bus,
      request,
      runner.issuer.profile,
      runner.transcript,
      runner.jobMessages,
    );
    const validSubmission = runner.bus.receive(
      company.profile.partyId,
    ) as UniversityPresentationSubmissionMessage | undefined;
    if (!validSubmission || validSubmission.type !== "presentation:submission") {
      throw new Error("Expected a valid job-application submission for STU-0001");
    }
    const challengeMismatchedSubmission: UniversityPresentationSubmissionMessage = {
      ...validSubmission,
      body: {
        ...validSubmission.body,
        request: {
          ...validSubmission.body.request,
          verifierChallengeHash: new Uint8Array(
            validSubmission.body.request.verifierChallengeHash.length,
          ).fill(9),
        },
      },
    };

    expect(() =>
      runner.proofExecutionBackend.verifyJobApplication({
        submission: challengeMismatchedSubmission.body,
      }),
    ).toThrow(/presentation proof challenge does not match the request/u);
  });
});
