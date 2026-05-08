import { describe, expect, it } from "vitest";

import type {
  OffchainDIDHolderBinding,
  OffchainMidnightHolderBinding,
} from "../index.js";

describe("credentials core: offchain DID holder binding alias", () => {
  it("keeps the preferred TS alias structurally identical to the core shape", () => {
    const binding: OffchainDIDHolderBinding = {
      holderDidStateHash: new Uint8Array(32).fill(7),
      holderMethodId: new Uint8Array(32).fill(8),
      holderPublicKey: {
        x: 1n,
        y: 2n,
      },
    };

    const compatibilityBinding: OffchainMidnightHolderBinding = binding;

    expect(compatibilityBinding.holderPublicKey).toEqual({
      x: 1n,
      y: 2n,
    });
  });
});
