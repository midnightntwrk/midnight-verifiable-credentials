import { describe, expect, it } from "vitest";

import { roundTripCompactValue, syntheticFamily } from "./index.js";

describe("synthetic core composition", () => {
  it("defines and encodes a synthetic credential", () => {
    const credential = { subject: "subject-001", score: 7 };

    expect(
      syntheticFamily.credentialCodec.decode(
        syntheticFamily.credentialCodec.encode(credential),
      ),
    ).toEqual(credential);
    expect(syntheticFamily.composition.packages).toHaveLength(2);
  });

  it("round-trips an opaque Compact value", () => {
    expect(roundTripCompactValue([new Uint8Array([1, 2, 3])])).toEqual([
      new Uint8Array([1, 2, 3]),
    ]);
  });
});
