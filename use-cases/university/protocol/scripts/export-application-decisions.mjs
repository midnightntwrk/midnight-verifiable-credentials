import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  UniversityProtocolFlowRunner,
  buildUniversityProtocolApplicationDecisionsExport,
  renderUniversityProtocolApplicationDecisionsMarkdown,
} from "../dist/index.js";
import { resolveUniversityDataProfile } from "../../scripts/data-profile-registry.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const readableProfile = resolveUniversityDataProfile("readable-10");
const targetDir = path.join(
  repoRoot,
  "use-cases",
  "university",
  "protocol",
  "target",
  readableProfile.profileId,
);

const runner = new UniversityProtocolFlowRunner({
  dataPaths: {
    university: path.relative(
      repoRoot,
      path.join(readableProfile.absoluteOutputDir, "university.json"),
    ),
    students: path.relative(
      repoRoot,
      path.join(readableProfile.absoluteOutputDir, "students.json"),
    ),
    companies: path.relative(
      repoRoot,
      path.join(readableProfile.absoluteOutputDir, "companies.json"),
    ),
    mall: path.relative(
      repoRoot,
      path.join(readableProfile.absoluteOutputDir, "mall.json"),
    ),
    issuanceBatches: path.relative(
      repoRoot,
      path.join(readableProfile.absoluteOutputDir, "issuance-batches.json"),
    ),
    discountApplicants: path.relative(
      repoRoot,
      path.join(readableProfile.absoluteOutputDir, "discount-applicants.json"),
    ),
  },
});

const result = runner.runAll();
const exported = buildUniversityProtocolApplicationDecisionsExport(
  runner,
  result,
);
const markdown = renderUniversityProtocolApplicationDecisionsMarkdown(exported);

mkdirSync(targetDir, { recursive: true });
const jsonPath = path.join(targetDir, "application-decisions-export.json");
const markdownPath = path.join(targetDir, "application-decisions-export.md");
writeFileSync(jsonPath, `${JSON.stringify(exported, null, 2)}\n`, "utf8");
writeFileSync(markdownPath, markdown, "utf8");

console.log(JSON.stringify({ jsonPath, markdownPath }, null, 2));
