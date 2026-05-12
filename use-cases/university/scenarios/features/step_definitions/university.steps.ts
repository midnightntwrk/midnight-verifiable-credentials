import { Given, Then, When } from "@cucumber/cucumber";
import { actorCalled, Log } from "@serenity-js/core";

import { UseUniversityScenario } from "../support/university-scenario.js";

const engineer = () => actorCalled("Engineer");
const universityScenario = () => UseUniversityScenario.from(engineer());

const jsonReportReplacer = (_key: string, value: unknown): unknown =>
  typeof value === "bigint" ? value.toString() : value;

type StepInsight = {
  readonly request: string;
  readonly response: string;
  readonly checks: readonly string[];
  readonly dto: unknown;
};

const logInsight = (
  title: string,
  payload: StepInsight,
) => engineer().attemptsTo(
  Log.the(`${title}\n${JSON.stringify(payload, jsonReportReplacer, 2)}`),
);

const expectMetricNames = (actual: readonly string[], expected: readonly string[]) => {
  for (const metricName of expected) {
    if (!actual.includes(metricName)) {
      throw new Error(`Missing expected metric ${metricName}`);
    }
  }
};

Given("the {string} issuer DID instance is available", async (expectedUniversityName: string) => {
  const summary = universityScenario().universityIssuerSummary();
  if (summary.universityName !== expectedUniversityName) {
    throw new Error(`Expected university ${expectedUniversityName}, got ${summary.universityName}`);
  }
  await logInsight("University issuer step insight", {
    request: "Load the university issuer DID instance and family issuance profile.",
    response: "The harness exposes the issuer DID URL, verification method, family package, holder-binding profile, and batch policy.",
    checks: [
      "The issuer name matches the scenario actor name.",
      "The issuer DID URL and verification method are present.",
      "The family is configured for explicit holder binding and no status binding.",
    ],
    dto: summary,
  });
});

Given("the {string} graduating class contains {int} eligible students", async (expectedUniversityName: string, expectedCount: number) => {
  const summary = universityScenario().graduatingClassSummary();
  if (summary.universityName !== expectedUniversityName) {
    throw new Error(`Expected graduating class for ${expectedUniversityName}, got ${summary.universityName}`);
  }
  universityScenario().assertEligibleStudentCount(expectedCount);
  await logInsight("Graduating class step insight", {
    request: "Load the committed graduating-class roster and materialize the student holder agents.",
    response: "The harness exposes the total eligible class size and the full readable student-to-company roster for this 10-student fixture.",
    checks: [
      "The roster belongs to the named university.",
      `The roster contains exactly ${expectedCount} eligible students.`,
      "Every listed student includes a DID-backed holder identity and final-grade fixture data.",
    ],
    dto: summary,
  });
});

When("every graduating student submits a university diploma issuance request", async () => {
  await universityScenario().runBatchIssuance();
  await logInsight("Issuance execution step insight", {
    request: "Each graduating student submits a student-initiated issuance request carrying DID holder information and diploma claim payload.",
    response: "The university accepts, validates, batches, signs, and delivers one non-revocable diploma VC per accepted student.",
    checks: [
      "The student exists in the university graduation roster.",
      "The holder method referenced by the request belongs to the student DID.",
      "The issuance result reports accepted request count, issued credential count, and batch-level timing metrics.",
    ],
    dto: universityScenario().issuanceResult(),
  });
});

Then("{string} should partition the accepted requests into the committed {int}-batch graduation plan", async (expectedUniversityName: string, expectedBatchCount: number) => {
  const issuerSummary = universityScenario().universityIssuerSummary();
  if (issuerSummary.universityName !== expectedUniversityName) {
    throw new Error(`Expected university ${expectedUniversityName}, got ${issuerSummary.universityName}`);
  }
  const result = universityScenario().issuanceResult();
  if (!result.partitionMatchesPlan) {
    throw new Error("University issuance partition does not match the committed batch plan");
  }
  if (result.batchCount !== expectedBatchCount) {
    throw new Error(`Expected ${expectedBatchCount} issuance batches, got ${result.batchCount}`);
  }
  await logInsight("Issuance batch-plan step insight", {
    request: "Apply the committed batch policy to all accepted issuance requests.",
    response: "The queue is partitioned into deterministic issuance batches that align with the checked-in batch plan fixture.",
    checks: [
      `The batch count is exactly ${expectedBatchCount}.`,
      "No student appears in more than one batch.",
      "No batch exceeds the configured batch size limit.",
    ],
    dto: universityScenario().issuanceBatchPlanSummary(),
  });
});

Then("every issuance batch should deliver one non-revocable diploma VC per student", async () => {
  const result = universityScenario().issuanceResult();
  if (result.issuedCredentialCount !== result.totalStudents) {
    throw new Error(`Expected ${result.totalStudents} issued credentials, got ${result.issuedCredentialCount}`);
  }
  if (result.acceptedRequestCount !== result.totalStudents) {
    throw new Error(`Expected ${result.totalStudents} accepted issuance requests, got ${result.acceptedRequestCount}`);
  }
});

Then("the issuance report should include the configured bottleneck metrics for all {int} batches", async (expectedBatchCount: number) => {
  const result = universityScenario().issuanceResult();
  if (result.batchCount !== expectedBatchCount) {
    throw new Error(`Expected ${expectedBatchCount} issuance batches, got ${result.batchCount}`);
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
    "issuance_total_students",
    "issuance_credentials_per_second",
  ]);
});

Given("the {string} graduating class roster is loaded", async (expectedUniversityName: string) => {
  const summary = universityScenario().graduatingClassSummary();
  if (summary.universityName !== expectedUniversityName) {
    throw new Error(`Expected graduating class for ${expectedUniversityName}, got ${summary.universityName}`);
  }
  await logInsight("Job-application roster step insight", {
    request: "Load the graduating-class holders that already possess university diploma credentials.",
    response: "The harness exposes the readable student roster that will participate in company presentation flows.",
    checks: [
      "The roster belongs to the named university.",
      "The roster is small enough to read directly in the Serenity report.",
      "All listed students show assigned company ids and final grades.",
    ],
    dto: summary,
  });
});

Given("the company verifier roster includes {string}, {string}, and {string}", async (firstCompany: string, secondCompany: string, thirdCompany: string) => {
  const summary = universityScenario().companyRosterSummary();
  const actual = [...summary.companyNames].sort();
  const expected = [firstCompany, secondCompany, thirdCompany].sort();
  if (actual.join("|") !== expected.join("|")) {
    throw new Error(`Expected company roster ${expected.join(", ")}, got ${actual.join(", ")}`);
  }
  await logInsight("Company verifier roster step insight", {
    request: "Load the company verifier DID instances and their presentation-request policies.",
    response: "The harness exposes each company name plus the disclosure policy it will apply to student job applications.",
    checks: [
      "The three expected companies are present in the verifier roster.",
      "Each company policy lists the disclosed fields required for verification.",
      "No company in this scenario enforces a minimum-grade predicate.",
    ],
    dto: summary,
  });
});

When("each company publishes its university diploma presentation request policy", async () => {
  universityScenario().publishCompanyPolicies();
  await logInsight("Published company request-policy step insight", {
    request: "Each company publishes a verifier request describing the diploma fields required for a job application.",
    response: "Students can fetch a company-specific challenge and disclosure policy before building the presentation.",
    checks: [
      "Each request names the expected university issuer.",
      "Only justified diploma fields are required.",
      "The request policies now participate in the threaded protocol flow.",
    ],
    dto: universityScenario().companyRosterSummary(),
  });
});

When("every student builds and submits a job application to the assigned company", async () => {
  await universityScenario().runJobApplications();
  await logInsight("Job-application execution step insight", {
    request: "Each student builds a diploma presentation against the assigned company request and submits a job-application message.",
    response: "The threaded protocol runner verifies the presentation and records accepted application outcomes grouped by company.",
    checks: [
      "The verifier challenge used in the presentation matches the company request.",
      "All required disclosed fields are present in the submission.",
      "The result includes per-company acceptance counts and bottleneck metrics.",
    ],
    dto: universityScenario().jobApplicationResult(),
  });
});

Then("all {int} job applications should be accepted by their target companies", async (expectedCount: number) => {
  const result = universityScenario().jobApplicationResult();
  if (result.acceptedApplications !== expectedCount) {
    throw new Error(`Expected ${expectedCount} accepted job applications, got ${result.acceptedApplications}`);
  }
});

Then("the job-application report should expose company-level bottleneck metrics", async () => {
  const result = universityScenario().jobApplicationResult();
  expectMetricNames(result.metricNames, [
    "company_did_bootstrap_ms",
    "job_request_publish_ms",
    "presentation_build_ms",
    "job_application_submit_ms",
    "company_verification_ms",
    "job_application_acceptance_rate",
    "job_applications_per_second",
  ]);
  for (const acceptedCount of Object.values(result.companyAcceptedCounts)) {
    if (acceptedCount <= 0) {
      throw new Error("Expected every company to receive at least one accepted job application");
    }
  }
});

Given("the {string} verifier policy is loaded", async (expectedMallName: string) => {
  const summary = universityScenario().mallPolicySummary();
  if (summary.mallName !== expectedMallName) {
    throw new Error(`Expected mall ${expectedMallName}, got ${summary.mallName}`);
  }
  await logInsight("Mall verifier policy step insight", {
    request: "Load the mall verifier DID instance and its discount policy.",
    response: "The harness exposes the required disclosures and the encoded minimum final-grade predicate.",
    checks: [
      "The mall name matches the scenario actor.",
      "The policy requires university name and final grade disclosure.",
      "The business rule grade > 90 is encoded as minimumFinalGrade = 91.",
    ],
    dto: summary,
  });
});

Given("the selected student {string} with id {string} is loaded from the committed discount applicant list", async (expectedFullName: string, studentId: string) => {
  universityScenario().selectDiscountStudent(studentId);
  const summary = universityScenario().selectedDiscountApplicantSummary();
  if (summary.fullName !== expectedFullName) {
    throw new Error(`Expected selected student ${expectedFullName}, got ${summary.fullName}`);
  }
  await logInsight("Selected discount applicant step insight", {
    request: "Load one named student from the committed discount-applicant fixture set.",
    response: "The harness reconstructs the selected student diploma state and expected discount eligibility.",
    checks: [
      "The named student id matches the scenario example row.",
      "The final grade matches the committed applicant fixture.",
      "The expected eligibility flag is visible before the presentation is built.",
    ],
    dto: summary,
  });
});

When("the student submits a discount request presentation with final grade {int}", async (expectedFinalGrade: number) => {
  await universityScenario().runDiscountFlow();
  const result = universityScenario().discountResult();
  if (result.finalGrade !== expectedFinalGrade) {
    throw new Error(`Expected selected student's final grade to be ${expectedFinalGrade}, got ${result.finalGrade}`);
  }
  await logInsight("Discount execution step insight", {
    request: "The selected student builds a diploma presentation for the mall and discloses the final grade required by the discount policy.",
    response: "The verifier evaluates the presentation and returns an accepted or rejected outcome with an explanation string.",
    checks: [
      `The disclosed final grade is ${expectedFinalGrade}.`,
      "The explanation is stable for both acceptance and rejection paths.",
      "The result carries the expected discount metrics.",
    ],
    dto: result,
  });
});

Then("the mall should return the outcome {string}", async (expectedOutcome: string) => {
  const result = universityScenario().discountResult();
  if (result.outcome !== expectedOutcome) {
    throw new Error(`Expected mall outcome ${expectedOutcome}, got ${result.outcome}`);
  }
});

Then("the discount report should record the explanation {string}", async (expectedExplanation: string) => {
  const result = universityScenario().discountResult();
  if (result.explanation !== expectedExplanation) {
    throw new Error(`Expected explanation '${expectedExplanation}', got '${result.explanation}'`);
  }
  expectMetricNames(result.metricNames, [
    "discount_request_publish_ms",
    "discount_presentation_build_ms",
    "discount_verification_ms",
    "discount_acceptance_rate",
    "discount_rejection_reason_count",
  ]);
});
