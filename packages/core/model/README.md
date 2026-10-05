# @midnight-ntwrk/credential-model

> Maturity: `core`
> Package class: `dist`
> Release stage: `supported`

Protocol-neutral TypeScript metadata for describing and validating a credential
schema and its claims. The package does not describe runtime composition,
deployment, proof artifacts, or encoding.

## Install

```bash
pnpm add -E @midnight-ntwrk/credential-model@0.4.0
```

This source tree targets `0.4.0`. Install it only after that immutable version
is published. The release line is pre-1.0, so keep the resolved version pinned
when a consumer repository requires reproducible builds. Inspect registry tags
before selecting a stable or release-candidate version:

```bash
npm view @midnight-ntwrk/credential-model dist-tags --json
```

Do not infer an immutable version from a moving dist-tag in release-sensitive
automation.

## Public API

The package exports:

- credential schema and claim descriptors;
- `defineCredentialSchema(...)`;
- `assertCredentialSchemaDefinition(value: unknown)`, which narrows valid input
  to `CredentialSchemaDefinition`;
- `CredentialModelError` and the bounded validation error-code union.

It has zero runtime dependencies.

## Define a schema

```ts
import { defineCredentialSchema } from "@midnight-ntwrk/credential-model";

export const employeeSchema = defineCredentialSchema({
  id: "urn:example:employee",
  version: "1.0.0",
  name: "Employee credential schema",
  description: "Claims issued to an employee.",
  credentialTypes: ["VerifiableCredential", "EmployeeCredential"],
  claims: [
    {
      id: "employeeId",
      path: ["employeeId"],
      disclosure: "selective",
      required: true,
    },
  ],
});
```

`defineCredentialSchema(...)` validates descriptor identifiers, semantic
versions, optional display metadata, credential types, claim paths, disclosure
modes, required flags, and unique claim IDs. Versions follow SemVer 2.0 syntax.
The helper preserves the inferred type of source-authored definitions.

Use the assertion function for JSON, configuration, or other untyped input:

```ts
import {
  assertCredentialSchemaDefinition,
  type CredentialSchemaDefinition,
} from "@midnight-ntwrk/credential-model";

export const parseSchema = (value: unknown): CredentialSchemaDefinition => {
  assertCredentialSchemaDefinition(value);
  return value;
};
```

Invalid input throws `CredentialModelError` with a stable error code and field
path. Validation is structural; applications remain responsible for policy and
business constraints beyond the generic descriptor model.

## Boundaries

This package does not define codecs, credential or presentation payloads,
capabilities, proof artifacts, package composition, providers, deployments,
proof execution, status storage, DID resolution, exchange protocols, sessions,
display rendering, or business decisions. Consumer repositories and
applications own those concerns.

Removed runtime and composition APIs have no compatibility shim. Consumers
should keep concrete configuration and behavior in their owning repository and
use this package only for generic schema and claim metadata.

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
