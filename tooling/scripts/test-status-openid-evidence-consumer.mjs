#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageRoot = path.join(repoRoot, "packages/use-cases/status-openid/evidence");
const fixture = path.join(repoRoot, "tooling/fixtures/status-openid-evidence-consumer/consumer.mjs");
const source = readFileSync(fixture, "utf8");
if (/packages\/|\/src\/|\/dist\//u.test(source)) throw new Error("Status OpenID clean consumer must import package roots only");

const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "status-openid-evidence-consumer-"));
const nodeModules = path.join(temporaryRoot, "node_modules");
const copiedPackage = path.join(nodeModules, "@midnight-ntwrk/status-openid-production-evidence");
const linkDependency = (name) => {
  const target = path.join(packageRoot, "node_modules", ...name.split("/"));
  lstatSync(target);
  const destination = path.join(nodeModules, ...name.split("/"));
  mkdirSync(path.dirname(destination), { recursive: true });
  symlinkSync(target, destination, "junction");
};

try {
  mkdirSync(copiedPackage, { recursive: true });
  cpSync(path.join(packageRoot, "dist"), path.join(copiedPackage, "dist"), { recursive: true });
  cpSync(path.join(packageRoot, "package.json"), path.join(copiedPackage, "package.json"));
  const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  for (const dependency of Object.keys(manifest.dependencies ?? {})) linkDependency(dependency);
  writeFileSync(path.join(temporaryRoot, "package.json"), '{"name":"status-openid-clean-consumer","private":true,"type":"module"}\n');
  cpSync(fixture, path.join(temporaryRoot, "consumer.mjs"));
  const result = spawnSync("node", [path.join(temporaryRoot, "consumer.mjs")], { cwd: temporaryRoot, encoding: "utf8", env: process.env });
  if (result.status !== 0) throw new Error(`Status OpenID clean consumer failed\n${result.stdout}\n${result.stderr}`);
  process.stdout.write(result.stdout);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
