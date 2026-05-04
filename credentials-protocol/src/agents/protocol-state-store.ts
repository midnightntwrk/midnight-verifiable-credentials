export interface ProtocolStateCollection<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): boolean;
  has(key: string): boolean;
}

export interface ProtocolStateStore {
  collection<T>(name: string): ProtocolStateCollection<T>;
}

class InMemoryProtocolStateCollection<T> implements ProtocolStateCollection<T> {
  constructor(private readonly entries: Map<string, T>) {}

  get(key: string): T | undefined {
    return this.entries.get(key);
  }

  set(key: string, value: T): void {
    this.entries.set(key, value);
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  has(key: string): boolean {
    return this.entries.has(key);
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
