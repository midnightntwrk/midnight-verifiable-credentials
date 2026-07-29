# Midnight VC Protocol Classification

Status: architecture guide for separating reusable core protocols from Layer 3
and Layer 4 wiring protocols.

Purpose:

- define which protocol semantics belong to the reusable VC core
- define which protocol semantics belong to Layer 3 business composition
- define which protocol semantics belong to Layer 4 transport and orchestration
- prevent `reference protocol` language from being mistaken for `core reusable
  protocol`

Related documents:

- package tier inventory:
  - [`./package-tier-inventory.md`](./package-tier-inventory.md)
- overview:
  - [`./overview.md`](./overview.md)
- package boundaries:
  - [`./package-boundaries.md`](./package-boundaries.md)
- package selection:
  - [`../guides/package-selection.md`](../guides/package-selection.md)
- credential status:
  - [`../spec/credential-status.md`](../spec/credential-status.md)
- status verification protocol:
  - [`../spec/status-verification-protocol.md`](../spec/status-verification-protocol.md)

## Core rule

A protocol belongs to the reusable core when it defines canonical VC semantics
that higher layers consume.

A protocol belongs to Layer 3 or Layer 4 wiring when it orchestrates,
transports, packages, replays, or simulates those semantics for specific
applications or integration environments.

## Core reusable protocols

These are reusable protocol semantics that should be treated as part of the VC
core or near-core proof model.

| Protocol area | Current owner | Why it is core |
| --- | --- | --- |
| Generic issuance envelope semantics | `credentials` | Defines canonical issuance data and proof relationships |
| Generic presentation envelope semantics | `credentials` | Defines canonical presentation data and verifier challenge binding |
| Holder-binding semantics | `credentials` | Canonical explicit-holder and hidden-holder proof model |
| Same-holder capability | `credentials-same-holder` | Reusable proof composition capability |
| VC-side status binding | `credentials` | Defines what the credential itself commits to |
| Registry-specific status proof protocols | `credentials-status-registry` | Defines verifier-facing status proof vocabulary, even though the trust model is still evolving |

Reading rule:

- if removing the protocol would change the meaning of the VC or VP itself, it
  is probably core

## Layer 3 business-composition protocols

These are business-facing contract composition protocols.

| Protocol area | Current owner | Why it is Layer 3 |
| --- | --- | --- |
| Demo age-gate capability issuance | `credentials-demo-contract` | Business contract example, not reusable base semantics |
| Revocation-aware demo capability issuance | `credentials-demo-contract` | Layer 3 composition over lower validation/proof paths |
| Verifier-chosen acceptance policy composition | application / verifier code | Application trust and business policy, not canonical VC semantics |

Reading rule:

- if the protocol decides what one verifier or contract accepts in one business
  flow, it is Layer 3, not reusable core

## Layer 4 transport and orchestration protocols

These are runtime and transport-facing protocols.

| Protocol area | Current owner | Why it is Layer 4 |
| --- | --- | --- |
| Agent lifecycle orchestration | `credentials-protocol` | Drives party interactions above the core |
| Protocol state stores and replay | `credentials-protocol` | Runtime session handling |
| In-process message bus | `credentials-protocol` | Transport seam, not canonical semantics |
| OpenID-shaped JSON envelopes | `credentials-openid` | Wire/domain adaptation around Compact payloads |
| Standalone environment bootstrap | `standalone-environment` | Integration harness, not reusable protocol semantics |

Reading rule:

- if the protocol can be swapped without changing the meaning of the VC or VP,
  it is wiring or transport

## Status boundary rule

Status is the most important place where the boundary must stay explicit.

Current normalized ownership:

- `credentials`
  - owns VC-side status binding
  - examples:
    - `StatusRegistryRef`
    - `NoStatusBinding`
    - `RegistryBoundStatusBinding`
- `credentials-status-registry`
  - owns verifier-facing status proof protocol and registry-specific helpers
  - examples:
    - `RevokedSetStatusRequest`
    - `AuthorityAttestedStatusProofProtocol`
    - `RevokedSetNonMembershipStatusProofProtocol`

Current state:

- the canonical Compact package layout now reflects this ownership split:
  - family and Layer 3 contracts import shared VC-side binding from
    `credentials`
  - registry-facing proof-protocol Compact types and validators live in
    `credentials-status-registry`
- the remaining status work is no longer package ownership drift; it is the
  final cryptographic status contract under `VC-MAT-20`

## Import guidance

### If you are defining VC or family shape

Import from:

- `credentials`
- family packages
- reusable capability packages such as `credentials-same-holder`

Avoid importing from:

- `credentials-protocol`
- `credentials-openid`
- `standalone-environment`

### If you are defining verifier/business-contract status semantics

Import from:

- `credentials`
  - for shared VC-side binding
- `credentials-status-registry`
  - for registry-facing proof protocols and request helpers

### If you are writing transport or orchestration code

Import from:

- generated/runtime exports of the core and families
- `credentials-openid`
- `credentials-protocol`

Do not treat those packages as the source of canonical VC semantics.

## Anti-patterns

Avoid these mistakes:

1. treating `credentials-protocol` as the core VC protocol package
2. treating `credentials-demo-contract` as a reusable API instead of example source
3. treating OpenID-shaped envelopes as canonical VC semantics
4. multiplying VC shapes when the real difference is only in verifier-facing
   proof protocol or business trust model
5. pushing DID-aware runtime parsing back into `credentials`

## Decision test

When deciding where a new protocol surface belongs, ask:

1. does it define canonical VC meaning, or only move existing meaning through a
   workflow?
2. does it remain valid across many verifier/business applications, or only one
   composition?
3. can a different transport or runtime layer replace it without changing the
   VC or VP semantics?
4. would importing it into packages/core/family Compact code create an upward dependency?

If the answer points to orchestration, transport, replay, or app policy, it is
not a reusable core protocol.
