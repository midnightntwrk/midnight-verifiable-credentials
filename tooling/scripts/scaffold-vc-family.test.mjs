import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const scaffold = path.join(root, "tooling/scripts/scaffold-vc-family.mjs");

test("scaffolded Compact packages use the artifact-first helper and omit its manifest from dist", () => {
  const target = path.join(root, "packages/prototypes/credential-families", `scaffold-${randomUUID().slice(0, 8)}`);
  const relativeTarget = path.relative(root, target);
  try {
    execFileSync(process.execPath, [scaffold, "--slug", "artifact-test", "--out", relativeTarget], { cwd: root, encoding: "utf8" });
    const packageJson = JSON.parse(readFileSync(path.join(target, "package.json"), "utf8"));

    assert.match(
      packageJson.scripts.compact,
      /node \.\.\/\.\.\/\.\.\/\.\.\/tooling\/scripts\/ensure-compact-artifacts\.mjs --manifest src\/managed\/\.compact-artifact\.json --source-root src --output src\/managed\/artifact-test-credential --recipe-input scripts\/strip-managed-sourcemaps\.mjs -- sh -c "compact compile[\s\S]*strip-managed-sourcemaps\.mjs"/u,
    );
    assert.match(packageJson.scripts.build, /rm -f \.\/dist\/managed\/\.compact-artifact\.json/u);
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
