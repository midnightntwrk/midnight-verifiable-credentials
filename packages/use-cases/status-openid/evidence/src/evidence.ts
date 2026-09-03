import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  computeTrustedTimeAnchorDigestV1,
  computeTrustedTimeEvidenceDigestV1,
  computeTrustedTimeStatementDigestV1,
  type TrustedTimeCheckpointV1,
  type TrustedTimeEvidenceV1,
  type TrustedTimePolicyV1,
  type TrustedTimeScopeV1,
  type TrustedTimeVerificationResultV1,
  verifyTrustedTimeEvidenceV1,
} from "@midnight-ntwrk/credential-proofs";
import {
  computeStatusRecordDigestV1,
  computeStatusRegistryRootV1,
  type StatusRegistryBindingV1,
  type StatusRegistryStateV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";
import {
  deriveStatusHandleDigestV1,
  type StatusEvidenceVerificationResultV1,
  verifySameContractStatusV1,
} from "@midnight-ntwrk/credential-status-midnight-verifier";
import {
  type AnchorEvidenceReceiptV1,
  asBytes32,
  type AuthenticatedVerificationProfileIdentityV1,
  type ConsentBindingV1,
  type CredentialBindingV1,
  deriveRequestDecisionNullifierV1,
  type EvidenceBindingV1,
  hashAnchorEvidenceReceiptV1,
  hashConsentBindingV1,
  hashCredentialBindingV1,
  hashEvidenceBindingV1,
  hashHolderBindingV1,
  hashPresentationBindingV1,
  hashRequestReplayScopeV1,
  type HolderBindingV1,
  type LedgerVerificationExecutorV1,
  prepareVerification,
  type PresentationBindingV1,
  submitLedgerVerification,
  verificationDomainV1,
  type VerificationPublicInputsV1,
  type VerificationResultV1,
} from "@midnight-ntwrk/midnight-did-credentials";
import {
  type IssuanceProofVerifier,
  MIDNIGHT_OPENID_PROFILE_V1,
  type MidnightProfileValidationPorts,
  type OAuthAccessTokenValidator,
  OID4VCI_1_0_FINAL,
  OID4VP_1_0_FINAL,
  type OpenIdConsentVerifier,
  type OpenIdReplayStore,
  type RequestObjectHttpClient,
  resolveAndValidateRequestObject,
  validateMidnightCredentialRequest,
  validateMidnightCredentialResponse,
  validateMidnightVpRequest,
  validateMidnightVpResponse,
} from "@midnight-ntwrk/midnight-did-credentials-openid";

import { resolveStatusOpenIdEvidenceProfile, STATUS_OPENID_EVIDENCE_PROFILE } from "./profile.js";
import {
  InMemoryStatusOpenIdEvidenceStore,
  type StoredDecisionInput,
  type StoredDecisionResult,
} from "./store.js";

const NOW = 1_800_000_000;
const STATUS_MAX_AGE = 60;
const ACTORS = Object.freeze({
  issuer: "Northstar Safety Board",
  holder: "Avery Chen (synthetic contractor)",
  statusOperator: "Northstar Credential Operations",
  verifier: "Harbor Plant Access Control",
});
const ISSUER_DID = "did:midnight:synthetic:northstar-safety-board";
const HOLDER_DID = "did:midnight:synthetic:avery-chen";
const STATUS_DID = "did:midnight:synthetic:status-operator";
const VERIFIER_DID = "did:midnight:synthetic:harbor-gate";
const ISSUER_AUDIENCE = "https://issuer.synthetic.example/credential";
const VERIFIER_ORIGIN = "https://gate.synthetic.example";
const RESPONSE_URI = `${VERIFIER_ORIGIN}/callback`;
const REQUEST_OBJECT_URI = `${VERIFIER_ORIGIN}/request.jwt`;
const DCQL_ID = "active-safety-credential";

const digest = (value: unknown): Uint8Array =>
  new Uint8Array(createHash("sha256").update(
    value instanceof Uint8Array
      ? value
      : typeof value === "string"
        ? value
        : JSON.stringify(value),
  ).digest());
const digestB64 = (value: unknown): string => Buffer.from(digest(value)).toString("base64url");
const digestRef = (value: unknown): `sha256:${string}` => `sha256:${Buffer.from(digest(value)).toString("hex")}`;
const refBytes = (value: `sha256:${string}`): Uint8Array => new Uint8Array(Buffer.from(value.slice(7), "hex"));

export type StatusScenario = "active" | "revoked" | "unavailable" | "stale" | "future" | "forged-root";
export type OpenIdMutation =
  | "issuance-audience"
  | "issuance-nonce"
  | "issuance-request-digest"
  | "presentation-audience"
  | "presentation-nonce"
  | "origin"
  | "request-digest"
  | "response-uri"
  | "redirect"
  | "ssrf"
  | "dcql";
export type EvidenceStage = "profile" | "network" | "process" | "proof" | "storage" | "key-custody" | "status" | "time" | "verification";

export type StatusOpenIdAuditEvent = {
  readonly correlationId: string;
  readonly stage: EvidenceStage;
  readonly outcome: "started" | "succeeded" | "failed";
  readonly detail?: string;
};

export interface StatusOpenIdAuditSink {
  record(event: StatusOpenIdAuditEvent): void;
}

export class InMemoryStatusOpenIdAuditSink implements StatusOpenIdAuditSink {
  readonly #events: StatusOpenIdAuditEvent[] = [];
  record(event: StatusOpenIdAuditEvent): void { this.#events.push({ ...event }); }
  snapshot(): readonly StatusOpenIdAuditEvent[] { return this.#events.map((event) => ({ ...event })); }
}

export interface StatusOpenIdNetworkPort {
  exchange(stage: "request" | "issuance" | "status" | "presentation"): Promise<void> | void;
  fetchRequestObject(input: Parameters<RequestObjectHttpClient["get"]>[0]): Promise<{
    readonly status: number;
    readonly finalUrl: string;
    readonly contentType: string;
    readonly remoteAddress: string;
    readonly body: Uint8Array;
  }>;
}

export interface StatusOpenIdProcessPort {
  execute<T>(operation: () => Promise<T>): Promise<T>;
}

export interface StatusOpenIdProofPort {
  verifyIssuanceProof(proof: string): Promise<{ readonly audience: string; readonly c_nonce: string; readonly request_digest: string }>;
  verifyPresentation(presentation: unknown): Promise<boolean>;
}

export interface StatusOpenIdKeyCustodyPort {
  sign(input: { readonly keyId: string; readonly payloadDigest: string }): Promise<{ readonly keyId: string; readonly signature: string }>;
  describe(): { readonly providerId: string; readonly isolated: boolean };
}

export interface StatusOpenIdStatusPort {
  readState(input: { readonly statusHandleDigest: `sha256:${string}`; readonly scenario: StatusScenario }): Promise<{ readonly state: StatusRegistryStateV1; readonly observedAt: number }>;
}

export interface StatusOpenIdTrustedTimePort {
  verify(input: {
    readonly scope: TrustedTimeScopeV1;
    readonly policy: TrustedTimePolicyV1;
    readonly evidence: TrustedTimeEvidenceV1;
    readonly previousCheckpoint: TrustedTimeCheckpointV1 | null;
  }): Promise<TrustedTimeVerificationResultV1>;
}

export interface StatusOpenIdEvidenceStore extends OpenIdReplayStore {
  commitIssuance<T>(key: string, digest: string, value: T): Promise<{ readonly classification: "applied" | "replay"; readonly value: T }>;
  readIssuance<T>(key: string, digest: string): { readonly classification: "replay"; readonly value: T } | null;
  commitDecision(input: StoredDecisionInput): Promise<StoredDecisionResult>;
  hasDecision(nullifier: Uint8Array, transaction: Uint8Array): boolean;
  trustedTimeCheckpoint(): TrustedTimeCheckpointV1 | null;
  commitTrustedTimeCheckpoint(checkpoint: TrustedTimeCheckpointV1): Promise<void>;
}

export type StatusOpenIdEvidencePorts = {
  readonly network?: StatusOpenIdNetworkPort;
  readonly process?: StatusOpenIdProcessPort;
  readonly proof?: StatusOpenIdProofPort;
  readonly store?: StatusOpenIdEvidenceStore;
  readonly keyCustody?: StatusOpenIdKeyCustodyPort;
  readonly status?: StatusOpenIdStatusPort;
  readonly trustedTime?: StatusOpenIdTrustedTimePort;
  readonly verificationExecutor?: LedgerVerificationExecutorV1;
  readonly audit?: StatusOpenIdAuditSink;
};

class SyntheticNetwork implements StatusOpenIdNetworkPort {
  exchange(): void {}
  async fetchRequestObject(input: Parameters<RequestObjectHttpClient["get"]>[0]) {
    return {
      status: 200,
      finalUrl: input.uri,
      contentType: "application/oauth-authz-req+jwt",
      remoteAddress: "8.8.8.8",
      body: new TextEncoder().encode("synthetic-signed-request-object"),
    };
  }
}

class InlineProcess implements StatusOpenIdProcessPort {
  execute<T>(operation: () => Promise<T>): Promise<T> { return operation(); }
}

class SyntheticProof implements StatusOpenIdProofPort {
  constructor(private readonly requestDigest: string) {}
  async verifyIssuanceProof(): Promise<{ audience: string; c_nonce: string; request_digest: string }> {
    return { audience: ISSUER_AUDIENCE, c_nonce: "issuer-c-nonce", request_digest: this.requestDigest };
  }
  async verifyPresentation(): Promise<boolean> { return true; }
}

class IsolatedSyntheticCustody implements StatusOpenIdKeyCustodyPort {
  async sign(input: { keyId: string; payloadDigest: string }): Promise<{ keyId: string; signature: string }> {
    return { keyId: input.keyId, signature: digestB64({ domain: "isolated-signing-adapter", ...input }) };
  }
  describe() { return { providerId: "synthetic-isolated-kms", isolated: true } as const; }
}

const STATUS_BINDING: StatusRegistryBindingV1 = {
  formatVersion: 1,
  network: "midnight:synthetic",
  namespace: "synthetic-contractor-safety:revoked-set",
  registryId: "registry:synthetic-contractor-safety:v1",
  deployment: "contract:synthetic-status-registry:v1",
};

class SyntheticStatus implements StatusOpenIdStatusPort {
  async readState(input: { statusHandleDigest: `sha256:${string}`; scenario: StatusScenario }) {
    const revoked = input.scenario === "revoked" ? [input.statusHandleDigest] : [];
    const state: StatusRegistryStateV1 = {
      formatVersion: 1,
      binding: STATUS_BINDING,
      initialized: input.scenario !== "unavailable",
      controllerDid: input.scenario === "unavailable" ? null : STATUS_DID,
      authorityGeneration: 1,
      registryVersion: 7,
      revokedStatusHandleCount: revoked.length,
      revokedRoot: computeStatusRegistryRootV1(revoked),
      acceptedAuthorizationCount: 4,
      auditSequence: 4,
      auditCommitment: digestRef("synthetic-status-audit-v4"),
      revokedStatusHandleDigests: revoked,
    };
    return {
      state: input.scenario === "forged-root" ? { ...state, revokedRoot: digestRef("forged-root") } : state,
      observedAt: input.scenario === "stale"
        ? NOW - STATUS_MAX_AGE - 1
        : input.scenario === "future"
          ? NOW + 1
          : NOW,
    };
  }
}

class SyntheticTrustedTime implements StatusOpenIdTrustedTimePort {
  verify(input: {
    scope: TrustedTimeScopeV1;
    policy: TrustedTimePolicyV1;
    evidence: TrustedTimeEvidenceV1;
    previousCheckpoint: TrustedTimeCheckpointV1 | null;
  }) {
    return verifyTrustedTimeEvidenceV1({
      ...input,
      anchorVerifier: {
        verify: async ({ evidence }) => ({ status: "valid", currentTime: evidence.anchor.time, anchorDigest: evidence.anchorDigest }),
      },
    });
  }
}

const acceptedEvidence = (
  domain: "issuerEvidence" | "trustEvidence" | "statusEvidence" | "timeEvidence" | "artifactEvidence",
  subject: unknown,
  anchor: unknown,
  mode: 2n | 4n = 2n,
): EvidenceBindingV1 => ({
  domain: verificationDomainV1(domain),
  version: 1n,
  mode,
  authorityDigest: digest(`${domain}:synthetic-authority`),
  subjectDigest: digest(subject),
  stateAnchorDigest: digest(anchor),
  statementDigest: digest({ domain, subject, anchor }),
  createdAt: BigInt(NOW),
  expiresAt: BigInt(NOW + 300),
});

const notRequiredConnector = (): EvidenceBindingV1 => ({
  domain: verificationDomainV1("connectorEvidence"), version: 1n, mode: 0n,
  authorityDigest: new Uint8Array(32), subjectDigest: new Uint8Array(32), stateAnchorDigest: new Uint8Array(32),
  statementDigest: new Uint8Array(32), createdAt: 0n, expiresAt: 0n,
});

const createTrustedTime = async (
  requestId: string,
  sequence: number,
): Promise<{ scope: TrustedTimeScopeV1; policy: TrustedTimePolicyV1; evidence: TrustedTimeEvidenceV1 }> => {
  const scope: TrustedTimeScopeV1 = {
    network: STATUS_BINDING.network,
    deployment: STATUS_BINDING.deployment,
    requestDigest: digestRef(requestId),
    challengeDigest: digestRef(`challenge:${requestId}`),
    audienceDigest: digestRef(ISSUER_AUDIENCE),
    originDigest: digestRef(VERIFIER_ORIGIN),
    profile: "ledger-local-v1",
    freshnessPolicyDigest: digestRef("synthetic-status-max-age-60s"),
  };
  const policy: TrustedTimePolicyV1 = {
    formatVersion: 1, mode: "ledger", unit: "unix-seconds", sourcePolicyDigest: digestRef("synthetic-ledger-time-policy"),
    sequenceAuthority: "ledger-local", maximumEvidenceAge: STATUS_MAX_AGE, maximumFutureSkew: 2, minimumSequence: 0,
  };
  const statement = {
    formatVersion: 1 as const, scope, unit: "unix-seconds" as const, time: NOW, issuedAt: NOW,
    expiresAt: NOW + 300, sequence, sourcePolicyDigest: policy.sourcePolicyDigest,
  };
  const anchor = { formatVersion: 1 as const, scope, unit: "unix-seconds" as const, time: NOW, sourcePolicyDigest: policy.sourcePolicyDigest };
  const evidence: TrustedTimeEvidenceV1 = {
    formatVersion: 1,
    mode: "ledger",
    statement,
    statementDigest: await computeTrustedTimeStatementDigestV1(statement),
    anchor,
    anchorDigest: await computeTrustedTimeAnchorDigestV1(anchor),
    authority: null,
  };
  return { scope, policy, evidence };
};

const createVerificationInputs = (input: {
  readonly requestId: string;
  readonly challenge: string;
  readonly credential: unknown;
  readonly presentation: unknown;
  readonly status: StatusEvidenceVerificationResultV1;
  readonly state: StatusRegistryStateV1;
  readonly trustedTime: TrustedTimeVerificationResultV1;
}): { readonly publicInputs: VerificationPublicInputsV1; readonly identity: AuthenticatedVerificationProfileIdentityV1 } => {
  const networkIdDigest = digest(STATUS_BINDING.network);
  const verifierContractDigest = digest(VERIFIER_DID);
  const deploymentDigest = digest("synthetic:harbor-access-decision:v1");
  const challengeDigest = digest(input.challenge);
  const credentialFamilyDigest = digest(STATUS_OPENID_EVIDENCE_PROFILE.family.id);
  const schemaDigest = digest(STATUS_OPENID_EVIDENCE_PROFILE.family.schemaId);
  const disclosureDigest = digest(["safetyCredentialId", "siteId", "safetyLevel"]);
  const predicateDigest = digest({ minimumSafetyLevel: 3, actualSafetyLevel: 4 });
  const statusRegistryDigest = digest(STATUS_BINDING);
  const statusRoot = refBytes(input.state.revokedRoot);
  const freshnessPolicyDigest = digest("synthetic-status-max-age-60s");
  const requestIdDigest = digest(input.requestId);
  const actionClassDigest = digest("grant-shift-site-access");
  const actionInvocationDigest = digest({ requestId: input.requestId, verifier: VERIFIER_DID });
  const artifactManifestDigest = digest("synthetic-status-openid-evidence@1.0.0");
  const credentialBinding: CredentialBindingV1 = {
    domain: verificationDomainV1("credentialBinding"), version: 1n, mode: 1n,
    credentialFamilyDigest, schemaDigest, verifierContractDigest, challengeDigest, credentialRoot: digest(input.credential),
  };
  const holderBinding: HolderBindingV1 = {
    domain: verificationDomainV1("holderBinding"), version: 1n, mode: 1n,
    verifierContractDigest, challengeDigest, subjectBindingDigest: digest(HOLDER_DID),
  };
  const consentBinding: ConsentBindingV1 = {
    domain: verificationDomainV1("consentBinding"), version: 1n, profile: 1n, networkIdDigest,
    verifierContractDigest, deploymentDigest, audienceDigest: digest(VERIFIER_DID), originMode: 0n,
    originDigest: new Uint8Array(32), requestIdDigest, challengeDigest, expiresAt: BigInt(NOW + 300),
    credentialFamilyDigest, schemaDigest, disclosureDigest, predicateDigest, statusMode: 2n,
    statusRegistryDigest, statusRoot, statusRegistryVersion: BigInt(input.state.registryVersion),
    statusFreshnessPolicyDigest: freshnessPolicyDigest, policyDigest: digest("synthetic-harbor-access-policy-v1"),
    actionClassDigest, actionInvocationDigest, artifactManifestDigest, replayPolicy: 1n,
  };
  const presentationBinding: PresentationBindingV1 = {
    domain: verificationDomainV1("presentationBinding"), version: 1n,
    credentialBindingDigest: hashCredentialBindingV1(credentialBinding), holderBindingDigest: hashHolderBindingV1(holderBinding),
    disclosureDigest, predicateDigest, consentDigest: hashConsentBindingV1(consentBinding),
  };
  const replayScope = {
    domain: verificationDomainV1("replayScopeRequest"), version: 1n, deploymentDigest, verifierContractDigest,
    requestIdDigest, challengeDigest, actionInvocationDigest,
  };
  const decisionNullifier = deriveRequestDecisionNullifierV1({ deploymentDigest, verifierContractDigest, scope: replayScope });
  const issuerEvidence = acceptedEvidence("issuerEvidence", ISSUER_DID, "synthetic-ledger-state-v1");
  const trustEvidence = acceptedEvidence("trustEvidence", VERIFIER_DID, "synthetic-policy-epoch-v1");
  const statusEvidence = acceptedEvidence("statusEvidence", input.status.transcriptDigest, input.state.revokedRoot, 4n);
  const timeEvidence = acceptedEvidence("timeEvidence", input.trustedTime.evidenceDigest, input.trustedTime.anchorDigest);
  const artifactEvidence = acceptedEvidence("artifactEvidence", artifactManifestDigest, "workspace-lock");
  const connectorEvidence = notRequiredConnector();
  const transcript = {
    domain: verificationDomainV1("transcript"), version: 1n, profile: 1n, authority: 1n, networkIdDigest,
    verifierContractDigest, deploymentDigest, audienceDigest: consentBinding.audienceDigest, originMode: 0n,
    originDigest: consentBinding.originDigest, connectorEvidenceDigest: hashEvidenceBindingV1(connectorEvidence),
    requestIdDigest, challengeDigest, expiresAt: consentBinding.expiresAt, credentialFamilyDigest, schemaDigest,
    credentialBindingMode: credentialBinding.mode, credentialBindingDigest: hashCredentialBindingV1(credentialBinding),
    disclosureDigest, predicateDigest, holderBindingDigest: hashHolderBindingV1(holderBinding),
    policyDigest: consentBinding.policyDigest, actionClassDigest, actionInvocationDigest,
    consentDigest: hashConsentBindingV1(consentBinding), presentationBindingDigest: hashPresentationBindingV1(presentationBinding),
    issuerDidDigest: digest(ISSUER_DID), issuerMethodDigest: digest(`${ISSUER_DID}#assert-1`), issuerRelationship: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(issuerEvidence), trustScopeDigest: digest("synthetic-harbor-site-access"),
    trustEvidenceDigest: hashEvidenceBindingV1(trustEvidence), statusMode: 2n, statusRegistryDigest, statusRoot,
    statusRegistryVersion: BigInt(input.state.registryVersion), statusFreshnessPolicyDigest: freshnessPolicyDigest,
    statusEvidenceDigest: hashEvidenceBindingV1(statusEvidence), timeMode: 1n, trustedTime: BigInt(input.trustedTime.trustedTime!),
    timeEvidenceDigest: hashEvidenceBindingV1(timeEvidence), artifactManifestDigest,
    artifactEvidenceDigest: hashEvidenceBindingV1(artifactEvidence), nullifierMode: 1n, replayPolicy: 1n,
    replayScopeDigest: hashRequestReplayScopeV1(replayScope), decisionNullifier,
  };
  const publicInputs: VerificationPublicInputsV1 = { transcript, issuerEvidence, trustEvidence, statusEvidence, timeEvidence, artifactEvidence, connectorEvidence };
  const identity: AuthenticatedVerificationProfileIdentityV1 = {
    source: "authenticated-resolved-profile-v1", profileId: STATUS_OPENID_EVIDENCE_PROFILE.id,
    profileVersion: STATUS_OPENID_EVIDENCE_PROFILE.version, familyId: STATUS_OPENID_EVIDENCE_PROFILE.family.id,
    familyVersion: STATUS_OPENID_EVIDENCE_PROFILE.family.version, schemaId: STATUS_OPENID_EVIDENCE_PROFILE.family.schemaId,
    schemaVersion: STATUS_OPENID_EVIDENCE_PROFILE.family.schemaVersion, credentialFamilyDigest: asBytes32(credentialFamilyDigest),
    schemaDigest: asBytes32(schemaDigest), artifactManifestDigest: asBytes32(artifactManifestDigest),
  };
  return { publicInputs, identity };
};

const anchorEvidenceDigest = (inputs: VerificationPublicInputsV1): Uint8Array => {
  const receipt: AnchorEvidenceReceiptV1 = {
    domain: verificationDomainV1("anchorEvidenceReceipt"), version: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(inputs.issuerEvidence), trustEvidenceDigest: hashEvidenceBindingV1(inputs.trustEvidence),
    statusEvidenceDigest: hashEvidenceBindingV1(inputs.statusEvidence), timeEvidenceDigest: hashEvidenceBindingV1(inputs.timeEvidence),
    artifactEvidenceDigest: hashEvidenceBindingV1(inputs.artifactEvidence), connectorEvidenceDigest: hashEvidenceBindingV1(inputs.connectorEvidence),
  };
  return hashAnchorEvidenceReceiptV1(receipt);
};

const ledgerExecutor = (store: StatusOpenIdEvidenceStore): LedgerVerificationExecutorV1 => ({
  submit: async (prepared) => {
    const committed = await store.commitDecision({
      decisionNullifier: prepared.publicInputs.transcript.decisionNullifier,
      transcriptDigest: prepared.transcriptDigest,
      outcome: "access-granted",
    });
    return {
      version: 1,
      executionStatus: "committed",
      evaluation: {
        proofStatus: "valid",
        decisionStatus: committed.classification === "applied" ? "approved" : "replay",
        transcriptDigest: prepared.transcriptDigest,
        authorityEvidence: "ledger-local",
      },
      transcriptDigest: prepared.transcriptDigest,
      decisionNullifier: asBytes32(prepared.publicInputs.transcript.decisionNullifier),
      anchorEvidenceDigest: asBytes32(anchorEvidenceDigest(prepared.publicInputs)),
      transactionDigest: asBytes32(committed.transactionDigest),
      atomicMutation: committed.atomicMutation,
    };
  },
  confirmCommitted: async (observation) => store.hasDecision(observation.decisionNullifier, observation.transactionDigest!),
});

export type StatusOpenIdEvidenceRunOptions = {
  readonly correlationId: string;
  readonly requestId: string;
  readonly statusScenario?: StatusScenario;
  readonly openIdMutation?: OpenIdMutation;
};

type BusinessDecision = {
  readonly outcome: "access-granted" | "denied" | "indeterminate";
  readonly reason: string;
  readonly atomicMutation: "committed" | "none";
  readonly replay: boolean;
  readonly decisionNullifier?: Uint8Array;
};

export type StatusOpenIdProductionEvidence = {
  readonly qualification: "production-shaped-evidence-only";
  readonly productionApproved: false;
  readonly externalInteroperability: "not-run";
  readonly localConformance: "passed";
  readonly actors: typeof ACTORS;
  readonly businessOutcome: string;
  readonly profile: { readonly id: string; readonly version: string };
  readonly openId: { readonly profile: typeof MIDNIGHT_OPENID_PROFILE_V1; readonly oid4vci: typeof OID4VCI_1_0_FINAL; readonly oid4vp: typeof OID4VP_1_0_FINAL; readonly dcqlQueryIds: readonly string[]; readonly issuanceIdempotent: boolean };
  readonly status: StatusEvidenceVerificationResultV1;
  readonly trustedTime: TrustedTimeVerificationResultV1;
  readonly verification: VerificationResultV1 | null;
  readonly decision: BusinessDecision;
};

const statusFailure = (status: StatusEvidenceVerificationResultV1): BusinessDecision => ({
  outcome: status.status === "indeterminate" ? "indeterminate" : "denied",
  reason: status.outcome.verdict === "valid" ? "statusRequestMismatch" : status.outcome.code,
  atomicMutation: "none",
  replay: false,
});

export class StatusOpenIdEvidenceRunner {
  readonly network: StatusOpenIdNetworkPort;
  readonly process: StatusOpenIdProcessPort;
  readonly proof?: StatusOpenIdProofPort;
  readonly store: StatusOpenIdEvidenceStore;
  readonly keyCustody: StatusOpenIdKeyCustodyPort;
  readonly status: StatusOpenIdStatusPort;
  readonly trustedTime: StatusOpenIdTrustedTimePort;
  readonly verificationExecutor: LedgerVerificationExecutorV1;
  readonly audit: StatusOpenIdAuditSink;

  constructor(ports: StatusOpenIdEvidencePorts = {}) {
    this.network = ports.network ?? new SyntheticNetwork();
    this.process = ports.process ?? new InlineProcess();
    this.proof = ports.proof;
    this.store = ports.store ?? new InMemoryStatusOpenIdEvidenceStore();
    this.keyCustody = ports.keyCustody ?? new IsolatedSyntheticCustody();
    this.status = ports.status ?? new SyntheticStatus();
    this.trustedTime = ports.trustedTime ?? new SyntheticTrustedTime();
    this.verificationExecutor = ports.verificationExecutor ?? ledgerExecutor(this.store);
    this.audit = ports.audit ?? new InMemoryStatusOpenIdAuditSink();
  }

  async run(options: StatusOpenIdEvidenceRunOptions): Promise<StatusOpenIdProductionEvidence> {
    if (options.correlationId.trim() === "" || options.requestId.trim() === "") throw new Error("correlationId and requestId are required");
    let stage: EvidenceStage = "profile";
    const record = (outcome: StatusOpenIdAuditEvent["outcome"], detail?: string) => this.audit.record({
      correlationId: options.correlationId, stage, outcome, ...(detail === undefined ? {} : { detail }),
    });
    record("started");
    const resolved = resolveStatusOpenIdEvidenceProfile();
    record("succeeded");

    try {
      return await this.process.execute(async () => {
        stage = "process";
        record("started");
        const requestObjectBody = new TextEncoder().encode("synthetic-signed-request-object");
        const requestDigest = digestB64(requestObjectBody);
        const proof = this.proof ?? new SyntheticProof(requestDigest);
        const session = (protocol: "oid4vci" | "oid4vp") => ({
          profile: MIDNIGHT_OPENID_PROFILE_V1,
          protocol,
          protocol_version: protocol === "oid4vci" ? OID4VCI_1_0_FINAL : OID4VP_1_0_FINAL,
          session_id: `${protocol}:${options.requestId}`,
          transcript_digest: digestB64(`transcript:${options.requestId}`),
          consent_digest: digestB64(`consent:${options.requestId}`),
          issued_at: NOW - 1,
          expires_at: NOW + 300,
        });
        const validationPorts: MidnightProfileValidationPorts = {
          clock: { now: () => NOW },
          replay: this.store,
          consent: { verify: async () => true } satisfies OpenIdConsentVerifier,
          oauth: { validateBearer: async () => undefined } satisfies OAuthAccessTokenValidator,
          issuanceProofs: {
            verify: async ({ proof: value }) => {
              const verified = await proof.verifyIssuanceProof(value);
              if (options.openIdMutation === "issuance-audience") return { ...verified, audience: "https://evil.example" };
              if (options.openIdMutation === "issuance-nonce") return { ...verified, c_nonce: "substituted-c-nonce" };
              if (options.openIdMutation === "issuance-request-digest") return { ...verified, request_digest: digestB64("substituted") };
              return verified;
            },
          } satisfies IssuanceProofVerifier,
        };

        stage = "network";
        record("started");
        const http: RequestObjectHttpClient = {
          get: async (input) => {
            const response = await this.network.fetchRequestObject(input);
            if (options.openIdMutation === "redirect") return { ...response, finalUrl: `${VERIFIER_ORIGIN}/redirected.jwt` };
            return response;
          },
        };
        await resolveAndValidateRequestObject({
          reference: { uri: REQUEST_OBJECT_URI, digest: requestDigest, audience: VERIFIER_DID, expires_at: NOW + 300 },
          policy: {
            audience: VERIFIER_DID,
            allowedHosts: ["gate.synthetic.example"],
            now: NOW,
            resolveHost: async () => options.openIdMutation === "ssrf" ? ["127.0.0.1"] : ["8.8.8.8"],
          },
          http,
          verifier: { verify: async () => undefined },
        });
        record("succeeded");

        const issuanceRequest = {
          credential_configuration_id: "synthetic-contractor-safety-v1",
          format: "midnight_compact_vc" as const,
          proofs: { jwt: ["synthetic-holder-proof.jwt"] },
          midnight: {
            holderBinding: { method: "explicit_did_method" as const, challenge: "0x1234", holderDidMethod: { did: HOLDER_DID, methodIndex: 1, keyType: "ed25519" as const } },
            requestedClaims: ["safetyCredentialId", "siteId", "safetyLevel"],
          },
          session_binding: session("oid4vci"),
        };
        const issuanceKey = `oid4vci:${options.requestId}`;
        const issuanceDigest = digestB64(issuanceRequest);
        type IssuanceValue = { credential: unknown; request_digest: string; session_binding: ReturnType<typeof session> };
        let issuance: { readonly classification: "applied" | "replay"; readonly value: IssuanceValue } | null =
          this.store.readIssuance<IssuanceValue>(issuanceKey, issuanceDigest);
        if (issuance === null) {
          stage = "proof";
          record("started");
          await validateMidnightCredentialRequest({
            request: issuanceRequest,
            accessToken: "synthetic-access-token",
            expected: {
              audience: ISSUER_AUDIENCE, cNonce: "issuer-c-nonce", requestDigest,
              sessionId: session("oid4vci").session_id, transcriptDigest: session("oid4vci").transcript_digest,
              consentDigest: session("oid4vci").consent_digest, issuedAt: NOW - 1, expiresAt: NOW + 300,
            },
            ports: validationPorts,
          });
          record("succeeded");
          stage = "key-custody";
          record("started");
          const claims = { safetyCredentialId: "SAFETY-0001", contractorName: ACTORS.holder, siteId: "HARBOR-7", safetyLevel: 4 };
          const statusHandle = "synthetic-status-handle:SAFETY-0001";
          const signed = await this.keyCustody.sign({ keyId: `${ISSUER_DID}#assert-1`, payloadDigest: digestB64({ claims, statusHandle }) });
          if (!this.keyCustody.describe().isolated || signed.keyId !== `${ISSUER_DID}#assert-1`) throw new Error("key custody isolation or key binding failed");
          record("succeeded");
          const value = {
            credential: { issuer: ISSUER_DID, subject: HOLDER_DID, claims, statusHandle, proof: signed },
            request_digest: requestDigest,
            session_binding: session("oid4vci"),
          };
          stage = "storage";
          record("started");
          issuance = await this.store.commitIssuance(issuanceKey, issuanceDigest, value);
          record("succeeded");
          await validateMidnightCredentialResponse({
            response: issuance.value,
            expected: { requestDigest, sessionId: session("oid4vci").session_id, transcriptDigest: session("oid4vci").transcript_digest, consentDigest: session("oid4vci").consent_digest, issuedAt: NOW - 1, expiresAt: NOW + 300 },
            ports: validationPorts,
          });
        }
        await this.network.exchange("issuance");
        const credential = issuance.value.credential as { readonly statusHandle: string };

        stage = "time";
        record("started");
        const previousTimeCheckpoint = this.store.trustedTimeCheckpoint();
        const timeInput = await createTrustedTime(
          options.requestId,
          (previousTimeCheckpoint?.sequence ?? 0) + 1,
        );
        const trustedTime = await this.trustedTime.verify({
          ...timeInput,
          previousCheckpoint: previousTimeCheckpoint,
        });
        if (
          trustedTime.status !== "valid" ||
          !trustedTime.accepted ||
          !trustedTime.authoritative ||
          trustedTime.authority !== "ledger-local" ||
          trustedTime.trustedTime === null ||
          !Number.isSafeInteger(trustedTime.trustedTime) ||
          trustedTime.trustedTime < 0 ||
          trustedTime.anchorDigest === null ||
          trustedTime.checkpoint === null
        ) {
          throw new Error("trusted time unavailable, invalid, or non-authoritative");
        }
        await this.store.commitTrustedTimeCheckpoint(trustedTime.checkpoint);
        record("succeeded");

        stage = "status";
        record("started");
        await this.network.exchange("status");
        const statusHandleDigest = deriveStatusHandleDigestV1(new TextEncoder().encode(credential.statusHandle));
        const statusSnapshot = await this.status.readState({ statusHandleDigest, scenario: options.statusScenario ?? "active" });
        let status = verifySameContractStatusV1({
          profile: "ledger-local-v1", binding: STATUS_BINDING, state: statusSnapshot.state, statusHandleDigest,
          expectedAuthorityDid: STATUS_DID, privacy: { mode: "public" }, freshnessPolicyDigest: timeInput.scope.freshnessPolicyDigest,
        });
        if (status.status === "valid" && (
          !Number.isSafeInteger(statusSnapshot.observedAt) ||
          statusSnapshot.observedAt < 0 ||
          statusSnapshot.observedAt > trustedTime.trustedTime ||
          trustedTime.trustedTime - statusSnapshot.observedAt > STATUS_MAX_AGE
        )) {
          status = {
            ...status,
            status: "invalid",
            reasonCodes: ["STALE_ROOT"],
            outcome: { verdict: "invalid", code: "staleRegistryState" },
          };
        }
        record(status.status === "valid" ? "succeeded" : "failed", status.reasonCodes.join(","));
        if (status.status !== "valid") {
          stage = "process";
          record("succeeded", "request denied before presentation");
          return {
            qualification: "production-shaped-evidence-only", productionApproved: false, externalInteroperability: "not-run", localConformance: "passed",
            actors: ACTORS, businessOutcome: "Atomically grant one synthetic shift-access authorization only after an active safety credential passes OID4VP/DCQL and Verification V1.",
            profile: resolved.profile, openId: { profile: MIDNIGHT_OPENID_PROFILE_V1, oid4vci: OID4VCI_1_0_FINAL, oid4vp: OID4VP_1_0_FINAL, dcqlQueryIds: [DCQL_ID], issuanceIdempotent: issuance.classification === "replay" },
            status, trustedTime, verification: null, decision: statusFailure(status),
          };
        }

        const challenge = `verifier-nonce:${options.requestId}`;
        const vpRequestDigest = digestB64({ requestId: options.requestId, challenge, dcql: DCQL_ID });
        const requestBinding = {
          client_id: VERIFIER_DID,
          nonce: options.openIdMutation === "presentation-nonce" ? "substituted-nonce" : challenge,
          request_digest: vpRequestDigest,
          origin: options.openIdMutation === "origin" ? "https://evil.example" : VERIFIER_ORIGIN,
        };
        const vpRequest = {
          response_type: "vp_token" as const,
          response_mode: "direct_post" as const,
          client_id: options.openIdMutation === "presentation-audience" ? "did:midnight:synthetic:evil-verifier" : VERIFIER_DID,
          response_uri: options.openIdMutation === "response-uri" ? "https://evil.example/callback" : RESPONSE_URI,
          state: `state:${options.requestId}`,
          nonce: challenge,
          dcql_query: { credentials: [{ id: DCQL_ID, format: "midnight_compact_vc" as const, claims: [
            { path: ["credentialSubject", "siteId"] }, { path: ["credentialSubject", "safetyLevel"] },
          ], require_cryptographic_holder_binding: true }] },
          request_digest: options.openIdMutation === "request-digest" ? digestB64("substituted") : vpRequestDigest,
          midnight: { verifierDomain: "gate.synthetic.example", challenge: "0xcafe", acceptedCredentialFamilies: [STATUS_OPENID_EVIDENCE_PROFILE.family.id], requireSameHolder: false, predicateHints: ["safetyLevel>=3"] },
          request_binding: requestBinding,
          session_binding: session("oid4vp"),
        };
        stage = "network";
        record("started");
        await this.network.exchange("presentation");
        await validateMidnightVpRequest({
          request: vpRequest,
          expected: {
            clientId: VERIFIER_DID, nonce: challenge, requestDigest: vpRequestDigest, origin: VERIFIER_ORIGIN, responseUri: RESPONSE_URI,
            sessionId: session("oid4vp").session_id, transcriptDigest: session("oid4vp").transcript_digest,
            consentDigest: session("oid4vp").consent_digest, issuedAt: NOW - 1, expiresAt: NOW + 300,
          },
          ports: validationPorts,
        });
        const presentation = { credential, disclosedClaims: { siteId: "HARBOR-7", safetyLevel: 4 }, holder: HOLDER_DID };
        if (!await proof.verifyPresentation(presentation)) throw new Error("presentation proof unavailable or invalid");
        const vpResponse = {
          state: `state:${options.requestId}`,
          vp_token: { [options.openIdMutation === "dcql" ? "substituted-query" : DCQL_ID]: [presentation] },
          request_digest: vpRequestDigest,
          request_binding: { client_id: VERIFIER_DID, nonce: challenge, request_digest: vpRequestDigest, origin: VERIFIER_ORIGIN },
          session_binding: session("oid4vp"),
        };
        await validateMidnightVpResponse({
          response: vpResponse,
          expected: {
            state: `state:${options.requestId}`, clientId: VERIFIER_DID, nonce: challenge, requestDigest: vpRequestDigest,
            origin: VERIFIER_ORIGIN, dcqlQueryIds: [DCQL_ID], sessionId: session("oid4vp").session_id,
            transcriptDigest: session("oid4vp").transcript_digest, consentDigest: session("oid4vp").consent_digest,
            issuedAt: NOW - 1, expiresAt: NOW + 300,
          },
          ports: validationPorts,
        });
        record("succeeded");

        stage = "verification";
        record("started");
        const { publicInputs, identity } = createVerificationInputs({ requestId: options.requestId, challenge, credential, presentation, status, state: statusSnapshot.state, trustedTime });
        const prepared = prepareVerification("ledger-local-v1", publicInputs, STATUS_OPENID_EVIDENCE_PROFILE, identity);
        if (prepared.kind !== "prepared-verification") throw new Error(`Verification V1 preparation failed: ${prepared.reasonCode}`);
        const verification = await submitLedgerVerification(prepared, this.verificationExecutor);
        if (
          verification.kind !== "ledger-receipt" ||
          verification.proofStatus !== "valid" ||
          !["approved", "replay"].includes(verification.decisionStatus)
        ) {
          throw new Error(`Verification V1 did not produce an approved committed receipt: ${JSON.stringify(verification)}`);
        }
        record("succeeded");
        stage = "process";
        record("succeeded");
        return {
          qualification: "production-shaped-evidence-only", productionApproved: false, externalInteroperability: "not-run", localConformance: "passed",
          actors: ACTORS, businessOutcome: "Atomically grant one synthetic shift-access authorization only after an active safety credential passes OID4VP/DCQL and Verification V1.",
          profile: resolved.profile, openId: { profile: MIDNIGHT_OPENID_PROFILE_V1, oid4vci: OID4VCI_1_0_FINAL, oid4vp: OID4VP_1_0_FINAL, dcqlQueryIds: [DCQL_ID], issuanceIdempotent: issuance.classification === "replay" },
          status, trustedTime, verification,
          decision: {
            outcome: "access-granted", reason: verification.decisionStatus, atomicMutation: verification.atomicMutation,
            replay: verification.decisionStatus === "replay", decisionNullifier: verification.decisionNullifier,
          },
        };
      });
    } catch (error) {
      record("failed", `${stage} seam failed closed`);
      throw error;
    }
  }
}

export { ACTORS as STATUS_OPENID_EVIDENCE_ACTORS };
export { InMemoryStatusOpenIdEvidenceStore };
export { computeStatusRecordDigestV1,computeTrustedTimeEvidenceDigestV1 };
