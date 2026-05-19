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
  },
  {
    name: "typecheck",
    description: "TypeScript typecheck lanes.",
    category: "core",
    supportsLight: true,
    artifactProfile: "managed-light",
  },
  {
    name: "build",
    description: "Build lanes.",
    category: "core",
    supportsLight: true,
  },
  {
    name: "test",
    description: "Package test lanes (non-Docker, excludes BDD).",
    category: "core",
    supportsLight: true,
    artifactProfile: "managed-light",
  },
  {
    name: "bdd",
    description: "Serenity/JS BDD smoke scenarios.",
    category: "bdd",
    supportsLight: false,
  },
  {
    name: "bdd-negative",
    description: "Serenity/JS BDD negative-path scenarios.",
    category: "bdd",
    supportsLight: false,
  },
  {
    name: "bdd-all",
    description: "Full Serenity/JS BDD scenario set.",
    category: "bdd",
    supportsLight: false,
  },
  {
    name: "university-bdd",
    description: "Executable university diploma BDD scenarios.",
    category: "university",
    supportsLight: false,
  },
  {
    name: "university-bdd-proof-server",
    description: "University diploma BDD with proof-server DTO recording.",
    category: "university",
    supportsLight: false,
  },
  {
    name: "university-bdd-standalone",
    description: "University diploma BDD with real standalone DID bootstrap.",
    category: "university",
    supportsLight: false,
    requiresDocker: true,
  },
  {
    name: "university-batch-sweep",
    description: "Issuance batch-size sweep with summary artifacts.",
    category: "university",
    supportsLight: false,
  },
  {
    name: "university-ci-matrix",
    description: "Validate university lane/script/workflow matrix wiring.",
    category: "university",
    supportsLight: false,
  },
  {
    name: "university-data-profiles",
    description: "Validate committed readable/stress university data profiles.",
    category: "university",
    supportsLight: false,
  },
  {
    name: "university-policy-catalog",
    description: "Validate university verifier policy preset coverage.",
    category: "university",
    supportsLight: false,
  },
  {
    name: "university-protocol",
    description: "Protocol-style multi-party university flow lane.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol",
  },
  {
    name: "university-protocol-export",
    description: "Machine-readable university protocol transcript export.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol-export",
  },
  {
    name: "university-protocol-cohort",
    description: "30-student rich-cohort protocol summary output.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol-cohort",
  },
  {
    name: "university-protocol-stress",
    description: "100-student protocol stress lane with summary output.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol-stress",
  },
  {
    name: "university-summary",
    description: "One-page summary over university BDD, transcript, stress, and batch-sweep artifacts.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-summary",
  },
  {
    name: "hello-smoke",
    description: "Smallest DID -> VC -> verifier handoff lane.",
    category: "focused",
    supportsLight: true,
    artifactProfile: "managed-hello-smoke",
  },
  {
    name: "dummy-claims-lab",
    description: "Broad direct claim-surface verifier lane.",
    category: "focused",
    supportsLight: true,
    artifactProfile: "managed-dummy-claims-lab",
  },
  {
    name: "revocation",
    description: "Revocation-focused CI lane.",
    category: "focused",
    supportsLight: false,
    artifactProfile: "managed-revocation",
  },
  {
    name: "integration",
    description: "Both standalone Docker integration lanes.",
    category: "integration",
    supportsLight: false,
    requiresDocker: true,
  },
  {
    name: "integration-demo-contract",
    description: "Standalone demo-contract integration only.",
    category: "integration",
    supportsLight: false,
    requiresDocker: true,
    artifactProfile: "integration-demo-contract",
  },
  {
    name: "integration-protocol",
    description: "Standalone protocol integration only.",
    category: "integration",
    supportsLight: false,
    requiresDocker: true,
    artifactProfile: "integration-protocol",
  },
  {
    name: "clean-artifacts",
    description: "Remove generated build/test artifacts without deleting dependencies, vendor tarballs, or local secrets.",
    category: "maintenance",
    supportsLight: false,
  },
  {
    name: "integration-report",
    description: "Print DID vendor/sibling integration readiness report.",
    category: "maintenance",
    supportsLight: false,
  },
  {
    name: "check-integration",
    description: "Fail if DID vendor/sibling integration wiring is stale or incomplete.",
    category: "maintenance",
    supportsLight: false,
  },
  {
    name: "targets",
    description: "Print this target list.",
    category: "help",
    supportsLight: false,
  },
  {
    name: "help",
    description: "Print this target list.",
    category: "help",
    supportsLight: false,
  },
];

export const targetNames = new Set(targets.map((target) => target.name));
export const lightTargetNames = [
  "full",
  "build",
  "typecheck",
  "test",
  "hello-smoke",
  "dummy-claims-lab",
  "university-protocol",
  "university-protocol-export",
  "university-protocol-cohort",
  "university-protocol-stress",
  "university-summary",
];

const categoryOrder = ["core", "bdd", "university", "focused", "integration", "maintenance", "help"];

const printRows = (rows) => {
  const width = Math.max(...rows.map(([name]) => name.length));
  for (const [name, description] of rows) {
    stdout.write(`  ${name.padEnd(width)}  ${description}\n`);
  }
};

export const printTargetList = () => {
  stdout.write("Targets:\n");
  for (const category of categoryOrder) {
    const categoryTargets = targets.filter((target) => target.category === category);
    if (categoryTargets.length === 0) {
      continue;
    }
    printRows(categoryTargets.map((target) => [target.name, target.description]));
  }
};

export const printLightTargets = () => {
  stdout.write(`${lightTargetNames.join("\n")}\n`);
};

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const [command, value] = process.argv.slice(2);

if (isDirectExecution) {
  switch (command) {
    case "--json":
      stdout.write(`${JSON.stringify({ targets }, null, 2)}\n`);
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
