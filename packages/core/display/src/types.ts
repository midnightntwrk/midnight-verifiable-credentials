/** Privacy classification for a display field; it does not grant disclosure authority. */
export type PrivacyClass =
  | "public"
  | "selective"
  | "committed"
  | "predicate-only";

export type SensitivityClass =
  | "public"
  | "personal"
  | "sensitive"
  | "highly-sensitive";

export type DisclosurePromptKind = "required" | "optional" | "warning";

export interface DisclosurePrompt {
  readonly kind: DisclosurePromptKind;
  readonly label: string;
  readonly warning?: string;
}

export interface AccessibilityText {
  readonly label: string;
  readonly hint?: string;
}

export interface BrandingReference {
  readonly uri: string;
  readonly altText: string;
}

export type TextDirection = "ltr" | "rtl" | "auto";

export type UnicodeNormalizationForm = "NFC" | "NFD" | "NFKC" | "NFKD";

export interface UnicodeNormalizationPolicy {
  readonly form: UnicodeNormalizationForm;
  readonly unicodeVersion: string;
  readonly policyVersion: string;
}

export interface LocaleFallback {
  readonly requested: string;
  readonly ordered: readonly string[];
  readonly defaultLocale: string;
}

export interface CanonicalDisplayValue {
  readonly kind: "canonical";
  readonly text: string;
  readonly source: "verified-claim" | "verified-predicate";
}

/** Derived values are intentionally untrusted and display-only. */
export interface DerivedDisplayValue {
  readonly kind: "derived";
  readonly text: string;
  readonly ruleSet: string;
  readonly ruleSetVersion: string;
  readonly trust: "untrusted";
}

export type DisplayValue = CanonicalDisplayValue | DerivedDisplayValue;

export interface DisplayFieldMetadata {
  readonly privacy: PrivacyClass;
  readonly sensitivity: SensitivityClass;
  readonly disclosure?: DisclosurePrompt;
  readonly accessibility: AccessibilityText;
  /** Optional issuer branding metadata; this package never fetches or renders it. */
  readonly branding?: BrandingReference;
}

export interface DisplayText {
  readonly value: DisplayValue;
  readonly locale: string;
  readonly script?: string;
  readonly direction: TextDirection;
  readonly normalization: UnicodeNormalizationPolicy;
  readonly metadata: DisplayFieldMetadata;
}
