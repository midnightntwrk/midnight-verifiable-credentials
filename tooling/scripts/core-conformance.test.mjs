import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
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

test("maps every retained operation to a normative section and state", () => {
  assert.equal(manifest.formatVersion, 1);
  assert.ok(
    readFileSync(resolve(root, "spec/README.md"), "utf8")
      .split("\n")
      .includes(`Version: \`${manifest.specification}\``),
    "the manifest and normative specification versions must match",
  );
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
    assert.match(operation.id, /^[a-z][a-z0-9-]+$/u);
    assert.ok(
      ["core", "holder", "issuer", "verifier"].includes(operation.role),
      `${operation.id} has an unknown role`,
    );
    assert.match(operation.section, /^spec\/[a-z0-9-]+\.md$/u);
    readFileSync(resolve(root, operation.section), "utf8");
    assert.ok(["implemented", "unsupported"].includes(operation.state));
    if (operation.state === "implemented") {
      referencedVectorCategories.add(operation.vectorCategory);
      assert.ok(
        vectorCategories.has(operation.vectorCategory),
        `${operation.id} has no declared vector category`,
      );
    } else {
      assert.ok(operation.reason?.length >= 20);
    }
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
