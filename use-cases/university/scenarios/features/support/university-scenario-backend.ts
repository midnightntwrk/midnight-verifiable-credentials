import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import {
  DeterministicUniversityPartyRuntime,
  ProvisionedUniversityPartyRuntime,
  SimulatorUniversityProofExecutionBackend,
  StandaloneHybridUniversityProofExecutionBackend,
  type UniversityPartyRecord,
  type UniversityPartyRuntime,
  type UniversityProofExecutionBackend,
} from "@midnight-ntwrk/midnight-did-university-protocol/testing";

import {
  containerRuntimeAvailable,
  provisionDerivedDidProfile,
  StandaloneEnvironment,
} from "../../../../../components/integration/standalone-environment/dist/index.js";

type UniversityProfile = {
  readonly universityId: string;
  readonly universityName: string;
  readonly issuerDidUrl: string;
  readonly issuerMethodId: string;
  readonly credentialFamilyPackage: string;
  readonly schemaId: string;
  readonly holderBindingProfile: string;
  readonly statusModel: string;
  readonly isRevocable: boolean;
  readonly graduationYear: number;
  readonly graduationMonth: number;
  readonly supportsBatchIssuance: boolean;
  readonly batchSize: number;
  readonly claimEncoding: {
    readonly stringLikeFields: string;
    readonly integerFields: string;
    readonly fieldLengths?: Record<string, number>;
  };
};

type VerifierRequestPolicy = {
  readonly requireDiplomaIdDisclosure?: boolean;
  readonly requireStudentIdDisclosure?: boolean;
  readonly requireGraduateNameDisclosure?: boolean;
  readonly requireUniversityNameDisclosure?: boolean;
  readonly requireFacultyNameDisclosure?: boolean;
  readonly requireAwardNameDisclosure?: boolean;
  readonly requireHonorsCodeDisclosure?: boolean;
  readonly requireGraduationYearDisclosure?: boolean;
  readonly requireGraduationMonthDisclosure?: boolean;
  readonly requireFinalGradeDisclosure?: boolean;
  readonly requireCreditsEarnedDisclosure?: boolean;
  readonly enforceMinimumFinalGrade?: boolean;
  readonly minimumFinalGrade?: number;
};

type CompanyRecord = {
  readonly companyId: string;
  readonly companyName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly hiringStream: string;
  readonly requestPresetId: string;
  readonly requestPresetTitle: string;
  readonly requestPolicyPurpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
};

type MallRecord = {
  readonly mallId: string;
  readonly mallName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly offerId: string;
  readonly requestPresetId: string;
  readonly requestPresetTitle: string;
  readonly requestPolicyPurpose: string;
  readonly requestPolicy: VerifierRequestPolicy;
};

type StudentClaimValues = {
  readonly diplomaId: string;
  readonly studentId: string;
  readonly graduateName: string;
  readonly universityName: string;
  readonly facultyName: string;
  readonly awardName: string;
  readonly honorsCode: string;
  readonly graduationYear: number;
  readonly graduationMonth: number;
  readonly finalGrade: number;
  readonly creditsEarned: number;
};

type StudentRecord = {
  readonly studentId: string;
  readonly fullName: string;
  readonly holderDidUrl: string;
  readonly holderMethodId: string;
  readonly graduationEligible: boolean;
  readonly assignedCompanyId: string;
  readonly requestedJobRole: string;
  readonly diplomaClaimValues: StudentClaimValues;
};

type BackendMetric = {
  readonly name: string;
  readonly durationMs: number;
  readonly tags?: Record<string, string | number | boolean>;
};

export type ScenarioDataPaths = {
  university: string;
  students: string;
  companies: string;
  mall: string;
  issuanceBatches: string;
  discountApplicants: string;
};

export type UniversityScenarioBackendMode = "simulator" | "standalone-hybrid";

export type UniversityScenarioBackendMetadata = {
  readonly mode: UniversityScenarioBackendMode;
  readonly description: string;
  readonly usesRealDidInstances: boolean;
  readonly generatedOverlayDirectory: string | null;
  readonly metrics: readonly BackendMetric[];
};

export type UniversityScenarioBackendContext = {
  readonly dataPaths: ScenarioDataPaths;
  readonly metadata: UniversityScenarioBackendMetadata;
  readonly protocol: {
    readonly partyRuntime: UniversityPartyRuntime;
    readonly proofExecutionBackend: UniversityProofExecutionBackend;
  };
};

export interface UniversityScenarioBackend {
  initialize(): Promise<UniversityScenarioBackendContext>;
  shutdown(): Promise<void>;
}

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "..",
);

export const defaultDataPaths = {
  university: "use-cases/university/data/university.json",
  students: "use-cases/university/data/students.json",
  companies: "use-cases/university/data/companies.json",
  mall: "use-cases/university/data/mall.json",
  issuanceBatches: "use-cases/university/data/issuance-batches.json",
  discountApplicants: "use-cases/university/data/discount-applicants.json",
} satisfies ScenarioDataPaths;

export const resolveScenarioRepoPath = (relativePath: string): string =>
  path.resolve(repoRoot, relativePath);

export const loadUniversityScenarioBackendMode = (): UniversityScenarioBackendMode => {
  const rawMode = (process.env.UNIVERSITY_BDD_BACKEND ?? "simulator").trim();
  switch (rawMode) {
    case "":
    case "simulator":
      return "simulator";
    case "standalone-hybrid":
      return "standalone-hybrid";
    default:
      throw new Error(
        `Unsupported UNIVERSITY_BDD_BACKEND=${rawMode}. Expected simulator or standalone-hybrid.`,
      );
  }
};

const readJson = async <T>(relativePath: string): Promise<T> =>
  JSON.parse(await fs.readFile(resolveScenarioRepoPath(relativePath), "utf8")) as T;

const writeJson = async (relativePath: string, value: unknown): Promise<void> => {
  const absolutePath = resolveScenarioRepoPath(relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(`${absolutePath}.tmp`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(`${absolutePath}.tmp`, absolutePath);
};

const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

const sha256 = (value: string): Uint8Array =>
  new Uint8Array(createHash("sha256").update(value).digest());

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  BigInt(`0x${Buffer.from(bytes).toString("hex")}`);

const scalarForLabel = (label: string): bigint => {
  const raw = bytesToBigInt(sha256(label));
  return (raw % (JUBJUB_SUBGROUP_ORDER - 1n)) + 1n;
};

const signerForDidString = (
  role: "issuer" | "holder" | "verifier",
  didString: string,
  methodId: string,
): {
  readonly secretKey: bigint;
  readonly publicKey: ReturnType<typeof ecMulGenerator>;
  readonly methodId: string;
} => {
  const prefix =
    role === "issuer" ? "issuer" : role === "holder" ? "holder" : "verifier";
  const secretKey = scalarForLabel(`${prefix}:${didString}`);
  return {
    secretKey,
    publicKey: ecMulGenerator(secretKey),
    methodId,
  };
};

const partyRecordForDid = (options: {
  readonly partyId: string;
  readonly role: "issuer" | "holder" | "verifier";
  readonly didString: string;
  readonly methodId: string;
  readonly contractAddress: string;
  readonly verificationMethodRef: string;
}): UniversityPartyRecord => ({
  partyId: options.partyId,
  didUrl: options.didString,
  methodId: options.methodId,
  secretKey: signerForDidString(
    options.role,
    options.didString,
    options.methodId,
  ).secretKey,
  role: options.role,
  source: "standalone-provisioned",
  contractAddress: options.contractAddress,
  verificationMethodRef: options.verificationMethodRef,
});

const measureAsync = async <T>(
  metrics: BackendMetric[],
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string | number | boolean>,
): Promise<T> => {
  const startedAt = performance.now();
  try {
    return await fn();
  } finally {
    metrics.push({
      name,
      durationMs: performance.now() - startedAt,
      tags,
    });
  }
};

const backendContextForSimulator = (
  dataPaths: ScenarioDataPaths = defaultDataPaths,
): UniversityScenarioBackendContext => ({
  dataPaths,
  metadata: {
    mode: "simulator",
    description:
      "Local deterministic simulator backend using checked-in university fixture data and in-process credential/verifier semantics.",
    usesRealDidInstances: false,
    generatedOverlayDirectory: null,
    metrics: [],
  },
  protocol: {
    partyRuntime: new DeterministicUniversityPartyRuntime(),
    proofExecutionBackend: new SimulatorUniversityProofExecutionBackend(),
  },
});

class LocalUniversityScenarioBackend implements UniversityScenarioBackend {
  async initialize(): Promise<UniversityScenarioBackendContext> {
    return backendContextForSimulator();
  }

  async shutdown(): Promise<void> {
    // Nothing to tear down for the local simulator backend.
  }
}

class StandaloneHybridUniversityScenarioBackend
  implements UniversityScenarioBackend
{
  readonly #metrics: BackendMetric[] = [];
  readonly #environment = new StandaloneEnvironment("university-bdd");
  readonly #overlayRoot = "use-cases/university/scenarios/target/standalone-hybrid-data";
  #initialized = false;

  async initialize(): Promise<UniversityScenarioBackendContext> {
    if (this.#initialized) {
      throw new Error("Standalone hybrid university backend already initialized");
    }

    if (!(await containerRuntimeAvailable())) {
      throw new Error(
        "University standalone-hybrid BDD requires a Docker-compatible container runtime.",
      );
    }

    setNetworkId("undeployed");

    await fs.rm(resolveScenarioRepoPath(this.#overlayRoot), {
      recursive: true,
      force: true,
    });

    await measureAsync(this.#metrics, "standalone_environment_start_ms", async () => {
      await this.#environment.start();
    });
    await measureAsync(this.#metrics, "standalone_wallet_sync_ms", async () => {
      await this.#environment.waitForWalletSync();
    });

    const university = await readJson<UniversityProfile>(defaultDataPaths.university);
    const students = await readJson<StudentRecord[]>(defaultDataPaths.students);
    const companies = await readJson<CompanyRecord[]>(defaultDataPaths.companies);
    const mall = await readJson<MallRecord>(defaultDataPaths.mall);

    const universityProfile = await measureAsync(
      this.#metrics,
      "standalone_issuer_did_provision_ms",
      async () =>
        provisionDerivedDidProfile(
          this.#environment.providers,
          "issuer",
          (didString) =>
            signerForDidString("issuer", didString, university.issuerMethodId),
          "university-bdd",
        ),
      { actorCount: 1 },
    );

    const studentProfiles = new Map<string, Awaited<ReturnType<typeof provisionDerivedDidProfile>>>();
    await measureAsync(
      this.#metrics,
      "standalone_student_did_provision_ms",
      async () => {
        for (const student of students) {
          const profile = await provisionDerivedDidProfile(
            this.#environment.providers,
            "holder",
            (didString) =>
              signerForDidString("holder", didString, student.holderMethodId),
            `university-bdd:${student.studentId}`,
          );
          studentProfiles.set(student.studentId, profile);
        }
      },
      { actorCount: students.length },
    );

    const companyProfiles = new Map<string, Awaited<ReturnType<typeof provisionDerivedDidProfile>>>();
    await measureAsync(
      this.#metrics,
      "standalone_company_did_provision_ms",
      async () => {
        for (const company of companies) {
          const profile = await provisionDerivedDidProfile(
            this.#environment.providers,
            "verifier",
            (didString) =>
              signerForDidString("verifier", didString, company.verifierMethodId),
            `university-bdd:${company.companyId}`,
          );
          companyProfiles.set(company.companyId, profile);
        }
      },
      { actorCount: companies.length },
    );

    const mallProfile = await measureAsync(
      this.#metrics,
      "standalone_mall_did_provision_ms",
      async () =>
        provisionDerivedDidProfile(
          this.#environment.providers,
          "verifier",
          (didString) =>
            signerForDidString("verifier", didString, mall.verifierMethodId),
          `university-bdd:${mall.mallId}`,
        ),
      { actorCount: 1 },
    );

    const overlayUniversityMethodId = universityProfile.verificationMethodRef.slice(
      universityProfile.didString.length,
    );
    const overlayMallMethodId = mallProfile.verificationMethodRef.slice(
      mallProfile.didString.length,
    );

    const provisionedPartyRuntime = new ProvisionedUniversityPartyRuntime([
      partyRecordForDid({
        partyId: university.universityId,
        role: "issuer",
        didString: universityProfile.didString,
        methodId: overlayUniversityMethodId,
        contractAddress: universityProfile.contractAddress,
        verificationMethodRef: universityProfile.verificationMethodRef,
      }),
      ...students.map((student) => {
        const profile = studentProfiles.get(student.studentId);
        if (!profile) {
          throw new Error(`Missing standalone DID profile for ${student.studentId}`);
        }
        return partyRecordForDid({
          partyId: student.studentId,
          role: "holder",
          didString: profile.didString,
          methodId: profile.verificationMethodRef.slice(profile.didString.length),
          contractAddress: profile.contractAddress,
          verificationMethodRef: profile.verificationMethodRef,
        });
      }),
      ...companies.map((company) => {
        const profile = companyProfiles.get(company.companyId);
        if (!profile) {
          throw new Error(`Missing standalone DID profile for ${company.companyId}`);
        }
        return partyRecordForDid({
          partyId: company.companyId,
          role: "verifier",
          didString: profile.didString,
          methodId: profile.verificationMethodRef.slice(profile.didString.length),
          contractAddress: profile.contractAddress,
          verificationMethodRef: profile.verificationMethodRef,
        });
      }),
      partyRecordForDid({
        partyId: mall.mallId,
        role: "verifier",
        didString: mallProfile.didString,
        methodId: overlayMallMethodId,
        contractAddress: mallProfile.contractAddress,
        verificationMethodRef: mallProfile.verificationMethodRef,
      }),
    ]);
    const proofExecutionBackend =
      new StandaloneHybridUniversityProofExecutionBackend();

    const overlayDataPaths = {
      university: path.join(this.#overlayRoot, "university.json"),
      students: path.join(this.#overlayRoot, "students.json"),
      companies: path.join(this.#overlayRoot, "companies.json"),
      mall: path.join(this.#overlayRoot, "mall.json"),
      issuanceBatches: defaultDataPaths.issuanceBatches,
      discountApplicants: defaultDataPaths.discountApplicants,
    } satisfies ScenarioDataPaths;

    const overlayUniversity: UniversityProfile = {
      ...university,
      issuerDidUrl: universityProfile.didString,
      issuerMethodId: overlayUniversityMethodId,
    };
    const overlayStudents: StudentRecord[] = students.map((student) => {
      const profile = studentProfiles.get(student.studentId);
      if (!profile) {
        throw new Error(`Missing standalone DID profile for ${student.studentId}`);
      }
      return {
        ...student,
        holderDidUrl: profile.didString,
        holderMethodId: profile.verificationMethodRef.slice(profile.didString.length),
      };
    });
    const overlayCompanies: CompanyRecord[] = companies.map((company) => {
      const profile = companyProfiles.get(company.companyId);
      if (!profile) {
        throw new Error(`Missing standalone DID profile for ${company.companyId}`);
      }
      return {
        ...company,
        verifierDidUrl: profile.didString,
        verifierMethodId: profile.verificationMethodRef.slice(profile.didString.length),
      };
    });
    const overlayMall: MallRecord = {
      ...mall,
      verifierDidUrl: mallProfile.didString,
      verifierMethodId: overlayMallMethodId,
    };

    await writeJson(overlayDataPaths.university, overlayUniversity);
    await writeJson(overlayDataPaths.students, overlayStudents);
    await writeJson(overlayDataPaths.companies, overlayCompanies);
    await writeJson(overlayDataPaths.mall, overlayMall);
    await writeJson(path.join(this.#overlayRoot, "backend-metadata.json"), {
      mode: "standalone-hybrid",
      description:
        "Real standalone DID bootstrap with generated fixture overlays, while issuance and verifier semantics remain on the local simulator path.",
      metrics: this.#metrics,
      overlayDataPaths,
    });

    this.#initialized = true;

    return {
      dataPaths: overlayDataPaths,
      metadata: {
        mode: "standalone-hybrid",
        description:
          "Hybrid backend: real standalone Midnight DIDs for university, students, companies, and mall; local simulator issuance and verification semantics for the university credential flow.",
        usesRealDidInstances: true,
        generatedOverlayDirectory: this.#overlayRoot,
        metrics: [...this.#metrics],
      },
      protocol: {
        partyRuntime: provisionedPartyRuntime,
        proofExecutionBackend,
      },
    };
  }

  async shutdown(): Promise<void> {
    if (!this.#initialized) {
      return;
    }
    await this.#environment.shutdown();
    this.#initialized = false;
  }
}

export const createUniversityScenarioBackend = (
  mode: UniversityScenarioBackendMode = loadUniversityScenarioBackendMode(),
): UniversityScenarioBackend => {
  switch (mode) {
    case "simulator":
      return new LocalUniversityScenarioBackend();
    case "standalone-hybrid":
      return new StandaloneHybridUniversityScenarioBackend();
    default:
      throw new Error(`Unsupported university backend mode ${mode satisfies never}`);
  }
};
