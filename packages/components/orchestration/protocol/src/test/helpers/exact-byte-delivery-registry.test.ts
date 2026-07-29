import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { FileSystemProtocolStateByteStore } from "../../adapters/file-protocol-state-store.js";
import {
  AtomicProtocolStateUnavailableError,
  ExactByteProtocolDeliveryRegistry,
  ProtocolDeliveryRegistrationContentionError,
  ProtocolMessageIdReuseError,
} from "../../agents/exact-byte-delivery-registry.js";
import {
  InMemoryProtocolStateByteStore,
  type ProtocolStateByteStore,
} from "../../agents/protocol-state-store.js";

type ChildRegistrationResult = {
  readonly index: number;
  readonly payload: string;
  readonly outcome?: "accepted" | "duplicate";
  readonly errorName?: string;
};

const waitForReadyChildren = async (
  readyDir: string,
  expectedCount: number,
): Promise<void> => {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (readdirSync(readyDir).length === expectedCount) {
      return;
    }
    await delay(10);
  }
  throw new Error(
    `Timed out waiting for ${expectedCount} registration workers.`,
  );
};

const raceFileBackedRegistrations = async (
  rootDir: string,
  payloads: readonly Uint8Array[],
): Promise<readonly ChildRegistrationResult[]> => {
  const readyDir = join(rootDir, "ready");
  const barrierPath = join(rootDir, "start");
  mkdirSync(readyDir);

  const adapterUrl = pathToFileURL(
    fileURLToPath(
      new URL("../../adapters/file-protocol-state-store.ts", import.meta.url),
    ),
  ).href;
  const registryUrl = pathToFileURL(
    fileURLToPath(
      new URL("../../agents/exact-byte-delivery-registry.ts", import.meta.url),
    ),
  ).href;
  const childScript = `
    import { existsSync, writeFileSync } from "node:fs";
    import { FileSystemProtocolStateByteStore } from ${JSON.stringify(adapterUrl)};
    import { ExactByteProtocolDeliveryRegistry } from ${JSON.stringify(registryUrl)};

    const index = Number(process.env.REGISTRATION_INDEX);
    const payload = process.env.REGISTRATION_PAYLOAD;
    const registry = new ExactByteProtocolDeliveryRegistry(
      new FileSystemProtocolStateByteStore(process.env.REGISTRATION_ROOT),
      "test:process-race",
    );
    writeFileSync(process.env.REGISTRATION_READY, "ready");
    while (!existsSync(process.env.REGISTRATION_BARRIER)) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }

    const result = { index, payload };
    try {
      result.outcome = registry.register(
        "shared-message-id",
        Buffer.from(payload, "base64"),
      );
    } catch (error) {
      result.errorName = error instanceof Error ? error.name : "UnknownError";
    }
    process.stdout.write(JSON.stringify(result));
  `;

  const childResults = payloads.map(
    (payload, index) =>
      new Promise<ChildRegistrationResult>((resolve, reject) => {
        const child = spawn(
          process.execPath,
          [
            "--no-warnings=ExperimentalWarning",
            "--experimental-transform-types",
            "--input-type=module",
            "--eval",
            childScript,
          ],
          {
            env: {
              ...process.env,
              REGISTRATION_BARRIER: barrierPath,
              REGISTRATION_INDEX: String(index),
              REGISTRATION_PAYLOAD: Buffer.from(payload).toString("base64"),
              REGISTRATION_READY: join(readyDir, String(index)),
              REGISTRATION_ROOT: rootDir,
            },
          },
        );
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", (chunk: string) => {
          stdout += chunk;
        });
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", (chunk: string) => {
          stderr += chunk;
        });
        child.on("error", reject);
        child.on("close", (exitCode) => {
          if (exitCode !== 0) {
            reject(
              new Error(
                `Registration worker ${index} exited with ${exitCode}: ${stderr}`,
              ),
            );
            return;
          }
          resolve(JSON.parse(stdout) as ChildRegistrationResult);
        });
      }),
  );

  const allChildResults = Promise.all(childResults);
  await waitForReadyChildren(readyDir, payloads.length);
  writeFileSync(barrierPath, "start");
  return allChildResults;
};

describe("ExactByteProtocolDeliveryRegistry", () => {
  it("accepts one exact payload, preserves its bytes, and rejects ID reuse", () => {
    const store = new InMemoryProtocolStateByteStore();
    const registry = new ExactByteProtocolDeliveryRegistry(
      store,
      "test:in-memory",
    );
    const originalBytes = new Uint8Array([1, 2, 3, 4]);
    const expectedBytes = new Uint8Array(originalBytes);

    expect(registry.register("message-1", originalBytes)).toBe("accepted");
    originalBytes[0] = 99;

    expect(registry.register("message-1", expectedBytes)).toBe("duplicate");
    expect(() =>
      registry.register("message-1", new Uint8Array([1, 2, 3, 5])),
    ).toThrow(ProtocolMessageIdReuseError);
    expect(store.collection("test:in-memory").get("message-1")).toEqual(
      expectedBytes,
    );
  });

  it("fails closed when a byte store lacks atomic create-if-absent", () => {
    const nonAtomicStore: ProtocolStateByteStore = {
      collection: () => ({
        get: () => undefined,
        set: () => undefined,
        delete: () => false,
        has: () => false,
        entries: () => new Map<string, Uint8Array>().entries(),
      }),
    };

    expect(
      () =>
        new ExactByteProtocolDeliveryRegistry(
          nonAtomicStore,
          "test:non-atomic",
        ),
    ).toThrow(AtomicProtocolStateUnavailableError);
  });

  it("validates collection names, message IDs, and exact message bytes", () => {
    const store = new InMemoryProtocolStateByteStore();

    expect(() => new ExactByteProtocolDeliveryRegistry(store, "")).toThrow(
      TypeError,
    );

    const registry = new ExactByteProtocolDeliveryRegistry(
      store,
      "test:guards",
    );
    expect(() => registry.register("", new Uint8Array([1]))).toThrow(TypeError);
    expect(() => registry.register("message-1", new Uint8Array())).toThrow(
      TypeError,
    );
  });

  it("reconciles an ambiguous atomic-write error against retained bytes", () => {
    const backingMap = new Map<string, Uint8Array>();
    const ambiguousStore: ProtocolStateByteStore = {
      collection: () => ({
        get: (key) => backingMap.get(key),
        set: (key, value) => backingMap.set(key, new Uint8Array(value)),
        setIfAbsent: (key, value) => {
          backingMap.set(key, new Uint8Array(value));
          throw new Error("storage acknowledgement lost");
        },
        delete: (key) => backingMap.delete(key),
        has: (key) => backingMap.has(key),
        entries: () => backingMap.entries(),
      }),
    };
    const registry = new ExactByteProtocolDeliveryRegistry(
      ambiguousStore,
      "test:ambiguous-write",
    );

    expect(registry.register("message-1", new Uint8Array([1, 2, 3]))).toBe(
      "duplicate",
    );
  });

  it("fails after bounded registration contention", () => {
    const contendedStore: ProtocolStateByteStore = {
      collection: () => ({
        get: () => undefined,
        set: () => undefined,
        setIfAbsent: () => false,
        delete: () => false,
        has: () => false,
        entries: () => new Map<string, Uint8Array>().entries(),
      }),
    };
    const registry = new ExactByteProtocolDeliveryRegistry(
      contendedStore,
      "test:contention",
    );

    expect(() =>
      registry.register("message-1", new Uint8Array([1])),
    ).toThrow(ProtocolDeliveryRegistrationContentionError);
  });

  it("recognizes exact duplicates and rejects conflicting bytes after restart", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-delivery-restart-"));

    try {
      const firstRegistry = new ExactByteProtocolDeliveryRegistry(
        new FileSystemProtocolStateByteStore(rootDir),
        "test:restart",
      );
      expect(
        firstRegistry.register("message-1", new Uint8Array([4, 5, 6])),
      ).toBe("accepted");

      const restartedRegistry = new ExactByteProtocolDeliveryRegistry(
        new FileSystemProtocolStateByteStore(rootDir),
        "test:restart",
      );
      expect(
        restartedRegistry.register("message-1", new Uint8Array([4, 5, 6])),
      ).toBe("duplicate");
      expect(() =>
        restartedRegistry.register(
          "message-1",
          new Uint8Array([4, 5, 6, 0]),
        ),
      ).toThrow(ProtocolMessageIdReuseError);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("preserves the first payload across independent store instances", () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-delivery-instances-"));

    try {
      const firstInstance = new ExactByteProtocolDeliveryRegistry(
        new FileSystemProtocolStateByteStore(rootDir),
        "test:instances",
      );
      const secondInstance = new ExactByteProtocolDeliveryRegistry(
        new FileSystemProtocolStateByteStore(rootDir),
        "test:instances",
      );

      expect(
        firstInstance.register("message-1", new Uint8Array([7, 8, 9])),
      ).toBe("accepted");
      expect(
        secondInstance.register("message-1", new Uint8Array([7, 8, 9])),
      ).toBe("duplicate");
      expect(() =>
        secondInstance.register("message-1", new Uint8Array([7, 8, 0])),
      ).toThrow(ProtocolMessageIdReuseError);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("creates private state directories and records under a permissive umask", () => {
    const parentDir = mkdtempSync(join(tmpdir(), "vc-delivery-permissions-"));
    const rootDir = join(parentDir, "nested", "state");
    const previousUmask = process.umask(0);

    try {
      const store = new FileSystemProtocolStateByteStore(rootDir);
      const registry = new ExactByteProtocolDeliveryRegistry(
        store,
        "test:permissions",
      );
      expect(
        registry.register("message-1", new Uint8Array([1, 2, 3])),
      ).toBe("accepted");

      const collectionDir = join(
        rootDir,
        Buffer.from("test:permissions", "utf8").toString("hex"),
      );
      const recordPath = join(
        collectionDir,
        `${Buffer.from("message-1", "utf8").toString("hex")}.bin`,
      );
      expect(statSync(rootDir).mode & 0o777).toBe(0o700);
      expect(statSync(collectionDir).mode & 0o777).toBe(0o700);
      expect(statSync(recordPath).mode & 0o777).toBe(0o600);
    } finally {
      process.umask(previousUmask);
      rmSync(parentDir, { recursive: true, force: true });
    }
  });

  it("rejects a file where the state root must be a directory", () => {
    const parentDir = mkdtempSync(join(tmpdir(), "vc-delivery-root-file-"));
    const rootPath = join(parentDir, "state");

    try {
      writeFileSync(rootPath, "not a directory");
      expect(() => new FileSystemProtocolStateByteStore(rootPath)).toThrow(
        /must be a directory/,
      );
    } finally {
      rmSync(parentDir, { recursive: true, force: true });
    }
  });

  it("allows one winner and deterministic duplicate/conflict outcomes in a process race", async () => {
    const rootDir = mkdtempSync(join(tmpdir(), "vc-delivery-race-"));
    const firstPayload = new Uint8Array([10, 11, 12]);
    const secondPayload = new Uint8Array([10, 11, 13]);
    const payloads = [
      firstPayload,
      secondPayload,
      firstPayload,
      secondPayload,
      firstPayload,
      secondPayload,
    ];

    try {
      const results = await raceFileBackedRegistrations(rootDir, payloads);
      const accepted = results.filter(
        (result) => result.outcome === "accepted",
      );
      expect(accepted).toHaveLength(1);

      const winningPayload = accepted[0].payload;
      for (const result of results) {
        if (result.payload === winningPayload) {
          expect(["accepted", "duplicate"]).toContain(result.outcome);
          expect(result.errorName).toBeUndefined();
        } else {
          expect(result.outcome).toBeUndefined();
          expect(result.errorName).toBe("ProtocolMessageIdReuseError");
        }
      }

      const restartedRegistry = new ExactByteProtocolDeliveryRegistry(
        new FileSystemProtocolStateByteStore(rootDir),
        "test:process-race",
      );
      expect(
        restartedRegistry.register(
          "shared-message-id",
          Buffer.from(winningPayload, "base64"),
        ),
      ).toBe("duplicate");
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  }, 20_000);
});
