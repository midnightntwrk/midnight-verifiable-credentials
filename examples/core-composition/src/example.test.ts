import { describe, expect, it } from "vitest";

import { roundTripCompactValue, syntheticFamily } from "./index.js";

describe("synthetic core composition", () => {
  it("defines generic family and schema metadata", () => {
    expect(syntheticFamily.name).toBe("Synthetic score credential");
    expect(syntheticFamily.schema.claims).toHaveLength(2);
  });

  it("round-trips an opaque Compact value", () => {
    expect(roundTripCompactValue([new Uint8Array([1, 2, 3])])).toEqual([
      new Uint8Array([1, 2, 3]),
    ]);
  });
});
