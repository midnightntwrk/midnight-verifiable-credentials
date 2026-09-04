#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packagePaths = [
  "packages/core/model",
  "packages/core/status",
  "packages/core/proofs",
  "packages/registry/status-midnight-contract",
  "packages/registry/status-midnight-verifier",
  "packages/registry/status-midnight-authority",
];
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "status-midnight-consumer-"));
const tarballRoot = path.join(temporaryRoot, "tarballs");
const consumerRoot = path.join(temporaryRoot, "consumer");

const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });
const tarballName = ({ name, version }) => `${name.replace(/^@/u, "").replace("/", "-")}-${version}.tgz`;

try {
  cpSync(path.join(repoRoot, "tooling/fixtures/credential-status-midnight-consumer"), consumerRoot, { recursive: true });
  const dependencies = {};
  for (const packagePath of packagePaths) {
    const packageRoot = path.join(repoRoot, packagePath);
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
    run("pnpm", ["run", "build"], packageRoot);
    run("pnpm", ["pack", "--pack-destination", tarballRoot], packageRoot);
    dependencies[manifest.name] = `file:${path.join(tarballRoot, tarballName(manifest))}`;
  }
  const consumerManifestPath = path.join(consumerRoot, "package.json");
  const consumerManifest = JSON.parse(readFileSync(consumerManifestPath, "utf8"));
  consumerManifest.dependencies = dependencies;
  writeFileSync(consumerManifestPath, `${JSON.stringify(consumerManifest, null, 2)}\n`);
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumerRoot);
  run("npm", ["run", "test:node"], consumerRoot);
  run("npm", ["run", "typecheck"], consumerRoot);
  process.stdout.write("[status-midnight-consumer] clean tarball consumer passed\n");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
