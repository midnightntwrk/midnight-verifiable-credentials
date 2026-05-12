@university @discount @metrics
Feature: Selected students present diploma credentials to request a mall discount
  # DESCRIPTION:
  # - The mall offers a discount only when the final grade is strictly greater than 90.
  # - The verifier request therefore enforces `minimumFinalGrade = 91`.
  # - Five students with different grades exercise both acceptance and rejection paths.
  #
  # METRICS TO CAPTURE:
  # - discount_request_publish_ms
  # - discount_presentation_build_ms
  # - discount_verification_ms
  # - discount_acceptance_rate
  # - discount_rejection_reason_count
  #
  # DATA SOURCES:
  # - use-cases/university/data/mall.json
  # - use-cases/university/data/discount-applicants.json
  # - use-cases/university/data/students.json

  Scenario Outline: A selected student applies for the mall discount with a diploma presentation
    # REQUEST:
    # - The mall publishes a verifier request.
    # RESPONSE:
    # - The student learns that the request requires university name, final grade,
    #   and a minimum final grade of 91.
    # CHECKS:
    # - The request encodes the business rule `grade > 90` as `minimumFinalGrade = 91`.
    Given the "Student Square Mall" verifier policy is loaded

    # REQUEST:
    # - Load one selected student from the discount applicant set.
    # RESPONSE:
    # - The student agent reconstructs the local diploma credential and the mall request.
    # CHECKS:
    # - The student's final grade matches the dataset.
    # - The student owns the holder DID instance used for presentation.
    And the selected student "<fullName>" with id "<studentId>" is loaded from the committed discount applicant list

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
      | fullName        | studentId | finalGrade | expectedOutcome | explanation                               |
      | Ada Avery 0001  | STU-0001  | 98         | accepted        | grade is strictly greater than 90         |
      | Ben Avery 0002  | STU-0002  | 94         | accepted        | grade is strictly greater than 90         |
      | Cara Avery 0003 | STU-0003  | 91         | accepted        | grade is strictly greater than 90         |
      | Dion Avery 0004 | STU-0004  | 90         | rejected        | failed assert: University-diploma disclosed final grade is below the verifier minimum |
      | Ella Avery 0005 | STU-0005  | 72         | rejected        | failed assert: University-diploma disclosed final grade is below the verifier minimum |
