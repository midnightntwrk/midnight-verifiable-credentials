import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const verifier = path.join(root, "tooling/scripts/verify-ci-build-outputs.sh");

const writeFixture = () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "verify-ci-build-outputs-"));
  const source = path.join(fixture, "packages/family/src/managed");
  const dist = path.join(fixture, "packages/family/dist/managed");
  mkdirSync(path.join(fixture, "tooling/scripts"), { recursive: true });
  mkdirSync(path.join(source, "family/contract"), { recursive: true });
  mkdirSync(path.join(source, "family/compiler"), { recursive: true });
  mkdirSync(path.join(dist, "family/contract"), { recursive: true });
  mkdirSync(path.join(dist, "family/compiler"), { recursive: true });
  writeFileSync(path.join(fixture, "tooling/scripts/ci-build-output-groups.sh"), `ci_build_output_groups() { printf '%s\\n' fixture; }
ci_build_output_paths() { printf '%s\\n' 'packages/family/src/managed'; }
`);
  writeFileSync(path.join(source, ".compact-artifact.json"), "{}\n");
  writeFileSync(path.join(source, "family/contract/index.js"), "generated\n");
  writeFileSync(path.join(source, "family/compiler/contract-info.json"), "metadata\n");
  writeFileSync(path.join(dist, "family/contract/index.js"), "generated\n");
  writeFileSync(path.join(dist, "family/compiler/contract-info.json"), "metadata\n");
  return { fixture, dist };
};

const verify = (fixture) => spawnSync("bash", [verifier, "fixture"], {
  cwd: fixture,
  env: { ...process.env, ROOT_DIR: fixture },
  encoding: "utf8",
});

test("allows managed dist mirrors to omit the internal Compact artifact manifest", () => {
  const { fixture, dist } = writeFixture();
  try {
    const passing = verify(fixture);
    assert.equal(passing.status, 0, passing.stderr);

    rmSync(path.join(dist, "family/contract/index.js"));
    const failing = verify(fixture);
    assert.notEqual(failing.status, 0);
    assert.match(failing.stderr, /Missing dist mirror file/u);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
