import { describe, expect, it } from "vitest";

import packageJson from "../../package.json" with { type: "json" };

describe("passport-kyc scaffold package surfaces", () => {
  it("exports the default root and contract subpath", () => {
    expect(packageJson.exports["."]).toBeDefined();
    expect(packageJson.exports["./contract"]).toBeDefined();
  });
});
