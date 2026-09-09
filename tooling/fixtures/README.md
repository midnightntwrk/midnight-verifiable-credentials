# Ledger 8 Signer-Authorization Consumer

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
