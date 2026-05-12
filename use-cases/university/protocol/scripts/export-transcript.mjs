import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  UniversityProtocolFlowRunner,
  buildUniversityProtocolTranscriptExport,
  renderUniversityProtocolTranscriptMarkdown,
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
  "protocol",
  "target",
  "readable-10",
);

const runner = new UniversityProtocolFlowRunner();
const result = runner.runAll();
const exported = buildUniversityProtocolTranscriptExport(runner, result);
const markdown = renderUniversityProtocolTranscriptMarkdown(exported);

mkdirSync(targetDir, { recursive: true });
const jsonPath = path.join(targetDir, "transcript-export.json");
const markdownPath = path.join(targetDir, "transcript-export.md");
writeFileSync(jsonPath, `${JSON.stringify(exported, null, 2)}\n`, "utf8");
writeFileSync(markdownPath, markdown, "utf8");

console.log(JSON.stringify({ jsonPath, markdownPath }, null, 2));
