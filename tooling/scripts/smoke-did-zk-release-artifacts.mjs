import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";

const require = createRequire(import.meta.url);
const expectedVersion = "0.5.0-rc1";
const contractEntry = require.resolve("@midnight-ntwrk/midnight-did-contract");
const contractDist = path.dirname(contractEntry);
const contractRoot = path.resolve(contractDist, "..");
const packageJson = JSON.parse(
  await fs.readFile(path.join(contractRoot, "package.json"), "utf8"),
);

if (packageJson.version !== expectedVersion) {
  throw new Error(
    `Expected @midnight-ntwrk/midnight-did-contract@${expectedVersion}; ` +
      `found ${packageJson.version}`,
  );
}

const zkConfigPath = path.join(contractDist, "managed", "did");
const contractInfo = JSON.parse(
  await fs.readFile(
    path.join(zkConfigPath, "compiler", "contract-info.json"),
    "utf8",
  ),
);
// The rc1 release did not publish a signed artifact manifest. This smoke checks
// package-local presence and provider readability, not artifact provenance or
// digest integrity; ADR-0003 tracks the stronger release contract.
const proofCircuitIds = contractInfo.circuits
  .filter((circuit) => circuit.proof === true)
  .map((circuit) => circuit.name);

if (proofCircuitIds.length === 0) {
  throw new Error("Published DID contract does not declare proof circuits");
}

const provider = new NodeZkConfigProvider(zkConfigPath);
for (const circuitId of proofCircuitIds) {
  const [proverKey, verifierKey, zkir] = await Promise.all([
    provider.getProverKey(circuitId),
    provider.getVerifierKey(circuitId),
    provider.getZKIR(circuitId),
  ]);
  for (const [kind, artifact] of [
    ["prover", proverKey],
    ["verifier", verifierKey],
    ["zkir", zkir],
  ]) {
    if (
      !(artifact instanceof Uint8Array || artifact instanceof ArrayBuffer) ||
      artifact.byteLength <= 0
    ) {
      throw new TypeError(
        `DID ${circuitId}.${kind} artifact must be non-empty binary data`,
      );
    }
  }
}

console.log(
  `[smoke-did-zk-release-artifacts] Verified ${proofCircuitIds.length} ` +
    `package-local proof artifact sets from ` +
    `@midnight-ntwrk/midnight-did-contract@${expectedVersion}.`,
);
