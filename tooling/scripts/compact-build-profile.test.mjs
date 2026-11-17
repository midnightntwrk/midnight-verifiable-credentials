// SPDX-License-Identifier: Apache-2.0
// Synthetic node-only build/metadata regressions, NOT runtime/crypto validation.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import {
  assertBuildProfile,
  assertInstalledCohort,
  declaredBuildProfile,
} from "./compact-build-profile.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const packages = ["packages/core/compact", "packages/credential-did-midnight"];
test("hosted compiler pins agree with both package profiles", () => {
  for (const workflow of ["ci.yml", "publish.yml"]) {
    const source = readFileSync(
      resolve(repoRoot, ".github/workflows", workflow),
      "utf8",
    );
    assert.equal(
      source.match(/^  COMPACT_COMPILER_VERSION: (.+)$/mu)?.[1],
      "0.36.0",
    );
  }
});

const write = (file, contents) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
};

for (const packagePath of packages) {
  const packageJson = JSON.parse(
    readFileSync(resolve(repoRoot, packagePath, "package.json"), "utf8"),
  );
  const profile = { schema: 2, ...declaredBuildProfile(packageJson) };

  test(`${packagePath}: schema 2 separates backend from public npm Ledger support`, () => {
    assert.equal(profile.compiler, "0.36.0");
    assert.equal(profile.backend, "zkir-3.2.0-rc.2");
    assert.deepEqual(profile.supportedLedger, {
      name: "@midnightntwrk/ledger-v9",
      version: "1.0.0",
    });
    assertBuildProfile(packageJson, profile, "0.21.0");
    for (const change of [
      { schema: 1 },
      { compiler: "0.31.1" },
      { backend: "ledger-9" },
      { backend: "zkir-3.2.0-rc.3" },
      { backend: undefined },
      { ledger: "zkir-3.2.0-rc.2" },
      { runtime: { name: "wrong", version: "0.21.0" } },
      { runtime: { name: profile.runtime.name, version: "0.16.0" } },
      {
        supportedLedger: {
          name: "@midnight-ntwrk/ledger-v9",
          version: "1.0.0",
        },
      },
      {
        supportedLedger: {
          name: profile.supportedLedger.name,
          version: "9.0.0",
        },
      },
    ])
      assert.throws(
        () =>
          assertBuildProfile(packageJson, { ...profile, ...change }, "0.21.0"),
        /profile drift/u,
      );
    assert.throws(
      () => assertBuildProfile(packageJson, profile, "0.16.0"),
      /profile drift/u,
    );
    for (const change of [
      { compactCompilerVersion: "^0.36.0" },
      { compactRuntimeVersion: undefined },
      { compactBackendVersion: "ledger-9" },
      { ledgerVersion: "ledger-8.0.2" },
      {
        supportedLedger: {
          name: "@midnightntwrk/ledger-v9",
          version: "^1.0.0",
        },
      },
    ])
      assert.throws(
        () =>
          declaredBuildProfile({
            ...packageJson,
            midnight: { ...packageJson.midnight, ...change },
          }),
        /must declare exact/u,
      );
  });

  test(`${packagePath}: checks the installed public cohort without banning SDK internals`, () => {
    const dependencies = {
      [profile.runtime.name]: { version: profile.runtime.version },
      // An unrelated SDK-internal old Ledger is not a public-cohort mismatch.
      "@midnight-ntwrk/ledger-v8": { version: "8.1.0" },
    };
    if (packageJson.dependencies["@midnight-ntwrk/midnight-did-domain"]) {
      dependencies["@midnight-ntwrk/midnight-did-domain"] = {
        version: "1.0.0-rc1",
      };
      dependencies["@midnight-ntwrk/midnight-did-jubjub-schnorr"] = {
        version: "1.0.0-rc1",
        dependencies: {
          [profile.supportedLedger.name]: {
            version: profile.supportedLedger.version,
          },
        },
      };
    }
    const graph = [{ dependencies }];
    const cohort = assertInstalledCohort(packageJson, graph);
    assert.equal(cohort.length, packagePath.includes("credential-did") ? 4 : 1);
    const wrong = structuredClone(graph);
    wrong[0].dependencies[profile.runtime.name].version = "0.16.0";
    assert.throws(
      () => assertInstalledCohort(packageJson, wrong),
      /Installed cohort drift/u,
    );
    assert.throws(() => assertInstalledCohort(packageJson, []), /missing/u);
    if (dependencies["@midnight-ntwrk/midnight-did-domain"]) {
      const stale = structuredClone(graph);
      stale[0].dependencies["@midnight-ntwrk/midnight-did-domain"].version =
        "0.7.0";
      assert.throws(
        () => assertInstalledCohort(packageJson, stale),
        /Installed cohort drift/u,
      );
      const missingLedger = structuredClone(graph);
      delete missingLedger[0].dependencies[
        "@midnight-ntwrk/midnight-did-jubjub-schnorr"
      ].dependencies[profile.supportedLedger.name];
      assert.throws(
        () => assertInstalledCohort(packageJson, missingLedger),
        /missing/u,
      );
    }
  });

  test(`${packagePath}: both executable scripts fail closed; manifest is deterministic`, (t) => {
    const fixture = mkdtempSync(resolve(tmpdir(), "vc-build-profile-"));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    const root = resolve(fixture, packagePath);
    cpSync(
      resolve(repoRoot, packagePath, "scripts"),
      resolve(root, "scripts"),
      { recursive: true },
    );
    cpSync(
      resolve(repoRoot, "tooling/scripts/compact-build-profile.mjs"),
      resolve(fixture, "tooling/scripts/compact-build-profile.mjs"),
      { recursive: true },
    );
    const manifestPath = resolve(root, "dist/compact-build.json");
    const runtimePath = resolve(
      root,
      "node_modules/@midnight-ntwrk/compact-runtime/package.json",
    );
    const savePackage = (p = packageJson) =>
      write(resolve(root, "package.json"), JSON.stringify(p));
    savePackage();
    write(runtimePath, JSON.stringify({ version: "0.21.0" }));
    write(resolve(root, "src/example.compact"), "synthetic source\n");
    write(
      resolve(root, "src/managed/example.compact"),
      "ignored generated input\n",
    );
    write(resolve(root, "dist/index.js"), "// synthetic artifact\n");
    write(
      resolve(fixture, "bin/compact"),
      `#!${process.execPath}\nconst args = process.argv.slice(2).join(' ');\nif (args === 'compile --version') console.log(process.env.TEST_COMPILER ?? '0.36.0 (fixture)');\nelse if (args === 'compile --ledger-version') console.log(process.env.TEST_BACKEND ?? 'zkir-3.2.0-rc.2');\nelse process.exit(2);\n`,
    );
    chmodSync(resolve(fixture, "bin/compact"), 0o755);
    const env = {
      ...process.env,
      PATH: `${resolve(fixture, "bin")}:${process.env.PATH}`,
    };
    const run = (script, overrides = {}) =>
      spawnSync(process.execPath, [resolve(root, "scripts", script)], {
        env: { ...env, ...overrides },
        encoding: "utf8",
      });
    // The fixture compiler is synthetic metadata only; it never compiles code.
    assert.equal(run("check-toolchain.mjs").status, 0);
    assert.equal(run("write-build-manifest.mjs").status, 0);
    const originalBytes = readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(originalBytes);
    assertBuildProfile(packageJson, manifest, "0.21.0");
    assert.deepEqual(manifest.sourceFiles, ["src/example.compact"]);
    assert.match(manifest.sourceDigest, /^[a-f0-9]{64}$/u);
    assert.match(manifest.artifactDigest, /^[a-f0-9]{64}$/u);
    assert.equal(run("write-build-manifest.mjs").status, 0);
    assert.equal(readFileSync(manifestPath, "utf8"), originalBytes);
    write(
      resolve(root, "src/managed/example.compact"),
      "changed generated input\n",
    );
    assert.equal(run("write-build-manifest.mjs").status, 0);
    assert.equal(readFileSync(manifestPath, "utf8"), originalBytes);

    const rejectBoth = (overrides = {}) => {
      for (const script of [
        "check-toolchain.mjs",
        "write-build-manifest.mjs",
      ]) {
        const result = run(script, overrides);
        assert.notEqual(result.status, 0, `${script} should reject drift`);
        assert.match(result.stderr, /profile drift|must declare exact/u);
      }
      assert.equal(
        readFileSync(manifestPath, "utf8"),
        originalBytes,
        "drift must not overwrite metadata",
      );
    };
    rejectBoth({ TEST_COMPILER: "0.31.1" });
    rejectBoth({ TEST_COMPILER: "not a compiler version" });
    rejectBoth({ TEST_BACKEND: "ledger-9" });
    rejectBoth({ TEST_BACKEND: "zkir-3.2.0-rc.3" });
    write(runtimePath, JSON.stringify({ version: "0.16.0" }));
    rejectBoth();
    write(runtimePath, JSON.stringify({ version: "0.21.0" }));
    savePackage({
      ...packageJson,
      dependencies: {
        ...packageJson.dependencies,
        "@midnight-ntwrk/compact-runtime": "^0.21.0",
      },
    });
    rejectBoth();
    savePackage();
    write(resolve(root, "src/example.compact"), "changed source\n");
    write(resolve(root, "dist/index.js"), "// changed artifact\n");
    assert.equal(run("write-build-manifest.mjs").status, 0);
    const changed = JSON.parse(readFileSync(manifestPath, "utf8"));
    assert.notEqual(changed.sourceDigest, manifest.sourceDigest);
    assert.notEqual(changed.artifactDigest, manifest.artifactDigest);
  });
}
