#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..", "..");
const require = createRequire(path.join(repoRoot, "package.json"));

const loadRollupNativeFromPnpmStore = () => {
  const pnpmStore = path.join(repoRoot, "node_modules", ".pnpm");
  if (!fs.existsSync(pnpmStore)) {
    return false;
  }

  const rollupEntries = fs
    .readdirSync(pnpmStore)
    .filter((entry) => entry.startsWith("rollup@"))
    .sort()
    .reverse();

  for (const entry of rollupEntries) {
    const nativeEntrypoint = path.join(
      pnpmStore,
      entry,
      "node_modules",
      "rollup",
      "dist",
      "native.js",
    );
    if (fs.existsSync(nativeEntrypoint)) {
      require(nativeEntrypoint);
      return true;
    }
  }

  return false;
};

const resolveRollupNative = () => {
  try {
    require("rollup/dist/native.js");
    return { ok: true };
  } catch (error) {
    try {
      if (loadRollupNativeFromPnpmStore()) {
        return { ok: true };
      }
    } catch (storeError) {
      const message =
        storeError instanceof Error ? storeError.message : String(storeError);
      const match = message.match(/Cannot find module (@rollup\/rollup-[\w-]+)/);
      return { ok: false, missingPackage: match?.[1], message };
    }

    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(/Cannot find module (@rollup\/rollup-[\w-]+)/);
    return { ok: false, missingPackage: match?.[1], message };
  }
};

const initial = resolveRollupNative();
if (!initial.ok) {
  if (!initial.missingPackage) {
    throw new Error(
      `Rollup native optional dependency is missing: ${initial.message}`,
    );
  }

  const install = spawnSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    [
      "install",
      "--frozen-lockfile",
      "--ignore-scripts",
      "--prefer-offline",
    ],
    {
      cwd: repoRoot,
      stdio: "inherit",
      env: { ...process.env, pnpm_config_engine_strict: "false" },
    },
  );

  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}
