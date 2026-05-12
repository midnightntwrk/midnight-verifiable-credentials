import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildUniversityBatchSweepSummary,
  writeUniversityBatchSweepArtifacts,
} from "./batch-sweep-lib.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const targetDir = path.join(
  repoRoot,
  "use-cases",
  "university",
  "scenarios",
  "target",
  "batch-sweep",
);

const summary = await buildUniversityBatchSweepSummary();
writeUniversityBatchSweepArtifacts(targetDir, summary);
console.log(JSON.stringify(summary, null, 2));
