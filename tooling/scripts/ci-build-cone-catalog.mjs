#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { stderr, stdout } from "node:process";
import { workspaceCatalog } from "./workspace-catalog.mjs";

const pnpmInvocation = (args) => {
  if (process.platform !== "win32") {
    return { command: "pnpm", args };
  }
  if (!process.env.npm_execpath) {
    throw new Error("Windows CI build cones must be invoked through pnpm");
  }
  return {
    command: process.execPath,
    args: [process.env.npm_execpath, ...args],
  };
};

const releaseBuildWorkspaces = workspaceCatalog
  .filter((entry) => entry.releaseTasks.includes("build"))
  .map((entry) => entry.path);

export const ciBuildCones = [
  {
    name: "foundation",
    inputPackages: [
      "packages/core/model",
      "packages/core/display",
      "packages/core/compact",
      "packages/core/proofs",
      "packages/core/status",
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/registry/status-midnight-contract",
      "packages/registry/status-midnight-verifier",
      "packages/registry/status-midnight-authority",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/components/adapters/credential-did-midnight",
      "packages/components/orchestration/exchange",
      "packages/protocols/openid",
    ],
    // Foundation packages include standalone prebuild hooks that can invoke
    // another foundation build. Serialize this cone so those hooks cannot
    // concurrently clean/write shared managed outputs.
    turboOptions: ["--concurrency=1", "--ui=stream"],
    outputPaths: [
      "packages/core/model/dist",
      "packages/core/display/dist",
      "packages/core/compact/src/managed",
      "packages/core/compact/dist",
      "packages/core/proofs/dist",
      "packages/core/status/dist",
      "packages/core/primitives/credentials/src/managed",
      "packages/core/primitives/credentials/dist",
      "packages/registry/status-registry/src/managed",
      "packages/registry/status-registry/dist",
      "packages/registry/status-midnight-contract/dist",
      "packages/registry/status-midnight-verifier/dist",
      "packages/registry/status-midnight-authority/dist",
      "packages/core/capabilities/same-holder/src/managed",
      "packages/core/capabilities/same-holder/dist",
      "packages/core/primitives/iso-registry/src/managed",
      "packages/core/primitives/iso-registry/dist",
      "packages/components/adapters/offchain-did/dist",
      "packages/components/adapters/credential-did-midnight/dist",
      "packages/components/orchestration/exchange/dist",
      "packages/protocols/openid/dist",
    ],
  },
  {
    name: "birth-family",
    inputPackages: [
      "packages/core/model",
      "packages/core/display",
      "packages/core/compact",
      "packages/core/proofs",
      "packages/core/status",
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/registry/status-midnight-contract",
      "packages/registry/status-midnight-verifier",
      "packages/registry/status-midnight-authority",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/components/adapters/credential-did-midnight",
      "packages/components/orchestration/exchange",
      "packages/protocols/openid",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/prototypes/credential-families/hello-family",
      "packages/prototypes/credential-families/dummy-claims",
      "packages/prototypes/credential-families/mixed-claims",
      "packages/prototypes/credential-families/university-diploma",
      "packages/prototypes/credential-families/digital-passport",
    ],
    // Family builds can pull in standalone foundation hooks (notably the
    // status-registry credentials preparation), so serialize shared outputs.
    turboOptions: ["--concurrency=1", "--ui=stream"],
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
      "packages/prototypes/credential-families/digital-passport/src/managed",
      "packages/prototypes/credential-families/digital-passport/dist",
    ],
  },
  {
    name: "age-gate",
    inputPackages: [
      "packages/core/model",
      "packages/core/display",
      "packages/core/compact",
      "packages/core/proofs",
      "packages/core/status",
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/registry/status-midnight-contract",
      "packages/registry/status-midnight-verifier",
      "packages/registry/status-midnight-authority",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/components/adapters/offchain-did",
      "packages/components/adapters/credential-did-midnight",
      "packages/components/orchestration/exchange",
      "packages/protocols/openid",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/prototypes/credential-families/hello-family",
      "packages/prototypes/credential-families/dummy-claims",
      "packages/prototypes/credential-families/mixed-claims",
      "packages/prototypes/credential-families/university-diploma",
      "packages/prototypes/credential-families/digital-passport",
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
    // This final cone owns every build output not assigned to the lower-level
    // foundation, family, or age-gate cones. Hash all release-build workspaces
    // because these downstream packages compose those lower-level surfaces.
    inputPackages: releaseBuildWorkspaces,
    outputPaths: [
      "packages/components/orchestration/protocol/dist",
      "packages/use-cases/university/contract/src/managed",
      "packages/use-cases/university/contract/dist",
      "packages/use-cases/university/protocol/dist",
      "packages/use-cases/university/reporting/dist",
      "packages/use-cases/status-openid/evidence/dist",
      "packages/components/integration/standalone-environment/dist",
    ],
    allowFocusedBuildScripts: true,
    turboOptions: ["--concurrency=1", "--ui=stream"],
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

export const requireCone = (name) => {
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

  const expectedBuildOwners = new Set(releaseBuildWorkspaces);
  for (const owner of expectedBuildOwners) {
    if (!seenOutputOwners.has(owner)) {
      errors.push(`Release build workspace has no CI build cone: ${owner}`);
    }
  }
  for (const owner of seenOutputOwners.keys()) {
    if (!expectedBuildOwners.has(owner)) {
      errors.push(`CI build cone owns a non-release build workspace: ${owner}`);
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
        const invocation = pnpmInvocation([
          "exec",
          "turbo",
          ...buildConeCommandArgs(requireCone(value)),
        ]);
        const result = spawnSync(invocation.command, invocation.args, {
          stdio: "inherit",
        });
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
