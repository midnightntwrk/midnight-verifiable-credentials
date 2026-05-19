#!/usr/bin/env node
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { lightTargetNames, targets } from "./run-target-catalog.mjs";

const repoRoot = new URL("../..", import.meta.url).pathname;

const runWithTimeout = (args, timeout = 5000) =>
  spawnSync(args[0], args.slice(1), {
    cwd: repoRoot,
    encoding: "utf8",
    timeout,
  });

const targetNames = targets.map((target) => target.name);
const duplicateTargetNames = targetNames.filter((name, index) => targetNames.indexOf(name) !== index);
const lightTargets = lightTargetNames;

assert.deepEqual(duplicateTargetNames, [], "runner target catalog must not contain duplicate targets");
assert.ok(targetNames.includes("full"), "runner target catalog must include full");
assert.ok(targetNames.includes("clean-artifacts"), "runner target catalog must include clean-artifacts");
assert.ok(targetNames.includes("check-integration"), "runner target catalog must include check-integration");
assert.deepEqual(
  [...lightTargetNames].sort(),
  targets.filter((target) => target.supportsLight).map((target) => target.name).sort(),
  "light target names must match catalog supportsLight flags",
);

const help = runWithTimeout(["./run.sh", "help", "--light"]);
assert.equal(help.status, 0, "help --light should exit successfully");
assert.ok(!help.stderr.includes("[run] Warning:"), "help --light should not warn");

for (const targetName of targetNames) {
  assert.ok(help.stdout.includes(targetName), `help output should include target '${targetName}'`);
}

const lightList = runWithTimeout([
  "bash",
  "-lc",
  "source ./tooling/scripts/run-common.sh; run_common_print_light_targets",
]);
assert.equal(lightList.status, 0, "run_common_print_light_targets should exit successfully");
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
assert.equal(supportedLightProbe.status, 0, "build should be a light-supported target");

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
assert.equal(targetsResult.status, 0, "targets --light should exit successfully");
assert.ok(!targetsResult.stderr.includes("[run] Warning:"), "targets --light should not warn");

console.log("run target catalog checks passed.");
