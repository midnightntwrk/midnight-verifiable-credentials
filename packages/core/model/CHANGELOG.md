# Changelog

All notable changes to this package are documented in this file.

## Unreleased (0.2.0-rc1)

- Bound the public API to protocol-neutral family, schema, capability, artifact,
  composition-manifest, and codec contracts with their validation helpers.
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
