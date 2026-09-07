#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

import {
  runExternalInterop,
  validateExternalInteropConfig,
} from "../dist/index.js";

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const configPath = valueFor("--config");
const outputPath = valueFor("--output");
const dryRun = args.includes("--dry-run");
if (!configPath) {
  console.error("Usage: run-external-interop.mjs --config <json> [--output <json>] [--dry-run]");
  process.exitCode = 2;
} else {
  const config = validateExternalInteropConfig(JSON.parse(await readFile(configPath, "utf8")));
  const result = await runExternalInterop({
    config,
    dryRun,
    request: async (url, init) => {
      const response = await fetch(url, {
        ...init,
        redirect: "error",
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      return {
        status: response.status,
        contentType: response.headers.get("content-type"),
        body: new Uint8Array(await response.arrayBuffer()),
      };
    },
  });
  if (outputPath) await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(result));
  if (!dryRun && (result.oid4vci.status !== "passed" || result.oid4vp.status !== "passed")) process.exitCode = 1;
}
