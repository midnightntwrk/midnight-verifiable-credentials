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
) as {
  exports?: Record<string, unknown>;
  midnight?: { releaseStage?: string };
  typesVersions?: Record<string, Record<string, string[]>>;
};

describe("credentials package surfaces", () => {
  it("declares a stable contract subpath export", () => {
    expect(packageJson.exports?.["./contract"]).toBeDefined();
    expect(existsSync(sourceSurface("contract.ts"))).toEqual(true);
  });

  it("declares a browser-safe Jubjub utility subpath", () => {
    expect(packageJson.exports?.["./jubjub"]).toBeDefined();
    expect(packageJson.typesVersions?.["*"]?.jubjub).toEqual([
      "dist/jubjub.d.ts",
    ]);
    expect(existsSync(sourceSurface("jubjub.ts"))).toEqual(true);
  });

  it("keeps the internal compatibility surface ESM-only", () => {
    expect(packageJson.midnight?.releaseStage).toBeUndefined();
    expect(JSON.stringify(packageJson.exports)).not.toContain('"require"');
  });

  it("exports the audited Compact source entrypoints", () => {
    expect(packageJson.exports?.["./credentials.compact"]).toEqual(
      "./dist/credentials.compact",
    );
    expect(packageJson.exports?.["./credentials/*.compact"]).toEqual(
      "./dist/credentials/*.compact",
    );
  });

  it("exports the opt-in aggregate decision Compact and managed surfaces", () => {
    expect(packageJson.exports?.["./aggregate-decision-v1.compact"]).toEqual(
      "./dist/aggregate-decision-v1.compact",
    );
    expect(
      packageJson.exports?.["./managed/aggregate-decision/contract/index.js"],
    ).toBeDefined();
    expect(existsSync(sourceSurface("aggregate-decision-v1.compact"))).toEqual(
      true,
    );
    expect(
      existsSync(sourceSurface("credentials/aggregate-decision-v1.compact")),
    ).toEqual(true);
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
    expect(existsSync(distSurface("aggregate-decision-v1.compact"))).toEqual(
      true,
    );
    expect(
      existsSync(distSurface("managed/aggregate-decision/contract/index.js")),
    ).toEqual(true);
  });
});
