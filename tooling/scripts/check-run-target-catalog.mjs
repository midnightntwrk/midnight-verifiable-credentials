#!/usr/bin/env node
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  lightTargetNames,
  releaseGateTargetNames,
  releaseGateTargets,
  targetScriptNames,
  targets,
} from "./run-target-catalog.mjs";

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
const packageJson = JSON.parse(
  readFileSync(path.join(repoRoot, "package.json"), "utf8"),
);

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
assert.ok(
  targetNames.includes("package"),
  "runner target catalog must include package",
);
assert.deepEqual(
  [...lightTargetNames].sort(),
  targets
    .filter((target) => target.supportsLight)
    .map((target) => target.name)
    .sort(),
  "light target names must match catalog supportsLight flags",
);
assert.ok(
  releaseGateTargetNames.includes("package"),
  "non-Docker release gate must include package",
);
assert.ok(
  releaseGateTargetNames.includes("check-integration"),
  "non-Docker release gate must include integration wiring validation",
);
assert.ok(
  !releaseGateTargetNames.includes("clean-artifacts") &&
    !releaseGateTargetNames.includes("integration-report"),
  "non-validation maintenance commands must stay outside the release gate",
);
assert.ok(
  releaseGateTargets.every((target) => !target.requiresDocker),
  "non-Docker release gate must exclude Docker targets",
);
assert.deepEqual(
  [...releaseGateTargetNames].sort(),
  targets
    .filter(
      (target) =>
        target.name !== "full" &&
        !target.requiresDocker &&
        target.releaseGate !== false,
    )
    .map((target) => target.name)
    .sort(),
  "release gate targets must include every cataloged validation target that does not require Docker",
);
assert.deepEqual(
  releaseGateTargetNames.slice(0, 4),
  ["lint", "build", "typecheck", "test"],
  "release gate must build once before artifact-backed typecheck and tests",
);
assert.equal(
  releaseGateTargetNames.at(-1),
  "package",
  "release gate must package only after validation targets pass",
);
// `full` is a meta-target that delegates to run-credentials.sh instead of a
// single root package script.
assert.ok(
  targets.every(
    (target) =>
      target.name === "full" || target.category !== "core" || target.script,
  ),
  "core runner targets other than full must declare their root package script",
);
for (const scriptName of targetScriptNames) {
  assert.ok(
    packageJson.scripts?.[scriptName],
    `runner target catalog references missing root package script '${scriptName}'`,
  );
}

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

const releaseGateList = runWithTimeout([
  "bash",
  "-lc",
  "source ./tooling/scripts/run-common.sh; run_common_print_release_gate_targets",
]);
assert.equal(
  releaseGateList.status,
  0,
  "run_common_print_release_gate_targets should exit successfully",
);
assert.equal(
  releaseGateList.stdout.trim(),
  releaseGateTargetNames.join(", "),
  "run-common release targets must match the catalog",
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

const unknownTarget = runWithTimeout(["./run.sh", "not-a-real-target"]);
assert.notEqual(unknownTarget.status, 0, "unknown runner targets must fail");
assert.match(unknownTarget.stderr, /Unknown target/u);

const unknownOption = runWithTimeout(["./run.sh", "--not-a-real-option"]);
assert.notEqual(unknownOption.status, 0, "unknown runner options must fail");
assert.match(unknownOption.stderr, /Unknown option/u);

const unexpectedArgument = runWithTimeout(["./run.sh", "help", "extra"]);
assert.notEqual(
  unexpectedArgument.status,
  0,
  "runner arguments before -- must fail",
);
assert.match(unexpectedArgument.stderr, /Unexpected argument/u);

const discardedForwardArgument = runWithTimeout([
  "./run.sh",
  "lint",
  "--",
  "--not-consumed",
]);
assert.notEqual(
  discardedForwardArgument.status,
  0,
  "wrapper targets must reject forwarded arguments they cannot consume",
);
assert.match(discardedForwardArgument.stderr, /does not accept/u);

const directWrapperOption = runWithTimeout([
  "./run-credentials.sh",
  "--not-a-real-option",
]);
assert.notEqual(
  directWrapperOption.status,
  0,
  "direct credentials runner options must be validated",
);

const standaloneWrapperOption = runWithTimeout([
  "./run-credentials-standalone.sh",
  "--not-a-real-option",
]);
assert.notEqual(
  standaloneWrapperOption.status,
  0,
  "standalone runner must reject arguments",
);

const failClosedFixtureRoot = mkdtempSync(
  path.join(tmpdir(), "vc-run-target-catalog-fail-closed-"),
);
try {
  for (const relativePath of [
    "tooling/scripts/run-common.sh",
    "tooling/scripts/pack-artifacts.sh",
  ]) {
    copyFixtureFile(failClosedFixtureRoot, relativePath);
  }
  const fixtureCatalogPath = path.join(
    failClosedFixtureRoot,
    "tooling/scripts/run-target-catalog.mjs",
  );
  const fixtureWorkspaceCatalogPath = path.join(
    failClosedFixtureRoot,
    "tooling/scripts/workspace-catalog.mjs",
  );
  writeFileSync(fixtureCatalogPath, "process.exit(23);\n");
  writeFileSync(fixtureWorkspaceCatalogPath, "process.exit(24);\n");

  const fixtureGitInit = runWithTimeout(
    ["git", "init", "--quiet"],
    5000,
    failClosedFixtureRoot,
  );
  assert.equal(fixtureGitInit.status, 0, "fail-closed fixture git init");

  const brokenRunnerCatalog = runWithTimeout(
    ["bash", "-c", "source ./tooling/scripts/run-common.sh"],
    5000,
    failClosedFixtureRoot,
  );
  assert.notEqual(
    brokenRunnerCatalog.status,
    0,
    "runner setup must fail when its target catalog cannot load",
  );

  const brokenWorkspaceCatalog = runWithTimeout(
    [
      "bash",
      "./tooling/scripts/pack-artifacts.sh",
      path.join(failClosedFixtureRoot, "artifacts"),
    ],
    5000,
    failClosedFixtureRoot,
  );
  assert.notEqual(
    brokenWorkspaceCatalog.status,
    0,
    "packaging must fail when its workspace catalog cannot load",
  );

  writeFileSync(
    fixtureWorkspaceCatalogPath,
    'console.log("packages/example");\n',
  );
  const fixtureBinDir = path.join(failClosedFixtureRoot, "bin");
  const fixturePnpmPath = path.join(fixtureBinDir, "pnpm");
  mkdirSync(fixtureBinDir, { recursive: true });
  writeFileSync(fixturePnpmPath, "#!/usr/bin/env bash\nexit 0\n");
  chmodSync(fixturePnpmPath, 0o755);

  const missingTarball = runWithTimeout(
    [
      "env",
      `PATH=${fixtureBinDir}:${process.env.PATH}`,
      "bash",
      "./tooling/scripts/pack-artifacts.sh",
      path.join(failClosedFixtureRoot, "artifacts"),
    ],
    5000,
    failClosedFixtureRoot,
  );
  assert.notEqual(
    missingTarball.status,
    0,
    "packaging must fail when a successful pack command produces no tarball",
  );
  assert.match(missingTarball.stderr, /Expected 1 tarballs, found 0/u);
} finally {
  rmSync(failClosedFixtureRoot, { recursive: true, force: true });
}

const integrationReportJsonResult = runWithTimeout([
  "node",
  "./tooling/scripts/report-did-integration.mjs",
  "--json",
]);
assert.equal(
  integrationReportJsonResult.status,
  0,
  "DID integration JSON report should exit successfully",
);
const integrationReportJson = JSON.parse(integrationReportJsonResult.stdout);
assert.deepEqual(
  integrationReportJson.didIntegrationModes.map((mode) => mode.name),
  ["sibling checkout", "package-root Git tags", "published packages"],
  "DID integration JSON report should include supported mode names",
);
assert.deepEqual(
  integrationReportJson.didIntegrationRepairFlow,
  [
    "publish package-root Git tags from the matching midnight-did release tarballs when package versions change",
    "update root pnpm overrides to the matching midnight-did package-root Git tags",
    "keep the resolver-owned secret-storage tarball refreshed only when secret-storage changes",
    "re-run ./run.sh integration-report, then ./run.sh check-integration",
  ],
  "DID integration JSON report should include repair-flow guidance",
);

const universityReportContractResult = runWithTimeout(
  ["./run.sh", "university-report-contract"],
  30000,
);
assert.equal(
  universityReportContractResult.status,
  0,
  "university-report-contract target should exit successfully",
);
const universityReportContract = JSON.parse(
  universityReportContractResult.stdout,
);
assert.equal(
  universityReportContract.schemaId,
  "midnight-university-report-summary",
  "university-report-contract target should expose the report schema id",
);
assert.equal(
  universityReportContract.schemaVersion,
  "midnight-university-report-summary.v5",
  "university-report-contract target should expose the current report schema version",
);
assert.deepEqual(
  universityReportContract.requiredPrivacyProfileArrays,
  [
    "productionPublicClaimFields",
    "productionCommitmentCandidates",
    "productionCommitmentFields",
    "predicateOnlyFields",
  ],
  "university-report-contract target should expose privacy-profile arrays",
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
const legacyShellDir = path.join(
  cleanArtifactsFixtureRoot,
  "credentials-birth",
);
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

  // clean-artifacts reads `git ls-files`, so staged files are enough to model
  // tracked vendor tarballs without committing inside the disposable fixture.
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
