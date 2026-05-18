#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const errors = [];

const readRepoFile = (relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

const requireIncludes = (relativePath, requiredFragments) => {
  const source = readRepoFile(relativePath);
  for (const fragment of requiredFragments) {
    if (!source.includes(fragment)) {
      errors.push(`${relativePath} is missing required holder-binding terminology text: ${fragment}`);
    }
  }
};

const markdownFiles = execFileSync(
  "git",
  ["ls-files", "*.md", ":(exclude)node_modules/**", ":(exclude)**/dist/**", ":(exclude)**/target/**"],
  {
    cwd: repoRoot,
    encoding: "utf8",
  },
)
  .split("\n")
  .filter(Boolean);

requireIncludes("docs/architecture/holder-binding-terminology.md", [
  "OffchainDIDHolderBinding` for runtime and public TypeScript-facing",
  "OffchainMidnightHolderBinding` only where the text is explicitly about",
  "legacy compatibility Jubjub holder binding",
  "hidden-holder",
  "holder proof",
]);

requireIncludes("README.md", ["docs/architecture/holder-binding-terminology.md"]);
requireIncludes("docs/README.md", ["architecture/holder-binding-terminology.md"]);
requireIncludes("docs/spec/profiles.md", ["Canonical terminology"]);
requireIncludes("core/primitives/credentials/README.md", ["Holder-binding terminology"]);
requireIncludes("docs/plans/holder-binding-extension-plan.md", [
  "Offchain DID and Legacy Holder Binding Extension Plan",
  "preferred runtime/public-facing adapter name is `OffchainDIDHolderBinding`",
]);
requireIncludes(".github/PULL_REQUEST_TEMPLATE/pull_request_template.md", [
  "Holder-binding terminology reviewed",
]);

for (const relativePath of markdownFiles) {
  const source = readRepoFile(relativePath);

  if (
    source.includes("OffchainMidnightHolderBinding") &&
    !source.includes("OffchainDIDHolderBinding")
  ) {
    errors.push(
      `${relativePath} mentions OffchainMidnightHolderBinding without the preferred OffchainDIDHolderBinding name`,
    );
  }

  if (
    source.includes("JubjubHolderBinding") &&
    !/(legacy|compatibility|minimal|non-DID)/iu.test(source)
  ) {
    errors.push(
      `${relativePath} mentions JubjubHolderBinding without legacy/compatibility/minimal context`,
    );
  }
}

const rejectedFragments = [
  "OffchainMidnightHolderBinding is the preferred",
  "JubjubHolderBinding is the default",
  "hidden-holder production support is final",
];

for (const relativePath of markdownFiles) {
  const source = readRepoFile(relativePath);
  for (const fragment of rejectedFragments) {
    if (source.includes(fragment)) {
      errors.push(`${relativePath} contains rejected holder-binding terminology: ${fragment}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-holder-binding-terminology] ${error}`);
  }
  process.exit(1);
}

console.log("[check-holder-binding-terminology] Verified holder-binding terminology guardrails.");
