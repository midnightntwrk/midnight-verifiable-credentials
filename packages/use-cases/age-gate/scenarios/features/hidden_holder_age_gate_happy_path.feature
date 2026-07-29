@smoke @status
Feature: Hidden-holder revocation-aware age gate
  As an integrator
  I want a hidden-holder status-aware age-gate example
  So that I can understand the privacy-preserving business flow

  Scenario: Verify a verifier-supplied-root hidden-holder age-gate presentation
    When the engineer runs the hidden-holder revocation-aware happy path
    Then the hidden-holder scenario should be approved
    And the hidden-holder scenario should issue 1 credential
    And the hidden-holder scenario should verify 1 presentation
    And the hidden-holder scenario should consume 1 access capability
