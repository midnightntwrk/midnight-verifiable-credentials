import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const LEDGER_PACKAGE = "@midnight-ntwrk/ledger-v8";
// Keep these versions in sync with tooling/vendor/midnight-did/README.md when
// changing DID package refs or the workspace Midnight JS baseline.
const WORKSPACE_LEDGER_VERSION = "8.1.0";

const { stdout } = await execFileAsync(
  "pnpm",
  ["why", "--recursive", LEDGER_PACKAGE, "--json"],
  {
    cwd: repoRoot,
    maxBuffer: 32 * 1024 * 1024,
  },
);

const dependencyTrees = JSON.parse(stdout);
const failures = [];
const ledgerEdges = [];

const visitDependencies = (dependencies, ancestry) => {
  for (const [packageName, dependency] of Object.entries(dependencies ?? {})) {
    const nextAncestry = [...ancestry, packageName];
    if (packageName === LEDGER_PACKAGE) {
      const parentPackage = ancestry.at(-1) ?? "<workspace>";
      const ledgerEdge = {
        version: dependency.version,
        parentPackage,
        path: nextAncestry.join(" > "),
      };
      ledgerEdges.push(ledgerEdge);

      if (dependency.version !== WORKSPACE_LEDGER_VERSION) {
        failures.push(
          `Unexpected ${LEDGER_PACKAGE}@${dependency.version}: ` +
            ledgerEdge.path,
        );
      }
    }
    visitDependencies(dependency.dependencies, nextAncestry);
  }
};

for (const dependencyTree of dependencyTrees) {
  visitDependencies(dependencyTree.dependencies, [dependencyTree.name]);
}

if (failures.length > 0) {
  console.error(`${LEDGER_PACKAGE} boundary check failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const dustSecretKey = ledger.DustSecretKey.fromSeed(new Uint8Array(32));
// This construction is the assertion: duplicate ledger WASM modules throw
// while DustWallet creates its DustLocalState from these parameters.
DustWallet({
  networkId: "undeployed",
  costParameters: {
    additionalFeeOverhead: 0n,
    feeBlocksMargin: 0,
  },
  indexerClientConnection: {
    indexerHttpUrl: "http://127.0.0.1:1",
    indexerWsUrl: "ws://127.0.0.1:1",
  },
  provingServerUrl: new URL("http://127.0.0.1:2"),
  relayURL: new URL("ws://127.0.0.1:3"),
}).startWithSecretKey(
  dustSecretKey,
  ledger.LedgerParameters.initialParameters().dust,
);

console.log(
  `[check-ledger-v8-boundary] Verified ${ledgerEdges.length} ` +
    `${LEDGER_PACKAGE} dependency edges resolve to ` +
    `${WORKSPACE_LEDGER_VERSION}; wallet class identity is compatible.`,
);
process.exit(0);
