import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";

import {
  decodeCompactPayload,
  decodeCompactValue,
  encodeCompactValue,
} from "../../packages/core/compact/src/compact-value-codec.ts";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const manifest = readJson("conformance/manifest.json");
const compactCircuitInventory = readJson(
  manifest.compactCircuitInventory.path,
);

const fromHex = (value) => Uint8Array.from(Buffer.from(value, "hex"));
const toHex = (value) => Buffer.from(value).toString("hex");
const listJsonFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
const extractImportSpecifiers = (source) => [
  ...source.matchAll(
    /\b(?:import|export)\s+(?:[^"'`;]*?\s+from\s+)?["']([^"']+)["']/gu,
  ),
  ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/gu),
].map((match) => match[1]);
const compactCircuitKey = ({ source, symbol }) => `${source}#${symbol}`;
const stripCompactComments = (source) => {
  let output = "";
  let state = "code";
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (state === "line-comment") {
      if (character === "\n") {
        state = "code";
        output += character;
      } else {
        output += " ";
      }
    } else if (state === "block-comment") {
      if (character === "*" && next === "/") {
        output += "  ";
        index += 1;
        state = "code";
      } else {
        output += character === "\n" ? character : " ";
      }
    } else if (state === "string") {
      output += character;
      if (character === "\\" && next !== undefined) {
        output += next;
        index += 1;
      } else if (character === '"') {
        state = "code";
      }
    } else if (character === "/" && next === "/") {
      output += "  ";
      index += 1;
      state = "line-comment";
    } else if (character === "/" && next === "*") {
      output += "  ";
      index += 1;
      state = "block-comment";
    } else {
      output += character;
      if (character === '"') state = "string";
    }
  }
  return output;
};
const stripCompactStrings = (source) =>
  source.replace(/"(?:\\.|[^"\\])*"/gsu, (value) =>
    value.replace(/[^\n]/gu, " "),
  );
const collectExportedCircuitSymbols = (source) => [
  ...stripCompactStrings(stripCompactComments(source)).matchAll(
    /^\s*export\s+(?:pure\s+)?circuit\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/gmu,
  ),
].map((match) => match[1]);
const collectExportedCompactCircuits = (sourceRoot, entrypointSource) => {
  const visited = new Set();
  const circuits = [];
  const visit = (source) => {
    if (visited.has(source)) return;
    visited.add(source);
    const absoluteSource = resolve(sourceRoot, source);
    const text = readFileSync(absoluteSource, "utf8");
    for (const symbol of collectExportedCircuitSymbols(text)) {
      circuits.push({ source, symbol });
    }
    const uncommentedText = stripCompactComments(text);
    for (const match of uncommentedText.matchAll(
      /^\s*include\s+"([^"]+)"\s*;/gmu,
    )) {
      const included = resolve(dirname(absoluteSource), `${match[1]}.compact`);
      const relativeInclude = relative(sourceRoot, included);
      assert.ok(
        relativeInclude !== ".." && !relativeInclude.startsWith("../"),
        `${source} includes a Compact source outside ${sourceRoot}`,
      );
      visit(relativeInclude);
    }
  };
  visit(entrypointSource);
  return circuits;
};

test("ignores non-code Compact circuit declarations", () => {
  const source = `
// export pure circuit lineComment(): [] {}
/* export circuit blockComment(): [] {} */
const text = "export pure circuit stringValue(): [] {}";
export pure circuit retainedCircuit(): [] {}
`;
  assert.deepEqual(collectExportedCircuitSymbols(source), ["retainedCircuit"]);
});

test("maps every retained operation to a normative section and vector", () => {
  assert.equal(manifest.formatVersion, 3);
  assert.ok(
    readFileSync(resolve(root, "spec/README.md"), "utf8")
      .split("\n")
      .includes(`Version: \`${manifest.specification}\``),
    "the manifest and normative specification versions must match",
  );
  assert.ok(manifest.implementationPackages.length > 0);
  for (const implementationPackage of manifest.implementationPackages) {
    const packageManifest = readJson(implementationPackage.manifest);
    assert.deepEqual(
      {
        name: implementationPackage.name,
        version: implementationPackage.version,
      },
      { name: packageManifest.name, version: packageManifest.version },
      `${implementationPackage.manifest} identity does not match the conformance manifest`,
    );
  }
  assert.ok(manifest.operations.length > 0);
  assert.equal(
    new Set(manifest.operations.map(({ id }) => id)).size,
    manifest.operations.length,
  );

  const vectorCategories = new Set(
    manifest.vectors.map(({ path }) => readJson(path).category),
  );
  const referencedVectorCategories = new Set();
  for (const operation of manifest.operations) {
    assert.deepEqual(
      Object.keys(operation).sort(),
      ["id", "section", "vectorCategory"],
      `${operation.id} must use the implemented-operation schema`,
    );
    assert.match(operation.id, /^[a-z][a-z0-9-]+$/u);
    assert.match(operation.section, /^spec\/[a-z0-9-]+\.md$/u);
    readFileSync(resolve(root, operation.section), "utf8");
    referencedVectorCategories.add(operation.vectorCategory);
    assert.ok(
      vectorCategories.has(operation.vectorCategory),
      `${operation.id} has no declared vector category`,
    );
  }
  assert.deepEqual(
    [...referencedVectorCategories].sort(),
    [...vectorCategories].sort(),
    "every declared vector category must map to an implemented operation",
  );

  const listedVectors = manifest.vectors.map(({ path }) => path).sort();
  const availableVectors = listJsonFiles(resolve(root, "conformance/vectors"))
    .map((path) => relative(root, path))
    .sort();
  assert.deepEqual(
    listedVectors,
    availableVectors,
    "every vector file must be listed in the manifest",
  );
});

test("classifies every circuit exported by each Compact entrypoint", () => {
  assert.equal(compactCircuitInventory.formatVersion, 1);
  assert.equal(
    compactCircuitInventory.package,
    "@midnight-ntwrk/credential-compact",
  );
  assert.match(
    compactCircuitInventory.sourceRoot,
    /^packages\/core\/compact\/src$/u,
  );

  const compactPackage = manifest.implementationPackages.find(
    ({ name }) => name === compactCircuitInventory.package,
  );
  assert.ok(compactPackage, "the Compact package must be implemented");
  const packageManifest = readJson(compactPackage.manifest);
  const compactExports = Object.entries(packageManifest.exports)
    .filter(
      ([packageExport, target]) =>
        packageExport.endsWith(".compact") ||
        (typeof target === "string" && target.endsWith(".compact")),
    )
    .map(([packageExport, target]) => {
      assert.match(
        packageExport,
        /^\.\/[a-z0-9/-]+\.compact$/u,
        `${packageExport} has an invalid Compact export subpath`,
      );
      assert.equal(
        typeof target,
        "string",
        `${packageExport} must have one Compact export target`,
      );
      assert.match(
        target,
        /^\.\/dist\/[a-z0-9/-]+\.compact$/u,
        `${packageExport} has an invalid Compact export target`,
      );
      return {
        export: packageExport,
        source: target.slice("./dist/".length),
      };
    })
    .sort((left, right) => left.export.localeCompare(right.export));
  const advertisedEntrypoints = Object.values(
    packageManifest.midnight.compactEntrypoints,
  )
    .flat()
    .sort();
  assert.deepEqual(
    compactExports.map(({ export: packageExport }) => packageExport),
    advertisedEntrypoints,
    "Compact entrypoint metadata must cover every published Compact export",
  );
  assert.deepEqual(
    [...compactCircuitInventory.entrypoints].sort((left, right) =>
      left.export.localeCompare(right.export),
    ),
    compactExports,
    "the circuit inventory must match each published Compact export target",
  );

  const classifications = new Set([
    "supported",
    "low-level",
    "implementation-detail",
  ]);
  const operationIds = new Set(manifest.operations.map(({ id }) => id));
  const circuitIds = new Set();
  const circuitKeys = new Set();
  for (const circuit of compactCircuitInventory.circuits) {
    const expectedKeys =
      circuit.classification === "supported"
        ? ["classification", "evidence", "id", "operation", "source", "symbol"]
        : ["classification", "id", "source", "symbol"];
    assert.deepEqual(
      Object.keys(circuit).sort(),
      expectedKeys,
      `${circuit.id} has an invalid circuit-inventory shape`,
    );
    assert.match(circuit.id, /^[a-z][a-z0-9-]+$/u);
    assert.match(circuit.source, /^credentials(?:\/[a-z0-9-]+)?\.compact$/u);
    assert.match(circuit.symbol, /^[A-Za-z][A-Za-z0-9_]*$/u);
    assert.ok(
      classifications.has(circuit.classification),
      `${circuit.id} has an unknown classification`,
    );
    assert.ok(!circuitIds.has(circuit.id), `${circuit.id} is duplicated`);
    circuitIds.add(circuit.id);
    const key = compactCircuitKey(circuit);
    assert.ok(!circuitKeys.has(key), `${key} is duplicated`);
    circuitKeys.add(key);
    if (circuit.classification === "supported") {
      assert.ok(
        operationIds.has(circuit.operation),
        `${circuit.id} has no implemented conformance operation`,
      );
    }
  }

  const sourceRoot = resolve(root, compactCircuitInventory.sourceRoot);
  const expectedCircuitKeys = [...circuitKeys].sort();
  for (const entrypoint of compactCircuitInventory.entrypoints) {
    assert.deepEqual(
      Object.keys(entrypoint).sort(),
      ["export", "source"],
      `${entrypoint.export} has an invalid entrypoint-inventory shape`,
    );
    const actualCircuitKeys = collectExportedCompactCircuits(
      sourceRoot,
      entrypoint.source,
    )
      .map(compactCircuitKey)
      .sort();
    assert.deepEqual(
      actualCircuitKeys,
      expectedCircuitKeys,
      `${entrypoint.export} exported circuits differ from the inventory`,
    );
  }
});

test("requires executable evidence for every supported Compact circuit", () => {
  const operations = new Map(
    manifest.operations.map((operation) => [operation.id, operation]),
  );
  const vectors = new Map(
    manifest.vectors.map(({ path }) => {
      const document = readJson(path);
      return [document.category, document];
    }),
  );
  const evidenceOwners = new Map();
  for (const [category, document] of vectors) {
    for (const collection of [
      "positive",
      "negative",
      "substitution",
      "updates",
      "vectors",
    ]) {
      for (const vector of document[collection] ?? []) {
        const reference = `${collection}/${vector.id}`;
        assert.ok(
          !evidenceOwners.has(reference),
          `${reference} is ambiguous between ${evidenceOwners.get(reference)} and ${category}`,
        );
        evidenceOwners.set(reference, category);
      }
    }
  }
  for (const circuit of compactCircuitInventory.circuits) {
    if (circuit.classification !== "supported") continue;
    const operation = operations.get(circuit.operation);
    assert.ok(operation, `${circuit.id} has no operation`);
    const vectorDocument = vectors.get(operation.vectorCategory);
    assert.ok(vectorDocument, `${circuit.id} has no vector document`);
    const requireEvidence = (kind, allowedCollections) => {
      const references = circuit.evidence[kind];
      assert.ok(
        Array.isArray(references) && references.length > 0,
        `${circuit.id} has no circuit-specific ${kind} evidence`,
      );
      for (const reference of references) {
        const match = reference.match(
          /^([a-z][a-z-]*)\/([a-z0-9][a-z0-9-]*)$/u,
        );
        assert.ok(match, `${circuit.id} has invalid evidence ${reference}`);
        const [, collection, vectorId] = match;
        assert.ok(
          allowedCollections.has(collection),
          `${circuit.id} uses ${collection} as ${kind} evidence`,
        );
        assert.ok(
          Array.isArray(vectorDocument[collection]) &&
            vectorDocument[collection].some(({ id }) => id === vectorId),
          `${circuit.id} references missing ${reference}`,
        );
      }
    };
    assert.deepEqual(
      Object.keys(circuit.evidence).sort(),
      /^(?:bind|match|validate|verify)-/u.test(operation.id)
        ? ["negative", "positive"]
        : ["positive"],
      `${circuit.id} has an invalid evidence shape`,
    );
    requireEvidence("positive", new Set(["positive", "updates", "vectors"]));
    if (/^(?:bind|match|validate|verify)-/u.test(operation.id)) {
      requireEvidence("negative", new Set(["negative", "substitution"]));
    }
  }
});

test("matches the recorded conformance manifest and vector digests", () => {
  for (const vector of manifest.vectors) {
    const vectorBytes = readFileSync(resolve(root, vector.path));
    assert.match(vector.sha256, /^[a-f0-9]{64}$/u);
    assert.equal(
      createHash("sha256").update(vectorBytes).digest("hex"),
      vector.sha256,
      `${vector.path} digest mismatch`,
    );
  }

  const inventoryBytes = readFileSync(
    resolve(root, manifest.compactCircuitInventory.path),
  );
  assert.match(manifest.compactCircuitInventory.sha256, /^[a-f0-9]{64}$/u);
  assert.equal(
    createHash("sha256").update(inventoryBytes).digest("hex"),
    manifest.compactCircuitInventory.sha256,
    `${manifest.compactCircuitInventory.path} digest mismatch`,
  );

  const manifestBytes = readFileSync(resolve(root, "conformance/manifest.json"));
  const digestRecord = readFileSync(
    resolve(root, "conformance/manifest.sha256"),
    "utf8",
  ).trim();
  const match = digestRecord.match(/^([a-f0-9]{64})  manifest\.json$/u);
  assert.ok(match, "manifest.sha256 must use sha256sum format");
  assert.equal(
    createHash("sha256").update(manifestBytes).digest("hex"),
    match[1],
  );
});

test("keeps conformance code independent from non-core workspaces", () => {
  const testFiles = readdirSync(import.meta.dirname)
    .filter((name) => /^core-.*conformance\.test\.mjs$/u.test(name))
    .sort();
  assert.ok(testFiles.length >= 2);
  const importedCoreSpecifiers = new Set();
  for (const testFile of testFiles) {
    const source = readFileSync(resolve(import.meta.dirname, testFile), "utf8");
    for (const specifier of extractImportSpecifiers(source)) {
      if (specifier.startsWith("node:")) continue;
      assert.ok(
        manifest.allowedCoreImports.includes(specifier),
        `${testFile} imports non-allowlisted module ${specifier}`,
      );
      importedCoreSpecifiers.add(specifier);
    }
  }
  assert.deepEqual(
    [...importedCoreSpecifiers].sort(),
    [...manifest.allowedCoreImports].sort(),
    "the core import allowlist must contain only exercised imports",
  );
  for (const { path } of manifest.vectors) readJson(path);
});

test("matches Compact Value framing and rejects malformed encodings", () => {
  const fixture = readJson("conformance/vectors/compact-value-encoding.json");
  for (const vector of fixture.vectors) {
    const encoded = encodeCompactValue(vector.chunksHex.map(fromHex));
    assert.deepEqual(encoded, {
      encoding: vector.encoding,
      payload: vector.payload,
    });
    assert.deepEqual(decodeCompactValue(encoded).map(toHex), vector.chunksHex);
  }
  for (const vector of fixture.negative) {
    const decode =
      vector.decoder === "single-chunk-descriptor"
        ? () =>
            decodeCompactPayload(
              {
                fromValue: (value) => value.shift(),
              },
              vector,
            )
        : () => decodeCompactValue(vector);
    assert.throws(
      decode,
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});
