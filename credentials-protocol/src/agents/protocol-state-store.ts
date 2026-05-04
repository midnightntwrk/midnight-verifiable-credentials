export interface ProtocolStateCollection<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): boolean;
  has(key: string): boolean;
  entries(): IterableIterator<[string, T]>;
}

export interface ProtocolStateStore {
  collection<T>(name: string): ProtocolStateCollection<T>;
}

export type ProtocolStateRetentionPolicy = {
  /**
   * Optional retention window for finalized protocol outcomes.
   * A value of `0n` means the record expires immediately after the write-time
   * instant and will disappear on the next strictly later read/prune.
   */
  readonly finalizedOutcomeTtlMs?: bigint;
  /**
   * Optional cap on retained finalized outcomes inside one collection.
   * Values less than or equal to zero effectively retain no finalized records.
   */
  readonly maxFinalizedOutcomes?: number;
};

export type RetainedProtocolState<T> = {
  readonly value: T;
  readonly storedAtMs: bigint;
  readonly expiresAtMs?: bigint;
};

class InMemoryProtocolStateCollection<T> implements ProtocolStateCollection<T> {
  constructor(private readonly backingMap: Map<string, T>) {}

  get(key: string): T | undefined {
    return this.backingMap.get(key);
  }

  set(key: string, value: T): void {
    this.backingMap.set(key, value);
  }

  delete(key: string): boolean {
    return this.backingMap.delete(key);
  }

  has(key: string): boolean {
    return this.backingMap.has(key);
  }

  entries(): IterableIterator<[string, T]> {
    return this.backingMap.entries();
  }
}

export class InMemoryProtocolStateStore implements ProtocolStateStore {
  private readonly collections = new Map<string, Map<string, unknown>>();

  collection<T>(name: string): ProtocolStateCollection<T> {
    const existing = this.collections.get(name);
    if (existing) {
      return new InMemoryProtocolStateCollection(existing as Map<string, T>);
    }

    const created = new Map<string, T>();
    this.collections.set(name, created as Map<string, unknown>);
    return new InMemoryProtocolStateCollection(created);
  }
}

const resolveExpirationMs = (
  currentTimeMs: bigint,
  policy: ProtocolStateRetentionPolicy,
  explicitExpiresAtMs?: bigint,
): bigint | undefined => {
  const ttlExpiresAtMs =
    policy.finalizedOutcomeTtlMs !== undefined
      ? currentTimeMs + policy.finalizedOutcomeTtlMs
      : undefined;

  if (explicitExpiresAtMs === undefined) {
    return ttlExpiresAtMs;
  }
  if (ttlExpiresAtMs === undefined) {
    return explicitExpiresAtMs;
  }
  return explicitExpiresAtMs < ttlExpiresAtMs
    ? explicitExpiresAtMs
    : ttlExpiresAtMs;
};

export const readRetainedProtocolState = <T>(
  collection: ProtocolStateCollection<RetainedProtocolState<T>>,
  key: string,
  currentTimeMs: bigint,
): T | undefined => {
  const retained = collection.get(key);
  if (!retained) {
    return undefined;
  }
  if (
    retained.expiresAtMs !== undefined &&
    currentTimeMs > retained.expiresAtMs
  ) {
    collection.delete(key);
    return undefined;
  }
  return retained.value;
};

export const pruneExpiredRetainedProtocolState = <T>(
  collection: ProtocolStateCollection<RetainedProtocolState<T>>,
  currentTimeMs: bigint,
): void => {
  // Reference-grade pruning currently relies on collection scans. Persistent
  // adapters may want to implement equivalent retention more efficiently.
  for (const [key, retained] of collection.entries()) {
    if (
      retained.expiresAtMs !== undefined &&
      currentTimeMs > retained.expiresAtMs
    ) {
      collection.delete(key);
    }
  }
};

export const writeRetainedProtocolState = <T>(
  collection: ProtocolStateCollection<RetainedProtocolState<T>>,
  key: string,
  value: T,
  currentTimeMs: bigint,
  policy: ProtocolStateRetentionPolicy,
  explicitExpiresAtMs?: bigint,
): void => {
  // Reference-grade retention currently uses full collection iteration for TTL
  // cleanup and oldest-first eviction. Persistent adapters can preserve the
  // same semantics behind a more efficient storage-native implementation.
  pruneExpiredRetainedProtocolState(collection, currentTimeMs);

  collection.set(key, {
    value,
    storedAtMs: currentTimeMs,
    expiresAtMs: resolveExpirationMs(
      currentTimeMs,
      policy,
      explicitExpiresAtMs,
    ),
  });

  if (policy.maxFinalizedOutcomes === undefined) {
    return;
  }

  const retainedEntries = Array.from(collection.entries());
  const overflow = retainedEntries.length - policy.maxFinalizedOutcomes;
  if (overflow <= 0) {
    return;
  }

  retainedEntries
    .sort((a, b) => {
      if (a[1].storedAtMs === b[1].storedAtMs) {
        return a[0].localeCompare(b[0]);
      }
      return a[1].storedAtMs < b[1].storedAtMs ? -1 : 1;
    })
    .slice(0, overflow)
    .forEach(([entryKey]) => {
      collection.delete(entryKey);
    });
};
