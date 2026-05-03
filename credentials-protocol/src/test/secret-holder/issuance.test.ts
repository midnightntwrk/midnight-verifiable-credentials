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
});
