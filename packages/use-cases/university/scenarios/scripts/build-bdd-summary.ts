import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildBddSummaryFromCucumberJsonFile,
  writeBddSummaryArtifacts,
} from "@midnight-ntwrk/midnight-did-credentials-bdd-support";

const scenarioRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const cucumberJsonPath = path.join(scenarioRoot, "target", "cucumber-report.json");

const summary = await buildBddSummaryFromCucumberJsonFile({
  title: "University BDD Summary",
  cucumberJsonPath,
  featureRoot: path.join(scenarioRoot, "features"),
});

await writeBddSummaryArtifacts({
  targetDir: path.join(scenarioRoot, "target"),
  summary,
});

console.log(JSON.stringify(summary, null, 2));
