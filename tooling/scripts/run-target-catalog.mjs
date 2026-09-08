#!/usr/bin/env node
import { stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const targets = [
  {
    name: "full",
    description: "Full repository validation pipeline (default).",
    category: "core",
    supportsLight: true,
  },
  {
    name: "lint",
    description: "Package-boundary checks and lint.",
    category: "core",
    supportsLight: false,
    script: "ci:lint",
  },
  {
    name: "typecheck",
    description: "TypeScript typecheck lanes.",
    category: "core",
    supportsLight: true,
    script: "ci:typecheck:from-artifacts",
    lightScript: "typecheck:light:from-artifacts",
  },
  {
    name: "build",
    description: "Build lanes.",
    category: "core",
    supportsLight: true,
    script: "build:all",
    lightScript: "build:light",
  },
  {
    name: "test",
    description: "Package test lanes.",
    category: "core",
    supportsLight: true,
    script: "test:all:from-artifacts",
    lightScript: "test:light:from-artifacts",
  },
  {
    name: "trusted-time-capability",
    description: "Validate the pinned Compact trusted-time capability surface.",
    category: "core",
    supportsLight: false,
    script: "test:trusted-time-capability",
  },
  {
    name: "conformance",
    description: "Validate the normative core manifest and conformance vectors.",
    category: "core",
    supportsLight: false,
    script: "test:core-conformance",
    fromArtifactsScript: "test:core-conformance:from-artifacts",
  },
  {
    name: "package",
    description: "Pack every dist-class workspace from the workspace catalog.",
    category: "release",
    supportsLight: false,
    script: "artifacts:pack",
  },
  {
    name: "clean-artifacts",
    description:
      "Remove generated build/test artifacts without deleting dependencies or local secrets.",
    category: "maintenance",
    supportsLight: false,
    releaseGate: false,
    script: "clean:artifacts",
  },
  {
    name: "integration-report",
    description:
      "Print DID npm cohort, direct dependency, and compatibility-alias status.",
    category: "maintenance",
    supportsLight: false,
    releaseGate: false,
    script: "report:did-integration",
  },
  {
    name: "check-integration",
    description:
      "Fail if DID npm dependencies or compatibility aliases are stale.",
    category: "maintenance",
    supportsLight: false,
    script: "check:did-integration",
  },
  {
    name: "targets",
    description: "Print this target list.",
    category: "help",
    supportsLight: false,
    releaseGate: false,
  },
  {
    name: "help",
    description: "Print this target list.",
    category: "help",
    supportsLight: false,
    releaseGate: false,
  },
];

export const targetNames = new Set(targets.map((target) => target.name));
export const lightTargetNames = targets
  .filter((target) => target.supportsLight)
  .map((target) => target.name);
const releaseGateOrder = new Map([
  ["lint", 0],
  ["build", 1],
  ["typecheck", 2],
  ["test", 3],
  ["trusted-time-capability", 4],
  ["package", 100],
]);
export const releaseGateTargets = targets
  .filter(
    (target) =>
      target.name !== "full" &&
      !target.requiresDocker &&
      target.releaseGate !== false,
  )
  .sort(
    (left, right) =>
      (releaseGateOrder.get(left.name) ?? 4) -
      (releaseGateOrder.get(right.name) ?? 4),
  );
export const releaseGateTargetNames = releaseGateTargets.map(
  (target) => target.name,
);
export const targetsByName = new Map(
  targets.map((target) => [target.name, target]),
);
export const targetScriptNames = [
  ...new Set(
    targets.flatMap((target) =>
      [target.script, target.lightScript, target.fromArtifactsScript].filter(
        Boolean,
      ),
    ),
  ),
].sort();

const categoryOrder = [
  "core",
  "release",
  "maintenance",
  "help",
];

const printRows = (rows) => {
  const width = Math.max(...rows.map(([name]) => name.length));
  for (const [name, description] of rows) {
    stdout.write(`  ${name.padEnd(width)}  ${description}\n`);
  }
};

const printLines = (lines) => stdout.write(`${lines.join("\n")}\n`);

export const printTargetList = () => {
  stdout.write("Targets:\n");
  for (const category of categoryOrder) {
    const categoryTargets = targets.filter(
      (target) => target.category === category,
    );
    if (categoryTargets.length === 0) {
      continue;
    }
    printRows(
      categoryTargets.map((target) => [target.name, target.description]),
    );
  }
};

export const printLightTargets = () => {
  stdout.write(`${lightTargetNames.join("\n")}\n`);
};

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const [command, value] = process.argv.slice(2);

if (isDirectExecution) {
  switch (command) {
    case "--json":
      stdout.write(`${JSON.stringify({ targets }, null, 2)}\n`);
      break;
    case "--scripts-json":
      stdout.write(
        `${JSON.stringify(
          {
            targetScripts: targets
              .filter(
                (target) =>
                  target.script ||
                  target.lightScript ||
                  target.fromArtifactsScript,
              )
              .map(({ name, script, lightScript, fromArtifactsScript }) => ({
                name,
                script,
                lightScript,
                fromArtifactsScript,
              })),
          },
          null,
          2,
        )}\n`,
      );
      break;
    case "--names":
      stdout.write(`${targets.map((target) => target.name).join("\n")}\n`);
      break;
    case "--has-target":
      process.exit(targetNames.has(value) ? 0 : 1);
      break;
    case "--light-targets":
      printLightTargets();
      break;
    case "--release-gate-targets":
      printLines(releaseGateTargetNames);
      break;
    case "--targets":
    case "--help":
    case undefined:
      printTargetList();
      break;
    default:
      console.error(`Unknown run target catalog command: ${command}`);
      process.exit(1);
  }
}
