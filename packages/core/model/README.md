# @midnight-ntwrk/credential-model

> Maturity: `core`
> Package class: `dist`
> Release stage: `supported`

Protocol-neutral TypeScript metadata for describing and validating a credential
family and its claim schema. The package does not describe runtime composition,
deployment, proof artifacts, or encoding.

## Install

```bash
pnpm add @midnight-ntwrk/credential-model@rc
```

The first public release line is pre-1.0. Pin an exact version when a
credential-family repository requires reproducible builds.

## Public API

The package exports:

- credential-family, schema, and claim descriptors;
- `defineCredentialFamily(...)`;
- `assertCredentialFamilyDefinition(...)`;
- `CredentialModelError` and the bounded validation error-code union.

It has zero runtime dependencies.

## Define a family

```ts
import { defineCredentialFamily } from "@midnight-ntwrk/credential-model";

export const employeeFamily = defineCredentialFamily({
  id: "example.employee",
  version: "0.1.0",
  name: "Employee credential",
  description: "Identifies an employee within an organization.",
  schema: {
    id: "urn:example:employee",
    version: "1.0.0",
    name: "Employee credential schema",
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
});
```

`defineCredentialFamily(...)` validates descriptor identifiers, semantic
versions, optional display metadata, credential types, claim paths, disclosure
modes, required flags, and unique claim IDs.

## Boundaries

This package does not define codecs, credential or presentation payloads,
capabilities, proof artifacts, package composition, providers, deployments,
proof execution, status storage, DID resolution, exchange protocols, sessions,
display rendering, or business decisions. Credential-family repositories and
applications own those concerns.

Removed runtime and composition APIs have no compatibility shim. Consumers
should keep concrete configuration and behavior in their owning repository and
use this package only for generic family and claim-schema metadata.

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
