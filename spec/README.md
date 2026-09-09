# Midnight Verifiable Credentials Core

Version: `0.2-draft`

Status: normative working draft

This directory defines the protocol-independent Midnight VC/VP core. The
TypeScript and Compact packages in this repository are the reference
implementation. Conformance data lives in [`../conformance/`](../conformance/).

The key words `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` are
normative requirements.

## Documents

- [Terminology and glossary](./terminology.md)
- [Data model](./data-model.md)
- [Proof semantics](./proof-semantics.md)
- [Canonical encoding](./canonical-encoding.md)
- [Holder binding](./holder-binding.md)
- [Signer authorization](./signer-authorization.md)
- [Status](./status.md)
- [Security considerations](./security-considerations.md)
- [Privacy considerations](./privacy-considerations.md)
- [Conformance](./conformance.md)

## Scope

The specification owns generic family-definition metadata, VC/VP envelopes,
proof semantics, holder-binding and status-binding primitives, canonical
Compact-value encoding, and conformance requirements for implemented
operations.

It does not define issuance, presentation, or verification protocols;
transports; OIDC; DIDComm; DApp Connector APIs; wallets; persistence;
credential-family schemas; UI rendering; deployment; or application policy.
Consumer repositories compose those concerns around the core primitives.

## Change rule

A normative change MUST update the affected document, the operation mapping in
[`../conformance/manifest.json`](../conformance/manifest.json), and applicable
positive and negative vectors. It also requires explicit maintainer review.
