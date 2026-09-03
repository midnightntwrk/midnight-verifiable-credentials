import {
  type CapabilityProviderCatalogV1,
  type CredentialDeploymentAssemblyV1,
  type CredentialDeploymentComponents,
  type CredentialDeploymentRole,
  type CredentialFamilyDefinition,
  type CredentialFamilyProfileV1,
  type ExactCredentialPackageRequirement,
  type ProviderRequirement,
  resolveCredentialComposition,
  type ResolvedCredentialCompositionV1,
} from "@midnight-ntwrk/credential-model";

const claims = ["safetyCredentialId", "contractorName", "siteId", "safetyLevel"] as const;

const jsonCodec = {
  mediaType: "application/vnd.midnight.synthetic-contractor-access+json",
  encode: (value: unknown): string => JSON.stringify(value),
  decode: (value: string): unknown => JSON.parse(value),
};

export const STATUS_OPENID_EVIDENCE_FAMILY = {
  id: "use-case.synthetic-contractor-safety",
  version: "1.0.0",
  schema: {
    id: "urn:midnight:use-case:synthetic-contractor-safety",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "SyntheticContractorSafetyCredential"],
    claims: claims.map((id) => ({
      id,
      path: ["credentialSubject", id] as [string, string],
      disclosure: "public" as const,
      required: true,
    })),
  },
  capabilities: [
    { id: "holder.explicit-did", kind: "holder-binding", version: "1.0.0", required: true },
    { id: "proof.compact", kind: "proof", version: "1.0.0", required: true },
    { id: "presentation.vp", kind: "presentation", version: "1.0.0", required: true },
    { id: "status.midnight-ledger-local", kind: "status", version: "1.0.0", required: true },
  ],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [{
      name: "@midnight-ntwrk/status-openid-production-evidence",
      version: "0.1.0",
      exports: ["."],
    }],
  },
  credentialCodec: jsonCodec,
  presentationCodec: jsonCodec,
} satisfies CredentialFamilyDefinition<unknown, unknown, string, string>;

const pkg = (
  name: string,
  domain: ExactCredentialPackageRequirement["domain"],
): ExactCredentialPackageRequirement => ({ name, version: "0.1.0", exports: ["."], domain });

const packages = {
  self: pkg("@midnight-ntwrk/status-openid-production-evidence", "family"),
  model: pkg("@midnight-ntwrk/credential-model", "family"),
  proofs: pkg("@midnight-ntwrk/credential-proofs", "proof"),
  credentials: pkg("@midnight-ntwrk/midnight-did-credentials", "verification"),
  openid: pkg("@midnight-ntwrk/midnight-did-credentials-openid", "protocol"),
  statusAuthority: pkg("@midnight-ntwrk/credential-status-midnight-authority", "status-authority"),
  statusContract: pkg("@midnight-ntwrk/credential-status-midnight-contract", "status-registry"),
  statusVerifier: pkg("@midnight-ntwrk/credential-status-midnight-verifier", "status-proof"),
};

const requirementDefinitions = [
  ["access.session", "session", "session.synthetic"],
  ["access.storage", "storage", "storage.restartable"],
  ["access.key-custody", "key-custody", "custody.isolated"],
  ["access.signing", "signing", "signing.isolated"],
  ["access.did", "did-resolver", "did.synthetic-authenticated"],
  ["access.trust", "trust-resolver", "trust.synthetic-policy"],
  ["access.wallet", "wallet", "wallet.synthetic"],
  ["access.network", "network", "network.injected"],
  ["access.transport", "transport", "transport.openid-final"],
  ["access.proof", "proof-executor", "proof.injected"],
  ["access.status-registry", "status-registry", "status.registry-v1"],
  ["access.status-proof", "status-proof", "status.authenticated-root-v1"],
  ["access.status-authority", "status-authority", "status.authority-v1"],
  ["access.replay", "replay", "replay.atomic"],
  ["access.verification", "verification", "verification.v1-ledger"],
] as const;

const requirements: readonly ProviderRequirement[] = requirementDefinitions.map(
  ([id, role, capability]) => ({
    id,
    role: role as CredentialDeploymentRole,
    capability: { id: capability, version: "1.0.0" },
  }),
);

export const STATUS_OPENID_EVIDENCE_PROFILE = {
  formatVersion: 1,
  id: "profile.use-case.contractor-access-status-openid-v1",
  version: "1.0.0",
  family: {
    id: STATUS_OPENID_EVIDENCE_FAMILY.id,
    version: STATUS_OPENID_EVIDENCE_FAMILY.version,
    schemaId: STATUS_OPENID_EVIDENCE_FAMILY.schema.id,
    schemaVersion: STATUS_OPENID_EVIDENCE_FAMILY.schema.version,
  },
  semantics: {
    claims: claims.map((claimId) => ({ claimId, disclosure: "public" as const })),
    holderBinding: { mode: "explicit-did", capability: { id: "holder.explicit-did", version: "1.0.0" } },
    issuance: { credential: "issuer-local-issuance-v1", registration: "disabled", anchoring: "disabled" },
    presentation: {
      capability: { id: "presentation.vp", version: "1.0.0" },
      preparation: "holder-wallet-v1",
      proofGeneration: { capability: { id: "proof.compact", version: "1.0.0" }, witnessPolicy: "public-only" },
    },
    verification: {
      profile: "ledger-local-v1",
      location: "ledger",
      authority: "ledger-local",
      commitState: "committed",
      privateInputSources: [],
    },
    status: {
      mode: "ledger-local",
      capability: { id: "status.midnight-ledger-local", version: "1.0.0" },
      namespace: "synthetic-contractor-safety:revoked-set",
      authority: "did:midnight:synthetic:status-operator",
      rootVersion: "midnight-status-root-v1",
      freshnessPolicy: "synthetic-status-max-age-60s",
      evidence: "non-membership",
      privacy: "public",
      authenticated: true,
    },
    did: { method: "did:midnight", relationship: "assertionMethod", network: "midnight:synthetic", versionEvidence: "synthetic-ledger-state-v1" },
    trust: { scope: "synthetic-harbor-site-access", epochEvidence: "synthetic-policy-epoch-v1" },
    trustedTime: { source: "ledger", evidence: "ledger-time", freshnessPolicy: "synthetic-status-max-age-60s" },
    mutation: { location: "ledger", nullifier: "contract-derived", consumption: "atomic" },
    protocols: ["canonical-reference", "oid4vci-1.0-final", "oid4vp-1.0-final", "dcql"],
  },
  requirements: { packages: [packages.self], compactEntrypoints: [], circuits: [], artifacts: [], providers: requirements },
  compatibility: { deniedRules: [
    "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION",
    "STATUS_EVIDENCE_REQUIRED",
    "CALLER_TIME_WITH_LEDGER_AUTHORITY",
    "ATOMIC_REPLAY_REQUIRED",
    "DISABLED_CAPABILITY_DEPENDENCY",
    "LEDGER_COMMIT_REQUIRED",
    "UNTESTED_COMBINATION",
  ] },
  conformance: {
    fixtureId: "use-case:contractor-access:status-openid-v1",
    evidenceDisposition: "tested",
    evidenceIds: [
      "status-openid:profile-resolution",
      "status-openid:openid-final-dcql",
      "status-openid:authenticated-status",
      "status-openid:trusted-time",
      "status-openid:restart-replay-atomic-decision",
      "status-openid:clean-consumer",
      "status-openid:threat-operator-docs",
    ],
  },
  maturity: {
    api: { subjectId: "use-case:contractor-access:status-openid-v1", value: "reference" },
    security: { subjectId: "use-case:contractor-access:status-openid-v1", value: "design-reviewed" },
    standards: { subjectId: "use-case:contractor-access:status-openid-v1", value: "profile-targeted" },
    production: { subjectId: "use-case:contractor-access:status-openid-v1", value: "experimental" },
  },
} satisfies CredentialFamilyProfileV1;

const providerPackages = (role: CredentialDeploymentRole): readonly ExactCredentialPackageRequirement[] => {
  if (role === "status-registry") return [packages.statusContract];
  if (role === "status-proof") return [packages.statusVerifier, packages.proofs];
  if (role === "status-authority") return [packages.statusAuthority, packages.proofs];
  if (role === "network" || role === "transport" || role === "wallet") return [packages.openid];
  if (role === "proof-executor") return [packages.proofs];
  if (role === "verification" || role === "replay") return [packages.credentials];
  if (role === "did-resolver" || role === "trust-resolver") return [packages.proofs];
  return [packages.self];
};

export const STATUS_OPENID_EVIDENCE_PROVIDER_CATALOG = {
  formatVersion: 1,
  providers: requirements.map((requirement) => ({
    id: `${requirement.id}.provider`,
    version: "1.0.0",
    roles: [requirement.role],
    capabilities: [requirement.capability],
    packages: providerPackages(requirement.role),
    witnessPolicy: "public-only" as const,
    atomicReplay: requirement.role === "replay",
  })),
} satisfies CapabilityProviderCatalogV1;

const disabled = { state: "disabled" } as const;
const selected = Object.fromEntries(requirements.map((requirement) => [
  requirement.role,
  {
    state: "selected",
    requirementId: requirement.id,
    provider: { id: `${requirement.id}.provider`, version: "1.0.0" },
    instanceId: `${requirement.id}.synthetic-instance`,
  },
])) as Partial<CredentialDeploymentComponents>;

export const STATUS_OPENID_EVIDENCE_ASSEMBLY = {
  formatVersion: 1,
  id: "assembly.use-case.contractor-access-status-openid-v1",
  version: "1.0.0",
  profile: { id: STATUS_OPENID_EVIDENCE_PROFILE.id, version: STATUS_OPENID_EVIDENCE_PROFILE.version },
  components: {
    session: selected.session!, storage: selected.storage!, "key-custody": selected["key-custody"]!, signing: selected.signing!,
    "did-resolver": selected["did-resolver"]!, "trust-resolver": selected["trust-resolver"]!, wallet: selected.wallet!,
    connector: disabled, network: selected.network!, transport: selected.transport!, "proof-executor": selected["proof-executor"]!,
    "artifact-resolver": disabled, "status-registry": selected["status-registry"]!, "status-proof": selected["status-proof"]!,
    "status-authority": selected["status-authority"]!, "status-mutation": disabled, replay: selected.replay!, verification: selected.verification!,
    registration: disabled, anchoring: disabled,
  },
  artifacts: [],
  deployments: [],
} satisfies CredentialDeploymentAssemblyV1;

export const resolveStatusOpenIdEvidenceProfile = (): ResolvedCredentialCompositionV1 =>
  resolveCredentialComposition({
    family: STATUS_OPENID_EVIDENCE_FAMILY,
    profile: STATUS_OPENID_EVIDENCE_PROFILE,
    assembly: STATUS_OPENID_EVIDENCE_ASSEMBLY,
    catalog: STATUS_OPENID_EVIDENCE_PROVIDER_CATALOG,
  });
