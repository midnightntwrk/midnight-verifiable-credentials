import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/credentials/contract/index.js";
import { createSigner } from "./proof-fixtures.js";

setNetworkId("undeployed");

const sha256Bytes = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("credentials core: status capabilities", () => {
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

  it("accepts a valid revoked-set non-membership status capability", () => {
    const signer = createSigner("status-authority", 888n);
    const capability = {
      registryRef: {
        registryId: sha256Bytes("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: sha256Bytes("status-handle-commitment"),
    };

    expect(() =>
      pureCircuits.assertValidRevokedSetNonMembershipStatusCapability(
        capability,
      ),
    ).not.toThrow();
  });

  it("derives a deterministic revoked-set status handle", () => {
    const first = pureCircuits.revokedSetStatusHandle(
      sha256Bytes("credential-root:alice"),
      sha256Bytes("registry:hidden-holder"),
      sha256Bytes("issuer-status-salt"),
    );
    const second = pureCircuits.revokedSetStatusHandle(
      sha256Bytes("credential-root:alice"),
      sha256Bytes("registry:hidden-holder"),
      sha256Bytes("issuer-status-salt"),
    );

    expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
  });

  it("rejects a revoked-set non-membership status capability with an empty handle commitment", () => {
    const signer = createSigner("status-authority", 999n);
    const capability = {
      registryRef: {
        registryId: sha256Bytes("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: new Uint8Array(32),
    };

    expect(() =>
      pureCircuits.assertValidRevokedSetNonMembershipStatusCapability(
        capability,
      ),
    ).toThrow(/Status handle commitment must be set/);
  });
});
