# Changelog

## Unreleased

- Preserve Field proof/challenge representation with explicit Jubjub scalar
  conversions required by compiler0.36. Conformance crypto known answers stay
  unchanged; off-curve decoder diagnostics change in runtime0.21. Strict
  workspace/packed consumers pass. A private canonical x/y Field helper at the
  two transient point-hash sites preserves the existing preimage and fixes
  actual signer-composition key generation. Separate pinned native tests prove
  and cryptographically verify all three signer circuits, reject recomputed-
  commitment bad responses in native preprocessing, and reject tampered proofs
  and statements. These bounded tests are not live deployment support.

- Prepare the issue-754 Ledger9 profile: Compact 0.36.0 / runtime 0.21.0,
  measured backend `zkir-3.2.0-rc.2`, and separate public npm Ledger9 identity.
  BREAKING: packed build metadata moves to schema 2, replacing ambiguous
  `ledger` with `backend` and `supportedLedger`. Rebuild downstream artifacts
  and keys together. Strict consumers and bounded native signer proof tests
  pass; see the migration guide for exact evidence and live-support limits.

- Advance the package manifest to the `1.0.0` release base for the planned
  `1.0.0-rc1` candidate; no version is published by this preparation. The schema
  terminology migration itself does not change this package's runtime behavior.

## 0.3.0 - 2026-10-01

- Keep the repository's pnpm requirement development-only so published Compact
  consumers are not coupled to this monorepo's package manager.
- BREAKING: Make typed Compact payload decoding fail closed unless descriptor
  re-encoding reproduces the exact payload, rejecting alternate zero-padded
  chunk widths and lossy descriptor round trips while preserving untyped chunk
  framing.
- Add the supported explicit-holder presentation-proof composition, including
  credential-to-presentation holder equality, signer-reference and accepted-key
  binding, internally derived body-root verification, and substitution-negative
  conformance.
- Require every normative non-codec operation to map back to a supported core
  or extension Compact circuit.

## 0.2.0 - 2026-09-25

- Classified every exported Compact circuit and added fail-closed coverage for
  envelope invariants, verification-method references, proof contexts, and
  credential and presentation body substitution.
- Reject caller-supplied credential body roots that do not equal the canonical
  root recomputed from the complete credential before issuer-proof validation.
- Bind credential presentations to the exact credential schema and add
  positive and substitution-negative conformance for VC/VP relations, explicit
  holder-proof references, and structural status bindings.
- Added source-neutral issuer/verifier authorization descriptors, signature and
  exact method/key/scope binding circuits, monotonic lifecycle validation, and
  domain-separated Jubjub authority and verifier-request proof contexts without
  introducing Trust Registry or datetime dependencies.
- Documented `midnight-did` `0.7.0` as the current downstream adapter
  compatibility baseline while keeping the Compact package DID-independent.
- Bound authority decisions to an explicit consumer/network domain, made
  revocation terminal per authorization ID, validated Jubjub subgroup
  membership, and added a credential-derived issuer authorization helper.
- Hardened all context-specific proofs against invalid verification-method
  references and identity, off-curve, or torsion public-key and nonce points.
- BREAKING: renamed `VerificationMethodRef.didContractAddress` to
  `controllerAddress` so the core can reference DID, registry, or other
  verification-method controllers without choosing a DID method.
- Verification-method validation now rejects zero controller addresses across
  holder and status bindings, and holder equality checks reject invalid refs.
- BREAKING: removed the single-value status enum and no-op no-status validator.
  The smaller `RegistryBoundStatusBinding` layout changes its persistent hash
  from the `0.1.x` package surface.
- Removed the unrelated TypeScript Jubjub scalar helper from the VC package
  surface.
- Removed experimental secret-holder, blinded-holder, pseudonym, and
  same-holder circuits. The package now supports explicit holder binding only.
- Removed unused issuance and presentation protocol choreography from the
  family-neutral Compact source surface.
- Reduced the package to one standalone Compact root and one composition-safe
  Compact root.
- Removed unused schema-discovery descriptors, method-specific legacy holder
  bindings, and three-credential business helpers.
- Removed duplicate `src` copies and redundant TypeScript subpath exports from
  the package tarball; Compact sources remain available through `dist` exports.

## 0.1.0 - RC2 supported prerelease

- Extracted curated family-neutral Compact VC/VP semantics from the internal
  credentials package.
- Excluded verification-v1, authority contracts, family code, and private
  proving/deployment material.
- Added audited same-holder circuits and semantic vectors.
- Promoted the package into the supported RC2 development surface.
