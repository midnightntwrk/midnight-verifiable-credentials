import type { CredentialFamilyProfileV1 } from "@midnight-ntwrk/credential-model";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  asBytes32,
  type AuthenticatedVerificationProfileIdentityV1,
  compareVerificationParityV1,
  hashAnchorEvidenceReceiptV1,
  hashEvidenceBindingV1,
  hashVerificationTranscriptV1,
  type LedgerExecutionObservationV1,
  type LedgerVerificationExecutorV1,
  preflightVerification,
  type PreparedVerificationV1,
  prepareVerification,
  submitLedgerVerification,
  verificationDomainV1,
  type VerificationEvaluationV1,
  type VerificationFailureStageV1,
  type VerificationResultV1,
  verifyPublicOffchain,
} from "../index.js";
import type {
  AnchorEvidenceReceiptV1,
  EvidenceBindingV1,
  VerificationPublicInputsV1,
} from "../managed/credentials/contract/index.js";
import {
  createVerificationV1Fixture,
  digest,
} from "./verification-v1-fixtures.js";

setNetworkId("undeployed");

const clone = <T>(value: T): T => {
  if (value instanceof Uint8Array) return Uint8Array.from(value) as T;
  if (Array.isArray(value)) return value.map(clone) as T;
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, clone(entry)]),
    ) as T;
  }
  return value;
};

const acceptedEvidence = (
  source: EvidenceBindingV1,
  mode: 2n | 3n | 4n,
  label: string,
): EvidenceBindingV1 => ({
  ...source,
  mode,
  authorityDigest: digest(`${label}:authority`),
  subjectDigest: digest(`${label}:subject`),
  stateAnchorDigest: digest(`${label}:anchor`),
  statementDigest: digest(`${label}:statement`),
  createdAt: 1_800_000_000n,
  expiresAt: 1_900_000_000n,
});

const unavailableEvidence = (
  source: EvidenceBindingV1,
  label: string,
): EvidenceBindingV1 => ({
  ...source,
  mode: 1n,
  authorityDigest: new Uint8Array(32),
  subjectDigest: digest(`${label}:subject`),
  stateAnchorDigest: new Uint8Array(32),
  statementDigest: new Uint8Array(32),
  createdAt: 0n,
  expiresAt: 0n,
});

const notRequiredEvidence = (source: EvidenceBindingV1): EvidenceBindingV1 => ({
  ...source,
  mode: 0n,
  authorityDigest: new Uint8Array(32),
  subjectDigest: new Uint8Array(32),
  stateAnchorDigest: new Uint8Array(32),
  statementDigest: new Uint8Array(32),
  createdAt: 0n,
  expiresAt: 0n,
});

const bindRequiredEvidence = (
  inputs: VerificationPublicInputsV1,
  mode: 0n | 1n | 2n | 3n | 4n,
): void => {
  for (const evidenceClass of ["issuer", "trust", "artifact"] as const) {
    const key = `${evidenceClass}Evidence` as const;
    inputs[key] =
      mode === 0n
        ? notRequiredEvidence(inputs[key])
        : mode === 1n
          ? unavailableEvidence(inputs[key], evidenceClass)
          : acceptedEvidence(inputs[key], mode, evidenceClass);
    const digestKey = `${evidenceClass}EvidenceDigest` as
      | "issuerEvidenceDigest"
      | "trustEvidenceDigest"
      | "artifactEvidenceDigest";
    inputs.transcript[digestKey] = hashEvidenceBindingV1(inputs[key]);
  }
};

const configureStatusAndTime = (
  inputs: VerificationPublicInputsV1,
  statusMode: 1n | 2n | 3n,
  statusEvidenceMode: 2n | 3n | 4n,
  timeMode: 1n | 2n,
  timeEvidenceMode: 2n | 3n,
): void => {
  inputs.transcript.statusMode = statusMode;
  inputs.transcript.statusRegistryDigest = digest("status-registry");
  inputs.transcript.statusRoot = digest("status-root");
  inputs.transcript.statusRegistryVersion = 1n;
  inputs.transcript.statusFreshnessPolicyDigest = digest("status-freshness");
  inputs.statusEvidence = acceptedEvidence(
    inputs.statusEvidence,
    statusEvidenceMode,
    "status",
  );
  inputs.transcript.statusEvidenceDigest = hashEvidenceBindingV1(
    inputs.statusEvidence,
  );
  inputs.transcript.timeMode = timeMode;
  inputs.transcript.trustedTime = 1_850_000_000n;
  inputs.timeEvidence = acceptedEvidence(
    inputs.timeEvidence,
    timeEvidenceMode,
    "time",
  );
  inputs.transcript.timeEvidenceDigest = hashEvidenceBindingV1(
    inputs.timeEvidence,
  );
};

const inputsFor = (
  profile: "ledger-local-v1" | "ledger-attested-v1" | "offchain-public-v1",
): VerificationPublicInputsV1 => {
  const inputs = clone(createVerificationV1Fixture().publicInputs);
  const mode = profile === "ledger-attested-v1" ? 3n : 2n;
  inputs.issuerEvidence = acceptedEvidence(
    inputs.issuerEvidence,
    mode,
    `${profile}:issuer`,
  );
  inputs.trustEvidence = acceptedEvidence(
    inputs.trustEvidence,
    mode,
    `${profile}:trust`,
  );
  inputs.artifactEvidence = acceptedEvidence(
    inputs.artifactEvidence,
    mode,
    `${profile}:artifact`,
  );
  inputs.transcript.profile =
    profile === "ledger-local-v1"
      ? 1n
      : profile === "ledger-attested-v1"
        ? 2n
        : 3n;
  inputs.transcript.authority =
    profile === "ledger-local-v1"
      ? 1n
      : profile === "ledger-attested-v1"
        ? 2n
        : 3n;
  inputs.transcript.issuerEvidenceDigest = hashEvidenceBindingV1(
    inputs.issuerEvidence,
  );
  inputs.transcript.trustEvidenceDigest = hashEvidenceBindingV1(
    inputs.trustEvidence,
  );
  inputs.transcript.artifactEvidenceDigest = hashEvidenceBindingV1(
    inputs.artifactEvidence,
  );
  return inputs;
};

const profileFor = (
  target: "ledger-local-v1" | "ledger-attested-v1" | "offchain-public-v1",
  options: {
    readonly privateInputSources?: CredentialFamilyProfileV1["semantics"]["verification"]["privateInputSources"];
    readonly mutation?: "none" | "ledger";
    readonly status?:
      | "disabled"
      | "local-live"
      | "local-nonmembership"
      | "attested";
    readonly time?: "none" | "ledger" | "attested";
  } = {},
): CredentialFamilyProfileV1 => {
  const ledger = target !== "offchain-public-v1";
  const mutation = options.mutation ?? "none";
  const status = options.status ?? "disabled";
  const time = options.time ?? "none";
  return {
    formatVersion: 1,
    id: `fixture.executor.${target}`,
    version: "1.0.0",
    family: {
      id: "fixture.executor",
      version: "1.0.0",
      schemaId: "urn:fixture:executor",
      schemaVersion: "1.0.0",
    },
    semantics: {
      claims: [{ claimId: "publicClaim", disclosure: "selective" }],
      holderBinding: {
        mode: "explicit-did",
        capability: { id: "holder.explicit", version: "1.0.0" },
      },
      issuance: {
        credential: "issuer-local-issuance-v1",
        registration: "disabled",
        anchoring: "disabled",
      },
      presentation: {
        capability: { id: "presentation.fixture", version: "1.0.0" },
        preparation: "holder-wallet-v1",
        proofGeneration: {
          capability: { id: "proof.fixture", version: "1.0.0" },
          witnessPolicy:
            (options.privateInputSources?.length ?? 0) > 0
              ? "private-compatible"
              : "public-only",
        },
      },
      verification: {
        profile: target,
        location: ledger ? "ledger" : "local-process",
        authority:
          target === "ledger-local-v1"
            ? "ledger-local"
            : target === "ledger-attested-v1"
              ? "ledger-attested"
              : "local-process",
        commitState: ledger ? "committed" : "not-applicable",
        privateInputSources: options.privateInputSources ?? [],
      },
      status:
        status === "disabled"
          ? { mode: "disabled" }
          : {
              mode:
                status === "attested" ? "authority-attested" : "ledger-local",
              capability: { id: "status.fixture", version: "1.0.0" },
              namespace: "fixture-status",
              authority: "fixture-status-authority",
              rootVersion: "root@1",
              freshnessPolicy: "fixture-window",
              evidence:
                status === "attested"
                  ? "challenge-bound-attestation"
                  : status === "local-nonmembership"
                    ? "non-membership"
                    : "membership",
              privacy: "public",
              authenticated: true,
            },
      did: {
        method: "did:fixture",
        relationship: "authentication",
        network: "fixture-network",
        versionEvidence: "fixture.did.version@1",
      },
      trust: {
        scope: "fixture-verification",
        epochEvidence: "fixture.trust.epoch@1",
      },
      trustedTime: {
        source: time,
        evidence:
          time === "ledger"
            ? "ledger-time"
            : time === "attested"
              ? "challenge-bound-attestation"
              : "not-required",
        freshnessPolicy: time === "none" ? "not-required" : "fixture-window",
      },
      mutation:
        mutation === "ledger"
          ? {
              location: "ledger",
              nullifier: "contract-derived",
              consumption: "atomic",
            }
          : { location: "none", nullifier: "none", consumption: "none" },
      protocols: ["canonical-reference"],
    },
    requirements: {
      packages: [],
      compactEntrypoints: [],
      circuits: [],
      artifacts: [],
      providers: [],
    },
    compatibility: {
      deniedRules: [
        "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION",
        "STATUS_EVIDENCE_REQUIRED",
        "CALLER_TIME_WITH_LEDGER_AUTHORITY",
        "ATOMIC_REPLAY_REQUIRED",
        "DISABLED_CAPABILITY_DEPENDENCY",
        "LEDGER_COMMIT_REQUIRED",
        "UNTESTED_COMBINATION",
      ],
    },
    conformance: {
      fixtureId: `fixture:executor:${target}`,
      evidenceDisposition: "tested",
      evidenceIds: [`test:verification-v1:${target}`],
    },
    maturity: {
      api: { subjectId: "api:verification-v1", value: "supported" },
      security: {
        subjectId: "security:verification-v1",
        value: "implementation-reviewed",
      },
      standards: {
        subjectId: "standards:verification-v1",
        value: "not-applicable",
      },
      production: {
        subjectId: "production:verification-v1",
        value: "not-assessed",
      },
    },
  };
};

const identityFor = (
  profile: CredentialFamilyProfileV1,
  inputs: VerificationPublicInputsV1,
): AuthenticatedVerificationProfileIdentityV1 => ({
  source: "authenticated-resolved-profile-v1",
  profileId: profile.id,
  profileVersion: profile.version,
  familyId: profile.family.id,
  familyVersion: profile.family.version,
  schemaId: profile.family.schemaId,
  schemaVersion: profile.family.schemaVersion,
  credentialFamilyDigest: asBytes32(inputs.transcript.credentialFamilyDigest),
  schemaDigest: asBytes32(inputs.transcript.schemaDigest),
  artifactManifestDigest: asBytes32(inputs.transcript.artifactManifestDigest),
});

const prepareWithProfile = (
  target: "ledger-local-v1" | "ledger-attested-v1" | "offchain-public-v1",
  inputs: VerificationPublicInputsV1,
  profile: CredentialFamilyProfileV1,
) => prepareVerification(target, inputs, profile, identityFor(profile, inputs));

const preparedFor = (
  profile: "ledger-local-v1" | "ledger-attested-v1" | "offchain-public-v1",
): PreparedVerificationV1 => {
  const inputs = inputsFor(profile);
  const prepared = prepareWithProfile(profile, inputs, profileFor(profile));
  expect(prepared.kind).toBe("prepared-verification");
  if (prepared.kind !== "prepared-verification")
    throw new Error("fixture is malformed");
  return prepared;
};

const evaluation = (
  prepared: PreparedVerificationV1,
  status: "valid" | "invalid" | "indeterminate" = "valid",
  stage?: VerificationFailureStageV1,
): VerificationEvaluationV1 =>
  status === "valid"
    ? {
        proofStatus: "valid",
        decisionStatus: "approved",
        transcriptDigest: prepared.transcriptDigest,
        authorityEvidence:
          prepared.targetProfile === "ledger-local-v1"
            ? "ledger-local"
            : prepared.targetProfile === "ledger-attested-v1"
              ? "ledger-attested"
              : "local-process",
      }
    : {
        proofStatus: status,
        decisionStatus: "notEvaluated",
        transcriptDigest: prepared.transcriptDigest,
        failureStage: stage ?? "verifier",
      };

const anchorDigest = (prepared: PreparedVerificationV1) => {
  const receipt: AnchorEvidenceReceiptV1 = {
    domain: verificationDomainV1("anchorEvidenceReceipt"),
    version: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.issuerEvidence,
    ),
    trustEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.trustEvidence,
    ),
    statusEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.statusEvidence,
    ),
    timeEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.timeEvidence,
    ),
    artifactEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.artifactEvidence,
    ),
    connectorEvidenceDigest: hashEvidenceBindingV1(
      prepared.publicInputs.connectorEvidence,
    ),
  };
  return hashAnchorEvidenceReceiptV1(receipt);
};

const observation = (
  prepared: PreparedVerificationV1,
  executionStatus: LedgerExecutionObservationV1["executionStatus"] = "committed",
  status: "valid" | "invalid" | "indeterminate" = "valid",
  stage?: VerificationFailureStageV1,
): LedgerExecutionObservationV1 => ({
  version: 1,
  executionStatus,
  evaluation: evaluation(prepared, status, stage),
  transcriptDigest: asBytes32(prepared.transcriptDigest),
  decisionNullifier: asBytes32(
    prepared.publicInputs.transcript.decisionNullifier,
  ),
  anchorEvidenceDigest: asBytes32(anchorDigest(prepared)),
  ...(executionStatus === "committed"
    ? { transactionDigest: asBytes32(digest("verification-v1:transaction")) }
    : {}),
  atomicMutation: "none",
});

const executor = (
  result: LedgerExecutionObservationV1 | (() => never),
  confirmed = true,
): LedgerVerificationExecutorV1 => ({
  submit: async () => (typeof result === "function" ? result() : result),
  confirmCommitted: async () => confirmed,
});

const classification = (result: VerificationResultV1) => ({
  proofStatus: result.proofStatus,
  decisionStatus: result.decisionStatus,
});

describe("Verification V1 final executors", () => {
  it.each(["valid", "invalid", "indeterminate"] as const)(
    "keeps %s classification parity across eligible profiles while preserving authority labels",
    async (status) => {
      const local = preparedFor("ledger-local-v1");
      const attested = preparedFor("ledger-attested-v1");
      const offchain = preparedFor("offchain-public-v1");
      const localResult = await submitLedgerVerification(
        local,
        executor(
          observation(
            local,
            status === "valid" ? "committed" : "rejected",
            status,
            "proof",
          ),
        ),
      );
      const attestedResult = await submitLedgerVerification(
        attested,
        executor(
          observation(
            attested,
            status === "valid" ? "committed" : "rejected",
            status,
            "proof",
          ),
        ),
      );
      const offchainResult = verifyPublicOffchain(offchain, {
        evaluator: { evaluate: () => evaluation(offchain, status, "proof") },
      });

      expect(classification(localResult)).toEqual(
        classification(attestedResult),
      );
      expect(classification(attestedResult)).toEqual(
        classification(offchainResult),
      );
      expect(localResult.authority).toBe(
        status === "valid" ? "ledger-local" : "local-process",
      );
      expect(attestedResult.authority).toBe(
        status === "valid" ? "ledger-attested" : "local-process",
      );
      expect(offchainResult.authority).toBe("local-process");
      expect(
        compareVerificationParityV1([
          { pathId: "ledger-local", result: localResult },
          { pathId: "ledger-attested", result: attestedResult },
          { pathId: "offchain-public", result: offchainResult },
        ]),
      ).toMatchObject({ status: "equivalent", proofStatus: status });
    },
  );

  it.each([
    ["ledger-local-v1", 0n, "malformed"],
    ["ledger-local-v1", 1n, "indeterminate"],
    ["ledger-local-v1", 2n, "valid"],
    ["ledger-local-v1", 3n, "malformed"],
    ["ledger-local-v1", 4n, "valid"],
    ["ledger-attested-v1", 0n, "malformed"],
    ["ledger-attested-v1", 1n, "indeterminate"],
    ["ledger-attested-v1", 2n, "malformed"],
    ["ledger-attested-v1", 3n, "valid"],
    ["ledger-attested-v1", 4n, "valid"],
    ["offchain-public-v1", 0n, "malformed"],
    ["offchain-public-v1", 1n, "indeterminate"],
    ["offchain-public-v1", 2n, "valid"],
    ["offchain-public-v1", 3n, "valid"],
    ["offchain-public-v1", 4n, "valid"],
  ] as const)(
    "enforces the %s required-evidence matrix for mode %s",
    (target, mode, expectedStatus) => {
      const inputs = inputsFor(target);
      bindRequiredEvidence(inputs, mode);
      const prepared = prepareWithProfile(target, inputs, profileFor(target));
      expect(prepared.kind).toBe("prepared-verification");
      if (prepared.kind !== "prepared-verification") return;
      expect(
        preflightVerification(prepared, {
          evaluate: () => evaluation(prepared),
        }).proofStatus,
      ).toBe(expectedStatus);
    },
  );

  it.each([
    ["ledger-local-v1", "local-live", "ledger", 1n, 2n, 1n, 2n],
    ["ledger-local-v1", "local-nonmembership", "ledger", 2n, 4n, 1n, 2n],
    ["ledger-attested-v1", "attested", "attested", 3n, 3n, 2n, 3n],
    ["offchain-public-v1", "local-live", "ledger", 1n, 2n, 1n, 2n],
  ] as const)(
    "accepts the %s status/time evidence row %s/%s",
    (
      target,
      status,
      time,
      statusMode,
      statusEvidenceMode,
      timeMode,
      timeEvidenceMode,
    ) => {
      const inputs = inputsFor(target);
      configureStatusAndTime(
        inputs,
        statusMode,
        statusEvidenceMode,
        timeMode,
        timeEvidenceMode,
      );
      const prepared = prepareWithProfile(
        target,
        inputs,
        profileFor(target, { status, time }),
      );
      expect(prepared.kind).toBe("prepared-verification");
      if (prepared.kind !== "prepared-verification") return;
      expect(
        preflightVerification(prepared, {
          evaluate: () => evaluation(prepared),
        }),
      ).toMatchObject({ proofStatus: "valid", authority: "local-process" });
    },
  );

  it("requires wallet-attested origin evidence to bind the exact consent", () => {
    const inputs = inputsFor("ledger-attested-v1");
    inputs.transcript.originMode = 1n;
    inputs.transcript.originDigest = digest("wallet-origin");
    inputs.connectorEvidence = acceptedEvidence(
      inputs.connectorEvidence,
      3n,
      "connector",
    );
    inputs.connectorEvidence.statementDigest = asBytes32(
      inputs.transcript.consentDigest,
    );
    inputs.transcript.connectorEvidenceDigest = hashEvidenceBindingV1(
      inputs.connectorEvidence,
    );
    const prepared = prepareWithProfile(
      "ledger-attested-v1",
      inputs,
      profileFor("ledger-attested-v1"),
    );
    expect(prepared.kind).toBe("prepared-verification");
    if (prepared.kind !== "prepared-verification") return;
    expect(
      preflightVerification(prepared, {
        evaluate: () => evaluation(prepared),
      }),
    ).toMatchObject({ proofStatus: "valid" });

    const substituted = clone(prepared);
    substituted.publicInputs.connectorEvidence.statementDigest =
      digest("other-consent");
    substituted.publicInputs.transcript.connectorEvidenceDigest =
      hashEvidenceBindingV1(substituted.publicInputs.connectorEvidence);
    const reboundSubstitution: PreparedVerificationV1 = {
      ...substituted,
      transcriptDigest: hashVerificationTranscriptV1(
        substituted.publicInputs.transcript,
      ),
    };
    expect(
      preflightVerification(reboundSubstitution, {
        evaluate: () => evaluation(reboundSubstitution),
      }),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
  });

  it("rejects transcript evidence modes that contradict the validated profile", () => {
    const inputs = inputsFor("ledger-local-v1");
    configureStatusAndTime(inputs, 2n, 4n, 1n, 2n);
    const prepared = prepareWithProfile(
      "ledger-local-v1",
      inputs,
      profileFor("ledger-local-v1", {
        status: "local-live",
        time: "ledger",
      }),
    );
    expect(prepared.kind).toBe("prepared-verification");
    if (prepared.kind !== "prepared-verification") return;
    expect(
      preflightVerification(prepared, {
        evaluate: () => evaluation(prepared),
      }),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
  });

  it("executes preflight with local-process authority and preserves policy denial", () => {
    const prepared = preparedFor("ledger-local-v1");
    expect(
      preflightVerification(prepared, {
        evaluate: () => ({
          proofStatus: "valid",
          decisionStatus: "policyDenied",
          transcriptDigest: prepared.transcriptDigest,
          authorityEvidence: "ledger-local",
        }),
      }),
    ).toMatchObject({
      authority: "local-process",
      proofStatus: "valid",
      decisionStatus: "policyDenied",
      executionStatus: "notSubmitted",
    });
  });

  it("fails closed and distinguishes unavailable verifier, network, and ledger providers", async () => {
    const local = preparedFor("ledger-local-v1");
    const offchain = preparedFor("offchain-public-v1");
    expect(preflightVerification(local)).toMatchObject({
      proofStatus: "indeterminate",
      failureStage: "verifier",
      reasonCode: "authority-unavailable-v1",
    });
    expect(
      preflightVerification(local, {
        evaluate: () => {
          throw new Error("prover secret must not escape");
        },
      }),
    ).toMatchObject({
      proofStatus: "indeterminate",
      failureStage: "verifier",
      reasonCode: "provider-failure-v1",
    });
    await expect(
      submitLedgerVerification(
        local,
        executor(() => {
          throw new Error("network payload must not escape");
        }),
      ),
    ).resolves.toMatchObject({
      proofStatus: "indeterminate",
      failureStage: "network",
      reasonCode: "provider-failure-v1",
    });
    expect(verifyPublicOffchain(offchain)).toMatchObject({
      proofStatus: "indeterminate",
      failureStage: "verifier",
      reasonCode: "offchain-adapter-unavailable-v1",
    });
  });

  it("distrusts missing, malformed, and secret-bearing provider output with bounded errors", async () => {
    const local = preparedFor("ledger-local-v1");
    const offchain = preparedFor("offchain-public-v1");
    const secret = "raw-provider-secret-must-not-escape";
    const results: VerificationResultV1[] = [];

    results.push(
      verifyPublicOffchain(offchain, {} as never),
      verifyPublicOffchain(offchain, {
        evaluator: {
          evaluate: () =>
            ({
              ...evaluation(offchain),
              authorityEvidence: "ledger-local",
              providerDetail: secret,
            }) as never,
        },
      }),
    );
    results.push(
      await submitLedgerVerification(local, {
        confirmCommitted: async () => true,
      } as unknown as LedgerVerificationExecutorV1),
      await submitLedgerVerification(local, {
        submit: async () => ({ ...observation(local), providerDetail: secret }),
      } as unknown as LedgerVerificationExecutorV1),
    );

    expect(results.map(classification)).toEqual([
      { proofStatus: "indeterminate", decisionStatus: "notEvaluated" },
      { proofStatus: "invalid", decisionStatus: "notEvaluated" },
      { proofStatus: "indeterminate", decisionStatus: "notEvaluated" },
      { proofStatus: "indeterminate", decisionStatus: "notEvaluated" },
    ]);
    expect(results.map((result) => result.authority)).toEqual([
      "local-process",
      "local-process",
      "local-process",
      "local-process",
    ]);
    expect(JSON.stringify(results)).not.toContain(secret);
  });

  it.each(["submitted", "included"] as const)(
    "never upgrades an %s transaction to ledger authority",
    async (executionStatus) => {
      const prepared = preparedFor("ledger-local-v1");
      const result = await submitLedgerVerification(
        prepared,
        executor(observation(prepared, executionStatus)),
      );
      expect(result).toMatchObject({
        kind: "local-attempt",
        authority: "local-process",
        proofStatus: "valid",
        decisionStatus: "approved",
        executionStatus,
        reasonCode: "transaction-unconfirmed-v1",
      });
    },
  );

  it("keeps rejected, reverted, and unconfirmed observations non-authoritative", async () => {
    const prepared = preparedFor("ledger-attested-v1");
    await expect(
      submitLedgerVerification(
        prepared,
        executor(observation(prepared, "rejected")),
      ),
    ).resolves.toMatchObject({
      kind: "local-attempt",
      authority: "local-process",
      executionStatus: "rejected",
      reasonCode: "transaction-rejected-v1",
    });
    await expect(
      submitLedgerVerification(
        prepared,
        executor(observation(prepared, "reverted")),
      ),
    ).resolves.toMatchObject({
      kind: "local-attempt",
      authority: "local-process",
      executionStatus: "reverted",
      reasonCode: "transaction-reverted-v1",
    });
    await expect(
      submitLedgerVerification(
        prepared,
        executor(observation(prepared), false),
      ),
    ).resolves.toMatchObject({
      kind: "local-attempt",
      authority: "local-process",
      executionStatus: "included",
      reasonCode: "transaction-unconfirmed-v1",
    });
    await expect(
      submitLedgerVerification(prepared, {
        submit: async () => observation(prepared),
        confirmCommitted: async () => {
          throw new Error("confirmation backend detail");
        },
      }),
    ).resolves.toMatchObject({
      authority: "local-process",
      executionStatus: "included",
      reasonCode: "transaction-unconfirmed-v1",
    });
  });

  it("rejects stale or tampered transcript, evidence, receipt authority, and provider classifications", async () => {
    const prepared = preparedFor("ledger-local-v1");
    prepared.publicInputs.transcript.challengeDigest[0] ^= 0xff;
    expect(
      preflightVerification(prepared, { evaluate: () => evaluation(prepared) }),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "malformed-input-v1",
    });

    const fresh = preparedFor("ledger-local-v1");
    for (const evidenceClass of [
      "issuer",
      "trust",
      "status",
      "time",
      "artifact",
      "connector",
    ] as const) {
      const badEvidence = clone(fresh.publicInputs);
      badEvidence[`${evidenceClass}Evidence`].statementDigest[0] ^= 0xff;
      const tampered = { ...fresh, publicInputs: badEvidence };
      expect(
        preflightVerification(tampered, { evaluate: () => evaluation(fresh) }),
      ).toMatchObject({
        proofStatus: "malformed",
        reasonCode: "malformed-input-v1",
      });
    }

    for (const receiptField of [
      "transcriptDigest",
      "decisionNullifier",
      "anchorEvidenceDigest",
    ] as const) {
      const badReceipt = observation(fresh);
      badReceipt[receiptField][0] ^= 0xff;
      await expect(
        submitLedgerVerification(fresh, executor(badReceipt)),
      ).resolves.toMatchObject({
        kind: "local-attempt",
        authority: "local-process",
        proofStatus: "invalid",
        failureStage: "artifact",
        reasonCode: "transaction-invalid-v1",
      });
    }

    for (const stage of [
      "issuer",
      "trust",
      "status",
      "time",
      "artifact",
    ] as const) {
      const result = preflightVerification(fresh, {
        evaluate: () => evaluation(fresh, "invalid", stage),
      });
      expect(result).toMatchObject({
        proofStatus: "invalid",
        decisionStatus: "notEvaluated",
        failureStage: stage,
        reasonCode: "verification-invalid-v1",
      });
    }
  });

  it.each([
    "hidden-holder",
    "private-predicate",
    "same-holder",
    "private-status",
  ] as const)("rejects %s inputs from public-only execution", (source) => {
    const inputs = inputsFor("offchain-public-v1");
    const profile = profileFor("offchain-public-v1", {
      privateInputSources: [source],
    });
    expect(
      prepareVerification(
        "offchain-public-v1",
        inputs,
        profile,
        identityFor(profile, inputs),
      ),
    ).toMatchObject({
      proofStatus: "malformed",
      decisionStatus: "notEvaluated",
      reasonCode: "private-inputs-public-only-v1",
    });
  });

  it("requires an authenticated profile identity bound to the transcript", () => {
    const inputs = inputsFor("offchain-public-v1");
    const profile = profileFor("offchain-public-v1");
    expect(
      prepareVerification("offchain-public-v1", inputs, profile),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
    expect(
      prepareVerification("offchain-public-v1", inputs, profile, {
        ...identityFor(profile, inputs),
        credentialFamilyDigest: asBytes32(digest("other-family")),
      }),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
  });

  it("rejects verifier-scoped hidden credential binding even when metadata lies", () => {
    const inputs = inputsFor("offchain-public-v1");
    inputs.transcript.credentialBindingMode = 2n;
    const prepared = prepareWithProfile(
      "offchain-public-v1",
      inputs,
      profileFor("offchain-public-v1"),
    );
    expect(prepared.kind).toBe("prepared-verification");
    if (prepared.kind !== "prepared-verification") return;
    expect(
      verifyPublicOffchain(prepared, {
        evaluator: { evaluate: () => evaluation(prepared) },
      }),
    ).toMatchObject({ reasonCode: "private-inputs-public-only-v1" });
  });

  it("requires the decision nullifier and business mutation to commit atomically", async () => {
    const inputs = inputsFor("ledger-local-v1");
    inputs.transcript.nullifierMode = 1n;
    inputs.transcript.replayPolicy = 1n;
    inputs.transcript.actionClassDigest = digest("action-class");
    inputs.transcript.actionInvocationDigest = digest("action-invocation");
    inputs.transcript.replayScopeDigest = digest("replay-scope");
    inputs.transcript.decisionNullifier = digest("decision-nullifier");
    const prepared = prepareWithProfile(
      "ledger-local-v1",
      inputs,
      profileFor("ledger-local-v1", { mutation: "ledger" }),
    );
    expect(prepared.kind).toBe("prepared-verification");
    if (prepared.kind !== "prepared-verification") return;

    const committed = {
      ...observation(prepared),
      atomicMutation: "committed" as const,
    };
    await expect(
      submitLedgerVerification(prepared, executor(committed)),
    ).resolves.toMatchObject({
      kind: "ledger-receipt",
      authority: "ledger-local",
      decisionNullifier: inputs.transcript.decisionNullifier,
      atomicMutation: "committed",
    });
    await expect(
      submitLedgerVerification(prepared, executor(observation(prepared))),
    ).resolves.toMatchObject({
      kind: "local-attempt",
      authority: "local-process",
      proofStatus: "invalid",
      failureStage: "ledger",
      reasonCode: "transaction-invalid-v1",
    });
  });

  it("rejects invalid prepared-verification versions and discriminants", () => {
    const prepared = preparedFor("offchain-public-v1");
    for (const spoofed of [
      { ...prepared, version: 2 },
      { ...prepared, kind: "future-prepared" },
    ]) {
      expect(
        verifyPublicOffchain(spoofed as never, {
          evaluator: { evaluate: () => evaluation(prepared) },
        }),
      ).toMatchObject({
        proofStatus: "malformed",
        reasonCode: "malformed-input-v1",
      });
    }
  });

  it("revalidates the exact transcript and validated profile after provider callbacks", async () => {
    const offchain = preparedFor("offchain-public-v1");
    expect(
      verifyPublicOffchain(offchain, {
        evaluator: {
          evaluate: (candidate) => {
            const result = evaluation(candidate);
            candidate.publicInputs.transcript.challengeDigest[0] ^= 0xff;
            return result;
          },
        },
      }),
    ).toMatchObject({
      proofStatus: "invalid",
      failureStage: "verifier",
      reasonCode: "verification-invalid-v1",
    });

    const callbackProfileMutation = preparedFor("offchain-public-v1");
    expect(
      verifyPublicOffchain(callbackProfileMutation, {
        evaluator: {
          evaluate: (candidate) => {
            const result = evaluation(candidate);
            if (candidate.profileBinding !== null) {
              const mutableFamily = candidate.profileBinding.credentialProfile
                .family as { id: string };
              mutableFamily.id = "fixture.executor.substituted";
            }
            return result;
          },
        },
      }),
    ).toMatchObject({
      proofStatus: "invalid",
      failureStage: "verifier",
      reasonCode: "verification-invalid-v1",
    });

    const ledger = preparedFor("ledger-local-v1");
    await expect(
      submitLedgerVerification(ledger, {
        submit: async (candidate) => {
          const result = observation(candidate);
          candidate.publicInputs.transcript.policyDigest[0] ^= 0xff;
          return result;
        },
        confirmCommitted: async () => true,
      }),
    ).resolves.toMatchObject({
      authority: "local-process",
      proofStatus: "invalid",
      reasonCode: "transaction-invalid-v1",
    });

    const mutatedProfile = preparedFor("offchain-public-v1");
    if (mutatedProfile.profileBinding === null) return;
    const writableProfile = mutatedProfile.profileBinding
      .credentialProfile as unknown as {
      semantics: { holderBinding: { mode: string } };
    };
    writableProfile.semantics.holderBinding.mode = "secret";
    expect(
      verifyPublicOffchain(mutatedProfile, {
        evaluator: { evaluate: () => evaluation(mutatedProfile) },
      }),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
  });

  it("detects executor parity divergence", () => {
    const prepared = preparedFor("offchain-public-v1");
    const valid = verifyPublicOffchain(prepared, {
      evaluator: { evaluate: () => evaluation(prepared) },
    });
    const invalid = verifyPublicOffchain(prepared, {
      evaluator: { evaluate: () => evaluation(prepared, "invalid", "proof") },
    });
    expect(
      compareVerificationParityV1([
        { pathId: "valid", result: valid },
        { pathId: "invalid", result: invalid },
      ]),
    ).toMatchObject({ status: "diverged", proofStatus: null });
  });

  it("rejects evaluator transcript substitution", () => {
    const prepared = preparedFor("offchain-public-v1");
    const other = asBytes32(digest("other-transcript"));
    expect(
      verifyPublicOffchain(prepared, {
        evaluator: {
          evaluate: () => ({
            proofStatus: "valid",
            decisionStatus: "approved",
            transcriptDigest: other,
            authorityEvidence: "local-process",
          }),
        },
      }),
    ).toMatchObject({
      proofStatus: "invalid",
      failureStage: "verifier",
      reasonCode: "verification-invalid-v1",
    });
    expect(
      hashVerificationTranscriptV1(prepared.publicInputs.transcript),
    ).toEqual(prepared.transcriptDigest);
  });
});
