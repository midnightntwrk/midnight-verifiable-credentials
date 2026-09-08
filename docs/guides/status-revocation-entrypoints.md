# Status and Revocation Entry Points

## Start here

1. [Core status specification](../../spec/status.md)
2. [Credential-status semantics](../spec/credential-status.md)
3. [Revocation-registry model](../spec/revocation-registry.md)
4. [Status verification modes](../architecture/status-verification-modes.md)
5. [Midnight status contract](../../packages/registry/status-midnight-contract/README.md)

## Package ownership

| Concern | Owner |
| --- | --- |
| Generic status bindings, policies, and ports | `@midnight-ntwrk/credential-status` |
| Atomic Midnight status state and mutation gate | `@midnight-ntwrk/credential-status-midnight-contract` |
| Least-privilege reads and witnesses | `@midnight-ntwrk/credential-status-midnight-verifier` |
| Controller/delegate authorization ports | `@midnight-ntwrk/credential-status-midnight-authority` |

Credential-family status policy and family-level status tests belong in the
family repository. Business authorization and status-aware application flows
belong in application repositories.

## Validation

```bash
pnpm run test:status-authority-split
./run.sh --light
```
