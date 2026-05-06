import path from "node:path";
import { fileURLToPath } from "node:url";

import { AfterAll, Before, BeforeAll, setDefaultTimeout } from "@cucumber/cucumber";
import { Cast, configure, engage, serenity } from "@serenity-js/core";
import { ConsoleReporter } from "@serenity-js/console-reporter";

import { UseAgeGateScenario } from "./age-gate-scenario.js";
import { UseHiddenHolderScenario } from "./hidden-holder-scenario.js";

const thisFile = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(thisFile), "..", "..");

setDefaultTimeout(30_000);

BeforeAll(() => {
  configure({
    crew: [
      ConsoleReporter.forDarkTerminals(),
      [
        "@serenity-js/core:ArtifactArchiver",
        { outputDirectory: path.join(packageRoot, "target", "site", "serenity") },
      ],
      [
        "@serenity-js/serenity-bdd",
        { specDirectory: path.join(packageRoot, "features") },
      ],
    ],
  });
});

Before(() => {
  engage(
    Cast.where((actor) =>
      actor.whoCan(
        UseAgeGateScenario.locally(),
        UseHiddenHolderScenario.locally(),
      ),
    ),
  );
});

AfterAll(async () => {
  await serenity.waitForNextCue();
});
