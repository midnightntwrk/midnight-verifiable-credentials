import { Given, Then, When } from "@cucumber/cucumber";
import { actorCalled } from "@serenity-js/core";

// This package executes source files directly through ts-node/esm and does not
// emit JavaScript, so local support imports intentionally use `.ts` specifiers.
import {
  recordStepInsight,
  type UniversityStepInsightPayload,
} from "../support/university-step-insight.ts";
import { UseUniversityScenario } from "../support/university-scenario.ts";

const engineer = () => actorCalled("Engineer");
const universityScenario = () => UseUniversityScenario.from(engineer());

const logInsight = (title: string, payload: UniversityStepInsightPayload) =>
  recordStepInsight(engineer(), title, payload);

const expectMetricNames = (
  actual: readonly string[],
  expected: readonly string[],
) => {
  for (const metricName of expected) {
    if (!actual.includes(metricName)) {
      throw new Error(`Missing expected metric ${metricName}`);
    }
  }
};

const rejectedCountForKind = (
  summary: {
    readonly verificationRejectedCount: number;
    readonly duplicateRejectedCount: number;
  },
  expectedRejectionKind: string,
): number => {
  switch (expectedRejectionKind) {
    case "verificationFailed":
      return summary.verificationRejectedCount;
    case "duplicate":
      return summary.duplicateRejectedCount;
    default:
      throw new Error(`Unknown rejection kind ${expectedRejectionKind}`);
  }
};

const parseTamperingMode = (
  value: string,
):
  | "credentialClaimRoot"
  | "requestChallenge"
  | "issuerVerificationMethodRef"
  | "holderBindingDidContractAddress"
  | "holderBindingMethodRef"
  | "proofSignerDidContractAddress"
  | "proofSignerMethodRef" => {
  switch (value) {
    case "credentialClaimRoot":
    case "requestChallenge":
    case "issuerVerificationMethodRef":
    case "holderBindingDidContractAddress":
    case "holderBindingMethodRef":
    case "proofSignerDidContractAddress":
    case "proofSignerMethodRef":
      return value;
    default:
      throw new Error(`Unknown tampering mode ${value}`);
  }
};

Given(
  "the {string} issuer DID instance is available",
  async (expectedUniversityName: string) => {
    const summary = universityScenario().universityIssuerSummary();
    if (summary.universityName !== expectedUniversityName) {
      throw new Error(
        `Expected university ${expectedUniversityName}, got ${summary.universityName}`,
      );
    }
    await logInsight("University issuer step insight", {
      request:
        "Load the university issuer DID instance and family issuance profile.",
      response:
        "The harness exposes the issuer DID URL, verification method, family package, holder-binding profile, and batch policy.",
      checks: [
        "The issuer name matches the scenario actor name.",
        "The issuer DID URL and verification method are present.",
        "The family is configured for explicit holder binding and no status binding.",
      ],
      dto: summary,
    });
  },
);

Given(
  "the {string} graduating class contains {int} eligible students",
  async (expectedUniversityName: string, expectedCount: number) => {
    const summary = universityScenario().graduatingClassSummary();
    if (summary.universityName !== expectedUniversityName) {
      throw new Error(
        `Expected graduating class for ${expectedUniversityName}, got ${summary.universityName}`,
      );
    }
    universityScenario().assertEligibleStudentCount(expectedCount);
    await logInsight("Graduating class step insight", {
      request:
        "Load the committed graduating-class roster and materialize the student holder agents.",
      response:
        "The harness exposes the total eligible class size and the full readable student-to-company roster for this 10-student fixture.",
      checks: [
        "The roster belongs to the named university.",
        `The roster contains exactly ${expectedCount} eligible students.`,
        "Every listed student includes a DID-backed holder identity and final-grade fixture data.",
      ],
      dto: summary,
    });
  },
);

When(
  "every graduating student submits a university diploma issuance request",
  async () => {
    await universityScenario().runBatchIssuance();
    await logInsight("Issuance execution step insight", {
      request:
        "Each graduating student submits a student-initiated issuance request carrying DID holder information and diploma claim payload.",
      response:
        "The university accepts, validates, batches, signs, and delivers one non-revocable diploma VC per accepted student.",
      checks: [
        "The student exists in the university graduation roster.",
        "The holder method referenced by the request belongs to the student DID.",
        "The issuance result reports accepted request count, issued credential count, and batch-level timing metrics.",
      ],
      dto: {
        result: universityScenario().issuanceResult(),
        transcriptExcerpt: universityScenario().issuanceTranscriptSummary(),
      },
    });
  },
);

Given(
  "the student {string} with id {string} will resubmit the same issuance request",
  async (expectedFullName: string, studentId: string) => {
    const student = universityScenario()
      .graduatingClassSummary()
      .students.find((candidate) => candidate.studentId === studentId);
    if (!student) {
      throw new Error(`Unknown graduating student ${studentId}`);
    }
    if (student.fullName !== expectedFullName) {
      throw new Error(
        `Expected student ${expectedFullName}, got ${student.fullName}`,
      );
    }
    universityScenario().enableDuplicateIssuanceSubmission(studentId);
    await logInsight("Duplicate issuance-request step insight", {
      request:
        "Replay the same student-initiated diploma issuance request for one student before the university batches accepted requests.",
      response:
        "The issuance harness will count the replay and ignore it idempotently instead of issuing a second diploma credential.",
      checks: [
        `The replay targets only ${studentId}.`,
        "The original issuance request still remains valid.",
        "Exactly one diploma credential should still be delivered for the student.",
      ],
      dto: {
        studentId,
        fullName: student.fullName,
      },
    });
  },
);

Then(
  "{string} should partition the accepted requests into the committed {int}-batch graduation plan",
  async (expectedUniversityName: string, expectedBatchCount: number) => {
    const issuerSummary = universityScenario().universityIssuerSummary();
    if (issuerSummary.universityName !== expectedUniversityName) {
      throw new Error(
        `Expected university ${expectedUniversityName}, got ${issuerSummary.universityName}`,
      );
    }
    const result = universityScenario().issuanceResult();
    if (!result.partitionMatchesPlan) {
      throw new Error(
        "University issuance partition does not match the committed batch plan",
      );
    }
    if (result.batchCount !== expectedBatchCount) {
      throw new Error(
        `Expected ${expectedBatchCount} issuance batches, got ${result.batchCount}`,
      );
    }
    await logInsight("Issuance batch-plan step insight", {
      request:
        "Apply the committed batch policy to all accepted issuance requests.",
      response:
        "The queue is partitioned into deterministic issuance batches that align with the checked-in batch plan fixture.",
      checks: [
        `The batch count is exactly ${expectedBatchCount}.`,
        "No student appears in more than one batch.",
        "No batch exceeds the configured batch size limit.",
      ],
      dto: universityScenario().issuanceBatchPlanSummary(),
    });
  },
);

Then(
  "every issuance batch should deliver one non-revocable diploma VC per student",
  async () => {
    const result = universityScenario().issuanceResult();
    if (result.issuedCredentialCount !== result.totalStudents) {
      throw new Error(
        `Expected ${result.totalStudents} issued credentials, got ${result.issuedCredentialCount}`,
      );
    }
    if (result.acceptedRequestCount !== result.totalStudents) {
      throw new Error(
        `Expected ${result.totalStudents} accepted issuance requests, got ${result.acceptedRequestCount}`,
      );
    }
  },
);

Then(
  "the issuance report should include the configured bottleneck metrics for all {int} batches",
  async (expectedBatchCount: number) => {
    const result = universityScenario().issuanceResult();
    if (result.batchCount !== expectedBatchCount) {
      throw new Error(
        `Expected ${expectedBatchCount} issuance batches, got ${result.batchCount}`,
      );
    }
    expectMetricNames(result.metricNames, [
      "issuer_did_bootstrap_ms",
      "student_did_bootstrap_ms",
      "virtual_agent_key_load_ms",
      "issuance_request_build_ms",
      "issuance_request_validation_ms",
      "issuance_batch_compile_ms",
      "issuance_batch_sign_ms",
      "issuance_batch_delivery_ms",
      "issuance_batch_queue_wait_ms",
      "issuance_batch_size",
      "issuance_duplicate_request_count",
      "issuance_idempotent_replay_count",
      "issuance_total_students",
      "issuance_credentials_per_second",
    ]);
  },
);

Then(
  "the issuance report should record {int} duplicate request and still issue {int} diploma credentials",
  async (
    expectedDuplicateRequestCount: number,
    expectedIssuedCredentialCount: number,
  ) => {
    const result = universityScenario().issuanceResult();
    if (result.duplicateRequestCount !== expectedDuplicateRequestCount) {
      throw new Error(
        `Expected ${expectedDuplicateRequestCount} duplicate issuance request, got ${result.duplicateRequestCount}`,
      );
    }
    if (result.issuedCredentialCount !== expectedIssuedCredentialCount) {
      throw new Error(
        `Expected ${expectedIssuedCredentialCount} issued credentials, got ${result.issuedCredentialCount}`,
      );
    }
    await logInsight("Issuance idempotency step insight", {
      request:
        "Inspect the batch issuance report after replaying one student issuance request.",
      response:
        "The report records the duplicate request count explicitly while still proving that only one diploma credential was issued per student.",
      checks: [
        `Duplicate issuance request count is ${expectedDuplicateRequestCount}.`,
        `Issued credential count remains ${expectedIssuedCredentialCount}.`,
        "The replay is treated as an idempotent no-op rather than a second issuance.",
      ],
      dto: {
        duplicateRequestCount: result.duplicateRequestCount,
        idempotentReplayCount: result.idempotentReplayCount,
        idempotentReplayStudentIds: result.idempotentReplayStudentIds,
        issuedCredentialCount: result.issuedCredentialCount,
        acceptedRequestCount: result.acceptedRequestCount,
      },
    });
  },
);

Given(
  "the {string} graduating class roster is loaded",
  async (expectedUniversityName: string) => {
    const summary = universityScenario().graduatingClassSummary();
    if (summary.universityName !== expectedUniversityName) {
      throw new Error(
        `Expected graduating class for ${expectedUniversityName}, got ${summary.universityName}`,
      );
    }
    await logInsight("Job-application roster step insight", {
      request:
        "Load the graduating-class holders that already possess university diploma credentials.",
      response:
        "The harness exposes the readable student roster that will participate in company presentation flows.",
      checks: [
        "The roster belongs to the named university.",
        "The roster is small enough to read directly in the Serenity report.",
        "All listed students show assigned company ids and final grades.",
      ],
      dto: summary,
    });
  },
);

Given(
  "the company verifier roster includes {string}, {string}, and {string}",
  async (firstCompany: string, secondCompany: string, thirdCompany: string) => {
    const summary = universityScenario().companyRosterSummary();
    const actual = [...summary.companyNames].sort();
    const expected = [firstCompany, secondCompany, thirdCompany].sort();
    if (actual.join("|") !== expected.join("|")) {
      throw new Error(
        `Expected company roster ${expected.join(", ")}, got ${actual.join(", ")}`,
      );
    }
    await logInsight("Company verifier roster step insight", {
      request:
        "Load the company verifier DID instances and their presentation-request policies.",
      response:
        "The harness exposes each company name plus the disclosure policy it will apply to student job applications.",
      checks: [
        "The three expected companies are present in the verifier roster.",
        "Each company policy lists the disclosed fields required for verification.",
        "No company in this scenario enforces a minimum-grade predicate.",
      ],
      dto: summary,
    });
  },
);

When(
  "each company publishes its university diploma presentation request policy",
  async () => {
    universityScenario().publishCompanyPolicies();
    await logInsight("Published company request-policy step insight", {
      request:
        "Each company publishes a verifier request describing the diploma fields required for a job application.",
      response:
        "Students can fetch a company-specific challenge and disclosure policy before building the presentation.",
      checks: [
        "Each request names the expected university issuer.",
        "Only justified diploma fields are required.",
        "The request policies now participate in the threaded protocol flow.",
      ],
      dto: universityScenario().companyRosterSummary(),
    });
  },
);

When(
  "every student builds and submits a job application to the assigned company",
  async () => {
    await universityScenario().runJobApplications();
    const proofServerExchanges =
      universityScenario().proofServerExchangeSummary();
    await logInsight("Job-application execution step insight", {
      request:
        "Each student builds a diploma presentation against the assigned company request and submits a job-application message.",
      response:
        "The threaded protocol runner verifies the presentation and records accepted application outcomes grouped by company.",
      checks: [
        "The verifier challenge used in the presentation matches the company request.",
        "All required disclosed fields are present in the submission.",
        "The result includes per-company acceptance counts and bottleneck metrics.",
      ],
      dto: {
        result: universityScenario().jobApplicationResult(),
        transcriptExcerpt:
          universityScenario().jobApplicationTranscriptSummary(),
        ...(proofServerExchanges.enabled ? { proofServerExchanges } : {}),
      },
    });
  },
);

Then(
  "all {int} job applications should be accepted by their target companies",
  async (expectedCount: number) => {
    const result = universityScenario().jobApplicationResult();
    if (result.acceptedApplications !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} accepted job applications, got ${result.acceptedApplications}`,
      );
    }
  },
);

Then(
  "the job-application report should expose company-level bottleneck metrics",
  async () => {
    const result = universityScenario().jobApplicationResult();
    expectMetricNames(result.metricNames, [
      "company_did_bootstrap_ms",
      "job_protocol_phase_ms",
      "job_request_count",
      "job_presentation_submission_count",
      "job_verification_result_count",
      "job_duplicate_rejection_count",
      "job_verification_rejection_count",
      "job_application_acceptance_rate",
      "job_applications_per_second",
    ]);
    for (const acceptedCount of Object.values(result.companyAcceptedCounts)) {
      if (acceptedCount <= 0) {
        throw new Error(
          "Expected every company to receive at least one accepted job application",
        );
      }
    }
  },
);

Given(
  "the {string} verifier policy is loaded",
  async (expectedMallName: string) => {
    const summary = universityScenario().mallPolicySummary();
    if (summary.mallName !== expectedMallName) {
      throw new Error(
        `Expected mall ${expectedMallName}, got ${summary.mallName}`,
      );
    }
    await logInsight("Mall verifier policy step insight", {
      request: "Load the mall verifier DID instance and its discount policy.",
      response:
        "The harness exposes the required disclosures and the encoded minimum final-grade predicate.",
      checks: [
        "The mall name matches the scenario actor.",
        "The policy demands no claim disclosure; the grade stays hidden behind its commitment.",
        "The business rule grade > 90 is encoded as minimumFinalGrade = 91.",
      ],
      dto: summary,
    });
  },
);

Given(
  "the selected student {string} with id {string} is loaded from the committed discount applicant list",
  async (expectedFullName: string, studentId: string) => {
    universityScenario().selectDiscountStudent(studentId);
    const summary = universityScenario().selectedDiscountApplicantSummary();
    if (summary.fullName !== expectedFullName) {
      throw new Error(
        `Expected selected student ${expectedFullName}, got ${summary.fullName}`,
      );
    }
    await logInsight("Selected discount applicant step insight", {
      request:
        "Load one named student from the committed discount-applicant fixture set.",
      response:
        "The harness reconstructs the selected student diploma state and expected discount eligibility.",
      checks: [
        "The named student id matches the scenario example row.",
        "The final grade matches the committed applicant fixture.",
        "The expected eligibility flag is visible before the presentation is built.",
      ],
      dto: summary,
    });
  },
);

When(
  "the student submits a discount request presentation with final grade {int}",
  async (expectedFinalGrade: number) => {
    await universityScenario().runDiscountFlow();
    const result = universityScenario().discountResult();
    const proofServerExchanges =
      universityScenario().proofServerExchangeSummary();
    if (result.finalGrade !== expectedFinalGrade) {
      throw new Error(
        `Expected selected student's final grade to be ${expectedFinalGrade}, got ${result.finalGrade}`,
      );
    }
    await logInsight("Discount execution step insight", {
      request:
        "The selected student builds a diploma presentation for the mall and discloses the final grade required by the discount policy.",
      response:
        "The verifier evaluates the presentation and returns an accepted or rejected outcome with an explanation string.",
      checks: [
        `The disclosed final grade is ${expectedFinalGrade}.`,
        "The explanation is stable for both acceptance and rejection paths.",
        "The result carries the expected discount metrics.",
      ],
      dto: {
        result,
        transcriptExcerpt: universityScenario().discountTranscriptSummary(),
        ...(proofServerExchanges.enabled ? { proofServerExchanges } : {}),
      },
    });
  },
);

Then(
  "the mall should return the outcome {string}",
  async (expectedOutcome: string) => {
    const result = universityScenario().discountResult();
    if (result.outcome !== expectedOutcome) {
      throw new Error(
        `Expected mall outcome ${expectedOutcome}, got ${result.outcome}`,
      );
    }
  },
);

Then(
  "the discount report should record the explanation {string}",
  async (expectedExplanation: string) => {
    const result = universityScenario().discountResult();
    if (result.explanation !== expectedExplanation) {
      throw new Error(
        `Expected explanation '${expectedExplanation}', got '${result.explanation}'`,
      );
    }
    expectMetricNames(result.metricNames, [
      "mall_did_bootstrap_ms",
      "discount_protocol_phase_ms",
      "discount_request_count",
      "discount_presentation_submission_count",
      "discount_verification_result_count",
      "discount_duplicate_rejection_count",
      "discount_verification_rejection_count",
      "discount_acceptance_rate",
      "discount_rejection_reason_count",
    ]);
  },
);

Given(
  "the company verifier {string} overrides the diploma request policy with minimum final grade {int}",
  async (companyId: string, minimumFinalGrade: number) => {
    universityScenario().configureCompanyRequestPolicyOverride(companyId, {
      enforceMinimumFinalGrade: true,
      minimumFinalGrade,
    });
    await logInsight("Negative company-policy override step insight", {
      request:
        "Override one company verifier policy so the job-application request becomes intentionally invalid for this family.",
      response:
        "The protocol harness will publish a malformed company request for the named verifier while leaving all other company policies untouched.",
      checks: [
        `The override targets only ${companyId}.`,
        `The injected minimum final grade is ${minimumFinalGrade}.`,
        "The resulting rejection path should come from verifier policy validation, not duplicate-thread protection.",
      ],
      dto: {
        companyId,
        override: {
          enforceMinimumFinalGrade: true,
          minimumFinalGrade,
        },
      },
    });
  },
);

Given(
  "the student {string} with id {string} will resubmit the same job application thread",
  async (expectedFullName: string, studentId: string) => {
    const student = universityScenario()
      .graduatingClassSummary()
      .students.find((candidate) => candidate.studentId === studentId);
    if (!student) {
      throw new Error(`Unknown graduating student ${studentId}`);
    }
    if (student.fullName !== expectedFullName) {
      throw new Error(
        `Expected student ${expectedFullName}, got ${student.fullName}`,
      );
    }
    universityScenario().enableDuplicateJobApplicationSubmission(studentId);
    await logInsight("Duplicate job-thread step insight", {
      request:
        "Configure the protocol harness so the named student submits the same job-application presentation thread twice.",
      response:
        "The first submission remains canonical and the second should be rejected by the duplicate-thread guard.",
      checks: [
        `The named student id ${studentId} exists in the readable graduation roster.`,
        "Only the named student's job-application thread is duplicated.",
        "The duplicate rejection should preserve the original accepted outcome.",
      ],
      dto: {
        studentId,
        fullName: student.fullName,
        assignedCompanyId: student.assignedCompanyId,
      },
    });
  },
);

Given(
  "the student {string} with id {string} will tamper the university diploma submission using {string}",
  async (
    expectedFullName: string,
    studentId: string,
    tamperingMode: string,
  ) => {
    const student = universityScenario()
      .graduatingClassSummary()
      .students.find((candidate) => candidate.studentId === studentId);
    if (!student) {
      throw new Error(`Unknown graduating student ${studentId}`);
    }
    if (student.fullName !== expectedFullName) {
      throw new Error(
        `Expected student ${expectedFullName}, got ${student.fullName}`,
      );
    }
    universityScenario().configureJobApplicationTampering(
      studentId,
      parseTamperingMode(tamperingMode),
    );
    await logInsight("Tampered job-submission step insight", {
      request:
        "Configure the protocol harness so the named student submits one intentionally tampered diploma presentation to the assigned company.",
      response:
        "The verifier should reject only the targeted student's submission with a verification failure while untampered classmates remain accepted.",
      checks: [
        `The named student id ${studentId} exists in the readable graduation roster.`,
        `The tampering mode is ${tamperingMode}.`,
        "The rejection path should come from verifier-side credential or proof validation, not from duplicate-thread protection.",
      ],
      dto: {
        studentId,
        fullName: student.fullName,
        assignedCompanyId: student.assignedCompanyId,
        tamperingMode,
      },
    });
  },
);

Then(
  "the company {string} should reject all routed applications with rejection kind {string}",
  async (companyId: string, expectedRejectionKind: string) => {
    const summary =
      universityScenario().companyJobApplicationOutcomeSummary(companyId);
    if (summary.routedStudentIds.length === 0) {
      throw new Error(`Expected routed students for company ${companyId}`);
    }
    if (summary.acceptedCount !== 0) {
      throw new Error(
        `Expected ${companyId} to accept 0 routed applications, got ${summary.acceptedCount}`,
      );
    }
    const matchingRejectedCount = rejectedCountForKind(
      summary,
      expectedRejectionKind,
    );
    if (matchingRejectedCount !== summary.routedStudentIds.length) {
      throw new Error(
        `Expected ${summary.routedStudentIds.length} ${expectedRejectionKind} rejections for ${companyId}, got ${matchingRejectedCount}`,
      );
    }
    await logInsight("Company rejection summary step insight", {
      request:
        "Summarize the routed job-application outcomes for the selected company after the negative policy run.",
      response:
        "All routed students are rejected for the expected rejection kind while unrelated companies remain unaffected.",
      checks: [
        `Every routed application for ${companyId} is rejected.`,
        `The rejection kind is exactly ${expectedRejectionKind}.`,
        "No accepted result remains for the targeted company.",
      ],
      dto: summary,
    });
  },
);

Then(
  "the untampered job applications should still produce {int} accepted result and {int} verification rejection overall",
  async (
    expectedAcceptedCount: number,
    expectedVerificationRejectedCount: number,
  ) => {
    const result = universityScenario().jobApplicationResult();
    if (result.acceptedApplications !== expectedAcceptedCount) {
      throw new Error(
        `Expected ${expectedAcceptedCount} accepted job applications, got ${result.acceptedApplications}`,
      );
    }
    if (
      result.verificationRejectedCount !== expectedVerificationRejectedCount
    ) {
      throw new Error(
        `Expected ${expectedVerificationRejectedCount} verification rejections, got ${result.verificationRejectedCount}`,
      );
    }
    if (result.duplicateRejectedCount !== 0) {
      throw new Error(
        `Expected 0 duplicate rejections in the tampered flow, got ${result.duplicateRejectedCount}`,
      );
    }
    await logInsight("Tampered flow aggregate step insight", {
      request:
        "Summarize the aggregate job-application outcomes after the targeted tampering run.",
      response:
        "Only the targeted student is rejected with a verification failure and the remaining untampered applications stay accepted.",
      checks: [
        `Accepted application count is ${expectedAcceptedCount}.`,
        `Verification rejection count is ${expectedVerificationRejectedCount}.`,
        "Duplicate rejection count remains zero.",
      ],
      dto: result,
    });
  },
);

Then(
  "the remaining companies should keep their routed applications accepted",
  async () => {
    const roster = universityScenario().companyRosterSummary();
    const summaries = roster.policies.map((policy) =>
      universityScenario().companyJobApplicationOutcomeSummary(
        policy.companyId,
      ),
    );
    const unaffected = summaries.filter(
      (summary) =>
        summary.verificationRejectedCount === 0 &&
        summary.duplicateRejectedCount === 0,
    );
    const totalAccepted = unaffected.reduce(
      (sum, summary) => sum + summary.acceptedCount,
      0,
    );
    const totalRouted = unaffected.reduce(
      (sum, summary) => sum + summary.routedStudentIds.length,
      0,
    );
    if (totalAccepted !== totalRouted) {
      throw new Error(
        `Expected unaffected companies to keep all routed applications accepted, got ${totalAccepted}/${totalRouted}`,
      );
    }
    await logInsight("Unaffected company outcomes step insight", {
      request:
        "Check the companies that were not targeted by the negative override.",
      response:
        "Their routed job applications remain accepted and show no duplicate or verification-policy rejections.",
      checks: [
        "Every unaffected company keeps acceptedCount equal to routedStudentIds.length.",
        "No unaffected company records verification rejections.",
        "No unaffected company records duplicate rejections.",
      ],
      dto: unaffected,
    });
  },
);

Then(
  "the job application verification failure for student {string} should mention {string}",
  async (studentId: string, expectedReasonFragment: string) => {
    const results =
      universityScenario().jobApplicationResultsForStudent(studentId);
    const verificationFailure = results.find(
      (result) => result.rejectionKind === "verificationFailed",
    );
    if (!verificationFailure) {
      throw new Error(
        `Expected a verification failure result for ${studentId}, but none was found`,
      );
    }
    if (!verificationFailure.reason.includes(expectedReasonFragment)) {
      throw new Error(
        `Expected verification failure for ${studentId} to mention ${expectedReasonFragment}, got ${verificationFailure.reason}`,
      );
    }
    await logInsight("Tampered job-failure detail step insight", {
      request:
        "Inspect the targeted student's verification-failure message after the tampered submission run.",
      response:
        "The verifier returns a family-level validation error that explains exactly which diploma or proof invariant was violated.",
      checks: [
        "A verificationFailed result exists for the named student.",
        `The reason contains the fragment ${expectedReasonFragment}.`,
        "The failure remains scoped to the targeted student's thread.",
      ],
      dto: {
        studentId,
        verificationFailure,
        allResults: results,
      },
    });
  },
);

Then(
  "the job application results for student {string} should contain {int} accepted result and {int} {string} rejection",
  async (
    studentId: string,
    expectedAcceptedCount: number,
    expectedRejectedCount: number,
    expectedRejectionKind: string,
  ) => {
    const results =
      universityScenario().jobApplicationResultsForStudent(studentId);
    const acceptedCount = results.filter((result) => result.accepted).length;
    const matchingRejectedCount = results.filter(
      (result) => result.rejectionKind === expectedRejectionKind,
    ).length;
    if (acceptedCount !== expectedAcceptedCount) {
      throw new Error(
        `Expected ${expectedAcceptedCount} accepted job results for ${studentId}, got ${acceptedCount}`,
      );
    }
    if (matchingRejectedCount !== expectedRejectedCount) {
      throw new Error(
        `Expected ${expectedRejectedCount} ${expectedRejectionKind} job rejections for ${studentId}, got ${matchingRejectedCount}`,
      );
    }
    await logInsight("Duplicate job-result step insight", {
      request:
        "Inspect the complete set of job-application results for the named student after the duplicate-thread run.",
      response:
        "The canonical accepted result is preserved and exactly one duplicate rejection is appended for the repeated submission.",
      checks: [
        `Accepted result count is ${expectedAcceptedCount}.`,
        `${expectedRejectionKind} rejection count is ${expectedRejectedCount}.`,
        "The result list remains scoped to the named student thread.",
      ],
      dto: {
        studentId,
        results,
      },
    });
  },
);

Given(
  "the selected student will resubmit the same mall discount thread",
  async () => {
    const summary = universityScenario().selectedDiscountApplicantSummary();
    universityScenario().enableDuplicateMallDiscountSubmission(
      summary.studentId,
    );
    await logInsight("Duplicate mall-thread step insight", {
      request:
        "Configure the protocol harness so the selected discount applicant submits the same mall presentation thread twice.",
      response:
        "The first discount submission remains canonical and the repeated submission should be rejected as a duplicate thread.",
      checks: [
        `The selected student is ${summary.studentId}.`,
        "Only the selected mall-discount thread is duplicated.",
        "The duplicate rejection should not replace the original mall outcome.",
      ],
      dto: summary,
    });
  },
);

Then(
  "the discount results for student {string} should contain {int} accepted result and {int} {string} rejection",
  async (
    studentId: string,
    expectedAcceptedCount: number,
    expectedRejectedCount: number,
    expectedRejectionKind: string,
  ) => {
    const results = universityScenario().discountResultsForStudent(studentId);
    const acceptedCount = results.filter((result) => result.accepted).length;
    const matchingRejectedCount = results.filter(
      (result) => result.rejectionKind === expectedRejectionKind,
    ).length;
    if (acceptedCount !== expectedAcceptedCount) {
      throw new Error(
        `Expected ${expectedAcceptedCount} accepted discount results for ${studentId}, got ${acceptedCount}`,
      );
    }
    if (matchingRejectedCount !== expectedRejectedCount) {
      throw new Error(
        `Expected ${expectedRejectedCount} ${expectedRejectionKind} discount rejections for ${studentId}, got ${matchingRejectedCount}`,
      );
    }
    await logInsight("Duplicate discount-result step insight", {
      request:
        "Inspect the complete set of mall-discount results for the named student after the duplicate-thread run.",
      response:
        "The canonical discount outcome is preserved and the repeated submission becomes a duplicate rejection entry.",
      checks: [
        `Accepted result count is ${expectedAcceptedCount}.`,
        `${expectedRejectionKind} rejection count is ${expectedRejectedCount}.`,
        "The result list remains scoped to the named mall-discount thread.",
      ],
      dto: {
        studentId,
        results,
      },
    });
  },
);
