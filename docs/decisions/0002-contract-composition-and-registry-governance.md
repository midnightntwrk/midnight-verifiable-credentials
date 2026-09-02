# ADR-0002: Contract composition and registry governance

- Status: Accepted
- Date: 2026-07-15
- Owners: VC, DID, trust-registry, and credential product maintainers
- Supersedes: none
- Reconciled by: [Credential-family ownership policy](../architecture/credential-family-ownership-policy.md) (issues #374/#378)

## Context

A credential family defines claim and proof semantics. Issuance, revocation,
trust authorization, verification policy, and business actions have different
owners and state lifecycles. Treating one deployable "default smart contract"
as all of these things would make reuse look simple while coupling governance,
status data, issuer authorization, and verifier policy.

Pure Compact family modules also produce no prover, verifier, or ZKIR artifacts.
Those artifacts exist only after a family is composed into a deployable
contract.

## Decision

A credential family is a pure, compile-time Compact library. It owns canonical
claim roots, schema validation, disclosure structures, predicates, holder
binding, and reusable verification constraints. It does not own ledger state or
a deployment.

Issuers sign credentials off-chain by default. A credential product may ship
reviewed contract composition recipes for the following independent roles:

- an optional credential-registration or anchoring contract after issuer-local
  issuance when a ledger record is a product requirement;
- an authenticated status registry;
- a verifier or business contract that consumes a presentation and performs an
  action; and
- an optional authority/governance contract for product-specific policy.

Under the vocabulary accepted by
[ADR-0015](./0015-vc-family-profile-vocabulary-and-boundaries.md), the former
“issuance contract” or “ledger-backed issuance” role means credential
registration or anchoring after issuer-local construction and signing.
Ledger-native credential construction/signing is not admitted by this ADR's
initial architecture and would require a separate decision.

The default status topology is one authenticated registry per issuer and
schema major version. A shared multi-issuer registry is allowed only when the
product defines issuer namespaces, mutation authorization, audit events,
governance, suspension, migration, and failure containment. It is not the
default.

The Midnight trust registry authorizes roles and discovers approved schema,
artifact, and deployment references. It does not become the owner of credential
status state or mutable artifact binaries. DID state establishes active keys
and verification relationships. VC contracts must bind issuer signatures to an
active DID method with the required `assertionMethod` relationship and bind
verifier or holder keys to their required relationships.

Every state-changing operation must have an explicit authority check. Time,
status roots, trust epochs, and replay protection used by an authoritative
verification must be derived from or committed to accepted ledger evidence,
not accepted as unconstrained caller input.

## Consequences

- The same family can be composed into different issuers and verifier products
  without duplicating its proof semantics.
- Deployments and ZK artifacts are correctly attached to final contracts, not
  pure libraries.
- Shared registries remain possible, but their larger privacy and compromise
  blast radius must be accepted explicitly.
- Product repositories need conformance tests proving their selected
  composition preserves the family constraints and authority model.

## Rejected alternatives

- **One universal default contract:** conflates reusable semantics with mutable
  deployment policy and creates a governance bottleneck.
- **Trust registry owns revocation:** authorization metadata and high-volume
  credential status have different privacy and lifecycle requirements.
- **Unauthenticated issuer-managed registry:** any caller could revoke or reset
  status state.

## Follow-up

Authentication, DID relationship binding, trusted time, status-root binding,
and product contract templates are P0 work in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).


## Repository ownership reconciliation (2026-07-30)

This ADR governs what a complete product composition may contain; it does not
make a concrete family a product. Concrete families remain private prototypes
with family-local tests, while production-shaped compositions are documented
under `packages/use-cases/` and require the explicit graduation gates in the
ownership policy. No family is graduated by this reconciliation.
