import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusCapabilityKind,
} from "../managed/credentials/contract/index.js";
import { createSigner, signProof } from "./proof-fixtures.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("credentials core: authority-attested status", () => {
  it("accepts an authority-attested status proof bound to the request and capability", () => {
    const signer = createSigner("status-authority", 321n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const capability = {
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: capability.statusHandleCommitment,
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: true,
      expiresAt: 200n,
    };
    const attestation = {
      statement,
      proof: signProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        context: "statusAttestation",
        signer,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 17n,
      }),
    };
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
      enforceRegistryId: true,
      acceptedRegistryId: request.registryState.registryId,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatus(
        policy,
        capability,
        request,
        attestation,
        150n,
      ),
    ).not.toThrow();
  });

  it("accepts an authority-attested status proof protocol bound to a shared status binding", () => {
    const signer = createSigner("status-authority", 320n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: binding.statusHandleCommitment,
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: true,
      expiresAt: 200n,
    };
    const protocol = {
      request,
      attestation: {
        statement,
        proof: signProof({
          bodyRoot:
            pureCircuits.authorityAttestedStatusStatementRoot(statement),
          context: "statusAttestation",
          signer,
          createdAt: 100n,
          challengeHash: request.verifierChallengeHash,
          nonceScalar: 13n,
        }),
      },
    };

    expect(() =>
      pureCircuits.assertRegistryBoundStatusBindingMatchesAuthorityAttestedStatusProofProtocol(
        binding,
        protocol,
        150n,
      ),
    ).not.toThrow();
  });

  it("rejects an authority-attested status proof signed by the wrong authority", () => {
    const authority = createSigner("status-authority", 322n);
    const wrongAuthority = createSigner("other-authority", 323n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const capability = {
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authority.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: capability.statusHandleCommitment,
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: false,
      expiresAt: 0n,
    };
    const attestation = {
      statement,
      proof: signProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        context: "statusAttestation",
        signer: wrongAuthority,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 19n,
      }),
    };

    expect(() =>
      pureCircuits.assertAuthorityAttestedStatusProofMatchesCapability(
        capability,
        attestation,
      ),
    ).toThrow(/status authority/i);
  });

  it("rejects an authority-attested status proof signed by the wrong authority through the full policy path", () => {
    const authority = createSigner("status-authority", 326n);
    const wrongAuthority = createSigner("other-authority", 327n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const capability = {
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authority.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: capability.statusHandleCommitment,
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: true,
      expiresAt: 200n,
    };
    const attestation = {
      statement,
      proof: signProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        context: "statusAttestation",
        signer: wrongAuthority,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 31n,
      }),
    };
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
      enforceRegistryId: true,
      acceptedRegistryId: request.registryState.registryId,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatus(
        policy,
        capability,
        request,
        attestation,
        150n,
      ),
    ).toThrow(/status authority/i);
  });

  it("rejects an authority-attested status proof when the verifier root differs", () => {
    const signer = createSigner("status-authority", 324n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:request"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const statement = {
      registryState: {
        registryId: request.registryState.registryId,
        revokedRoot: bytes32("revoked-root:attested"),
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: false,
      expiresAt: 0n,
    };
    const attestation = {
      statement,
      proof: signProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        context: "statusAttestation",
        signer,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 23n,
      }),
    };

    expect(() =>
      pureCircuits.assertAuthorityAttestedStatusProofMatchesRequest(
        request,
        attestation,
        110n,
      ),
    ).toThrow(/revoked root does not match/i);
  });

  it("rejects an expired authority-attested status proof", () => {
    const signer = createSigner("status-authority", 325n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: true,
      expiresAt: 120n,
    };
    const attestation = {
      statement,
      proof: signProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        context: "statusAttestation",
        signer,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 29n,
      }),
    };

    expect(() =>
      pureCircuits.assertAuthorityAttestedStatusProofMatchesRequest(
        request,
        attestation,
        121n,
      ),
    ).toThrow(/has expired/i);
  });
});
