import { Given, Then, When } from "@cucumber/cucumber";
import { actorCalled } from "@serenity-js/core";

import { UseUniversityScenario } from "../support/university-scenario.js";

const engineer = () => actorCalled("Engineer");
const universityScenario = () => UseUniversityScenario.from(engineer());

const expectMetricNames = (actual: readonly string[], expected: readonly string[]) => {
  for (const metricName of expected) {
    if (!actual.includes(metricName)) {
      throw new Error(`Missing expected metric ${metricName}`);
    }
  }
};

Given("the university issuer DID instance from {string}", async (relativePath: string) => {
  universityScenario().setUniversityPath(relativePath);
});

Given("{int} graduating student agents from {string}", async (expectedCount: number, relativePath: string) => {
  universityScenario().setStudentsPath(relativePath);
  universityScenario().assertStudentCount(expectedCount);
});

When("every student submits a student-initiated university diploma issuance request", async () => {
  await universityScenario().runBatchIssuance();
});

Then("the university should partition the accepted requests using {string}", async (_relativePath: string) => {
  const result = universityScenario().issuanceResult();
  if (!result.partitionMatchesPlan) {
    throw new Error("University issuance partition does not match the committed batch plan");
  }
});

Then("every issuance batch should deliver one non-revocable diploma VC per student", async () => {
  const result = universityScenario().issuanceResult();
  if (result.issuedCredentialCount !== 100) {
    throw new Error(`Expected 100 issued credentials, got ${result.issuedCredentialCount}`);
  }
  if (result.acceptedRequestCount !== 100) {
    throw new Error(`Expected 100 accepted issuance requests, got ${result.acceptedRequestCount}`);
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

Given("the graduating student dataset from {string}", async (relativePath: string) => {
  universityScenario().setStudentsPath(relativePath);
});

Given("the company verifier dataset from {string}", async (relativePath: string) => {
  universityScenario().setCompaniesPath(relativePath);
});

When("each company publishes its university diploma presentation request policy", async () => {
  universityScenario().publishCompanyPolicies();
});

When("every student builds and submits a job application to the assigned company", async () => {
  await universityScenario().runJobApplications();
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

Given("the mall verifier policy from {string}", async (relativePath: string) => {
  universityScenario().setMallPath(relativePath);
});

Given("the selected student {string} from {string}", async (studentId: string, relativePath: string) => {
  universityScenario().setDiscountApplicantsPath(relativePath);
  universityScenario().selectDiscountStudent(studentId);
});

When("the student submits a discount request presentation with final grade {int}", async (expectedFinalGrade: number) => {
  await universityScenario().runDiscountFlow();
  const result = universityScenario().discountResult();
  if (result.finalGrade !== expectedFinalGrade) {
    throw new Error(`Expected selected student's final grade to be ${expectedFinalGrade}, got ${result.finalGrade}`);
  }
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
