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

export declare function buildUniversityDataArtifacts(options: {
  readonly studentCount: number;
  readonly batchSize: number;
}): UniversityDataArtifacts;

export declare function writeUniversityDataArtifacts(
  targetDir: string,
  artifacts: UniversityDataArtifacts,
): void;
