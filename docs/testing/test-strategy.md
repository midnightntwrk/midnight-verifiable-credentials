# Test Strategy

Tests follow ownership boundaries and protect the protocol-independent core.

## Test levels

1. Package unit tests validate models, codecs, status policies, adapters, and
   Compact wrapper behavior.
2. Compact tests validate circuits, generated bindings, artifact ownership, and
   TypeScript/Compact parity.
3. Conformance tests execute normative positive and negative vectors.
4. Package-consumer tests install packed supported packages outside the
   workspace and exercise public exports.
5. The synthetic composition fixture proves that core packages compose without
   a product or transport layer.

## Excluded tests

Credential-family behavior, OIDC/DIDComm exchange, wallet UX, application
policy, browser/mobile flows, deployment environments, and Docker integration
are tested by the repositories that own those surfaces.

## Gate

```bash
./run.sh --light
```

The gate runs workspace policy, lint, build, typecheck, conformance, package
tests, and packaging without product integration infrastructure. See the
[test matrix](./test-matrix.md) for the command map.
