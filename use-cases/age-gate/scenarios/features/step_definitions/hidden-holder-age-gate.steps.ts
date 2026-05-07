import { Then, When } from "@cucumber/cucumber";
import { Ensure, equals, includes } from "@serenity-js/assertions";
import { actorCalled } from "@serenity-js/core";

import {
  HiddenHolderScenarioOutcome,
  RunTheHiddenHolderWrongRegistryRejectedPath,
  RunTheHiddenHolderRevocationAwareHappyPath,
} from "../support/tasks.js";

const engineer = () => actorCalled("Engineer");

When(
  "the engineer runs the hidden-holder revocation-aware happy path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderRevocationAwareHappyPath());
  },
);

When(
  "the engineer runs the hidden-holder wrong-registry rejection path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderWrongRegistryRejectedPath());
  },
);

Then("the hidden-holder scenario should be approved", async () => {
  await engineer().attemptsTo(
    Ensure.that(HiddenHolderScenarioOutcome.approved(), equals(true)),
  );
});

Then("the hidden-holder scenario should be rejected", async () => {
  await engineer().attemptsTo(
    Ensure.that(HiddenHolderScenarioOutcome.rejected(), equals(true)),
  );
});

Then(
  "the hidden-holder scenario failure message should contain {string}",
  async (expectedFragment: string) => {
    await engineer().attemptsTo(
      Ensure.that(
        HiddenHolderScenarioOutcome.failureMessage(),
        includes(expectedFragment),
      ),
    );
  },
);

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
