# Changelog

## Unreleased (0.2.0-rc1)

- Removed unused issuance and presentation protocol choreography from the
  family-neutral Compact source surface.
- Consolidated same-holder circuits into the canonical holder-binding module.
  The package now exposes exactly one standalone Compact root and one
  composition-safe Compact root.
- Removed unused schema-discovery descriptors, method-specific legacy holder
  bindings, compatibility pseudonyms, and three-credential business helpers.
- Removed duplicate `src` copies and redundant TypeScript subpath exports from
  the package tarball; Compact sources remain available through `dist` exports.

## 0.1.0 - RC2 supported prerelease

- Extracted curated family-neutral Compact VC/VP semantics from the internal
  credentials package.
- Excluded verification-v1, authority contracts, family code, and private
  proving/deployment material.
- Added audited same-holder circuits and semantic vectors.
- Promoted the package into the supported RC2 development surface.
