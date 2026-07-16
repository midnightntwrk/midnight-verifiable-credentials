# Midnight VC Verification Contract V1

Status: normative design prerequisite; implementation is not yet complete.

Companion documents:

- [`../decisions/0005-verification-execution-and-authority.md`](../decisions/0005-verification-execution-and-authority.md)
- [`../decisions/0010-verification-transcript-and-decision-nullifier.md`](../decisions/0010-verification-transcript-and-decision-nullifier.md)
- [`../testing/verification-authority-v1-test-design.md`](../testing/verification-authority-v1-test-design.md)
- [`./status-verification-protocol.md`](./status-verification-protocol.md)

## Scope

This specification fixes the public contract for authoritative VC/VP
verification before the repository implements it in Compact. It defines:

- the versioned transcript and result axes;
- the authority assigned to each execution profile;
- decision-nullifier derivation and consumption;
- the provenance required for security-relevant inputs; and
- fail-closed behavior while upstream evidence is unavailable.

V1 verifies exactly one credential authority chain per transcript. A
multi-credential or same-holder VP requires a future aggregate decision-set
specification that commits each credential's issuer, trust, and status
evidence; it MUST NOT be encoded by selecting one credential's authority chain
as representative of the set.

V1 does not define one concrete credential family, wire protocol, DID method,
trust-registry proof, status-tree algorithm, or artifact bundle format.

Normative terms `MUST`, `MUST NOT`, `SHOULD`, and `MAY` are used as described by
RFC 2119 and RFC 8174.

## Profiles and authority

| Profile | Final executor | Authority | Required evidence |
| --- | --- | --- | --- |
| `ledger-local-v1` | Midnight verifier contract | `ledger-local` | All required validity, identity, trust, status, time, and replay checks execute against local accepted ledger state |
| `ledger-attested-v1` | Midnight verifier contract | `ledger-attested` | External evidence is challenge-bound, authenticated, fresh, and verified against an authority accepted by local ledger policy |
| `offchain-public-v1` | Local process | `local-process` | Every security-relevant input is public; no private witness, hidden-holder, private predicate, or ledger-side-effect claim |

Generated TypeScript `pureCircuits`, resolver output, wallet checks, and
`preflightVerification` are mirrors or preparation. They MUST NOT emit a
`ledger-local` or `ledger-attested` result.

## Result contract

The public API uses a discriminated union. An aborted or unsubmitted attempt is
not a ledger receipt:

```ts
type VerificationProofStatusV1 =
  | "malformed"
  | "invalid"
  | "indeterminate"
  | "valid";

type VerificationDecisionStatusV1 =
  | "notEvaluated"
  | "approved"
  | "policyDenied"
  | "replay";

type VerificationAuthorityV1 =
  | "ledger-local"
  | "ledger-attested"
  | "local-process";

type VerificationExecutionStatusV1 =
  | "notSubmitted"
  | "rejected"
  | "reverted"
  | "committed";

interface LocalVerificationAttemptV1 {
  version: 1;
  kind: "local-attempt";
  targetProfile: "ledger-local-v1" | "ledger-attested-v1" | "offchain-public-v1";
  authority: "local-process";
  proofStatus: VerificationProofStatusV1;
  decisionStatus: VerificationDecisionStatusV1;
  executionStatus: "notSubmitted" | "rejected" | "reverted";
  transcriptDigest?: Uint8Array;
  reasonCode?: string;
}

interface LedgerVerificationReceiptV1 {
  version: 1;
  kind: "ledger-receipt";
  profile: "ledger-local-v1" | "ledger-attested-v1";
  authority: "ledger-local" | "ledger-attested";
  proofStatus: "valid";
  decisionStatus: "approved" | "policyDenied" | "replay";
  executionStatus: "committed";
  transcriptDigest: Uint8Array;
  decisionNullifier: Uint8Array;
  anchorEvidenceDigest: Uint8Array;
  transactionDigest: Uint8Array;
}

type VerificationResultV1 =
  | LocalVerificationAttemptV1
  | LedgerVerificationReceiptV1;
```

The byte arrays shown above are exactly 32 bytes. A production API SHOULD use
branded fixed-width types instead of accepting arbitrary `Uint8Array` values.

`malformed`, `invalid`, and `indeterminate` MUST use `notEvaluated`. A local
`offchain-public-v1` result MAY use `valid/approved` or
`valid/policyDenied`, but it remains `local-process` and has no transaction.
An attempt whose proof and policy pass but whose protected transaction reverts
uses `valid/approved/reverted`; it is not a ledger approval and consumes no
nullifier.
Only a committed transaction can produce `LedgerVerificationReceiptV1`.
Compact assertion failure, typed-decoding failure, submission failure, and a
reverted transaction produce `LocalVerificationAttemptV1`; adapters MUST NOT
invent a ledger receipt from those failures.

Allowed execution combinations are:

| Result | Proof/decision | Execution |
| --- | --- | --- |
| Local malformed, invalid, or indeterminate attempt | `notEvaluated` | `notSubmitted`, `rejected`, or `reverted` as observed |
| Local public verification | `valid/approved` or `valid/policyDenied` | `notSubmitted` |
| Valid approved ledger attempt whose write fails | `valid/approved` | `reverted` |
| Ledger receipt | `valid/approved`, `valid/policyDenied`, or `valid/replay` | `committed` |

`committed` is illegal on a local attempt. `reverted` is illegal on a ledger
receipt. A ledger replay classification is returned only by a committed no-op
transaction that checked the existing nullifier.

`reasonCode` is a bounded, versioned code. It MUST NOT contain raw claims,
private witnesses, keys, resolver documents, stack traces, or transport
payloads. `anchorEvidenceDigest` is
`persistentHash<AnchorEvidenceReceiptV1>` over the accepted evidence-binding
records defined below. It does not hash an implementation-specific object.

## Canonical transcript

### Hash suite and encoding

The Compact implementation MUST compute:

```text
transcriptDigest = persistentHash<VerificationTranscriptV1>(transcript)
```

`VerificationTranscriptV1` is a Compact record in the exact order below.
Fields are fixed-width Compact integers, bounded enums encoded as integers, or
`Bytes<32>`. Implementations MUST NOT substitute JSON serialization, concatenate
variable-length values, or reorder fields.

Domain tags are `Bytes<32>` constants derived as SHA-256 over the exact ASCII
identifier named by the field. A1 MUST check in the resulting hex constants and
cross-runtime test vectors. The transcript domain identifier is
`midnight:vc:verification-transcript:v1`; the nullifier domain identifier is
`midnight:vc:decision-nullifier:v1`.

The bounded enum code points are part of v1:

| Enum | Code | Meaning |
| --- | ---: | --- |
| profile | `1` | `ledger-local-v1` |
| profile | `2` | `ledger-attested-v1` |
| profile | `3` | `offchain-public-v1` |
| authority | `1` | `ledger-local` |
| authority | `2` | `ledger-attested` |
| authority | `3` | `local-process` |
| credential binding mode | `1` | `explicit-root` |
| credential binding mode | `2` | `verifier-scoped` |
| origin mode | `0` | `none` |
| origin mode | `1` | `wallet-attested` |
| origin mode | `2` | `local-request` |
| issuer relationship | `1` | `assertionMethod` |
| issuer relationship | `2` | `authentication` |
| issuer relationship | `3` | `capabilityInvocation` |
| status mode | `0` | `none` |
| status mode | `1` | `same-contract-live` |
| status mode | `2` | `external-nonmembership` |
| status mode | `3` | `authority-attested` |
| time mode | `0` | `none` |
| time mode | `1` | `ledger` |
| time mode | `2` | `authority-attested` |
| evidence mode | `0` | `not-required` |
| evidence mode | `1` | `unavailable` |
| evidence mode | `2` | `local-ledger` |
| evidence mode | `3` | `authority-attested` |
| evidence mode | `4` | `cryptographic-proof` |
| proof status | `0` | `malformed` |
| proof status | `1` | `invalid` |
| proof status | `2` | `indeterminate` |
| proof status | `3` | `valid` |
| decision status | `0` | `notEvaluated` |
| decision status | `1` | `approved` |
| decision status | `2` | `policyDenied` |
| decision status | `3` | `replay` |
| execution status | `0` | `notSubmitted` |
| execution status | `1` | `rejected` |
| execution status | `2` | `reverted` |
| execution status | `3` | `committed` |
| nullifier mode | `0` | `none` |
| nullifier mode | `1` | `required` |
| replay policy | `0` | `none` |
| replay policy | `1` | `request` |
| replay policy | `2` | `holder-action` |
| replay policy | `3` | `credential-action` |

Code points not listed above are invalid. Implementations MUST NOT coerce an
unknown code to a default.

### Field order

| Order | Field | Type | Meaning and authority requirement |
| ---: | --- | --- | --- |
| 1 | `domain` | `Bytes<32>` | Transcript v1 domain tag |
| 2 | `version` | `Uint<16>` | Exact value `1` |
| 3 | `profile` | `Uint<8>` | Bounded profile code |
| 4 | `authority` | `Uint<8>` | Bounded authority code; final contract constrains it to the profile |
| 5 | `networkIdDigest` | `Bytes<32>` | MUST match ledger-initialized deployment context or accepted manifest evidence |
| 6 | `verifierContractDigest` | `Bytes<32>` | Final verifier identity/deployment binding |
| 7 | `deploymentDigest` | `Bytes<32>` | Accepted deployment manifest or initialized configuration |
| 8 | `audienceDigest` | `Bytes<32>` | Canonical verifier audience |
| 9 | `originMode` | `Uint<8>` | Explicit origin authority mode |
| 10 | `originDigest` | `Bytes<32>` | Exact accepted origin, or zero only for `none` |
| 11 | `connectorEvidenceDigest` | `Bytes<32>` | Wallet/connector evidence binding, including canonical `not-required` binding |
| 12 | `requestIdDigest` | `Bytes<32>` | Unique protocol request identifier |
| 13 | `challengeDigest` | `Bytes<32>` | Fresh verifier challenge/nonces committed by the wallet and proof |
| 14 | `expiresAt` | `Uint<64>` | Request expiry in the profile's ledger-time unit |
| 15 | `credentialFamilyDigest` | `Bytes<32>` | Credential family and major-version binding |
| 16 | `schemaDigest` | `Bytes<32>` | Exact supported schema binding |
| 17 | `credentialBindingMode` | `Uint<8>` | Explicit root or verifier-scoped binding |
| 18 | `credentialBindingDigest` | `Bytes<32>` | Challenge- and verifier-scoped record containing the explicit root, or a proof-derived private commitment in hidden-holder mode |
| 19 | `disclosureDigest` | `Bytes<32>` | Exact disclosed-field set without raw values |
| 20 | `predicateDigest` | `Bytes<32>` | Exact requested and proven predicates |
| 21 | `holderBindingDigest` | `Bytes<32>` | Explicit holder binding or verifier-scoped privacy-preserving commitment |
| 22 | `policyDigest` | `Bytes<32>` | Exact business policy evaluated after proof validity |
| 23 | `actionClassDigest` | `Bytes<32>` | Protected action/capability class; zero for read-only verification |
| 24 | `actionInvocationDigest` | `Bytes<32>` | Exact target, recipient, resource, amount, and typed arguments of the protected write |
| 25 | `consentDigest` | `Bytes<32>` | Canonical request and exact-action consent binding |
| 26 | `presentationBindingDigest` | `Bytes<32>` | Proof-derived binding of credential, holder, disclosure, predicate, and consent digests |
| 27 | `issuerDidDigest` | `Bytes<32>` | Canonical issuer DID |
| 28 | `issuerMethodDigest` | `Bytes<32>` | Canonical DID URL verification method |
| 29 | `issuerRelationship` | `Uint<8>` | Required DID verification relationship code |
| 30 | `issuerEvidenceDigest` | `Bytes<32>` | Active method/relationship evidence and accepted state anchor |
| 31 | `trustScopeDigest` | `Bytes<32>` | Exact issuer/verifier/schema authorization scope |
| 32 | `trustEvidenceDigest` | `Bytes<32>` | Accepted trust state or signed epoch evidence |
| 33 | `statusMode` | `Uint<8>` | Explicit no-status, live, non-membership, or attested mode |
| 34 | `statusRegistryDigest` | `Bytes<32>` | Credential-bound registry namespace; zero only for status mode `none` |
| 35 | `statusRoot` | `Bytes<32>` | Accepted status root; equality alone is not non-membership proof |
| 36 | `statusRegistryVersion` | `Uint<64>` | Exact accepted registry version, or zero for status mode `none` |
| 37 | `statusFreshnessPolicyDigest` | `Bytes<32>` | Version floor, maximum age, and accepted time-unit policy |
| 38 | `statusEvidenceDigest` | `Bytes<32>` | Mode-specific evidence binding or canonical `not-required` binding |
| 39 | `timeMode` | `Uint<8>` | Explicit no-time-policy, ledger, or attested mode |
| 40 | `trustedTime` | `Uint<64>` | Ledger-derived time or bounded accepted attested time |
| 41 | `timeEvidenceDigest` | `Bytes<32>` | Time-source evidence binding or canonical `not-required` binding |
| 42 | `artifactManifestDigest` | `Bytes<32>` | Exact proving/verifying artifact set |
| 43 | `artifactEvidenceDigest` | `Bytes<32>` | Manifest/deployment authority evidence binding |
| 44 | `nullifierMode` | `Uint<8>` | `0` for `none`, `1` for `required` |
| 45 | `replayPolicy` | `Uint<8>` | Configured request, holder-action, or credential-action scope |
| 46 | `replayScopeDigest` | `Bytes<32>` | Contract-derived scope for the configured replay policy |
| 47 | `decisionNullifier` | `Bytes<32>` | Independently derived nullifier or the canonical zero digest |

Presence and absence are controlled by explicit mode fields, not by guessing
from a digest. For status mode `none`, registry, root, version, and freshness
policy are zero; `statusEvidenceDigest` hashes the canonical `not-required`
status binding. For an enabled status mode, `statusRoot` may legitimately be
all-zero when that is the authenticated empty-set root; it is not an absence
sentinel. An implementation MUST NOT silently replace missing required
evidence with zero.

### Canonicalization boundary

Text identifiers use this exact digest framing:

```text
SHA-256(UTF8(domain) || 0x00 || uint32be(byteLength) || canonicalUtf8Bytes)
```

The field's domain is `midnight:vc:<field-name>:v1`. DID URLs use the DID
method's canonical form; origins use the connector's origin rules; OID4VC
identifiers use their profile rules; schema, policy, artifact, and deployment
identifiers use their signed manifest formats. Raw 32-byte protocol values such
as challenges are copied only when the owning protocol already defines them as
uniform `Bytes<32>`; otherwise they use the framing above.

Structured digests use `persistentHash<OwnedRecordV1>` over a fixed Compact
record whose first fields
are the record's `Bytes<32>` domain tag and `Uint<16>` version. The owning
specification MUST publish the complete field order, code points, absence
rules, and cross-runtime vectors before a final profile may consume that
digest. The minimum owned records are:

| Transcript digest | Owning record must bind |
| --- | --- |
| `credentialBindingDigest` | `CredentialBindingV1` or hidden commitment defined below |
| `holderBindingDigest` | `HolderBindingV1` defined below |
| `consentDigest` | `ConsentBindingV1` defined below |
| `presentationBindingDigest` | `PresentationBindingV1` defined below |
| `disclosureDigest` | Ordered disclosed field identifiers and disclosure mode, not values |
| `predicateDigest` | Ordered predicate identifiers, operators, public thresholds, and result commitments |
| `trustScopeDigest` | Issuer, verifier, schema, role, network, and policy scope |
| `statusFreshnessPolicyDigest` | Version floor, max age, time unit, and accepted status mode |
| `policyDigest` | Policy identifier/version and every policy parameter |
| `actionInvocationDigest` | Action class plus exact target, recipient, resource, amount, and typed arguments |
| `replayScopeDigest` | The exact policy-specific fields defined under Decision nullifier |
| evidence digests | The corresponding `EvidenceBindingV1` record below |

The core-owned records have this exact field order:

```text
CredentialBindingV1 {
  domain: Bytes<32>, version: Uint<16>, mode: Uint<8>,
  credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>,
  verifierContractDigest: Bytes<32>, challengeDigest: Bytes<32>,
  credentialRoot: Bytes<32>
}

HolderBindingV1 {
  domain: Bytes<32>, version: Uint<16>, mode: Uint<8>,
  verifierContractDigest: Bytes<32>, challengeDigest: Bytes<32>,
  subjectBindingDigest: Bytes<32>
}

ConsentBindingV1 {
  domain: Bytes<32>, version: Uint<16>, profile: Uint<8>,
  networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>,
  deploymentDigest: Bytes<32>,
  audienceDigest: Bytes<32>, originMode: Uint<8>, originDigest: Bytes<32>,
  requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<64>,
  credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>,
  disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>,
  statusMode: Uint<8>, statusRegistryDigest: Bytes<32>,
  statusRoot: Bytes<32>, statusRegistryVersion: Uint<64>,
  statusFreshnessPolicyDigest: Bytes<32>,
  policyDigest: Bytes<32>, actionClassDigest: Bytes<32>,
  actionInvocationDigest: Bytes<32>, artifactManifestDigest: Bytes<32>,
  replayPolicy: Uint<8>
}

PresentationBindingV1 {
  domain: Bytes<32>, version: Uint<16>,
  credentialBindingDigest: Bytes<32>, holderBindingDigest: Bytes<32>,
  disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>,
  consentDigest: Bytes<32>
}
```

Their exact ASCII domains are
`midnight:vc:credential-binding:v1`,
`midnight:vc:holder-binding:v1`, `midnight:vc:consent-binding:v1`, and
`midnight:vc:presentation-binding:v1` respectively.

Explicit credential mode hashes `CredentialBindingV1`. Hidden credential mode
uses `persistentCommit<CredentialBindingV1>(binding, presentationOpening)`;
the root and opening remain private while verifier, challenge, family, and
schema are constrained. The presentation proof MUST recompute the credential,
holder, consent, and presentation bindings. A runtime-supplied digest is not
sufficient.

Family-, status-, policy-, and product-owned records remain typed extension
points because their fixed Compact shapes depend on the selected family or
composition. A1 tests the exact core records and a named synthetic extension
record. Each concrete extension MUST publish its exact ordered record and
cross-runtime vectors before A3 can advertise it.

The runtime MAY prepare those digests, but the final contract MUST constrain
them against verified evidence or initialized policy. Transcript inclusion
alone does not confer authority.

## Public inputs and evidence bindings

The logical public-input contract is:

```text
VerificationPublicInputsV1 {
  transcript: VerificationTranscriptV1,
  issuerEvidence: EvidenceBindingV1,
  trustEvidence: EvidenceBindingV1,
  statusEvidence: EvidenceBindingV1,
  timeEvidence: EvidenceBindingV1,
  artifactEvidence: EvidenceBindingV1,
  connectorEvidence: EvidenceBindingV1
}

EvidenceBindingV1 {
  domain: Bytes<32>,
  version: Uint<16>,
  mode: Uint<8>,
  authorityDigest: Bytes<32>,
  subjectDigest: Bytes<32>,
  stateAnchorDigest: Bytes<32>,
  statementDigest: Bytes<32>,
  createdAt: Uint<64>,
  expiresAt: Uint<64>
}
```

Each evidence domain is the SHA-256 domain tag for the exact ASCII identifier
`midnight:vc:evidence:<issuer|trust|status|time|artifact|connector>:v1`.
The matching transcript evidence field MUST equal
`persistentHash<EvidenceBindingV1>(binding)`. `AnchorEvidenceReceiptV1` hashes
this fixed record:

```text
AnchorEvidenceReceiptV1 {
  domain: Bytes<32>,
  version: Uint<16>,
  issuerEvidenceDigest: Bytes<32>,
  trustEvidenceDigest: Bytes<32>,
  statusEvidenceDigest: Bytes<32>,
  timeEvidenceDigest: Bytes<32>,
  artifactEvidenceDigest: Bytes<32>,
  connectorEvidenceDigest: Bytes<32>
}
```

Its domain is the SHA-256 tag for
`midnight:vc:anchor-evidence-receipt:v1`; version is `1`. Each field is the
`persistentHash<EvidenceBindingV1>` of the corresponding binding in the order
shown in `VerificationPublicInputsV1`.

`mode: not-required` has zero authority, subject, anchor, statement, and time
fields and is used only when the profile explicitly does not require that
evidence class. `mode: unavailable` has zero authority, anchor, statement, and
time fields; its `subjectDigest` is the verifier/challenge-scoped subject for
which evidence was requested. It always produces
`indeterminate/notEvaluated`. A final ledger profile MUST constrain every
required binding to an accepted mode, authority, subject, anchor, statement,
and freshness interval.

`originMode: local-request` is valid only for `offchain-public-v1`. A ledger
profile that makes origin part of authorization MUST use
`originMode: wallet-attested`, require `authority-attested` connector evidence,
and verify that evidence against an accepted connector authority. Its
`statementDigest` MUST equal `consentDigest`. A flow with no origin
semantics uses `originMode: none`, zero origin, and the canonical
`not-required` connector binding.

For `originMode: local-request`, `originDigest` is the framed text digest of the
runtime-observed, connector-canonicalized origin and connector evidence is the
canonical `not-required` binding. It is committed into local consent and policy
evaluation but remains non-authoritative `local-process` metadata. A
caller-asserted origin that the runtime cannot observe uses `originMode: none`
and zero origin instead.

### Profile and evidence compatibility

The final circuit MUST enforce this matrix:

| Profile/authority | Allowed required evidence modes | Additional rule |
| --- | --- | --- |
| `ledger-local-v1` / `ledger-local` | `local-ledger`, or `cryptographic-proof` anchored to locally accepted ledger state | No required binding may use `authority-attested`; status mode is `none`, `same-contract-live`, or locally anchored `external-nonmembership`; origin mode cannot be `wallet-attested` |
| `ledger-attested-v1` / `ledger-attested` | `local-ledger`, locally anchored `cryptographic-proof`, and `authority-attested` | At least one required binding uses `authority-attested`; status mode `authority-attested` requires attested status evidence; wallet-attested origin requires attested connector evidence |
| `offchain-public-v1` / `local-process` | `not-required`, `unavailable`, `local-ledger`, `authority-attested`, or `cryptographic-proof`, but only with entirely public inputs evaluated locally | No private witness, hidden binding, ledger side effect, or ledger receipt; origin is `none` or `local-request`; nullifier/replay mode is `none` |

An optional evidence class uses only `not-required`. A required class cannot
use `not-required`; an unavailable required class returns indeterminate before
any decision. Every profile/evidence/status/origin combination not admitted by
this matrix is malformed and has a negative vector.

Status and time combinations are exhaustive:

| Semantic mode | Required evidence mode | Profile constraint |
| --- | --- | --- |
| status `none` | status `not-required` | Any profile |
| status `same-contract-live` | status `local-ledger` | Any ledger profile; off-chain evaluation remains `local-process` |
| status `external-nonmembership` | status `cryptographic-proof` anchored to accepted ledger state | Any ledger profile; off-chain evaluation remains `local-process` |
| status `authority-attested` | status `authority-attested` | `ledger-attested-v1` only |
| time `none` | time `not-required`, trusted time zero | Any profile whose policy has no time rule |
| time `ledger` | time `local-ledger` | Any ledger profile; off-chain evaluation remains `local-process` |
| time `authority-attested` | time `authority-attested` | `ledger-attested-v1` only |

Authority packages provide the actual ledger state, signature, Merkle path, or
attestation witness needed to prove each binding. Those package-specific
witnesses are not replaced by `statementDigest`; the final Compact adapter MUST
verify the witness and recompute the complete binding. Private paths and
openings remain private. Until the owning package publishes its fixed witness
schema and validation circuit, A1 can implement only the public shape and an
`unavailable -> indeterminate` adapter for that evidence class.

For hidden-holder profiles, every public evidence `subjectDigest` and
`statementDigest` MUST be verifier- and challenge-scoped and bind
`credentialBindingDigest` or `presentationBindingDigest`, never a stable
credential root, holder DID, status handle, or status-handle commitment. The
current prototype `AuthorityAttestedStatusProof`, which exposes a stable status
handle commitment, is not eligible for a hidden-holder final profile. It must
be redesigned as a scoped proof or restricted to an explicit-holder prototype.

## Decision nullifier

For `nullifierMode: required`, the final contract computes:

```text
decisionNullifier = persistentHash<DecisionNullifierMaterialV1>({
  domain,
  version,
  deploymentDigest,
  verifierContractDigest,
  replayPolicy,
  replayScopeDigest
})
```

The material fields are ordered as shown. `domain` is the nullifier v1 domain
tag and `version` is `1`. The verifier composition MUST recompute
`replayScopeDigest` from one of these fixed records selected by ledger policy:

| Policy | Replay-scope record |
| --- | --- |
| `request` | domain, version, deployment, verifier, request ID, challenge, and exact action invocation |
| `holder-action` | domain, version, deployment, verifier, action class, product action-scope parameters, and `ActionHolderBindingV1` |
| `credential-action` | domain, version, deployment, verifier, action class, product action-scope parameters, and `ActionCredentialBindingV1` |

Each record uses `persistentHash` and the domain
`midnight:vc:replay-scope:<request|holder-action|credential-action>:v1`.
The product action-scope parameters are a fixed typed subset of the exact
action invocation, declared by the product contract and included in its
`policyDigest`. They MUST NOT be freely caller-chosen.

The action-scoped bindings have exact core shapes:

```text
ActionHolderBindingV1 {
  domain: Bytes<32>, version: Uint<16>, deploymentDigest: Bytes<32>,
  verifierContractDigest: Bytes<32>, actionClassDigest: Bytes<32>,
  holderSubjectDigest: Bytes<32>
}

ActionCredentialBindingV1 {
  domain: Bytes<32>, version: Uint<16>, deploymentDigest: Bytes<32>,
  verifierContractDigest: Bytes<32>, actionClassDigest: Bytes<32>,
  credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>,
  credentialRoot: Bytes<32>
}
```

Their exact ASCII domains are `midnight:vc:action-holder-binding:v1` and
`midnight:vc:action-credential-binding:v1`. The holder subject or credential
root is derived from the validated private witness where the profile hides it.
The resulting digest is exposed only inside the action-specific replay scope.
These records deliberately exclude request ID and challenge and MUST NOT reuse
the challenge-scoped `HolderBindingV1` or `CredentialBindingV1` digest.

Fresh request IDs and challenges affect only `request` policy. They are
deliberately absent from `holder-action` and `credential-action`, so requesting
a new challenge cannot bypass a product-wide one-time action.

For `nullifierMode: none`, replay policy is `none`; action class, action
invocation, replay scope, and decision nullifier MUST be zero. Such a
verification MUST NOT mutate business or capability state.

`offchain-public-v1` MUST always use this `none` combination. It cannot emit a
one-time-action, replay-protected, or side-effect receipt even when it locally
evaluates public evidence and policy.

For `nullifierMode: required`, the verifier MUST:

1. finish all proof, authority, freshness, and policy checks;
2. derive and compare the nullifier;
3. reject an existing nullifier as `proofStatus: valid` and
   `decisionStatus: replay`;
4. insert the nullifier immediately before the protected write; and
5. perform both writes atomically.

If policy denies a valid proof, the contract SHOULD return
`decisionStatus: policyDenied` without consuming a side-effect nullifier unless
the product explicitly defines denial attempts as one-time. That exception
must have a distinct action/policy digest and negative tests.

## Authority provenance and blockers

| Evidence | V1 requirement | Current blocker or constraint |
| --- | --- | --- |
| Network/deployment | Ledger-initialized context or accepted signed deployment manifest | Caller-provided network IDs are not authoritative |
| DID method/relationship | Active key plus required relationship and accepted DID state | Evidence package belongs to `midnight-did` |
| Trust authorization | Accepted live state or bounded signed epoch | Proof package belongs to `midnight-trust-registry` |
| Status | Accepted root plus actual non-membership, or challenge-bound accepted authority attestation | Root equality is not a non-membership proof; external freshness remains incomplete |
| Time | Ledger-derived time or bounded authority attestation | A caller's clock is not authoritative |
| Artifacts/deployment | Digest-verified build and deployment manifests | ADR-0003/G1 implementation remains pending |
| Browser origin | Accepted wallet/connector attestation binding origin, audience, request, and challenge | Compact cannot observe browser origin directly; without an accepted connector authority it remains local request metadata |

If a required row cannot be satisfied, a final profile MUST fail
`indeterminate/notEvaluated`. An integration MAY continue as
`offchain-public-v1/local-process` only when that profile's public-input and
privacy restrictions are met.

## Failure classification

`invalid/notEvaluated` means accepted evidence was available and proved a
cryptographic or semantic failure, including wrong network/scope, inactive or
wrong-relationship keys, revoked or stale status, unsupported presented status
mode, expired/future evidence, or digest mismatch.

`indeterminate/notEvaluated` means a required authority, witness schema,
resolver result, manifest, trusted-time source, or proof dependency could not
be obtained or authenticated. A required evidence binding in `unavailable`
mode is always indeterminate. Implementations MUST NOT use `indeterminate` for
a credential that accepted status evidence proves revoked or otherwise hard
invalid under the status error taxonomy.

## API responsibilities

- `prepareVerification` normalizes inputs and assembles evidence requests. It
  does not decide validity.
- `preflightVerification` mirrors public checks and reports
  `authority: local-process`.
- `submitLedgerVerification` submits the private witness and public inputs. A
  committed transaction returns `LedgerVerificationReceiptV1`; decoding,
  assertion, submission, or revert failures return
  `LocalVerificationAttemptV1` and never claim ledger authority.
- `verifyPublicOffchain` supports only `offchain-public-v1`, public evidence,
  and no side effects.

No API may accept a preflight success as an instruction to skip final Compact
checks. The final circuit is callable directly in differential tests and must
remain secure without any preparation helper.

## Compatibility and versioning

V1 field order, enum code points, domain constants, digest canonicalization,
and result combinations are a protocol contract. Any incompatible change
requires V2 types, cross-version rejection tests, and a migration plan. A
runtime MUST reject unknown versions and profile/authority combinations.
