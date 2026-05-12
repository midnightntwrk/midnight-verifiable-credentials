import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const normalizeWhitespace = (source: string) => source.replace(/\s+/g, " ");

const modelSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "dummy-claims-credential",
      "model.compact",
    ),
    "utf8",
  ),
);

const helpersSource = normalizeWhitespace(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "dummy-claims-credential",
      "helpers.compact",
    ),
    "utf8",
  ),
);

describe("dummy-claims presentation request", () => {
  it("keeps an explicit verifier challenge in the request shape", () => {
    expect(modelSource).toContain("verifierChallengeHash");
  });

  it("models direct request gates for every supported primitive/vector family", () => {
    expect(modelSource).toContain("requireBooleanValueDisclosure");
    expect(modelSource).toContain("requireByteSizedUnsignedValueDisclosure");
    expect(modelSource).toContain("requireMediumUnsignedValueDisclosure");
    expect(modelSource).toContain("requireBigUnsignedValueDisclosure");
    expect(modelSource).toContain("requireBytes16ValueDisclosure");
    expect(modelSource).toContain("requireBytes32ValueDisclosure");
    expect(modelSource).toContain("requireFieldValueDisclosure");
    expect(modelSource).toContain("requireBooleanVectorDisclosure");
    expect(modelSource).toContain("requireUintVectorDisclosure");
    expect(modelSource).toContain("requireBytesVectorDisclosure");
    expect(modelSource).toContain("requireFieldVectorDisclosure");
    expect(modelSource).toContain("requireNestedValueDisclosure");
    expect(modelSource).toContain("requireNestedBooleanValueDisclosure");
    expect(modelSource).toContain("requireNestedBigUnsignedValueDisclosure");
    expect(modelSource).toContain("requireNestedBytesValueDisclosure");
    expect(modelSource).toContain("requireNestedFieldValueDisclosure");
    expect(modelSource).toContain("requireNestedVectorDisclosure");
    expect(helpersSource).toContain(
      "Dummy-claims request requires Boolean vector disclosure",
    );
    expect(helpersSource).toContain(
      "Dummy-claims request requires nested vector disclosure",
    );
  });

  it("keeps nested selective-disclosure gates explicit in the validation helper", () => {
    expect(helpersSource).toContain(
      "Dummy-claims request requires nested disclosure",
    );
    expect(helpersSource).toContain(
      "Dummy-claims nested request requires nested boolean disclosure",
    );
    expect(helpersSource).toContain(
      "Dummy-claims nested request requires nested bigint-like disclosure",
    );
    expect(helpersSource).toContain(
      "Dummy-claims nested request requires nested bytes disclosure",
    );
    expect(helpersSource).toContain(
      "Dummy-claims nested request requires nested field disclosure",
    );
  });
});
