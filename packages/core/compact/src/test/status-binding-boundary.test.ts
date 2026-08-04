import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("status binding boundary", () => {
  it("exports shapes without registry authority", () => {
    const source = readFileSync(
      resolve(root, "src/credentials/status-bindings.compact"),
      "utf8",
    );
    expect(source).toContain("StatusRegistryRef");
    expect(source).toContain("NoStatusBinding");
    expect(source).not.toMatch(
      /initializeRegistry|revokeStatus|ledger|witness/i,
    );
  });
});
