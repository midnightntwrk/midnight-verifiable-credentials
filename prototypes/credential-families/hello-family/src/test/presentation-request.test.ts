import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const modelSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "hello-family-credential",
    "model.compact",
  ),
  "utf8",
);

const helpersSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "hello-family-credential",
    "helpers.compact",
  ),
  "utf8",
);

describe("hello-family presentation request", () => {
  it("keeps an explicit verifier challenge in the request shape", () => {
    expect(modelSource).toContain("verifierChallengeHash");
  });

  it("models direct disclosure gates for the sample primitive claims", () => {
    expect(modelSource).toContain("requireBooleanValueDisclosure");
    expect(modelSource).toContain("requireBytesValueDisclosure");
    expect(modelSource).toContain("requireBigUnsignedValueDisclosure");
    expect(helpersSource).toContain(
      "Hello-family request requires boolean disclosure",
    );
    expect(helpersSource).toContain(
      "Hello-family request requires bytes disclosure",
    );
    expect(helpersSource).toContain(
      "Hello-family request requires bigint-like disclosure",
    );
  });
});
