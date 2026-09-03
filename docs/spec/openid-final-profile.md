# Midnight OpenID Final profile v1

Status: strict repository profile (locally conformant subset; not certification)

Normative protocol versions:

- [OpenID for Verifiable Credential Issuance 1.0 Final](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-final.html)
- [OpenID for Verifiable Presentations 1.0 Final](https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html)

This profile implements ADR-0007 under the identifier
`org.midnight.credentials.openid.v1`. “Final” describes the pinned upstream
protocol documents. It does not claim certification, every optional feature of
either protocol, or a successful run against an independent wallet.

## OID4VCI requirements

A Midnight credential request MUST:

- select `midnight_compact_vc` and one credential configuration;
- use OID4VCI Final's `proofs` container with exactly one supported `jwt` or
  `attestation` key and one or more proofs;
- require an injected cryptographic proof verifier to derive and confirm the
  expected issuer/credential-endpoint audience, fresh `c_nonce`, and exact
  request-object digest for every proof;
- carry mandatory holder and session bindings; and
- pass an injected Bearer-token validator, consent verifier, expiry check, and
  atomic replay-store consumption before processing.

The OpenID layer does not parse or validate family-owned credential bytes.

## OID4VP and DCQL requirements

DCQL is query functionality **inside OID4VP**, not a third protocol. A strict
Midnight request MUST contain DCQL and MUST NOT also contain Presentation
Exchange descriptors. Every Midnight DCQL credential query selects
`midnight_compact_vc` and requires cryptographic holder binding. A response's
`vp_token` is an object keyed by exactly the required DCQL query IDs, with one
or more presentations for every key; null, scalar, top-level array, unrelated,
missing, and extra-key results are rejected.

Requests and responses use `direct_post` and bind `client_id`, nonce, request
digest, callback state, connector-authenticated origin, exact HTTPS
`response_uri`, session, canonical
transcript digest, consent digest, issued time, and expiry. OID `state` remains
callback correlation and is not interchangeable with the nonce.

## Request objects, redirects, and SSRF

Request objects are fetched only through injected HTTP and DNS seams. The
strict helper requires an exact allow-listed HTTPS host, no credentials or
fragment, global-unicast-only resolved addresses (including rejection of
special-use IPv4/IPv6 and private IPv4-compatible/mapped forms), a
transport-reported peer address
from that approved set (to reject DNS rebinding), no redirects, and a streaming
byte ceiling enforced by the transport before returning the bounded response,
an accepted JWT media type, a non-expired audience-bound reference, and a
SHA-256 digest over the exact response bytes. Signature/JAR verification is an
injected verifier responsibility. Deployments MUST provide an atomic durable
replay store; the included in-memory store is test/reference evidence only.

## Canonical family and decision boundary

The OpenID package's structural adapter consumes `@midnight-ntwrk/credential-exchange`
canonical family messages without adding a forbidden package dependency. It
preserves family/schema versions, message kind, media type, and payload bytes
exactly. It delegates verification to the injected family or #499 authority-bound
verifier and returns the result unchanged. Consequently,
#502 aggregate decision-set bytes/results may be transported but are not parsed,
weakened, or redefined by OpenID.

Family packages remain protocol-independent. Generic VC validity, status,
trust, time, replay-nullifier, and aggregate-decision semantics remain with
their canonical owners.

## Evidence and limitations

Local evidence:

- `pnpm --dir packages/protocols/openid test:conformance`
- OpenID unit tests for lifecycle and malformed/ambiguous proof, DCQL,
  descriptor, replay, substitution, expiry, redirect, and SSRF cases
- exchange adapter tests for exact-byte round trips and delegated results

`src/conformance/fixtures/manifest.json` records the pinned sources and clearly
labels the fixtures as local profile vectors. Every negative definition names a
conformant positive base and one field mutation; the runner reconstructs the
negative and first asserts that its unmodified base passes. Fixture kinds are
validated explicitly and unknown kinds are rejected. These are not third-party
certification vectors.

An external runner is provided:

```bash
pnpm --dir packages/protocols/openid interop:external -- \
  --config operator-config.json --output external-evidence.json
```

The runner rejects redirects, records endpoint statuses and response-body
digests, and marks a lane passed only for a synchronous `200` completion object
identifying the implementation, protocol, accepted/verified result, and artifact.
It can validate configuration with `--dry-run`. The checked-in
`external-interop-status.json` says `not-run`: this repository environment has
no independently operated issuer-wallet/verifier-wallet automation endpoints.
No external interoperability success is claimed until a real runner-produced
artifact identifies the independent implementation and reports both lanes
passed.

`direct_post.jwt` remains outside this first strict subset until a JARM verifier
is wired; it is rejected rather than silently treated as unprotected
`direct_post`. DIDComm v2 and WACI remain optional future decisions. This
profile makes no blanket compatibility claim for either.
