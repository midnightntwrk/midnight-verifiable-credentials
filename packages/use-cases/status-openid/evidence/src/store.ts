import { createHash, timingSafeEqual } from "node:crypto";

import type { TrustedTimeCheckpointV1 } from "@midnight-ntwrk/credential-proofs";
import type { OpenIdReplayStore } from "@midnight-ntwrk/midnight-did-credentials-openid";

export type StoredDecisionInput = {
  readonly decisionNullifier: Uint8Array;
  readonly transcriptDigest: Uint8Array;
  readonly outcome: "access-granted";
};

export type StoredDecisionResult = {
  readonly classification: "applied" | "replay";
  readonly atomicMutation: "committed" | "none";
  readonly transactionDigest: Uint8Array;
};

type SerializedState = {
  readonly formatVersion: 1;
  readonly replayKeys: readonly [string, number][];
  readonly issuances: readonly [string, { digest: string; value: unknown }][];
  readonly decisions: readonly [string, { transcriptDigest: string; outcome: "access-granted"; transactionDigest: string }][];
  readonly trustedTimeCheckpoint: TrustedTimeCheckpointV1 | null;
};

const bytes = (value: Uint8Array): string => Buffer.from(value).toString("base64url");
const fromBytes = (value: string): Uint8Array => new Uint8Array(Buffer.from(value, "base64url"));
const equalBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length && timingSafeEqual(left, right);
const transactionDigest = (nullifier: Uint8Array): Uint8Array =>
  new Uint8Array(createHash("sha256").update("synthetic:harbor-access:transaction:v1").update(nullifier).digest());

/**
 * Synthetic durable adapter used to prove restart, idempotency, replay, and
 * atomic-decision semantics. A real deployment must replace it transactionally.
 */
export class InMemoryStatusOpenIdEvidenceStore implements OpenIdReplayStore {
  readonly #replayKeys = new Map<string, number>();
  readonly #issuances = new Map<string, { digest: string; value: unknown }>();
  readonly #decisions = new Map<string, { transcriptDigest: Uint8Array; outcome: "access-granted"; transactionDigest: Uint8Array }>();
  #trustedTimeCheckpoint: TrustedTimeCheckpointV1 | null = null;

  consume(key: string, expiresAt: number): boolean {
    if (this.#replayKeys.has(key)) return false;
    this.#replayKeys.set(key, expiresAt);
    return true;
  }

  async commitIssuance<T>(key: string, digest: string, value: T): Promise<{
    readonly classification: "applied" | "replay";
    readonly value: T;
  }> {
    const existing = this.#issuances.get(key);
    if (existing !== undefined) {
      if (existing.digest !== digest) throw new Error("issuance idempotency conflict");
      return { classification: "replay", value: globalThis.structuredClone(existing.value) as T };
    }
    this.#issuances.set(key, { digest, value: globalThis.structuredClone(value) });
    return { classification: "applied", value: globalThis.structuredClone(value) };
  }

  readIssuance<T>(key: string, digest: string): { readonly classification: "replay"; readonly value: T } | null {
    const existing = this.#issuances.get(key);
    if (existing === undefined) return null;
    if (existing.digest !== digest) throw new Error("issuance idempotency conflict");
    return { classification: "replay", value: globalThis.structuredClone(existing.value) as T };
  }

  async commitDecision(input: StoredDecisionInput): Promise<StoredDecisionResult> {
    const key = bytes(input.decisionNullifier);
    const existing = this.#decisions.get(key);
    if (existing !== undefined) {
      if (!equalBytes(existing.transcriptDigest, input.transcriptDigest) || existing.outcome !== input.outcome) {
        throw new Error("atomic decision conflict");
      }
      return { classification: "replay", atomicMutation: "none", transactionDigest: Uint8Array.from(existing.transactionDigest) };
    }
    const transaction = transactionDigest(input.decisionNullifier);
    // One Map write represents the synthetic transactional boundary: the
    // nullifier and business authorization become visible together.
    this.#decisions.set(key, {
      transcriptDigest: Uint8Array.from(input.transcriptDigest),
      outcome: input.outcome,
      transactionDigest: transaction,
    });
    return { classification: "applied", atomicMutation: "committed", transactionDigest: Uint8Array.from(transaction) };
  }

  hasDecision(nullifier: Uint8Array, transaction: Uint8Array): boolean {
    const existing = this.#decisions.get(bytes(nullifier));
    return existing !== undefined && equalBytes(existing.transactionDigest, transaction);
  }

  decisionCount(): number {
    return this.#decisions.size;
  }

  trustedTimeCheckpoint(): TrustedTimeCheckpointV1 | null {
    return this.#trustedTimeCheckpoint === null
      ? null
      : globalThis.structuredClone(this.#trustedTimeCheckpoint);
  }

  async commitTrustedTimeCheckpoint(checkpoint: TrustedTimeCheckpointV1): Promise<void> {
    const previous = this.#trustedTimeCheckpoint;
    if (previous !== null && (
      previous.sequenceKeyDigest !== checkpoint.sequenceKeyDigest ||
      previous.sourcePolicyDigest !== checkpoint.sourcePolicyDigest ||
      checkpoint.sequence <= previous.sequence ||
      checkpoint.time < previous.time
    )) {
      throw new Error("trusted time checkpoint replay or rollback");
    }
    this.#trustedTimeCheckpoint = globalThis.structuredClone(checkpoint);
  }

  serialize(): string {
    const state: SerializedState = {
      formatVersion: 1,
      replayKeys: [...this.#replayKeys.entries()],
      issuances: [...this.#issuances.entries()].map(([key, entry]) => [key, globalThis.structuredClone(entry)]),
      decisions: [...this.#decisions.entries()].map(([key, entry]) => [key, {
        transcriptDigest: bytes(entry.transcriptDigest),
        outcome: entry.outcome,
        transactionDigest: bytes(entry.transactionDigest),
      }]),
      trustedTimeCheckpoint: this.trustedTimeCheckpoint(),
    };
    return JSON.stringify(state);
  }

  static fromSerialized(serialized: string): InMemoryStatusOpenIdEvidenceStore {
    const state = JSON.parse(serialized) as SerializedState;
    if (state.formatVersion !== 1) throw new Error("unsupported evidence store format");
    const store = new InMemoryStatusOpenIdEvidenceStore();
    for (const [key, expiresAt] of state.replayKeys) store.#replayKeys.set(key, expiresAt);
    for (const [key, issuance] of state.issuances) store.#issuances.set(key, globalThis.structuredClone(issuance));
    for (const [key, decision] of state.decisions) store.#decisions.set(key, {
      transcriptDigest: fromBytes(decision.transcriptDigest),
      outcome: decision.outcome,
      transactionDigest: fromBytes(decision.transactionDigest),
    });
    store.#trustedTimeCheckpoint = state.trustedTimeCheckpoint === null
      ? null
      : globalThis.structuredClone(state.trustedTimeCheckpoint);
    return store;
  }
}
