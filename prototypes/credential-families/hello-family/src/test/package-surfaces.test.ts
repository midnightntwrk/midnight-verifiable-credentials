import { describe, expect, it } from "vitest";

import packageJson from "../../package.json" with { type: "json" };

describe("hello-family package surfaces", () => {
  it("exports the root and contract subpaths", () => {
    expect(packageJson.exports["."]).toBeDefined();
    expect(packageJson.exports["./contract"]).toBeDefined();
  });

  it("keeps the generated managed contract subpath available", () => {
    expect(
      packageJson.exports[
        "./managed/hello-family-credential/contract/index.js"
      ],
    ).toBeDefined();
  });
});
