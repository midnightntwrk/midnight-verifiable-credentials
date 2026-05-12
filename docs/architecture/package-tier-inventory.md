# Midnight VC Package Tier Inventory

Status: canonical package and protocol tier inventory.

Purpose:

- give integrators one authoritative inventory of reusable core, credential
  family, adapter, wiring, demo, and infrastructure packages
- separate reusable core protocols from Layer 3 and Layer 4 wiring protocols
- make package maturity legible without requiring readers to infer stability
  from package presence alone

Related documents:

- overview:
  - [`./overview.md`](./overview.md)
- package boundaries:
  - [`./package-boundaries.md`](./package-boundaries.md)
- package selection:
  - [`../guides/package-selection.md`](../guides/package-selection.md)
- integration surface map:
  - [`../guides/integration-surface-map.md`](../guides/integration-surface-map.md)
- VC maturity backlog:
  - [`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md)

## Package classes

| Class | Meaning | Reusable outside this repo | Dependency direction |
| --- | --- | --- | --- |
| Reusable core package | Canonical VC semantics or Compact-first reusable capability | Usually yes | Must not depend on adapters, orchestration, demos, or integration harnesses |
| Credential-family package | Concrete claim/disclosure/request/predicate family built on the core | Yes | Depends on core packages; higher layers may compose it |
| DID-aware adapter package | Runtime-only DID conversion helpers that adapt DID material into VC shapes | Yes, in DID-aware runtimes | Depends on DID/runtime packages plus VC core; never imported by Compact contracts |
| Transport or orchestration package | Layer 4 runtime, transport, or protocol composition helper | Sometimes, but not as canonical core | Depends downward on core and family packages; core/families must not depend on it |
| Demo / prototype package | Business-facing example or evolving prototype flow | No, except as example source | Depends downward on core/families/capabilities |
| Shared integration infrastructure | Docker/runtime/test harness support | No, except for repo-local testing | Depends outward on runtime/test infrastructure |

## Package inventory

| Package | Class | Current stability | Reusable outside this repo | Notes |
| --- | --- | --- | --- | --- |
| `credentials` | Reusable core package | Reference implementation | Yes | Canonical Compact-first VC/VP core and VC-side status binding vocabulary |
| `credentials-same-holder` | Reusable core package | Reference implementation | Yes | Focused same-holder capability package |
| `credentials-iso-registry` | Reusable core package | Reference implementation | Yes | Shared Compact-native ISO code types |
| `credentials-status-registry` | Reusable core package with prototype trust model | Mixed: core-capability package, evolving trust model | Yes, with prototype status caveats | Registry contract, proof-protocol helpers, and off-chain status builders |
| `credentials-birth` | Credential-family package | Reference implementation | Yes | Simplest explicit-holder family |
| `credentials-birth-secret` | Credential-family package | Reference implementation with prototype status-aware extensions | Yes, with status-path caveats | Hidden-holder reference family |
| `credentials-hello-family` | Credential-family package | Starter / playground | Yes, as a starter reference | Smallest compileable starter family and DID/VC smoke-path base |
| `credentials-dummy-claims` | Credential-family package | Prototype laboratory | Yes, as a claim-surface reference | Broad direct Compact claim-surface and selective-disclosure laboratory |
| `credentials-university-diploma` | Credential-family package | Prototype use-case family | Yes, as a use-case reference | Non-revocable academic diploma family for batch issuance and verifier-policy flows |
| `credentials-offchain-did` | DID-aware adapter package | Reference implementation | Yes | Runtime-only DID conversion helpers |
| `credentials-openid` | Transport or orchestration package | Reference transport-adapter implementation | Yes, with transport-layer scope | OpenID-shaped JSON/domain envelopes around Compact payloads |
| `credentials-protocol` | Transport or orchestration package | Reference orchestration implementation, evolving API | Limited | Off-chain reference agent flows and protocol state management |
| `hello-verifier-contract` | Demo / prototype package | Starter / prototype | No | Smallest verifier-side starter and broad direct claim-surface lab consumer |
| `university-verifier-contract` | Demo / prototype package | Use-case verifier contract | No | Employer and mall verifier-side request builders plus presentation checks over `credentials-university-diploma` |
| `university-protocol` | Transport or orchestration package | Use-case reference orchestration | Limited | Threaded multi-party issuer/student/company/mall flow over `credentials-university-diploma` and `university-verifier-contract` |
| `credentials-demo-contract` | Demo / prototype package | Prototype | No | Layer 3 example business contracts; not a canonical library surface |
| `standalone-environment` | Shared integration infrastructure | Reference integration harness | Limited | Docker-backed standalone test/runtime bootstrap |

## Reusable core protocol inventory

These protocol semantics belong to the reusable VC core or near-core proof
model. They should not be confused with application orchestration.

| Protocol surface | Current owner | Notes |
| --- | --- | --- |
| Generic VC/VP envelope semantics | `credentials` | Canonical credential and presentation model |
| Generic issuance/presentation protocol modules | `credentials` | Core protocol semantics, not app transport |
| Holder-binding semantics | `credentials` | Explicit-holder and hidden-holder base model |
| Same-holder proof capability | `credentials-same-holder` | Reusable capability, not a demo flow |
| VC-side status binding shape | `credentials` | Shared status binding vocabulary |
| Registry-specific status proof protocols | `credentials-status-registry` | Reusable proof-protocol direction, still tied to an evolving trust model |

## Layer 3 and Layer 4 wiring inventory

These protocol surfaces are useful, but they are not the canonical VC core.

| Protocol surface | Current owner | Why it is wiring |
| --- | --- | --- |
| Agent lifecycle orchestration | `credentials-protocol` | Models issuer/holder/verifier workflows above the core |
| Protocol state store and replay helpers | `credentials-protocol` | Runtime session management, not canonical VC semantics |
| Message bus transport seam | `credentials-protocol` | In-process transport simulation |
| University diploma multi-party threaded flow | `university-protocol` | Use-case-specific orchestration above the reusable protocol primitives |
| OID4VCI / OID4VP-shaped envelopes | `credentials-openid` | Transport and domain framing, not Compact authority |
| Standalone environment bootstrap | `standalone-environment` | Integration harness, not reusable protocol semantics |
| Demo verifier/business flows | `credentials-demo-contract` | Business composition examples, not core reusable protocol |

## Reading rules for integrators

1. Start from the smallest package that owns your feature.
2. Treat `credentials` and family packages as the canonical core unless the
   problem is explicitly transport, orchestration, or demo composition.
3. Treat `credentials-protocol` as wiring and orchestration, not as the core
   protocol specification.
4. Treat `credentials-demo-contract` as example source, not as a reusable core
   API.
5. Treat `credentials-status-registry` as reusable but still prototype-shaped
   for trust semantics until the final cryptographic status contract lands.

## Generated compatibility roots

- the top-level `midnight-did-credentials*` symlinks are generated compatibility
  bridges for local tooling and legacy include paths
- they are not package-inventory entries and should not be counted as canonical
  top-level repository areas

## Standard package header

Package READMEs should expose these fields near the top:

- `Tier`
- `Stability`
- `Surface classification`
- `Dependency direction`
- `Reusable outside this repo`

This header is the minimum durable summary that an integrator or architect
should be able to scan before reading deeper package details.
