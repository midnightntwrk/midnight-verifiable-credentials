import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusType,
} from "../managed/credentials/contract/index.js";
import { createSigner } from "./proof-fixtures.js";

setNetworkId("undeployed");

const sha256Bytes = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("credentials core: status bindings", () => {
  it("accepts a valid registry-bound status binding", () => {
    const signer = createSigner("status-authority", 778n);
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: sha256Bytes("registry:primary"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: sha256Bytes("status-handle-commitment"),
    };

    expect(() =>
      pureCircuits.assertValidRegistryBoundStatusBinding(binding),
    ).not.toThrow();
  });

  it("accepts a valid status registry reference", () => {
    const signer = createSigner("status-authority", 777n);
    const registryRef = {
      registryId: sha256Bytes("registry:primary"),
      authorityVerificationMethodRef: signer.verificationMethodRef,
    };

    expect(() =>
      pureCircuits.assertValidStatusRegistryRef(registryRef),
    ).not.toThrow();
  });

  it("accepts an explicit no-status binding", () => {
    expect(() => pureCircuits.assertValidNoStatusBinding({})).not.toThrow();
  });

  it("rejects a registry-bound status binding with an empty handle commitment", () => {
    const signer = createSigner("status-authority", 999n);
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: sha256Bytes("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: new Uint8Array(32),
    };

    expect(() =>
      pureCircuits.assertValidRegistryBoundStatusBinding(binding),
    ).toThrow(/Status handle commitment must be set/);
  });

  it("rejects a registry-bound status binding with a non-enum status type value", () => {
    const signer = createSigner("status-authority", 1001n);
    const binding = {
      statusType: 99 as unknown as StatusType,
      registryRef: {
        registryId: sha256Bytes("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: sha256Bytes("status-handle-commitment"),
    };

    expect(() =>
      pureCircuits.assertValidRegistryBoundStatusBinding(binding),
    ).toThrow(/type error/i);
  });
});
