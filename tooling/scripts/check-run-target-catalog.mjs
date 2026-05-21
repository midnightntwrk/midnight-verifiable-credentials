#!/usr/bin/env node
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { lightTargetNames, targets } from "./run-target-catalog.mjs";

const repoRoot = new URL("../..", import.meta.url).pathname;

const runWithTimeout = (args, timeout = 5000, cwd = repoRoot) =>
  spawnSync(args[0], args.slice(1), {
    cwd,
    encoding: "utf8",
    timeout,
  });

const copyFixtureFile = (fixtureRoot, relativePath) => {
  const destination = path.join(fixtureRoot, relativePath);

  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(path.join(repoRoot, relativePath), destination);
};

const toPosixRelative = (root, absolutePath) =>
  path.relative(root, absolutePath).split(path.sep).join("/");

const targetNames = targets.map((target) => target.name);
const duplicateTargetNames = targetNames.filter(
  (name, index) => targetNames.indexOf(name) !== index,
);
const lightTargets = lightTargetNames;

assert.deepEqual(
  duplicateTargetNames,
  [],
  "runner target catalog must not contain duplicate targets",
);
assert.ok(
  targetNames.includes("full"),
  "runner target catalog must include full",
);
assert.ok(
  targetNames.includes("clean-artifacts"),
  "runner target catalog must include clean-artifacts",
);
assert.ok(
  targetNames.includes("check-integration"),
  "runner target catalog must include check-integration",
);
assert.deepEqual(
  [...lightTargetNames].sort(),
  targets
    .filter((target) => target.supportsLight)
    .map((target) => target.name)
    .sort(),
  "light target names must match catalog supportsLight flags",
);

const help = runWithTimeout(["./run.sh", "help", "--light"]);
assert.equal(help.status, 0, "help --light should exit successfully");
assert.ok(
  !help.stderr.includes("[run] Warning:"),
  "help --light should not warn",
);

for (const targetName of targetNames) {
  assert.ok(
    help.stdout.includes(targetName),
    `help output should include target '${targetName}'`,
  );
}

const lightList = runWithTimeout([
  "bash",
  "-lc",
  "source ./tooling/scripts/run-common.sh; run_common_print_light_targets",
]);
assert.equal(
  lightList.status,
  0,
  "run_common_print_light_targets should exit successfully",
);
assert.equal(
  lightList.stdout.trim(),
  lightTargets.join(", "),
  "run-common light targets must match the catalog",
);

const supportedLightProbe = runWithTimeout([
  "bash",
  "-lc",
  "source ./tooling/scripts/run-common.sh; run_common_target_supports_light build",
]);
assert.equal(
  supportedLightProbe.status,
  0,
  "build should be a light-supported target",
);

const unsupportedLightProbe = runWithTimeout([
  "bash",
  "-lc",
  "source ./tooling/scripts/run-common.sh; run_common_target_supports_light lint",
]);
assert.notEqual(
  unsupportedLightProbe.status,
  0,
  "lint should not be a light-supported target",
);

const targetsResult = runWithTimeout(["./run.sh", "targets", "--light"]);
assert.equal(
  targetsResult.status,
  0,
  "targets --light should exit successfully",
);
assert.ok(
  !targetsResult.stderr.includes("[run] Warning:"),
  "targets --light should not warn",
);

const cleanArtifactsFixtureRoot = mkdtempSync(
  path.join(tmpdir(), "vc-run-target-catalog-clean-artifacts-"),
);
const cleanupProbeDir = path.join(
  cleanArtifactsFixtureRoot,
  ".midnight-test",
  "run-target-catalog-probe",
);
const midnightDbProbeDir = path.join(
  cleanArtifactsFixtureRoot,
  ".midnight-db",
  "run-target-catalog-probe",
);
const legacyShellDir = path.join(cleanArtifactsFixtureRoot, "credentials-birth");
const legacyShellSrcDir = path.join(legacyShellDir, "src");
const legacyShellManagedDir = path.join(legacyShellSrcDir, "managed");
const movedPackageAreaShellDir = path.join(cleanArtifactsFixtureRoot, "core");
const movedPackageAreaShellSrcDir = path.join(movedPackageAreaShellDir, "src");
const movedPackageAreaShellManagedDir = path.join(
  movedPackageAreaShellSrcDir,
  "managed",
);
const skippedMovedPackageAreaShellDir = path.join(
  cleanArtifactsFixtureRoot,
  "libs",
);
const skippedMovedPackageAreaShellProbe = path.join(
  skippedMovedPackageAreaShellDir,
  `run-target-catalog-nondisposable-${process.pid}.txt`,
);
const skippedLegacyShellDir = path.join(
  cleanArtifactsFixtureRoot,
  "credentials-openid",
);
const skippedLegacyShellProbe = path.join(
  skippedLegacyShellDir,
  `run-target-catalog-nondisposable-${process.pid}.txt`,
);
const vendorTarballPath = path.join(
  cleanArtifactsFixtureRoot,
  "tooling",
  "vendor",
  "midnight-did",
  `run-target-catalog-vendor-${process.pid}.tgz`,
);
const vendorGeneratedProbeDir = path.join(
  cleanArtifactsFixtureRoot,
  "tooling",
  "vendor",
  "midnight-did",
  `run-target-catalog-generated-${process.pid}`,
);
const vendorGeneratedDistDir = path.join(vendorGeneratedProbeDir, "dist");

try {
  for (const relativePath of [
    "run.sh",
    "tooling/scripts/run-common.sh",
    "tooling/scripts/run-target-catalog.mjs",
    "tooling/scripts/ensure-node-24.mjs",
    "tooling/scripts/clean-artifacts.mjs",
    "tooling/scripts/compatibility-aliases.mjs",
  ]) {
    copyFixtureFile(cleanArtifactsFixtureRoot, relativePath);
  }
  chmodSync(path.join(cleanArtifactsFixtureRoot, "run.sh"), 0o755);

  const fixtureGitInit = runWithTimeout(
    ["git", "init", "--quiet"],
    5000,
    cleanArtifactsFixtureRoot,
  );
  assert.equal(fixtureGitInit.status, 0, "clean-artifacts fixture git init");

  // Materialize local test-state directories inside a disposable git fixture so
  // the checker never creates historical package shells in the real repo root.
  mkdirSync(cleanupProbeDir, { recursive: true });
  mkdirSync(midnightDbProbeDir, { recursive: true });
  // Materialize one old top-level shell so cleanup coverage stays executable.
  // The probe must use a real legacy shell name because only known dead shells
  // are eligible for cleanup. If this assertion fails locally, inspect the shell
  // for non-disposable files left by older experiments.
  mkdirSync(legacyShellManagedDir, { recursive: true });
  // Materialize one package-area shell from the packages/ move.
  mkdirSync(movedPackageAreaShellManagedDir, { recursive: true });
  mkdirSync(skippedMovedPackageAreaShellDir, { recursive: true });
  writeFileSync(skippedMovedPackageAreaShellProbe, "not generated\n");
  mkdirSync(skippedLegacyShellDir, { recursive: true });
  writeFileSync(skippedLegacyShellProbe, "not generated\n");
  mkdirSync(path.dirname(vendorTarballPath), { recursive: true });
  writeFileSync(vendorTarballPath, "tracked vendor tarball placeholder\n");
  mkdirSync(vendorGeneratedDistDir, { recursive: true });

  const fixtureGitAdd = runWithTimeout(
    [
      "git",
      "add",
      "--",
      toPosixRelative(cleanArtifactsFixtureRoot, vendorTarballPath),
    ],
    5000,
    cleanArtifactsFixtureRoot,
  );
  assert.equal(
    fixtureGitAdd.status,
    0,
    "clean-artifacts fixture should stage tracked vendor tarballs",
  );

  const cleanArtifactsDryRun = runWithTimeout(
    ["./run.sh", "clean-artifacts", "--", "--dry-run", "--json"],
    20000,
    cleanArtifactsFixtureRoot,
  );
  assert.equal(
    cleanArtifactsDryRun.status,
    0,
    "clean-artifacts dry-run JSON should exit successfully",
  );

  const cleanArtifactsReport = JSON.parse(cleanArtifactsDryRun.stdout);
  assert.equal(
    cleanArtifactsReport.dryRun,
    true,
    "clean-artifacts dry-run JSON should report dryRun=true",
  );
  assert.ok(
    cleanArtifactsReport.removed.includes(".midnight-test"),
    "clean-artifacts dry-run JSON should include .midnight-test cleanup coverage",
  );
  assert.ok(
    cleanArtifactsReport.removed.includes(".midnight-db"),
    "clean-artifacts dry-run JSON should include .midnight-db cleanup coverage",
  );
  assert.ok(
    cleanArtifactsReport.removed.includes("credentials-birth"),
    "clean-artifacts dry-run JSON should include legacy package-shell cleanup coverage",
  );
  assert.ok(
    cleanArtifactsReport.removed.includes("core"),
    "clean-artifacts dry-run JSON should include post-move package-area shell cleanup coverage",
  );
  assert.ok(
    cleanArtifactsReport.skippedPreserved.some((relativePath) =>
      relativePath.startsWith("tooling/vendor/midnight-did/"),
    ),
    "clean-artifacts dry-run JSON should explicitly preserve vendor tarballs",
  );
  assert.ok(
    cleanArtifactsReport.removed.includes(
      toPosixRelative(cleanArtifactsFixtureRoot, vendorGeneratedDistDir),
    ),
    "clean-artifacts dry-run JSON should not preserve generated vendor subdirectories",
  );
  assert.ok(
    cleanArtifactsReport.skippedDeadShells.includes("credentials-openid"),
    "clean-artifacts dry-run JSON should preserve non-disposable dead-shell candidates",
  );
  assert.ok(
    cleanArtifactsReport.skippedDeadShells.includes("libs"),
    "clean-artifacts dry-run JSON should preserve non-disposable post-move package-area shells",
  );
} finally {
  rmSync(cleanArtifactsFixtureRoot, { recursive: true, force: true });
}

console.log("run target catalog checks passed.");
