import {
  CREDENTIAL_DEPLOYMENT_ROLES,
  defineCredentialFamily,
  type CredentialDeploymentComponents,
  type RuntimeCredentialFamilyRecordV1,
  type RuntimeCredentialFamilyRegistryV1,
  type RuntimeCredentialFamilyTrustVerifier,
} from "@midnight-ntwrk/credential-model";
import type {
  CanonicalMessage,
  InjectedCredentialFamilyAdapter,
} from "@midnight-ntwrk/credential-exchange";

const text = new TextEncoder();
const decode = new TextDecoder();

export const reference = {
  id: "consumer.runtime-family",
  version: "1.0.0",
  schemaId: "consumer.runtime-family:schema",
  schemaVersion: "1.0.0",
} as const;

const message = <TKind extends CanonicalMessage["kind"]>(
  kind: TKind,
  payload: string,
): CanonicalMessage<TKind> => ({
  familyId: reference.id,
  familyVersion: reference.version,
  schemaId: reference.schemaId,
  schemaVersion: reference.schemaVersion,
  kind,
  mediaType: "application/vnd.midnight.consumer+bytes",
  payload: text.encode(payload),
});

const adapter: InjectedCredentialFamilyAdapter = {
  family: {
    id: reference.id,
    version: reference.version,
    schema: { id: reference.schemaId, version: reference.schemaVersion },
  },
  issuance: {
    createOffer: () => message("issuance-offer", "offer"),
    createRequest: () => message("issuance-request", "request"),
    issue: () => message("credential", "credential"),
    accept: (credential) => credential,
  },
  presentation: {
    createRequest: () => message("presentation-request", "challenge"),
    present: (credential, request) =>
      message(
        "presentation",
        `${decode.decode(credential.payload)}:${decode.decode(request.payload)}`,
      ),
  },
  verification: {
    verify: (presentation) => ({
      valid: decode.decode(presentation.payload) === "credential:challenge",
      canonicalPresentation: presentation,
    }),
  },
};

const codec = {
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
    credentialTypes: ["VerifiableCredential", "RuntimeConsumerCredential"],
    claims: [],
  },
  capabilities: [],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [
      {
        name: "consumer-runtime-family",
        version: "1.0.0",
        exports: ["./wallet"],
      },
    ],
  },
  credentialCodec: codec,
  presentationCodec: codec,
});

const profile = {
  formatVersion: 1,
  id: "consumer.runtime-family.wallet",
  version: "1.0.0",
  family: reference,
  semantics: {
    claims: [],
    holderBinding: {
      mode: "explicit-did",
      capability: { id: "holder-binding.consumer", version: "1.0.0" },
    },
    issuance: {
      credential: "issuer-local-issuance-v1",
      registration: "disabled",
      anchoring: "disabled",
    },
    presentation: {
      capability: { id: "presentation.consumer", version: "1.0.0" },
      preparation: "holder-wallet-v1",
      proofGeneration: {
        capability: { id: "proof.consumer", version: "1.0.0" },
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
      method: "did:consumer",
      relationship: "authentication",
      network: "consumer",
      versionEvidence: "did-consumer@1",
    },
    trust: { scope: "consumer", epochEvidence: "consumer-trust@1" },
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
        name: "consumer-runtime-family",
        version: "1.0.0",
        exports: ["./wallet"],
        domain: "family",
      },
    ],
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
    fixtureId: "clean-runtime-wallet@1",
    evidenceDisposition: "tested",
    evidenceIds: ["consumer:runtime-wallet"],
  },
  maturity: {
    api: { subjectId: "api:runtime-wallet", value: "reference" },
    security: { subjectId: "security:runtime-wallet", value: "unassessed" },
    standards: { subjectId: "standards:runtime-wallet", value: "not-applicable" },
    production: { subjectId: "production:runtime-wallet", value: "not-assessed" },
  },
} as const;

const components = Object.fromEntries(
  CREDENTIAL_DEPLOYMENT_ROLES.map((role) => [role, { state: "disabled" }]),
) as unknown as CredentialDeploymentComponents;

const artifactDigest = "c".repeat(64);
const record: RuntimeCredentialFamilyRecordV1 = {
  formatVersion: 1,
  family,
  profile,
  assembly: {
    formatVersion: 1,
    id: "consumer.runtime-family.local-wallet",
    version: "1.0.0",
    profile: { id: profile.id, version: profile.version },
    components,
    artifacts: [],
    deployments: [],
  },
  catalog: { formatVersion: 1, providers: [] },
  publicSurface: {
    formatVersion: 1,
    family: reference,
    profile: { id: profile.id, version: profile.version },
    package: {
      name: "consumer-runtime-family",
      version: "1.0.0",
      exportPath: "./wallet",
    },
    artifact: {
      id: "consumer-runtime-family-wallet-js",
      digestAlgorithm: "sha256",
      digest: artifactDigest,
    },
    value: adapter,
  },
  authentication: {
    scheme: "fixture-signature-v1",
    authority: "did:consumer:registry",
    keyId: "did:consumer:registry#key-1",
    signature: "fixture-trusted-signature",
  },
};

export const registry: RuntimeCredentialFamilyRegistryV1 = {
  formatVersion: 1,
  id: "consumer.registry",
  version: "1.0.0",
  resolve: async (requested) =>
    JSON.stringify(requested) === JSON.stringify(reference) ? record : undefined,
};

export const trustVerifier: RuntimeCredentialFamilyTrustVerifier = {
  verify: async ({ authentication, metadata }) =>
    authentication.signature === "fixture-trusted-signature" &&
    metadata.publicSurface.artifact.digest === artifactDigest
      ? { trusted: true }
      : { trusted: false, reason: "fixture authentication rejected" },
};
