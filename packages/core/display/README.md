# @midnight-ntwrk/credential-display

> Maturity: `core`
> Package class: `dist`
> Release stage: `internal`
> Target: incubating H1 display-model foundation

Framework-neutral metadata contracts for privacy-aware credential displays.
This package is an internal incubating foundation and is not a supported or
published UI package.

## Scope

The package defines and validates:

- privacy and sensitivity classifications plus typed disclosure prompts;
- safe issuer branding references and accessibility text;
- BCP 47 locale tags, script, direction, and deterministic ordered fallback;
- explicitly versioned Unicode normalization metadata; and
- canonical versus derived display values.

Derived or transliterated values are always marked `untrusted` and display-only.
They are never credential evidence. Display text is single-line, markup-free,
and rejects Unicode controls and format characters, including bidi controls.
This package does not verify credentials, negotiate locales (its fallback helper
only selects from an ordered caller-provided list), perform transliteration,
make disclosure decisions, fetch branding assets, or provide web/mobile/rendering
adapters. Branding references are HTTPS metadata only; userinfo, queries, and
fragments are rejected.

The generic model deliberately does not define product-specific transliteration
rules. Those rules belong to the credential-family product that owns them and
must include a rule-set identifier and version when represented as display
metadata.

## Example

```ts
import {
  assertDisplayText,
  type DisplayText,
} from "@midnight-ntwrk/credential-display";

const display: DisplayText = {
  value: { kind: "canonical", text: "Example", source: "verified-claim" },
  locale: "en-US",
  direction: "ltr",
  normalization: {
    form: "NFC",
    unicodeVersion: "15.1.0",
    policyVersion: "1.0.0",
  },
  metadata: {
    privacy: "public",
    sensitivity: "public",
    accessibility: { label: "Example" },
    branding: {
      uri: "https://issuer.example/logo.svg",
      altText: "Issuer logo",
    },
  },
};

assertDisplayText(display);
```

## Boundary and maturity

This is an incubating, pure TypeScript workspace with no runtime dependency on
credential verification, Compact, wallets, protocols, or UI frameworks. ADR-
0004 requires evidence from two independent products before these primitives
can become a supported generic package; no graduation is claimed here.
