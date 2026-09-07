import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { resolveUniversityProtocolRepoPath } from "../testing.js";

type Threat = {
  readonly id: string;
  readonly seam: string;
  readonly control: string;
  readonly tests: readonly string[];
  readonly residualRisk: string;
};

describe("University production evidence threat model", () => {
  it("maps every required boundary to an executable control and residual risk", () => {
    const threats = JSON.parse(
      readFileSync(
        resolveUniversityProtocolRepoPath(
          "packages/use-cases/university/production-evidence-threat-model.json",
        ),
        "utf8",
      ),
    ) as Threat[];

    expect(new Set(threats.map((threat) => threat.seam))).toEqual(
      new Set([
        "process",
        "network",
        "proof-execution",
        "storage-restart",
        "key-custody",
        "replay-idempotency",
        "tampering",
        "observability",
      ]),
    );
    for (const threat of threats) {
      expect(threat.id).toMatch(/^UNI-TM-\d{3}$/u);
      expect(threat.control.length).toBeGreaterThan(10);
      expect(threat.tests.length).toBeGreaterThan(0);
      expect(threat.residualRisk.length).toBeGreaterThan(10);
    }
  });

  it("labels the evidence as non-production-approved in both threat and operator docs", () => {
    for (const relativePath of [
      "packages/use-cases/university/production-evidence-threat-model.md",
      "packages/use-cases/university/operator-guide.md",
      "packages/use-cases/university/README.md",
    ]) {
      const body = readFileSync(resolveUniversityProtocolRepoPath(relativePath), "utf8");
      expect(body).toMatch(/production-shaped evidence/i);
      expect(body).toMatch(/not production (?:or security )?approval|not production-approved/i);
    }
  });
});
