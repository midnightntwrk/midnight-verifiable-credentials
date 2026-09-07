import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { pureCircuits } from "../../packages/core/compact/src/managed/credentials/contract/index.js";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const fromHex = (value) => Uint8Array.from(Buffer.from(value, "hex"));
const toHex = (value) => Buffer.from(value).toString("hex");

test("matches deterministic outputs from generated Compact circuits", () => {
  const fixture = readJson("conformance/vectors/compact-generated.json");
  for (const vector of fixture.vectors) {
    const circuit = pureCircuits[vector.circuit];
    assert.equal(typeof circuit, "function", vector.circuit);
    assert.equal(toHex(circuit()), vector.expectedHex, vector.id);
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
