import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { Cast, configure, engage, serenity } from "@serenity-js/core";
import { ConsoleReporter } from "@serenity-js/console-reporter";

// This package executes source files directly through ts-node/esm and does not
// emit JavaScript, so local support imports intentionally use `.ts` specifiers.
import {
  createUniversityScenarioBackend,
  loadUniversityScenarioBackendMode,
  type UniversityScenarioBackend,
  type UniversityScenarioBackendContext,
} from "./university-scenario-backend.ts";
import { UseUniversityScenario } from "./university-scenario.ts";

const thisFile = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(thisFile), "..", "..");
const backendMode = loadUniversityScenarioBackendMode();
let universityBackend: UniversityScenarioBackend | undefined;
let backendContext: UniversityScenarioBackendContext | undefined;

setDefaultTimeout(backendMode === "standalone-hybrid" ? 1_800_000 : 60_000);

BeforeAll(async () => {
  configure({
    crew: [
      ConsoleReporter.forDarkTerminals(),
      [
        "@serenity-js/core:ArtifactArchiver",
        {
          outputDirectory: path.join(packageRoot, "target", "site", "serenity"),
        },
      ],
      [
        "@serenity-js/serenity-bdd",
        { specDirectory: path.join(packageRoot, "features") },
      ],
    ],
  });

  universityBackend = createUniversityScenarioBackend(backendMode);
  backendContext = await universityBackend.initialize();
});

Before(() => {
  if (!backendContext) {
    throw new Error("University scenario backend context is unavailable");
  }
  engage(
    Cast.where((actor) =>
      actor.whoCan(UseUniversityScenario.usingBackendContext(backendContext!)),
    ),
  );
});

AfterAll(async () => {
  if (universityBackend) {
    await universityBackend.shutdown();
  }
  await serenity.waitForNextCue();
});
