#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { profileNames } from "../../../../tooling/scripts/managed-artifact-catalog.mjs";
import { lightTargetNames, targetNames } from "../../../../tooling/scripts/run-target-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const schemaVersion = "midnight-university-ci-matrix.v1";

export const universityCiMatrix = [
  {
    id: "data-profiles",
    runTarget: "university-data-profiles",
    ciScript: "ci:university-data-profiles",
    purpose: "Validate that committed readable, cohort, and stress fixtures match the generator.",
    when: "Any change to packages/use-cases/university/data or data-profile registry scripts.",
    artifactProfile: null,
    light: false,
    artifacts: [],
    operatorGoal: "Check fixture drift",
    operatorOutput: "generator/profile validation",
  },
  {
    id: "policy-catalog",
    runTarget: "university-policy-catalog",
    ciScript: "ci:university-policy-catalog",
    purpose: "Audit verifier request-policy preset coverage across companies and mall.",
    when: "Any change to university verifier policies, request presets, or protocol disclosure logic.",
    artifactProfile: null,
    light: false,
    artifacts: [],
    operatorGoal: "Check policy drift",
    operatorOutput: "verifier preset coverage",
  },
  {
    id: "bdd-readable",
    runTarget: "university-bdd",
    ciScript: "ci:university-bdd",
    purpose: "Run the 10-student human-readable Serenity/JS university scenarios.",
    when: "Narrative scenario, BDD step, or readable report behavior changes.",
    artifactProfile: null,
    light: false,
    artifacts: ["packages/use-cases/university/scenarios/target/site/serenity"],
    operatorGoal: "Read the executable story",
    operatorOutput: "Serenity report",
  },
  {
    id: "bdd-proof-server-contract",
    runTarget: "university-bdd-proof-server",
    ciScript: "ci:university-bdd:proof-server",
    purpose: "Run BDD scenarios with recorded proof-server request/response DTOs.",
    when: "Proof-backend, proof-server contract, or protocol DTO boundaries change.",
    artifactProfile: null,
    light: false,
    artifacts: ["packages/use-cases/university/scenarios/target/site/serenity"],
    operatorGoal: "See proof-server DTO boundaries",
    operatorOutput: "Serenity report with proof exchanges",
  },
  {
    id: "bdd-standalone-hybrid",
    runTarget: "university-bdd-standalone",
    ciScript: "ci:university-bdd:standalone",
    purpose: "Run readable scenarios with standalone DID bootstrap and timing capture.",
    when: "Standalone environment, DID bootstrap, or proof-backend timing changes.",
    artifactProfile: null,
    light: false,
    artifacts: ["packages/use-cases/university/scenarios/target/standalone-timing"],
    operatorGoal: "Measure standalone DID bootstrap",
    operatorOutput: "standalone timing summary",
  },
  {
    id: "batch-sweep",
    runTarget: "university-batch-sweep",
    ciScript: "ci:university-batch-sweep",
    purpose: "Compare issuance batch-size and projected compile-concurrency behavior.",
    when: "Issuer batching, batch metrics, or reporting summary inputs change.",
    artifactProfile: null,
    light: false,
    artifacts: ["packages/use-cases/university/scenarios/target/batch-sweep/summary.json"],
    operatorGoal: "Sweep issuance batches",
    operatorOutput: "batch-sweep JSON/Markdown",
  },
  {
    id: "protocol",
    runTarget: "university-protocol",
    ciScript: "ci:university-protocol",
    fromArtifactsScript: "ci:university-protocol:from-artifacts",
    purpose: "Run the full threaded issuer/student/company/mall protocol test suite.",
    when: "Protocol agents, transports, persistence, proof backend, or transcript logic changes.",
    artifactProfile: "managed-university-protocol",
    light: true,
    artifacts: [],
    operatorGoal: "Run protocol tests",
    operatorOutput: "package tests",
  },
  {
    id: "protocol-export",
    runTarget: "university-protocol-export",
    ciScript: "ci:university-protocol:export",
    fromArtifactsScript: "ci:university-protocol:export:from-artifacts",
    purpose: "Export machine-readable protocol transcript and application-decision DTO artifacts.",
    when: "Transcript schema, application decision schema, or export formatting changes.",
    artifactProfile: "managed-university-protocol-export",
    light: true,
    artifacts: [
      "packages/use-cases/university/protocol/target/readable-10/transcript-export.json",
      "packages/use-cases/university/protocol/target/readable-10/transcript-export.md",
      "packages/use-cases/university/protocol/target/readable-10/application-decisions-export.json",
      "packages/use-cases/university/protocol/target/readable-10/application-decisions-export.md",
    ],
    operatorGoal: "Export readable transcript",
    operatorOutput: "transcript and decisions artifacts",
  },
  {
    id: "protocol-cohort",
    runTarget: "university-protocol-cohort",
    ciScript: "ci:university-protocol:cohort",
    fromArtifactsScript: "ci:university-protocol:cohort:from-artifacts",
    purpose: "Run the 30-student rich cohort profile and emit sampled summary artifacts.",
    when: "Cohort data, profile summary schema, or sampled transcript behavior changes.",
    artifactProfile: "managed-university-protocol-cohort",
    light: true,
    artifacts: ["packages/use-cases/university/protocol/target/cohort-30"],
    operatorGoal: "Run 30-student cohort profile",
    operatorOutput: "sampled cohort summary",
  },
  {
    id: "protocol-stress",
    runTarget: "university-protocol-stress",
    ciScript: "ci:university-protocol:stress",
    fromArtifactsScript: "ci:university-protocol:stress:from-artifacts",
    purpose: "Run the 100-student throughput stress profile and emit summary artifacts.",
    when: "Stress data, throughput summary, or protocol profile performance behavior changes.",
    artifactProfile: "managed-university-protocol-stress",
    light: true,
    artifacts: ["packages/use-cases/university/protocol/target/stress-100"],
    operatorGoal: "Run 100-student stress profile",
    operatorOutput: "stress summary",
  },
  {
    id: "summary",
    runTarget: "university-summary",
    ciScript: "ci:university-summary",
    fromArtifactsScript: "ci:university-summary:from-artifacts",
    purpose: "Render the one-page summary over BDD, transcript, stress, and batch-sweep artifacts.",
    when: "Reporting package, summary schema, or aggregate artifact wiring changes.",
    artifactProfile: "managed-university-summary",
    light: true,
    artifacts: ["packages/use-cases/university/reporting/target"],
    operatorGoal: "Aggregate handoff summary",
    operatorOutput: "one-page JSON/Markdown report",
  },
  {
    id: "ci-matrix-contract",
    runTarget: "university-ci-matrix",
    ciScript: "ci:university-ci-matrix",
    purpose: "Validate that scripts, run targets, light lanes, and GitHub Actions wiring stay aligned.",
    when: "Any run.sh, package.json, workflow, or university lane contract change.",
    artifactProfile: null,
    light: false,
    artifacts: [],
    operatorGoal: "Validate lane wiring",
    operatorOutput: "generated matrix contract",
  },
];

const matrixDocument = {
  schemaVersion,
  generatedFrom: "packages/use-cases/university/scripts/ci-matrix.mjs",
  lanes: universityCiMatrix,
};

const readRepoFile = (relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

const packageScripts = () => JSON.parse(readRepoFile("package.json")).scripts ?? {};

const hasScript = (scripts, scriptName) =>
  Object.prototype.hasOwnProperty.call(scripts, scriptName);

const markdownCell = (value) => String(value).replaceAll("|", "\\|");

const operatorLaneOrder = [
  "ci-matrix-contract",
  "data-profiles",
  "policy-catalog",
  "bdd-readable",
  "bdd-proof-server-contract",
  "bdd-standalone-hybrid",
  "batch-sweep",
  "protocol",
  "protocol-export",
  "protocol-cohort",
  "protocol-stress",
  "summary",
];

const orderedOperatorLanes = () =>
  operatorLaneOrder.map((laneId) => {
    const lane = universityCiMatrix.find((candidate) => candidate.id === laneId);
    if (!lane) {
      throw new Error(`Unknown university operator lane id: ${laneId}`);
    }
    return lane;
  });

const renderOperatorLaneTable = () => {
  const lines = [
    "| Goal | Command | Main output | When to run |",
    "| --- | --- | --- | --- |",
  ];

  for (const lane of orderedOperatorLanes()) {
    lines.push(
      `| ${markdownCell(lane.operatorGoal)} | \`./run.sh ${markdownCell(
        lane.runTarget,
      )}\` | ${markdownCell(lane.operatorOutput)} | ${markdownCell(lane.when)} |`,
    );
  }

  return lines.join("\n");
};

const generatedSection = (name) => ({
  start: `<!-- ${name}:start -->`,
  end: `<!-- ${name}:end -->`,
});

const replaceGeneratedSection = (source, section, content) => {
  const startIndex = source.indexOf(section.start);
  const endIndex = source.indexOf(section.end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Missing generated section markers: ${section.start} / ${section.end}`);
  }

  return `${source.slice(0, startIndex + section.start.length)}\n${content}\n${source.slice(
    endIndex,
  )}`;
};

const renderMarkdown = () => {
  const lines = [
    "# University CI Matrix",
    "",
    "Status: generated lane contract for local runs, CI selection, and artifact retention.",
    "",
    "Regenerate this view with:",
    "",
    "```bash",
    "npm run --silent build:university-ci-matrix:markdown",
    "```",
    "",
    "| Lane | Run target | CI script | Light/artifacts | When to run |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const lane of universityCiMatrix) {
    const lightAndArtifacts = [
      lane.light ? `light profile: \`${lane.artifactProfile}\`` : "full only",
      lane.artifacts.length > 0
        ? `artifacts: ${lane.artifacts.map((artifact) => `\`${artifact}\``).join(", ")}`
        : "artifacts: none",
    ].join("<br>");
    lines.push(
      `| \`${markdownCell(lane.id)}\` | \`./run.sh ${markdownCell(
        lane.runTarget,
      )}\` | \`${markdownCell(lane.ciScript)}\` | ${lightAndArtifacts} | ${markdownCell(
        lane.when,
      )} |`,
    );
  }

  lines.push(
    "",
    "The GitHub Actions `University Validation` job runs the committed data/profile, policy, cohort, and stress profile lanes when university-relevant files change, then uploads `university-protocol-targets` containing the generated cohort and stress summaries.",
    "",
  );

  return `${lines.join("\n")}`;
};

const assertIncludes = (errors, text, needle, message) => {
  if (!text.includes(needle)) {
    errors.push(message);
  }
};

const checkMatrix = () => {
  const errors = [];
  const scripts = packageScripts();
  const runSh = readRepoFile("run.sh");
  const workflow = readRepoFile(".github/workflows/ci.yml");
  const lightTargets = new Set(lightTargetNames);
  const artifactProfiles = new Set(profileNames);

  for (const lane of universityCiMatrix) {
    if (!hasScript(scripts, lane.ciScript)) {
      errors.push(`Missing package.json script: ${lane.ciScript}`);
    }
    if (!targetNames.has(lane.runTarget)) {
      errors.push(`run target catalog is missing: ${lane.runTarget}`);
    }
    assertIncludes(
      errors,
      runSh,
      `${lane.runTarget})`,
      `run.sh is missing case target: ${lane.runTarget}`,
    );
    assertIncludes(
      errors,
      runSh,
      lane.runTarget,
      `run.sh help/target dispatch is missing: ${lane.runTarget}`,
    );

    if (lane.fromArtifactsScript && !hasScript(scripts, lane.fromArtifactsScript)) {
      errors.push(`Missing package.json from-artifacts script: ${lane.fromArtifactsScript}`);
    }

    if (lane.light) {
      if (!lightTargets.has(lane.runTarget)) {
        errors.push(`run-common light target list is missing: ${lane.runTarget}`);
      }
      if (!artifactProfiles.has(lane.artifactProfile)) {
        errors.push(`managed artifact catalog is missing: ${lane.artifactProfile}`);
      }
    }
  }

  for (const requiredScript of [
    "ci:university-protocol-profiles",
    "ci:university-protocol-profiles:from-artifacts",
    "check:university-ci-matrix",
  ]) {
    if (!hasScript(scripts, requiredScript)) {
      errors.push(`Missing package.json matrix helper script: ${requiredScript}`);
    }
  }

  for (const relativePath of [
    "packages/use-cases/university/ci-matrix.md",
    "docs/plans/vc-maturity-university-wave-2026-05-15.md",
  ]) {
    if (!existsSync(path.join(repoRoot, relativePath))) {
      errors.push(`Missing documented university CI matrix path: ${relativePath}`);
    }
  }

  const committedMarkdown = readRepoFile("packages/use-cases/university/ci-matrix.md");
  if (committedMarkdown !== renderMarkdown()) {
    errors.push(
      "packages/use-cases/university/ci-matrix.md is out of sync; run `npm run --silent build:university-ci-matrix:markdown > packages/use-cases/university/ci-matrix.md`",
    );
  }

  const operatorGuide = readRepoFile("packages/use-cases/university/operator-guide.md");
  const expectedOperatorGuide = replaceGeneratedSection(
    operatorGuide,
    generatedSection("university-operator-lanes"),
    renderOperatorLaneTable(),
  );
  if (operatorGuide !== expectedOperatorGuide) {
    errors.push(
      "packages/use-cases/university/operator-guide.md lane table is out of sync; run `npm run --silent build:university-operator-lanes:markdown` and update the generated section",
    );
  }

  for (const workflowNeedle of [
    "run_university",
    "university-validation:",
    "University Validation",
    "npm run ci:university-protocol-profiles",
    "university-protocol-targets",
  ]) {
    assertIncludes(
      errors,
      workflow,
      workflowNeedle,
      `.github/workflows/ci.yml is missing ${workflowNeedle}`,
    );
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[university-ci-matrix] ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `[university-ci-matrix] Verified ${universityCiMatrix.length} university lanes.`,
  );
};

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(
    "Usage: node packages/use-cases/university/scripts/ci-matrix.mjs [--json|--markdown|--operator-lanes-markdown|--check]",
  );
} else if (args.has("--json")) {
  console.log(JSON.stringify(matrixDocument, null, 2));
} else if (args.has("--markdown")) {
  process.stdout.write(renderMarkdown());
} else if (args.has("--operator-lanes-markdown")) {
  process.stdout.write(renderOperatorLaneTable());
} else if (args.has("--check")) {
  checkMatrix();
} else {
  console.log(JSON.stringify(matrixDocument, null, 2));
}
