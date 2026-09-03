import {
  type CapabilityProviderCatalogV1,
  type CredentialDeploymentAssemblyV1,
  type CredentialDeploymentComponents,
  type CredentialDeploymentRole,
  type CredentialFamilyDefinition,
  type CredentialFamilyProfileV1,
  type ProviderRequirement,
  resolveCredentialComposition,
  type ResolvedCredentialCompositionV1,
} from "@midnight-ntwrk/credential-model";
import { MIDNIGHT_OPENID_PROFILE_V1 } from "@midnight-ntwrk/midnight-did-credentials-openid";

import {
  decodeUniversityProtocolTransportValue,
  type EncodedUniversityProtocolTransportValue,
  encodeUniversityProtocolTransportValue,
} from "./process-transport.js";

const claimIds = [
  "diplomaId",
  "studentId",
  "graduateName",
  "universityName",
  "facultyName",
  "awardName",
  "honorsCode",
  "graduationYear",
  "graduationMonth",
  "finalGrade",
  "creditsEarned",
] as const;

export const encodeUniversityCanonicalJson = (value: unknown): string =>
  JSON.stringify(encodeUniversityProtocolTransportValue(value));

export const decodeUniversityCanonicalJson = (value: string): unknown =>
  decodeUniversityProtocolTransportValue(
    JSON.parse(value) as EncodedUniversityProtocolTransportValue,
  );

const jsonCodec = {
  mediaType: "application/vnd.midnight.university-evidence+json",
  encode: encodeUniversityCanonicalJson,
  decode: decodeUniversityCanonicalJson,
};

export const UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY = {
  id: "prototype.university-diploma",
  version: "0.1.0",
  schema: {
    id: "urn:midnight:prototype:university-diploma",
    version: "1.0.0",
    credentialTypes: [
      "VerifiableCredential",
      "prototype.university-diploma",
    ],
    claims: claimIds.map((id) => ({
      id,
      path: ["credentialSubject", id] as [string, string],
      disclosure: "public" as const,
      required: true,
    })),
  },
  capabilities: [
    {
      id: "holder.explicit-did",
      kind: "holder-binding",
      version: "1.0.0",
      required: true,
    },
    {
      id: "proof.compact",
      kind: "proof",
      version: "1.0.0",
      required: true,
    },
    {
      id: "presentation.vp",
      kind: "presentation",
      version: "1.0.0",
      required: true,
    },
  ],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [
      {
        name: "@midnight-ntwrk/midnight-did-credentials-university-diploma",
        version: "^0.1.0",
        exports: ["./university-diploma-credential.compact", "./contract"],
      },
    ],
  },
  credentialCodec: jsonCodec,
  presentationCodec: jsonCodec,
} satisfies CredentialFamilyDefinition<unknown, unknown, string, string>;

const packages = {
  university: {
    name: "@midnight-ntwrk/midnight-did-credentials-university-diploma",
    version: "0.1.0",
    exports: ["./university-diploma-credential.compact", "./contract"],
    domain: "family" as const,
  },
  model: {
    name: "@midnight-ntwrk/credential-model",
    version: "0.1.0",
    exports: ["."],
    domain: "family" as const,
  },
  exchange: {
    name: "@midnight-ntwrk/credential-exchange",
    version: "0.1.0",
    exports: ["."],
    domain: "transport" as const,
  },
  proofs: {
    name: "@midnight-ntwrk/credential-proofs",
    version: "0.1.0",
    exports: ["."],
    domain: "proof" as const,
  },
  openid: {
    name: "@midnight-ntwrk/midnight-did-credentials-openid",
    version: "0.1.0",
    exports: ["."],
    domain: "protocol" as const,
  },
  universityProtocol: {
    name: "@midnight-ntwrk/midnight-did-university-protocol",
    version: "0.1.0",
    exports: ["."],
    domain: "session" as const,
  },
};

const universityProviderRequirements: readonly ProviderRequirement[] = [
  ["university.session", "session", "session.synthetic"],
  ["university.storage", "storage", "storage.checkpoint"],
  ["university.key-custody", "key-custody", "custody.isolated"],
  ["university.signing", "signing", "signing.isolated"],
  ["university.wallet", "wallet", "wallet.synthetic"],
  ["university.network", "network", "network.injected"],
  ["university.transport", "transport", "transport.serialized"],
  ["university.proof", "proof-executor", "proof.injected"],
  ["university.verification", "verification", "verification.v1.local"],
].map(([id, role, capability]) => ({
  id,
  role: role as CredentialDeploymentRole,
  capability: { id: capability, version: "1.0.0" },
}));

export const UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE = {
  formatVersion: 1,
  id: "profile.use-case.university-production-evidence",
  version: "1.0.0",
  family: {
    id: UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY.id,
    version: UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY.version,
    schemaId: UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY.schema.id,
    schemaVersion: UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY.schema.version,
  },
  semantics: {
    claims: claimIds.map((claimId) => ({ claimId, disclosure: "public" as const })),
    holderBinding: {
      mode: "explicit-did",
      capability: { id: "holder.explicit-did", version: "1.0.0" },
    },
    issuance: {
      credential: "issuer-local-issuance-v1",
      registration: "disabled",
      anchoring: "disabled",
    },
    presentation: {
      capability: { id: "presentation.vp", version: "1.0.0" },
      preparation: "holder-wallet-v1",
      proofGeneration: {
        capability: { id: "proof.compact", version: "1.0.0" },
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
      method: "did:midnight",
      relationship: "assertionMethod",
      network: "synthetic-evidence",
      versionEvidence: "workspace-lock",
    },
    trust: {
      scope: "policy-driven-synthetic-fixtures",
      epochEvidence: "non-production-authority",
    },
    trustedTime: {
      source: "none",
      evidence: "not-required",
      freshnessPolicy: "not-required",
    },
    mutation: { location: "none", nullifier: "none", consumption: "none" },
    protocols: ["canonical-reference", "oid4vci-1.0-final", "oid4vp-1.0-final", "dcql"],
  },
  requirements: {
    packages: [packages.university],
    compactEntrypoints: [
      {
        id: "compact.university-diploma",
        packageName: packages.university.name,
        exportPath: "./university-diploma-credential.compact",
        sourcePath:
          "packages/prototypes/credential-families/university-diploma/src/university-diploma-credential.compact",
      },
    ],
    circuits: [
      {
        id: "circuit.university-diploma.root",
        semanticVersion: "1.0.0",
        entrypointId: "compact.university-diploma",
      },
    ],
    artifacts: [],
    providers: universityProviderRequirements,
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
    fixtureId: "use-case:university:production-shaped-evidence-v1",
    evidenceDisposition: "tested",
    evidenceIds: [
      "university:profile-resolution",
      "university:public-surface-consumer",
      "university:fault-injection",
      "university:restart-replay-tamper",
      "university:verification-v1-outcome",
      "university:threat-model",
    ],
  },
  maturity: {
    api: {
      subjectId: "use-case:university:production-shaped-evidence-v1",
      value: "reference",
    },
    security: {
      subjectId: "use-case:university:production-shaped-evidence-v1",
      value: "design-reviewed",
    },
    standards: {
      subjectId: "use-case:university:production-shaped-evidence-v1",
      value: "profile-targeted",
    },
    production: {
      subjectId: "use-case:university:production-shaped-evidence-v1",
      value: "experimental",
    },
  },
} satisfies CredentialFamilyProfileV1;

const requirements = UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE.requirements.providers;

const provider = (
  requirementId: string,
  packageEntries: CapabilityProviderCatalogV1["providers"][number]["packages"],
): CapabilityProviderCatalogV1["providers"][number] => {
  const requirement = requirements.find((entry) => entry.id === requirementId);
  if (!requirement) throw new Error(`Unknown University provider ${requirementId}`);
  return {
    id: `${requirement.id}.provider`,
    version: "1.0.0",
    roles: [requirement.role],
    capabilities: [requirement.capability],
    packages: packageEntries,
    witnessPolicy: "public-only",
    atomicReplay: false,
  };
};

export const UNIVERSITY_PRODUCTION_EVIDENCE_PROVIDER_CATALOG = {
  formatVersion: 1,
  providers: [
    provider("university.session", [packages.model, packages.universityProtocol]),
    provider("university.storage", [packages.universityProtocol]),
    provider("university.key-custody", [packages.universityProtocol]),
    provider("university.signing", [packages.universityProtocol]),
    provider("university.wallet", [packages.exchange]),
    provider("university.network", [packages.openid]),
    provider("university.transport", [packages.exchange, packages.openid]),
    provider("university.proof", [packages.proofs]),
    provider("university.verification", [packages.proofs]),
  ],
} satisfies CapabilityProviderCatalogV1;

const disabled = { state: "disabled" } as const;
const components = Object.fromEntries(
  [
    "session",
    "storage",
    "key-custody",
    "signing",
    "wallet",
    "network",
    "transport",
    "proof-executor",
    "verification",
  ].map((role) => {
    const requirement = requirements.find((entry) => entry.role === role)!;
    return [
      role,
      {
        state: "selected",
        requirementId: requirement.id,
        provider: {
          id: `${requirement.id}.provider`,
          version: "1.0.0",
        },
        instanceId: `${requirement.id}.synthetic-instance`,
      },
    ];
  }),
) as Partial<CredentialDeploymentComponents>;

export const UNIVERSITY_PRODUCTION_EVIDENCE_ASSEMBLY = {
  formatVersion: 1,
  id: "assembly.use-case.university-production-evidence",
  version: "1.0.0",
  profile: {
    id: UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE.id,
    version: UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE.version,
  },
  components: {
    session: components.session!,
    storage: components.storage!,
    "key-custody": components["key-custody"]!,
    signing: components.signing!,
    "did-resolver": disabled,
    "trust-resolver": disabled,
    wallet: components.wallet!,
    connector: disabled,
    network: components.network!,
    transport: components.transport!,
    "proof-executor": components["proof-executor"]!,
    "artifact-resolver": disabled,
    "status-registry": disabled,
    "status-proof": disabled,
    "status-authority": disabled,
    "status-mutation": disabled,
    replay: disabled,
    verification: components.verification!,
    registration: disabled,
    anchoring: disabled,
  },
  artifacts: [],
  deployments: [],
} satisfies CredentialDeploymentAssemblyV1;

export const resolveUniversityProductionEvidenceProfile = (
  profile: CredentialFamilyProfileV1 = UNIVERSITY_PRODUCTION_EVIDENCE_PROFILE,
): ResolvedCredentialCompositionV1 =>
  resolveCredentialComposition({
    family: UNIVERSITY_PRODUCTION_EVIDENCE_FAMILY,
    profile,
    assembly: UNIVERSITY_PRODUCTION_EVIDENCE_ASSEMBLY,
    catalog: UNIVERSITY_PRODUCTION_EVIDENCE_PROVIDER_CATALOG,
  });

export { MIDNIGHT_OPENID_PROFILE_V1 };
