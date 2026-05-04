import { Buffer } from "node:buffer";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

import type {
  ProtocolStateByteCollection,
  ProtocolStateByteStore,
} from "../agents/protocol-state-store.js";

const encodePathSegment = (value: string): string =>
  Buffer.from(value, "utf8").toString("hex");

const decodePathSegment = (value: string): string =>
  Buffer.from(value, "hex").toString("utf8");

class FileSystemProtocolStateByteCollection
  implements ProtocolStateByteCollection
{
  constructor(private readonly collectionDir: string) {
    mkdirSync(this.collectionDir, { recursive: true });
  }

  private filePathFor(key: string): string {
    return join(this.collectionDir, `${encodePathSegment(key)}.bin`);
  }

  get(key: string): Uint8Array | undefined {
    try {
      return readFileSync(this.filePathFor(key));
    } catch {
      return undefined;
    }
  }

  set(key: string, value: Uint8Array): void {
    const filePath = this.filePathFor(key);
    const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tempPath, value);
    renameSync(tempPath, filePath);
  }

  delete(key: string): boolean {
    try {
      rmSync(this.filePathFor(key));
      return true;
    } catch {
      return false;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  *entries(): IterableIterator<[string, Uint8Array]> {
    for (const entry of readdirSync(this.collectionDir, {
      withFileTypes: true,
    })) {
      if (!entry.isFile() || !entry.name.endsWith(".bin")) {
        continue;
      }
      const encodedKey = entry.name.slice(0, -4);
      const key = decodePathSegment(encodedKey);
      yield [key, readFileSync(join(this.collectionDir, entry.name))];
    }
  }
}

export class FileSystemProtocolStateByteStore implements ProtocolStateByteStore {
  readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = resolve(rootDir);
    mkdirSync(this.rootDir, { recursive: true });
  }

  collection(name: string): ProtocolStateByteCollection {
    return new FileSystemProtocolStateByteCollection(
      join(this.rootDir, encodePathSegment(name)),
    );
  }
}
