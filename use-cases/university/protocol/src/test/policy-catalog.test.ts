import { describe, expect, it } from "vitest";

import type {
  CompanyRecord,
  UniversityFixtureData,
  UniversityRequestPolicyPresetCatalog,
} from "../testing.js";
import {
  assertUniversityPolicyCatalogAuditPasses,
  buildUniversityPolicyCatalogAudit,
  loadUniversityFixtureData,
  loadUniversityRequestPolicyPresetCatalog,
} from "../testing.js";

const stressDataPaths = {
  university: "use-cases/university/data/stress-100/university.json",
  students: "use-cases/university/data/stress-100/students.json",
  companies: "use-cases/university/data/stress-100/companies.json",
  mall: "use-cases/university/data/stress-100/mall.json",
  issuanceBatches: "use-cases/university/data/stress-100/issuance-batches.json",
  discountApplicants:
    "use-cases/university/data/stress-100/discount-applicants.json",
};

const replaceFirstCompany = (
  fixtureData: UniversityFixtureData,
  update: (company: CompanyRecord) => CompanyRecord,
): UniversityFixtureData => ({
  ...fixtureData,
  companies: [update(fixtureData.companies[0]!), ...fixtureData.companies.slice(1)],
});

describe("university request-policy catalog audit", () => {
  const presetCatalog = loadUniversityRequestPolicyPresetCatalog();

  it("proves readable and stress fixture policies are covered by the shared preset catalog", () => {
    const readableAudit = buildUniversityPolicyCatalogAudit({
      profileId: "readable-10",
      fixtureData: loadUniversityFixtureData(),
      presetCatalog,
    });
    const stressAudit = buildUniversityPolicyCatalogAudit({
      profileId: "stress-100",
      fixtureData: loadUniversityFixtureData(stressDataPaths),
      presetCatalog,
    });

    expect(() =>
      assertUniversityPolicyCatalogAuditPasses(readableAudit),
    ).not.toThrow();
    expect(() =>
      assertUniversityPolicyCatalogAuditPasses(stressAudit),
    ).not.toThrow();
    expect(readableAudit.findings).toEqual([]);
    expect(stressAudit.findings).toEqual([]);
    expect(readableAudit.usedPresetIds).toEqual(Object.keys(presetCatalog).sort());
    expect(stressAudit.usedPresetIds).toEqual(Object.keys(presetCatalog).sort());
    expect(readableAudit.checks).toEqual({
      allFixturePresetsKnown: true,
      allFixtureKindsMatch: true,
      allEmbeddedPoliciesMatchCatalog: true,
      allCatalogPresetsUsed: true,
      allExplicitPolicyFieldsHaveRationale: true,
    });
    expect(readableAudit.coverage).toHaveLength(4);
    expect(
      readableAudit.coverage.every(
        (record) => record.explicitPolicyFields.length > 0,
      ),
    ).toBe(true);
  });

  it("reports missing fixture presets instead of silently accepting drift", () => {
    const fixtureData = replaceFirstCompany(loadUniversityFixtureData(), (company) => ({
      ...company,
      requestPresetId: "missing-policy-preset",
    }));
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData,
      presetCatalog,
    });

    expect(audit.checks.allFixturePresetsKnown).toBe(false);
    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-preset",
          participantId: fixtureData.companies[0]!.companyId,
          presetId: "missing-policy-preset",
          severity: "error",
        }),
      ]),
    );
    expect(() => assertUniversityPolicyCatalogAuditPasses(audit)).toThrow(
      /missing-policy-preset/,
    );
  });

  it("reports embedded fixture policy drift from the canonical preset", () => {
    const fixtureData = replaceFirstCompany(loadUniversityFixtureData(), (company) => ({
      ...company,
      requestPolicy: {
        ...company.requestPolicy,
        requireFinalGradeDisclosure: false,
      },
    }));
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData,
      presetCatalog,
    });

    expect(audit.checks.allEmbeddedPoliciesMatchCatalog).toBe(false);
    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "policy-mismatch",
          field: "requireFinalGradeDisclosure",
          participantId: fixtureData.companies[0]!.companyId,
          severity: "error",
        }),
      ]),
    );
  });

  it("detects fixture policy fields that are silently dropped", () => {
    const fixtureData = replaceFirstCompany(loadUniversityFixtureData(), (company) => {
      const {
        requireFinalGradeDisclosure,
        ...requestPolicy
      } = company.requestPolicy;
      expect(requireFinalGradeDisclosure).toBe(true);
      return {
        ...company,
        requestPolicy,
      };
    });
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData,
      presetCatalog,
    });

    expect(audit.checks.allEmbeddedPoliciesMatchCatalog).toBe(false);
    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "policy-mismatch",
          field: "requireFinalGradeDisclosure",
          participantId: fixtureData.companies[0]!.companyId,
          severity: "error",
        }),
      ]),
    );
  });

  it("ignores staged threshold values until minimum-grade enforcement is enabled", () => {
    const fixtureData = loadUniversityFixtureData();
    const company = fixtureData.companies[0]!;
    const preset = presetCatalog[company.requestPresetId]!;
    const stagedThresholdCatalog: UniversityRequestPolicyPresetCatalog = {
      ...presetCatalog,
      [preset.presetId]: {
        ...preset,
        requestPolicy: {
          ...preset.requestPolicy,
          minimumFinalGrade: 91,
        },
      },
    };
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData,
      presetCatalog: stagedThresholdCatalog,
    });

    expect(audit.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "policy-mismatch",
          field: "minimumFinalGrade",
          presetId: preset.presetId,
        }),
      ]),
    );
    expect(() => assertUniversityPolicyCatalogAuditPasses(audit)).not.toThrow();
  });

  it("reports preset kind, title, and purpose drift explicitly", () => {
    const fixtureData = loadUniversityFixtureData();
    const company = fixtureData.companies[0]!;
    const preset = presetCatalog[company.requestPresetId]!;
    const kindMismatchCatalog: UniversityRequestPolicyPresetCatalog = {
      ...presetCatalog,
      [preset.presetId]: {
        ...preset,
        kind: "mallDiscount",
      },
    };
    const metadataDriftFixture = replaceFirstCompany(fixtureData, (record) => ({
      ...record,
      requestPresetTitle: `${record.requestPresetTitle} drift`,
      requestPolicyPurpose: `${record.requestPolicyPurpose} drift`,
    }));

    const kindAudit = buildUniversityPolicyCatalogAudit({
      fixtureData,
      presetCatalog: kindMismatchCatalog,
    });
    const metadataAudit = buildUniversityPolicyCatalogAudit({
      fixtureData: metadataDriftFixture,
      presetCatalog,
    });

    expect(kindAudit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "kind-mismatch",
          presetId: preset.presetId,
          severity: "error",
        }),
      ]),
    );
    expect(metadataAudit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "title-mismatch",
          participantId: company.companyId,
          severity: "error",
        }),
        expect.objectContaining({
          code: "purpose-mismatch",
          participantId: company.companyId,
          severity: "error",
        }),
      ]),
    );
  });

  it("reports unknown request-policy fields in fixture policies", () => {
    const fixtureData = replaceFirstCompany(loadUniversityFixtureData(), (company) => ({
      ...company,
      requestPolicy: {
        ...company.requestPolicy,
        requireUnexpectedDisclosure: true,
      } as CompanyRecord["requestPolicy"],
    }));
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData,
      presetCatalog,
    });

    expect(audit.checks.allEmbeddedPoliciesMatchCatalog).toBe(false);
    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown-policy-field",
          field: "requireUnexpectedDisclosure",
          participantId: fixtureData.companies[0]!.companyId,
          severity: "error",
        }),
      ]),
    );
  });

  it("reports unknown request-policy fields in catalog presets", () => {
    const preset = presetCatalog["job-application-grade-and-award"]!;
    const expandedCatalog: UniversityRequestPolicyPresetCatalog = {
      ...presetCatalog,
      [preset.presetId]: {
        ...preset,
        requestPolicy: {
          ...preset.requestPolicy,
          requireUnexpectedCatalogDisclosure: true,
        } as typeof preset.requestPolicy,
      },
    };
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData: loadUniversityFixtureData(),
      presetCatalog: expandedCatalog,
    });

    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown-policy-field",
          field: "requireUnexpectedCatalogDisclosure",
          presetId: preset.presetId,
          severity: "error",
        }),
      ]),
    );
  });

  it("requires a human rationale for every explicit disclosure or threshold field", () => {
    const preset = presetCatalog["job-application-grade-and-award"]!;
    const {
      requireFinalGradeDisclosure,
      ...policyRationale
    } = preset.policyRationale;
    expect(requireFinalGradeDisclosure).toBeDefined();
    const incompleteCatalog: UniversityRequestPolicyPresetCatalog = {
      ...presetCatalog,
      [preset.presetId]: {
        ...preset,
        policyRationale,
      },
    };
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData: loadUniversityFixtureData(),
      presetCatalog: incompleteCatalog,
    });

    expect(audit.checks.allExplicitPolicyFieldsHaveRationale).toBe(false);
    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-rationale",
          field: "requireFinalGradeDisclosure",
          presetId: preset.presetId,
          severity: "error",
        }),
      ]),
    );
  });

  it("flags catalog presets that are not exercised by the fixture profile", () => {
    const sourcePreset = presetCatalog["job-application-grade-and-award"]!;
    const expandedCatalog: UniversityRequestPolicyPresetCatalog = {
      ...presetCatalog,
      "job-application-unused-audit-sample": {
        ...sourcePreset,
        presetId: "job-application-unused-audit-sample",
      },
    };
    const audit = buildUniversityPolicyCatalogAudit({
      fixtureData: loadUniversityFixtureData(),
      presetCatalog: expandedCatalog,
    });

    expect(audit.checks.allCatalogPresetsUsed).toBe(false);
    expect(audit.unusedPresetIds).toEqual([
      "job-application-unused-audit-sample",
    ]);
    expect(audit.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unused-preset",
          presetId: "job-application-unused-audit-sample",
          severity: "error",
        }),
      ]),
    );
    expect(() => assertUniversityPolicyCatalogAuditPasses(audit)).toThrow(
      /job-application-unused-audit-sample/,
    );
  });
});
