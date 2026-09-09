#!/usr/bin/env node

import { execFile } from "node:child_process";
import { watch } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "../..");
const syncScript = resolve(scriptDirectory, "sync-content.mjs");
const watchPaths = [
  ["spec", true],
  ["conformance", true],
  ["packages/core/model/README.md", false],
  ["packages/core/model/CHANGELOG.md", false],
  ["packages/core/compact/README.md", false],
  ["packages/core/compact/CHANGELOG.md", false],
  ["docs/decisions/0016-core-only-specification-and-implementation.md", false],
  ["docs/guides/npmjs-publication.md", false],
  ["SECURITY.md", false],
];

let timeout;
let syncing = false;
let pending = false;

const sync = async () => {
  if (syncing) {
    pending = true;
    return;
  }
  syncing = true;
  try {
    const { stdout } = await execFileAsync(process.execPath, [syncScript], {
      cwd: repoRoot,
    });
    process.stdout.write(stdout);
  } catch (error) {
    console.error(`[docs-sync] ${error.stderr || error.message}`);
  } finally {
    syncing = false;
    if (pending) {
      pending = false;
      scheduleSync();
    }
  }
};

const scheduleSync = () => {
  clearTimeout(timeout);
  timeout = setTimeout(sync, 100);
};

await sync();
console.log("Watching canonical documentation sources.");

await Promise.all(
  watchPaths.map(async ([path, recursive]) => {
    for await (const event of watch(resolve(repoRoot, path), { recursive })) {
      if (event.filename) scheduleSync();
    }
  }),
);
