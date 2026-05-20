#!/usr/bin/env node
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { lightTargetNames, targets } from "./run-target-catalog.mjs";

const repoRoot = new URL("../..", import.meta.url).pathname;

const runWithTimeout = (args, timeout = 5000) =>
  spawnSync(args[0], args.slice(1), {
    cwd: repoRoot,
    encoding: "utf8",
    timeout,
  });

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

const midnightTestDir = path.join(repoRoot, ".midnight-test");
const cleanupProbeDir = path.join(midnightTestDir, "run-target-catalog-probe");
const createdMidnightTestRoot = !existsSync(midnightTestDir);
const midnightDbDir = path.join(repoRoot, ".midnight-db");
const midnightDbProbeDir = path.join(midnightDbDir, "run-target-catalog-probe");
const createdMidnightDbRoot = !existsSync(midnightDbDir);
const legacyShellDir = path.join(repoRoot, "credentials-birth");
const legacyShellSrcDir = path.join(legacyShellDir, "src");
const legacyShellManagedDir = path.join(legacyShellSrcDir, "managed");
const createdLegacyShellRoot = !existsSync(legacyShellDir);
const movedPackageAreaShellDir = path.join(repoRoot, "core");
const movedPackageAreaShellSrcDir = path.join(movedPackageAreaShellDir, "src");
const movedPackageAreaShellManagedDir = path.join(
  movedPackageAreaShellSrcDir,
  "managed",
);
const createdMovedPackageAreaShellRoot = !existsSync(movedPackageAreaShellDir);
const createdMovedPackageAreaShellSrc = !existsSync(movedPackageAreaShellSrcDir);
const skippedLegacyShellDir = path.join(repoRoot, "credentials-openid");
const skippedLegacyShellProbe = path.join(
  skippedLegacyShellDir,
  `run-target-catalog-nondisposable-${process.pid}.txt`,
);
const createdSkippedLegacyShellRoot = !existsSync(skippedLegacyShellDir);
const vendorGeneratedProbeDir = path.join(
  repoRoot,
  "tooling",
  "vendor",
  "midnight-did",
  `run-target-catalog-generated-${process.pid}`,
);
const vendorGeneratedDistDir = path.join(vendorGeneratedProbeDir, "dist");

// Materialize local test-state directories so clean-artifacts coverage stays executable.
mkdirSync(cleanupProbeDir, { recursive: true });
mkdirSync(midnightDbProbeDir, { recursive: true });
// Materialize one old top-level shell so cleanup coverage stays executable.
// The probe must use a real legacy shell name because only known dead shells
// are eligible for cleanup. If this assertion fails locally, inspect the shell
// for non-disposable files left by older experiments.
mkdirSync(legacyShellManagedDir, { recursive: true });
// Materialize one package-area shell from the packages/ move.
mkdirSync(movedPackageAreaShellManagedDir, { recursive: true });
mkdirSync(skippedLegacyShellDir, { recursive: true });
writeFileSync(skippedLegacyShellProbe, "not generated\n");
mkdirSync(vendorGeneratedDistDir, { recursive: true });

try {
  const cleanArtifactsDryRun = runWithTimeout(
    ["./run.sh", "clean-artifacts", "--", "--dry-run", "--json"],
    20000,
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
    cleanArtifactsReport.removed.includes("core") ||
      cleanArtifactsReport.skippedDeadShells.includes("core"),
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
      path.relative(repoRoot, vendorGeneratedDistDir).split(path.sep).join("/"),
    ),
    "clean-artifacts dry-run JSON should not preserve generated vendor subdirectories",
  );
  assert.ok(
    cleanArtifactsReport.skippedDeadShells.includes("credentials-openid"),
    "clean-artifacts dry-run JSON should preserve non-disposable dead-shell candidates",
  );
} finally {
  rmSync(cleanupProbeDir, { recursive: true, force: true });
  if (createdMidnightTestRoot) {
    rmSync(midnightTestDir, { recursive: true, force: true });
  }
  rmSync(midnightDbProbeDir, { recursive: true, force: true });
  if (createdMidnightDbRoot) {
    rmSync(midnightDbDir, { recursive: true, force: true });
  }
  if (createdLegacyShellRoot) {
    rmSync(legacyShellDir, { recursive: true, force: true });
  }
  rmSync(movedPackageAreaShellManagedDir, { recursive: true, force: true });
  if (createdMovedPackageAreaShellSrc) {
    rmSync(movedPackageAreaShellSrcDir, { recursive: true, force: true });
  }
  if (createdMovedPackageAreaShellRoot) {
    rmSync(movedPackageAreaShellDir, { recursive: true, force: true });
  }
  rmSync(skippedLegacyShellProbe, { force: true });
  if (createdSkippedLegacyShellRoot) {
    rmSync(skippedLegacyShellDir, { recursive: true, force: true });
  }
  rmSync(vendorGeneratedProbeDir, { recursive: true, force: true });
}

console.log("run target catalog checks passed.");
