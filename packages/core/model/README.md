# @midnight-ntwrk/credential-model

> Maturity: `core`
> Package class: `dist`
> Release stage: `supported`

Protocol-neutral TypeScript contracts for describing and validating a
credential family without depending on Compact, a ledger, a wallet, a
transport, or generated family types.

## Install

```bash
pnpm add @midnight-ntwrk/credential-model@rc
```

The first public release line is pre-1.0. Pin an exact version when a
credential-family repository requires reproducible builds.

## Public API

The package exports:

- schema, claim, capability, proof-artifact, and package descriptors;
- credential-family and package-composition manifests;
- credential and presentation codec ports;
- `defineCredentialFamily(...)`;
- `assertCredentialFamilyDefinition(...)` and
  `assertCredentialCompositionManifest(...)`;
- `CredentialModelError` and the bounded validation error-code union.

It has zero runtime dependencies.

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

`defineCredentialFamily(...)` validates descriptor identifiers, semantic
versions, claim paths, unique IDs, package requirements, and codec functions.
Codecs remain responsible for validating encoded credential and presentation
data when decoding.

## Boundaries

This package does not discover credential families or select providers,
deployments, proof execution, status storage, DID resolution, exchange
protocols, sessions, display rendering, or business decisions. Credential
family repositories and applications compose those concerns from independently
versioned packages.

The removed profile, deployment-assembly, provider-catalog, runtime-registry,
composition-resolver, and aggregate-decision APIs have no compatibility shim.
Consumers should keep concrete configuration and orchestration in their owning
repository and pass only the bounded descriptors required by this package.

## Compatibility and support

- The package is ESM-only and supports Node.js 24 or newer, strict TypeScript,
  and browser bundlers that consume standard ESM.
- During `0.x`, breaking API changes may ship in a minor release. Patch
  releases remain backward compatible within their minor line.
- Release candidates are supported only until a newer release candidate or
  stable version in the same minor line is published.
- Deprecations, migrations, and known limitations are recorded in this README
  and [`CHANGELOG.md`](./CHANGELOG.md).

Technical ownership belongs to `@midnightntwrk/ex-identus`. Release operations
belong to `@midnightntwrk/mn-sre`. Security reports follow the repository
[`SECURITY.md`](../../../SECURITY.md) process.
