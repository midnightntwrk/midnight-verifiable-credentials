import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
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
if [[ -n "\${COMPACT_SLEEP:-}" ]]; then sleep "$COMPACT_SLEEP"; fi
mkdir -p "$3/contract"
printf '%s\\n' generated > "$3/contract/index.js"
`);
  execFileSync("chmod", ["+x", path.join(bin, "compact")]);
  return { fixture, bin, log: path.join(fixture, "invocations.log") };
};

const invoke = (fixture, bin, log, outputs = ["src/managed/main"], command = ["compact", "compile", "src/main.compact", "src/managed/main"], extraEnv = {}) => execFileSync(
  process.execPath,
  [helper, "--manifest", "src/managed/.compact-artifact.json", "--source-root", "src", ...outputs.flatMap((output) => ["--output", output]), "--runtime-version", "0.15.0", "--", ...command],
  { cwd: fixture, env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, COMPACT_LOG: log, ...extraEnv }, encoding: "utf8" },
);

const run = (fixture, bin, log, extra = [], command = ["compact", "compile", "src/main.compact", "src/managed/main"]) => execFileSync(
  process.execPath,
  [helper, "--manifest", "src/managed/.compact-artifact.json", "--source-root", "src", "--output", "src/managed/main", "--runtime-version", "0.15.0", ...extra, "--", ...command],
  { cwd: fixture, env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, COMPACT_LOG: log }, encoding: "utf8" },
);

const runConcurrent = (fixture, bin, log, extra = [], command = ["compact", "compile", "src/main.compact", "src/managed/main"]) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [helper, "--manifest", "src/managed/.compact-artifact.json", "--source-root", "src", "--output", "src/managed/main", "--runtime-version", "0.15.0", ...extra, "--", ...command], {
    cwd: fixture,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, COMPACT_LOG: log, COMPACT_SLEEP: "0.15" },
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr)));
});

const multiCommand = ["sh", "-c", "compact compile src/a.compact src/managed/a && compact compile src/b.compact src/managed/b"];

const invokeRaw = (fixture, bin, log, args, command = ["compact", "compile", "src/main.compact", "src/managed/main"]) => execFileSync(
  process.execPath,
  [helper, ...args, "--", ...command],
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

    invoke(fixture, bin, log, ["src/managed/main"], ["compact", "compile", "src/main.compact", "src/managed/main"], { COMPACT_FAKE_VERSION: "0.31.0" });
    const final = readFileSync(log, "utf8").trim().split("\n").filter(Boolean);
    assert.equal(final.filter((line) => line === "compile src/main.compact src/managed/main").length, 4);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("source changes regenerate every owned output and preserve manifest integrity", () => {
  const { fixture, bin, log } = createFixture();
  mkdirSync(path.join(fixture, "src"), { recursive: true });
  writeFileSync(path.join(fixture, "src/a.compact"), "contract A {}\n");
  writeFileSync(path.join(fixture, "src/b.compact"), "contract B {}\n");
  try {
    invoke(fixture, bin, log, ["src/managed/a", "src/managed/b"], multiCommand);
    writeFileSync(path.join(fixture, "src/a.compact"), "contract A { circuit changed(): [] {} }\n");
    invoke(fixture, bin, log, ["src/managed/a", "src/managed/b"], multiCommand);
    const compiles = readFileSync(log, "utf8").split("\n").filter((line) => line.startsWith("compile src/"));
    assert.equal(compiles.filter((line) => line.includes("src/a.compact")).length, 2);
    assert.equal(compiles.filter((line) => line.includes("src/b.compact")).length, 2);
    const manifest = JSON.parse(readFileSync(path.join(fixture, "src/managed/.compact-artifact.json"), "utf8"));
    assert.deepEqual(manifest.outputs, ["src/managed/a", "src/managed/b"]);
    assert.ok(existsSync(path.join(fixture, "src/managed/a/contract/index.js")));
    assert.ok(existsSync(path.join(fixture, "src/managed/b/contract/index.js")));
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("digest follows transitive Compact includes and fails closed when one is unresolved", () => {
  const { fixture, bin, log } = createFixture();
  mkdirSync(path.join(fixture, "shared"), { recursive: true });
  writeFileSync(path.join(fixture, "src/main.compact"), '/* leading */ include /* between */ "../shared/shared" /* trailing */; // rationale\ncontract Main {}\n');
  writeFileSync(path.join(fixture, "shared/shared.compact"), "// shared v1\n");
  try {
    invoke(fixture, bin, log);
    writeFileSync(path.join(fixture, "shared/shared.compact"), "// shared v2\n");
    invoke(fixture, bin, log);
    assert.equal(readFileSync(log, "utf8").split("\n").filter((line) => line === "compile src/main.compact src/managed/main").length, 2);
    writeFileSync(path.join(fixture, "src/main.compact"), 'include "../shared/missing";\ncontract Main {}\n');
    assert.throws(() => invoke(fixture, bin, log), /Unresolved Compact include/u);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("rejects traversal before deletion and publication", () => {
  const { fixture, bin, log } = createFixture();
  try {
    for (const args of [
      ["--manifest", "src/managed/.compact-artifact.json", "--source-root", "../outside-src", "--output", "src/managed/main", "--runtime-version", "0.15.0"],
      ["--manifest", "../outside.json", "--source-root", "src", "--output", "src/managed/main", "--runtime-version", "0.15.0"],
      ["--manifest", "src/managed/.compact-artifact.json", "--source-root", "src", "--output", "../escaped-output", "--runtime-version", "0.15.0"],
    ]) assert.throws(() => invokeRaw(fixture, bin, log, args), /must remain inside the package root/u);
    assert.equal(existsSync(path.join(path.dirname(fixture), "escaped-output")), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("resets malformed manifests and recovers stale and ownerless locks safely", async () => {
  const { fixture, bin, log } = createFixture();
  const lockPath = path.join(fixture, "src/managed/.compact-artifact.json.lock");
  try {
    mkdirSync(lockPath, { recursive: true });
    writeFileSync(path.join(lockPath, "owner"), JSON.stringify({ pid: 2147483647, token: "dead", acquiredAt: 0 }));
    await Promise.all([runConcurrent(fixture, bin, log), runConcurrent(fixture, bin, log)]);
    assert.equal(readFileSync(log, "utf8").split("\n").filter((line) => line === "compile src/main.compact src/managed/main").length, 1);

    writeFileSync(path.join(fixture, "src/managed/.compact-artifact.json"), JSON.stringify({ schema: 1, outputs: {} }));
    invoke(fixture, bin, log);
    writeFileSync(path.join(fixture, "src/managed/.compact-artifact.json"), JSON.stringify({ schema: 1, outputs: "not-an-array" }));
    invoke(fixture, bin, log);
    assert.ok(readFileSync(path.join(fixture, "src/managed/.compact-artifact.json"), "utf8").includes('"sourceDigest"'));

    rmSync(path.join(fixture, "src/managed/.compact-artifact.json"), { force: true });
    mkdirSync(lockPath, { recursive: true });
    utimesSync(lockPath, new Date(0), new Date(0));
    invoke(fixture, bin, log);
    assert.equal(existsSync(lockPath), false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("serializes concurrent generation and rejects incomplete direct sub-target ownership", async () => {
  const { fixture, bin, log } = createFixture();
  writeFileSync(path.join(fixture, "src/a.compact"), "contract A {}\n");
  writeFileSync(path.join(fixture, "src/b.compact"), "contract B {}\n");
  try {
    await Promise.all([runConcurrent(fixture, bin, log, ["--output", "src/managed/main"]), runConcurrent(fixture, bin, log, ["--output", "src/managed/main"]) ]);
    assert.equal(readFileSync(log, "utf8").split("\n").filter((line) => line === "compile src/main.compact src/managed/main").length, 1);
    rmSync(path.join(fixture, "src/managed/.compact-artifact.json"), { force: true });
    rmSync(path.join(fixture, "src/managed/main"), { recursive: true, force: true });
    invoke(fixture, bin, log, ["src/managed/a", "src/managed/b"], multiCommand);
    rmSync(path.join(fixture, "src/managed/b"), { recursive: true });
    assert.throws(() => invoke(fixture, bin, log, ["src/managed/a"], ["compact", "compile", "src/a.compact", "src/managed/a"]), /owns outputs not declared/u);
    assert.ok(!existsSync(path.join(fixture, "src/managed/b/contract/index.js")));
    invoke(fixture, bin, log, ["src/managed/a", "src/managed/b"], multiCommand);
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
    const compactEntries = Object.entries(scripts)
      .filter(([name]) => name === "compact" || name.startsWith("compact:"));
    const compactScripts = compactEntries.map(([, command]) => command).join(" ");
    assert.match(compactScripts, /ensure-compact-artifacts\.mjs/u, relative);
    for (const [, command] of compactEntries) assert.doesNotMatch(command, /ensure-compact-artifacts\.mjs[\s\S]*&&\s+node\s+.*ensure-compact-artifacts\.mjs/u, relative);
    if (relative === "packages/use-cases/age-gate/contract/package.json") {
      assert.match(scripts["compact:demo"], /--output src\/managed\/demo-revocation/u, relative);
      assert.match(scripts["compact:demo-revocation"], /--output src\/managed\/demo/u, relative);
    }
  }
});
