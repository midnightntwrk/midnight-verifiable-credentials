# Credential-family migration ledger

Status: proposed for owner approval

Machine-readable source: [`credential-family-migration-ledger.v1.json`](./credential-family-migration-ledger.v1.json)

Authority: [ADR-0016](../decisions/0016-core-only-specification-and-implementation.md)

Milestone: [VC Core-Only 0.2.0-rc1](https://github.com/midnightntwrk/midnight-verifiable-credentials/milestone/2)

Tracker: [#466](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/466), under [#463](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/463)

This ledger selects the proposed lifecycle of every concrete family and use-case
workspace currently in the repository. It does not authorize a move or claim
destination acceptance. Approval fields and blockers in the JSON source remain
the review record until the relevant VC and product owners approve them.

An empty supported-profile list is intentional: these private workspaces are
migration evidence, not supported product profiles. The implementation issues
must preserve reusable, schema-neutral semantics as core conformance vectors
before deleting concrete code.

## Proposed disposition

| Inventory | Outcome | Destination or survivor | Execution |
| --- | --- | --- | --- |
| Birth family | Remove | Schema-neutral vectors only | [#547](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/547) |
| Birth-secret family | Remove | Schema-neutral vectors only | [#547](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/547) |
| Hello family | Remove | Replaced by the one synthetic example | [#547](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/547) |
| Dummy-claims family | Remove | Canonical encoding vectors only | [#547](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/547) |
| Mixed-claims family | Remove | Canonical claim-mode vectors only | [#547](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/547) |
| Digital-passport family | Graduate | [`midnight-verifiable-credential-digital-passport`](https://github.com/midnightntwrk/midnight-verifiable-credential-digital-passport) | [#546](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/546) |
| University-diploma family | Graduate, blocked | Independent repository and owner not yet approved | [#544](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/544) |
| Age-gate contract and scenarios | Graduate | [`midnight-identity-solution-examples`](https://github.com/midnightntwrk/midnight-identity-solution-examples) | [#542](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/542) |
| Shared BDD support | Remove | Destination-owned test support, if needed | [#542](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/542) and [#544](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/544) |
| Hello-verifier contract | Reduce to fixture | One private, synthetic, protocol-independent example | [#543](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/543) |
| Status/OpenID evidence | Remove | Git history unless an external owner accepts it | [#545](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/545) |
| University contract, protocol, reporting, and scenarios | Graduate, blocked | `midnight-identity-solution-examples`; owner not yet assigned | [#544](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/544) |

## Approval gate

The ledger remains `proposed` while any required approval is pending. Before
[#466](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/466)
closes:

1. VC maintainers approve each selected outcome.
2. Product or destination owners approve every graduation and handoff gate.
3. University work receives named family and solution owners plus an approved
   independent family repository.
4. The JSON ledger is updated to record approvals and immutable destination
   evidence.

Graduation evidence and destination CI remain human-reviewed links. They do not
belong in a permanent attestation subsystem because this ledger is temporary
migration coordination, not a product authorization mechanism.
Individual rows may clear their blockers as their required approvals arrive
while the overall ledger remains `proposed`; `approved` is valid only after
every row is resolved.

An approved row identifies its accountable owner as a GitHub user/team mention
or as the maintainer group of a named destination repository. Placeholder owner
text cannot satisfy the gate.

Physical migration issues may prepare bounded work after the relevant owners
agree. Deleted workspaces remain as `removed` rows so the inventory does not
silently forget what was removed.

## Deterministic gate

Run:

```sh
pnpm run check:credential-migration-ledger
pnpm run test:credential-migration-ledger
```

The intentionally small gate compares this ledger with every workspace under
`packages/prototypes/credential-families/` and `packages/use-cases/` in the
workspace catalog. It rejects missing, duplicate, or unknown rows, package-name
drift, invalid outcomes, absent issue links, and multiple synthetic fixtures.
Approval and destination validation stay in normal PR review and linked issues.
