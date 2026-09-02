import { createHash } from "node:crypto";

export * from "./authenticated-status.js";

import type {
  StatusEvidence,
  StatusReader,
  StatusReadResult,
} from "@midnight-ntwrk/credential-status";
import {
  computeStatusRecordDigestV1,
  computeStatusRegistryRootV1,
  type StatusRegistryBindingV1,
  type StatusRegistryStateV1,
  type StatusSha256DigestV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";

export interface StatusRegistryReaderV1 {
  readState(): StatusRegistryStateV1;
}

export const readStatusRegistryV1 = (
  reader: StatusRegistryReaderV1,
): StatusRegistryStateV1 => reader.readState();

export const deriveStatusHandleDigestV1 = (
  statusHandle: Uint8Array,
): StatusSha256DigestV1 =>
  `sha256:${createHash("sha256")
    .update("midnight:vc:status-handle:v1")
    .update(statusHandle)
    .digest("hex")}`;

export const midnightStatusTypeV1 = "midnight-status-registry-v1";

export const deriveStatusRegistryReferenceV1 = (
  binding: StatusRegistryBindingV1,
): StatusSha256DigestV1 => computeStatusRecordDigestV1({
  domain: "midnight:vc:status-registry-reference:v1",
  binding,
});

const handleBytes = (value: string | Uint8Array): Uint8Array =>
  typeof value === "string" ? new TextEncoder().encode(value) : value;

const hasAuthenticatedStateRoot = (state: StatusRegistryStateV1): boolean => {
  try {
    return state.revokedRoot === computeStatusRegistryRootV1(state.revokedStatusHandleDigests);
  } catch {
    return false;
  }
};

export const createMidnightStatusReaderV1 = (
  registry: StatusRegistryReaderV1,
): StatusReader => ({
  read: async (query): Promise<StatusReadResult> => {
    const state = registry.readState();
    if (
      !state.initialized ||
      state.controllerDid === null ||
      !hasAuthenticatedStateRoot(state)
    ) {
      return { kind: "unavailable", code: "statusStateUnavailable" };
    }
    const handle = query.binding.statusHandle;
    if (
      query.binding.mode !== "same-contract-live" ||
      !query.policy.acceptedModes.includes("same-contract-live") ||
      query.binding.statusType !== midnightStatusTypeV1 ||
      query.binding.statusReference !== deriveStatusRegistryReferenceV1(state.binding) ||
      handle === undefined
    ) {
      return { kind: "unavailable", code: "statusProofUnavailable" };
    }
    const statusHandleDigest = deriveStatusHandleDigestV1(handleBytes(handle));
    const evidence: StatusEvidence = {
      mode: "same-contract-live",
      state: state.revokedStatusHandleDigests.includes(statusHandleDigest)
        ? "revoked"
        : "active",
      version: BigInt(state.registryVersion),
      payload: {
        network: state.binding.network,
        namespace: state.binding.namespace,
        registryId: state.binding.registryId,
        deployment: state.binding.deployment,
        root: state.revokedRoot,
        authorityDid: state.controllerDid,
        auditCommitment: state.auditCommitment,
      },
    };
    return { kind: "evidence", evidence };
  },
});
