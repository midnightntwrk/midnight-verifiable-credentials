import { Buffer } from "node:buffer";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  buildAuthorityAttestedStatusCapability,
  buildAuthorityAttestedStatusRequest,
  buildAuthorityAttestedStatusStatement,
  signAuthorityAttestedStatusProof,
} from "../index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const authoritySigner = {
  secretKey: 987654321n,
  publicKey: ecMulGenerator(987654321n),
  verificationMethodRef: {
    didContractAddress: { bytes: bytes32("did-contract:status-authority") },
    methodId: bytes32("#status-authority-key-1"),
  },
};

describe("authority-attested status builder", () => {
  it("builds a verifier-supplied status request", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });

    expect(request.registryState.revokedRoot).toEqual(
      bytes32("revoked-root:current"),
    );
  });

  it("builds a capability, statement, and signed attestation", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const capability = buildAuthorityAttestedStatusCapability({
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: capability.statusHandleCommitment,
      expiresAt: 200n,
    });
    const attestation = signAuthorityAttestedStatusProof({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
      nonceScalar: 17n,
    });

    expect(attestation.statement.verifierChallengeHash).toEqual(
      request.verifierChallengeHash,
    );
    expect(attestation.proof.signerVerificationMethodRef).toEqual(
      authoritySigner.verificationMethodRef,
    );
  });
});
