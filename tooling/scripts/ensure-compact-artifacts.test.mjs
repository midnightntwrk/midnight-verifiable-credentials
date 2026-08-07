import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const helper = path.join(root, "tooling/scripts/ensure-compact-artifacts.mjs");

const createFixture = () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "compact-artifacts-"));
  mkdirSync(path.join(fixture, "src"), { recursive: true });
  writeFileSync(path.join(fixture, "src/main.compact"), "contract Main {}\n");
  const bin = path.join(fixture, "bin");
  mkdirSync(bin);
  writeFileSync(path.join(bin, "compact"), `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$COMPACT_LOG"
if [[ "$1" == compile && "$2" == --version ]]; then printf '%s\\n' "${"${COMPACT_FAKE_VERSION:-0.30.0}"}"; exit 0; fi
mkdir -p "$3/contract"
printf '%s\\n' generated > "$3/contract/index.js"
`);
  execFileSync("chmod", ["+x", path.join(bin, "compact")]);
  return { fixture, bin, log: path.join(fixture, "invocations.log") };
};

const run = (fixture, bin, log, extra = []) => execFileSync(
  process.execPath,
  [helper, "--manifest", "src/managed/.compact-artifact.json", "--source-root", "src", "--output", "src/managed/main", "--runtime-version", "0.15.0", ...extra, "--", "compact", "compile", "src/main.compact", "src/managed/main"],
  { cwd: fixture, env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, COMPACT_LOG: log }, encoding: "utf8" },
);

test("reuses a validated artifact and invalidates missing, stale, and toolchain-mismatched output", () => {
  const { fixture, bin, log } = createFixture();
  try {
    run(fixture, bin, log);
    run(fixture, bin, log);
    const first = readFileSync(log, "utf8").trim().split("\n").filter(Boolean);
    assert.equal(first.filter((line) => line === "compile src/main.compact src/managed/main").length, 1);

    rmSync(path.join(fixture, "src/managed/main"), { recursive: true });
    run(fixture, bin, log);
    writeFileSync(path.join(fixture, "src/main.compact"), "contract Main {\n}\n");
    run(fixture, bin, log);
    run(fixture, bin, log, []);
    const withStale = readFileSync(log, "utf8").trim().split("\n").filter(Boolean);
    assert.equal(withStale.filter((line) => line === "compile src/main.compact src/managed/main").length, 3);

    execFileSync(
      process.execPath,
      [helper, "--manifest", "src/managed/.compact-artifact.json", "--source-root", "src", "--output", "src/managed/main", "--runtime-version", "0.15.0", "--", "compact", "compile", "src/main.compact", "src/managed/main"],
      { cwd: fixture, env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, COMPACT_LOG: log, COMPACT_FAKE_VERSION: "0.31.0" }, encoding: "utf8" },
    );
    const final = readFileSync(log, "utf8").trim().split("\n").filter(Boolean);
    assert.equal(final.filter((line) => line === "compile src/main.compact src/managed/main").length, 4);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("Compact package lifecycle scripts share the artifact-first generation owner", () => {
  const packageFiles = [
    "packages/core/compact/package.json",
    "packages/core/primitives/credentials/package.json",
    "packages/core/capabilities/same-holder/package.json",
    "packages/core/primitives/iso-registry/package.json",
    "packages/registry/status-registry/package.json",
    "packages/prototypes/credential-families/birth/package.json",
    "packages/prototypes/credential-families/birth-secret/package.json",
    "packages/prototypes/credential-families/hello-family/package.json",
    "packages/prototypes/credential-families/dummy-claims/package.json",
    "packages/prototypes/credential-families/mixed-claims/package.json",
    "packages/prototypes/credential-families/university-diploma/package.json",
    "packages/prototypes/credential-families/digital-passport/package.json",
    "packages/use-cases/age-gate/contract/package.json",
    "packages/use-cases/hello-verifier/contract/package.json",
    "packages/use-cases/university/contract/package.json",
  ];
  for (const relative of packageFiles) {
    const scripts = JSON.parse(readFileSync(path.join(root, relative), "utf8")).scripts;
    const compactScripts = Object.entries(scripts)
      .filter(([name, command]) => name === "compact" || name.startsWith("compact:"))
      .map(([, command]) => command)
      .join(" ");
    assert.match(compactScripts, /ensure-compact-artifacts\.mjs/u, relative);
    assert.doesNotMatch(compactScripts.replaceAll(/-- compact compile[^&"]+/gu, ""), /(?:^|\s|&&)compact compile\s+(?!--version)/u, relative);
  }
});
