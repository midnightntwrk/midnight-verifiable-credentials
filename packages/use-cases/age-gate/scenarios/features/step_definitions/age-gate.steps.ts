import { Then, When } from "@cucumber/cucumber";
import { Ensure, equals } from "@serenity-js/assertions";
import { actorCalled } from "@serenity-js/core";

import {
  AgeGateScenarioOutcome,
  RunTheBirthCredentialAgeGateHappyPath,
} from "../support/tasks.js";

const engineer = () => actorCalled("Engineer");

When("the engineer runs the birth credential age-gate happy path", async () => {
  await engineer().attemptsTo(RunTheBirthCredentialAgeGateHappyPath());
});

Then("the scenario should be approved", async () => {
  await engineer().attemptsTo(
    Ensure.that(AgeGateScenarioOutcome.approved(), equals(true)),
  );
});

Then("the scenario should issue {int} credential", async (expectedCount: number) => {
  await engineer().attemptsTo(
    Ensure.that(
      AgeGateScenarioOutcome.issuedCredentialCount(),
      equals(BigInt(expectedCount)),
    ),
  );
});

Then(
  "the scenario should verify {int} presentation",
  async (expectedCount: number) => {
    await engineer().attemptsTo(
      Ensure.that(
        AgeGateScenarioOutcome.verifiedPresentationCount(),
        equals(BigInt(expectedCount)),
      ),
    );
  },
);

Then(
  "the scenario should consume {int} access capability",
  async (expectedCount: number) => {
    await engineer().attemptsTo(
      Ensure.that(
        AgeGateScenarioOutcome.consumedCapabilityCount(),
        equals(BigInt(expectedCount)),
      ),
    );
  },
);
