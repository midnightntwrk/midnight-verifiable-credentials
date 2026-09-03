# @midnight-ntwrk/status-openid-production-evidence

> Maturity: `demo`
> Package class: `dist`

This private use-case package is the second independently qualifying production-shaped evidence composition in the #487 stack. It is intentionally independent of the University evidence.

## Actors and business outcome

- **Issuer:** Northstar Safety Board
- **Holder:** Avery Chen (synthetic contractor)
- **Status operator:** Northstar Credential Operations
- **Verifier/operator:** Harbor Plant Access Control
- **Outcome:** atomically grant one synthetic shift-access authorization only after an active safety credential passes OID4VP/DCQL and Verification V1.

The runner follows request → OID4VCI 1.0 Final issuance → authenticated live status and trusted-time freshness → OID4VP 1.0 Final/DCQL presentation → Verification V1 → atomic business decision. All claims and identifiers are synthetic.

## Public seams

The package resolves its semantic profile/deployment with `@midnight-ntwrk/credential-model`, validates OpenID through `@midnight-ntwrk/midnight-did-credentials-openid`, reads authenticated status through the split status contract/verifier packages, verifies trusted ledger time through `@midnight-ntwrk/credential-proofs`, derives request replay nullifiers and submits through the Verification V1 executor in `@midnight-ntwrk/midnight-did-credentials`.

It exposes injected process, network/request-object, proof, storage/restart, key-custody, status, trusted-time, replay/idempotency, atomic-decision, and observability seams. Defaults are deterministic synthetic evidence adapters, never production infrastructure.

## Claims and limitations

This is **production-shaped evidence**, not production approval. Passing the local fixture and clean-consumer suites means **local conformance** to this repository profile; local conformance is not external interoperability. No external wallet, issuer, verifier, proof service, status registry, or conformance lab was run. The evidence package is private and is not a publication candidate.

See [operator-guide.md](operator-guide.md) and [threat-model.md](threat-model.md).
