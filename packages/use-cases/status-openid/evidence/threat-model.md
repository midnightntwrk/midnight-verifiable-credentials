# Status/OpenID evidence threat model

Scope: the synthetic Northstar Safety Board → Avery Chen → Northstar Credential Operations → Harbor Plant Access Control flow.

| Threat | Control and negative evidence | Residual production obligation |
| --- | --- | --- |
| OID4VCI proof substitution | exact audience, c_nonce, request digest, session, consent, and expiry validation | external authorization-server interop |
| OID4VP request substitution | exact client, nonce, origin, response URI, state, request digest, and DCQL result ids | external wallet/verifier interop |
| request-object SSRF or redirect | HTTPS/allow-list/public-IP pinning, no redirects, content-type and size checks | production DNS/TLS implementation review |
| replay | durable OpenID replay keys plus Verification V1 request nullifier | retention and multi-region transaction design |
| issuance retry conflict | exact digest idempotency; changed bytes conflict | durable transactional implementation |
| revoked credential | authenticated registry state returns revoked and prevents Verification V1 | live registry availability/SLO |
| unavailable status | indeterminate, no business mutation | operator retry and outage policy |
| stale status root | trusted ledger time enforces a 60-second snapshot policy | finalized ledger-time adapter |
| forged root | recomputation rejects root mismatch before presentation decision | contract/deployment authentication |
| proof outage/forgery | injected verifier fails closed | audited Compact prover/verifier service |
| storage or process outage | exception before committed receipt; restart state is serialized | atomic database/ledger adapter |
| key-custody compromise | isolated non-exporting key-id/sign interface; key/log leak tests | reviewed HSM/KMS, rotation, incident response |
| observability leak | correlated stage/outcome records exclude credential proofs and key material | production sink access and retention policy |

This is production-shaped evidence, not production approval. The suite establishes local conformance; local conformance is not external interoperability. External wallets, issuer/verifier implementations, status infrastructure, live proof systems, and production key custody remain untested and require separate evidence.
