# @midnight-ntwrk/midnight-did-credentials-hello-family

> Maturity: `reference`
> Package class: `dist`

Status:

- starter credential-family package
- claims-type playground for the current Compact language surface

Purpose:

- provide the smallest compileable family package after `birth` and `birth-secret`
- document which primitive claim types Compact accepts today in real family code
- give integrators a safe place to prototype claim-shape tradeoffs without mixing them into business or revocation flows

Scope:

- explicit-holder `VC<HelloFamilyClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`
- direct typed claims, not privacy-preserving claim commitments
- typed presentation request and simple disclosure gates
- explicit-holder and offchain-DID starter holder-binding profiles
- no issuance/presentation protocol wrappers yet
- no status/revocation semantics

Why this package exists:

- `birth` and `birth-secret` intentionally optimize for real credential semantics
- they are not a good laboratory for “what types can a claim use?” because most user data is committed into `Bytes<32>` openings
- this package answers that narrower question with a compileable reference package

## Current Compact claim-type matrix

As of the current repo toolchain (`COMPACT_COMPILER_VERSION` in CI):

Supported in this package today:

- `Boolean`
- `Uint<8>`
- `Uint<248>`
- `Bytes<32>`
- `Field`
- `Vector<2, Boolean>`
- `Vector<2, Uint<64>>`
- `Vector<2, Bytes<16>>`
- `Vector<2, Field>`
- nested structs composed from those same supported primitives
- `Vector<k, NestedStruct>` when the nested struct itself is composed only from supported primitives

Not supported by the current Compact compiler surface:

- `Int<...>`
- `Float<...>`
- `String`
- `Vector<k, Int<...>>`
- `Vector<k, Float<...>>`
- `Vector<k, String>`

Those unsupported cases are not just prose claims here; the test suite compiles tiny probe contracts and asserts the current compiler rejects them.

## Practical mapping guidance

If you need a conceptual value that Compact does not support directly:

- signed integer:
  use a domain-specific offset or sign bit over `Uint<...>`
- floating-point:
  use fixed-point scaling over `Uint<...>` or `Field`
- string:
  use padded `Bytes<N>` or a `Vector<k, Bytes<n>>` chunk layout
- bigint:
  use `Uint<248>` today; runtime mirrors surface as JavaScript `bigint`

## Nested claim structures

The current compiler accepts nested structs inside claims and even vectors over
nested structs, as long as every nested field is still built from the supported
primitive surface above.

That does **not** automatically mean nested claims are the best default for
shared VC families. They come with two costs:

- request/disclosure models become materially more complex
- interop documentation becomes harder to keep obvious for downstream users

Current recommendation:

- use flat top-level claims for canonical shared families when possible
- use nested claims only when they encode a real domain grouping that would be
  worse if flattened
- treat nested vector-of-struct claims as prototype-only until a concrete use
  case proves they help more than they obscure

## Claim Representation

This family uses the
[`claim-representation`](../../../../docs/spec/claim-representation.md) taxonomy as
a direct-claim laboratory:

- supported primitive and nested fields in `HelloFamilyClaims` are
  `selectivelyDisclosed` only when a presentation request explicitly gates and
  mirrors them
- fields not present in the disclosure/request surface are direct prototype
  claims and should be treated as visible to any verifier that receives the
  credential body
- the family intentionally does not implement `committedPrivate` or
  `predicateOnly` claims; use the birth and mixed-claims families for those
  patterns

## Package structure

- [`src/hello-family-credential.compact`](./src/hello-family-credential.compact)
  thin standalone family root that includes the canonical shared core once
- [`src/hello-family-credential/composable.compact`](./src/hello-family-credential/composable.compact)
  dependency-free, family-prefixed Layer 3 entrypoint
- [`src/hello-family-credential/claims.compact`](./src/hello-family-credential/claims.compact)
  supported-claims laboratory surface
- [`src/hello-family-credential/model.compact`](./src/hello-family-credential/model.compact)
  simple disclosure and request structs
- [`src/hello-family-credential/helpers.compact`](./src/hello-family-credential/helpers.compact)
  schema, request, credential, and presentation validation helpers

## Build and test

- `pnpm --dir ./packages/prototypes/credential-families/hello-family run build`
- `pnpm --dir ./packages/prototypes/credential-families/hello-family run lint`
- `pnpm --dir ./packages/prototypes/credential-families/hello-family run test:ci`

## DID-aware starter path

This package now also carries a lightweight offchain Midnight DID holder-binding
profile for the repo's smallest DID-aware smoke path.

Use that profile when you need to prove:

- a long-form offchain DID URL can derive a VC holder binding
- the derived holder binding can issue and verify a starter presentation
- the result can flow into the `hello-verifier` Layer 3 starter

Start with [`../../../../docs/guides/did-vc-hello-smoke-path.md`](../../../../docs/guides/did-vc-hello-smoke-path.md).

## Limitations

- this package is a types-and-structure lab, not a privacy-preserving claim design
- direct claim fields here will usually be too revealing for real credentials
- the disclosure model is intentionally narrower than the claims struct; it demonstrates a few representative direct disclosures instead of trying to expose every supported primitive field
- if you move a field from this family into production, you still need to decide whether it belongs as:
  - direct typed claim
  - committed claim
  - selectively disclosed field
  - predicate-only witness input
