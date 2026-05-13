import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(
    path.resolve(import.meta.dirname, "..", "..", "package.json"),
    "utf8",
  ),
) as {
  exports?: Record<string, unknown>;
  typesVersions?: Record<string, Record<string, string[]>>;
};

describe("university-diploma package surfaces", () => {
  it("exports the contract surface", () => {
    expect(packageJson.exports).toHaveProperty("./contract");
  });

  it("exports the testing surface", () => {
    expect(packageJson.exports).toHaveProperty("./testing");
  });

  it("exposes the managed contract surface for downstream type consumers", () => {
    expect(packageJson.exports).toHaveProperty(
      "./managed/university-diploma-credential/contract/index.js",
    );
    expect(packageJson.typesVersions?.["*"]).toHaveProperty(
      "managed/university-diploma-credential/contract/index.js",
    );
  });
});
