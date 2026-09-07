# Synthetic contractor-access operator guide

## Purpose and actors

Northstar Safety Board issues Avery Chen's synthetic safety credential. Northstar Credential Operations controls its status. Harbor Plant Access Control requests a DCQL presentation and grants one shift authorization only after Verification V1 commits the decision and replay nullifier atomically.

## Runbook

1. Run `pnpm --dir packages/use-cases/status-openid/evidence test:evidence` for the focused lifecycle, negative, restart, security, and documentation evidence.
2. Run `pnpm run ci:status-openid-evidence` for lint, typecheck, build, tests, and the clean-consumer import.
3. Inspect correlated audit events by `correlationId`; events name only the profile, stage, result, and operator-safe reason.
4. Exercise `active`, `revoked`, `unavailable`, `stale`, and `forged-root` status scenarios before changing policy fixtures.
5. Restore serialized storage into a new adapter instance and confirm issuance idempotency, OpenID replay rejection, and one atomic business decision.

## Deployment seams and outage response

| Seam | Production obligation | Fail-closed response |
| --- | --- | --- |
| process | Isolate issuer/wallet/verifier workers and authenticate IPC | no decision |
| network/request object | TLS, host allow-list, DNS pinning, redirect denial, byte limit | reject request |
| proof | independently operated Compact proof and verification adapter | no decision |
| storage/restart | transactional durable replay, issuance, checkpoint, and decision records | no issuance or decision |
| key custody | non-exportable issuer key, exact key id, rotation/audit controls | no issuance |
| status | authenticated exact registry/deployment/root/version | deny or indeterminate |
| trusted time | ledger-authenticated source and monotonic checkpoint | deny or indeterminate |
| observability | correlation without credential, proof, holder secret, or key material | alert and quarantine unsafe sink |

An exact issuance retry returns the stored bytes; changed bytes under the same idempotency key conflict. A repeated presentation is rejected by OpenID replay storage. A repeated committed decision returns the existing transaction without a second business mutation.

## Evidence boundary

The checked-in actors and policy are synthetic. This package demonstrates production-shaped evidence, not production approval. Local conformance proves only this implementation and fixture set; local conformance is not external interoperability. Operators must obtain external wallet/server interoperability, security assurance, deployment approval, key-management review, and live SLO evidence separately.
