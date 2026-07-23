import {
  type Alignment,
  type CompactType,
  CompactTypeBytes,
  CompactTypeUnsignedInteger,
  persistentHash,
  type Value,
} from "@midnight-ntwrk/compact-runtime";

import {
  type AnchorEvidenceReceiptV1,
  type ConsentBindingV1,
  type CredentialBindingV1,
  type DecisionNullifierMaterialV1,
  type EvidenceBindingV1,
  type HolderBindingV1,
  type PresentationBindingV1,
  pureCircuits,
  type SyntheticVerificationExtensionV1,
  type VerificationPublicInputsV1,
  type VerificationTranscriptV1,
} from "./managed/credentials/contract/index.js";

declare const bytes32Brand: unique symbol;

export type Bytes32 = Uint8Array & { readonly [bytes32Brand]: "Bytes32" };

export const VERIFICATION_V1_DOMAIN_HEX = {
  transcript:
    "3f38c62ae292ffa355bbca4e3f9be9a9e434c1445b18a925f2be617620fbc10c",
  decisionNullifier:
    "96c1b50ca1276c97e1c2bb0c8f01940304839ba5c6c97cc4ed42373f30255a4b",
  credentialBinding:
    "c54c6af1c9e53ff6dd91b5cd9423707c16a53c25bb1a4d8f0738fd897b6f5fe2",
  holderBinding:
    "0ae59272245f562b6c713f50d022e0c804bf901279af01f6d2c4ce69dbe936fa",
  consentBinding:
    "a0ae2fb15b4b04de798529337d99e4238832d1f2ab5ea40d32dc6b08f1dd13d9",
  presentationBinding:
    "955c95c796c84dc81fdc2768b5781a75d79eccd586723f698932676321e5922f",
  issuerEvidence:
    "af1fa0b28f12a055feccd88ca5e89d409c6604f96d63610e05d4ad1ff4191b05",
  trustEvidence:
    "4d1845021e23ed16978fee0bb399488dbb0a3d3dc7bc377f9550a1bd39d9ddf6",
  statusEvidence:
    "8fd3c20b5d9e74c36a9a10a4e9297cca09166befad1b52cc7a27b0d41ceb8496",
  timeEvidence:
    "895b896d7701e6045460e0c89bfd87cc32c4d98ea67657d240e46673d3a2ef7c",
  artifactEvidence:
    "94f559f0fe40e9294f507fd363b78a517e4e302f9fbb5a60aa57a0f575319b42",
  connectorEvidence:
    "bd1e17e9f164202ae26bc54aeea40fe6189948a72f9281a3d24bd08c725a5958",
  anchorEvidenceReceipt:
    "2f90dcb2a5e5c16e6a3ee80e1936e654fcd7d894c2d309ce080de8ac409b5a9d",
  syntheticExtension:
    "ef84347443755840202186e1f2a74a6f092e077a946a8a0afc89ce5db677aaac",
} as const;

type VerificationDomainNameV1 = keyof typeof VERIFICATION_V1_DOMAIN_HEX;

type OrderedField<A extends object> = {
  readonly key: keyof A;
  readonly descriptor: CompactType<unknown>;
};

class OrderedStructDescriptor<A extends object> implements CompactType<A> {
  readonly fields: readonly OrderedField<A>[];

  constructor(fields: readonly OrderedField<A>[]) {
    this.fields = fields;
  }

  alignment(): Alignment {
    return this.fields.reduce<Alignment>(
      (alignment, field) => alignment.concat(field.descriptor.alignment()),
      [],
    );
  }

  fromValue(value: Value): A {
    const result: Partial<Record<keyof A, unknown>> = {};
    for (const field of this.fields) {
      result[field.key] = field.descriptor.fromValue(value);
    }
    return result as A;
  }

  toValue(value: A): Value {
    return this.fields.reduce<Value>(
      (encoded, field) =>
        encoded.concat(field.descriptor.toValue(value[field.key])),
      [],
    );
  }
}

class ExactBytesDescriptor implements CompactType<Uint8Array> {
  readonly descriptor: CompactTypeBytes;

  constructor(readonly length: number) {
    this.descriptor = new CompactTypeBytes(length);
  }

  alignment(): Alignment {
    return this.descriptor.alignment();
  }

  fromValue(value: Value): Uint8Array {
    return this.descriptor.fromValue(value);
  }

  toValue(value: Uint8Array): Value {
    if (!(value instanceof Uint8Array) || value.length !== this.length) {
      throw new TypeError(`Expected ${this.length} bytes`);
    }
    return this.descriptor.toValue(value);
  }
}

const field = <A extends object, K extends keyof A>(
  key: K,
  descriptor: CompactType<A[K]>,
): OrderedField<A> => ({
  key,
  descriptor: descriptor as CompactType<unknown>,
});

const bytes32Descriptor = new ExactBytesDescriptor(32);
const uint8Descriptor = new CompactTypeUnsignedInteger(255n, 1);
const uint16Descriptor = new CompactTypeUnsignedInteger(65_535n, 2);
const uint64Descriptor = new CompactTypeUnsignedInteger(
  18_446_744_073_709_551_615n,
  8,
);

const credentialBindingDescriptor =
  new OrderedStructDescriptor<CredentialBindingV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("mode", uint8Descriptor),
    field("credentialFamilyDigest", bytes32Descriptor),
    field("schemaDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("challengeDigest", bytes32Descriptor),
    field("credentialRoot", bytes32Descriptor),
  ]);

const holderBindingDescriptor = new OrderedStructDescriptor<HolderBindingV1>([
  field("domain", bytes32Descriptor),
  field("version", uint16Descriptor),
  field("mode", uint8Descriptor),
  field("verifierContractDigest", bytes32Descriptor),
  field("challengeDigest", bytes32Descriptor),
  field("subjectBindingDigest", bytes32Descriptor),
]);

const consentBindingDescriptor = new OrderedStructDescriptor<ConsentBindingV1>([
  field("domain", bytes32Descriptor),
  field("version", uint16Descriptor),
  field("profile", uint8Descriptor),
  field("networkIdDigest", bytes32Descriptor),
  field("verifierContractDigest", bytes32Descriptor),
  field("deploymentDigest", bytes32Descriptor),
  field("audienceDigest", bytes32Descriptor),
  field("originMode", uint8Descriptor),
  field("originDigest", bytes32Descriptor),
  field("requestIdDigest", bytes32Descriptor),
  field("challengeDigest", bytes32Descriptor),
  field("expiresAt", uint64Descriptor),
  field("credentialFamilyDigest", bytes32Descriptor),
  field("schemaDigest", bytes32Descriptor),
  field("disclosureDigest", bytes32Descriptor),
  field("predicateDigest", bytes32Descriptor),
  field("statusMode", uint8Descriptor),
  field("statusRegistryDigest", bytes32Descriptor),
  field("statusRoot", bytes32Descriptor),
  field("statusRegistryVersion", uint64Descriptor),
  field("statusFreshnessPolicyDigest", bytes32Descriptor),
  field("policyDigest", bytes32Descriptor),
  field("actionClassDigest", bytes32Descriptor),
  field("actionInvocationDigest", bytes32Descriptor),
  field("artifactManifestDigest", bytes32Descriptor),
  field("replayPolicy", uint8Descriptor),
]);

const presentationBindingDescriptor =
  new OrderedStructDescriptor<PresentationBindingV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("credentialBindingDigest", bytes32Descriptor),
    field("holderBindingDigest", bytes32Descriptor),
    field("disclosureDigest", bytes32Descriptor),
    field("predicateDigest", bytes32Descriptor),
    field("consentDigest", bytes32Descriptor),
  ]);

const evidenceBindingDescriptor =
  new OrderedStructDescriptor<EvidenceBindingV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("mode", uint8Descriptor),
    field("authorityDigest", bytes32Descriptor),
    field("subjectDigest", bytes32Descriptor),
    field("stateAnchorDigest", bytes32Descriptor),
    field("statementDigest", bytes32Descriptor),
    field("createdAt", uint64Descriptor),
    field("expiresAt", uint64Descriptor),
  ]);

const anchorEvidenceReceiptDescriptor =
  new OrderedStructDescriptor<AnchorEvidenceReceiptV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("issuerEvidenceDigest", bytes32Descriptor),
    field("trustEvidenceDigest", bytes32Descriptor),
    field("statusEvidenceDigest", bytes32Descriptor),
    field("timeEvidenceDigest", bytes32Descriptor),
    field("artifactEvidenceDigest", bytes32Descriptor),
    field("connectorEvidenceDigest", bytes32Descriptor),
  ]);

const decisionNullifierMaterialDescriptor =
  new OrderedStructDescriptor<DecisionNullifierMaterialV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("replayPolicy", uint8Descriptor),
    field("replayScopeDigest", bytes32Descriptor),
  ]);

const syntheticVerificationExtensionDescriptor =
  new OrderedStructDescriptor<SyntheticVerificationExtensionV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("familyDigest", bytes32Descriptor),
    field("valueDigest", bytes32Descriptor),
  ]);

const verificationTranscriptDescriptor =
  new OrderedStructDescriptor<VerificationTranscriptV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("profile", uint8Descriptor),
    field("authority", uint8Descriptor),
    field("networkIdDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("audienceDigest", bytes32Descriptor),
    field("originMode", uint8Descriptor),
    field("originDigest", bytes32Descriptor),
    field("connectorEvidenceDigest", bytes32Descriptor),
    field("requestIdDigest", bytes32Descriptor),
    field("challengeDigest", bytes32Descriptor),
    field("expiresAt", uint64Descriptor),
    field("credentialFamilyDigest", bytes32Descriptor),
    field("schemaDigest", bytes32Descriptor),
    field("credentialBindingMode", uint8Descriptor),
    field("credentialBindingDigest", bytes32Descriptor),
    field("disclosureDigest", bytes32Descriptor),
    field("predicateDigest", bytes32Descriptor),
    field("holderBindingDigest", bytes32Descriptor),
    field("policyDigest", bytes32Descriptor),
    field("actionClassDigest", bytes32Descriptor),
    field("actionInvocationDigest", bytes32Descriptor),
    field("consentDigest", bytes32Descriptor),
    field("presentationBindingDigest", bytes32Descriptor),
    field("issuerDidDigest", bytes32Descriptor),
    field("issuerMethodDigest", bytes32Descriptor),
    field("issuerRelationship", uint8Descriptor),
    field("issuerEvidenceDigest", bytes32Descriptor),
    field("trustScopeDigest", bytes32Descriptor),
    field("trustEvidenceDigest", bytes32Descriptor),
    field("statusMode", uint8Descriptor),
    field("statusRegistryDigest", bytes32Descriptor),
    field("statusRoot", bytes32Descriptor),
    field("statusRegistryVersion", uint64Descriptor),
    field("statusFreshnessPolicyDigest", bytes32Descriptor),
    field("statusEvidenceDigest", bytes32Descriptor),
    field("timeMode", uint8Descriptor),
    field("trustedTime", uint64Descriptor),
    field("timeEvidenceDigest", bytes32Descriptor),
    field("artifactManifestDigest", bytes32Descriptor),
    field("artifactEvidenceDigest", bytes32Descriptor),
    field("nullifierMode", uint8Descriptor),
    field("replayPolicy", uint8Descriptor),
    field("replayScopeDigest", bytes32Descriptor),
    field("decisionNullifier", bytes32Descriptor),
  ]);

const verificationPublicInputsDescriptor =
  new OrderedStructDescriptor<VerificationPublicInputsV1>([
    field("transcript", verificationTranscriptDescriptor),
    field("issuerEvidence", evidenceBindingDescriptor),
    field("trustEvidence", evidenceBindingDescriptor),
    field("statusEvidence", evidenceBindingDescriptor),
    field("timeEvidence", evidenceBindingDescriptor),
    field("artifactEvidence", evidenceBindingDescriptor),
    field("connectorEvidence", evidenceBindingDescriptor),
  ]);

const bytesFromHex = (hex: string): Bytes32 => {
  if (!/^[0-9a-f]{64}$/u.test(hex)) {
    throw new TypeError(
      "Bytes32 hex must contain exactly 64 lowercase hex characters",
    );
  }
  const value = new Uint8Array(32);
  for (let index = 0; index < value.length; index += 1) {
    value[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return value as Bytes32;
};

export const asBytes32 = (value: Uint8Array): Bytes32 => {
  if (value.length !== 32) {
    throw new TypeError(`Expected 32 bytes, received ${value.length}`);
  }
  return Uint8Array.from(value) as Bytes32;
};

export const verificationDomainV1 = (name: VerificationDomainNameV1): Bytes32 =>
  bytesFromHex(VERIFICATION_V1_DOMAIN_HEX[name]);

export const hashCredentialBindingV1 = (
  binding: CredentialBindingV1,
): Bytes32 => asBytes32(persistentHash(credentialBindingDescriptor, binding));

export const hashHolderBindingV1 = (binding: HolderBindingV1): Bytes32 =>
  asBytes32(persistentHash(holderBindingDescriptor, binding));

export const hashConsentBindingV1 = (binding: ConsentBindingV1): Bytes32 =>
  asBytes32(persistentHash(consentBindingDescriptor, binding));

export const hashPresentationBindingV1 = (
  binding: PresentationBindingV1,
): Bytes32 => asBytes32(persistentHash(presentationBindingDescriptor, binding));

export const hashEvidenceBindingV1 = (binding: EvidenceBindingV1): Bytes32 =>
  asBytes32(persistentHash(evidenceBindingDescriptor, binding));

export const hashAnchorEvidenceReceiptV1 = (
  receipt: AnchorEvidenceReceiptV1,
): Bytes32 =>
  asBytes32(persistentHash(anchorEvidenceReceiptDescriptor, receipt));

export const hashDecisionNullifierMaterialV1 = (
  material: DecisionNullifierMaterialV1,
): Bytes32 =>
  asBytes32(persistentHash(decisionNullifierMaterialDescriptor, material));

export const hashSyntheticVerificationExtensionV1 = (
  extension: SyntheticVerificationExtensionV1,
): Bytes32 =>
  asBytes32(
    persistentHash(syntheticVerificationExtensionDescriptor, extension),
  );

export const hashVerificationTranscriptV1 = (
  transcript: VerificationTranscriptV1,
): Bytes32 =>
  asBytes32(persistentHash(verificationTranscriptDescriptor, transcript));

export type VerificationProofStatusV1 =
  | "malformed"
  | "invalid"
  | "indeterminate"
  | "valid";

export type VerificationDecisionStatusV1 =
  | "notEvaluated"
  | "approved"
  | "policyDenied"
  | "replay";

export type VerificationAuthorityV1 =
  | "ledger-local"
  | "ledger-attested"
  | "local-process";

export type VerificationExecutionStatusV1 =
  | "notSubmitted"
  | "rejected"
  | "reverted"
  | "committed";

export type VerificationProfileV1 =
  | "ledger-local-v1"
  | "ledger-attested-v1"
  | "offchain-public-v1";

export type VerificationReasonCodeV1 =
  | "malformed-input-v1"
  | "profile-mismatch-v1"
  | "authority-unavailable-v1"
  | "ledger-adapter-unavailable-v1"
  | "offchain-adapter-unavailable-v1";

interface LocalVerificationAttemptCommonV1 {
  readonly version: 1;
  readonly kind: "local-attempt";
  readonly targetProfile: VerificationProfileV1;
  readonly authority: "local-process";
  readonly transcriptDigest?: Bytes32;
  readonly reasonCode?: VerificationReasonCodeV1;
}

export type MalformedLocalVerificationAttemptV1 =
  LocalVerificationAttemptCommonV1 & {
    readonly proofStatus: "malformed";
    readonly decisionStatus: "notEvaluated";
    readonly executionStatus: "notSubmitted";
  };

export type LocalVerificationAttemptV1 = LocalVerificationAttemptCommonV1 &
  (
    | MalformedLocalVerificationAttemptV1
    | {
        readonly proofStatus: "invalid" | "indeterminate";
        readonly decisionStatus: "notEvaluated";
        readonly executionStatus: "notSubmitted" | "rejected" | "reverted";
      }
    | {
        readonly targetProfile: "offchain-public-v1";
        readonly proofStatus: "valid";
        readonly decisionStatus: "approved" | "policyDenied";
        readonly executionStatus: "notSubmitted";
      }
    | {
        readonly targetProfile: "ledger-local-v1" | "ledger-attested-v1";
        readonly proofStatus: "valid";
        readonly decisionStatus: "approved";
        readonly executionStatus: "notSubmitted" | "rejected" | "reverted";
      }
    | {
        readonly targetProfile: "ledger-local-v1" | "ledger-attested-v1";
        readonly proofStatus: "valid";
        readonly decisionStatus: "policyDenied";
        readonly executionStatus: "notSubmitted";
      }
  );

interface LedgerVerificationReceiptCommonV1 {
  readonly version: 1;
  readonly kind: "ledger-receipt";
  readonly proofStatus: "valid";
  readonly decisionStatus: "approved" | "policyDenied" | "replay";
  readonly executionStatus: "committed";
  readonly transcriptDigest: Bytes32;
  readonly decisionNullifier: Bytes32;
  readonly anchorEvidenceDigest: Bytes32;
  readonly transactionDigest: Bytes32;
}

export type LedgerVerificationReceiptV1 = LedgerVerificationReceiptCommonV1 &
  (
    | {
        readonly profile: "ledger-local-v1";
        readonly authority: "ledger-local";
      }
    | {
        readonly profile: "ledger-attested-v1";
        readonly authority: "ledger-attested";
      }
  );

export type VerificationResultV1 =
  | LocalVerificationAttemptV1
  | LedgerVerificationReceiptV1;

export type VerificationEvidenceClassV1 =
  | "issuer"
  | "trust"
  | "status"
  | "time"
  | "artifact"
  | "connector";

export interface PreparedVerificationV1 {
  readonly version: 1;
  readonly kind: "prepared-verification";
  readonly targetProfile: VerificationProfileV1;
  readonly publicInputs: VerificationPublicInputsV1;
  readonly transcriptDigest: Bytes32;
  readonly unavailableEvidence: readonly VerificationEvidenceClassV1[];
}

export type PrepareVerificationResultV1 =
  | PreparedVerificationV1
  | MalformedLocalVerificationAttemptV1;

const profileCode = (profile: VerificationProfileV1): bigint => {
  if (profile === "ledger-local-v1") return 1n;
  if (profile === "ledger-attested-v1") return 2n;
  if (profile === "offchain-public-v1") return 3n;
  throw new TypeError("Unknown verification profile");
};

const malformedAttempt = (
  targetProfile: VerificationProfileV1,
  reasonCode: Extract<
    VerificationReasonCodeV1,
    "malformed-input-v1" | "profile-mismatch-v1"
  >,
  transcriptDigest?: Bytes32,
): MalformedLocalVerificationAttemptV1 => ({
  version: 1,
  kind: "local-attempt",
  targetProfile,
  authority: "local-process",
  proofStatus: "malformed",
  decisionStatus: "notEvaluated",
  executionStatus: "notSubmitted",
  reasonCode,
  ...(transcriptDigest === undefined ? {} : { transcriptDigest }),
});

const unavailableAttempt = (
  prepared: PreparedVerificationV1,
  reasonCode: Extract<
    VerificationReasonCodeV1,
    | "authority-unavailable-v1"
    | "ledger-adapter-unavailable-v1"
    | "offchain-adapter-unavailable-v1"
  >,
): LocalVerificationAttemptV1 => ({
  version: 1,
  kind: "local-attempt",
  targetProfile: prepared.targetProfile,
  authority: "local-process",
  proofStatus: "indeterminate",
  decisionStatus: "notEvaluated",
  executionStatus: "notSubmitted",
  transcriptDigest: asBytes32(prepared.transcriptDigest),
  reasonCode,
});

const unavailableEvidence = (
  inputs: VerificationPublicInputsV1,
): readonly VerificationEvidenceClassV1[] => {
  const evidence: Array<
    readonly [VerificationEvidenceClassV1, EvidenceBindingV1]
  > = [
    ["issuer", inputs.issuerEvidence],
    ["trust", inputs.trustEvidence],
    ["status", inputs.statusEvidence],
    ["time", inputs.timeEvidence],
    ["artifact", inputs.artifactEvidence],
    ["connector", inputs.connectorEvidence],
  ];
  return evidence
    .filter(([, binding]) => binding.mode === 1n)
    .map(([name]) => name);
};

export const prepareVerification = (
  targetProfile: VerificationProfileV1,
  inputs: unknown,
): PrepareVerificationResultV1 => {
  let publicInputs: VerificationPublicInputsV1;
  try {
    const encoded = verificationPublicInputsDescriptor.toValue(
      inputs as VerificationPublicInputsV1,
    );
    publicInputs = verificationPublicInputsDescriptor.fromValue(encoded);
  } catch {
    return malformedAttempt(targetProfile, "malformed-input-v1");
  }

  let transcriptDigest: Bytes32;
  try {
    transcriptDigest = hashVerificationTranscriptV1(publicInputs.transcript);
  } catch {
    return malformedAttempt(targetProfile, "malformed-input-v1");
  }

  try {
    pureCircuits.assertValidVerificationPublicInputsV1(publicInputs);
  } catch {
    return malformedAttempt(
      targetProfile,
      "malformed-input-v1",
      transcriptDigest,
    );
  }

  if (publicInputs.transcript.profile !== profileCode(targetProfile)) {
    return malformedAttempt(
      targetProfile,
      "profile-mismatch-v1",
      transcriptDigest,
    );
  }

  return {
    version: 1,
    kind: "prepared-verification",
    targetProfile,
    publicInputs,
    transcriptDigest,
    unavailableEvidence: unavailableEvidence(publicInputs),
  };
};

const refreshPreparedVerification = (
  prepared: PreparedVerificationV1,
): PrepareVerificationResultV1 => {
  const refreshed = prepareVerification(
    prepared.targetProfile,
    prepared.publicInputs,
  );
  if (refreshed.kind === "local-attempt") return refreshed;
  if (
    !refreshed.transcriptDigest.every(
      (byte, index) => byte === prepared.transcriptDigest[index],
    )
  ) {
    return malformedAttempt(
      prepared.targetProfile,
      "malformed-input-v1",
      refreshed.transcriptDigest,
    );
  }
  return refreshed;
};

export const preflightVerification = (
  prepared: PreparedVerificationV1,
): LocalVerificationAttemptV1 => {
  const refreshed = refreshPreparedVerification(prepared);
  if (refreshed.kind === "local-attempt") return refreshed;
  return unavailableAttempt(refreshed, "authority-unavailable-v1");
};

export const submitLedgerVerification = async (
  prepared: PreparedVerificationV1,
): Promise<LocalVerificationAttemptV1> => {
  const refreshed = refreshPreparedVerification(prepared);
  if (refreshed.kind === "local-attempt") return refreshed;
  if (refreshed.targetProfile === "offchain-public-v1") {
    return malformedAttempt(
      refreshed.targetProfile,
      "profile-mismatch-v1",
      refreshed.transcriptDigest,
    );
  }
  return unavailableAttempt(refreshed, "ledger-adapter-unavailable-v1");
};

export const verifyPublicOffchain = (
  prepared: PreparedVerificationV1,
): LocalVerificationAttemptV1 => {
  const refreshed = refreshPreparedVerification(prepared);
  if (refreshed.kind === "local-attempt") return refreshed;
  if (refreshed.targetProfile !== "offchain-public-v1") {
    return malformedAttempt(
      refreshed.targetProfile,
      "profile-mismatch-v1",
      refreshed.transcriptDigest,
    );
  }
  return unavailableAttempt(refreshed, "offchain-adapter-unavailable-v1");
};
