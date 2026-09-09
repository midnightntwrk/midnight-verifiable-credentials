# Changelog

## Unreleased (0.2.0-rc1)

- Reject caller-supplied credential body roots that do not equal the canonical
  root recomputed from the complete credential before issuer-proof validation.
- Bind credential presentations to the exact credential schema and add
  positive and substitution-negative conformance for VC/VP relations, explicit
  holder-proof references, and structural status bindings.
- Added source-neutral issuer/verifier authorization descriptors, signature and
  exact method/key/scope binding circuits, monotonic lifecycle validation, and
  domain-separated Jubjub authority and verifier-request proof contexts without
  introducing Trust Registry or datetime dependencies.
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
