import { snapshotHiddenHolderPublicSurfaceV1 } from "@midnight-ntwrk/credential-proofs/hidden-holder-privacy";
import {
  pureCircuits as genericPureCircuits,
  type SecretBirthCredentialVerificationRequest,
  type SecretBirthCredentialVerificationSubmission,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";
import { describe, expect, it } from "vitest";

import {
  SecretHolderAgent,
  type SecretPresentationWitness,
} from "../../agents/secret-holder-agent.js";
import {
  type SecretClaimWitness,
  SecretIssuerAgent,
} from "../../agents/secret-issuer-agent.js";
import { type SecretSimulatorWitness,VerifierAgent } from "../../agents/verifier-agent.js";
import { MessageBus } from "../../transport/message-bus.js";
import {
  createDIDProfile,
  padText,
  sha256,
} from "../helpers/did-provider.js";

describe("secret-holder pseudonym", () => {
  const issuerProfile = createDIDProfile("issuer", "issuer", 123456789n);
  const verifierProfile = createDIDProfile("verifier", "verifier", 555555555n);

  const holderConfig = {
    label: "holder",
    holderSecret: sha256("holder-secret:alice"),
    holderSecretOpening: sha256("opening:holder-secret"),
  };

  const verifierContext = {
    deploymentDigest: sha256("deployment:age-gateway:v1"),
    audienceDigest: sha256("audience:age-gateway.example"),
    originDigest: sha256("origin:https://age-gateway.example"),
    consentDigest: sha256("consent:age-check"),
  };

  const trustedVerifierContext = {
    verifierLabel: verifierProfile.label,
    verifierVerificationMethodRef: verifierProfile.signer.verificationMethodRef,
    verifierPublicKey: verifierProfile.signer.publicKey,
    verifierIdentityDigest: genericPureCircuits.verifierIdentityDigestV1(
      verifierProfile.signer.verificationMethodRef,
    ),
    ...verifierContext,
  };

  const claimWitness: SecretClaimWitness = {
    subjectId: sha256("subject:alice"),
    subjectOpening: sha256("opening:subject"),
    legalNamePadded: padText("Alice Example"),
    legalNameOpening: sha256("opening:legal-name"),
    birthDateDays: 3650n,
    birthDateOpening: sha256("opening:birth-date"),
    birthCountryCodePadded: padText("CAN"),
    birthCountryCodeOpening: sha256("opening:birth-country"),
    issuedAt: 10_000n,
    expiresAt: 20_000n,
  };

  const presentationWitness: SecretPresentationWitness = {
    credentialIndex: 0,
    currentDay: 3650n + 365n * 25n,
    birthDateDays: claimWitness.birthDateDays,
    birthDateOpening: claimWitness.birthDateOpening,
    birthCountryCodePadded: claimWitness.birthCountryCodePadded,
    birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
  };

  /**
   * Run the full issuance flow and return a holder with one stored credential.
   */
  const issueCredential = (
    bus: MessageBus,
    trustedContext = trustedVerifierContext,
  ): SecretHolderAgent => {
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus, {
      trustedVerifierContexts: [trustedContext],
    });

    issuer.createAndSendOffer("holder");
    holder.receiveOfferAndSendRequest(bus.receive("holder")!);
    issuer.receiveRequestAndIssueCredential(
      bus.receive("issuer")!,
      claimWitness,
    );
    holder.receiveCredentialResult(bus.receive("holder")!);

    return holder;
  };

  it("derives a request-unlinkable pseudonym and exposes no credential root", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);
    const requestTimeMs = 1_700_000_000_000n;
    const resultTimeMs = 2_000_000_000_000n;

    expect(holder.credentialCount).toBe(1);

    // Verifier requests pseudonym disclosure
    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireVerifierScopedPseudonym: true,
      ...verifierContext,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    }, { currentTimeMs: requestTimeMs });

    const requestMessage = bus.receive("holder")!;
    const presentationRequest =
      requestMessage.body as SecretBirthCredentialVerificationRequest;

    holder.receiveRequestAndSendPresentation(requestMessage, presentationWitness);

    const submission = bus.receive("verifier")!;

    // Simulator witness: private data passed directly to the verifier (not via bus)
    const stored = holder.getCredential(0);
    const { holderSecret, holderSecretOpening } = holder.secretWitness;
    const simulatorWitness: SecretSimulatorWitness = {
      request: presentationRequest,
      currentDay: 3650n + 365n * 25n,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      holderSecret,
      holderSecretOpening,
      holderBindingBlindingFactor: stored.holderBindingBlindingFactor,
    };

    const result = verifier.receiveSecretSubmissionAndEvaluate(
      submission,
      simulatorWitness,
      { currentTimeMs: resultTimeMs },
    );

    expect(result.approved).toBe(true);
    expect(result.pseudonym).toBeDefined();
    expect(result.pseudonym!.length).toBe(32);

    const expectedPseudonym = genericPureCircuits.requestScopedVerifierPseudonymV1(
      holderConfig.holderSecret,
      presentationRequest.body.verifierPseudonymScope,
    );
    expect(result.pseudonym).toEqual(expectedPseudonym);
    expect(Object.keys(result.result.body).sort()).toEqual([
      "hasVerifierScopedPseudonym",
      "presentationBindingDigest",
      "verifiedThresholdYears",
      "verifierScopedPseudonym",
    ]);
    const publicResult = JSON.stringify(
      result.result,
      (_key, value: unknown) => typeof value === "bigint" ? value.toString() : value,
    );
    expect(publicResult).not.toMatch(/credentialRoot|holderSecret|opening|witness|statusHandle/iu);
    expect(() =>
      genericPureCircuits.assertSecretBirthCredentialVerificationResultMatchesSubmission(
        presentationRequest,
        submission.body as SecretBirthCredentialVerificationSubmission,
        {
          ...result.result,
          body: {
            ...result.result.body,
            presentationBindingDigest: sha256("attacker:presentation-binding"),
          },
        },
      ),
    ).toThrow(/presentation binding does not match/iu);

    expect(snapshotHiddenHolderPublicSurfaceV1({
      request: presentationRequest,
      submissionVisible: {
        revealVerifierScopedPseudonym:
          presentationRequest.body.requireVerifierScopedPseudonym,
        verifierScopedPseudonym: result.pseudonym,
        proveAgeOverThreshold:
          presentationRequest.body.requireAgeOverThreshold,
        ageThresholdYears:
          presentationRequest.body.requestedAgeThresholdYears,
      },
      result: result.result,
    })).toMatchInlineSnapshot(`
      {
        "request": {
          "body": {
            "requestedAgeThresholdYears": "<bigint:18>",
            "requireAgeOverThreshold": true,
            "requireBirthCountryDisclosure": true,
            "requireSubjectIdCommitmentDisclosure": false,
            "requireVerifierScopedPseudonym": true,
            "verifierPseudonymScope": {
              "audienceDigest": "<bytes:32>",
              "challengeDigest": "<bytes:32>",
              "consentDigest": "<bytes:32>",
              "executionContextDigest": "<bytes:32>",
              "originDigest": "<bytes:32>",
              "requestDigest": "<bytes:32>",
              "verifierIdentityDigest": "<bytes:32>",
            },
          },
          "envelope": {
            "createdAt": "<bigint:1700000000000>",
            "expiresAt": "<bigint:0>",
            "hasExpiresAt": false,
            "initialMessage": true,
            "messageId": "<bytes:32>",
            "respondsToMessageId": "<bytes:32>",
            "threadId": "<bytes:32>",
            "version": "<bigint:1>",
          },
          "features": {
            "supportsPredicateProofs": true,
            "supportsSameHolderProof": true,
            "supportsSelectiveDisclosure": true,
            "supportsVerifierScopedPseudonym": true,
          },
          "holderBindingProfile": 2,
          "issuerVerificationMethodRef": {
            "didContractAddress": {
              "bytes": "<bytes:32>",
            },
            "methodId": "<bytes:32>",
          },
          "schema": {
            "majorVersion": "<bigint:1>",
            "minorVersion": "<bigint:0>",
            "packageId": "<bytes:32>",
            "schemaId": "<bytes:32>",
          },
          "verifierChallengeHash": "<bytes:32>",
        },
        "result": {
          "approved": true,
          "body": {
            "hasVerifierScopedPseudonym": true,
            "presentationBindingDigest": "<bytes:32>",
            "verifiedThresholdYears": "<bigint:18>",
            "verifierScopedPseudonym": "<bytes:32>",
          },
          "envelope": {
            "createdAt": "<bigint:2000000000000>",
            "expiresAt": "<bigint:0>",
            "hasExpiresAt": false,
            "initialMessage": false,
            "messageId": "<bytes:32>",
            "respondsToMessageId": "<bytes:32>",
            "threadId": "<bytes:32>",
            "version": "<bigint:1>",
          },
        },
        "submissionVisible": {
          "ageThresholdYears": "<bigint:18>",
          "proveAgeOverThreshold": true,
          "revealVerifierScopedPseudonym": true,
          "verifierScopedPseudonym": "<bytes:32>",
        },
      }
    `);

    verifier.receiveSecretSubmissionAndRespond(
      submission,
      simulatorWitness,
      { currentTimeMs: resultTimeMs },
    );
    const retained = holder.receivePresentationOutcome(
      bus.receive("holder")!,
      { currentTimeMs: resultTimeMs },
    );
    expect(snapshotHiddenHolderPublicSurfaceV1(retained)).toMatchInlineSnapshot(`
      {
        "kind": "approved",
        "result": {
          "approved": true,
          "body": {
            "hasVerifierScopedPseudonym": true,
            "presentationBindingDigest": "<bytes:32>",
            "verifiedThresholdYears": "<bigint:18>",
            "verifierScopedPseudonym": "<bytes:32>",
          },
          "envelope": {
            "createdAt": "<bigint:2000000000000>",
            "expiresAt": "<bigint:0>",
            "hasExpiresAt": false,
            "initialMessage": false,
            "messageId": "<bytes:32>",
            "respondsToMessageId": "<bytes:32>",
            "threadId": "<bytes:32>",
            "version": "<bigint:1>",
          },
        },
      }
    `);

    const scope = presentationRequest.body.verifierPseudonymScope;
    for (const [field, value] of Object.entries(scope)) {
      const mutated = { ...scope, [field]: sha256(`mutated:${field}:${value[0]}`) };
      expect(genericPureCircuits.requestScopedVerifierPseudonymV1(
        holderConfig.holderSecret,
        mutated,
      )).not.toEqual(result.pseudonym);
    }
  });

  it("rejects a forged transport sender before hidden-holder disclosure", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);
    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: false,
      requireVerifierScopedPseudonym: true,
      ...verifierContext,
      requireAgeOverThreshold: false,
      requestedAgeThresholdYears: 0,
    });
    const authentic = bus.receive("holder")!;

    expect(() => holder.receiveRequestAndSendPresentation(
      { ...authentic, from: "attacker" },
      presentationWitness,
    )).toThrowError(expect.objectContaining({
      code: "UNTRUSTED_VERIFIER_CONTEXT",
    }));
    expect(bus.pending("verifier")).toBe(0);
    expect(bus.pending("attacker")).toBe(0);
  });

  it("validates dynamic request scope before deriving a pseudonym", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);
    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: false,
      requireVerifierScopedPseudonym: true,
      ...verifierContext,
      requireAgeOverThreshold: false,
      requestedAgeThresholdYears: 0,
    });
    const authentic = bus.receive("holder")!;
    const request = authentic.body as SecretBirthCredentialVerificationRequest;
    const tampered = {
      ...authentic,
      body: {
        ...request,
        body: {
          ...request.body,
          verifierPseudonymScope: {
            ...request.body.verifierPseudonymScope,
            requestDigest: sha256("attacker:reused-request-scope"),
          },
        },
      },
    };

    expect(() => holder.receiveRequestAndSendPresentation(
      tampered,
      presentationWitness,
    )).toThrow(/scope request does not match|request digest/iu);
    expect(bus.pending("verifier")).toBe(0);
  });

  it("rejects an authenticated hidden-holder request replay before disclosure", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);
    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: false,
      requireVerifierScopedPseudonym: true,
      ...verifierContext,
      requireAgeOverThreshold: false,
      requestedAgeThresholdYears: 0,
    });
    const request = bus.receive("holder")!;

    holder.receiveRequestAndSendPresentation(request, presentationWitness);
    expect(() => holder.receiveRequestAndSendPresentation(
      request,
      presentationWitness,
    )).toThrow(/already processed/iu);
    expect(bus.pending("verifier")).toBe(1);
  });

  it.each([
    "deploymentDigest",
    "audienceDigest",
    "originDigest",
    "consentDigest",
  ] as const)("fails closed before disclosure for an untrusted %s", (field) => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const verifier = new VerifierAgent(verifierProfile, bus);
    verifier.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: false,
      requireVerifierScopedPseudonym: true,
      ...verifierContext,
      [field]: sha256(`attacker:${field}`),
      requireAgeOverThreshold: false,
      requestedAgeThresholdYears: 0,
    });

    expect(() => holder.receiveRequestAndSendPresentation(
      bus.receive("holder")!,
      {
        credentialIndex: 0,
        currentDay: 0n,
        birthDateDays: claimWitness.birthDateDays,
        birthDateOpening: claimWitness.birthDateOpening,
        birthCountryCodePadded: claimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
      },
    )).toThrowError(expect.objectContaining({
      code: "UNTRUSTED_VERIFIER_CONTEXT",
      message: "Hidden-holder verifier context is not trusted",
    }));
  });

  it("fails closed before disclosure for an untrusted verifier identity", () => {
    const bus = new MessageBus();
    const holder = issueCredential(bus);
    const attackerProfile = createDIDProfile("verifier", "attacker", 999999999n);
    const attacker = new VerifierAgent(attackerProfile, bus);
    attacker.createAndSendSecretPresentationRequest("holder", {
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: false,
      requireVerifierScopedPseudonym: true,
      ...verifierContext,
      requireAgeOverThreshold: false,
      requestedAgeThresholdYears: 0,
    });

    expect(() => holder.receiveRequestAndSendPresentation(
      bus.receive("holder")!,
      {
        credentialIndex: 0,
        currentDay: 0n,
        birthDateDays: claimWitness.birthDateDays,
        birthDateOpening: claimWitness.birthDateOpening,
        birthCountryCodePadded: claimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
      },
    )).toThrowError(expect.objectContaining({
      code: "UNTRUSTED_VERIFIER_CONTEXT",
      message: "Hidden-holder verifier context is not trusted",
    }));
  });
});
