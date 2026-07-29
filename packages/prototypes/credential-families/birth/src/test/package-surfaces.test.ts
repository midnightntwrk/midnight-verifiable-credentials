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

describe("credentials-birth package surfaces", () => {
  it("declares a stable contract subpath export", () => {
    expect(packageJson.exports?.["./contract"]).toBeDefined();
    expect(existsSync(sourceSurface("contract.ts"))).toEqual(true);
  });

  it("keeps the root package surface free of duplicate contract namespaces", () => {
    expect(indexSource).not.toContain("export * as BirthCredentialContract");
  });

  it("publishes the stable contract subpath after build", () => {
    if (!existsSync(distRoot) || !existsSync(distSurface("index.js"))) {
      return;
    }
    expect(existsSync(distSurface("contract.js"))).toEqual(true);
  });
});
