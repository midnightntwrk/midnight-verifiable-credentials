import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

const LEDGER_PACKAGE = '@midnight-ntwrk/ledger-v8';
const DID_JUBJUB_SCHNORR_PACKAGE =
  '@midnight-ntwrk/midnight-did-jubjub-schnorr';
// Keep these versions in sync with tooling/vendor/midnight-did/README.md when
// changing DID package refs or the workspace Midnight JS baseline.
const DID_LEDGER_VERSION = '8.0.3';
const WORKSPACE_LEDGER_VERSION = '8.1.0';

const { stdout } = await execFileAsync(
  'pnpm',
  ['why', '--recursive', LEDGER_PACKAGE, '--json'],
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
      const parentPackage = ancestry.at(-1) ?? '<workspace>';
      const ledgerEdge = {
        version: dependency.version,
        parentPackage,
        path: nextAncestry.join(' > '),
      };
      ledgerEdges.push(ledgerEdge);

      if (dependency.version === DID_LEDGER_VERSION) {
        if (parentPackage !== DID_JUBJUB_SCHNORR_PACKAGE) {
          failures.push(
            `${DID_LEDGER_VERSION} is only allowed directly under ` +
              `${DID_JUBJUB_SCHNORR_PACKAGE}: ${ledgerEdge.path}`,
          );
        }
      } else if (dependency.version !== WORKSPACE_LEDGER_VERSION) {
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

const didLedgerEdgeCount = ledgerEdges.filter(
  ({ parentPackage, version }) =>
    parentPackage === DID_JUBJUB_SCHNORR_PACKAGE &&
    version === DID_LEDGER_VERSION,
).length;
console.log(
  `[check-ledger-v8-boundary] Verified ${ledgerEdges.length} ` +
    `${LEDGER_PACKAGE} dependency edges; ${didLedgerEdgeCount} edge(s) use ` +
    `${DID_LEDGER_VERSION} directly under ${DID_JUBJUB_SCHNORR_PACKAGE}.`,
);
