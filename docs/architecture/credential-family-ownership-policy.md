# Credential-Family Ownership Policy

Concrete credential families do not belong in this repository.

Each family is independently owned and versioned with its schema, family
configuration, Compact source, generated artifacts, conformance profile, and
family-level tests. Family repositories consume supported packages from this
repository through npm. Until a package is published, workspace-root automation
may distribute an immutable tarball; source imports across repositories are
forbidden.

This repository may retain only synthetic fixtures that test a core invariant
without describing a real credential, issuer, relying party, or business flow.
The fixture must remain private and outside the release graph.

A family repository owns:

- claim schema and disclosure/predicate choices
- family-specific circuits and ZK artifacts
- rendering and localization resources
- product examples and protocol adapters
- release cadence, compatibility, security review, and deployment evidence

This repository owns:

- protocol-independent VC/VP semantics
- reusable Compact primitives and capabilities
- package contracts and status interfaces
- normative specification and conformance vectors

Former in-repository families and use cases are recorded in the
[migration ledger](./credential-family-migration-ledger.md). Git history is the
archive; removed implementations must not be preserved as compatibility
workspaces.
