# Family-neutral exchange ports

Status: implemented private candidate

## Boundary

`@midnight-ntwrk/credential-exchange` owns directly injected, family-neutral
issuance, presentation, and verification orchestration. Its canonical messages
bind the exact family ID/version and schema ID/version together with the
message kind, media type, and opaque bytes.
Families remain the only owners of encoding and validity.

The package defines:

- `IssuanceAdapter` for offers, requests, issued canonical credentials, holder
  acceptance, and an optional family-owned committed-claim opening port;
- `PresentationAdapter` for canonical requests and presentations;
- `VerificationAdapter` for family-owned verification results;
- `ProtocolMessageAdapter` for transport-only wrapping and unwrapping; and
- injected `IssuerAgent`, `HolderAgent`, and `VerifierAgent` orchestration.

For a committed-private family, the optional opening port creates an opaque
sidecar bound to one recipient and the exact requested claim IDs, echoes and
checks the exact canonical issuance request, validates each value/opening
against the unchanged canonical credential before storage, and selects only
requested subsets later. The request is retained for restart revalidation.
Exchange owns the fail-closed outer recipient/request/persistence boundary; the
authenticated family adapter owns
payload encoding and commitment semantics. Holder acceptance receipts and all
presentation/verifier inputs exclude the sidecar. Persisted private records are
revalidated on restart. The existing confidential issuance channel remains
responsible for sidecar confidentiality; this boundary does not define a new
transport or commitment scheme.

Direct injection into agents remains intentional. Runtime discovery is owned by
the supported `credential-model` package: a generic wallet resolves an
authenticated, exact family/profile/assembly/public-surface record and validates
it with `isInjectedCredentialFamilyAdapterFor(...)` before constructing the
unchanged holder agent. Exchange does not fetch or execute plugins and still
does not define OpenID conformance, HTTP, or DIDComm.

## Outward adapters and compatibility

The existing `@midnight-ntwrk/midnight-did-credentials-protocol` package remains
private outward reference evidence for birth, birth-secret, age-gate, and
standalone flows. Concrete implementations live under
`src/adapters/birth`; existing `src/agents` and root package exports are
compatibility re-exports, so current consumers do not need an import migration.
New family-neutral consumers should depend on `credential-exchange` and inject
their family adapter rather than edit or clone an agent. The compatibility
birth and birth-secret adapters use the shared private-parts result contract,
validate it before holder persistence, and retain it across the existing restart
path without moving family imports inward.

The protocol-neutral `compact-value-v1.base64url` codec is now owned by
`@midnight-ntwrk/credential-compact`. The OpenID package re-exports it for one
compatibility cycle, while family packages such as digital-passport import the
inner owner directly. OpenID and other transports consume canonical bytes; they
do not define core credential or presentation validity.

## Enforced denied edges

Repository guards reject:

- declared or source-level credential-family imports of protocol,
  orchestration, or use-case workspaces;
- any dependency from family-neutral exchange to concrete families or use
  cases; and
- drift in the closed dependency list of the legacy outward reference package.

## Evidence

- `packages/components/orchestration/exchange/src/test/injected-family-agents.test.ts`
  runs the same agents with two injected adapters and proves transport wrapping
  cannot approve a tampered presentation.
- `packages/components/orchestration/exchange/src/test/claim-opening-delivery.test.ts`
  proves exact selective delivery, commitment mismatch/malformed/missing/wrong-
  recipient rejection before persistence, restart revalidation, canonical-byte
  preservation, and privacy snapshots for receipts and verifier payloads.
- `tooling/scripts/workspace-boundary-policy.test.mjs` checks denied edges.
- `tooling/scripts/test-family-neutral-exchange-consumer.mjs` packs the model
  and exchange packages, installs them outside the workspace, type-checks, and
  runs a lifecycle whose generic wallet module imports no concrete family and
  receives its adapter through the authenticated runtime registry contract.
- Compact and OpenID codec suites protect canonical ownership and compatibility.
