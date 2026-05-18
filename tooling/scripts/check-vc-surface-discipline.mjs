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
const requireGeneratedIncludes = ({ mode, slug, relativePath, requiredFragments }) => {
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

requireGeneratedIncludes({
  mode: "commitment",
  slug: "commit-check",
  relativePath: "src/commit-check-credential.compact",
  requiredFragments: [
    "import VC<NoPublicClaims, CommitCheckClaimCommitments, ExplicitHolderBinding, NoStatusBinding>",
    "CredentialPresentationRelations<",
    "export type CommitCheckCredential = Credential",
  ],
});

requireGeneratedIncludes({
  mode: "commitment",
  slug: "commit-check",
  relativePath: "src/commit-check-credential/helpers.compact",
  requiredFragments: ["commitCheckClaimRoot(credential.claimCommitments)"],
});

requireGeneratedIncludes({
  mode: "public",
  slug: "public-check",
  relativePath: "src/public-check-credential.compact",
  requiredFragments: [
    "import VC<PublicCheckPublicClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>",
    "export type PublicCheckCredential = Credential",
  ],
});

requireGeneratedIncludes({
  mode: "mixed",
  slug: "mixed-check",
  relativePath: "src/mixed-check-credential.compact",
  requiredFragments: [
    "import VC<MixedCheckPublicClaims, MixedCheckClaimCommitments, ExplicitHolderBinding, NoStatusBinding>",
    "CredentialPresentationRelations<",
  ],
});

requireGeneratedIncludes({
  mode: "mixed",
  slug: "mixed-check",
  relativePath: "src/mixed-check-credential/helpers.compact",
  requiredFragments: [
    "mixedCheckClaimRoot(credential.claims, credential.claimCommitments)",
    "presentation.disclosed.publicClaims == credential.claims",
  ],
});

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-vc-surface-discipline] ${error}`);
  }
  process.exit(1);
}

console.log("[check-vc-surface-discipline] Verified release docs and scaffold claim-mode surfaces.");
