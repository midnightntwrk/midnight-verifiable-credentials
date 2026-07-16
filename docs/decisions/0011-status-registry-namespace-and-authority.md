# ADR-0011: Status registry namespace and authority

- Status: Accepted
- Date: 2026-07-17
- Owners: VC, DID, trust-registry, security, and credential product maintainers
- Refines: ADR-0002

## Context

The current `credentials-status-registry` contract is a prototype. Its public
`initializeRegistry` circuit lets the first caller choose `registryId`, and its
public `revokeStatusHandle` circuit has no authority check. The contract binds a
caller-supplied state snapshot to its identifier and version, but not to the
live Merkle root. These surfaces are useful for capability experiments and are
not a production authority model.

Status changes are security decisions. An attacker who can initialize a
registry, substitute its namespace, revoke arbitrary handles, replay a stale
authorization, or continue using a rotated key can invalidate credentials or
create misleading status evidence. A registry identifier by itself does not
prove who controls the registry or which credential family it serves.

ADR-0002 selected one authenticated registry per issuer and schema major as the
default topology. This decision fixes the authority and lifecycle rules needed
to implement that topology.

## Decision

### Derive a semantic namespace

Every v1 product status domain has one canonical `StatusRegistrySlotV1`
containing:

- network identifier;
- issuer DID;
- credential-family identifier;
- schema major version;
- status type;
- product-governance identifier.

`registrySlotId` is the domain-separated hash of that nonce-free record. A
registry instance adds a unique CSPRNG nonce and lineage generation to derive
`registryId`. The slot binds an accepted singleton coordinator deployment. An
issuer-authenticated activation intent proposes the mapping, and that
coordinator's ledger compare-and-swap receipt over canonical slot state selects
exactly one active registry/deployment. A random nonce, another coordinator, or
a second issuer-signed intent therefore cannot create a second canonical fork for the same
issuer/family/schema-major slot. Neither a caller-selected label nor a contract
address alone is a valid namespace.

The default topology is one namespace per issuer, credential family, and schema
major, with one authenticated active mapping. A shared multi-issuer registry is
a separate profile and MUST define
issuer sub-namespaces, mutation isolation, governance, audit, migration, and
compromise containment before use.

### Eliminate first-caller initialization

A production registry MUST NOT expose unauthenticated first-caller
initialization. The immutable namespace and initial controller are either:

1. committed by authenticated deployment/constructor inputs; or
2. installed by a one-time deployment authorization that is bound to the
   network, deployment, contract, namespace, controller, nonce, and expiry.

The issuer is the root owner of its slot. The initialization authorization must
prove an active issuer DID `capabilityInvocation` method and either name that
issuer as controller or carry an issuer-signed controller grant. It also binds
the one-active-registry activation sequence and predecessor. Merely carrying a
`VerificationMethodRef` or verifying a controller signature is insufficient.

The first authenticated live registry version is `1`. Version `0` remains the
canonical absence value used by verification profiles with status mode `none`.

### Separate controller and operator authority

The controller DID governs authority state. Controller operations include
changing the controller DID or controller policy, granting or revoking
delegates, freezing a registry, and authorizing migration. They require an active
controller
`capabilityInvocation` method and increment `authorityGeneration`.

Ordinary key rotation inside the same controller DID is enforced through
accepted DID state and does not require a registry transition. A removed method
fails immediately and another active method satisfying controller policy can
act, so rotating one key cannot brick the registry.

A revocation operator may be the controller or a scoped delegate. A delegate is
bound to an exact registry namespace, allowed operation set, validity interval,
and optional product policy. It cannot rotate governance, expand its own scope,
or act after revocation, expiry, DID method removal, DID deactivation, or
authority-generation change.

Mutation delegation and status-attestation delegation are separate roles and
policy roots. A revoke-only delegate cannot issue status attestations, and a
status attestor cannot mutate registry state unless it has an independent
mutation grant.

Every mutation authorization binds at least:

- domain and version;
- network, deployment, contract, and registry identifiers;
- current `authorityGeneration` and expected registry version;
- operation and exact status-handle digest;
- authorizing DID and verification method;
- authorization nonce; and
- issuance and expiry constraints under accepted time evidence.

The contract verifies authorization immediately before mutation. Off-chain
resolution may prepare evidence but cannot establish ledger authority.

### Keep revocation append-only and race-safe

V1 supports `revoke` and does not support `unrevoke`. The mutation checks the
expected version and authorization nonce in the same transaction as the Merkle
insert and version increment. A stale competing mutation fails and must be
rebuilt against current state.

An exact replay of a previously accepted authorization returns its recorded
result without changing state. Reusing its nonce for different bytes is
rejected. A fresh authorized request for an already-revoked handle commits an
`already-revoked` no-op: it consumes its nonce and advances audit state, but does
not increment registry version/count or change the root.

### Bind audit and migration state

Each accepted B1 transition commits an authority audit record containing the
operation, registry and authority generations, counts, operator method,
authorization digest, and accepted time evidence digest. B2 adds a root
transition record bound to that authority transition once supported in-circuit
root access exists. The
authorization digest binds the private status-handle digest without publishing
it as a separate correlator. Raw status handles, credentials, claims, holder
identifiers, and revocation reasons are outside the core audit record.

If the target Compact/runtime version cannot emit an event with these fields,
the registry maintains a domain-separated rolling audit commitment. Adapter
output is useful only when its digest is committed to ledger state and sequence
gaps are detectable; an unbound returned object is not durable audit evidence.

Migration never silently retargets existing credential bindings. B1 freezes the
predecessor and commits a root-independent migration intent. B2 binds the exact
predecessor/successor roots and any monotonic-superset continuity proof required
for existing credentials. New credentials may bind an activated successor.
Existing credentials remain bound to the predecessor unless their product
profile defines and proves the B2 continuity path. Predecessor freeze precedes
successor activation. An unavailable or incomplete activation chain is
`indeterminate`; authenticated evidence of simultaneous active writers is
`invalid`, not a choice between favorable forks. A frozen predecessor cannot
satisfy live freshness indefinitely.

## Consequences

- Current unauthenticated initialization and mutation remain explicitly
  prototype-only and cannot back a supported profile.
- B1 must depend on accepted DID relationship evidence and an exact transaction
  authorization shape.
- Key rotation and delegation are auditable without making a long-lived raw key
  the registry identity.
- Shared registries remain possible but are not an accidental default.
- Version races fail closed instead of accepting an authorization for a
  different registry state.

## Rejected alternatives

- **First caller chooses the registry:** permits namespace squatting and hostile
  ownership.
- **A static public key is the registry identity:** cannot safely represent DID
  rotation, relationship removal, or deactivation.
- **Any issuer key may revoke:** credential assertion and registry capability
  invocation are different authorities.
- **Version check outside the transaction:** leaves a check-then-act race.
- **Mutable registry identifier during migration:** breaks credential binding
  and makes predecessor/successor evidence ambiguous.
- **Trust registry owns status mutations:** role authorization and credential
  status have different state, privacy, scale, and failure domains.

## Follow-up

The normative records, threat model, and B1 merge gates are defined by:

- [`../spec/status-time-authority-v1.md`](../spec/status-time-authority-v1.md)
- [`../testing/status-time-authority-v1-test-design.md`](../testing/status-time-authority-v1-test-design.md)
