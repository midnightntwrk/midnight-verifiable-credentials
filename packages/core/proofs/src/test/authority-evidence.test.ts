import type {
  CredentialFamilyProfileV1,
  ResolvedCredentialCompositionV1,
} from "@midnight-ntwrk/credential-model";
import { describe, expect, it } from "vitest";

import {
  AUTHORITY_ACTOR_ROLES_V1,
  createAuthorityEvidencePolicyV1,
  type DidMethodEvidenceProviderV1,
  type DidMethodEvidenceV1,
  type Sha256Digest,
  type TrustAuthorizationEvidenceProviderV1,
  type TrustAuthorizationEvidenceV1,
  verifyAuthorityEvidenceV1,
} from "../index.js";

const profile = {
  formatVersion: 1,
  id: "fixture.profile",
  version: "1.0.0",
  semantics: {
    did: {
      method: "did:midnight",
      relationship: "assertionMethod",
      network: "midnight:testnet",
      versionEvidence: "did-ledger-state-version-v1",
    },
    trust: {
      scope: "fixture.education",
      epochEvidence: "trust-registry-epoch-v1",
    },
  },
  requirements: {
    providers: [
      { id: "did", role: "did-resolver" },
      { id: "trust", role: "trust-resolver" },
    ],
  },
} as unknown as CredentialFamilyProfileV1;

const composition = {
  formatVersion: 1,
  profile: { id: profile.id, version: profile.version },
  providers: [
    {
      requirementId: "trust",
      role: "trust-resolver",
      providerId: "fixture.trust-provider",
      providerVersion: "1.0.0",
      instanceId: "trust:testnet",
    },
    {
      requirementId: "did",
      role: "did-resolver",
      providerId: "fixture.did-provider",
      providerVersion: "1.0.0",
      instanceId: "did:testnet",
    },
  ],
} as unknown as ResolvedCredentialCompositionV1;

const relationships = {
  issuer: "assertionMethod",
  holder: "authentication",
  verifier: "authentication",
  status: "capabilityInvocation",
} as const;

const actors = AUTHORITY_ACTOR_ROLES_V1.map((role, index) => ({
  role,
  did: `did:midnight:testnet:${role}`,
  methodId: `did:midnight:testnet:${role}#key-2`,
  keyFingerprint: `sha256:${String(index + 1).repeat(64)}` as Sha256Digest,
  relationship: relationships[role],
  stateVersion: "2",
  trustEpoch: "2026-09",
}));

const policy = () =>
  createAuthorityEvidencePolicyV1({ profile, composition, actors });

const didEvidence = (
  role: (typeof AUTHORITY_ACTOR_ROLES_V1)[number],
): DidMethodEvidenceV1 => {
  const actor = actors.find((candidate) => candidate.role === role)!;
  return {
    formatVersion: 1,
    evidenceId: `did-evidence:${role}:2`,
    authenticated: true,
    observedAt: "2026-09-02T00:00:00.000Z",
    did: actor.did,
    method: "did:midnight",
    methodId: actor.methodId,
    keyFingerprint: actor.keyFingerprint,
    relationships: [actor.relationship],
    network: "midnight:testnet",
    stateVersion: "2",
    versionEvidence: "did-ledger-state-version-v1",
    lifecycle: {
      status: "active",
      activatedAtStateVersion: "2",
      previousMethodId: `did:midnight:testnet:${role}#key-1`,
    },
  };
};

const trustEvidence = (
  role: (typeof AUTHORITY_ACTOR_ROLES_V1)[number],
): TrustAuthorizationEvidenceV1 => {
  const actor = actors.find((candidate) => candidate.role === role)!;
  return {
    formatVersion: 1,
    evidenceId: `trust-evidence:${role}:2026-09`,
    authenticated: true,
    observedAt: "2026-09-02T00:00:01.000Z",
    subjectDid: actor.did,
    methodId: actor.methodId,
    keyFingerprint: actor.keyFingerprint,
    network: "midnight:testnet",
    scope: "fixture.education",
    epoch: "2026-09",
    epochEvidence: "trust-registry-epoch-v1",
    status: "active",
  };
};

const providers = (overrides?: {
  readonly did?: (role: (typeof AUTHORITY_ACTOR_ROLES_V1)[number]) =>
    | DidMethodEvidenceV1
    | undefined;
  readonly trust?: (role: (typeof AUTHORITY_ACTOR_ROLES_V1)[number]) =>
    | TrustAuthorizationEvidenceV1
    | undefined;
}) => ({
  didProvider: {
    resolve: async ({ actor }) =>
      overrides?.did === undefined
        ? didEvidence(actor.role)
        : overrides.did(actor.role),
  } satisfies DidMethodEvidenceProviderV1,
  trustProvider: {
    resolve: async ({ actor }) =>
      overrides?.trust === undefined
        ? trustEvidence(actor.role)
        : overrides.trust(actor.role),
  } satisfies TrustAuthorizationEvidenceProviderV1,
});

const context = {
  proofDigest: `sha256:${"a".repeat(64)}` as const,
  credentialDigest: `sha256:${"b".repeat(64)}` as const,
  presentationDigest: `sha256:${"c".repeat(64)}` as const,
  requestDigest: `sha256:${"d".repeat(64)}` as const,
};

describe("authority evidence binding v1", () => {
  it("accepts the current keys after positive rotation and canonically commits every selected evidence identity", async () => {
    const first = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      ...providers(),
    });
    const second = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      ...providers(),
    });

    expect(first).toMatchObject({
      formatVersion: 1,
      status: "valid",
      decisionStatus: "approved",
      accepted: true,
      reasonCodes: [],
    });
    expect(first.transcriptDigest).toBe(second.transcriptDigest);
    expect(first.transcriptDigest).toMatchInlineSnapshot(`"sha256:5c69cbddfc18bc9d94416beba888f1f3c6677282126814ec5110964a22f19d7c"`);
    expect(first.transcript.actors.map((entry) => entry.role)).toEqual(
      AUTHORITY_ACTOR_ROLES_V1,
    );
    for (const entry of first.transcript.actors) {
      expect(entry.didEvidence).toMatchObject({
        evidenceId: `did-evidence:${entry.role}:2`,
        stateVersion: "2",
        lifecycleStatus: "active",
        activatedAtStateVersion: "2",
      });
      expect(entry.trustEvidence).toMatchObject({
        evidenceId: `trust-evidence:${entry.role}:2026-09`,
        scope: "fixture.education",
        epoch: "2026-09",
      });
    }
    expect(JSON.stringify(first)).not.toContain("privateWitness");
    expect(JSON.stringify(first)).not.toContain("key-1-secret");
  });

  it.each(AUTHORITY_ACTOR_ROLES_V1)(
    "rejects a copied %s method reference carrying an attacker key",
    async (role) => {
      const attackerActors = actors.map((actor) =>
        actor.role === role
          ? {
              ...actor,
              keyFingerprint: `sha256:${"f".repeat(64)}` as Sha256Digest,
            }
          : actor,
      );
      const result = await verifyAuthorityEvidenceV1({
        policy: createAuthorityEvidencePolicyV1({
          profile,
          composition,
          actors: attackerActors,
        }),
        context,
        ...providers(),
      });

      expect(result.status).toBe("invalid");
      expect(result.accepted).toBe(false);
      expect(result.reasonCodes).toContain(`${role}:DID_KEY_MISMATCH`);
      expect(result.reasonCodes).toContain(`${role}:TRUST_KEY_MISMATCH`);
    },
  );

  it("projects provider evidence into the public transcript without unknown private fields", async () => {
    const result = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      ...providers({
        did: (role) =>
          ({
            ...didEvidence(role),
            privateHolderWitness: "provider-must-not-retain-this",
          }) as DidMethodEvidenceV1,
      }),
    });

    expect(result.status).toBe("valid");
    expect(JSON.stringify(result)).not.toContain("provider-must-not-retain-this");
    expect(result.transcript.policy.providers).toEqual(policy().providers);
  });

  it.each(AUTHORITY_ACTOR_ROLES_V1)(
    "enforces every exact DID method binding and lifecycle state for %s",
    async (selectedRole) => {
      const mutations: ReadonlyArray<
        readonly [
          string,
          (evidence: DidMethodEvidenceV1) => DidMethodEvidenceV1,
        ]
      > = [
        ["DID_SUBJECT_MISMATCH", (evidence) => ({ ...evidence, did: `${evidence.did}:attacker` })],
        ["DID_METHOD_MISMATCH", (evidence) => ({ ...evidence, method: "did:web" })],
        ["DID_METHOD_REFERENCE_MISMATCH", (evidence) => ({ ...evidence, methodId: `${evidence.did}#attacker` })],
        ["DID_RELATIONSHIP_MISMATCH", (evidence) => ({ ...evidence, relationships: ["keyAgreement"] })],
        ["DID_NETWORK_MISMATCH", (evidence) => ({ ...evidence, network: "midnight:mainnet" })],
        ["DID_STATE_VERSION_MISMATCH", (evidence) => ({ ...evidence, stateVersion: "1" })],
        ["DID_VERSION_EVIDENCE_MISMATCH", (evidence) => ({ ...evidence, versionEvidence: "untrusted-version" })],
        ["DID_METHOD_ROTATED", (evidence) => ({ ...evidence, lifecycle: { status: "rotated", activatedAtStateVersion: "1", replacedByMethodId: evidence.methodId.replace("key-2", "key-3") } })],
        ["DID_METHOD_REVOKED", (evidence) => ({ ...evidence, lifecycle: { status: "revoked", activatedAtStateVersion: "2" } })],
        ["DID_DEACTIVATED", (evidence) => ({ ...evidence, lifecycle: { status: "deactivated", activatedAtStateVersion: "2", deactivatedAtStateVersion: "2" } })],
      ];

      for (const [reasonCode, mutate] of mutations) {
        const result = await verifyAuthorityEvidenceV1({
          policy: policy(),
          context,
          ...providers({
            did: (role) =>
              role === selectedRole
                ? mutate(didEvidence(role))
                : didEvidence(role),
          }),
        });

        expect(result).toMatchObject({
          status: "invalid",
          decisionStatus: "notEvaluated",
          accepted: false,
        });
        expect(result.reasonCodes).toContain(`${selectedRole}:${reasonCode}`);
      }
    },
  );

  it.each(AUTHORITY_ACTOR_ROLES_V1)(
    "enforces every exact trust scope and epoch binding for %s",
    async (selectedRole) => {
      const mutations: ReadonlyArray<
        readonly [
          string,
          (
            evidence: TrustAuthorizationEvidenceV1,
          ) => TrustAuthorizationEvidenceV1,
        ]
      > = [
        ["TRUST_SUBJECT_MISMATCH", (evidence) => ({ ...evidence, subjectDid: `${evidence.subjectDid}:attacker` })],
        ["TRUST_METHOD_MISMATCH", (evidence) => ({ ...evidence, methodId: `${evidence.subjectDid}#attacker` })],
        ["TRUST_KEY_MISMATCH", (evidence) => ({ ...evidence, keyFingerprint: `sha256:${"e".repeat(64)}` as Sha256Digest })],
        ["TRUST_NETWORK_MISMATCH", (evidence) => ({ ...evidence, network: "midnight:mainnet" })],
        ["TRUST_SCOPE_MISMATCH", (evidence) => ({ ...evidence, scope: "fixture.passport" })],
        ["TRUST_EPOCH_MISMATCH", (evidence) => ({ ...evidence, epoch: "2026-08" })],
        ["TRUST_EPOCH_EVIDENCE_MISMATCH", (evidence) => ({ ...evidence, epochEvidence: "untrusted-epoch" })],
        ["TRUST_NOT_ACTIVE", (evidence) => ({ ...evidence, status: "suspended" })],
        ["TRUST_NOT_ACTIVE", (evidence) => ({ ...evidence, status: "withdrawn" })],
      ];

      for (const [reasonCode, mutate] of mutations) {
        const result = await verifyAuthorityEvidenceV1({
          policy: policy(),
          context,
          ...providers({
            trust: (role) =>
              role === selectedRole
                ? mutate(trustEvidence(role))
                : trustEvidence(role),
          }),
        });

        expect(result.status).toBe("invalid");
        expect(result.accepted).toBe(false);
        expect(result.reasonCodes).toContain(`${selectedRole}:${reasonCode}`);
      }
    },
  );

  it("requires all four context digests and projects away unknown context fields", async () => {
    const incompleteContext = { ...context } as Partial<typeof context>;
    delete incompleteContext.proofDigest;
    await expect(
      verifyAuthorityEvidenceV1({
        policy: policy(),
        context: incompleteContext as typeof context,
        ...providers(),
      }),
    ).rejects.toThrow(/proofDigest/);

    const privateContext = {
      ...context,
      privateWitnessDigest: `sha256:${"e".repeat(64)}`,
    };
    const result = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context: privateContext,
      ...providers(),
    });
    expect(result.transcript.context).toEqual(context);
    expect(JSON.stringify(result)).not.toContain("privateWitnessDigest");
  });

  it("revalidates the exact four policy actors at the verifier boundary", async () => {
    await expect(
      verifyAuthorityEvidenceV1({
        policy: { ...policy(), actors: [] },
        context,
        ...providers(),
      }),
    ).rejects.toThrow(/issuer, holder, verifier, and status/);
  });

  it("does not let a provider mutate authoritative actor requirements", async () => {
    const attackerFingerprint = `sha256:${"f".repeat(64)}` as Sha256Digest;
    const mutatingDid: DidMethodEvidenceProviderV1 = {
      resolve: async (request) => {
        const mutable = request.actor as {
          methodId: string;
          keyFingerprint: Sha256Digest;
        };
        mutable.methodId = `${request.actor.did}#attacker`;
        mutable.keyFingerprint = attackerFingerprint;
        return {
          ...didEvidence(request.actor.role),
          methodId: mutable.methodId,
          keyFingerprint: mutable.keyFingerprint,
        };
      },
    };
    const result = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      didProvider: mutatingDid,
      trustProvider: providers().trustProvider,
    });

    expect(result.status).toBe("invalid");
    expect(result.reasonCodes).toContain("issuer:DID_METHOD_REFERENCE_MISMATCH");
    expect(result.transcript.actors[0]?.requirement.methodId).toBe(
      actors[0]?.methodId,
    );
    expect(result.transcript.actors[0]?.requirement.keyFingerprint).toBe(
      actors[0]?.keyFingerprint,
    );
  });

  it("treats malformed optional lifecycle metadata as unavailable without retaining it", async () => {
    const secret = "private-lifecycle-witness";
    const result = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      didProvider: {
        resolve: async ({ actor }) =>
          ({
            ...didEvidence(actor.role),
            lifecycle: {
              ...didEvidence(actor.role).lifecycle,
              previousMethodId: { privateHolderWitness: secret },
            },
          }) as unknown as DidMethodEvidenceV1,
      },
      trustProvider: providers().trustProvider,
    });

    expect(result.status).toBe("indeterminate");
    expect(result.reasonCodes).toContain("holder:DID_EVIDENCE_UNAVAILABLE");
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("classifies missing, unauthenticated, and unavailable providers as indeterminate", async () => {
    const missing = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      ...providers({ did: (role) => role === "holder" ? undefined : didEvidence(role) }),
    });
    expect(missing).toMatchObject({
      status: "indeterminate",
      decisionStatus: "notEvaluated",
      accepted: false,
    });
    expect(missing.reasonCodes).toContain("holder:DID_EVIDENCE_UNAVAILABLE");

    const unauthenticated = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      ...providers({
        trust: (role) => role === "verifier"
          ? { ...trustEvidence(role), authenticated: false }
          : trustEvidence(role),
      }),
    });
    expect(unauthenticated.status).toBe("indeterminate");
    expect(unauthenticated.reasonCodes).toContain(
      "verifier:TRUST_EVIDENCE_UNAVAILABLE",
    );

    const unavailable = await verifyAuthorityEvidenceV1({
      policy: policy(),
      context,
      didProvider: { resolve: async () => { throw new Error("resolver offline"); } },
      trustProvider: providers().trustProvider,
    });
    expect(unavailable.status).toBe("indeterminate");
    expect(unavailable.reasonCodes).toContain("issuer:DID_EVIDENCE_UNAVAILABLE");
  });

  it("requires resolved DID and trust providers from the selected profile composition", () => {
    const withoutTrust = {
      ...composition,
      providers: composition.providers.filter(
        (provider) => provider.role !== "trust-resolver",
      ),
    } as ResolvedCredentialCompositionV1;
    expect(() =>
      createAuthorityEvidencePolicyV1({
        profile,
        composition: withoutTrust,
        actors,
      }),
    ).toThrow(/trust-resolver/);
  });

  it("rejects a composition for another profile and incomplete provider identities", () => {
    expect(() =>
      createAuthorityEvidencePolicyV1({
        profile,
        composition: {
          ...composition,
          profile: { id: profile.id, version: "2.0.0" },
        },
        actors,
      }),
    ).toThrow(/composition profile/);

    expect(() =>
      createAuthorityEvidencePolicyV1({
        profile,
        composition: {
          ...composition,
          providers: composition.providers.map((provider) =>
            provider.role === "did-resolver"
              ? { ...provider, instanceId: "" }
              : provider,
          ),
        },
        actors,
      }),
    ).toThrow(/instanceId/);
  });
});
