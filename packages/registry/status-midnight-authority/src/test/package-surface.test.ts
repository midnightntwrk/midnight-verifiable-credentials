import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("status authority package surface", () => {
  it("owns write authorization and status-specific signing without exporting key custody", () => {
    const source = readFileSync(path.join(packageRoot, "src/index.ts"), "utf8");
    expect(source).toContain("createStatusRegistryAuthorityGateV1");
    expect(source).toContain("StatusAuthoritySignerV1");
    expect(source).not.toMatch(/secretKey|privateKey/gu);
  });
});
