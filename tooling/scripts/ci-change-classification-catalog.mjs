#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { stderr, stdout } from "node:process";

const outputKeys = [
  "docs_only",
  "bdd_only",
  "run_hello_smoke",
  "run_revocation",
  "run_integration_demo_contract",
  "run_integration_protocol",
  "run_university",
];

export const ciChangeClassificationCatalog = {
  docsPatterns: [
    "README.md",
    "AGENT.md",
    "CHANGELOG.md",
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "docs/*",
    ".github/*.md",
  ],
  docsOnlyExclusionPatterns: [
    "docs/testing/quality-evidence.json",
    "docs/testing/quality-evidence.md",
  ],
  bddOnlyPatterns: [
    "packages/use-cases/*/scenarios/*",
    "docs/plans/serenity-js-bdd-layer.md",
    "docs/testing/test-strategy.md",
    "docs/testing/test-matrix.md",
    "docs/README.md",
  ],
  bddRelatedPatterns: [
    "packages/use-cases/*/scenarios/*",
    "docs/plans/serenity-js-bdd-layer.md",
    "run.sh",
    "run-credentials.sh",
  ],
  globalHeavyLanePatterns: [
    ".github/workflows/*",
    "packages/components/integration/infrastructure/*",
    "tooling/vendor/*",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "turbo.json",
    "tsconfig*.json",
    ".eslintrc.json",
    "run.sh",
    "run-credentials.sh",
    "run-credentials-standalone.sh",
    "tooling/*",
  ],
  lanePatterns: {
    run_revocation: [
      "packages/core/primitives/credentials/*",
      "packages/registry/status-registry/*",
      "packages/core/capabilities/same-holder/*",
      "packages/prototypes/credential-families/birth/*",
      "packages/prototypes/credential-families/birth-secret/*",
      "packages/use-cases/*/contract/*",
    ],
    run_hello_smoke: [
      "packages/core/primitives/credentials/*",
      "packages/registry/status-registry/*",
      "packages/core/capabilities/same-holder/*",
      "packages/core/primitives/iso-registry/*",
      "packages/components/adapters/offchain-did/*",
      "packages/prototypes/credential-families/hello-family/*",
      "packages/use-cases/hello-verifier/contract/*",
    ],
    run_integration_demo_contract: [
      "packages/core/primitives/credentials/*",
      "packages/prototypes/credential-families/birth/*",
      "packages/prototypes/credential-families/birth-secret/*",
      "packages/use-cases/*/contract/*",
      "packages/components/integration/standalone-environment/*",
    ],
    run_integration_protocol: [
      "packages/core/primitives/credentials/*",
      "packages/core/capabilities/same-holder/*",
      "packages/prototypes/credential-families/birth/*",
      "packages/prototypes/credential-families/birth-secret/*",
      "packages/use-cases/*/contract/*",
      "packages/components/orchestration/protocol/*",
      "packages/components/integration/standalone-environment/*",
    ],
    run_university: [
      "packages/use-cases/university/*",
      "packages/prototypes/credential-families/university-diploma/*",
      "packages/components/orchestration/protocol/*",
    ],
  },
};

const emptyClassification = () =>
  Object.fromEntries(outputKeys.map((key) => [key, false]));

const escapeRegExp = (value) => value.replace(/[.+^${}()|[\]\\]/gu, "\\$&");

// Supported catalog globs intentionally mirror the previous bash case-pattern
// subset: `*` spans path separators and `?` matches one character.
const globToRegExp = (pattern) =>
  new RegExp(
    `^${pattern
      .split("*")
      .map((part) =>
        part.replace(/\?/gu, "\0").split("\0").map(escapeRegExp).join("."),
      )
      .join(".*")}$`,
    "u",
  );

const compiledPatternCache = new Map();

const matchesPattern = (file, pattern) => {
  let regexp = compiledPatternCache.get(pattern);
  if (!regexp) {
    regexp = globToRegExp(pattern);
    compiledPatternCache.set(pattern, regexp);
  }
  return regexp.test(file);
};

const matchesAny = (file, patterns) =>
  patterns.some((pattern) => matchesPattern(file, pattern));

export const classifyChangedFiles = (changedFiles) => {
  const files = changedFiles.filter(Boolean);
  if (files.length === 0) {
    return emptyClassification();
  }

  const classification = {
    docs_only: true,
    bdd_only: true,
    run_hello_smoke: false,
    run_revocation: false,
    run_integration_demo_contract: false,
    run_integration_protocol: false,
    run_university: false,
  };
  let bddRelated = false;

  for (const file of files) {
    const isDocsOnlyExcluded = matchesAny(
      file,
      ciChangeClassificationCatalog.docsOnlyExclusionPatterns,
    );
    if (
      isDocsOnlyExcluded ||
      !matchesAny(file, ciChangeClassificationCatalog.docsPatterns)
    ) {
      classification.docs_only = false;
    }

    if (!matchesAny(file, ciChangeClassificationCatalog.bddOnlyPatterns)) {
      classification.bdd_only = false;
    }

    if (matchesAny(file, ciChangeClassificationCatalog.bddRelatedPatterns)) {
      bddRelated = true;
    }

    if (
      matchesAny(file, ciChangeClassificationCatalog.globalHeavyLanePatterns)
    ) {
      classification.run_hello_smoke = true;
      classification.run_revocation = true;
      classification.run_integration_demo_contract = true;
      classification.run_integration_protocol = true;
      classification.run_university = true;
      continue;
    }

    if (matchesAny(file, ciChangeClassificationCatalog.docsPatterns)) {
      continue;
    }

    for (const [key, patterns] of Object.entries(
      ciChangeClassificationCatalog.lanePatterns,
    )) {
      if (matchesAny(file, patterns)) {
        classification[key] = true;
      }
    }
  }

  if (!bddRelated) {
    classification.bdd_only = false;
  }

  if (classification.bdd_only) {
    classification.docs_only = false;
  }

  return classification;
};

const changedFilesForRange = (range) =>
  execFileSync("git", ["diff", "--name-only", range], {
    encoding: "utf8",
  })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);

const writeGitHubOutput = (classification) => {
  for (const key of outputKeys) {
    stdout.write(`${key}=${classification[key] ? "true" : "false"}\n`);
  }
};

const runSelfTest = () => {
  assert.deepEqual(classifyChangedFiles([]), emptyClassification());
  const ordinaryDocsOnly = classifyChangedFiles(["docs/spec/example.md"]);
  assert.equal(ordinaryDocsOnly.docs_only, true);
  const qualityEvidenceOnly = classifyChangedFiles([
    "docs/testing/quality-evidence.json",
    "docs/testing/quality-evidence.md",
  ]);
  assert.equal(
    qualityEvidenceOnly.docs_only,
    false,
    "quality evidence changes must run the normal lint/quality lane",
  );
  assert.equal(qualityEvidenceOnly.bdd_only, false);
  for (const key of outputKeys.filter((key) => key.startsWith("run_"))) {
    assert.equal(qualityEvidenceOnly[key], false);
  }
  const bddOnly = classifyChangedFiles([
    "packages/use-cases/age-gate/scenarios/foo.ts",
  ]);
  assert.equal(bddOnly.docs_only, false);
  assert.equal(bddOnly.bdd_only, true);
  const mixedDocsAndBdd = classifyChangedFiles([
    "docs/spec/example.md",
    "packages/use-cases/age-gate/scenarios/foo.ts",
  ]);
  assert.equal(mixedDocsAndBdd.docs_only, false);
  assert.equal(mixedDocsAndBdd.bdd_only, false);
  const packageOnly = classifyChangedFiles(["package.json"]);
  assert.equal(packageOnly.bdd_only, false);
  for (const key of outputKeys.filter((key) => key.startsWith("run_"))) {
    assert.equal(packageOnly[key], true);
  }
  assert.equal(
    classifyChangedFiles(["run.sh"]).bdd_only,
    false,
    "runner changes must execute the full non-Docker CI matrix",
  );
  assert.equal(
    classifyChangedFiles(["run-credentials.sh"]).bdd_only,
    false,
    "wrapper changes must execute the full non-Docker CI matrix",
  );
  assert.equal(
    classifyChangedFiles(["packages/core/primitives/credentials/README.md"])
      .docs_only,
    false,
    "workspace README changes must execute package-class policy checks",
  );
  const pnpmWorkspaceChange = classifyChangedFiles(["pnpm-workspace.yaml"]);
  for (const key of outputKeys.filter((key) => key.startsWith("run_"))) {
    assert.equal(pnpmWorkspaceChange[key], true);
  }
  const sharedCredentialPrimitive = classifyChangedFiles([
    "packages/core/primitives/credentials/src/index.ts",
  ]);
  assert.equal(sharedCredentialPrimitive.run_revocation, true);
  assert.equal(sharedCredentialPrimitive.run_hello_smoke, true);
  assert.equal(sharedCredentialPrimitive.run_integration_demo_contract, true);
  assert.equal(sharedCredentialPrimitive.run_integration_protocol, true);
  assert.equal(sharedCredentialPrimitive.run_university, false);
  const globalTooling = classifyChangedFiles(["tooling/scripts/example.mjs"]);
  for (const key of outputKeys.filter((key) => key.startsWith("run_"))) {
    assert.equal(globalTooling[key], true);
  }
  const rootTsConfig = classifyChangedFiles(["tsconfig.base.json"]);
  for (const key of outputKeys.filter((key) => key.startsWith("run_"))) {
    assert.equal(rootTsConfig[key], true);
  }
  const nestedTsConfig = classifyChangedFiles([
    "packages/protocols/openid/tsconfig.json",
  ]);
  for (const key of outputKeys.filter((key) => key.startsWith("run_"))) {
    assert.equal(nestedTsConfig[key], false);
  }
  assert.equal(
    classifyChangedFiles(["packages/use-cases/age-gate/scenarios/foo.ts"])
      .bdd_only,
    true,
  );
  assert.equal(classifyChangedFiles(["package.json"]).run_university, true);
  assert.equal(
    classifyChangedFiles(["packages/registry/status-registry/src/index.ts"])
      .run_revocation,
    true,
  );
  assert.equal(
    classifyChangedFiles([
      "packages/components/orchestration/protocol/src/a.ts",
    ]).run_integration_protocol,
    true,
  );
};

const isDirectExecution =
  process.argv[1]?.endsWith("ci-change-classification-catalog.mjs") ?? false;

if (isDirectExecution) {
  const [commandOrRange] = process.argv.slice(2);

  try {
    if (commandOrRange === "--self-test") {
      runSelfTest();
      stdout.write("[ci-change-classification-catalog] Self-test passed.\n");
    } else if (commandOrRange === "--json") {
      stdout.write(
        `${JSON.stringify({ ciChangeClassificationCatalog }, null, 2)}\n`,
      );
    } else if (commandOrRange) {
      writeGitHubOutput(
        classifyChangedFiles(changedFilesForRange(commandOrRange)),
      );
    } else {
      stderr.write(
        "Usage: ci-change-classification-catalog.mjs <git-range> | --self-test | --json\n",
      );
      process.exit(1);
    }
  } catch (error) {
    stderr.write(`[ci-change-classification-catalog] ${error.message}\n`);
    process.exit(1);
  }
}
