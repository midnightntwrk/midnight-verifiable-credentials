#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
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
      errors.push(`${relativePath} is missing required surface-discipline text: ${fragment}`);
    }
  }
};

// These fragments are intentionally exact. This guard is a release-discipline
// tripwire: when contributors reword the guide/template/changelog, they should
// consciously update the guard with the new canonical wording.
const requireGeneratedScaffoldIncludes = ({ mode, slug, files }) => {
  const checkRoot = path.join(
    repoRoot,
    "tooling",
    "artifacts",
    `scaffold-surface-check-${process.pid}`,
  );
  const outputRoot = path.join(
    checkRoot,
    mode,
  );
  rmSync(outputRoot, { force: true, recursive: true });
  mkdirSync(path.dirname(outputRoot), { recursive: true });

  try {
    execFileSync(
      "node",
      [
        "./tooling/scripts/scaffold-vc-family.mjs",
        "--slug",
        slug,
        "--out",
        path.relative(repoRoot, outputRoot),
        "--claim-mode",
        mode,
      ],
      {
        cwd: repoRoot,
        stdio: "pipe",
      },
    );

    for (const [relativePath, requiredFragments] of Object.entries(files)) {
      const generated = readFileSync(path.join(outputRoot, relativePath), "utf8");
      for (const fragment of requiredFragments) {
        if (!generated.includes(fragment)) {
          errors.push(
            `Generated ${mode} scaffold ${relativePath} is missing required text: ${fragment}`,
          );
        }
      }
      if (generated.includes("CredentialCredential")) {
        errors.push(`Generated ${mode} scaffold ${relativePath} contains duplicate Credential suffix`);
      }
    }
  } finally {
    rmSync(outputRoot, { force: true, recursive: true });
    rmSync(checkRoot, { force: true, recursive: true });
  }
};

requireIncludes(".github/PULL_REQUEST_TEMPLATE/pull_request_template.md", [
  "Generated Compact/runtime surface",
  "claim representation",
  "migration notes",
]);

requireIncludes("CHANGELOG.md", [
  "VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>",
  "NoPublicClaims",
  "NoClaimCommitments",
]);

requireIncludes("docs/README.md", ["guides/vc-surface-change-discipline.md"]);
requireIncludes("README.md", ["docs/guides/vc-surface-change-discipline.md"]);
requireIncludes("docs/templates/family-scaffold-template.md", [
  "--claim-mode public|commitment|mixed",
  "NoPublicClaims",
  "NoClaimCommitments",
]);
requireIncludes("tooling/scripts/scaffold-vc-family.mjs", [
  "--claim-mode",
  "NoPublicClaims",
  "NoClaimCommitments",
]);
requireIncludes("tooling/artifacts/.gitignore", ["*"]);

requireGeneratedScaffoldIncludes({
  mode: "commitment",
  slug: "commit-check",
  files: {
    "src/commit-check-credential.compact": [
      "import VC<NoPublicClaims, CommitCheckClaimCommitments, ExplicitHolderBinding, NoStatusBinding>",
      "CredentialPresentationRelations<",
      "export type CommitCheckCredential = Credential",
    ],
    "src/commit-check-credential/helpers.compact": [
      "commitCheckClaimRoot(credential.claimCommitments)",
    ],
  },
});

requireGeneratedScaffoldIncludes({
  mode: "public",
  slug: "public-check",
  files: {
    "src/public-check-credential.compact": [
      "import VC<PublicCheckPublicClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>",
      "export type PublicCheckCredential = Credential",
    ],
  },
});

requireGeneratedScaffoldIncludes({
  mode: "mixed",
  slug: "mixed-check",
  files: {
    "src/mixed-check-credential.compact": [
      "import VC<MixedCheckPublicClaims, MixedCheckClaimCommitments, ExplicitHolderBinding, NoStatusBinding>",
      "CredentialPresentationRelations<",
    ],
    "src/mixed-check-credential/helpers.compact": [
      "mixedCheckClaimRoot(credential.claims, credential.claimCommitments)",
      "presentation.disclosed.publicClaims == credential.claims",
    ],
  },
});

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-vc-surface-discipline] ${error}`);
  }
  process.exit(1);
}

console.log("[check-vc-surface-discipline] Verified release docs and scaffold claim-mode surfaces.");
