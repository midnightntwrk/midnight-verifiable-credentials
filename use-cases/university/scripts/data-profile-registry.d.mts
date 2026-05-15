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
  readonly absoluteOutputDir?: string;
};

export declare function buildUniversityDataArtifacts(options: {
  readonly studentCount: number;
  readonly batchSize: number;
}): UniversityDataArtifacts;

export declare function buildUniversityDataArtifactsForProfile(
  options: Pick<UniversityDataProfile, "studentCount" | "batchSize"> &
    Partial<Pick<UniversityDataProfile, "companySet" | "discountApplicantCount">>,
): UniversityDataArtifacts;

export declare function writeUniversityDataArtifacts(
  targetDir: string,
  artifacts: UniversityDataArtifacts,
): void;

export declare function checkUniversityDataArtifacts(
  targetDir: string,
  artifacts: UniversityDataArtifacts,
): number;

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
