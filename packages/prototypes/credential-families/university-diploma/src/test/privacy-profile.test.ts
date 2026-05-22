import { describe, expect, it } from "vitest";

import {
  UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS,
  UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
  UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS,
  UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE,
  UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
  type UniversityDiplomaDirectClaimField,
} from "../privacy-profile.js";

type ProductionProfileField =
  | (typeof UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS)[number]
  | (typeof UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES)[number];

type MissingProductionProfileField = Exclude<
  UniversityDiplomaDirectClaimField,
  ProductionProfileField
>;
type ExtraProductionProfileField = Exclude<
  ProductionProfileField,
  UniversityDiplomaDirectClaimField
>;

const productionProfileCoversDirectClaims: MissingProductionProfileField extends never
  ? ExtraProductionProfileField extends never
    ? true
    : never
  : never = true;

describe("university diploma privacy profile metadata", () => {
  it("partitions every direct claim into the public or committed production profile", () => {
    // This mirrors the credential-fixture partition check through the public
    // metadata module so protocol/reporting consumers can rely on this surface.
    expect(productionProfileCoversDirectClaims).toBe(true);
    expect(
      [
        ...UNIVERSITY_DIPLOMA_PRODUCTION_PUBLIC_CLAIM_FIELDS,
        ...UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES,
      ].sort(),
    ).toEqual([...UNIVERSITY_DIPLOMA_DIRECT_CLAIM_FIELDS].sort());
  });

  it("publishes stable metadata for protocol/reporting consumers", () => {
    expect(UNIVERSITY_DIPLOMA_PRIVACY_BOUNDARY.productionTarget).toBe(
      UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE,
    );
    expect(UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE.profile).toBe(
      "production-commitment-v2",
    );
    expect(
      UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE.productionCommitmentFields,
    ).toEqual(UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS);
    expect(UNIVERSITY_DIPLOMA_PRODUCTION_PROFILE.openingPolicy).toContain(
      "high-entropy",
    );
  });

  it("keeps commitment candidate names aligned with commitment-field names", () => {
    expect(
      UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_CANDIDATES.map(
        (field) => `${field}Commitment`,
      ),
    ).toEqual(UNIVERSITY_DIPLOMA_PRODUCTION_COMMITMENT_FIELDS);
  });
});
