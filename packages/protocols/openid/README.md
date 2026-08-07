# Midnight Credentials OpenID Domain Schemas

> Maturity: `reference`
> Package class: `dist`

Status:

- reference-stage profile implementation (incubating; not final conformance)

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

This package contains a bounded, transport-neutral TypeScript model for an
incubating Midnight profile subset informed by OID4VCI/OID4VP. It intentionally
does not claim final OpenID conformance and does not implement OAuth, HTTP
routing, DID resolution, cryptography, JWT proof generation, or wallet UI
behavior. The profile schemas cover DCQL-shaped queries, canonical Compact
payload/thread bindings, proof audience/nonce/request-digest inputs,
request-object resolver/verifier seams, format negotiation, deferred issuance,
and protocol errors. Legacy secret-bearing URI helpers remain explicitly
informative and are not part of the safe profile reference surface.

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
- Midnight extension schemas for Compact VC/VP payloads and holder-binding
  commitments.

## Non-goals

- Final OID4VCI/OID4VP interoperability or conformance certification.
- OAuth server/client, HTTP, DIDComm, or request-object fetching implementation.
- DID resolution, signature/cryptographic verification, or wallet UI behavior.
- Durable replay/nullifier consumption; that belongs to the verification and
  session layers. Compact circuits and credential-family packages remain the
  source of truth for verification.

## Compact Value Codec

The package includes `compact-value-v1.base64url`, a small framing format for
Compact runtime `Value` payloads. The intended usage is:

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
