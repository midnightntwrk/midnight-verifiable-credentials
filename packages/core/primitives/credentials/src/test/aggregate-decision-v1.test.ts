import { describe, expect, it } from "vitest";

import {
  aggregateDecisionDomainV1,
  type AggregateDecisionExecutorV1,
  type AggregateDecisionInputV1,
  type AggregateLedgerExecutionObservationV1,
  asBytes32,
  createAggregateRequestBindingV1,
  createAggregateSameHolderBindingV1,
  createNoSameHolderBindingV1,
  deriveAggregateDecisionNullifierV1,
  hashAggregateChildDecisionBindingV1,
  hashAggregateChildSetV1,
  hashAggregateDecisionTranscriptV1,
  hashAggregateRequestBindingV1,
  hashAggregateSameHolderBindingV1,
  hashAnchorEvidenceReceiptV1,
  hashEvidenceBindingV1,
  type LedgerVerificationReceiptV1,
  prepareAggregateDecisionSetV1,
  type PreparedVerificationV1,
  prepareVerification,
  submitAggregateDecisionSetV1,
  verificationDomainV1,
  type VerificationPublicInputsV1,
} from "../index.js";
import { pureCircuits as aggregatePureCircuits } from "../managed/aggregate-decision/contract/index.js";
import { aggregateFamilyEvidenceFixturesV1 } from "./aggregate-decision-family-fixtures.js";
import {
  createVerificationV1Fixture,
  digest,
} from "./verification-v1-fixtures.js";

const zero = (): Uint8Array => new Uint8Array(32);
const hex = (value: Uint8Array): string =>
  Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
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
  source: VerificationPublicInputsV1["issuerEvidence"],
  label: string,
  mode: 2n | 3n = 2n,
) => ({
  ...source,
  mode,
  authorityDigest: digest(`${label}:authority`),
  subjectDigest: digest(`${label}:subject`),
  stateAnchorDigest: digest(`${label}:anchor`),
  statementDigest: digest(`${label}:statement`),
  createdAt: 1_800_000_000n,
  expiresAt: 1_900_000_000n,
});

const familyFixture = (
  family: string,
  sequence: number,
  options: { status?: "none" | "enabled"; authority?: 1n | 2n } = {},
): {
  prepared: PreparedVerificationV1;
  result: LedgerVerificationReceiptV1;
} => {
  const inputs = clone(createVerificationV1Fixture().publicInputs);
  const authority = options.authority ?? 1n;
  inputs.transcript.profile = authority;
  inputs.transcript.authority = authority;
  inputs.transcript.networkIdDigest = digest("aggregate:network");
  inputs.transcript.verifierContractDigest = digest("aggregate:verifier");
  inputs.transcript.deploymentDigest = digest("aggregate:deployment");
  inputs.transcript.audienceDigest = digest("aggregate:audience");
  inputs.transcript.requestIdDigest = digest("aggregate:request");
  inputs.transcript.challengeDigest = digest("aggregate:challenge");
  inputs.transcript.expiresAt = 1_860_000_000n;
  inputs.transcript.credentialFamilyDigest = digest(`family:${family}`);
  inputs.transcript.schemaDigest = digest(`schema:${family}:v1`);
  inputs.transcript.credentialBindingDigest = digest(
    `credential:${family}:${sequence}`,
  );
  inputs.transcript.holderBindingDigest = digest(
    `holder-scope:${family}:${sequence}`,
  );
  inputs.issuerEvidence = acceptedEvidence(
    inputs.issuerEvidence,
    `${family}:issuer`,
    authority === 2n ? 3n : 2n,
  );
  inputs.trustEvidence = acceptedEvidence(
    inputs.trustEvidence,
    `${family}:trust`,
    authority === 2n ? 3n : 2n,
  );
  inputs.artifactEvidence = acceptedEvidence(
    inputs.artifactEvidence,
    `${family}:artifact`,
    authority === 2n ? 3n : 2n,
  );
  inputs.transcript.issuerDidDigest = digest(`issuer-did:${family}`);
  inputs.transcript.issuerMethodDigest = digest(`issuer-method:${family}`);
  inputs.transcript.trustScopeDigest = digest(`trust-scope:${family}`);
  inputs.transcript.artifactManifestDigest = digest(`artifact:${family}:v1`);
  inputs.transcript.issuerEvidenceDigest = hashEvidenceBindingV1(
    inputs.issuerEvidence,
  );
  inputs.transcript.trustEvidenceDigest = hashEvidenceBindingV1(
    inputs.trustEvidence,
  );
  inputs.transcript.artifactEvidenceDigest = hashEvidenceBindingV1(
    inputs.artifactEvidence,
  );
  if (options.status === "enabled") {
    inputs.transcript.statusMode = 1n;
    inputs.transcript.statusRegistryDigest = digest(
      `status-registry:${family}`,
    );
    inputs.transcript.statusRoot = digest(`status-root:${family}:1`);
    inputs.transcript.statusRegistryVersion = 1n;
    inputs.transcript.statusFreshnessPolicyDigest = digest(
      "status:freshness:aggregate",
    );
    inputs.statusEvidence = acceptedEvidence(
      inputs.statusEvidence,
      `${family}:status`,
    );
    inputs.transcript.statusEvidenceDigest = hashEvidenceBindingV1(
      inputs.statusEvidence,
    );
    inputs.transcript.timeMode = 1n;
    inputs.transcript.trustedTime = 1_850_000_000n;
    inputs.timeEvidence = acceptedEvidence(
      inputs.timeEvidence,
      `${family}:time`,
    );
    inputs.transcript.timeEvidenceDigest = hashEvidenceBindingV1(
      inputs.timeEvidence,
    );
  }
  const target = authority === 1n ? "ledger-local-v1" : "ledger-attested-v1";
  const prepared = prepareVerification(target, inputs);
  expect(prepared.kind).toBe("prepared-verification");
  if (prepared.kind !== "prepared-verification")
    throw new Error("invalid fixture");
  const anchorEvidenceDigest = hashAnchorEvidenceReceiptV1({
    domain: verificationDomainV1("anchorEvidenceReceipt"),
    version: 1n,
    issuerEvidenceDigest: hashEvidenceBindingV1(inputs.issuerEvidence),
    trustEvidenceDigest: hashEvidenceBindingV1(inputs.trustEvidence),
    statusEvidenceDigest: hashEvidenceBindingV1(inputs.statusEvidence),
    timeEvidenceDigest: hashEvidenceBindingV1(inputs.timeEvidence),
    artifactEvidenceDigest: hashEvidenceBindingV1(inputs.artifactEvidence),
    connectorEvidenceDigest: hashEvidenceBindingV1(inputs.connectorEvidence),
  });
  const common = {
    version: 1 as const,
    kind: "ledger-receipt" as const,
    proofStatus: "valid" as const,
    decisionStatus: "approved" as const,
    executionStatus: "committed" as const,
    transcriptDigest: prepared.transcriptDigest,
    decisionNullifier: asBytes32(inputs.transcript.decisionNullifier),
    anchorEvidenceDigest,
    transactionDigest: asBytes32(digest(`transaction:${family}:${sequence}`)),
    atomicMutation: "none" as const,
  };
  const result: LedgerVerificationReceiptV1 =
    authority === 1n
      ? { ...common, profile: "ledger-local-v1", authority: "ledger-local" }
      : {
          ...common,
          profile: "ledger-attested-v1",
          authority: "ledger-attested",
        };
  return { prepared, result };
};

const verificationPorts = {
  verifyChildResult: () => "valid" as const,
  verifySameHolder: () => "valid" as const,
};

const inputFor = (
  children: AggregateDecisionInputV1["children"],
  options: { sameHolder?: boolean; sideEffect?: boolean } = {},
): AggregateDecisionInputV1 => {
  const request = createAggregateRequestBindingV1({
    networkIdDigest: digest("aggregate:network"),
    verifierContractDigest: digest("aggregate:verifier"),
    deploymentDigest: digest("aggregate:deployment"),
    audienceDigest: digest("aggregate:audience"),
    requestIdDigest: digest("aggregate:request"),
    challengeDigest: digest("aggregate:challenge"),
    expiresAt: 1_860_000_000n,
    policyDigest: digest("aggregate:policy"),
    actionClassDigest: options.sideEffect
      ? digest("aggregate:action-class")
      : zero(),
    actionInvocationDigest: options.sideEffect
      ? digest("aggregate:action-invocation")
      : zero(),
    replayPolicy: options.sideEffect ? 1n : 0n,
  });
  const holderDigests = children.map(
    ({ prepared }) => prepared.publicInputs.transcript.holderBindingDigest,
  );
  const base: AggregateDecisionInputV1 = {
    version: 1,
    request,
    sameHolder: createNoSameHolderBindingV1(),
    aggregateTrustedTime: 1_850_000_000n,
    nullifierMode: options.sideEffect ? 1n : 0n,
    children,
  };
  if (!options.sameHolder) return base;
  const withoutSameHolder = prepareAggregateDecisionSetV1(
    base,
    verificationPorts,
  );
  if (withoutSameHolder.kind !== "prepared-aggregate-decision") {
    throw new Error(withoutSameHolder.reasonCode);
  }
  return {
    ...base,
    sameHolder: createAggregateSameHolderBindingV1({
      verifierContractDigest: request.verifierContractDigest,
      challengeDigest: request.challengeDigest,
      childSetDigest: withoutSameHolder.transcript.childSetDigest,
      holderBindingDigests: holderDigests,
      proofDigest: digest("aggregate:same-holder-proof"),
    }),
  };
};

type MutableAggregateInput = Omit<
  AggregateDecisionInputV1,
  "aggregateTrustedTime" | "children"
> & {
  aggregateTrustedTime: bigint;
  children: Array<{
    prepared: PreparedVerificationV1;
    result: AggregateDecisionInputV1["children"][number]["result"];
  }>;
};

const expectPrepared = (input: AggregateDecisionInputV1) => {
  const result = prepareAggregateDecisionSetV1(input, verificationPorts);
  expect(result.kind).toBe("prepared-aggregate-decision");
  if (result.kind !== "prepared-aggregate-decision")
    throw new Error(result.reasonCode);
  return result;
};

describe("authoritative aggregate decision set v1", () => {
  it("canonically binds two distinct family authority chains with explicit no-status and enabled-status evidence", () => {
    const birthEvidence = aggregateFamilyEvidenceFixturesV1.birthSecret;
    const diplomaEvidence = aggregateFamilyEvidenceFixturesV1.universityDiploma;
    expect(
      [birthEvidence, diplomaEvidence].map(
        (fixture) => fixture.evidenceDisposition,
      ),
    ).toEqual(["aggregate-authority-tested", "aggregate-authority-tested"]);
    const birth = familyFixture(birthEvidence.familyId, 1);
    const diploma = familyFixture(diplomaEvidence.familyId, 1, {
      status: "enabled",
    });
    const prepared = expectPrepared(inputFor([diploma, birth]));

    expect(prepared.children).toHaveLength(2);
    expect(prepared.children.map((child) => hex(child.familyDigest))).toEqual(
      [...prepared.children].map((child) => hex(child.familyDigest)).sort(),
    );
    expect(prepared.children.map((child) => child.statusMode).sort()).toEqual([
      0n,
      1n,
    ]);
    expect(
      prepared.children.every((child) =>
        child.statusEvidenceDigest.some(Boolean),
      ),
    ).toBe(true);
    expect(prepared.transcript.childSetDigest).toEqual(
      hashAggregateChildSetV1(prepared.childSet),
    );
    expect(prepared.transcript.requestBindingDigest).toEqual(
      hashAggregateRequestBindingV1(prepared.request),
    );
    expect(prepared.transcript.sameHolderBindingDigest).toEqual(
      hashAggregateSameHolderBindingV1(prepared.sameHolder),
    );
    expect(prepared.transcriptDigest).toEqual(
      hashAggregateDecisionTranscriptV1(prepared.transcript),
    );
  });

  it("rejects a fabricated child ledger receipt without deployment authentication", () => {
    const input = inputFor([
      familyFixture("birth-secret", 1),
      familyFixture("university-diploma", 1),
    ]);
    expect(prepareAggregateDecisionSetV1(input)).toMatchObject({
      kind: "aggregate-attempt",
      classification: "indeterminate",
      authority: "none",
      reasonCode: "aggregate-authority-unavailable-v1",
    });
    const fabricated = clone(input);
    (
      fabricated.children[1].result as unknown as {
        transactionDigest: Uint8Array;
      }
    ).transactionDigest = asBytes32(digest("fabricated-child-transaction"));
    const authenticatedTransactions = new Set(
      input.children.map((child) =>
        hex((child.result as LedgerVerificationReceiptV1).transactionDigest),
      ),
    );
    expect(
      prepareAggregateDecisionSetV1(fabricated, {
        verifyChildResult: (child) =>
          child.result.kind === "ledger-receipt" &&
          authenticatedTransactions.has(hex(child.result.transactionDigest))
            ? "valid"
            : "invalid",
      }),
    ).toMatchObject({
      kind: "aggregate-attempt",
      classification: "invalid",
      authority: "none",
      reasonCode: "aggregate-child-receipt-unauthenticated-v1",
    });
  });

  it("rejects a forged nonzero same-holder receipt and authenticates the actual holder and aggregate child digests", () => {
    const input = inputFor(
      [
        familyFixture("birth-secret", 1),
        familyFixture("university-diploma", 1),
      ],
      { sameHolder: true },
    );
    const authenticatedProofDigest = Uint8Array.from(
      input.sameHolder.proofDigest,
    );
    input.sameHolder.proofDigest = digest("forged-nonzero-proof-receipt");
    expect(
      prepareAggregateDecisionSetV1(input, {
        verifyChildResult: () => "valid",
        verifySameHolder: (binding, statement) =>
          hex(binding.proofDigest) === hex(authenticatedProofDigest) &&
          hex(binding.childSetDigest) === hex(statement.childSetDigest) &&
          statement.holderBindingDigests.length === 2 &&
          statement.childDigests.length === 2
            ? "valid"
            : "invalid",
      }),
    ).toMatchObject({
      kind: "aggregate-attempt",
      classification: "invalid",
      authority: "none",
      reasonCode: "aggregate-same-holder-unauthenticated-v1",
    });
  });

  it("binds a canonical triple with enabled status/time evidence and same-holder context", () => {
    const children = [
      familyFixture("hello-family", 3, { status: "enabled" }),
      familyFixture("birth-secret", 1, { status: "enabled" }),
      familyFixture("university-diploma", 2, { status: "enabled" }),
    ];
    const prepared = expectPrepared(inputFor(children, { sameHolder: true }));
    expect(prepared.childSet.childCount).toBe(3n);
    expect(prepared.children.every((child) => child.statusMode === 1n)).toBe(
      true,
    );
    expect(prepared.sameHolder.mode).toBe(1n);
    expect(prepared.sameHolder.proofDigest.some(Boolean)).toBe(true);
  });

  it("has cross-runtime Compact parity for child, child-set, request, same-holder, transcript, and nullifier digests", () => {
    const prepared = expectPrepared(
      inputFor(
        [
          familyFixture("birth-secret", 1),
          familyFixture("university-diploma", 1),
        ],
        { sideEffect: true },
      ),
    );
    expect(hashAggregateChildDecisionBindingV1(prepared.children[0])).toEqual(
      aggregatePureCircuits.aggregateChildDecisionBindingV1Digest(
        prepared.children[0],
      ),
    );
    expect(hashAggregateChildSetV1(prepared.childSet)).toEqual(
      aggregatePureCircuits.aggregateChildSetV1Digest(prepared.childSet),
    );
    expect(hashAggregateRequestBindingV1(prepared.request)).toEqual(
      aggregatePureCircuits.aggregateRequestBindingV1Digest(prepared.request),
    );
    expect(hashAggregateSameHolderBindingV1(prepared.sameHolder)).toEqual(
      aggregatePureCircuits.aggregateSameHolderBindingV1Digest(
        prepared.sameHolder,
      ),
    );
    expect(prepared.transcriptDigest).toEqual(
      aggregatePureCircuits.aggregateDecisionTranscriptV1Digest(
        prepared.transcript,
      ),
    );
    expect(prepared.transcript.decisionNullifier).toEqual(
      deriveAggregateDecisionNullifierV1(prepared.nullifierMaterial),
    );
    expect(aggregateDecisionDomainV1("childDecisionBinding")).toEqual(
      aggregatePureCircuits.aggregateChildDecisionBindingDomainV1(),
    );
    expect(aggregateDecisionDomainV1("childSet")).toEqual(
      aggregatePureCircuits.aggregateChildSetDomainV1(),
    );
    expect(aggregateDecisionDomainV1("requestBinding")).toEqual(
      aggregatePureCircuits.aggregateRequestBindingDomainV1(),
    );
    expect(aggregateDecisionDomainV1("sameHolderBinding")).toEqual(
      aggregatePureCircuits.aggregateSameHolderBindingDomainV1(),
    );
    expect(aggregateDecisionDomainV1("transcript")).toEqual(
      aggregatePureCircuits.aggregateDecisionTranscriptDomainV1(),
    );
    expect(aggregateDecisionDomainV1("decisionNullifier")).toEqual(
      aggregatePureCircuits.aggregateDecisionNullifierDomainV1(),
    );
    expect({
      child: hex(hashAggregateChildDecisionBindingV1(prepared.children[0])),
      childSet: hex(hashAggregateChildSetV1(prepared.childSet)),
      request: hex(hashAggregateRequestBindingV1(prepared.request)),
      sameHolder: hex(hashAggregateSameHolderBindingV1(prepared.sameHolder)),
      transcript: hex(prepared.transcriptDigest),
      nullifier: hex(prepared.transcript.decisionNullifier),
    }).toMatchInlineSnapshot(`
      {
        "child": "b3dfa681bf5149c594646d42380233bca82717ad7d1cc1635750ecb63f65905b",
        "childSet": "6ca2305bb0f400ff480589e55bb89c955dcc49cc25cc8f8e994a85c209121e73",
        "nullifier": "20e6f0b333ce2bed30783b485cb99b0e82945773f6ed9e6b2cec09a01bec2b0e",
        "request": "31a9c04dc2e71fffdc6262f7b2db2e00a7835f3e34deaa2a4308fefebc4df979",
        "sameHolder": "54aeaef3028d0d51d689ebf1c879f0a52fd5002e0b7f44b038c8890bd3a5181a",
        "transcript": "3c47805a365ab8d01b784cec310a11e9aad65db783f6bab23e0cc98e0ff99003",
      }
    `);
  });

  it.each([
    ["missing child", (input: MutableAggregateInput) => input.children.pop()],
    [
      "duplicate",
      (input: MutableAggregateInput) => {
        input.children[1] = input.children[0];
      },
    ],
    [
      "mixed authority",
      (input: MutableAggregateInput) => {
        input.children[1] = familyFixture("university-diploma", 1, {
          authority: 2n,
        });
      },
    ],
    [
      "request mismatch",
      (input: MutableAggregateInput) => {
        input.request.requestIdDigest = digest("wrong-request");
      },
    ],
    [
      "stale evidence",
      (input: MutableAggregateInput) => {
        input.children[0].prepared.publicInputs.issuerEvidence.expiresAt =
          1_840_000_000n;
      },
    ],
    [
      "result mismatch",
      (input: MutableAggregateInput) => {
        (
          input.children[1].result as { transcriptDigest: Uint8Array }
        ).transcriptDigest = digest("wrong-transcript");
      },
    ],
    [
      "omitted no-status evidence",
      (input: MutableAggregateInput) => {
        input.children[0].prepared.publicInputs.statusEvidence =
          undefined as never;
      },
    ],
  ] as const)("fails closed for %s", (_label, mutate) => {
    const input = clone(
      inputFor([
        familyFixture("birth-secret", 1),
        familyFixture("university-diploma", 1),
      ]),
    ) as MutableAggregateInput;
    mutate(input);
    expect(prepareAggregateDecisionSetV1(input, verificationPorts).kind).toBe(
      "aggregate-attempt",
    );
  });

  it("rejects missing or mismatched same-holder evidence without substituting it for child authority", () => {
    const input = inputFor(
      [
        familyFixture("birth-secret", 1),
        familyFixture("university-diploma", 1),
      ],
      { sameHolder: true },
    );
    input.sameHolder.proofDigest = zero();
    expect(
      prepareAggregateDecisionSetV1(input, verificationPorts),
    ).toMatchObject({
      kind: "aggregate-attempt",
      classification: "invalid",
      authority: "none",
      reasonCode: "aggregate-same-holder-mismatch-v1",
    });
  });

  it("preserves indeterminate child classification without claiming aggregate authority", () => {
    const input = inputFor([
      familyFixture("birth-secret", 1),
      familyFixture("university-diploma", 1),
    ]) as MutableAggregateInput;
    input.children[1].result = {
      version: 1,
      kind: "local-attempt",
      targetProfile: "ledger-local-v1",
      authority: "local-process",
      proofStatus: "indeterminate",
      decisionStatus: "notEvaluated",
      executionStatus: "notSubmitted",
      transcriptDigest: input.children[1].prepared.transcriptDigest,
      reasonCode: "evidence-unavailable-v1",
      failureStage: "trust",
    };
    input.children[1].prepared.publicInputs.issuerEvidence.mode = 1n;
    const result = prepareAggregateDecisionSetV1(input, verificationPorts);
    expect(result).toMatchObject({
      kind: "aggregate-attempt",
      classification: "indeterminate",
      authority: "none",
      reasonCode: "aggregate-child-indeterminate-v1",
    });
    expect(
      result.children.find((child) => child.proofStatus === "indeterminate"),
    ).toMatchObject({
      proofStatus: "indeterminate",
      decisionStatus: "notEvaluated",
      failureStage: "trust",
    });
  });

  it("exposes privacy-safe hidden-holder family snapshots only", () => {
    const prepared = expectPrepared(
      inputFor(
        [
          familyFixture("birth-secret", 1),
          familyFixture("university-diploma", 1),
        ],
        { sameHolder: true },
      ),
    );
    const visible = {
      kind: prepared.kind,
      authority: prepared.authority,
      children: prepared.children.map((child) => ({
        familyDigest: hex(child.familyDigest).slice(0, 12),
        proofStatus: child.proofStatus,
        decisionStatus: child.decisionStatus,
        authority: child.authority,
        holderBindingDigest: hex(child.holderBindingDigest).slice(0, 12),
      })),
      sameHolder: {
        mode: prepared.sameHolder.mode,
        proofDigest: hex(prepared.sameHolder.proofDigest).slice(0, 12),
      },
    };
    expect(visible).toMatchInlineSnapshot(`
      {
        "authority": "ledger-local",
        "children": [
          {
            "authority": 1n,
            "decisionStatus": 1n,
            "familyDigest": "7d6722172668",
            "holderBindingDigest": "f7de1dbe4dd7",
            "proofStatus": 3n,
          },
          {
            "authority": 1n,
            "decisionStatus": 1n,
            "familyDigest": "cbaaae0074c6",
            "holderBindingDigest": "65550cdd8118",
            "proofStatus": 3n,
          },
        ],
        "kind": "prepared-aggregate-decision",
        "sameHolder": {
          "mode": 1n,
          "proofDigest": "122957bbad38",
        },
      }
    `);
    expect(
      JSON.stringify(visible, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    ).not.toMatch(/secret|opening|claim|statusHandle|holderDid/i);
  });

  it("returns ledger authority for an explicitly read-only committed aggregate", async () => {
    const prepared = expectPrepared(
      inputFor([
        familyFixture("birth-secret", 1),
        familyFixture("university-diploma", 1),
      ]),
    );
    await expect(
      submitAggregateDecisionSetV1(
        prepared,
        {
          submit: async () => ({
            version: 1,
            executionStatus: "committed",
            classification: "approved",
            authority: "ledger-local",
            transcriptDigest: prepared.transcriptDigest,
            decisionNullifier: prepared.transcript.decisionNullifier,
            transactionDigest: asBytes32(digest("read-only-aggregate")),
            atomicMutation: "none",
          }),
          confirmCommitted: async () => true,
        },
        verificationPorts,
      ),
    ).resolves.toMatchObject({
      kind: "aggregate-ledger-receipt",
      classification: "approved",
      authority: "ledger-local",
      atomicMutation: "none",
    });
  });

  it("requires exact atomic nullifier consumption and committed confirmation for side effects", async () => {
    const prepared = expectPrepared(
      inputFor(
        [
          familyFixture("birth-secret", 1),
          familyFixture("university-diploma", 1),
        ],
        { sideEffect: true },
      ),
    );
    const observation: AggregateLedgerExecutionObservationV1 = {
      version: 1,
      executionStatus: "committed",
      classification: "approved",
      authority: "ledger-local",
      transcriptDigest: prepared.transcriptDigest,
      decisionNullifier: asBytes32(prepared.transcript.decisionNullifier),
      transactionDigest: asBytes32(digest("aggregate:transaction")),
      atomicMutation: "committed",
    };
    const executor: AggregateDecisionExecutorV1 = {
      submit: async () => observation,
      confirmCommitted: async () => true,
    };
    await expect(
      submitAggregateDecisionSetV1(prepared, executor, verificationPorts),
    ).resolves.toMatchObject({
      kind: "aggregate-ledger-receipt",
      classification: "approved",
      authority: "ledger-local",
      atomicMutation: "committed",
    });
    await expect(
      submitAggregateDecisionSetV1(
        prepared,
        {
          ...executor,
          submit: async () => ({ ...observation, atomicMutation: "none" }),
        },
        verificationPorts,
      ),
    ).resolves.toMatchObject({ kind: "aggregate-attempt", authority: "none" });
    await expect(
      submitAggregateDecisionSetV1(
        prepared,
        {
          ...executor,
          confirmCommitted: async () => false,
        },
        verificationPorts,
      ),
    ).resolves.toMatchObject({
      kind: "aggregate-attempt",
      classification: "indeterminate",
      authority: "none",
    });
  });

  it("revalidates the complete prepared aggregate at the executor boundary", async () => {
    const prepared = expectPrepared(
      inputFor(
        [
          familyFixture("birth-secret", 1),
          familyFixture("university-diploma", 1),
        ],
        { sideEffect: true },
      ),
    );
    const mutatedPrepared = clone(prepared);
    mutatedPrepared.children[0].issuerDidDigest = digest("mutated-issuer");
    const submit = async (): Promise<AggregateLedgerExecutionObservationV1> => {
      throw new Error("must not be called");
    };
    await expect(
      submitAggregateDecisionSetV1(
        mutatedPrepared,
        {
          submit,
          confirmCommitted: async () => true,
        },
        verificationPorts,
      ),
    ).resolves.toMatchObject({
      kind: "aggregate-attempt",
      classification: "invalid",
      authority: "none",
    });
  });

  it.each([
    ["null", null],
    ["primitive", 7],
    ["bad classification", { classification: "invented" }],
    [
      "bad digest",
      {
        version: 1,
        executionStatus: "committed",
        classification: "approved",
        authority: "ledger-local",
        transcriptDigest: new Uint8Array(3),
        decisionNullifier: new Uint8Array(32),
        transactionDigest: new Uint8Array(32).fill(1),
        atomicMutation: "none",
      },
    ],
  ])(
    "returns a bounded failure for a %s executor observation",
    async (_label, providerValue) => {
      const prepared = expectPrepared(
        inputFor([
          familyFixture("birth-secret", 1),
          familyFixture("university-diploma", 1),
        ]),
      );
      await expect(
        submitAggregateDecisionSetV1(
          prepared,
          {
            submit: async () => providerValue,
            confirmCommitted: async () => true,
          },
          verificationPorts,
        ),
      ).resolves.toMatchObject({
        kind: "aggregate-attempt",
        classification: "invalid",
        authority: "none",
      });
    },
  );

  it("rejects prepared child semantic mutation even when aggregate hashes are recomputed", async () => {
    const prepared = expectPrepared(
      inputFor([
        familyFixture("birth-secret", 1),
        familyFixture("university-diploma", 1),
      ]),
    );
    const mutable = clone(prepared);
    (mutable.sourceChildren[0].result as { proofStatus: string }).proofStatus =
      "invalid";
    mutable.children[0].proofStatus = 1n;
    (mutable.childDiagnostics[0] as { proofStatus: string }).proofStatus =
      "invalid";
    const childDigests = mutable.children.map(
      hashAggregateChildDecisionBindingV1,
    );
    mutable.childSet.firstChildDigest = childDigests[0];
    mutable.childSet.secondChildDigest = childDigests[1];
    mutable.transcript.childSetDigest = hashAggregateChildSetV1(
      mutable.childSet,
    );
    (mutable as unknown as { transcriptDigest: Uint8Array }).transcriptDigest =
      hashAggregateDecisionTranscriptV1(mutable.transcript);
    await expect(
      submitAggregateDecisionSetV1(
        mutable,
        {
          submit: async () => {
            throw new Error("must not submit mutated prepared records");
          },
          confirmCommitted: async () => true,
        },
        verificationPorts,
      ),
    ).resolves.toMatchObject({
      kind: "aggregate-attempt",
      classification: "invalid",
      authority: "none",
    });
  });

  it("defeats confirmation callback mutation with immutable snapshots and final revalidation", async () => {
    const prepared = expectPrepared(
      inputFor([
        familyFixture("birth-secret", 1),
        familyFixture("university-diploma", 1),
      ]),
    );
    const observation = {
      version: 1 as const,
      executionStatus: "committed" as const,
      classification: "approved" as const,
      authority: "ledger-local" as const,
      transcriptDigest: prepared.transcriptDigest,
      decisionNullifier: prepared.transcript.decisionNullifier,
      transactionDigest: asBytes32(digest("confirmation-mutation")),
      atomicMutation: "none" as const,
    };
    await expect(
      submitAggregateDecisionSetV1(
        prepared,
        {
          submit: async () => observation,
          confirmCommitted: async (
            confirmationObservation,
            confirmationPrepared,
          ) => {
            confirmationObservation.transactionDigest?.fill(0);
            confirmationPrepared.children[0].proofStatus = 1n;
            return true;
          },
        },
        verificationPorts,
      ),
    ).resolves.toMatchObject({
      kind: "aggregate-attempt",
      classification: "indeterminate",
      authority: "none",
      reasonCode: "aggregate-unconfirmed-v1",
    });
  });

  it("accepts committed replay as an idempotent no-op and rejects replay without the same nullifier", async () => {
    const prepared = expectPrepared(
      inputFor(
        [
          familyFixture("birth-secret", 1),
          familyFixture("university-diploma", 1),
        ],
        { sideEffect: true },
      ),
    );
    const replay = (
      nullifier = prepared.transcript.decisionNullifier,
    ): AggregateDecisionExecutorV1 => ({
      submit: async () => ({
        version: 1,
        executionStatus: "committed",
        classification: "replay",
        authority: "ledger-local",
        transcriptDigest: prepared.transcriptDigest,
        decisionNullifier: asBytes32(nullifier),
        transactionDigest: asBytes32(digest("aggregate:replay-transaction")),
        atomicMutation: "none",
      }),
      confirmCommitted: async () => true,
    });
    await expect(
      submitAggregateDecisionSetV1(prepared, replay(), verificationPorts),
    ).resolves.toMatchObject({
      kind: "aggregate-ledger-receipt",
      classification: "replay",
      atomicMutation: "none",
    });
    await expect(
      submitAggregateDecisionSetV1(
        prepared,
        replay(digest("other-nullifier")),
        verificationPorts,
      ),
    ).resolves.toMatchObject({
      kind: "aggregate-attempt",
      classification: "invalid",
    });
  });
});
