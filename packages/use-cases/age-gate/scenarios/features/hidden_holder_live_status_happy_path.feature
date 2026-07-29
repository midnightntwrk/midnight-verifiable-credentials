@status
Feature: Hidden-holder same-contract live-status age gate
  As an integrator
  I want a hidden-holder status-aware age-gate example that uses a live local revocation set
  So that I can understand the same-contract verification mode without an external snapshot or authority attestation

  Scenario: Verify a same-contract live-status hidden-holder age-gate presentation
    When the engineer runs the hidden-holder same-contract live-status happy path
    Then the hidden-holder scenario should be approved
    And the hidden-holder scenario should issue 1 credential
    And the hidden-holder scenario should verify 1 presentation
    And the hidden-holder scenario should consume 1 access capability
