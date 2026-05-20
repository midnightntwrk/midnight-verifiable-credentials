# `credentials-protocol` Production Checklist

Status: operational guide for real deployments of the reference orchestration
layer.

This checklist is intentionally short. It captures the minimum decisions an
integrator must make before claiming production-shaped hidden-holder or
blinded-secret protocol behavior around
[`packages/components/orchestration/protocol`](../../packages/components/orchestration/protocol/README.md).

Current reference implementation:

- [`credentials-protocol-reference-path.md`](./credentials-protocol-reference-path.md)
- if you need one concrete shipped pattern rather than a checklist, start there

## 1. Randomness

Do not ship the default randomness source.

Required:

- provide an explicit `ProtocolRandomnessSource`
- generate challenge hashes, issuer nonces, blinding factors, and signing
  nonces from a cryptographically strong source
- document which runtime or HSM boundary owns that generation
- current shipped Node reference:
  - `NodeCryptoRandomnessSource`

Fail closed rule:

- if the deployment cannot supply a production randomness source, do not claim
  production protocol hardening

## 2. Durable state

Do not rely on the in-memory store if restart or delayed delivery matters.

Required:

- provide a persistent `ProtocolStateStore` or a codec-backed byte store
  adapter
- persist:
  - pending offers
  - pending requests
  - pending submissions
  - finalized replay/idempotency outcomes when replay behavior matters
  - holder-side stored credentials if the holder agent must survive restart

Required semantics:

- stable collection names and key encoding
- typed serialization across process boundaries
- predictable delete behavior
- collection scans or storage-native equivalents for TTL/count-based pruning
- restrictive filesystem permissions for the backing state roots
  - for example `umask 0077` and service-owned `0700` directories
- current shipped Node reference:
  - `createNodeFileBackedProtocolStateStore(...)`
  - `createStableJsonProtocolStateStore(...)`

## 3. Retention and replay

Replay behavior must be deliberate.

Required:

- decide whether finalized outcomes are retained by TTL, count, both, or not
  at all
- document what happens after retention expiry:
  - re-evaluate the request or submission
  - or reject as unknown/expired
- document whether duplicate submissions and duplicate outcomes are expected to
  replay the prior result
- current shipped reference example:
  - explicit holder restart-safe credential recovery
  - secret-holder presentation outcome replay across verifier restart

## 4. Time and expiry

Reference defaults are not a production time policy.

Required:

- supply explicit `currentDay` where offer/request lifetime matters
- supply explicit `currentTimeMs` where presentation timeout or max-age policy
  matters
- document the clock source and skew tolerance

## 5. Revocation/status

This package is not yet a final protocol-level revocation standard.

Required:

- document whether the deployment uses:
  - no status
  - authority-attested status proofs
  - revoked-set non-membership helper flows
- document who supplies accepted registry snapshots or roots
- document freshness policy for those snapshots
- reject revoked credentials as hard VC/VP invalidity rather than as a softer
  business-policy denial

Do not claim:

- final live-root discovery inside Compact
- final in-circuit non-membership semantics
- final wire-level revocation interoperability

## 6. Transport boundary

This package is transport-shaped reference orchestration, not a finished wire
protocol.

Required:

- define the real transport boundary separately
- document message authentication, retry, deduplication, and delivery timeout
  behavior
- document whether the deployment wraps these flows in OIDC, DIDComm, or a
  private transport

## 7. Deployment claim

A production-shaped claim for `credentials-protocol` should be narrow.

Acceptable claim:

- "we use the repository reference orchestration layer with an explicit
  production randomness source, persistent protocol state, defined replay
  retention, and documented status freshness assumptions"

Do not claim:

- "the repository protocol package is production-ready by default"
- "hidden-holder revocation interoperability is finished"
- "the default reference adapters are enough for production"
