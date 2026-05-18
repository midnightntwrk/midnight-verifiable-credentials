#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: process.cwd(),
  encoding: "utf8",
}).trim();

const errors = [];

const readRepoFile = (relativePath) => {
  try {
    return readFileSync(path.join(repoRoot, relativePath), "utf8");
  } catch (error) {
    errors.push(`${relativePath} is missing or unreadable: ${error.message}`);
    return "";
  }
};

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

const offchainMidnightHolderBinding = /\bOffchainMidnightHolderBinding\b/u;
const offchainDidHolderBinding = /\bOffchainDIDHolderBinding\b/u;
const jubjubHolderBinding = /\bJubjubHolderBinding\b/u;
const canonicalTerminologyDoc = "docs/architecture/holder-binding-terminology.md";

const hasLegacyJubjubContext = /(legacy|compatibility|minimal|non-DID)/iu;
const markdownParagraphs = (source) => source.split(/\n{2,}/u);

// These are deliberately wording tripwires, not semantic prose parsers. They
// catch obvious drift while keeping the guard cheap enough for every lint lane.
const rejectedPatterns = [
  {
    label: "OffchainMidnightHolderBinding is the preferred",
    pattern: /\bOffchainMidnightHolderBinding\s+is\s+the\s+preferred\b/iu,
  },
  {
    label: "JubjubHolderBinding is the default",
    pattern: /\bJubjubHolderBinding\s+is\s+the\s+default\b/iu,
  },
  {
    label: "hidden-holder production support is final",
    pattern: /\bhidden-holder\s+production\s+support\s+is\s+final\b/iu,
  },
];

requireIncludes(canonicalTerminologyDoc, [
  "<!-- guard:offchain-did-runtime-public -->",
  "<!-- guard:offchain-midnight-compatibility -->",
  "<!-- guard:jubjub-legacy-context -->",
  "<!-- guard:hidden-holder-term -->",
  "<!-- guard:holder-proof-term -->",
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
    offchainMidnightHolderBinding.test(source) &&
    !offchainDidHolderBinding.test(source)
  ) {
    errors.push(
      `${relativePath} mentions OffchainMidnightHolderBinding without the preferred OffchainDIDHolderBinding name`,
    );
  }

  if (
    relativePath !== canonicalTerminologyDoc &&
    jubjubHolderBinding.test(source) &&
    markdownParagraphs(source).some(
      (paragraph) => jubjubHolderBinding.test(paragraph) && !hasLegacyJubjubContext.test(paragraph),
    )
  ) {
    errors.push(
      `${relativePath} mentions JubjubHolderBinding without paragraph-local legacy/compatibility/minimal context`,
    );
  }

  if (relativePath === canonicalTerminologyDoc) {
    continue;
  }

  for (const { label, pattern } of rejectedPatterns) {
    if (pattern.test(source)) {
      errors.push(`${relativePath} contains rejected holder-binding terminology: ${label}`);
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
