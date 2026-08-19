import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, it } from "vitest";

import {
  type UniversityPresentationTamperingMode,
  UniversityProtocolFlowRunner,
} from "../testing.js";

type PresentationResultShape = {
  readonly type: "presentation:result";
  readonly body: {
    readonly studentId: string;
    readonly accepted: boolean;
    readonly reason: string;
    readonly rejectionKind: "none" | "verificationFailed" | "duplicate";
  };
};

const isPresentationResultMessage = (
  message: ReturnType<UniversityProtocolFlowRunner["runAll"]>["jobApplications"]["messages"][number],
): message is
  ReturnType<UniversityProtocolFlowRunner["runAll"]>["jobApplications"]["messages"][number] &
    PresentationResultShape => message.type === "presentation:result";

const runTamperedJobApplicationFlow = (
  studentId: string,
  tamperingMode: UniversityPresentationTamperingMode,
) => {
  const runner = new UniversityProtocolFlowRunner({
    exerciseOptions: {
      jobApplicationTamperingByStudentId: {
        [studentId]: tamperingMode,
      },
    },
  });
  return {
    runner,
    result: runner.runAll(),
  };
};

describe("university protocol tampered presentation flow", () => {
  beforeAll(() => {
    setNetworkId("undeployed");
  });

  it.each([
    {
      studentId: "STU-0001",
      tamperingMode: "credentialClaimRoot" as const,
      expectedReasonFragment: "Credential claim root mismatch",
    },
    {
      studentId: "STU-0002",
      tamperingMode: "requestChallenge" as const,
      expectedReasonFragment:
        "Presentation submission request does not match original request",
    },
    {
      studentId: "STU-0002",
      tamperingMode: "requestPolicy" as const,
      expectedReasonFragment:
        "Presentation submission request does not match original request",
    },
    {
      studentId: "STU-0003",
      tamperingMode: "issuerVerificationMethodRef" as const,
      expectedReasonFragment:
        "Issuer proof method reference does not match issuer verification method",
    },
  ])(
    "rejects a $tamperingMode submission for $studentId without affecting untampered students",
    ({ studentId, tamperingMode, expectedReasonFragment }) => {
      const { runner, result } = runTamperedJobApplicationFlow(
        studentId,
        tamperingMode,
      );
      const targetedResults =
        result.jobApplications.resultsByStudent[studentId] ?? [];
      const targetedTranscriptEntry = result.jobApplications.messages.find(
        (message) =>
          message.type === "presentation:submission" &&
          message.body.studentId === studentId,
      );
      const rejectedResult = result.jobApplications.messages
        .filter(isPresentationResultMessage)
        .find(
          (message) =>
            message.body.studentId === studentId &&
            message.body.rejectionKind === "verificationFailed",
        );

      expect(result.jobApplications.acceptedCount).toBe(runner.students.length - 1);
      expect(result.jobApplications.verificationRejectedCount).toBe(1);
      expect(result.jobApplications.duplicateRejectedCount).toBe(0);
      expect(targetedResults).toHaveLength(1);
      expect(targetedResults[0]).toMatchObject({
        accepted: false,
        rejectionKind: "verificationFailed",
      });
      expect(targetedResults[0].reason).toContain(expectedReasonFragment);
      expect(rejectedResult?.body.reason).toContain(expectedReasonFragment);
      expect(targetedTranscriptEntry?.body.studentId).toBe(studentId);
      expect(
        result.jobApplications.messages.some(
          (message) =>
            isPresentationResultMessage(message) &&
            message.body.studentId !== studentId &&
            message.body.rejectionKind === "verificationFailed",
        ),
      ).toBe(false);
    },
  );
});
