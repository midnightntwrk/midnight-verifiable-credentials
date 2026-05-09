import { Buffer } from "node:buffer";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusCapabilityKind,
  StatusType,
} from "../managed/revocation-registry/contract/index.js";
import { createSigner, signStatusProof } from "./proof-fixtures.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

describe("status registry: proof protocols", () => {
  it("derives a deterministic revoked-set status handle", () => {
    const claimRoot = bytes32("credential-claim-root");
    const registryId = bytes32("registry:hidden-holder");
    const issuerStatusSalt = bytes32("issuer-status-salt");

    expect(
      pureCircuits.revokedSetStatusHandle(
        claimRoot,
        registryId,
        issuerStatusSalt,
      ),
    ).toEqual(
      pureCircuits.revokedSetStatusHandle(
        claimRoot,
        registryId,
        issuerStatusSalt,
      ),
    );
  });

  it("accepts a revoked-set status proof protocol bound to the verifier request", () => {
    const signer = createSigner("status-authority", 890n);
    const protocol = {
      request: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
      },
      witnessInput: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        statusHandle: bytes32("status-handle"),
        statusHandleOpening: bytes32("status-handle-opening"),
      },
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: protocol.request.registryState.registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: pureCircuits.revokedSetStatusHandleCommitment(
        protocol.witnessInput.statusHandle,
        protocol.witnessInput.statusHandleOpening,
      ),
    };

    expect(() =>
      pureCircuits.assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(
        binding,
        protocol,
      ),
    ).not.toThrow();
  });

  it("rejects a revoked-set status proof protocol when the witness root differs from the request", () => {
    const protocol = {
      request: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:request"),
          registryVersion: 0n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
      },
      witnessInput: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:witness"),
          registryVersion: 0n,
        },
        statusHandle: bytes32("status-handle"),
        statusHandleOpening: bytes32("status-handle-opening"),
      },
    };

    expect(() =>
      pureCircuits.assertValidRevokedSetNonMembershipStatusProofProtocol(
        protocol,
      ),
    ).toThrow(/revoked root does not match/i);
  });

  it("rejects a revoked-set status proof protocol when the witness version differs from the request", () => {
    const protocol = {
      request: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:request"),
          registryVersion: 1n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
      },
      witnessInput: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:request"),
          registryVersion: 0n,
        },
        statusHandle: bytes32("status-handle"),
        statusHandleOpening: bytes32("status-handle-opening"),
      },
    };

    expect(() =>
      pureCircuits.assertValidRevokedSetNonMembershipStatusProofProtocol(
        protocol,
      ),
    ).toThrow(/registry version does not match/i);
  });

  it("rejects a revoked-set status proof protocol when the binding commitment is unset", () => {
    const signer = createSigner("status-authority", 891n);
    const protocol = {
      request: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
      },
      witnessInput: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        statusHandle: bytes32("status-handle"),
        statusHandleOpening: bytes32("status-handle-opening"),
      },
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: protocol.request.registryState.registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: new Uint8Array(32),
    };

    expect(() =>
      pureCircuits.assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(
        binding,
        protocol,
      ),
    ).toThrow(/Status handle commitment must be set/i);
  });

  it("rejects a revoked-set status proof protocol when the binding commitment differs from the witness", () => {
    const signer = createSigner("status-authority", 892n);
    const protocol = {
      request: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        verifierChallengeHash: bytes32("challenge:status"),
      },
      witnessInput: {
        registryState: {
          registryId: bytes32("registry:hidden-holder"),
          revokedRoot: bytes32("revoked-root:current"),
          registryVersion: 0n,
        },
        statusHandle: bytes32("status-handle"),
        statusHandleOpening: bytes32("status-handle-opening"),
      },
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: protocol.request.registryState.registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("binding-commitment"),
    };

    expect(() =>
      pureCircuits.assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(
        binding,
        protocol,
      ),
    ).toThrow(
      /revoked-set status proof protocol does not match the status handle commitment/i,
    );
  });

  it("accepts an authority-attested status proof at the verifier max-age boundary", () => {
    const signer = createSigner("status-authority", 321n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
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
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
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
      enforceAttestationMaxAge: true,
      maxAttestationAge: 50n,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusBinding(
        policy,
        binding,
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
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
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
        proof: signStatusProof({
          bodyRoot:
            pureCircuits.authorityAttestedStatusStatementRoot(statement),
          signer,
          createdAt: 100n,
          challengeHash: request.verifierChallengeHash,
          nonceScalar: 13n,
        }),
      },
    };
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
      enforceRegistryId: true,
      acceptedRegistryId: request.registryState.registryId,
      enforceAttestationMaxAge: true,
      maxAttestationAge: 50n,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(
        policy,
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
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authority.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: binding.statusHandleCommitment,
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: false,
      expiresAt: 0n,
    };
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        signer: wrongAuthority,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 19n,
      }),
    };

    expect(() =>
      pureCircuits.assertAuthorityAttestedStatusProofMatchesBinding(
        binding,
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
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: authority.verificationMethodRef,
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
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
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
      enforceAttestationMaxAge: true,
      maxAttestationAge: 50n,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusBinding(
        policy,
        binding,
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
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const statement = {
      registryState: {
        registryId: request.registryState.registryId,
        revokedRoot: bytes32("revoked-root:attested"),
        registryVersion: 0n,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: false,
      expiresAt: 0n,
    };
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
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

  it("rejects an authority-attested status proof when the verifier version differs", () => {
    const signer = createSigner("status-authority", 3243n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 1n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const statement = {
      registryState: {
        registryId: request.registryState.registryId,
        revokedRoot: request.registryState.revokedRoot,
        registryVersion: 0n,
      },
      statusHandleCommitment: bytes32("status-handle-commitment"),
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: false,
      expiresAt: 0n,
    };
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        signer,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 39n,
      }),
    };

    expect(() =>
      pureCircuits.assertAuthorityAttestedStatusProofMatchesRequest(
        request,
        attestation,
        110n,
      ),
    ).toThrow(/registry version does not match/i);
  });

  it("rejects an authority-attested status proof when the verifier challenge differs", () => {
    const signer = createSigner("status-authority", 3241n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:request"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: bytes32("status-handle-commitment"),
      verifierChallengeHash: bytes32("challenge:attested"),
      hasExpiration: false,
      expiresAt: 0n,
    };
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        signer,
        createdAt: 100n,
        challengeHash: statement.verifierChallengeHash,
        nonceScalar: 37n,
      }),
    };

    expect(() =>
      pureCircuits.assertAuthorityAttestedStatusProofMatchesRequest(
        request,
        attestation,
        110n,
      ),
    ).toThrow(/challenge hash does not match/i);
  });

  it("rejects an authority-attested status proof when it exceeds the verifier max-age policy", () => {
    const signer = createSigner("status-authority", 3242n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
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
    const attestation = {
      statement,
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
        signer,
        createdAt: 100n,
        challengeHash: request.verifierChallengeHash,
        nonceScalar: 38n,
      }),
    };
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.authorityAttestedStatus,
      enforceRegistryId: true,
      acceptedRegistryId: request.registryState.registryId,
      enforceAttestationMaxAge: true,
      maxAttestationAge: 25n,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusBinding(
        policy,
        binding,
        request,
        attestation,
        130n,
      ),
    ).toThrow(/exceeds the verifier max-age policy/i);
  });

  it("rejects an expired authority-attested status proof", () => {
    const signer = createSigner("status-authority", 325n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
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
      proof: signStatusProof({
        bodyRoot: pureCircuits.authorityAttestedStatusStatementRoot(statement),
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

  it("rejects an authority-attested status proof protocol when the binding commitment differs", () => {
    const signer = createSigner("status-authority", 3251n);
    const request = {
      registryState: {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("revoked-root:current"),
        registryVersion: 0n,
      },
      verifierChallengeHash: bytes32("challenge:status"),
    };
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: request.registryState.registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: bytes32("binding-commitment"),
    };
    const statement = {
      registryState: request.registryState,
      statusHandleCommitment: bytes32("attested-commitment"),
      verifierChallengeHash: request.verifierChallengeHash,
      hasExpiration: true,
      expiresAt: 200n,
    };
    const protocol = {
      request,
      attestation: {
        statement,
        proof: signStatusProof({
          bodyRoot:
            pureCircuits.authorityAttestedStatusStatementRoot(statement),
          signer,
          createdAt: 100n,
          challengeHash: request.verifierChallengeHash,
          nonceScalar: 41n,
        }),
      },
    };

    expect(() =>
      pureCircuits.assertRegistryBoundStatusBindingMatchesAuthorityAttestedStatusProofProtocol(
        binding,
        protocol,
        150n,
      ),
    ).toThrow(/status handle commitment does not match the status binding/i);
  });

  it("rejects revoked-set acceptance when the policy does not require status", () => {
    const signer = createSigner("status-authority", 2234n);
    const registryId = bytes32("registry:hidden-holder");
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId,
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: pureCircuits.revokedSetStatusHandleCommitment(
        bytes32("status-handle"),
        bytes32("status-opening"),
      ),
    };
    const witnessInput = {
      registryState: {
        registryId,
        revokedRoot: bytes32("revoked-root"),
        registryVersion: 0n,
      },
      statusHandle: bytes32("status-handle"),
      statusHandleOpening: bytes32("status-opening"),
    };
    const policy = {
      requireStatus: false,
      acceptedStatusCapability: StatusCapabilityKind.noStatus,
      enforceRegistryId: false,
      acceptedRegistryId: new Uint8Array(32),
      enforceAttestationMaxAge: false,
      maxAttestationAge: 0n,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipBinding(
        policy,
        binding,
        witnessInput,
      ),
    ).toThrow(/must require status/i);
  });

  it("rejects a registry-enforced policy when the binding registry id diverges", () => {
    const signer = createSigner("status-authority", 2235n);
    const binding = {
      statusType: StatusType.revocationRegistry,
      registryRef: {
        registryId: bytes32("registry:binding"),
        authorityVerificationMethodRef: signer.verificationMethodRef,
      },
      statusHandleCommitment: pureCircuits.revokedSetStatusHandleCommitment(
        bytes32("status-handle"),
        bytes32("status-opening"),
      ),
    };
    const witnessInput = {
      registryState: {
        registryId: bytes32("registry:witness"),
        revokedRoot: bytes32("revoked-root"),
        registryVersion: 0n,
      },
      statusHandle: bytes32("status-handle"),
      statusHandleOpening: bytes32("status-opening"),
    };
    const policy = {
      requireStatus: true,
      acceptedStatusCapability: StatusCapabilityKind.revokedSetNonMembership,
      enforceRegistryId: true,
      acceptedRegistryId: bytes32("registry:policy"),
      enforceAttestationMaxAge: false,
      maxAttestationAge: 0n,
    };

    expect(() =>
      pureCircuits.assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipBinding(
        policy,
        binding,
        witnessInput,
      ),
    ).toThrow(/status binding/i);
  });
});
