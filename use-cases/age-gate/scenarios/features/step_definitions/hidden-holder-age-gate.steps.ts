import { Then, When } from "@cucumber/cucumber";
import { Ensure, equals, includes } from "@serenity-js/assertions";
import { actorCalled } from "@serenity-js/core";

import {
  HiddenHolderScenarioOutcome,
  RunTheHiddenHolderLiveStatusHappyPath,
  RunTheHiddenHolderLiveStatusRevokedRejectedPath,
  RunTheHiddenHolderExpiredAuthorityAttestationRejectedPath,
  RunTheHiddenHolderRevokedCredentialRejectedPath,
  RunTheHiddenHolderUnsupportedAuthorityModeRejectedPath,
  RunTheHiddenHolderWrongAuthorityRejectedPath,
  RunTheHiddenHolderStaleSnapshotRejectedPath,
  RunTheHiddenHolderWrongRevokedRootRejectedPath,
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
  "the engineer runs the hidden-holder same-contract live-status happy path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderLiveStatusHappyPath());
  },
);

When(
  "the engineer runs the hidden-holder wrong-registry rejection path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderWrongRegistryRejectedPath());
  },
);

When(
  "the engineer runs the hidden-holder wrong-root rejection path",
  async () => {
    await engineer().attemptsTo(
      RunTheHiddenHolderWrongRevokedRootRejectedPath(),
    );
  },
);

When(
  "the engineer runs the hidden-holder stale-snapshot rejection path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderStaleSnapshotRejectedPath());
  },
);

When(
  "the engineer runs the hidden-holder expired-attestation rejection path",
  async () => {
    await engineer().attemptsTo(
      RunTheHiddenHolderExpiredAuthorityAttestationRejectedPath(),
    );
  },
);

When(
  "the engineer runs the hidden-holder wrong-authority rejection path",
  async () => {
    await engineer().attemptsTo(RunTheHiddenHolderWrongAuthorityRejectedPath());
  },
);

When(
  "the engineer runs the hidden-holder unsupported authority-mode rejection path",
  async () => {
    await engineer().attemptsTo(
      RunTheHiddenHolderUnsupportedAuthorityModeRejectedPath(),
    );
  },
);

When(
  "the engineer runs the hidden-holder revoked-credential rejection path",
  async () => {
    await engineer().attemptsTo(
      RunTheHiddenHolderRevokedCredentialRejectedPath(),
    );
  },
);

When(
  "the engineer runs the hidden-holder same-contract live-status revoked rejection path",
  async () => {
    await engineer().attemptsTo(
      RunTheHiddenHolderLiveStatusRevokedRejectedPath(),
    );
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
