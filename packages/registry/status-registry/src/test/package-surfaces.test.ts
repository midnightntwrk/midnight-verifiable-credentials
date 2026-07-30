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
const indexSource = readFileSync(sourceSurface("index.ts"), "utf8");
const packageJson = JSON.parse(
  readFileSync(path.resolve(packageRoot, "package.json"), "utf8"),
) as { exports?: Record<string, unknown> };

describe("credentials-status-registry package surfaces", () => {
  it("exports the typed off-chain status verifier helpers from the root package surface", () => {
    expect(indexSource).toContain('export * from "./status-verifier.js";');
    expect(indexSource).toContain('export * from "./status-errors.js";');
    expect(indexSource).toContain(
      'export * from "./canonical-non-membership.js";',
    );
  });
  it("keeps the unsafe authority-attestation helper off the root package surface", () => {
    expect(indexSource).not.toContain(
      "unsafeSignAuthorityAttestedStatusProofWithNonceScalar",
    );
  });

  it("declares a dedicated testing subpath for unsafe authority-attestation helpers", () => {
    expect(packageJson.exports?.["./testing"]).toBeDefined();
    expect(existsSync(sourceSurface("testing.ts"))).toEqual(true);
  });
});
