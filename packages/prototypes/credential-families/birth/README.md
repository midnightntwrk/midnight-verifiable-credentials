# @midnight-ntwrk/midnight-did-credentials-birth

> Maturity: `reference`
> Package class: `dist`

Birth-credential specialization for the generic Midnight VC/VP core.

Status:

- reference implementation

Tier:

- credential-family package

Dependency direction:

- depends on reusable core packages
- may be composed by Layer 3 contracts and Layer 4 adapters
- should not depend on protocol/orchestration packages, demos, or standalone
  integration harnesses

Reusable outside this repo:

- yes

Surface classification:

- `On-chain + off-chain`
- `src/birth-credential.compact` is the standalone contract-authoring surface
- `src/birth-credential/composable.compact` is the family-prefixed Layer 3
  surface and assumes the canonical core composition root is included once
- generated/runtime TypeScript exports are off-chain mirrors only
- `./testing` is an `Off-chain only` fixture surface for integration tests;
  do not import `../<package>/src/...` from sibling workspaces
- example:
  `import { createBirthCredentialProtocolFixtureForParticipants } from "@midnight-ntwrk/midnight-did-credentials-birth/testing";`

Start here:

1. use this package when you want the simplest current concrete credential
   family in the repository
2. use `birth-credential.compact` for standalone compilation or include the
   canonical core once plus `birth-credential/composable.compact` for
   multi-family composition
3. use generated/runtime exports only in tests, wallets, verifiers, and
   adapter code
4. read [`../../../../docs/guides/integration-surface-map.md`](../../../../docs/guides/integration-surface-map.md)
   for the Compact/runtime split

Related docs:

- spec: [`../../../../docs/spec/midnight-credentials.md`](../../../../docs/spec/midnight-credentials.md)
- profiles: [`../../../../docs/spec/profiles.md`](../../../../docs/spec/profiles.md)
- conformance: [`../../../../docs/spec/conformance.md`](../../../../docs/spec/conformance.md)
- companion guide: [`../../../../docs/guides/midnight-credentials-for-dummies.md`](../../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../../docs/testing/test-matrix.md`](../../../../docs/testing/test-matrix.md)

## Purpose

This package defines the birth-credential family on top of the generic
[`credentials`](../../../../packages/core/primitives/credentials/README.md) package.

It owns the schema-specific parts that should not live in the generic core:

- birth claim commitments
- birth-credential schema validation
- typed birth-credential presentation requests
- birth-country disclosure binding
- age-over-threshold predicate validation

Claim representation:

- all source facts in `BirthCredentialClaimCommitments` are `committedPrivate` or
  `predicateOnly`
- raw birth values are not direct claims in the signed credential body
- the generic VC uses `claims: NoPublicClaims {}` and stores only
  `claimCommitments`
- disclosures and predicates must open back to the signed commitments before a
  verifier uses them
- issuance results carry `BirthCredentialPrivateParts` separately from the
  canonical credential; result validation opens all four commitments before a
  holder adapter may persist or selectively recover those private parts
- compare [`../../../../docs/spec/claim-representation.md`](../../../../docs/spec/claim-representation.md)
  for the repository-wide taxonomy

## Relationship to the generic core

The generic package owns:

- proof container types
- DID method identifiers
- holder binding
- generic VC/VP envelope types
- generic proof-binding checks
- generic credential/presentation linking checks

This package owns:

- `BirthCredentialClaimCommitments`
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

- Compile Compact artifacts: `pnpm --dir credentials-birth run contract`
- Build TS exports: `pnpm --dir credentials-birth run build`
- Run tests: `pnpm --dir credentials-birth run test`
