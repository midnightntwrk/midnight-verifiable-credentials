import { Buffer } from "node:buffer";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const packageDir = async (packageName) => {
  const pnpmDir = path.join(repoRoot, "node_modules", ".pnpm");
  const entryPrefix = packageName.replace("/", "+");
  const entries = await readdir(pnpmDir);
  const entry = entries.find((value) => value.startsWith(`${entryPrefix}@`));
  if (!entry) {
    throw new Error(`Missing pnpm package entry for ${packageName}`);
  }
  return path.join(pnpmDir, entry, "node_modules", packageName);
};

const importPackageDist = async (packageName, distFile = "index.js") =>
  import(
    pathToFileURL(path.join(await packageDir(packageName), "dist", distFile))
      .href
  );

let DIDContract;
let LedgerToDomain;
let CurveType;
let KeyType;

const base64Url = (bytes) => Buffer.from(bytes).toString("base64url");

const bytes32 = (firstByte) => {
  const bytes = new Uint8Array(32);
  bytes[0] = firstByte;
  return bytes;
};

describe("vendored midnight-did ledger key normalization", () => {
  beforeAll(async () => {
    ({ DIDContract } = await importPackageDist(
      "@midnight-ntwrk/midnight-did-contract",
    ));
    ({ LedgerToDomain } = await importPackageDist(
      "@midnight-ntwrk/midnight-did",
    ));
    ({ CurveType, KeyType } = await importPackageDist(
      "@midnight-ntwrk/midnight-did-domain",
    ));
  });

  it("emits x-only Ed25519 JWKs from opaque ledger strings", () => {
    const x = bytes32(1);

    expect(
      LedgerToDomain.publicKeyJwk({
        kty: DIDContract.KeyType.OKP,
        crv: DIDContract.CurveType.Ed25519,
        x: base64Url(x),
        y: "",
      }),
    ).toEqual({
      kty: KeyType.OKP,
      crv: CurveType.Ed25519,
      x: base64Url(x),
    });
  });

  it("emits x-only X25519 JWKs from the DID package surface", () => {
    const x = bytes32(2);

    expect(
      LedgerToDomain.publicKeyJwk({
        kty: DIDContract.KeyType.OKP,
        crv: DIDContract.CurveType.X25519,
        x: base64Url(x),
        y: "",
      }),
    ).toEqual({
      kty: KeyType.OKP,
      crv: CurveType.X25519,
      x: base64Url(x),
    });
  });

  it("rejects non-empty OKP y ledger strings", () => {
    const x = bytes32(3);
    const y = bytes32(4);

    expect(() =>
      LedgerToDomain.publicKeyJwk({
        kty: DIDContract.KeyType.OKP,
        crv: DIDContract.CurveType.Ed25519,
        x: base64Url(x),
        y: base64Url(y),
      }),
    ).toThrow("OKP ledger publicKeyJwk.y must be empty");
  });

  it("preserves EC JWK coordinates from opaque ledger strings", () => {
    const x = bytes32(0xf0);
    const y = bytes32(0xe1);

    for (const [ledgerCurve, domainCurve] of [
      [DIDContract.CurveType.Jubjub, CurveType.Jubjub],
      [DIDContract.CurveType.P256, CurveType.P256],
      [DIDContract.CurveType.Secp256k1, CurveType.Secp256k1],
    ]) {
      expect(
        LedgerToDomain.publicKeyJwk({
          kty: DIDContract.KeyType.EC,
          crv: ledgerCurve,
          x: base64Url(x),
          y: base64Url(y),
        }),
      ).toEqual({
        kty: KeyType.EC,
        crv: domainCurve,
        x: base64Url(x),
        y: base64Url(y),
      });
    }
  });
});
