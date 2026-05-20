import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  type BirthCredentialIssuanceRequest,
  type BirthCredentialIssuanceResult,
} from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";
import type {
  SecretBirthCredentialVerificationRequest,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";
import { describe, expect, it } from "vitest";

import { HolderAgent } from "../../agents/holder-agent.js";
import { type ClaimWitness, IssuerAgent } from "../../agents/issuer-agent.js";
import { SecretHolderAgent, type SecretPresentationWitness } from "../../agents/secret-holder-agent.js";
import {
  type SecretClaimWitness,
  SecretIssuerAgent,
} from "../../agents/secret-issuer-agent.js";
import {
  type SecretSimulatorWitness,
  VerifierAgent,
} from "../../agents/verifier-agent.js";
import {
  createNodeFileBackedProtocolPartyDependencies,
  NodeCryptoRandomnessSource,
} from "../../reference/node-reference-path.js";
import { MessageBus } from "../../transport/message-bus.js";
import { createDIDProfile, padText, sha256 } from "../helpers/did-provider.js";

describe("node production reference path", () => {
  const explicitIssuerProfile = createDIDProfile(
    "issuer",
    "reference-issuer",
    123456789n,
  );
  const explicitIssuerRecipient = explicitIssuerProfile.label;
  const explicitHolderProfile = createDIDProfile(
    "holder",
    "reference-holder",
    987654321n,
  );
  const explicitHolderRecipient = explicitHolderProfile.label;
  const explicitClaimWitness: ClaimWitness = {
    subjectId: sha256("subject:reference-alice"),
    subjectOpening: sha256("opening:reference-subject"),
    legalNamePadded: padText("Reference Alice"),
    legalNameOpening: sha256("opening:reference-legal-name"),
    birthDateDays: 3650n,
    birthDateOpening: sha256("opening:reference-birth-date"),
    birthCountryCodePadded: padText("CAN"),
    birthCountryCodeOpening: sha256("opening:reference-birth-country"),
    issuedAt: 10_000n,
    expiresAt: 20_000n,
  };

  const secretIssuerProfile = createDIDProfile(
    "issuer",
    "reference-secret-issuer",
    123456789n,
  );
  const secretIssuerRecipient = secretIssuerProfile.label;
  const secretVerifierProfile = createDIDProfile(
    "verifier",
    "reference-secret-verifier",
    555555555n,
  );
  const secretVerifierRecipient = secretVerifierProfile.label;
  const secretHolderConfig = {
    label: "reference-secret-holder",
    holderSecret: sha256("holder-secret:reference-alice"),
    holderSecretOpening: sha256("opening:reference-holder-secret"),
  };
  const secretHolderRecipient = secretHolderConfig.label;
  const secretClaimWitness: SecretClaimWitness = {
    subjectId: sha256("subject:reference-secret-alice"),
    subjectOpening: sha256("opening:reference-secret-subject"),
    legalNamePadded: padText("Reference Alice"),
    legalNameOpening: sha256("opening:reference-secret-legal-name"),
    birthDateDays: 3650n,
    birthDateOpening: sha256("opening:reference-secret-birth-date"),
    birthCountryCodePadded: padText("CAN"),
    birthCountryCodeOpening: sha256("opening:reference-secret-birth-country"),
    issuedAt: 10_000n,
    expiresAt: 20_000n,
  };

  it("draws distinct non-zero runtime randomness for the reference path surface", () => {
    const source = new NodeCryptoRandomnessSource();
    const firstChallenge = source.nextChallengeHash({
      partyLabel: "issuer",
      flow: "explicit-issuance",
      purpose: "holder-challenge",
      sequence: 0,
    });
    const secondChallenge = source.nextChallengeHash({
      partyLabel: "issuer",
      flow: "explicit-issuance",
      purpose: "holder-challenge",
      sequence: 1,
    });
    const nonceScalar = source.nextSigningNonceScalar({
      partyLabel: "issuer",
      flow: "explicit-issuance",
      purpose: "signing-nonce",
      sequence: 0,
    });

    expect(firstChallenge).toHaveLength(32);
    expect(secondChallenge).toHaveLength(32);
    expect(
      firstChallenge.some((byte) => byte !== 0) ||
        secondChallenge.some((byte) => byte !== 0),
    ).toEqual(true);
    expect(Array.from(firstChallenge)).not.toEqual(Array.from(secondChallenge));
    expect(nonceScalar).not.toEqual(0n);
  });

  it("recovers explicit-holder credentials across restart with file-backed JSON state and crypto randomness", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-protocol-reference-"));

    try {
      const bus = new MessageBus();
      const issuer = new IssuerAgent(
        explicitIssuerProfile,
        bus,
        createNodeFileBackedProtocolPartyDependencies(join(rootDir, "issuer")),
      );
      const holderDependencies = createNodeFileBackedProtocolPartyDependencies(
        join(rootDir, "holder"),
      );
      const holder = new HolderAgent(
        explicitHolderProfile,
        bus,
        holderDependencies,
      );

      issuer.createAndSendOffer(explicitHolderRecipient);
      const offer = bus.receive(explicitHolderRecipient)!;
      holder.receiveOfferAndSendRequest(offer);

      const request = bus.receive(explicitIssuerRecipient)!;
      const requestBody = request.body as BirthCredentialIssuanceRequest;
      expect(requestBody.body.holderChallengeHash).toHaveLength(32);
      expect(
        requestBody.body.holderChallengeHash.some((byte) => byte !== 0),
      ).toEqual(true);

      issuer.receiveRequestAndIssueCredential(request, explicitClaimWitness);
      const result = bus.receive(explicitHolderRecipient)!;
      const resultBody = result.body as BirthCredentialIssuanceResult;
      expect(resultBody.body.credentialProof.challengeHash).toHaveLength(32);
      holder.receiveCredentialResult(result);

      expect(holder.credentialCount).toEqual(1);

      const restartedHolder = new HolderAgent(
        explicitHolderProfile,
        bus,
        createNodeFileBackedProtocolPartyDependencies(join(rootDir, "holder")),
      );
      expect(restartedHolder.credentialCount).toEqual(1);
      expect(restartedHolder.getCredential(0)).toEqual(holder.getCredential(0));
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("re-delivers secret-holder presentation outcomes across verifier restart with file-backed JSON state and crypto randomness", () => {
    const rootDir = mkdtempSync(
      join(tmpdir(), "vc-protocol-reference-secret-"),
    );

    try {
      const bus = new MessageBus();
      const issuer = new SecretIssuerAgent(
        secretIssuerProfile,
        bus,
        createNodeFileBackedProtocolPartyDependencies(join(rootDir, "issuer")),
      );
      const holder = new SecretHolderAgent(
        secretHolderConfig,
        bus,
        {
          ...createNodeFileBackedProtocolPartyDependencies(
            join(rootDir, "holder"),
          ),
          stateRetention: {
            finalizedOutcomeTtlMs: 60_000n,
            maxFinalizedOutcomes: 16,
          },
        },
      );

      issuer.createAndSendOffer(secretHolderRecipient);
      const offer = bus.receive(secretHolderRecipient)!;
      holder.receiveOfferAndSendRequest(offer);
      const request = bus.receive(secretIssuerRecipient)!;
      issuer.receiveRequestAndIssueCredential(request, secretClaimWitness);
      const result = bus.receive(secretHolderRecipient)!;
      holder.receiveCredentialResult(result);

      const verifierState = createNodeFileBackedProtocolPartyDependencies(
        join(rootDir, "verifier"),
      );
      const verifier = new VerifierAgent(secretVerifierProfile, bus, {
        ...verifierState,
        stateRetention: {
          finalizedOutcomeTtlMs: 60_000n,
          maxFinalizedOutcomes: 16,
        },
      });

      verifier.createAndSendSecretPresentationRequest(secretHolderRecipient, {
        issuerVerificationMethodRef:
          secretIssuerProfile.signer.verificationMethodRef,
        requireSubjectIdCommitmentDisclosure: false,
        requireBirthCountryDisclosure: true,
        requireVerifierScopedPseudonym: false,
        requireAgeOverThreshold: true,
        requestedAgeThresholdYears: 18,
      });

      const requestMessage = bus.receive(secretHolderRecipient)!;
      const requestBody =
        requestMessage.body as SecretBirthCredentialVerificationRequest;
      const presentationWitness: SecretPresentationWitness = {
        credentialIndex: 0,
        currentDay: 3650n + 365n * 25n,
        birthDateDays: secretClaimWitness.birthDateDays,
        birthDateOpening: secretClaimWitness.birthDateOpening,
        birthCountryCodePadded: secretClaimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: secretClaimWitness.birthCountryCodeOpening,
      };

      holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness);
      const submission = bus.receive(secretVerifierRecipient)!;
      const stored = holder.getCredential(0);
      const { holderSecret, holderSecretOpening } = holder.secretWitness;
      const simulatorWitness: SecretSimulatorWitness = {
        request: requestBody,
        currentDay: 3650n + 365n * 25n,
        birthDateDays: secretClaimWitness.birthDateDays,
        birthDateOpening: secretClaimWitness.birthDateOpening,
        holderSecret,
        holderSecretOpening,
        holderBindingBlindingFactor: stored.holderBindingBlindingFactor,
      };

      verifier.receiveSecretSubmissionAndRespond(submission, simulatorWitness);
      const firstOutcome = holder.receivePresentationOutcome(
        bus.receive(secretHolderRecipient)!,
      );
      expect(firstOutcome.kind).toEqual("approved");

      const restartedVerifier = new VerifierAgent(secretVerifierProfile, bus, {
        ...createNodeFileBackedProtocolPartyDependencies(join(rootDir, "verifier")),
        stateRetention: {
          finalizedOutcomeTtlMs: 60_000n,
          maxFinalizedOutcomes: 16,
        },
      });

      restartedVerifier.receiveSecretSubmissionAndRespond(
        submission,
        simulatorWitness,
      );
      const replayedOutcome = holder.receivePresentationOutcome(
        bus.receive(secretHolderRecipient)!,
      );
      expect(replayedOutcome).toEqual(firstOutcome);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });
});
