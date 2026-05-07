@negative @status
Feature: Hidden-holder wrong-registry rejection
  As an integrator
  I want a narrated hidden-holder rejection when the witness registry diverges
  So that I can review the status trust boundary in a Serenity report

  Scenario: Reject a hidden-holder presentation when the witness registry is wrong
    When the engineer runs the hidden-holder wrong-registry rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "status witness registry does not match the verifier request"
