import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import {
  type Proof,
  pureCircuits as genericPureCircuits,
  type VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  type BirthCredential,
  type BirthCredentialPresentation,
  type BirthCredentialPresentationRequest,
  pureCircuits,
} from "../managed/hello-verifier/contract/index.js";
import { HelloVerifierSimulator } from "../testing.js";

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

type Signer = {
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

type BirthCredentialFixture = {
  readonly credential: BirthCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: BirthCredentialPresentationRequest;
  readonly presentation: BirthCredentialPresentation;
  readonly presentationProof: Proof;
  readonly witness: {
    readonly birthDateDays: bigint;
    readonly birthDateOpening: Uint8Array;
    readonly birthCountryCodePadded: Uint8Array;
    readonly birthCountryCodeOpening: Uint8Array;
    readonly currentDay: bigint;
  };
};

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length >= length) {
    return bytes.subarray(0, length);
  }
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const mod = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
};

const createSigner = (label: string, secretKey: bigint): Signer => ({
  secretKey,
  publicKey: ecMulGenerator(secretKey),
  verificationMethodRef: {
    didContractAddress: {
      bytes: sha256(`contract:${label}`),
    },
    methodId: padText(`#${label}-key-1`),
  },
});

const signProof = ({
  bodyRoot,
  signer,
  createdAt,
  challengeHash,
  nonceScalar,
  context,
}: {
  readonly bodyRoot: Uint8Array;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
  readonly nonceScalar: bigint;
  readonly context: "issuance" | "presentation";
}): Proof => {
  const proof: Proof = {
    signerVerificationMethodRef: signer.verificationMethodRef,
    createdAt,
    challengeHash,
    publicKey: signer.publicKey,
    signature: {
      r: ecMulGenerator(nonceScalar),
      s: 0n,
    },
  };
  const challenge =
    context === "issuance"
      ? genericPureCircuits.issuanceProofChallenge(bodyRoot, proof)
      : genericPureCircuits.presentationProofChallenge(bodyRoot, proof);

  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

setNetworkId("undeployed");

const createBirthCredentialFixture = (): BirthCredentialFixture => {
  const issuer = createSigner("issuer", 123456789n);
  const holder = createSigner("holder", 987654321n);
  const witness = {
    birthDateDays: 3650n,
    birthDateOpening: sha256("opening:birth-date"),
    birthCountryCodePadded: padText("CAN"),
    birthCountryCodeOpening: sha256("opening:birth-country"),
    currentDay: 3650n + 365n * 25n,
  };
  const claims = {
    subjectIdCommitment: pureCircuits.subjectIdCommitment(
      sha256("subject:alice"),
      sha256("opening:subject"),
    ),
    legalNameCommitment: pureCircuits.legalNameCommitment(
      padText("Alice Example"),
      sha256("opening:legal-name"),
    ),
    birthDateCommitment: pureCircuits.birthDateCommitment(
      witness.birthDateDays,
      witness.birthDateOpening,
    ),
    birthCountryCodeCommitment: pureCircuits.birthCountryCodeCommitment(
      witness.birthCountryCodePadded,
      witness.birthCountryCodeOpening,
    ),
  };
  const credential: BirthCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight-did:vc:birth"),
      schemaId: padText("birth-credential:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    statusBinding: {},
    issuedAt: 10_000n,
    hasExpiration: true,
    expiresAt: 20_000n,
    claims,
    claimRoot: pureCircuits.birthCredentialClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.birthCredentialBodyRoot(credential),
    context: "issuance",
    signer: issuer,
    createdAt: 10_001n,
    challengeHash: sha256("challenge:issuance"),
    nonceScalar: 11n,
  });
  const presentationRequest: BirthCredentialPresentationRequest = {
    version: 1n,
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    requireSubjectIdCommitmentDisclosure: false,
    requireBirthCountryDisclosure: true,
    requireAgeOverThreshold: true,
    requestedAgeThresholdYears: 18n,
    verifierChallengeHash: sha256("challenge:verifier"),
  };
  const presentation: BirthCredentialPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed: {
      revealSubjectIdCommitment: false,
      subjectIdCommitment: new Uint8Array(32),
      revealBirthCountryCode: true,
      birthCountryCodePadded: witness.birthCountryCodePadded,
      birthCountryCodeOpening: witness.birthCountryCodeOpening,
      proveAgeOverThreshold: true,
      ageThresholdYears: 18n,
    },
  };
  const presentationProof = signProof({
    bodyRoot: pureCircuits.birthCredentialPresentationBodyRoot(presentation),
    context: "presentation",
    signer: holder,
    createdAt: 10_100n,
    challengeHash: presentationRequest.verifierChallengeHash,
    nonceScalar: 17n,
  });

  return {
    credential,
    credentialProof,
    presentationRequest,
    presentation,
    presentationProof,
    witness,
  };
};

describe("hello-verifier contract", () => {
  it("verifies a birth presentation against a minimal verifier request", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new HelloVerifierSimulator();
    const request = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      18n,
    );

    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );
    simulator.verifyBirthPresentationForHelloVerifier(
      fixture.credential,
      fixture.credentialProof,
      request,
      fixture.presentation,
      fixture.presentationProof,
      fixture.witness.currentDay,
    );

    const state = simulator.getLedger();
    expect(state.successfulVerificationCount).toEqual(1n);
    expect(state.lastVerifiedCredentialRoot).toEqual(
      pureCircuits.birthCredentialBodyRoot(fixture.credential),
    );
    expect(state.lastVerifiedCurrentDay).toEqual(fixture.witness.currentDay);
    expect(state.lastVerifiedThresholdYears).toEqual(18n);
    expect(state.lastVerifiedRequestChallenge).toEqual(
      fixture.presentationRequest.verifierChallengeHash,
    );
  });

  it("rejects a presentation that does not satisfy the verifier request", () => {
    const fixture = createBirthCredentialFixture();
    const simulator = new HelloVerifierSimulator();
    const stricterRequest = simulator.helloVerifierRequest(
      fixture.credential.issuerVerificationMethodRef,
      fixture.presentationRequest.verifierChallengeHash,
      30n,
    );

    simulator.setAgeWitness(
      fixture.witness.birthDateDays,
      fixture.witness.birthDateOpening,
    );

    expect(() =>
      simulator.verifyBirthPresentationForHelloVerifier(
        fixture.credential,
        fixture.credentialProof,
        stricterRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.currentDay,
      ),
    ).toThrow(/Presentation age threshold does not match the request/);
  });
});
