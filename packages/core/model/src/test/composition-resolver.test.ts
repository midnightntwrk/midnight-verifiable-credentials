import { describe, expect, it } from "vitest";

import {
  assertCapabilityProviderCatalogV1,
  assertCredentialDeploymentAssemblyV1,
  assertCredentialFamilyProfileV1,
  type CapabilityProviderCatalogV1,
  CREDENTIAL_DEPLOYMENT_ROLES,
  CREDENTIAL_PROFILE_DENY_RULES,
  type CredentialDeploymentAssemblyV1,
  type CredentialDeploymentRole,
  type CredentialFamilyDefinition,
  type CredentialFamilyProfileV1,
  type CredentialModelError,
  resolveCredentialComposition,
} from "../index.js";

interface FixtureCredential {
  employeeId: string;
}

interface FixturePresentation {
  employeeId: string;
}

const family: CredentialFamilyDefinition<
  FixtureCredential,
  FixturePresentation,
  string,
  string
> = {
  id: "fixture.employee",
  version: "1.0.0",
  schema: {
    id: "urn:fixture:employee",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "EmployeeCredential"],
    claims: [
      {
        id: "employeeId",
        path: ["credentialSubject", "employeeId"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
  capabilities: [
    {
      id: "holder-binding.explicit-did",
      kind: "holder-binding",
      version: "1.0.0",
      required: true,
    },
  ],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [],
  },
  credentialCodec: {
    mediaType: "application/json",
    encode: JSON.stringify,
    decode: (value) => JSON.parse(value) as FixtureCredential,
  },
  presentationCodec: {
    mediaType: "application/json",
    encode: JSON.stringify,
    decode: (value) => JSON.parse(value) as FixturePresentation,
  },
};

type Mutable<T> = T extends (...arguments_: never[]) => unknown
  ? T
  : T extends readonly (infer TItem)[]
    ? Mutable<TItem>[]
    : T extends object
      ? { -readonly [TKey in keyof T]: Mutable<T[TKey]> }
      : T;

const deploymentRoles: readonly CredentialDeploymentRole[] = [
  "session",
  "storage",
  "key-custody",
  "signing",
  "did-resolver",
  "trust-resolver",
  "wallet",
  "connector",
  "network",
  "transport",
  "proof-executor",
  "artifact-resolver",
  "status-registry",
  "status-proof",
  "status-authority",
  "status-mutation",
  "replay",
  "verification",
  "registration",
  "anchoring",
];

const profile = (): CredentialFamilyProfileV1 => ({
  formatVersion: 1,
  id: "fixture.employee.offchain-public",
  version: "1.0.0",
  family: {
    id: "fixture.employee",
    version: "1.0.0",
    schemaId: "urn:fixture:employee",
    schemaVersion: "1.0.0",
  },
  semantics: {
    claims: [{ claimId: "employeeId", disclosure: "selective" }],
    holderBinding: {
      mode: "explicit-did",
      capability: { id: "holder-binding.explicit-did", version: "1.0.0" },
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
        witnessPolicy: "public-only",
      },
    },
    verification: {
      profile: "offchain-public-v1",
      location: "local-process",
      authority: "local-process",
      commitState: "not-applicable",
      privateInputSources: [],
    },
    status: { mode: "disabled" },
    did: {
      method: "did:fixture",
      relationship: "authentication",
      network: "fixture-network",
      versionEvidence: "fixture.did.version@1",
    },
    trust: {
      scope: "fixture-employment",
      epochEvidence: "fixture.trust.epoch@1",
    },
    trustedTime: {
      source: "none",
      evidence: "not-required",
      freshnessPolicy: "not-required",
    },
    mutation: {
      location: "none",
      nullifier: "none",
      consumption: "none",
    },
    protocols: ["canonical-reference"],
  },
  requirements: {
    packages: [
      {
        name: "@midnight-ntwrk/credential-compact",
        version: "0.1.0",
        exports: [".", "./composable"],
        domain: "compact",
      },
    ],
    compactEntrypoints: [
      {
        id: "fixture.employee.verify",
        packageName: "@midnight-ntwrk/credential-compact",
        exportPath: "./composable",
        sourcePath: "src/credentials/composable.compact",
      },
    ],
    circuits: [
      {
        id: "fixture.employee.verify",
        semanticVersion: "1.0.0",
        entrypointId: "fixture.employee.verify",
      },
    ],
    artifacts: [
      {
        id: "fixture.employee.verify.verifier",
        mediaType: "application/vnd.fixture.verifier-key",
        artifactClass: "verifier-key",
        circuitId: "fixture.employee.verify",
        digestAlgorithm: "sha256",
        trusted: true,
      },
    ],
    providers: [
      {
        id: "fixture.signing.requirement",
        capability: { id: "signing.ed25519", version: "1.0.0" },
        role: "signing",
      },
      {
        id: "fixture.proof.requirement",
        capability: { id: "proof.fixture", version: "1.0.0" },
        role: "proof-executor",
      },
    ],
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
    fixtureId: "fixture:employee-offchain-public@1",
    evidenceDisposition: "tested",
    evidenceIds: ["test:composition-resolver:offchain-public"],
  },
  maturity: {
    api: { subjectId: "api:credential-model@0.1.0", value: "supported" },
    security: {
      subjectId: "security:fixture.employee.offchain-public@1.0.0",
      value: "design-reviewed",
    },
    standards: {
      subjectId: "standards:canonical-reference@1",
      value: "not-applicable",
    },
    production: {
      subjectId: "production:fixture.employee.offchain-public@unresolved",
      value: "not-assessed",
    },
  },
});

const catalog = (): CapabilityProviderCatalogV1 => ({
  formatVersion: 1,
  providers: [
    {
      id: "fixture.signer",
      version: "1.0.0",
      roles: ["signing"],
      capabilities: [{ id: "signing.ed25519", version: "1.0.0" }],
      packages: [
        {
          name: "@fixture/signing-provider",
          version: "1.0.0",
          exports: ["."],
          domain: "signing",
        },
      ],
      witnessPolicy: "public-only",
      atomicReplay: false,
    },
    {
      id: "fixture.prover",
      version: "1.0.0",
      roles: ["proof-executor"],
      capabilities: [{ id: "proof.fixture", version: "1.0.0" }],
      packages: [
        {
          name: "@fixture/proof-provider",
          version: "1.0.0",
          exports: [".", "./fixture"],
          domain: "proof",
        },
      ],
      witnessPolicy: "public-only",
      atomicReplay: false,
    },
  ],
});

const assembly = (): CredentialDeploymentAssemblyV1 => {
  const components = Object.fromEntries(
    deploymentRoles.map((role) => [role, { state: "disabled" }]),
  ) as unknown as Mutable<CredentialDeploymentAssemblyV1["components"]>;
  components.signing = {
    state: "selected",
    requirementId: "fixture.signing.requirement",
    provider: { id: "fixture.signer", version: "1.0.0" },
    instanceId: "fixture.signer.instance@1",
  };
  components["proof-executor"] = {
    state: "selected",
    requirementId: "fixture.proof.requirement",
    provider: { id: "fixture.prover", version: "1.0.0" },
    instanceId: "fixture.prover.instance@1",
  };
  return {
    formatVersion: 1,
    id: "fixture.employee.local",
    version: "7.0.0",
    profile: { id: "fixture.employee.offchain-public", version: "1.0.0" },
    components,
    artifacts: [
      {
        requirementId: "fixture.employee.verify.verifier",
        id: "fixture-verifier-key",
        version: "1.0.0",
        buildManifestDigest: `sha256:${"1".repeat(64)}`,
        deploymentManifestDigest: `sha256:${"2".repeat(64)}`,
        digest: `sha256:${"0".repeat(64)}`,
        bytes: 4096,
        signerKeyId: "fixture-release-key-1",
        profile: { id: "fixture.employee.offchain-public", version: "1.0.0" },
        circuit: { id: "fixture.employee.verify", version: "1.0.0" },
        deploymentId: "fixture.local-verifier@1",
      },
    ],
    deployments: [
      {
        id: "fixture.local-verifier@1",
        version: "1.0.0",
        kind: "local-service",
        domain: "verification",
        identity: "urn:fixture:local-verifier:1",
        networkId: "fixture-testnet",
        chainId: "fixture-chain-1",
        contractAddress: "fixture-verifier-1",
        profile: { id: "fixture.employee.offchain-public", version: "1.0.0" },
        immutableInputs: { mode: "fixture" },
      },
    ],
  };
};

const clone = <T>(value: T): Mutable<T> =>
  globalThis.structuredClone(value) as Mutable<T>;
const expectModelError = (
  execute: () => unknown,
  code: CredentialModelError["code"],
  path: string,
): void => {
  expect(execute).toThrowError(
    expect.objectContaining<Partial<CredentialModelError>>({ code, path }),
  );
};

describe("credential composition contracts", () => {
  it("validates independently versioned semantic, deployment, and provider contracts", () => {
    expect(() => assertCredentialFamilyProfileV1(profile())).not.toThrow();
    expect(() => assertCredentialDeploymentAssemblyV1(assembly())).not.toThrow();
    expect(() => assertCapabilityProviderCatalogV1(catalog())).not.toThrow();
    expect(profile().version).not.toBe(assembly().version);
  });

  it("keeps public validator tables immutable and rejects malformed digests", () => {
    expect(Object.isFrozen(CREDENTIAL_DEPLOYMENT_ROLES)).toBe(true);
    expect(Object.isFrozen(CREDENTIAL_PROFILE_DENY_RULES)).toBe(true);
    const candidate = clone(assembly());
    candidate.artifacts[0].digest = "sha256:x";
    expectModelError(
      () => assertCredentialDeploymentAssemblyV1(candidate),
      "INVALID_DESCRIPTOR",
      "artifacts[0].digest",
    );
  });

  it.each([
    ["version", "artifacts[0].version"],
    ["buildManifestDigest", "artifacts[0].buildManifestDigest"],
    ["deploymentManifestDigest", "artifacts[0].deploymentManifestDigest"],
    ["digest", "artifacts[0].digest"],
    ["bytes", "artifacts[0].bytes"],
    ["signerKeyId", "artifacts[0].signerKeyId"],
    ["profile", "artifacts[0].profile"],
    ["circuit", "artifacts[0].circuit"],
    ["deploymentId", "artifacts[0].deploymentId"],
  ] as const)("rejects omitted artifact authority field %s", (field, path) => {
    const candidate = clone(assembly()) as unknown as { artifacts: Record<string, unknown>[] };
    delete candidate.artifacts[0][field];
    expectModelError(
      () => assertCredentialDeploymentAssemblyV1(candidate),
      "MISSING_FIELD",
      path,
    );
  });

  it.each([
    ["version", "deployments[0].version"],
    ["networkId", "deployments[0].networkId"],
    ["chainId", "deployments[0].chainId"],
    ["contractAddress", "deployments[0].contractAddress"],
    ["profile", "deployments[0].profile"],
  ] as const)("rejects omitted deployment authority field %s", (field, path) => {
    const candidate = clone(assembly()) as unknown as { deployments: Record<string, unknown>[] };
    delete candidate.deployments[0][field];
    expectModelError(
      () => assertCredentialDeploymentAssemblyV1(candidate),
      "MISSING_FIELD",
      path,
    );
  });

  it("rejects cross-profile, cross-circuit, cross-deployment, and unreferenced deployment drift", () => {
    for (const mutate of [
      (candidate: Mutable<CredentialDeploymentAssemblyV1>) => { candidate.artifacts[0].profile.id = "fixture.other"; },
      (candidate: Mutable<CredentialDeploymentAssemblyV1>) => { candidate.artifacts[0].circuit.version = "2.0.0"; },
      (candidate: Mutable<CredentialDeploymentAssemblyV1>) => { candidate.artifacts[0].deploymentId = "fixture.other@1"; },
      (candidate: Mutable<CredentialDeploymentAssemblyV1>) => { candidate.deployments[0].profile.version = "2.0.0"; },
      (candidate: Mutable<CredentialDeploymentAssemblyV1>) => {
        candidate.deployments.push({
          ...candidate.deployments[0],
          id: "fixture.unreferenced@1",
          identity: "urn:fixture:unreferenced:1",
          profile: { id: "fixture.other", version: "1.0.0" },
        });
      },
    ]) {
      const candidate = clone(assembly());
      mutate(candidate);
      expect(() => resolveCredentialComposition({ family, profile: profile(), assembly: candidate, catalog: catalog() })).toThrowError(
        expect.objectContaining<Partial<CredentialModelError>>({ code: "CONTRADICTORY_PROFILE" }),
      );
    }
  });

  it("admits every initial verification and holder-binding profile with explicit authority/privacy", () => {
    for (const verification of [
      {
        profile: "ledger-local-v1",
        location: "ledger",
        authority: "ledger-local",
        commitState: "committed",
      },
      {
        profile: "ledger-attested-v1",
        location: "ledger",
        authority: "ledger-attested",
        commitState: "committed",
      },
      {
        profile: "offchain-public-v1",
        location: "local-process",
        authority: "local-process",
        commitState: "not-applicable",
      },
    ] as const) {
      const candidate = clone(profile());
      candidate.semantics.verification = {
        ...verification,
        privateInputSources: [],
      };
      expect(() => assertCredentialFamilyProfileV1(candidate)).not.toThrow();
    }

    for (const mode of [
      "explicit-did",
      "secret",
      "blinded-secret",
      "offchain-did",
    ] as const) {
      const candidate = clone(profile());
      candidate.semantics.holderBinding = {
        mode,
        capability: { id: `holder-binding.${mode}`, version: "1.0.0" },
      };
      if (mode === "secret" || mode === "blinded-secret") {
        candidate.semantics.presentation.proofGeneration.witnessPolicy =
          "private-compatible";
        candidate.semantics.verification = {
          profile: "ledger-local-v1",
          location: "ledger",
          authority: "ledger-local",
          commitState: "committed",
          privateInputSources: ["hidden-holder"],
        };
      }
      expect(() => assertCredentialFamilyProfileV1(candidate)).not.toThrow();
    }
  });

  it("admits explicit status, operation, protocol, trusted-time, and replay values", () => {
    for (const mode of ["ledger-local", "authority-attested"] as const) {
      const candidate = clone(profile());
      candidate.semantics.status = {
        mode,
        capability: { id: `status.${mode}`, version: "1.0.0" },
        namespace: "fixture-status",
        authority: "fixture-status-authority",
        rootVersion: "fixture-root@1",
        freshnessPolicy: "fixture-window",
        evidence:
          mode === "ledger-local"
            ? "non-membership"
            : "challenge-bound-attestation",
        privacy: "public",
        authenticated: true,
      };
      candidate.semantics.trustedTime = {
        source: "attested",
        evidence: "challenge-bound-attestation",
        freshnessPolicy: "fixture-window",
      };
      expect(() => assertCredentialFamilyProfileV1(candidate)).not.toThrow();
    }

    const operations = clone(profile());
    operations.semantics.issuance.registration = "ledger-registration-v1";
    operations.semantics.issuance.anchoring = "ledger-anchoring-v1";
    operations.semantics.protocols = [
      "canonical-reference",
      "oid4vci-1.0-final",
      "oid4vp-1.0-final",
      "dcql",
    ];
    operations.semantics.trustedTime = {
      source: "attested",
      evidence: "challenge-bound-attestation",
      freshnessPolicy: "fixture-window",
    };
    expect(() => assertCredentialFamilyProfileV1(operations)).not.toThrow();

    const sideEffect = clone(profile());
    sideEffect.semantics.verification = {
      profile: "ledger-local-v1",
      location: "ledger",
      authority: "ledger-local",
      commitState: "committed",
      privateInputSources: [],
    };
    sideEffect.semantics.trustedTime = {
      source: "ledger",
      evidence: "ledger-time",
      freshnessPolicy: "fixture-window",
    };
    sideEffect.semantics.mutation = {
      location: "ledger",
      nullifier: "contract-derived",
      consumption: "atomic",
    };
    expect(() => assertCredentialFamilyProfileV1(sideEffect)).not.toThrow();
  });

  it("resolves the exact package/export/Compact/circuit/artifact/provider/deployment graph", () => {
    const graph = resolveCredentialComposition({
      family,
      profile: profile(),
      assembly: assembly(),
      catalog: catalog(),
    });

    expect(graph).toEqual({
      formatVersion: 1,
      family: {
        id: "fixture.employee",
        version: "1.0.0",
        schemaId: "urn:fixture:employee",
        schemaVersion: "1.0.0",
      },
      profile: { id: "fixture.employee.offchain-public", version: "1.0.0" },
      assembly: { id: "fixture.employee.local", version: "7.0.0" },
      packages: [
        {
          name: "@fixture/proof-provider",
          version: "1.0.0",
          exports: [".", "./fixture"],
          domain: "proof",
        },
        {
          name: "@fixture/signing-provider",
          version: "1.0.0",
          exports: ["."],
          domain: "signing",
        },
        {
          name: "@midnight-ntwrk/credential-compact",
          version: "0.1.0",
          exports: [".", "./composable"],
          domain: "compact",
        },
      ],
      exports: [
        { packageName: "@fixture/proof-provider", exportPath: "." },
        { packageName: "@fixture/proof-provider", exportPath: "./fixture" },
        { packageName: "@fixture/signing-provider", exportPath: "." },
        {
          packageName: "@midnight-ntwrk/credential-compact",
          exportPath: ".",
        },
        {
          packageName: "@midnight-ntwrk/credential-compact",
          exportPath: "./composable",
        },
      ],
      compactEntrypoints: profile().requirements.compactEntrypoints,
      circuits: profile().requirements.circuits,
      artifacts: [
        {
          requirementId: "fixture.employee.verify.verifier",
          requirement: profile().requirements.artifacts[0],
          artifact: assembly().artifacts[0],
        },
      ],
      providers: [
        {
          requirementId: "fixture.proof.requirement",
          role: "proof-executor",
          providerId: "fixture.prover",
          providerVersion: "1.0.0",
          instanceId: "fixture.prover.instance@1",
        },
        {
          requirementId: "fixture.signing.requirement",
          role: "signing",
          providerId: "fixture.signer",
          providerVersion: "1.0.0",
          instanceId: "fixture.signer.instance@1",
        },
      ],
      deployments: assembly().deployments,
      conformance: profile().conformance,
    });
  });

  it("keeps signing but excludes every status-specific edge when status is disabled", () => {
    const graph = resolveCredentialComposition({
      family,
      profile: profile(),
      assembly: assembly(),
      catalog: catalog(),
    });

    const packageDomains = graph.packages.map(({ domain }) => domain);
    expect(packageDomains).toContain("signing");
    expect(packageDomains).not.toContain("status-registry");
    expect(packageDomains).not.toContain("status-proof");
    expect(packageDomains).not.toContain("status-authority");
    expect(packageDomains).not.toContain("status-mutation");
    expect(
      graph.packages.some(({ name }) =>
        name.startsWith("@midnight-ntwrk/credential-status-midnight-"),
      ),
    ).toBe(false);
    expect(
      graph.providers.some(({ role }) => role.startsWith("status-")),
    ).toBe(false);
  });

  it.each([
    ["formatVersion", "formatVersion"],
    ["id", "id"],
    ["version", "version"],
    ["family", "family"],
    ["semantics", "semantics"],
    ["requirements", "requirements"],
    ["compatibility", "compatibility"],
    ["conformance", "conformance"],
    ["maturity", "maturity"],
  ] as const)("fails closed when profile.%s is omitted", (field, path) => {
    const candidate = profile() as unknown as Record<string, unknown>;
    delete candidate[field];
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "MISSING_FIELD",
      path,
    );
  });

  it("rejects unknown profile fields and unknown admitted values", () => {
    const extra = { ...profile(), deployment: "must-not-be-semantic" };
    expectModelError(
      () => assertCredentialFamilyProfileV1(extra),
      "UNKNOWN_FIELD",
      "deployment",
    );

    const unknown = clone(profile()) as unknown as {
      semantics: { holderBinding: { mode: string } };
    };
    unknown.semantics.holderBinding.mode = "future-holder-mode";
    expectModelError(
      () => assertCredentialFamilyProfileV1(unknown),
      "UNSUPPORTED_VALUE",
      "semantics.holderBinding.mode",
    );

    const sparse = clone(profile());
    sparse.conformance.evidenceIds = Array<string>(1);
    expectModelError(
      () => assertCredentialFamilyProfileV1(sparse),
      "INVALID_DESCRIPTOR",
      "conformance.evidenceIds[0]",
    );

    const nestedUnknown = clone(profile()) as unknown as {
      semantics: { verification: Record<string, unknown> };
    };
    nestedUnknown.semantics.verification.result = "valid";
    expectModelError(
      () => assertCredentialFamilyProfileV1(nestedUnknown),
      "UNKNOWN_FIELD",
      "semantics.verification.result",
    );
  });

  it("requires every deployment role to be selected or explicitly disabled", () => {
    const candidate = assembly() as unknown as {
      components: Record<string, unknown>;
    };
    delete candidate.components.transport;
    expectModelError(
      () => assertCredentialDeploymentAssemblyV1(candidate),
      "MISSING_FIELD",
      "components.transport",
    );
  });

  it("rejects unknown deployment and catalog fields", () => {
    expectModelError(
      () =>
        assertCredentialDeploymentAssemblyV1({
          ...assembly(),
          endpoint: "https://must-not-be-inferred.invalid",
        }),
      "UNKNOWN_FIELD",
      "endpoint",
    );
    expectModelError(
      () =>
        assertCapabilityProviderCatalogV1({
          ...catalog(),
          defaultProvider: "fixture.prover",
        }),
      "UNKNOWN_FIELD",
      "defaultProvider",
    );
  });
});

describe("ADR-0015 mandatory deny rules", () => {
  it("rejects hidden/private verification with offchain-public", () => {
    const candidate = clone(profile());
    candidate.semantics.holderBinding = {
      mode: "secret",
      capability: { id: "holder-binding.secret", version: "1.0.0" },
    };
    candidate.semantics.verification.privateInputSources = ["hidden-holder"];
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION",
      "semantics.verification.privateInputSources",
    );
  });

  it("rejects status-required profiles without authenticated proof evidence", () => {
    const candidate = clone(profile()) as unknown as {
      semantics: { status: Record<string, unknown> };
    };
    candidate.semantics.status = {
      mode: "ledger-local",
      capability: { id: "status.non-membership", version: "1.0.0" },
      namespace: "fixture-status",
      authority: "fixture-status-contract",
    };
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "STATUS_EVIDENCE_REQUIRED",
      "semantics.status.evidence",
    );
  });

  it("rejects caller time with ledger authority", () => {
    const candidate = clone(profile());
    candidate.semantics.verification = {
      profile: "ledger-local-v1",
      location: "ledger",
      authority: "ledger-local",
      commitState: "committed",
      privateInputSources: [],
    };
    candidate.semantics.trustedTime = {
      source: "caller",
      evidence: "caller-assertion",
      freshnessPolicy: "fixture-window",
    };
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "CALLER_TIME_WITH_LEDGER_AUTHORITY",
      "semantics.trustedTime.source",
    );
  });

  it("rejects side effects without atomic contract-derived replay", () => {
    const candidate = clone(profile());
    candidate.semantics.mutation = {
      location: "ledger",
      nullifier: "caller",
      consumption: "separate",
    };
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "ATOMIC_REPLAY_REQUIRED",
      "semantics.mutation",
    );
  });

  it("rejects status dependencies when status is disabled", () => {
    const candidate = clone(profile());
    candidate.requirements.packages.push({
      name: "@fixture/status-registry",
      version: "1.0.0",
      exports: ["."],
      domain: "status-registry",
    });
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "DISABLED_CAPABILITY_DEPENDENCY",
      "requirements.packages[1].domain",
    );
  });

  it("rejects ledger authority before a successful committed execution", () => {
    const candidate = clone(profile());
    candidate.semantics.verification = {
      profile: "ledger-attested-v1",
      location: "ledger",
      authority: "ledger-attested",
      commitState: "submitted",
      privateInputSources: [],
    };
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "LEDGER_COMMIT_REQUIRED",
      "semantics.verification.commitState",
    );
  });

  it("rejects combinations without declared tested evidence", () => {
    const candidate = clone(profile());
    candidate.conformance.evidenceDisposition = "untested";
    expectModelError(
      () => assertCredentialFamilyProfileV1(candidate),
      "UNTESTED_COMBINATION",
      "conformance.evidenceDisposition",
    );
  });
});

describe("combined resolver incompatibilities", () => {
  it("pins an exact package satisfying a bounded family composition requirement", () => {
    const familyWithPackage = {
      ...family,
      composition: {
        formatVersion: 1 as const,
        packages: [
          {
            name: "@fixture/family-runtime",
            version: "^1.0.0",
            exports: ["."],
          },
        ],
      },
    };
    const candidate = clone(profile());
    candidate.requirements.packages.push({
      name: "@fixture/family-runtime",
      version: "1.2.0",
      exports: ["."],
      domain: "family",
    });

    const graph = resolveCredentialComposition({
      family: familyWithPackage,
      profile: candidate,
      assembly: assembly(),
      catalog: catalog(),
    });
    expect(
      graph.packages.find(({ name }) => name === "@fixture/family-runtime"),
    ).toEqual({
      name: "@fixture/family-runtime",
      version: "1.2.0",
      exports: ["."],
      domain: "family",
    });

    expectModelError(
      () =>
        resolveCredentialComposition({
          family: familyWithPackage,
          profile: profile(),
          assembly: assembly(),
          catalog: catalog(),
        }),
      "CAPABILITY_NOT_PROVIDED",
      "profile.requirements.packages.@fixture/family-runtime",
    );
  });

  it("rejects a profile bound to a different family version", () => {
    const candidate = clone(profile());
    candidate.family.version = "2.0.0";
    expectModelError(
      () =>
        resolveCredentialComposition({
          family,
          profile: candidate,
          assembly: assembly(),
          catalog: catalog(),
        }),
      "FAMILY_IDENTITY_MISMATCH",
      "profile.family.version",
    );
  });

  it("does not let an assembly silently select a profile", () => {
    const candidate = clone(assembly());
    candidate.profile.version = "2.0.0";
    expectModelError(
      () =>
        resolveCredentialComposition({
          family,
          profile: profile(),
          assembly: candidate,
          catalog: catalog(),
        }),
      "PROFILE_ASSEMBLY_MISMATCH",
      "assembly.profile.version",
    );
  });

  it("rejects unknown providers and capabilities", () => {
    const unknownProvider = clone(assembly());
    const selected = unknownProvider.components["proof-executor"];
    if (selected.state !== "selected") throw new Error("invalid fixture");
    selected.provider.id = "fixture.unknown";
    expectModelError(
      () =>
        resolveCredentialComposition({
          family,
          profile: profile(),
          assembly: unknownProvider,
          catalog: catalog(),
        }),
      "UNKNOWN_PROVIDER",
      "assembly.components.proof-executor.provider",
    );

    const missingCapability = clone(catalog());
    missingCapability.providers[1].capabilities = [];
    expectModelError(
      () =>
        resolveCredentialComposition({
          family,
          profile: profile(),
          assembly: assembly(),
          catalog: missingCapability,
        }),
      "CAPABILITY_NOT_PROVIDED",
      "assembly.components.proof-executor.provider",
    );
  });

  it("rejects conflicting exact package versions", () => {
    const conflicting = clone(catalog());
    conflicting.providers[0].packages.push({
      name: "@midnight-ntwrk/credential-compact",
      version: "2.0.0",
      exports: ["."],
      domain: "compact",
    });
    expectModelError(
      () =>
        resolveCredentialComposition({
          family,
          profile: profile(),
          assembly: assembly(),
          catalog: conflicting,
        }),
      "PACKAGE_VERSION_CONFLICT",
      "resolved.packages.@midnight-ntwrk/credential-compact",
    );
  });

  it("binds atomic replay to the selected replay component", () => {
    const sideEffect = clone(profile());
    sideEffect.semantics.verification = { profile: "ledger-local-v1", location: "ledger", authority: "ledger-local", commitState: "committed", privateInputSources: [] };
    sideEffect.semantics.mutation = { location: "ledger", nullifier: "contract-derived", consumption: "atomic" };
    const unrelatedAtomic = clone(catalog());
    unrelatedAtomic.providers[0].atomicReplay = true;
    expectModelError(
      () => resolveCredentialComposition({ family, profile: sideEffect, assembly: assembly(), catalog: unrelatedAtomic }),
      "ATOMIC_REPLAY_REQUIRED",
      "assembly.components.replay",
    );

    sideEffect.requirements.providers.push({ id: "fixture.replay.requirement", capability: { id: "replay.atomic", version: "1.0.0" }, role: "replay" });
    const replayAssembly = clone(assembly());
    replayAssembly.components.replay = { state: "selected", requirementId: "fixture.replay.requirement", provider: { id: "fixture.replay", version: "1.0.0" }, instanceId: "fixture.replay.instance@1" };
    const replayCatalog = clone(catalog());
    replayCatalog.providers.push({ id: "fixture.replay", version: "1.0.0", roles: ["replay"], capabilities: [{ id: "replay.atomic", version: "1.0.0" }], packages: [{ name: "fixture-replay", version: "1.0.0", exports: ["."], domain: "replay" }], witnessPolicy: "public-only", atomicReplay: true });
    expect(() => resolveCredentialComposition({ family, profile: sideEffect, assembly: replayAssembly, catalog: replayCatalog })).not.toThrow();
  });

  it.each(["registration", "anchoring"] as const)(
    "rejects %s graph edges when the semantic operation is disabled",
    (role) => {
      const candidateProfile = clone(profile());
      candidateProfile.requirements.providers.push({ id: `fixture.${role}.requirement`, capability: { id: `${role}.fixture`, version: "1.0.0" }, role });
      const candidateAssembly = clone(assembly());
      candidateAssembly.components[role] = { state: "selected", requirementId: `fixture.${role}.requirement`, provider: { id: `fixture.${role}`, version: "1.0.0" }, instanceId: `fixture.${role}.instance@1` };
      const candidateCatalog = clone(catalog());
      candidateCatalog.providers.push({ id: `fixture.${role}`, version: "1.0.0", roles: [role], capabilities: [{ id: `${role}.fixture`, version: "1.0.0" }], packages: [{ name: `fixture-${role}`, version: "1.0.0", exports: ["."], domain: role }], witnessPolicy: "public-only", atomicReplay: false });
      expectModelError(
        () => resolveCredentialComposition({ family, profile: candidateProfile, assembly: candidateAssembly, catalog: candidateCatalog }),
        "DISABLED_CAPABILITY_DEPENDENCY",
        `requirements.providers[2].role`,
      );
    },
  );

  it.each([
    [">=1.0.0", "1.0.0-alpha"],
    ["^1.0.0", "2.0.0-alpha"],
    ["^1.0.0", "1.1.0-alpha"],
  ])("applies full SemVer prerelease rules for %s against %s", (range, exact) => {
    const familyWithPackage = { ...family, composition: { formatVersion: 1 as const, packages: [{ name: "fixture-runtime", version: range }] } };
    const candidate = clone(profile());
    candidate.requirements.packages.push({ name: "fixture-runtime", version: exact, exports: [], domain: "family" });
    expectModelError(
      () => resolveCredentialComposition({ family: familyWithPackage, profile: candidate, assembly: assembly(), catalog: catalog() }),
      "CAPABILITY_NOT_PROVIDED",
      "profile.requirements.packages.fixture-runtime",
    );
  });

  it("rejects capability-kind reuse, artifact-purpose drift, and disabled protocol edges", () => {
    const statusFamily = { ...family, capabilities: [{ id: "holder-binding.explicit-did", kind: "status" as const, version: "1.0.0", required: true }] };
    expectModelError(
      () => resolveCredentialComposition({ family: statusFamily, profile: profile(), assembly: assembly(), catalog: catalog() }),
      "CAPABILITY_NOT_PROVIDED",
      "profile.requirements.capabilities.holder-binding.explicit-did",
    );
    const artifactFamily = { ...family, artifacts: [{ id: "fixture.employee.verify.verifier", mediaType: "application/vnd.fixture.verifier-key", purpose: "prover" as const }] };
    expectModelError(
      () => resolveCredentialComposition({ family: artifactFamily, profile: profile(), assembly: assembly(), catalog: catalog() }),
      "MISSING_ARTIFACT",
      "profile.requirements.artifacts.fixture.employee.verify.verifier",
    );
    const protocol = clone(profile());
    protocol.semantics.protocols = ["disabled"];
    protocol.requirements.packages.push({ name: "fixture-protocol", version: "1.0.0", exports: ["."], domain: "protocol" });
    expectModelError(() => assertCredentialFamilyProfileV1(protocol), "DISABLED_CAPABILITY_DEPENDENCY", "requirements.packages[1].domain");
  });

  it("rejects status evidence that contradicts its status mode", () => {
    const candidate = clone(profile());
    candidate.semantics.status = { mode: "authority-attested", capability: { id: "status.fixture", version: "1.0.0" }, namespace: "fixture", authority: "fixture", rootVersion: "root@1", freshnessPolicy: "window", evidence: "membership", privacy: "public", authenticated: true };
    candidate.semantics.trustedTime = { source: "attested", evidence: "challenge-bound-attestation", freshnessPolicy: "window" };
    expectModelError(() => assertCredentialFamilyProfileV1(candidate), "CONTRADICTORY_PROFILE", "semantics.status.evidence");
  });

  it("rejects missing concrete artifact identities", () => {
    const candidate = clone(assembly());
    candidate.artifacts = [];
    expectModelError(
      () => resolveCredentialComposition({ family, profile: profile(), assembly: candidate, catalog: catalog() }),
      "MISSING_ARTIFACT",
      "assembly.artifacts.fixture.employee.verify.verifier",
    );
  });
});
