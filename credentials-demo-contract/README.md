# @midnight-ntwrk/midnight-did-credentials-demo-contract

Demo business contract for the Compact-first VC/VP prototype.

Status:

- prototype

Related docs:

- spec: [`../docs/spec/midnight-credentials.md`](../docs/spec/midnight-credentials.md)
- conformance: [`../docs/spec/conformance.md`](../docs/spec/conformance.md)
- companion guide: [`../docs/guides/midnight-credentials-for-dummies.md`](../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../docs/testing/test-matrix.md`](../docs/testing/test-matrix.md)

## Purpose

This package sits above two layers:

- [`../credentials`](../credentials): generic VC/VP envelope and proof core
- [`../credentials-birth`](../credentials-birth): birth-credential specialization
- [`../credentials-birth-secret`](../credentials-birth-secret): hidden-holder birth-credential specialization with prototype status-aware verification

The package currently contains two demo contract roots:

1. `src/demo.compact`
   - explicit-holder age-gate demo
2. `src/demo-revocation.compact`
   - hidden-holder status-aware age-gate demo using:
     - verifier-supplied `(registryId, revokedRoot)` coordination
     - prototype revoked-set status capability wiring
     - prototype authority-attested status proofs for the current Layer 3 path

## Demo design rule

Demo contracts in this package are intentionally small and business-facing.

They should:

- export the circuits that an integrator would actually call from a business contract flow
- model one capability composition or trust boundary at a time
- stay cheap enough to compile and test in focused CI lanes

They should not:

- export every intermediate verification helper as a standalone public circuit
- turn a demo into a general-purpose test harness
- duplicate lower-layer validation semantics that already live in credential-family packages

When a new capability combination needs an example, the preferred approach is:

- add a new small demo contract root
- keep existing demos narrow
- reuse lower-layer family validation logic internally

The original explicit-holder demo contract models:

1. issuer submits an issued birth credential plus issuer proof
2. contract anchors the issued credential root and the expected holder binding
3. verifier defines a typed presentation request with disclosure, issuer, predicate, and challenge requirements
4. holder later submits a presentation plus holder proof
5. contract checks the holder's private birth-date witness against the committed claim
6. contract verifies `age >= threshold` without disclosing the birth date

The revocation demo contract models:

1. issuer submits an issued hidden-holder birth credential plus issuer proof
2. verifier/application supplies the accepted `registryId` and `revokedRoot`
3. holder submits a hidden-holder presentation plus either:
   - verifier-supplied-root status inputs
   - or an authority-attested status proof
4. contract checks request alignment, status-capability binding, and age predicate satisfaction
5. contract issues a reusable business capability on success

The revocation demo intentionally keeps the presentation verification circuits
internal and exposes the business-facing capability issuance and claim paths.
That keeps the demo honest about how an integrator would typically consume the
Layer 3 surface while avoiding unnecessary proof-key generation cost.

## SSI capabilities exercised

| Capability | Where it appears |
| --- | --- |
| Issuer assertion | `issueBirthCredential(...)` validates the issuer proof against the credential body |
| Holder authentication | `verifyBirthPresentation(...)` validates the holder proof against the presentation body |
| Holder binding | the issued credential stores the expected holder DID method binding |
| Request-driven verification | `verifyBirthPresentationForRequest(...)` enforces a typed verifier request before accepting the presentation |
| Selective disclosure | the presentation can disclose birth-country data with its opening |
| ZK predicate | the contract checks the age predicate from a private birth-date witness |
| Anti-replay | both issuer and holder proofs carry a `challengeHash` |
| Status-aware verification | `src/demo-revocation.compact` demonstrates verifier-supplied-root and authority-attested status-gated verification |

## Build and test

- Compile Compact artifacts: `npm run contract -w credentials-demo-contract`
- Build TS exports: `npm run build -w credentials-demo-contract`
- Run tests: `npm test -w credentials-demo-contract`
