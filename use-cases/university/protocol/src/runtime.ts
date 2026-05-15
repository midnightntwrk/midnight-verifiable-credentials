import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { JUBJUB_SUBGROUP_ORDER, mod, sha256 } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import type { UniversityDiplomaSignerOptions } from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";

import type {
  AgentProfile,
  CompanyRecord,
  DiscountApplicantRecord,
  IssuanceBatchRecord,
  MallRecord,
  StudentRecord,
  UniversityFixtureData,
  UniversityProfile,
  UniversityProtocolDataPaths,
} from "./model.js";
import { defaultDataPaths } from "./model.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

export const resolveUniversityProtocolRepoPath = (relativePath: string): string =>
  path.resolve(repoRoot, relativePath);

const readJson = <T>(relativePath: string): T =>
  JSON.parse(
    readFileSync(resolveUniversityProtocolRepoPath(relativePath), "utf8"),
  ) as T;

const scalarForLabel = (label: string): bigint => {
  const raw = BigInt(`0x${Buffer.from(sha256(label)).toString("hex")}`);
  return mod((raw % (JUBJUB_SUBGROUP_ORDER - 1n)) + 1n);
};

export type UniversityPartyRole = "issuer" | "holder" | "verifier";
export type UniversityPartySource =
  | "deterministic-fixture"
  | "standalone-provisioned";

export type UniversityPartyRecord = AgentProfile & {
  readonly role: UniversityPartyRole;
  readonly source: UniversityPartySource;
  readonly contractAddress?: string;
  readonly verificationMethodRef?: string;
};

export type UniversityPartyPatch = Partial<
  Omit<UniversityPartyRecord, "partyId" | "role" | "source">
>;

export type UniversityPartyRuntimeDescriptor = {
  readonly mode: "deterministic" | "standalone-provisioned";
  readonly description: string;
  readonly usesRealDidInstances: boolean;
  readonly supportsDidCrud: boolean;
};

const clonePartyRecord = (
  record: UniversityPartyRecord,
): UniversityPartyRecord => ({ ...record });

const assertRecordMatches = (
  record: UniversityPartyRecord,
  expected: {
    readonly partyId: string;
    readonly didUrl: string;
    readonly methodId: string;
    readonly role: UniversityPartyRole;
  },
): UniversityPartyRecord => {
  if (record.partyId !== expected.partyId) {
    throw new Error(
      `Party ${expected.partyId} was registered under ${record.partyId}`,
    );
  }
  if (record.role !== expected.role) {
    throw new Error(
      `Party ${expected.partyId} has role ${record.role}, expected ${expected.role}`,
    );
  }
  if (record.didUrl !== expected.didUrl) {
    throw new Error(
      `Party ${expected.partyId} has DID ${record.didUrl}, expected ${expected.didUrl}`,
    );
  }
  if (record.methodId !== expected.methodId) {
    throw new Error(
      `Party ${expected.partyId} has method ${record.methodId}, expected ${expected.methodId}`,
    );
  }
  return clonePartyRecord(record);
};

export interface UniversityPartyRuntime {
  descriptor(): UniversityPartyRuntimeDescriptor;
  createParty(record: UniversityPartyRecord): UniversityPartyRecord;
  readParty(partyId: string): UniversityPartyRecord | undefined;
  updateParty(
    partyId: string,
    patch: UniversityPartyPatch,
  ): UniversityPartyRecord;
  deleteParty(partyId: string): boolean;
  listParties(): readonly UniversityPartyRecord[];
  issuerProfileForUniversity(university: UniversityProfile): AgentProfile;
  studentProfileForStudent(student: StudentRecord): AgentProfile;
  verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile;
  signerOptionsFor(profile: AgentProfile): UniversityDiplomaSignerOptions;
}

abstract class ManagedUniversityPartyRuntime implements UniversityPartyRuntime {
  readonly #parties = new Map<string, UniversityPartyRecord>();

  protected constructor(
    readonly runtimeDescriptor: UniversityPartyRuntimeDescriptor,
    initialParties: readonly UniversityPartyRecord[] = [],
  ) {
    for (const record of initialParties) {
      this.createParty(record);
    }
  }

  descriptor(): UniversityPartyRuntimeDescriptor {
    return { ...this.runtimeDescriptor };
  }

  createParty(record: UniversityPartyRecord): UniversityPartyRecord {
    if (this.#parties.has(record.partyId)) {
      throw new Error(`Party ${record.partyId} already exists in the runtime`);
    }
    const cloned = clonePartyRecord(record);
    this.#parties.set(record.partyId, cloned);
    return clonePartyRecord(cloned);
  }

  readParty(partyId: string): UniversityPartyRecord | undefined {
    const record = this.#parties.get(partyId);
    return record ? clonePartyRecord(record) : undefined;
  }

  updateParty(
    partyId: string,
    patch: UniversityPartyPatch,
  ): UniversityPartyRecord {
    const existing = this.#parties.get(partyId);
    if (!existing) {
      throw new Error(`Party ${partyId} is not registered in the runtime`);
    }
    const updated: UniversityPartyRecord = {
      ...existing,
      ...patch,
      partyId: existing.partyId,
      role: existing.role,
      source: existing.source,
    };
    this.#parties.set(partyId, updated);
    return clonePartyRecord(updated);
  }

  deleteParty(partyId: string): boolean {
    return this.#parties.delete(partyId);
  }

  listParties(): readonly UniversityPartyRecord[] {
    return [...this.#parties.values()].map((record) => clonePartyRecord(record));
  }

  signerOptionsFor(profile: AgentProfile): UniversityDiplomaSignerOptions {
    return {
      label: profile.didUrl,
      methodId: profile.methodId,
      secretKey: profile.secretKey,
    };
  }

  protected requireParty(
    partyId: string,
    expected?: {
      readonly didUrl: string;
      readonly methodId: string;
      readonly role: UniversityPartyRole;
    },
  ): UniversityPartyRecord {
    const record = this.#parties.get(partyId);
    if (!record) {
      throw new Error(`Party ${partyId} is not registered in the runtime`);
    }
    return expected
      ? assertRecordMatches(record, { partyId, ...expected })
      : clonePartyRecord(record);
  }

  protected ensureParty(
    record: UniversityPartyRecord,
  ): UniversityPartyRecord {
    const existing = this.readParty(record.partyId);
    if (!existing) {
      return this.createParty(record);
    }
    return assertRecordMatches(existing, {
      partyId: record.partyId,
      didUrl: record.didUrl,
      methodId: record.methodId,
      role: record.role,
    });
  }

  abstract issuerProfileForUniversity(university: UniversityProfile): AgentProfile;
  abstract studentProfileForStudent(student: StudentRecord): AgentProfile;
  abstract verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile;
}

export class DeterministicUniversityPartyRuntime
  extends ManagedUniversityPartyRuntime
  implements UniversityPartyRuntime
{
  constructor(initialParties: readonly UniversityPartyRecord[] = []) {
    super(
      {
        mode: "deterministic",
        description:
          "Deterministic fixture runtime deriving party keys from checked-in DID strings.",
        usesRealDidInstances: false,
        supportsDidCrud: true,
      },
      initialParties,
    );
  }

  issuerProfileForUniversity(university: UniversityProfile): AgentProfile {
    return this.ensureParty({
      partyId: university.universityId,
      didUrl: university.issuerDidUrl,
      methodId: university.issuerMethodId,
      secretKey: scalarForLabel(`issuer:${university.issuerDidUrl}`),
      role: "issuer",
      source: "deterministic-fixture",
    });
  }

  studentProfileForStudent(student: StudentRecord): AgentProfile {
    return this.ensureParty({
      partyId: student.studentId,
      didUrl: student.holderDidUrl,
      methodId: student.holderMethodId,
      secretKey: scalarForLabel(`holder:${student.holderDidUrl}`),
      role: "holder",
      source: "deterministic-fixture",
    });
  }

  verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile {
    return this.ensureParty({
      partyId,
      didUrl,
      methodId,
      secretKey: scalarForLabel(`verifier:${didUrl}`),
      role: "verifier",
      source: "deterministic-fixture",
    });
  }
}

export class PreloadedUniversityPartyRuntime
  extends ManagedUniversityPartyRuntime
  implements UniversityPartyRuntime
{
  constructor(initialParties: readonly UniversityPartyRecord[]) {
    super(
      {
        mode: "standalone-provisioned",
        description:
          "Preloaded runtime backed by DID records provisioned by standalone Midnight infrastructure.",
        usesRealDidInstances: true,
        supportsDidCrud: true,
      },
      initialParties,
    );
  }

  issuerProfileForUniversity(university: UniversityProfile): AgentProfile {
    return this.requireParty(university.universityId, {
      didUrl: university.issuerDidUrl,
      methodId: university.issuerMethodId,
      role: "issuer",
    });
  }

  studentProfileForStudent(student: StudentRecord): AgentProfile {
    return this.requireParty(student.studentId, {
      didUrl: student.holderDidUrl,
      methodId: student.holderMethodId,
      role: "holder",
    });
  }

  verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile {
    return this.requireParty(partyId, {
      didUrl,
      methodId,
      role: "verifier",
    });
  }
}

export const loadUniversityFixtureData = (
  dataPaths: Partial<UniversityProtocolDataPaths> = {},
): UniversityFixtureData => {
  const resolvedPaths: UniversityProtocolDataPaths = {
    ...defaultDataPaths,
    ...dataPaths,
  };

  return {
    university: readJson<UniversityProfile>(resolvedPaths.university),
    students: readJson<StudentRecord[]>(resolvedPaths.students),
    companies: readJson<CompanyRecord[]>(resolvedPaths.companies),
    mall: readJson<MallRecord>(resolvedPaths.mall),
    issuanceBatches: readJson<IssuanceBatchRecord[]>(resolvedPaths.issuanceBatches),
    discountApplicants: readJson<DiscountApplicantRecord[]>(
      resolvedPaths.discountApplicants,
    ),
  };
};
