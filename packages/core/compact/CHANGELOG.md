# Changelog

## Unreleased (0.2.0-rc1)

- Added source-neutral issuer/verifier authorization descriptors, exact
  method/key/scope binding circuits, and a domain-separated Jubjub authority
  proof context without introducing Trust Registry or datetime dependencies.
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
