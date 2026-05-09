@negative @status
Feature: Hidden-holder wrong-root rejection
  As an integrator
  I want a narrated hidden-holder rejection when the revoked root diverges
  So that I can review the verifier-supplied snapshot boundary in a Serenity report

  Scenario: Reject a hidden-holder presentation when the witness revoked root is wrong
    When the engineer runs the hidden-holder wrong-root rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "status witness revoked root does not match the verifier request"
