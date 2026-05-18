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
import { describe, expect, it } from "vitest";

import {
  type MixedClaimsCredential,
  type MixedClaimsCredentialClaims,
  type MixedClaimsPresentation,
  type MixedClaimsPresentationRequest,
  pureCircuits,
} from "../managed/mixed-claims-credential/contract/index.js";

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

type Signer = {
  readonly label: string;
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
  readonly verificationMethodRef: VerificationMethodRef;
};

type ProofContext = "issuance" | "presentation";

type FixtureOptions = {
  readonly revealSubjectId?: boolean;
  readonly leakHiddenSubjectId?: boolean;
  readonly requireSubjectIdDisclosure?: boolean;
  readonly requireBirthDateDisclosure?: boolean;
  readonly enforceMinimumAccountTier?: boolean;
  readonly proveAccountTierAtLeast?: boolean;
  readonly accountTier?: bigint;
  readonly minimumAccountTier?: bigint;
};

type MixedClaimsFixture = {
  readonly credential: MixedClaimsCredential;
  readonly credentialProof: Proof;
  readonly presentationRequest: MixedClaimsPresentationRequest;
  readonly presentation: MixedClaimsPresentation;
  readonly presentationProof: Proof;
  readonly witness: {
    readonly accountTier: bigint;
    readonly accountTierOpening: Uint8Array;
  };
};

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > length) {
    throw new Error(`Text value exceeds ${length}-byte fixture padding limit`);
  }
  if (bytes.length === length) {
    return bytes;
  }
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const mod = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
};

const contractAddress = (label: string): { bytes: Uint8Array } => ({
  bytes: sha256(`contract:${label}`),
});

const createSigner = (
  label: string,
  secretKey: bigint,
  methodId = `#${label}-key-1`,
): Signer => ({
  label,
  secretKey,
  publicKey: ecMulGenerator(secretKey),
  verificationMethodRef: {
    didContractAddress: contractAddress(label),
    methodId: padText(methodId),
  },
});

const deriveProofChallenge = (
  bodyRoot: Uint8Array,
  proof: Proof,
  context: ProofContext,
): bigint =>
  context === "issuance"
    ? genericPureCircuits.issuanceProofChallenge(bodyRoot, proof)
    : genericPureCircuits.presentationProofChallenge(bodyRoot, proof);

const signProof = ({
  bodyRoot,
  context,
  signer,
  createdAt,
  challengeHash,
}: {
  readonly bodyRoot: Uint8Array;
  readonly context: ProofContext;
  readonly signer: Signer;
  readonly createdAt: bigint;
  readonly challengeHash: Uint8Array;
}): Proof => {
  const nonceScalar =
    context === "issuance" ? 37n + signer.secretKey : 41n + signer.secretKey;
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
  const challenge = deriveProofChallenge(bodyRoot, proof, context);
  return {
    ...proof,
    signature: {
      r: proof.signature.r,
      s: mod(nonceScalar + challenge * signer.secretKey),
    },
  };
};

const createFixture = ({
  revealSubjectId = true,
  leakHiddenSubjectId = false,
  requireSubjectIdDisclosure = true,
  requireBirthDateDisclosure = false,
  enforceMinimumAccountTier = true,
  proveAccountTierAtLeast = enforceMinimumAccountTier,
  accountTier = 3n,
  minimumAccountTier = enforceMinimumAccountTier ? 2n : 0n,
}: FixtureOptions = {}): MixedClaimsFixture => {
  const issuer = createSigner("mixed-claims-issuer", 45454545n);
  const holder = createSigner("mixed-claims-holder", 54545454n);
  const subjectId = sha256("subject:mixed-claims:alice");
  const subjectIdOpening = sha256("opening:mixed-claims:subject-id");
  const birthDateDays = 7_777n;
  const birthDateOpening = sha256("opening:mixed-claims:birth-date");
  const accountTierOpening = sha256("opening:mixed-claims:account-tier");
  const publicClaims = {
    credentialTypeCode: 42n,
    issuerJurisdictionCode: padText("US", 2),
    assuranceLevel: 2n,
  };
  const claims: MixedClaimsCredentialClaims = {
    publicClaims,
    privateClaims: {
      subjectIdCommitment: pureCircuits.mixedClaimsSubjectIdCommitment(
        subjectId,
        subjectIdOpening,
      ),
      birthDateCommitment: pureCircuits.mixedClaimsBirthDateCommitment(
        birthDateDays,
        birthDateOpening,
      ),
      accountTierCommitment: pureCircuits.mixedClaimsAccountTierCommitment(
        accountTier,
        accountTierOpening,
      ),
    },
  };
  const credential: MixedClaimsCredential = {
    version: 1n,
    schema: {
      packageId: padText("midnight:vc:mixed-claims"),
      schemaId: padText("mixed-claims:v1"),
      majorVersion: 1n,
      minorVersion: 0n,
    },
    issuerVerificationMethodRef: issuer.verificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: holder.verificationMethodRef,
    },
    statusBinding: {},
    issuedAt: 50_000n,
    hasExpiration: false,
    expiresAt: 0n,
    claims,
    claimRoot: pureCircuits.mixedClaimsClaimRoot(claims),
  };
  const credentialProof = signProof({
    bodyRoot: pureCircuits.mixedClaimsCredentialBodyRoot(credential),
    context: "issuance",
    signer: issuer,
    createdAt: 50_001n,
    challengeHash: sha256("challenge:mixed-claims:issuance"),
  });
  const verifierChallengeHash = sha256("challenge:mixed-claims:verifier");
  const presentationRequest: MixedClaimsPresentationRequest = {
    version: 1n,
    schema: credential.schema,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    requireSubjectIdDisclosure,
    requireBirthDateDisclosure,
    enforceMinimumAccountTier,
    minimumAccountTier,
    verifierChallengeHash,
  };
  const presentation: MixedClaimsPresentation = {
    version: 1n,
    schema: credential.schema,
    credentialClaimRoot: credential.claimRoot,
    issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
    holderBinding: credential.holderBinding,
    disclosed: {
      publicClaims,
      revealSubjectId,
      subjectId:
        revealSubjectId || leakHiddenSubjectId ? subjectId : new Uint8Array(32),
      subjectIdOpening: revealSubjectId ? subjectIdOpening : new Uint8Array(32),
      revealBirthDate: requireBirthDateDisclosure,
      birthDateDays: requireBirthDateDisclosure ? birthDateDays : 0n,
      birthDateOpening: requireBirthDateDisclosure
        ? birthDateOpening
        : new Uint8Array(32),
      proveAccountTierAtLeast,
    },
  };
  const presentationProof = signProof({
    bodyRoot: pureCircuits.mixedClaimsPresentationBodyRoot(presentation),
    context: "presentation",
    signer: holder,
    createdAt: 50_002n,
    challengeHash: verifierChallengeHash,
  });

  return {
    credential,
    credentialProof,
    presentationRequest,
    presentation,
    presentationProof,
    witness: {
      accountTier,
      accountTierOpening,
    },
  };
};

describe("mixed-claims behavior", () => {
  it("accepts public claims, subject disclosure, and a hidden account-tier predicate witness", () => {
    const fixture = createFixture();

    expect(() =>
      pureCircuits.assertMixedClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.accountTier,
        fixture.witness.accountTierOpening,
      ),
    ).not.toThrow();
  });

  it("rejects an account-tier predicate witness with the wrong opening", () => {
    const fixture = createFixture();

    expect(() =>
      pureCircuits.assertMixedClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.accountTier,
        new Uint8Array(32).fill(7),
      ),
    ).toThrow(
      /Mixed-claims account-tier witness does not open the credential commitment/,
    );
  });

  it("rejects an account-tier predicate witness below the requested threshold", () => {
    const fixture = createFixture({ accountTier: 1n, minimumAccountTier: 2n });

    expect(() =>
      pureCircuits.assertMixedClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.accountTier,
        fixture.witness.accountTierOpening,
      ),
    ).toThrow(/Mixed-claims account tier is below the verifier minimum/);
  });

  it("rejects hidden subject-id slots that carry non-canonical data", () => {
    const fixture = createFixture({
      revealSubjectId: false,
      requireSubjectIdDisclosure: false,
      leakHiddenSubjectId: true,
    });

    expect(() =>
      pureCircuits.assertValidMixedClaimsPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Mixed-claims hidden subject-id disclosure slot must be empty/);
  });

  it("rejects non-zero inactive account-tier witnesses", () => {
    const fixture = createFixture({ enforceMinimumAccountTier: false });

    expect(() =>
      pureCircuits.assertMixedClaimsPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentationRequest,
        fixture.presentation,
        fixture.presentationProof,
        fixture.witness.accountTier,
        fixture.witness.accountTierOpening,
      ),
    ).toThrow(/Mixed-claims inactive account-tier witness must be zero/);
  });
});
