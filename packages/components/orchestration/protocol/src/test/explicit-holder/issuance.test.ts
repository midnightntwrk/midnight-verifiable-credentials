import { Buffer } from "node:buffer";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deserialize, serialize } from "node:v8";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import {
  type BirthCredentialIssuanceOffer,
  type BirthCredentialIssuanceRequest,
  type BirthCredentialIssuanceResult,
  pureCircuits,
} from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";
import { describe, expect, it } from "vitest";

import type { BirthClaimId } from "../../adapters/birth/claim-opening-recovery.js";
import { FileSystemProtocolStateByteStore } from "../../adapters/file-protocol-state-store.js";
import {
  HolderAgent,
  type StoredCredential,
} from "../../agents/holder-agent.js";
import { type ClaimWitness, IssuerAgent } from "../../agents/issuer-agent.js";
import {
  createCodecBackedProtocolStateStore,
  InMemoryProtocolStateStore,
  type ProtocolStateCodecResolver,
} from "../../agents/protocol-state-store.js";
import type { ProtocolRandomnessSource } from "../../agents/randomness.js";
import { MessageBus } from "../../transport/message-bus.js";
import {
  createDIDProfile,
  fill,
  padText,
  sha256,
} from "../helpers/did-provider.js";

describe("explicit-holder issuance", () => {
  const issuerProfile = createDIDProfile("issuer", "issuer", 123456789n);
  const holderProfile = createDIDProfile("holder", "holder", 987654321n);

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

  const createCustomRandomness = (): ProtocolRandomnessSource => ({
    nextChallengeHash: () => sha256("custom:explicit:holder-challenge"),
    nextIssuerNonce: () => sha256("custom:explicit:issuer-nonce"),
    nextBlindingFactor: () => sha256("custom:explicit:blinding-factor"),
    nextSigningNonceScalar: () => 23n,
  });

  const v8CodecResolver: ProtocolStateCodecResolver = {
    getCodec<T>() {
      return {
        encode: (value: T) => serialize(value),
        decode: (encodedValue: Uint8Array) =>
          deserialize(Buffer.from(encodedValue)) as T,
      };
    },
  };

  it("completes an issuance flow through offer -> request -> credential", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holder = new HolderAgent(holderProfile, bus);

    // Step 1: Issuer creates and sends offer to holder
    issuer.createAndSendOffer("holder");
    expect(bus.pending("holder")).toBe(1);

    // Step 2: Holder receives offer and sends request back to issuer
    const offer = bus.receive("holder");
    expect(offer).toBeDefined();
    expect(offer!.type).toBe("issuance:offer");
    const offerBody = offer!.body as BirthCredentialIssuanceOffer;
    pureCircuits.assertValidBirthCredentialIssuanceOffer(offerBody);
    holder.receiveOfferAndSendRequest(offer!);
    expect(bus.pending("issuer")).toBe(1);

    // Step 3: Issuer receives request and issues the credential
    const request = bus.receive("issuer");
    expect(request).toBeDefined();
    expect(request!.type).toBe("issuance:request");
    const requestBody = request!.body as BirthCredentialIssuanceRequest;
    pureCircuits.assertValidBirthCredentialIssuanceRequest(requestBody);
    pureCircuits.assertBirthCredentialIssuanceRequestMatchesOffer(
      offerBody,
      requestBody,
    );
    issuer.receiveRequestAndIssueCredential(request!, claimWitness);
    expect(bus.pending("holder")).toBe(1);

    // Step 4: Holder receives the credential result
    const result = bus.receive("holder");
    expect(result).toBeDefined();
    expect(result!.type).toBe("issuance:result");
    const resultBody = result!.body as BirthCredentialIssuanceResult;
    pureCircuits.assertValidBirthCredentialIssuanceResult(resultBody);
    pureCircuits.assertBirthCredentialIssuanceResultMatchesRequest(
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
    expect(stored.privateParts.openings.legalNameOpening).toEqual(
      claimWitness.legalNameOpening,
    );
    expect(holder.recoverClaimOpenings(0, ["birthDate"])).toEqual([
      {
        claimId: "birthDate",
        value: claimWitness.birthDateDays,
        opening: claimWitness.birthDateOpening,
      },
    ]);
  });

  it("rejects unsupported runtime claim IDs during opening recovery", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holder = new HolderAgent(holderProfile, bus);
    issuer.createAndSendOffer("holder");
    holder.receiveOfferAndSendRequest(bus.receive("holder")!);
    issuer.receiveRequestAndIssueCredential(bus.receive("issuer")!, claimWitness);
    holder.receiveCredentialResult(bus.receive("holder")!);

    expect(() =>
      holder.recoverClaimOpenings(0, ["unsupported" as BirthClaimId]),
    ).toThrow(/unsupported claim ID/i);
  });

  it("rejects an issuance result addressed to another holder before storage", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holder = new HolderAgent(holderProfile, bus);
    issuer.createAndSendOffer("holder");
    holder.receiveOfferAndSendRequest(bus.receive("holder")!);
    const request = bus.receive("issuer")!;
    issuer.receiveRequestAndIssueCredential(request, claimWitness);
    const result = bus.receive("holder")!;

    expect(() =>
      holder.receiveCredentialResult({ ...result, to: "mallory" }),
    ).toThrow(/parties/i);
    expect(holder.credentialCount).toBe(0);
  });

  it("binds the credential to the correct holder DID", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holder = new HolderAgent(holderProfile, bus);

    // Run the full issuance flow
    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as BirthCredentialIssuanceOffer;
    pureCircuits.assertValidBirthCredentialIssuanceOffer(offerBody);
    holder.receiveOfferAndSendRequest(offer);
    const request = bus.receive("issuer")!;
    const requestBody = request.body as BirthCredentialIssuanceRequest;
    pureCircuits.assertValidBirthCredentialIssuanceRequest(requestBody);
    pureCircuits.assertBirthCredentialIssuanceRequestMatchesOffer(
      offerBody,
      requestBody,
    );
    issuer.receiveRequestAndIssueCredential(
      request,
      claimWitness,
    );
    const result = bus.receive("holder")!;
    const resultBody = result.body as BirthCredentialIssuanceResult;
    pureCircuits.assertValidBirthCredentialIssuanceResult(resultBody);
    pureCircuits.assertBirthCredentialIssuanceResultMatchesRequest(
      requestBody,
      resultBody,
    );
    holder.receiveCredentialResult(result);

    const stored = holder.getCredential(0);

    // The credential's holderBinding must reference the holder's verification method
    const binding = stored.credential.holderBinding;
    expect(binding.holderVerificationMethodRef).toBeDefined();
    expect(binding.holderVerificationMethodRef.didContractAddress.bytes).toEqual(
      holderProfile.signer.verificationMethodRef.didContractAddress.bytes,
    );
    expect(binding.holderVerificationMethodRef.methodId).toEqual(
      holderProfile.signer.verificationMethodRef.methodId,
    );

    // The credential proof must reference the issuer's verification method
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

  it("allows integrators to inject custom explicit-holder randomness", () => {
    const bus = new MessageBus();
    const randomness = createCustomRandomness();
    const issuer = new IssuerAgent(issuerProfile, bus, { randomness });
    const holder = new HolderAgent(holderProfile, bus, { randomness });

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    holder.receiveOfferAndSendRequest(offer);

    const request = bus.receive("issuer")!;
    const requestBody = request.body as BirthCredentialIssuanceRequest;
    expect(requestBody.body.holderChallengeHash).toEqual(
      sha256("custom:explicit:holder-challenge"),
    );

    issuer.receiveRequestAndIssueCredential(request, claimWitness);
    const result = bus.receive("holder")!;
    holder.receiveCredentialResult(result);

    const resultBody = result.body as BirthCredentialIssuanceResult;
    expect(resultBody.body.credentialProof.signature.r).toEqual(
      ecMulGenerator(23n),
    );
  });

  it("uses CSPRNG holder challenges when randomness is omitted", () => {
    const offerBus = new MessageBus();
    new IssuerAgent(issuerProfile, offerBus).createAndSendOffer("holder");
    const offer = offerBus.receive("holder")!;

    const requestChallenge = (): Uint8Array => {
      const bus = new MessageBus();
      new HolderAgent(holderProfile, bus).receiveOfferAndSendRequest(offer);
      const request = bus.receive("issuer")!;
      return (request.body as BirthCredentialIssuanceRequest).body
        .holderChallengeHash;
    };

    const first = requestChallenge();
    const second = requestChallenge();
    expect(first).toHaveLength(32);
    expect(first).not.toEqual(second);
  });

  it("accepts an explicit envelope identifier source", () => {
    const expectedMessageId = sha256("custom:envelope:message");
    const expectedThreadId = sha256("custom:envelope:thread");
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus, {
      envelopeIdentifierSource: {
        nextMessageId: () => expectedMessageId,
        nextThreadId: () => expectedThreadId,
      },
    });

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;

    expect(offer.envelope.messageId).toEqual(expectedMessageId);
    expect(offer.envelope.threadId).toEqual(expectedThreadId);
  });

  it("persists explicit-holder credentials across agent restarts with a shared state store", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holderStateStore = new InMemoryProtocolStateStore();
    const holder = new HolderAgent(holderProfile, bus, {
      stateStore: holderStateStore,
    });

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as BirthCredentialIssuanceOffer;
    pureCircuits.assertValidBirthCredentialIssuanceOffer(offerBody);
    holder.receiveOfferAndSendRequest(offer);
    const request = bus.receive("issuer")!;
    const requestBody = request.body as BirthCredentialIssuanceRequest;
    pureCircuits.assertValidBirthCredentialIssuanceRequest(requestBody);
    pureCircuits.assertBirthCredentialIssuanceRequestMatchesOffer(
      offerBody,
      requestBody,
    );
    issuer.receiveRequestAndIssueCredential(request, claimWitness);
    const result = bus.receive("holder")!;
    const resultBody = result.body as BirthCredentialIssuanceResult;
    pureCircuits.assertValidBirthCredentialIssuanceResult(resultBody);
    pureCircuits.assertBirthCredentialIssuanceResultMatchesRequest(
      requestBody,
      resultBody,
    );
    holder.receiveCredentialResult(result);
    const originalStored = holder.getCredential(0);

    const restartedHolder = new HolderAgent(holderProfile, bus, {
      stateStore: holderStateStore,
    });

    expect(restartedHolder.credentialCount).toBe(1);
    expect(restartedHolder.getCredential(0)).toEqual(originalStored);
  });

  it("persists explicit-holder credentials across file-backed agent restarts", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-explicit-holder-state-"));

    try {
      const bus = new MessageBus();
      const issuer = new IssuerAgent(issuerProfile, bus);
      const holderStateStore = createCodecBackedProtocolStateStore(
        new FileSystemProtocolStateByteStore(rootDir),
        v8CodecResolver,
      );
      const holder = new HolderAgent(holderProfile, bus, {
        stateStore: holderStateStore,
      });

      issuer.createAndSendOffer("holder");
      const offer = bus.receive("holder")!;
      const offerBody = offer.body as BirthCredentialIssuanceOffer;
      pureCircuits.assertValidBirthCredentialIssuanceOffer(offerBody);
      holder.receiveOfferAndSendRequest(offer);
      const request = bus.receive("issuer")!;
      const requestBody = request.body as BirthCredentialIssuanceRequest;
      pureCircuits.assertValidBirthCredentialIssuanceRequest(requestBody);
      pureCircuits.assertBirthCredentialIssuanceRequestMatchesOffer(
        offerBody,
        requestBody,
      );
      issuer.receiveRequestAndIssueCredential(request, claimWitness);
      const result = bus.receive("holder")!;
      const resultBody = result.body as BirthCredentialIssuanceResult;
      pureCircuits.assertValidBirthCredentialIssuanceResult(resultBody);
      pureCircuits.assertBirthCredentialIssuanceResultMatchesRequest(
        requestBody,
        resultBody,
      );
      holder.receiveCredentialResult(result);
      const originalStored = holder.getCredential(0);

      const restartedHolder = new HolderAgent(holderProfile, bus, {
        stateStore: createCodecBackedProtocolStateStore(
          new FileSystemProtocolStateByteStore(rootDir),
          v8CodecResolver,
        ),
      });

      expect(restartedHolder.credentialCount).toBe(1);
      expect(restartedHolder.getCredential(0)).toEqual(originalStored);
      expect(restartedHolder.recoverClaimOpenings(0, ["legalName"])).toEqual([
        {
          claimId: "legalName",
          value: claimWitness.legalNamePadded,
          opening: claimWitness.legalNameOpening,
        },
      ]);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("revalidates persisted openings before recovery", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const stateStore = new InMemoryProtocolStateStore();
    const holder = new HolderAgent(holderProfile, bus, { stateStore });
    issuer.createAndSendOffer("holder");
    holder.receiveOfferAndSendRequest(bus.receive("holder")!);
    issuer.receiveRequestAndIssueCredential(bus.receive("issuer")!, claimWitness);
    holder.receiveCredentialResult(bus.receive("holder")!);
    const stored = holder.getCredential(0);
    stateStore
      .collection<StoredCredential>("holder:holder:stored-credentials")
      .set("0", {
        ...stored,
        privateParts: {
          ...stored.privateParts,
          openings: {
            ...stored.privateParts.openings,
            birthDateOpening: new Uint8Array(32).fill(8),
          },
        },
      });

    const restarted = new HolderAgent(holderProfile, bus, { stateStore });
    expect(() => restarted.recoverClaimOpenings(0, ["birthDate"])).toThrow(
      /birth-date opening does not match/i,
    );
  });

  it("recovers the explicit-holder credential count when stored credentials outpace metadata", () => {
    const bus = new MessageBus();
    const issuer = new IssuerAgent(issuerProfile, bus);
    const holderStateStore = new InMemoryProtocolStateStore();
    const holder = new HolderAgent(holderProfile, bus, {
      stateStore: holderStateStore,
    });

    issuer.createAndSendOffer("holder");
    const offer = bus.receive("holder")!;
    const offerBody = offer.body as BirthCredentialIssuanceOffer;
    pureCircuits.assertValidBirthCredentialIssuanceOffer(offerBody);
    holder.receiveOfferAndSendRequest(offer);
    const request = bus.receive("issuer")!;
    const requestBody = request.body as BirthCredentialIssuanceRequest;
    pureCircuits.assertValidBirthCredentialIssuanceRequest(requestBody);
    pureCircuits.assertBirthCredentialIssuanceRequestMatchesOffer(
      offerBody,
      requestBody,
    );
    issuer.receiveRequestAndIssueCredential(request, claimWitness);
    const result = bus.receive("holder")!;
    const resultBody = result.body as BirthCredentialIssuanceResult;
    pureCircuits.assertValidBirthCredentialIssuanceResult(resultBody);
    pureCircuits.assertBirthCredentialIssuanceResultMatchesRequest(
      requestBody,
      resultBody,
    );
    holder.receiveCredentialResult(result);
    const originalStored = holder.getCredential(0);

    holderStateStore.collection<number>("holder:holder:metadata").set(
      "credential-count",
      0,
    );

    const restartedHolder = new HolderAgent(holderProfile, bus, {
      stateStore: holderStateStore,
    });

    expect(restartedHolder.credentialCount).toBe(1);
    expect(restartedHolder.getCredential(0)).toEqual(originalStored);
  });
});
