import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import {
  chmodSync,
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

import type {
  ProtocolStateByteCollection,
  ProtocolStateByteStore,
} from "../agents/protocol-state-store.js";

const encodePathSegment = (value: string): string =>
  Buffer.from(value, "utf8").toString("hex");

const decodePathSegment = (value: string): string =>
  Buffer.from(value, "hex").toString("utf8");

const isMissingFileError = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

const isExistingFileError = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "EEXIST";

const ensureDirectoryExistsDurably = (directoryPath: string): void => {
  if (existsSync(directoryPath)) {
    return;
  }

  const parentDirectory = dirname(directoryPath);
  if (parentDirectory !== directoryPath) {
    ensureDirectoryExistsDurably(parentDirectory);
  }

  try {
    mkdirSync(directoryPath, { mode: 0o700 });
  } catch (error) {
    if (!isExistingFileError(error)) {
      throw error;
    }
    return;
  }
  syncDirectory(parentDirectory);
};

// NOTE: this fsync-on-directory pattern is aimed at the Linux/macOS class of
// local filesystems used by the current reference path. It is not meant as a
// cross-platform multi-process locking story, and Windows is currently out of
// scope for this durability claim.
const syncDirectory = (directoryPath: string): void => {
  const directoryFd = openSync(directoryPath, "r");
  try {
    fsyncSync(directoryFd);
  } finally {
    closeSync(directoryFd);
  }
};

const ensurePrivateDirectory = (directoryPath: string): void => {
  ensureDirectoryExistsDurably(directoryPath);
  if (!statSync(directoryPath).isDirectory()) {
    throw new TypeError(
      `Protocol state path "${directoryPath}" must be a directory.`,
    );
  }
  chmodSync(directoryPath, 0o700);
  syncDirectory(directoryPath);
};

const removeTemporaryFile = (tempPath: string): void => {
  try {
    rmSync(tempPath);
    syncDirectory(dirname(tempPath));
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }
};

const writeDurableTemporaryFile = (
  tempPath: string,
  value: Uint8Array,
): void => {
  const tempFd = openSync(tempPath, "wx", 0o600);
  try {
    try {
      writeFileSync(tempFd, value);
      fsyncSync(tempFd);
    } finally {
      closeSync(tempFd);
    }
  } catch (error) {
    removeTemporaryFile(tempPath);
    throw error;
  }
};

class FileSystemProtocolStateByteCollection
  implements ProtocolStateByteCollection
{
  constructor(private readonly collectionDir: string) {
    ensurePrivateDirectory(this.collectionDir);
  }

  private filePathFor(key: string): string {
    return join(this.collectionDir, `${encodePathSegment(key)}.bin`);
  }

  private nextTempPath(filePath: string): string {
    return `${filePath}.tmp-${randomBytes(16).toString("hex")}`;
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
   * This adapter is restart-safe for ordinary process restarts and explicitly
   * flushes both file contents and parent-directory metadata so the reference
   * path does not rely on rename-only semantics.
   */
  set(key: string, value: Uint8Array): void {
    const filePath = this.filePathFor(key);
    const tempPath = this.nextTempPath(filePath);
    writeDurableTemporaryFile(tempPath, value);
    renameSync(tempPath, filePath);
    syncDirectory(dirname(filePath));
  }

  /**
   * Publishes a fully flushed temporary file with an atomic hard-link create.
   * The final path therefore never exposes a partially written payload, and
   * exactly one process can win creation of a previously absent key.
   */
  setIfAbsent(key: string, value: Uint8Array): boolean {
    const filePath = this.filePathFor(key);
    const tempPath = this.nextTempPath(filePath);
    writeDurableTemporaryFile(tempPath, value);

    try {
      linkSync(tempPath, filePath);
    } catch (error) {
      removeTemporaryFile(tempPath);
      if (isExistingFileError(error)) {
        return false;
      }
      throw error;
    }

    try {
      removeTemporaryFile(tempPath);
    } catch {
      // The final hard link is already the committed record. A cleanup failure
      // may leave an ignored temp name, but must not relabel the winner as a
      // duplicate during the registry's ambiguous-write reconciliation.
    }
    syncDirectory(dirname(filePath));
    return true;
  }

  delete(key: string): boolean {
    try {
      const filePath = this.filePathFor(key);
      rmSync(filePath);
      syncDirectory(dirname(filePath));
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
      try {
        rmSync(this.filePathFor(key));
        deleted += 1;
      } catch (error) {
        if (!isMissingFileError(error)) {
          throw error;
        }
      }
    }
    if (deleted > 0) {
      syncDirectory(this.collectionDir);
    }
    return deleted;
  }

  has(key: string): boolean {
    return existsSync(this.filePathFor(key));
  }

  maxOrdinalKey(): number | undefined {
    let maxOrdinalKey: number | undefined;
    for (const entry of readdirSync(this.collectionDir, {
      withFileTypes: true,
    })) {
      if (!entry.isFile() || !entry.name.endsWith(".bin")) {
        continue;
      }
      const key = decodePathSegment(entry.name.slice(0, -4));
      const index = Number(key);
      if (!Number.isInteger(index)) {
        continue;
      }
      maxOrdinalKey =
        maxOrdinalKey === undefined ? index : Math.max(maxOrdinalKey, index);
    }
    return maxOrdinalKey;
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
    ensurePrivateDirectory(this.rootDir);
  }

  collection(name: string): ProtocolStateByteCollection {
    return new FileSystemProtocolStateByteCollection(
      join(this.rootDir, encodePathSegment(name)),
    );
  }
}
