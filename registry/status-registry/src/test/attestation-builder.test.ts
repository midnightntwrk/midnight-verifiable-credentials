import { Buffer } from "node:buffer";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import { JUBJUB_SUBGROUP_ORDER } from "@midnight-ntwrk/midnight-did-credentials";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  buildAuthorityAttestedStatusProofProtocol,
  buildAuthorityAttestedStatusRequest,
  buildAuthorityAttestedStatusStatement,
  buildRegistryBoundStatusBinding,
  deriveAuthorityAttestedStatusProofNonceScalar,
  signAuthorityAttestedStatusProof,
  StatusType,
  unsafeSignAuthorityAttestedStatusProofWithNonceScalar,
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
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });

    expect(request.registryState.revokedRoot).toEqual(
      bytes32("revoked-root:current"),
    );
  });

  it("builds a binding, statement, and signed attestation", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const binding = buildRegistryBoundStatusBinding({
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: binding.statusHandleCommitment,
      expiresAt: 200n,
    });
    const attestation = signAuthorityAttestedStatusProof({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });

    expect(binding.statusType).toEqual(StatusType.revocationRegistry);
    expect(attestation.statement.verifierChallengeHash).toEqual(
      request.verifierChallengeHash,
    );
    expect(attestation.proof.signerVerificationMethodRef).toEqual(
      authoritySigner.verificationMethodRef,
    );
  });

  it("builds a shared status binding and authority-attested proof protocol", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const binding = buildRegistryBoundStatusBinding({
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authoritySigner.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: binding.statusHandleCommitment,
      expiresAt: 200n,
    });
    const attestation = signAuthorityAttestedStatusProof({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });
    const protocol = buildAuthorityAttestedStatusProofProtocol({
      request,
      attestation,
    });

    expect(binding.statusType).toEqual(StatusType.revocationRegistry);
    expect(protocol.request.verifierChallengeHash).toEqual(
      request.verifierChallengeHash,
    );
    expect(protocol.attestation.statement.statusHandleCommitment).toEqual(
      binding.statusHandleCommitment,
    );
  });

  it("derives a deterministic nonce scalar for the same attestation input", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    const first = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });
    const second = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });

    expect(first).toEqual(second);
    expect(first).toBeGreaterThan(0n);
    expect(first).toBeLessThan(JUBJUB_SUBGROUP_ORDER);
  });

  it("changes the derived nonce scalar when the attestation context changes", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    const first = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });
    const second = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 101n,
    });

    expect(first).not.toEqual(second);
  });

  it("changes the derived nonce scalar when statement fields change", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });
    const baseNonceScalar = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });

    const changedCommitmentStatement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment:v2"),
      expiresAt: 200n,
    });
    const changedChallengeStatement = buildAuthorityAttestedStatusStatement({
      request: buildAuthorityAttestedStatusRequest({
        registryState: request.registryState,
        verifierChallengeHash: bytes32("challenge:status:v2"),
      }),
      statusHandleCommitment: statement.statusHandleCommitment,
      expiresAt: statement.expiresAt,
    });
    const changedRevokedRootStatement = buildAuthorityAttestedStatusStatement({
      request: buildAuthorityAttestedStatusRequest({
        registryState: {
          registryId: request.registryState.registryId,
          revokedRoot: bytes32("revoked-root:next"),
          registryVersion: request.registryState.registryVersion,
        },
        verifierChallengeHash: request.verifierChallengeHash,
      }),
      statusHandleCommitment: statement.statusHandleCommitment,
      expiresAt: statement.expiresAt,
    });

    expect(
      deriveAuthorityAttestedStatusProofNonceScalar({
        statement: changedCommitmentStatement,
        signer: authoritySigner,
        createdAt: 100n,
      }),
    ).not.toEqual(baseNonceScalar);
    expect(
      deriveAuthorityAttestedStatusProofNonceScalar({
        statement: changedChallengeStatement,
        signer: authoritySigner,
        createdAt: 100n,
      }),
    ).not.toEqual(baseNonceScalar);
    expect(
      deriveAuthorityAttestedStatusProofNonceScalar({
        statement: changedRevokedRootStatement,
        signer: authoritySigner,
        createdAt: 100n,
      }),
    ).not.toEqual(baseNonceScalar);
  });

  it("changes the derived nonce scalar when the signer secret key changes", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    const first = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });
    const second = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: {
        ...authoritySigner,
        secretKey: 123456789n,
      },
      createdAt: 100n,
    });

    expect(first).not.toEqual(second);
  });

  it("changes the derived nonce scalar when the signer verification method changes", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    const first = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });
    const changedDidContractAddress =
      deriveAuthorityAttestedStatusProofNonceScalar({
        statement,
        signer: {
          ...authoritySigner,
          verificationMethodRef: {
            ...authoritySigner.verificationMethodRef,
            didContractAddress: {
              bytes: bytes32("did-contract:status-authority:v2"),
            },
          },
        },
        createdAt: 100n,
      });
    const changedMethodId = deriveAuthorityAttestedStatusProofNonceScalar({
      statement,
      signer: {
        ...authoritySigner,
        verificationMethodRef: {
          ...authoritySigner.verificationMethodRef,
          methodId: bytes32("#status-authority-key-2"),
        },
      },
      createdAt: 100n,
    });

    expect(changedDidContractAddress).not.toEqual(first);
    expect(changedMethodId).not.toEqual(first);
  });

  it("produces the same attestation when signing the same input twice", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    const first = signAuthorityAttestedStatusProof({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });
    const second = signAuthorityAttestedStatusProof({
      statement,
      signer: authoritySigner,
      createdAt: 100n,
    });

    expect(first).toEqual(second);
  });

  it("rejects an out-of-range signer secret key for deterministic signing", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    expect(() =>
      deriveAuthorityAttestedStatusProofNonceScalar({
        statement,
        signer: {
          ...authoritySigner,
          secretKey: JUBJUB_SUBGROUP_ORDER,
        },
        createdAt: 100n,
      }),
    ).toThrow(/signer secret key/i);
  });

  it("rejects a createdAt value that exceeds the proof timestamp range", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      expiresAt: 200n,
    });

    expect(() =>
      deriveAuthorityAttestedStatusProofNonceScalar({
        statement,
        signer: authoritySigner,
        createdAt: 1n << 64n,
      }),
    ).toThrow(/createdAt/i);
    expect(() =>
      unsafeSignAuthorityAttestedStatusProofWithNonceScalar({
        statement,
        signer: authoritySigner,
        createdAt: 1n << 64n,
        nonceScalar: 1n,
      }),
    ).toThrow(/createdAt/i);
  });

  it("rejects an out-of-range unsafe nonce scalar override", () => {
    const request = buildAuthorityAttestedStatusRequest({
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    });
    const statement = buildAuthorityAttestedStatusStatement({
      request,
      statusHandleCommitment: bytes32("status-handle-commitment"),
    });

    expect(() =>
      unsafeSignAuthorityAttestedStatusProofWithNonceScalar({
        statement,
        signer: authoritySigner,
        createdAt: 100n,
        nonceScalar: JUBJUB_SUBGROUP_ORDER,
      }),
    ).toThrow(/nonce scalar/i);
  });
});
