# @midnight-ntwrk/credential-model

> Maturity: `core`
> Package class: `dist`
> Release stage: `supported`

Protocol-neutral TypeScript contracts for defining a credential family without
depending on Compact, a ledger, a wallet, a transport, or generated family
types.

The package provides:

- schema and claim descriptors;
- holder-binding, status, proof, and presentation capability descriptors;
- credential and presentation codec ports;
- proof-artifact requirements;
- bounded package composition manifests;
- validation helpers and family-neutral errors;
- independently versioned semantic profiles and deployment assemblies;
- capability-provider catalogs and an exact, fail-closed composition resolver.

## Install

```bash
pnpm add @midnight-ntwrk/credential-model@rc
```

The first public release line is pre-1.0. Pin an exact version when a
credential-family repository requires reproducible builds.

## Define a family

```ts
import {
  defineCredentialFamily,
  type CredentialCodec,
  type PresentationCodec,
} from "@midnight-ntwrk/credential-model";

interface EmployeeCredential {
  employeeId: string;
}

interface EmployeePresentation {
  employeeId: string;
}

const credentialCodec: CredentialCodec<EmployeeCredential, string> = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (value) => JSON.parse(value) as EmployeeCredential,
};

const presentationCodec: PresentationCodec<EmployeePresentation, string> = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (value) => JSON.parse(value) as EmployeePresentation,
};

export const employeeFamily = defineCredentialFamily({
  id: "example.employee",
  version: "0.1.0",
  schema: {
    id: "urn:example:employee",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "EmployeeCredential"],
    claims: [
      {
        id: "employeeId",
        path: ["employeeId"],
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
  credentialCodec,
  presentationCodec,
});
```

`defineCredentialFamily` validates descriptor identifiers, semantic versions,
claim paths, unique IDs, package requirements, and codec functions. Codecs are
responsible for validating their encoded data when decoding.

## Resolve a semantic profile and deployment assembly

`CredentialFamilyProfileV1` records semantic/security axes and exact package,
export, Compact entrypoint, circuit, artifact, provider-capability, conformance,
and maturity references. `CredentialDeploymentAssemblyV1` is independently
versioned and records concrete provider instances, immutable artifact digests,
and deployment identities. Neither contract selects or defaults the other.

```ts
import {
  assertCapabilityProviderCatalogV1,
  assertCredentialDeploymentAssemblyV1,
  assertCredentialFamilyProfileV1,
  resolveCredentialComposition,
} from "@midnight-ntwrk/credential-model";

assertCredentialFamilyProfileV1(profileFromConfiguration);
assertCredentialDeploymentAssemblyV1(assemblyFromConfiguration);
assertCapabilityProviderCatalogV1(providerCatalog);

const exactGraph = resolveCredentialComposition({
  family: employeeFamily,
  profile: profileFromConfiguration,
  assembly: assemblyFromConfiguration,
  catalog: providerCatalog,
});
```

The three validators accept `unknown`, reject omitted and unknown fields, and
throw `CredentialModelError` with a stable `code` and path. The resolver binds
one exact family/profile/assembly graph and rejects identity mismatches,
omitted or substituted proof-executor capability bindings, uncataloged provider
capabilities, package conflicts, missing artifacts, and
the mandatory ADR-0015 deny rules. Every deployment role in
`CREDENTIAL_DEPLOYMENT_ROLES` must be explicitly selected or `disabled`.
Disabled status rejects status registry, proof, authority, and mutation edges;
unrelated signing remains available.

The API is additive: existing `CredentialFamilyDefinition` consumers need no
migration. A consumer adopts composition resolution only when it has separate
profile, assembly, and provider-catalog inputs. No compatibility default turns
an old family definition into a deployment assembly.

## Boundaries

This package has zero runtime dependencies. It does not define proof
execution, status storage, DID resolution, exchange protocols, sessions,
display rendering, or deployment behavior. Those capabilities belong in
separate packages that depend on this model.

## Compatibility and support

- The package is ESM-only and supports Node.js 24 or newer, strict TypeScript,
  and browser bundlers that consume standard ESM.
- During `0.x`, breaking API changes may ship in a minor release. Patch
  releases remain backward compatible within their minor line.
- Release candidates are supported only until a newer release candidate or
  stable version in the same minor line is published.
- Deprecations, migrations, and known limitations are recorded in this
  changelog and README before a replacement release is promoted.

Technical ownership belongs to `@midnightntwrk/ex-identus`. Release operations
belong to `@midnightntwrk/mn-sre`. Security reports follow the repository
[`SECURITY.md`](../../../SECURITY.md) process.
