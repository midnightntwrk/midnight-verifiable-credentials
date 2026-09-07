# ADR-0015: VC-family profile vocabulary and boundaries

- Status: Accepted
- Date: 2026-09-01
- Owners: VC package, security, protocol, and product-integration maintainers
- Supersedes: none

## Context

The composable-family roadmap in
[midnightntwrk/midnight-verifiable-credentials#487](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/487)
requires a versioned profile before a resolver or finite conformance matrix can
be implemented. Existing documents use terms such as “on-chain issuance”,
“presentation execution”, “off-chain verification”, and “supported” for
several different operations and assurance claims. Those ambiguities can hide
authority changes and can accidentally put deployment choices in family
semantics.

[ADR-0013](./0013-reusable-core-and-credential-family-lifecycle.md)
limits this repository's supported output to reusable, schema-neutral packages;
concrete families remain private evidence until they exit to independently
governed repositories. [ADR-0014](./0014-orthogonal-package-architecture.md)
proposes a protocol-neutral `CredentialFamilyDefinition` and family-neutral
ports. This decision fixes the profile boundary without accepting ADR-0014's
still-proposed package graph or implementing the profile schema and resolver,
which remain downstream work after
[#489](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/489).

## Decision

### Canonical operation and authority vocabulary

The following terms are non-overlapping. APIs, manifests, documentation, and
profile identifiers must use the precise term rather than the ambiguous
phrases “on-chain issuance” or “presentation execution”.

| Term | Definition | Does not imply |
| --- | --- | --- |
| **Credential issuance** | Issuer-authorized construction and signing of canonical credential bytes. The operation produces the credential that the holder receives. | Ledger registration, anchoring, status initialization, transport, or business mutation. |
| **Credential registration** | A ledger contract accepts and records a reference or state for an already issued credential after applying its registration policy. | That the ledger created or signed the credential. |
| **Credential anchoring** | A ledger records a digest, commitment, or immutable reference to an already issued credential or issuance event. | Credential acceptance, validity, status, or issuer authorization beyond what the anchor contract explicitly verifies. |
| **Presentation preparation** | A holder or holder-authorized prover selects credentials, disclosures, predicates, and private inputs and constructs the canonical presentation/proof request material. | Cryptographic verification or an authoritative decision. |
| **Proof generation** | A prover uses public inputs and, where required, private witnesses to produce a proof for an exact circuit and artifact identity. | Proof validity, policy approval, result authority, or a protected state transition. |
| **Verification execution** | The canonical Compact verification semantics execute over the bound transcript and evidence at a named location: `ledger` or `local-process`. | Authority; location and result authority are separate fields. |
| **Result authority** | The source permitted to make the recorded decision claim: `local-process`, `ledger-local`, or `ledger-attested`. | A business side effect or production readiness. Only successful committed ledger execution may carry a ledger authority label; submitted, included, finalized-but-reverted, and otherwise uncommitted attempts may not. |
| **Protected business mutation** | A capability grant, registry change, nullifier consumption, or application-state transition guarded by the verification decision. Its location is `none`, `local-process`, or `ledger`. | Verification itself. A ledger mutation must consume replay protection atomically with the mutation. |

`ledger-local` means successful committed ledger execution decided from state
owned by, or read atomically by, the deciding ledger composition.
`ledger-attested` means successful committed ledger execution decided from
challenge-bound evidence and accepted anchors issued by an external authority.
Both are ledger-authoritative results;
the label records where the security-relevant evidence came from.
`local-process` is never promoted to ledger authority by later logging,
anchoring, or transport.

### Separate semantic profile and deployment assembly

`CredentialFamilyDefinition` remains deliberately protocol- and
deployment-neutral. It owns the family schema, canonical claim and presentation
semantics, codecs, and capability requirements. It does not acquire transport,
session, wallet, endpoint, operator, key-custody, or deployment fields.

A separate, versioned `CredentialFamilyProfileV1` is the semantic composition
contract. It references one exact family definition and records every semantic
and security axis, including disabled values; provider capability identifiers
and required versions; Compact entrypoints and circuit identities; privacy and
authority preconditions; compatibility rules with typed reasons; conformance
fixture identities; and references to maturity assessments for explicitly
identified subjects. Unknown fields, omitted axes, unknown capability
identifiers, and combinations without declared evidence fail closed.

A separately versioned `CredentialDeploymentAssemblyV1` owns concrete operator
and environment choices: session and storage implementations, key custody and
signing providers, DID and trust resolvers, wallets/connectors, transport and
network endpoints, proof executors, artifact resolvers, concrete contracts,
and deployment identifiers. It may satisfy a profile requirement but must not
weaken or reinterpret one. Combining a profile and deployment assembly either
produces one exact package/export/circuit/artifact/provider/deployment graph or
path-specific incompatibility errors.

| Contract | Version changes when | Version does not change merely because |
| --- | --- | --- |
| `CredentialFamilyDefinition` | Any identity-bearing family content changes, including backward-compatible additions to schema, canonical bytes, claims, disclosures, predicates, capabilities, artifacts, composition, codecs, or family-owned semantics. | An operator, endpoint, wallet, storage engine, or deployment changes. |
| `CredentialFamilyProfileV1` | Any identity-bearing axis, admitted value, compatibility rule, security precondition, required provider/artifact, or evidence reference changes. | A compatible provider instance or deployment is replaced without changing the profile. |
| `CredentialDeploymentAssemblyV1` | Any identity-bearing provider configuration, immutable input, deployment identity, or concrete resolved graph changes. | The same exact assembly is redeployed without changing its declared identity and immutable inputs. |

Every identity-bearing content change therefore receives a new version;
compatibility determines the semantic-version major, minor, or patch increment,
not whether the identity changes. A profile version and a deployment-assembly version are independent. Resolver
output must bind both exact identities and all immutable artifact and deployment
identities; it is not a third source of policy.

### Initial axis decisions

“Supported” below means admitted by this architecture as an implementation and
evidence target. It is not a claim that the current repository implementation
is complete, standards-conformant, secure, or production-ready; the four
maturity dimensions state those facts independently.

| Axis | Supported initial values | Fixed values | Unsupported or forbidden initial values | Rationale |
| --- | --- | --- | --- | --- |
| Family and schema | One exact `CredentialFamilyDefinition` and family/schema version per credential. | Canonical bytes, claim layout, disclosure, and predicate meaning are family-owned and Compact-defined. | Runtime inference of an unknown family or omitted version. | Prevents protocol and deployment layers from redefining family semantics. |
| Claims and privacy | Public/direct, selectively disclosed, commitment-backed private, and predicate-only fields in family-declared combinations. | The field classification and canonical roots for one family version. | A deployment changing field privacy or sending a required private witness to a public-only executor. | Privacy is semantic, not an operator preference. |
| Holder binding | Explicit DID, secret, and blinded-secret profiles; offchain DID remains a restricted local/reference profile. | One explicit holder-binding mode per credential profile. | Legacy Jubjub as a new DID profile; authoritative same-holder or multi-family decisions before an aggregate decision set binds every child authority chain. | Preserves current evidence without overstating aggregate authority or DID semantics. |
| Issuance operation | `issuer-local-issuance-v1`; separately declared `ledger-registration-v1` or `ledger-anchoring-v1` after issuer-local issuance. | Issuance, registration, and anchoring remain separate operations and receipts. | The generic label “on-chain issuance”; ledger-native credential construction/signing in the initial set. | Reconciles [ADR-0002](./0002-contract-composition-and-registry-governance.md): its former “issuance contract” and “ledger-backed issuance” role means registration or anchoring after issuer-local issuance under this vocabulary. Ledger-native construction/signing is deferred and requires a separate decision. |
| Presentation preparation | Holder/wallet preparation using canonical request and family bytes. | Preparation is outside the deciding ledger transaction. | Verifier construction of holder-private witnesses. | Maintains consent and witness custody boundaries. |
| Proof generation | Holder/wallet-local proving, or an explicitly selected prover that satisfies the profile's witness-disclosure policy. | Exact circuit and digest-addressed proof artifacts. | Sending private witnesses to a public-only or otherwise incompatible prover; proof generation as a synonym for verification. | Prover replaceability must not weaken privacy or validity semantics. |
| Verification and authority | `ledger-local-v1`, `ledger-attested-v1`, and restricted `offchain-public-v1`. | Compact owns validity semantics; authority is always explicit. | Ledger authority for an unconfirmed transaction; `offchain-public-v1` with hidden-holder, private predicate, same-holder, or private status witnesses. | Retains the authority model of ADR-0010 and prevents local preflight from becoming authoritative. |
| Status | Explicit `disabled`, ledger-local status, or challenge-bound authority-attested status with authenticated root/version and required membership or non-membership evidence. | Namespace, authority, failure behavior, and freshness policy when enabled; one canonical no-status value when disabled. | Required status without evidence; observed roots or resolver success as authoritative proof; status-specific packages in a disabled-status resolved graph. | Missing or unauthenticated status evidence is indeterminate, never valid-with-warning. |
| DID and trust | Exact DID method/relationship/network/version evidence and exact trust scope/epoch evidence required by the selected profile. | Evidence requirements are semantic profile fields. | Caller assertions or transport metadata substituting for accepted evidence. | Key and trust provenance are mandatory validity inputs. |
| Trusted time | Canonical `none` with `not-required` evidence when no time-dependent rule exists; otherwise ledger time or independently anchored, challenge-bound attested time accepted by the deciding profile. | Exact freshness and validity policy whenever status, expiry, age, or another decision rule depends on time. | Caller-supplied time with either ledger authority label; `none` when a time-dependent rule exists. | Preserves ADR-0012's explicit no-time mode while requiring time authority whenever policy depends on time. |
| Replay and business mutation | `none`, or ledger mutation with a contract-derived decision nullifier consumed atomically with the protected transition. | Side-effecting ledger profiles use atomic replay protection. | Ledger side effects without atomic replay; local-process results protecting authoritative or irreversible business mutation. | A successful proof must not permit duplicate state transitions. |
| Protocol | Canonical/reference choreography; OID4VCI 1.0 Final and OID4VP 1.0 Final, with DCQL inside OID4VP, as admitted standards targets. | Protocol mappings preserve canonical family bytes and transcript bindings. | Base OIDC as VC issuance/presentation; mandatory DIDComm; WACI as generic verification or revocation semantics. | Follows [ADR-0007](./0007-openid-credential-protocols-and-didcomm.md) without claiming current conformance. |
| Artifacts | Exact Compact entrypoint and circuit semantic identity requirements, plus required artifact classes and digest/trust constraints. | Canonical circuit semantics and artifact acceptance policy. | Concrete build, artifact, contract, or deployment identities in the semantic profile; latest-by-name, mutable, stale, or untrusted artifacts. | Deployment assembly selects the concrete identities, resolver output binds them, and the final deployable composition owns proving artifacts under ADR-0003. |
| Deployment choices | None; deployment is not a semantic profile axis. | Profile requirements and denied dependency edges survive deployment resolution. | Operators, endpoints, keys, storage, wallets, and concrete deployments inside `CredentialFamilyDefinition` or `CredentialFamilyProfileV1`. | Keeps family semantics reusable and preserves ports-and-adapters replacement boundaries. |

The three initial verification profiles have these fixed boundaries:

| Profile | Verification location | Result authority | Private verification inputs | Protected mutation |
| --- | --- | --- | --- | --- |
| `ledger-local-v1` | `ledger` | `ledger-local` after successful committed execution | Allowed when retained by the ledger proof boundary | Optional ledger mutation, atomic with its decision nullifier |
| `ledger-attested-v1` | `ledger` | `ledger-attested` after successful committed execution | Allowed when the selected attestation and proving path preserves the profile privacy contract | Optional ledger mutation, atomic with its decision nullifier |
| `offchain-public-v1` | `local-process` | `local-process` | Forbidden; every security-relevant verification input is public | `none`; advisory/local policy denial only |

### Mandatory deny rules

The profile validator and combined resolver must reject at least these rules
with stable typed reason codes and paths:

| Reason code | Denied combination |
| --- | --- |
| `PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION` | Hidden-holder, private predicate, same-holder, private status, or any other required private verification input with `offchain-public-v1` or another public-only verifier. |
| `STATUS_EVIDENCE_REQUIRED` | Enabled or policy-required status without authenticated namespace, authority, root/version, freshness, and the selected membership/non-membership or attestation evidence. |
| `CALLER_TIME_WITH_LEDGER_AUTHORITY` | Caller-controlled time used by a result labeled `ledger-local` or `ledger-attested`. |
| `ATOMIC_REPLAY_REQUIRED` | A protected ledger side effect without a contract-derived decision nullifier consumed atomically with that side effect. |
| `DISABLED_CAPABILITY_DEPENDENCY` | A disabled capability whose capability-specific runtime, authority, signing, registry, mutation, or transport package remains in the resolved graph. |
| `LEDGER_COMMIT_REQUIRED` | A local attempt, simulation, submitted, included, finalized-but-reverted, or otherwise uncommitted transaction claiming ledger authority. |
| `UNTESTED_COMBINATION` | A combination without an identified conformance fixture and declared evidence disposition. |

Deny rules are compatibility constraints, not hidden selection defaults. They
may forbid a pair but must not silently change either axis.

### Independent maturity dimensions

Every profile-catalog row and every concrete resolved evidence row records all
four dimensions. Each maturity record identifies the subject it assesses; the
four subjects may differ. A value on one dimension never sets, implies, or caps
another automatically. In profile-catalog and concrete resolved-evidence rows,
“supported” without a named maturity dimension or the explicit
“architecturally admitted” meaning is invalid documentation.

| Dimension | Allowed labels | Assessed subject and meaning |
| --- | --- | --- |
| `apiMaturity` | `prototype`, `reference`, `supported` | An exact API/package surface: its stability, ownership, compatibility, and support commitment. |
| `securityMaturity` | `unassessed`, `design-reviewed`, `implementation-reviewed`, `independently-assured` | An exact profile and implementation/evidence identity: review depth and closure or explicit acceptance of findings. |
| `standardsMaturity` | `not-applicable`, `inspired`, `profile-targeted`, `conformant` | An exact protocol/profile implementation: its relationship to a pinned external standard and executable conformance/interoperability evidence. |
| `productionMaturity` | `not-assessed`, `experimental`, `candidate`, `production-approved` | An exact resolved profile, deployment assembly, and named deployment context: runbooks, support, incident response, rollback, and authority dependencies. `not-assessed` is required when that exact subject does not exist. |

`CredentialFamilyProfileV1` carries references to these subject-qualified
maturity records; maturity values do not participate in family semantics or
change the semantic profile version. In particular, production maturity belongs
to the resolved profile-plus-assembly deployment evidence, never to a reusable
semantic profile in isolation. Replacing a deployment assembly invalidates or
requires reassessment of that production record without changing the semantic
profile.

Examples of forbidden inference include: a `supported` API is not thereby
secure, standards-conformant, or production-approved; a `conformant` protocol
mapping is not thereby a supported package; an independently assured prototype
has no automatic compatibility commitment; and a production-shaped use case is
not `production-approved`.

## Consequences

- Stage 1 can preserve a narrow family definition while Stage 2 adds a profile
  and resolver without embedding operator choices.
- Static Compact monomorphization remains valid; no dynamic Compact plugin
  system is required.
- Disabled capabilities must disappear from both the runtime graph and the
  capability-specific build/package graph.
- Profile admission and maturity evidence are separate, so future
  implementations can land incrementally without overstating assurance.
- Protocol, proof, verification, authority, and mutation locations can vary
  independently only where compatibility rules permit.
- The additional versioned contracts and typed incompatibility reasons create
  authoring and migration cost, but make unsafe combinations reviewable and
  testable.

## Rejected alternatives

- **Extend `CredentialFamilyDefinition` with the entire profile.** Rejected
  because protocol, verification-authority, evidence, and conformance choices
  would broaden the family semantic contract and make family code change when
  adapters or assurance profiles change.
- **One manifest containing semantics and deployment.** Rejected because
  operator, endpoint, key-custody, storage, and deployment changes would become
  family/schema changes and could silently weaken profile requirements.
- **Treat registration or anchoring as on-chain issuance.** Rejected because a
  ledger record does not establish who constructed and signed the credential.
- **Infer maturity from package location, use-case realism, or a single
  `supported` flag.** Rejected because API governance, security assurance,
  standards conformance, and production operations require different evidence.
- **Allow arbitrary combinations and document caveats.** Rejected because
  unsupported and unsafe combinations must fail closed before assembly.

## Dissent and open-risk disposition

- **A profile extension would have fewer top-level types.** The additional type
  is accepted to preserve the narrow family-definition boundary. A later ADR
  may unify them only with evidence that protocol and deployment churn does not
  affect family semantics.
- **“On-chain issuance” is familiar shorthand.** Familiarity does not outweigh
  its authority ambiguity. Documentation must name issuance, registration, or
  anchoring explicitly.
- **The admitted value set exceeds current executable support.** Admission is a
  roadmap boundary, not a maturity claim. Every concrete profile remains
  fail-closed until its required resolver, fixture, and four maturity values
  exist.
- **ADR-0014 is still Proposed.** This ADR accepts only the narrow family/profile
  and ports-and-adapters responsibility split needed by #489. It does not
  accept ADR-0014's package names, package count, or full allowed-edge matrix.
- **Aggregate same-holder authority requires the bounded aggregate contract.**
  Existing standalone rows remain non-authoritative compile/composition
  evidence. [`Aggregate Decision Set V1`](../spec/aggregate-decision-set-v1.md)
  now authorizes only passing pair/triple sets that bind every child's complete
  Verification V1 result and issuer, trust, status, time, artifact, and holder
  evidence.
- **Concrete providers and deployments are unresolved.** They are deliberately
  deferred to deployment assembly and downstream implementation issues rather
  than guessed in a semantic decision.

## Follow-up

The schema, typed validator, resolver, provider catalog, denied-edge checks,
prototype migration, and finite coverage generation remain downstream stages
of [#487](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/487).
Scheduling remains with the
[VC production maturity backlog](../plans/vc-maturity-backlog.md). Repository
and concrete-family ownership remain governed by ADR-0013 and
[the repository engineering guide](../../AGENT.md); current package publication
stages remain governed by the
[package release contract](../architecture/package-release-contract.md).
ADR-0014 remains nonbinding package-graph input while Proposed. This ADR does
not close the umbrella, publish a package, select an operator or deployment, or
claim protocol conformance.
