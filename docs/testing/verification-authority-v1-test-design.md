# Verification Authority V1 Threat Model and Test Design

Status: implemented design gate for A1–A3. Encoding, direct Compact-path,
transcript mutation, nullifier atomicity, final executor parity, transaction
confirmation, authority failure, and public-only privacy suites are active.
Operational providers that are not configured remain explicit indeterminate
results rather than skipped tests or authority claims.

Companion documents:

- [`../spec/verification-contract-v1.md`](../spec/verification-contract-v1.md)
- [`../decisions/0010-verification-transcript-and-decision-nullifier.md`](../decisions/0010-verification-transcript-and-decision-nullifier.md)
- [`../plans/vc-production-execution-plan-2026-07-16.md`](../plans/vc-production-execution-plan-2026-07-16.md)

## Security properties

The verification authority must preserve:

1. **Validity:** invalid, malformed, stale, unsupported, or unverifiable
   evidence cannot produce an approved decision.
2. **Authority provenance:** only a committed Midnight transaction can claim
   `ledger-local` or `ledger-attested`.
3. **Transcript and consent integrity:** changing any security-relevant public
   input changes the transcript and presentation/consent binding or causes
   rejection.
4. **Exactly-once side effects:** one accepted decision scope causes at most one
   protected state transition across retries, races, restarts, and relays.
5. **Atomicity:** a failed protected transition does not leave a consumed
   nullifier, and a successful transition cannot omit it.
6. **Privacy:** receipts and public inputs reveal no raw private claim, witness,
   opening, key, wallet inventory, or stable cross-verifier holder identifier.
7. **Fail-closed behavior:** unavailable authority is `indeterminate`, never a
   warning attached to success.

## Threat actors

- a holder submitting malformed, forged, stale, or replayed evidence;
- an issuer using a rotated, deactivated, unauthorized, or wrong-relationship
  DID method;
- a verifier DApp changing audience, origin, policy, disclosure, or action
  after wallet consent;
- a relay racing or replaying the same request across transactions or nodes;
- a stale or compromised DID, trust, status, time, or artifact resolver;
- an attestation authority signing the wrong challenge, root, deployment, or
  freshness window;
- a caller bypassing all TypeScript preparation and invoking the final Compact
  circuit directly; and
- an observer correlating public receipts, nullifiers, logs, or errors.

Compromised ledger consensus, broken Compact cryptographic primitives, and
host compromise that can read wallet private state are outside this repository's
test boundary. They remain deployment and upstream assurance concerns.

## Trust boundaries

| Boundary | Untrusted side | Trusted only after |
| --- | --- | --- |
| DApp to wallet/connector | Website request, origin claims, redirect and transport data | Wallet authenticates origin, validates consent, and commits the accepted request |
| Wallet/runtime to Compact | Prepared transcript, resolver output, public inputs, private witness carrier | Final circuit recomputes bindings and validates evidence |
| External authority to verifier contract | DID/trust/status/time attestation | Signature, role, scope, challenge, deployment, and freshness all verify |
| Artifact loader to verifier | Paths, URLs, caches, local files | Exact manifest and artifact digests verify |
| Verifier decision to business state | Preflight success or transaction proposal | Same transaction validates, consumes the nullifier, and performs the protected write |

## Required negative suites

### Transcript mutation suite

`VA-TRANSCRIPT-001` creates one valid fixture per implemented profile, mutates
each field of `VerificationTranscriptV1` independently, and calls the final
Compact path without preparation helpers. A1 starts with the synthetic
fail-closed fixture; A3 adds each final profile fixture before advertising it.

Each mutation MUST either make the proof unsatisfiable or produce
`malformed`, `invalid`, or `indeterminate` with `notEvaluated`. At minimum the
suite mutates:

- version, profile, and authority;
- network, verifier contract, deployment, audience, and origin;
- request ID, challenge, expiry, trusted time, and time evidence;
- family, schema, credential-binding mode/digest, presentation binding,
  disclosure, and predicate;
- holder binding, issuer DID, method, relationship, and DID evidence;
- trust scope/evidence and status registry/root/evidence;
- policy, action, artifact manifest, nullifier mode, and nullifier.

The action mutation set includes target, recipient, resource, amount, and every
typed argument committed by `actionInvocationDigest`. The status mutation set
includes mode, registry version, freshness policy, and the explicit no-status
encoding. The time mutation set includes mode and evidence. The origin mutation
set includes mode and connector evidence.

`VA-CONSENT-001` mutates profile, network, deployment, verifier, audience,
origin, request, challenge, expiry, disclosure, predicate, status mode/root/
version/freshness, policy, action class/arguments, artifact manifest, and replay
policy after the consent/presentation proof is created. The final Compact path
MUST reject each mutation because it recomputes `ConsentBindingV1` and
`PresentationBindingV1`.

`VA-TRANSCRIPT-002` verifies that changing Compact field order, enum code
points, domain constants, or runtime serialization fails checked-in
cross-runtime digest vectors.

`VA-TRANSCRIPT-003` passes unknown versions, profiles, authority labels,
nullifier modes, and zero sentinels in required fields. Every case fails closed.

### Authority and downgrade suite

| ID | Attack | Expected result |
| --- | --- | --- |
| `VA-AUTH-001` | Mark an off-chain/preflight result as `ledger-local` or `ledger-attested` | Malformed result or API rejection |
| `VA-AUTH-002` | Submit an off-chain public proof under a ledger profile | Profile/authority rejection |
| `VA-AUTH-003` | Supply a network or deployment digest that mismatches initialized ledger policy | `invalid/notEvaluated` |
| `VA-AUTH-003A` | Required network/deployment authority cannot be established | `indeterminate/notEvaluated` |
| `VA-AUTH-004` | Use a valid issuer key without the required active DID relationship | `invalid/notEvaluated` |
| `VA-AUTH-005` | Accepted trust evidence is stale, wrong-network, wrong-scope, suspended, or withdrawn | `invalid/notEvaluated` |
| `VA-AUTH-005A` | Required trust evidence cannot be retrieved or authenticated | `indeterminate/notEvaluated` |
| `VA-AUTH-006` | Accepted evidence proves revoked, stale, wrong-registry, unsupported-mode, or binding-mismatched status | `invalid/notEvaluated` |
| `VA-AUTH-006A` | Required status evidence cannot be retrieved or its authority cannot be established | `indeterminate/notEvaluated` |
| `VA-AUTH-007` | Use caller time, future attestation time, expired evidence, or an excessive freshness window where trusted-time policy exists | `invalid/notEvaluated` |
| `VA-AUTH-007A` | Required trusted time cannot be established | `indeterminate/notEvaluated` |
| `VA-AUTH-008` | Accepted evidence proves a wrong artifact/deployment digest or revoked manifest | `invalid/notEvaluated` |
| `VA-AUTH-008A` | Required manifest authority or artifact verification is unavailable | `indeterminate/notEvaluated` |
| `VA-AUTH-009` | Change audience, origin, request object, challenge, redirect binding, or connector consent after wallet acceptance | Rejected before approval |
| `VA-AUTH-009A` | Ledger policy requires origin authority but accepted connector evidence is unavailable | `indeterminate/notEvaluated` |
| `VA-AUTH-010` | Use `ledger-local-v1` with any authority-attested required evidence | Malformed profile/evidence combination |
| `VA-AUTH-011` | Use attested status/origin mode with non-attested evidence, or claim `ledger-attested-v1` with no attested evidence | Malformed profile/evidence combination |
| `VA-AUTH-012` | Give `offchain-public-v1` a required nullifier, replay policy, action fields, or side-effect receipt | Malformed profile/result combination |
| `VA-AUTH-013` | Use caller-asserted origin as `local-request` when the runtime did not observe it | Rejected or normalized to origin mode `none`; never authoritative |

When an authority package does not exist, A1 tests its explicit `unavailable`
binding and `indeterminate/notEvaluated` result. It does not add skipped final
profile tests or replace missing authority with a caller assertion. A3 adds and
must pass each authority-specific attack vector before advertising that mode.

### Proof and policy separation suite

| ID | Case | Expected axes |
| --- | --- | --- |
| `VA-DECISION-001` | Malformed encoding | `malformed/notEvaluated` |
| `VA-DECISION-002` | Cryptographically invalid proof | `invalid/notEvaluated` |
| `VA-DECISION-003` | Required authority unavailable | `indeterminate/notEvaluated` |
| `VA-DECISION-004` | Valid proof, policy allows | `valid/approved` |
| `VA-DECISION-005` | Valid proof, policy denies | `valid/policyDenied` |
| `VA-DECISION-006` | Invalid proof with permissive policy | `invalid/notEvaluated`; policy cannot upgrade it |
| `VA-DECISION-007` | Valid proof, consumed decision scope | `valid/replay` |
| `VA-DECISION-008` | Valid approved proof, protected write reverts | `valid/approved/reverted` local attempt; no ledger receipt |

Every impossible combination is rejected when decoding or constructing a
result.

### Nullifier, replay, and atomicity suite

| ID | Case | Expected invariant |
| --- | --- | --- |
| `VA-REPLAY-001` | Same request and proof in the same process | One approved transition, then replay |
| `VA-REPLAY-002` | Same bytes after verifier/runtime restart | Replay remains enforced by ledger state |
| `VA-REPLAY-003` | Concurrent submissions through different relays/nodes | Exactly one transaction performs the protected transition |
| `VA-REPLAY-004` | Same request ID with different challenge or bytes | Rejected as mismatch, not treated as an idempotent duplicate |
| `VA-REPLAY-005` | Different transaction/session wrapper around the same decision scope | Same nullifier and replay rejection |
| `VA-REPLAY-006` | Different deployment or action | Domain-separated nullifier; no cross-deployment collision |
| `VA-REPLAY-007` | Caller supplies a chosen replay scope or nullifier | Contract recomputation rejects it |
| `VA-REPLAY-008` | Fresh request/challenge for the same `holder-action` or `credential-action` scope | Same nullifier and replay rejection |
| `VA-REPLAY-009` | Fresh request/challenge under `request` policy | Distinct nullifier only when ledger policy explicitly selected request scope |
| `VA-REPLAY-010` | Substitute challenge-scoped holder/credential binding into an action-scoped replay policy | Contract recomputation rejects it |
| `VA-ATOMIC-001` | Protected state write fails after nullifier insertion | Entire transaction rolls back; retry may proceed |
| `VA-ATOMIC-002` | Attempt protected write without nullifier insertion | Circuit/contract path is impossible or rejected |
| `VA-ATOMIC-003` | Read-only mode attempts a business-state write | Rejected |
| `VA-ATOMIC-004` | Failure injected between nullifier and protected write | No externally observable intermediate state |

Tests MUST inspect final ledger state, not only returned errors. The action and
nullifier assertions belong in the same Compact integration fixture.

### Privacy and non-disclosure suite

`VA-PRIVACY-001` snapshots public inputs, receipts, events, logs, exceptions,
and retained CI artifacts. It rejects any raw claim, private witness, opening,
holder secret, proof key, wallet inventory, or resolver document.

`VA-PRIVACY-002` verifies that hidden-holder profiles use a verifier-scoped or
action-scoped binding and do not expose a stable cross-verifier identifier.

`VA-PRIVACY-002A` repeats one hidden credential across verifiers and challenges
and checks public inputs, receipts, nullifiers, and events for a stable
credential/body root or another unintended correlator.

`VA-PRIVACY-002B` rejects hidden-holder evidence whose public subject or
statement exposes a stable status handle, status-handle commitment, credential
root, or holder DID. The existing stable-commitment authority-attested status
prototype cannot satisfy this final-profile fixture.

`VA-PRIVACY-003` proves that two semantically equivalent private witnesses do
not disclose witness differences through reason codes or variable error detail.

`VA-PRIVACY-004` verifies that `offchain-public-v1` rejects hidden-holder,
private predicate, and private witness inputs instead of silently weakening
them.

## Positive and differential fixtures

Every implemented final profile needs one minimal positive fixture and one
fixture for each status/trust mode it claims. TypeScript mirror and Compact
execution receive the same canonical public inputs. Differential tests compare
digest and classification output, but only a committed transaction receipt is
authoritative. An aborted Compact assertion is a local attempt failure, not a
ledger receipt.

The harness MUST expose a direct final-circuit entrypoint. Passing tests through
`prepareVerification` alone is insufficient because preparation is an
attacker-controlled boundary from the contract's perspective.

## Delivery gates

### Before A1 implementation

- ADR-0010, the v1 specification, and this test design are merged.
- Domain identifiers, field order, enum code points, and authority labels have
  owner/security review.
- Every unavailable authority dependency has a named blocker and fail-closed
  expected behavior.

### Before A1 merge

- v1 types make impossible result combinations unrepresentable or reject them
  at construction.
- Cross-runtime digest vectors and the complete transcript mutation harness
  pass.
- exact core credential, holder, consent, presentation, evidence, receipt, and
  nullifier record vectors pass; one named synthetic extension record proves
  the owner-extension mechanism;
- `VerificationPublicInputsV1` and every evidence binding have fixed code
  points, field order, and unavailable-evidence behavior.
- A synthetic direct Compact-path fixture proves transcript and result wiring;
  unavailable authority adapters deterministically return
  `indeterminate/notEvaluated`.
- A1 does not advertise either ledger profile as implemented.

### Before A2 merge

- Nullifier derivation vectors pass in Compact and TypeScript.
- Replay tests pass across retries, process recreation, concurrent relays, and
  different transaction/session wrappers.
- Atomic rollback tests inspect ledger state under injected protected-write
  failure.
- Nullifier insertion is immediately adjacent to the protected state write in
  the reviewed final circuit.

### A3 final-profile integration evidence

- each advertised executor consumes the same canonical 47-field transcript and
  has valid, invalid, and indeterminate differential classifications;
- DID relationship, trust, status, time, artifact/deployment, and any required
  connector-origin mechanisms enter through a transcript-rebound evaluator;
- unavailable mechanisms and provider failures are bounded, typed,
  `indeterminate/notEvaluated` local attempts;
- public-only execution rejects hidden-holder, private-predicate, same-holder,
  and private-status inputs; and
- only an exact successful committed transaction observation accepted by an
  independent confirmation verifier produces a ledger-authority receipt.

Final profile support remains conditional on injecting those authoritative
mechanisms. The executor never upgrades an unavailable adapter, local preflight,
submitted/included transaction, reverted transaction, or unauthenticated
receipt.

### Before a production label

- DID relationship, trust, status/non-membership, time, artifact, and
  deployment authority blockers required by the profile are closed.
- Independent Compact/cryptography and privacy reviews are complete.
- Every accepted finding has a regression test or documented, expiring risk
  acceptance.
