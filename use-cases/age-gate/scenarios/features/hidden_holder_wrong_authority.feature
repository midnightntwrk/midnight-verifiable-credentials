@negative @status
Feature: Hidden-holder wrong-authority rejection
  As an integrator
  I want a narrated hidden-holder rejection when the authority attestation is signed by the wrong authority
  So that I can review the fail-closed authority-identity boundary in a Serenity report

  Scenario: Reject a hidden-holder presentation when the status attestation signer is not the bound authority
    When the engineer runs the hidden-holder wrong-authority rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "does not match the status authority"
    And the hidden-holder scenario failure code should be "authorityMismatch"
