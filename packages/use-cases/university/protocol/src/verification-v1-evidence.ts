import { Buffer } from "node:buffer";

import type { CredentialFamilyProfileV1 } from "@midnight-ntwrk/credential-model";
import {
  type AnchorEvidenceReceiptV1,
  asBytes32,
  type AuthenticatedVerificationProfileIdentityV1,
  type ConsentBindingV1,
  type CredentialBindingV1,
  type EvidenceBindingV1,
  hashConsentBindingV1,
  hashCredentialBindingV1,
  hashEvidenceBindingV1,
  hashHolderBindingV1,
  hashPresentationBindingV1,
  hashVerificationTranscriptV1,
  type HolderBindingV1,
  prepareVerification,
  type PresentationBindingV1,
  verificationDomainV1,
  type VerificationEvaluationV1,
  type VerificationPublicInputsV1,
  type VerificationResultV1,
  type VerificationTranscriptV1,
  verifyPublicOffchain,
} from "@midnight-ntwrk/midnight-did-credentials";
import { sha256 } from "@midnight-ntwrk/midnight-did-credentials-protocol";

import type {
  UniversityIssuanceResultMessage,
  UniversityPresentationRequestMessage,
  UniversityPresentationResultMessage,
  UniversityPresentationSubmissionMessage,
} from "./flow-messages.js";
import { universityProtocolMessageIdHex } from "./flow-messages.js";
import { encodeUniversityCanonicalJson } from "./production-profile.js";

const digest = (value: unknown): Uint8Array =>
  sha256(typeof value === "string" ? value : encodeUniversityCanonicalJson(value));
const zero = (): Uint8Array => new Uint8Array(32);

const acceptedEvidence = (
  domain: "issuerEvidence" | "trustEvidence" | "artifactEvidence",
  subject: unknown,
): EvidenceBindingV1 => ({
  domain: verificationDomainV1(domain),
  version: 1n,
  mode: 2n,
  authorityDigest: digest({ domain, authority: "synthetic-authority" }),
  subjectDigest: digest(subject),
  stateAnchorDigest: digest({ domain, anchor: "synthetic-state-anchor" }),
  statementDigest: digest({ domain, statement: "synthetic-statement" }),
  createdAt: 1_800_000_000n,
  expiresAt: 1_900_000_000n,
});

const notRequiredEvidence = (
  domain: "statusEvidence" | "timeEvidence" | "connectorEvidence",
): EvidenceBindingV1 => ({
  domain: verificationDomainV1(domain),
  version: 1n,
  mode: 0n,
  authorityDigest: zero(),
  subjectDigest: zero(),
  stateAnchorDigest: zero(),
  statementDigest: zero(),
  createdAt: 0n,
  expiresAt: 0n,
});

export type UniversityVerificationV1Decision = {
  readonly studentId: string;
  readonly verifierId: string;
  readonly requestMessageId: string;
  readonly transcript: VerificationTranscriptV1;
  readonly result: VerificationResultV1;
};

export const executeUniversityVerificationV1Decision = (input: {
  readonly profile: CredentialFamilyProfileV1;
  readonly issuance: UniversityIssuanceResultMessage;
  readonly request: UniversityPresentationRequestMessage;
  readonly submission: UniversityPresentationSubmissionMessage;
  readonly result: UniversityPresentationResultMessage;
}): UniversityVerificationV1Decision => {
  const networkIdDigest = digest("university:synthetic-evidence-network");
  const verifierContractDigest = digest(input.result.from);
  const deploymentDigest = digest("university:local-process-deployment");
  const challengeDigest = digest(input.request.body.request.verifierChallengeHash);
  const credentialFamilyDigest = digest(input.profile.family.id);
  const schemaDigest = digest(input.profile.family.schemaId);
  const disclosureDigest = digest({
    requestedDisclosure: input.request.body.request,
    presentedDisclosure: input.submission.body.presentation.disclosed,
  });
  const predicateDigest = digest({
    enforceMinimumFinalGrade:
      input.request.body.request.enforceMinimumFinalGrade,
    minimumFinalGrade: input.request.body.request.minimumFinalGrade,
    presentation: input.submission.body.presentation,
  });
  const credentialBinding: CredentialBindingV1 = {
    domain: verificationDomainV1("credentialBinding"),
    version: 1n,
    mode: 1n,
    credentialFamilyDigest,
    schemaDigest,
    verifierContractDigest,
    challengeDigest,
    credentialRoot: digest({
      credential: input.issuance.body.credential,
      credentialProof: input.issuance.body.credentialProof,
    }),
  };
  const holderBinding: HolderBindingV1 = {
    domain: verificationDomainV1("holderBinding"),
    version: 1n,
    mode: 1n,
    verifierContractDigest,
    challengeDigest,
    subjectBindingDigest: digest({
      holder: input.submission.from,
      requestStudentId: input.request.body.studentId,
      credentialHolderBinding: input.submission.body.credential.holderBinding,
      presentationHolderBinding: input.submission.body.presentation.holderBinding,
      presentationProofSigner:
        input.submission.body.presentationProof.signerVerificationMethodRef,
    }),
  };
  const consentBinding: ConsentBindingV1 = {
    domain: verificationDomainV1("consentBinding"),
    version: 1n,
    profile: 3n,
    networkIdDigest,
    verifierContractDigest,
    deploymentDigest,
    audienceDigest: digest(input.request.from),
    originMode: 0n,
    originDigest: zero(),
    requestIdDigest: digest(
      universityProtocolMessageIdHex(input.request.envelope.messageId),
    ),
    challengeDigest,
    expiresAt: 1_900_000_000n,
    credentialFamilyDigest,
    schemaDigest,
    disclosureDigest,
    predicateDigest,
    statusMode: 0n,
    statusRegistryDigest: zero(),
    statusRoot: zero(),
    statusRegistryVersion: 0n,
    statusFreshnessPolicyDigest: zero(),
    policyDigest: digest(input.request.body),
    actionClassDigest: digest(input.request.body.kind),
    actionInvocationDigest: digest({
      envelope: input.submission.envelope,
      body: input.submission.body,
    }),
    artifactManifestDigest: digest({
      profile: input.profile.id,
      version: input.profile.version,
      circuit: "circuit.university-diploma.root@1.0.0",
    }),
    replayPolicy: 0n,
  };
  const presentationBinding: PresentationBindingV1 = {
    domain: verificationDomainV1("presentationBinding"),
    version: 1n,
    credentialBindingDigest: hashCredentialBindingV1(credentialBinding),
    holderBindingDigest: hashHolderBindingV1(holderBinding),
    disclosureDigest,
    predicateDigest,
    consentDigest: hashConsentBindingV1(consentBinding),
  };
  const issuerEvidence = acceptedEvidence("issuerEvidence", {
    issuer: input.issuance.from,
    verificationMethod:
      input.issuance.body.credential.issuerVerificationMethodRef,
    credentialProof: input.issuance.body.credentialProof,
  });
  const trustEvidence = acceptedEvidence("trustEvidence", {
    requestVerifier: input.request.from,
    resultVerifier: input.result.from,
    request: input.request.body,
  });
  const statusEvidence = notRequiredEvidence("statusEvidence");
  const timeEvidence = notRequiredEvidence("timeEvidence");
  const artifactEvidence = acceptedEvidence(
    "artifactEvidence",
    consentBinding.artifactManifestDigest,
  );
  const connectorEvidence = notRequiredEvidence("connectorEvidence");
  const anchorEvidenceReceipt: AnchorEvidenceReceiptV1 = {
    domain: verificationDomainV1("anchorEvidenceReceipt"),
    version: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(issuerEvidence),
    trustEvidenceDigest: hashEvidenceBindingV1(trustEvidence),
    statusEvidenceDigest: hashEvidenceBindingV1(statusEvidence),
    timeEvidenceDigest: hashEvidenceBindingV1(timeEvidence),
    artifactEvidenceDigest: hashEvidenceBindingV1(artifactEvidence),
    connectorEvidenceDigest: hashEvidenceBindingV1(connectorEvidence),
  };
  void anchorEvidenceReceipt;
  const transcript: VerificationTranscriptV1 = {
    domain: verificationDomainV1("transcript"),
    version: 1n,
    profile: 3n,
    authority: 3n,
    networkIdDigest,
    verifierContractDigest,
    deploymentDigest,
    audienceDigest: consentBinding.audienceDigest,
    originMode: 0n,
    originDigest: zero(),
    connectorEvidenceDigest: hashEvidenceBindingV1(connectorEvidence),
    requestIdDigest: consentBinding.requestIdDigest,
    challengeDigest,
    expiresAt: consentBinding.expiresAt,
    credentialFamilyDigest,
    schemaDigest,
    credentialBindingMode: credentialBinding.mode,
    credentialBindingDigest: hashCredentialBindingV1(credentialBinding),
    disclosureDigest,
    predicateDigest,
    holderBindingDigest: hashHolderBindingV1(holderBinding),
    policyDigest: consentBinding.policyDigest,
    actionClassDigest: zero(),
    actionInvocationDigest: zero(),
    consentDigest: hashConsentBindingV1(consentBinding),
    presentationBindingDigest: hashPresentationBindingV1(presentationBinding),
    issuerDidDigest: digest(input.issuance.from),
    issuerMethodDigest: digest(
      input.issuance.body.credential.issuerVerificationMethodRef,
    ),
    issuerRelationship: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(issuerEvidence),
    trustScopeDigest: digest(input.profile.semantics.trust.scope),
    trustEvidenceDigest: hashEvidenceBindingV1(trustEvidence),
    statusMode: 0n,
    statusRegistryDigest: zero(),
    statusRoot: zero(),
    statusRegistryVersion: 0n,
    statusFreshnessPolicyDigest: zero(),
    statusEvidenceDigest: hashEvidenceBindingV1(statusEvidence),
    timeMode: 0n,
    trustedTime: 0n,
    timeEvidenceDigest: hashEvidenceBindingV1(timeEvidence),
    artifactManifestDigest: consentBinding.artifactManifestDigest,
    artifactEvidenceDigest: hashEvidenceBindingV1(artifactEvidence),
    nullifierMode: 0n,
    replayPolicy: 0n,
    replayScopeDigest: zero(),
    decisionNullifier: zero(),
  };
  const publicInputs: VerificationPublicInputsV1 = {
    transcript,
    issuerEvidence,
    trustEvidence,
    statusEvidence,
    timeEvidence,
    artifactEvidence,
    connectorEvidence,
  };
  const identity: AuthenticatedVerificationProfileIdentityV1 = {
    source: "authenticated-resolved-profile-v1",
    profileId: input.profile.id,
    profileVersion: input.profile.version,
    familyId: input.profile.family.id,
    familyVersion: input.profile.family.version,
    schemaId: input.profile.family.schemaId,
    schemaVersion: input.profile.family.schemaVersion,
    credentialFamilyDigest: asBytes32(credentialFamilyDigest),
    schemaDigest: asBytes32(schemaDigest),
    artifactManifestDigest: asBytes32(consentBinding.artifactManifestDigest),
  };
  const transcriptDigest = hashVerificationTranscriptV1(transcript);
  const prepared = prepareVerification(
    "offchain-public-v1",
    publicInputs,
    input.profile,
    identity,
  );
  if (prepared.kind !== "prepared-verification") {
    throw new Error(
      `University Verification V1 preparation failed: ${prepared.reasonCode ?? "unknown"} at ${prepared.failureStage ?? "unknown"}`,
    );
  }
  if (
    !Buffer.from(prepared.transcriptDigest).equals(Buffer.from(transcriptDigest))
  ) {
    throw new Error("University Verification V1 transcript hash mismatch");
  }
  const policyDenied =
    !input.result.body.accepted && /below the verifier minimum/iu.test(input.result.body.reason);
  const invalid = !input.result.body.accepted && !policyDenied;
  const evaluation: VerificationEvaluationV1 = invalid
    ? {
        proofStatus: "invalid",
        decisionStatus: "notEvaluated",
        transcriptDigest,
        failureStage: "proof",
      }
    : {
        proofStatus: "valid",
        decisionStatus: policyDenied ? "policyDenied" : "approved",
        transcriptDigest,
        authorityEvidence: "local-process",
      };
  return {
    studentId: input.result.body.studentId,
    verifierId: input.result.from,
    requestMessageId: universityProtocolMessageIdHex(input.request.envelope.messageId),
    transcript,
    result: verifyPublicOffchain(prepared, {
      evaluator: { evaluate: () => evaluation },
    }),
  };
};
