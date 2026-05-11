# @midnight-ntwrk/midnight-did-credentials-hello-family

Status:

- starter credential-family package
- claims-type playground for the current Compact language surface

Purpose:

- provide the smallest compileable family package after `birth` and `birth-secret`
- document which primitive claim types Compact accepts today in real family code
- give integrators a safe place to prototype claim-shape tradeoffs without mixing them into business or revocation flows

Scope:

- explicit-holder `VC<HelloFamilyClaims, ExplicitHolderBinding, NoStatusBinding>`
- direct typed claims, not privacy-preserving claim commitments
- typed presentation request and simple disclosure gates
- no issuance/presentation protocol wrappers yet
- no status/revocation semantics

Why this package exists:

- `birth` and `birth-secret` intentionally optimize for real credential semantics
- they are not a good laboratory for “what types can a claim use?” because most user data is committed into `Bytes<32>` openings
- this package answers that narrower question with a compileable reference package

## Current Compact claim-type matrix

As of the current repo toolchain (`COMPACT_COMPILER_VERSION=0.30.0`):

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

Not supported by the current Compact compiler surface:

- `Int<...>`
- `Float<...>`
- `String`

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

## Package structure

- [`src/hello-family-credential.compact`](./src/hello-family-credential.compact)
  thin-core family root
- [`src/hello-family-credential/claims.compact`](./src/hello-family-credential/claims.compact)
  supported-claims laboratory surface
- [`src/hello-family-credential/model.compact`](./src/hello-family-credential/model.compact)
  simple disclosure and request structs
- [`src/hello-family-credential/helpers.compact`](./src/hello-family-credential/helpers.compact)
  schema, request, credential, and presentation validation helpers

## Build and test

- `npm run build -w ./prototypes/credential-families/hello-family`
- `npm run lint -w ./prototypes/credential-families/hello-family`
- `npm run test:ci -w ./prototypes/credential-families/hello-family`

## Limitations

- this package is a types-and-structure lab, not a privacy-preserving claim design
- direct claim fields here will usually be too revealing for real credentials
- the disclosure model is intentionally narrower than the claims struct; it demonstrates a few representative direct disclosures instead of trying to expose every supported primitive field
- if you move a field from this family into production, you still need to decide whether it belongs as:
  - direct typed claim
  - committed claim
  - selectively disclosed field
  - predicate-only witness input
