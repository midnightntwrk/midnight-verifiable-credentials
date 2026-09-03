import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const compactAvailable = (() => {
  try {
    execFileSync("compact", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
})();

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
  it("declares stable runtime and Compact entrypoint exports", () => {
    expect(packageJson.exports?.["./contract"]).toBeDefined();
    expect(packageJson.exports?.["./birth-credential.compact"]).toBe(
      "./dist/birth-credential.compact",
    );
    expect(packageJson.exports?.["./birth-credential/composable.compact"]).toBe(
      "./dist/birth-credential/composable.compact",
    );
    expect(existsSync(sourceSurface("contract.ts"))).toEqual(true);
  });

  it("keeps the standalone root thin and the composable root dependency-free", () => {
    const standalone = readFileSync(
      sourceSurface("birth-credential.compact"),
      "utf8",
    );
    const composable = readFileSync(
      sourceSurface("birth-credential/composable.compact"),
      "utf8",
    );

    expect(standalone.match(/^include /gmu)).toHaveLength(2);
    expect(standalone).toContain(
      'include "../../../../../packages/core/compact/src/credentials/composable";',
    );
    expect(standalone).toContain('include "./birth-credential/composable";');
    expect(composable).not.toMatch(/packages\/core|credentials\/composable/u);
    expect(composable).toMatch(/import VC<[\s\S]+prefix BirthCredentialVC_;/u);
    expect(composable).toMatch(/import VP<[\s\S]+prefix BirthCredentialVP_;/u);
    expect(composable).not.toMatch(
      /^export type (?:Credential|Presentation)\b/mu,
    );
  });

  it("keeps the root package surface free of duplicate contract namespaces", () => {
    expect(indexSource).not.toContain("export * as BirthCredentialContract");
  });

  it("publishes the stable runtime and Compact surfaces after build", () => {
    if (!existsSync(distRoot) || !existsSync(distSurface("index.js"))) {
      return;
    }
    expect(existsSync(distSurface("contract.js"))).toEqual(true);
    expect(existsSync(distSurface("birth-credential.compact"))).toEqual(true);
    expect(
      existsSync(distSurface("birth-credential/composable.compact")),
    ).toEqual(true);
  });

  it.skipIf(!compactAvailable)(
    "compiles the standalone Compact export outside the monorepo",
    () => {
      if (!existsSync(distSurface("index.js"))) return;

      const temporaryRoot = mkdtempSync(
        path.join(os.tmpdir(), "birth-compact-package-"),
      );
      try {
        cpSync(
          distSurface("birth-credential.compact"),
          path.join(temporaryRoot, "birth-credential.compact"),
        );
        cpSync(
          distSurface("birth-credential"),
          path.join(temporaryRoot, "birth-credential"),
          { recursive: true },
        );
        cpSync(
          distSurface("credential-compact"),
          path.join(temporaryRoot, "credential-compact"),
          { recursive: true },
        );
        execFileSync(
          "compact",
          [
            "compile",
            "+0.31.1",
            "--skip-zk",
            "--compact-path",
            temporaryRoot,
            path.join(temporaryRoot, "birth-credential.compact"),
            path.join(temporaryRoot, "output"),
          ],
          { stdio: "pipe" },
        );
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    60_000,
  );
});
