import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  type ArtifactAuthorityPolicyV1,
  type ArtifactAuthorityResolverV1,
  type ArtifactAuthorityVerificationResultV1,
  type AuthoritativeExecutionReceiptV1,
  type AuthorityEvidenceVerificationResultV1,
  compareArtifactAuthorityParityV1,
  computeArtifactAuthorityBindingDigestV1,
  computeSha256Digest,
  createArtifactAuthorityPolicyV1,
  createArtifactAuthorityTranscriptV1,
  createBuildManifest,
  createDeploymentManifest,
  generateManifestSigningKeyPair,
  serializeCanonicalJson,
  type Sha256Digest,
  verifyArtifactAuthorityV1,
} from "../index.js";

const digest = (character: string): Sha256Digest =>
  `sha256:${character.repeat(64)}` as Sha256Digest;
const bytes = new TextEncoder().encode("zk!");

const authorityEvidence = async (
  profile: { readonly id: string; readonly version: string },
): Promise<AuthorityEvidenceVerificationResultV1> => {
  const actors = (["issuer", "holder", "verifier", "status"] as const).map((role) => ({
    role,
    requirement: {
      role,
      did: `did:fixture:${role}`,
      methodId: `did:fixture:${role}#key-1`,
      keyFingerprint: digest("e"),
      relationship: role === "issuer" ? "assertionMethod" : "authentication",
      stateVersion: "state-1",
      trustEpoch: "epoch-1",
    },
    didEvidence: {
      evidenceId: `did-evidence:${role}`,
      authenticated: true,
      observedAt: "2026-05-31T23:58:00Z",
      did: `did:fixture:${role}`,
      method: "did:fixture",
      methodId: `did:fixture:${role}#key-1`,
      keyFingerprint: digest("e"),
      relationships: [role === "issuer" ? "assertionMethod" : "authentication"],
      network: "testnet",
      stateVersion: "state-1",
      versionEvidence: "fixture-version-1",
      lifecycleStatus: "active" as const,
      activatedAtStateVersion: "state-1",
      previousMethodId: null,
      replacedByMethodId: null,
      deactivatedAtStateVersion: null,
    },
    trustEvidence: {
      evidenceId: `trust-evidence:${role}`,
      authenticated: true,
      observedAt: "2026-05-31T23:58:00Z",
      subjectDid: `did:fixture:${role}`,
      methodId: `did:fixture:${role}#key-1`,
      keyFingerprint: digest("e"),
      network: "testnet",
      scope: "fixture",
      epoch: "epoch-1",
      epochEvidence: "fixture-epoch-1",
      status: "active" as const,
    },
  }));
  const transcript = {
    formatVersion: 1 as const,
    domain: "midnight:vc:authority-evidence:v1" as const,
    profile,
    policy: {
      did: {
        method: "did:fixture",
        issuerRelationship: "assertionMethod",
        network: "testnet",
        versionEvidence: "fixture-version-1",
      },
      trust: { scope: "fixture", epochEvidence: "fixture-epoch-1" },
      providers: {
        did: { requirementId: "did", role: "did-resolver", providerId: "fixture.did", providerVersion: "1.0.0", instanceId: "did:testnet" },
        trust: { requirementId: "trust", role: "trust-resolver", providerId: "fixture.trust", providerVersion: "1.0.0", instanceId: "trust:testnet" },
      },
    },
    context: {
      proofDigest: digest("1"),
      credentialDigest: digest("2"),
      presentationDigest: digest("3"),
      requestDigest: digest("4"),
    },
    actors,
  };
  return {
    formatVersion: 1,
    status: "valid",
    decisionStatus: "approved",
    accepted: true,
    reasonCodes: [],
    transcript,
    transcriptDigest: await computeSha256Digest(serializeCanonicalJson(transcript)),
  };
};

const fixture = async () => {
  const profile = { id: "fixture.age-public", version: "1.0.0" } as const;
  const artifactDigest = await computeSha256Digest(bytes);
  const authority = await authorityEvidence(profile);
  const build = await createBuildManifest({
    formatVersion: 1,
    manifestKind: "build",
    productId: "artifact-authority-fixture",
    packageName: "@fixture/contract",
    schemaId: "urn:fixture:artifact-authority",
    contractId: "fixture-contract-v1",
    sourceCommit: "0123456789abcdef0123456789abcdef01234567",
    cleanTree: true,
    toolchain: { compactCompiler: "0.30.0", runtime: "0.15.0", generator: "1.0.0" },
    circuits: [{
      id: "age-check",
      version: "1.0.0",
      parameters: { threshold: 18 },
      metrics: { k: 12, rows: 2048 },
      artifactIds: ["age-check-zkir"],
    }],
    proofs: [],
    artifacts: [{
      id: "age-check-zkir",
      version: "1.0.0",
      role: "circuit",
      mediaType: "application/octet-stream",
      path: "zkir/age-check.bzkir",
      bytes: bytes.byteLength,
      sha256: artifactDigest,
    }],
    lockfileDigest: digest("a"),
    provenanceReference: "slsa:fixture-regeneration-v1",
  });
  const keyPair = await generateManifestSigningKeyPair();
  const deployment = await createDeploymentManifest({
    formatVersion: 1,
    manifestKind: "deployment",
    deploymentId: "fixture-verifier@1",
    deploymentVersion: "1.0.0",
    deploymentIdentity: "urn:fixture:verifier:1",
    profile,
    buildManifestDigest: build.manifestDigest,
    networkId: "testnet",
    chainId: "chain-1",
    contractAddress: "contract-1",
    deploymentTransaction: "tx-1",
    constructorDigest: digest("b"),
    acceptedReferences: [{ id: "profile", digest: digest("c") }],
    governanceOwner: "governance-key",
    supportWindow: { notBefore: "2026-01-01T00:00:00Z", notAfter: "2027-01-01T00:00:00Z" },
  }, { keyId: "release-key-1", privateKey: keyPair.privateKey });
  const policy: ArtifactAuthorityPolicyV1 = {
    formatVersion: 1,
    profile,
    circuit: { id: "age-check", version: "1.0.0" },
    artifact: {
      id: "age-check-zkir",
      version: "1.0.0",
      role: "circuit",
      mediaType: "application/octet-stream",
      buildManifestDigest: build.manifestDigest,
      deploymentManifestDigest: deployment.deploymentManifestDigest,
      bytes: bytes.byteLength,
      sha256: artifactDigest,
      signerKeyId: "release-key-1",
    },
    deployment: {
      id: "fixture-verifier@1",
      version: "1.0.0",
      identity: "urn:fixture:verifier:1",
      networkId: "testnet",
      chainId: "chain-1",
      contractAddress: "contract-1",
    },
    authorityEvidenceDigest: authority.transcriptDigest,
    freshness: { observedAt: "2026-06-01T00:00:00Z", maxReceiptAgeSeconds: 300 },
    receipt: {
      id: "receipt-1",
      allowedAuthorities: ["local-process", "ledger-local"],
    },
  };
  const bindingDigest = await computeArtifactAuthorityBindingDigestV1(policy);
  const receipt: AuthoritativeExecutionReceiptV1 = {
    formatVersion: 1,
    id: "receipt-1",
    bindingDigest,
    classification: "valid",
    authority: "local-process",
    observedAt: "2026-05-31T23:58:00Z",
    profile: policy.profile,
    circuit: policy.circuit,
    artifactDigest,
    deployment: {
      id: "fixture-verifier@1",
      version: "1.0.0",
      identity: "urn:fixture:verifier:1",
      networkId: "testnet",
      chainId: "chain-1",
      contractAddress: "contract-1",
    },
    authorityEvidenceDigest: policy.authorityEvidenceDigest,
    confirmationId: "local-signature:fixture-1",
    reasonCodes: [],
  };
  const resolver: ArtifactAuthorityResolverV1 = {
    resolveManifest: async () => build,
    resolveArtifact: async () => ({
      manifestDigest: build.manifestDigest,
      artifactId: "age-check-zkir",
      bytes,
      sha256: artifactDigest,
    }),
    resolveDeploymentManifest: async () => deployment,
  };
  return { artifactDigest, authority, build, deployment, keyPair, policy, receipt, resolver };
};

const verify = async (overrides: Partial<Parameters<typeof verifyArtifactAuthorityV1>[0]> = {}) => {
  const value = await fixture();
  return verifyArtifactAuthorityV1({
    policy: value.policy,
    resolver: value.resolver,
    trustedKeyResolver: (keyId) => keyId === "release-key-1" ? value.keyPair.publicKey : undefined,
    receipt: value.receipt,
    receiptVerifier: { verify: async () => true },
    ...overrides,
  });
};

describe("artifact and deployment authority", () => {
  it("binds signed bytes, immutable identities, #494 evidence, freshness, and a receipt", async () => {
    const value = await fixture();
    const result = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(result).toMatchObject({
      status: "valid",
      classification: "valid",
      accepted: true,
      authority: "local-process",
      reasonCodes: [],
    });
    const vectors = JSON.parse(readFileSync(
      new URL("../../artifact-authority-vectors.json", import.meta.url),
      "utf8",
    )) as {
      readonly digests: { readonly buildManifest: string; readonly deploymentManifest: string; readonly authorityBinding: string };
      readonly circuitReport: { readonly k: number; readonly rows: number; readonly artifactBytes: number };
      readonly tamperVectors: readonly { readonly id: string; readonly expected: string; readonly reasonCode: string }[];
    };
    expect(result.bindingDigest).toBe("sha256:5f145d870203623ae6a9ebf999b082ccea42b7e9cb5440c4224f9c5c0df68dd6");
    expect(vectors.digests).toEqual({
      buildManifest: value.build.manifestDigest,
      deploymentManifest: value.deployment.deploymentManifestDigest,
      authorityBinding: result.bindingDigest,
    });
    expect(vectors.circuitReport).toMatchObject({ k: 12, rows: 2048, artifactBytes: 3 });
    expect(vectors.tamperVectors.map(({ id }) => id)).toEqual([
      "truncated-artifact",
      "artifact-digest-drift",
      "artifact-version-drift",
      "artifact-role-media-drift",
      "authority-transcript-digest-drift",
      "deployment-signature-drift",
      "deployment-signer-drift",
      "deployment-network-drift",
      "receipt-stale",
      "receipt-unavailable",
      "artifact-unavailable",
      "deployment-unavailable",
      "signing-key-service-unavailable",
    ]);
  });

  it("derives policy identities from the exact #492 composition graph", async () => {
    const value = await fixture();
    const composition = {
      profile: value.policy.profile,
      artifacts: [{
        requirementId: "verifier-key",
        requirement: {
          id: "verifier-key",
          mediaType: "application/octet-stream",
          artifactClass: "bzkir" as const,
        },
        artifact: {
          requirementId: "verifier-key",
          id: value.policy.artifact.id,
          version: value.policy.artifact.version,
          buildManifestDigest: value.policy.artifact.buildManifestDigest,
          deploymentManifestDigest: value.policy.artifact.deploymentManifestDigest,
          digest: value.policy.artifact.sha256,
          bytes: value.policy.artifact.bytes,
          signerKeyId: value.policy.artifact.signerKeyId,
          profile: value.policy.profile,
          circuit: value.policy.circuit,
          deploymentId: value.policy.deployment.id,
        },
      }],
      deployments: [{
        ...value.policy.deployment,
        version: "1.0.0",
        kind: "local-service",
        domain: "verification",
        identity: "urn:fixture:verifier:1",
        profile: value.policy.profile,
        immutableInputs: { mode: "fixture" },
      }],
    };
    const allowedAuthorities: ("local-process" | "ledger-local" | "ledger-attested")[] = [
      "local-process",
      "ledger-local",
    ];
    const derived = await createArtifactAuthorityPolicyV1(composition, "verifier-key", {
      authorityEvidence: value.authority,
      observedAt: value.policy.freshness.observedAt,
      maxReceiptAgeSeconds: 300,
      receiptId: "receipt-1",
      allowedAuthorities,
    });
    expect(derived).toEqual(value.policy);
    allowedAuthorities.push("ledger-attested");
    expect(derived.receipt.allowedAuthorities).toEqual(["local-process", "ledger-local"]);
    expect(Object.isFrozen(derived.receipt.allowedAuthorities)).toBe(true);

    await expect(createArtifactAuthorityPolicyV1(composition, "verifier-key", {
      authorityEvidence: {
        ...value.authority,
        status: "indeterminate",
        decisionStatus: "notEvaluated",
        accepted: false,
      },
      observedAt: value.policy.freshness.observedAt,
      maxReceiptAgeSeconds: 300,
      receiptId: "receipt-1",
      allowedAuthorities: ["local-process"],
    })).rejects.toThrow(/authority evidence must be a complete valid/u);

    await expect(createArtifactAuthorityPolicyV1(composition, "verifier-key", {
      authorityEvidence: { ...value.authority, transcriptDigest: digest("f") },
      observedAt: value.policy.freshness.observedAt,
      maxReceiptAgeSeconds: 300,
      receiptId: "receipt-1",
      allowedAuthorities: ["local-process"],
    })).rejects.toThrow(/transcript digest/u);

    const inconsistentTranscript = globalThis.structuredClone(value.authority.transcript);
    const issuer = inconsistentTranscript.actors[0] as unknown as {
      didEvidence: { did: string } | null;
    };
    if (issuer.didEvidence !== null) issuer.didEvidence.did = "did:fixture:attacker";
    await expect(createArtifactAuthorityPolicyV1(composition, "verifier-key", {
      authorityEvidence: {
        ...value.authority,
        transcript: inconsistentTranscript,
        transcriptDigest: await computeSha256Digest(serializeCanonicalJson(inconsistentTranscript)),
      },
      observedAt: value.policy.freshness.observedAt,
      maxReceiptAgeSeconds: 300,
      receiptId: "receipt-1",
      allowedAuthorities: ["local-process"],
    })).rejects.toThrow(/internally inconsistent/u);
  });

  it("commits a canonical domain-separated transcript", async () => {
    const value = await fixture();
    const transcript = createArtifactAuthorityTranscriptV1(value.policy);
    expect(transcript).toMatchObject({
      formatVersion: 1,
      domain: "midnight:vc:artifact-authority:v1",
      profile: value.policy.profile,
      deployment: value.policy.deployment,
      authorityEvidenceDigest: value.policy.authorityEvidenceDigest,
    });
    expect(await computeArtifactAuthorityBindingDigestV1(value.policy)).toBe(
      await computeSha256Digest(serializeCanonicalJson(transcript)),
    );
    await expect(verifyArtifactAuthorityV1({
      policy: { ...value.policy, freshness: { ...value.policy.freshness, observedAt: "2026-06-01" } },
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    })).resolves.toMatchObject({ status: "invalid", reasonCodes: ["POLICY_INVALID"] });
  });

  it.each([
    ["profile", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, profile: { ...policy.profile, id: "fixture.other" } })],
    ["circuit", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, circuit: { ...policy.circuit, version: "2.0.0" } })],
    ["artifact version", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, artifact: { ...policy.artifact, version: "2.0.0" } })],
    ["deployment", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, deployment: { ...policy.deployment, id: "other@1" } })],
    ["network", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, deployment: { ...policy.deployment, networkId: "mainnet" } })],
    ["authority evidence", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, authorityEvidenceDigest: digest("e") })],
    ["freshness", (policy: ArtifactAuthorityPolicyV1) => ({ ...policy, freshness: { ...policy.freshness, observedAt: "2026-06-01" } })],
  ] as const)("rejects %s identity mutation against the authoritative receipt", async (_name, mutate) => {
    const value = await fixture();
    const result = await verifyArtifactAuthorityV1({
      policy: mutate(value.policy),
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(result).toMatchObject({ status: "invalid", accepted: false });
  });

  it("fails closed on artifact version drift before receipt verification", async () => {
    const value = await fixture();
    const result = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: {
        ...value.resolver,
        resolveManifest: async () => ({
          ...value.build,
          artifacts: [{ ...value.build.artifacts[0], version: "2.0.0" }],
        }),
      },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(result).toMatchObject({ status: "invalid", reasonCodes: ["ARTIFACT_INVALID"] });

    for (const artifact of [
      { ...value.policy.artifact, role: "verifier-key" as const },
      { ...value.policy.artifact, mediaType: "application/vnd.fixture.verifier-key" },
    ]) {
      await expect(verifyArtifactAuthorityV1({
        policy: { ...value.policy, artifact },
        resolver: value.resolver,
        trustedKeyResolver: () => value.keyPair.publicKey,
        receipt: value.receipt,
        receiptVerifier: { verify: async () => true },
      })).resolves.toMatchObject({ status: "invalid", reasonCodes: ["ARTIFACT_INVALID"] });
    }
  });

  it("fails closed on truncated/digest-tampered bytes and a tampered deployment", async () => {
    const value = await fixture();
    const truncated = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: { ...value.resolver, resolveArtifact: async () => ({
        manifestDigest: value.build.manifestDigest,
        artifactId: value.policy.artifact.id,
        bytes: bytes.slice(0, 2),
        sha256: value.artifactDigest,
      }) },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(truncated).toMatchObject({ status: "invalid", reasonCodes: ["ARTIFACT_INVALID"] });

    const digestTampered = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: { ...value.resolver, resolveArtifact: async () => ({
        manifestDigest: value.build.manifestDigest,
        artifactId: value.policy.artifact.id,
        bytes: new TextEncoder().encode("zk?"),
        sha256: value.artifactDigest,
      }) },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(digestTampered).toMatchObject({ status: "invalid", reasonCodes: ["ARTIFACT_INVALID"] });

    const tampered = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: { ...value.resolver, resolveDeploymentManifest: async () => ({ ...value.deployment, networkId: "mainnet" }) },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(tampered).toMatchObject({ status: "invalid", reasonCodes: ["DEPLOYMENT_INVALID"] });

    const signatureTampered = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: {
        ...value.resolver,
        resolveDeploymentManifest: async () => ({
          ...value.deployment,
          signature: {
            ...value.deployment.signature,
            value: `${value.deployment.signature.value[0] === "A" ? "B" : "A"}${value.deployment.signature.value.slice(1)}`,
          },
        }),
      },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(signatureTampered).toMatchObject({ status: "invalid", reasonCodes: ["DEPLOYMENT_INVALID"] });

    const wrongSigner = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: () => undefined,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(wrongSigner).toMatchObject({ status: "invalid", reasonCodes: ["DEPLOYMENT_INVALID"] });
  });

  it("distinguishes unavailable evidence from stale or unauthenticated receipts", async () => {
    const value = await fixture();
    const unavailable = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: { ...value.resolver, resolveDeploymentManifest: async () => undefined },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(unavailable).toMatchObject({ status: "indeterminate", reasonCodes: ["DEPLOYMENT_UNAVAILABLE"] });

    const manifestUnavailable = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: { ...value.resolver, resolveManifest: async () => undefined },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(manifestUnavailable).toMatchObject({ status: "indeterminate", reasonCodes: ["ARTIFACT_UNAVAILABLE"] });

    const bytesUnavailable = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: { ...value.resolver, resolveArtifact: async () => undefined },
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(bytesUnavailable).toMatchObject({ status: "indeterminate", reasonCodes: ["ARTIFACT_UNAVAILABLE"] });

    const keyServiceUnavailable = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: async () => { throw new Error("key service unavailable"); },
      receipt: value.receipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(keyServiceUnavailable).toMatchObject({
      status: "indeterminate",
      reasonCodes: ["DEPLOYMENT_UNAVAILABLE"],
    });

    const receiptUnavailable = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: null,
      receiptVerifier: { verify: async () => true },
    });
    expect(receiptUnavailable).toMatchObject({ status: "indeterminate", reasonCodes: ["RECEIPT_UNAVAILABLE"] });

    const staleReceipt = { ...value.receipt, observedAt: "2026-05-31T23:00:00Z" };
    const stale = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: staleReceipt,
      receiptVerifier: { verify: async () => true },
    });
    expect(stale).toMatchObject({ status: "invalid", reasonCodes: ["RECEIPT_STALE"] });

    const unauthenticated = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: value.receipt,
      receiptVerifier: { verify: async () => false },
    });
    expect(unauthenticated).toMatchObject({ status: "invalid", reasonCodes: ["RECEIPT_INVALID"] });

    const malformed = await verifyArtifactAuthorityV1({
      policy: value.policy,
      resolver: value.resolver,
      trustedKeyResolver: () => value.keyPair.publicKey,
      receipt: { formatVersion: 1, id: "receipt-1" } as AuthoritativeExecutionReceiptV1,
      receiptVerifier: { verify: async () => true },
    });
    expect(malformed).toMatchObject({ status: "invalid", reasonCodes: ["RECEIPT_INVALID"] });
  });

  it("classifies equivalent paths equally while preserving local/ledger labels", async () => {
    const local = await verify();
    const ledger: ArtifactAuthorityVerificationResultV1 = {
      ...local,
      authority: "ledger-local",
    };
    const parity = compareArtifactAuthorityParityV1([
      { pathId: "local-preflight", result: local },
      { pathId: "ledger-observation", result: ledger },
    ]);
    expect(parity).toEqual({
      formatVersion: 1,
      status: "equivalent",
      classification: "valid",
      bindingDigest: local.bindingDigest,
      paths: [
        { pathId: "local-preflight", authority: "local-process", classification: "valid" },
        { pathId: "ledger-observation", authority: "ledger-local", classification: "valid" },
      ],
      reasonCodes: [],
    });

    expect(compareArtifactAuthorityParityV1([
      { pathId: "local-preflight", result: local },
      { pathId: "ledger-observation", result: { ...ledger, classification: "invalid", status: "invalid", accepted: false } },
    ])).toMatchObject({ status: "diverged", reasonCodes: ["CLASSIFICATION_DIVERGENCE"] });

    for (const classification of ["invalid", "indeterminate"] as const) {
      const accepted = false;
      expect(compareArtifactAuthorityParityV1([
        { pathId: `${classification}-local`, result: { ...local, status: classification, classification, accepted } },
        { pathId: `${classification}-ledger`, result: { ...ledger, status: classification, classification, accepted } },
      ])).toMatchObject({ status: "equivalent", classification, reasonCodes: [] });
    }

    expect(() => compareArtifactAuthorityParityV1([
      { pathId: "duplicate", result: local },
      { pathId: "duplicate", result: ledger },
    ])).toThrow(/unique named paths/u);
  });
});
