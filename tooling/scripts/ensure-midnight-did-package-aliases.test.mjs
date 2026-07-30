import { execFile } from "node:child_process";
import { readFile, readdir, readlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const scriptPath = path.join(
  repoRoot,
  "tooling",
  "scripts",
  "ensure-midnight-did-package-aliases.mjs",
);
const scopeDir = path.join(repoRoot, "node_modules", "@midnight-ntwrk");
const packageNames = [
  "@midnight-ntwrk/midnight-did",
  "@midnight-ntwrk/midnight-did-api",
  "@midnight-ntwrk/midnight-did-contract",
  "@midnight-ntwrk/midnight-did-domain",
  "@midnight-ntwrk/midnight-did-jubjub-schnorr",
  "@midnight-ntwrk/midnight-did-secret-storage",
];

const packageDir = async (packageName) => {
  const pnpmDir = path.join(repoRoot, "node_modules", ".pnpm");
  const entryPrefix = packageName.replace("/", "+");
  const entries = await readdir(pnpmDir);
  const matches = entries
    .filter((value) => value.startsWith(`${entryPrefix}@`))
    .sort();
  if (matches.length === 0) {
    throw new Error(`Missing pnpm package entry for ${packageName}`);
  }
  expect(matches).toHaveLength(1);
  const [entry] = matches;
  return path.join(pnpmDir, entry, "node_modules", packageName);
};

const scopedPackagePath = (packageName) =>
  path.join(scopeDir, packageName.slice("@midnight-ntwrk/".length));

const symlinkTarget = async (linkPath) =>
  path.resolve(path.dirname(linkPath), await readlink(linkPath));

describe("midnight-did package aliases", () => {
  beforeAll(async () => {
    await execFileAsync(process.execPath, [scriptPath], { cwd: repoRoot });
  });

  it("links root DID package aliases to vendored pnpm packages", async () => {
    for (const packageName of packageNames) {
      const linkPath = scopedPackagePath(packageName);
      await expect(symlinkTarget(linkPath)).resolves.toBe(
        await packageDir(packageName),
      );
    }
  });

  it("links the legacy Compact contract alias to the DID contract package", async () => {
    await expect(symlinkTarget(path.join(scopeDir, "contract"))).resolves.toBe(
      scopedPackagePath("@midnight-ntwrk/midnight-did-contract"),
    );
  });

  it("uses DID's opaque JWK ledger conversion instead of a generated split-byte fallback", async () => {
    const contents = await readFile(
      path.join(
        scopedPackagePath("@midnight-ntwrk/midnight-did"),
        "dist",
        "ledger-to-domain.js",
      ),
      "utf8",
    );

    // These markers come from midnight-did's dist/ledger-to-domain.js and are
    // intentionally pinned so upstream DID conversion drift fails loudly here.
    expect(contents).toContain("ledgerOpaqueString(publicKeyJwk.x");
    expect(contents).toContain("ledgerOpaqueString(publicKeyJwk.y");
    expect(contents).toContain("[LedgerCurveType.X25519]: CurveType.X25519");
    expect(contents).toContain(
      "[LedgerCurveType.Secp256k1]: CurveType.Secp256k1",
    );
    expect(contents).toContain("OKP ledger publicKeyJwk.y must be empty");
    expect(contents).not.toContain("combineBytes16(publicKeyJwk.xLow");
    expect(contents).not.toContain("encodeFieldElement(publicKeyJwk");
  });
});
