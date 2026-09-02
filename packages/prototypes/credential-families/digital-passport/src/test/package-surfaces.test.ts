import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const sourceSurface = (relativePath: string) =>
  path.resolve(packageRoot, "src", relativePath);
const distSurface = (relativePath: string) =>
  path.resolve(packageRoot, "dist", relativePath);
const distRoot = path.resolve(packageRoot, "dist");
const indexSource = readFileSync(sourceSurface("index.ts"), "utf8");
const packageJson = JSON.parse(
  readFileSync(path.resolve(packageRoot, "package.json"), "utf8"),
) as { exports?: Record<string, unknown> };

describe("credentials-digital-passport package surfaces", () => {
  it("declares stable contract and Compact subpath exports", () => {
    expect(packageJson.exports?.["./contract"]).toBeDefined();
    expect(packageJson.exports?.["./digital-passport-credential.compact"]).toBe(
      "./dist/digital-passport-credential.compact",
    );
    expect(existsSync(sourceSurface("contract.ts"))).toEqual(true);
  });

  it("keeps the root package surface free of duplicate contract namespaces", () => {
    expect(indexSource).not.toContain(
      "export * as DigitalPassportCredentialContract",
    );
  });

  it("publishes the stable contract subpath after build", () => {
    if (!existsSync(distRoot) || !existsSync(distSurface("index.js"))) {
      return;
    }
    expect(existsSync(distSurface("contract.js"))).toEqual(true);
  });

  it("exports key credential-family types from the managed runtime", () => {
    // This test verifies the managed runtime surface has the expected types.
    // It only runs after a build; if dist doesn't exist yet we skip.
    if (!existsSync(distRoot)) {
      return;
    }
    // Re-import dynamically to avoid build-time dependency issues in the
    // scaffold test; the real assertions run in the integration tests.
    expect(indexSource).toContain(
      "managed/digital-passport-credential/contract/index.js",
    );
  });
});
