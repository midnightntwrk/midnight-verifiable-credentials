# University production-shaped evidence threat model

This document qualifies **production-shaped evidence** only. It is **not production or security approval**, does not authorize University as a credential product, and does not replace deployment-specific threat modelling, cryptographic review, penetration testing, privacy assessment, or operations assurance.

University v1 remains a direct/public-claim use case under decision #267. Tests use policy-driven synthetic people and organisations; no real personal data belongs in these fixtures, transcripts, checkpoints, or logs.

## Boundary and assets

The evidence path keeps the existing actors and business outcome: a student requests issuance, the university issues a diploma, the holder answers a company or mall presentation request, and a verifier produces a local Verification V1 decision. Protected assets are issuer/holder signing keys, credential/proof material, protocol correlation and replay state, profile identity, checkpoint integrity, and the final decision.

The machine-readable control map is [`production-evidence-threat-model.json`](production-evidence-threat-model.json). Its eight entries are executable contract data checked by the protocol test suite.

## Trust assumptions

- The checked-in profile, package lock and synthetic policy files are trusted test inputs.
- The Compact simulator and local package builds provide functional evidence, not independent cryptographic assurance.
- `offchain-public-v1` means a local attempt. It does not mean ledger submission, commitment or finality.
- The in-memory custody provider demonstrates application/custody separation but is not an HSM or KMS.
- The explicit process/network/storage ports demonstrate fail-closed replacement seams without inventing external infrastructure.

## Controls and residual risks

| Threat | Control | Residual risk |
| --- | --- | --- |
| Profile or package confusion | `credential-model` validates the profile and resolves the exact family, package exports, providers and Compact entrypoint. OpenID canonical messages are round-tripped through the package root. | No package publication or third-party interop is asserted. |
| Process crash or network outage | Typed boundaries are fault-injected and failures are correlated and fail closed. | No OS supervisor, TLS, DNS, latency or remote availability evidence. |
| Prover failure or presentation tamper | Injected proof backend failures abort; bounded tamper policies produce invalid/not-evaluated Verification V1 results. | Simulator evidence is not circuit assurance. |
| Checkpoint corruption or restart loss | Versioned JSON checkpoints are compatibility checked and exercised at all three flow boundaries. | No durable database, encryption, backup or concurrency evidence. |
| Key disclosure | Party/application records and audit events contain no key field; signer material resolves only through custody. | Process-memory custody lacks hardware isolation, rotation and production access policy. |
| Replay or duplicate side effects | Duplicate issuance is idempotent; duplicate presentation threads are rejected and observed. | This is not distributed or ledger-atomic replay protection. |
| Sensitive observability | Typed events admit correlation, profile, policy, stage and outcome only. | Operators remain responsible for sink access and retention. |

## Review boundary

A clean result means the named synthetic controls passed at the tested commit. It must be reported as `production-shaped-evidence-only` with `productionApproved: false`. Any language implying deployment readiness, SLA, production support, security certification, real-person use, or package publication is a defect.
