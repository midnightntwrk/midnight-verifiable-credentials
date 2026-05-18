# VC Surface Change Discipline

Status: contributor and reviewer guide for changes that alter generated Compact,
runtime, package, or credential-literal surfaces.

Use this guide when a PR changes any surface that downstream code may construct,
import, serialize, or verify directly.

## Why This Exists

Midnight VC packages expose Compact-generated types. Integrators do not only call
TypeScript helpers; they also build credential literals, presentation literals,
request DTOs, and managed contract inputs. A small-looking Compact struct rename
can therefore break:

- fixture JSON and DTO factories
- verifier contracts that import generated managed types
- application code constructing `Credential` or `Presentation` objects
- docs and examples that show exact credential body shape
- stored transcripts and BDD reports used as integration evidence

The main example is the current generic envelope split:

```compact
VC<TPublicClaims, TClaimCommitments, THolderBinding, TStatusBinding>
```

That split intentionally makes the public/direct surface and commitment surface
visible:

- `claims` contains raw public/direct values carried in the signed credential
  body
- `claimCommitments` contains commitment digests for private disclosure or
  predicate-only values
- `NoPublicClaims` marks commitment-only credentials
- `NoClaimCommitments` marks public/direct-only credentials

## Surface-Change Trigger

Treat a PR as a surface change when it alters any of these:

- a Compact `export struct`, `export enum`, `module`, or `export type`
- a generated managed/runtime package subpath
- a root package export, `typesVersions`, or stable `./contract` subpath
- the generic `VC<>`, `VP<>`, holder-binding, or status-binding parameter list
- a credential-family claim struct, disclosure struct, request DTO, or body-root
  helper
- checked-in JSON fixtures, transcripts, or BDD report fields that document
  request/response shape
- public TypeScript factories, validators, or testing helpers used by another
  workspace

When in doubt, assume it is a surface change and document it.

## Required PR Evidence

Every surface-changing PR must include:

- changelog entry under `Unreleased` with `BREAKING:` when literals or imports
  must change
- migration note that names the old and new shape, not just "updated types"
- spec update when semantics change, especially claim representation,
  holder-binding, status-binding, or proof context
- scaffold/template update when new families should follow the new pattern
- README or guide update for the affected package or use case
- focused validation command proving the changed surface still compiles or is
  checked by a guard script

Good PR text:

```md
## Summary
- BREAKING: split `VC<TClaims, ...>` into
  `VC<TPublicClaims, TClaimCommitments, ...>`
- renamed birth-family `BirthCredentialClaims` to
  `BirthCredentialClaimCommitments`

## Migration
- direct-only families now instantiate `NoClaimCommitments`
- commitment-only families now instantiate `NoPublicClaims`
- body-root helpers must pass both `credential.claims` and
  `credential.claimCommitments` for mixed families

## Validation
- npm run check:vc-surface-discipline
- npm run docs:links
```

Bad PR text:

```md
Updated generated types.
```

## Claim-Representation Checklist

For every credential-family change, fill this in before review:

| Field group | Category | Compact location | Presentation behavior |
| --- | --- | --- | --- |
| public metadata | `public` | `credential.claims` | visible with credential body |
| direct gated values | `selectivelyDisclosed` | `credential.claims` | mirrored through request gates |
| private values | `committedPrivate` | `credential.claimCommitments` | opened only when requested |
| private predicates | `predicateOnly` | `credential.claimCommitments` | proven with private witness |

Rules:

- do not place commitment digests inside a public claims struct
- do not call commitment-only structs `*Claims`; use `*ClaimCommitments`
- use `NoPublicClaims` when the family has no public/direct values
- use `NoClaimCommitments` when the family has no private commitments
- mixed families must domain-separate public-claims roots from commitment roots
- presentation validation must compare any mirrored public claims with
  `credential.claims`
- private disclosures and predicates must open against `credential.claimCommitments`

## Scaffold Guidance

The family scaffold supports the current claim boundary explicitly:

```bash
npm run scaffold:family -- --slug example-family --claim-mode commitment
npm run scaffold:family -- --slug example-family --claim-mode public
npm run scaffold:family -- --slug example-family --claim-mode mixed
```

Default to `commitment` when the placeholder field carries a personal identifier,
account identifier, status handle, date, or other potentially correlating value.
Use `public` only for intentionally visible direct values. Use `mixed` when the
family needs both verifier-friendly public metadata and private claim openings or
predicate witnesses.

## Review Gate

Run the guard after touching generated surfaces, templates, claim representation,
or PR/release guidance:

```bash
npm run check:vc-surface-discipline
```

The guard verifies that:

- the PR template asks for surface-change evidence
- the changelog and docs mention the current `claims` / `claimCommitments` split
- the family scaffold can generate public-only, commitment-only, and mixed
  claim-mode skeletons with the correct generic `VC<>` shape

Related references:

- [claim representation spec](../spec/claim-representation.md)
- [family scaffold template](../templates/family-scaffold-template.md)
- [pull request template](../../.github/PULL_REQUEST_TEMPLATE/pull_request_template.md)
- [changelog](../../CHANGELOG.md)
