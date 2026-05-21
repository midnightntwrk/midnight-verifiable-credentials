# @midnight-ntwrk/midnight-did-credentials-dummy-claims

> Maturity: `lab`
> Package class: `dist`

Status:

- compileable dummy credential-family package
- direct-claims laboratory for the currently supported Compact claim surface

Purpose:

- keep a dedicated dummy VC package for probing supported claim shapes
- exercise selective disclosure over every currently supported direct primitive family
- prove nested claim structs are available without making them the default modeling recommendation

Scope:

- explicit-holder `VC<DummyClaims, NoClaimCommitments, ExplicitHolderBinding, NoStatusBinding>`
- direct `selectivelyDisclosed` claims only; no privacy-preserving commitments
  in the claim body
- top-level and nested selective-disclosure request/disclosure structs
- no status/revocation semantics
- no offchain-DID or starter-verifier concerns

Supported direct claim surface in this package:

- `Boolean`
- `Uint<8>`
- `Uint<64>`
- `Uint<248>`
- `Bytes<16>`
- `Bytes<32>`
- `Field`
- `Vector<2, Boolean>`
- `Vector<2, Uint<64>>`
- `Vector<2, Bytes<16>>`
- `Vector<2, Field>`
- nested structs composed from those supported primitives
- `Vector<2, NestedStruct>` where the nested struct itself only uses supported primitives

Not supported by the current Compact compiler surface:

- `Int<...>`
- `Float<...>`
- `String`
- vectors over those unsupported primitives

Selective disclosure model:

- every supported top-level primitive/vector field has a direct request gate
- the nested struct can be disclosed as a nested selective-disclosure object
  with per-field request gates
- the nested vector is disclosed as an all-or-nothing direct field to avoid exploding the request surface

Design note:

- nested claims compile, but the package treats them as a deliberate prototype choice rather than the default shared-family recommendation
- this package is a direct-claim laboratory, not a privacy template; use
  [`../mixed-claims`](../mixed-claims) when the family needs public claims plus
  private commitments in one claim body
- use `hello-family` for the smallest starter flow
- use this package when you need the widest direct typed claim surface in one place

Build and test:

- `npm run build -w ./packages/prototypes/credential-families/dummy-claims`
- `npm run lint -w ./packages/prototypes/credential-families/dummy-claims`
- `npm run typecheck -w ./packages/prototypes/credential-families/dummy-claims`
- `npm run test:ci -w ./packages/prototypes/credential-families/dummy-claims`
