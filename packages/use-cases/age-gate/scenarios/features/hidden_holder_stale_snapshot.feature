@negative @status
Feature: Hidden-holder stale status snapshot rejection
  As an integrator
  I want a narrated hidden-holder rejection when the verifier-supplied status snapshot is stale
  So that I can review the fail-closed behavior for outdated registry state in a Serenity report

  Scenario: Reject a hidden-holder presentation when the verifier-supplied status snapshot version is stale
    When the engineer runs the hidden-holder stale-snapshot rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "Revoked-set status proof protocol registry version does not match the verifier request"
    And the hidden-holder scenario failure code should be "statusRequestMismatch"
