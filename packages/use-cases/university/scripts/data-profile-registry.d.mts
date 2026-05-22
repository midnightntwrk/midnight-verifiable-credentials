export type UniversityDataArtifacts = Readonly<
  Record<
    | "university.json"
    | "companies.json"
    | "mall.json"
    | "students.json"
    | "issuance-batches.json"
    | "discount-applicants.json",
    unknown
  >
>;

export type UniversityDataProfile = {
  readonly profileId: "readable-10" | "cohort-30" | "stress-100";
  readonly studentCount: number;
  readonly batchSize: number;
  readonly companySet: "standard" | "expanded";
  readonly discountApplicantCount: number;
  readonly outputDir: string;
  readonly purpose: string;
  readonly expectedCompanyCount: number;
  readonly absoluteOutputDir?: string;
};

export type UniversityDataProfileSummary = {
  readonly profileId: UniversityDataProfile["profileId"];
  readonly purpose: string;
  readonly outputDir: string;
  readonly studentCount: number;
  readonly batchSize: number;
  readonly issuanceBatchCount: number;
  readonly companySet: UniversityDataProfile["companySet"];
  readonly companyCount: number;
  readonly expectedCompanyCount: number;
  readonly discountApplicantCount: number;
  readonly acceptedDiscountApplicants: number;
  readonly rejectedDiscountApplicants: number;
};

export declare function buildUniversityDataArtifacts(options: {
  readonly studentCount: number;
  readonly batchSize: number;
}): UniversityDataArtifacts;

export declare function buildUniversityDataArtifactsForProfile(
  options: Pick<UniversityDataProfile, "studentCount" | "batchSize"> &
    Partial<
      Pick<UniversityDataProfile, "companySet" | "discountApplicantCount">
    >,
): UniversityDataArtifacts;

export declare function writeUniversityDataArtifacts(
  targetDir: string,
  artifacts: UniversityDataArtifacts,
): void;

export declare function readUniversityDataArtifacts(
  targetDir: string,
): UniversityDataArtifacts;

export declare function checkUniversityDataArtifacts(
  targetDir: string,
  artifacts: UniversityDataArtifacts,
): number;

export declare function validateUniversityDataProfileArtifacts(
  profile: UniversityDataProfile,
  artifacts: UniversityDataArtifacts,
): string[];

export declare function checkUniversityDataProfileLifecycle(
  profile: UniversityDataProfile,
  artifacts: UniversityDataArtifacts,
): number;

export declare function summarizeUniversityDataProfile(
  profile: UniversityDataProfile,
  artifacts: UniversityDataArtifacts,
): UniversityDataProfileSummary;

export declare function renderUniversityDataProfilesMarkdown(): string;

export declare function updateUniversityDataProfilesMarkdown(): void;

export declare function checkUniversityDataProfilesMarkdown(): void;

export declare function listUniversityDataProfiles(): UniversityDataProfile[];

export declare function resolveUniversityDataProfile(
  profileId: UniversityDataProfile["profileId"],
): UniversityDataProfile & { readonly absoluteOutputDir: string };

export declare function universityProfileDataPaths(
  profileId: UniversityDataProfile["profileId"],
): {
  readonly university: string;
  readonly students: string;
  readonly companies: string;
  readonly mall: string;
  readonly issuanceBatches: string;
  readonly discountApplicants: string;
};
