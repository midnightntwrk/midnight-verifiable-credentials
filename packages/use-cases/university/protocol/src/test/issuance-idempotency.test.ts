import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, it } from "vitest";

import { UniversityProtocolFlowRunner } from "../testing.js";

describe("university protocol issuance idempotency", () => {
  beforeAll(() => {
    setNetworkId("undeployed");
  });

  it("ignores a replayed issuance request while still delivering one credential to the student", () => {
    const runner = new UniversityProtocolFlowRunner({
      exerciseOptions: {
        duplicateIssuanceRequestStudentIds: ["STU-0001"],
      },
    });

    const result = runner.runAll();
    const replayedStudent = runner.students.find(
      (student) => student.studentId === "STU-0001",
    );

    expect(result.issuance.requestCount).toBe(runner.students.length + 1);
    expect(result.issuance.resultCount).toBe(runner.students.length);
    expect(result.issuance.duplicateRequestCount).toBe(1);
    expect(result.issuance.idempotentReplayCount).toBe(1);
    expect(result.issuance.idempotentReplayStudentIds).toEqual(["STU-0001"]);
    expect(result.issuance.issuedStudentIds).toHaveLength(runner.students.length);
    expect(result.jobApplications.acceptedCount).toBe(runner.students.length);
    expect(result.jobApplications.verificationRejectedCount).toBe(0);
    expect(result.jobApplications.duplicateRejectedCount).toBe(0);
    expect(
      replayedStudent &&
        result.issuance.issuedStudentIds.filter(
          (studentId) => studentId === replayedStudent.studentId,
        ),
    ).toHaveLength(1);
  });
});
