import { Interaction, Question, Task } from "@serenity-js/core";

import {
  collectAgeGateStepInsight,
} from "./age-gate-step-insight.js";
import {
  AGE_GATE_SCENARIO_NARRATIVES,
  buildAgeGateScenarioInsight,
  buildHiddenHolderScenarioInsight,
  type AgeGateScenarioNarrativeKey,
} from "./age-gate-reporting.js";
import {
  UseAgeGateScenario,
} from "./age-gate-scenario.js";
import {
  UseHiddenHolderScenario,
} from "./hidden-holder-scenario.js";

const runHiddenHolderScenario = (options: {
  readonly narrativeKey: AgeGateScenarioNarrativeKey;
  readonly execute: (scenario: UseHiddenHolderScenario) => Promise<void>;
}) => {
  const narrative = AGE_GATE_SCENARIO_NARRATIVES[options.narrativeKey];

  return Task.where(
    narrative.taskName,
    Interaction.where(narrative.interactionName, async (actor) => {
      const scenario = UseHiddenHolderScenario.from(actor);
      await options.execute(scenario);
      collectAgeGateStepInsight(
        actor,
        narrative.insightTitle,
        buildHiddenHolderScenarioInsight(narrative, scenario.lastResult()),
      );
    }),
  );
};

export const RunTheBirthCredentialAgeGateHappyPath = () => {
  const narrative = AGE_GATE_SCENARIO_NARRATIVES.birthCredentialHappyPath;

  return Task.where(
    narrative.taskName,
    Interaction.where(narrative.interactionName, async (actor) => {
      const scenario = UseAgeGateScenario.from(actor);
      await scenario.runHappyPath();
      collectAgeGateStepInsight(
        actor,
        narrative.insightTitle,
        buildAgeGateScenarioInsight(narrative, scenario.lastResult()),
      );
    }),
  );
};

export const RunTheHiddenHolderRevocationAwareHappyPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderRevocationAwareHappyPath",
    execute: (scenario) => scenario.runVerifierSuppliedRootHappyPath(),
  });

export const RunTheHiddenHolderLiveStatusHappyPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderLiveStatusHappyPath",
    execute: (scenario) => scenario.runLiveStatusHappyPath(),
  });

export const RunTheHiddenHolderWrongRegistryRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderWrongRegistryRejectedPath",
    execute: (scenario) =>
      scenario.runVerifierSuppliedRootWrongRegistryRejectedPath(),
  });

export const RunTheHiddenHolderWrongRevokedRootRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderWrongRevokedRootRejectedPath",
    execute: (scenario) =>
      scenario.runVerifierSuppliedRootWrongRevokedRootRejectedPath(),
  });

export const RunTheHiddenHolderStaleSnapshotRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderStaleSnapshotRejectedPath",
    execute: (scenario) =>
      scenario.runVerifierSuppliedRootStaleSnapshotRejectedPath(),
  });

export const RunTheHiddenHolderExpiredAuthorityAttestationRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderExpiredAuthorityAttestationRejectedPath",
    execute: (scenario) =>
      scenario.runAuthorityAttestedExpiredProofRejectedPath(),
  });

export const RunTheHiddenHolderWrongAuthorityRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderWrongAuthorityRejectedPath",
    execute: (scenario) =>
      scenario.runAuthorityAttestedWrongAuthorityRejectedPath(),
  });

export const RunTheHiddenHolderUnsupportedAuthorityModeRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderUnsupportedAuthorityModeRejectedPath",
    execute: (scenario) =>
      scenario.runAuthorityAttestedUnsupportedModeRejectedPath(),
  });

export const RunTheHiddenHolderRevokedCredentialRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderRevokedCredentialRejectedPath",
    execute: (scenario) => scenario.runRevokedCredentialRejectedPath(),
  });

export const RunTheHiddenHolderLiveStatusRevokedRejectedPath = () =>
  runHiddenHolderScenario({
    narrativeKey: "hiddenHolderLiveStatusRevokedRejectedPath",
    execute: (scenario) => scenario.runLiveStatusRevokedCredentialRejectedPath(),
  });

export const AgeGateScenarioOutcome = {
  approved: () =>
    Question.about<boolean>(
      "whether the age-gate scenario was approved",
      (actor) => UseAgeGateScenario.from(actor).lastResult().approved,
    ),
  issuedCredentialCount: () =>
    Question.about<bigint>(
      "how many credentials were issued",
      (actor) =>
        UseAgeGateScenario.from(actor).lastResult().issuedCredentialCount,
    ),
  verifiedPresentationCount: () =>
    Question.about<bigint>(
      "how many presentations were verified",
      (actor) =>
        UseAgeGateScenario.from(actor).lastResult().verifiedPresentationCount,
    ),
  consumedCapabilityCount: () =>
    Question.about<bigint>(
      "how many access capabilities were consumed",
      (actor) =>
        UseAgeGateScenario.from(actor).lastResult().consumedAccessCapabilityCount,
    ),
};

export const HiddenHolderScenarioOutcome = {
  approved: () =>
    Question.about<boolean>(
      "whether the hidden-holder scenario was approved",
      (actor) => UseHiddenHolderScenario.from(actor).lastResult().approved,
    ),
  issuedCredentialCount: () =>
    Question.about<bigint>(
      "how many hidden-holder credentials were issued",
      (actor) =>
        UseHiddenHolderScenario.from(actor).lastResult().issuedCredentialCount,
    ),
  verifiedPresentationCount: () =>
    Question.about<bigint>(
      "how many hidden-holder presentations were verified",
      (actor) =>
        UseHiddenHolderScenario.from(actor).lastResult().verifiedPresentationCount,
    ),
  consumedCapabilityCount: () =>
    Question.about<bigint>(
      "how many hidden-holder access capabilities were consumed",
      (actor) =>
        UseHiddenHolderScenario.from(actor).lastResult()
          .consumedAccessCapabilityCount,
    ),
  rejected: () =>
    Question.about<boolean>(
      "whether the hidden-holder scenario was rejected",
      (actor) => !UseHiddenHolderScenario.from(actor).lastResult().approved,
    ),
  failureMessage: () =>
    Question.about<string | null>(
      "why the hidden-holder scenario was rejected",
      (actor) => UseHiddenHolderScenario.from(actor).lastResult().failureMessage,
    ),
  failureCode: () =>
    Question.about<string | null>(
      "which canonical status code rejected the hidden-holder scenario",
      (actor) => UseHiddenHolderScenario.from(actor).lastResult().failureCode,
    ),
};
