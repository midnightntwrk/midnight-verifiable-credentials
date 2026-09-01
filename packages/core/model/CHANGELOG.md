# Changelog

All notable changes to this package are documented in this file.

## Unreleased

- Add independently versioned `CredentialFamilyProfileV1` and
  `CredentialDeploymentAssemblyV1` contracts.
- Add capability-provider catalogs, strict path-specific validators, and the
  exact fail-closed composition resolver.
- Preserve `CredentialFamilyDefinition` compatibility; composition adoption is
  additive and requires explicit profile, assembly, and catalog inputs.
- Add V1 runtime family registry, authenticated public-surface metadata, trust
  verifier injection, and typed fail-closed resolution results for wallets.

## 0.1.0-rc1 - 2026-07-26

- Add protocol-neutral credential-family definitions.
- Add schema, capability, artifact, and composition descriptors.
- Add credential and presentation codec ports.
- Add validation helpers and family-neutral errors.
- Publish the package as ESM for Node.js, TypeScript, and browser consumers.
