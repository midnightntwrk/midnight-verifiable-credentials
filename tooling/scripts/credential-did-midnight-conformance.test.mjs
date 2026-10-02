import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";

import { pureCircuits } from "../../packages/credential-did-midnight/src/managed/did-midnight/contract/index.js";
import {
  collectExportedCircuitSymbols,
  compactCircuitKey,
  stripCompactComments,
} from "./compact-source-inventory.mjs";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const inventory = readJson(
  "conformance/credential-did-midnight-circuits.json",
);
const coreInventory = readJson("conformance/compact-circuits.json");
const vectors = readJson("conformance/vectors/midnight-did-binding.json");
const circuitIdBySymbol = new Map(
  inventory.circuits.map(({ id, symbol }) => [symbol, id]),
);
const dispatchByOperation = new Map([
  ["validate", "assertValidMidnightDIDMethodBinding"],
  ["root", "midnightDIDMethodBindingRoot"],
  ["proof", "assertMidnightDIDProofMatchesMethod"],
  ["holder", "assertMidnightDIDHolderBinding"],
  ["authorization", "assertMidnightDIDSignerAuthorization"],
]);
const operationByMutation = new Map([
  ["empty-controller", "validate"],
  ["empty-method", "validate"],
  ["identity-key", "validate"],
  ["off-curve-key", "validate"],
  ["torsion-key", "validate"],
  ["zero-state-version", "validate"],
  ["proof-controller", "proof"],
  ["proof-method", "proof"],
  ["proof-key", "proof"],
  ["holder-relationship", "holder"],
  ["holder-method", "holder"],
  ["authorization-method", "authorization"],
  ["authorization-key", "authorization"],
  ["authorization-state-version", "authorization"],
  ["authorization-relationship", "authorization"],
]);
const rootSubstitutionMutations = new Set([
  "root-controller",
  "root-method",
  "root-key",
  "root-state-version",
  "root-relationship",
]);

class ConformanceHarnessError extends Error {}

const sourceRoots = [inventory, coreInventory].map((sourceInventory) => ({
  path: resolve(root, sourceInventory.sourceRoot),
}));
const sourceOwner = (absoluteSource) => {
  const owners = sourceRoots.filter(({ path }) => {
    const sourceRelative = relative(path, absoluteSource);
    return sourceRelative !== ".." && !sourceRelative.startsWith("../");
  });
  assert.equal(owners.length, 1, `${absoluteSource} has no unique source owner`);
  return owners[0];
};
const resolveInclude = (absoluteSource, include) => {
  const candidates = include.startsWith(".")
    ? [resolve(dirname(absoluteSource), `${include}.compact`)]
    : sourceRoots.map(({ path }) => resolve(path, `${include}.compact`));
  const matches = candidates.filter(existsSync);
  assert.equal(matches.length, 1, `${include} has no unique Compact source`);
  return matches[0];
};
const collectEntrypointCircuits = (entrypoint) => {
  const entrypointSource = resolve(
    root,
    inventory.sourceRoot,
    entrypoint.source,
  );
  const visited = new Set();
  const circuits = [];
  const visit = (absoluteSource) => {
    if (visited.has(absoluteSource)) return;
    visited.add(absoluteSource);
    const owner = sourceOwner(absoluteSource);
    const source = readFileSync(absoluteSource, "utf8");
    for (const symbol of collectExportedCircuitSymbols(source)) {
      circuits.push({
        source: relative(owner.path, absoluteSource),
        symbol,
      });
    }
    for (const match of stripCompactComments(source).matchAll(
      /^\s*include\s+"([^"]+)"\s*;/gmu,
    )) {
      visit(resolveInclude(absoluteSource, match[1]));
    }
  };
  visit(entrypointSource);
  return circuits;
};
const validateVector = (collection, vector) => {
  const symbol = dispatchByOperation.get(vector.operation);
  if (symbol === undefined) {
    throw new ConformanceHarnessError(
      `Unknown Midnight DID operation: ${vector.operation}`,
    );
  }
  if (collection === "positive") {
    if (vector.mutation !== undefined) {
      throw new ConformanceHarnessError(
        `Positive Midnight DID vector ${vector.id} must not declare a mutation`,
      );
    }
  } else if (collection === "substitution") {
    if (
      vector.operation !== "root" ||
      !rootSubstitutionMutations.has(vector.mutation) ||
      typeof vector.expectedHex !== "string"
    ) {
      throw new ConformanceHarnessError(
        `Invalid Midnight DID root substitution vector: ${vector.id}`,
      );
    }
  } else {
    const expectedOperation = operationByMutation.get(vector.mutation);
    if (expectedOperation === undefined) {
      throw new ConformanceHarnessError(
        `Unknown Midnight DID mutation: ${vector.mutation}`,
      );
    }
    if (expectedOperation !== vector.operation) {
      throw new ConformanceHarnessError(
        `Midnight DID mutation ${vector.mutation} belongs to ${expectedOperation}, not ${vector.operation}`,
      );
    }
    if (
      typeof vector.errorIncludes !== "string" ||
      vector.errorIncludes.length === 0
    ) {
      throw new ConformanceHarnessError(
        `Negative Midnight DID vector ${vector.id} must declare errorIncludes`,
      );
    }
  }
  const circuitId = circuitIdBySymbol.get(symbol);
  if (circuitId === undefined) {
    throw new ConformanceHarnessError(
      `Midnight DID operation ${vector.operation} has no circuit inventory entry`,
    );
  }
  return circuitId;
};

const executedEvidence = new Map();
let activeEvidence;
const circuits = new Proxy(pureCircuits, {
  get(target, property, receiver) {
    const circuit = Reflect.get(target, property, receiver);
    const circuitId = circuitIdBySymbol.get(property);
    if (typeof circuit !== "function" || circuitId === undefined)
      return circuit;
    return (...args) => {
      activeEvidence?.reached.add(circuitId);
      return circuit(...args);
    };
  },
});

const executeEvidence = (collection, vector, assertion) => {
  const expectedCircuitId = validateVector(collection, vector);
  const previousEvidence = activeEvidence;
  const evidence = {
    reference: `${collection}/${vector.id}`,
    reached: new Set(),
  };
  activeEvidence = evidence;
  try {
    const result = assertion();
    if (
      evidence.reached.size !== 1 ||
      !evidence.reached.has(expectedCircuitId)
    ) {
      throw new ConformanceHarnessError(
        `${evidence.reference} reached ${[...evidence.reached].join(", ") || "no circuit"}; expected ${expectedCircuitId}`,
      );
    }
    const circuitEvidence =
      executedEvidence.get(expectedCircuitId) ?? new Set();
    circuitEvidence.add(evidence.reference);
    executedEvidence.set(expectedCircuitId, circuitEvidence);
    return result;
  } finally {
    activeEvidence = previousEvidence;
  }
};
const fromHex = (value) => Uint8Array.from(Buffer.from(value, "hex"));
const bytes = (value) => Uint8Array.from({ length: 32 }, () => value);
const point = (value) => ({ x: BigInt(value.x), y: BigInt(value.y) });
const makeBinding = () => ({
  verificationMethodRef: {
    controllerAddress: {
      bytes: fromHex(vectors.fixture.controllerAddressHex),
    },
    methodId: fromHex(vectors.fixture.methodIdHex),
  },
  publicKey: point(vectors.fixture.publicKey),
  didStateVersion: BigInt(vectors.fixture.didStateVersion),
  verificationRelationship: vectors.fixture.verificationRelationship,
});
const makeProof = (binding) => ({
  signerVerificationMethodRef: binding.verificationMethodRef,
  createdAt: 1n,
  challengeHash: bytes(3),
  publicKey: binding.publicKey,
  signature: { r: point(vectors.fixture.alternatePublicKey), s: 1n },
});
const makeDescriptor = (binding) => ({
  version: 1n,
  authorizationId: bytes(4),
  decisionSequence: 1n,
  state: 0,
  role: 1,
  signerVerificationMethodRef: binding.verificationMethodRef,
  signerPublicKey: binding.publicKey,
  didStateVersion: binding.didStateVersion,
  verificationRelationship: binding.verificationRelationship,
  scopeCommitment: bytes(5),
  policyCommitment: bytes(6),
});

const invoke = (vector) => {
  const binding = makeBinding();
  const proof = makeProof(binding);
  const holder = {
    explicitBinding: {
      holderVerificationMethodRef: binding.verificationMethodRef,
    },
    methodBinding: binding,
  };
  const descriptor = makeDescriptor(binding);

  switch (vector.mutation) {
    case "empty-controller":
      binding.verificationMethodRef.controllerAddress = { bytes: bytes(0) };
      break;
    case "empty-method":
      binding.verificationMethodRef.methodId = bytes(0);
      break;
    case "identity-key":
      binding.publicKey = { x: 0n, y: 1n };
      break;
    case "off-curve-key":
      binding.publicKey = { x: 1n, y: 1n };
      break;
    case "torsion-key":
      binding.publicKey = {
        x: 0n,
        y: 52435875175126190479447740508185965837690552500527637822603658699938581184512n,
      };
      break;
    case "root-controller":
      binding.verificationMethodRef.controllerAddress = { bytes: bytes(3) };
      break;
    case "root-method":
      binding.verificationMethodRef.methodId = bytes(4);
      break;
    case "root-key":
      binding.publicKey = point(vectors.fixture.alternatePublicKey);
      break;
    case "root-state-version":
      binding.didStateVersion += 1n;
      break;
    case "root-relationship":
      binding.verificationRelationship = 0;
      break;
    case "zero-state-version":
      binding.didStateVersion = 0n;
      break;
    case "proof-controller":
      proof.signerVerificationMethodRef = {
        ...proof.signerVerificationMethodRef,
        controllerAddress: { bytes: bytes(7) },
      };
      break;
    case "proof-method":
      proof.signerVerificationMethodRef = {
        ...proof.signerVerificationMethodRef,
        methodId: bytes(7),
      };
      break;
    case "proof-key":
      proof.publicKey = point(vectors.fixture.alternatePublicKey);
      break;
    case "holder-relationship":
      binding.verificationRelationship = 0;
      break;
    case "holder-method":
      holder.explicitBinding.holderVerificationMethodRef = {
        ...binding.verificationMethodRef,
        methodId: bytes(7),
      };
      break;
    case "authorization-method":
      descriptor.signerVerificationMethodRef = {
        ...binding.verificationMethodRef,
        methodId: bytes(7),
      };
      break;
    case "authorization-key":
      descriptor.signerPublicKey = point(vectors.fixture.alternatePublicKey);
      break;
    case "authorization-state-version":
      descriptor.didStateVersion += 1n;
      break;
    case "authorization-relationship":
      descriptor.verificationRelationship = 2;
      break;
    case undefined:
      break;
    default:
      assert.fail(`Unknown Midnight DID mutation: ${vector.mutation}`);
  }

  switch (vector.operation) {
    case "validate":
      return circuits.assertValidMidnightDIDMethodBinding(binding);
    case "root":
      return circuits.midnightDIDMethodBindingRoot(binding);
    case "proof":
      return circuits.assertMidnightDIDProofMatchesMethod(proof, binding);
    case "holder":
      return circuits.assertMidnightDIDHolderBinding(holder, proof);
    case "authorization":
      return circuits.assertMidnightDIDSignerAuthorization(
        binding,
        descriptor,
      );
    default:
      assert.fail(`Unknown Midnight DID operation: ${vector.operation}`);
  }
};

test("classifies both published Midnight DID Compact entrypoints", () => {
  assert.equal(inventory.formatVersion, 2);
  const packageManifest = readJson(
    "packages/credential-did-midnight/package.json",
  );
  const compactExports = Object.entries(packageManifest.exports)
    .filter(
      ([packageExport, target]) =>
        packageExport.endsWith(".compact") ||
        (typeof target === "string" && target.endsWith(".compact")),
    )
    .map(([packageExport, target]) => {
      assert.match(packageExport, /^\.\/[a-z0-9/-]+\.compact$/u);
      assert.equal(typeof target, "string");
      assert.match(target, /^\.\/dist\/[a-z0-9/-]+\.compact$/u);
      return {
        export: packageExport,
        source: target.slice("./dist/".length),
      };
    });
  const compactExportBySubpath = new Map(
    compactExports.map((entrypoint) => [entrypoint.export, entrypoint]),
  );
  const packageEntrypoints = Object.entries(
    packageManifest.midnight.compactEntrypoints,
  ).flatMap(([surface, exports]) =>
    exports.map((packageExport) => {
      const entrypoint = compactExportBySubpath.get(packageExport);
      assert.ok(entrypoint, `${packageExport} has no published Compact export`);
      return { ...entrypoint, surface };
    }),
  );
  const advertisedEntrypoints = Object.values(
    packageManifest.midnight.compactEntrypoints,
  )
    .flat()
    .sort();
  assert.deepEqual(
    compactExports.map(({ export: packageExport }) => packageExport).sort(),
    advertisedEntrypoints,
    "Compact entrypoint metadata must cover every published Compact export",
  );
  const byExport = (left, right) => left.export.localeCompare(right.export);
  assert.deepEqual(
    [...inventory.entrypoints].sort(byExport),
    [...packageEntrypoints].sort(byExport),
  );

  const extensionCircuitKeys = inventory.circuits
    .map(compactCircuitKey)
    .sort();
  const standaloneCircuitKeys = [
    ...coreInventory.circuits,
    ...inventory.circuits,
  ]
    .map(compactCircuitKey)
    .sort();
  for (const entrypoint of inventory.entrypoints) {
    const actual = collectEntrypointCircuits(entrypoint)
      .map(compactCircuitKey)
      .sort();
    const expected =
      entrypoint.surface === "standalone"
        ? standaloneCircuitKeys
        : extensionCircuitKeys;
    assert.deepEqual(
      actual,
      expected,
      `${entrypoint.export} exported circuits differ from its declared ${entrypoint.surface} surface`,
    );
  }
});

test("rejects harness dispatch defects before invoking a circuit", () => {
  let invoked = false;
  const assertNotInvoked = (vector) => {
    assert.throws(
      () =>
        executeEvidence("negative", vector, () => {
          invoked = true;
        }),
      ConformanceHarnessError,
    );
    assert.equal(invoked, false);
  };

  assertNotInvoked({
    id: "unknown-operation",
    operation: "unknown",
    mutation: "empty-controller",
    errorIncludes: "irrelevant",
  });
  assertNotInvoked({
    id: "unknown-mutation",
    operation: "validate",
    mutation: "unknown",
    errorIncludes: "irrelevant",
  });
});

test("rejects evidence attributed to the wrong circuit", () => {
  assert.throws(
    () =>
      executeEvidence(
        "positive",
        {
          id: "wrong-circuit",
          operation: "validate",
        },
        () => circuits.midnightDIDMethodBindingRoot(makeBinding()),
      ),
    (error) =>
      error instanceof ConformanceHarnessError &&
      error.message.includes("expected midnight-did-method-binding-validation"),
  );
});

test("executes all Midnight DID binding evidence", () => {
  for (const vector of vectors.positive) {
    const result = executeEvidence("positive", vector, () => invoke(vector));
    if (vector.expectedHex !== undefined) {
      assert.equal(Buffer.from(result).toString("hex"), vector.expectedHex);
    } else {
      assert.deepEqual(result, []);
    }
  }
  const canonicalRoot = vectors.positive.find(
    ({ operation }) => operation === "root",
  ).expectedHex;
  for (const vector of vectors.substitution) {
    const result = executeEvidence("substitution", vector, () =>
      invoke(vector),
    );
    const rootHex = Buffer.from(result).toString("hex");
    assert.equal(rootHex, vector.expectedHex, vector.id);
    assert.notEqual(rootHex, canonicalRoot, vector.id);
  }
  for (const vector of vectors.negative) {
    executeEvidence("negative", vector, () =>
      assert.throws(
        () => invoke(vector),
        (error) =>
          !(error instanceof ConformanceHarnessError) &&
          String(error).includes(vector.errorIncludes),
        vector.id,
      ),
    );
  }
  for (const circuit of inventory.circuits) {
    const executed = executedEvidence.get(circuit.id) ?? new Set();
    for (const references of Object.values(circuit.evidence)) {
      for (const reference of references) {
        assert.ok(executed.has(reference), `${circuit.id} lacks ${reference}`);
      }
    }
  }
});
