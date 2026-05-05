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
const packageJson = JSON.parse(
  readFileSync(path.resolve(packageRoot, "package.json"), "utf8"),
) as { exports?: Record<string, unknown> };

describe("credentials-demo-contract package surfaces", () => {
  it("declares stable subpath exports for both demo contracts", () => {
    expect(packageJson.exports?.["./contract"]).toBeDefined();
    expect(packageJson.exports?.["./contract-revocation"]).toBeDefined();
    expect(existsSync(sourceSurface("contract.ts"))).toEqual(true);
    expect(existsSync(sourceSurface("contract-revocation.ts"))).toEqual(true);
  });

  it("publishes the stable contract subpaths after build", () => {
    if (!existsSync(distRoot) || !existsSync(distSurface("index.js"))) {
      return;
    }
    expect(existsSync(distSurface("contract.js"))).toEqual(true);
    expect(existsSync(distSurface("contract-revocation.js"))).toEqual(true);
  });
});
