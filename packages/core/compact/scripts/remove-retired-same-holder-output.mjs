import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const manifestPath = resolve(
  packageRoot,
  "src/managed/.compact-artifact.json",
);

rmSync(resolve(packageRoot, "src/managed/same-holder"), {
  recursive: true,
  force: true,
});

if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.outputs?.includes("src/managed/same-holder")) {
      rmSync(manifestPath, { force: true });
    }
  } catch {
    // The artifact owner resets malformed manifests.
  }
}
