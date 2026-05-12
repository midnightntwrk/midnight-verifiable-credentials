import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, it } from "vitest";

import { UniversityProtocolFlowRunner } from "../testing.js";

type PresentationResultShape = {
  readonly type: "presentation:result";
  readonly from: string;
  readonly body: {
    readonly accepted: boolean;
    readonly reason: string;
  };
};

describe("university protocol negative policy flow", () => {
  let result: ReturnType<UniversityProtocolFlowRunner["runAll"]>;
  let northwindAssignedStudents: number;
  let totalStudents: number;

  beforeAll(() => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    totalStudents = runner.students.length;
    northwindAssignedStudents = runner.students.filter(
      (student) => student.assignedCompanyId === "company-northwind-robotics",
    ).length;
    const northwind = runner.companyAgents.get("company-northwind-robotics");
    if (!northwind) {
      throw new Error("Missing Northwind verifier agent");
    }
    const originalRequest =
      northwind.simulator.universityJobApplicationRequest.bind(
        northwind.simulator,
      );
    northwind.simulator.universityJobApplicationRequest = (
      issuerVerificationMethodRef,
      verifierChallengeHash,
      options,
    ) => ({
      ...originalRequest(
        issuerVerificationMethodRef,
        verifierChallengeHash,
        options,
      ),
      enforceMinimumFinalGrade: true,
      minimumFinalGrade: 91n,
    });
    result = runner.runAll();
  });

  it("rejects exactly the applications routed to the company with the invalid minimum-grade policy", () => {
    const rejectedResults = result.jobApplications.messages.filter(
      (message): message is typeof message & PresentationResultShape =>
        message.type === "presentation:result",
    ).filter(
      (message) => message.body.accepted === false,
    );

    expect(northwindAssignedStudents).toBeGreaterThan(0);
    expect(rejectedResults).toHaveLength(northwindAssignedStudents);
    expect(result.jobApplications.acceptedCount).toEqual(
      totalStudents - northwindAssignedStudents,
    );
    expect(new Set(rejectedResults.map((message) => message.from))).toEqual(
      new Set(["company-northwind-robotics"]),
    );
    expect(
      rejectedResults.every((message) =>
        message.body.reason.includes("must not enforce a minimum grade"),
      ),
    ).toBe(true);
  });
});
