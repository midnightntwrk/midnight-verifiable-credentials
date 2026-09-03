import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("credential-compact root remains browser-bundleable for existing imports", async () => {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "credential-compact-browser-"));
  try {
    const entryPoint = path.join(temporaryRoot, "consumer.mjs");
    writeFileSync(
      entryPoint,
      `import { JUBJUB_SUBGROUP_ORDER } from ${JSON.stringify(
        path.join(repoRoot, "packages/core/compact/src/index.ts"),
      )};\nconsole.log(JUBJUB_SUBGROUP_ORDER);\n`,
    );
    const result = await build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: "browser",
      format: "esm",
      target: "es2022",
      loader: { ".wasm": "file" },
      outdir: path.join(temporaryRoot, "out"),
      write: false,
      logLevel: "silent",
    });
    assert.ok(result.outputFiles.length > 0);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
