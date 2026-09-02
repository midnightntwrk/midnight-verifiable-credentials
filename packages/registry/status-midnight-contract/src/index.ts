import { createHash } from "node:crypto";

import {
  computeStatusRegistryRootV1,
  emptyStatusRegistryRootV1,
} from "./authenticated-root.js";

export {
  computeStatusMerkleLeafV1,
  computeStatusMerkleParentV1,
  computeStatusRegistryRootV1,
  emptyStatusRegistryRootV1,
} from "./authenticated-root.js";

export type StatusSha256DigestV1 = `sha256:${string}`;

export interface StatusRegistryBindingV1 {
  readonly formatVersion: 1;
  readonly network: string;
  readonly namespace: string;
  readonly registryId: string;
  readonly deployment: string;
}

export interface StatusRegistryOperatorV1 {
  readonly did: string;
  readonly methodId: string;
  readonly keyFingerprint: StatusSha256DigestV1;
  readonly relationship: "capabilityInvocation";
}

export interface StatusRegistryAuthorizationRequestV1 {
  readonly formatVersion: 1;
  readonly operation: "initialize" | "revoke";
  readonly binding: StatusRegistryBindingV1;
  readonly nonce: string;
  readonly authorityGeneration: number;
  readonly expectedRegistryVersion: number;
  readonly operator: StatusRegistryOperatorV1;
  readonly statusHandleDigest: StatusSha256DigestV1 | null;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly authorityPolicyDigest: StatusSha256DigestV1;
  /** Opaque adapter input. Contract state never interprets or persists it. */
  readonly authorityEvidence: unknown;
}

export interface StatusRegistryStateV1 {
  readonly formatVersion: 1;
  readonly binding: StatusRegistryBindingV1;
  readonly initialized: boolean;
  readonly controllerDid: string | null;
  readonly authorityGeneration: number;
  readonly registryVersion: number;
  readonly revokedStatusHandleCount: number;
  /** Canonical SHA-256 reference root over revokedStatusHandleDigests. */
  readonly revokedRoot: StatusSha256DigestV1;
  readonly acceptedAuthorizationCount: number;
  readonly auditSequence: number;
  readonly auditCommitment: StatusSha256DigestV1;
  /** Reference adapter state; production stores this in the owning contract. */
  readonly revokedStatusHandleDigests: readonly StatusSha256DigestV1[];
}

export interface StatusRegistryGateDecisionV1 {
  readonly status: "valid" | "invalid" | "indeterminate";
  readonly accepted: boolean;
  readonly reasonCodes: readonly string[];
  readonly transcriptDigest: StatusSha256DigestV1;
  readonly delegateGrantDigest: StatusSha256DigestV1 | null;
}

export interface StatusRegistryAuthorizationGateInputV1 {
  readonly request: StatusRegistryAuthorizationRequestV1;
  readonly authorizationDigest: StatusSha256DigestV1;
  readonly currentState: StatusRegistryStateV1;
}

export interface StatusRegistryAuthorizationGateV1 {
  authorize(
    input: StatusRegistryAuthorizationGateInputV1,
  ): Promise<StatusRegistryGateDecisionV1>;
}

export type StatusRegistryReceiptResultV1 =
  | "initialized"
  | "revoked"
  | "already-revoked"
  | "rejected"
  | "indeterminate";

export interface StatusRegistryAuthorizationReceiptV1 {
  readonly formatVersion: 1;
  readonly operationClass: "initialization" | "mutation";
  readonly operation: "initialize" | "revoke";
  readonly nonce: string;
  readonly result: StatusRegistryReceiptResultV1;
  readonly reasonCodes: readonly string[];
  readonly authorizationDigest: StatusSha256DigestV1;
  readonly authorityTranscriptDigest: StatusSha256DigestV1 | null;
  readonly delegateGrantDigest: StatusSha256DigestV1 | null;
  readonly namespace: string;
  readonly registryId: string;
  readonly deployment: string;
  readonly authorityGeneration: number;
  readonly resultingRegistryVersion: number;
  readonly resultingRevokedStatusHandleCount: number;
  readonly resultingRevokedRoot: StatusSha256DigestV1;
  readonly acceptedAuthorizationCount: number;
  readonly auditSequence: number;
  readonly auditCommitment: StatusSha256DigestV1;
}

export interface StatusRegistryAuthorizationOutcomeV1 {
  readonly status: "accepted" | "rejected" | "indeterminate";
  readonly replay: boolean;
  readonly receipt: StatusRegistryAuthorizationReceiptV1;
}

const zeroDigest = `sha256:${"0".repeat(64)}` as const;
const sha256Pattern = /^sha256:[0-9a-f]{64}$/u;

const canonicalize = (value: unknown): unknown => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== "object") {
    throw new TypeError("Status authorization records must be canonical data");
  }
  return Object.fromEntries(
    Object.entries(value as Readonly<Record<string, unknown>>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]),
  );
};

export const computeStatusRecordDigestV1 = (
  value: unknown,
): StatusSha256DigestV1 =>
  `sha256:${createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex")}`;

const authorizationPayload = (request: StatusRegistryAuthorizationRequestV1) => ({
  formatVersion: request.formatVersion,
  operation: request.operation,
  binding: request.binding,
  nonce: request.nonce,
  authorityGeneration: request.authorityGeneration,
  expectedRegistryVersion: request.expectedRegistryVersion,
  operator: request.operator,
  statusHandleDigest: request.statusHandleDigest,
  issuedAt: request.issuedAt,
  expiresAt: request.expiresAt,
  authorityPolicyDigest: request.authorityPolicyDigest,
});

export const computeStatusRegistryAuthorizationDigestV1 = (
  request: StatusRegistryAuthorizationRequestV1,
): StatusSha256DigestV1 => computeStatusRecordDigestV1(authorizationPayload(request));

const bindingReason = (
  expected: StatusRegistryBindingV1,
  actual: StatusRegistryBindingV1,
): string | null => {
  if (actual.formatVersion !== 1) return "UNSUPPORTED_BINDING_VERSION";
  if (actual.network !== expected.network) return "NETWORK_MISMATCH";
  if (actual.namespace !== expected.namespace) return "NAMESPACE_MISMATCH";
  if (actual.registryId !== expected.registryId) return "REGISTRY_MISMATCH";
  if (actual.deployment !== expected.deployment) return "DEPLOYMENT_MISMATCH";
  return null;
};

const assertBinding = (binding: StatusRegistryBindingV1): void => {
  for (const [field, value] of Object.entries(binding)) {
    if (field !== "formatVersion" && (typeof value !== "string" || value.length === 0)) {
      throw new TypeError(`status registry binding ${field} must be non-empty`);
    }
  }
};

const assertRequestShape = (request: StatusRegistryAuthorizationRequestV1): void => {
  if (request.formatVersion !== 1) throw new TypeError("status authorization formatVersion must be 1");
  if (request.nonce.trim().length === 0) throw new TypeError("status authorization nonce must be non-empty");
  if (
    !Number.isSafeInteger(request.issuedAt) ||
    !Number.isSafeInteger(request.expiresAt) ||
    request.issuedAt < 0 ||
    request.expiresAt < 0
  ) {
    throw new TypeError("status authorization time bounds must be non-negative safe integers");
  }
  if (!Number.isSafeInteger(request.authorityGeneration) || request.authorityGeneration < 0) {
    throw new TypeError("status authorization generation must be a non-negative safe integer");
  }
  if (!Number.isSafeInteger(request.expectedRegistryVersion) || request.expectedRegistryVersion < 0) {
    throw new TypeError("expected registry version must be a non-negative safe integer");
  }
  if (!sha256Pattern.test(request.authorityPolicyDigest)) {
    throw new TypeError("authority policy digest must be SHA-256");
  }
  if (
    request.operator.relationship !== "capabilityInvocation" ||
    request.operator.did.length === 0 ||
    request.operator.methodId.length === 0 ||
    !sha256Pattern.test(request.operator.keyFingerprint)
  ) {
    throw new TypeError("operator must identify one capabilityInvocation method");
  }
};

const operationClass = (operation: "initialize" | "revoke") =>
  operation === "initialize" ? "initialization" as const : "mutation" as const;

export class InMemoryStatusRegistryContractV1 {
  readonly #binding: StatusRegistryBindingV1;
  readonly #authorizationGate: StatusRegistryAuthorizationGateV1;
  readonly #receipts = new Map<string, {
    readonly authorizationDigest: StatusSha256DigestV1;
    readonly outcome: StatusRegistryAuthorizationOutcomeV1;
  }>();
  #revoked = new Set<StatusSha256DigestV1>();
  #state: StatusRegistryStateV1;
  #tail: Promise<void> = Promise.resolve();

  public constructor(input: {
    readonly binding: StatusRegistryBindingV1;
    readonly authorizationGate: StatusRegistryAuthorizationGateV1;
  }) {
    assertBinding(input.binding);
    this.#binding = Object.freeze({ ...input.binding });
    this.#authorizationGate = input.authorizationGate;
    this.#state = this.#snapshot({
      initialized: false,
      controllerDid: null,
      authorityGeneration: 0,
      registryVersion: 0,
      revokedStatusHandleCount: 0,
      revokedRoot: emptyStatusRegistryRootV1,
      acceptedAuthorizationCount: 0,
      auditSequence: 0,
      auditCommitment: zeroDigest,
    });
  }

  public readState(): StatusRegistryStateV1 {
    return this.#state;
  }

  public initialize(
    request: StatusRegistryAuthorizationRequestV1,
  ): Promise<StatusRegistryAuthorizationOutcomeV1> {
    const snapshot = globalThis.structuredClone(request);
    return this.#exclusive(() => this.#initialize(snapshot));
  }

  public revoke(
    request: StatusRegistryAuthorizationRequestV1,
  ): Promise<StatusRegistryAuthorizationOutcomeV1> {
    const snapshot = globalThis.structuredClone(request);
    return this.#exclusive(() => this.#revoke(snapshot));
  }

  async #exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.#tail;
    let release = (): void => undefined;
    this.#tail = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  #snapshot(
    state: Omit<StatusRegistryStateV1, "formatVersion" | "binding" | "revokedStatusHandleDigests">,
  ): StatusRegistryStateV1 {
    return Object.freeze({
      formatVersion: 1,
      binding: this.#binding,
      ...state,
      revokedStatusHandleDigests: Object.freeze([...this.#revoked].sort()),
    });
  }

  #receiptKey(request: StatusRegistryAuthorizationRequestV1): string {
    return `${operationClass(request.operation)}:${request.nonce}`;
  }

  #replayOrConflict(
    request: StatusRegistryAuthorizationRequestV1,
    authorizationDigest: StatusSha256DigestV1,
  ): StatusRegistryAuthorizationOutcomeV1 | null {
    const existing = this.#receipts.get(this.#receiptKey(request));
    if (existing === undefined) return null;
    if (existing.authorizationDigest !== authorizationDigest) {
      return this.#failure(request, authorizationDigest, "invalid", ["NONCE_CONFLICT"]);
    }
    return { ...existing.outcome, replay: true };
  }

  #failure(
    request: StatusRegistryAuthorizationRequestV1,
    authorizationDigest: StatusSha256DigestV1,
    status: "invalid" | "indeterminate",
    reasonCodes: readonly string[],
    authorityTranscriptDigest: StatusSha256DigestV1 | null = null,
    delegateGrantDigest: StatusSha256DigestV1 | null = null,
  ): StatusRegistryAuthorizationOutcomeV1 {
    return {
      status: status === "invalid" ? "rejected" : "indeterminate",
      replay: false,
      receipt: this.#makeReceipt({
        request,
        authorizationDigest,
        result: status === "invalid" ? "rejected" : "indeterminate",
        reasonCodes,
        authorityTranscriptDigest,
        delegateGrantDigest,
        state: this.#state,
      }),
    };
  }

  #makeReceipt(input: {
    readonly request: StatusRegistryAuthorizationRequestV1;
    readonly authorizationDigest: StatusSha256DigestV1;
    readonly result: StatusRegistryReceiptResultV1;
    readonly reasonCodes: readonly string[];
    readonly authorityTranscriptDigest: StatusSha256DigestV1 | null;
    readonly delegateGrantDigest: StatusSha256DigestV1 | null;
    readonly state: StatusRegistryStateV1;
  }): StatusRegistryAuthorizationReceiptV1 {
    return Object.freeze({
      formatVersion: 1,
      operationClass: operationClass(input.request.operation),
      operation: input.request.operation,
      nonce: input.request.nonce,
      result: input.result,
      reasonCodes: Object.freeze([...input.reasonCodes]),
      authorizationDigest: input.authorizationDigest,
      authorityTranscriptDigest: input.authorityTranscriptDigest,
      delegateGrantDigest: input.delegateGrantDigest,
      namespace: this.#binding.namespace,
      registryId: this.#binding.registryId,
      deployment: this.#binding.deployment,
      authorityGeneration: input.state.authorityGeneration,
      resultingRegistryVersion: input.state.registryVersion,
      resultingRevokedStatusHandleCount: input.state.revokedStatusHandleCount,
      resultingRevokedRoot: input.state.revokedRoot,
      acceptedAuthorizationCount: input.state.acceptedAuthorizationCount,
      auditSequence: input.state.auditSequence,
      auditCommitment: input.state.auditCommitment,
    });
  }

  async #authorize(
    request: StatusRegistryAuthorizationRequestV1,
    authorizationDigest: StatusSha256DigestV1,
  ): Promise<StatusRegistryGateDecisionV1> {
    try {
      const decision = await this.#authorizationGate.authorize({
        request: globalThis.structuredClone(request),
        authorizationDigest,
        currentState: this.#state,
      });
      if (
        (decision.status === "valid") !== decision.accepted ||
        (decision.status === "valid" && decision.reasonCodes.length > 0) ||
        !sha256Pattern.test(decision.transcriptDigest) ||
        (decision.delegateGrantDigest !== null &&
          !sha256Pattern.test(decision.delegateGrantDigest))
      ) {
        return {
          status: "invalid",
          accepted: false,
          reasonCodes: ["MALFORMED_AUTHORITY_DECISION"],
          transcriptDigest: zeroDigest,
          delegateGrantDigest: null,
        };
      }
      return decision;
    } catch {
      return {
        status: "indeterminate",
        accepted: false,
        reasonCodes: ["AUTHORITY_GATE_UNAVAILABLE"],
        transcriptDigest: zeroDigest,
        delegateGrantDigest: null,
      };
    }
  }

  #immutableFailure(
    request: StatusRegistryAuthorizationRequestV1,
    authorizationDigest: StatusSha256DigestV1,
    expectedOperation: "initialize" | "revoke",
  ): StatusRegistryAuthorizationOutcomeV1 | null {
    if (request.operation !== expectedOperation) {
      return this.#failure(request, authorizationDigest, "invalid", ["OPERATION_MISMATCH"]);
    }
    const reason = bindingReason(this.#binding, request.binding);
    return reason === null
      ? null
      : this.#failure(request, authorizationDigest, "invalid", [reason]);
  }

  async #initialize(
    request: StatusRegistryAuthorizationRequestV1,
  ): Promise<StatusRegistryAuthorizationOutcomeV1> {
    assertRequestShape(request);
    const authorizationDigest = computeStatusRegistryAuthorizationDigestV1(request);
    const immutableFailure = this.#immutableFailure(request, authorizationDigest, "initialize");
    if (immutableFailure !== null) return immutableFailure;
    const replay = this.#replayOrConflict(request, authorizationDigest);
    if (replay !== null) return replay;
    if (this.#state.initialized) {
      return this.#failure(request, authorizationDigest, "invalid", ["REGISTRY_ALREADY_INITIALIZED"]);
    }
    if (request.authorityGeneration !== 0 || request.expectedRegistryVersion !== 0) {
      return this.#failure(request, authorizationDigest, "invalid", ["INITIAL_STATE_MISMATCH"]);
    }
    if (request.statusHandleDigest !== null) {
      return this.#failure(request, authorizationDigest, "invalid", ["INITIALIZATION_HANDLE_PRESENT"]);
    }
    const decision = await this.#authorize(request, authorizationDigest);
    if (!decision.accepted) {
      return this.#failure(
        request,
        authorizationDigest,
        decision.status === "indeterminate" ? "indeterminate" : "invalid",
        decision.reasonCodes,
        decision.transcriptDigest,
        decision.delegateGrantDigest,
      );
    }
    const auditSequence = 1;
    const acceptedAuthorizationCount = 1;
    const auditCommitment = computeStatusRecordDigestV1({
      domain: "midnight:vc:status-audit:v1",
      previousAuditCommitment: this.#state.auditCommitment,
      auditSequence,
      acceptedAuthorizationCount,
      operation: request.operation,
      authorizationDigest,
      authorityTranscriptDigest: decision.transcriptDigest,
    });
    this.#state = this.#snapshot({
      initialized: true,
      controllerDid: request.operator.did,
      authorityGeneration: 1,
      registryVersion: 1,
      revokedStatusHandleCount: 0,
      revokedRoot: emptyStatusRegistryRootV1,
      acceptedAuthorizationCount,
      auditSequence,
      auditCommitment,
    });
    return this.#accept(request, authorizationDigest, decision, "initialized");
  }

  async #revoke(
    request: StatusRegistryAuthorizationRequestV1,
  ): Promise<StatusRegistryAuthorizationOutcomeV1> {
    assertRequestShape(request);
    const authorizationDigest = computeStatusRegistryAuthorizationDigestV1(request);
    const immutableFailure = this.#immutableFailure(request, authorizationDigest, "revoke");
    if (immutableFailure !== null) return immutableFailure;
    const replay = this.#replayOrConflict(request, authorizationDigest);
    if (replay !== null) return replay;
    if (!this.#state.initialized) {
      return this.#failure(request, authorizationDigest, "invalid", ["REGISTRY_NOT_INITIALIZED"]);
    }
    if (request.authorityGeneration !== this.#state.authorityGeneration) {
      return this.#failure(request, authorizationDigest, "invalid", ["AUTHORITY_GENERATION_MISMATCH"]);
    }
    if (request.expectedRegistryVersion !== this.#state.registryVersion) {
      return this.#failure(request, authorizationDigest, "invalid", ["REGISTRY_VERSION_MISMATCH"]);
    }
    if (request.statusHandleDigest === null || !sha256Pattern.test(request.statusHandleDigest)) {
      return this.#failure(request, authorizationDigest, "invalid", ["STATUS_HANDLE_DIGEST_INVALID"]);
    }
    const decision = await this.#authorize(request, authorizationDigest);
    if (!decision.accepted) {
      return this.#failure(
        request,
        authorizationDigest,
        decision.status === "indeterminate" ? "indeterminate" : "invalid",
        decision.reasonCodes,
        decision.transcriptDigest,
        decision.delegateGrantDigest,
      );
    }
    const alreadyRevoked = this.#revoked.has(request.statusHandleDigest);
    if (!alreadyRevoked) this.#revoked.add(request.statusHandleDigest);
    const acceptedAuthorizationCount = this.#state.acceptedAuthorizationCount + 1;
    const auditSequence = this.#state.auditSequence + 1;
    const registryVersion = this.#state.registryVersion + (alreadyRevoked ? 0 : 1);
    const revokedStatusHandleCount = this.#state.revokedStatusHandleCount + (alreadyRevoked ? 0 : 1);
    const revokedRoot = computeStatusRegistryRootV1([...this.#revoked]);
    const auditCommitment = computeStatusRecordDigestV1({
      domain: "midnight:vc:status-audit:v1",
      previousAuditCommitment: this.#state.auditCommitment,
      auditSequence,
      acceptedAuthorizationCount,
      operation: request.operation,
      result: alreadyRevoked ? "already-revoked" : "revoked",
      authorizationDigest,
      authorityTranscriptDigest: decision.transcriptDigest,
      delegateGrantDigest: decision.delegateGrantDigest,
      previousRegistryVersion: this.#state.registryVersion,
      resultingRegistryVersion: registryVersion,
      previousRevokedStatusHandleCount: this.#state.revokedStatusHandleCount,
      resultingRevokedStatusHandleCount: revokedStatusHandleCount,
      previousRevokedRoot: this.#state.revokedRoot,
      resultingRevokedRoot: revokedRoot,
    });
    this.#state = this.#snapshot({
      initialized: true,
      controllerDid: this.#state.controllerDid,
      authorityGeneration: this.#state.authorityGeneration,
      registryVersion,
      revokedStatusHandleCount,
      revokedRoot,
      acceptedAuthorizationCount,
      auditSequence,
      auditCommitment,
    });
    return this.#accept(
      request,
      authorizationDigest,
      decision,
      alreadyRevoked ? "already-revoked" : "revoked",
    );
  }

  #accept(
    request: StatusRegistryAuthorizationRequestV1,
    authorizationDigest: StatusSha256DigestV1,
    decision: StatusRegistryGateDecisionV1,
    result: "initialized" | "revoked" | "already-revoked",
  ): StatusRegistryAuthorizationOutcomeV1 {
    const outcome: StatusRegistryAuthorizationOutcomeV1 = Object.freeze({
      status: "accepted",
      replay: false,
      receipt: this.#makeReceipt({
        request,
        authorizationDigest,
        result,
        reasonCodes: [],
        authorityTranscriptDigest: decision.transcriptDigest,
        delegateGrantDigest: decision.delegateGrantDigest,
        state: this.#state,
      }),
    });
    this.#receipts.set(this.#receiptKey(request), { authorizationDigest, outcome });
    return outcome;
  }
}
