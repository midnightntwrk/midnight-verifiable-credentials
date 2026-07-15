import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  JUBJUB_SUBGROUP_ORDER,
  modJubjubSubgroupOrder,
} from "@midnight-ntwrk/midnight-did-credentials";
import * as contract from "@midnight-ntwrk/midnight-did-credentials/contract";
import * as managed from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

assert.equal(
  modJubjubSubgroupOrder(-1n),
  JUBJUB_SUBGROUP_ORDER - 1n,
);
assert.equal(contract.Contract, managed.Contract);

for (const specifier of [
  "@midnight-ntwrk/midnight-did-credentials/credentials.compact",
  "@midnight-ntwrk/midnight-did-credentials/credentials/types.compact",
]) {
  const resolved = import.meta.resolve(specifier);
  assert.equal(resolved.startsWith("file:"), true);
  assert.equal(existsSync(fileURLToPath(resolved)), true);
}

console.log("Node ESM and exported Compact paths resolved from the tarball.");
