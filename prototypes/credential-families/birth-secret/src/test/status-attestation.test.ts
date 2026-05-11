import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  pureCircuits,
  StatusCapabilityKind,
} from "../managed/secret-birth-credential/contract/index.js";
import {
  createSecretBirthCredentialFixture,
  createSigner,
  signProof,
} from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("secret birth credential: authority-attested status verification", () => {
  it("accepts an authority-attested status protocol submission when the shared status binding and proof protocol align", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(18),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        fixture.authorityAttestedStatusVerificationRequest,
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).not.toThrow();
  });

  it("accepts an authority-attested status proof bound to the verifier request root", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(12),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        fixture.authorityAttestedStatusVerificationRequest,
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).not.toThrow();
  });

  it("rejects an authority-attested status proof when the verifier root changes", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(13),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.authorityAttestedStatusVerificationRequest,
          statusRequest: {
            ...fixture.authorityAttestedStatusVerificationRequest.statusRequest,
            registryState: {
              ...fixture.authorityAttestedStatusVerificationRequest
                .statusRequest.registryState,
              revokedRoot: new Uint8Array(32).fill(5),
            },
          },
        },
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/revoked root does not match/i);
  });

  it("rejects an authority-attested status request when its challenge diverges from the verification request", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(15),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.authorityAttestedStatusVerificationRequest,
          statusRequest: {
            ...fixture.authorityAttestedStatusVerificationRequest.statusRequest,
            verifierChallengeHash: new Uint8Array(32).fill(6),
          },
        },
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(
      /request challenge must match the verification request challenge/i,
    );
  });

  it("rejects an authority-attested status proof when its protocol request snapshot diverges from the verifier request", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(20),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        fixture.authorityAttestedStatusVerificationRequest,
        submission,
        {
          statusProofProtocol: {
            ...fixture.authorityAttestedStatusProtocolInputs
              .statusProofProtocol,
            request: {
              ...fixture.authorityAttestedStatusProtocolInputs
                .statusProofProtocol.request,
              registryState: {
                ...fixture.authorityAttestedStatusProtocolInputs
                  .statusProofProtocol.request.registryState,
                registryVersion: 0n,
              },
            },
          },
        },
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/registry version does not match the verifier request/i);
  });

  it("rejects an authority-attested status proof after expiration", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(14),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        fixture.authorityAttestedStatusVerificationRequest,
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 101n,
      ),
    ).toThrow(/has expired/i);
  });

  it("rejects an authority-attested status proof signed by the wrong authority", () => {
    const fixture = createSecretBirthCredentialFixture();
    const wrongAuthority = createSigner("other-authority", 444n);
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(21),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
    const statement =
      fixture.authorityAttestedStatusProtocolInputs.statusProofProtocol
        .attestation.statement;

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        fixture.authorityAttestedStatusVerificationRequest,
        submission,
        {
          statusProofProtocol: {
            ...fixture.authorityAttestedStatusProtocolInputs
              .statusProofProtocol,
            attestation: {
              ...fixture.authorityAttestedStatusProtocolInputs
                .statusProofProtocol.attestation,
              proof: signProof({
                bodyRoot:
                  pureCircuits.authorityAttestedStatusStatementRoot(statement),
                signer: wrongAuthority,
                createdAt: fixture.verificationRequest.envelope.createdAt + 1n,
                challengeHash:
                  fixture.authorityAttestedStatusVerificationRequest
                    .statusRequest.verifierChallengeHash,
                nonceScalar: 37n,
                context: "statusAttestation",
              }),
            },
          },
        },
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/does not match the status authority/i);
  });

  it("rejects an authority-attested request when the verifier policy expects another status proof mode", () => {
    const fixture = createSecretBirthCredentialFixture();
    const submission = {
      envelope: {
        ...fixture.verificationRequest.envelope,
        initialMessage: false,
        respondsToMessageId: fixture.verificationRequest.envelope.messageId,
        messageId: new Uint8Array(32).fill(22),
        createdAt: fixture.verificationRequest.envelope.createdAt + 2n,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(
        fixture.credentialWithStatusBinding,
        {
          ...fixture.authorityAttestedStatusVerificationRequest,
          statusPolicy: {
            ...fixture.authorityAttestedStatusVerificationRequest.statusPolicy,
            acceptedStatusCapability:
              StatusCapabilityKind.revokedSetNonMembership,
            enforceAttestationMaxAge: false,
            maxAttestationAge: 0n,
          },
        },
        submission,
        fixture.authorityAttestedStatusProtocolInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
        fixture.verificationRequest.envelope.createdAt + 10n,
      ),
    ).toThrow(/does not accept authority-attested status/i);
  });
});
