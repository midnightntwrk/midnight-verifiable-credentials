import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusType,
} from "../managed/revocation-registry/contract/index.js";
import { createSigner } from "./proof-fixtures.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("status registry: capability compatibility", () => {
  it("accepts a valid revoked-set non-membership status capability", () => {
    const signer = createSigner("status-authority", 888n);
    const capability = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };

    expect(() =>
      pureCircuits.assertValidRevokedSetNonMembershipStatusCapability(
        capability,
      ),
    ).not.toThrow();
  });

  it("accepts a valid authority-attested status capability", () => {
    const signer = createSigner("status-authority", 889n);
    const capability = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };

    expect(() =>
      pureCircuits.assertValidAuthorityAttestedStatusCapability(capability),
    ).not.toThrow();
  });

  it("rejects a revoked-set non-membership status capability with an empty handle commitment", () => {
    const signer = createSigner("status-authority", 999n);
    const capability = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
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

  it("rejects an authority-attested capability with a non-enum status type value", () => {
    const signer = createSigner("status-authority", 1002n);
    const capability = {
      statusType: 99 as unknown as StatusType,
      registryRef: {
        registryId: bytes32("registry:hidden-holder"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };

    expect(() =>
      pureCircuits.assertValidAuthorityAttestedStatusCapability(capability),
    ).toThrow(/type error/i);
  });
});
