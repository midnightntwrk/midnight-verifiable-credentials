import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import packageJson from "../../package.json" with { type: "json" };

const root = resolve(import.meta.dirname, "../..");
const compactAvailable = (() => {
  try {
    execFileSync("compact", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
})();
const sourceSurface = (relativePath: string) =>
  resolve(root, "src", relativePath);
const distSurface = (relativePath: string) =>
  resolve(root, "dist", relativePath);

describe("hello-family package surfaces", () => {
  it("exports runtime and Compact entrypoint subpaths", () => {
    expect(packageJson.exports["."]).toBeDefined();
    expect(packageJson.exports["./contract"]).toBeDefined();
    expect(packageJson.exports["./offchain-contract"]).toBeDefined();
    expect(packageJson.exports["./testing"]).toBeDefined();
    expect(packageJson.exports["./hello-family-credential.compact"]).toBe(
      "./dist/hello-family-credential.compact",
    );
    expect(
      packageJson.exports["./hello-family-offchain-credential.compact"],
    ).toBe("./dist/hello-family-offchain-credential.compact");
    expect(
      packageJson.exports["./hello-family-credential/composable.compact"],
    ).toBe("./dist/hello-family-credential/composable.compact");
  });

  it("keeps the standalone root thin and the composable root dependency-free", () => {
    const standalone = readFileSync(
      sourceSurface("hello-family-credential.compact"),
      "utf8",
    );
    const composable = readFileSync(
      sourceSurface("hello-family-credential/composable.compact"),
      "utf8",
    );

    expect(standalone.match(/^include /gmu)).toHaveLength(2);
    expect(standalone).toContain(
      'include "../../../../../packages/core/compact/src/credentials/composable";',
    );
    expect(standalone).toContain(
      'include "./hello-family-credential/composable";',
    );
    expect(composable).not.toMatch(/packages\/core|credentials\/composable/u);
    expect(composable).toMatch(/import VC<[\s\S]+prefix HelloFamilyVC_;/u);
    expect(composable).toMatch(/import VP<[\s\S]+prefix HelloFamilyVP_;/u);
    expect(composable).not.toMatch(
      /^export type (?:Credential|Presentation)\b/mu,
    );
  });

  it("publishes the Compact entrypoints after build", () => {
    if (!existsSync(distSurface("index.js"))) return;
    expect(existsSync(distSurface("hello-family-credential.compact"))).toBe(
      true,
    );
    expect(
      existsSync(distSurface("hello-family-offchain-credential.compact")),
    ).toBe(true);
    expect(
      existsSync(distSurface("hello-family-credential/composable.compact")),
    ).toBe(true);
  });

  it.skipIf(!compactAvailable)(
    "compiles the standalone Compact export outside the monorepo",
    () => {
      if (!existsSync(distSurface("index.js"))) return;

      const temporaryRoot = mkdtempSync(
        join(os.tmpdir(), "hello-family-compact-package-"),
      );
      try {
        cpSync(
          distSurface("hello-family-credential.compact"),
          join(temporaryRoot, "hello-family-credential.compact"),
        );
        cpSync(
          distSurface("hello-family-credential"),
          join(temporaryRoot, "hello-family-credential"),
          { recursive: true },
        );
        cpSync(
          distSurface("credential-compact"),
          join(temporaryRoot, "credential-compact"),
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
            join(temporaryRoot, "hello-family-credential.compact"),
            join(temporaryRoot, "output"),
          ],
          { stdio: "pipe" },
        );
      } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
      }
    },
    60_000,
  );

  it("keeps the generated managed contract subpaths available", () => {
    expect(
      packageJson.exports[
        "./managed/hello-family-credential/contract/index.js"
      ],
    ).toBeDefined();
    expect(
      packageJson.exports[
        "./managed/hello-family-offchain-credential/contract/index.js"
      ],
    ).toBeDefined();
  });
});
