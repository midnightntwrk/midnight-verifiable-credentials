import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  decodeCompactValue,
  encodeCompactValue,
} from "../../packages/core/compact/src/compact-value-codec.ts";
import { pureCircuits } from "../../packages/core/compact/src/managed/credentials/contract/index.js";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const manifest = readJson("conformance/manifest.json");

const fromHex = (value) => Uint8Array.from(Buffer.from(value, "hex"));
const toHex = (value) => Buffer.from(value).toString("hex");

test("maps every retained operation to a normative section and state", () => {
  assert.equal(manifest.formatVersion, 1);
  assert.ok(manifest.operations.length > 0);
  assert.equal(
    new Set(manifest.operations.map(({ id }) => id)).size,
    manifest.operations.length,
  );

  const vectorCategories = new Set(
    manifest.vectors.map((path) => readJson(path).category),
  );
  for (const operation of manifest.operations) {
    assert.match(operation.id, /^[a-z][a-z0-9-]+$/u);
    assert.match(operation.section, /^spec\/[a-z0-9-]+\.md$/u);
    readFileSync(resolve(root, operation.section), "utf8");
    assert.ok(["implemented", "unsupported"].includes(operation.state));
    if (operation.state === "implemented") {
      assert.ok(
        vectorCategories.has(operation.vectorCategory),
        `${operation.id} has no declared vector category`,
      );
    } else {
      assert.ok(operation.reason?.length >= 20);
    }
  }
});

test("keeps conformance code independent from non-core workspaces", () => {
  const source = readFileSync(import.meta.filename, "utf8");
  for (const segment of manifest.forbiddenImportSegments) {
    assert.equal(source.includes(segment), false, `forbidden import ${segment}`);
  }
  for (const path of manifest.vectors) readJson(path);
});

test("matches deterministic outputs from generated Compact circuits", () => {
  const fixture = readJson("conformance/vectors/compact-generated.json");
  for (const vector of fixture.vectors) {
    const circuit = pureCircuits[vector.circuit];
    assert.equal(typeof circuit, "function", vector.circuit);
    assert.equal(toHex(circuit()), vector.expectedHex, vector.id);
  }
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
    assert.throws(
      () => decodeCompactValue(vector),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});

test("validates positive and negative schema references in Compact", () => {
  const fixture = readJson("conformance/vectors/schema-reference.json");
  const base = fixture.positive[0];
  const makeSchemaRef = (value) => ({
    packageId: fromHex(value.packageIdHex),
    schemaId: fromHex(value.schemaIdHex),
    majorVersion: BigInt(value.majorVersion),
    minorVersion: BigInt(value.minorVersion),
  });

  for (const vector of fixture.positive) {
    assert.deepEqual(pureCircuits.assertValidSchemaRef(makeSchemaRef(vector)), []);
  }
  for (const vector of fixture.negative) {
    const candidate = { ...base, [vector.replace]: vector.value };
    assert.throws(
      () => pureCircuits.assertValidSchemaRef(makeSchemaRef(candidate)),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});

test("validates positive and negative explicit holder bindings in Compact", () => {
  const fixture = readJson("conformance/vectors/holder-binding.json");
  const base = fixture.positive[0];
  const makeBinding = (value) => ({
    holderVerificationMethodRef: {
      didContractAddress: { bytes: fromHex(value.didContractAddressHex) },
      methodId: fromHex(value.methodIdHex),
    },
  });

  for (const vector of fixture.positive) {
    assert.deepEqual(
      pureCircuits.assertValidExplicitHolderBinding(makeBinding(vector)),
      [],
    );
  }
  for (const vector of fixture.negative) {
    const candidate = { ...base, [vector.replace]: vector.value };
    assert.throws(
      () =>
        pureCircuits.assertValidExplicitHolderBinding(makeBinding(candidate)),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});
