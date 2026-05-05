/**
 * Synchronous per-collection state surface for the reference protocol layer.
 *
 * Durable adapters may sit on top of async backends internally, but the agent
 * seam exposed here is intentionally synchronous today. Callers should not
 * expect promise-based state access from this interface.
 */
export interface ProtocolStateCollection<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): boolean;
  deleteMany?(keys: readonly string[]): number;
  has(key: string): boolean;
  entries(): IterableIterator<[string, T]>;
}

/**
 * Synchronous named-collection store for protocol session state.
 */
export interface ProtocolStateStore {
  collection<T>(name: string): ProtocolStateCollection<T>;
}

/**
 * Synchronous byte-oriented collection surface used by codec-backed adapters.
 */
export interface ProtocolStateByteCollection {
  get(key: string): Uint8Array | undefined;
  set(key: string, value: Uint8Array): void;
  delete(key: string): boolean;
  deleteMany?(keys: readonly string[]): number;
  has(key: string): boolean;
  entries(): IterableIterator<[string, Uint8Array]>;
}

/**
 * Synchronous byte store for persistence layers that naturally store blobs.
 */
export interface ProtocolStateByteStore {
  collection(name: string): ProtocolStateByteCollection;
}

export interface ProtocolStateCodec<T> {
  encode(value: T): Uint8Array;
  decode(encodedValue: Uint8Array): T;
}

export interface ProtocolStateCodecResolver {
  getCodec<T>(collectionName: string): ProtocolStateCodec<T>;
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

  deleteMany(keys: readonly string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.backingMap.delete(key)) {
        deleted += 1;
      }
    }
    return deleted;
  }

  has(key: string): boolean {
    return this.backingMap.has(key);
  }

  entries(): IterableIterator<[string, T]> {
    return this.backingMap.entries();
  }
}

class InMemoryProtocolStateByteCollection
  implements ProtocolStateByteCollection
{
  constructor(private readonly backingMap: Map<string, Uint8Array>) {}

  get(key: string): Uint8Array | undefined {
    return this.backingMap.get(key);
  }

  set(key: string, value: Uint8Array): void {
    this.backingMap.set(key, value);
  }

  delete(key: string): boolean {
    return this.backingMap.delete(key);
  }

  deleteMany(keys: readonly string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.backingMap.delete(key)) {
        deleted += 1;
      }
    }
    return deleted;
  }

  has(key: string): boolean {
    return this.backingMap.has(key);
  }

  entries(): IterableIterator<[string, Uint8Array]> {
    return this.backingMap.entries();
  }
}

class CodecBackedProtocolStateCollection<T>
  implements ProtocolStateCollection<T>
{
  constructor(
    private readonly byteCollection: ProtocolStateByteCollection,
    private readonly codec: ProtocolStateCodec<T>,
  ) {}

  get(key: string): T | undefined {
    const encodedValue = this.byteCollection.get(key);
    return encodedValue === undefined
      ? undefined
      : this.codec.decode(encodedValue);
  }

  set(key: string, value: T): void {
    this.byteCollection.set(key, this.codec.encode(value));
  }

  delete(key: string): boolean {
    return this.byteCollection.delete(key);
  }

  deleteMany(keys: readonly string[]): number {
    return this.byteCollection.deleteMany
      ? this.byteCollection.deleteMany(keys)
      : keys.reduce((deleted, key) => deleted + Number(this.delete(key)), 0);
  }

  has(key: string): boolean {
    return this.byteCollection.has(key);
  }

  *entries(): IterableIterator<[string, T]> {
    for (const [key, encodedValue] of this.byteCollection.entries()) {
      yield [key, this.codec.decode(encodedValue)];
    }
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

export class InMemoryProtocolStateByteStore implements ProtocolStateByteStore {
  private readonly collections = new Map<string, Map<string, Uint8Array>>();

  collection(name: string): ProtocolStateByteCollection {
    const existing = this.collections.get(name);
    if (existing) {
      return new InMemoryProtocolStateByteCollection(existing);
    }

    const created = new Map<string, Uint8Array>();
    this.collections.set(name, created);
    return new InMemoryProtocolStateByteCollection(created);
  }
}

export class CodecBackedProtocolStateStore implements ProtocolStateStore {
  constructor(
    private readonly byteStore: ProtocolStateByteStore,
    private readonly codecResolver: ProtocolStateCodecResolver,
  ) {}

  collection<T>(name: string): ProtocolStateCollection<T> {
    return new CodecBackedProtocolStateCollection(
      this.byteStore.collection(name),
      this.codecResolver.getCodec<T>(name),
    );
  }
}

export const createCodecBackedProtocolStateStore = (
  byteStore: ProtocolStateByteStore,
  codecResolver: ProtocolStateCodecResolver,
): ProtocolStateStore =>
  new CodecBackedProtocolStateStore(byteStore, codecResolver);

/**
 * Recover an append-only ordinal count from stored records when metadata lags
 * behind due to a partial write. The helper trusts the largest stored integer
 * key and writes the repaired count back into metadata when needed.
 */
export const recoverAppendOnlyOrdinalCount = <T>(
  metadataCollection: ProtocolStateCollection<number>,
  countKey: string,
  valueCollection: ProtocolStateCollection<T>,
): number => {
  const recordedCount = metadataCollection.get(countKey) ?? 0;
  let recoveredCount = recordedCount;
  for (const [key] of valueCollection.entries()) {
    const index = Number(key);
    if (Number.isInteger(index) && index >= recoveredCount) {
      recoveredCount = index + 1;
    }
  }
  if (recoveredCount !== recordedCount) {
    metadataCollection.set(countKey, recoveredCount);
  }
  return recoveredCount;
};

export const resolveCurrentTimeMs = (value?: bigint): bigint =>
  value ?? BigInt(Date.now());

const deleteProtocolStateKeys = <T>(
  collection: ProtocolStateCollection<T>,
  keys: readonly string[],
): number =>
  collection.deleteMany
    ? collection.deleteMany(keys)
    : keys.reduce((deleted, key) => deleted + Number(collection.delete(key)), 0);

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
  // A finalized outcome may be written only after the correlated request or
  // submission has already expired. Once the outcome exists, that past expiry
  // should not immediately erase replay/idempotency state; only future expiry
  // bounds are meaningful at this point.
  if (explicitExpiresAtMs <= currentTimeMs) {
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
  const expiredKeys = Array.from(collection.entries(), ([key, retained]) =>
    retained.expiresAtMs !== undefined && currentTimeMs > retained.expiresAtMs
      ? key
      : undefined,
  ).filter((key): key is string => key !== undefined);
  deleteProtocolStateKeys(collection, expiredKeys);
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
  if (
    policy.maxFinalizedOutcomes !== undefined &&
    policy.maxFinalizedOutcomes <= 0
  ) {
    collection.delete(key);
    return;
  }

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

  const evictionCandidates = retainedEntries
    .filter(([entryKey]) => entryKey !== key)
    .sort((a, b) => {
      if (a[1].storedAtMs === b[1].storedAtMs) {
        return a[0].localeCompare(b[0]);
      }
      return a[1].storedAtMs < b[1].storedAtMs ? -1 : 1;
    });

  const evictionsFromOtherEntries = overflow < evictionCandidates.length
    ? overflow
    : evictionCandidates.length;

  deleteProtocolStateKeys(
    collection,
    evictionCandidates
      .slice(0, evictionsFromOtherEntries)
      .map(([entryKey]) => entryKey),
  );

  if (overflow > evictionsFromOtherEntries) {
    collection.delete(key);
  }
};
