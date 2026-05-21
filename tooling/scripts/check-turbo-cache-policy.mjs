#!/usr/bin/env node
import fs from "node:fs";
import { stderr, stdout } from "node:process";

const turbo = JSON.parse(fs.readFileSync("turbo.json", "utf8"));

const errors = [];

const requireArray = (owner, value) => {
  if (!Array.isArray(value)) {
    errors.push(`${owner} must be an array`);
    return [];
  }
  return value;
};

const requireIncludes = (owner, values, expected) => {
  const actual = requireArray(owner, values);
  for (const item of expected) {
    if (!actual.includes(item)) {
      errors.push(`${owner} must include '${item}'`);
    }
  }
};

const requireExactArray = (owner, values, expected) => {
  const actual = requireArray(owner, values);
  const missing = expected.filter((item) => !actual.includes(item));
  const extra = actual.filter((item) => !expected.includes(item));
  for (const item of missing) {
    errors.push(`${owner} must include '${item}'`);
  }
  for (const item of extra) {
    errors.push(`${owner} must not include unexpected '${item}'`);
  }
};

const requireOutputs = (taskName, expected) => {
  const task = turbo.tasks?.[taskName];
  if (!task) {
    errors.push(`tasks.${taskName} is missing`);
    return;
  }
  requireExactArray(`tasks.${taskName}.outputs`, task.outputs, expected);
};

const requireDependsOn = (taskName, expected) => {
  const task = turbo.tasks?.[taskName];
  if (!task) {
    errors.push(`tasks.${taskName} is missing`);
    return;
  }
  requireIncludes(`tasks.${taskName}.dependsOn`, task.dependsOn, expected);
};

const requireEnv = (taskName, expected) => {
  const task = turbo.tasks?.[taskName];
  if (!task) {
    errors.push(`tasks.${taskName} is missing`);
    return;
  }
  requireIncludes(`tasks.${taskName}.env`, task.env, expected);
};

requireIncludes("globalDependencies", turbo.globalDependencies, [
  "package.json",
  "package-lock.json",
  "turbo.json",
  "tsconfig*.json",
  ".nvmrc",
  ".github/workflows/*.yml",
  ".github/workflows/*.yaml",
  "tooling/scripts/**/*.mjs",
  "tooling/scripts/**/*.sh",
]);

requireIncludes("globalEnv", turbo.globalEnv, ["COMPACT_COMPILER_VERSION"]);

requireOutputs("lint", []);
requireOutputs("typecheck", []);
requireOutputs("build", ["dist/**", "src/managed/**", "*.tsbuildinfo"]);
requireOutputs("test", []);
requireOutputs("test:ci", []);

requireDependsOn("typecheck", ["build", "^build"]);
requireDependsOn("build", ["^build"]);
requireDependsOn("test", ["build"]);
requireDependsOn("test:ci", ["build"]);

requireEnv("lint", ["CI"]);
requireEnv("typecheck", ["CI"]);
requireEnv("build", ["COMPACT_COMPILER_VERSION"]);
requireEnv("test", [
  "CI",
  "COMPACT_COMPILER_VERSION",
  "PROOF_SERVER_IMAGE",
  "RUN_ENV_TESTS",
  "TEST_ENTRYPOINT",
  "TEST_ENV",
  "TEST_WALLET_SEED",
  "UNIVERSITY_PROTOCOL_PROFILE",
]);
requireEnv("test:ci", [
  "CI",
  "COMPACT_COMPILER_VERSION",
  "PROOF_SERVER_IMAGE",
  "RUN_ENV_TESTS",
  "TEST_ENTRYPOINT",
  "TEST_ENV",
  "TEST_WALLET_SEED",
  "UNIVERSITY_PROTOCOL_PROFILE",
]);

for (const [taskName, task] of Object.entries(turbo.tasks ?? {})) {
  if (task.cache === false) continue;
  if (!Object.hasOwn(task, "outputs")) {
    errors.push(`tasks.${taskName}.outputs must be explicit`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    stderr.write(`[check-turbo-cache-policy] ${error}\n`);
  }
  process.exit(1);
}

stdout.write("[check-turbo-cache-policy] Turbo cache policy checks passed.\n");
