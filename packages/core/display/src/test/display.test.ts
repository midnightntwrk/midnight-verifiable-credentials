import { describe, expect, it } from "vitest";

import {
  assertBrandingReference,
  assertDisplayText,
  assertSafeText,
  canonicalizeLocale,
  type DisplayText,
  normalizeLocaleFallback,
  resolveLocale,
} from "../index.js";

const normalization = {
  form: "NFC" as const,
  unicodeVersion: "15.1.0",
  policyVersion: "1.0.0",
};

const metadata = {
  privacy: "selective" as const,
  sensitivity: "personal" as const,
  disclosure: {
    kind: "optional" as const,
    label: "Show employee identifier",
  },
  accessibility: {
    label: "Employee identifier",
    hint: "Displayed only after consent",
  },
  branding: {
    uri: "https://issuer.example/logo.svg",
    altText: "Issuer logo",
  },
};

const canonicalDisplay: DisplayText = {
  value: {
    kind: "canonical",
    text: "A-123",
    source: "verified-claim",
  },
  locale: "en-US",
  script: "Latn",
  direction: "ltr",
  normalization,
  metadata,
};

describe("credential display metadata", () => {
  it("canonicalizes BCP 47 locales", () => {
    expect(canonicalizeLocale("en-us")).toBe("en-US");
    expect(() => canonicalizeLocale("not a locale")).toThrow();
    expect(() => canonicalizeLocale("*")).toThrow();
  });

  it("preserves deterministic ordered locale fallback", () => {
    const fallback = normalizeLocaleFallback({
      requested: "fr-ca",
      ordered: ["fr-ca", "fr", "en-US", "en-us"],
      defaultLocale: "en-US",
    });
    expect(fallback).toEqual({
      requested: "fr-CA",
      ordered: ["fr-CA", "fr", "en-US"],
      defaultLocale: "en-US",
    });
    expect(resolveLocale(fallback, ["de-DE", "en-us"])).toBe("en-US");
    expect(resolveLocale(fallback, ["de-DE"])).toBeUndefined();
    expect(() => normalizeLocaleFallback({
      requested: "en-US",
      ordered: ["fr"],
      defaultLocale: "en-US",
    })).toThrow();
  });

  it("rejects markup, controls, bidi formats and unsafe branding references", () => {
    expect(() => assertSafeText("<script>", "label")).toThrow();
    for (const unsafe of [
      "name\rhidden",
      "name\n\thidden",
      "name\u0085hidden",
      "name\u061Chidden",
      "name\u202Bhidden",
      "name\u2066hidden",
      "name\u2028hidden",
      "name\u2029hidden",
    ]) {
      expect(() => assertSafeText(unsafe, "label")).toThrow();
    }
    expect(() => assertBrandingReference({
      uri: "data:text/plain,secret",
      altText: "Logo",
    })).toThrow();
    expect(() => assertBrandingReference({
      uri: "https://user:password@issuer.example/logo.svg",
      altText: "Issuer logo",
    })).toThrow();
    expect(() => assertBrandingReference({
      uri: "https://issuer.example/logo.svg?token=secret",
      altText: "Issuer logo",
    })).toThrow();
    expect(() => assertBrandingReference({
      uri: "https://issuer.example/logo.svg#fragment",
      altText: "Issuer logo",
    })).toThrow();
    for (const uri of [
      "https://issuer.example/logo.svg\n",
      "https://issuer.example/logo.svg\u202E",
    ]) {
      expect(() => assertBrandingReference({ uri, altText: "Issuer logo" })).toThrow();
    }
    expect(() => assertBrandingReference({
      uri: "https://issuer.example/logo.svg",
      altText: "Issuer logo",
    })).not.toThrow();
  });

  it("validates privacy, accessibility, script, direction and normalization metadata", () => {
    expect(() => assertDisplayText(canonicalDisplay)).not.toThrow();
    expect(() => assertDisplayText({
      ...canonicalDisplay,
      script: "latin",
    })).toThrow();
    expect(() => assertDisplayText({
      ...canonicalDisplay,
      direction: "sideways" as DisplayText["direction"],
    })).toThrow();
    expect(() => assertDisplayText({
      ...canonicalDisplay,
      normalization: { form: "NFC", unicodeVersion: "", policyVersion: "1.0.0" },
    })).toThrow();
  });

  it("accepts derived values only with explicit untrusted display-only metadata", () => {
    const derived: DisplayText = {
      ...canonicalDisplay,
      value: {
        kind: "derived",
        text: "A123",
        ruleSet: "example-transliteration",
        ruleSetVersion: "1.0.0",
        trust: "untrusted",
      },
    };
    expect(() => assertDisplayText(derived)).not.toThrow();
    expect(() => assertDisplayText({
      ...derived,
      value: {
        kind: "derived",
        text: "A123",
        ruleSet: "example-transliteration",
        ruleSetVersion: "1.0.0",
        trust: "trusted" as "untrusted",
      },
    })).toThrow();
  });
});
