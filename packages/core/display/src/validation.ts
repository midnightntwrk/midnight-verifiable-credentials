import type {
  BrandingReference,
  DisplayFieldMetadata,
  DisplayText,
  DisplayValue,
  LocaleFallback,
  UnicodeNormalizationPolicy,
} from "./types.js";

const MARKUP = /[<>]/u;
const SCRIPT_PATTERN = /^[A-Z][a-z]{3}$/u;

/**
 * Display text is single-line, markup-free, and excludes all Unicode control
 * and format characters. In particular, tabs/newlines, C0/C1 controls, bidi
 * embeddings/isolates, and invisible format characters are not accepted.
 * Renderers may apply their own product-specific text policy afterwards.
 */
const containsUnsafeUnicodeCharacter = (value: string): boolean =>
  [...value].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return (
      (codePoint >= 0 && codePoint <= 0x1f) ||
      (codePoint >= 0x7f && codePoint <= 0x9f) ||
      codePoint === 0x2028 ||
      codePoint === 0x2029 ||
      /\p{Cf}/u.test(character)
    );
  });
const VERSION_PATTERN = /^[0-9]+(?:\.[0-9]+){1,2}(?:[-+][0-9A-Za-z.-]+)?$/u;

export const assertSafeText = (value: string, field = "text"): void => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be non-empty text`);
  }
  if (MARKUP.test(value) || containsUnsafeUnicodeCharacter(value)) {
    throw new TypeError(
      `${field} must not contain markup, Unicode controls, or format characters`,
    );
  }
};

export const canonicalizeLocale = (locale: string): string => {
  if (typeof locale !== "string" || locale.trim() !== locale || locale.length === 0) {
    throw new TypeError("Locale must be a non-empty BCP 47 tag");
  }
  try {
    const [canonical] = Intl.getCanonicalLocales(locale);
    if (canonical === undefined) {
      throw new TypeError("Locale must be a non-empty BCP 47 tag");
    }
    return canonical;
  } catch {
    throw new TypeError(`Invalid BCP 47 locale: ${locale}`);
  }
};

export const assertScript = (script: string): void => {
  if (!SCRIPT_PATTERN.test(script)) {
    throw new TypeError("Script must be a four-letter ISO 15924 code");
  }
};

export const assertNormalizationPolicy = (
  policy: UnicodeNormalizationPolicy,
): void => {
  if (!["NFC", "NFD", "NFKC", "NFKD"].includes(policy.form)) {
    throw new TypeError("Unsupported Unicode normalization form");
  }
  if (!VERSION_PATTERN.test(policy.unicodeVersion)) {
    throw new TypeError("Unicode normalization requires a version");
  }
  if (!VERSION_PATTERN.test(policy.policyVersion)) {
    throw new TypeError("Normalization policy requires a version");
  }
};

export const normalizeLocaleFallback = (input: {
  readonly requested: string;
  readonly ordered: readonly string[];
  readonly defaultLocale: string;
}): LocaleFallback => {
  const requested = canonicalizeLocale(input.requested);
  const defaultLocale = canonicalizeLocale(input.defaultLocale);
  if (input.ordered.length === 0) {
    throw new TypeError("Locale fallback order must not be empty");
  }
  const ordered: string[] = [];
  for (const locale of input.ordered) {
    const canonical = canonicalizeLocale(locale);
    if (!ordered.includes(canonical)) {
      ordered.push(canonical);
    }
  }
  if (!ordered.includes(defaultLocale)) {
    throw new TypeError("Locale fallback order must include the default locale");
  }
  return { requested, ordered, defaultLocale };
};

export const resolveLocale = (
  fallback: LocaleFallback,
  available: readonly string[],
): string | undefined => {
  const availableCanonical = new Set(available.map(canonicalizeLocale));
  return fallback.ordered.find((locale) => availableCanonical.has(locale));
};

export const assertBrandingReference = (branding: BrandingReference): void => {
  assertSafeText(branding.altText, "Branding alt text");
  if (containsUnsafeUnicodeCharacter(branding.uri)) {
    throw new TypeError("Branding URI must not contain Unicode controls or format characters");
  }
  let parsed: URL;
  try {
    parsed = new URL(branding.uri);
  } catch {
    throw new TypeError("Branding URI must be an absolute HTTPS URI");
  }
  if (parsed.protocol !== "https:") {
    throw new TypeError("Branding URI must use HTTPS");
  }
  if (parsed.username !== "" || parsed.password !== "") {
    throw new TypeError("Branding URI must not contain userinfo");
  }
  if (parsed.search !== "" || parsed.hash !== "") {
    throw new TypeError("Branding URI must not contain a query or fragment");
  }
};

const assertDisplayValue = (value: DisplayValue): void => {
  assertSafeText(value.text, "Display value");
  if (value.kind === "derived") {
    if (value.trust !== "untrusted") {
      throw new TypeError("Derived display values must be untrusted");
    }
    assertSafeText(value.ruleSet, "Derived rule set");
    assertSafeText(value.ruleSetVersion, "Derived rule-set version");
  }
};

export const assertDisplayFieldMetadata = (
  metadata: DisplayFieldMetadata,
): void => {
  if (!["public", "selective", "committed", "predicate-only"].includes(metadata.privacy)) {
    throw new TypeError("Unknown privacy class");
  }
  if (!["public", "personal", "sensitive", "highly-sensitive"].includes(metadata.sensitivity)) {
    throw new TypeError("Unknown sensitivity class");
  }
  assertSafeText(metadata.accessibility.label, "Accessibility label");
  if (metadata.accessibility.hint !== undefined) {
    assertSafeText(metadata.accessibility.hint, "Accessibility hint");
  }
  if (metadata.disclosure !== undefined) {
    assertSafeText(metadata.disclosure.label, "Disclosure prompt label");
    if (metadata.disclosure.warning !== undefined) {
      assertSafeText(metadata.disclosure.warning, "Disclosure warning");
    }
    if (!["required", "optional", "warning"].includes(metadata.disclosure.kind)) {
      throw new TypeError("Unknown disclosure prompt kind");
    }
  }
  if (metadata.branding !== undefined) {
    assertBrandingReference(metadata.branding);
  }
};

export const assertDisplayText = (display: DisplayText): void => {
  assertDisplayValue(display.value);
  canonicalizeLocale(display.locale);
  if (display.script !== undefined) {
    assertScript(display.script);
  }
  if (!["ltr", "rtl", "auto"].includes(display.direction)) {
    throw new TypeError("Unknown text direction");
  }
  assertNormalizationPolicy(display.normalization);
  assertDisplayFieldMetadata(display.metadata);
};
