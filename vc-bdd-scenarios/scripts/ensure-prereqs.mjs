import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const requiredArtifacts = [
  "credentials/dist/index.js",
  "credentials-birth/dist/testing.js",
  "credentials-birth-secret/dist/index.js",
  "credentials-demo-contract/dist/testing.js",
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

for (const artifactPath of requiredArtifacts) {
  if (!(await exists(artifactPath))) {
    missingArtifacts.push(artifactPath);
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
