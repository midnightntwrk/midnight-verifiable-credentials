# Holder-Binding Terminology

Status: canonical naming guide for holder-binding profiles and compatibility
names.

Purpose:

- keep profile names stable across specs, package READMEs, tests, and runbooks
- separate public/runtime adapter names from Compact/core struct names
- prevent compatibility names from being presented as the preferred path for
  new DID-shaped integrations

Related documents:

- profile catalog:
  - [`../spec/profiles.md`](../spec/profiles.md)
- package boundaries:
  - [`./package-boundaries.md`](./package-boundaries.md)
- holder-binding extension plan:
  - [`../plans/holder-binding-extension-plan.md`](../plans/holder-binding-extension-plan.md)
- VC surface-change discipline:
  - [`../guides/vc-surface-change-discipline.md`](../guides/vc-surface-change-discipline.md)

## Canonical Terms

Use these terms when writing new docs or describing new package surfaces.

| Term | Use for | Do not use for |
| --- | --- | --- |
| `holder-binding profile` | The named trust/privacy model carried by a VC/VP family | A specific proof object or transport message |
| `explicit DID holder binding` | On-chain or resolver-backed DID verification-method binding | Offchain DID-shaped adapter values |
| `secret holder binding` | Hidden-holder control through a private holder secret and challenge response | DID-backed holder method references |
| `blinded secret holder binding` | Issuance/presentation flows where the issuer does not learn the final holder-secret anchor | Ordinary explicit DID flows |
| `same-holder composition` | Proving two or three credentials are controlled by the same hidden-holder witness | Generic holder authentication |
| `offchain DID holder binding` | Lightweight DID-shaped runtime adapter profile | Full resolver-backed DID semantics |
| `legacy compatibility Jubjub holder binding` | Minimal public-key binding retained for compatibility and non-DID demos | New DID-shaped work |

## Naming Rules

1. Use `OffchainDIDHolderBinding` for runtime and public TypeScript-facing
   offchain DID adapter surfaces.
2. Keep `OffchainMidnightHolderBinding` only where the text is explicitly about
   the Compact/core struct or compatibility with existing generated Compact
   imports.
3. Use `JubjubHolderBinding` only with legacy, compatibility, minimal demo, or
   non-DID wording.
4. Use `hidden-holder` as the umbrella adjective for privacy-oriented flows,
   but name concrete implementation profiles as `secret holder binding` or
   `blinded secret holder binding`.
5. Use `holder proof` only for the proof/signature over the presentation body.
   Do not use it as a synonym for a holder-binding profile.
6. Use `holder method id` only for the DID verification-method fragment carried
   by explicit/offchain DID profiles.

## Compatibility Names

Compatibility names are allowed when they are explicitly labelled.

Allowed examples:

- `OffchainMidnightHolderBinding` remains the Compact/core struct name.
- `OffchainDIDHolderBinding` is the preferred runtime/public-facing alias.
- `JubjubHolderBinding` remains a legacy compatibility profile for minimal
  public-key demos and non-DID fixtures.

Rejected examples:

- "Use `OffchainMidnightHolderBinding` for new DID-shaped adapters."
- "`JubjubHolderBinding` is the default holder-binding profile."
- "Hidden-holder production support is final."

## Profile Selection Cheat Sheet

| Need | Preferred profile |
| --- | --- |
| Resolver-backed DID verification method is part of the trust model | Explicit DID holder binding |
| Prototype or local demo wants DID-shaped values without full DID deployment | Offchain DID holder binding |
| Holder privacy is the primary requirement | Secret holder binding |
| Issuer should not learn the final holder-secret anchor | Blinded secret holder binding |
| Two or three credentials must be linked to one holder witness in one verifier session | Same-holder composition |
| Minimal non-DID compatibility fixture | Legacy compatibility Jubjub holder binding |

## Release Discipline

Any PR that changes holder-binding profile names, type parameters, exported
helpers, generated Compact literals, or adapter aliases should update:

- [`../spec/profiles.md`](../spec/profiles.md)
- package README files for affected packages
- [`../guides/vc-surface-change-discipline.md`](../guides/vc-surface-change-discipline.md)
- `CHANGELOG.md` when the change is compatibility-significant
- `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md` if reviewers need a
  new checklist item

Run the terminology guard after changing holder-binding profile text:

```bash
npm run check:holder-binding-terminology
```
