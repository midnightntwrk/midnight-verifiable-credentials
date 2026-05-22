#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const errors = [];
const artifactRoot = path.join(repoRoot, "tooling", "artifacts");

const readRepoFile = (relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

const cleanupStaleScaffoldChecks = () => {
  if (!existsSync(artifactRoot)) {
    return;
  }

  for (const entry of readdirSync(artifactRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("scaffold-surface-check-")) {
      rmSync(path.join(artifactRoot, entry.name), { force: true, recursive: true });
    }
  }
};

const requireIncludes = (relativePath, requiredFragments) => {
  const source = readRepoFile(relativePath);
  for (const fragment of requiredFragments) {
    if (!source.includes(fragment)) {
      errors.push(`${relativePath} is missing required surface-discipline text: ${fragment}`);
    }
  }
};

const requireNotIncludes = (relativePath, forbiddenFragments) => {
  const source = readRepoFile(relativePath);
  for (const fragment of forbiddenFragments) {
    if (source.includes(fragment)) {
      errors.push(`${relativePath} contains stale surface-discipline text: ${fragment}`);
    }
  }
};

// These fragments are intentionally exact. This guard is a release-discipline
// tripwire: when contributors reword the guide/template/changelog, they should
// consciously update the guard with the new canonical wording.
const requireGeneratedScaffoldIncludes = ({ mode, slug, files, holder = "explicit" }) => {
  const outputRoot = path.join(
    artifactRoot,
    `scaffold-surface-check-${process.pid}-${mode}-${holder}`,
  );
  rmSync(outputRoot, { force: true, recursive: true });
  mkdirSync(artifactRoot, { recursive: true });

  try {
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
          "--holder",
          holder,
        ],
        {
          cwd: repoRoot,
          stdio: "pipe",
        },
      );
    } catch (error) {
      const stderr = error.stderr?.toString().trim();
      errors.push(
        `Generated ${mode}/${holder} scaffold failed${stderr ? `: ${stderr}` : ""}`,
      );
      return;
    }

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

requireIncludes("packages/components/orchestration/protocol/src/agents/schema-descriptors.ts", [
  "compatibilityFeatureHintsFromSchemaCapabilities",
  "assertCompatibilityFeatureHintsMatchSchemaDescriptor",
  "BIRTH_COMPATIBILITY_FEATURE_HINTS",
  "SECRET_BIRTH_COMPATIBILITY_FEATURE_HINTS",
]);
for (const relativePath of [
  "packages/components/orchestration/protocol/src/agents/schema-descriptors.ts",
  "packages/components/orchestration/protocol/src/agents/issuer-agent.ts",
  "packages/components/orchestration/protocol/src/agents/secret-issuer-agent.ts",
  "packages/components/orchestration/protocol/src/agents/verifier-agent.ts",
  "packages/components/orchestration/protocol/src/agents/secret-holder-agent.ts",
  "packages/components/orchestration/protocol/src/test/agents/schema-descriptors.test.ts",
]) {
  requireNotIncludes(relativePath, [
    "BIRTH_PROTOCOL_FEATURES",
    "SECRET_BIRTH_PROTOCOL_FEATURES",
    "protocolFeaturesFromSchemaCapabilities",
    "assertProtocolFeaturesMatchSchemaDescriptor",
  ]);
}

cleanupStaleScaffoldChecks();

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
  holder: "hidden",
  mode: "commitment",
  slug: "hidden-check",
  files: {
    "src/hidden-check-credential.compact": [
      "import VC<NoPublicClaims, HiddenCheckClaimCommitments, BlindedSecretHolderBinding, NoStatusBinding>",
      "export type HiddenCheckCredential = Credential",
    ],
    "src/hidden-check-credential/helpers.compact": [
      "assertValidBlindedSecretHolderCredentialBinding(credential.holderBinding)",
      "assertMatchingBlindedSecretHolderBindings(credential.holderBinding, presentation.holderBinding)",
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
