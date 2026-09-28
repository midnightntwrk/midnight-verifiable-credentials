# Release Consumer Fixtures

## Ledger 8 signer authorization

`signer-authorization-ledger8-consumer.compact` is compile-only evidence that a
downstream contract can compose the packed `@midnight-ntwrk/credential-compact`
public entrypoint. It is not a deployable application or a Trust Registry.
The fixture instantiates the generic VC module with empty claims, explicit
holder binding, and no status binding so issuer authorization is derived from a
complete credential rather than caller-supplied credential fields.

The fixture demonstrates two source profiles:

1. **Local/no registry:** the deployer supplies the initial descriptor. Trust in
   that descriptor comes from the consuming application's deployment process.
2. **Authority-backed:** a relayer submits a descriptor and authority proof. The
   contract verifies the proof and monotonic lifecycle update before replacing
   local state. The authority may be local application governance or a Trust
   Registry synchronization key.

The consumer stores decisions because Ledger 8 cannot synchronously call a DID
or Trust Registry contract. It deliberately does not implement policy
evaluation, relaying, authority rotation, trusted time, or a concrete VC family.

## Composed DID-backed VC/VP flow

`composed-did-vc-flow.compact` and the
`credential-did-midnight-consumer` runtime driver are executable evidence for
the packed public package graph. The fixture defines nonempty synthetic claims,
validates their family descriptor through `@midnight-ntwrk/credential-model`,
derives each Compact identifier as SHA-256 of `<id>@<version>`, resolves
separate issuer and holder Midnight DID methods, signs credential and
presentation bodies, and executes the core plus DID binding composition.

The driver requires exact rejection messages for credential-claim, disclosure,
body-root, issuer, holder, verification-method, public-key, relationship,
proof-context, and signature substitutions. It installs no repository source and runs outside the
checkout. It deliberately contains no protocol, wallet, network service,
product credential-family implementation, Trust Registry policy, or deployment
code.
