import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/revocation-registry/contract/index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("revocation registry contract", () => {
  it("builds a typed revocation registry state snapshot", () => {
    const state = {
      registryId: bytes32("registry:hidden-holder"),
      revokedRoot: bytes32("revoked-root:epoch-42"),
      epoch: 42n,
    };

    expect(() =>
      pureCircuits.assertValidRevocationRegistryState(state),
    ).not.toThrow();
  });

  it("rejects an empty registry id in a typed snapshot", () => {
    const state = {
      registryId: new Uint8Array(32),
      revokedRoot: bytes32("revoked-root:epoch-42"),
      epoch: 42n,
    };

    expect(() =>
      pureCircuits.assertValidRevocationRegistryState(state),
    ).toThrow(/Revocation registry id must be set/);
  });
});
