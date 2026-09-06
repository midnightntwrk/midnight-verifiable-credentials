#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { packageTarballName } from "./package-tarball-name.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const temporaryRoot = mkdtempSync(
  path.join(os.tmpdir(), "credential-exchange-consumer-"),
);
const tarballRoot = path.join(temporaryRoot, "tarballs");
const consumerRoot = path.join(temporaryRoot, "consumer");
const consumerSource = path.join(consumerRoot, "src");
const exchangePackageRoot = path.join(
  consumerRoot,
  "vendor",
  "exchange-package",
);
mkdirSync(tarballRoot, { recursive: true });
mkdirSync(consumerSource, { recursive: true });

const run = (command, args, cwd = repoRoot) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result.stdout;
};

try {
  run("pnpm", [
    "--dir",
    "packages/core/model",
    "pack",
    "--pack-destination",
    tarballRoot,
  ]);
  run("pnpm", [
    "--dir",
    "packages/core/proofs",
    "pack",
    "--pack-destination",
    tarballRoot,
  ]);

  const tarballFor = (workspacePath) => {
    const manifest = JSON.parse(
      readFileSync(path.join(repoRoot, workspacePath, "package.json"), "utf8"),
    );
    return path.join(tarballRoot, packageTarballName(manifest));
  };
  const modelTarball = tarballFor("packages/core/model");
  const exchangeWorkspace = path.join(
    repoRoot,
    "packages/components/orchestration/exchange",
  );
  const proofsTarball = tarballFor("packages/core/proofs");
  run("pnpm", ["--dir", exchangeWorkspace, "run", "build"]);
  const exchangeManifest = JSON.parse(
    readFileSync(path.join(exchangeWorkspace, "package.json"), "utf8"),
  );
  mkdirSync(exchangePackageRoot, { recursive: true });
  cpSync(path.join(exchangeWorkspace, "dist"), path.join(exchangePackageRoot, "dist"), {
    recursive: true,
  });
  writeFileSync(
    path.join(exchangePackageRoot, "package.json"),
    `${JSON.stringify(
      {
        ...exchangeManifest,
        scripts: {},
        dependencies: {
          ...exchangeManifest.dependencies,
          "@midnight-ntwrk/credential-model": `file:${modelTarball}`,
          "@midnight-ntwrk/credential-proofs": `file:${proofsTarball}`,
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "credential-exchange-clean-consumer",
        private: true,
        type: "module",
        dependencies: {
          "@midnight-ntwrk/credential-model": `file:${modelTarball}`,
          "@midnight-ntwrk/credential-proofs": `file:${proofsTarball}`,
          "@midnight-ntwrk/credential-exchange": `file:${exchangePackageRoot}`,
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    path.join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          outDir: "dist",
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
  );
  // Includes the generic wallet lifecycle and direct packed proofs/exchange
  // authority-bound verifier consumer.
  cpSync(
    path.join(repoRoot, "tooling/fixtures/runtime-family-wallet-consumer"),
    consumerSource,
    { recursive: true },
  );

  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumerRoot);
  run("pnpm", ["exec", "tsc", "-p", path.join(consumerRoot, "tsconfig.json")]);
  const output = run("node", [path.join(consumerRoot, "dist/index.js")]);
  const authorityOutput = run("node", [
    path.join(consumerRoot, "dist/authority-consumer.js"),
  ]);
  const artifactAuthorityOutput = run("node", [
    path.join(consumerRoot, "dist/artifact-authority-consumer.js"),
  ]);
  process.stdout.write(output);
  process.stdout.write(authorityOutput);
  process.stdout.write(artifactAuthorityOutput);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
