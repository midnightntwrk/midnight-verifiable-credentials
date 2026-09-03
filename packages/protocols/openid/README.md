# Midnight Credentials OpenID Domain Schemas

> Maturity: `reference`
> Package class: `dist`

Status:

- strict repository profile for OID4VCI 1.0 Final and OID4VP 1.0 Final
- locally executable conformance subset; not certification or a completed external-wallet interop claim

Tier:

- Layer 4 transport/domain adapter package

Dependency direction:

- depends downward on Compact-generated VC/family payloads
- must not be treated as a source of canonical verification semantics
- core and family packages must not depend on this transport layer

Reusable outside this repo:

- yes, as a transport/domain adapter surface

Surface classification:

- `Off-chain only`

Start here:

1. use this package for OpenID-shaped JSON/domain envelopes around Compact VC/VP
   payloads
2. keep verification semantics in Compact/family packages, not here
3. read [`../../../docs/guides/integration-surface-map.md`](../../../docs/guides/integration-surface-map.md)
   if you are deciding between transport schemas and contract-authoring surfaces

Related docs:

- spec: [`../../../docs/spec/midnight-credentials.md`](../../../docs/spec/midnight-credentials.md)
- protocol classification:
  [`../../../docs/architecture/protocol-classification.md`](../../../docs/architecture/protocol-classification.md)
- conformance: [`../../../docs/spec/conformance.md`](../../../docs/spec/conformance.md)
- companion guide: [`../../../docs/guides/midnight-credentials-for-dummies.md`](../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../docs/testing/test-matrix.md`](../../../docs/testing/test-matrix.md)

This package pins [OID4VCI 1.0 Final](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-final.html)
and [OID4VP 1.0 Final](https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html)
for the strict `org.midnight.credentials.openid.v1` repository profile. DCQL is
implemented as OID4VP query functionality. Strict schemas and lifecycle helpers
enforce the OID4VCI Final `proofs` container through an injected cryptographic
proof verifier, required holder/session bindings, and exact nonce/audience/origin/
`response_uri`/request/transcript/consent bindings, strict canonical holder
challenge/commitment byte encodings, exact DCQL result keys, expiry, atomic
replay consumption, and request-object redirect/global-unicast SSRF controls.
The profile supports `direct_post`; it rejects `direct_post.jwt` until verified,
request-bound JARM support is provided.

OAuth token validation, HTTP/DNS fetching, JAR/signature verification, consent,
clock, and replay persistence remain injected seams. The package does not host
OAuth or HTTP services, resolve DIDs, generate JWT proofs, implement wallet UI,
or decide whether canonical family proofs are valid. Legacy secret-bearing URI
helpers remain explicitly informative and are not part of the strict profile.
See [`../../../docs/spec/openid-final-profile.md`](../../../docs/spec/openid-final-profile.md).

The goal is to keep Midnight-specific credential issuance and presentation flows
compatible with familiar OpenID message shapes while preserving the Compact
credential payloads, holder-binding commitments, and verifier-domain predicates
used by Midnight Credentials.

Protocol reading rule:

- the JSON/OpenID envelopes in this package are Layer 4 transport/domain
  wrappers around core Compact semantics
- they do not redefine canonical VC proof or verification semantics

## Scope

- OID4VCI-shaped issuer metadata, offers, token requests, credential requests,
  responses, authorization details, deferred responses, and typed errors.
- OID4VP-shaped authorization requests/responses with DCQL-shaped queries,
  descriptor validation, and explicit request-digest/nonce binding inputs.
- Canonical Compact payload and message-thread identifiers that preserve
  `messageId`, `threadId`, and `respondsToMessageId` without interpreting proof
  semantics.
- A structural, byte-preserving adapter compatible with `credential-exchange`
  canonical messages and verifier results, without a protocol-to-component
  package dependency or any validity interpretation.
- Midnight extension schemas for Compact VC/VP payloads and holder-binding
  commitments.

## Non-goals

- OpenID certification, exhaustive optional-feature coverage, or a claim of successful external-wallet interoperability.
- OAuth server/client, production HTTP hosting, DIDComm, or a built-in network fetcher.
- DID resolution, signature/cryptographic verification, or wallet UI behavior.
- Family proof validity, status, or aggregate-decision semantics. Compact,
  verification, and credential-family packages remain authoritative.

## Conformance and interoperability

Negative vectors are single named-field mutations of conformant positive
bases, and the runner rejects unknown fixture kinds. Run the local,
independently stored profile vectors with:

```bash
pnpm run test:conformance
```

The external runner requires operator-supplied independent endpoints. The
checked-in status is deliberately `not-run`, because local/CI has no such
endpoints; see `src/conformance/external-interop-status.json`. Validate a runner
configuration without making network or interoperability claims with:

```bash
pnpm run interop:external -- --config src/conformance/external-interop-config.example.json --dry-run
```

## Compact Value Codec

The protocol-neutral owner of `compact-value-v1.base64url` is now
`@midnight-ntwrk/credential-compact`. This package re-exports the codec for one
compatibility cycle and uses it to frame Compact runtime `Value` payloads. The
intended usage is:

1. Build the generated TypeScript value for a Compact VC/VP body or proof.
2. Encode it with `encodeCompactPayload(descriptor, value)`.
3. Carry the encoded payload in an OID4VCI/OID4VP-style JSON envelope.
4. Decode with `decodeCompactPayload(descriptor, encoded)` before verification.

The JSON envelope is transport metadata only. The Compact payload bytes remain
the source used to reconstruct typed values and recompute body roots.

Credential-family packages expose typed helpers around their own generated
descriptors so application code does not depend on generated private descriptor
constants. For example, the current prototype families expose helpers such as
`encodeSecretPassportCredential(...)`, `encodeSecretPassportPresentation(...)`,
and `encodeSanctionScreeningPresentation(...)`.

The transport envelopes use explicit payload names:

- `credential` for the Compact credential body.
- `credentialProof` for the issuer proof over the credential body.
- `presentation` for the Compact presentation body.
- `presentationProof` only when the holder-binding profile requires a separate
  holder-authenticated presentation proof. Hidden holder-secret profiles can
  authenticate the holder through the presentation holder-binding challenge
  response instead.
