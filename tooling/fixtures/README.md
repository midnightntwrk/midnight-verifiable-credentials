# Release Consumer Fixtures

## Ledger9 signer authorization

`signer-authorization-ledger9-consumer.compact` is compile-only evidence that a
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

The compiler0.36/runtime0.21 profile intentionally retains local decisions and
relayed authority proofs; it does not adopt synchronous DID/Trust Registry calls
just because Ledger9 provides that capability. The renamed fixture replaces
the old Ledger8 name, not its snapshot trust model. The normal consumer gate
uses `--skip-zk`: compilation is not proving or deployment evidence. It does not
implement policy evaluation, relaying, authority rotation, trusted time, or a
concrete VC schema.

## Composed DID-backed VC/VP flow

`composed-did-vc-flow.compact` and the
`credential-did-midnight-consumer` runtime driver are executable evidence for
the packed public package graph. The fixture defines nonempty synthetic claims,
validates its schema definition through `@midnight-ntwrk/credential-model`,
derives the Compact package identifier from an explicit stable package name,
derives the schema identifier from the validated stable schema ID, selects the
Compact compatibility version separately, resolves issuer and holder Midnight
DID methods, signs credential and presentation bodies, and executes the core
plus DID binding composition.

The driver requires exact rejection messages for credential-claim, disclosure,
body-root, issuer, holder, verification-method, public-key, relationship,
proof-context, and signature substitutions. It installs no repository source
and runs outside the checkout. It deliberately contains no protocol, wallet,
network service, product credential implementation, Trust Registry policy, or
deployment code.
