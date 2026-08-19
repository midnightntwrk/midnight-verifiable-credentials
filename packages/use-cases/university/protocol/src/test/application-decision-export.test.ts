import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  assertUniversityProtocolApplicationDecisionsConforms,
  buildUniversityProtocolApplicationDecisionsExport,
  renderUniversityProtocolApplicationDecisionsMarkdown,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID,
  UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
  UniversityProtocolFlowRunner,
} from "../index.js";

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "golden",
);

const readGolden = (name: string): string =>
  readFileSync(path.join(fixtureDir, name), "utf8");

const redactHexStrings = (value: string): string =>
  value.replace(/\b[0-9a-f]{64}\b/gu, "<hex>");

const normalizeGoldenValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return redactHexStrings(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeGoldenValue(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nextValue]) => [
        key,
        normalizeGoldenValue(nextValue),
      ]),
    );
  }
  return value;
};

describe("university protocol application-decisions exporter", () => {
  it("builds stable decisions and trace-level summary counts", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const result = runner.runAll();
    const exported = buildUniversityProtocolApplicationDecisionsExport(
      runner,
      result,
    );

    expect(exported.schemaId).toBe(
      UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_ID,
    );
    expect(exported.schemaVersion).toBe(
      UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_VERSION,
    );
    expect(exported.compatibility).toEqual(
      UNIVERSITY_PROTOCOL_APPLICATION_DECISIONS_SCHEMA_COMPATIBILITY,
    );

    expect(exported.dataset.studentCount).toBe(10);
    expect(exported.dataset.companyCount).toBe(3);
    expect(exported.dataset.discountApplicantCount).toBe(5);
    expect(exported.dataset.batchCount).toBe(2);
    expect(exported.dataset.batchSize).toBe(5);

    expect(exported.participants.companies).toHaveLength(3);
    expect(exported.issuance.byStudent).toHaveLength(10);
    expect(exported.jobApplications.byStudentCompany).toHaveLength(10);
    expect(exported.discounts.byApplicant).toHaveLength(5);

    expect(exported.summary.jobApplications.requested).toBe(10);
    expect(
      exported.summary.jobApplications.accepted +
        exported.summary.jobApplications.rejected +
        exported.summary.jobApplications.verificationFailed +
        exported.summary.jobApplications.duplicate,
    ).toBe(exported.summary.jobApplications.requested);

    expect(exported.summary.discounts.requested).toBe(5);
    expect(
      exported.summary.discounts.accepted + exported.summary.discounts.rejected,
    ).toBe(exported.summary.discounts.requested);

    expect(exported.summary.jobApplications.byCompany).toHaveLength(3);
    expect(exported.summary.discounts.byReason.length).toBeGreaterThanOrEqual(
      0,
    );

    expect(() =>
      assertUniversityProtocolApplicationDecisionsConforms(exported),
    ).not.toThrow();
  });

  it("labels requested, presentation, and credential-body data separately for v1", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolApplicationDecisionsExport(
      runner,
      runner.runAll(),
    );
    const decision = exported.jobApplications.byStudentCompany.find(
      (entry) => entry.studentId === "STU-0002",
    );
    if (!decision) {
      throw new Error("Expected the STU-0002 job-application decision");
    }
    const request = decision.request.dto as {
      readonly requestedDisclosures: readonly string[];
    };
    const submission = decision.submissions[0]?.dto as {
      readonly requestedDisclosures: readonly string[];
      readonly presentationDisclosures: readonly string[];
      readonly directCredentialClaimFields: readonly string[];
      readonly directCredentialClaimsTransported: boolean;
      readonly disclosures: readonly string[];
    };

    expect(request.requestedDisclosures).toContain("honorsCode");
    expect(submission.requestedDisclosures).toEqual(
      request.requestedDisclosures,
    );
    expect(submission.presentationDisclosures).toEqual(
      request.requestedDisclosures,
    );
    expect(submission.directCredentialClaimsTransported).toBe(true);
    expect(submission.directCredentialClaimFields).toContain("studentId");
    expect(submission.disclosures).toEqual(submission.presentationDisclosures);
  });

  it("matches the checked-in JSON golden export", () => {
    setNetworkId("undeployed");

    const runner = new UniversityProtocolFlowRunner();
    const exported = buildUniversityProtocolApplicationDecisionsExport(
      runner,
      runner.runAll(),
    );

    expect(`${JSON.stringify(normalizeGoldenValue(exported), null, 2)}\n`).toBe(
      readGolden("application-decisions-export.golden.json"),
    );
  });

  it("matches the checked-in Markdown golden export", () => {
    setNetworkId("undeployed");
    const runner = new UniversityProtocolFlowRunner();
    const markdown = renderUniversityProtocolApplicationDecisionsMarkdown(
      buildUniversityProtocolApplicationDecisionsExport(
        runner,
        runner.runAll(),
      ),
    );

    expect(redactHexStrings(markdown)).toBe(
      readGolden("application-decisions-export.golden.md"),
    );
  });
});
