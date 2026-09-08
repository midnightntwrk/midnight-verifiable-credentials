# Changelog

## Unreleased

- Removed unused issuance and presentation protocol choreography from the
  family-neutral Compact source surface.
- Consolidated same-holder circuits into the canonical holder-binding module.
  The package now exposes exactly one standalone Compact root and one
  composition-safe Compact root.

## 0.1.0 - RC2 supported prerelease

- Extracted curated family-neutral Compact VC/VP semantics from the internal
  credentials package.
- Excluded verification-v1, authority contracts, family code, and private
  proving/deployment material.
- Added audited same-holder circuits and semantic vectors.
- Promoted the package into the supported RC2 development surface.
