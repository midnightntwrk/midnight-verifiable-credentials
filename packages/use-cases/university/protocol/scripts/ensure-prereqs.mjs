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
    artifactPath: "packages/components/orchestration/protocol/dist/index.js",
    sourcePaths: ["packages/components/orchestration/protocol/src/index.ts"],
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
    artifactPath:
      "packages/prototypes/credential-families/university-diploma/dist/privacy-profile.js",
    sourcePaths: [
      "packages/prototypes/credential-families/university-diploma/src/privacy-profile.ts",
    ],
  },
  {
    artifactPath: "packages/use-cases/university/contract/dist/testing.js",
    sourcePaths: [
      "packages/use-cases/university/contract/src/testing.ts",
      "packages/use-cases/university/contract/src/university-verifier.compact",
      "packages/use-cases/university/contract/src/simulator.ts",
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
  console.log("University protocol prerequisites already built.");
  process.exit(0);
}

console.log("Missing university protocol prerequisites:");
for (const artifactPath of missingArtifacts) {
  console.log(`- ${artifactPath}`);
}

const child = spawn(
  "bash",
  [
    "-lc",
    "npm run build:core && npm run build -w ./packages/prototypes/credential-families/birth && npm run build -w ./packages/prototypes/credential-families/birth-secret && npm run build -w ./packages/components/orchestration/protocol && npm run build -w ./packages/prototypes/credential-families/university-diploma && npm run build -w ./packages/use-cases/university/contract",
  ],
  {
    cwd: repoRoot,
    stdio: "inherit",
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
