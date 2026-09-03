import {
  HolderAgent as ExchangeHolderAgent,
  IssuerAgent as ExchangeIssuerAgent,
  VerifierAgent as ExchangeVerifierAgent,
} from "@midnight-ntwrk/credential-exchange";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, it } from "vitest";

import { createBirthInjectedCredentialFamilyAdapter } from "../../adapters/birth/exchange-adapter.js";
import type { BIRTH_SCHEMA } from "../../adapters/birth/schema-descriptors.js";
import { stableJsonProtocolStateCodec } from "../../adapters/json-protocol-state-codec.js";
import { HolderAgent } from "../../agents/holder-agent.js";
import { type ClaimWitness, IssuerAgent } from "../../agents/issuer-agent.js";
import { MessageBus } from "../../transport/message-bus.js";
import type { ProtocolMessage } from "../../transport/types.js";
import {
  type ContractPresentationPackage,
  ContractVerifier,
} from "../helpers/contract-verifier.js";
import { createDIDProfile, padText, sha256 } from "../helpers/did-provider.js";

describe("explicit-holder full lifecycle", () => {
  beforeAll(() => {
    setNetworkId("undeployed");
  });

  const issuerProfile = createDIDProfile("issuer", "issuer", 123456789n);
  const holderProfile = createDIDProfile("holder", "holder", 987654321n);
  const verifierProfile = createDIDProfile("verifier", "verifier", 555555555n);

  const claimWitness: ClaimWitness = {
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

  const currentDay = 3650n + 365n * 25n; // Alice is 25 years old

  /**
   * Run the full protocol issuance flow: Issuer -> MessageBus -> Holder.
   */
  const issueCredentialViaProtocol = (bus: MessageBus): HolderAgent => {
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holder = new HolderAgent(holderProfile, bus);

    issuer.createAndSendOffer("holder");
    holder.receiveOfferAndSendRequest(bus.receive("holder")!);
    issuer.receiveRequestAndIssueCredential(
      bus.receive("issuer")!,
      claimWitness,
    );
    holder.receiveCredentialResult(bus.receive("holder")!);

    return holder;
  };

  it("publishes a semantic family-neutral schema version", () => {
    const adapter = createBirthInjectedCredentialFamilyAdapter({
      issuerProfile,
      holderProfile,
      verifierProfile,
    });

    expect(adapter.family.schema.version).toBe("1.0.0");
  });

  it("rejects canonical framing that disagrees with the birth payload", () => {
    const adapter = createBirthInjectedCredentialFamilyAdapter({
      issuerProfile,
      holderProfile,
      verifierProfile,
    });
    const issuer = new ExchangeIssuerAgent(adapter);
    const holder = new ExchangeHolderAgent(adapter);
    const offer = issuer.createOffer();
    const decodedOffer = stableJsonProtocolStateCodec.decode(
      offer.payload,
    ) as ProtocolMessage & {
      readonly body: { readonly schema: typeof BIRTH_SCHEMA };
    };
    const mismatchedSchemaOffer = {
      ...offer,
      payload: stableJsonProtocolStateCodec.encode({
        ...decodedOffer,
        body: {
          ...decodedOffer.body,
          schema: { ...decodedOffer.body.schema, majorVersion: 999n },
        },
      }),
    };

    expect(() => holder.createIssuanceRequest(mismatchedSchemaOffer)).toThrow(
      /payload schema/i,
    );
    expect(() =>
      holder.createIssuanceRequest({
        ...offer,
        mediaType: "application/json",
      }),
    ).toThrow(/media type/i);
  });

  it("routes the concrete birth lifecycle through family-neutral injected agents", () => {
    const adapter = createBirthInjectedCredentialFamilyAdapter({
      issuerProfile,
      holderProfile,
      verifierProfile,
    });
    const issuer = new ExchangeIssuerAgent(adapter);
    const holder = new ExchangeHolderAgent(adapter);
    const verifier = new ExchangeVerifierAgent(adapter);

    const offer = issuer.createOffer();
    const request = holder.createIssuanceRequest(offer);
    holder.acceptCredential(issuer.issue(request, claimWitness));
    const presentationRequest = verifier.createPresentationRequest({
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    });
    const presentation = holder.createPresentation(presentationRequest, {
      credentialIndex: 0,
      currentDay,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
      birthCountryCodePadded: claimWitness.birthCountryCodePadded,
      birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
    });
    const result = verifier.verify(presentation, presentationRequest, {
      currentDay,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
    });

    expect(result.valid).toBe(true);
  });

  it("rejects a presentation witness selecting a different accepted credential", () => {
    const adapter = createBirthInjectedCredentialFamilyAdapter({
      issuerProfile,
      holderProfile,
      verifierProfile,
    });
    const issuer = new ExchangeIssuerAgent(adapter);
    const holder = new ExchangeHolderAgent(adapter);
    const verifier = new ExchangeVerifierAgent(adapter);
    const issue = (witness: ClaimWitness) => {
      const offer = issuer.createOffer();
      return issuer.issue(holder.createIssuanceRequest(offer), witness);
    };

    holder.acceptCredential(issue(claimWitness));
    holder.acceptCredential(
      issue({
        ...claimWitness,
        subjectId: sha256("subject:bob"),
        subjectOpening: sha256("opening:subject:bob"),
      }),
    );
    const presentationRequest = verifier.createPresentationRequest({
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    });

    expect(() =>
      holder.createPresentation(presentationRequest, {
        credentialIndex: 0,
        currentDay,
        birthDateDays: claimWitness.birthDateDays,
        birthDateOpening: claimWitness.birthDateOpening,
        birthCountryCodePadded: claimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
      }),
    ).toThrow(/credential.*does not match/i);
  });

  it("rejects caller mutation of accepted canonical credential bytes", () => {
    const adapter = createBirthInjectedCredentialFamilyAdapter({
      issuerProfile,
      holderProfile,
      verifierProfile,
    });
    const issuer = new ExchangeIssuerAgent(adapter);
    const holder = new ExchangeHolderAgent(adapter);
    const verifier = new ExchangeVerifierAgent(adapter);
    const offer = issuer.createOffer();
    const credential = holder.acceptCredential(
      issuer.issue(holder.createIssuanceRequest(offer), claimWitness),
    );
    credential.payload.fill(0);
    const presentationRequest = verifier.createPresentationRequest({
      issuerVerificationMethodRef: issuerProfile.signer.verificationMethodRef,
      requireSubjectIdCommitmentDisclosure: false,
      requireBirthCountryDisclosure: true,
      requireAgeOverThreshold: true,
      requestedAgeThresholdYears: 18,
    });

    expect(() =>
      holder.createPresentation(presentationRequest, {
        credentialIndex: 0,
        currentDay,
        birthDateDays: claimWitness.birthDateDays,
        birthDateOpening: claimWitness.birthDateOpening,
        birthCountryCodePadded: claimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
      }),
    ).toThrow(/not accepted/i);
  });

  it("completes issue -> present -> verify -> capability -> claim lifecycle", () => {
    const bus = new MessageBus();
    const verifierChallengeHash = sha256("challenge:verifier:lifecycle");

    // Step 1: Issuance via protocol (IssuerAgent -> MessageBus -> HolderAgent)
    const holder = issueCredentialViaProtocol(bus);
    expect(holder.credentialCount).toBe(1);

    const stored = holder.getCredential(0);

    // Step 2: Contract issuance - register the credential with the contract verifier
    const contractVerifier = new ContractVerifier();
    contractVerifier.issueBirthCredential(
      stored.credential,
      stored.credentialProof,
      holderProfile.signer.publicKey,
    );

    // Step 3: Read contract policy - get the age-gate request
    const ageGateRequest = contractVerifier.getAgeGateRequest(
      stored.credential.issuerVerificationMethodRef,
      verifierChallengeHash,
    );
    expect(ageGateRequest.requireBirthCountryDisclosure).toBe(true);
    expect(ageGateRequest.requireAgeOverThreshold).toBe(true);
    expect(ageGateRequest.requestedAgeThresholdYears).toBe(18n);

    // Step 4: Build presentation using the contract's request
    const { presentation, presentationProof } =
      holder.buildPresentationForContract(0, ageGateRequest, {
        credentialIndex: 0,
        currentDay,
        birthDateDays: claimWitness.birthDateDays,
        birthDateOpening: claimWitness.birthDateOpening,
        birthCountryCodePadded: claimWitness.birthCountryCodePadded,
        birthCountryCodeOpening: claimWitness.birthCountryCodeOpening,
      });

    const pkg: ContractPresentationPackage = {
      presentation,
      presentationProof,
      currentDay,
      birthDateDays: claimWitness.birthDateDays,
      birthDateOpening: claimWitness.birthDateOpening,
    };

    // Step 5: Issue capability - submit presentation to contract verifier
    const { capabilityHash } = contractVerifier.issueAgeGateCapability(
      stored.credential,
      stored.credentialProof,
      verifierChallengeHash,
      pkg,
    );
    expect(capabilityHash).toBeDefined();
    expect(capabilityHash.length).toBe(32);

    // Step 6: Claim capability - first claim returns "approved"
    const firstClaim = contractVerifier.claimCapability(capabilityHash);
    expect(firstClaim).toBe("approved");

    // Step 7: Re-claim - second claim returns "alreadyConsumed"
    const secondClaim = contractVerifier.claimCapability(capabilityHash);
    expect(secondClaim).toBe("alreadyConsumed");
  });
});
