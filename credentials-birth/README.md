# @midnight-ntwrk/midnight-did-credentials-birth

Birth-credential specialization for the generic Midnight VC/VP core.

Status:

- reference implementation

Surface classification:

- `On-chain + off-chain`
- `src/birth-credential.compact` is the authoritative contract-authoring surface
- generated/runtime TypeScript exports are off-chain mirrors only
- `./testing` is an `Off-chain only` fixture surface for integration tests;
  do not import `../<package>/src/...` from sibling workspaces
- example:
  `import { createBirthCredentialProtocolFixtureForParticipants } from "@midnight-ntwrk/midnight-did-credentials-birth/testing";`

Start here:

1. use this package when you want the simplest current concrete credential
   family in the repository
2. write contracts against the Compact family entrypoint
3. use generated/runtime exports only in tests, wallets, verifiers, and
   adapter code
4. read [`../docs/guides/integration-surface-map.md`](../docs/guides/integration-surface-map.md)
   for the Compact/runtime split

Related docs:

- spec: [`../docs/spec/midnight-credentials.md`](../docs/spec/midnight-credentials.md)
- profiles: [`../docs/spec/profiles.md`](../docs/spec/profiles.md)
- conformance: [`../docs/spec/conformance.md`](../docs/spec/conformance.md)
- companion guide: [`../docs/guides/midnight-credentials-for-dummies.md`](../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../docs/testing/test-matrix.md`](../docs/testing/test-matrix.md)

## Purpose

This package defines the birth-credential family on top of the generic
[`credentials`](../credentials/README.md) package.

It owns the schema-specific parts that should not live in the generic core:

- birth claim commitments
- birth-credential schema validation
- typed birth-credential presentation requests
- birth-country disclosure binding
- age-over-threshold predicate validation

## Relationship to the generic core

The generic package owns:

- proof container types
- DID method identifiers
- holder binding
- generic VC/VP envelope types
- generic proof-binding checks
- generic credential/presentation linking checks

This package owns:

- `BirthCredentialClaims`
- `BirthCredentialDisclosures`
- `BirthCredentialPresentationRequest`
- `BirthCredential`
- `BirthCredentialPresentation`
- birth-specific commitment helpers
- birth-specific validation, request, and predicate circuits

## Why this package exists

This package is the simplest concrete credential family in the repository.
Use it when you want to understand:

- how the generic VC/VP envelope becomes a real credential family
- how claim commitments are laid out for one schema
- how a verifier request and an age predicate are wired in practice

## Build and test

- Compile Compact artifacts: `npm run contract -w credentials-birth`
- Build TS exports: `npm run build -w credentials-birth`
- Run tests: `npm test -w credentials-birth`
