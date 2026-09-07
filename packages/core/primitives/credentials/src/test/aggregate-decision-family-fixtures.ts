export interface AggregateFamilyEvidenceFixtureV1 {
  readonly fixtureId: string;
  readonly familyId: string;
  readonly schemaId: string;
  readonly holderProfile: "blinded-secret" | "explicit-did";
  readonly statusProfile: "canonical-no-status" | "enabled-local-status";
  readonly authorityProfile: "ledger-local-v1";
  readonly evidenceDisposition: "aggregate-authority-tested";
}

/**
 * Distinct family evidence identities used by the aggregate authority suite.
 * They deliberately contain no claim values, holder identifiers, status
 * handles, proof bytes, or witness openings.
 */
export const aggregateFamilyEvidenceFixturesV1 = Object.freeze({
  birthSecret: Object.freeze({
    fixtureId: "aggregate-v1:birth-secret:no-status",
    familyId: "birth-secret",
    schemaId: "midnight:credential:birth-secret:v1",
    holderProfile: "blinded-secret",
    statusProfile: "canonical-no-status",
    authorityProfile: "ledger-local-v1",
    evidenceDisposition: "aggregate-authority-tested",
  }),
  universityDiploma: Object.freeze({
    fixtureId: "aggregate-v1:university-diploma:local-status",
    familyId: "university-diploma",
    schemaId: "midnight:credential:university-diploma:v1",
    holderProfile: "explicit-did",
    statusProfile: "enabled-local-status",
    authorityProfile: "ledger-local-v1",
    evidenceDisposition: "aggregate-authority-tested",
  }),
} as const satisfies Record<string, AggregateFamilyEvidenceFixtureV1>);
