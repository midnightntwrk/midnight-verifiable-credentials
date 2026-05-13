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

export interface UniversityPartyRuntime {
  issuerProfileForUniversity(university: UniversityProfile): AgentProfile;
  studentProfileForStudent(student: StudentRecord): AgentProfile;
  verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile;
  signerOptionsFor(profile: AgentProfile): UniversityDiplomaSignerOptions;
}

export class DeterministicUniversityPartyRuntime
  implements UniversityPartyRuntime
{
  issuerProfileForUniversity(university: UniversityProfile): AgentProfile {
    return {
      partyId: university.universityId,
      didUrl: university.issuerDidUrl,
      methodId: university.issuerMethodId,
      secretKey: scalarForLabel(`issuer:${university.issuerDidUrl}`),
    };
  }

  studentProfileForStudent(student: StudentRecord): AgentProfile {
    return {
      partyId: student.studentId,
      didUrl: student.holderDidUrl,
      methodId: student.holderMethodId,
      secretKey: scalarForLabel(`holder:${student.holderDidUrl}`),
    };
  }

  verifierProfile(
    partyId: string,
    didUrl: string,
    methodId: string,
  ): AgentProfile {
    return {
      partyId,
      didUrl,
      methodId,
      secretKey: scalarForLabel(`verifier:${didUrl}`),
    };
  }

  signerOptionsFor(profile: AgentProfile): UniversityDiplomaSignerOptions {
    return {
      label: profile.didUrl,
      methodId: profile.methodId,
      secretKey: profile.secretKey,
    };
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
