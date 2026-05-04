# Midnight Credentials

Version: `0.1-draft`

Status: Normative working draft

Repository scope: `midnight-verifiable-credentials`

## Abstract
This document defines the current normative working draft for Midnight-native
Verifiable Credentials (VCs) and Verifiable Presentations (VPs).

The specification is Compact-first. Compact structs, circuits, and generated
runtime codecs are the canonical representation. JSON, OpenID, and other web
transport layers are informative adapters around that canonical model.

This draft defines:

- the canonical Compact-native VC/VP data model
- proof and verification requirements
- deterministic serialization expectations
- the role of holder-binding profiles
- repository-level document authority boundaries

This draft does not define a final standards-track publication process or a
final interoperable web wire format.

## Status And Authority
This document is normative for the current repository draft.

Implementations in this repository should treat this document as the primary
statement of:

- canonical VC/VP semantics
- canonical serialization boundary
- verification expectations
- scope of holder-binding profile selection

Companion documents have narrower roles:

- normative companion documents:
  - [`./profiles.md`](./profiles.md)
  - [`./conformance.md`](./conformance.md)

Those normative companion documents are authoritative within their narrower scopes:

- `profiles.md` owns the current holder-binding and verification profile catalog
- `conformance.md` owns the repository's conformance categories and non-conformance examples

This document takes precedence only where a broader repository-level requirement in this document overlaps with a narrower companion rule.
- informative documents:
  - [`../guides/midnight-credentials-for-dummies.md`](../guides/midnight-credentials-for-dummies.md)
  - [`../guides/package-selection.md`](../guides/package-selection.md)
  - [`../architecture/overview.md`](../architecture/overview.md)
  - [`../architecture/dependency-composition.md`](../architecture/dependency-composition.md)
  - [`../testing/test-strategy.md`](../testing/test-strategy.md)
  - [`../testing/test-matrix.md`](../testing/test-matrix.md)
  - [`../decisions/anoncreds-comparison.md`](../decisions/anoncreds-comparison.md)
- plan / roadmap material:
  - [`../plans/holder-binding-extension-plan.md`](../plans/holder-binding-extension-plan.md)

If an informative or plan document conflicts with this document, this document
wins.

## Change Log
### `0.1-draft`

- establishes the Compact-first canonical model for Midnight credentials
- defines generic VC and VP envelopes plus schema-specific specializations
- defines verifier requests as first-class Compact-native structures
- defines the repository's current holder-binding profile model by reference to
  `profiles.md`
- defines canonical serialization and verification rules for repository
  implementations

## Scope
This draft applies to the VC/VP model implemented in the
`midnight-verifiable-credentials` repository.

It covers:

- generic VC/VP envelope semantics
- schema-specialized credential-family semantics
- proof verification boundaries
- deterministic Compact-native serialization expectations
- holder-binding profile selection and verification requirements
- repository-level conformance categories

It does not attempt to define:

- JSON-LD canonicalization rules
- JWT or SD-JWT as canonical signing inputs
- a final production blind-issuance standard
- a privacy-preserving revocation design
- a universal dynamic claim-map model
- a final OpenID or HTTP interoperability profile
- a general-purpose DID resolution standard
- a final interoperable rejection wire format for every protocol adapter

## Normative Language
The key words `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` in this
document are to be interpreted as requirement-level statements for
repository-aligned implementations.

## Objectives
An implementation aligned to this draft should provide a credential model that:

- is directly consumable by Midnight Compact contracts
- preserves typed, bounded, schema-specific layouts
- supports selective disclosure over committed claims
- supports zero-knowledge predicates over hidden claims where the concrete
  credential family defines them
- supports multiple holder-binding profiles without changing the generic VC/VP
  envelope model
- keeps transport and application protocol concerns outside the canonical
  signing and verification model

## Terminology

| Term | Meaning in this specification |
| --- | --- |
| `VC` | A typed Midnight credential envelope with schema-defined claims and an issuer proof |
| `VP` | A typed Midnight presentation envelope with bounded disclosures and holder-side presentation semantics |
| `SchemaRef` | A Compact-native schema identifier containing package, schema, and version information |
| `VerificationMethodRef` | A Compact-native DID verification method reference shaped for on-chain Midnight DID verification |
| `Holder binding` | The mechanism that binds a credential or presentation to a specific holder or holder-controlled secret |
| `Body root` | The Compact-computed canonical digest over the credential or presentation body |
| `Credential family` | A concrete schema package that specializes the generic VC/VP model |
| `Profile` | A named holder-binding or verification model with explicit trust boundaries |
| `Transport adapter` | A package or protocol layer that carries Compact values over JSON/OpenID/network envelopes without changing canonical VC/VP semantics |
| `Protocol success result` | A protocol message that confirms a request succeeded and carries the success artifact for that stage |
| `Protocol rejection result` | A protocol message or outcome that confirms a request failed and carries failure semantics instead of a success artifact |

## Canonical Model
### Canonical Representation
The canonical representation of Midnight VC/VP data is the Compact value and
its associated Compact circuits.

Implementations:

- `MUST` treat Compact structs and Compact verification circuits as the source
  of truth for credential and presentation semantics
- `MUST NOT` treat ad hoc JSON objects as canonical signing inputs
- `MAY` expose JSON or OpenID envelopes as transport adapters
- `MUST` recompute Compact-native roots during verification

### Generic Model Elements
The generic VC layer defines repository-wide concepts including:

- schema references
- issuer proofs
- generic credential envelopes
- generic presentation envelopes
- verifier request envelopes
- holder-binding structures and validation helpers

Concrete credential-family packages specialize those concepts with:

- concrete claim layouts
- concrete disclosure layouts
- concrete request layouts
- family-specific predicates
- schema-specific validation circuits

### Credential Families
A credential family implementation:

- `MUST` define a deterministic claim layout
- `MUST` define any supported disclosure layout explicitly
- `MUST` define its verification predicates explicitly
- `MUST NOT` rely on unbounded runtime-defined claim maps as canonical input

The repository currently treats source-fact credentials such as birth or
passport as the preferred model, rather than threshold-specific derived
credentials such as a dedicated "age over 18" credential.

## Holder-Binding Model
The generic VC/VP model is parameterized by holder-binding profile.

A repository-aligned implementation:

- `MUST` state which holder-binding profile or profiles it supports
- `MUST` preserve the binding invariants of the selected profile
- `MUST NOT` silently change holder-binding semantics without documenting a new
  profile or profile revision

The current profile catalog is defined in:

- [`./profiles.md`](./profiles.md)

That companion document defines the current repository profiles, including:

- explicit DID holder binding
- secret holder binding
- blinded secret holder binding
- verifier-domain pseudonym profile
- same-holder composition capability
- offchain DID holder binding
- legacy compatibility Jubjub holder binding

This document does not restate the entire profile catalog. It defines the
normative relationship:

- profiles define profile-specific trust boundaries and matching rules
- the generic VC/VP core defines envelope, proof, and serialization semantics

## Proof And Verification Model
### General Rule
Verification `MUST` be performed against the canonical Compact model.

An implementation `MUST`:

- decode or reconstruct the typed Compact value
- validate the family/profile schema expectations
- recompute the relevant body root in Compact
- verify issuer or holder proofs against the recomputed body root and the
  chosen profile semantics

### Issuer Proofs
Issuer proofs bind the credential body to issuer-controlled verification
material.

A repository-aligned implementation `MUST`:

- compute the credential body root in Compact
- derive the proof challenge from the Compact-native proof context
- reject credentials whose proof input is not consistent with the recomputed
  root

### Presentation Verification
Presentation verification `MUST` preserve both:

- schema/family semantics
- profile-specific holder-binding semantics

A verifier implementation `MUST`:

- validate the presentation envelope and family-specific presentation body
- validate the attached credential and issuer proof unless the surrounding
  protocol explicitly provides a stronger trusted equivalent
- validate any profile-specific holder-binding or holder-witness requirement
- validate any request-satisfaction rules claimed by the presentation flow

### Request Satisfaction
Where a package supports verifier-defined request models, the verifier `MUST`
validate request satisfaction against the schema-specific request semantics of
that credential family.

A request implementation `MUST NOT` be treated as a generic untyped filter over
arbitrary claims.

## Protocol Outcome Semantics
Where a package defines an offer / request / result protocol, that package
`MUST` distinguish between:

- a success result
- a rejection result or rejection outcome

A success result:

- confirms that the protocol stage completed successfully
- carries the success artifact for that stage
- remains bound to the accepted prior message in the thread

A rejection result or rejection outcome:

- confirms that the protocol stage did not complete successfully
- `MUST NOT` be treated as a success artifact with missing fields
- `SHOULD` carry or imply a failure category that distinguishes malformed
  input, mismatch, expiry, replay, or issuer/verifier refusal

Repository-aligned implementations `MUST NOT` collapse success and rejection
semantics into one ambiguous result shape.

### Current repository stance
The current reference protocol layer does not yet define a final interoperable
rejection message family for every protocol.

Today:

- success results are explicit protocol messages
- the reference `credentials-protocol` layer now defines explicit rejection
  messages for blinded-secret issuance and blinded-secret presentation
- the same reference layer now treats duplicate blinded-secret issuance
  deliveries as idempotent re-delivery of the prior outcome
- the same reference layer now treats duplicate blinded-secret presentation
  deliveries as idempotent re-delivery of the prior outcome
- the same reference layer now models explicit offer and request expiry fields
  for blinded-secret issuance and rejects expired sessions before success
- the same reference layer does not yet model explicit message-level expiry
  fields for blinded-secret presentation
- many other rejection outcomes are still modeled as local exceptions at the
  agent boundary

That is acceptable for a reference implementation, but it `MUST NOT` be
described as a final transport/interoperability contract.

## Canonical Serialization
### Core Rule
The canonical VC/VP representation is the Compact value, not JSON.

Implementations:

- `MUST NOT` use `JSON.stringify(...)` as canonical signing or verification
  input
- `SHOULD` serialize VC/VP payloads with generated Compact type descriptors and
  stable runtime framing
- `MAY` use JSON as a transport envelope around encoded Compact payloads

### Compact Runtime Boundary
Repository implementations currently bridge Compact and TypeScript through:

- generated TypeScript types
- generated `pureCircuits`
- generated Compact type descriptors and runtime codecs
- package-level typed transport helpers where provided

The preferred direction is:

1. construct the typed Compact value
2. convert through the generated Compact descriptor/runtime codec
3. frame the runtime value deterministically
4. carry the resulting bytes inside a declared transport envelope
5. decode and reconstruct the typed Compact value before verification

### JSON And OpenID Envelopes
JSON, OpenID, or application-specific payloads are informative outer layers.
They `MUST NOT` redefine:

- canonical body-root computation
- canonical proof challenge inputs
- holder-binding semantics
- schema-specific validation semantics

A transport adapter `MUST` be explicit about:

- payload encoding
- schema and version identity
- which Compact type is expected at decode time

### Unsafe Plain JSON Patterns
Plain JSON is unsafe as a canonical representation because it can corrupt or
weaken Compact-native values such as:

- `bigint`
- `Uint8Array`
- fixed-size vectors
- opaque curve points
- enumerated values without explicit transport rules
- built-in Midnight values such as contract addresses

Therefore:

- JSON `MAY` be used for UX/debugging/transport metadata
- JSON `MUST NOT` replace the canonical Compact serialization boundary

## Transport Adapter Requirements
A transport or domain adapter implementation:

- `MUST` treat Compact payloads as canonical
- `MUST` preserve schema and version identity
- `MUST` reject malformed framing or schema/type mismatches before accepting
  proofs
- `MUST` distinguish between successful protocol outcomes and rejection
  outcomes
- `MUST NOT` redefine proof semantics outside the canonical Compact model

Current repository transport and orchestration surfaces are described in:

- [`../guides/package-selection.md`](../guides/package-selection.md) (informative)
- [`./conformance.md`](./conformance.md)

## Security And Privacy Considerations
### Source-Fact Credentials
Credential families should prefer issuer-attested source facts over derived
threshold credentials where possible. This improves reuse and supports more
privacy-preserving predicate proof reuse.

### Holder-Binding Boundaries
Different holder-binding profiles make different privacy and trust tradeoffs.
Implementations `MUST` document which profile they use and which guarantees are
explicitly not provided.

Examples:

- explicit DID holder binding is less private than hidden-secret binding
- plain secret-holder binding can already be treated as a stable hidden-holder
  proof profile at the Compact/family level, but production deployments still
  need to disclose randomness, storage, revocation, and adapter assumptions
- offchain Midnight DID binding is suitable for lightweight DID-shaped
  prototypes but does not by itself prove resolver-backed DID semantics
- blinded-secret binding has a supported reference issuance/presentation path,
  but it is still not a final blind-issuance transport standard

### Hidden-Holder Production Claims
Repository-aligned implementations `MUST` distinguish between:

- a hidden-holder proof profile
- a hidden-holder issuance/presentation transport contract

For the current repository, `SecretHolderBinding` and
`BlindedSecretHolderBinding` are related but not identical maturity claims.

A production-shaped claim for the plain secret-holder profile `MUST` disclose:

- how holder secrets are generated and stored
- how issuer and holder signing nonces are generated
- which verifier challenge/session correlation rules are authoritative
- whether revocation or non-revocation is implemented
- which external adapter or wire-format assumptions remain outside the package

A production-shaped claim for the blinded-secret profile `MUST` disclose all of
the above and also define:

- offer/request/submission correlation rules
- replay and idempotency behavior
- expiry semantics for each protocol stage
- durable pending-state behavior across retries, restarts, or delayed delivery
- explicit rejection semantics for malformed, mismatched, expired, replayed, or
  refused sessions
- the external adapter/interoperability contract that carries the Compact
  protocol values

Repository note:

- the reference protocol layer now exposes randomness generation behind an
  injectable interface for challenge hashes, issuer nonces, blinding factors,
  and signing nonces
- that interface reduces hardcoded deterministic behavior inside the agents, but
  it does not by itself make the default source production-grade

The current repository reference implementations do not yet satisfy the full
blinded-secret production-shaped claim. They do provide supported reference
issuance and presentation flows with explicit rejection outcomes and documented
deferred areas.

### Mixed Maturity Repository
This repository contains a mix of:

- normative draft material
- reference implementations
- prototype packages
- experimental packages

Implementations `MUST NOT` overstate repository-wide maturity. Maturity and
conformance claims should be package-specific and profile-specific.

## Conformance
Conformance categories and non-conformance examples are defined in:

- [`./conformance.md`](./conformance.md)

At minimum, a repository-aligned implementation should disclose:

- which credential families it implements
- which holder-binding profiles it implements
- which transport or orchestration surfaces it implements
- which test surfaces it executes
- which prototype or deferred security/privacy limitations remain in scope

## Repository Evidence
This repository includes implementation and test evidence for the current draft,
but implementation coverage is not itself the specification.

Implementation evidence and current validation coverage are tracked in:

- [`../testing/test-strategy.md`](../testing/test-strategy.md)
- [`../testing/test-matrix.md`](../testing/test-matrix.md)

Those documents are informative. They help readers understand current coverage,
but they do not override the normative requirements in this document.
