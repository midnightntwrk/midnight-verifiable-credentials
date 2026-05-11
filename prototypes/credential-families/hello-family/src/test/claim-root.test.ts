import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const claimsSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "hello-family-credential",
    "claims.compact",
  ),
  "utf8",
);

describe("hello-family claim surface", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:hello-family:v1");
  });

  it("documents the currently supported Compact primitive claim shapes", () => {
    expect(claimsSource).toContain("booleanValue: Boolean");
    expect(claimsSource).toContain("smallUintValue: Uint<8>");
    expect(claimsSource).toContain("bigUnsignedValue: Uint<248>");
    expect(claimsSource).toContain("bytesValue: Bytes<32>");
    expect(claimsSource).toContain("fieldValue: Field");
    expect(claimsSource).toContain("booleanVector: Vector<2, Boolean>");
    expect(claimsSource).toContain("uintVector: Vector<2, Uint<64>>");
    expect(claimsSource).toContain("bytesVector: Vector<2, Bytes<16>>");
    expect(claimsSource).toContain("fieldVector: Vector<2, Field>");
  });
});
