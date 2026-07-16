# Status and Trusted-Time Authority V1 Threat Model and Test Design

Status: mandatory negative-test design gate for B1, B2, B3, and A3.

Normative inputs:

- [`../decisions/0011-status-registry-namespace-and-authority.md`](../decisions/0011-status-registry-namespace-and-authority.md)
- [`../decisions/0012-trusted-time-and-status-freshness.md`](../decisions/0012-trusted-time-and-status-freshness.md)
- [`../spec/status-time-authority-v1.md`](../spec/status-time-authority-v1.md)
- [`../spec/verification-contract-v1.md`](../spec/verification-contract-v1.md)

## Security objectives

1. Only the intended issuer/product controller can establish a registry
   namespace and deployment.
2. Only an active controller or exact scoped delegate can mutate status.
3. Authorization cannot cross network, deployment, registry, family, schema,
   operation, authority generation, version, nonce, or time boundaries.
4. Revocation is append-only, race-safe, idempotent, and auditable.
5. Rotation, relationship removal, deactivation, freeze, and migration take
   effect without leaving an old-authority replay path.
6. An accepted status result proves ownership, freshness, and the selected
   membership statement independently.
7. Time-dependent authority never trusts caller or process time.
8. Hidden-holder status evidence does not expose a reusable holder, credential,
   or status identifier.
9. Missing authority is indeterminate; authenticated failure is invalid; no
   failure is upgraded to an authoritative success.

## Assets

- semantic registry namespace and deployment binding;
- controller and delegate authority state;
- revoked-set root, registry version, and status-handle count;
- consumed authorization nonces;
- audit sequence and commitment;
- predecessor/successor migration binding;
- credential-to-registry and status-handle commitment binding;
- status root/non-membership evidence;
- trusted-time policy, evidence, and monotonic checkpoint; and
- verification result authority and downstream protected actions.

## Actors and trust boundaries

| Actor | Trusted for | Not trusted for |
| --- | --- | --- |
| Registry controller | Signed governance within current DID relationship and policy | Bypassing DID state, changing credential bindings, or rewriting history |
| Scoped operator | Exact granted status operations during current scope/generation/time | Governance, self-extension, other registries, or unrestricted mutation |
| Issuer | Credential assertion and product-selected status binding | Implicit registry control without capability authority |
| Holder/wallet | Private credential/status witness and consent | Registry root, current time, mutation authority, or verifier policy |
| Verifier/business contract | Initialized policy and protected action | Inventing status authority or caller time |
| DID authority/state | Active methods, relationships, rotation, deactivation | Status values or registry roots |
| Trust registry | Role/schema/deployment authorization | Owning high-volume status mutations |
| Status/time attestor | Exact signed statement under accepted scope | Ledger-local authority or freshness without an independent anchor |
| Runtime/indexer/transport | Observation and delivery | Canonical ledger state, time, proof validity, or authority upgrades |
| Compact final contract | Final local state checks and atomic transitions | External facts that are not represented by accepted evidence |

The primary boundaries are runtime-to-contract, DID-state-to-registry,
controller-to-delegate, credential-to-registry, registry-to-verifier,
attestor-to-ledger-anchor, and preflight-result-to-ledger-receipt.

## Adversary capabilities

Assume an attacker can:

- call any exported circuit directly and reorder or omit preparation helpers;
- race initialization, mutation, rotation, freeze, and verification;
- copy valid signatures/proofs between networks, deployments, registries,
  schema majors, operations, versions, challenges, and time windows;
- sign a victim issuer's slot/registry fields with an attacker-controlled valid
  controller key and create parallel nonce/deployment forks;
- control every public argument, including `registryId`, roots, versions,
  timestamps, current time, authority references, and migration references;
- replay exact requests after process restart or on another service instance;
- submit same nonce/different bytes and same handle/different authorization;
- withhold, delay, fork, or fabricate runtime/indexer responses;
- compromise a delegate or an old rotated/deactivated key;
- observe public transaction, audit, and proof inputs; and
- cause concurrent status changes between observation, proof construction, and
  transaction execution.

Cryptographic primitives and accepted ledger consensus are assumed sound. Key
compromise while a method is active and correctly authorized is an operational
incident, not something the circuit can distinguish; scope, rotation, freeze,
and audit reduce its blast radius.

## Required invariants

### Namespace and initialization

- `registryId` is recomputed from the exact namespace record.
- Namespace and deployment are immutable after initialization.
- Initialization is authenticated and consumes a deployment-bound nonce once.
- One accepted activation maps each issuer/family/schema-major slot to exactly
  one active registry/deployment.
- A non-issuer controller has an issuer-root grant for that exact activation.
- Initial registry version and authority generation are exactly `1`.
- Empty revoked-set root is the actual initialized tree root.

### Authority and mutation

- Every mutation verifies current DID relationship evidence and current
  `authorityGeneration` inside the transaction.
- Delegate grants are exact-scope, non-transitive, non-self-extending, and
  time-bounded.
- Expected registry version and nonce checks are atomic with the mutation.
- A new unique revocation increments version/count once.
- An exact accepted-authorization replay returns its recorded result and changes
  no state.
- A fresh authorization for an already-revoked handle consumes its nonce and
  advances audit state, but changes no root, status version, or count.
- Failure/revert changes no root, version, count, nonce, audit, or authority
  state.

### Rotation, audit, and migration

- Every governance change increments authority generation and audit sequence.
- Old controller/delegate authorization fails after generation change, DID
  relationship removal, or deactivation.
- Audit transition fields reproduce the before/after state and authorization.
- B1 migration freezes and binds the predecessor at one exact authority state
  and registry version without claiming root continuity.
- B2 migration continuity binds the predecessor/successor roots and proof.
- Migration does not silently retarget existing credential registry bindings.
- Migration accepted for existing credentials proves successor revoked-set
  equality or monotonic superset and never leaves two accepted writers.
- Every audit record is committed to ledger state with gap-detectable sequence;
  adapter output alone is not authority.

### Status and time authority

- Ownership, freshness, and non-membership are separately established.
- Same-contract-live verification uses state read during the final transaction.
- External non-membership proves absence against the exact accepted root.
- Attested status remains `ledger-attested`, never `ledger-local`.
- Caller/process time can produce only local-process preflight metadata.
- Authority-attested time has a current execution-context ledger freshness
  anchor and monotonic rollback protection.
- Required unavailable authority is indeterminate, never approved.

### Privacy

- Hidden-holder public inputs contain no stable status handle, handle
  commitment, credential root, or holder DID.
- Audit records contain no raw credential, holder, claim, or reason data.
- Verifier/challenge-scoped evidence cannot be replayed into another scope.

## Required test suites

### Namespace and initialization (`STA-INIT-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-INIT-001` | First unauthenticated caller attempts initialization | Rejected; no state change |
| `STA-INIT-002` | Valid initialization replayed | Rejected as consumed; original state unchanged |
| `STA-INIT-003` | Change network, deployment, contract, issuer, family, schema major, status type, governance, or instance nonce | Signature/proof or recomputed registry id fails |
| `STA-INIT-004` | Caller supplies a registry id inconsistent with namespace | Rejected before initialization |
| `STA-INIT-005` | Controller method lacks `capabilityInvocation` | Invalid; no state change |
| `STA-INIT-006` | Controller method removed, rotated, or DID deactivated | Invalid against accepted DID state |
| `STA-INIT-007` | Authenticated initialization is expired or future-dated under accepted time | Invalid; no state change |
| `STA-INIT-008` | Initial version/generation is zero or not one | Malformed and rejected |
| `STA-INIT-009` | Empty tree initializes | Version `1`, count `0`, actual canonical empty root |
| `STA-INIT-010` | Two initializations race | Exactly one commits; loser changes no state |
| `STA-INIT-011` | Required DID or trusted-time authority cannot be obtained/authenticated | `indeterminate/notEvaluated`; no state change |
| `STA-INIT-012` | Attacker controller signs a slot naming another issuer without issuer grant | Rejected; no state change |
| `STA-INIT-013` | Same canonical slot activates a second nonce/deployment at the same sequence | `invalid/notEvaluated` against the accepted slot anchor |
| `STA-INIT-014` | Runtime helper reads an uninitialized sentinel contract | `indeterminate/notEvaluated`, never accepted state |
| `STA-INIT-015` | Two issuer-signed activation intents for different deployments compare-and-swap from the same predecessor | Exactly one canonical receipt commits; the loser is rejected |
| `STA-INIT-016` | Activation intent uses stale previous sequence/receipt after another activation | Rejected without changing canonical slot state |
| `STA-INIT-017` | Caller supplies an activation anchor/receipt digest not emitted by canonical slot state | Rejected; issuer signature alone cannot select a head |
| `STA-INIT-018` | Same slot is activated through a different coordinator contract/deployment | Invalid; slot binds one accepted coordinator |

### Mutation authorization (`STA-MUT-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-MUT-001` | Revoke without authorization | Rejected atomically |
| `STA-MUT-002` | Wrong network/deployment/registry/family/schema authorization | Rejected atomically |
| `STA-MUT-003` | Wrong operation or status-handle digest | Rejected atomically |
| `STA-MUT-004` | Operator method lacks `capabilityInvocation` | Invalid; no mutation |
| `STA-MUT-005` | Operator DID/method substituted after signing | Signature/proof failure |
| `STA-MUT-006` | Stale authority generation | Rejected atomically |
| `STA-MUT-007` | Stale expected registry version | Rejected; caller must rebuild |
| `STA-MUT-008` | Exact accepted authorization replayed after restart or on another service instance | Recorded result; no mutation |
| `STA-MUT-009` | Same nonce with different status handle or fields | Rejected as nonce conflict |
| `STA-MUT-010` | Authenticated authorization is expired or future-dated under accepted time | Invalid; no mutation |
| `STA-MUT-011` | Unique authorized revocation | Version/count/audit/authorization receipt increment exactly once; B1 makes no in-circuit root claim |
| `STA-MUT-012` | Concurrent exact duplicate authorizations | One transition commits; the duplicate returns the same recorded result with no second state change |
| `STA-MUT-013` | Empty or malformed handle | Rejected before mutation |
| `STA-MUT-014` | Two valid mutations at same expected version race | Exactly one commits; loser leaves no partial state |
| `STA-MUT-015` | Assertion or protected write fails after checks | All nonce, status, and audit changes roll back |
| `STA-MUT-016` | Fresh authorization targets an already-revoked handle | Nonce/audit advance once; version/count unchanged |
| `STA-MUT-017` | Authorization substitutes caller/process time for required authority | Malformed/local-process attempt; no mutation |
| `STA-MUT-018` | Required DID or trusted-time evidence is unavailable | `indeterminate/notEvaluated`; no mutation |
| `STA-MUT-019` | Registry version, count, authority generation, nonce sequence, or audit sequence would overflow | Rejected without wraparound or partial state |
| `STA-MUT-020` | Exact accepted authorization is replayed after later mutations, expiry, controller rotation, or freeze | Original recorded receipt is returned before mutable-state checks; no transition occurs |

### Delegation and rotation (`STA-AUTH-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-AUTH-001` | Delegate acts without a grant or with wrong grant digest | Rejected |
| `STA-AUTH-002` | Delegate grant is wrong registry/deployment/operation | Rejected |
| `STA-AUTH-003` | Delegate acts before `notBefore` or after expiry | Rejected using trusted time |
| `STA-AUTH-004` | Delegate attempts controller rotation, freeze, migration, or self-extension | Rejected |
| `STA-AUTH-005` | Delegate method relationship removed or DID deactivated | Rejected against accepted DID state |
| `STA-AUTH-006` | Controller rotates a method inside the same DID | New active method succeeds; removed method fails without bricking governance |
| `STA-AUTH-007` | Delegate policy root changes | Generation increments; every old grant fails |
| `STA-AUTH-008` | Old signed mutation replayed after generation change | Rejected regardless of remaining wall-clock validity |
| `STA-AUTH-009` | Registry is frozen | Status mutations fail; last accepted state remains readable |
| `STA-AUTH-010` | Non-controller attempts governance transition | Rejected atomically |
| `STA-AUTH-011` | Controller transfer names another DID without current issuer-root grant | Rejected; existing controller state unchanged |
| `STA-AUTH-012` | Delegate grant lacks membership in current role policy root or uses stale DID evidence | Rejected |
| `STA-AUTH-013` | Revoke-only delegate attempts governance or status attestation, or attestor attempts mutation | Rejected by role separation |
| `STA-AUTH-014` | Non-controller delegate or attestor self-signs a grant naming itself | Rejected; grantor must be current controller with active key provenance |
| `STA-AUTH-015` | Valid signed grant leaf is proved under the other role root or generation | Membership proof fails |
| `STA-AUTH-016` | Governance authorization changes operation parameters after signing | Typed parameters/authorization digest mismatch; no state change |
| `STA-AUTH-017` | Governance transition substitutes previous/resulting authority state or receipt counters | Transition/audit commitment mismatch |
| `STA-AUTH-018` | Governance operation uses another operation's typed parameter record | Operation/parameters domain mismatch; rejected |
| `STA-AUTH-019` | Controller transfer reuses current controller grant as resulting controller grant | Rejected unless resulting controller is issuer; no state change |
| `STA-AUTH-020` | Current controller acts as status attestor | Accepted only with distinct required method relationships and grant leaf committed by attestation-root governance transition |
| `STA-AUTH-021` | Credential reference, slot, or authority state substitutes a different stable status-authority policy | Typed policy digest equality fails |

### Audit and migration (`STA-LIFE-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-LIFE-001` | Accepted mutation transition record is recomputed | Exact before/after state and authorization digest match |
| `STA-LIFE-002` | Change any transition field | Audit commitment/vector mismatch |
| `STA-LIFE-003` | Reordered, omitted, or duplicated audit transition | Sequence/commitment mismatch |
| `STA-LIFE-004` | Audit payload includes raw credential/holder/claim/reason | Surface/privacy test fails |
| `STA-LIFE-005` | Migration names wrong predecessor version/root | Rejected |
| `STA-LIFE-006` | Migration names unapproved successor deployment | Rejected |
| `STA-LIFE-007` | Mutation races predecessor freeze/migration | One serialization wins; no split accepted state |
| `STA-LIFE-008` | Existing credential is verified against successor without product migration proof | Wrong-registry invalidity |
| `STA-LIFE-009` | New credential binds explicitly approved successor | Accepted only under successor namespace/deployment policy |
| `STA-LIFE-010` | Attempt to mutate namespace or registry id in place | Rejected/unrepresentable |
| `STA-LIFE-011` | Successor accepted for existing credentials but omits predecessor revocations | Migration continuity proof fails |
| `STA-LIFE-012` | Authenticated evidence proves predecessor and successor simultaneously writable | `invalid/notEvaluated`; never favorable-fork selection |
| `STA-LIFE-013` | Adapter omits/fabricates an audit record not bound to ledger commitment | Audit sequence/commitment verification fails |
| `STA-LIFE-014` | Canonical activation/freeze evidence cannot be obtained | `indeterminate/notEvaluated` |
| `STA-LIFE-015` | Frozen predecessor exceeds declared migration-grace policy | `invalid/notEvaluated` |
| `STA-LIFE-016` | B1 migration intent claims predecessor/successor root continuity | Rejected/unrepresentable; B1 commits only root-independent freeze and intent |
| `STA-LIFE-017` | Existing credential uses successor under new-credentials-only migration | `invalid/notEvaluated`; credential remains predecessor-bound |
| `STA-LIFE-018` | Monotonic migration omits B2 root transitions, continuity proof, or successor activation receipt | Malformed/rejected |
| `STA-LIFE-019` | Successor activation omits or changes accepted B1 migration-intent/freeze-transition digest | Canonical activation compare-and-swap rejects |
| `STA-LIFE-020` | Transition/receipt/audit commitments are recomputed in dependency order | Exact acyclic vectors match; any self-referential construction is rejected |
| `STA-LIFE-021` | Existing predecessor-bound credential uses successor state without exact B2 migration-resolution record | Wrong-registry invalidity; direct equality cannot be bypassed |
| `STA-LIFE-022` | Migration resolution changes predecessor reference, successor deployment/activation, continuity, or policy | Resolution/status evidence digest mismatch |

### Root and non-membership (`STA-ROOT-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-ROOT-001` | Supplied root differs from live accepted root at same claimed version | Invalid; no authority upgrade |
| `STA-ROOT-002` | Supplied version differs from accepted state | Invalid stale/forked state |
| `STA-ROOT-003` | Valid non-membership path used with wrong root/registry | Proof failure |
| `STA-ROOT-004` | Membership path or malformed path presented as non-membership | Proof failure |
| `STA-ROOT-005` | Revoked handle presented | `invalid/notEvaluated`, never policy denial |
| `STA-ROOT-006` | Empty tree non-membership | Valid only against authenticated canonical empty root |
| `STA-ROOT-007` | Singleton and left/right boundary non-membership vectors | Compact and TypeScript agree |
| `STA-ROOT-008` | Root changes between proof construction and submission | Current transaction rejects stale state with no ledger receipt |
| `STA-ROOT-009` | Root equality asserted without non-membership | Cannot claim external-nonmembership profile |
| `STA-ROOT-010` | Authenticated evidence proves the root has wrong authority/deployment | `invalid/notEvaluated` |
| `STA-ROOT-011` | Required root authority evidence cannot be obtained/authenticated | `indeterminate/notEvaluated` |
| `STA-ROOT-012` | Old root/version is rewrapped with a fresh runtime `observedAt` | Helper result remains `local-process` and cannot authorize a ledger receipt |
| `STA-ROOT-013` | Newly signed attestation carries an old/forked root checkpoint | Invalid under exact-current/bounded-checkpoint policy |
| `STA-ROOT-014` | Rewrapped observed root is submitted as bounded-checkpoint authority | `invalid/notEvaluated` |
| `STA-ROOT-015` | Unique B1-authorized revocation is evaluated after B2 | Resulting root transition binds the exact before/after tree state |
| `STA-ROOT-016` | External non-membership uses a valid proof with an attested root anchor | Outer evidence remains `cryptographic-proof`; typed nested anchor yields attested authority only in the attested profile |
| `STA-ROOT-017` | Attested checkpoint claims exact-current | Malformed/rejected; only current local state may claim exact-current |
| `STA-ROOT-018` | Version-lag policy has no independently accepted comparison version/anchor | `maximumVersionLag` must be zero or verification is malformed |
| `STA-ROOT-019` | Bounded checkpoint is future-dated or exactly over maximum age | Invalid using checked trusted-time subtraction; exact boundary is accepted |
| `STA-ROOT-020` | Finality evidence changes network/checkpoint/position/context or has too few confirmations | Invalid; exact minimum-confirmation boundary is accepted |

### Trusted time and freshness (`STA-TIME-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-TIME-001` | Caller supplies process time to ledger profile | Malformed/local-process attempt; no ledger receipt |
| `STA-TIME-002` | Ledger mode value is not read from execution context | Construction/profile rejection |
| `STA-TIME-003` | Attested time has no current execution-context ledger anchor/window | Indeterminate; no ledger receipt |
| `STA-TIME-004` | Change network/verifier/deployment/challenge/time/unit/sequence | Statement verification fails |
| `STA-TIME-005` | Time evidence is expired, future-skewed, or over max age | Invalid |
| `STA-TIME-006` | Sequence or time rolls back | Rejected atomically |
| `STA-TIME-007` | Accepted DID evidence proves rotated/removed/wrong-relationship time authority | `invalid/notEvaluated` |
| `STA-TIME-008` | Unit confusion or implicit conversion | Malformed/rejected |
| `STA-TIME-009` | Arithmetic underflow/overflow at policy boundary | Rejected without wraparound |
| `STA-TIME-010` | Exact not-before, expiry, max-age, and skew boundaries | Inclusive/exclusive behavior matches policy vectors |
| `STA-TIME-011` | Fresh challenge paired with old unattached time statement | Rejected |
| `STA-TIME-012` | Required time source unavailable | `indeterminate/notEvaluated` |
| `STA-TIME-013` | Time-authority DID evidence cannot be obtained/authenticated | `indeterminate/notEvaluated` |
| `STA-TIME-014` | Caller controls both proof `createdAt` and verifier `currentTime` | Malformed/local-process attempt; no authority upgrade |
| `STA-TIME-015` | Time mode `none` carries non-zero validity/evidence fields | Malformed and rejected |
| `STA-TIME-016` | High-sequence authority statement is first submitted after its ledger-relative age/expiry bound | Invalid despite sequence monotonicity; no ledger receipt |
| `STA-TIME-017` | Signature/proof digest is inserted into or substituted for the signed time statement digest | Statement/evidence binding fails without circular acceptance |
| `STA-TIME-018` | Caller supplies a typed ledger anchor whose fields differ from current execution context | Final circuit rejects; no ledger receipt |
| `STA-TIME-019` | Time policy uses its own digest as `sourcePolicyDigest` | Vector/construction rejection; nested source policy is independently typed |
| `STA-TIME-020` | Accepted attestor sequence checkpoint update races or protected action reverts | One atomic update commits, or sequence/action both remain unchanged |
| `STA-TIME-021` | Two authorities or verifier deployments reuse the same sequence value | Domain-separated sequence keys remain independent |
| `STA-TIME-022` | Authority rotates method in the same DID, or changes DID/source policy | Same-DID rotation preserves sequence; DID/policy change requires distinct key and approved migration |

### Attested status authority (`STA-ATTEST-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-ATTEST-001` | Expected method reference is copied but proof uses attacker public key/signature | Invalid because key bytes do not match accepted DID method |
| `STA-ATTEST-002` | Accepted DID state proves method removal or wrong relationship | `invalid/notEvaluated` |
| `STA-ATTEST-003` | Required DID key/relationship evidence is unavailable | `indeterminate/notEvaluated` |
| `STA-ATTEST-004` | Change any status state-anchor or evidence-statement field after signing | Digest/signature/proof failure |
| `STA-ATTEST-005` | Fresh status signature wraps a checkpoint outside freshness policy | `invalid/notEvaluated` |
| `STA-ATTEST-006` | Status attestation omits exact root/version/deployment/network binding | Malformed and rejected |
| `STA-ATTEST-007` | Valid status statement is spliced with another transcript's subject, anchor, registry reference, or evidence binding | Exact transcript/statement/anchor/binding equality fails |
| `STA-ATTEST-008` | `statusRegistryDigest` hashes deployment, activation, or runtime snapshot instead of credential `StatusRegistryRefV1` | Malformed/rejected |
| `STA-ATTEST-009` | Direct status result has a valid statement but no current attestor grant/key/signature evidence | `invalid/notEvaluated`; statement bytes alone have no authority |
| `STA-ATTEST-010` | Direct status signature is valid under a grant removed from current attestation policy root | `invalid/notEvaluated` |

### Mode, downgrade, and classification (`STA-MODE-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-MODE-001` | Observed runtime snapshot labeled ledger-local | Authority mismatch rejected |
| `STA-MODE-002` | Authority-attested status labeled cryptographic non-membership | Mode/evidence mismatch rejected |
| `STA-MODE-003` | Attested root without trusted freshness | Indeterminate, never valid-with-warning |
| `STA-MODE-004` | Missing required DID/root/proof/time evidence | `indeterminate/notEvaluated` |
| `STA-MODE-005` | Available evidence proves wrong registry/stale/revoked/expired | `invalid/notEvaluated` |
| `STA-MODE-006` | Status failure returned as `policyDenied` | Result-construction rejection |
| `STA-MODE-007` | Unsupported status/time/profile combination | Malformed and rejected |
| `STA-MODE-008` | Unknown enum/version coerced to default | Rejected |
| `STA-MODE-009` | Preflight success reused to skip final checks | Direct final-circuit test fails closed |
| `STA-MODE-010` | Status/time evidence changed after consent/transcript binding | Digest/proof mismatch |
| `STA-MODE-011` | Production policy omits canonical slot activation/deployment acceptance | Construction rejected; no authoritative profile |
| `STA-MODE-012` | Required field is zero, or an absent-mode companion field is non-zero | Canonical absence validation rejects before policy evaluation |
| `STA-MODE-013` | Valid statement/binding uses mismatched profile, status mode, statement kind, anchor mode, authority digest, or time bounds | Exhaustive mode/equality checks reject |
| `STA-MODE-014` | Time mode `none` uses zero transcript evidence digest instead of canonical not-required binding hash | Malformed and rejected |

### Status-to-capability lifetime and TOCTOU (`STA-TOCTOU-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-TOCTOU-001` | Revocation races a transaction-only protected action | One ledger serialization wins; action uses the status state in its committed transaction |
| `STA-TOCTOU-002` | Credential revoked after bounded-snapshot capability issuance | Claim succeeds only within declared latency/expiry; later claim fails |
| `STA-TOCTOU-003` | Credential revoked before continuous-status capability claim | Claim rechecks live status and fails invalid |
| `STA-TOCTOU-004` | Reusable capability omits lifetime policy | Malformed and rejected |
| `STA-TOCTOU-005` | Bounded-snapshot lifetime exceeds published maximum revocation latency | Policy rejection |
| `STA-TOCTOU-006` | Transaction-only action already committed before later revocation | No retroactive rollback claim; receipt remains point-in-time evidence |
| `STA-TOCTOU-007` | Reusable capability substitutes transcript, status evidence/anchor, lifetime policy, issuance time, or expiry | `CapabilityStatusIssuanceBindingV1` mismatch; claim is invalid |
| `STA-TOCTOU-008` | Capability core includes issuance-binding digest, or issuance binding hashes full capability state | Circular construction rejected; only core-to-binding-to-state order is valid |

### Privacy (`STA-PRIVACY-*`)

| ID | Mutation/attack | Required result |
| --- | --- | --- |
| `STA-PRIVACY-001` | Hidden profile publishes raw status handle or credential root | Surface/conformance failure |
| `STA-PRIVACY-002` | Hidden profile publishes reusable handle commitment | Profile rejection |
| `STA-PRIVACY-003` | Evidence from verifier/challenge A replayed at B | Binding failure |
| `STA-PRIVACY-004` | Audit includes raw status handle, standalone stable handle digest, holder DID, credential, claims, or reason | Audit schema/privacy failure |
| `STA-PRIVACY-005` | Same hidden credential across verifier scopes | Public evidence subjects/statements differ and do not expose stable roots |
| `STA-PRIVACY-006` | Current authority-attested prototype selected for hidden final profile | Explicit profile rejection |
| `STA-PRIVACY-007` | Inputs, retained ledger state, receipts, events, errors, logs, or CI artifacts expose a stable status identifier | Surface/privacy failure |

### Differential and atomicity (`STA-DIFF-*`)

| ID | Test | Required result |
| --- | --- | --- |
| `STA-DIFF-001` | Compact and TypeScript hash every v1 record | Byte-identical checked vectors |
| `STA-DIFF-002` | Mutate every field of every record, including state-anchor/freshness/status-evidence records | At least one owning verification fails |
| `STA-DIFF-003` | Compact, runtime adapter, and verifier classify same fixture | Identical proof/decision/execution/authority axes |
| `STA-DIFF-004` | Parallel mutation stress at one version | One commit per version; no lost update |
| `STA-DIFF-005` | Inject failure after nonce check, insert, version update, and audit update | No observable partial state at every injection point |
| `STA-DIFF-006` | Restart/multi-instance replay corpus | Persistent nonce/version/checkpoint state rejects replay |
| `STA-DIFF-007` | Supported empty/singleton/boundary Merkle vectors | Compact/runtime parity and recorded complexity |
| `STA-DIFF-008` | Every supported status/time/profile matrix cell | Positive fixture; every unlisted cell has a negative fixture |
| `STA-DIFF-009` | Mutation and governance authorizations reuse the same nonce bytes | Domain-separated receipt keys and immutable results remain distinct |
| `STA-DIFF-010` | Bounded lag comparator changes network/slot/registry/deployment/activation/version/context | Comparator digest or checked subtraction fails |

## Delivery gates

### B1 may merge only when

- B3 or another reviewed authoritative authorization-time surface is merged;
- `STA-INIT-*`, `STA-MUT-*`, `STA-AUTH-*`, and the B1-applicable
  `STA-LIFE-*`/`STA-DIFF-*` tests pass against generated Compact artifacts;
- direct circuit calls cannot bypass authorization;
- state mutation and replay persistence survive restart/concurrency tests;
- DID relationship and trusted-time dependencies used by authorization are
  authoritative rather than caller assertions; and
- the package no longer presents unauthenticated circuits as supported
  production entrypoints.

### B2 may merge only when

- `STA-ROOT-*`, `STA-PRIVACY-*`, and Merkle differential vectors pass;
- live-root equality and actual non-membership use supported Compact
  primitives or reviewed proof composition; and
- complexity/latency baselines are recorded and accepted.

### B3 may merge only when

- `STA-TIME-*` and relevant `STA-DIFF-*` tests pass;
- the exact ledger time/position unit and source are documented; and
- no authoritative path accepts runtime/caller time or an unanchored signed
  timestamp.

### A3 may advertise a final profile only when

- its required B1/B2/B3 gates and DID/trust/deployment authority dependencies
  are merged;
- every selected status/time evidence mode maps into the canonical verification
  transcript; and
- the full authority-downgrade, privacy, race, rollback, and failure-
  classification suites pass in the final composed contract.
