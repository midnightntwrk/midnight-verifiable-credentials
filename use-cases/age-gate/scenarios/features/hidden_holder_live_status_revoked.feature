@negative @status
Feature: Hidden-holder same-contract live-status revoked rejection
  As an integrator
  I want a live local revoked handle to fail hidden-holder verification outright
  So that the same-contract revocation mode preserves hard VC/VP invalidity

  Scenario: Reject a hidden-holder presentation when the local live status registry already revoked its handle
    When the engineer runs the hidden-holder same-contract live-status revoked rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "revoked in the live status registry"
