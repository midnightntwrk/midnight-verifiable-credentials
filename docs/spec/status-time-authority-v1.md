# Status and Trusted-Time Authority Contract V1

Status: normative design gate for B1, B2, B3, and final verification profiles.
It does not describe the current prototype as production-ready.

Related decisions and specifications:

- [`../decisions/0011-status-registry-namespace-and-authority.md`](../decisions/0011-status-registry-namespace-and-authority.md)
- [`../decisions/0012-trusted-time-and-status-freshness.md`](../decisions/0012-trusted-time-and-status-freshness.md)
- [`./verification-contract-v1.md`](./verification-contract-v1.md)
- [`./revocation-registry.md`](./revocation-registry.md)
- [`./status-error-taxonomy.md`](./status-error-taxonomy.md)
- [`../testing/status-time-authority-v1-test-design.md`](../testing/status-time-authority-v1-test-design.md)

## Scope and current status

This contract defines:

- registry namespace and deployment binding;
- controller, delegate, mutation, rotation, freeze, and migration authority;
- registry version, root, idempotency, and audit invariants;
- accepted status-root and non-membership authority;
- trusted-time modes and freshness evidence;
- privacy and failure classification; and
- implementation gates for B1, B2, and B3.

The checked-in `revocation-registry.compact` does not satisfy this contract. It
currently has unauthenticated initialization and mutation, begins an initialized
registry at version `0`, and cannot assert equality to the live Merkle root.
`status-proof-protocol.compact` accepts caller-supplied `currentTime`. Those
surfaces remain prototype and preflight-only until the relevant gates below are
implemented.

## Terms

- **Controller:** DID authority allowed to change registry governance.
- **Operator:** controller or scoped delegate allowed to revoke a status handle.
- **Registry namespace:** immutable semantic identity for one issuer/family/
  schema-major status domain.
- **Deployment:** one contract instance implementing that namespace.
- **Registry version:** monotonic accepted status-state version, starting at `1`.
- **Authority generation:** monotonic controller/delegate policy generation.
- **Audit sequence:** monotonic accepted governance/status transition sequence.
- **Accepted root:** a root whose namespace, deployment, authority, and
  freshness are authenticated for the selected verification profile.
- **Trusted time:** time or ordered position obtained from a profile-approved
  authority source, not a caller assertion.

## Hashing and encoding

Every record below is a fixed-order Compact record whose first fields are:

```text
domain: Bytes<32>, version: Uint<16>
```

`domain` is the SHA-256-derived `Bytes<32>` tag of the exact ASCII identifier
listed for the record. Version is `1`. Structured digests use
`persistentHash<RecordV1>`. Implementations MUST NOT use JSON serialization,
variable-width concatenation, or inferred field order.

Before B1 merges, the repository must identify the supported Compact encoding
surface and check in Compact/TypeScript cross-runtime vectors for every B1
record. B2 and B3 add vectors for their records before their own merges.

All digest and integer fields are fixed width. Every `Bytes<32>` value described
as required rejects the canonical zero value unless this specification states an
explicit absence rule.

## Registry slot, namespace, and identity

The canonical coordinator and nonce-free slot are:

```text
StatusRegistrySlotCoordinatorV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, coordinatorContractDigest: Bytes<32>,
  coordinatorDeploymentDigest: Bytes<32>, governancePolicyDigest: Bytes<32>
}

StatusRegistrySlotV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, issuerDidDigest: Bytes<32>,
  credentialFamilyDigest: Bytes<32>, schemaMajor: Uint<32>,
  statusType: Uint<8>, productGovernanceDigest: Bytes<32>,
  slotCoordinatorDigest: Bytes<32>, statusAuthorityPolicyDigest: Bytes<32>
}

StatusAuthorityPolicyV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, issuerDidDigest: Bytes<32>,
  credentialFamilyDigest: Bytes<32>, schemaMajor: Uint<32>,
  statusType: Uint<8>, allowedStatusModeMask: Uint<16>,
  controllerRulesDigest: Bytes<32>, attestorRelationship: Uint<8>,
  delegationRulesDigest: Bytes<32>, migrationRulesDigest: Bytes<32>,
  productGovernanceDigest: Bytes<32>
}
```

Their ASCII domains are `midnight:vc:status-registry-slot-coordinator:v1` and
`midnight:vc:status-registry-slot:v1`; the policy domain is
`midnight:vc:status-authority-policy:v1`. The coordinator is an accepted singleton
deployment for the product governance domain, not a registry-selected helper.
The policy fixes stable controller/delegation/attestation/migration constraints;
mutable role roots must remain within those rules. The slot binds exact
coordinator and policy persistent hashes, and:

```text
registrySlotId = persistentHash<StatusRegistrySlotV1>(slot)
```

The final verifier accepts only the coordinator digest initialized in its
deployment policy or authenticated by the selected product-governance evidence.
An unknown coordinator is `invalid` when available evidence proves the mismatch
and `indeterminate` when required coordinator authority cannot be authenticated.

V1 status type `1` is `revoked-set`. Unknown values are malformed. Schema major
is the product's canonical non-zero major version, not a parser-derived string.

An independently deployed registry instance is:

```text
StatusRegistryNamespaceV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, registryGeneration: Uint<64>,
  registryInstanceNonce: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-namespace:v1` and `registryId` is its
`persistentHash`. Generation starts at `1`. The nonce is unique and generated
with a CSPRNG. It distinguishes lineage instances but does not make an instance
canonical for the slot.

The deployment binding is:

```text
StatusRegistryDeploymentV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, registrySlotId: Bytes<32>,
  registryId: Bytes<32>,
  contractAddressDigest: Bytes<32>, deploymentManifestDigest: Bytes<32>,
  artifactManifestDigest: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-deployment:v1`. A registry proof must
bind both `registryId` and the accepted deployment digest. Migration creates a
new deployment binding and never mutates a credential's original registry id.

The issuer-authenticated activation proposal and canonical coordinator state are:

```text
StatusRegistrySlotStateV1 {
  domain: Bytes<32>, version: Uint<16>,
  slotCoordinatorDigest: Bytes<32>, registrySlotId: Bytes<32>,
  activationSequence: Uint<64>, activationIntentDigest: Bytes<32>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>
}

StatusRegistryActivationIntentV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, slotCoordinatorDigest: Bytes<32>,
  registrySlotId: Bytes<32>, expectedPreviousSlotStateDigest: Bytes<32>,
  expectedPreviousActivationSequence: Uint<64>,
  expectedPreviousActivationReceiptDigest: Bytes<32>,
  proposedActivationSequence: Uint<64>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, predecessorRegistryId: Bytes<32>,
  predecessorDeploymentDigest: Bytes<32>, issuerDidDigest: Bytes<32>,
  issuerMethodDigest: Bytes<32>, issuerRelationship: Uint<8>,
  controllerDidDigest: Bytes<32>, issuerControllerGrantDigest: Bytes<32>,
  migrationIntentDigest: Bytes<32>,
  predecessorFreezeTransitionDigest: Bytes<32>,
  activationNonce: Bytes<32>, trustedTimeEvidenceDigest: Bytes<32>,
  issuedAt: Uint<64>, expiresAt: Uint<64>
}

StatusRegistryActivationReceiptV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, slotCoordinatorDigest: Bytes<32>,
  registrySlotId: Bytes<32>,
  previousActivationSequence: Uint<64>,
  previousActivationReceiptDigest: Bytes<32>,
  resultingActivationSequence: Uint<64>, activationIntentDigest: Bytes<32>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  previousSlotStateDigest: Bytes<32>, resultingSlotStateDigest: Bytes<32>,
  acceptedLedgerAnchorDigest: Bytes<32>,
  acceptedTimeEvidenceDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-registry-slot-state:v1`,
`midnight:vc:status-registry-activation-intent:v1`, and
`midnight:vc:status-registry-activation-receipt:v1`; relationship is
`capabilityInvocation`. The intent is the exact issuer-signed payload and never
contains its own receipt or anchor digest. The canonical ledger slot state is
owned only by the accepted coordinator deployment and keyed by
`registrySlotId`. It atomically compares the expected previous state, sequence,
and receipt before writing the exact resulting state and receipt. The first
activation expects zero state/sequence/receipt and produces sequence `1`; every
later activation increments by exactly one. Initial activation zeros migration
and freeze fields. A migration successor must bind the accepted B1 migration
intent and predecessor freeze transition. The receipt, not an issuer signature
or caller-supplied digest, is the canonical `activationDigest` used elsewhere.
Two valid intents racing from the same predecessor cannot both commit, and a
receipt from another coordinator deployment is invalid. An unavailable receipt
chain is `indeterminate`; two authenticated committed heads under the accepted
coordinator for the same slot/sequence prove invalid ledger or governance state.

Delegating slot control uses:

```text
StatusRegistryControllerGrantV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, activationSequence: Uint<64>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  issuerDidDigest: Bytes<32>, issuerMethodDigest: Bytes<32>,
  issuerRelationship: Uint<8>, controllerDidDigest: Bytes<32>,
  controllerPolicyDigest: Bytes<32>, notBefore: Uint<64>,
  expiresAt: Uint<64>, grantNonce: Bytes<32>,
  trustedTimeEvidenceDigest: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-controller-grant:v1`; it is the exact
payload signed by an active issuer `capabilityInvocation` method. Its
authorization evidence uses the role-grant evidence record defined below. The
controller cannot change the immutable issuer root owner or expand beyond this
grant.

The credential-stable reference is:

```text
StatusRegistryRefV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  issuerDidDigest: Bytes<32>, statusAuthorityPolicyDigest: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-ref:v1`. The reference binds the
issuer root authority and status-attestation policy, not a single long-lived
method, so ordinary method rotation under accepted DID state does not invalidate
every credential. The current prototype
`StatusRegistryRef.authorityVerificationMethodRef` is method-bound; B1 must add
this versioned reference or explicitly reject the default rotation requirement.
The canonical transcript value is exactly:

```text
statusRegistryDigest = persistentHash<StatusRegistryRefV1>(registryRef)
registryRef.statusAuthorityPolicyDigest =
  slot.statusAuthorityPolicyDigest =
  authorityState.statusAuthorityPolicyDigest =
  persistentHash<StatusAuthorityPolicyV1>(statusAuthorityPolicy)
```

No activation receipt, deployment address, or runtime snapshot may be substituted
for this stable credential binding.

## Initialization and authority state

The immutable initialization request is:

```text
StatusRegistryInitializationV1 {
  domain: Bytes<32>, version: Uint<16>,
  slotDigest: Bytes<32>, namespaceDigest: Bytes<32>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, controllerDidDigest: Bytes<32>,
  controllerMethodDigest: Bytes<32>, controllerRelationship: Uint<8>,
  issuerControllerGrantDigest: Bytes<32>, activationDigest: Bytes<32>,
  initialAuthorityGeneration: Uint<64>, initialRegistryVersion: Uint<64>,
  initializationNonce: Bytes<32>, issuedAt: Uint<64>, expiresAt: Uint<64>,
  trustedTimeEvidenceDigest: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-initialization:v1`.
`controllerRelationship` is code `3`, `capabilityInvocation`.
`initialAuthorityGeneration` and `initialRegistryVersion` are exactly `1`.

The final contract recomputes `registryId` and the immutable status-authority
policy digest, checks the deployment binding, and verifies the slot, coordinator
activation receipt, and initialization digests. The issuer DID is the slot's root
owner. If controller DID equals issuer DID,
`issuerControllerGrantDigest` is zero; otherwise the controller grant is signed
by an active issuer `capabilityInvocation` method and binds exact slot,
registry, deployment, controller, policy, and activation sequence. The
initialization authorization itself uses an active controller method with the
required relationship and accepted DID state. It is bound to the deployed
contract and cannot initialize another deployment. Initialization
must be part of authenticated deployment or a one-time circuit that consumes
`initializationNonce` atomically. There is no public choose-your-own-controller
fallback.

Signature verification MUST constrain the proof public key to the key material
of that exact active DID method. Matching a caller-supplied method reference
while accepting a different caller-supplied public key is not authentication.
The current generic `Proof` primitive does not establish that provenance by
itself, so B1 depends on the accepted DID-key evidence path.

The public authority state is:

```text
StatusRegistryAuthorityStateV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, issuerDidDigest: Bytes<32>,
  controllerDidDigest: Bytes<32>, controllerRelationship: Uint<8>,
  controllerPolicyDigest: Bytes<32>, statusAuthorityPolicyDigest: Bytes<32>,
  authorityGeneration: Uint<64>,
  mutationDelegatePolicyRoot: Bytes<32>,
  statusAttestationPolicyRoot: Bytes<32>, frozen: Boolean,
  successorMigrationDigest: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-authority-state:v1`.
`statusAuthorityPolicyDigest` equals the immutable policy digest in the slot and
credential registry reference; governance transitions cannot replace it.
`successorMigrationDigest` is zero until migration is accepted. A zero value in
either policy root means no delegates for that distinct role. `frozen` blocks
status mutations but does not erase or invalidate the last accepted root. The
controller identity is the DID plus policy, not the method that happened to sign
initialization.

## Delegation and mutation authorization

A delegate grant is:

```text
StatusRegistryDelegateGrantV1 {
  domain: Bytes<32>, version: Uint<16>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  authorityGeneration: Uint<64>, controllerDidDigest: Bytes<32>,
  controllerMethodDigest: Bytes<32>, controllerRelationship: Uint<8>,
  delegateDidDigest: Bytes<32>,
  delegateMethodDigest: Bytes<32>, delegateRelationship: Uint<8>,
  operationMask: Uint<16>, notBefore: Uint<64>, expiresAt: Uint<64>,
  productPolicyDigest: Bytes<32>, grantNonce: Bytes<32>
}
```

Its domain is `midnight:vc:status-registry-delegate-grant:v1`.
`controllerRelationship` and `delegateRelationship` are
`capabilityInvocation`. V1 operation bit `0` permits `revoke`; all other bits are
reserved and must be zero. The controller signs the complete grant digest. A
grant is valid only under the exact current authority generation, current
mutation delegate policy root, accepted DID method provenance, and accepted time
evidence.

Status attestation uses a separate grant:

```text
StatusAttestorGrantV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, authorityGeneration: Uint<64>,
  controllerDidDigest: Bytes<32>, controllerMethodDigest: Bytes<32>,
  controllerRelationship: Uint<8>,
  attestorDidDigest: Bytes<32>, attestorRelationship: Uint<8>,
  statusModeMask: Uint<16>, notBefore: Uint<64>, expiresAt: Uint<64>,
  attestationPolicyDigest: Bytes<32>, grantNonce: Bytes<32>
}
```

Its domain is `midnight:vc:status-attestor-grant:v1`. The controller relationship
is `capabilityInvocation`; the default attestor relationship is
`assertionMethod`. The controller signs the complete grant digest. It grants only
status statements and cannot authorize registry mutation or governance. A
mutation delegate grant likewise cannot authorize a status attestation.

Grant provenance and role-policy membership use these exact records:

```text
StatusRoleGrantLeafV1 {
  domain: Bytes<32>, version: Uint<16>, role: Uint<8>,
  authorityGeneration: Uint<64>, grantDigest: Bytes<32>
}

StatusRoleGrantEvidenceV1 {
  domain: Bytes<32>, version: Uint<16>, role: Uint<8>,
  grantDigest: Bytes<32>, grantorDidDigest: Bytes<32>,
  grantorMethodDigest: Bytes<32>, grantorRelationship: Uint<8>,
  grantorDidEvidenceDigest: Bytes<32>, signatureProofDigest: Bytes<32>,
  rolePolicyRoot: Bytes<32>, membershipProofDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-role-grant-leaf:v1` and
`midnight:vc:status-role-grant-evidence:v1`. Roles are `1` issuer-controller,
`2` mutation delegate, and `3` status attestor. The grantor signature is verified
over the exact typed `grantDigest`, and its proof public key must equal the key
material of the named active DID method. For mutation and attestor roles,
`rolePolicyKey` is exactly
`persistentHash<StatusRoleGrantLeafV1>(leaf)`, and the corresponding policy root
is the canonical root of the B1-selected Compact Merkle map containing
`rolePolicyKey -> 1`. The leaf role and generation must equal current authority
state. Duplicate keys and any value other than `1` are malformed. B1 must pin the
exact Compact map primitive, empty root, path encoding, and cross-runtime vectors
before implementation. The issuer-controller role has zero policy root and
membership proof because the active issuer method is the root authority. A
self-minted grant, a grant signed only by a non-controller subject, a leaf in the
other role root, or a valid signature with no current membership proof is
invalid. The sole same-DID exception is controller-as-attestor: the grantor is
the current authenticated controller using `capabilityInvocation`, the attestor
method independently satisfies `assertionMethod`, and the exact grant leaf was
committed through an accepted attestation-policy-root replacement transition.
Matching DIDs alone never bypass signature, relationship, generation, time, or
membership checks.

Every revocation uses:

```text
StatusMutationAuthorizationV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, authorityGeneration: Uint<64>,
  expectedRegistryVersion: Uint<64>, operation: Uint<8>,
  statusHandleDigest: Bytes<32>, operatorDidDigest: Bytes<32>,
  operatorMethodDigest: Bytes<32>, operatorRelationship: Uint<8>,
  delegateGrantDigest: Bytes<32>, authorizationNonce: Bytes<32>,
  issuedAt: Uint<64>, expiresAt: Uint<64>,
  trustedTimeEvidenceDigest: Bytes<32>
}
```

Its domain is `midnight:vc:status-mutation-authorization:v1`; V1 operation `1`
is `revoke`. `delegateGrantDigest` is zero for the controller and required for a
delegate. The status handle itself is a private or contract-local input where
the selected profile permits; the authorization binds its domain-separated
digest and the circuit proves equality to the inserted value.

The contract verifies, in order and in one transaction:

1. parse the complete authorization, recompute its typed digest and
   `StatusAuthorizationReceiptKeyV1` from registry, deployment, operation class,
   and nonce, then look up its receipt before checking mutable generation,
   version, grant, or time state;
2. if the nonce is present, return the recorded result only when its accepted
   authorization digest is byte-identical; reject same-nonce/different-bytes;
3. for a first submission, require initialized, not frozen, and correct
   namespace/deployment/network;
4. require exact current authority generation and expected registry version;
5. require an active operator DID method with `capabilityInvocation` relationship;
6. require controller equality or a signed, current, scoped, non-expired
   delegate grant with membership in the current mutation policy root;
7. verify authorization signature/proof, nonce, current execution-context time
   bounds, operation fields, and status-handle digest;
8. determine whether the handle is already in the revoked set;
9. for a new handle, insert, increment version and count exactly once, consume
   nonce, and update audit commitment atomically; or
10. for a fresh authorization over an already-revoked handle, consume the nonce
   and commit an `already-revoked` audit transition without changing status
   version, count, or root.

Different bytes under an already-consumed nonce are always rejected. Exact replay
returns the original accepted receipt even after later mutations, authority
rotation, expiry, or freeze; it cannot create a new transition and does not
re-authorize the old operation under current state. A failed or reverted
transaction leaves the nonce, root, version, count, and audit state unchanged.
V1 has no `unrevoke` operation.

## Controller transitions, freeze, and migration

Controller/delegate changes use this exact authorization:

```text
StatusGovernanceAuthorizationV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, registrySlotId: Bytes<32>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  expectedAuthorityStateDigest: Bytes<32>,
  expectedAuthorityGeneration: Uint<64>, operation: Uint<8>,
  operationParametersDigest: Bytes<32>, controllerDidDigest: Bytes<32>,
  controllerMethodDigest: Bytes<32>, controllerRelationship: Uint<8>,
  issuerControllerGrantDigest: Bytes<32>, authorizationNonce: Bytes<32>,
  issuedAt: Uint<64>, expiresAt: Uint<64>,
  trustedTimeEvidenceDigest: Bytes<32>
}

StatusControllerPolicyChangeV1 {
  domain: Bytes<32>, version: Uint<16>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  previousAuthorityStateDigest: Bytes<32>,
  resultingControllerDidDigest: Bytes<32>,
  resultingControllerPolicyDigest: Bytes<32>,
  resultingIssuerControllerGrantDigest: Bytes<32>
}

StatusMutationPolicyRootReplacementV1 {
  domain: Bytes<32>, version: Uint<16>,
  registryId: Bytes<32>, previousAuthorityStateDigest: Bytes<32>,
  previousMutationPolicyRoot: Bytes<32>, resultingMutationPolicyRoot: Bytes<32>
}

StatusAttestationPolicyRootReplacementV1 {
  domain: Bytes<32>, version: Uint<16>,
  registryId: Bytes<32>, previousAuthorityStateDigest: Bytes<32>,
  previousAttestationPolicyRoot: Bytes<32>,
  resultingAttestationPolicyRoot: Bytes<32>
}

StatusRegistryFreezeV1 {
  domain: Bytes<32>, version: Uint<16>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  previousAuthorityStateDigest: Bytes<32>, expectedFrozen: Boolean,
  resultingFrozen: Boolean, freezePolicyDigest: Bytes<32>, freezeNonce: Bytes<32>
}
```

Its domain is `midnight:vc:status-governance-authorization:v1`. Operations are
`1` controller/policy change, `2` mutation-root replacement, `3` attestor-root
replacement, `4` freeze, and `5` migration-intent acceptance; unknown codes are
malformed. The four parameter domains are respectively
`midnight:vc:status-controller-policy-change:v1`,
`midnight:vc:status-mutation-policy-root-replacement:v1`,
`midnight:vc:status-attestation-policy-root-replacement:v1`, and
`midnight:vc:status-registry-freeze:v1`. The current controller signs the exact
typed authorization digest with an active
`capabilityInvocation` method. Authorization nonce lookup follows the same
receipt-first replay rule as mutation authorization. The parameters digest is
the persistent hash of the exact operation-matched record above, or of
`StatusRegistryMigrationIntentV1` for operation `5`, and cannot be a
caller-defined opaque label. The authorization's `issuerControllerGrantDigest`
authenticates the current controller. A controller-policy-change payload names a
separate resulting issuer grant, required exactly when the resulting controller
differs from the issuer. Only the current controller
DID under its current policy can:

- change the controller DID or controller policy;
- replace the mutation-delegate or status-attestation policy root;
- freeze the registry; or
- accept a migration record.

Every parameter record's previous state/root must equal current accepted state.
A controller change preserves role roots/freeze/migration fields unless a
separate authorized operation changes them. Root replacement changes exactly one
role root. Freeze requires `expectedFrozen = false` and `resultingFrozen = true`;
v1 has no unfreeze. The resulting policy state is recomputed in-circuit rather
than accepted as an opaque digest.

Changing controller DID/policy also requires a current issuer-root controller
grant. A delegated controller cannot transfer the issuer's slot to an arbitrary
principal by signing alone.

Each successful governance transition increments `authorityGeneration` and
`auditSequence`. Authorizations and grants from earlier generations become
invalid immediately. DID method deactivation or relationship removal is also
immediately invalid once that DID state is the accepted authority state.
Ordinary method rotation inside the same DID needs no registry transition: a
new active method satisfying policy succeeds and the removed method fails.

The B1 root-independent migration intent is:

```text
StatusRegistryMigrationIntentV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, successorActivationSequence: Uint<64>,
  predecessorRegistryId: Bytes<32>, predecessorDeploymentDigest: Bytes<32>,
  predecessorAuthorityStateDigest: Bytes<32>, predecessorVersion: Uint<64>,
  successorRegistryId: Bytes<32>, successorDeploymentDigest: Bytes<32>,
  continuityMode: Uint<8>, predecessorFreezeTransitionDigest: Bytes<32>,
  migrationPolicyDigest: Bytes<32>, authorityGeneration: Uint<64>,
  migrationNonce: Bytes<32>, acceptedTimeEvidenceDigest: Bytes<32>
}

StatusRegistryMigrationContinuityV1 {
  domain: Bytes<32>, version: Uint<16>,
  migrationIntentDigest: Bytes<32>, predecessorRegistryId: Bytes<32>,
  predecessorDeploymentDigest: Bytes<32>, predecessorVersion: Uint<64>,
  predecessorRoot: Bytes<32>, successorRegistryId: Bytes<32>,
  successorDeploymentDigest: Bytes<32>, successorInitialVersion: Uint<64>,
  successorInitialRoot: Bytes<32>, continuityMode: Uint<8>,
  revokedSetContinuityProofDigest: Bytes<32>,
  predecessorRootTransitionDigest: Bytes<32>,
  successorActivationReceiptDigest: Bytes<32>
}

StatusRegistryMigrationResolutionV1 {
  domain: Bytes<32>, version: Uint<16>,
  predecessorStatusRegistryRefDigest: Bytes<32>,
  migrationIntentDigest: Bytes<32>, migrationContinuityDigest: Bytes<32>,
  successorRegistrySlotId: Bytes<32>, successorRegistryId: Bytes<32>,
  successorDeploymentDigest: Bytes<32>,
  successorActivationReceiptDigest: Bytes<32>, migrationPolicyDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-registry-migration-intent:v1` and
`midnight:vc:status-registry-migration-continuity:v1`; resolution uses
`midnight:vc:status-registry-migration-resolution:v1`. B1 first commits the exact
freeze transition, then accepts a migration intent against that frozen authority
state/version and bound transition. No mutation can interleave after freeze. B1
makes no root-continuity claim. The external governance authorization's
`operationParametersDigest` is exactly the typed migration-intent digest, avoiding
a circular self-reference. Continuity mode `1` is `new-credentials-only`:
the continuity record and proof digest are absent, and existing credentials are
never retargeted. Mode `2` is `monotonic-superset`: B2 requires the continuity
record and reviewed proof that the successor revoked set contains every
predecessor revoked handle. Unknown modes are malformed.

Migration is a two-phase serialization when cross-contract atomicity is not
available: first freeze and commit the predecessor, then activate the successor
from that exact freeze record using the canonical slot compare-and-swap. During
an unavailable or incomplete activation chain, required status is
`indeterminate`. Authenticated simultaneous active writers are `invalid`. A
frozen predecessor is not live status and is accepted only by an explicit
bounded migration-grace policy. Existing-credential use of the successor remains
blocked until B2 continuity is verified.

For an existing credential, the resolution record is the only accepted bridge
from its predecessor `StatusRegistryRefV1` to successor status state. It binds the
original reference digest, accepted intent/continuity proof, exact successor
slot/registry/deployment/activation, and product migration policy. New-credential
bindings and direct predecessor verification do not carry a resolution record.

## Registry state and audit

At B1, an initialized registry publishes root-independent authority state:

```text
AuthenticatedStatusAuthorityStateV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, activationDigest: Bytes<32>,
  registryAuthorityStateDigest: Bytes<32>,
  authorityGeneration: Uint<64>, registryVersion: Uint<64>,
  revokedStatusHandleCount: Uint<64>,
  acceptedMutationAuthorizationCount: Uint<64>,
  acceptedGovernanceAuthorizationCount: Uint<64>,
  authorizationReceiptCommitment: Bytes<32>, auditSequence: Uint<64>,
  auditCommitment: Bytes<32>, frozen: Boolean
}
```

Its domain is `midnight:vc:authenticated-status-authority-state:v1`.
`registryVersion` starts at `1`; `revokedStatusHandleCount` starts at `0`.
The persistent receipt key and immutable replay result are:

```text
StatusAuthorizationReceiptKeyV1 {
  domain: Bytes<32>, version: Uint<16>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  operationClass: Uint<8>, authorizationNonce: Bytes<32>
}

StatusAuthorizationReceiptV1 {
  domain: Bytes<32>, version: Uint<16>, receiptKeyDigest: Bytes<32>,
  authorizationDigest: Bytes<32>, operationClass: Uint<8>, operation: Uint<8>,
  resultCode: Uint<8>, authorityTransitionDigest: Bytes<32>,
  resultingAuthorityStateDigest: Bytes<32>, resultingRegistryVersion: Uint<64>,
  acceptedTimeEvidenceDigest: Bytes<32>
}

StatusReceiptCommitmentStepV1 {
  domain: Bytes<32>, version: Uint<16>,
  previousReceiptCommitment: Bytes<32>, operationClass: Uint<8>,
  acceptedAuthorizationCount: Uint<64>,
  authorizationReceiptDigest: Bytes<32>
}

StatusAuditCommitmentStepV1 {
  domain: Bytes<32>, version: Uint<16>, previousAuditCommitment: Bytes<32>,
  auditSequence: Uint<64>, authorityTransitionDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-authorization-receipt-key:v1`,
`midnight:vc:status-authorization-receipt:v1`,
`midnight:vc:status-receipt-commitment-step:v1`, and
`midnight:vc:status-audit-commitment-step:v1`. The key's operation class makes a
mutation nonce distinct from a governance nonce. The contract stores
`receiptKeyDigest -> StatusAuthorizationReceiptV1` persistently. Exact replay
returns that immutable typed receipt; same key with a different authorization
digest is invalid. Result codes are `1` revoked, `2` already-revoked, and `3`
governance-updated; unknown values are malformed. A response may classify the
call as replay, but it cannot rewrite the stored original result code or state.

Every accepted B1 transition hashes this root-independent record into the
rolling audit commitment:

```text
StatusAuthorityTransitionV1 {
  domain: Bytes<32>, version: Uint<16>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  deploymentDigest: Bytes<32>, activationDigest: Bytes<32>,
  operationClass: Uint<8>, operation: Uint<8>,
  previousAuthorityStateDigest: Bytes<32>,
  resultingAuthorityStateDigest: Bytes<32>,
  previousAuthorityGeneration: Uint<64>,
  resultingAuthorityGeneration: Uint<64>,
  previousRegistryVersion: Uint<64>, resultingRegistryVersion: Uint<64>,
  previousRevokedCount: Uint<64>, resultingRevokedCount: Uint<64>,
  operatorDidDigest: Bytes<32>, operatorMethodDigest: Bytes<32>,
  authorizationDigest: Bytes<32>, acceptedTimeEvidenceDigest: Bytes<32>,
  previousAcceptedMutationAuthorizationCount: Uint<64>,
  resultingAcceptedMutationAuthorizationCount: Uint<64>,
  previousAcceptedGovernanceAuthorizationCount: Uint<64>,
  resultingAcceptedGovernanceAuthorizationCount: Uint<64>,
  previousAuthorizationReceiptCommitment: Bytes<32>,
  previousAuditCommitment: Bytes<32>,
  auditSequence: Uint<64>
}
```

Its domain is `midnight:vc:status-authority-transition:v1`. Operation class `1`
is mutation and `2` is governance; the operation code is interpreted only in
that class. The before/resulting state digests bind the complete
`StatusRegistryAuthorityStateV1`, while the counters and receipt commitments
make accepted mutation and governance authorizations independently auditable.
The authorization digest binds the private status-handle digest and nonce
without publishing the handle digest as a separate stable correlator. The audit
surface MUST NOT include raw status handles, credential bodies, holder
identifiers, claims, or revocation reasons.

The transition's previous/resulting authority state digests hash
`StatusRegistryAuthorityStateV1`, which excludes audit and receipt commitments.
This makes the update acyclic. After computing the transition digest, the
contract creates the authorization receipt and then computes:

```text
resultingAuthorizationReceiptCommitment =
  persistentHash<StatusReceiptCommitmentStepV1>(receiptStep)
resultingAuditCommitment =
  persistentHash<StatusAuditCommitmentStepV1>(auditStep)
```

The step records contain the exact previous commitments, resulting class-specific
accepted count/audit sequence, and receipt/transition digests shown above. Only
then does the contract publish `AuthenticatedStatusAuthorityStateV1` with those
resulting commitments and counters. No record hashes a digest that transitively
contains itself.

B2 adds root authority without making B1 depend on an unavailable in-circuit
root getter:

```text
StatusRootTransitionV1 {
  domain: Bytes<32>, version: Uint<16>,
  authorityTransitionDigest: Bytes<32>, previousRoot: Bytes<32>,
  resultingRoot: Bytes<32>, rootBindingEvidenceDigest: Bytes<32>
}

AuthenticatedRevocationRegistryStateV1 {
  domain: Bytes<32>, version: Uint<16>,
  authorityStateDigest: Bytes<32>, revokedRoot: Bytes<32>,
  rootBindingEvidenceDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-root-transition:v1` and
`midnight:vc:authenticated-revocation-state:v1`. The initialized empty root is
the actual Compact tree root and may be zero only when that is the primitive's
canonical value. Consumers never infer status mode from a zero root. Until B2,
runtime-observed roots do not make the B1 authority state a root-authoritative
verification result.

## Trusted time

### Time modes

| Mode | Code | Authority requirement |
| --- | ---: | --- |
| `none` | `0` | No time-dependent rule; underlying time records/values are absent while transcript evidence hashes canonical `not-required` `EvidenceBindingV1` |
| `ledger` | `1` | Value/position read from accepted ledger execution context |
| `authority-attested` | `2` | Accepted authority statement plus independent ledger freshness anchor |

The supported toolchain must define the exact ledger unit before B3. Different
units are never compared by implicit conversion.

For mode `none`, no `TrustedTimeStatementV1` or `TrustedTimeEvidenceV1` is
constructed. Transcript `trustedTime` is zero, while `timeEvidenceDigest` equals
the persistent hash of the canonical `EvidenceBindingV1` with mode
`not-required` and all authority/subject/anchor/statement/time fields zero.

```text
TrustedTimePolicyV1 {
  domain: Bytes<32>, version: Uint<16>,
  mode: Uint<8>, unit: Uint<8>, authorityDigest: Bytes<32>,
  maximumEvidenceAge: Uint<64>, maximumFutureSkew: Uint<64>,
  minimumSequence: Uint<64>, sourcePolicyDigest: Bytes<32>
}

TrustedTimeStatementV1 {
  domain: Bytes<32>, version: Uint<16>,
  unit: Uint<8>, networkIdDigest: Bytes<32>,
  verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>,
  authorityDidDigest: Bytes<32>, authorityMethodDigest: Bytes<32>,
  authorityRelationship: Uint<8>, timeValue: Uint<64>,
  sequence: Uint<64>, requestChallengeDigest: Bytes<32>,
  issuedAt: Uint<64>, expiresAt: Uint<64>
}

TrustedTimeEvidenceV1 {
  domain: Bytes<32>, version: Uint<16>,
  mode: Uint<8>, unit: Uint<8>, networkIdDigest: Bytes<32>,
  verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>,
  requestChallengeDigest: Bytes<32>, trustedTimePolicyDigest: Bytes<32>,
  statementDigest: Bytes<32>,
  authorityDidEvidenceDigest: Bytes<32>, signatureProofDigest: Bytes<32>,
  previousAcceptedSequence: Uint<64>, previousSequenceStateDigest: Bytes<32>,
  executionLedgerPosition: Uint<64>,
  executionLedgerTime: Uint<64>, executionLedgerAnchorDigest: Bytes<32>
}

TrustedTimeSubjectV1 {
  domain: Bytes<32>, version: Uint<16>,
  verifierContractDigest: Bytes<32>, requestIdDigest: Bytes<32>,
  requestChallengeDigest: Bytes<32>, trustedTimePolicyDigest: Bytes<32>
}

TrustedTimeSequenceKeyV1 {
  domain: Bytes<32>, version: Uint<16>, networkIdDigest: Bytes<32>,
  verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>,
  authorityDidDigest: Bytes<32>, sourcePolicyDigest: Bytes<32>
}

TrustedTimeSequenceStateV1 {
  domain: Bytes<32>, version: Uint<16>, sequenceKeyDigest: Bytes<32>,
  acceptedSequence: Uint<64>, acceptedStatementDigest: Bytes<32>,
  acceptedLedgerAnchorDigest: Bytes<32>
}

LedgerExecutionTimeAnchorV1 {
  domain: Bytes<32>, version: Uint<16>, unit: Uint<8>,
  networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>,
  deploymentDigest: Bytes<32>, executionPosition: Uint<64>,
  executionTime: Uint<64>, validityWindowStart: Uint<64>,
  validityWindowEnd: Uint<64>, executionContextDigest: Bytes<32>
}
```

The domains are `midnight:vc:trusted-time-policy:v1`,
`midnight:vc:trusted-time-statement:v1`, and
`midnight:vc:trusted-time-evidence:v1`; the subject domain is
`midnight:vc:trusted-time-subject:v1`, and the current-context anchor domain is
`midnight:vc:ledger-execution-time-anchor:v1`. Sequence key/state domains are
`midnight:vc:trusted-time-sequence-key:v1` and
`midnight:vc:trusted-time-sequence-state:v1`. `sourcePolicyDigest` binds the
selected ledger primitive/finality policy or attestor trust policy; it is not a
digest of `TrustedTimePolicyV1` itself. For `ledger`, statement, authority DID
evidence, signature proof, and sequence fields are zero; the execution ledger
fields bind the value obtained from the current execution context. For
`authority-attested`, the authority method uses the profile-approved relationship
and signs exactly
`persistentHash<TrustedTimeStatementV1>(statement)`. The evidence record binds
that digest to accepted DID state/key provenance, signature proof, prior
accepted sequence, and current execution-context ledger anchor without putting a
signature digest inside the signed payload.

Every time-dependent authoritative decision, including authority-attested mode,
is accepted only when the final contract checks a value or validity window read
from the current ledger execution context and binds it in
`executionLedgerAnchorDigest`, which must equal the persistent hash of
`LedgerExecutionTimeAnchorV1`. The final circuit constrains every anchor field to
the actual current execution context; a caller-supplied copy is insufficient.
The attested time must fit the policy's age,
future-skew, and expiry bounds relative to that current value. The stored
monotonic sequence is an additional rollback control, not a freshness anchor. A
caller cannot bootstrap it from the same untrusted statement, and a high-sequence
first submission delayed beyond the ledger-relative age bound is invalid.

For authority-attested mode, statement sequence must be greater than both
`minimumSequence` and the stored `previousAcceptedSequence`; the resulting
`TrustedTimeSequenceStateV1` is updated atomically with the protected receipt.
The key scopes state to network, verifier deployment, authority DID, and source
policy. Method rotation inside the same active DID preserves the checkpoint; a
different DID or source policy has a distinct key and requires an explicit
governance-approved migration rather than resetting sequence in place. The
evidence's previous state digest/sequence must equal persistent state. Checked
unsigned arithmetic enforces: a future `issuedAt` or `timeValue` differs from
execution time by at most `maximumFutureSkew`; a non-future value differs by at
most `maximumEvidenceAge`; `issuedAt <= timeValue <= expiresAt`; and execution
time is no later than `expiresAt`. Overflow, underflow, reversed validity window,
or execution outside the context validity window is invalid.

The attestation proof public key must equal the key material of the exact active
DID method and required relationship in accepted evidence. A matching method
reference plus caller-chosen public key is invalid here just as it is for status
attestations and registry authorization.

Process clocks, caller `currentTime`, wallet display time, HTTP dates, and
off-chain observation timestamps never populate `TrustedTimeEvidenceV1` for a
ledger receipt. They are local preflight metadata only.

The final verifier recomputes the policy, subject, statement where present, and
evidence digests and enforces:

```text
transcript.timeMode = trustedTimeEvidence.mode = trustedTimePolicy.mode
trustedTimeEvidence.trustedTimePolicyDigest =
  persistentHash<TrustedTimePolicyV1>(trustedTimePolicy)
trustedTimeEvidence.statementDigest =
  persistentHash<TrustedTimeStatementV1>(trustedTimeStatement) // attested only
timeEvidenceBinding.subjectDigest =
  persistentHash<TrustedTimeSubjectV1>(trustedTimeSubject)
timeEvidenceBinding.stateAnchorDigest =
  trustedTimeEvidence.executionLedgerAnchorDigest
timeEvidenceBinding.statementDigest =
  persistentHash<TrustedTimeEvidenceV1>(trustedTimeEvidence)
transcript.timeEvidenceDigest =
  persistentHash<EvidenceBindingV1>(timeEvidenceBinding)
trustedTimeEvidence.executionLedgerAnchorDigest =
  persistentHash<LedgerExecutionTimeAnchorV1>(executionTimeAnchor)
trustedTimeEvidence.executionLedgerPosition = executionTimeAnchor.executionPosition
trustedTimeEvidence.executionLedgerTime = executionTimeAnchor.executionTime
previousSequenceState.sequenceKeyDigest =
  persistentHash<TrustedTimeSequenceKeyV1>(sequenceKey)
trustedTimeEvidence.previousSequenceStateDigest =
  persistentHash<TrustedTimeSequenceStateV1>(previousSequenceState) // attested only
resultingSequenceState.acceptedSequence = trustedTimeStatement.sequence
resultingSequenceState.acceptedStatementDigest = trustedTimeEvidence.statementDigest
resultingSequenceState.acceptedLedgerAnchorDigest =
  trustedTimeEvidence.executionLedgerAnchorDigest
```

The subject's verifier, request, challenge, and policy equal the transcript and
evidence fields. Network, verifier, deployment, and unit also equal across the
policy/evidence/anchor and current execution context. In ledger mode
`transcript.trustedTime` equals the execution
context time. In authority-attested mode it equals the signed statement's time,
and the statement's network, verifier, deployment, challenge, unit, and authority
must equal the evidence and selected policy. The binding mode is `local-ledger`
or `authority-attested` respectively; its authority and time bounds are the
accepted ledger deployment or exact active time-authority evidence.
For ledger mode, binding `authorityDigest` and `stateAnchorDigest` equal the
accepted execution-anchor digest and binding time bounds are zero. For attested
mode, binding `authorityDigest` equals the policy's accepted authority digest,
and binding `createdAt`/`expiresAt` equal the signed statement bounds.

## Status freshness and evidence binding

V1 freshness policies are exact records, not prose attached to a request:

```text
StatusFreshnessPolicyV1 {
  domain: Bytes<32>, version: Uint<16>,
  mode: Uint<8>, timeUnit: Uint<8>, minimumRegistryVersion: Uint<64>,
  maximumCheckpointAge: Uint<64>, maximumVersionLag: Uint<64>,
  maximumRevocationLatency: Uint<64>, finalityPolicyDigest: Bytes<32>
}

StatusFinalityPolicyV1 {
  domain: Bytes<32>, version: Uint<16>, mode: Uint<8>,
  minimumConfirmations: Uint<64>, ledgerFinalityRulesDigest: Bytes<32>
}

StatusCheckpointFinalityEvidenceV1 {
  domain: Bytes<32>, version: Uint<16>, networkIdDigest: Bytes<32>,
  checkpointDigest: Bytes<32>, checkpointPosition: Uint<64>,
  executionPosition: Uint<64>, confirmationCount: Uint<64>,
  finalityPolicyDigest: Bytes<32>, executionLedgerAnchorDigest: Bytes<32>,
  ledgerInclusionEvidenceDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-freshness-policy:v1`,
`midnight:vc:status-finality-policy:v1`, and
`midnight:vc:status-checkpoint-finality-evidence:v1`. Freshness mode `0` is
`not-required`, mode `1` is `exact-current`, and mode `2` is
`bounded-checkpoint`. `not-required` zeros every remaining field.
`exact-current` requires the exact local state read during the final transaction
and zeros age/lag/latency/finality fields. `bounded-checkpoint` declares non-zero
checkpoint-age and revocation-latency limits, an optional version-lag limit, an
accepted time unit, and a non-zero finality policy.

The product MUST publish the maximum revocation latency implied by its
checkpoint publication interval, finality policy, and maximum checkpoint age.
It cannot market bounded-checkpoint verification as live revocation. Version
ordering alone is not freshness. A non-zero `maximumVersionLag` can be checked
only against the independently accepted comparison version and anchor carried by
the state anchor below. Without that current comparator,
`maximumVersionLag` MUST be zero and only ledger-relative age/finality bounds may
be claimed. An authority-attested anchor cannot satisfy `exact-current` because
its signer cannot prove no later accepted state exists during the transaction.

For `bounded-checkpoint`, checked arithmetic requires:

```text
checkpointTime <= transcript.trustedTime
transcript.trustedTime - checkpointTime <= maximumCheckpointAge
executionPosition >= checkpointPosition
confirmationCount = executionPosition - checkpointPosition
confirmationCount >= finalityPolicy.minimumConfirmations
freshnessPolicy.finalityPolicyDigest =
  persistentHash<StatusFinalityPolicyV1>(finalityPolicy)
stateAnchor.finalityEvidenceDigest =
  persistentHash<StatusCheckpointFinalityEvidenceV1>(finalityEvidence)
```

The age and confirmation boundaries are inclusive. A future checkpoint,
underflow/overflow, reversed position, or evidence outside the current execution
context is invalid. Finality evidence network/checkpoint/position fields equal
the anchor statement and `LedgerExecutionTimeAnchorV1`; its inclusion evidence
must prove the checkpoint is on the ledger history accepted by
`ledgerFinalityRulesDigest`. Finality policy mode `1` is confirmation-count; all
other v1 modes are malformed. Exact-current local state uses zero checkpoint-age
limits and zero external finality evidence because the state is read in the same
transaction.

An accepted root/version pair is a non-circular signed statement plus its proof
evidence:

```text
StatusStateAnchorStatementV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, registrySlotId: Bytes<32>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  activationDigest: Bytes<32>, authorityGeneration: Uint<64>,
  registryVersion: Uint<64>, revokedRoot: Bytes<32>,
  checkpointPosition: Uint<64>, checkpointTime: Uint<64>,
  checkpointDigest: Bytes<32>
}

StatusVersionComparisonAnchorV1 {
  domain: Bytes<32>, version: Uint<16>,
  networkIdDigest: Bytes<32>, registrySlotId: Bytes<32>,
  registryId: Bytes<32>, deploymentDigest: Bytes<32>,
  activationDigest: Bytes<32>, anchoredRegistryVersion: Uint<64>,
  comparisonRegistryVersion: Uint<64>,
  comparisonAuthorityStateDigest: Bytes<32>,
  executionLedgerAnchorDigest: Bytes<32>
}

StatusStateAnchorV1 {
  domain: Bytes<32>, version: Uint<16>, anchorMode: Uint<8>,
  stateAnchorStatementDigest: Bytes<32>, authorityDidDigest: Bytes<32>,
  authorityMethodDigest: Bytes<32>, authorityRelationship: Uint<8>,
  authorityDidEvidenceDigest: Bytes<32>, signatureProofDigest: Bytes<32>,
  attestorGrantDigest: Bytes<32>, roleGrantEvidenceDigest: Bytes<32>,
  statusAttestationPolicyRoot: Bytes<32>,
  trustedTimeEvidenceDigest: Bytes<32>, finalityEvidenceDigest: Bytes<32>,
  comparisonRegistryVersion: Uint<64>, comparisonAnchorDigest: Bytes<32>
}
```

Their domains are `midnight:vc:status-state-anchor-statement:v1`,
`midnight:vc:status-version-comparison-anchor:v1`, and
`midnight:vc:status-state-anchor:v1`. Anchor mode `1` is `local-ledger` and `2`
is `authority-attested`. `stateAnchorStatementDigest` is exactly the persistent
hash of the statement. A local ledger anchor zeros external authority and
signature fields and constrains the statement's root/version to accepted local
state in the current transaction. An attested anchor verifies the active
authority DID method signature over exactly the statement digest, current grant
membership in the status-attestation policy root, and current execution-context
ledger checkpoint/time evidence. When version lag is
bounded, `comparisonAnchorDigest` is exactly the hash of
`StatusVersionComparisonAnchorV1`; every network/slot/registry/deployment/
activation field equals the anchored statement, its authority state is accepted
in the current execution context, and its comparison version equals the wrapper
field. Checked subtraction requires comparison version to be at least anchored
version and no more than `maximumVersionLag` ahead. Otherwise both comparison
fields are zero. A recently signed wrapper around an old or forked root remains
stale when its checkpoint violates policy.

The challenge-scoped subject and complete status statement are:

```text
StatusScopedSubjectV1 {
  domain: Bytes<32>, version: Uint<16>,
  verifierContractDigest: Bytes<32>, requestIdDigest: Bytes<32>,
  requestChallengeDigest: Bytes<32>,
  credentialBindingDigest: Bytes<32>, presentationBindingDigest: Bytes<32>,
  statusRegistryDigest: Bytes<32>, scopedStatusBindingDigest: Bytes<32>
}

StatusEvidenceStatementV1 {
  domain: Bytes<32>, version: Uint<16>,
  profile: Uint<8>, statusMode: Uint<8>, statementKind: Uint<8>,
  networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>,
  deploymentDigest: Bytes<32>, activationDigest: Bytes<32>,
  registrySlotId: Bytes<32>, registryId: Bytes<32>,
  statusRegistryDigest: Bytes<32>, migrationResolutionDigest: Bytes<32>,
  registryVersion: Uint<64>, revokedRoot: Bytes<32>,
  stateAnchorDigest: Bytes<32>, freshnessPolicyDigest: Bytes<32>,
  trustedTimeEvidenceDigest: Bytes<32>, scopedSubjectDigest: Bytes<32>,
  requestChallengeDigest: Bytes<32>, membershipProofDigest: Bytes<32>,
  statusResult: Uint<8>, createdAt: Uint<64>, expiresAt: Uint<64>
}

StatusAttestationEvidenceV1 {
  domain: Bytes<32>, version: Uint<16>,
  statusEvidenceStatementDigest: Bytes<32>,
  registryAuthorityStateDigest: Bytes<32>, authorityGeneration: Uint<64>,
  attestorDidDigest: Bytes<32>, attestorMethodDigest: Bytes<32>,
  attestorRelationship: Uint<8>, attestorDidEvidenceDigest: Bytes<32>,
  attestorGrantDigest: Bytes<32>, roleGrantEvidenceDigest: Bytes<32>,
  statusAttestationPolicyRoot: Bytes<32>, signatureProofDigest: Bytes<32>,
  trustedTimeEvidenceDigest: Bytes<32>
}
```

The domains are `midnight:vc:status-scoped-subject:v1` and
`midnight:vc:status-evidence-statement:v1`; direct attestation evidence uses
`midnight:vc:status-attestation-evidence:v1`. `scopedSubjectDigest` is exactly
`persistentHash<StatusScopedSubjectV1>(subject)`. Its final field is a proof-derived
verifier/challenge-scoped binding to the private credential status handle; it is
never a reusable raw handle or unscoped handle commitment. Statement kind `1` is
`same-contract-live`, `2` is `external-nonmembership`, and `3` is
`authority-attested`. Status result `1` is `not-revoked` and `2` is `revoked`.
`profile` and `statusMode` reuse the exact ADR-0010 v1 code points. Unknown codes
are malformed. `external-nonmembership` requires a real proof digest; other kinds
use zero. A `revoked` statement always produces `invalid/notEvaluated`.

For statement kind `3`, the attestor signs exactly the typed status statement
digest. `StatusAttestationEvidenceV1` proves that signature key is the exact
active DID method, that the signed `StatusAttestorGrantV1` and its role evidence
are current members of the authority state's status-attestation policy root, and
that generation, registry, deployment, role, scope, and trusted-time evidence all
match. A controller acting directly uses an explicit controller-as-attestor
grant in that root; there is no implicit assertion-key bypass. Other statement
kinds do not carry `StatusAttestationEvidenceV1`.

The final verifier computes:

```text
statusEvidenceStatementDigest =
  persistentHash<StatusEvidenceStatementV1>(statement)
```

and enforces all of these equalities in the final verifier:

```text
transcript.statusRegistryDigest =
  statement.statusRegistryDigest =
  persistentHash<StatusRegistryRefV1>(credentialStatusRegistryRef)
transcript.profile = statement.profile
transcript.statusMode = statement.statusMode
statement.registrySlotId = stateAnchorStatement.registrySlotId
statement.registryId = stateAnchorStatement.registryId

stateAnchor.stateAnchorStatementDigest =
  persistentHash<StatusStateAnchorStatementV1>(stateAnchorStatement)
transcript.statusRoot = statement.revokedRoot = stateAnchorStatement.revokedRoot
transcript.statusRegistryVersion =
  statement.registryVersion = stateAnchorStatement.registryVersion
transcript.statusFreshnessPolicyDigest =
  statement.freshnessPolicyDigest =
  persistentHash<StatusFreshnessPolicyV1>(freshnessPolicy)
statement.stateAnchorDigest = persistentHash<StatusStateAnchorV1>(stateAnchor)
statement.scopedSubjectDigest = persistentHash<StatusScopedSubjectV1>(subject)

statusEvidenceBinding.subjectDigest = statement.scopedSubjectDigest
statusEvidenceBinding.stateAnchorDigest = statement.stateAnchorDigest
statusEvidenceBinding.statementDigest = statusEvidenceStatementDigest
statusEvidenceBinding.createdAt = statement.createdAt
statusEvidenceBinding.expiresAt = statement.expiresAt
transcript.statusEvidenceDigest =
  persistentHash<EvidenceBindingV1>(statusEvidenceBinding)
```

The subject record must also equal the transcript's verifier, request,
challenge, credential-binding, presentation-binding, and registry fields. The
statement's network, verifier, deployment, activation, slot, and registry fields
must equal the anchor statement and accepted transcript/deployment/activation
inputs. The credential registry reference's issuer and authority policy must
equal the accepted activation/authority evidence. These equations
are conjunctive; a valid statement, anchor, subject, or binding from another
transcript cannot be spliced into the result.

Registry identity uses exactly one of these paths:

| Path | Required equalities |
| --- | --- |
| Direct | `statement.migrationResolutionDigest` is zero; credential reference slot/id equal statement and anchor slot/id |
| B2 continuity | `statement.migrationResolutionDigest` equals `persistentHash<StatusRegistryMigrationResolutionV1>(resolution)`; resolution predecessor reference digest equals transcript `statusRegistryDigest`; resolution successor slot/id/deployment/activation equal statement and anchor; accepted migration intent, continuity proof, and policy digests all match |

No `new-credentials-only` migration can use the B2 continuity path. The
transcript retains the credential's original predecessor `statusRegistryDigest`;
the typed resolution authorizes only the exact successor anchor for this status
evaluation.

The mode/kind/anchor combinations are exhaustive:

| Transcript status mode | Statement kind | Evidence binding mode | Anchor mode | Required authority digest |
| --- | --- | --- | --- | --- |
| `same-contract-live` | `same-contract-live` | `local-ledger` | `local-ledger` | Accepted authenticated local registry state digest |
| `external-nonmembership` | `external-nonmembership` | `cryptographic-proof` | `local-ledger` | Accepted authenticated local registry state digest |
| `external-nonmembership` | `external-nonmembership` | `cryptographic-proof` | `authority-attested` | Exact typed state-anchor digest with verified signer evidence |
| `authority-attested` | `authority-attested` | `authority-attested` | Local or attested root anchor required by product policy | Exact direct status-attestation evidence digest |

Every other combination is malformed. The local authority digest is the
persistent hash of the accepted `AuthenticatedRevocationRegistryStateV1`; the
attested-anchor authority digest is the statement's exact state-anchor digest.
For direct attestation, `authorityDigest` is exactly
`persistentHash<StatusAttestationEvidenceV1>(statusAttestationEvidence)`. In the
direct mode the evidence record's statement digest equals
`statusEvidenceStatementDigest`, its authority generation/state/policy root equal
current accepted registry authority state, and its grant/key/signature evidence
passes the role rules above.
`createdAt` and `expiresAt` equal the accepted status/time statement bounds.
They are both zero for exact same-contract/local-current evidence and both
non-zero for bounded or direct attested evidence; a mixed zero/non-zero pair is
malformed.

The public key used for an authority-attested signature MUST equal the key
material from the exact active DID method in accepted evidence. Copying the
expected method reference while signing with an attacker key is invalid.

For hidden-holder profiles, `scopedSubjectDigest` and statement inputs are
private or verifier/challenge-scoped as required by the final proof. Runtime
errors, receipts, ledger state, events, logs, and CI artifacts must obey the same
non-disclosure rule as public proof inputs.

## Status acceptance matrix

| Status mode | Root/state authority | Membership authority | Time/freshness | Maximum result authority |
| --- | --- | --- | --- | --- |
| `none` | canonical not-required | canonical not-required | `none` unless another policy requires time | selected profile authority |
| `same-contract-live` | exact local registry state in the transaction | direct live-set rejection or supported local non-membership proof | no snapshot age; ledger time only for expiry/delegation rules | `ledger-local` |
| `external-nonmembership` with local anchor | root/version anchored to locally accepted deployment state | real non-membership proof against that exact root | ledger-derived current state or declared version/time policy | `ledger-local` |
| `external-nonmembership` with attested anchor | accepted authority statement over root/version | real non-membership proof against that exact root | trusted authority-attested time with independent anchor | `ledger-attested` |
| `authority-attested` | accepted status authority statement over root/version and credential-scoped status result | attestation, not Merkle non-membership | trusted authority-attested time with independent anchor | `ledger-attested` |
| observed runtime snapshot | local observation only | local set lookup or helper result | process/observation time | `local-process` |

Root equality without the required membership proof is not
`external-nonmembership`. A version match without root authority is not an
accepted state. A status attestation cannot be relabeled as cryptographic
non-membership. In the attested-anchor external mode, the outer status
`EvidenceBindingV1.mode` is `cryptographic-proof`; the typed
`StatusStateAnchorV1.anchorMode` and its verified authority evidence supply the
nested attested authority. The final result authority is derived from the
selected profile and all accepted direct or nested evidence, never from the
outer status evidence mode alone.

For hidden-holder profiles, public status evidence subjects and statements are
verifier- and challenge-scoped and cannot reveal a stable status handle,
credential root, holder DID, or reusable status-handle commitment. The current
authority-attested prototype does not meet this rule.

## Capability lifetime after status verification

Status is evaluated for a declared authorization lifetime:

| Policy | Code | Requirement |
| --- | ---: | --- |
| `transaction-only` | `1` | Status and protected action execute atomically; no reusable capability survives |
| `continuous-status` | `2` | Every later capability claim rechecks current status before its action |
| `bounded-snapshot` | `3` | Capability expires within the product-approved maximum revocation latency and binds the exact accepted status anchor |

The exact policy record is:

```text
CapabilityStatusLifetimePolicyV1 {
  domain: Bytes<32>, version: Uint<16>,
  mode: Uint<8>, capabilityClassDigest: Bytes<32>,
  statusFreshnessPolicyDigest: Bytes<32>, maximumLifetime: Uint<64>,
  expiryTimeUnit: Uint<8>, capabilityRevocationPolicyDigest: Bytes<32>
}

CapabilityStatusIssuanceBindingV1 {
  domain: Bytes<32>, version: Uint<16>,
  capabilityCoreDigest: Bytes<32>, capabilityClassDigest: Bytes<32>,
  verificationTranscriptDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>,
  statusStateAnchorDigest: Bytes<32>, statusFreshnessPolicyDigest: Bytes<32>,
  lifetimePolicyDigest: Bytes<32>, issuedAt: Uint<64>, expiresAt: Uint<64>
}

CapabilityStatusStateV1 {
  domain: Bytes<32>, version: Uint<16>, capabilityCoreDigest: Bytes<32>,
  capabilityClassDigest: Bytes<32>, statusIssuanceBindingDigest: Bytes<32>,
  lifetimeMode: Uint<8>, issuedAt: Uint<64>, expiresAt: Uint<64>
}
```

Its domain is `midnight:vc:capability-status-lifetime:v1`.
`transaction-only` zeros lifetime/unit/revocation fields.
`continuous-status` binds the exact recheck policy. `bounded-snapshot` requires a
non-zero lifetime no greater than the freshness policy's published maximum
revocation latency and an independently enforceable capability expiry.

The issuance binding domain is
`midnight:vc:capability-status-issuance-binding:v1`; persisted state uses
`midnight:vc:capability-status-state:v1`. `capabilityCoreDigest` hashes the
capability fields excluding status issuance/state digests. The issuance binding
hashes that core plus the transcript, accepted status evidence/anchor, freshness
and lifetime policies, and authoritative issuance/expiry bounds. The persisted
capability state contains both the same core digest and the resulting issuance
binding digest, so neither record contains its own digest.

At issuance and every claim, the contract enforces:

```text
issuanceBinding.verificationTranscriptDigest =
  persistentHash<VerificationTranscriptV1>(issuanceTranscript)
issuanceBinding.statusEvidenceDigest = issuanceTranscript.statusEvidenceDigest
issuanceBinding.statusFreshnessPolicyDigest =
  issuanceTranscript.statusFreshnessPolicyDigest
issuanceBinding.statusStateAnchorDigest = statusStatement.stateAnchorDigest
issuanceBinding.lifetimePolicyDigest =
  persistentHash<CapabilityStatusLifetimePolicyV1>(lifetimePolicy)
capabilityState.statusIssuanceBindingDigest =
  persistentHash<CapabilityStatusIssuanceBindingV1>(issuanceBinding)
```

Core/class/mode/time fields also equal across the two records. `issuedAt` is the
accepted transcript trusted time. Checked arithmetic requires `expiresAt >=
issuedAt`, `expiresAt - issuedAt <= maximumLifetime`, and the same declared time
unit. Bounded-snapshot claims load this exact persisted state and require current
execution-context time not after `expiresAt`; continuous-status claims also
recompute current status under the bound policy before the protected action.
Substituting any field invalidates the claim.

The selected policy and parameters are part of `policyDigest`, exact action
consent, and the verification transcript. A reusable capability MUST use
`continuous-status` unless the product explicitly accepts and publishes the
bounded-snapshot revocation latency. Revoking a credential does not
retroactively undo an already committed transaction-only action.

## Canonical absence rules

V1 uses explicit modes plus canonical zero values. A required value cannot be
silently replaced by zero, and an absent value cannot carry non-zero companion
fields.

| Context | Canonical absence rule |
| --- | --- |
| First slot activation | Expected previous state/sequence/receipt and predecessor/migration/freeze digests are zero; accepted coordinator and resulting state are required |
| Later slot activation | Previous state, sequence, and receipt equal accepted coordinator state; migration successor additionally requires predecessor registry/deployment, migration intent, and freeze transition |
| Issuer is controller | `issuerControllerGrantDigest` is zero |
| Non-issuer controller | `issuerControllerGrantDigest` and valid issuer role-grant evidence are required |
| Controller performs mutation | `delegateGrantDigest` and delegate role-membership proof are zero |
| Mutation delegate performs mutation | `delegateGrantDigest`, signed grant evidence, and membership in the current mutation root are required |
| No mutation/status delegates | Corresponding role policy root is zero; no grant under it is valid |
| `successorMigrationDigest` | Zero until the B1 migration intent/freeze is accepted; then exactly that intent digest |
| `new-credentials-only` migration | Continuity record/proof digest is zero and existing credentials remain predecessor-bound |
| Direct registry evaluation | `migrationResolutionDigest` is zero and credential reference equals statement/anchor registry |
| `monotonic-superset` migration | B2 continuity and resolution records, root transitions, proof, and successor activation receipt are required |
| Time mode `none` | Unit, authority, limits, sequence, statement/typed time evidence, ledger anchor, and transcript trusted-time value are zero; transcript `timeEvidenceDigest` is the non-zero hash of canonical `not-required` `EvidenceBindingV1` |
| Time mode `ledger` | Attested statement, DID evidence, signature proof, and sequence fields are zero; current execution ledger fields are required |
| Time mode `authority-attested` | Signed statement, DID/key evidence, signature proof, scoped prior sequence state, and current execution ledger anchor are required |
| Local status anchor | External authority DID/method/relationship/evidence/signature fields are zero; current local ledger state binding is required |
| Authority-attested status anchor | Authority DID/method/relationship/evidence and current execution-context time anchor are required; it cannot claim exact-current |
| No version-lag claim | `maximumVersionLag`, comparison version, and comparison anchor are zero |
| Bounded version lag | Non-zero limit and independently accepted comparison version/anchor are required |
| Exact-current local status | Checkpoint-age limits and external finality evidence are zero |
| Bounded checkpoint status | Non-zero age/finality policy, typed finality evidence, accepted trusted time, and current execution anchor are required |
| Status mode `none` | Registry/root/version/freshness fields are zero and status evidence is canonical `not-required` |
| `external-nonmembership` | Membership proof digest is required and outer evidence mode is `cryptographic-proof`, regardless of anchor mode |
| `same-contract-live` | `membershipProofDigest` and direct attestation evidence are zero; direct live-set semantics apply |
| Direct `authority-attested` status | `membershipProofDigest` is zero; typed attestation grant/key/signature evidence is required |
| Transaction-only capability | Reusable capability and issuance-binding fields are absent; lifetime/unit/revocation fields are zero |
| Reusable capability | Exact `CapabilityStatusIssuanceBindingV1` and independently enforceable expiry are required |

An authenticated non-zero value in a field required to be absent, or zero in a
required field, is malformed before policy evaluation.

## Failure classification

The final verifier uses `invalid/notEvaluated` when authenticated evidence is
available and proves:

- wrong network, namespace, deployment, issuer, family, schema major, or status
  type;
- inactive, removed, wrong-relationship, expired, revoked, or out-of-scope
  operator authority;
- wrong authority generation or expected registry version;
- consumed nonce with different bytes, stale/forked root, invalid proof, or
  proven revocation;
- expired/future/rollback time evidence, stale status evidence, or policy
  violation; or
- malformed migration, audit, or transition binding.

It uses `indeterminate/notEvaluated` when a required DID state, trust decision,
registry state, root proof, non-membership witness, time source, authority
statement, or deployment evidence cannot be obtained or authenticated. Missing
authority never becomes valid-with-warning.

## Implementation gates

### Before B1: authenticated registry authority

- B3 or another reviewed authoritative authorization-time surface is merged;
- confirm supported constructor or one-time authenticated initialization path;
- identify the accepted DID state/relationship/key-material verification surface;
- implement and policy-bind the canonical slot coordinator, compare-and-swap
  state, and separate activation intent/receipt;
- implement exact slot, namespace, deployment, issuer controller grant,
  stable status-authority policy, initialization, stable registry reference,
  signed role grants/evidence,
  governance operation payloads, governance and mutation authorizations,
  authorization receipts/commitments, authority state, root-independent
  transition, and migration-intent records with cross-runtime vectors;
- make receipt-first replay lookup, expected-version, nonce consumption,
  mutation/governance transition, and audit atomic;
- confirm persistent nonce/result lookup support;
- prove ledger-bound event support or implement the gap-detectable rolling audit
  commitment;
- implement rotation, relationship removal, deactivation, delegation expiry,
  freeze, idempotency, race, rollback, and migration negative tests; and
- remove or unmistakably mark unauthenticated production exports.

### Before B2: accepted root and non-membership

- identify a supported in-circuit live-root getter/equality primitive;
- identify and implement a supported Merkle non-membership primitive or proof
  composition;
- bind the credential-private status handle to the exact accepted root without
  public stable identifiers;
- implement root transition, typed comparator, state-anchor, direct status
  attestation, checkpoint finality, status-evidence, migration resolution, and
  capability-issuance records and any monotonic-superset migration continuity
  proof accepted for existing credentials;
- cover empty, singleton, boundary, malformed-path, stale-root, wrong-root,
  wrong-registry, and concurrent-update vectors; and
- record Compact complexity and proof-latency baselines.

### Before B3: trusted time

- identify a supported ledger time/slot/ordered-position primitive and exact
  unit, or document `ledger` mode as unavailable;
- define any authority-attested time authority and typed mandatory current
  execution-context ledger anchor;
- implement monotonic checkpoint, rollback, future-skew, expiry, max-age,
  scoped sequence-state, overflow, and unit-confusion tests; and
- remove caller-supplied time from every authoritative result path.

### Before A3: final verification profiles

- B1, and whichever of B2/B3 the advertised profile needs, are merged;
- DID/trust/deployment authority dependencies are available;
- the status/time evidence records map exactly into
  `VerificationTranscriptV1`; and
- the full profile/evidence/status/time matrix and authority downgrade suite
  pass.
