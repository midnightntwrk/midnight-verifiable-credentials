import { hashVerificationTranscriptV1 } from "@midnight-ntwrk/midnight-did-credentials";
import { describe, expect, it } from "vitest";

import {
  decodeUniversityCanonicalJson,
  DeterministicUniversityPartyRuntime,
  executeUniversityVerificationV1Decision,
  FaultInjectingUniversityProofExecutionBackend,
  InMemoryUniversityEvidenceAuditSink,
  InMemoryUniversityProtocolCheckpointStore,
  loadUniversityProductionEvidencePolicies,
  SimulatorUniversityProofExecutionBackend,
  UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
  type UniversityNetworkBoundary,
  type UniversityProcessBoundary,
  UniversityProductionEvidenceRunner,
  type UniversityProtocolCheckpoint,
  type UniversityProtocolCheckpointStore,
  type UniversitySigningProvider,
} from "../testing.js";

const policy = (id: string) => {
  const selected = loadUniversityProductionEvidencePolicies().find(
    (candidate) => candidate.id === id,
  );
  if (!selected) throw new Error(`missing policy ${id}`);
  return selected;
};

describe("University production-shaped evidence", () => {
  it("runs request → issuance → presentation → Verification V1 with restart and correlation", () => {
    const audit = new InMemoryUniversityEvidenceAuditSink();
    const evidence = new UniversityProductionEvidenceRunner({ audit }).run({
      correlationId: "university-e2e-approved",
      policy: policy("synthetic-happy-restart"),
    });

    expect(evidence.qualification).toBe("production-shaped-evidence-only");
    expect(evidence.productionApproved).toBe(false);
    expect(evidence.profile.id).toBe(
      "profile.use-case.university-production-evidence",
    );
    expect(evidence.openIdProfile).toBe("org.midnight.credentials.openid.v1");
    expect(evidence.checkpoints).toHaveLength(3);
    expect(evidence.flow.issuance.resultCount).toBeGreaterThan(0);
    expect(evidence.flow.jobApplications.requestCount).toBeGreaterThan(0);
    expect(evidence.flow.jobApplications.acceptedCount).toBeGreaterThan(0);
    expect(evidence.verificationV1Decisions).toHaveLength(15);
    expect(
      evidence.verificationV1Decisions.filter(
        ({ result }) => result.decisionStatus === "approved",
      ),
    ).toHaveLength(13);
    expect(
      evidence.verificationV1Decisions.filter(
        ({ result }) => result.decisionStatus === "policyDenied",
      ),
    ).toHaveLength(2);
    expect(
      evidence.verificationV1Decisions.every(
        ({ result }) =>
          result.kind === "local-attempt" &&
          result.targetProfile === "offchain-public-v1" &&
          result.authority === "local-process" &&
          result.proofStatus === "valid" &&
          result.executionStatus === "notSubmitted" &&
          result.transcriptDigest?.length === 32,
      ),
    ).toBe(true);
    expect(evidence.publicSurfaceMessages.map((message) => message.kind)).toEqual([
      "issuance-request",
      "credential",
      "presentation-request",
      "presentation",
    ]);
    const sourceMessages = [
      evidence.flow.issuance.messages.find(
        (message) => message.type === "issuance:request",
      ),
      evidence.flow.issuance.messages.find(
        (message) => message.type === "issuance:result",
      ),
      evidence.flow.jobApplications.messages.find(
        (message) => message.type === "presentation:request",
      ),
      evidence.flow.jobApplications.messages.find(
        (message) => message.type === "presentation:submission",
      ),
    ];
    for (const [index, canonical] of evidence.publicSurfaceMessages.entries()) {
      const json = Buffer.from(canonical.payload).toString("utf8");
      expect(() => JSON.parse(json)).not.toThrow();
      expect(decodeUniversityCanonicalJson(json)).toEqual(
        sourceMessages[index]?.body,
      );
    }
    const firstDecision = evidence.verificationV1Decisions[0]!;
    expect(Object.keys(firstDecision.transcript)).toHaveLength(47);
    expect(hashVerificationTranscriptV1(firstDecision.transcript)).toEqual(
      firstDecision.result.transcriptDigest,
    );
    expect(audit.snapshot().every((event) => event.correlationId === "university-e2e-approved")).toBe(true);
    expect(JSON.stringify(audit.snapshot())).not.toMatch(
      /secretKey|privateKey|signingKey|credentialProof/i,
    );
  });

  it("changes the canonical V1 transcript digest when actual inputs mutate", () => {
    const evidence = new UniversityProductionEvidenceRunner().run({
      correlationId: "university-transcript-mutation",
      policy: policy("synthetic-happy-restart"),
    });
    const result = evidence.flow.jobApplications.messages.find(
      (message) =>
        message.type === "presentation:result" && message.body.accepted,
    );
    if (!result || result.type !== "presentation:result") {
      throw new Error("missing accepted presentation result");
    }
    const sameThread = (message: { readonly envelope: { readonly threadId: Uint8Array } }) =>
      Buffer.from(message.envelope.threadId).equals(
        Buffer.from(result.envelope.threadId),
      );
    const request = evidence.flow.jobApplications.messages.find(
      (message) => message.type === "presentation:request" && sameThread(message),
    );
    const submission = evidence.flow.jobApplications.messages.find(
      (message) =>
        message.type === "presentation:submission" && sameThread(message),
    );
    const issuance = evidence.flow.issuance.messages.find(
      (message) =>
        message.type === "issuance:result" &&
        message.body.studentId === result.body.studentId,
    );
    if (
      !request ||
      request.type !== "presentation:request" ||
      !submission ||
      submission.type !== "presentation:submission" ||
      !issuance ||
      issuance.type !== "issuance:result"
    ) {
      throw new Error("missing Verification V1 source messages");
    }

    const decide = (
      overrides: Partial<
        Parameters<typeof executeUniversityVerificationV1Decision>[0]
      > = {},
    ) =>
      executeUniversityVerificationV1Decision({
        profile: overrides.profile ?? UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
        issuance: overrides.issuance ?? issuance,
        request: overrides.request ?? request,
        submission: overrides.submission ?? submission,
        result: overrides.result ?? result,
      });

    const baseline = decide();
    const mutatedClaimRoot = Uint8Array.from(
      issuance.body.credential.claimRoot,
    );
    mutatedClaimRoot[0] = mutatedClaimRoot[0]! ^ 0xff;
    const credentialMutation = decide({
      issuance: {
        ...issuance,
        body: {
          ...issuance.body,
          credential: {
            ...issuance.body.credential,
            claimRoot: mutatedClaimRoot,
          },
        },
      },
    });
    const requestMutation = decide({
      request: {
        ...request,
        body: {
          ...request.body,
          request: {
            ...request.body.request,
            minimumFinalGrade:
              request.body.request.minimumFinalGrade + 1n,
          },
        },
      },
    });
    const presentationMutation = decide({
      submission: {
        ...submission,
        body: {
          ...submission.body,
          presentation: {
            ...submission.body.presentation,
            version: submission.body.presentation.version + 1n,
          },
        },
      },
    });

    expect(credentialMutation.result.transcriptDigest).not.toEqual(
      baseline.result.transcriptDigest,
    );
    expect(requestMutation.result.transcriptDigest).not.toEqual(
      baseline.result.transcriptDigest,
    );
    expect(presentationMutation.result.transcriptDigest).not.toEqual(
      baseline.result.transcriptDigest,
    );
  });

  it("persists restart state and handles issuance replay idempotently and presentation replay negatively", () => {
    const store = new InMemoryUniversityProtocolCheckpointStore();
    const evidence = new UniversityProductionEvidenceRunner({
      checkpointStore: store,
    }).run({
      correlationId: "university-replay",
      policy: policy("synthetic-replay-idempotency"),
    });

    expect(evidence.flow.issuance.idempotentReplayStudentIds).toContain("STU-0001");
    expect(evidence.flow.jobApplications.duplicateRejectedCount).toBeGreaterThan(0);
    expect(store.serializedRecords()).toHaveLength(1);
    expect(store.serializedRecords().join("\n")).not.toMatch(/secretKey|privateKey/i);
  });

  it("reports tampering as a failed Verification V1 decision without consuming production authority", () => {
    const evidence = new UniversityProductionEvidenceRunner().run({
      correlationId: "university-tamper",
      policy: policy("synthetic-tampered-presentation"),
    });

    expect(evidence.flow.jobApplications.verificationRejectedCount).toBeGreaterThan(0);
    expect(
      evidence.verificationV1Decisions.some(({ result }) =>
        result.proofStatus === "invalid" &&
        result.decisionStatus === "notEvaluated" &&
        result.executionStatus === "notSubmitted" &&
        result.reasonCode === "verification-invalid-v1" &&
        result.failureStage === "proof",
      ),
    ).toBe(true);
    expect(evidence.productionApproved).toBe(false);
  });

  it("includes mall verifier failures in per-request Verification V1 results", () => {
    const evidence = new UniversityProductionEvidenceRunner({
      proofExecutionBackend: new FaultInjectingUniversityProofExecutionBackend(
        new SimulatorUniversityProofExecutionBackend(),
        "verifyMallDiscount",
      ),
    }).run({
      correlationId: "university-mall-proof-fault",
      policy: policy("synthetic-happy-restart"),
    });

    const mallDecisions = evidence.verificationV1Decisions.filter(
      ({ verifierId }) => verifierId.startsWith("mall-"),
    );
    expect(mallDecisions).toHaveLength(5);
    expect(
      mallDecisions.every(({ result }) => result.proofStatus === "invalid"),
    ).toBe(true);
  });

  it.each([
    [
      "network",
      {
        network: {
          exchange: () => {
            throw new Error("network unavailable");
          },
        } satisfies UniversityNetworkBoundary,
      },
      /network unavailable/,
    ],
    [
      "process",
      {
        process: {
          execute: () => {
            throw new Error("process crashed");
          },
        } satisfies UniversityProcessBoundary,
      },
      /process crashed/,
    ],
    [
      "proof",
      {
        proofExecutionBackend: new FaultInjectingUniversityProofExecutionBackend(
          new SimulatorUniversityProofExecutionBackend(),
          "issueDiplomaCredential",
        ),
      },
      /proof execution fault/,
    ],
    [
      "storage",
      {
        checkpointStore: {
          save(checkpoint: UniversityProtocolCheckpoint): void {
            void checkpoint;
            throw new Error("storage unavailable");
          },
          load: () => undefined,
          list: () => [],
        } satisfies UniversityProtocolCheckpointStore,
      },
      /storage unavailable/,
    ],
    [
      "key-custody",
      {
        partyRuntime: new DeterministicUniversityPartyRuntime([], {
          register: () => undefined,
          replace: () => undefined,
          remove: () => true,
          resolveSigner: () => {
            throw new Error("custody unavailable");
          },
          describe: () => ({ providerId: "fault-custody", isolated: true }),
        } satisfies UniversitySigningProvider),
      },
      /custody unavailable/,
    ],
  ])("fails closed at the %s seam and records an operator-safe event", (_seam, ports, error) => {
    const audit = new InMemoryUniversityEvidenceAuditSink();
    const runner = new UniversityProductionEvidenceRunner({ audit, ...ports });

    expect(() =>
      runner.run({
        correlationId: `fault-${_seam}`,
        policy: policy("synthetic-happy-restart"),
      }),
    ).toThrow(error);
    expect(audit.snapshot().at(-1)).toMatchObject({
      correlationId: `fault-${_seam}`,
      stage: _seam,
      outcome: "failed",
    });
  });
});
