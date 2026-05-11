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
);
const requiredBuildSurfaces = [
  {
    artifactPath: "core/primitives/credentials/dist/index.js",
    sourcePaths: ["core/primitives/credentials/src/index.ts"],
  },
  {
    artifactPath: "prototypes/credential-families/birth/dist/testing.js",
    sourcePaths: ["prototypes/credential-families/birth/src/testing.ts"],
  },
  {
    artifactPath: "prototypes/credential-families/birth-secret/dist/index.js",
    sourcePaths: ["prototypes/credential-families/birth-secret/src/index.ts"],
  },
  {
    artifactPath: "use-cases/age-gate/contract/dist/testing.js",
    sourcePaths: [
      "use-cases/age-gate/contract/src/testing.ts",
      "use-cases/age-gate/contract/src/demo-revocation-fixtures.ts",
    ],
  },
  {
    artifactPath: "use-cases/age-gate/contract/dist/contract-revocation.js",
    sourcePaths: [
      "use-cases/age-gate/contract/src/contract-revocation.ts",
      "use-cases/age-gate/contract/src/demo-revocation.compact",
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

const missingArtifacts = [];

const needsRebuild = async ({ artifactPath, sourcePaths }) => {
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
};

for (const buildSurface of requiredBuildSurfaces) {
  if (await needsRebuild(buildSurface)) {
    missingArtifacts.push(buildSurface.artifactPath);
  }
}

if (missingArtifacts.length === 0) {
  console.log("BDD scenario prerequisites already built.");
  process.exit(0);
}

console.log("Missing BDD scenario prerequisites:");
for (const artifactPath of missingArtifacts) {
  console.log(`- ${artifactPath}`);
}

const child = spawn("npm", ["run", "build:integration-prereqs:shared"], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
