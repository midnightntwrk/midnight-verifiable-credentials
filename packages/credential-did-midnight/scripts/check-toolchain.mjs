#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import { resolve } from "node:path";
import { readToolchain } from "../../../tooling/scripts/compact-build-profile.mjs";

const profile = readToolchain(resolve(import.meta.dirname, ".."));
console.log(
  `[credential-did-midnight] compiler ${profile.compiler} / runtime ${profile.runtime.version} / backend ${profile.backend}; supported npm Ledger ${profile.supportedLedger.name}@${profile.supportedLedger.version}`,
);
