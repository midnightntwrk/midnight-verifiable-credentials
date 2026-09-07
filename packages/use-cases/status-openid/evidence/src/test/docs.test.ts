import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(new URL(`../../${name}`, import.meta.url), "utf8");

describe("operator and threat evidence", () => {
  it("states actors, seams, fault operations, and evidence limitations", () => {
    const operator = read("operator-guide.md");
    const threat = read("threat-model.md");
    for (const term of ["Northstar Safety Board", "Harbor Plant Access Control", "restart", "idempotency", "network", "proof", "storage", "key custody", "observability"]) {
      expect(`${operator}\n${threat}`).toMatch(new RegExp(term, "i"));
    }
    expect(`${operator}\n${threat}`).toMatch(/production-shaped evidence/i);
    expect(`${operator}\n${threat}`).toMatch(/not production approval/i);
    expect(`${operator}\n${threat}`).toMatch(/local conformance.*not external interoperability/is);
    expect(threat).toMatch(/forged root|revoked|stale|replay|redirect/i);
  });
});
