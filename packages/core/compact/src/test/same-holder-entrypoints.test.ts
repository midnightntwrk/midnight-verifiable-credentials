import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("same-holder audit gate", () => {
  it("exposes same-holder semantics through the canonical roots", () => {
    const standalone = readFileSync(
      resolve(root, "src/credentials.compact"),
      "utf8",
    );
    const composable = readFileSync(
      resolve(root, "src/credentials/composable.compact"),
      "utf8",
    );
    const holderBindings = readFileSync(
      resolve(root, "src/credentials/holder-bindings.compact"),
      "utf8",
    );

    expect(standalone).toContain('include "./credentials/composable"');
    expect(composable).toContain('include "./holder-bindings"');
    expect(holderBindings).toContain("assertSameSecretHolderBindingWitnesses");
    expect(holderBindings).toContain(
      "assertSameBlindedSecretHolderBindingWitnesses",
    );
  });

  it("does not retain separate same-holder roots", () => {
    for (const source of [
      "src/holder-binding/same-holder.compact",
      "src/holder-binding/same-holder/composable.compact",
      "src/holder-binding/same-holder.ts",
      "src/credentials/bindings.compact",
    ]) {
      expect(existsSync(resolve(root, source))).toBe(false);
    }
  });
});
