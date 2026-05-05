package io.iohk.midnight.vc.serenity.steps;

import io.iohk.midnight.vc.serenity.ScenarioBridge;
import io.iohk.midnight.vc.serenity.SerenityScenarioResult;
import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.steps.UIInteractionSteps;
import org.assertj.core.api.Assertions;

public class AgeGateSteps extends UIInteractionSteps {
  private final ScenarioBridge bridge = new ScenarioBridge();
  private SerenityScenarioResult result;

  @Step("Run the birth credential age-gate happy-path scenario")
  public void runAgeGateHappyPath() throws Exception {
    bridge.assertBuildPrerequisitesPresent();
    result = bridge.runNodeScenario("serenity-vc-scenarios/scripts/age-gate-happy-path.mjs");
  }

  @Step("The scenario should be approved")
  public void scenarioShouldBeApproved() {
    Assertions.assertThat(result.approved()).isTrue();
    Assertions.assertThat(result.claimDecision()).isEqualTo("approved");
    Assertions.assertThat(result.lastVerifiedCredentialRoot())
        .isEqualTo(result.expectedCredentialRoot());
  }

  @Step("The scenario should issue {0} credential")
  public void scenarioShouldIssueCredentials(long expectedCount) {
    Assertions.assertThat(result.issuedCredentialCount()).isEqualTo(expectedCount);
  }

  @Step("The scenario should verify {0} presentation")
  public void scenarioShouldVerifyPresentations(long expectedCount) {
    Assertions.assertThat(result.verifiedPresentationCount()).isEqualTo(expectedCount);
  }

  @Step("The scenario should consume {0} access capability")
  public void scenarioShouldConsumeCapabilities(long expectedCount) {
    Assertions.assertThat(result.consumedAccessCapabilityCount()).isEqualTo(expectedCount);
  }
}
