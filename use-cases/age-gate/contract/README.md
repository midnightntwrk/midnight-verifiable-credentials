# @midnight-ntwrk/midnight-did-credentials-demo-contract

Concrete age-gate business contract for the Compact-first VC/VP prototype.

Status:

- prototype use-case contract

Tier:

- use-case contract package

Dependency direction:

- depends downward on reusable core, family, and capability packages
- must not be treated as a reusable core API surface
- lower-layer packages must not depend on this demo package

Reusable outside this repo:

- no; copy patterns selectively rather than integrating the package as a core dependency

Surface classification:

- `On-chain only` for `src/demo.compact` and related Compact contract roots
- managed/runtime exports are `Off-chain only` mirrors for tests and integration

Start here:

1. use this package as a concrete age-gate/business-contract consumer of the VC/VP stack
2. do not treat it as the canonical generic API surface; start from
   [`../../../core/primitives/credentials/README.md`](../../../core/primitives/credentials/README.md)
   and the relevant family package first
3. read [`../../../docs/guides/integration-surface-map.md`](../../../docs/guides/integration-surface-map.md)
   before copying demo patterns into production contracts

Related docs:

- spec: [`../../../docs/spec/midnight-credentials.md`](../../../docs/spec/midnight-credentials.md)
- conformance: [`../../../docs/spec/conformance.md`](../../../docs/spec/conformance.md)
- companion guide: [`../../../docs/guides/midnight-credentials-for-dummies.md`](../../../docs/guides/midnight-credentials-for-dummies.md)
- test matrix: [`../../../docs/testing/test-matrix.md`](../../../docs/testing/test-matrix.md)

## Purpose

This package sits above two layers:

- [`../../../core/primitives/credentials/README.md`](../../../core/primitives/credentials/README.md): generic VC/VP envelope and proof core
- [`../../../prototypes/credential-families/birth`](../../../prototypes/credential-families/birth): birth-credential specialization
- [`../../../prototypes/credential-families/birth-secret`](../../../prototypes/credential-families/birth-secret): hidden-holder birth-credential specialization with prototype status-aware verification

The package currently contains two demo contract roots:

1. `src/demo.compact`
   - explicit-holder age-gate demo
2. `src/demo-revocation.compact`
   - hidden-holder status-aware age-gate demo using:
     - same-contract live status verification against a local revoked-handle set
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
   - same-contract live-status witness inputs
   - verifier-supplied-root status inputs
   - or an authority-attested status proof
4. contract checks request alignment, status-capability binding, freshness
   policy, and age predicate satisfaction
5. contract issues a reusable business capability on success

For the same-contract live-status path specifically, the current demo now
models:

- an explicit local live status registry initialization step
- local revocation by live status handle
- hidden-holder verification that rejects revoked handles directly against the
  contract-owned live revoked set
- no external `(registryId, revokedRoot)` snapshot for that path
- an intentionally unauthenticated lifecycle surface for demo/simulator use;
  production deployments should gate local registry initialization and
  revocation writes behind issuer or authority authorization
- the local demo registry can revoke any 32-byte status handle directly; it
  does not currently restrict revocation writes to handles that were issued by
  this contract

For the authority-attested path specifically, the current demo now enforces:

- absolute attestation expiration
- verifier-configured max-age replay window

Those checks apply to the attestation timestamp. They do not prove that the
verifier-supplied `revokedRoot` is the live canonical registry root.

The demo test suite now also normalizes negative status failures into the
shared canonical status error codes from
`@midnight-ntwrk/midnight-did-credentials-status-registry`, using the plain
failure-record projection rather than unpacking verifier error objects by hand,
so the use-case layer asserts the same fail-closed taxonomy as the reusable
verifier helpers and BDD scenarios.

The revocation demo intentionally keeps the presentation verification circuits
internal and exposes the business-facing capability issuance and claim paths.
That keeps the demo honest about how an integrator would typically consume the
Layer 3 surface while avoiding unnecessary proof-key generation cost.

## SSI capabilities exercised

| Capability                  | Where it appears                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Issuer assertion            | `issueBirthCredential(...)` validates the issuer proof against the credential body                                                             |
| Holder authentication       | `verifyBirthPresentation(...)` validates the holder proof against the presentation body                                                        |
| Holder binding              | the issued credential stores the expected holder DID method binding                                                                            |
| Request-driven verification | `verifyBirthPresentationForRequest(...)` enforces a typed verifier request before accepting the presentation                                   |
| Selective disclosure        | the presentation can disclose birth-country data with its opening                                                                              |
| ZK predicate                | the contract checks the age predicate from a private birth-date witness                                                                        |
| Anti-replay                 | both issuer and holder proofs carry a `challengeHash`                                                                                          |
| Status-aware verification   | `src/demo-revocation.compact` demonstrates same-contract live-status, verifier-supplied-root, and authority-attested status-gated verification |
| Status freshness policy     | the authority-attested path adds verifier max-age freshness checks on top of attestation expiration                                            |

## Build and test

- Compile Compact artifacts: `npm run contract -w use-cases/age-gate/contract`
- Build TS exports: `npm run build -w use-cases/age-gate/contract`
- Run tests: `npm test -w use-cases/age-gate/contract`
