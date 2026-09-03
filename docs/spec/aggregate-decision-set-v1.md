# Aggregate Decision Set V1

Status: implemented as a bounded authoritative pair/triple aggregate over Verification V1 child results.

## Scope and authority

An aggregate decision set contains exactly two or three children. Each child is an independently prepared Verification V1 public-input set paired with its actual Verification V1 result. The aggregate does not select a representative credential: every child contributes a canonical `AggregateChildDecisionBindingV1`.

All children MUST carry the same achieved authority (`ledger-local`, `ledger-attested`, or `local-process`). Mixed authority fails closed. Every child ledger receipt MUST pass a deployment-injected receipt authenticator before contributing authority; a structurally valid caller-synthesized object is not a receipt. Ledger aggregate authority is returned only after the aggregate executor supplies an exact, successfully committed transaction observation and independently confirms an immutable snapshot. Same-holder evidence is additional evidence; it never replaces issuer DID/key, trust, status, time, artifact, or result validation.

V1 deliberately excludes unbounded sets, Merkle aggregation, cross-chain consensus, product policy, and OpenID bindings.

## Child binding and canonical order

`AggregateChildDecisionBindingV1` is persistent-hashed in this exact order:

1. domain and version;
2. family, schema, Verification V1 transcript, and anchor-evidence-receipt digests;
3. issuer DID, method, relationship, and evidence digest;
4. trust scope and evidence digest;
5. status mode, registry, root, version, freshness policy, and evidence digest;
6. time mode, trusted time, and evidence digest;
7. artifact manifest and evidence digests;
8. holder-binding digest;
9. Verification V1 profile, result kind, proof/decision/execution/authority codes;
10. child decision nullifier, transaction digest, and atomic-mutation code.

Local attempts use canonical zero transaction/nullifier result fields; their complete transcript remains bound separately. Ledger receipts bind their exact transaction, nullifier, evidence receipt, authority, and mutation disposition.

Children are sorted lexicographically by `(familyDigest, schemaDigest, transcriptDigest)`. The fixed `AggregateChildSetV1` hashes child count and first/second/third child digests. A pair uses the canonical zero third digest. Duplicate transcript digests are rejected. Caller order therefore cannot change the aggregate digest.

## Explicit status and freshness

Every child is revalidated through `assertValidVerificationPublicInputsV1` before aggregation. The prepared aggregate retains immutable source snapshots, and submission repeats child proof/decision/execution, evidence freshness, uniform-authority, diagnostic, ordering, and digest validation before and after provider callbacks.

- `statusMode = none` requires the explicit canonical `not-required` `EvidenceBindingV1`; omission is malformed.
- Enabled status requires its complete mode-specific binding, registry/root/version/freshness fields, and nonzero evidence digest.
- Issuer, trust, status, time, artifact, and connector accepted evidence intervals MUST contain `aggregateTrustedTime`.
- Unavailable or indeterminate evidence yields an indeterminate aggregate with no authority.
- Expired requests or stale evidence are invalid and consume no aggregate nullifier.

An authenticated empty status root remains valid for enabled status; zero is not interpreted as omission when the mode enables status.

## Aggregate request, action, replay, and same-holder context

`AggregateRequestBindingV1` binds network, verifier contract, deployment, audience, request, challenge, expiry, aggregate policy, action class, exact action invocation, replay policy, and replay scope. Every child MUST match the aggregate network/verifier/deployment/audience/request/challenge/expiry context.

V1 supports only the fixed contract-derived request replay policy for a side effect. `createAggregateRequestBindingV1` computes the replay-scope digest from the existing Verification V1 `RequestReplayScopeV1`; callers do not supply it. Read-only decisions use explicit zero action/replay fields.

`AggregateSameHolderBindingV1` uses one of two explicit modes:

- `not-required`: zero verifier/challenge/count/child-set/proof fields;
- `required`: verifier and challenge, pair/triple count, every child holder-binding digest, the exact aggregate child-set digest, and an opaque proof-receipt digest.

The same-holder capability derives holder-binding digests from the exact blinded bindings asserted by Compact and checks the aggregate child-set digest against every supplied child digest. Aggregate preparation then requires a deployment-injected proof-receipt verifier to authenticate that complete statement; an arbitrary nonzero digest is never authority. The public result contains no holder secret, opening, blinding factor, stable holder DID, claim, status handle, or raw proof.

## Transcript and nullifier

`AggregateDecisionTranscriptV1` hashes, in order: domain, version, authority, child count, request-binding digest, child-set digest, same-holder-binding digest, aggregate trusted time, nullifier mode, and decision nullifier.

For a side effect, the contract-derived nullifier is:

```text
persistentHash<AggregateDecisionNullifierMaterialV1>({
  domain, version, deploymentDigest, verifierContractDigest,
  requestBindingDigest, childSetDigest,
  actionClassDigest, actionInvocationDigest,
  replayPolicy, replayScopeDigest,
  sameHolderBindingDigest, policyDigest
})
```

Read-only ledger profiles declare the explicit `(location, nullifier, consumption) = (none, none, none)` tuple and use `nullifierMode = 0`. Side-effecting ledger profiles use `(ledger, contract-derived, atomic)`: the executor MUST consume the exact aggregate nullifier in the same transaction as the protected mutation, and `approved` requires `atomicMutation = committed`. A committed `replay` is an idempotent no-op and requires `atomicMutation = none` plus the same nullifier. Rejected, reverted, malformed, invalid, denied, indeterminate, unconfirmed, mismatched, or provider-failed attempts return no aggregate authority and cannot consume a successful-transition capability.

## Classifications and privacy

Aggregate failures are `malformed`, `invalid`, `indeterminate`, or `denied` with bounded reason codes. Per-child summaries preserve family/schema/transcript digests, proof/decision/execution statuses, achieved authority, and bounded Verification V1 reason/stage values. They do not include claims, openings, holder identities, keys, resolver documents, raw evidence/proofs, stack traces, or transport payloads.

The committed fixtures include distinct birth-secret and university-diploma identities, fixed pair/triple vectors, enabled/no-status cases, and hidden-output snapshots. Existing standalone same-holder tests are composition evidence only; they become authoritative only when their scoped result is included in a passing aggregate decision set.

## Domain identifiers

- `midnight:vc:aggregate-child-decision-binding:v1`
- `midnight:vc:aggregate-child-set:v1`
- `midnight:vc:aggregate-request-binding:v1`
- `midnight:vc:aggregate-same-holder-binding:v1`
- `midnight:vc:aggregate-decision-transcript:v1`
- `midnight:vc:aggregate-decision-nullifier:v1`

All records use Compact `persistentHash<Record>` and checked TypeScript/Compact parity tests. Any field/order/code-point change requires a new version.
