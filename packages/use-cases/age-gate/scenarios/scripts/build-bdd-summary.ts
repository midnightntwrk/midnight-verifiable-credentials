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
const cucumberJsonPath = path.join(
  scenarioRoot,
  "target",
  "cucumber-report.json",
);

const summary = await buildBddSummaryFromCucumberJsonFile({
  title: "Age Gate BDD Summary",
  cucumberJsonPath,
  featureRoot: path.join(scenarioRoot, "features"),
});

await writeBddSummaryArtifacts({
  targetDir: path.join(scenarioRoot, "target"),
  summary,
});

console.log(
  `${summary.title}: ${summary.totals.scenarios} scenarios, ` +
    `failed=${summary.totals.statuses.failed}, ` +
    `summary=target/summary.md`,
);
