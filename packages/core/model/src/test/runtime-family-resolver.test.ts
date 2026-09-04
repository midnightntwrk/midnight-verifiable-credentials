import { describe, expect, it } from "vitest";

import {
  CREDENTIAL_DEPLOYMENT_ROLES,
  type CredentialDeploymentComponents,
  defineCredentialFamily,
  resolveRuntimeCredentialFamily,
  type RuntimeCredentialFamilyRecordV1,
  type RuntimeCredentialFamilyRegistryV1,
  type RuntimeCredentialFamilyTrustVerifier,
} from "../index.js";

const reference = {
  id: "example.runtime-family",
  version: "1.0.0",
  schemaId: "urn:example:runtime-family",
  schemaVersion: "1.0.0",
} as const;

const jsonCodec = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: JSON.parse,
};

const family = defineCredentialFamily({
  id: reference.id,
  version: reference.version,
  schema: {
    id: reference.schemaId,
    version: reference.schemaVersion,
    credentialTypes: ["VerifiableCredential", "RuntimeCredential"],
    claims: [
      {
        id: "subject",
        path: ["subject"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
  capabilities: [],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [
      {
        name: "@example/runtime-family",
        version: "^1.2.0",
        exports: ["./wallet"],
      },
    ],
  },
  credentialCodec: jsonCodec,
  presentationCodec: jsonCodec,
});

const profile = {
  formatVersion: 1,
  id: "example.runtime-family.offchain-public",
  version: "1.0.0",
  family: reference,
  semantics: {
    claims: [{ claimId: "subject", disclosure: "selective" }],
    holderBinding: {
      mode: "explicit-did",
      capability: { id: "holder-binding.example", version: "1.0.0" },
    },
    issuance: {
      credential: "issuer-local-issuance-v1",
      registration: "disabled",
      anchoring: "disabled",
    },
    presentation: {
      capability: { id: "presentation.example", version: "1.0.0" },
      preparation: "holder-wallet-v1",
      proofGeneration: {
        capability: { id: "proof.example", version: "1.0.0" },
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
      method: "did:example",
      relationship: "authentication",
      network: "example-network",
      versionEvidence: "did-example@1",
    },
    trust: { scope: "example", epochEvidence: "trust-example@1" },
    trustedTime: {
      source: "none",
      evidence: "not-required",
      freshnessPolicy: "not-required",
    },
    mutation: { location: "none", nullifier: "none", consumption: "none" },
    protocols: ["disabled"],
  },
  requirements: {
    packages: [
      {
        name: "@example/runtime-family",
        version: "1.2.3",
        exports: ["./wallet"],
        domain: "family",
      },
    ],
    compactEntrypoints: [],
    circuits: [],
    artifacts: [],
    providers: [
      {
        id: "proof.requirement",
        capability: { id: "proof.example", version: "1.0.0" },
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
    fixtureId: "runtime-family-resolution@1",
    evidenceDisposition: "tested",
    evidenceIds: ["test:runtime-family-resolution"],
  },
  maturity: {
    api: { subjectId: "api:runtime-family", value: "reference" },
    security: { subjectId: "security:runtime-family", value: "unassessed" },
    standards: { subjectId: "standards:runtime-family", value: "not-applicable" },
    production: { subjectId: "production:runtime-family", value: "not-assessed" },
  },
} as const;

const components = {
  ...Object.fromEntries(
    CREDENTIAL_DEPLOYMENT_ROLES.map((role) => [role, { state: "disabled" }]),
  ),
  "proof-executor": {
    state: "selected",
    requirementId: "proof.requirement",
    provider: { id: "proof-provider.example", version: "1.0.0" },
    instanceId: "proof-provider.example.instance@1",
  },
} as unknown as CredentialDeploymentComponents;

const assembly = {
  formatVersion: 1,
  id: "runtime-family.wallet",
  version: "1.0.0",
  profile: { id: profile.id, version: profile.version },
  components,
  artifacts: [],
  deployments: [],
} as const;

const catalog = {
  formatVersion: 1,
  providers: [
    {
      id: "proof-provider.example",
      version: "1.0.0",
      roles: ["proof-executor"],
      capabilities: [{ id: "proof.example", version: "1.0.0" }],
      packages: [],
      witnessPolicy: "public-only",
      atomicReplay: false,
    },
  ],
} as const;

const artifactDigest = "a".repeat(64);
const walletSurface = { kind: "wallet-adapter", createPresentation: () => "ok" };

const record = (): RuntimeCredentialFamilyRecordV1 => ({
  formatVersion: 1,
  family,
  profile,
  assembly,
  catalog,
  publicSurface: {
    formatVersion: 1,
    family: reference,
    profile: { id: profile.id, version: profile.version },
    package: {
      name: "@example/runtime-family",
      version: "1.2.3",
      exportPath: "./wallet",
    },
    artifact: {
      id: "runtime-family-wallet-js",
      digestAlgorithm: "sha256",
      digest: artifactDigest,
    },
    value: walletSurface,
  },
  authentication: {
    scheme: "test-signature-v1",
    authority: "did:example:registry",
    keyId: "did:example:registry#key-1",
    signature: "trusted-signature",
  },
});

const registry = (
  ...results: readonly [unknown?]
): RuntimeCredentialFamilyRegistryV1 => ({
  formatVersion: 1,
  id: "registry.example",
  version: "1.0.0",
  resolve: async () => (results.length === 0 ? record() : results[0]),
});

const trustVerifier: RuntimeCredentialFamilyTrustVerifier = {
  verify: async ({ authentication, metadata }) =>
    authentication.signature === "trusted-signature" &&
    metadata.publicSurface.artifact.digest === artifactDigest
      ? { trusted: true }
      : { trusted: false, reason: "signature or digest was not trusted" },
};

const validateWalletSurface = (
  value: unknown,
): value is typeof walletSurface =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  value.kind === "wallet-adapter" &&
  "createPresentation" in value &&
  typeof value.createPresentation === "function";

const resolve = (
  registries: readonly RuntimeCredentialFamilyRegistryV1[] = [registry()],
  verifier: RuntimeCredentialFamilyTrustVerifier = trustVerifier,
) =>
  resolveRuntimeCredentialFamily({
    reference,
    registries,
    trustVerifier: verifier,
    validateSurface: validateWalletSurface,
  });

const expectUnsupported = async (
  promise: ReturnType<typeof resolve>,
  code: string,
) => {
  const result = await promise;
  expect(result.status).toBe("unsupported");
  if (result.status === "unsupported") expect(result.code).toBe(code);
};

describe("runtime credential family resolution", () => {
  it("resolves an unknown-at-build-time family through an authenticated registry", async () => {
    const result = await resolve();

    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") return;
    expect(result.registry).toEqual({ id: "registry.example", version: "1.0.0" });
    expect(result.composition.family).toEqual(reference);
    expect(result.publicSurface.package).toEqual({
      name: "@example/runtime-family",
      version: "1.2.3",
      exportPath: "./wallet",
    });
    expect(result.surface.createPresentation()).toBe("ok");
  });

  it("returns a typed unknown result when no registry has the family", async () => {
    await expectUnsupported(resolve([registry(undefined)]), "UNKNOWN_FAMILY");
  });

  it("continues across an unavailable registry but reports unavailable when none answer", async () => {
    const unavailable: RuntimeCredentialFamilyRegistryV1 = {
      ...registry(),
      id: "registry.unavailable",
      resolve: async () => {
        throw new Error("offline");
      },
    };

    const result = await resolve([unavailable, registry()]);
    expect(result.status).toBe("resolved");
    await expectUnsupported(
      resolve([unavailable, registry(undefined)]),
      "REGISTRY_UNAVAILABLE",
    );
  });

  it("rejects unsupported registry contract versions without calling them", async () => {
    let called = false;
    const unsupported = {
      ...registry(),
      formatVersion: 2,
      resolve: async () => {
        called = true;
        return record();
      },
    } as unknown as RuntimeCredentialFamilyRegistryV1;

    await expectUnsupported(resolve([unsupported]), "UNSUPPORTED_REGISTRY_VERSION");
    expect(called).toBe(false);
  });

  it("rejects a returned family or schema version mismatch", async () => {
    const base = record();
    const mismatched = {
      ...base,
      family: { ...family, version: "2.0.0" },
    };

    await expectUnsupported(resolve([registry(mismatched)]), "VERSION_MISMATCH");
  });

  it("rejects package and artifact identity tampering", async () => {
    const packageBase = record();
    const packageTampered = {
      ...packageBase,
      publicSurface: {
        ...packageBase.publicSurface,
        package: { ...packageBase.publicSurface.package, version: "1.2.4" },
      },
    };
    await expectUnsupported(
      resolve([registry(packageTampered)]),
      "ARTIFACT_IDENTITY_MISMATCH",
    );

    const artifactBase = record();
    const artifactTampered = {
      ...artifactBase,
      publicSurface: {
        ...artifactBase.publicSurface,
        artifact: {
          ...artifactBase.publicSurface.artifact,
          digest: "b".repeat(64),
        },
      },
    };
    await expectUnsupported(
      resolve([registry(artifactTampered)]),
      "UNTRUSTED_FAMILY",
    );
  });

  it("authenticates the complete validated profile inputs", async () => {
    const base = record();
    const changedProfile = {
      ...base,
      profile: {
        ...profile,
        semantics: {
          ...profile.semantics,
          did: { ...profile.semantics.did, network: "attacker-network" },
        },
      },
    };
    const exactProfileTrust: RuntimeCredentialFamilyTrustVerifier = {
      verify: async ({ metadata }) =>
        metadata.compositionInput.profile.semantics.did.network ===
        "example-network"
          ? { trusted: true }
          : { trusted: false, reason: "profile metadata changed" },
    };

    await expectUnsupported(
      resolve([registry(changedProfile)], exactProfileTrust),
      "UNTRUSTED_FAMILY",
    );
  });

  it("rejects accessor-backed surface substitution before authentication", async () => {
    const base = record();
    let reads = 0;
    const changingSurface = { ...base.publicSurface };
    Object.defineProperty(changingSurface, "value", {
      enumerable: true,
      get: () => {
        reads += 1;
        return reads <= 2 ? walletSurface : { kind: "substituted" };
      },
    });

    const result = await resolve([
      registry({ ...base, publicSurface: changingSurface }),
    ]);
    expect(result).toMatchObject({
      status: "unsupported",
      code: "INVALID_REGISTRY_RESPONSE",
    });
    expect(reads).toBe(0);
  });

  it("snapshots callable adapter behavior before asynchronous trust checks", async () => {
    const mutableAdapter = {
      issuance: {
        prefix: "trusted",
        issue() {
          return `${this.prefix}:issued`;
        },
      },
      presentation: {
        prefix: "trusted",
        present() {
          return `${this.prefix}:presented`;
        },
      },
      verification: {
        prefix: "trusted",
        verify() {
          return `${this.prefix}:verified`;
        },
      },
    };
    const base = record();
    const callableRecord = {
      ...base,
      publicSurface: { ...base.publicSurface, value: mutableAdapter },
    };
    const mutatingTrust: RuntimeCredentialFamilyTrustVerifier = {
      verify: async ({ surface }) => {
        expect(surface).not.toBe(mutableAdapter);
        mutableAdapter.issuance.prefix = "mutated";
        mutableAdapter.issuance.issue = () => "swapped:issued";
        mutableAdapter.presentation.present = () => "swapped:presented";
        mutableAdapter.verification.verify = () => "swapped:verified";
        await Promise.resolve();
        return { trusted: true };
      },
    };
    const isCallableAdapter = (
      value: unknown,
    ): value is typeof mutableAdapter =>
      typeof value === "object" &&
      value !== null &&
      "issuance" in value &&
      "presentation" in value &&
      "verification" in value;

    const result = await resolveRuntimeCredentialFamily({
      reference,
      registries: [registry(callableRecord)],
      trustVerifier: mutatingTrust,
      validateSurface: isCallableAdapter,
    });

    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") return;
    expect(Object.isFrozen(result.surface)).toBe(true);
    expect(Object.isFrozen(result.surface.issuance)).toBe(true);
    expect(result.surface.issuance.issue()).toBe("trusted:issued");
    expect(result.surface.presentation.present()).toBe("trusted:presented");
    expect(result.surface.verification.verify()).toBe("trusted:verified");

    mutableAdapter.issuance.issue = () => "post-resolution-swap";
    expect(result.surface.issuance.issue()).toBe("trusted:issued");
  });

  it("rejects accessor-backed members inside callable adapter surfaces", async () => {
    const base = record();
    const accessorBacked = {
      kind: "wallet-adapter",
      get createPresentation() {
        return () => "swapped";
      },
    };

    await expectUnsupported(
      resolve([
        registry({
          ...base,
          publicSurface: { ...base.publicSurface, value: accessorBacked },
        }),
      ]),
      "INVALID_REGISTRY_RESPONSE",
    );
  });

  it("returns immutable metadata snapshots after asynchronous trust checks", async () => {
    const base = record();
    const mutablePackage = { ...base.publicSurface.package };
    const mutableSurface = { ...base.publicSurface, package: mutablePackage };
    const mutatingTrust: RuntimeCredentialFamilyTrustVerifier = {
      verify: async () => {
        mutablePackage.version = "9.9.9";
        await Promise.resolve();
        return { trusted: true };
      },
    };

    const result = await resolve(
      [registry({ ...base, publicSurface: mutableSurface })],
      mutatingTrust,
    );
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.publicSurface.package.version).toBe("1.2.3");
      expect(result.composition.packages[0]?.version).toBe("1.2.3");
    }
  });

  it("rejects incompatible #492 profile and assembly inputs", async () => {
    const base = record();
    const incompatible = {
      ...base,
      assembly: {
        ...assembly,
        profile: { id: "different.profile", version: profile.version },
      },
    };

    await expectUnsupported(
      resolve([registry(incompatible)]),
      "INCOMPATIBLE_FAMILY",
    );
  });

  it("fails closed for malformed records, rejected surfaces, and trust errors", async () => {
    await expectUnsupported(
      resolve([registry({ formatVersion: 1 })]),
      "INVALID_REGISTRY_RESPONSE",
    );

    const invalidSurfaceBase = record();
    const invalidSurface = {
      ...invalidSurfaceBase,
      publicSurface: {
        ...invalidSurfaceBase.publicSurface,
        value: { kind: "not-a-wallet-adapter" },
      },
    };
    await expectUnsupported(
      resolve([registry(invalidSurface)]),
      "INCOMPATIBLE_FAMILY",
    );

    const untrusted: RuntimeCredentialFamilyTrustVerifier = {
      verify: async () => ({ trusted: false, reason: "unknown signing key" }),
    };
    await expectUnsupported(
      resolve([registry()], untrusted),
      "UNTRUSTED_FAMILY",
    );

    const brokenTrustVerifier: RuntimeCredentialFamilyTrustVerifier = {
      verify: async () => {
        throw new Error("trust service offline");
      },
    };
    await expectUnsupported(
      resolve([registry()], brokenTrustVerifier),
      "UNTRUSTED_FAMILY",
    );

    const throwingGuard = resolveRuntimeCredentialFamily({
      reference,
      registries: [registry()],
      trustVerifier,
      validateSurface: (_value): _value is typeof walletSurface => {
        throw new Error("guard failed");
      },
    });
    await expectUnsupported(throwingGuard, "INCOMPATIBLE_FAMILY");

    const malformedProfile = { ...record(), profile: undefined };
    await expectUnsupported(
      resolve([registry(malformedProfile)]),
      "INVALID_REGISTRY_RESPONSE",
    );

    const throwingRecord = Object.defineProperty({}, "formatVersion", {
      get: () => {
        throw new Error("record getter failed");
      },
    });
    await expectUnsupported(
      resolve([registry(throwingRecord)]),
      "INVALID_REGISTRY_RESPONSE",
    );
  });

  it("rejects non-canonical references before querying registries", async () => {
    let called = false;
    const observingRegistry: RuntimeCredentialFamilyRegistryV1 = {
      ...registry(),
      resolve: async () => {
        called = true;
        return undefined;
      },
    };
    const invalidReference = await resolveRuntimeCredentialFamily({
      reference: { ...reference, version: "01.0.0" },
      registries: [observingRegistry],
      trustVerifier,
      validateSurface: validateWalletSurface,
    });
    expect(invalidReference).toMatchObject({
      status: "unsupported",
      code: "INVALID_REFERENCE",
    });
    expect(called).toBe(false);

    const whitespaceReference = await resolveRuntimeCredentialFamily({
      reference: { ...reference, schemaId: ` ${reference.schemaId}` },
      registries: [observingRegistry],
      trustVerifier,
      validateSurface: validateWalletSurface,
    });
    expect(whitespaceReference).toMatchObject({
      status: "unsupported",
      code: "INVALID_REFERENCE",
    });
    expect(called).toBe(false);
  });
});
