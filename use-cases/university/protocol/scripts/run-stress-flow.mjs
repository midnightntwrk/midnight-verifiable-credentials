import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildUniversityProtocolStressSummary,
  renderUniversityProtocolStressSummaryMarkdown,
  UniversityProtocolFlowRunner,
} from "../dist/testing.js";
import { resolveUniversityDataProfile } from "../../scripts/data-profile-registry.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const stressProfile = resolveUniversityDataProfile("stress-100");
const stressDataDir = stressProfile.absoluteOutputDir;

const targetDir = path.join(
  repoRoot,
  "use-cases",
  "university",
  "protocol",
  "target",
  stressProfile.profileId,
);

const dataPaths = {
  university: path.relative(repoRoot, path.join(stressDataDir, "university.json")),
  students: path.relative(repoRoot, path.join(stressDataDir, "students.json")),
  companies: path.relative(repoRoot, path.join(stressDataDir, "companies.json")),
  mall: path.relative(repoRoot, path.join(stressDataDir, "mall.json")),
  issuanceBatches: path.relative(
    repoRoot,
    path.join(stressDataDir, "issuance-batches.json"),
  ),
  discountApplicants: path.relative(
    repoRoot,
    path.join(stressDataDir, "discount-applicants.json"),
  ),
};

const startedAt = performance.now();
const runner = new UniversityProtocolFlowRunner({ dataPaths });
const result = runner.runAll();
const wallClockMs = performance.now() - startedAt;

const summary = buildUniversityProtocolStressSummary(runner, result, wallClockMs);
const markdown = renderUniversityProtocolStressSummaryMarkdown(summary);

mkdirSync(targetDir, { recursive: true });
const summaryPath = path.join(targetDir, "summary.json");
const markdownPath = path.join(targetDir, "summary.md");
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
writeFileSync(markdownPath, markdown, "utf8");

console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote stress summary to ${summaryPath}`);
console.log(`Wrote stress markdown to ${markdownPath}`);
