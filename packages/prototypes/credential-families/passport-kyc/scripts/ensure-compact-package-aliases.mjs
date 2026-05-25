import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { findRepoRoot } from "./find-repo-root.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = await findRepoRoot(packageRoot);
const helperPath = path.join(
  repoRoot,
  "tooling",
  "scripts",
  "ensure-compact-package-aliases.mjs",
);

await import(pathToFileURL(helperPath).href);
