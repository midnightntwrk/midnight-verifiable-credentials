import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/secret-birth-credential/contract/index.js";
import { createSecretBirthCredentialFixture } from "./credential-fixtures.js";

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
});
