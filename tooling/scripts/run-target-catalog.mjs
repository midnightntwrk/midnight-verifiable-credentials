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
    artifactProfile: "managed-light",
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
    description: "Package test lanes (non-Docker, excludes BDD).",
    category: "core",
    supportsLight: true,
    artifactProfile: "managed-light",
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
    name: "bdd",
    description: "Serenity/JS BDD smoke scenarios.",
    category: "bdd",
    supportsLight: true,
    script: "test:bdd:smoke",
  },
  {
    name: "bdd-negative",
    description: "Serenity/JS BDD negative-path scenarios.",
    category: "bdd",
    supportsLight: true,
    script: "test:bdd:negative",
  },
  {
    name: "bdd-all",
    description: "Full Serenity/JS BDD scenario set.",
    category: "bdd",
    supportsLight: true,
    script: "test:bdd:all",
  },
  {
    name: "status-openid-evidence",
    description: "Status-enabled OID4VCI/OID4VP Final production-shaped evidence lane.",
    category: "use-case",
    supportsLight: false,
    script: "ci:status-openid-evidence",
  },
  {
    name: "university-bdd",
    description: "Executable university diploma BDD scenarios.",
    category: "university",
    supportsLight: true,
    script: "ci:university-bdd",
  },
  {
    name: "university-bdd-proof-server",
    description: "University diploma BDD with proof-server DTO recording.",
    category: "university",
    supportsLight: true,
    script: "ci:university-bdd:proof-server",
  },
  {
    name: "university-bdd-standalone",
    description: "University diploma BDD with real standalone DID bootstrap.",
    category: "university",
    supportsLight: true,
    requiresDocker: true,
    script: "ci:university-bdd:standalone",
  },
  {
    name: "university-batch-sweep",
    description: "Issuance batch-size sweep with summary artifacts.",
    category: "university",
    supportsLight: false,
    script: "ci:university-batch-sweep",
  },
  {
    name: "university-ci-matrix",
    description: "Validate university lane/script/workflow matrix wiring.",
    category: "university",
    supportsLight: false,
    script: "ci:university-ci-matrix",
  },
  {
    name: "university-data-profiles",
    description: "Validate committed readable/stress university data profiles.",
    category: "university",
    supportsLight: false,
    script: "ci:university-data-profiles",
  },
  {
    name: "university-policy-catalog",
    description: "Validate university verifier policy preset coverage.",
    category: "university",
    supportsLight: false,
    script: "ci:university-policy-catalog",
  },
  {
    name: "university-protocol",
    description: "Protocol-style multi-party university flow lane.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol",
    script: "ci:university-protocol",
    lightScript: "ci:university-protocol:from-artifacts",
  },
  {
    name: "university-protocol-export",
    description: "Machine-readable university protocol transcript export.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol-export",
    script: "ci:university-protocol:export",
    lightScript: "ci:university-protocol:export:from-artifacts",
  },
  {
    name: "university-protocol-cohort",
    description: "30-student rich-cohort protocol summary output.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol-cohort",
    script: "ci:university-protocol:cohort",
    lightScript: "ci:university-protocol:cohort:from-artifacts",
  },
  {
    name: "university-protocol-stress",
    description: "100-student protocol stress lane with summary output.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-protocol-stress",
    script: "ci:university-protocol:stress",
    lightScript: "ci:university-protocol:stress:from-artifacts",
  },
  {
    name: "university-summary",
    description:
      "One-page summary over university BDD, transcript, stress, and batch-sweep artifacts.",
    category: "university",
    supportsLight: true,
    artifactProfile: "managed-university-summary",
    script: "ci:university-summary",
    lightScript: "ci:university-summary:from-artifacts",
  },
  {
    name: "university-report-contract",
    description: "Print the versioned university report summary contract JSON.",
    category: "university",
    supportsLight: false,
    script: "ci:university-report-contract",
  },
  {
    name: "hello-smoke",
    description: "Smallest DID -> VC -> verifier handoff lane.",
    category: "focused",
    supportsLight: true,
    artifactProfile: "managed-hello-smoke",
    script: "ci:hello-smoke",
    lightScript: "ci:hello-smoke:from-artifacts",
  },
  {
    name: "dummy-claims-lab",
    description: "Broad direct claim-surface verifier lane.",
    category: "focused",
    supportsLight: true,
    artifactProfile: "managed-dummy-claims-lab",
    script: "ci:dummy-claims-lab",
    lightScript: "ci:dummy-claims-lab:from-artifacts",
  },
  {
    name: "revocation",
    description: "Revocation-focused CI lane.",
    category: "focused",
    supportsLight: false,
    artifactProfile: "managed-revocation",
    script: "ci:revocation",
  },
  {
    name: "package",
    description: "Pack every dist-class workspace from the workspace catalog.",
    category: "release",
    supportsLight: false,
    script: "artifacts:pack",
  },
  {
    name: "integration",
    description: "Both standalone Docker integration lanes.",
    category: "integration",
    supportsLight: false,
    requiresDocker: true,
    script: "ci:integration",
  },
  {
    name: "integration-demo-contract",
    description: "Standalone demo-contract integration only.",
    category: "integration",
    supportsLight: false,
    requiresDocker: true,
    artifactProfile: "integration-demo-contract",
    script: "ci:integration:demo-contract",
    fromArtifactsScript: "ci:integration:demo-contract:from-artifacts",
  },
  {
    name: "integration-protocol",
    description: "Standalone protocol integration only.",
    category: "integration",
    supportsLight: false,
    requiresDocker: true,
    artifactProfile: "integration-protocol",
    script: "ci:integration:protocol",
    fromArtifactsScript: "ci:integration:protocol:from-artifacts",
  },
  {
    name: "clean-artifacts",
    description:
      "Remove generated build/test artifacts without deleting dependencies, vendor tarballs, or local secrets.",
    category: "maintenance",
    supportsLight: false,
    releaseGate: false,
    script: "clean:artifacts",
  },
  {
    name: "integration-report",
    description:
      "Print DID integration modes, repair flow, and vendor/sibling readiness report.",
    category: "maintenance",
    supportsLight: false,
    releaseGate: false,
    script: "report:did-integration",
  },
  {
    name: "check-integration",
    description:
      "Fail if DID vendor/sibling integration wiring or compatibility aliases are stale.",
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
  "bdd",
  "university",
  "focused",
  "release",
  "integration",
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
