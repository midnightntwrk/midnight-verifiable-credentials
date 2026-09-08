# VC Core-Only Issue Disposition

Status: execution ledger for ADR-0016

Date: 2026-09-08

Milestone: [VC Core-Only 0.2.0-rc1](https://github.com/midnightntwrk/midnight-verifiable-credentials/milestone/2)

Tracker: [#539](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/539)

## Rules

- An issue marked `retain` still describes a defect or requirement in the
  target core and must be closed by tested implementation evidence.
- An issue marked `absorb` is replaced by a named core-only issue. Preserve
  applicable tests or security requirements, but do not preserve the original
  architecture.
- An issue marked `remove` closes only after the owning package or behavior is
  deleted or moved and retained core semantics are protected by tests.
- An issue marked `independent` remains valid but does not define the core-only
  package architecture.
- Do not close issues from this ledger merely because ADR-0016 was accepted.
  Close them from the implementation PR that satisfies the recorded exit.

## Core defects and requirements

| Issue | Disposition | Owning work |
| --- | --- | --- |
| [#266](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/266) | Retain if the duplicated `Maybe<T>` remains in the generic Compact source; otherwise close with deletion evidence. | #535 |
| [#267](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/267) | Retain. Direct claims and commitment-backed/private claims must have truthful semantics and negative vectors. | #533, #535 |
| [#272](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/272) | Retain. Holder delivery and confidentiality of claim openings are part of the issuance ceremony. | #533, #534, #535 |
| [#471](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/471) | Retain until the unsafe manifest helper is fixed or removed. No unsafe implementation may be folded into the two core packages. | #534, #535 |
| [#475](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/475) | Retain. Publication rollback must be fixed before `0.2.0-rc1`. | #537 |
| [#477](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/477) | Absorb. Validate retained digest fields or remove the obsolete quality-evidence surface. | #537 |
| [#529](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/529) | Retain. Claim-opening confidentiality is a core issuance security requirement. | #533, #535 |
| [#530](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/530) | Absorb. Keep only generic verification-location semantics and conformance; move DID adapter policy outside core. | #533, #535, #538 |
| [#500](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/500) | Absorb. Preserve generic hidden-holder/status unlinkability requirements without the old profile/deployment framework. | #533, #535 |
| [#501](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/501) | Absorb. Retain package-owned artifact identity and parity only; remove deployment-authority frameworks. | #535, #537 |

## Architecture and feature backlog superseded by ADR-0016

| Issue | Disposition | Owning work |
| --- | --- | --- |
| [#265](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/265) | Remove with the superseded protocol messages. | #536 |
| [#268](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/268) | Remove runtime family discovery from core. Future wallet discovery belongs to an adapter/product repository. | #534, #536 |
| [#470](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/470) | Remove the affected workflow persistence surface; retain a regression only if shared core code survives. | #536 |
| [#472](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/472) | Remove with the OpenID adapter. | #536 |
| [#473](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/473) | Remove with the OpenID adapter. | #536 |
| [#474](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/474) | Remove with the display package. | #536 |
| [#476](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/476) | Remove with the OpenID adapter. | #536 |
| [#481](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/481) | Remove with the display package. | #536 |
| [#487](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/487) | Superseded as the roadmap umbrella. | #539 |
| [#488](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/488) | Absorb only the clean-consumer conformance requirement; remove the family scaffolder. | #533, #538 |
| [#489](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/489) | Superseded by the bounded ADR-0016 configuration decision. | #532 |
| [#490](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/490) | Absorb the canonical generic Compact root requirement; remove family surfaces. | #535 |
| [#491](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/491) | Remove orchestration instead of adding family-neutral workflow ports. Canonical ceremony objects move into core. | #533, #536 |
| [#492](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/492) | Remove provider catalogs and deployment assembly; absorb only bounded semantic configuration validation. | #534 |
| [#493](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/493) | Replace prototype-manifest coverage with normative core vectors and external family validation. | #533, #463 |
| [#494](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/494) | Move DID/trust provider integration outside core; retain only canonical verification inputs. | #534, #538 |
| [#495](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/495) | Move registry authority implementation outside core; retain generic status vocabulary if approved. | #533, #535 |
| [#496](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/496) | Absorb only generic status evidence verification and negative vectors. | #533, #535 |
| [#497](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/497) | Remove deployment-specific trusted-time authority; retain explicit freshness inputs if status remains supported. | #533, #535 |
| [#498](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/498) | Move atomic protected business mutation outside the credential core. | #536 |
| [#499](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/499) | Replace executor orchestration with generic Compact verification and bounded result semantics. | #533, #535 |
| [#502](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/502) | Remove aggregate business decisions from the core model. | #534, #536 |
| [#503](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/503) | Remove OpenID from this repository. A future adapter repository may reopen the work independently. | #536 |
| [#504](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/504) | Relocate maintained university evidence to `midnight-identity-solution-examples`, then remove it here. | #463, #538 |
| [#505](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/505) | Remove the local OpenID use case; future protocol evidence belongs in solution examples or an adapter repository. | #463, #536, #538 |
| [#506](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/506) | Replace the profile/deployment journey with a core-spec and clean-consumer journey. | #533, #538 |
| [#531](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/531) | Remove workflow retry semantics with registry/application orchestration; retain only deterministic core status errors. | #533, #536 |

## Extraction and repository governance

| Issue | Disposition | Owning work |
| --- | --- | --- |
| [#452](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/452) | Move applicable university cleanup to the destination use-case repository; close local-only concerns with deletion. | #463, #538 |
| [#463](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/463) | Retain as the family/use-case extraction owner, narrowed by ADR-0016. | #463 |
| [#466](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/466) | Retain as the migration-ledger prerequisite. The only in-repo survivor may be one minimal synthetic fixture. | #466 |

## Independent governance and maintenance

These issues remain independently valid and should be reconciled with the
smaller repository after migration:

- [#324](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/324): public-readiness controls;
- [#429](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/429): residual CI/evidence concerns that survive the tooling reduction;
- [#441](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/441): production-readiness umbrella, narrowed to the core release;
- [#443](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/443): developer-loop maintenance; and
- [#444](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/444): release authorization and governance.

The dependency dashboard and automated dependency PRs remain ordinary
maintenance. They must not force upgrades for packages that the migration will
delete.
