import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertUniversityArtifactSummaryConforms,
  buildUniversityArtifactSummary,
  renderUniversityArtifactManifestMarkdown,
  renderUniversityArtifactSummaryMarkdown,
  UNIVERSITY_REPORT_ARTIFACT_MANIFEST_JSON_PATH,
  UNIVERSITY_REPORT_ARTIFACT_MANIFEST_MARKDOWN_PATH,
  UNIVERSITY_REPORT_SUMMARY_JSON_PATH,
  UNIVERSITY_REPORT_SUMMARY_MARKDOWN_PATH,
} from "../dist/index.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "..",
);

const absoluteRepoPath = (portablePath) =>
  path.join(repoRoot, ...portablePath.split("/"));

const summary = buildUniversityArtifactSummary({
  artifactBaseDirectory: repoRoot,
  serenityDirectory: path.join(
    repoRoot,
    "packages",
    "use-cases",
    "university",
    "scenarios",
    "target",
    "site",
    "serenity",
  ),
  transcriptExportPath: path.join(
    repoRoot,
    "packages",
    "use-cases",
    "university",
    "protocol",
    "target",
    "readable-10",
    "transcript-export.json",
  ),
  stressSummaryPath: path.join(
    repoRoot,
    "packages",
    "use-cases",
    "university",
    "protocol",
    "target",
    "stress-100",
    "summary.json",
  ),
  batchSweepSummaryPath: path.join(
    repoRoot,
    "packages",
    "use-cases",
    "university",
    "scenarios",
    "target",
    "batch-sweep",
    "summary.json",
  ),
});
assertUniversityArtifactSummaryConforms(summary);

const jsonPath = absoluteRepoPath(UNIVERSITY_REPORT_SUMMARY_JSON_PATH);
const markdownPath = absoluteRepoPath(UNIVERSITY_REPORT_SUMMARY_MARKDOWN_PATH);
const manifestJsonPath = absoluteRepoPath(
  UNIVERSITY_REPORT_ARTIFACT_MANIFEST_JSON_PATH,
);
const manifestMarkdownPath = absoluteRepoPath(
  UNIVERSITY_REPORT_ARTIFACT_MANIFEST_MARKDOWN_PATH,
);
mkdirSync(path.dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
writeFileSync(
  markdownPath,
  renderUniversityArtifactSummaryMarkdown(summary),
  "utf8",
);
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
