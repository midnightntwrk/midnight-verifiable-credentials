# ADR-0018: Credential schema model terminology

- Status: Accepted
- Implementation: Pending [#715](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/715)
- Date: 2026-10-05
- Owners: VC maintainers
- Amends: ADR-0016 TypeScript model terminology and public API

## Context

The TypeScript model currently wraps one `CredentialSchemaDescriptor` in a
`CredentialFamilyDefinition`. Both objects carry an identifier, version, and
optional display metadata. The wrapper originally represented a collection of
related credential variants, but the core-only architecture no longer models
or releases such collections. Concrete credential types and their circuits live
in independent consumer repositories.

`Credential family` is not needed to describe the remaining model and is not a
term defined by the
[W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/).
Keeping it creates two identities and versions for one schema and forces
consumers to explain a repository-specific abstraction.

`Credential definition` is not a suitable replacement. The
[AnonCreds specification](https://hyperledger.github.io/anoncreds-spec/) uses
that term for issuer cryptographic material derived from a schema. Reusing it
for claim metadata would give the same phrase two incompatible meanings.

## Decision

Use `credential schema definition` for the source-authored TypeScript metadata
that describes credential types and claims. The public model becomes:

```ts
interface CredentialSchemaDefinition {
  readonly id: string;
  readonly version: string;
  readonly name?: string;
  readonly description?: string;
  readonly credentialTypes: readonly [string, ...string[]];
  readonly claims: readonly CredentialClaimDescriptor[];
}
```

The package exports:

- `CredentialSchemaDefinition`;
- the existing `CredentialClaimDescriptor` and `ClaimDisclosure` types;
- the existing `CredentialModelError` class and `CredentialModelErrorCode`
  type;
- `defineCredentialSchema(...)`; and
- `assertCredentialSchemaDefinition(...)`.

Claim descriptors and disclosure labels retain their current structure and
validation semantics. The schema definition remains structural metadata; it
does not validate credential payload values or establish issuer policy,
cryptographic correctness, deployment, or protocol behavior.

The name aligns with the VC domain but does not claim that this TypeScript
object is the serialized W3C `credentialSchema` property. A representation
profile may map a definition to a W3C data-schema reference, but that mapping
belongs to the consuming profile.

The existing Compact `SchemaRef` remains unchanged. Its package ID, schema ID,
and major/minor version identify the exact schema contract selected by a
credential. This decision does not define a new TypeScript-to-Compact ID
derivation.

## Migration

The old nested schema is the source of the new definition:

| Old field | New location |
| --- | --- |
| `family.schema.id` | `definition.id` |
| `family.schema.version` | `definition.version` |
| `family.schema.name` | `definition.name` |
| `family.schema.description` | `definition.description` |
| `family.schema.credentialTypes` | `definition.credentialTypes` |
| `family.schema.claims` | `definition.claims` |

Public symbols migrate as follows:

| Old symbol | Migration |
| --- | --- |
| `CredentialFamilyDefinition` | Remove the wrapper and use `CredentialSchemaDefinition` for its flattened `schema` value |
| `CredentialSchemaDescriptor` | `CredentialSchemaDefinition` |
| `defineCredentialFamily` | `defineCredentialSchema` |
| `assertCredentialFamilyDefinition` | `assertCredentialSchemaDefinition` |

`CredentialClaimDescriptor` and `ClaimDisclosure` keep their current names and
semantics. `CredentialModelError` and `CredentialModelErrorCode` also keep
their current names, codes, and class semantics.

Error paths change where the removed wrapper currently contributes a
`schema.` prefix. For example, `schema.id` becomes `id`, and
`schema.claims[0].path` becomes `claims[0].path`. Consumers that compare
`CredentialModelError.path` update those comparisons as part of the `0.4.0`
migration. The null/array definition cases remain at path `definition`.
Wrapper-only null/array schema-object cases have no successor. Identifier and
version cases from both former layers remain as distinct inputs against the
flat `id` and `version` fields, preserving untrimmed, empty, malformed, and
leading-zero coverage. The former positive prerelease-plus-build and build-only
SemVer values remain separate flat cases. Each duplicate outer/nested
display-metadata pair
becomes flat cases for empty and untrimmed values, plus both former non-string
input representatives for `name` and for `description`, with top-level error
paths.

The old outer `family.id`, `family.version`, `family.name`, and
`family.description` have no core replacement. Consumers that need package,
product, or catalog metadata keep it in their owning repository or package
manifest.

A consumer that constructs Compact `SchemaRef` values keeps package identity
separate from the schema definition: `packageId` comes from an explicit stable
package identifier, while `schemaId` may be mapped from the validated stable
schema `id` under the consumer's documented policy. A schema version is not
folded into `schemaId`. The Compact reference carries a profile-selected
compatibility version in `majorVersion` and `minorVersion`; that version MUST
satisfy the Compact invariant that `majorVersion` is non-zero and need not be a
literal copy of the TypeScript definition's SemVer components. The packed
DID/VC composition fixture must demonstrate that separation. The core still
does not prescribe a TypeScript-to-Compact identifier derivation or a general
SemVer mapping.

The active public API will not retain family-named aliases. Historical ADRs and
changelogs may use the old term when describing earlier releases. This is a
pre-1.0 minor breaking change targeted at `0.4.0` and requires explicit
migration notes.

Conformance changes atomically with the implementation:

- operation `validate-credential-schema-definition`;
- vector category `credential-schema-definition`;
- vector file `conformance/vectors/credential-schema-definition.json`;
- conformance and fixture documentation links and prose affected by the
  renamed vector and identifier policy;
- every normative specification section that names the model or operation,
  including the data model, terminology, and security considerations;
- public validation through `assertCredentialSchemaDefinition`;
- the published `@midnight-ntwrk/credential-model` package description;
- repository and agent reference lists, entrypoint prose, and package tables
  that describe the public model or point readers to this decision;
- hand-authored package and guide examples that use the public API;
- the TypeScript-only operation allowlist and packed consumer fixtures;
- the synchronized `0.4.0` package-graph release base;
- manifest vector path and content digest, followed by regeneration of
  `conformance/manifest.sha256`; and
- package and repository conformance tests that load the renamed vector.

Positive and negative cases continue to cover object shape, identifiers,
SemVer, display metadata, credential types, claim uniqueness, claim paths,
disclosure labels, required flags, and value-type labels.

## Consequences

- The public model describes one concept with one identifier and version.
- Consumer documentation can use established schema and credential-type terms.
- Package and product grouping remain outside the core model.
- Existing consumers must flatten their nested schema and update imports when
  moving to `0.4.0`.
- The TypeScript API, conformance manifest, vectors, fixtures, specification,
  and current documentation must change in one implementation slice so they do
  not make conflicting claims.

## Non-goals

This decision does not select JSON Schema, JSON-LD, AnonCreds, or another
external schema language. It does not change canonical Compact encoding,
`SchemaRef`, VC/VP envelopes, proof semantics, holder binding, signer
authorization, or exchange protocols.
