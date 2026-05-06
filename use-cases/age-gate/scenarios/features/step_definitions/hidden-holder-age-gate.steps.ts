import { Then, When } from "@cucumber/cucumber";
import { Ensure, equals } from "@serenity-js/assertions";
import { actorCalled } from "@serenity-js/core";

import {
  HiddenHolderScenarioOutcome,
  RunTheHiddenHolderRevocationAwareHappyPath,
} from "../support/tasks.js";

const engineer = () => actorCalled("Engineer");

When(
  "the engineer runs the hidden-holder revocation-aware happy path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderRevocationAwareHappyPath());
  },
);

Then("the hidden-holder scenario should be approved", async () => {
  await engineer().attemptsTo(
    Ensure.that(HiddenHolderScenarioOutcome.approved(), equals(true)),
  );
});

Then(
  "the hidden-holder scenario should issue {int} credential",
  async (expectedCount: number) => {
    await engineer().attemptsTo(
      Ensure.that(
        HiddenHolderScenarioOutcome.issuedCredentialCount(),
        equals(BigInt(expectedCount)),
      ),
    );
  },
);

Then(
  "the hidden-holder scenario should verify {int} presentation",
  async (expectedCount: number) => {
    await engineer().attemptsTo(
      Ensure.that(
        HiddenHolderScenarioOutcome.verifiedPresentationCount(),
        equals(BigInt(expectedCount)),
      ),
    );
  },
);

Then(
  "the hidden-holder scenario should consume {int} access capability",
  async (expectedCount: number) => {
    await engineer().attemptsTo(
      Ensure.that(
        HiddenHolderScenarioOutcome.consumedCapabilityCount(),
        equals(BigInt(expectedCount)),
      ),
    );
  },
);
