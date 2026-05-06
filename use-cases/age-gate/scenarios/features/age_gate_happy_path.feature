Feature: Birth credential age gate
  As an engineer or integrator
  I want a narrated VC happy-path scenario
  So that I can understand the prototype flow from a Serenity/JS report

  @smoke @age-gate
  Scenario: Issue a birth credential and claim an age-gate capability
    When the engineer runs the birth credential age-gate happy path
    Then the scenario should be approved
    Then the scenario should issue 1 credential
    Then the scenario should verify 1 presentation
    Then the scenario should consume 1 access capability
