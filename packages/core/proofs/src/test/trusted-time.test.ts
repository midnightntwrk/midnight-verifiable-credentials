import { describe, expect, it, vi } from "vitest";

import {
  computeTrustedTimeAnchorDigestV1,
  computeTrustedTimeAuthorityPolicyDigestV1,
  computeTrustedTimeEvidenceDigestV1,
  computeTrustedTimeSequenceKeyDigestV1,
  computeTrustedTimeStatementDigestV1,
  createTrustedTimeAuthorityVerifierV1,
  type Sha256Digest,
  type TrustedTimeEvidenceV1,
  type TrustedTimePolicyV1,
  type TrustedTimeScopeV1,
  verifyTrustedTimeEvidenceV1,
} from "../index.js";

const digest = (character: string): Sha256Digest =>
  `sha256:${character.repeat(64)}` as Sha256Digest;

const scope: TrustedTimeScopeV1 = {
  network: "midnight:testnet",
  deployment: "contract:age-gate@1",
  requestDigest: digest("1"),
  challengeDigest: digest("2"),
  audienceDigest: digest("3"),
  originDigest: digest("4"),
  profile: "ledger-local-v1",
  freshnessPolicyDigest: digest("0"),
};

const policy: TrustedTimePolicyV1 = {
  formatVersion: 1,
  mode: "ledger",
  unit: "unix-seconds",
  sourcePolicyDigest: digest("5"),
  sequenceAuthority: "ledger-local",
  maximumEvidenceAge: 20,
  maximumFutureSkew: 2,
  minimumSequence: 0,
};

const evidence = async (
  overrides: Partial<TrustedTimeEvidenceV1> = {},
): Promise<TrustedTimeEvidenceV1> => {
  const statement = {
    formatVersion: 1 as const,
    scope,
    unit: "unix-seconds" as const,
    time: 100,
    issuedAt: 95,
    expiresAt: 120,
    sequence: 1,
    sourcePolicyDigest: policy.sourcePolicyDigest,
  };
  const anchor = {
    formatVersion: 1 as const,
    scope,
    unit: "unix-seconds" as const,
    time: 100,
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
    ...overrides,
  };
};

const anchorVerifier = {
  verify: vi.fn(async ({ evidence: value }: { evidence: TrustedTimeEvidenceV1 }) => ({
    status: "valid" as const,
    currentTime: value.anchor.time,
    anchorDigest: value.anchorDigest,
  })),
};

const verify = async (
  value: TrustedTimeEvidenceV1 | null,
  overrides: Partial<Parameters<typeof verifyTrustedTimeEvidenceV1>[0]> = {},
) =>
  verifyTrustedTimeEvidenceV1({
    policy,
    scope,
    evidence: value,
    anchorVerifier,
    ...overrides,
  });

describe("trusted time evidence v1", () => {
  it("accepts ledger evidence only through the execution-anchor adapter and returns a transcript-bound checkpoint", async () => {
    const value = await evidence();
    const result = await verify(value);

    expect(result).toMatchObject({
      status: "valid",
      accepted: true,
      authoritative: true,
      authority: "ledger-local",
      trustedTime: 100,
      reasonCodes: [],
      checkpoint: { sequence: 1, time: 100 },
    });
    expect(result.evidenceDigest).toBe(await computeTrustedTimeEvidenceDigestV1(value));
    expect(anchorVerifier.verify).toHaveBeenCalledOnce();
  });

  it("requires both #494 authority evidence and the exact attestor signature for challenge-bound time", async () => {
    const attestedScope = { ...scope, profile: "ledger-attested-v1" as const };
    const timeActor = {
      role: "verifier" as const,
      did: "did:midnight:testnet:time",
      methodId: "did:midnight:testnet:time#assert-1",
      keyFingerprint: digest("c"),
      relationship: "authentication" as const,
      stateVersion: "1",
      trustEpoch: "1",
    };
    const authorityPolicy = {
      formatVersion: 1 as const,
      profile: { id: attestedScope.profile, version: "1" },
      did: {
        method: "did:midnight",
        issuerRelationship: "assertionMethod",
        network: attestedScope.network,
        versionEvidence: "did-ledger-state-version-v1",
      },
      trust: {
        scope: "trusted-time",
        epochEvidence: "trust-registry-epoch-v1",
      },
      providers: {
        did: {
          requirementId: "did",
          role: "did-resolver",
          providerId: "fixture.did",
          providerVersion: "1",
          instanceId: "did:testnet",
        },
        trust: {
          requirementId: "trust",
          role: "trust-resolver",
          providerId: "fixture.trust",
          providerVersion: "1",
          instanceId: "trust:testnet",
        },
      },
      actors: [
        {
          ...timeActor,
          role: "issuer" as const,
          did: "did:midnight:testnet:issuer",
          methodId: "did:midnight:testnet:issuer#assert-1",
          keyFingerprint: digest("9"),
          relationship: "assertionMethod" as const,
        },
        {
          ...timeActor,
          role: "holder" as const,
          did: "did:midnight:testnet:holder",
          methodId: "did:midnight:testnet:holder#auth-1",
          keyFingerprint: digest("8"),
        },
        timeActor,
        {
          ...timeActor,
          role: "status" as const,
          did: "did:midnight:testnet:status",
          methodId: "did:midnight:testnet:status#invoke-1",
          keyFingerprint: digest("7"),
          relationship: "capabilityInvocation" as const,
        },
      ],
    };
    const selectedPolicyDigest = await computeTrustedTimeAuthorityPolicyDigestV1(
      authorityPolicy,
    );
    const attestedPolicy = {
      ...policy,
      mode: "authority-attested" as const,
      sourcePolicyDigest: selectedPolicyDigest,
      sequenceAuthority: timeActor.did,
    };
    const base = await evidence();
    const statement = {
      ...base.statement,
      scope: attestedScope,
      time: 80,
      issuedAt: 80,
      sourcePolicyDigest: selectedPolicyDigest,
    };
    const statementDigest = await computeTrustedTimeStatementDigestV1(statement);
    const anchor = {
      ...base.anchor,
      scope: attestedScope,
      sourcePolicyDigest: selectedPolicyDigest,
    };
    const attested = await evidence({
      mode: "authority-attested",
      statement,
      statementDigest,
      anchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(anchor),
      authority: {
        policy: authorityPolicy,
        context: {
          proofDigest: digest("d"),
          credentialDigest: digest("e"),
          presentationDigest: digest("f"),
          requestDigest: statementDigest,
        },
        signature: {
          formatVersion: 1,
          signerDid: timeActor.did,
          methodId: timeActor.methodId,
          keyFingerprint: timeActor.keyFingerprint,
          payloadDigest: statementDigest,
          signature: "attested-signature",
        },
      },
    });
    const options = {
      policy: attestedPolicy,
      scope: attestedScope,
      evidence: attested,
      anchorVerifier: {
        verify: async () => ({
          status: "valid" as const,
          currentTime: anchor.time,
          anchorDigest: attested.anchorDigest,
        }),
      },
      authorityVerifier: {
        selectedPolicy: authorityPolicy,
        verify: async () => ({
          status: "valid" as const,
          decisionStatus: "approved" as const,
          accepted: true,
          transcriptDigest: digest("a"),
        }) as never,
      },
      signatureVerifier: { verify: async () => true },
    };
    await expect(verifyTrustedTimeEvidenceV1(options)).resolves.toMatchObject({
      status: "valid",
      authority: "ledger-attested",
      trustedTime: 80,
    });

    const selectedVerifier = createTrustedTimeAuthorityVerifierV1({
      policy: attested.authority!.policy,
      didProvider: { resolve: async () => undefined },
      trustProvider: { resolve: async () => undefined },
    });
    const substitutedAuthorityPolicy = {
      ...attested.authority!.policy,
      trust: { ...attested.authority!.policy.trust, scope: "attacker" },
    };
    const selectedStatement = {
      ...statement,
      sourcePolicyDigest: selectedPolicyDigest,
    };
    const selectedStatementDigest = await computeTrustedTimeStatementDigestV1(
      selectedStatement,
    );
    const selectedAnchor = {
      ...anchor,
      sourcePolicyDigest: selectedPolicyDigest,
    };
    const policySubstitution = {
      ...attested,
      statement: selectedStatement,
      statementDigest: selectedStatementDigest,
      anchor: selectedAnchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(selectedAnchor),
      authority: {
        ...attested.authority!,
        policy: substitutedAuthorityPolicy,
        context: {
          ...attested.authority!.context,
          requestDigest: selectedStatementDigest,
        },
        signature: {
          ...attested.authority!.signature,
          payloadDigest: selectedStatementDigest,
        },
      },
    };
    await expect(
      verifyTrustedTimeEvidenceV1({
        ...options,
        policy: {
          ...attestedPolicy,
          sourcePolicyDigest: selectedPolicyDigest,
        },
        evidence: policySubstitution,
        authorityVerifier: selectedVerifier,
      }),
    ).resolves.toMatchObject({
      status: "invalid",
      reasonCodes: ["TRUSTED_TIME_AUTHORITY_MISMATCH"],
    });

    const futureBoundaryStatement = {
      ...statement,
      time: anchor.time + attestedPolicy.maximumFutureSkew,
      issuedAt: anchor.time + attestedPolicy.maximumFutureSkew,
    };
    const futureBoundaryDigest = await computeTrustedTimeStatementDigestV1(
      futureBoundaryStatement,
    );
    const futureBoundaryEvidence = {
      ...attested,
      statement: futureBoundaryStatement,
      statementDigest: futureBoundaryDigest,
      authority: {
        ...attested.authority!,
        context: {
          ...attested.authority!.context,
          requestDigest: futureBoundaryDigest,
        },
        signature: {
          ...attested.authority!.signature,
          payloadDigest: futureBoundaryDigest,
        },
      },
    };
    await expect(
      verifyTrustedTimeEvidenceV1({
        ...options,
        evidence: futureBoundaryEvidence,
      }),
    ).resolves.toMatchObject({
      status: "valid",
      trustedTime: futureBoundaryStatement.time,
    });

    await expect(
      verifyTrustedTimeEvidenceV1({
        ...options,
        signatureVerifier: { verify: async () => false },
      }),
    ).resolves.toMatchObject({
      status: "invalid",
      authority: "local-process",
      reasonCodes: ["TRUSTED_TIME_AUTHORITY_INVALID"],
    });
  });

  it.each([
    ["network", { network: "midnight:mainnet" }],
    ["deployment", { deployment: "contract:other@1" }],
    ["request", { requestDigest: digest("6") }],
    ["challenge", { challengeDigest: digest("7") }],
    ["audience", { audienceDigest: digest("8") }],
    ["origin", { originDigest: digest("9") }],
    ["profile", { profile: "ledger-attested-v1" as const }],
    ["freshness policy", { freshnessPolicyDigest: digest("b") }],
  ])("rejects cross-scope %s replay", async (_label, changed) => {
    const value = await evidence();
    const changedScope = { ...scope, ...changed };
    const changedStatement = { ...value.statement, scope: changedScope };
    const changedAnchor = { ...value.anchor, scope: changedScope };
    const replay = await evidence({
      statement: changedStatement,
      statementDigest: await computeTrustedTimeStatementDigestV1(changedStatement),
      anchor: changedAnchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(changedAnchor),
    });

    await expect(verify(replay)).resolves.toMatchObject({
      status: "invalid",
      accepted: false,
      authority: "local-process",
      reasonCodes: ["TRUSTED_TIME_SCOPE_MISMATCH"],
    });
  });

  it("accepts inclusive age/future boundaries and rejects stale, future, expired, rollback, and replayed evidence", async () => {
    const value = await evidence();
    expect(await verify(value)).toMatchObject({ status: "valid" });

    const longLivedStatement = { ...value.statement, expiresAt: 200 };
    const staleAnchor = { ...value.anchor, time: 121 };
    const stale = await evidence({
      statement: longLivedStatement,
      statementDigest: await computeTrustedTimeStatementDigestV1(longLivedStatement),
      anchor: staleAnchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(staleAnchor),
    });
    expect(await verify(stale)).toMatchObject({
      status: "invalid",
      reasonCodes: ["TRUSTED_TIME_STALE"],
    });

    const expiredAnchor = { ...value.anchor, time: 121 };
    const expired = await evidence({
      anchor: expiredAnchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(expiredAnchor),
    });
    expect(await verify(expired)).toMatchObject({
      status: "invalid",
      reasonCodes: ["TRUSTED_TIME_EXPIRED"],
    });

    const futureStatement = { ...value.statement, time: 103, issuedAt: 103 };
    const future = await evidence({
      statement: futureStatement,
      statementDigest: await computeTrustedTimeStatementDigestV1(futureStatement),
    });
    expect(await verify(future)).toMatchObject({
      status: "invalid",
      reasonCodes: ["TRUSTED_TIME_FUTURE"],
    });

    const previous = {
      sequenceKeyDigest: await computeTrustedTimeSequenceKeyDigestV1({
        formatVersion: 1,
        network: scope.network,
        deployment: scope.deployment,
        authority: policy.sequenceAuthority,
        sourcePolicyDigest: policy.sourcePolicyDigest,
      }),
      sourcePolicyDigest: policy.sourcePolicyDigest,
      sequence: 2,
      time: 101,
      evidenceDigest: digest("b"),
    };
    expect(await verify(value, { previousCheckpoint: previous })).toMatchObject({
      status: "invalid",
      reasonCodes: ["TRUSTED_TIME_ROLLBACK"],
    });
    const replayDigest = await computeTrustedTimeEvidenceDigestV1(value);
    expect(
      await verify(value, {
        previousCheckpoint: { ...previous, sequence: 1, time: 100, evidenceDigest: replayDigest },
      }),
    ).toMatchObject({ status: "invalid", reasonCodes: ["TRUSTED_TIME_REPLAYED"] });

    const requestAStatement = { ...value.statement, sequence: 10 };
    const requestAEvidence = await evidence({
      statement: requestAStatement,
      statementDigest: await computeTrustedTimeStatementDigestV1(requestAStatement),
    });
    const acceptedRequestA = await verify(requestAEvidence);
    expect(acceptedRequestA).toMatchObject({
      status: "valid",
      checkpoint: { sequence: 10 },
    });

    const requestBScope = {
      ...scope,
      requestDigest: digest("6"),
      challengeDigest: digest("7"),
    };
    const requestBStatement = {
      ...value.statement,
      scope: requestBScope,
      sequence: 9,
    };
    const requestBAnchor = { ...value.anchor, scope: requestBScope };
    const requestBEvidence = await evidence({
      statement: requestBStatement,
      statementDigest: await computeTrustedTimeStatementDigestV1(requestBStatement),
      anchor: requestBAnchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(requestBAnchor),
    });
    expect(
      await verify(requestBEvidence, {
        scope: requestBScope,
        previousCheckpoint: acceptedRequestA.checkpoint,
      }),
    ).toMatchObject({
      status: "invalid",
      reasonCodes: ["TRUSTED_TIME_ROLLBACK"],
    });
  });

  it("fails malformed and unavailable evidence closed without authority upgrades", async () => {
    expect(await verify(null)).toMatchObject({
      status: "indeterminate",
      accepted: false,
      authority: "local-process",
      reasonCodes: ["TRUSTED_TIME_EVIDENCE_UNAVAILABLE"],
    });
    const value = await evidence({ formatVersion: 2 as 1 });
    expect(await verify(value)).toMatchObject({
      status: "malformed",
      accepted: false,
      authority: "local-process",
      reasonCodes: ["MALFORMED_TRUSTED_TIME_EVIDENCE"],
    });
    const attestedScope = { ...scope, profile: "ledger-attested-v1" as const };
    const base = await evidence();
    const statement = { ...base.statement, scope: attestedScope };
    const anchor = { ...base.anchor, scope: attestedScope };
    const malformedAuthority = await evidence({
      mode: "authority-attested",
      statement,
      statementDigest: await computeTrustedTimeStatementDigestV1(statement),
      anchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(anchor),
      authority: {} as never,
    });
    const malformedOptions = {
      policy: {
        ...policy,
        mode: "authority-attested" as const,
        sequenceAuthority: "did:midnight:testnet:time",
      },
      scope: attestedScope,
      anchorVerifier,
    };
    await expect(
      verifyTrustedTimeEvidenceV1({
        ...malformedOptions,
        evidence: malformedAuthority,
      }),
    ).resolves.toMatchObject({
      status: "malformed",
      reasonCodes: ["MALFORMED_TRUSTED_TIME_EVIDENCE"],
    });

    const nestedMalformedAuthority = await evidence({
      mode: "authority-attested",
      statement,
      statementDigest: await computeTrustedTimeStatementDigestV1(statement),
      anchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(anchor),
      authority: {
        policy: { actors: [null] },
        context: {},
        signature: {
          formatVersion: 1,
          signerDid: "did:midnight:testnet:time",
          methodId: "did:midnight:testnet:time#assert-1",
          keyFingerprint: digest("c"),
          payloadDigest: await computeTrustedTimeStatementDigestV1(statement),
          signature: "attested-signature",
        },
      } as never,
    });
    await expect(
      verifyTrustedTimeEvidenceV1({
        ...malformedOptions,
        evidence: nestedMalformedAuthority,
        authorityVerifier: {
          selectedPolicy: {} as never,
          verify: async () => {
            throw new Error("malformed evidence must not reach authority adapters");
          },
        },
        signatureVerifier: { verify: async () => true },
      }),
    ).resolves.toMatchObject({
      status: "malformed",
      reasonCodes: ["MALFORMED_TRUSTED_TIME_EVIDENCE"],
    });
    expect(
      await verify(await evidence(), {
        anchorVerifier: { verify: async () => ({ status: "indeterminate" as const }) },
      }),
    ).toMatchObject({
      status: "indeterminate",
      reasonCodes: ["TRUSTED_TIME_ANCHOR_UNAVAILABLE"],
    });
  });

  it("permits caller/reference time only for the explicit off-chain profile", async () => {
    const localScope = { ...scope, profile: "offchain-public-v1" as const };
    const localPolicy = { ...policy, mode: "local-reference" as const };
    const base = await evidence();
    const statement = { ...base.statement, scope: localScope };
    const anchor = { ...base.anchor, scope: localScope };
    const localEvidence = await evidence({
      mode: "local-reference",
      statement,
      statementDigest: await computeTrustedTimeStatementDigestV1(statement),
      anchor,
      anchorDigest: await computeTrustedTimeAnchorDigestV1(anchor),
    });
    expect(
      await verifyTrustedTimeEvidenceV1({
        policy: localPolicy,
        scope: localScope,
        evidence: localEvidence,
      }),
    ).toMatchObject({
      status: "valid",
      accepted: true,
      authoritative: false,
      authority: "local-process",
    });
    expect(
      await verifyTrustedTimeEvidenceV1({
        policy: localPolicy,
        scope,
        evidence: localEvidence,
      }),
    ).toMatchObject({ status: "invalid", accepted: false });
  });
});
