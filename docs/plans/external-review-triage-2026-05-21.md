# External Review Triage, 2026-05-21

Status: processed review input for the active VC backlog.

Scope: four local credential-review notes supplied on 2026-05-21:

- `mn-cred-review-1.md`
- `mn-cred-review-2.md`
- `mn-cred-review-3.md`
- `mn-cred-review-4.md`

The original review notes are not copied into this repository. This file records
the repository decision and execution queue impact.

## Decisions

### 1. Schema Capabilities Belong To Schema Metadata

Finding: `CredentialProtocolFeatures` describes credential-family capability
metadata, but today it is carried by issue/present protocol messages. The
protocol alignment helpers do not validate those booleans, and a verifier or
wallet cannot trust them as schema facts.

Decision:

- Treat protocol `features` as a compatibility transport hint only while the
  repository migrates.
- Add an explicit schema-capabilities concept near `SchemaRef` / family
  descriptors.
- Prefer family-owned validation over per-message feature claims.
- Plan a later surface-changing PR that removes or deprecates wire-level
  feature booleans once adapters and fixtures use schema capabilities.

Backlog slug: `schema-capabilities-layering`.

### 2. Disclosure Shape Should Not Churn Existing Families

Finding: some disclosure structs use `reveal*` booleans plus values where a
Compact `Maybe<T>`-style shape could read more naturally.

Decision:

- Do not rewrite existing disclosure structs solely for style.
- Keep `reveal*` plus value fields valid for current families.
- Allow `Maybe<T>`-style disclosure wrappers only when a new family deliberately
  chooses that representation and the Compact/tooling surface supports it cleanly.

Backlog slug: `disclosure-shape-guidance`.

### 3. University Direct Claims Are Not Privacy-Preserving

Finding: `university-diploma` currently carries all academic facts as direct
claims in `credential.claims` with `NoClaimCommitments`. Its `reveal*` booleans
authorize and validate presentation policy, but they do not hide raw values
from any party that receives the credential body.

Decision:

- Keep the current university family as a readable direct-claim prototype.
- Make the trust boundary explicit in backlog/spec/docs.
- Schedule a production-hardening slice that moves stable identifiers and
  sensitive academic facts into `claimCommitments` with openings or predicate
  witnesses.

Backlog slug: `university-commitment-backed-privacy`.

### 4. Wallets Need Family Resolution Hints

Finding: issuers and verifiers can import known credential-family packages at
compile time, but a generic wallet needs a runtime way to find the right family
adapter for `packageId` / `schemaId`.

Decision:

- Add an optional family-resolution hint outside the canonical Compact
  `SchemaRef` signing root, or introduce an adapter-level descriptor that wraps
  `SchemaRef`.
- Keep Compact schemas bounded and deterministic; do not add unbounded URI
  strings to the canonical Compact `SchemaRef`.
- Document closed-ecosystem behavior until the resolver-hint path is implemented.

Backlog slug: `schema-family-resolution-hints`.

## Execution Order

Recommended stack after the current cleanup base PR:

1. `vc-review-schema-capabilities`
   - add this triage record
   - add schema capability and family-resolution guidance
   - add adapter-level descriptors without changing canonical VC/VP roots

2. `vc-protocol-feature-hint-deprecation`
   - deprecate protocol `features` as authoritative schema facts
   - update fixtures and adapters to read schema capabilities
   - keep compatibility fields only where existing generated surfaces require it

3. `vc-university-privacy-hardening-plan`
   - mark university direct-claim prototype limitations in docs and reports
   - define the commitment-backed diploma-family migration plan
   - add tests that make the current privacy boundary explicit

4. `vc-university-commitment-backed-diploma`
   - migrate sensitive university fields from direct claims to commitments
   - update BDD notes to show openings/presentations rather than raw credential
     bodies where privacy matters

