import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  createMidnightStatusReaderV1,
  deriveStatusHandleDigestV1,
  deriveStatusRegistryReferenceV1,
  midnightStatusTypeV1,
  readStatusRegistryV1,
} from "../index.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const state = {
  formatVersion: 1 as const,
  binding: {
    formatVersion: 1 as const,
    network: "midnight:testnet",
    namespace: "issuer:family:1:revoked-set",
    registryId: "registry:1",
    deployment: "contract:1",
  },
  initialized: true,
  controllerDid: "did:midnight:testnet:controller",
  authorityGeneration: 1,
  registryVersion: 2,
  revokedStatusHandleCount: 1,
  acceptedAuthorizationCount: 2,
  auditSequence: 2,
  auditCommitment: `sha256:${"a".repeat(64)}` as const,
  revokedStatusHandleDigests: [`sha256:${"b".repeat(64)}` as const],
};

describe("least-privilege status verifier", () => {
  it("reads contract state and derives witnesses without mutation authority", () => {
    expect(readStatusRegistryV1({ readState: () => state })).toEqual(state);
    expect(deriveStatusHandleDigestV1(new Uint8Array([1, 2, 3]))).toMatch(/^sha256:[0-9a-f]{64}$/u);
  });

  it("returns evidence only for the exact supported registry binding", async () => {
    const reader = createMidnightStatusReaderV1({ readState: () => state });
    const query = {
      binding: {
        mode: "same-contract-live" as const,
        statusType: midnightStatusTypeV1,
        statusReference: deriveStatusRegistryReferenceV1(state.binding),
        statusHandle: "credential-status-handle",
      },
      policy: {
        required: true,
        acceptedModes: ["same-contract-live" as const],
      },
    };

    await expect(reader.read(query)).resolves.toMatchObject({
      kind: "evidence",
      evidence: {
        mode: "same-contract-live",
        payload: { registryId: state.binding.registryId },
      },
    });

    for (const binding of [
      { ...query.binding, mode: "authority-attested" as const },
      { ...query.binding, statusType: "other-status-type" },
      { ...query.binding, statusReference: "sha256:unrelated-registry" },
    ]) {
      await expect(reader.read({ ...query, binding })).resolves.toEqual({
        kind: "unavailable",
        code: "statusProofUnavailable",
      });
    }
  });

  it("has no authority, signing, proof-evidence, or mutation dependency", () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(manifest.dependencies).sort()).toEqual([
      "@midnight-ntwrk/credential-status",
      "@midnight-ntwrk/credential-status-midnight-contract",
    ]);
    const root = readFileSync(path.join(packageRoot, "src/index.ts"), "utf8");
    expect(root).not.toMatch(/authority|sign|mutation|credential-proofs/iu);
  });
});
