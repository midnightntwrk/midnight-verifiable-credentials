#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { stderr, stdout } from "node:process";

export const ciBuildCones = [
  {
    name: "foundation",
    inputPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/protocols/openid",
    ],
    outputPaths: [
      "packages/core/primitives/credentials/src/managed",
      "packages/core/primitives/credentials/dist",
      "packages/registry/status-registry/src/managed",
      "packages/registry/status-registry/dist",
      "packages/core/capabilities/same-holder/src/managed",
      "packages/core/capabilities/same-holder/dist",
      "packages/core/primitives/iso-registry/src/managed",
      "packages/core/primitives/iso-registry/dist",
      "packages/components/adapters/offchain-did/dist",
      "packages/protocols/openid/dist",
    ],
  },
  {
    name: "birth-family",
    inputPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/protocols/openid",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/prototypes/credential-families/hello-family",
      "packages/prototypes/credential-families/dummy-claims",
      "packages/prototypes/credential-families/mixed-claims",
      "packages/prototypes/credential-families/university-diploma",
    ],
    outputPaths: [
      "packages/prototypes/credential-families/birth/src/managed",
      "packages/prototypes/credential-families/birth/dist",
      "packages/prototypes/credential-families/birth-secret/src/managed",
      "packages/prototypes/credential-families/birth-secret/dist",
      "packages/prototypes/credential-families/hello-family/src/managed",
      "packages/prototypes/credential-families/hello-family/dist",
      "packages/prototypes/credential-families/dummy-claims/src/managed",
      "packages/prototypes/credential-families/dummy-claims/dist",
      "packages/prototypes/credential-families/mixed-claims/src/managed",
      "packages/prototypes/credential-families/mixed-claims/dist",
      "packages/prototypes/credential-families/university-diploma/src/managed",
      "packages/prototypes/credential-families/university-diploma/dist",
    ],
  },
  {
    name: "age-gate",
    inputPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/protocols/openid",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/prototypes/credential-families/hello-family",
      "packages/prototypes/credential-families/dummy-claims",
      "packages/prototypes/credential-families/mixed-claims",
      "packages/prototypes/credential-families/university-diploma",
      "packages/use-cases/age-gate/contract",
      "packages/use-cases/hello-verifier/contract",
    ],
    outputPaths: [
      "packages/use-cases/age-gate/contract/src/managed",
      "packages/use-cases/age-gate/contract/dist",
      "packages/use-cases/hello-verifier/contract/src/managed",
      "packages/use-cases/hello-verifier/contract/dist",
    ],
    turboOptions: ["--concurrency=1", "--ui=stream"],
  },
  {
    name: "protocol",
    inputPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/protocols/openid",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/use-cases/age-gate/contract",
      "packages/components/orchestration/protocol",
    ],
    outputPaths: ["packages/components/orchestration/protocol/dist"],
  },
];

export const ciBuildConeNames = ciBuildCones.map((cone) => cone.name);

export const ciBuildConeByName = new Map(
  ciBuildCones.map((cone) => [cone.name, cone]),
);

export const ownerForOutputPath = (outputPath) =>
  outputPath.replace(/\/(?:dist|src\/managed)$/u, "");

export const outputOwnersForCone = (cone) => [
  ...new Set(cone.outputPaths.map(ownerForOutputPath)),
];

export const buildConeCommandArgs = (cone) => [
  "run",
  "build",
  ...outputOwnersForCone(cone).map((owner) => `--filter=./${owner}`),
  "--continue",
  ...(cone.turboOptions ?? []),
];

export const buildConeScriptCommand = (name) =>
  `node ./tooling/scripts/ci-build-cone-catalog.mjs --exec-build ${name}`;

const requireCone = (name) => {
  const cone = ciBuildConeByName.get(name);
  if (!cone) {
    throw new Error(`Unknown CI build cone: ${name}`);
  }
  return cone;
};

const printLines = (lines) => {
  stdout.write(`${lines.join("\n")}\n`);
};

const checkCatalog = () => {
  const errors = [];
  const seenNames = new Set();
  const seenOutputOwners = new Map();

  for (const cone of ciBuildCones) {
    if (seenNames.has(cone.name)) {
      errors.push(`Duplicate CI build cone name: ${cone.name}`);
    }
    seenNames.add(cone.name);

    const inputSet = new Set(cone.inputPackages);
    if (inputSet.size !== cone.inputPackages.length) {
      errors.push(`CI build cone '${cone.name}' lists duplicate inputs`);
    }

    const outputOwnerSet = new Set(outputOwnersForCone(cone));

    for (const owner of outputOwnerSet) {
      if (!inputSet.has(owner)) {
        errors.push(
          `CI build cone '${cone.name}' output owner is missing from inputs: ${owner}`,
        );
      }

      const previousGroup = seenOutputOwners.get(owner);
      if (previousGroup) {
        errors.push(
          `CI build cone output owner '${owner}' is listed by both '${previousGroup}' and '${cone.name}'`,
        );
      }
      seenOutputOwners.set(owner, cone.name);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      stderr.write(`[ci-build-cone-catalog] ${error}\n`);
    }
    process.exit(1);
  }
};

const isDirectExecution =
  process.argv[1]?.endsWith("ci-build-cone-catalog.mjs") ?? false;

if (isDirectExecution) {
  const [command, value] = process.argv.slice(2);

  try {
    switch (command) {
      case "--json":
        stdout.write(`${JSON.stringify({ ciBuildCones }, null, 2)}\n`);
        break;
      case "--groups":
        printLines(ciBuildConeNames);
        break;
      case "--input-packages":
        printLines(requireCone(value).inputPackages);
        break;
      case "--output-paths":
        printLines(requireCone(value).outputPaths);
        break;
      case "--build-command":
        stdout.write(
          `turbo ${buildConeCommandArgs(requireCone(value)).join(" ")}\n`,
        );
        break;
      case "--script-command":
        stdout.write(`${buildConeScriptCommand(value)}\n`);
        break;
      case "--exec-build": {
        const result = spawnSync(
          "turbo",
          buildConeCommandArgs(requireCone(value)),
          {
            shell: process.platform === "win32",
            stdio: "inherit",
          },
        );
        process.exitCode = result.status ?? (result.signal ? 128 : 1);
        break;
      }
      case "--check":
        checkCatalog();
        stdout.write("[ci-build-cone-catalog] Catalog checks passed.\n");
        break;
      default:
        stderr.write(
          "Usage: ci-build-cone-catalog.mjs --groups | --input-packages <group> | --output-paths <group> | --exec-build <group> | --check | --json\n",
        );
        process.exit(command === undefined ? 0 : 1);
    }
  } catch (error) {
    stderr.write(`[ci-build-cone-catalog] ${error.message}\n`);
    process.exit(1);
  }
}
