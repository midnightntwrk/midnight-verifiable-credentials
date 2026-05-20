import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const claimsSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "dummy-claims-credential",
      "claims.compact",
    ),
    "utf8",
  ),
);

describe("dummy-claims claim surface", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:dummy-claims:v1");
  });

  it("covers every currently supported direct primitive family and nested support", () => {
    expect(claimsSource).toContain("booleanValue: Boolean");
    expect(claimsSource).toContain("byteSizedUnsignedValue: Uint<8>");
    expect(claimsSource).toContain("mediumUnsignedValue: Uint<64>");
    expect(claimsSource).toContain("bigUnsignedValue: Uint<248>");
    expect(claimsSource).toContain("bytes16Value: Bytes<16>");
    expect(claimsSource).toContain("bytes32Value: Bytes<32>");
    expect(claimsSource).toContain("fieldValue: Field");
    expect(claimsSource).toContain("booleanVector: Vector<2, Boolean>");
    expect(claimsSource).toContain("uintVector: Vector<2, Uint<64>>");
    expect(claimsSource).toContain("bytesVector: Vector<2, Bytes<16>>");
    expect(claimsSource).toContain("fieldVector: Vector<2, Field>");
    expect(claimsSource).toContain("nestedValue: DummyNestedClaims");
    expect(claimsSource).toContain(
      "nestedVector: Vector<2, DummyNestedClaims>",
    );
  });
});
