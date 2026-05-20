@university @job-application @metrics
Feature: Students apply to companies by presenting university diploma credentials
  # DESCRIPTION:
  # - Each student already holds a university diploma VC.
  # - Three companies publish verifier request policies.
  # - Every student creates a job application that embeds a diploma presentation.
  #
  # METRICS TO CAPTURE:
  # - company_did_bootstrap_ms
  # - job_protocol_phase_ms
  # - job_request_count
  # - job_presentation_submission_count
  # - job_verification_result_count
  # - job_duplicate_rejection_count
  # - job_verification_rejection_count
  # - job_application_acceptance_rate
  # - job_applications_per_second
  #
  # DATA SOURCES:
  # - packages/use-cases/university/data/students.json
  # - packages/use-cases/university/data/companies.json
  # - packages/use-cases/university/data/university.json

  Scenario: 10 students successfully create job applications across 3 verifier companies
    # REQUEST:
    # - Load the student holders and the 3 companies.
    # RESPONSE:
    # - The harness materializes 10 student agents and 3 company verifier agents.
    # CHECKS:
    # - Every company has a DID, verification method, and verifier request policy.
    Given the "Example University" graduating class roster is loaded
    And the company verifier roster includes "Northwind Robotics", "Blue Ocean Analytics", and "Pioneer Systems"

    # REQUEST:
    # - Each company publishes a verifier request.
    # RESPONSE:
    # - Students can fetch a company-specific diploma presentation request before applying.
    # CHECKS:
    # - The request names the expected issuer.
    # - The request only asks for fields justified by the hiring flow.
    When each company publishes its university diploma presentation request policy

    # REQUEST:
    # - Each student selects the assigned company from the dataset.
    # - Each student builds a job application message with:
    #   - student DID
    #   - company DID
    #   - target role
    #   - diploma presentation
    # RESPONSE:
    # - 10 application messages are submitted.
    # CHECKS:
    # - The presentation challenge matches the company request.
    # - The issuer is the university named by the verifier policy.
    # - All required disclosed fields are present.
    And every student builds and submits a job application to the assigned company

    # REQUEST:
    # - Each company verifies the diploma presentation.
    # RESPONSE:
    # - The company accepts the application when the VC and VP are valid.
    # CHECKS:
    # - The holder controls the holder verification method.
    # - The disclosed diploma fields match the credential body.
    # - The company-specific disclosure policy is satisfied.
    Then all 10 job applications should be accepted by their target companies

    # REQUEST:
    # - Emit a verifier throughput report grouped by company.
    # RESPONSE:
    # - The report shows build and verification latency distributions.
    # CHECKS:
    # - Acceptance rate is 100% for this fixture set.
    # - Verification latency is broken down by company request policy.
    And the job-application report should expose company-level bottleneck metrics
