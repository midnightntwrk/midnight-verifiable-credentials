# ADR-0006: Existing DApp Connector credentials extension

- Status: Accepted
- Date: 2026-07-15
- Owners: Midnight DApp Connector, wallet, and VC protocol maintainers
- Supersedes: none

## Context

Midnight already publishes `@midnight-ntwrk/dapp-connector-api` and wallets
inject providers beneath `window.midnight`. Creating a second global provider
for credentials would duplicate connection, network, origin, permissions,
version negotiation, and wallet selection. The current connected API does not
yet define a generic extension registry, so this decision requires coordinated
upstream API evolution.

Credential operations also need a higher-level wallet boundary than generic
transaction proving. A DApp must not receive credential inventory, claim
openings, holder secrets, or raw proving witnesses.

## Decision

Extend the existing connected DApp Connector API with a versioned, optional,
namespaced nested extension. The target shape is:

```ts
interface ConnectedAPI {
  readonly extensions?: {
    readonly "org.midnight.credentials"?: MidnightCredentialsConnectorV1
  }
}

interface MidnightCredentialsConnectorV1 {
  readonly version: "1.0"
  getCapabilities(): Promise<CredentialConnectorCapabilities>
  beginIssuance(request: IssuanceStart): Promise<CredentialSession>
  beginPresentation(request: PresentationStart): Promise<CredentialSession>
  getSession(sessionId: string): Promise<CredentialSession>
  cancelSession(sessionId: string): Promise<void>
  subscribe(listener: CredentialSessionListener): Unsubscribe
}
```

The exact TypeScript spelling will be ratified with the upstream connector
maintainers, but these properties are binding:

- no second global object and no VC-specific wallet discovery path;
- extension presence plus `getCapabilities()` provides version and feature
  discovery;
- methods are high-level issuance and presentation operations over existing
  VC protocol messages, not a generic `signData` or witness tunnel;
- the wallet selects credentials and keys, obtains per-operation consent, and
  keeps all private witnesses inside the wallet;
- the wallet creates a presentation; verifier software independently verifies
  it, so the extension does not expose `verifyPresentation` as a trust oracle;
- connection permission is distinct from issuance or disclosure consent;
- injected origin comes from the connector/browser context and cannot be
  supplied by DApp parameters; and
- polling through `getSession` is mandatory even when events are supported, so
  mobile handoff and dropped-event recovery remain reliable.

Sessions use random, origin/network/connection-scoped identifiers and explicit
states: `created`, `awaiting_consent`, `requesting`, `proving`, `submitting`,
`completed`, `rejected`, `failed`, `cancelled`, and `expired`. They map to, but
do not replace, OID `state`/`nonce` and Compact `threadId`, `messageId`, and
`respondsToMessageId`. Exact duplicate messages are idempotent; reuse of an ID
with different bytes is rejected.

Capability discovery reports supported connector and codec versions,
credential families/schema capabilities, holder-binding profiles, status
modes, protocol profiles, and transports. It never returns the user's
credential inventory.

## Consequences

- VC/VP workflows reuse the established Midnight wallet trust and connection
  surface.
- The upstream connector protocol needs an extension registry and compatibility
  rules before the VC package can implement the nested API.
- Web, mobile, and cross-device transports can share session semantics.
- Wallets carry the security burden for origin display, consent, private data,
  durable session recovery, and key selection.

## Rejected alternatives

- **`window.midnightCredentials`:** duplicates provider discovery and creates
  competing permission models.
- **Generic signing or proving method:** exposes low-level material and moves
  credential policy into each DApp.
- **Wallet-side final verification:** confuses presentation construction with
  verifier policy and ledger authority.

## Follow-up

An upstream connector proposal, API prototype, origin/consent threat model, and
injected/mobile conformance harness are tracked in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).

## References

- [`@midnight-ntwrk/dapp-connector-api`](https://www.npmjs.com/package/@midnight-ntwrk/dapp-connector-api)
