import {
  computeTrustedTimeAnchorDigestV1,
  computeTrustedTimeEvidenceDigestV1,
  computeTrustedTimeSequenceKeyDigestV1,
  computeTrustedTimeStatementDigestV1,
  type Sha256Digest,
  type TrustedTimeCheckpointV1,
  type TrustedTimeEvidenceV1,
  type TrustedTimePolicyV1,
  type TrustedTimeScopeV1,
} from "@midnight-ntwrk/credential-proofs";
import { describe, expect, it } from "vitest";

import { createTrustedTimeStatusFreshnessVerifierV1 } from "../index.js";

const digest = (character: string): Sha256Digest =>
  `sha256:${character.repeat(64)}` as Sha256Digest;

const scope: TrustedTimeScopeV1 = {
  network: "midnight:testnet",
  deployment: "contract:status@1",
  requestDigest: digest("1"),
  challengeDigest: digest("2"),
  audienceDigest: digest("3"),
  originDigest: digest("4"),
  profile: "ledger-local-v1",
  freshnessPolicyDigest: digest("7"),
};
const policy: TrustedTimePolicyV1 = {
  formatVersion: 1,
  mode: "ledger",
  unit: "unix-seconds",
  sourcePolicyDigest: digest("5"),
  sequenceAuthority: "ledger-local",
  maximumEvidenceAge: 0,
  maximumFutureSkew: 0,
  minimumSequence: 0,
};
const binding = {
  formatVersion: 1 as const,
  network: scope.network,
  namespace: "birth-v1",
  registryId: "registry:birth",
  deployment: scope.deployment,
};

const trustedTime = async (time = 120): Promise<TrustedTimeEvidenceV1> => {
  const statement = {
    formatVersion: 1 as const,
    scope,
    unit: "unix-seconds" as const,
    time,
    issuedAt: time,
    expiresAt: time,
    sequence: 1,
    sourcePolicyDigest: policy.sourcePolicyDigest,
  };
  const anchor = {
    formatVersion: 1 as const,
    scope,
    unit: "unix-seconds" as const,
    time,
    sourcePolicyDigest: policy.sourcePolicyDigest,
  };
  return {
    formatVersion: 1,
    mode: "ledger",
    statement,
    statementDigest: await computeTrustedTimeStatementDigestV1(statement),
    anchor,
    anchorDigest: await computeTrustedTimeAnchorDigestV1(anchor),
    authority: null,
  };
};

const verify = async (input: {
  observedAt?: number;
  expiresAt?: number;
  evidence?: unknown;
  maximumStatusAge?: number;
  previousCheckpoint?: TrustedTimeCheckpointV1;
}) => {
  const verifier = createTrustedTimeStatusFreshnessVerifierV1({
    policy,
    scope,
    maximumStatusAge: input.maximumStatusAge ?? 20,
    previousCheckpoint: input.previousCheckpoint,
    anchorVerifier: {
      verify: async ({ evidence }) => ({
        status: "valid",
        currentTime: evidence.anchor.time,
        anchorDigest: evidence.anchorDigest,
      }),
    },
  });
  return verifier.verify({
    binding,
    root: digest("6"),
    registryVersion: 1,
    observedAt: input.observedAt ?? 100,
    expiresAt: input.expiresAt ?? 200,
    freshnessPolicyDigest: digest("7"),
    evidence: input.evidence,
  });
};

describe("trusted-time status freshness adapter", () => {
  it("accepts the exact maximum-age boundary and returns the trusted anchor digest", async () => {
    const evidence = await trustedTime();
    await expect(verify({ evidence })).resolves.toEqual({
      status: "valid",
      anchorDigest: evidence.anchorDigest,
    });
  });

  it("rejects future, stale, expired, mismatched, malformed, and replayed freshness evidence", async () => {
    const evidence = await trustedTime();
    await expect(verify({ observedAt: 121, evidence })).resolves.toMatchObject({
      status: "invalid",
    });
    await expect(verify({ observedAt: 99, evidence })).resolves.toMatchObject({
      status: "invalid",
    });
    await expect(verify({ expiresAt: 119, evidence })).resolves.toMatchObject({
      status: "invalid",
    });
    const otherScope = { ...scope, challengeDigest: digest("8") };
    const otherStatement = { ...evidence.statement, scope: otherScope };
    const otherAnchor = { ...evidence.anchor, scope: otherScope };
    await expect(
      verify({
        evidence: {
          ...evidence,
          statement: otherStatement,
          statementDigest: await computeTrustedTimeStatementDigestV1(otherStatement),
          anchor: otherAnchor,
          anchorDigest: await computeTrustedTimeAnchorDigestV1(otherAnchor),
        },
      }),
    ).resolves.toMatchObject({ status: "invalid" });
    await expect(verify({ evidence: { nope: true } })).resolves.toMatchObject({
      status: "invalid",
    });
    const evidenceDigest = await computeTrustedTimeEvidenceDigestV1(evidence);
    await expect(
      verify({
        evidence,
        previousCheckpoint: {
          sequenceKeyDigest: await computeTrustedTimeSequenceKeyDigestV1({
            formatVersion: 1,
            network: scope.network,
            deployment: scope.deployment,
            authority: policy.sequenceAuthority,
            sourcePolicyDigest: policy.sourcePolicyDigest,
          }),
          sourcePolicyDigest: policy.sourcePolicyDigest,
          sequence: evidence.statement.sequence,
          time: evidence.statement.time,
          evidenceDigest,
        },
      }),
    ).resolves.toMatchObject({ status: "invalid" });
  });

  it("returns indeterminate when required trusted-time evidence is unavailable", async () => {
    await expect(verify({ evidence: null })).resolves.toEqual({
      status: "indeterminate",
      anchorDigest: null,
    });
  });
});
