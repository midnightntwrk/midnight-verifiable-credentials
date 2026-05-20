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

describe("mixed-claims package surfaces", () => {
  it("exports the default root and contract subpath", () => {
    expect(packageJson.exports).toHaveProperty(".");
    expect(packageJson.exports).toHaveProperty("./contract");
  });

  it("exposes the managed contract surface for downstream type consumers", () => {
    expect(packageJson.exports).toHaveProperty(
      "./managed/mixed-claims-credential/contract/index.js",
    );
    expect(packageJson.typesVersions?.["*"]).toHaveProperty(
      "managed/mixed-claims-credential/contract/index.js",
    );
  });
});
