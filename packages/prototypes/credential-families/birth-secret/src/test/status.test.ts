import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusCapabilityKind,
} from "../managed/secret-birth-credential/contract/index.js";
import { createSecretBirthCredentialFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("secret birth credential: status-aware verification", () => {
  it("accepts a live status verification submission when the shared status binding and witness align", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(6),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesLiveStatusRequest(
        fixture.credentialWithStatusBinding,
        fixture.liveStatusVerificationRequest,
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).not.toThrow();
  });

  it("accepts a revoked-set status protocol submission when the shared status binding and proof protocol align", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(16),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        fixture.revokedSetStatusVerificationRequest,
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).not.toThrow();
  });

  it("accepts a revoked-set status verification submission when the policy and proof protocol align", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(9),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        fixture.revokedSetStatusVerificationRequest,
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).not.toThrow();
  });

  it("rejects a status witness that uses a different registry than the verifier policy", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(10),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.revokedSetStatusVerificationRequest,
          statusPolicy: {
            ...fixture.revokedSetStatusVerificationRequest.statusPolicy,
            acceptedRegistryId: new Uint8Array(32).fill(3),
          },
        },
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/registry id does not match/i);
  });

  it("rejects a status witness that does not match the committed status handle", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(11),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };
    const mismatchedInputs = {
      statusProofProtocol: {
        ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol,
        witnessInput: {
          ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol
            .witnessInput,
          statusHandle: new Uint8Array(32).fill(7),
        },
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        fixture.revokedSetStatusVerificationRequest,
        submission,
        mismatchedInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/does not match the status handle commitment/i);
  });

  it("rejects a live status witness that does not match the committed status handle", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(12),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesLiveStatusRequest(
        fixture.credentialWithStatusBinding,
        fixture.liveStatusVerificationRequest,
        submission,
        {
          witnessInput: {
            ...fixture.liveStatusVerificationInputs.witnessInput,
            statusHandle: new Uint8Array(32).fill(7),
          },
        },
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/does not match the status binding handle commitment/i);
  });

  it("rejects a live status request when the verifier policy expects another registry", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(13),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesLiveStatusRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.liveStatusVerificationRequest,
          statusPolicy: {
            ...fixture.liveStatusVerificationRequest.statusPolicy,
            acceptedRegistryId: new Uint8Array(32).fill(3),
          },
        },
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/registry id does not match/i);
  });

  it("rejects a revoked-set status proof protocol when its request challenge diverges from the verification request", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(17),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.revokedSetStatusVerificationRequest,
          statusRequest: {
            ...fixture.revokedSetStatusVerificationRequest.statusRequest,
            verifierChallengeHash: new Uint8Array(32).fill(8),
          },
        },
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(
      /revoked-set status request challenge must match the verification request challenge/i,
    );
  });

  it("rejects a revoked-set status proof protocol when its request snapshot diverges from the verifier request", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(19),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        fixture.revokedSetStatusVerificationRequest,
        submission,
        {
          statusProofProtocol: {
            ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol,
            request: {
              ...fixture.revokedSetStatusVerificationInputs.statusProofProtocol
                .request,
              registryState: {
                ...fixture.revokedSetStatusVerificationInputs
                  .statusProofProtocol.request.registryState,
                registryVersion: 0n,
              },
            },
          },
        },
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/registry version does not match the verifier request/i);
  });

  it("rejects a revoked-set status request when the verifier policy expects another status proof mode", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(20),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.revokedSetStatusVerificationRequest,
          statusPolicy: {
            ...fixture.revokedSetStatusVerificationRequest.statusPolicy,
            acceptedStatusCapability:
              StatusCapabilityKind.authorityAttestedStatus,
          },
        },
        submission,
        fixture.revokedSetStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/does not accept revoked-set non-membership/i);
  });

  it("rejects a live-status request when the verifier policy expects another status proof mode", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(21),
        createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
      },
      schema: fixture.credential.schema,
      issuerVerificationMethodRef:
        fixture.credential.issuerVerificationMethodRef,
      holderBindingProfile: fixture.verificationRequest.holderBindingProfile,
      challengeHash: fixture.verificationRequest.verifierChallengeHash,
      body: {
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        presentation: fixture.presentation,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesLiveStatusRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.liveStatusVerificationRequest,
          statusPolicy: {
            ...fixture.liveStatusVerificationRequest.statusPolicy,
            acceptedStatusCapability:
              StatusCapabilityKind.authorityAttestedStatus,
          },
        },
        submission,
        fixture.liveStatusVerificationInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/does not accept live revoked-set verification/i);
  });

  it("rejects a revoked credential before building any status verification inputs", () => {
    const baseline = createSecretBirthCredentialFixture();

    expect(() =>
      createSecretBirthCredentialFixture({
        revokedStatusHandles: [baseline.witness.statusHandle],
      }),
    ).toThrow(/already present in the revoked set snapshot/i);
  });
});
