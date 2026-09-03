import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = path.join(
  repoRoot,
  "tooling/fixtures/compact-family-composition/two-family.compact",
);
const read = (relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

const surfaces = [
  {
    family: "birth",
    standalone:
      "packages/prototypes/credential-families/birth/src/birth-credential.compact",
    composable:
      "packages/prototypes/credential-families/birth/src/birth-credential/composable.compact",
    vcPrefix: "BirthCredentialVC_",
    vpPrefix: "BirthCredentialVP_",
  },
  {
    family: "hello-family",
    standalone:
      "packages/prototypes/credential-families/hello-family/src/hello-family-credential.compact",
    composable:
      "packages/prototypes/credential-families/hello-family/src/hello-family-credential/composable.compact",
    vcPrefix: "HelloFamilyVC_",
    vpPrefix: "HelloFamilyVP_",
  },
];

const fail = (message) => {
  throw new Error(`[compact-composition] ${message}`);
};

const count = (source, value) => source.split(value).length - 1;
const fixtureSource = readFileSync(fixture, "utf8");
const canonicalInclude =
  'include "../../../packages/core/compact/src/credentials/composable";';
if (count(fixtureSource, canonicalInclude) !== 1) {
  fail("fixture must include the canonical shared core exactly once");
}
if (fixtureSource.includes("core/primitives/credentials")) {
  fail("fixture must not use the private credentials compatibility facade");
}
if (!fixtureSource.includes("NON-AUTHORITATIVE COMPOSITION EVIDENCE ONLY")) {
  fail("fixture must carry an explicit non-authoritative evidence label");
}

for (const surface of surfaces) {
  const standalone = read(surface.standalone);
  const composable = read(surface.composable);
  if ((standalone.match(/^include /gmu) ?? []).length !== 2) {
    fail(`${surface.family} standalone root must contain exactly two includes`);
  }
  if (!standalone.includes("packages/core/compact/src/credentials/composable")) {
    fail(`${surface.family} standalone root must use the canonical shared core`);
  }
  if (/packages\/core|credentials\/composable/u.test(composable)) {
    fail(`${surface.family} composable must not include a shared core`);
  }
  if (!composable.includes(`prefix ${surface.vcPrefix};`)) {
    fail(`${surface.family} composable must prefix its VC module`);
  }
  if (!composable.includes(`prefix ${surface.vpPrefix};`)) {
    fail(`${surface.family} composable must prefix its VP module`);
  }
  if (/^export type (?:Credential|Presentation)\b/mu.test(composable)) {
    fail(`${surface.family} composable leaks an unprefixed family alias`);
  }
}

const output = mkdtempSync(path.join(os.tmpdir(), "midnight-vc-two-family-"));
try {
  const compile = spawnSync("compact", ["compile", fixture, output], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (compile.status !== 0) {
    process.stderr.write(compile.stdout ?? "");
    process.stderr.write(compile.stderr ?? "");
    fail(`Compact compiler exited with status ${compile.status}`);
  }

  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) {
        files.push({
          path: path.relative(output, absolute),
          bytes: statSync(absolute).size,
        });
      }
    }
  };
  visit(output);
  files.sort((left, right) => left.path.localeCompare(right.path));

  const contractInfoPath = path.join(output, "compiler/contract-info.json");
  const contractInfo = JSON.parse(readFileSync(contractInfoPath, "utf8"));
  const proofCircuits = contractInfo.circuits.filter((circuit) => circuit.proof);
  const proofArtifacts = files.filter(({ path: artifactPath }) =>
    /\.(?:prover|verifier|zkir|bzkir)$/u.test(artifactPath),
  );
  if (proofCircuits.length !== 0 || proofArtifacts.length !== 0) {
    fail("non-authoritative compile fixture must not produce proof circuits or proof artifacts");
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        compilerVersion: contractInfo["compiler-version"],
        fixture: path.relative(repoRoot, fixture),
        families: surfaces.map(({ family }) => family),
        circuitCount: contractInfo.circuits.length,
        proofCircuitCount: 0,
        k: "not-applicable:no-proof-circuits",
        artifactBytes: files,
        authority: "non-authoritative-compile-composition-evidence",
      },
      null,
      2,
    )}\n`,
  );
} finally {
  rmSync(output, { recursive: true, force: true });
}
