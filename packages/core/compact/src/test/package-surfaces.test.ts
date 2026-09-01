import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("candidate package surface", () => {
  it("has explicit ESM exports and no verification-v1 source", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    );
    expect(manifest.type).toBe("module");
    expect(manifest.dependencies["@midnight-ntwrk/compact-runtime"]).toBe(
      "0.16.0",
    );
    expect(manifest.midnight.compactCompilerVersion).toBe("0.31.1");
    expect(manifest.midnight.compactRuntimeVersion).toBe("0.16.0");
    expect(manifest.exports["./credentials.compact"]).toBe(
      "./dist/credentials.compact",
    );
    expect(manifest.exports["./credentials/composable.compact"]).toBe(
      "./dist/credentials/composable.compact",
    );
    expect(manifest.midnight.compactEntrypoints.composition).toContain(
      "./credentials/composable.compact",
    );
    expect(
      manifest.exports["./credentials/holder-bindings.compact"],
    ).toBeUndefined();
    expect(manifest.exports["./credentials/proofs.compact"]).toBeUndefined();
    expect(manifest.exports["./credentials/protocols.compact"]).toBeUndefined();
    expect(
      manifest.exports["./credentials/status-bindings.compact"],
    ).toBeUndefined();
    expect(
      manifest.exports["./credentials/verification-v1.compact"],
    ).toBeUndefined();
    expect(
      existsSync(resolve(root, "src/credentials/verification-v1.compact")),
    ).toBe(false);
    expect(manifest.exports["./managed"]).toBeUndefined();
  });
});
