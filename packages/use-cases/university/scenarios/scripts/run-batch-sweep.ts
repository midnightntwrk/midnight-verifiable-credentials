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
  "..",
);

const targetDir = path.join(
  repoRoot,
  "packages",
  "use-cases",
  "university",
  "scenarios",
  "target",
  "batch-sweep",
);

const summary = await buildUniversityBatchSweepSummary({
  artifactTargetDir: path.relative(repoRoot, targetDir),
});
writeUniversityBatchSweepArtifacts(targetDir, summary);
console.log(JSON.stringify(summary, null, 2));
