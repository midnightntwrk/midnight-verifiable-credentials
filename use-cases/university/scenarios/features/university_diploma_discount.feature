@university @discount @metrics
Feature: Selected students present diploma credentials to request a mall discount
  # DESCRIPTION:
  # - The mall offers a discount only when the final grade is strictly greater than 90.
  # - The verifier request therefore enforces `minimumFinalGrade = 91`.
  # - Five students with different grades exercise both acceptance and rejection paths.
  #
  # DATA SOURCES:
  # - use-cases/university/data/mall.json
  # - use-cases/university/data/discount-applicants.json
  #
  # METRICS TO CAPTURE:
  # - discount_request_publish_ms
  # - discount_presentation_build_ms
  # - discount_verification_ms
  # - discount_acceptance_rate
  # - discount_rejection_reason_count

  Scenario Outline: A selected student applies for the mall discount with a diploma presentation
    # REQUEST:
    # - The mall publishes a verifier request.
    # RESPONSE:
    # - The student learns that the request requires university name, final grade,
    #   and a minimum final grade of 91.
    # CHECKS:
    # - The request encodes the business rule `grade > 90` as `minimumFinalGrade = 91`.
    Given the mall verifier policy from "use-cases/university/data/mall.json"

    # REQUEST:
    # - Load one selected student from the discount applicant set.
    # RESPONSE:
    # - The student agent reconstructs the local diploma credential and the mall request.
    # CHECKS:
    # - The student's final grade matches the dataset.
    # - The student owns the holder DID instance used for presentation.
    And the selected student "<studentId>" from "use-cases/university/data/discount-applicants.json"

    # REQUEST:
    # - The student builds a diploma presentation that discloses the university name and final grade.
    # RESPONSE:
    # - The mall receives the presentation proof.
    # CHECKS:
    # - The presentation challenge matches the mall verifier request.
    # - The final grade is disclosed because the request requires it.
    When the student submits a discount request presentation with final grade <finalGrade>

    # REQUEST:
    # - The mall verifies the VC, the VP, and the minimum-grade predicate.
    # RESPONSE:
    # - The request is accepted or rejected according to the grade threshold.
    # CHECKS:
    # - Applicants above 90 succeed.
    # - Applicants at 90 or below fail.
    Then the mall should return the outcome "<expectedOutcome>"

    # REQUEST:
    # - Record the verification result in the discount metrics report.
    # RESPONSE:
    # - The report captures both acceptance and rejection counts.
    # CHECKS:
    # - The result explanation is stable and attributable to the final-grade predicate.
    And the discount report should record the explanation "<explanation>"

    Examples:
      | studentId | finalGrade | expectedOutcome | explanation                               |
      | STU-0001  | 98         | accepted        | grade is strictly greater than 90         |
      | STU-0002  | 94         | accepted        | grade is strictly greater than 90         |
      | STU-0003  | 91         | accepted        | grade is strictly greater than 90         |
      | STU-0004  | 90         | rejected        | grade does not satisfy the mall threshold |
      | STU-0005  | 72         | rejected        | grade does not satisfy the mall threshold |
