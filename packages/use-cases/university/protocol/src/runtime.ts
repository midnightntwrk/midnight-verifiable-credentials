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

export type UniversityPartyProvisioningRecord = UniversityPartyRecord & {
  readonly secretKey: bigint;
};

export type UniversitySigningProviderDescriptor = {
  readonly providerId: string;
  readonly isolated: true;
};

export interface UniversitySigningProvider {
  register(partyId: string, signer: UniversityDiplomaSignerOptions): void;
  replace(partyId: string, signer: UniversityDiplomaSignerOptions): void;
  remove(partyId: string): boolean;
  resolveSigner(
    partyId: string,
    identity: Pick<AgentProfile, "didUrl" | "methodId">,
  ): UniversityDiplomaSignerOptions;
  describe(): UniversitySigningProviderDescriptor;
}

/**
 * Reference custody provider. Secrets remain in a private slot and only the
 * signer configuration crosses the proof-adapter call boundary.
 */
export class IsolatedUniversitySigningProvider
  implements UniversitySigningProvider
{
  readonly #signers = new Map<string, UniversityDiplomaSignerOptions>();

  register(partyId: string, signer: UniversityDiplomaSignerOptions): void {
    if (this.#signers.has(partyId)) {
      throw new Error(`Signing material for ${partyId} is already registered`);
    }
    this.#signers.set(partyId, { ...signer });
  }

  replace(partyId: string, signer: UniversityDiplomaSignerOptions): void {
    if (!this.#signers.has(partyId)) {
      throw new Error(`Signing material for ${partyId} is unavailable`);
    }
    this.#signers.set(partyId, { ...signer });
  }

  remove(partyId: string): boolean {
    return this.#signers.delete(partyId);
  }

  resolveSigner(
    partyId: string,
    identity: Pick<AgentProfile, "didUrl" | "methodId">,
  ): UniversityDiplomaSignerOptions {
    const signer = this.#signers.get(partyId);
    if (!signer) {
      throw new Error(`Signing material for ${partyId} is unavailable`);
    }
    if (signer.label !== identity.didUrl || signer.methodId !== identity.methodId) {
      throw new Error(`Signing identity for ${partyId} does not match custody`);
    }
    return { ...signer };
  }

  describe(): UniversitySigningProviderDescriptor {
    return {
      providerId: "university.isolated-signing.v1",
      isolated: true,
    };
  }
}

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
  createParty(
    record: UniversityPartyRecord,
    signer: UniversityDiplomaSignerOptions,
  ): UniversityPartyRecord;
  readParty(partyId: string): UniversityPartyRecord | undefined;
  updateParty(
    partyId: string,
    patch: UniversityPartyPatch,
    signer?: UniversityDiplomaSignerOptions,
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
    readonly signingProvider: UniversitySigningProvider,
    initialParties: readonly UniversityPartyProvisioningRecord[] = [],
  ) {
    for (const provisioningRecord of initialParties) {
      const { secretKey, ...record } = provisioningRecord;
      this.createParty(record, {
        label: record.didUrl,
        methodId: record.methodId,
        secretKey,
      });
    }
  }

  descriptor(): UniversityPartyRuntimeDescriptor {
    return { ...this.runtimeDescriptor };
  }

  protected storeParty(record: UniversityPartyRecord): UniversityPartyRecord {
    if (this.#parties.has(record.partyId)) {
      throw new Error(`Party ${record.partyId} already exists in the runtime`);
    }
    const cloned = clonePartyRecord(record);
    this.#parties.set(record.partyId, cloned);
    return clonePartyRecord(cloned);
  }

  createParty(
    record: UniversityPartyRecord,
    signer: UniversityDiplomaSignerOptions,
  ): UniversityPartyRecord {
    if (this.#parties.has(record.partyId)) {
      throw new Error(`Party ${record.partyId} already exists in the runtime`);
    }
    if (signer.label !== record.didUrl || signer.methodId !== record.methodId) {
      throw new Error(`Signing identity for ${record.partyId} does not match party`);
    }
    try {
      this.signingProvider.register(record.partyId, signer);
    } catch (error) {
      try {
        this.signingProvider.remove(record.partyId);
      } catch {
        // Preserve the initiating custody failure after best-effort rollback.
      }
      throw error;
    }
    try {
      return this.storeParty(record);
    } catch (error) {
      try {
        this.signingProvider.remove(record.partyId);
      } catch {
        // Preserve the party-store failure after best-effort rollback.
      }
      throw error;
    }
  }

  readParty(partyId: string): UniversityPartyRecord | undefined {
    const record = this.#parties.get(partyId);
    return record ? clonePartyRecord(record) : undefined;
  }

  updateParty(
    partyId: string,
    patch: UniversityPartyPatch,
    signer?: UniversityDiplomaSignerOptions,
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
    const signingIdentityChanged =
      updated.didUrl !== existing.didUrl || updated.methodId !== existing.methodId;
    if (signingIdentityChanged && !signer) {
      throw new Error(`Updated signing material for ${partyId} is required`);
    }
    if (
      signer &&
      (signer.label !== updated.didUrl || signer.methodId !== updated.methodId)
    ) {
      throw new Error(`Updated signing material for ${partyId} does not match party`);
    }
    if (signer) {
      const previousSigner = this.signingProvider.resolveSigner(partyId, existing);
      try {
        this.signingProvider.replace(partyId, signer);
      } catch (error) {
        this.restoreSigner(partyId, previousSigner);
        throw error;
      }
    }
    this.#parties.set(partyId, updated);
    return clonePartyRecord(updated);
  }

  deleteParty(partyId: string): boolean {
    const existing = this.#parties.get(partyId);
    if (!existing) return false;
    const previousSigner = this.signingProvider.resolveSigner(partyId, existing);
    try {
      if (!this.signingProvider.remove(partyId)) {
        throw new Error(
          `Signing material for deleted party ${partyId} was unavailable`,
        );
      }
    } catch (error) {
      this.restoreSigner(partyId, previousSigner);
      throw error;
    }
    if (!this.#parties.delete(partyId)) {
      this.restoreSigner(partyId, previousSigner);
      throw new Error(`Party ${partyId} disappeared during deletion`);
    }
    return true;
  }

  private restoreSigner(
    partyId: string,
    signer: UniversityDiplomaSignerOptions,
  ): void {
    try {
      this.signingProvider.replace(partyId, signer);
    } catch {
      try {
        this.signingProvider.register(partyId, signer);
      } catch {
        // The original mutation error remains authoritative; providers are
        // required to make replace/register idempotently recoverable here.
      }
    }
  }

  listParties(): readonly UniversityPartyRecord[] {
    return [...this.#parties.values()].map((record) => clonePartyRecord(record));
  }

  signerOptionsFor(profile: AgentProfile): UniversityDiplomaSignerOptions {
    return this.signingProvider.resolveSigner(profile.partyId, {
      didUrl: profile.didUrl,
      methodId: profile.methodId,
    });
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
      throw new Error(`Party ${record.partyId} must be provisioned with signing material`);
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
  constructor(
    initialParties: readonly UniversityPartyProvisioningRecord[] = [],
    signingProvider: UniversitySigningProvider = new IsolatedUniversitySigningProvider(),
  ) {
    super(
      {
        mode: "deterministic",
        description:
          "Deterministic fixture runtime with signing isolated behind a custody provider.",
        usesRealDidInstances: false,
        supportsDidCrud: true,
      },
      signingProvider,
      initialParties,
    );
  }

  private ensureDeterministicParty(
    record: UniversityPartyRecord,
    secretLabel: string,
  ): UniversityPartyRecord {
    const existing = this.readParty(record.partyId);
    if (existing) return this.ensureParty(record);
    return this.createParty(record, {
      label: record.didUrl,
      methodId: record.methodId,
      secretKey: scalarForLabel(secretLabel),
    });
  }

  issuerProfileForUniversity(university: UniversityProfile): AgentProfile {
    return this.ensureDeterministicParty({
      partyId: university.universityId,
      didUrl: university.issuerDidUrl,
      methodId: university.issuerMethodId,
      role: "issuer",
      source: "deterministic-fixture",
    }, `issuer:${university.issuerDidUrl}`);
  }

  studentProfileForStudent(student: StudentRecord): AgentProfile {
    return this.ensureDeterministicParty({
      partyId: student.studentId,
      didUrl: student.holderDidUrl,
      methodId: student.holderMethodId,
      role: "holder",
      source: "deterministic-fixture",
    }, `holder:${student.holderDidUrl}`);
  }

  verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile {
    return this.ensureDeterministicParty({
      partyId,
      didUrl,
      methodId,
      role: "verifier",
      source: "deterministic-fixture",
    }, `verifier:${didUrl}`);
  }
}

export class PreloadedUniversityPartyRuntime
  extends ManagedUniversityPartyRuntime
  implements UniversityPartyRuntime
{
  constructor(
    initialParties: readonly UniversityPartyProvisioningRecord[],
    signingProvider: UniversitySigningProvider = new IsolatedUniversitySigningProvider(),
  ) {
    super(
      {
        mode: "standalone-provisioned",
        description:
          "Preloaded runtime backed by DID records with isolated signing custody.",
        usesRealDidInstances: true,
        supportsDidCrud: true,
      },
      signingProvider,
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
