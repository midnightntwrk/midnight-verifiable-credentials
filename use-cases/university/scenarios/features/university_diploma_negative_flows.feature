Feature: University diploma negative flows stay readable and isolated
  # Data sources:
  # - use-cases/university/data/university.json
  # - use-cases/university/data/students.json
  # - use-cases/university/data/companies.json
  # - use-cases/university/data/mall.json
  # - use-cases/university/data/discount-applicants.json
  #
  # Metric vocabulary used in this feature:
  # - company_did_bootstrap_ms
  # - mall_did_bootstrap_ms
  # - job_protocol_phase_ms
  # - job_request_count
  # - job_presentation_submission_count
  # - job_verification_result_count
  # - job_duplicate_rejection_count
  # - job_verification_rejection_count
  # - job_application_acceptance_rate
  # - job_applications_per_second
  # - discount_protocol_phase_ms
  # - discount_request_count
  # - discount_presentation_submission_count
  # - discount_verification_result_count
  # - discount_duplicate_rejection_count
  # - discount_verification_rejection_count
  # - discount_acceptance_rate
  # - discount_rejection_reason_count

  Scenario: An invalid company verifier policy rejects only the routed company cohort
    Given the "Example University" graduating class roster is loaded
    And the company verifier roster includes "Northwind Robotics", "Blue Ocean Analytics", and "Pioneer Systems"
    And the company verifier "company-northwind-robotics" overrides the diploma request policy with minimum final grade 91
    When every student builds and submits a job application to the assigned company
    Then the company "company-northwind-robotics" should reject all routed applications with rejection kind "verificationFailed"
    And the remaining companies should keep their routed applications accepted

  Scenario: A duplicate job-application submission is rejected without replacing the original acceptance
    Given the "Example University" graduating class roster is loaded
    And the company verifier roster includes "Northwind Robotics", "Blue Ocean Analytics", and "Pioneer Systems"
    And the student "Ada Avery 0001" with id "STU-0001" will resubmit the same job application thread
    When every student builds and submits a job application to the assigned company
    Then the job application results for student "STU-0001" should contain 1 accepted result and 1 "duplicate" rejection

  Scenario: A duplicate mall discount submission is rejected without replacing the original mall outcome
    Given the "Student Square Mall" verifier policy is loaded
    And the selected student "Ada Avery 0001" with id "STU-0001" is loaded from the committed discount applicant list
    And the selected student will resubmit the same mall discount thread
    When the student submits a discount request presentation with final grade 98
    Then the mall should return the outcome "accepted"
    And the discount results for student "STU-0001" should contain 1 accepted result and 1 "duplicate" rejection
