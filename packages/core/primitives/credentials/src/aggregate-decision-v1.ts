import {
  type Alignment,
  type CompactType,
  CompactTypeBytes,
  CompactTypeUnsignedInteger,
  persistentHash,
  type Value,
} from "@midnight-ntwrk/compact-runtime";

import {
  type AggregateChildDecisionBindingV1,
  type AggregateChildSetV1,
  type AggregateDecisionNullifierMaterialV1,
  type AggregateDecisionTranscriptV1,
  type AggregateRequestBindingV1,
  type AggregateSameHolderBindingV1,
} from "./managed/aggregate-decision/contract/index.js";
import {
  type EvidenceBindingV1,
  pureCircuits as verificationPureCircuits,
} from "./managed/credentials/contract/index.js";
import {
  asBytes32,
  type Bytes32,
  hashAnchorEvidenceReceiptV1,
  hashEvidenceBindingV1,
  hashRequestReplayScopeV1,
  hashVerificationTranscriptV1,
  type PreparedVerificationV1,
  type VerificationAuthorityV1,
  type VerificationDecisionStatusV1,
  verificationDomainV1,
  type VerificationExecutionStatusV1,
  type VerificationFailureStageV1,
  type VerificationProofStatusV1,
  type VerificationReasonCodeV1,
  type VerificationResultV1,
  zeroBytes32V1,
} from "./verification-v1.js";

export type {
  AggregateChildDecisionBindingV1,
  AggregateChildSetV1,
  AggregateDecisionNullifierMaterialV1,
  AggregateDecisionTranscriptV1,
  AggregateRequestBindingV1,
  AggregateSameHolderBindingV1,
} from "./managed/aggregate-decision/contract/index.js";

export const AGGREGATE_DECISION_V1_DOMAIN_HEX = {
  childDecisionBinding:
    "94141e2076c15d2a8b734c62fadd56208069f62fd068b1902bfc5c4f05904849",
  childSet: "a3e825bc6f2091a5fae579e14dbf89882b71906a7e82916ad7dd0af5855b70e3",
  requestBinding:
    "0d847053b611b3559b511663120b51ae2610c1860f5838ed6351e90150fa347b",
  sameHolderBinding:
    "fe6e4e43abe9c6ea7aa50ec62df6dd2adbc7497ac2fc16562861151db90ebd7c",
  transcript:
    "9844f87dbfb39bcc55b7a4841f60480da17b9dfec6692cc172dd90477742184f",
  decisionNullifier:
    "b44e67f668e9ef2166240fd16820c68c35663dcf46b5b6c9583925f1cd7f0a9c",
} as const;

type OrderedField<A extends object> = {
  readonly key: keyof A;
  readonly descriptor: CompactType<unknown>;
};

class OrderedStructDescriptor<A extends object> implements CompactType<A> {
  constructor(readonly fields: readonly OrderedField<A>[]) {}

  alignment(): Alignment {
    return this.fields.reduce<Alignment>(
      (alignment, entry) => alignment.concat(entry.descriptor.alignment()),
      [],
    );
  }

  fromValue(value: Value): A {
    const result: Partial<Record<keyof A, unknown>> = {};
    for (const entry of this.fields) {
      result[entry.key] = entry.descriptor.fromValue(value);
    }
    return result as A;
  }

  toValue(value: A): Value {
    return this.fields.reduce<Value>(
      (encoded, entry) =>
        encoded.concat(entry.descriptor.toValue(value[entry.key])),
      [],
    );
  }
}

class ExactBytesDescriptor implements CompactType<Uint8Array> {
  private readonly descriptor: CompactTypeBytes;

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
): OrderedField<A> => ({ key, descriptor: descriptor as CompactType<unknown> });
const bytes32 = new ExactBytesDescriptor(32);
const uint8 = new CompactTypeUnsignedInteger(255n, 1);
const uint16 = new CompactTypeUnsignedInteger(65_535n, 2);
const uint64 = new CompactTypeUnsignedInteger(18_446_744_073_709_551_615n, 8);

const childDescriptor =
  new OrderedStructDescriptor<AggregateChildDecisionBindingV1>([
    field("domain", bytes32),
    field("version", uint16),
    field("familyDigest", bytes32),
    field("schemaDigest", bytes32),
    field("transcriptDigest", bytes32),
    field("anchorEvidenceDigest", bytes32),
    field("issuerDidDigest", bytes32),
    field("issuerMethodDigest", bytes32),
    field("issuerRelationship", uint8),
    field("issuerEvidenceDigest", bytes32),
    field("trustScopeDigest", bytes32),
    field("trustEvidenceDigest", bytes32),
    field("statusMode", uint8),
    field("statusRegistryDigest", bytes32),
    field("statusRoot", bytes32),
    field("statusRegistryVersion", uint64),
    field("statusFreshnessPolicyDigest", bytes32),
    field("statusEvidenceDigest", bytes32),
    field("timeMode", uint8),
    field("trustedTime", uint64),
    field("timeEvidenceDigest", bytes32),
    field("artifactManifestDigest", bytes32),
    field("artifactEvidenceDigest", bytes32),
    field("holderBindingDigest", bytes32),
    field("profile", uint8),
    field("resultKind", uint8),
    field("proofStatus", uint8),
    field("decisionStatus", uint8),
    field("executionStatus", uint8),
    field("authority", uint8),
    field("decisionNullifier", bytes32),
    field("transactionDigest", bytes32),
    field("atomicMutation", uint8),
  ]);

const childSetDescriptor = new OrderedStructDescriptor<AggregateChildSetV1>([
  field("domain", bytes32),
  field("version", uint16),
  field("childCount", uint8),
  field("firstChildDigest", bytes32),
  field("secondChildDigest", bytes32),
  field("thirdChildDigest", bytes32),
]);

const sameHolderDescriptor =
  new OrderedStructDescriptor<AggregateSameHolderBindingV1>([
    field("domain", bytes32),
    field("version", uint16),
    field("mode", uint8),
    field("verifierContractDigest", bytes32),
    field("challengeDigest", bytes32),
    field("childCount", uint8),
    field("firstHolderBindingDigest", bytes32),
    field("secondHolderBindingDigest", bytes32),
    field("thirdHolderBindingDigest", bytes32),
    field("childSetDigest", bytes32),
    field("proofDigest", bytes32),
  ]);

const requestDescriptor =
  new OrderedStructDescriptor<AggregateRequestBindingV1>([
    field("domain", bytes32),
    field("version", uint16),
    field("networkIdDigest", bytes32),
    field("verifierContractDigest", bytes32),
    field("deploymentDigest", bytes32),
    field("audienceDigest", bytes32),
    field("requestIdDigest", bytes32),
    field("challengeDigest", bytes32),
    field("expiresAt", uint64),
    field("policyDigest", bytes32),
    field("actionClassDigest", bytes32),
    field("actionInvocationDigest", bytes32),
    field("replayPolicy", uint8),
    field("replayScopeDigest", bytes32),
  ]);

const nullifierDescriptor =
  new OrderedStructDescriptor<AggregateDecisionNullifierMaterialV1>([
    field("domain", bytes32),
    field("version", uint16),
    field("deploymentDigest", bytes32),
    field("verifierContractDigest", bytes32),
    field("requestBindingDigest", bytes32),
    field("childSetDigest", bytes32),
    field("actionClassDigest", bytes32),
    field("actionInvocationDigest", bytes32),
    field("replayPolicy", uint8),
    field("replayScopeDigest", bytes32),
    field("sameHolderBindingDigest", bytes32),
    field("policyDigest", bytes32),
  ]);

const transcriptDescriptor =
  new OrderedStructDescriptor<AggregateDecisionTranscriptV1>([
    field("domain", bytes32),
    field("version", uint16),
    field("authority", uint8),
    field("childCount", uint8),
    field("requestBindingDigest", bytes32),
    field("childSetDigest", bytes32),
    field("sameHolderBindingDigest", bytes32),
    field("aggregateTrustedTime", uint64),
    field("nullifierMode", uint8),
    field("decisionNullifier", bytes32),
  ]);

const fromHex = (hex: string): Bytes32 => {
  if (!/^[0-9a-f]{64}$/u.test(hex)) throw new TypeError("Invalid domain hex");
  const value = new Uint8Array(32);
  for (let index = 0; index < value.length; index += 1) {
    value[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return asBytes32(value);
};

export type AggregateDecisionDomainV1 =
  keyof typeof AGGREGATE_DECISION_V1_DOMAIN_HEX;
export const aggregateDecisionDomainV1 = (
  domain: AggregateDecisionDomainV1,
): Bytes32 => fromHex(AGGREGATE_DECISION_V1_DOMAIN_HEX[domain]);

export const hashAggregateChildDecisionBindingV1 = (
  value: AggregateChildDecisionBindingV1,
): Bytes32 => asBytes32(persistentHash(childDescriptor, value));
export const hashAggregateChildSetV1 = (value: AggregateChildSetV1): Bytes32 =>
  asBytes32(persistentHash(childSetDescriptor, value));
export const hashAggregateSameHolderBindingV1 = (
  value: AggregateSameHolderBindingV1,
): Bytes32 => asBytes32(persistentHash(sameHolderDescriptor, value));
export const hashAggregateRequestBindingV1 = (
  value: AggregateRequestBindingV1,
): Bytes32 => asBytes32(persistentHash(requestDescriptor, value));
export const deriveAggregateDecisionNullifierV1 = (
  value: AggregateDecisionNullifierMaterialV1,
): Bytes32 => asBytes32(persistentHash(nullifierDescriptor, value));
export const hashAggregateDecisionTranscriptV1 = (
  value: AggregateDecisionTranscriptV1,
): Bytes32 => asBytes32(persistentHash(transcriptDescriptor, value));

const ensureBytes32 = (value: Uint8Array): Bytes32 => asBytes32(value);
const isZero = (value: Uint8Array): boolean =>
  value.every((byte) => byte === 0);
const same = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);
const compare = (left: Uint8Array, right: Uint8Array): number => {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
};
const compareChild = (
  left: AggregateChildDecisionBindingV1,
  right: AggregateChildDecisionBindingV1,
): number =>
  compare(left.familyDigest, right.familyDigest) ||
  compare(left.schemaDigest, right.schemaDigest) ||
  compare(left.transcriptDigest, right.transcriptDigest);

const proofCode = (status: VerificationProofStatusV1): bigint =>
  status === "malformed"
    ? 0n
    : status === "invalid"
      ? 1n
      : status === "indeterminate"
        ? 2n
        : 3n;
const decisionCode = (status: VerificationDecisionStatusV1): bigint =>
  status === "notEvaluated"
    ? 0n
    : status === "approved"
      ? 1n
      : status === "policyDenied"
        ? 2n
        : 3n;
const executionCode = (status: VerificationExecutionStatusV1): bigint => {
  const index = [
    "notSubmitted",
    "submitted",
    "included",
    "rejected",
    "reverted",
    "committed",
  ].indexOf(status);
  if (index < 0) throw new TypeError("Unknown execution status");
  return BigInt(index);
};
const authorityCode = (authority: VerificationAuthorityV1): bigint =>
  authority === "ledger-local" ? 1n : authority === "ledger-attested" ? 2n : 3n;
const authorityFromCode = (authority: bigint): VerificationAuthorityV1 =>
  authority === 1n
    ? "ledger-local"
    : authority === 2n
      ? "ledger-attested"
      : "local-process";
const profileCode = (prepared: PreparedVerificationV1): bigint =>
  prepared.targetProfile === "ledger-local-v1"
    ? 1n
    : prepared.targetProfile === "ledger-attested-v1"
      ? 2n
      : 3n;

const validChildResult = (
  prepared: PreparedVerificationV1,
  result: VerificationResultV1,
): boolean => {
  const proofStatuses: readonly VerificationProofStatusV1[] = [
    "malformed",
    "invalid",
    "indeterminate",
    "valid",
  ];
  const decisionStatuses: readonly VerificationDecisionStatusV1[] = [
    "notEvaluated",
    "approved",
    "policyDenied",
    "replay",
  ];
  const executionStatuses: readonly VerificationExecutionStatusV1[] = [
    "notSubmitted",
    "submitted",
    "included",
    "rejected",
    "reverted",
    "committed",
  ];
  if (
    result.version !== 1 ||
    !proofStatuses.includes(result.proofStatus) ||
    !decisionStatuses.includes(result.decisionStatus) ||
    !executionStatuses.includes(result.executionStatus) ||
    !same(result.transcriptDigest ?? zeroBytes32V1(), prepared.transcriptDigest)
  )
    return false;
  if (result.kind === "ledger-receipt") {
    const expectedAuthority =
      prepared.targetProfile === "ledger-local-v1"
        ? "ledger-local"
        : prepared.targetProfile === "ledger-attested-v1"
          ? "ledger-attested"
          : null;
    const expectedProfile =
      prepared.targetProfile === "offchain-public-v1"
        ? null
        : prepared.targetProfile;
    const requiresMutation =
      prepared.publicInputs.transcript.nullifierMode === 1n &&
      result.decisionStatus === "approved";
    return (
      expectedAuthority !== null &&
      result.profile === expectedProfile &&
      result.authority === expectedAuthority &&
      result.proofStatus === "valid" &&
      result.executionStatus === "committed" &&
      !isZero(result.transactionDigest) &&
      result.atomicMutation === (requiresMutation ? "committed" : "none") &&
      same(
        result.decisionNullifier,
        prepared.publicInputs.transcript.decisionNullifier,
      )
    );
  }
  if (
    result.kind !== "local-attempt" ||
    result.targetProfile !== prepared.targetProfile ||
    result.authority !== "local-process"
  )
    return false;
  if (result.proofStatus === "malformed") {
    return (
      result.decisionStatus === "notEvaluated" &&
      result.executionStatus === "notSubmitted"
    );
  }
  if (
    result.proofStatus === "invalid" ||
    result.proofStatus === "indeterminate"
  ) {
    return result.decisionStatus === "notEvaluated";
  }
  return prepared.targetProfile === "offchain-public-v1"
    ? result.executionStatus === "notSubmitted"
    : result.decisionStatus === "policyDenied"
      ? result.executionStatus === "notSubmitted"
      : true;
};

export interface AggregateDecisionChildInputV1 {
  readonly prepared: PreparedVerificationV1;
  readonly result: VerificationResultV1;
}

export interface AggregateDecisionInputV1 {
  readonly version: 1;
  readonly request: AggregateRequestBindingV1;
  readonly sameHolder: AggregateSameHolderBindingV1;
  readonly aggregateTrustedTime: bigint;
  readonly nullifierMode: 0n | 1n;
  readonly children: readonly AggregateDecisionChildInputV1[];
}

export type AggregateDecisionReasonCodeV1 =
  | "aggregate-malformed-v1"
  | "aggregate-authority-unavailable-v1"
  | "aggregate-child-receipt-unauthenticated-v1"
  | "aggregate-same-holder-unauthenticated-v1"
  | "aggregate-missing-child-v1"
  | "aggregate-duplicate-child-v1"
  | "aggregate-context-mismatch-v1"
  | "aggregate-result-mismatch-v1"
  | "aggregate-mixed-authority-v1"
  | "aggregate-child-invalid-v1"
  | "aggregate-child-indeterminate-v1"
  | "aggregate-child-denied-v1"
  | "aggregate-stale-evidence-v1"
  | "aggregate-same-holder-mismatch-v1"
  | "aggregate-atomicity-invalid-v1"
  | "aggregate-provider-failure-v1"
  | "aggregate-unconfirmed-v1";

export type AggregateAuthorityVerificationV1 =
  | "valid"
  | "invalid"
  | "indeterminate";

/** Deployment-injected authenticators; never select these from request data. */
export interface AggregateSameHolderProofStatementV1 {
  readonly holderBindingDigests: readonly Bytes32[];
  readonly childDigests: readonly Bytes32[];
  readonly childSetDigest: Bytes32;
}

export interface AggregateDecisionVerificationPortsV1 {
  /** Authenticates each ledger receipt before it can contribute authority. */
  readonly verifyChildResult: (
    child: AggregateDecisionChildInputV1,
  ) => AggregateAuthorityVerificationV1;
  /** Authenticates a proof receipt against the exact aggregate statement. */
  readonly verifySameHolder?: (
    binding: AggregateSameHolderBindingV1,
    statement: AggregateSameHolderProofStatementV1,
  ) => AggregateAuthorityVerificationV1;
}

export interface AggregateChildDiagnosticV1 {
  readonly familyDigest: Bytes32;
  readonly schemaDigest: Bytes32;
  readonly transcriptDigest: Bytes32;
  readonly proofStatus: VerificationProofStatusV1;
  readonly decisionStatus: VerificationDecisionStatusV1;
  readonly executionStatus: VerificationExecutionStatusV1;
  readonly authority: VerificationAuthorityV1;
  readonly reasonCode?: VerificationReasonCodeV1;
  readonly failureStage?: VerificationFailureStageV1;
}

export interface AggregateDecisionAttemptV1 {
  readonly version: 1;
  readonly kind: "aggregate-attempt";
  readonly classification: "malformed" | "invalid" | "indeterminate" | "denied";
  readonly authority: "none";
  readonly reasonCode: AggregateDecisionReasonCodeV1;
  readonly transcriptDigest?: Bytes32;
  readonly children: readonly AggregateChildDiagnosticV1[];
}

export interface PreparedAggregateDecisionSetV1 {
  readonly version: 1;
  readonly kind: "prepared-aggregate-decision";
  readonly authority: VerificationAuthorityV1;
  readonly request: AggregateRequestBindingV1;
  readonly sameHolder: AggregateSameHolderBindingV1;
  /** Immutable source snapshots revalidated at every executor boundary. */
  readonly sourceChildren: readonly AggregateDecisionChildInputV1[];
  readonly children: readonly AggregateChildDecisionBindingV1[];
  readonly childDiagnostics: readonly AggregateChildDiagnosticV1[];
  readonly childSet: AggregateChildSetV1;
  readonly nullifierMaterial: AggregateDecisionNullifierMaterialV1;
  readonly transcript: AggregateDecisionTranscriptV1;
  readonly transcriptDigest: Bytes32;
}

export type PrepareAggregateDecisionResultV1 =
  | PreparedAggregateDecisionSetV1
  | AggregateDecisionAttemptV1;

const diagnostic = ({
  prepared,
  result,
}: AggregateDecisionChildInputV1): AggregateChildDiagnosticV1 => ({
  familyDigest: ensureBytes32(
    prepared.publicInputs.transcript.credentialFamilyDigest,
  ),
  schemaDigest: ensureBytes32(prepared.publicInputs.transcript.schemaDigest),
  transcriptDigest: ensureBytes32(prepared.transcriptDigest),
  proofStatus: result.proofStatus,
  decisionStatus: result.decisionStatus,
  executionStatus: result.executionStatus,
  authority: result.authority,
  ...(result.kind === "local-attempt" && result.reasonCode !== undefined
    ? { reasonCode: result.reasonCode }
    : {}),
  ...(result.kind === "local-attempt" && result.failureStage !== undefined
    ? { failureStage: result.failureStage }
    : {}),
});

const attempt = (
  classification: AggregateDecisionAttemptV1["classification"],
  reasonCode: AggregateDecisionReasonCodeV1,
  children: readonly AggregateChildDiagnosticV1[],
  transcriptDigest?: Bytes32,
): AggregateDecisionAttemptV1 => ({
  version: 1,
  kind: "aggregate-attempt",
  classification,
  authority: "none",
  reasonCode,
  ...(transcriptDigest === undefined ? {} : { transcriptDigest }),
  children,
});

const evidenceFresh = (evidence: EvidenceBindingV1, now: bigint): boolean =>
  evidence.mode === 0n ||
  (evidence.mode >= 2n &&
    evidence.createdAt <= now &&
    now <= evidence.expiresAt);

const childBinding = (
  input: AggregateDecisionChildInputV1,
  now: bigint,
): AggregateChildDecisionBindingV1 | null => {
  const { prepared, result } = input;
  try {
    const { publicInputs } = prepared;
    const transcript = publicInputs.transcript;
    if (
      prepared.kind !== "prepared-verification" ||
      prepared.version !== 1 ||
      !same(
        hashVerificationTranscriptV1(transcript),
        prepared.transcriptDigest,
      ) ||
      !validChildResult(prepared, result)
    )
      return null;
    verificationPureCircuits.assertValidVerificationPublicInputsV1(
      publicInputs,
    );
    const anchorEvidenceDigest = hashAnchorEvidenceReceiptV1({
      domain: verificationDomainV1("anchorEvidenceReceipt"),
      version: 1n,
      issuerEvidenceDigest: hashEvidenceBindingV1(publicInputs.issuerEvidence),
      trustEvidenceDigest: hashEvidenceBindingV1(publicInputs.trustEvidence),
      statusEvidenceDigest: hashEvidenceBindingV1(publicInputs.statusEvidence),
      timeEvidenceDigest: hashEvidenceBindingV1(publicInputs.timeEvidence),
      artifactEvidenceDigest: hashEvidenceBindingV1(
        publicInputs.artifactEvidence,
      ),
      connectorEvidenceDigest: hashEvidenceBindingV1(
        publicInputs.connectorEvidence,
      ),
    });
    if (
      result.kind === "ledger-receipt" &&
      !same(result.anchorEvidenceDigest, anchorEvidenceDigest)
    )
      return null;
    if (
      !evidenceFresh(publicInputs.issuerEvidence, now) ||
      !evidenceFresh(publicInputs.trustEvidence, now) ||
      !evidenceFresh(publicInputs.statusEvidence, now) ||
      !evidenceFresh(publicInputs.timeEvidence, now) ||
      !evidenceFresh(publicInputs.artifactEvidence, now) ||
      !evidenceFresh(publicInputs.connectorEvidence, now)
    )
      return null;
    return {
      domain: aggregateDecisionDomainV1("childDecisionBinding"),
      version: 1n,
      familyDigest: ensureBytes32(transcript.credentialFamilyDigest),
      schemaDigest: ensureBytes32(transcript.schemaDigest),
      transcriptDigest: ensureBytes32(prepared.transcriptDigest),
      anchorEvidenceDigest,
      issuerDidDigest: ensureBytes32(transcript.issuerDidDigest),
      issuerMethodDigest: ensureBytes32(transcript.issuerMethodDigest),
      issuerRelationship: transcript.issuerRelationship,
      issuerEvidenceDigest: ensureBytes32(transcript.issuerEvidenceDigest),
      trustScopeDigest: ensureBytes32(transcript.trustScopeDigest),
      trustEvidenceDigest: ensureBytes32(transcript.trustEvidenceDigest),
      statusMode: transcript.statusMode,
      statusRegistryDigest: ensureBytes32(transcript.statusRegistryDigest),
      statusRoot: ensureBytes32(transcript.statusRoot),
      statusRegistryVersion: transcript.statusRegistryVersion,
      statusFreshnessPolicyDigest: ensureBytes32(
        transcript.statusFreshnessPolicyDigest,
      ),
      statusEvidenceDigest: ensureBytes32(transcript.statusEvidenceDigest),
      timeMode: transcript.timeMode,
      trustedTime: transcript.trustedTime,
      timeEvidenceDigest: ensureBytes32(transcript.timeEvidenceDigest),
      artifactManifestDigest: ensureBytes32(transcript.artifactManifestDigest),
      artifactEvidenceDigest: ensureBytes32(transcript.artifactEvidenceDigest),
      holderBindingDigest: ensureBytes32(transcript.holderBindingDigest),
      profile: profileCode(prepared),
      resultKind: result.kind === "ledger-receipt" ? 2n : 1n,
      proofStatus: proofCode(result.proofStatus),
      decisionStatus: decisionCode(result.decisionStatus),
      executionStatus: executionCode(result.executionStatus),
      authority: authorityCode(result.authority),
      decisionNullifier:
        result.kind === "ledger-receipt"
          ? ensureBytes32(result.decisionNullifier)
          : zeroBytes32V1(),
      transactionDigest:
        result.kind === "ledger-receipt"
          ? ensureBytes32(result.transactionDigest)
          : zeroBytes32V1(),
      atomicMutation:
        result.kind === "ledger-receipt" &&
        result.atomicMutation === "committed"
          ? 1n
          : 0n,
    };
  } catch {
    return null;
  }
};

const requestContextMatches = (
  prepared: PreparedVerificationV1,
  request: AggregateRequestBindingV1,
): boolean => {
  const child = prepared.publicInputs.transcript;
  return (
    same(child.networkIdDigest, request.networkIdDigest) &&
    same(child.verifierContractDigest, request.verifierContractDigest) &&
    same(child.deploymentDigest, request.deploymentDigest) &&
    same(child.audienceDigest, request.audienceDigest) &&
    same(child.requestIdDigest, request.requestIdDigest) &&
    same(child.challengeDigest, request.challengeDigest) &&
    child.expiresAt === request.expiresAt
  );
};

const requestReplayScopeDigest = (
  request: Omit<
    AggregateRequestBindingV1,
    "domain" | "version" | "replayScopeDigest"
  >,
): Bytes32 => {
  if (request.replayPolicy === 0n) return zeroBytes32V1();
  if (request.replayPolicy !== 1n) {
    throw new TypeError(
      "Aggregate decision v1 supports contract-derived request replay only",
    );
  }
  return hashRequestReplayScopeV1({
    domain: verificationDomainV1("replayScopeRequest"),
    version: 1n,
    deploymentDigest: request.deploymentDigest,
    verifierContractDigest: request.verifierContractDigest,
    requestIdDigest: request.requestIdDigest,
    challengeDigest: request.challengeDigest,
    actionInvocationDigest: request.actionInvocationDigest,
  });
};

const validRequest = (
  request: AggregateRequestBindingV1,
  nullifierMode: 0n | 1n,
): boolean => {
  try {
    if (
      !same(request.domain, aggregateDecisionDomainV1("requestBinding")) ||
      request.version !== 1n ||
      request.expiresAt <= 0n ||
      [
        request.networkIdDigest,
        request.verifierContractDigest,
        request.deploymentDigest,
        request.audienceDigest,
        request.requestIdDigest,
        request.challengeDigest,
        request.policyDigest,
      ].some(isZero)
    )
      return false;
    const expectedReplayScope = requestReplayScopeDigest(request);
    return (
      same(request.replayScopeDigest, expectedReplayScope) &&
      (nullifierMode === 0n
        ? request.replayPolicy === 0n &&
          isZero(request.actionClassDigest) &&
          isZero(request.actionInvocationDigest)
        : request.replayPolicy === 1n &&
          !isZero(request.actionClassDigest) &&
          !isZero(request.actionInvocationDigest))
    );
  } catch {
    return false;
  }
};

const validSameHolder = (
  binding: AggregateSameHolderBindingV1,
  request: AggregateRequestBindingV1,
  children: readonly AggregateChildDecisionBindingV1[],
  childSetDigest: Uint8Array,
): boolean => {
  if (
    !same(binding.domain, aggregateDecisionDomainV1("sameHolderBinding")) ||
    binding.version !== 1n
  )
    return false;
  if (binding.mode === 0n) {
    return (
      binding.childCount === 0n &&
      [
        binding.verifierContractDigest,
        binding.challengeDigest,
        binding.firstHolderBindingDigest,
        binding.secondHolderBindingDigest,
        binding.thirdHolderBindingDigest,
        binding.childSetDigest,
        binding.proofDigest,
      ].every(isZero)
    );
  }
  if (
    binding.mode !== 1n ||
    binding.childCount !== BigInt(children.length) ||
    !same(binding.verifierContractDigest, request.verifierContractDigest) ||
    !same(binding.challengeDigest, request.challengeDigest) ||
    !same(binding.childSetDigest, childSetDigest) ||
    isZero(binding.proofDigest)
  )
    return false;
  const expected = children
    .map((child) => child.holderBindingDigest)
    .sort(compare);
  return (
    same(binding.firstHolderBindingDigest, expected[0]) &&
    same(binding.secondHolderBindingDigest, expected[1]) &&
    (children.length === 2
      ? isZero(binding.thirdHolderBindingDigest)
      : same(binding.thirdHolderBindingDigest, expected[2]))
  );
};

export const createAggregateRequestBindingV1 = (
  input: Omit<
    AggregateRequestBindingV1,
    "domain" | "version" | "replayScopeDigest"
  >,
): AggregateRequestBindingV1 => ({
  domain: aggregateDecisionDomainV1("requestBinding"),
  version: 1n,
  ...input,
  replayScopeDigest: requestReplayScopeDigest(input),
});

export const createNoSameHolderBindingV1 =
  (): AggregateSameHolderBindingV1 => ({
    domain: aggregateDecisionDomainV1("sameHolderBinding"),
    version: 1n,
    mode: 0n,
    verifierContractDigest: zeroBytes32V1(),
    challengeDigest: zeroBytes32V1(),
    childCount: 0n,
    firstHolderBindingDigest: zeroBytes32V1(),
    secondHolderBindingDigest: zeroBytes32V1(),
    thirdHolderBindingDigest: zeroBytes32V1(),
    childSetDigest: zeroBytes32V1(),
    proofDigest: zeroBytes32V1(),
  });

export const createAggregateSameHolderBindingV1 = (input: {
  readonly verifierContractDigest: Uint8Array;
  readonly challengeDigest: Uint8Array;
  readonly childSetDigest: Uint8Array;
  readonly holderBindingDigests: readonly Uint8Array[];
  readonly proofDigest: Uint8Array;
}): AggregateSameHolderBindingV1 => {
  if (
    input.holderBindingDigests.length < 2 ||
    input.holderBindingDigests.length > 3
  ) {
    throw new TypeError(
      "Same-holder aggregate requires two or three child bindings",
    );
  }
  const holders = input.holderBindingDigests.map(ensureBytes32).sort(compare);
  if (
    holders.some((value, index) => index > 0 && same(value, holders[index - 1]))
  ) {
    throw new TypeError("Same-holder child bindings must be distinct");
  }
  return {
    domain: aggregateDecisionDomainV1("sameHolderBinding"),
    version: 1n,
    mode: 1n,
    verifierContractDigest: ensureBytes32(input.verifierContractDigest),
    challengeDigest: ensureBytes32(input.challengeDigest),
    childCount: BigInt(holders.length),
    firstHolderBindingDigest: holders[0],
    secondHolderBindingDigest: holders[1],
    thirdHolderBindingDigest: holders[2] ?? zeroBytes32V1(),
    childSetDigest: ensureBytes32(input.childSetDigest),
    proofDigest: ensureBytes32(input.proofDigest),
  };
};

const cloneAndFreeze = <T>(value: T): T => {
  const cloned = globalThis.structuredClone(value);
  const freeze = (entry: unknown): void => {
    if (
      typeof entry !== "object" ||
      entry === null ||
      entry instanceof Uint8Array ||
      Object.isFrozen(entry)
    ) {
      return;
    }
    for (const child of Object.values(entry)) freeze(child);
    Object.freeze(entry);
  };
  freeze(cloned);
  return cloned;
};

export const prepareAggregateDecisionSetV1 = (
  unsafeInput: AggregateDecisionInputV1,
  verification?: AggregateDecisionVerificationPortsV1,
): PrepareAggregateDecisionResultV1 => {
  let diagnostics: AggregateChildDiagnosticV1[] = [];
  try {
    const input = cloneAndFreeze(unsafeInput);
    diagnostics = Array.isArray(input.children)
      ? input.children.map(diagnostic)
      : [];
    if (
      input.version !== 1 ||
      input.children.length < 2 ||
      input.children.length > 3
    ) {
      return attempt("malformed", "aggregate-missing-child-v1", diagnostics);
    }
    if (
      !validRequest(input.request, input.nullifierMode) ||
      input.aggregateTrustedTime <= 0n ||
      input.aggregateTrustedTime > input.request.expiresAt
    ) {
      return attempt("invalid", "aggregate-context-mismatch-v1", diagnostics);
    }
    if (
      input.children.some(
        (child) => !requestContextMatches(child.prepared, input.request),
      )
    ) {
      return attempt("invalid", "aggregate-context-mismatch-v1", diagnostics);
    }
    const unavailable = input.children.some(
      ({ prepared }) =>
        prepared.unavailableEvidence.length > 0 ||
        [
          prepared.publicInputs.issuerEvidence,
          prepared.publicInputs.trustEvidence,
          prepared.publicInputs.statusEvidence,
          prepared.publicInputs.timeEvidence,
          prepared.publicInputs.artifactEvidence,
          prepared.publicInputs.connectorEvidence,
        ].some((evidence) => evidence.mode === 1n),
    );
    const indeterminate = diagnostics.some(
      (child) => child.proofStatus === "indeterminate",
    );
    if (unavailable || indeterminate) {
      return attempt(
        "indeterminate",
        "aggregate-child-indeterminate-v1",
        diagnostics,
      );
    }
    const invalid = diagnostics.some((child) => child.proofStatus !== "valid");
    if (invalid) {
      return attempt("invalid", "aggregate-child-invalid-v1", diagnostics);
    }
    const denied = diagnostics.some(
      (child) => child.decisionStatus === "policyDenied",
    );
    if (denied) {
      return attempt("denied", "aggregate-child-denied-v1", diagnostics);
    }
    const ledgerChildren = input.children.filter(
      (child) => child.result.kind === "ledger-receipt",
    );
    if (ledgerChildren.length > 0 && verification === undefined) {
      return attempt(
        "indeterminate",
        "aggregate-authority-unavailable-v1",
        diagnostics,
      );
    }
    const childAuthentication = ledgerChildren.map((child) => {
      try {
        return (
          verification?.verifyChildResult(cloneAndFreeze(child)) ??
          "indeterminate"
        );
      } catch {
        return "indeterminate" as const;
      }
    });
    if (childAuthentication.includes("indeterminate")) {
      return attempt(
        "indeterminate",
        "aggregate-child-receipt-unauthenticated-v1",
        diagnostics,
      );
    }
    if (childAuthentication.some((status) => status !== "valid")) {
      return attempt(
        "invalid",
        "aggregate-child-receipt-unauthenticated-v1",
        diagnostics,
      );
    }
    const children = input.children.map((child) =>
      childBinding(child, input.aggregateTrustedTime),
    );
    if (children.some((child) => child === null)) {
      const stale = input.children.some(({ prepared }) =>
        [
          prepared.publicInputs.issuerEvidence,
          prepared.publicInputs.trustEvidence,
          prepared.publicInputs.statusEvidence,
          prepared.publicInputs.timeEvidence,
          prepared.publicInputs.artifactEvidence,
          prepared.publicInputs.connectorEvidence,
        ].some(
          (evidence) =>
            evidence.mode >= 2n &&
            !evidenceFresh(evidence, input.aggregateTrustedTime),
        ),
      );
      return attempt(
        "invalid",
        stale ? "aggregate-stale-evidence-v1" : "aggregate-result-mismatch-v1",
        diagnostics,
      );
    }
    const ordered = (children as AggregateChildDecisionBindingV1[]).sort(
      compareChild,
    );
    const orderedDiagnostics = [...diagnostics].sort(
      (left, right) =>
        compare(left.familyDigest, right.familyDigest) ||
        compare(left.schemaDigest, right.schemaDigest) ||
        compare(left.transcriptDigest, right.transcriptDigest),
    );
    diagnostics = orderedDiagnostics;
    if (
      ordered.some(
        (child, index) =>
          index > 0 &&
          same(child.transcriptDigest, ordered[index - 1].transcriptDigest),
      )
    ) {
      return attempt("invalid", "aggregate-duplicate-child-v1", diagnostics);
    }
    const orderedSourceChildren = ordered.map((child) => {
      const source = input.children.find(({ prepared }) =>
        same(prepared.transcriptDigest, child.transcriptDigest),
      );
      if (source === undefined)
        throw new TypeError("Missing aggregate child source");
      return source;
    });
    const authorities = new Set(
      ordered.map((child) => child.authority.toString()),
    );
    if (authorities.size !== 1)
      return attempt("invalid", "aggregate-mixed-authority-v1", diagnostics);
    if (
      diagnostics.some(
        (child) =>
          child.decisionStatus !== "approved" &&
          child.decisionStatus !== "replay",
      )
    ) {
      return attempt("invalid", "aggregate-child-invalid-v1", diagnostics);
    }
    const childDigests = ordered.map(hashAggregateChildDecisionBindingV1);
    const childSet: AggregateChildSetV1 = {
      domain: aggregateDecisionDomainV1("childSet"),
      version: 1n,
      childCount: BigInt(ordered.length),
      firstChildDigest: childDigests[0],
      secondChildDigest: childDigests[1],
      thirdChildDigest: childDigests[2] ?? zeroBytes32V1(),
    };
    const requestBindingDigest = hashAggregateRequestBindingV1(input.request);
    const childSetDigest = hashAggregateChildSetV1(childSet);
    if (
      !validSameHolder(input.sameHolder, input.request, ordered, childSetDigest)
    ) {
      return attempt(
        "invalid",
        "aggregate-same-holder-mismatch-v1",
        diagnostics,
      );
    }
    if (input.sameHolder.mode === 1n) {
      let sameHolderAuthentication: AggregateAuthorityVerificationV1 =
        "indeterminate";
      const statement: AggregateSameHolderProofStatementV1 = cloneAndFreeze({
        holderBindingDigests: ordered.map((child) =>
          ensureBytes32(child.holderBindingDigest),
        ),
        childDigests: childDigests.map(ensureBytes32),
        childSetDigest: ensureBytes32(childSetDigest),
      });
      try {
        sameHolderAuthentication =
          verification?.verifySameHolder?.(
            cloneAndFreeze(input.sameHolder),
            statement,
          ) ?? "indeterminate";
      } catch {
        sameHolderAuthentication = "indeterminate";
      }
      if (sameHolderAuthentication !== "valid") {
        return attempt(
          sameHolderAuthentication === "invalid" ? "invalid" : "indeterminate",
          "aggregate-same-holder-unauthenticated-v1",
          diagnostics,
        );
      }
    }
    const sameHolderBindingDigest = hashAggregateSameHolderBindingV1(
      input.sameHolder,
    );
    const nullifierMaterial: AggregateDecisionNullifierMaterialV1 = {
      domain: aggregateDecisionDomainV1("decisionNullifier"),
      version: 1n,
      deploymentDigest: ensureBytes32(input.request.deploymentDigest),
      verifierContractDigest: ensureBytes32(
        input.request.verifierContractDigest,
      ),
      requestBindingDigest,
      childSetDigest,
      actionClassDigest: ensureBytes32(input.request.actionClassDigest),
      actionInvocationDigest: ensureBytes32(
        input.request.actionInvocationDigest,
      ),
      replayPolicy: input.request.replayPolicy,
      replayScopeDigest: ensureBytes32(input.request.replayScopeDigest),
      sameHolderBindingDigest,
      policyDigest: ensureBytes32(input.request.policyDigest),
    };
    const decisionNullifier =
      input.nullifierMode === 1n
        ? deriveAggregateDecisionNullifierV1(nullifierMaterial)
        : zeroBytes32V1();
    const authority = ordered[0].authority;
    if (input.nullifierMode === 1n && authority === 3n) {
      return attempt("invalid", "aggregate-context-mismatch-v1", diagnostics);
    }
    const transcript: AggregateDecisionTranscriptV1 = {
      domain: aggregateDecisionDomainV1("transcript"),
      version: 1n,
      authority,
      childCount: BigInt(ordered.length),
      requestBindingDigest,
      childSetDigest,
      sameHolderBindingDigest,
      aggregateTrustedTime: input.aggregateTrustedTime,
      nullifierMode: input.nullifierMode,
      decisionNullifier,
    };
    const transcriptDigest = hashAggregateDecisionTranscriptV1(transcript);
    return cloneAndFreeze({
      version: 1 as const,
      kind: "prepared-aggregate-decision" as const,
      authority: authorityFromCode(authority),
      request: input.request,
      sameHolder: input.sameHolder,
      sourceChildren: orderedSourceChildren,
      children: ordered,
      childDiagnostics: diagnostics,
      childSet,
      nullifierMaterial,
      transcript,
      transcriptDigest,
    });
  } catch {
    return attempt("malformed", "aggregate-malformed-v1", diagnostics);
  }
};

const validPreparedAggregate = (
  prepared: PreparedAggregateDecisionSetV1,
): boolean => {
  try {
    if (
      prepared.version !== 1 ||
      prepared.kind !== "prepared-aggregate-decision" ||
      prepared.children.length < 2 ||
      prepared.children.length > 3 ||
      !Array.isArray(prepared.sourceChildren) ||
      prepared.sourceChildren.length !== prepared.children.length ||
      prepared.childDiagnostics.length !== prepared.children.length ||
      (prepared.transcript.nullifierMode !== 0n &&
        prepared.transcript.nullifierMode !== 1n) ||
      !validRequest(
        prepared.request,
        prepared.transcript.nullifierMode as 0n | 1n,
      ) ||
      prepared.transcript.aggregateTrustedTime <= 0n ||
      prepared.transcript.aggregateTrustedTime > prepared.request.expiresAt ||
      (prepared.authority !== "ledger-local" &&
        prepared.authority !== "ledger-attested" &&
        prepared.authority !== "local-process")
    )
      return false;
    const expectedAuthority =
      prepared.authority === "ledger-local"
        ? 1n
        : prepared.authority === "ledger-attested"
          ? 2n
          : 3n;
    for (let index = 0; index < prepared.children.length; index += 1) {
      const child = prepared.children[index];
      const childDiagnostic = prepared.childDiagnostics[index];
      const ledgerReceipt = child.resultKind === 2n;
      const validLedgerReceipt =
        ledgerReceipt &&
        (child.profile === 1n || child.profile === 2n) &&
        child.authority === child.profile &&
        child.executionStatus === 5n &&
        !isZero(child.transactionDigest) &&
        (child.atomicMutation === 0n ||
          (child.atomicMutation === 1n &&
            child.decisionStatus === 1n &&
            !isZero(child.decisionNullifier)));
      const validLocalResult =
        child.resultKind === 1n &&
        child.authority === 3n &&
        child.executionStatus === 0n &&
        isZero(child.decisionNullifier) &&
        isZero(child.transactionDigest) &&
        child.atomicMutation === 0n;
      if (
        !same(
          child.domain,
          aggregateDecisionDomainV1("childDecisionBinding"),
        ) ||
        child.version !== 1n ||
        (index > 0 && compareChild(prepared.children[index - 1], child) >= 0) ||
        child.authority !== expectedAuthority ||
        child.proofStatus !== 3n ||
        (child.decisionStatus !== 1n && child.decisionStatus !== 3n) ||
        (!validLedgerReceipt && !validLocalResult) ||
        !same(childDiagnostic.familyDigest, child.familyDigest) ||
        !same(childDiagnostic.schemaDigest, child.schemaDigest) ||
        !same(childDiagnostic.transcriptDigest, child.transcriptDigest) ||
        proofCode(childDiagnostic.proofStatus) !== child.proofStatus ||
        decisionCode(childDiagnostic.decisionStatus) !== child.decisionStatus ||
        executionCode(childDiagnostic.executionStatus) !==
          child.executionStatus ||
        authorityCode(childDiagnostic.authority) !== child.authority ||
        childDiagnostic.reasonCode !==
          (prepared.sourceChildren[index].result.kind === "local-attempt"
            ? prepared.sourceChildren[index].result.reasonCode
            : undefined) ||
        childDiagnostic.failureStage !==
          (prepared.sourceChildren[index].result.kind === "local-attempt"
            ? prepared.sourceChildren[index].result.failureStage
            : undefined)
      )
        return false;
    }
    const childDigests = prepared.children.map(
      hashAggregateChildDecisionBindingV1,
    );
    if (
      !same(prepared.childSet.domain, aggregateDecisionDomainV1("childSet")) ||
      prepared.childSet.version !== 1n ||
      prepared.childSet.childCount !== BigInt(prepared.children.length) ||
      !same(prepared.childSet.firstChildDigest, childDigests[0]) ||
      !same(prepared.childSet.secondChildDigest, childDigests[1]) ||
      !(prepared.children.length === 2
        ? isZero(prepared.childSet.thirdChildDigest)
        : same(prepared.childSet.thirdChildDigest, childDigests[2])) ||
      !validSameHolder(
        prepared.sameHolder,
        prepared.request,
        prepared.children,
        hashAggregateChildSetV1(prepared.childSet),
      )
    )
      return false;
    const requestDigest = hashAggregateRequestBindingV1(prepared.request);
    const childSetDigest = hashAggregateChildSetV1(prepared.childSet);
    const sameHolderDigest = hashAggregateSameHolderBindingV1(
      prepared.sameHolder,
    );
    if (
      !same(
        prepared.nullifierMaterial.domain,
        aggregateDecisionDomainV1("decisionNullifier"),
      ) ||
      prepared.nullifierMaterial.version !== 1n ||
      !same(
        prepared.nullifierMaterial.deploymentDigest,
        prepared.request.deploymentDigest,
      ) ||
      !same(
        prepared.nullifierMaterial.verifierContractDigest,
        prepared.request.verifierContractDigest,
      ) ||
      !same(prepared.nullifierMaterial.requestBindingDigest, requestDigest) ||
      !same(prepared.nullifierMaterial.childSetDigest, childSetDigest) ||
      !same(
        prepared.nullifierMaterial.sameHolderBindingDigest,
        sameHolderDigest,
      ) ||
      !same(
        prepared.nullifierMaterial.actionClassDigest,
        prepared.request.actionClassDigest,
      ) ||
      !same(
        prepared.nullifierMaterial.actionInvocationDigest,
        prepared.request.actionInvocationDigest,
      ) ||
      prepared.nullifierMaterial.replayPolicy !==
        prepared.request.replayPolicy ||
      !same(
        prepared.nullifierMaterial.replayScopeDigest,
        prepared.request.replayScopeDigest,
      ) ||
      !same(
        prepared.nullifierMaterial.policyDigest,
        prepared.request.policyDigest,
      )
    )
      return false;
    const expectedNullifier =
      prepared.transcript.nullifierMode === 1n
        ? deriveAggregateDecisionNullifierV1(prepared.nullifierMaterial)
        : zeroBytes32V1();
    return (
      same(
        prepared.transcript.domain,
        aggregateDecisionDomainV1("transcript"),
      ) &&
      prepared.transcript.version === 1n &&
      prepared.transcript.authority === expectedAuthority &&
      prepared.transcript.childCount === BigInt(prepared.children.length) &&
      same(prepared.transcript.requestBindingDigest, requestDigest) &&
      same(prepared.transcript.childSetDigest, childSetDigest) &&
      same(prepared.transcript.sameHolderBindingDigest, sameHolderDigest) &&
      same(prepared.transcript.decisionNullifier, expectedNullifier) &&
      same(
        prepared.transcriptDigest,
        hashAggregateDecisionTranscriptV1(prepared.transcript),
      )
    );
  } catch {
    return false;
  }
};

const sameDiagnostic = (
  left: AggregateChildDiagnosticV1,
  right: AggregateChildDiagnosticV1,
): boolean =>
  same(left.familyDigest, right.familyDigest) &&
  same(left.schemaDigest, right.schemaDigest) &&
  same(left.transcriptDigest, right.transcriptDigest) &&
  left.proofStatus === right.proofStatus &&
  left.decisionStatus === right.decisionStatus &&
  left.executionStatus === right.executionStatus &&
  left.authority === right.authority &&
  left.reasonCode === right.reasonCode &&
  left.failureStage === right.failureStage;

const refreshPreparedAggregate = (
  prepared: PreparedAggregateDecisionSetV1,
  verification?: AggregateDecisionVerificationPortsV1,
): PreparedAggregateDecisionSetV1 | null => {
  try {
    if (!validPreparedAggregate(prepared)) return null;
    const rebound = prepareAggregateDecisionSetV1(
      {
        version: 1,
        request: prepared.request,
        sameHolder: prepared.sameHolder,
        aggregateTrustedTime: prepared.transcript.aggregateTrustedTime,
        nullifierMode: prepared.transcript.nullifierMode as 0n | 1n,
        children: prepared.sourceChildren,
      },
      verification,
    );
    if (
      rebound.kind !== "prepared-aggregate-decision" ||
      rebound.authority !== prepared.authority ||
      !same(rebound.transcriptDigest, prepared.transcriptDigest) ||
      rebound.children.length !== prepared.children.length ||
      rebound.children.some(
        (child, index) =>
          !same(
            hashAggregateChildDecisionBindingV1(child),
            hashAggregateChildDecisionBindingV1(prepared.children[index]),
          ) ||
          !sameDiagnostic(
            rebound.childDiagnostics[index],
            prepared.childDiagnostics[index],
          ),
      )
    ) {
      return null;
    }
    return rebound;
  } catch {
    return null;
  }
};

export interface AggregateLedgerExecutionObservationV1 {
  readonly version: 1;
  readonly executionStatus:
    | "submitted"
    | "included"
    | "rejected"
    | "reverted"
    | "committed";
  readonly classification: "approved" | "replay";
  readonly authority: "ledger-local" | "ledger-attested";
  readonly transcriptDigest: Bytes32;
  readonly decisionNullifier: Bytes32;
  readonly transactionDigest?: Bytes32;
  readonly atomicMutation: "none" | "committed";
}

export interface AggregateDecisionExecutorV1 {
  submit(prepared: PreparedAggregateDecisionSetV1): Promise<unknown>;
  confirmCommitted(
    observation: AggregateLedgerExecutionObservationV1,
    prepared: PreparedAggregateDecisionSetV1,
  ): Promise<boolean>;
}

export interface AggregateLedgerReceiptV1 {
  readonly version: 1;
  readonly kind: "aggregate-ledger-receipt";
  readonly classification: "approved" | "replay";
  readonly authority: "ledger-local" | "ledger-attested";
  readonly executionStatus: "committed";
  readonly transcriptDigest: Bytes32;
  readonly decisionNullifier: Bytes32;
  readonly transactionDigest: Bytes32;
  readonly atomicMutation: "none" | "committed";
  readonly children: readonly AggregateChildDiagnosticV1[];
}

const snapshotDiagnostics = (
  children: readonly AggregateChildDiagnosticV1[],
): readonly AggregateChildDiagnosticV1[] =>
  Object.freeze(
    children.map((child) =>
      Object.freeze({
        ...child,
        familyDigest: asBytes32(Uint8Array.from(child.familyDigest)),
        schemaDigest: asBytes32(Uint8Array.from(child.schemaDigest)),
        transcriptDigest: asBytes32(Uint8Array.from(child.transcriptDigest)),
      }),
    ),
  );

const normalizeAggregateObservation = (
  value: unknown,
): AggregateLedgerExecutionObservationV1 | null => {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return null;
    }
    const candidate = value as Record<string, unknown>;
    if (
      candidate.version !== 1 ||
      (candidate.executionStatus !== "submitted" &&
        candidate.executionStatus !== "included" &&
        candidate.executionStatus !== "rejected" &&
        candidate.executionStatus !== "reverted" &&
        candidate.executionStatus !== "committed") ||
      (candidate.classification !== "approved" &&
        candidate.classification !== "replay") ||
      (candidate.authority !== "ledger-local" &&
        candidate.authority !== "ledger-attested") ||
      (candidate.atomicMutation !== "none" &&
        candidate.atomicMutation !== "committed") ||
      !(candidate.transcriptDigest instanceof Uint8Array) ||
      candidate.transcriptDigest.length !== 32 ||
      !(candidate.decisionNullifier instanceof Uint8Array) ||
      candidate.decisionNullifier.length !== 32 ||
      (candidate.transactionDigest !== undefined &&
        (!(candidate.transactionDigest instanceof Uint8Array) ||
          candidate.transactionDigest.length !== 32))
    ) {
      return null;
    }
    return Object.freeze({
      version: 1 as const,
      executionStatus: candidate.executionStatus,
      classification: candidate.classification,
      authority: candidate.authority,
      transcriptDigest: asBytes32(Uint8Array.from(candidate.transcriptDigest)),
      decisionNullifier: asBytes32(
        Uint8Array.from(candidate.decisionNullifier),
      ),
      ...(candidate.transactionDigest === undefined
        ? {}
        : {
            transactionDigest: asBytes32(
              Uint8Array.from(candidate.transactionDigest),
            ),
          }),
      atomicMutation: candidate.atomicMutation,
    });
  } catch {
    return null;
  }
};

export const submitAggregateDecisionSetV1 = async (
  prepared: PreparedAggregateDecisionSetV1,
  executor?: AggregateDecisionExecutorV1,
  verification?: AggregateDecisionVerificationPortsV1,
): Promise<AggregateLedgerReceiptV1 | AggregateDecisionAttemptV1> => {
  const refreshed = refreshPreparedAggregate(prepared, verification);
  if (refreshed === null) {
    return attempt(
      "invalid",
      "aggregate-result-mismatch-v1",
      snapshotDiagnostics(prepared.childDiagnostics ?? []),
    );
  }
  const diagnostics = snapshotDiagnostics(refreshed.childDiagnostics);
  const expectedTranscriptDigest = asBytes32(
    Uint8Array.from(refreshed.transcriptDigest),
  );
  const expectedNullifier = asBytes32(
    Uint8Array.from(refreshed.transcript.decisionNullifier),
  );
  if (refreshed.authority === "local-process" || executor === undefined) {
    return attempt(
      "indeterminate",
      "aggregate-provider-failure-v1",
      diagnostics,
      expectedTranscriptDigest,
    );
  }

  const executionPrepared = cloneAndFreeze(refreshed);
  let providerObservation: unknown;
  try {
    providerObservation = await executor.submit(executionPrepared);
  } catch {
    return attempt(
      "indeterminate",
      "aggregate-provider-failure-v1",
      diagnostics,
      expectedTranscriptDigest,
    );
  }
  const rebound = refreshPreparedAggregate(executionPrepared, verification);
  const observation = normalizeAggregateObservation(providerObservation);
  const exact =
    rebound !== null &&
    observation !== null &&
    observation.authority === refreshed.authority &&
    same(observation.transcriptDigest, expectedTranscriptDigest) &&
    same(observation.decisionNullifier, expectedNullifier);
  if (
    !exact ||
    observation.executionStatus !== "committed" ||
    observation.transactionDigest === undefined ||
    isZero(observation.transactionDigest) ||
    observation.atomicMutation !==
      (observation.classification === "approved" &&
      refreshed.transcript.nullifierMode === 1n
        ? "committed"
        : "none") ||
    (observation.classification === "replay" &&
      refreshed.transcript.nullifierMode !== 1n)
  ) {
    return attempt(
      "invalid",
      "aggregate-atomicity-invalid-v1",
      diagnostics,
      expectedTranscriptDigest,
    );
  }

  const receiptClassification = observation.classification;
  const receiptAuthority = observation.authority;
  const receiptTransactionDigest = asBytes32(
    Uint8Array.from(observation.transactionDigest),
  );
  const receiptAtomicMutation = observation.atomicMutation;
  const confirmationObservation = cloneAndFreeze({
    ...observation,
    transcriptDigest: expectedTranscriptDigest,
    decisionNullifier: expectedNullifier,
    transactionDigest: receiptTransactionDigest,
  });
  const confirmationPrepared = cloneAndFreeze(rebound);
  let confirmed: unknown = false;
  try {
    confirmed = await executor.confirmCommitted(
      confirmationObservation,
      confirmationPrepared,
    );
  } catch {
    confirmed = false;
  }

  const finalPrepared = refreshPreparedAggregate(
    confirmationPrepared,
    verification,
  );
  const finalObservation = normalizeAggregateObservation(
    confirmationObservation,
  );
  const confirmationUnchanged =
    finalObservation !== null &&
    finalObservation.executionStatus === "committed" &&
    finalObservation.classification === receiptClassification &&
    finalObservation.authority === receiptAuthority &&
    finalObservation.atomicMutation === receiptAtomicMutation &&
    finalObservation.transactionDigest !== undefined &&
    same(finalObservation.transcriptDigest, expectedTranscriptDigest) &&
    same(finalObservation.decisionNullifier, expectedNullifier) &&
    same(finalObservation.transactionDigest, receiptTransactionDigest);
  if (confirmed !== true || finalPrepared === null || !confirmationUnchanged) {
    return attempt(
      "indeterminate",
      "aggregate-unconfirmed-v1",
      diagnostics,
      expectedTranscriptDigest,
    );
  }

  return Object.freeze({
    version: 1 as const,
    kind: "aggregate-ledger-receipt" as const,
    classification: receiptClassification,
    authority: receiptAuthority,
    executionStatus: "committed" as const,
    transcriptDigest: expectedTranscriptDigest,
    decisionNullifier: expectedNullifier,
    transactionDigest: receiptTransactionDigest,
    atomicMutation: receiptAtomicMutation,
    children: diagnostics,
  });
};
