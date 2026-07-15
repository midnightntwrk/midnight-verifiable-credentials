# ADR-0007: OpenID credential protocols and DIDComm

- Status: Accepted
- Date: 2026-07-15
- Owners: VC protocol, wallet, issuer, and verifier maintainers
- Supersedes: none

## Context

The repository already has OpenID-shaped DTOs and Compact payload framing, but
describes them as inspired by OID4VCI/OID4VP rather than conformant. A
connector-specific issuance and presentation protocol would duplicate standards
work and reduce interoperability. DIDComm provides authenticated, asynchronous,
transport-independent agent messaging, but introduces a second envelope,
routing, mediation, and key-management layer that the primary injected and
mobile handoff flows do not require.

## Decision

OID4VCI 1.0 Final and OID4VP 1.0 Final are the normative issuance and
presentation protocol profiles. Compact-generated bodies remain canonical and
are carried through a versioned Midnight credential format/profile rather than
being redefined as connector-native objects.

The implementation must:

- use OID4VP DCQL and bind every presentation to `client_id`, a fresh `nonce`,
  request/policy digest, and the connector-authenticated origin where present;
- use OID4VCI credential offers, authorization and token flows as applicable,
  and bind proof/issuance requests to issuer audience and `c_nonce`;
- preserve full Compact protocol bytes plus `messageId`, `threadId`, and
  `respondsToMessageId` when mapping to OpenID sessions;
- define one canonical DID URL verification-method reference across OpenID,
  Compact, and the DID ledger instead of a transport-specific method index;
- use request-by-reference and short, random, one-time URIs for QR/deep-link
  handoff; never encode credentials, proofs, or secrets directly in QR data;
- keep OID `state` for callback correlation separate from the verifier nonce;
  and
- define an explicit status policy/request and evidence attachment because
  status is not currently a complete wire exchange in the repository.

Injected web uses the existing DApp Connector credentials extension. Mobile and
cross-device flows use universal/deep links or QR over the same OID sessions.
The W3C Digital Credentials API may become an additional browser adapter after
its contract stabilizes; it is not the core protocol today.

DIDComm 2.x is an optional future transport adapter for asynchronous
agent-to-agent workflows, mediators, store-and-forward delivery, or deployments
that require DID-authenticated encrypted messaging independent of OpenID
endpoints. It must carry the same canonical messages and may not redefine VC
validity or wallet consent. It is not a prerequisite for the initial connector.

## Consequences

- The primary protocol follows finalized interoperable specifications.
- The current OpenID package needs a conformance rewrite, including DCQL and
  executable protocol tests rather than only DTO validation.
- Connector origin binding strengthens browser flows but does not replace OID
  audience, nonce, redirect, and request validation.
- DIDComm can be added for deployments that justify its routing and key
  management cost without delaying injected or mobile OID flows.

## Rejected alternatives

- **Connector-native credential protocol:** duplicates OID4VCI/OID4VP and
  weakens cross-wallet and mobile interoperability.
- **DIDComm as the mandatory base:** adds substantial machinery with no current
  implementation or requirement for the primary flow.
- **Base OIDC identity tokens as credentials:** authentication does not replace
  credential issuance, presentation, status, or ZK proof semantics.

## Follow-up

Final-spec conformance, format registration/profile documentation, status
attachments, mobile handoff, and optional DIDComm work are tracked in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).

## References

- [OpenID for Verifiable Credential Issuance 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)
- [OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)
- [DIDComm Messaging 2.1](https://identity.foundation/didcomm-messaging/spec/)
- [W3C Digital Credentials API](https://www.w3.org/TR/digital-credentials/)
