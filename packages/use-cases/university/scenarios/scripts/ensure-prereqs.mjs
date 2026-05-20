import { access, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "..",
);

const requiredBuildSurfaces = [
  {
    artifactPath: "packages/core/primitives/credentials/dist/index.js",
    sourcePaths: ["packages/core/primitives/credentials/src/index.ts"],
  },
  {
    artifactPath:
      "packages/prototypes/credential-families/university-diploma/dist/testing.js",
    sourcePaths: [
      "packages/prototypes/credential-families/university-diploma/src/testing.ts",
      "packages/prototypes/credential-families/university-diploma/src/testing/credential-fixtures.ts",
    ],
  },
  {
    artifactPath: "packages/use-cases/university/protocol/dist/testing.js",
    sourcePaths: [
      "packages/use-cases/university/protocol/src/flow.ts",
      "packages/use-cases/university/protocol/src/testing.ts",
    ],
  },
  {
    artifactPath: "packages/components/integration/standalone-environment/dist/index.js",
    sourcePaths: [
      "packages/components/integration/standalone-environment/src/index.ts",
      "packages/components/integration/standalone-environment/src/did-profile.ts",
      "packages/components/integration/standalone-environment/src/standalone-environment.ts",
    ],
  },
];

async function exists(relativePath) {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function needsRebuild({ artifactPath, sourcePaths }) {
  if (!(await exists(artifactPath))) {
    return true;
  }

  const artifactStat = await stat(path.join(repoRoot, artifactPath));

  for (const sourcePath of sourcePaths) {
    if (!(await exists(sourcePath))) {
      continue;
    }

    const sourceStat = await stat(path.join(repoRoot, sourcePath));
    if (sourceStat.mtimeMs > artifactStat.mtimeMs) {
      return true;
    }
  }

  return false;
}

const missingArtifacts = [];
for (const buildSurface of requiredBuildSurfaces) {
  if (await needsRebuild(buildSurface)) {
    missingArtifacts.push(buildSurface.artifactPath);
  }
}

if (missingArtifacts.length === 0) {
  console.log("University scenario prerequisites already built.");
  process.exit(0);
}

console.log("Missing university scenario prerequisites:");
for (const artifactPath of missingArtifacts) {
  console.log(`- ${artifactPath}`);
}

const child = spawn(
  "bash",
  [
    "-lc",
    "npm run build:core && npm run build -w ./packages/prototypes/credential-families/university-diploma && npm run build -w ./packages/use-cases/university/protocol && npm run build -w ./packages/components/integration/standalone-environment",
  ],
  {
    cwd: repoRoot,
    stdio: "inherit",
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
