import { Interaction, Question, Task } from "@serenity-js/core";

import { UseAgeGateScenario } from "./age-gate-scenario.js";

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
