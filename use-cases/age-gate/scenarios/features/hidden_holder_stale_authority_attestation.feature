@negative @status
Feature: Hidden-holder stale authority attestation rejection
  As an integrator
  I want a narrated hidden-holder rejection when the authority attestation is too old
  So that I can review the verifier freshness policy in a Serenity report

  Scenario: Reject a hidden-holder presentation when the authority attestation exceeds max age
    When the engineer runs the hidden-holder expired-attestation rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "exceeds the verifier max-age policy"
