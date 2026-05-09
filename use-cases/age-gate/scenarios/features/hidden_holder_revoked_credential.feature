@negative @status
Feature: Hidden-holder revoked credential rejection
  As an integrator
  I want a revoked hidden-holder credential to fail before proof assembly
  So that revocation is treated as hard VC/VP invalidity rather than a soft business denial

  Scenario: Reject a hidden-holder credential when its status handle is already revoked
    When the engineer runs the hidden-holder revoked-credential rejection path
    Then the hidden-holder scenario should be rejected
    And the hidden-holder scenario failure message should contain "already present in the revoked set snapshot"
