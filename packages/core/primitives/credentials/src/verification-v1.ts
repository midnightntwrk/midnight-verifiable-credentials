import {
  type Alignment,
  type CompactType,
  CompactTypeBytes,
  CompactTypeUnsignedInteger,
  persistentHash,
  type Value,
} from "@midnight-ntwrk/compact-runtime";
import {
  assertCredentialFamilyProfileV1,
  type CredentialFamilyProfileV1,
} from "@midnight-ntwrk/credential-model";

import {
  type ActionCredentialBindingV1,
  type ActionHolderBindingV1,
  type AnchorEvidenceReceiptV1,
  type ConsentBindingV1,
  type CredentialActionReplayScopeV1,
  type CredentialBindingV1,
  type DecisionNullifierMaterialV1,
  type EvidenceBindingV1,
  type HolderActionReplayScopeV1,
  type HolderBindingV1,
  type PresentationBindingV1,
  pureCircuits,
  type RequestReplayScopeV1,
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
  replayScopeRequest:
    "c72b7a875fcfee30cb0edeb3b7ca21e2867780a36eb9700a284865cfcf7d4006",
  replayScopeHolderAction:
    "6e4febf6159e66bca18709daababcb4823a95d040a09c1b958770087e6441e41",
  replayScopeCredentialAction:
    "93970c856f94e29226a1b84f2c66f9319377bab221f72963185cd2336cb5be8e",
  actionHolderBinding:
    "0068d9e1a69d5be92a349c0bc726541aacd20b2e98c21d08ce1b934c3d87c080",
  actionCredentialBinding:
    "866e43c74410c8cb72b3a4f8df670c2211407e7f74b87299f6a935d66e3bc1aa",
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

export type ReplayPolicyV1 = 0n | 1n | 2n | 3n;
export type RequiredReplayPolicyV1 = 1n | 2n | 3n;

export type ReplayScopeV1 =
  | RequestReplayScopeV1
  | HolderActionReplayScopeV1
  | CredentialActionReplayScopeV1;

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

const actionHolderBindingDescriptor =
  new OrderedStructDescriptor<ActionHolderBindingV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("actionClassDigest", bytes32Descriptor),
    field("holderSubjectDigest", bytes32Descriptor),
  ]);

const actionCredentialBindingDescriptor =
  new OrderedStructDescriptor<ActionCredentialBindingV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("actionClassDigest", bytes32Descriptor),
    field("credentialFamilyDigest", bytes32Descriptor),
    field("schemaDigest", bytes32Descriptor),
    field("credentialRoot", bytes32Descriptor),
  ]);

const requestReplayScopeDescriptor =
  new OrderedStructDescriptor<RequestReplayScopeV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("requestIdDigest", bytes32Descriptor),
    field("challengeDigest", bytes32Descriptor),
    field("actionInvocationDigest", bytes32Descriptor),
  ]);

const holderActionReplayScopeDescriptor =
  new OrderedStructDescriptor<HolderActionReplayScopeV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("actionClassDigest", bytes32Descriptor),
    field("actionScopeParametersDigest", bytes32Descriptor),
    field("binding", actionHolderBindingDescriptor),
  ]);

const credentialActionReplayScopeDescriptor =
  new OrderedStructDescriptor<CredentialActionReplayScopeV1>([
    field("domain", bytes32Descriptor),
    field("version", uint16Descriptor),
    field("deploymentDigest", bytes32Descriptor),
    field("verifierContractDigest", bytes32Descriptor),
    field("actionClassDigest", bytes32Descriptor),
    field("actionScopeParametersDigest", bytes32Descriptor),
    field("binding", actionCredentialBindingDescriptor),
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

export const hashActionHolderBindingV1 = (
  binding: ActionHolderBindingV1,
): Bytes32 => asBytes32(persistentHash(actionHolderBindingDescriptor, binding));

export const hashActionCredentialBindingV1 = (
  binding: ActionCredentialBindingV1,
): Bytes32 =>
  asBytes32(persistentHash(actionCredentialBindingDescriptor, binding));

export const hashRequestReplayScopeV1 = (
  scope: RequestReplayScopeV1,
): Bytes32 => asBytes32(persistentHash(requestReplayScopeDescriptor, scope));

export const hashHolderActionReplayScopeV1 = (
  scope: HolderActionReplayScopeV1,
): Bytes32 =>
  asBytes32(persistentHash(holderActionReplayScopeDescriptor, scope));

export const hashCredentialActionReplayScopeV1 = (
  scope: CredentialActionReplayScopeV1,
): Bytes32 =>
  asBytes32(persistentHash(credentialActionReplayScopeDescriptor, scope));

export const hashReplayScopeV1 = (scope: ReplayScopeV1): Bytes32 => {
  if (!(scope.domain instanceof Uint8Array) || scope.domain.length !== 32) {
    throw new TypeError("Replay scope domain is malformed");
  }
  const domain = toHex(scope.domain);
  if (domain === VERIFICATION_V1_DOMAIN_HEX.replayScopeRequest) {
    return hashRequestReplayScopeV1(scope as RequestReplayScopeV1);
  }
  if (domain === VERIFICATION_V1_DOMAIN_HEX.replayScopeHolderAction) {
    return hashHolderActionReplayScopeV1(scope as HolderActionReplayScopeV1);
  }
  if (domain === VERIFICATION_V1_DOMAIN_HEX.replayScopeCredentialAction) {
    return hashCredentialActionReplayScopeV1(
      scope as CredentialActionReplayScopeV1,
    );
  }
  throw new TypeError("Replay scope domain is unknown");
};

export const hashDecisionNullifierMaterialV1 = (
  material: DecisionNullifierMaterialV1,
): Bytes32 =>
  asBytes32(persistentHash(decisionNullifierMaterialDescriptor, material));

export const zeroBytes32V1 = (): Bytes32 => new Uint8Array(32) as Bytes32;

const assertNonZero = (value: Uint8Array, name: string): void => {
  if (value.length !== 32 || value.every((byte) => byte === 0)) {
    throw new TypeError(`${name} must be set`);
  }
};

const assertReplayScopeHeader = (
  scope: ReplayScopeV1,
  expectedDomain: Uint8Array,
): void => {
  if (scope.version !== 1n) {
    throw new TypeError("Replay scope version must be 1");
  }
  if (toHex(scope.domain) !== toHex(expectedDomain)) {
    throw new TypeError("Replay scope domain is unknown");
  }
};

const assertActionHolderBinding = (
  binding: ActionHolderBindingV1,
  deploymentDigest: Uint8Array,
  verifierContractDigest: Uint8Array,
  actionClassDigest: Uint8Array,
): void => {
  if (
    toHex(binding.domain) !== toHex(verificationDomainV1("actionHolderBinding"))
  ) {
    throw new TypeError("Action holder binding domain is unknown");
  }
  if (binding.version !== 1n) {
    throw new TypeError("Action holder binding version must be 1");
  }
  if (toHex(binding.deploymentDigest) !== toHex(deploymentDigest)) {
    throw new TypeError("Action holder deployment binding mismatch");
  }
  if (toHex(binding.verifierContractDigest) !== toHex(verifierContractDigest)) {
    throw new TypeError("Action holder verifier binding mismatch");
  }
  if (toHex(binding.actionClassDigest) !== toHex(actionClassDigest)) {
    throw new TypeError("Action holder action binding mismatch");
  }
  assertNonZero(binding.holderSubjectDigest, "Action holder subject binding");
};

const assertActionCredentialBinding = (
  binding: ActionCredentialBindingV1,
  deploymentDigest: Uint8Array,
  verifierContractDigest: Uint8Array,
  actionClassDigest: Uint8Array,
): void => {
  if (
    toHex(binding.domain) !==
    toHex(verificationDomainV1("actionCredentialBinding"))
  ) {
    throw new TypeError("Action credential binding domain is unknown");
  }
  if (binding.version !== 1n) {
    throw new TypeError("Action credential binding version must be 1");
  }
  if (toHex(binding.deploymentDigest) !== toHex(deploymentDigest)) {
    throw new TypeError("Action credential deployment binding mismatch");
  }
  if (toHex(binding.verifierContractDigest) !== toHex(verifierContractDigest)) {
    throw new TypeError("Action credential verifier binding mismatch");
  }
  if (toHex(binding.actionClassDigest) !== toHex(actionClassDigest)) {
    throw new TypeError("Action credential action binding mismatch");
  }
  assertNonZero(
    binding.credentialFamilyDigest,
    "Action credential family binding",
  );
  assertNonZero(binding.schemaDigest, "Action credential schema binding");
  assertNonZero(binding.credentialRoot, "Action credential root binding");
};

const toHex = (value: Uint8Array): string =>
  Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");

// These are policy-specific primitives, not final authoritative verifiers.
// A product/composing circuit must select one from its fixed policy configuration;
// callers cannot select a replay policy at runtime through these entrypoints.
export const deriveRequestDecisionNullifierV1 = (input: {
  readonly deploymentDigest: Uint8Array;
  readonly verifierContractDigest: Uint8Array;
  readonly scope: RequestReplayScopeV1;
}): Bytes32 => {
  assertNonZero(input.deploymentDigest, "Deployment digest");
  assertNonZero(input.verifierContractDigest, "Verifier contract digest");
  assertReplayScopeHeader(
    input.scope,
    verificationDomainV1("replayScopeRequest"),
  );
  assertNonZero(input.scope.requestIdDigest, "Request replay request id");
  assertNonZero(input.scope.challengeDigest, "Request replay challenge");
  assertNonZero(
    input.scope.actionInvocationDigest,
    "Request replay action invocation",
  );
  if (toHex(input.scope.deploymentDigest) !== toHex(input.deploymentDigest)) {
    throw new TypeError("Request replay deployment binding mismatch");
  }
  if (
    toHex(input.scope.verifierContractDigest) !==
    toHex(input.verifierContractDigest)
  ) {
    throw new TypeError("Request replay verifier binding mismatch");
  }
  return hashDecisionNullifierMaterialV1({
    domain: verificationDomainV1("decisionNullifier"),
    version: 1n,
    deploymentDigest: input.deploymentDigest,
    verifierContractDigest: input.verifierContractDigest,
    replayPolicy: 1n,
    replayScopeDigest: hashRequestReplayScopeV1(input.scope),
  });
};

export const deriveHolderActionDecisionNullifierV1 = (input: {
  readonly deploymentDigest: Uint8Array;
  readonly verifierContractDigest: Uint8Array;
  readonly scope: HolderActionReplayScopeV1;
}): Bytes32 => {
  assertNonZero(input.deploymentDigest, "Deployment digest");
  assertNonZero(input.verifierContractDigest, "Verifier contract digest");
  assertReplayScopeHeader(
    input.scope,
    verificationDomainV1("replayScopeHolderAction"),
  );
  assertNonZero(input.scope.actionClassDigest, "Action replay class");
  assertNonZero(
    input.scope.actionScopeParametersDigest,
    "Action replay scope parameters",
  );
  if (toHex(input.scope.deploymentDigest) !== toHex(input.deploymentDigest)) {
    throw new TypeError("Holder-action deployment binding mismatch");
  }
  if (
    toHex(input.scope.verifierContractDigest) !==
    toHex(input.verifierContractDigest)
  ) {
    throw new TypeError("Holder-action verifier binding mismatch");
  }
  assertActionHolderBinding(
    input.scope.binding,
    input.deploymentDigest,
    input.verifierContractDigest,
    input.scope.actionClassDigest,
  );
  return hashDecisionNullifierMaterialV1({
    domain: verificationDomainV1("decisionNullifier"),
    version: 1n,
    deploymentDigest: input.deploymentDigest,
    verifierContractDigest: input.verifierContractDigest,
    replayPolicy: 2n,
    replayScopeDigest: hashHolderActionReplayScopeV1(input.scope),
  });
};

export const deriveCredentialActionDecisionNullifierV1 = (input: {
  readonly deploymentDigest: Uint8Array;
  readonly verifierContractDigest: Uint8Array;
  readonly scope: CredentialActionReplayScopeV1;
}): Bytes32 => {
  assertNonZero(input.deploymentDigest, "Deployment digest");
  assertNonZero(input.verifierContractDigest, "Verifier contract digest");
  assertReplayScopeHeader(
    input.scope,
    verificationDomainV1("replayScopeCredentialAction"),
  );
  assertNonZero(input.scope.actionClassDigest, "Action replay class");
  assertNonZero(
    input.scope.actionScopeParametersDigest,
    "Action replay scope parameters",
  );
  if (toHex(input.scope.deploymentDigest) !== toHex(input.deploymentDigest)) {
    throw new TypeError("Credential-action deployment binding mismatch");
  }
  if (
    toHex(input.scope.verifierContractDigest) !==
    toHex(input.verifierContractDigest)
  ) {
    throw new TypeError("Credential-action verifier binding mismatch");
  }
  assertActionCredentialBinding(
    input.scope.binding,
    input.deploymentDigest,
    input.verifierContractDigest,
    input.scope.actionClassDigest,
  );
  return hashDecisionNullifierMaterialV1({
    domain: verificationDomainV1("decisionNullifier"),
    version: 1n,
    deploymentDigest: input.deploymentDigest,
    verifierContractDigest: input.verifierContractDigest,
    replayPolicy: 3n,
    replayScopeDigest: hashCredentialActionReplayScopeV1(input.scope),
  });
};

export const deriveNoDecisionNullifierV1 = (): Bytes32 => zeroBytes32V1();

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
  | "submitted"
  | "included"
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
  | "private-inputs-public-only-v1"
  | "authority-unavailable-v1"
  | "evidence-unavailable-v1"
  | "verification-invalid-v1"
  | "policy-denied-v1"
  | "provider-failure-v1"
  | "ledger-adapter-unavailable-v1"
  | "offchain-adapter-unavailable-v1"
  | "transaction-rejected-v1"
  | "transaction-reverted-v1"
  | "transaction-unconfirmed-v1"
  | "transaction-invalid-v1";

export type VerificationFailureStageV1 =
  | "proof"
  | "issuer"
  | "trust"
  | "status"
  | "time"
  | "artifact"
  | "connector"
  | "prover"
  | "verifier"
  | "network"
  | "ledger";

interface LocalVerificationAttemptCommonV1 {
  readonly version: 1;
  readonly kind: "local-attempt";
  readonly targetProfile: VerificationProfileV1;
  readonly authority: "local-process";
  readonly transcriptDigest?: Bytes32;
  readonly reasonCode?: VerificationReasonCodeV1;
  readonly failureStage?: VerificationFailureStageV1;
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
        readonly executionStatus:
          | "notSubmitted"
          | "submitted"
          | "included"
          | "rejected"
          | "reverted";
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
        readonly executionStatus:
          | "notSubmitted"
          | "submitted"
          | "included"
          | "rejected"
          | "reverted";
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
  /** Independently confirmed state transition bound to this receipt. */
  readonly atomicMutation: "none" | "committed";
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

export interface AuthenticatedVerificationProfileIdentityV1 {
  readonly source: "authenticated-resolved-profile-v1";
  readonly profileId: string;
  readonly profileVersion: string;
  readonly familyId: string;
  readonly familyVersion: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly credentialFamilyDigest: Bytes32;
  readonly schemaDigest: Bytes32;
  readonly artifactManifestDigest: Bytes32;
}

export interface VerificationProfileBindingV1 {
  readonly source: "authenticated-resolved-profile-v1";
  readonly profile: VerificationProfileV1;
  readonly privateInputSources: readonly PrivateVerificationInputSourceV1[];
  /** Revalidated at every executor boundary before trusting the projection. */
  readonly credentialProfile: CredentialFamilyProfileV1;
  readonly identity: AuthenticatedVerificationProfileIdentityV1;
  readonly mutation: {
    readonly location: "none" | "ledger";
    readonly nullifier: "none" | "contract-derived";
    readonly consumption: "none" | "atomic";
  };
}

export interface PreparedVerificationV1 {
  readonly version: 1;
  readonly kind: "prepared-verification";
  readonly targetProfile: VerificationProfileV1;
  readonly publicInputs: VerificationPublicInputsV1;
  readonly transcriptDigest: Bytes32;
  readonly unavailableEvidence: readonly VerificationEvidenceClassV1[];
  /** Immutable projection of a profile validated by credential-model. */
  readonly profileBinding: VerificationProfileBindingV1 | null;
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
    | "malformed-input-v1"
    | "profile-mismatch-v1"
    | "private-inputs-public-only-v1"
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
    | "evidence-unavailable-v1"
    | "provider-failure-v1"
    | "ledger-adapter-unavailable-v1"
    | "offchain-adapter-unavailable-v1"
  >,
  failureStage: VerificationFailureStageV1 = "verifier",
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
  failureStage,
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

const prepareVerificationWithBinding = (
  targetProfile: VerificationProfileV1,
  inputs: unknown,
  profileBinding: VerificationProfileBindingV1 | null,
): PrepareVerificationResultV1 => {
  const expectedProfileCode = profileCode(targetProfile);
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

  if (publicInputs.transcript.profile !== expectedProfileCode) {
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
    profileBinding,
  };
};

export const prepareVerification = (
  targetProfile: VerificationProfileV1,
  inputs: unknown,
  profile?: CredentialFamilyProfileV1,
  identity?: AuthenticatedVerificationProfileIdentityV1,
): PrepareVerificationResultV1 => {
  // Preserve fail-fast rejection of unknown target profile identifiers.
  profileCode(targetProfile);
  const normalized = prepareVerificationWithBinding(
    targetProfile,
    inputs,
    null,
  );
  if (normalized.kind === "local-attempt") return normalized;
  if (profile === undefined) {
    return identity === undefined
      ? normalized
      : malformedAttempt(
          targetProfile,
          "profile-mismatch-v1",
          normalized.transcriptDigest,
        );
  }

  try {
    const declaredPrivateInputs =
      profile.semantics.verification.privateInputSources;
    if (
      targetProfile === "offchain-public-v1" &&
      Array.isArray(declaredPrivateInputs) &&
      declaredPrivateInputs.length > 0
    ) {
      return malformedAttempt(targetProfile, "private-inputs-public-only-v1");
    }
    assertCredentialFamilyProfileV1(profile);
    const { transcript } = normalized.publicInputs;
    if (
      identity === undefined ||
      identity.source !== "authenticated-resolved-profile-v1" ||
      identity.profileId !== profile.id ||
      identity.profileVersion !== profile.version ||
      identity.familyId !== profile.family.id ||
      identity.familyVersion !== profile.family.version ||
      identity.schemaId !== profile.family.schemaId ||
      identity.schemaVersion !== profile.family.schemaVersion ||
      !sameBytes(
        identity.credentialFamilyDigest,
        transcript.credentialFamilyDigest,
      ) ||
      !sameBytes(identity.schemaDigest, transcript.schemaDigest) ||
      !sameBytes(
        identity.artifactManifestDigest,
        transcript.artifactManifestDigest,
      ) ||
      profile.semantics.verification.profile !== targetProfile
    ) {
      return malformedAttempt(
        targetProfile,
        "profile-mismatch-v1",
        normalized.transcriptDigest,
      );
    }
    const mutation: VerificationProfileBindingV1["mutation"] =
      profile.semantics.mutation.location === "ledger"
        ? Object.freeze({
            location: "ledger" as const,
            nullifier: "contract-derived" as const,
            consumption: "atomic" as const,
          })
        : Object.freeze({
            location: "none" as const,
            nullifier: "none" as const,
            consumption: "none" as const,
          });
    const credentialProfile = globalThis.structuredClone(profile);
    assertCredentialFamilyProfileV1(credentialProfile);
    const profileBinding: VerificationProfileBindingV1 = Object.freeze({
      source: "authenticated-resolved-profile-v1" as const,
      profile: targetProfile,
      privateInputSources: Object.freeze([
        ...credentialProfile.semantics.verification.privateInputSources,
      ]),
      credentialProfile,
      identity: Object.freeze({
        ...identity,
        credentialFamilyDigest: asBytes32(identity.credentialFamilyDigest),
        schemaDigest: asBytes32(identity.schemaDigest),
        artifactManifestDigest: asBytes32(identity.artifactManifestDigest),
      }),
      mutation,
    });
    return { ...normalized, profileBinding };
  } catch {
    return malformedAttempt(
      targetProfile,
      "malformed-input-v1",
      normalized.transcriptDigest,
    );
  }
};

const refreshPreparedVerification = (
  prepared: PreparedVerificationV1,
): PrepareVerificationResultV1 => {
  if (prepared.version !== 1 || prepared.kind !== "prepared-verification") {
    return malformedAttempt(prepared.targetProfile, "malformed-input-v1");
  }
  const refreshed = prepareVerificationWithBinding(
    prepared.targetProfile,
    prepared.publicInputs,
    prepared.profileBinding,
  );
  if (refreshed.kind === "local-attempt") return refreshed;
  if (!sameBytes(refreshed.transcriptDigest, prepared.transcriptDigest)) {
    return malformedAttempt(
      prepared.targetProfile,
      "malformed-input-v1",
      refreshed.transcriptDigest,
    );
  }
  return refreshed;
};

export type PrivateVerificationInputSourceV1 =
  | "hidden-holder"
  | "private-predicate"
  | "same-holder"
  | "private-status";

export type VerificationEvaluationV1 =
  | {
      readonly proofStatus: "valid";
      readonly decisionStatus: "approved" | "policyDenied" | "replay";
      readonly transcriptDigest: Bytes32;
      readonly authorityEvidence:
        | "local-process"
        | "ledger-local"
        | "ledger-attested";
      readonly failureStage?: never;
    }
  | {
      readonly proofStatus: "invalid" | "indeterminate";
      readonly decisionStatus: "notEvaluated";
      readonly transcriptDigest: Bytes32;
      readonly failureStage: VerificationFailureStageV1;
    };

export interface VerificationV1LocalEvaluator {
  /**
   * Runs the owning proof/DID/trust/status/time/artifact mechanisms. The
   * executor treats this output as untrusted until its transcript is rebound.
   */
  evaluate(prepared: PreparedVerificationV1): VerificationEvaluationV1;
}

export interface PublicVerificationExecutorV1 {
  readonly evaluator: VerificationV1LocalEvaluator;
}

export type LedgerExecutionObservationStatusV1 =
  | "submitted"
  | "included"
  | "rejected"
  | "reverted"
  | "committed";

export interface LedgerExecutionObservationV1 {
  readonly version: 1;
  readonly executionStatus: LedgerExecutionObservationStatusV1;
  readonly evaluation: VerificationEvaluationV1;
  readonly transcriptDigest: Bytes32;
  readonly decisionNullifier: Bytes32;
  readonly anchorEvidenceDigest: Bytes32;
  readonly transactionDigest?: Bytes32;
  /** The provider-observed atomic business-write state. */
  readonly atomicMutation: "none" | "committed";
}

export interface LedgerVerificationExecutorV1 {
  submit(
    prepared: PreparedVerificationV1,
  ): Promise<LedgerExecutionObservationV1>;
  /** Authenticates successful committed transaction evidence, not submission. */
  confirmCommitted(
    observation: LedgerExecutionObservationV1,
    prepared: PreparedVerificationV1,
  ): Promise<boolean>;
}

export interface VerificationParityEvidenceV1 {
  readonly version: 1;
  readonly status: "equivalent" | "diverged";
  readonly proofStatus: VerificationProofStatusV1 | null;
  readonly decisionStatus: VerificationDecisionStatusV1 | null;
  readonly paths: readonly {
    readonly pathId: string;
    readonly authority: VerificationAuthorityV1;
    readonly proofStatus: VerificationProofStatusV1;
    readonly decisionStatus: VerificationDecisionStatusV1;
  }[];
}

const isBytes32 = (value: unknown): value is Uint8Array =>
  value instanceof Uint8Array && value.length === 32;

const sameBytes = (left: unknown, right: unknown): boolean =>
  isBytes32(left) &&
  isBytes32(right) &&
  left.every((byte, index) => byte === right[index]);

const evidenceModes = (prepared: PreparedVerificationV1): readonly bigint[] => [
  prepared.publicInputs.issuerEvidence.mode,
  prepared.publicInputs.trustEvidence.mode,
  prepared.publicInputs.statusEvidence.mode,
  prepared.publicInputs.timeEvidence.mode,
  prepared.publicInputs.artifactEvidence.mode,
  prepared.publicInputs.connectorEvidence.mode,
];

const privateInputSources: readonly PrivateVerificationInputSourceV1[] = [
  "hidden-holder",
  "private-predicate",
  "same-holder",
  "private-status",
];

const validProfileBinding = (
  binding: VerificationProfileBindingV1 | null,
  targetProfile: VerificationProfileV1,
): boolean => {
  if (binding === null) return targetProfile !== "offchain-public-v1";
  try {
    assertCredentialFamilyProfileV1(binding.credentialProfile);
    const verification = binding.credentialProfile.semantics.verification;
    const mutation = binding.credentialProfile.semantics.mutation;
    return (
      binding.source === "authenticated-resolved-profile-v1" &&
      binding.profile === targetProfile &&
      binding.identity.source === binding.source &&
      binding.identity.profileId === binding.credentialProfile.id &&
      binding.identity.profileVersion === binding.credentialProfile.version &&
      binding.identity.familyId === binding.credentialProfile.family.id &&
      binding.identity.familyVersion ===
        binding.credentialProfile.family.version &&
      binding.identity.schemaId === binding.credentialProfile.family.schemaId &&
      binding.identity.schemaVersion ===
        binding.credentialProfile.family.schemaVersion &&
      isBytes32(binding.identity.credentialFamilyDigest) &&
      isBytes32(binding.identity.schemaDigest) &&
      isBytes32(binding.identity.artifactManifestDigest) &&
      verification.profile === targetProfile &&
      Array.isArray(binding.privateInputSources) &&
      binding.privateInputSources.every((source) =>
        privateInputSources.includes(source),
      ) &&
      binding.privateInputSources.length ===
        verification.privateInputSources.length &&
      binding.privateInputSources.every(
        (source, index) => verification.privateInputSources[index] === source,
      ) &&
      binding.mutation.location === mutation.location &&
      binding.mutation.nullifier === mutation.nullifier &&
      binding.mutation.consumption === mutation.consumption &&
      ((binding.mutation.location === "none" &&
        binding.mutation.nullifier === "none" &&
        binding.mutation.consumption === "none") ||
        (binding.mutation.location === "ledger" &&
          binding.mutation.nullifier === "contract-derived" &&
          binding.mutation.consumption === "atomic"))
    );
  } catch {
    return false;
  }
};

const snapshotProfileBinding = (
  binding: VerificationProfileBindingV1 | null,
): VerificationProfileBindingV1 | null =>
  binding === null
    ? null
    : Object.freeze({
        source: binding.source,
        profile: binding.profile,
        privateInputSources: Object.freeze([...binding.privateInputSources]),
        credentialProfile: globalThis.structuredClone(
          binding.credentialProfile,
        ),
        identity: Object.freeze({
          ...binding.identity,
          credentialFamilyDigest: asBytes32(
            binding.identity.credentialFamilyDigest,
          ),
          schemaDigest: asBytes32(binding.identity.schemaDigest),
          artifactManifestDigest: asBytes32(
            binding.identity.artifactManifestDigest,
          ),
        }),
        mutation: Object.freeze({ ...binding.mutation }),
      });

const sameProfileBinding = (
  left: VerificationProfileBindingV1 | null,
  right: VerificationProfileBindingV1 | null,
): boolean => {
  if (left === null || right === null) return left === right;
  try {
    return (
      left.source === right.source &&
      left.profile === right.profile &&
      JSON.stringify(left.privateInputSources) ===
        JSON.stringify(right.privateInputSources) &&
      JSON.stringify(left.credentialProfile) ===
        JSON.stringify(right.credentialProfile) &&
      left.identity.source === right.identity.source &&
      left.identity.profileId === right.identity.profileId &&
      left.identity.profileVersion === right.identity.profileVersion &&
      left.identity.familyId === right.identity.familyId &&
      left.identity.familyVersion === right.identity.familyVersion &&
      left.identity.schemaId === right.identity.schemaId &&
      left.identity.schemaVersion === right.identity.schemaVersion &&
      sameBytes(
        left.identity.credentialFamilyDigest,
        right.identity.credentialFamilyDigest,
      ) &&
      sameBytes(left.identity.schemaDigest, right.identity.schemaDigest) &&
      sameBytes(
        left.identity.artifactManifestDigest,
        right.identity.artifactManifestDigest,
      ) &&
      JSON.stringify(left.mutation) === JSON.stringify(right.mutation)
    );
  } catch {
    return false;
  }
};

const profileCompatibilityFailure = (
  prepared: PreparedVerificationV1,
): MalformedLocalVerificationAttemptV1 | null => {
  const fail = (): MalformedLocalVerificationAttemptV1 =>
    malformedAttempt(
      prepared.targetProfile,
      "profile-mismatch-v1",
      prepared.transcriptDigest,
    );
  try {
    const { transcript } = prepared.publicInputs;
    if (!validProfileBinding(prepared.profileBinding, prepared.targetProfile)) {
      return fail();
    }
    if (
      prepared.profileBinding !== null &&
      (!sameBytes(
        prepared.profileBinding.identity.credentialFamilyDigest,
        transcript.credentialFamilyDigest,
      ) ||
        !sameBytes(
          prepared.profileBinding.identity.schemaDigest,
          transcript.schemaDigest,
        ) ||
        !sameBytes(
          prepared.profileBinding.identity.artifactManifestDigest,
          transcript.artifactManifestDigest,
        ))
    ) {
      return fail();
    }

    const requiredModes = [
      prepared.publicInputs.issuerEvidence.mode,
      prepared.publicInputs.trustEvidence.mode,
      prepared.publicInputs.artifactEvidence.mode,
      ...(transcript.statusMode === 0n
        ? []
        : [prepared.publicInputs.statusEvidence.mode]),
      ...(transcript.timeMode === 0n
        ? []
        : [prepared.publicInputs.timeEvidence.mode]),
      ...(transcript.originMode === 1n
        ? [prepared.publicInputs.connectorEvidence.mode]
        : []),
    ];
    if (requiredModes.some((mode) => mode === 0n)) return fail();

    const expectedStatusEvidenceMode =
      transcript.statusMode === 0n
        ? 0n
        : transcript.statusMode === 1n
          ? 2n
          : transcript.statusMode === 2n
            ? 4n
            : 3n;
    const expectedTimeEvidenceMode =
      transcript.timeMode === 0n ? 0n : transcript.timeMode === 1n ? 2n : 3n;
    const expectedConnectorMode = transcript.originMode === 1n ? 3n : 0n;
    if (
      (prepared.publicInputs.statusEvidence.mode !== 1n &&
        prepared.publicInputs.statusEvidence.mode !==
          expectedStatusEvidenceMode) ||
      (prepared.publicInputs.timeEvidence.mode !== 1n &&
        prepared.publicInputs.timeEvidence.mode !== expectedTimeEvidenceMode) ||
      (prepared.publicInputs.connectorEvidence.mode !== 1n &&
        prepared.publicInputs.connectorEvidence.mode !== expectedConnectorMode)
    ) {
      return fail();
    }

    if (prepared.profileBinding !== null) {
      const semantics = prepared.profileBinding.credentialProfile.semantics;
      const expectedStatusMode =
        semantics.status.mode === "disabled"
          ? 0n
          : semantics.status.mode === "authority-attested"
            ? 3n
            : semantics.status.evidence === "non-membership"
              ? 2n
              : 1n;
      const expectedTimeMode =
        semantics.trustedTime.source === "none"
          ? 0n
          : semantics.trustedTime.source === "ledger"
            ? 1n
            : semantics.trustedTime.source === "attested"
              ? 2n
              : -1n;
      if (
        transcript.statusMode !== expectedStatusMode ||
        transcript.timeMode !== expectedTimeMode
      ) {
        return fail();
      }
    }

    const modes = evidenceModes(prepared);
    if (
      prepared.targetProfile === "ledger-local-v1" &&
      (modes.some(
        (mode) => mode !== 0n && mode !== 1n && mode !== 2n && mode !== 4n,
      ) ||
        transcript.statusMode === 3n ||
        transcript.timeMode === 2n ||
        transcript.originMode !== 0n)
    ) {
      return fail();
    }
    if (prepared.targetProfile === "ledger-attested-v1") {
      if (
        modes.some((mode) => mode < 0n || mode > 4n) ||
        (!requiredModes.includes(1n) &&
          !requiredModes.some((mode) => mode === 3n || mode === 4n))
      ) {
        return fail();
      }
      if (
        transcript.originMode === 1n &&
        !sameBytes(
          prepared.publicInputs.connectorEvidence.statementDigest,
          transcript.consentDigest,
        )
      ) {
        return fail();
      }
    }
    if (prepared.profileBinding !== null) {
      const profileRequiresNullifier =
        prepared.profileBinding.mutation.location === "ledger";
      if (transcript.nullifierMode !== (profileRequiresNullifier ? 1n : 0n)) {
        return fail();
      }
    }
    if (prepared.targetProfile === "offchain-public-v1") {
      if (
        prepared.profileBinding === null ||
        prepared.profileBinding.privateInputSources.length > 0 ||
        prepared.profileBinding.mutation.location !== "none" ||
        transcript.credentialBindingMode === 2n
      ) {
        return malformedAttempt(
          prepared.targetProfile,
          "private-inputs-public-only-v1",
          prepared.transcriptDigest,
        );
      }
      if (
        transcript.nullifierMode !== 0n ||
        transcript.replayPolicy !== 0n ||
        transcript.statusMode === 3n ||
        transcript.timeMode === 2n
      ) {
        return fail();
      }
    }
    return null;
  } catch {
    return fail();
  }
};

const reasonForEvaluation = (
  evaluation: VerificationEvaluationV1,
): VerificationReasonCodeV1 | undefined => {
  if (evaluation.proofStatus === "invalid") return "verification-invalid-v1";
  if (evaluation.proofStatus === "indeterminate") {
    return "evidence-unavailable-v1";
  }
  return evaluation.decisionStatus === "policyDenied"
    ? "policy-denied-v1"
    : undefined;
};

const failureStages: readonly VerificationFailureStageV1[] = [
  "proof",
  "issuer",
  "trust",
  "status",
  "time",
  "artifact",
  "connector",
  "prover",
  "verifier",
  "network",
  "ledger",
];

const expectedEvaluationAuthority = (
  profile: VerificationProfileV1,
): "local-process" | "ledger-local" | "ledger-attested" =>
  profile === "ledger-local-v1"
    ? "ledger-local"
    : profile === "ledger-attested-v1"
      ? "ledger-attested"
      : "local-process";

const validEvaluation = (
  prepared: PreparedVerificationV1,
  evaluation: VerificationEvaluationV1,
): boolean => {
  try {
    return (
      typeof evaluation === "object" &&
      evaluation !== null &&
      sameBytes(evaluation.transcriptDigest, prepared.transcriptDigest) &&
      ((evaluation.proofStatus === "valid" &&
        (evaluation.decisionStatus === "approved" ||
          evaluation.decisionStatus === "policyDenied" ||
          evaluation.decisionStatus === "replay") &&
        evaluation.authorityEvidence ===
          expectedEvaluationAuthority(prepared.targetProfile) &&
        evaluation.failureStage === undefined) ||
        ((evaluation.proofStatus === "invalid" ||
          evaluation.proofStatus === "indeterminate") &&
          evaluation.decisionStatus === "notEvaluated" &&
          failureStages.includes(evaluation.failureStage)))
    );
  } catch {
    return false;
  }
};

type NoncommittedExecutionStatusV1 = Exclude<
  VerificationExecutionStatusV1,
  "committed"
>;

const localIndeterminateAttempt = (
  prepared: PreparedVerificationV1,
  executionStatus: NoncommittedExecutionStatusV1,
  reasonCode: VerificationReasonCodeV1,
  failureStage: VerificationFailureStageV1,
): LocalVerificationAttemptV1 => ({
  version: 1,
  kind: "local-attempt",
  targetProfile: prepared.targetProfile,
  authority: "local-process",
  proofStatus: "indeterminate",
  decisionStatus: "notEvaluated",
  executionStatus,
  transcriptDigest: asBytes32(prepared.transcriptDigest),
  reasonCode,
  failureStage,
});

const localAttemptFromEvaluation = (
  prepared: PreparedVerificationV1,
  evaluation: VerificationEvaluationV1,
  executionStatus: NoncommittedExecutionStatusV1,
  reasonCode: VerificationReasonCodeV1 | undefined = reasonForEvaluation(
    evaluation,
  ),
  failureStage:
    | VerificationFailureStageV1
    | undefined = evaluation.failureStage,
): LocalVerificationAttemptV1 => {
  const common = {
    version: 1 as const,
    kind: "local-attempt" as const,
    targetProfile: prepared.targetProfile,
    authority: "local-process" as const,
    executionStatus,
    transcriptDigest: asBytes32(prepared.transcriptDigest),
    ...(reasonCode === undefined ? {} : { reasonCode }),
    ...(failureStage === undefined ? {} : { failureStage }),
  };
  if (
    evaluation.proofStatus === "invalid" ||
    evaluation.proofStatus === "indeterminate"
  ) {
    return {
      ...common,
      proofStatus: evaluation.proofStatus,
      decisionStatus: "notEvaluated",
    };
  }
  if (
    evaluation.decisionStatus === "replay" ||
    (evaluation.decisionStatus === "policyDenied" &&
      executionStatus !== "notSubmitted") ||
    (prepared.targetProfile === "offchain-public-v1" &&
      executionStatus !== "notSubmitted")
  ) {
    return localIndeterminateAttempt(
      prepared,
      executionStatus,
      "transaction-unconfirmed-v1",
      "ledger",
    );
  }
  if (evaluation.decisionStatus === "policyDenied") {
    return {
      ...common,
      proofStatus: "valid",
      decisionStatus: "policyDenied",
      executionStatus: "notSubmitted",
    };
  }
  if (prepared.targetProfile === "offchain-public-v1") {
    return {
      ...common,
      targetProfile: "offchain-public-v1",
      proofStatus: "valid",
      decisionStatus: "approved",
      executionStatus: "notSubmitted",
    };
  }
  return {
    ...common,
    targetProfile: prepared.targetProfile,
    proofStatus: "valid",
    decisionStatus: "approved",
    executionStatus,
  };
};

const revalidateAfterCallback = (
  prepared: PreparedVerificationV1,
  expected: {
    readonly targetProfile: VerificationProfileV1;
    readonly transcriptDigest: Bytes32;
    readonly profileBinding: VerificationProfileBindingV1 | null;
  },
): PreparedVerificationV1 | null => {
  if (
    prepared.targetProfile !== expected.targetProfile ||
    !sameProfileBinding(prepared.profileBinding, expected.profileBinding)
  ) {
    return null;
  }
  const rebound = prepareVerificationWithBinding(
    expected.targetProfile,
    prepared.publicInputs,
    prepared.profileBinding,
  );
  if (
    rebound.kind !== "prepared-verification" ||
    !sameBytes(rebound.transcriptDigest, expected.transcriptDigest) ||
    profileCompatibilityFailure(rebound) !== null
  ) {
    return null;
  }
  return rebound;
};

const evaluateLocally = (
  prepared: PreparedVerificationV1,
  evaluator: VerificationV1LocalEvaluator,
): LocalVerificationAttemptV1 => {
  const resultPrepared = prepareVerificationWithBinding(
    prepared.targetProfile,
    prepared.publicInputs,
    prepared.profileBinding,
  );
  const evaluationPrepared = prepareVerificationWithBinding(
    prepared.targetProfile,
    prepared.publicInputs,
    prepared.profileBinding,
  );
  if (
    resultPrepared.kind !== "prepared-verification" ||
    evaluationPrepared.kind !== "prepared-verification"
  ) {
    return malformedAttempt(prepared.targetProfile, "malformed-input-v1");
  }
  const expected = {
    targetProfile: resultPrepared.targetProfile,
    transcriptDigest: asBytes32(resultPrepared.transcriptDigest),
    profileBinding: snapshotProfileBinding(resultPrepared.profileBinding),
  };
  let evaluation: VerificationEvaluationV1;
  try {
    evaluation = evaluator.evaluate(evaluationPrepared);
  } catch {
    return unavailableAttempt(
      resultPrepared,
      "provider-failure-v1",
      "verifier",
    );
  }
  const rebound = revalidateAfterCallback(evaluationPrepared, expected);
  if (rebound === null || !validEvaluation(rebound, evaluation)) {
    return localAttemptFromEvaluation(
      resultPrepared,
      {
        proofStatus: "invalid",
        decisionStatus: "notEvaluated",
        transcriptDigest: expected.transcriptDigest,
        failureStage: "verifier",
      },
      "notSubmitted",
      "verification-invalid-v1",
      "verifier",
    );
  }
  if (evaluation.decisionStatus === "replay") {
    return malformedAttempt(
      resultPrepared.targetProfile,
      "profile-mismatch-v1",
      expected.transcriptDigest,
    );
  }
  return localAttemptFromEvaluation(rebound, evaluation, "notSubmitted");
};

export const preflightVerification = (
  prepared: PreparedVerificationV1,
  evaluator?: VerificationV1LocalEvaluator,
): LocalVerificationAttemptV1 => {
  const refreshed = refreshPreparedVerification(prepared);
  if (refreshed.kind === "local-attempt") return refreshed;
  const incompatibility = profileCompatibilityFailure(refreshed);
  if (incompatibility !== null) return incompatibility;
  if (evaluator === undefined) {
    return unavailableAttempt(refreshed, "authority-unavailable-v1");
  }
  if (refreshed.unavailableEvidence.length > 0) {
    return unavailableAttempt(refreshed, "authority-unavailable-v1");
  }
  return evaluateLocally(refreshed, evaluator);
};

const anchorEvidenceDigest = (prepared: PreparedVerificationV1): Bytes32 =>
  hashAnchorEvidenceReceiptV1({
    domain: verificationDomainV1("anchorEvidenceReceipt"),
    version: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.issuerEvidence,
    ),
    trustEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.trustEvidence,
    ),
    statusEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.statusEvidence,
    ),
    timeEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.timeEvidence,
    ),
    artifactEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.artifactEvidence,
    ),
    connectorEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.connectorEvidence,
    ),
  });

const ledgerObservationStatuses: readonly LedgerExecutionObservationStatusV1[] =
  ["submitted", "included", "rejected", "reverted", "committed"];

const localExecutionStatus = (
  status: unknown,
): NoncommittedExecutionStatusV1 =>
  status === "submitted" ||
  status === "included" ||
  status === "rejected" ||
  status === "reverted"
    ? status
    : "notSubmitted";

const invalidLedgerObservation = (
  prepared: PreparedVerificationV1,
  failureStage: VerificationFailureStageV1,
  observedStatus?: unknown,
): LocalVerificationAttemptV1 =>
  localAttemptFromEvaluation(
    prepared,
    {
      proofStatus: "invalid",
      decisionStatus: "notEvaluated",
      transcriptDigest: prepared.transcriptDigest,
      failureStage,
    },
    localExecutionStatus(observedStatus),
    "transaction-invalid-v1",
    failureStage,
  );

export const submitLedgerVerification = async (
  prepared: PreparedVerificationV1,
  executor?: LedgerVerificationExecutorV1,
): Promise<VerificationResultV1> => {
  const refreshed = refreshPreparedVerification(prepared);
  if (refreshed.kind === "local-attempt") return refreshed;
  if (refreshed.targetProfile === "offchain-public-v1") {
    return malformedAttempt(
      refreshed.targetProfile,
      "profile-mismatch-v1",
      refreshed.transcriptDigest,
    );
  }
  const incompatibility = profileCompatibilityFailure(refreshed);
  if (incompatibility !== null) return incompatibility;
  if (executor === undefined) {
    return unavailableAttempt(refreshed, "ledger-adapter-unavailable-v1");
  }
  if (refreshed.unavailableEvidence.length > 0) {
    return unavailableAttempt(refreshed, "authority-unavailable-v1");
  }

  const expected = {
    targetProfile: refreshed.targetProfile,
    transcriptDigest: asBytes32(refreshed.transcriptDigest),
    profileBinding: snapshotProfileBinding(refreshed.profileBinding),
  };
  const expectedNullifier = asBytes32(
    refreshed.publicInputs.transcript.decisionNullifier,
  );
  const expectedAnchorEvidence = asBytes32(anchorEvidenceDigest(refreshed));
  const executionPrepared = prepareVerificationWithBinding(
    refreshed.targetProfile,
    refreshed.publicInputs,
    refreshed.profileBinding,
  );
  if (executionPrepared.kind !== "prepared-verification") {
    return invalidLedgerObservation(refreshed, "verifier");
  }

  let providerObservation: unknown;
  try {
    providerObservation = await executor.submit(executionPrepared);
  } catch {
    return unavailableAttempt(refreshed, "provider-failure-v1", "network");
  }
  const rebound = revalidateAfterCallback(executionPrepared, expected);
  let observedStatus: unknown;
  let observation: LedgerExecutionObservationV1;
  try {
    if (
      typeof providerObservation !== "object" ||
      providerObservation === null
    ) {
      return invalidLedgerObservation(refreshed, "artifact");
    }
    const candidate = providerObservation as LedgerExecutionObservationV1;
    observedStatus = candidate.executionStatus;
    if (
      rebound === null ||
      candidate.version !== 1 ||
      !ledgerObservationStatuses.includes(candidate.executionStatus) ||
      !validEvaluation(rebound, candidate.evaluation) ||
      !sameBytes(candidate.transcriptDigest, expected.transcriptDigest) ||
      !sameBytes(
        candidate.evaluation.transcriptDigest,
        expected.transcriptDigest,
      ) ||
      !sameBytes(candidate.anchorEvidenceDigest, expectedAnchorEvidence) ||
      !sameBytes(candidate.decisionNullifier, expectedNullifier) ||
      (candidate.atomicMutation !== "none" &&
        candidate.atomicMutation !== "committed")
    ) {
      return invalidLedgerObservation(refreshed, "artifact", observedStatus);
    }
    const safeEvaluation: VerificationEvaluationV1 =
      candidate.evaluation.proofStatus === "valid"
        ? Object.freeze({
            proofStatus: "valid" as const,
            decisionStatus: candidate.evaluation.decisionStatus,
            transcriptDigest: asBytes32(candidate.evaluation.transcriptDigest),
            authorityEvidence: candidate.evaluation.authorityEvidence,
          })
        : Object.freeze({
            proofStatus: candidate.evaluation.proofStatus,
            decisionStatus: "notEvaluated" as const,
            transcriptDigest: asBytes32(candidate.evaluation.transcriptDigest),
            failureStage: candidate.evaluation.failureStage,
          });
    observation = Object.freeze({
      version: 1 as const,
      executionStatus: candidate.executionStatus,
      evaluation: safeEvaluation,
      transcriptDigest: asBytes32(candidate.transcriptDigest),
      decisionNullifier: asBytes32(candidate.decisionNullifier),
      anchorEvidenceDigest: asBytes32(candidate.anchorEvidenceDigest),
      ...(candidate.transactionDigest === undefined
        ? {}
        : { transactionDigest: asBytes32(candidate.transactionDigest) }),
      atomicMutation: candidate.atomicMutation,
    });
  } catch {
    return invalidLedgerObservation(refreshed, "artifact", observedStatus);
  }

  if (observation.executionStatus !== "committed") {
    if (
      observation.atomicMutation !== "none" ||
      (observation.evaluation.proofStatus === "valid" &&
        observation.evaluation.decisionStatus !== "approved")
    ) {
      return invalidLedgerObservation(refreshed, "ledger", observedStatus);
    }
    const reasonCode =
      observation.executionStatus === "reverted"
        ? "transaction-reverted-v1"
        : observation.executionStatus === "rejected"
          ? "transaction-rejected-v1"
          : "transaction-unconfirmed-v1";
    return localAttemptFromEvaluation(
      rebound,
      observation.evaluation,
      localExecutionStatus(observation.executionStatus),
      reasonCode,
    );
  }

  if (
    !isBytes32(observation.transactionDigest) ||
    observation.transactionDigest.every((byte) => byte === 0) ||
    observation.evaluation.proofStatus !== "valid"
  ) {
    return invalidLedgerObservation(refreshed, "ledger", observedStatus);
  }

  if (
    observation.evaluation.decisionStatus === "replay" &&
    rebound.publicInputs.transcript.nullifierMode !== 1n
  ) {
    return invalidLedgerObservation(refreshed, "ledger", observedStatus);
  }
  const requiresMutation =
    rebound.publicInputs.transcript.nullifierMode === 1n &&
    observation.evaluation.decisionStatus === "approved";
  if (
    observation.atomicMutation !== (requiresMutation ? "committed" : "none")
  ) {
    return invalidLedgerObservation(refreshed, "ledger", observedStatus);
  }

  const receiptEvaluation = { ...observation.evaluation };
  const receiptTransactionDigest = asBytes32(observation.transactionDigest);
  const confirmationObservation: LedgerExecutionObservationV1 = Object.freeze({
    version: 1,
    executionStatus: "committed",
    evaluation: Object.freeze(receiptEvaluation),
    transcriptDigest: asBytes32(expected.transcriptDigest),
    decisionNullifier: asBytes32(expectedNullifier),
    anchorEvidenceDigest: asBytes32(expectedAnchorEvidence),
    transactionDigest: asBytes32(receiptTransactionDigest),
    atomicMutation: observation.atomicMutation,
  });
  const confirmationPrepared = prepareVerificationWithBinding(
    rebound.targetProfile,
    rebound.publicInputs,
    rebound.profileBinding,
  );
  if (confirmationPrepared.kind !== "prepared-verification") {
    return invalidLedgerObservation(refreshed, "verifier", observedStatus);
  }
  let confirmed: unknown = false;
  try {
    confirmed = await executor.confirmCommitted(
      confirmationObservation,
      confirmationPrepared,
    );
  } catch {
    confirmed = false;
  }
  const finalPrepared = revalidateAfterCallback(confirmationPrepared, expected);
  if (confirmed !== true || finalPrepared === null) {
    return localIndeterminateAttempt(
      refreshed,
      "included",
      "transaction-unconfirmed-v1",
      "ledger",
    );
  }

  const receipt: LedgerVerificationReceiptCommonV1 = {
    version: 1,
    kind: "ledger-receipt",
    proofStatus: "valid",
    decisionStatus: receiptEvaluation.decisionStatus,
    executionStatus: "committed",
    transcriptDigest: asBytes32(expected.transcriptDigest),
    decisionNullifier: asBytes32(expectedNullifier),
    anchorEvidenceDigest: asBytes32(expectedAnchorEvidence),
    transactionDigest: asBytes32(receiptTransactionDigest),
    atomicMutation: observation.atomicMutation,
  };
  return finalPrepared.targetProfile === "ledger-local-v1"
    ? { ...receipt, profile: "ledger-local-v1", authority: "ledger-local" }
    : {
        ...receipt,
        profile: "ledger-attested-v1",
        authority: "ledger-attested",
      };
};

export const verifyPublicOffchain = (
  prepared: PreparedVerificationV1,
  executor?: PublicVerificationExecutorV1,
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
  const incompatibility = profileCompatibilityFailure(refreshed);
  if (incompatibility !== null) return incompatibility;
  if (executor === undefined) {
    return unavailableAttempt(refreshed, "offchain-adapter-unavailable-v1");
  }
  if (refreshed.unavailableEvidence.length > 0) {
    return unavailableAttempt(refreshed, "authority-unavailable-v1");
  }
  return evaluateLocally(refreshed, executor.evaluator);
};

export const compareVerificationParityV1 = (
  paths: readonly {
    readonly pathId: string;
    readonly result: VerificationResultV1;
  }[],
): VerificationParityEvidenceV1 => {
  if (
    paths.length < 2 ||
    paths.some(
      ({ pathId }) => pathId.length === 0 || pathId.trim() !== pathId,
    ) ||
    new Set(paths.map(({ pathId }) => pathId)).size !== paths.length
  ) {
    throw new TypeError(
      "Verification parity requires at least two unique named paths",
    );
  }
  const proofStatus = paths[0].result.proofStatus;
  const decisionStatus = paths[0].result.decisionStatus;
  const diverged = paths.some(
    ({ result }) =>
      result.proofStatus !== proofStatus ||
      result.decisionStatus !== decisionStatus,
  );
  return {
    version: 1,
    status: diverged ? "diverged" : "equivalent",
    proofStatus: diverged ? null : proofStatus,
    decisionStatus: diverged ? null : decisionStatus,
    paths: paths.map(({ pathId, result }) => ({
      pathId,
      authority: result.authority,
      proofStatus: result.proofStatus,
      decisionStatus: result.decisionStatus,
    })),
  };
};
