# `@midnight-ntwrk/credential-exchange`

> Maturity: `infrastructure`
> Package class: `dist`
> Release stage: `internal`

Private family-neutral orchestration candidate for issuance, presentation, and
verification. Issuer, holder, and verifier agents receive one already-resolved
`InjectedCredentialFamilyAdapter` directly and never import generated family
contracts. Generic wallets can use `credential-model`'s public runtime resolver
with `isInjectedCredentialFamilyAdapterFor(...)`, then inject the resolved
adapter without changing these agents for each family.

Family adapters own canonical bytes and validity. Protocol adapters can only
wrap and unwrap `CanonicalMessage` values, so OpenID, future DIDComm, HTTP, and
other transports stay outside family packages and cannot redefine validity.

`AuthorityBoundVerifierAgent` is the optional async verification runtime for
profiles that selected exact `did-resolver` and `trust-resolver` providers. It
first requires the injected family verifier to succeed, binds caller-supplied
credential/proof digests and hashes canonical presentation/request identities
into the authority context, and then applies `credential-proofs`' reusable
issuer/holder/verifier/
status DID and trust binder. It forwards no arbitrary verification input to
resolvers, so private holder witnesses stay inside the family verifier. Missing
or unauthenticated authority evidence is indeterminate and returns `valid:
false`; no concrete DID method or trust registry is implemented here.

Committed-private families may additionally provide the optional
`IssuanceAdapter.claimOpenings` port. `HolderAgent` then creates an exact
recipient/claim-set request, accepts a compound `CredentialIssuanceResult`, and
persists an opaque `HolderCredentialRecord` only after the result's echoed
canonical request matches the holder request and the adapter recomputes all
delivered commitments. The family validation callback receives that request,
and a restarted holder revalidates both the stored request and delivery before
presentation or selective recovery. The sidecar never changes canonical
credential bytes and is never passed to presentation or verification adapters;
acceptance receipts contain family identity and a count only. Applications must carry
this holder-only sidecar over their existing confidential issuance channel and
store it as private wallet material.

The original `issue` / `acceptCredential` lifecycle remains available for
direct-claim families and existing adapters. Runtime-resolved adapters use the
same optional port and are still authenticated by `credential-model` before
injection; exchange does not execute or manage plugins.

The existing `@midnight-ntwrk/midnight-did-credentials-protocol` package remains
the outward birth/birth-secret/age-gate reference and compatibility surface.
This candidate does not change its public classes or claim publication,
protocol conformance, package delivery, or plugin execution.
