# Changelog

All notable changes to this package are documented in this file.

## Unreleased (0.2.0-rc1)

- Accept untyped credential-family input through an assertion boundary and
  report field-specific `CredentialModelError` failures.
- Enforce SemVer 2.0 syntax for family and schema versions, including strict
  prerelease and build identifiers.
- Preserve literal inference for source-authored definitions and expand the
  descriptor validation matrix.
- BREAKING: reduce the public API to generic credential-family, schema, and
  claim metadata with its validation helper.
- Add optional human-readable names and descriptions to family and schema
  descriptors.
- Remove capability and proof-artifact descriptors, package-composition
  manifests, codec ports, and their validators.
- Remove semantic profile, deployment assembly, provider catalog, runtime family
  discovery, and aggregate business-decision APIs. Applications and credential
  family repositories own those concerns outside this core package.
- Remove error codes used only by the retired high-level resolvers.

## 0.1.0-rc1 - 2026-07-26

- Add protocol-neutral credential-family definitions.
- Add schema, capability, artifact, and composition descriptors.
- Add credential and presentation codec ports.
- Add validation helpers and family-neutral errors.
- Publish the package as ESM for Node.js, TypeScript, and browser consumers.
