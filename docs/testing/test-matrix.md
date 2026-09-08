# Test Matrix

The repository tests reusable core semantics and package contracts. Product,
credential-family, transport-protocol, browser, mobile, and Docker end-to-end
tests belong in consumer repositories.

| Surface | Main checks |
| --- | --- |
| Workspace inventory | `check:workspace-catalog`, `check:workspace-manifests` |
| Dependency boundaries | `check:package-boundaries`, `test:workspace-boundary-policy` |
| Specification | `check:core-conformance`, `test:core-conformance` |
| Compact generation | `test:compact-artifacts`, `fixtures:validate` |
| Core package behavior | workspace package `test` tasks |
| Type safety | workspace package `typecheck` tasks |
| Status authority split | status contract, verifier, and authority package tests |
| Release surface | `check:release-package-contract`, release consumer tests, package tarballs |
| Documentation | `docs:links` |

## Local gate

```bash
./run.sh --light
```

This is the required non-Docker repository gate. Focused iteration can use
`./run.sh lint`, `./run.sh typecheck`, `./run.sh build`, `./run.sh test`, or
`./run.sh conformance`.

## Coverage rule

Tests live with the package that owns the behavior. Shared tooling tests belong
under `tooling/scripts`. The only retained example is a minimal synthetic
composition fixture; it must not become a product or protocol test suite.
