import { describe, expect, it } from "vitest";

import packageJson from "../../package.json" with { type: "json" };

describe("hello-family package surfaces", () => {
  it("exports the root and contract subpaths", () => {
    expect(packageJson.exports["."]).toBeDefined();
    expect(packageJson.exports["./contract"]).toBeDefined();
    expect(packageJson.exports["./offchain-contract"]).toBeDefined();
    expect(packageJson.exports["./testing"]).toBeDefined();
  });

  it("keeps the generated managed contract subpaths available", () => {
    expect(
      packageJson.exports[
        "./managed/hello-family-credential/contract/index.js"
      ],
    ).toBeDefined();
    expect(
      packageJson.exports[
        "./managed/hello-family-offchain-credential/contract/index.js"
      ],
    ).toBeDefined();
  });
});
