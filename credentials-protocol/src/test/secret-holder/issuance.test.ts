import { pureCircuits as genericPureCircuits } from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import {
  pureCircuits,
  type SecretBirthCredentialIssuanceOffer,
  type SecretBirthCredentialIssuanceRequest,
  type SecretBirthCredentialIssuanceResult,
} from "@midnight-ntwrk/midnight-did-credentials-birth-secret/managed/secret-birth-credential/contract/index.js";
import { describe, expect, it } from "vitest";

import { SecretHolderAgent } from "../../agents/secret-holder-agent.js";
import {
  type SecretClaimWitness,
  SecretIssuerAgent,
} from "../../agents/secret-issuer-agent.js";
import { MessageBus } from "../../transport/message-bus.js";
import type { SecretBirthCredentialIssuanceRejection } from "../../transport/types.js";
import {
  createDIDProfile,
  mod,
  padText,
  sha256,
} from "../helpers/did-provider.js";

describe("secret-holder issuance", () => {
  const issuerProfile = createDIDProfile("issuer", "issuer", 123456789n);

  const holderConfig = {
    label: "holder",
    holderSecret: sha256("holder-secret:alice"),
    holderSecretOpening: sha256("opening:holder-secret"),
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

  const forgeIssuanceResultWithChallenge = (
    resultBody: SecretBirthCredentialIssuanceResult,
    challengeHash: Uint8Array,
  ): SecretBirthCredentialIssuanceResult => {
    const originalProof = resultBody.body.credentialProof;
    const bodyRoot = pureCircuits.secretBirthCredentialBodyRoot(
      resultBody.body.credential,
    );
    const originalChallenge = genericPureCircuits.issuanceProofChallenge(
      bodyRoot,
      originalProof,
    );
    const interimProof = {
      ...originalProof,
      challengeHash,
    };
    const tamperedChallenge = genericPureCircuits.issuanceProofChallenge(
      bodyRoot,
      interimProof,
    );
    const nonceScalar = mod(
      originalProof.signature.s -
        originalChallenge * issuerProfile.signer.secretKey,
    );

    return {
      ...resultBody,
      body: {
        ...resultBody.body,
        issuanceChallengeHash: challengeHash,
        credentialProof: {
          ...interimProof,
          signature: {
            ...originalProof.signature,
            s: mod(
              nonceScalar +
                tamperedChallenge * issuerProfile.signer.secretKey,
            ),
          },
        },
      },
    };
  };

  it("issues a credential with blinded secret holder binding", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    // Step 1: Issuer creates and sends offer to holder
    issuer.createAndSendOffer("holder");
    expect(bus.pending("holder")).toBe(1);

    // Step 2: Holder receives offer and sends request back to issuer
    const offer = bus.receive("holder");
    expect(offer).toBeDefined();
    expect(offer!.type).toBe("issuance:offer");
    const offerBody = offer!.body as SecretBirthCredentialIssuanceOffer;
    genericPureCircuits.assertValidProtocolMessageEnvelope(offer!.envelope);
    pureCircuits.assertValidSecretBirthCredentialIssuanceOffer(offerBody);
    holder.receiveOfferAndSendRequest(offer!);
    expect(bus.pending("issuer")).toBe(1);

    // Step 3: Issuer receives request and issues the credential
    const request = bus.receive("issuer");
    expect(request).toBeDefined();
    expect(request!.type).toBe("issuance:request");
    const requestBody = request!.body as SecretBirthCredentialIssuanceRequest;
    genericPureCircuits.assertValidProtocolMessageEnvelope(request!.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      offer!.envelope,
      request!.envelope,
    );
    pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(requestBody);
    pureCircuits.assertSecretBirthCredentialIssuanceRequestMatchesOffer(
      offerBody,
      requestBody,
    );
    issuer.receiveRequestAndIssueCredential(request!, claimWitness);
    expect(bus.pending("holder")).toBe(1);

    // Step 4: Holder receives the credential result
    const result = bus.receive("holder");
    expect(result).toBeDefined();
    expect(result!.type).toBe("issuance:result");
    const resultBody = result!.body as SecretBirthCredentialIssuanceResult;
    genericPureCircuits.assertValidProtocolMessageEnvelope(result!.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      request!.envelope,
      result!.envelope,
    );
    pureCircuits.assertValidSecretBirthCredentialIssuanceResult(resultBody);
    pureCircuits.assertSecretBirthCredentialIssuanceResultMatchesRequest(
      requestBody,
      resultBody,
    );
    holder.receiveCredentialResult(result!);

    // Verify the credential was stored
    expect(holder.credentialCount).toBe(1);

    const stored = holder.getCredential(0);
    expect(stored.credential).toBeDefined();
    expect(stored.credentialProof).toBeDefined();
    expect(stored.credential.version).toBe(1n);
    expect(stored.credential.issuedAt).toBe(10_000n);
    expect(stored.credential.hasExpiration).toBe(true);
    expect(stored.credential.expiresAt).toBe(20_000n);
    pureCircuits.assertValidSecretBirthCredential(
      stored.credential,
      stored.credentialProof,
    );

    // Verify it has blinded secret holder binding fields
    const binding = stored.credential.holderBinding;
    expect(binding.blindedHolderSecretCommitment).toBeDefined();
    expect(binding.blindedHolderSecretCommitment.length).toBe(32);
    expect(binding.issuerNonce).toBeDefined();
    expect(binding.issuerNonce.length).toBe(32);
    expect(resultBody.body.issuanceChallengeHash).toEqual(
      requestBody.body.holderChallengeHash,
    );
    expect(binding.blindedHolderSecretCommitment).toEqual(
      genericPureCircuits.blindedSecretHolderCommitment(
        requestBody.body.holderSecretCommitment,
        binding.issuerNonce,
        requestBody.body.holderBindingBlindingFactor,
      ),
    );
  });

  it("binds the blinded commitment to the holder secret without revealing it to the issuer", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    // Run the issuance flow
    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as SecretBirthCredentialIssuanceOffer;
    genericPureCircuits.assertValidProtocolMessageEnvelope(offer.envelope);
    pureCircuits.assertValidSecretBirthCredentialIssuanceOffer(offerBody);
    holder.receiveOfferAndSendRequest(offer);

    // Intercept the request message to inspect what the holder sent
    const requestMsg = bus.receive("issuer")!;
    const request = requestMsg.body as SecretBirthCredentialIssuanceRequest;
    genericPureCircuits.assertValidProtocolMessageEnvelope(requestMsg.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      offer.envelope,
      requestMsg.envelope,
    );
    pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(request);
    pureCircuits.assertSecretBirthCredentialIssuanceRequestMatchesOffer(
      offerBody,
      request,
    );
    const requestBody = request.body;

    // The request should contain a commitment, NOT the raw secret
    expect(requestBody.holderSecretCommitment).toBeDefined();
    expect(requestBody.holderSecretCommitment.length).toBe(32);
    expect(requestBody.holderBindingBlindingFactor).toBeDefined();
    expect(requestBody.holderBindingBlindingFactor.length).toBe(32);

    // The commitment should NOT be the raw secret
    expect(requestBody.holderSecretCommitment).not.toEqual(
      holderConfig.holderSecret,
    );

    // Complete the issuance
    issuer.receiveRequestAndIssueCredential(requestMsg, claimWitness);
    const result = bus.receive("holder")!;
    const resultBody = result.body as SecretBirthCredentialIssuanceResult;
    genericPureCircuits.assertValidProtocolMessageEnvelope(result.envelope);
    genericPureCircuits.assertProtocolResponseEnvelope(
      requestMsg.envelope,
      result.envelope,
    );
    pureCircuits.assertValidSecretBirthCredentialIssuanceResult(resultBody);
    pureCircuits.assertSecretBirthCredentialIssuanceResultMatchesRequest(
      request,
      resultBody,
    );
    holder.receiveCredentialResult(result);

    // The credential's proof must reference the issuer's verification method
    const stored = holder.getCredential(0);
    pureCircuits.assertValidSecretBirthCredential(
      stored.credential,
      stored.credentialProof,
    );
    const proof = stored.credentialProof;
    expect(
      proof.signerVerificationMethodRef.didContractAddress.bytes,
    ).toEqual(
      issuerProfile.signer.verificationMethodRef.didContractAddress.bytes,
    );
    expect(proof.signerVerificationMethodRef.methodId).toEqual(
      issuerProfile.signer.verificationMethodRef.methodId,
    );
  });

  it("rejects issuance requests when the holder challenge is missing", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as SecretBirthCredentialIssuanceOffer;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        holderChallengeHash: genericPureCircuits.noProtocolResponseReference(),
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(
        tamperedRequest,
      ),
    ).toThrow(/holder challenge must be set/);

    expect(() =>
      pureCircuits.assertSecretBirthCredentialIssuanceRequestMatchesOffer(
        offerBody,
        tamperedRequest,
      ),
    ).toThrow(/holder challenge must be set/);
  });

  it("rejects issuance offers with invalid expiration defaults", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as SecretBirthCredentialIssuanceOffer;
    const tamperedOffer: SecretBirthCredentialIssuanceOffer = {
      ...offerBody,
      body: {
        ...offerBody.body,
        supportsExpiration: true,
        defaultExpirationDays: 0n,
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialIssuanceOffer(tamperedOffer),
    ).toThrow(/default expiration must be positive/);

    expect(() =>
      holder.receiveOfferAndSendRequest({
        ...offer,
        body: tamperedOffer,
      }),
    ).toThrow(/default expiration must be positive/);
  });

  it("rejects issuance offers whose explicit expiry day is not positive", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as SecretBirthCredentialIssuanceOffer;
    const tamperedOffer: SecretBirthCredentialIssuanceOffer = {
      ...offerBody,
      body: {
        ...offerBody.body,
        offerExpiresAtDay: 0n,
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialIssuanceOffer(tamperedOffer),
    ).toThrow(/offer expiry day must be positive/i);

    expect(() =>
      holder.receiveOfferAndSendRequest({
        ...offer,
        body: tamperedOffer,
      }),
    ).toThrow(/offer expiry day must be positive/i);
  });

  it("rejects expired issuance offers at the holder boundary", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder", {
      offerExpiresAtDay: 5n,
    });
    const offer = bus.receive("holder")!;

    expect(() =>
      holder.receiveOfferAndSendRequest(offer, {
        currentDay: 6n,
      }),
    ).toThrow(/offer expired/i);
  });

  it("rejects issuance requests with a missing holder binding blinding factor", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        holderBindingBlindingFactor:
          genericPureCircuits.noProtocolResponseReference(),
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(
        tamperedRequest,
      ),
    ).toThrow(/holder binding blinding factor must be set/);

    expect(() =>
      issuer.receiveRequestAndIssueCredential(
        {
          ...request,
          body: tamperedRequest,
        },
        claimWitness,
      ),
    ).toThrow(/holder binding blinding factor must be set/);
  });

  it("rejects issuance request/offer pairs that disagree about expiration support", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as SecretBirthCredentialIssuanceOffer;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const nonExpiringOffer: SecretBirthCredentialIssuanceOffer = {
      ...offerBody,
      body: {
        ...offerBody.body,
        supportsExpiration: false,
        defaultExpirationDays: 0n,
      },
    };

    expect(() =>
      pureCircuits.assertSecretBirthCredentialIssuanceRequestMatchesOffer(
        nonExpiringOffer,
        requestBody,
      ),
    ).toThrow(/cannot require expiration when the offer disables it/);
  });

  it("rejects issuance requests whose explicit expiry day is not positive", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        requestExpiresAtDay: 0n,
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialIssuanceRequest(
        tamperedRequest,
      ),
    ).toThrow(/request expiry day must be positive/i);

    expect(() =>
      issuer.receiveRequestAndIssueCredential(
        {
          ...request,
          body: tamperedRequest,
        },
        claimWitness,
      ),
    ).toThrow(/request expiry day must be positive/i);
  });

  it("rejects issuance results whose challenge does not match the request", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    issuer.receiveRequestAndIssueCredential(request, claimWitness);

    const result = bus.receive("holder")!;
    const resultBody = result.body as SecretBirthCredentialIssuanceResult;
    const tamperedChallengeHash = sha256("challenge:wrong");
    const tamperedResult = forgeIssuanceResultWithChallenge(
      resultBody,
      tamperedChallengeHash,
    );

    expect(() =>
      pureCircuits.assertSecretBirthCredentialIssuanceResultMatchesRequest(
        requestBody,
        tamperedResult,
      ),
    ).toThrow(/challenge must match the request challenge/);
  });

  it("rejects forged issuance results at the holder agent boundary", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndIssueCredential(request, claimWitness);

    const result = bus.receive("holder")!;
    const resultBody = result.body as SecretBirthCredentialIssuanceResult;
    const tamperedResult = forgeIssuanceResultWithChallenge(
      resultBody,
      sha256("challenge:forged-result"),
    );

    expect(() =>
      holder.receiveCredentialResult({
        ...result,
        body: tamperedResult,
      }),
    ).toThrow(/challenge must match the request challenge/);
  });

  it("can respond with an explicit success result through the transport-shaped API", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(request, claimWitness);

    const outcomeMessage = bus.receive("holder")!;
    expect(outcomeMessage.type).toBe("issuance:result");

    const outcome = holder.receiveIssuanceOutcome(outcomeMessage);
    expect(outcome.kind).toBe("issued");
    expect(holder.credentialCount).toBe(1);
  });

  it("sends an explicit rejection result for malformed blinded-secret issuance requests", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        holderChallengeHash: genericPureCircuits.noProtocolResponseReference(),
      },
    };

    issuer.receiveRequestAndRespond(
      {
        ...request,
        body: tamperedRequest,
      },
      claimWitness,
    );

    const rejectionMessage = bus.receive("holder")!;
    expect(rejectionMessage.type).toBe("issuance:rejection");

    const outcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("malformed_request");
      expect(outcome.rejection.body.retryable).toBe(false);
      expect(outcome.rejection.body.detail).toMatch(/holder challenge must be set/);
    }
    expect(holder.credentialCount).toBe(0);
  });

  it("sends an explicit rejection result for offer/request mismatches", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      issuerVerificationMethodRef: createDIDProfile(
        "issuer",
        "rogue-issuer",
        222222222n,
      ).signer.verificationMethodRef,
    };

    issuer.receiveRequestAndRespond(
      {
        ...request,
        body: tamperedRequest,
      },
      claimWitness,
    );

    const rejectionMessage = bus.receive("holder")!;
    expect(rejectionMessage.type).toBe("issuance:rejection");

    const outcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("offer_request_mismatch");
      expect(outcome.rejection.body.detail).toMatch(
        /issuer verification method/i,
      );
    }
    expect(holder.credentialCount).toBe(0);
  });

  it("sends an explicit rejection result for expired offers", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder", {
      offerExpiresAtDay: 5n,
    });
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer, {
      currentDay: 4n,
      requestExpiresAtDay: 10n,
    });

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(request, claimWitness, {
      currentDay: 6n,
    });

    const rejectionMessage = bus.receive("holder")!;
    expect(rejectionMessage.type).toBe("issuance:rejection");

    const outcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("expired_offer");
      expect(outcome.rejection.body.retryable).toBe(true);
      expect(outcome.rejection.body.detail).toMatch(/offer expired/i);
    }
    expect(holder.credentialCount).toBe(0);
  });

  it("sends an explicit rejection result for expired requests", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder", {
      offerExpiresAtDay: 20n,
    });
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer, {
      currentDay: 4n,
      requestExpiresAtDay: 5n,
    });

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(request, claimWitness, {
      currentDay: 6n,
    });

    const rejectionMessage = bus.receive("holder")!;
    expect(rejectionMessage.type).toBe("issuance:rejection");

    const outcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("expired_request");
      expect(outcome.rejection.body.retryable).toBe(true);
      expect(outcome.rejection.body.detail).toMatch(/request expired/i);
    }
    expect(holder.credentialCount).toBe(0);
  });

  it("re-delivers the same success result when the same request is processed twice", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(request, claimWitness);
    const firstOutcomeMessage = bus.receive("holder")!;
    const firstOutcome = holder.receiveIssuanceOutcome(firstOutcomeMessage);
    expect(firstOutcome.kind).toBe("issued");

    issuer.receiveRequestAndRespond(request, claimWitness);
    const replayMessage = bus.receive("holder")!;
    expect(replayMessage.type).toBe("issuance:result");

    const secondOutcome = holder.receiveIssuanceOutcome(replayMessage);
    expect(secondOutcome.kind).toBe("issued");
    expect(holder.credentialCount).toBe(1);
    if (firstOutcome.kind === "issued" && secondOutcome.kind === "issued") {
      expect(secondOutcome.stored.credential.claimRoot).toEqual(
        firstOutcome.stored.credential.claimRoot,
      );
    }
  });

  it("sends an explicit rejection result when the request does not match a pending offer", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(
      {
        ...request,
        envelope: {
          ...request.envelope,
          respondsToMessageId: sha256("unknown-offer"),
        },
      },
      claimWitness,
    );

    const rejectionMessage = bus.receive("holder")!;
    expect(rejectionMessage.type).toBe("issuance:rejection");

    const outcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind === "rejected") {
      expect(outcome.rejection.body.category).toBe("unknown_offer_reference");
      expect(outcome.rejection.body.detail).toMatch(
        /No pending issuance offer found/i,
      );
    }
  });

  it("treats duplicate success results as idempotent at the holder outcome boundary", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(request, claimWitness);
    const result = bus.receive("holder")!;

    const firstOutcome = holder.receiveIssuanceOutcome(result);
    expect(firstOutcome.kind).toBe("issued");

    const secondOutcome = holder.receiveIssuanceOutcome(result);
    expect(secondOutcome.kind).toBe("issued");
    expect(holder.credentialCount).toBe(1);
  });

  it("treats duplicate issuance rejections as idempotent at the holder outcome boundary", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        holderChallengeHash: genericPureCircuits.noProtocolResponseReference(),
      },
    };

    issuer.receiveRequestAndRespond(
      {
        ...request,
        body: tamperedRequest,
      },
      claimWitness,
    );

    const rejectionMessage = bus.receive("holder")!;
    const firstOutcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(firstOutcome.kind).toBe("rejected");

    const secondOutcome = holder.receiveIssuanceOutcome(rejectionMessage);
    expect(secondOutcome.kind).toBe("rejected");
    expect(holder.credentialCount).toBe(0);
  });

  it("re-delivers the same rejection result when the same malformed request is processed twice", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        holderChallengeHash: genericPureCircuits.noProtocolResponseReference(),
      },
    };

    const malformedRequest = {
      ...request,
      body: tamperedRequest,
    };

    issuer.receiveRequestAndRespond(malformedRequest, claimWitness);
    const firstRejectionMessage = bus.receive("holder")!;
    expect(firstRejectionMessage.type).toBe("issuance:rejection");
    const firstOutcome = holder.receiveIssuanceOutcome(firstRejectionMessage);
    expect(firstOutcome.kind).toBe("rejected");

    issuer.receiveRequestAndRespond(malformedRequest, claimWitness);
    const secondRejectionMessage = bus.receive("holder")!;
    expect(secondRejectionMessage.type).toBe("issuance:rejection");
    const secondOutcome = holder.receiveIssuanceOutcome(secondRejectionMessage);
    expect(secondOutcome.kind).toBe("rejected");
    if (firstOutcome.kind === "rejected" && secondOutcome.kind === "rejected") {
      expect(secondOutcome.rejection.body.category).toBe(
        firstOutcome.rejection.body.category,
      );
      expect(secondOutcome.rejection.body.detail).toBe(
        firstOutcome.rejection.body.detail,
      );
    }
  });

  it("rejects rejection messages with no matching pending request at the holder boundary", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as SecretBirthCredentialIssuanceRequest;
    const tamperedRequest: SecretBirthCredentialIssuanceRequest = {
      ...requestBody,
      body: {
        ...requestBody.body,
        holderChallengeHash: genericPureCircuits.noProtocolResponseReference(),
      },
    };

    issuer.receiveRequestAndRespond(
      {
        ...request,
        body: tamperedRequest,
      },
      claimWitness,
    );

    const rejectionMessage = bus.receive("holder")!;
    const rejectionBody =
      rejectionMessage.body as SecretBirthCredentialIssuanceRejection;
    expect(() =>
      holder.receiveIssuanceRejection({
        ...rejectionMessage,
        envelope: {
          ...rejectionMessage.envelope,
          respondsToMessageId: sha256("unknown-request"),
        },
        body: {
          ...rejectionBody,
          envelope: {
            ...rejectionBody.envelope,
            respondsToMessageId: sha256("unknown-request"),
          },
        },
      }),
    ).toThrow(/No pending issuance request found/);
  });

  it("rejects outcome messages whose type does not match the previously finalized outcome", () => {
    const bus = new MessageBus();
    const issuer = new SecretIssuerAgent(issuerProfile, bus);
    const holder = new SecretHolderAgent(holderConfig, bus);

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndRespond(request, claimWitness);

    const resultMessage = bus.receive("holder")!;
    const issuedOutcome = holder.receiveIssuanceOutcome(resultMessage);
    expect(issuedOutcome.kind).toBe("issued");

    const resultBody = resultMessage.body as SecretBirthCredentialIssuanceResult;
    const forgedRejection: SecretBirthCredentialIssuanceRejection = {
      envelope: {
        ...resultMessage.envelope,
      },
      schema: resultBody.schema,
      issuerVerificationMethodRef: resultBody.issuerVerificationMethodRef,
      holderBindingProfile: resultBody.holderBindingProfile,
      body: {
        category: "malformed_request",
        detail: "Synthetic mismatched outcome for holder-boundary testing",
        retryable: false,
      },
    };

    expect(() =>
      holder.receiveIssuanceOutcome({
        ...resultMessage,
        type: "issuance:rejection",
        body: forgedRejection,
      }),
    ).toThrow(/outcome type does not match the previously finalized outcome/i);
  });
});
