// SPDX-License-Identifier: Apache-2.0
// Build-time tooling only: never imported by published package runtime code.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const exactVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;

export const declaredBuildProfile = (packageJson) => {
  const metadata = packageJson.midnight;
  if (
    !exactVersion.test(metadata?.compactCompilerVersion ?? "") ||
    !exactVersion.test(metadata?.compactRuntimeVersion ?? "") ||
    typeof metadata?.compactBackendVersion !== "string" ||
    !/^zkir-\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(
      metadata.compactBackendVersion,
    ) ||
    metadata.ledgerVersion !== undefined ||
    metadata.supportedLedger?.name !== "@midnightntwrk/ledger-v9" ||
    !exactVersion.test(metadata.supportedLedger?.version ?? "") ||
    packageJson.dependencies?.["@midnight-ntwrk/compact-runtime"] !==
      metadata.compactRuntimeVersion
  ) {
    throw new Error(
      "Compact package must declare exact compiler/runtime/backend and separate public Ledger support metadata",
    );
  }
  return {
    compiler: metadata.compactCompilerVersion,
    backend: metadata.compactBackendVersion,
    runtime: {
      name: "@midnight-ntwrk/compact-runtime",
      version: metadata.compactRuntimeVersion,
    },
    // This is a supported npm operation cohort, not compiler --ledger-version
    // output and not proof that this dependency is installed or compatible.
    supportedLedger: {
      name: metadata.supportedLedger.name,
      version: metadata.supportedLedger.version,
    },
  };
};

export const assertBuildProfile = (packageJson, manifest, runtimeVersion) => {
  const expected = declaredBuildProfile(packageJson);
  if (
    manifest.schema !== 2 ||
    manifest.compiler !== expected.compiler ||
    manifest.backend !== expected.backend ||
    manifest.ledger !== undefined ||
    manifest.runtime?.name !== expected.runtime.name ||
    manifest.runtime?.version !== expected.runtime.version ||
    runtimeVersion !== expected.runtime.version ||
    manifest.supportedLedger?.name !== expected.supportedLedger.name ||
    manifest.supportedLedger?.version !== expected.supportedLedger.version
  ) {
    throw new Error(
      `Compact build profile drift: expected ${JSON.stringify(expected)}, found ${JSON.stringify(manifest)}, installed runtime ${runtimeVersion}`,
    );
  }
};

// Inspect the installed clean-consumer graph, not just workspace manifests.
// Older SDK internals are not banned by name; only the public selected cohort
// must be present at the exact declared versions.
export const assertInstalledCohort = (packageJson, graph) => {
  const profile = declaredBuildProfile(packageJson);
  const wanted = new Map([[profile.runtime.name, profile.runtime.version]]);
  const didPackages = [
    "@midnight-ntwrk/midnight-did-domain",
    "@midnight-ntwrk/midnight-did-jubjub-schnorr",
  ];
  if (
    didPackages.some((name) => packageJson.dependencies?.[name] !== undefined)
  ) {
    for (const name of didPackages) {
      const version = packageJson.dependencies?.[name];
      if (!exactVersion.test(version ?? ""))
        throw new Error(`Expected exact ${name} dependency`);
      wanted.set(name, version);
    }
    wanted.set(profile.supportedLedger.name, profile.supportedLedger.version);
  }
  const found = new Map();
  const visit = (node) => {
    for (const kind of [
      "dependencies",
      "devDependencies",
      "optionalDependencies",
    ]) {
      for (const [name, dependency] of Object.entries(node[kind] ?? {})) {
        if (wanted.has(name)) {
          if (dependency.version !== wanted.get(name)) {
            throw new Error(
              `Installed cohort drift: ${name} expected ${wanted.get(name)}, found ${dependency.version}`,
            );
          }
          found.set(name, {
            name,
            version: dependency.version,
            path: dependency.path,
            resolved: dependency.resolved,
          });
        }
        visit(dependency);
      }
    }
  };
  if (!Array.isArray(graph))
    throw new Error("Expected a pnpm installed dependency graph array");
  graph.forEach(visit);
  for (const name of wanted.keys()) {
    if (!found.has(name))
      throw new Error(`Installed cohort is missing ${name}`);
  }
  return [...found.values()];
};

export const readToolchain = (root) => {
  const packageJson = JSON.parse(
    readFileSync(resolve(root, "package.json"), "utf8"),
  );
  const expected = declaredBuildProfile(packageJson);
  const compilerOutput = execFileSync("compact", ["compile", "--version"], {
    encoding: "utf8",
  }).trim();
  const compiler = compilerOutput.match(
    /(?:^|\s)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\s|$)/u,
  )?.[1];
  // Since 0.36, this flag reports zkir-v3's dependency identity, not Ledger.
  const backend = execFileSync("compact", ["compile", "--ledger-version"], {
    encoding: "utf8",
  }).trim();
  const runtimeVersion = createRequire(resolve(root, "package.json"))(
    "@midnight-ntwrk/compact-runtime/package.json",
  ).version;
  const measured = {
    schema: 2,
    compiler: compiler ?? compilerOutput,
    backend,
    runtime: { name: expected.runtime.name, version: runtimeVersion },
    supportedLedger: expected.supportedLedger,
  };
  assertBuildProfile(packageJson, measured, runtimeVersion);
  return measured;
};
