#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const temporaryRoot = mkdtempSync(
  path.join(os.tmpdir(), "credential-exchange-consumer-"),
);
const tarballRoot = path.join(temporaryRoot, "tarballs");
const consumerRoot = path.join(temporaryRoot, "consumer");
const consumerSource = path.join(consumerRoot, "src");
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
    "packages/components/orchestration/exchange",
    "pack",
    "--pack-destination",
    tarballRoot,
  ]);

  const modelTarball = path.join(
    tarballRoot,
    "midnight-ntwrk-credential-model-0.1.0.tgz",
  );
  const exchangeTarball = path.join(
    tarballRoot,
    "midnight-ntwrk-credential-exchange-0.1.0.tgz",
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
          "@midnight-ntwrk/credential-exchange": `file:${exchangeTarball}`,
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
  cpSync(
    path.join(repoRoot, "tooling/fixtures/runtime-family-wallet-consumer"),
    consumerSource,
    { recursive: true },
  );

  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumerRoot);
  run("pnpm", ["exec", "tsc", "-p", path.join(consumerRoot, "tsconfig.json")]);
  const output = run("node", [path.join(consumerRoot, "dist/index.js")]);
  process.stdout.write(output);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
