#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildConeScriptCommand,
  ciBuildConeNames,
  outputOwnersForCone,
  requireCone,
} from "./ci-build-cone-catalog.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const dedupe = (values) => [...new Set(values)];
const coneInputPackages = (name) => [...requireCone(name).inputPackages];
const coneOutputOwners = (name) => outputOwnersForCone(requireCone(name));
const unionOfConeInputs = (...names) =>
  dedupe(names.flatMap((name) => coneInputPackages(name)));

const foundationPackages = coneOutputOwners("foundation");
const familyPackages = coneOutputOwners("birth-family");
const ageGatePackages = coneOutputOwners("age-gate");
const protocolPackages = coneOutputOwners("protocol");
const lightConePackages = unionOfConeInputs("birth-family");
const ageGateConePackages = unionOfConeInputs("age-gate");

export const profileDefinitions = {
  "managed-light": {
    buildCommand: "npm run build:light",
    ciBuildCones: ["foundation", "birth-family"],
    managedPackages: [...foundationPackages, ...familyPackages],
  },
  "managed-all": {
    buildCommand: "npm run build:all",
    ciBuildCones: ["age-gate"],
    extends: ["managed-light"],
    managedPackages: ageGatePackages,
  },
  "managed-revocation": {
    buildCommand: "npm run build:revocation",
    managedPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/use-cases/age-gate/contract",
    ],
  },
  "managed-hello-smoke": {
    buildCommand: "npm run build:starter-smoke-prereqs",
    // This smoke readiness profile is narrower than the build cones: it checks
    // only artifacts consumed by the hello lane after the cone build runs.
    managedPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/core/primitives/iso-registry",
      "packages/prototypes/credential-families/hello-family",
      "packages/use-cases/hello-verifier/contract",
    ],
  },
  "managed-dummy-claims-lab": {
    buildCommand: "npm run build:dummy-claims-lab-prereqs",
    extends: ["managed-hello-smoke"],
    managedPackages: ["packages/prototypes/credential-families/dummy-claims"],
  },
  "managed-university-protocol": {
    buildCommand: "npm run build:university-protocol:prereqs",
    outputs: [
      output("packages/components/orchestration/protocol/dist/index.js", [
        "packages/components/orchestration/protocol/src",
        "packages/components/orchestration/protocol/package.json",
      ]),
      output("packages/prototypes/credential-families/university-diploma/dist/testing.js", [
        "packages/prototypes/credential-families/university-diploma/src",
        "packages/prototypes/credential-families/university-diploma/package.json",
      ]),
      output("packages/use-cases/university/contract/dist/testing.js", [
        "packages/use-cases/university/contract/src",
        "packages/use-cases/university/contract/package.json",
      ]),
    ],
  },
  "managed-university-protocol-export": {
    buildCommand: "npm run build:university-protocol:export:prereqs",
    extends: ["managed-university-protocol"],
    outputs: [
      output("packages/use-cases/university/protocol/dist/index.js", [
        "packages/use-cases/university/protocol/src",
        "packages/use-cases/university/protocol/package.json",
      ]),
    ],
  },
  "managed-university-protocol-stress": {
    buildCommand: "npm run build:university-protocol-stress:prereqs",
    extends: ["managed-university-protocol-export"],
    outputs: [
      output("packages/use-cases/university/data/stress-100/students.json", [
        "packages/use-cases/university/scripts",
        "packages/use-cases/university/data",
      ]),
      output("packages/use-cases/university/data/stress-100/issuance-batches.json", [
        "packages/use-cases/university/scripts",
        "packages/use-cases/university/data",
      ]),
    ],
  },
  "managed-university-protocol-cohort": {
    buildCommand: "npm run build:university-protocol-cohort:prereqs",
    extends: ["managed-university-protocol-export"],
    outputs: [
      output("packages/use-cases/university/data/cohort-30/students.json", [
        "packages/use-cases/university/scripts",
        "packages/use-cases/university/data",
      ]),
      output("packages/use-cases/university/data/cohort-30/issuance-batches.json", [
        "packages/use-cases/university/scripts",
        "packages/use-cases/university/data",
      ]),
    ],
  },
  "managed-university-summary": {
    buildCommand: "npm run build:university-summary:prereqs",
    extends: ["managed-university-protocol-stress"],
    outputs: [
      output("packages/use-cases/university/scenarios/target/site/serenity/index.html", [], {
        freshness: false,
      }),
      output("packages/use-cases/university/scenarios/target/batch-sweep/summary.json", [], {
        freshness: false,
      }),
    ],
    customReady: () => {
      const serenityRoot = path.join(
        repoRoot,
        "packages/use-cases/university/scenarios/target/site/serenity",
      );
      return (
        existsSync(serenityRoot) &&
        readdirSync(serenityRoot).some((entry) => entry.endsWith(".json"))
      );
    },
  },
  light: {
    buildCommand: "npm run build:light",
    ciBuildCones: ["foundation", "birth-family"],
    distPackages: lightConePackages,
  },
  all: {
    buildCommand: "npm run build:all",
    ciBuildCones: ["age-gate", "protocol"],
    extends: ["light"],
    distPackages: [...ageGatePackages, ...protocolPackages],
  },
  revocation: {
    buildCommand: "npm run build:revocation",
    distPackages: [
      "packages/core/primitives/credentials",
      "packages/registry/status-registry",
      "packages/core/capabilities/same-holder",
      "packages/prototypes/credential-families/birth",
      "packages/prototypes/credential-families/birth-secret",
      "packages/use-cases/age-gate/contract",
    ],
  },
  "integration-demo-contract": {
    buildCommand: "npm run build:integration-prereqs:demo-contract",
    ciBuildCones: ["foundation", "birth-family", "age-gate"],
    distPackages: ageGateConePackages,
  },
  "integration-protocol": {
    buildCommand: "npm run build:integration-prereqs:protocol",
    ciBuildCones: ["protocol"],
    extends: ["integration-demo-contract"],
    distPackages: protocolPackages,
  },
};

const managedOutputOverrides = {
  "packages/core/capabilities/same-holder": ["src/managed/same-holder/contract/index.js"],
  "packages/core/primitives/iso-registry": ["src/managed/iso-registry/contract/index.js"],
};

function output(relativePath, inputs, options = {}) {
  return {
    path: relativePath,
    inputs,
    freshness: options.freshness ?? true,
  };
}

const readJson = (relativePath) => JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));

const packageJson = (packagePath) => readJson(path.join(packagePath, "package.json"));

const packageSourceInputs = (packagePath) => [
  `${packagePath}/src`,
  `${packagePath}/package.json`,
  `${packagePath}/tsconfig.json`,
  `${packagePath}/tsconfig.build.json`,
];

const managedOutputsForPackage = (packagePath) => {
  const pkg = packageJson(packagePath);
  const exportedManagedOutputs = Object.keys(pkg.exports ?? {})
    .filter((subpath) => subpath.startsWith("./managed/"))
    .map((subpath) =>
      output(`${packagePath}/src/${subpath.slice("./".length)}`, packageSourceInputs(packagePath)),
    );
  const overrideOutputs = (managedOutputOverrides[packagePath] ?? []).map((relativeOutputPath) =>
    output(`${packagePath}/${relativeOutputPath}`, packageSourceInputs(packagePath)),
  );

  return [...exportedManagedOutputs, ...overrideOutputs];
};

const distOutputsForPackage = (packagePath) => {
  const pkg = packageJson(packagePath);
  const exportKeys = Object.keys(pkg.exports ?? {});
  const outputs = [];

  if (existsSync(path.join(repoRoot, packagePath, "src/index.ts"))) {
    outputs.push(output(`${packagePath}/dist/index.js`, packageSourceInputs(packagePath)));
  }

  if (exportKeys.includes("./testing")) {
    outputs.push(output(`${packagePath}/dist/testing.js`, packageSourceInputs(packagePath)));
  }

  return outputs;
};

const skipInputDirectories = new Set(["dist", "coverage", "reports", "target", "node_modules", ".turbo"]);

const newestInputMtimeMs = (inputs) => {
  let newest = 0;

  const visit = (absolutePath) => {
    if (!existsSync(absolutePath)) {
      return;
    }

    const stat = statSync(absolutePath);
    if (stat.isDirectory()) {
      const basename = path.basename(absolutePath);
      const relativePath = path.relative(repoRoot, absolutePath).split(path.sep).join("/");

      if (skipInputDirectories.has(basename) || relativePath.endsWith("/src/managed")) {
        return;
      }

      for (const entry of readdirSync(absolutePath)) {
        visit(path.join(absolutePath, entry));
      }
      return;
    }

    newest = Math.max(newest, stat.mtimeMs);
  };

  for (const input of inputs) {
    visit(path.join(repoRoot, input));
  }

  return newest;
};

const expandProfileOutputs = (profileName, seen = new Set()) => {
  const profile = profileDefinitions[profileName];

  if (!profile) {
    throw new Error(`Unknown artifact profile: ${profileName}`);
  }

  if (seen.has(profileName)) {
    throw new Error(`Artifact profile cycle detected at ${profileName}`);
  }
  seen.add(profileName);

  const outputs = [];
  for (const parent of profile.extends ?? []) {
    outputs.push(...expandProfileOutputs(parent, seen));
  }

  for (const packagePath of profile.managedPackages ?? []) {
    outputs.push(...managedOutputsForPackage(packagePath));
  }

  for (const packagePath of profile.distPackages ?? []) {
    outputs.push(...distOutputsForPackage(packagePath));
  }

  outputs.push(...(profile.outputs ?? []));
  seen.delete(profileName);

  const deduped = new Map();
  for (const artifact of outputs) {
    deduped.set(artifact.path, artifact);
  }
  return [...deduped.values()];
};

const explainProfile = (profileName) => {
  const profile = profileDefinitions[profileName];
  if (!profile) {
    return {
      known: false,
      ready: false,
      missing: [],
      stale: [],
      outputs: [],
    };
  }

  const outputs = expandProfileOutputs(profileName);
  const missing = [];
  const stale = [];

  for (const artifact of outputs) {
    const absolutePath = path.join(repoRoot, artifact.path);
    if (!existsSync(absolutePath)) {
      missing.push(artifact.path);
      continue;
    }

    if (artifact.freshness === false) {
      continue;
    }

    const newestInput = newestInputMtimeMs(artifact.inputs ?? []);
    if (newestInput > 0 && statSync(absolutePath).mtimeMs + 1 < newestInput) {
      stale.push(artifact.path);
    }
  }

  if (profile.customReady && !profile.customReady()) {
    missing.push(`${profileName}:custom-ready-check`);
  }

  return {
    known: true,
    ready: missing.length === 0 && stale.length === 0,
    buildCommand: profile.buildCommand,
    missing,
    stale,
    outputs: outputs.map((artifact) => artifact.path),
  };
};

const checkCatalog = () => {
  const errors = [];
  const rootPackage = readJson("package.json");
  const scripts = rootPackage.scripts ?? {};
  const knownConeNames = new Set(ciBuildConeNames);

  for (const [profileName, profile] of Object.entries(profileDefinitions)) {
    if (!profile.buildCommand) {
      errors.push(`${profileName} is missing buildCommand`);
    }

    const scriptName = profile.buildCommand?.match(/^npm run ([^\s]+)/u)?.[1];
    if (scriptName && !scripts[scriptName]) {
      errors.push(`${profileName} references missing root script: ${scriptName}`);
    }

    for (const coneName of profile.ciBuildCones ?? []) {
      if (!knownConeNames.has(coneName)) {
        errors.push(`${profileName} references unknown CI build cone: ${coneName}`);
        continue;
      }

      const coneScriptName = `build:cone:${coneName}`;
      const expectedConeScript = buildConeScriptCommand(coneName);
      if (scripts[coneScriptName] !== expectedConeScript) {
        errors.push(
          `${profileName} references CI build cone '${coneName}' but root script '${coneScriptName}' is not catalog-backed`,
        );
      }
    }

    try {
      for (const artifact of expandProfileOutputs(profileName)) {
        if (path.isAbsolute(artifact.path) || artifact.path.includes("..")) {
          errors.push(`${profileName} has unsafe output path: ${artifact.path}`);
        }
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  return errors;
};

export const profileNames = Object.keys(profileDefinitions);

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const [command, value] = process.argv.slice(2);

if (isDirectExecution) {
  try {
    switch (command) {
      case "--profile-names":
        console.log(profileNames.join("\n"));
        break;
      case "--build-command": {
        const profile = profileDefinitions[value];
        if (!profile) {
          console.error(`[managed-artifact-catalog] Unknown artifact profile: ${value}`);
          process.exit(2);
        }
        console.log(profile.buildCommand);
        break;
      }
      case "--ready": {
        const report = explainProfile(value);
        if (!report.known) {
          console.error(`[managed-artifact-catalog] Unknown artifact profile: ${value}`);
          process.exit(2);
        }
        process.exit(report.ready ? 0 : 1);
        break;
      }
      case "--explain":
        console.log(JSON.stringify(explainProfile(value), null, 2));
        break;
      case "--check-catalog": {
        const errors = checkCatalog();
        if (errors.length > 0) {
          for (const error of errors) {
            console.error(`[managed-artifact-catalog] ${error}`);
          }
          process.exit(1);
        }
        console.log(
          `[managed-artifact-catalog] Verified ${profileNames.length} artifact profiles.`,
        );
        break;
      }
      case "--json":
      case undefined:
        console.log(
          JSON.stringify(
            Object.fromEntries(
              Object.keys(profileDefinitions).map((profileName) => [
                profileName,
                explainProfile(profileName),
              ]),
            ),
            null,
            2,
          ),
        );
        break;
      default:
        console.error(`[managed-artifact-catalog] Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`[managed-artifact-catalog] ${error.message}`);
    process.exit(1);
  }
}
