import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("dummy-claims package surfaces", () => {
  it("exports the generated contract surface from the package entrypoints", () => {
    const contractSource = readFileSync(
      path.resolve(import.meta.dirname, "..", "contract.ts"),
      "utf8",
    );
    const indexSource = readFileSync(
      path.resolve(import.meta.dirname, "..", "index.ts"),
      "utf8",
    );

    expect(contractSource).toContain(
      "./managed/dummy-claims-credential/contract/index.js",
    );
    expect(indexSource).toContain(
      "./managed/dummy-claims-credential/contract/index.js",
    );
  });

  it("publishes the managed contract entrypoint from package.json", () => {
    const packageJson = JSON.parse(
      readFileSync(
        path.resolve(import.meta.dirname, "..", "..", "package.json"),
        "utf8",
      ),
    ) as {
      exports?: Record<string, unknown>;
    };

    expect(packageJson.exports).toHaveProperty(
      "./managed/dummy-claims-credential/contract/index.js",
    );
    expect(packageJson.exports).toHaveProperty("./testing");
  });
});
