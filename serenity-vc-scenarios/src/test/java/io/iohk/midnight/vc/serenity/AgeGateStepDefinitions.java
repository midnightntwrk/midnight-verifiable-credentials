package io.iohk.midnight.vc.serenity;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.iohk.midnight.vc.serenity.steps.AgeGateSteps;
import net.serenitybdd.annotations.Steps;

public class AgeGateStepDefinitions {
  @Steps private AgeGateSteps steps;

  @When("the engineer runs the birth credential age-gate happy path")
  public void runBirthCredentialAgeGateHappyPath() throws Exception {
    steps.runAgeGateHappyPath();
  }

  @Then("the scenario should be approved")
  public void scenarioShouldBeApproved() {
    steps.scenarioShouldBeApproved();
  }

  @And("the scenario should issue {long} credential")
  public void scenarioShouldIssueCredential(long expectedCount) {
    steps.scenarioShouldIssueCredentials(expectedCount);
  }

  @And("the scenario should verify {long} presentation")
  public void scenarioShouldVerifyPresentation(long expectedCount) {
    steps.scenarioShouldVerifyPresentations(expectedCount);
  }

  @And("the scenario should consume {long} access capability")
  public void scenarioShouldConsumeCapability(long expectedCount) {
    steps.scenarioShouldConsumeCapabilities(expectedCount);
  }
}
