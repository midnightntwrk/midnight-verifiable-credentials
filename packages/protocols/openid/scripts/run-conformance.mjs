#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateConformanceFixture,
  materializeConformanceFixtures,
  OID4VCI_1_0_FINAL,
  OID4VP_1_0_FINAL,
} from "../dist/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = join(packageRoot, "src", "conformance", "fixtures");
const manifest = JSON.parse(await readFile(join(fixtures, "manifest.json"), "utf8"));
if (manifest.versions.oid4vci !== OID4VCI_1_0_FINAL || manifest.versions.oid4vp !== OID4VP_1_0_FINAL) {
  throw new Error("Conformance manifest does not match the pinned Final versions");
}
if (JSON.stringify(manifest.files) !== JSON.stringify(["positive.json", "negative.json"])) {
  throw new Error("Conformance manifest must name the positive and negative fixture definitions exactly");
}
const positives = JSON.parse(await readFile(join(fixtures, manifest.files[0]), "utf8"));
const negatives = JSON.parse(await readFile(join(fixtures, manifest.files[1]), "utf8"));
const cases = materializeConformanceFixtures(positives, negatives);
let passed = 0;
for (const fixture of cases) {
  const actual = evaluateConformanceFixture(fixture);
  if (actual !== fixture.valid) throw new Error(`${fixture.id}: expected valid=${fixture.valid}, got ${actual}`);
  passed += 1;
}
console.log(JSON.stringify({ ok: true, fixtureSet: manifest.fixtureSet, passed, claim: manifest.scope }));
