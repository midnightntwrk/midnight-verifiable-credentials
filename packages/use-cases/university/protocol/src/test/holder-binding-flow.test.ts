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

const runHolderBindingTamperFlow = (
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

describe("university protocol holder-binding misuse flow", () => {
  beforeAll(() => {
    setNetworkId("undeployed");
  });

  it.each([
    {
      studentId: "STU-0004",
      tamperingMode: "holderBindingDidContractAddress" as const,
      expectedReasonFragment:
        "Presentation holder contract does not match credential holder binding",
    },
    {
      studentId: "STU-0005",
      tamperingMode: "holderBindingMethodRef" as const,
      expectedReasonFragment:
        "Presentation holder method reference does not match credential holder binding",
    },
    {
      studentId: "STU-0006",
      tamperingMode: "proofSignerDidContractAddress" as const,
      expectedReasonFragment: "Presentation proof signer must match holder binding",
    },
    {
      studentId: "STU-0007",
      tamperingMode: "proofSignerMethodRef" as const,
      expectedReasonFragment:
        "Presentation proof signer method reference must match holder binding",
    },
  ])(
    "rejects a $tamperingMode submission for $studentId without affecting untampered students",
    ({ studentId, tamperingMode, expectedReasonFragment }) => {
      const { runner, result } = runHolderBindingTamperFlow(
        studentId,
        tamperingMode,
      );
      const targetedResults =
        result.jobApplications.resultsByStudent[studentId] ?? [];
      // #267: submissions no longer carry a plaintext studentId — correlate
      // the submission through the thread of the rejected result message.
      const rejectedResult = result.jobApplications.messages
        .filter(isPresentationResultMessage)
        .find(
          (message) =>
            message.body.studentId === studentId &&
            message.body.rejectionKind === "verificationFailed",
        );
      const rejectedThreadHex = rejectedResult
        ? Buffer.from(rejectedResult.envelope.threadId).toString("hex")
        : undefined;
      const targetedTranscriptEntry = result.jobApplications.messages.find(
        (message) =>
          message.type === "presentation:submission" &&
          Buffer.from(message.envelope.threadId).toString("hex") ===
            rejectedThreadHex,
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
      expect(targetedTranscriptEntry).toBeDefined();
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
