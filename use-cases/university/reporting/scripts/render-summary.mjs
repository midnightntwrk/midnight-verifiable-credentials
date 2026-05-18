import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertUniversityArtifactSummaryConforms,
  buildUniversityArtifactSummary,
  renderUniversityArtifactManifestMarkdown,
  renderUniversityArtifactSummaryMarkdown,
} from "../dist/index.js";

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
  "reporting",
  "target",
);

const summary = buildUniversityArtifactSummary({
  artifactBaseDirectory: repoRoot,
  serenityDirectory: path.join(
    repoRoot,
    "use-cases",
    "university",
    "scenarios",
    "target",
    "site",
    "serenity",
  ),
  transcriptExportPath: path.join(
    repoRoot,
    "use-cases",
    "university",
    "protocol",
    "target",
    "readable-10",
    "transcript-export.json",
  ),
  stressSummaryPath: path.join(
    repoRoot,
    "use-cases",
    "university",
    "protocol",
    "target",
    "stress-100",
    "summary.json",
  ),
  batchSweepSummaryPath: path.join(
    repoRoot,
    "use-cases",
    "university",
    "scenarios",
    "target",
    "batch-sweep",
    "summary.json",
  ),
});
assertUniversityArtifactSummaryConforms(summary);

mkdirSync(targetDir, { recursive: true });
const jsonPath = path.join(targetDir, "summary.json");
const markdownPath = path.join(targetDir, "summary.md");
const manifestJsonPath = path.join(targetDir, "artifact-manifest.json");
const manifestMarkdownPath = path.join(targetDir, "artifact-manifest.md");
writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
writeFileSync(markdownPath, renderUniversityArtifactSummaryMarkdown(summary), "utf8");
writeFileSync(
  manifestJsonPath,
  `${JSON.stringify(summary.artifactManifest, null, 2)}\n`,
  "utf8",
);
writeFileSync(
  manifestMarkdownPath,
  renderUniversityArtifactManifestMarkdown(summary.artifactManifest),
  "utf8",
);
console.log(
  JSON.stringify(
    { jsonPath, markdownPath, manifestJsonPath, manifestMarkdownPath },
    null,
    2,
  ),
);
