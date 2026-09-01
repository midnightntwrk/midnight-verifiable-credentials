# `@midnight-ntwrk/credential-exchange`

> Maturity: `infrastructure`
> Package class: `dist`
> Release stage: `internal`

Private family-neutral orchestration candidate for issuance, presentation, and
verification. Issuer, holder, and verifier agents receive one
`InjectedCredentialFamilyAdapter` directly; this package does not discover
families or import generated family contracts.

Family adapters own canonical bytes and validity. Protocol adapters can only
wrap and unwrap `CanonicalMessage` values, so OpenID, future DIDComm, HTTP, and
other transports stay outside family packages and cannot redefine validity.

The existing `@midnight-ntwrk/midnight-did-credentials-protocol` package remains
the outward birth/birth-secret/age-gate reference and compatibility surface.
This candidate does not change its public classes or claim publication,
unknown-family resolution, or protocol conformance.
