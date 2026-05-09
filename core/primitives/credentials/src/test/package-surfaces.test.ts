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

describe("credentials package surfaces", () => {
  it("declares a stable contract subpath export", () => {
    expect(packageJson.exports?.["./contract"]).toBeDefined();
    expect(existsSync(sourceSurface("contract.ts"))).toEqual(true);
  });

  it("keeps the root package surface free of duplicate contract namespaces", () => {
    expect(indexSource).not.toContain("export * as CredentialsContract");
  });

  it("keeps the shared composition entrypoints in source control", () => {
    expect(existsSync(sourceSurface("credentials.compact"))).toEqual(true);
    expect(existsSync(sourceSurface("credentials/composable.compact"))).toEqual(
      true,
    );
    expect(existsSync(sourceSurface("credentials/vc-support.compact"))).toEqual(
      true,
    );
    expect(
      existsSync(sourceSurface("credentials/protocol-support.compact")),
    ).toEqual(true);
    expect(existsSync(sourceSurface("credentials/bindings.compact"))).toEqual(
      true,
    );
  });

  it("publishes the stable contract subpath after build", () => {
    if (!existsSync(distRoot) || !existsSync(distSurface("index.js"))) {
      return;
    }
    expect(existsSync(distSurface("contract.js"))).toEqual(true);
  });

  it("publishes the shared composition entrypoints after build", () => {
    if (!existsSync(distRoot) || !existsSync(distSurface("index.js"))) {
      return;
    }
    expect(existsSync(distSurface("credentials.compact"))).toEqual(true);
    expect(existsSync(distSurface("credentials/composable.compact"))).toEqual(
      true,
    );
    expect(existsSync(distSurface("credentials/vc-support.compact"))).toEqual(
      true,
    );
    expect(
      existsSync(distSurface("credentials/protocol-support.compact")),
    ).toEqual(true);
    expect(existsSync(distSurface("credentials/bindings.compact"))).toEqual(
      true,
    );
  });
});
