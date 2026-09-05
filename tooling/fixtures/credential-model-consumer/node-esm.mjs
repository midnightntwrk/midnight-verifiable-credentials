import assert from "node:assert/strict";

import {
  CREDENTIAL_DEPLOYMENT_ROLES,
  CredentialModelError,
  assertCapabilityProviderCatalogV1,
  assertCredentialDeploymentAssemblyV1,
  assertCredentialFamilyProfileV1,
  defineCredentialFamily,
  resolveCredentialComposition,
} from "@midnight-ntwrk/credential-model";

const jsonCodec = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: JSON.parse,
};
const accessFamily = defineCredentialFamily({
  id: "fixture.access",
  version: "0.1.0",
  schema: {
    id: "urn:fixture:access",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "AccessCredential"],
    claims: [
      {
        id: "accessLevel",
        path: ["accessLevel"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
  capabilities: [],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [],
  },
  credentialCodec: jsonCodec,
  presentationCodec: jsonCodec,
});

assert.equal(accessFamily.id, "fixture.access");
assert.equal(
  accessFamily.credentialCodec.decode(
    accessFamily.credentialCodec.encode({ accessLevel: 4 }),
  ).accessLevel,
  4,
);
assert.throws(
  () =>
    defineCredentialFamily({
      ...accessFamily,
      version: "latest",
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "INVALID_VERSION",
);

const profile = {
  formatVersion: 1,
  id: "fixture.access.offchain-public",
  version: "1.0.0",
  family: {
    id: "fixture.access",
    version: "0.1.0",
    schemaId: "urn:fixture:access",
    schemaVersion: "1.0.0",
  },
  semantics: {
    claims: [{ claimId: "accessLevel", disclosure: "selective" }],
    holderBinding: {
      mode: "explicit-did",
      capability: { id: "holder-binding.fixture", version: "1.0.0" },
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
      versionEvidence: "fixture.did@1",
    },
    trust: {
      scope: "fixture-access",
      epochEvidence: "fixture.trust@1",
    },
    trustedTime: {
      source: "none",
      evidence: "not-required",
      freshnessPolicy: "not-required",
    },
    mutation: { location: "none", nullifier: "none", consumption: "none" },
    protocols: ["canonical-reference"],
  },
  requirements: {
    packages: [],
    compactEntrypoints: [],
    circuits: [],
    artifacts: [],
    providers: [
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
    fixtureId: "fixture:clean-consumer@1",
    evidenceDisposition: "tested",
    evidenceIds: ["clean-consumer:node-esm"],
  },
  maturity: {
    api: { subjectId: "api:clean-consumer", value: "reference" },
    security: { subjectId: "security:clean-consumer", value: "unassessed" },
    standards: {
      subjectId: "standards:clean-consumer",
      value: "not-applicable",
    },
    production: {
      subjectId: "production:clean-consumer",
      value: "not-assessed",
    },
  },
};
const components = Object.fromEntries(
  CREDENTIAL_DEPLOYMENT_ROLES.map((role) => [role, { state: "disabled" }]),
);
components["proof-executor"] = {
  state: "selected",
  requirementId: "fixture.proof.requirement",
  provider: { id: "fixture.proof-provider", version: "1.0.0" },
  instanceId: "fixture.proof-provider.instance@1",
};
const assembly = {
  formatVersion: 1,
  id: "fixture.clean-consumer",
  version: "3.0.0",
  profile: { id: profile.id, version: profile.version },
  components,
  artifacts: [],
  deployments: [
    {
      id: "fixture.clean-consumer.local@1",
      version: "1.0.0",
      kind: "local-service",
      domain: "verification",
      identity: "urn:fixture:clean-consumer:local:1",
      networkId: "fixture-testnet",
      chainId: "fixture-chain-1",
      contractAddress: "fixture-clean-consumer-1",
      profile: { id: profile.id, version: profile.version },
      immutableInputs: { mode: "fixture" },
    },
  ],
};
const catalog = {
  formatVersion: 1,
  providers: [
    {
      id: "fixture.proof-provider",
      version: "1.0.0",
      roles: ["proof-executor"],
      capabilities: [{ id: "proof.fixture", version: "1.0.0" }],
      packages: [
        {
          name: "fixture-proof-provider",
          version: "1.0.0",
          exports: ["."],
          domain: "proof",
        },
      ],
      witnessPolicy: "public-only",
      atomicReplay: false,
    },
  ],
};

assertCredentialFamilyProfileV1(profile);
assertCredentialDeploymentAssemblyV1(assembly);
assertCapabilityProviderCatalogV1(catalog);

const missingProofProfile = structuredClone(profile);
missingProofProfile.requirements.providers = [];
const missingProofAssembly = structuredClone(assembly);
missingProofAssembly.components["proof-executor"] = { state: "disabled" };
assert.throws(
  () =>
    resolveCredentialComposition({
      family: accessFamily,
      profile: missingProofProfile,
      assembly: missingProofAssembly,
      catalog,
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "CAPABILITY_NOT_PROVIDED" &&
    error.path === "requirements.providers.proof-executor",
);

const substitutedProofProfile = structuredClone(profile);
substitutedProofProfile.requirements.providers[0].capability = {
  id: "proof.unrelated",
  version: "1.0.0",
};
const substitutedProofCatalog = structuredClone(catalog);
substitutedProofCatalog.providers[0].capabilities = [
  { id: "proof.unrelated", version: "1.0.0" },
];
assert.throws(
  () =>
    resolveCredentialComposition({
      family: accessFamily,
      profile: substitutedProofProfile,
      assembly,
      catalog: substitutedProofCatalog,
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "CONTRADICTORY_PROFILE" &&
    error.path === "requirements.providers[0].capability",
);

const graph = resolveCredentialComposition({
  family: accessFamily,
  profile,
  assembly,
  catalog,
});
assert.deepEqual(graph.profile, {
  id: "fixture.access.offchain-public",
  version: "1.0.0",
});
assert.deepEqual(graph.assembly, {
  id: "fixture.clean-consumer",
  version: "3.0.0",
});
assert.equal(graph.packages[0].name, "fixture-proof-provider");
assert.equal(graph.conformance.fixtureId, "fixture:clean-consumer@1");

console.log("Node ESM consumed and resolved the credential model tarball.");
