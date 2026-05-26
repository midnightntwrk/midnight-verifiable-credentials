import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { findRepoRoot } from "./find-repo-root.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = await findRepoRoot(packageRoot);
const runtimePackage = JSON.parse(
  await readFile(
    path.join(
      repoRoot,
      "node_modules",
      "@midnight-ntwrk",
      "compact-runtime",
      "package.json",
    ),
    "utf8",
  ),
);
const runtimeVersion = runtimePackage.version;
const targetFile = path.join(
  packageRoot,
  "src",
  "managed",
  "digital-passport-credential",
  "contract",
  "index.js",
);
const source = await readFile(targetFile, "utf8");
const next = source.replace(
  /checkRuntimeVersion\('\d+\.\d+\.\d+'\);/,
  "checkRuntimeVersion('" + runtimeVersion + "');",
);
if (next !== source) {
  await writeFile(targetFile, next, "utf8");
}
