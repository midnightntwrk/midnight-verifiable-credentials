@negative @status
Feature: Hidden-holder unsupported authority-mode rejection
  As an integrator
  I want a narrated hidden-holder rejection when the verifier request expects the wrong status proof mode
  So that I can review the fail-closed unsupported-mode behavior in a Serenity report

  Scenario: Reject a hidden-holder authority-attested presentation when the verifier expects another status proof mode
    When the engineer runs the hidden-holder unsupported authority-mode rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "does not accept authority-attested status"
