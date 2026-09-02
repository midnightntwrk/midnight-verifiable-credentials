export type BirthClaimId =
  | "subjectId"
  | "legalName"
  | "birthDate"
  | "birthCountryCode";

export type RecoveredBirthClaimOpening =
  | {
      readonly claimId: "subjectId" | "legalName" | "birthCountryCode";
      readonly value: Uint8Array;
      readonly opening: Uint8Array;
    }
  | {
      readonly claimId: "birthDate";
      readonly value: bigint;
      readonly opening: Uint8Array;
    };

type BirthCredentialPrivatePartsLike = {
  readonly claims: {
    readonly subjectId: Uint8Array;
    readonly legalNamePadded: Uint8Array;
    readonly birthDateDays: bigint;
    readonly birthCountryCodePadded: Uint8Array;
  };
  readonly openings: {
    readonly subjectOpening: Uint8Array;
    readonly legalNameOpening: Uint8Array;
    readonly birthDateOpening: Uint8Array;
    readonly birthCountryCodeOpening: Uint8Array;
  };
};

/** Returns only the holder-requested family fields and defensively copies bytes. */
export const recoverBirthClaimOpenings = (
  privateParts: BirthCredentialPrivatePartsLike,
  claimIds: readonly BirthClaimId[],
): readonly RecoveredBirthClaimOpening[] => {
  if (claimIds.length === 0 || new Set(claimIds).size !== claimIds.length) {
    throw new Error("Claim-opening recovery requires unique requested claim IDs");
  }
  return claimIds.map((claimId): RecoveredBirthClaimOpening => {
    switch (claimId) {
      case "subjectId":
        return {
          claimId,
          value: privateParts.claims.subjectId.slice(),
          opening: privateParts.openings.subjectOpening.slice(),
        };
      case "legalName":
        return {
          claimId,
          value: privateParts.claims.legalNamePadded.slice(),
          opening: privateParts.openings.legalNameOpening.slice(),
        };
      case "birthDate":
        return {
          claimId,
          value: privateParts.claims.birthDateDays,
          opening: privateParts.openings.birthDateOpening.slice(),
        };
      case "birthCountryCode":
        return {
          claimId,
          value: privateParts.claims.birthCountryCodePadded.slice(),
          opening: privateParts.openings.birthCountryCodeOpening.slice(),
        };
      default:
        throw new Error(`Unsupported claim ID "${String(claimId)}" for birth family`);
    }
  });
};
