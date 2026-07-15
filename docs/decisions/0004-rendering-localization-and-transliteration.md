# ADR-0004: Rendering, localization, and transliteration

- Status: Accepted
- Date: 2026-07-15
- Owners: credential product and wallet experience maintainers
- Supersedes: none

## Context

Wallets and relying parties need understandable credential displays on web and
mobile. A rendered card, localized label, and transliterated value have
different security properties from the canonical signed or committed claim.
Putting framework code or an implicit transliteration algorithm in the generic
VC core would blur those properties and couple proof semantics to UI stacks.

## Decision

Credential product repositories own a framework-neutral, privacy-aware display
model. It maps canonical schema fields and verified predicate results to typed
labels, value formats, sensitivity classes, disclosure warnings, issuer
branding references, accessibility text, direction, and locale fallback.

Framework adapters such as plain web, React, React Native, or rendered-image
packages consume that model. They contain no verification, trust, or business
decision logic. A rendered image is derived presentation material and is never
credential evidence.

Locale identifiers use BCP 47. Text handling records script and base direction
where needed and uses an explicitly versioned Unicode normalization policy.
The original-script value remains authoritative unless a product schema says
otherwise.

Transliteration is credential-family and jurisdiction specific. For example, a
digital-passport product may select an ICAO-compatible rule set; the generic
VC core does not define a universal transliterator. Display-only transliteration
is marked derived and untrusted. If verification policy relies on a
transliterated value, the issuer must sign or commit both the source and output
plus the exact rule-set identifier and version.

Only generic locale, direction, and display-model primitives proven useful by
at least two independent credential products should move into this repository.

## Consequences

- Wallets can render consistently without treating UI output as proof.
- Product owners can meet domain-specific language and transliteration rules.
- Adapters must defend against unsafe markup, bidi confusion, accidental
  logging, screenshot leakage, and inaccessible disclosure prompts.
- Platform packages are added only when a real consumer justifies their
  maintenance and release cost.

## Rejected alternatives

- **UI packages in generic core:** introduces framework churn and
  product-specific branding into proof primitives.
- **Transliterate only at display time for policy decisions:** a verifier could
  derive a different value from the one the issuer intended.
- **Rendered credential as evidence:** pixels do not preserve canonical proof,
  status, or trust semantics.

## Follow-up

The neutral display model, locale metadata, passport transliteration profile,
and first adapters are tracked in
[`../plans/vc-maturity-backlog.md`](../plans/vc-maturity-backlog.md).

## References

- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [BCP 47 language tags](https://www.rfc-editor.org/info/bcp47)
- [Unicode Locale Data Markup Language](https://www.unicode.org/reports/tr35/)
- [ICAO Doc 9303](https://www.icao.int/publications/doc-series/doc-9303)
