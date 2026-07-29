@university @issuance @batching @metrics
Feature: University batch issues non-revocable diploma credentials to graduating students
  # DESCRIPTION:
  # - A graduating student starts the issuance flow.
  # - The university acts as the issuer and validates the student against the graduation roster.
  # - The university batches accepted requests in groups of 5 and returns one diploma VC per student.
  # - The holder binding is explicit and non-revocable.
  #
  # METRICS TO CAPTURE:
  # - issuer_did_bootstrap_ms
  # - student_did_bootstrap_ms
  # - issuance_request_build_ms
  # - issuance_request_validation_ms
  # - issuance_batch_queue_wait_ms
  # - issuance_batch_compile_ms
  # - issuance_batch_sign_ms
  # - issuance_batch_delivery_ms
  # - issuance_duplicate_request_count
  # - issuance_idempotent_replay_count
  # - issuance_credentials_per_second
  #
  # DATA SOURCES:
  # - packages/use-cases/university/data/university.json
  # - packages/use-cases/university/data/students.json
  # - packages/use-cases/university/data/issuance-batches.json

  Scenario: Example University issues 10 diploma credentials across 2 committed graduation batches
    # REQUEST:
    # - The university publishes an issuance policy for the `university-diploma` VC.
    # - The policy says the credential is non-revocable and uses explicit holder binding.
    # RESPONSE:
    # - Students can now assemble issuance requests with their DID and holder verification method.
    # CHECKS:
    # - The issuer DID exists.
    # - The issuer verification method is the one expected by the family schema.
    Given the "Example University" issuer DID instance is available

    # REQUEST:
    # - Load the 10 graduating students and their holder DID instances.
    # RESPONSE:
    # - The harness materializes 10 virtual student agents.
    # CHECKS:
    # - Every student has a holder DID URL.
    # - Every student has a holder method id.
    # - Every student is marked graduation eligible.
    And the "Example University" graduating class contains 10 eligible students

    # REQUEST:
    # - Each student sends a graduation issuance request.
    # - The request carries the student's DID identity, holder method id, and diploma claim payload.
    # RESPONSE:
    # - The university accepts the request into the issuance queue.
    # CHECKS:
    # - The student exists in the graduation roster.
    # - The student controls the holder verification method referenced in the request.
    # - The diploma claim payload matches the university roster record for that student.
    When every graduating student submits a university diploma issuance request

    # REQUEST:
    # - The university groups accepted requests according to the batch policy.
    # RESPONSE:
    # - The queue is partitioned into 2 deterministic batches of 5 students.
    # CHECKS:
    # - No student appears in more than one batch.
    # - No batch exceeds the configured batch size.
    # - All 10 students are assigned to a batch.
    Then "Example University" should partition the accepted requests into the committed 2-batch graduation plan

    # REQUEST:
    # - The issuer signs one credential per accepted student inside each batch.
    # RESPONSE:
    # - Each student receives one `university-diploma` VC.
    # CHECKS:
    # - The issuer verification method matches the university DID.
    # - The holder binding matches the student's holder DID method.
    # - The credential is non-revocable and has `NoStatusBinding`.
    And every issuance batch should deliver one non-revocable diploma VC per student

    # REQUEST:
    # - Emit a batch issuance report.
    # RESPONSE:
    # - The report includes per-batch and total throughput metrics.
    # CHECKS:
    # - Queue wait, compile, sign, and delivery times are all present.
    # - The total issued credential count is 10.
    And the issuance report should include the configured bottleneck metrics for all 2 batches

  Scenario: Example University ignores a replayed issuance request after one diploma is already queued
    Given the "Example University" issuer DID instance is available
    And the "Example University" graduating class contains 10 eligible students
    And the student "Ada Avery 0001" with id "STU-0001" will resubmit the same issuance request
    When every graduating student submits a university diploma issuance request
    Then "Example University" should partition the accepted requests into the committed 2-batch graduation plan
    And every issuance batch should deliver one non-revocable diploma VC per student
    And the issuance report should record 1 duplicate request and still issue 10 diploma credentials
