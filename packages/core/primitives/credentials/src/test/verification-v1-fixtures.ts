import { createHash } from "node:crypto";

import type {
  AnchorEvidenceReceiptV1,
  ConsentBindingV1,
  CredentialBindingV1,
  DecisionNullifierMaterialV1,
  EvidenceBindingV1,
  HolderBindingV1,
  PresentationBindingV1,
  SyntheticVerificationExtensionV1,
  VerificationPublicInputsV1,
  VerificationTranscriptV1,
} from "../managed/credentials/contract/index.js";
import {
  hashConsentBindingV1,
  hashCredentialBindingV1,
  hashEvidenceBindingV1,
  hashHolderBindingV1,
  hashPresentationBindingV1,
  verificationDomainV1,
} from "../verification-v1.js";

export const digest = (label: string): Uint8Array =>
  Uint8Array.from(createHash("sha256").update(label, "utf8").digest());

export const zeroBytes32 = (): Uint8Array => new Uint8Array(32);

const unavailableEvidence = (
  domain: "issuerEvidence" | "trustEvidence" | "artifactEvidence",
  subject: string,
): EvidenceBindingV1 => ({
  domain: verificationDomainV1(domain),
  version: 1n,
  mode: 1n,
  authorityDigest: zeroBytes32(),
  subjectDigest: digest(subject),
  stateAnchorDigest: zeroBytes32(),
  statementDigest: zeroBytes32(),
  createdAt: 0n,
  expiresAt: 0n,
});

const notRequiredEvidence = (
  domain: "statusEvidence" | "timeEvidence" | "connectorEvidence",
): EvidenceBindingV1 => ({
  domain: verificationDomainV1(domain),
  version: 1n,
  mode: 0n,
  authorityDigest: zeroBytes32(),
  subjectDigest: zeroBytes32(),
  stateAnchorDigest: zeroBytes32(),
  statementDigest: zeroBytes32(),
  createdAt: 0n,
  expiresAt: 0n,
});

export interface VerificationV1Fixture {
  readonly credentialBinding: CredentialBindingV1;
  readonly holderBinding: HolderBindingV1;
  readonly consentBinding: ConsentBindingV1;
  readonly presentationBinding: PresentationBindingV1;
  readonly issuerEvidence: EvidenceBindingV1;
  readonly trustEvidence: EvidenceBindingV1;
  readonly statusEvidence: EvidenceBindingV1;
  readonly timeEvidence: EvidenceBindingV1;
  readonly artifactEvidence: EvidenceBindingV1;
  readonly connectorEvidence: EvidenceBindingV1;
  readonly anchorEvidenceReceipt: AnchorEvidenceReceiptV1;
  readonly decisionNullifierMaterial: DecisionNullifierMaterialV1;
  readonly syntheticExtension: SyntheticVerificationExtensionV1;
  readonly transcript: VerificationTranscriptV1;
  readonly publicInputs: VerificationPublicInputsV1;
}

export const createVerificationV1Fixture = (): VerificationV1Fixture => {
  const networkIdDigest = digest("verification-v1:network:undeployed");
  const verifierContractDigest = digest("verification-v1:contract:default");
  const deploymentDigest = digest("verification-v1:deployment:fixture");
  const challengeDigest = digest("verification-v1:challenge:fixture");
  const credentialFamilyDigest = digest("verification-v1:family:example");
  const schemaDigest = digest("verification-v1:schema:example-v1");
  const disclosureDigest = digest("verification-v1:disclosure:fixture");
  const predicateDigest = digest("verification-v1:predicate:fixture");

  const credentialBinding: CredentialBindingV1 = {
    domain: verificationDomainV1("credentialBinding"),
    version: 1n,
    mode: 1n,
    credentialFamilyDigest,
    schemaDigest,
    verifierContractDigest,
    challengeDigest,
    credentialRoot: digest("verification-v1:credential-root:fixture"),
  };
  const holderBinding: HolderBindingV1 = {
    domain: verificationDomainV1("holderBinding"),
    version: 1n,
    mode: 1n,
    verifierContractDigest,
    challengeDigest,
    subjectBindingDigest: digest("verification-v1:subject-binding:fixture"),
  };
  const consentBinding: ConsentBindingV1 = {
    domain: verificationDomainV1("consentBinding"),
    version: 1n,
    profile: 1n,
    networkIdDigest,
    verifierContractDigest,
    deploymentDigest,
    audienceDigest: digest("verification-v1:audience:fixture"),
    originMode: 0n,
    originDigest: zeroBytes32(),
    requestIdDigest: digest("verification-v1:request:fixture"),
    challengeDigest,
    expiresAt: 1_900_000_000n,
    credentialFamilyDigest,
    schemaDigest,
    disclosureDigest,
    predicateDigest,
    statusMode: 0n,
    statusRegistryDigest: zeroBytes32(),
    statusRoot: zeroBytes32(),
    statusRegistryVersion: 0n,
    statusFreshnessPolicyDigest: zeroBytes32(),
    policyDigest: digest("verification-v1:policy:fixture"),
    actionClassDigest: zeroBytes32(),
    actionInvocationDigest: zeroBytes32(),
    artifactManifestDigest: digest("verification-v1:artifact-manifest:fixture"),
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

  const issuerEvidence = unavailableEvidence(
    "issuerEvidence",
    "verification-v1:evidence-subject:issuer",
  );
  const trustEvidence = unavailableEvidence(
    "trustEvidence",
    "verification-v1:evidence-subject:trust",
  );
  const statusEvidence = notRequiredEvidence("statusEvidence");
  const timeEvidence = notRequiredEvidence("timeEvidence");
  const artifactEvidence = unavailableEvidence(
    "artifactEvidence",
    "verification-v1:evidence-subject:artifact",
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
  const decisionNullifierMaterial: DecisionNullifierMaterialV1 = {
    domain: verificationDomainV1("decisionNullifier"),
    version: 1n,
    deploymentDigest,
    verifierContractDigest,
    replayPolicy: 1n,
    replayScopeDigest: digest("verification-v1:replay-scope:fixture"),
  };
  const syntheticExtension: SyntheticVerificationExtensionV1 = {
    domain: verificationDomainV1("syntheticExtension"),
    version: 1n,
    familyDigest: digest("verification-v1:extension-family:synthetic"),
    valueDigest: digest("verification-v1:extension-value:synthetic"),
  };

  const transcript: VerificationTranscriptV1 = {
    domain: verificationDomainV1("transcript"),
    version: 1n,
    profile: 1n,
    authority: 1n,
    networkIdDigest,
    verifierContractDigest,
    deploymentDigest,
    audienceDigest: consentBinding.audienceDigest,
    originMode: 0n,
    originDigest: zeroBytes32(),
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
    actionClassDigest: zeroBytes32(),
    actionInvocationDigest: zeroBytes32(),
    consentDigest: hashConsentBindingV1(consentBinding),
    presentationBindingDigest: hashPresentationBindingV1(presentationBinding),
    issuerDidDigest: digest("verification-v1:issuer-did:fixture"),
    issuerMethodDigest: digest("verification-v1:issuer-method:fixture"),
    issuerRelationship: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(issuerEvidence),
    trustScopeDigest: digest("verification-v1:trust-scope:fixture"),
    trustEvidenceDigest: hashEvidenceBindingV1(trustEvidence),
    statusMode: 0n,
    statusRegistryDigest: zeroBytes32(),
    statusRoot: zeroBytes32(),
    statusRegistryVersion: 0n,
    statusFreshnessPolicyDigest: zeroBytes32(),
    statusEvidenceDigest: hashEvidenceBindingV1(statusEvidence),
    timeMode: 0n,
    trustedTime: 0n,
    timeEvidenceDigest: hashEvidenceBindingV1(timeEvidence),
    artifactManifestDigest: consentBinding.artifactManifestDigest,
    artifactEvidenceDigest: hashEvidenceBindingV1(artifactEvidence),
    nullifierMode: 0n,
    replayPolicy: 0n,
    replayScopeDigest: zeroBytes32(),
    decisionNullifier: zeroBytes32(),
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

  return {
    credentialBinding,
    holderBinding,
    consentBinding,
    presentationBinding,
    issuerEvidence,
    trustEvidence,
    statusEvidence,
    timeEvidence,
    artifactEvidence,
    connectorEvidence,
    anchorEvidenceReceipt,
    decisionNullifierMaterial,
    syntheticExtension,
    transcript,
    publicInputs,
  };
};
