import { Buffer } from "node:buffer";
import {
  existsSync,
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

let tempWriteCounter = 0;

const isMissingFileError = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

class FileSystemProtocolStateByteCollection
  implements ProtocolStateByteCollection
{
  constructor(private readonly collectionDir: string) {
    mkdirSync(this.collectionDir, { recursive: true });
  }

  private filePathFor(key: string): string {
    return join(this.collectionDir, `${encodePathSegment(key)}.bin`);
  }

  private nextTempPath(filePath: string): string {
    tempWriteCounter += 1;
    return `${filePath}.tmp-${process.pid}-${Date.now()}-${tempWriteCounter}`;
  }

  private entryPath(entryName: string): string {
    return join(this.collectionDir, entryName);
  }

  get(key: string): Uint8Array | undefined {
    try {
      return readFileSync(this.filePathFor(key));
    } catch (error) {
      if (isMissingFileError(error)) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * This adapter is restart-safe for ordinary process restarts, but it remains
   * reference-grade: it does not fsync file and directory metadata for crash
   * consistency under abrupt power loss.
   */
  set(key: string, value: Uint8Array): void {
    const filePath = this.filePathFor(key);
    const tempPath = this.nextTempPath(filePath);
    writeFileSync(tempPath, value);
    renameSync(tempPath, filePath);
  }

  delete(key: string): boolean {
    try {
      rmSync(this.filePathFor(key));
      return true;
    } catch (error) {
      if (isMissingFileError(error)) {
        return false;
      }
      throw error;
    }
  }

  deleteMany(keys: readonly string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleted += 1;
      }
    }
    return deleted;
  }

  has(key: string): boolean {
    return existsSync(this.filePathFor(key));
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
      try {
        yield [key, readFileSync(this.entryPath(entry.name))];
      } catch (error) {
        if (isMissingFileError(error)) {
          continue;
        }
        throw error;
      }
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
