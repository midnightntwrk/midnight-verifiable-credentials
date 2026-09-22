import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { pureCircuits } from "../../packages/credential-did-midnight/src/managed/did-midnight/contract/index.js";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const inventory = readJson(
  "conformance/credential-did-midnight-circuits.json",
);
const vectors = readJson("conformance/vectors/midnight-did-binding.json");
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
      return pureCircuits.assertValidMidnightDIDMethodBinding(binding);
    case "root":
      return pureCircuits.midnightDIDMethodBindingRoot(binding);
    case "proof":
      return pureCircuits.assertMidnightDIDProofMatchesMethod(proof, binding);
    case "holder":
      return pureCircuits.assertMidnightDIDHolderBinding(holder, proof);
    case "authorization":
      return pureCircuits.assertMidnightDIDSignerAuthorization(
        binding,
        descriptor,
      );
    default:
      assert.fail(`Unknown Midnight DID operation: ${vector.operation}`);
  }
};

test("classifies every exported Midnight DID extension circuit", () => {
  const source = readFileSync(
    resolve(root, inventory.sourceRoot, "did-midnight/bindings.compact"),
    "utf8",
  );
  const exported = [
    ...source.matchAll(
      /^export\s+pure\s+circuit\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/gmu,
    ),
  ].map((match) => match[1]);
  assert.deepEqual(
    exported.sort(),
    inventory.circuits.map(({ symbol }) => symbol).sort(),
  );
});

test("executes all Midnight DID binding evidence", () => {
  const executed = new Set();
  for (const vector of vectors.positive) {
    const result = invoke(vector);
    if (vector.expectedHex !== undefined) {
      assert.equal(Buffer.from(result).toString("hex"), vector.expectedHex);
    } else {
      assert.deepEqual(result, []);
    }
    executed.add(`positive/${vector.id}`);
  }
  for (const vector of vectors.negative) {
    assert.throws(() => invoke(vector), undefined, vector.id);
    executed.add(`negative/${vector.id}`);
  }
  for (const circuit of inventory.circuits) {
    for (const references of Object.values(circuit.evidence)) {
      for (const reference of references) {
        assert.ok(executed.has(reference), `${circuit.id} lacks ${reference}`);
      }
    }
  }
});
