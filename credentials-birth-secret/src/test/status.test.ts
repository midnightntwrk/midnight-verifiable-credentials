import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/secret-birth-credential/contract/index.js";
import { createSecretBirthCredentialFixture } from "./credential-fixtures.js";

setNetworkId("undeployed");

describe("secret birth credential: status-aware verification", () => {
  it("accepts a status-aware verification submission when the policy and witness inputs align", () => {
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesStatusRequest(
        fixture.credentialWithStatus,
        fixture.statusVerificationRequest,
        submission,
        fixture.statusVerificationInputs,
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
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesStatusRequest(
        fixture.credentialWithStatus,
        {
          ...fixture.statusVerificationRequest,
          statusPolicy: {
            ...fixture.statusVerificationRequest.statusPolicy,
            acceptedRegistryId: new Uint8Array(32).fill(3),
          },
        },
        submission,
        fixture.statusVerificationInputs,
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
      nonRevocationWitness: {
        ...fixture.statusVerificationInputs.nonRevocationWitness,
        statusHandle: new Uint8Array(32).fill(7),
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialVerificationSubmissionMatchesStatusRequest(
        fixture.credentialWithStatus,
        fixture.statusVerificationRequest,
        submission,
        mismatchedInputs,
        fixture.witness.holderSecret,
        fixture.witness.holderSecretOpening,
        fixture.witness.holderBindingBlindingFactor,
      ),
    ).toThrow(/does not match the status handle commitment/i);
  });
});
