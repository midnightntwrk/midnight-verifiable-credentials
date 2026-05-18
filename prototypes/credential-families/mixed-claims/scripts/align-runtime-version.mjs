import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const require = createRequire(import.meta.url);
const runtimePackage = JSON.parse(
  await readFile(
    require.resolve("@midnight-ntwrk/compact-runtime/package.json"),
    "utf8",
  ),
);
const runtimeVersion = runtimePackage.version;
const targetFile = path.join(
  packageRoot,
  "src",
  "managed",
  "mixed-claims-credential",
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
