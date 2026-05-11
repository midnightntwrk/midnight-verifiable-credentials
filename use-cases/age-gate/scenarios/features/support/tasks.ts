import { Interaction, Question, Task } from "@serenity-js/core";

import { UseAgeGateScenario } from "./age-gate-scenario.js";
import { UseHiddenHolderScenario } from "./hidden-holder-scenario.js";

export const RunTheBirthCredentialAgeGateHappyPath = () =>
  Task.where(
    "#actor runs the birth credential age-gate happy path",
    Interaction.where(
      "#actor executes the age-gate scenario against the VC simulator",
      async (actor) => {
        await UseAgeGateScenario.from(actor).runHappyPath();
      },
    ),
  );

export const RunTheHiddenHolderRevocationAwareHappyPath = () =>
  Task.where(
    "#actor runs the hidden-holder revocation-aware happy path",
    Interaction.where(
      "#actor executes the hidden-holder scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor).runVerifierSuppliedRootHappyPath();
      },
    ),
  );

export const RunTheHiddenHolderLiveStatusHappyPath = () =>
  Task.where(
    "#actor runs the hidden-holder same-contract live-status happy path",
    Interaction.where(
      "#actor executes the hidden-holder same-contract live-status scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor).runLiveStatusHappyPath();
      },
    ),
  );

export const RunTheHiddenHolderWrongRegistryRejectedPath = () =>
  Task.where(
    "#actor runs the hidden-holder wrong-registry rejection path",
    Interaction.where(
      "#actor executes the hidden-holder wrong-registry scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor)
          .runVerifierSuppliedRootWrongRegistryRejectedPath();
      },
    ),
  );

export const RunTheHiddenHolderWrongRevokedRootRejectedPath = () =>
  Task.where(
    "#actor runs the hidden-holder wrong-root rejection path",
    Interaction.where(
      "#actor executes the hidden-holder wrong-root scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor)
          .runVerifierSuppliedRootWrongRevokedRootRejectedPath();
      },
    ),
  );

export const RunTheHiddenHolderStaleVersionRejectedPath = () =>
  Task.where(
    "#actor runs the hidden-holder stale-version rejection path",
    Interaction.where(
      "#actor executes the hidden-holder stale-version scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor)
          .runVerifierSuppliedRootStaleVersionRejectedPath();
      },
    ),
  );

export const RunTheHiddenHolderExpiredAuthorityAttestationRejectedPath = () =>
  Task.where(
    "#actor runs the hidden-holder expired-attestation rejection path",
    Interaction.where(
      "#actor executes the hidden-holder expired-attestation scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor)
          .runAuthorityAttestedExpiredProofRejectedPath();
      },
    ),
  );

export const RunTheHiddenHolderLiveStatusRevokedRejectedPath = () =>
  Task.where(
    "#actor runs the hidden-holder same-contract live-status revoked rejection path",
    Interaction.where(
      "#actor executes the hidden-holder same-contract live-status revoked scenario against the revocation demo simulator",
      async (actor) => {
        await UseHiddenHolderScenario.from(actor)
          .runLiveStatusRevokedCredentialRejectedPath();
      },
    ),
  );
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
};
