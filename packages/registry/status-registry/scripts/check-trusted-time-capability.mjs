#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
} from "@midnight-ntwrk/compact-runtime";

const packageRoot = new URL("../", import.meta.url).pathname;
const fixturePath = path.join(
  packageRoot,
  "test-fixtures/trusted-time-capability.compact",
);
const temporaryRoot = mkdtempSync(
  path.join(packageRoot, ".tmp-trusted-time-capability-"),
);
const generatedRoot = path.join(temporaryRoot, "generated");

const runCompact = (args) =>
  spawnSync("compact", ["compile", ...args], {
    cwd: packageRoot,
    encoding: "utf8",
  });

const requireCompactSuccess = (args, description) => {
  const result = runCompact(args);
  assert.equal(
    result.status,
    0,
    `${description} failed:\n${result.stdout}${result.stderr}`,
  );
  return result;
};

const compactVersion = (flag) => {
  const result = requireCompactSuccess([flag], `compact ${flag}`);
  return result.stdout.trim();
};

try {
  requireCompactSuccess(
    ["--skip-zk", fixturePath, generatedRoot],
    "trusted-time capability fixture compilation",
  );

  const contractInfo = JSON.parse(
    readFileSync(
      path.join(generatedRoot, "compiler/contract-info.json"),
      "utf8",
    ),
  );
  assert.equal(contractInfo["compiler-version"], "0.30.0");
  assert.equal(contractInfo["language-version"], "0.22.0");
  assert.equal(contractInfo["runtime-version"], "0.15.0");
  assert.equal(compactVersion("--ledger-version"), "ledger-8.0.2");
  assert.equal(compactVersion("--runtime-version"), "0.15.0");

  const expectedCircuits = [
    "assertBlockTimeLt",
    "assertBlockTimeGte",
    "assertBlockTimeGt",
    "assertBlockTimeLte",
    "assertExactNominalLedgerTime",
    "assertNominalLedgerTimeWindow",
  ];
  for (const name of expectedCircuits) {
    const circuit = contractInfo.circuits.find(
      (candidate) => candidate.name === name,
    );
    assert.ok(circuit, `missing generated circuit ${name}`);
    assert.equal(circuit.proof, true, `${name} must require a proof`);
  }

  const generatedContractUrl = pathToFileURL(
    path.join(generatedRoot, "contract/index.js"),
  );
  const { Contract } = await import(
    `${generatedContractUrl.href}?capability=${Date.now()}`
  );
  const contract = new Contract({});
  const initialState = contract.initialState(
    createConstructorContext({}, { bytes: new Uint8Array(32) }),
  );

  const contextAt = (secondsSinceEpoch, secondsSinceEpochErr) => {
    const context = createCircuitContext(
      dummyContractAddress(),
      initialState.currentZswapLocalState,
      initialState.currentContractState.data,
      initialState.currentPrivateState,
      undefined,
      undefined,
      Number(secondsSinceEpoch),
    );
    context.currentQueryContext.block = {
      ...context.currentQueryContext.block,
      secondsSinceEpochErr,
    };
    assert.equal(
      context.currentQueryContext.block.secondsSinceEpoch,
      secondsSinceEpoch,
    );
    return context;
  };

  const accepts = ({
    name,
    args,
    ledgerSeconds = 1_000n,
    ledgerError = 0,
  }) => {
    try {
      contract.impureCircuits[name](
        contextAt(ledgerSeconds, ledgerError),
        ...args,
      );
      return true;
    } catch (error) {
      if (
        error?.name === "CompactError" &&
        error?.message?.startsWith("failed assert:")
      ) {
        return false;
      }
      throw error;
    }
  };

  const truthTable = [
    ["assertBlockTimeLt", [999n, 1_000n, 1_001n], [false, false, true]],
    ["assertBlockTimeGte", [999n, 1_000n, 1_001n], [true, true, false]],
    ["assertBlockTimeGt", [999n, 1_000n, 1_001n], [true, false, false]],
    ["assertBlockTimeLte", [999n, 1_000n, 1_001n], [false, true, true]],
  ];
  for (const ledgerError of [0, 7]) {
    for (const [name, candidates, expected] of truthTable) {
      assert.deepEqual(
        candidates.map((candidate) =>
          accepts({ name, args: [candidate], ledgerError }),
        ),
        expected,
        `${name} truth table changed at ledger error ${ledgerError}`,
      );
    }
  }

  assert.equal(
    accepts({ name: "assertExactNominalLedgerTime", args: [1_000n] }),
    true,
  );
  assert.equal(
    accepts({ name: "assertExactNominalLedgerTime", args: [999n] }),
    false,
  );
  assert.equal(
    accepts({ name: "assertExactNominalLedgerTime", args: [1_001n] }),
    false,
  );
  assert.equal(
    accepts({
      name: "assertExactNominalLedgerTime",
      args: [1_000n],
      ledgerSeconds: 1_001n,
    }),
    false,
    "an exact-time proof candidate must fail after nominal ledger time advances",
  );
  assert.equal(
    accepts({
      name: "assertExactNominalLedgerTime",
      args: [1_000n],
      ledgerError: 7,
    }),
    true,
    "the Compact primitive currently ignores secondsSinceEpochErr",
  );

  assert.equal(
    accepts({
      name: "assertNominalLedgerTimeWindow",
      args: [995n, 1_005n],
    }),
    true,
  );
  for (const args of [
    [1_001n, 1_005n],
    [995n, 999n],
    [1_005n, 995n],
  ]) {
    assert.equal(
      accepts({ name: "assertNominalLedgerTimeWindow", args }),
      false,
    );
  }

  const unsupportedGetters = [
    "currentBlockTime",
    "getBlockTime",
    "blockHeight",
    "blockSlot",
    "ledgerPosition",
    "secondsSinceEpochErr",
    "lastBlockTime",
  ];
  for (const identifier of unsupportedGetters) {
    const sourcePath = path.join(temporaryRoot, `${identifier}.compact`);
    writeFileSync(
      sourcePath,
      [
        "pragma language_version >= 0.20;",
        "import CompactStandardLibrary;",
        `export circuit unsupported(): Uint<64> { return ${identifier}(); }`,
        "",
      ].join("\n"),
      "utf8",
    );
    const result = runCompact([
      "--skip-zk",
      sourcePath,
      path.join(temporaryRoot, `generated-${identifier}`),
    ]);
    assert.notEqual(
      result.status,
      0,
      `${identifier} unexpectedly became a supported Compact getter`,
    );
    assert.match(
      `${result.stdout}${result.stderr}`,
      new RegExp(`unbound identifier ${identifier}\\b`, "u"),
      `${identifier} failed for a reason other than an unavailable identifier`,
    );
  }

  process.stdout.write(
    `[trusted-time-capability] nominal Unix-seconds comparisons confirmed for Compact ${contractInfo["compiler-version"]}, ${compactVersion("--ledger-version")}, runtime ${contractInfo["runtime-version"]}; raw time/error/position getters remain unavailable\n`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
