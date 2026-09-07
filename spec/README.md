# Midnight Verifiable Credentials Core

Version: `0.2-draft`

Status: normative working draft

This directory defines the protocol-independent Midnight VC/VP core. The
TypeScript and Compact packages in this repository are the reference
implementation. Conformance data lives in [`../conformance/`](../conformance/).

The key words `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` are
normative requirements.

## Documents

- [Terminology](./terminology.md)
- [Data model](./data-model.md)
- [Configuration](./configuration.md)
- [Canonical encoding](./canonical-encoding.md)
- [Issuance](./issuance.md)
- [Presentation](./presentation.md)
- [Verification](./verification.md)
- [Holder binding](./holder-binding.md)
- [Status](./status.md)
- [Security considerations](./security-considerations.md)
- [Privacy considerations](./privacy-considerations.md)
- [Conformance](./conformance.md)

## Scope

The specification owns canonical credential configuration, VC/VP objects,
issuer/holder/verifier ceremonies, holder binding, generic status semantics,
canonical Compact-value encoding, and conformance requirements.

It does not define transports, OIDC, DIDComm, DApp Connector APIs, wallet
sessions, persistence, credential-family schemas, UI rendering, deployment,
or application policy. Those layers carry canonical objects without changing
their security meaning.

## Change rule

A normative change MUST update the affected document, the operation mapping in
[`../conformance/manifest.json`](../conformance/manifest.json), and applicable
positive and negative vectors. It also requires explicit maintainer review.

