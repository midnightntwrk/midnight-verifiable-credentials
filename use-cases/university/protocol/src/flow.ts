import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createEnvelope,
  JUBJUB_SUBGROUP_ORDER,
  MessageBus,
  mod,
  type ProtocolMessage,
  sha256,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";
import {
  type Proof,
  pureCircuits as universityDiplomaPureCircuits,
  type UniversityDiplomaClaims,
  type UniversityDiplomaCredential,
  type UniversityDiplomaPresentation,
  type UniversityDiplomaPresentationRequest,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/contract";
import {
  createUniversityDiplomaFixture,
  padText,
  type UniversityDiplomaDisclosureOptions,
  type UniversityDiplomaFixture,
  type UniversityDiplomaRequestOptions,
  type UniversityDiplomaSignerOptions,
} from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";
import { UniversityVerifierSimulator } from "@midnight-ntwrk/midnight-did-university-verifier-contract/testing";

type UniversityProfile = {
  readonly universityId: string;
  readonly universityName: string;
  readonly issuerDidUrl: string;
  readonly issuerMethodId: string;
  readonly batchSize: number;
};

type CompanyRequestPolicy = {
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
  readonly requestPolicy: CompanyRequestPolicy;
};

type MallRecord = {
  readonly mallId: string;
  readonly mallName: string;
  readonly verifierDidUrl: string;
  readonly verifierMethodId: string;
  readonly offerId: string;
  readonly requestPolicy: CompanyRequestPolicy;
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

type IssuanceBatchRecord = {
  readonly batchId: string;
  readonly studentIds: readonly string[];
  readonly size: number;
};

type DiscountApplicantRecord = {
  readonly studentId: string;
  readonly fullName: string;
  readonly finalGrade: number;
  readonly expectedDiscountEligibility: boolean;
  readonly explanation: string;
};

type AgentProfile = {
  readonly partyId: string;
  readonly didUrl: string;
  readonly methodId: string;
  readonly secretKey: bigint;
};

type StoredIssuedCredential = {
  readonly fixture: UniversityDiplomaFixture;
  readonly issuedAt: bigint;
  readonly credentialProofCreatedAt: bigint;
  readonly presentationProofCreatedAt: bigint;
  readonly issuanceChallengeHash: Uint8Array;
};

type UniversityIssuanceRequestBody = {
  readonly studentId: string;
  readonly holderDidUrl: string;
  readonly holderMethodId: string;
  readonly claimValues: StudentClaimValues;
};

type UniversityIssuanceResultBody = {
  readonly studentId: string;
  readonly credential: UniversityDiplomaCredential;
  readonly credentialProof: Proof;
  readonly issuedAt: bigint;
  readonly credentialProofCreatedAt: bigint;
  readonly presentationProofCreatedAt: bigint;
  readonly issuanceChallengeHash: Uint8Array;
};

type UniversityPresentationRequestBody = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly request: UniversityDiplomaPresentationRequest;
  readonly requestedRole?: string;
  readonly verifierId: string;
};

type UniversityPresentationSubmissionBody = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly credential: UniversityDiplomaCredential;
  readonly credentialProof: Proof;
  readonly request: UniversityDiplomaPresentationRequest;
  readonly presentation: UniversityDiplomaPresentation;
  readonly presentationProof: Proof;
};

type UniversityPresentationResultBody = {
  readonly kind: "jobApplication" | "mallDiscount";
  readonly studentId: string;
  readonly accepted: boolean;
  readonly reason: string;
};

type UniversityProtocolMessage =
  | ProtocolMessage<UniversityIssuanceRequestBody>
  | ProtocolMessage<UniversityIssuanceResultBody>
  | ProtocolMessage<UniversityPresentationRequestBody>
  | ProtocolMessage<UniversityPresentationSubmissionBody>
  | ProtocolMessage<UniversityPresentationResultBody>;

export type UniversityProtocolTranscriptEntry = {
  readonly phase: "issuance" | "jobApplications" | "discounts";
  readonly type: UniversityProtocolMessage["type"];
  readonly from: string;
  readonly to: string;
  readonly threadIdHex: string;
  readonly messageIdHex: string;
  readonly respondsToHex: string;
  readonly summary: string;
};

export type UniversityProtocolFlowResult = {
  readonly issuance: {
    readonly requestCount: number;
    readonly resultCount: number;
    readonly batchCount: number;
    readonly issuedStudentIds: readonly string[];
    readonly messages: readonly UniversityProtocolMessage[];
  };
  readonly jobApplications: {
    readonly requestCount: number;
    readonly submissionCount: number;
    readonly resultCount: number;
    readonly acceptedCount: number;
    readonly companyAcceptedCounts: Readonly<Record<string, number>>;
    readonly messages: readonly UniversityProtocolMessage[];
  };
  readonly discounts: {
    readonly requestCount: number;
    readonly submissionCount: number;
    readonly resultCount: number;
    readonly acceptedCount: number;
    readonly rejectedCount: number;
    readonly outcomes: Readonly<Record<string, "accepted" | "rejected">>;
    readonly messages: readonly UniversityProtocolMessage[];
  };
  readonly transcript: readonly UniversityProtocolTranscriptEntry[];
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const dataPaths = {
  university: "use-cases/university/data/university.json",
  students: "use-cases/university/data/students.json",
  companies: "use-cases/university/data/companies.json",
  mall: "use-cases/university/data/mall.json",
  issuanceBatches: "use-cases/university/data/issuance-batches.json",
  discountApplicants: "use-cases/university/data/discount-applicants.json",
} as const;

const hex = (value: Uint8Array): string => Buffer.from(value).toString("hex");

const resolveRepoPath = (relativePath: string): string =>
  path.resolve(repoRoot, relativePath);

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(resolveRepoPath(relativePath), "utf8")) as T;

const scalarForLabel = (label: string): bigint => {
  const raw = BigInt(`0x${Buffer.from(sha256(label)).toString("hex")}`);
  return mod((raw % (JUBJUB_SUBGROUP_ORDER - 1n)) + 1n);
};

const issuerProfileForUniversity = (university: UniversityProfile): AgentProfile => ({
  partyId: university.universityId,
  didUrl: university.issuerDidUrl,
  methodId: university.issuerMethodId,
  secretKey: scalarForLabel(`issuer:${university.issuerDidUrl}`),
});

const studentProfileForStudent = (student: StudentRecord): AgentProfile => ({
  partyId: student.studentId,
  didUrl: student.holderDidUrl,
  methodId: student.holderMethodId,
  secretKey: scalarForLabel(`holder:${student.holderDidUrl}`),
});

const verifierProfile = (partyId: string, didUrl: string, methodId: string): AgentProfile => ({
  partyId,
  didUrl,
  methodId,
  secretKey: scalarForLabel(`verifier:${didUrl}`),
});

const signerOptionsFor = (profile: AgentProfile): UniversityDiplomaSignerOptions => ({
  label: profile.didUrl,
  methodId: profile.methodId,
  secretKey: profile.secretKey,
});

const encodeClaims = (student: StudentRecord): Partial<UniversityDiplomaClaims> => ({
  diplomaId: padText(student.diplomaClaimValues.diplomaId),
  studentId: padText(student.diplomaClaimValues.studentId, 16),
  graduateName: padText(student.diplomaClaimValues.graduateName),
  universityName: padText(student.diplomaClaimValues.universityName),
  facultyName: padText(student.diplomaClaimValues.facultyName),
  awardName: padText(student.diplomaClaimValues.awardName),
  honorsCode: padText(student.diplomaClaimValues.honorsCode, 16),
  graduationYear: BigInt(student.diplomaClaimValues.graduationYear),
  graduationMonth: BigInt(student.diplomaClaimValues.graduationMonth),
  finalGrade: BigInt(student.diplomaClaimValues.finalGrade),
  creditsEarned: BigInt(student.diplomaClaimValues.creditsEarned),
});

const requestOptionsFromRequest = (
  request: UniversityDiplomaPresentationRequest,
): UniversityDiplomaRequestOptions => ({
  requireDiplomaIdDisclosure: request.requireDiplomaIdDisclosure,
  requireStudentIdDisclosure: request.requireStudentIdDisclosure,
  requireGraduateNameDisclosure: request.requireGraduateNameDisclosure,
  requireUniversityNameDisclosure: request.requireUniversityNameDisclosure,
  requireFacultyNameDisclosure: request.requireFacultyNameDisclosure,
  requireAwardNameDisclosure: request.requireAwardNameDisclosure,
  requireHonorsCodeDisclosure: request.requireHonorsCodeDisclosure,
  requireGraduationYearDisclosure: request.requireGraduationYearDisclosure,
  requireGraduationMonthDisclosure: request.requireGraduationMonthDisclosure,
  requireFinalGradeDisclosure: request.requireFinalGradeDisclosure,
  requireCreditsEarnedDisclosure: request.requireCreditsEarnedDisclosure,
  enforceMinimumFinalGrade: request.enforceMinimumFinalGrade,
  minimumFinalGrade: request.minimumFinalGrade,
});

const disclosureOptionsFromRequest = (
  request: UniversityDiplomaPresentationRequest,
): UniversityDiplomaDisclosureOptions => ({
  revealDiplomaId: request.requireDiplomaIdDisclosure,
  revealStudentId: request.requireStudentIdDisclosure,
  revealGraduateName: request.requireGraduateNameDisclosure,
  revealUniversityName: request.requireUniversityNameDisclosure,
  revealFacultyName: request.requireFacultyNameDisclosure,
  revealAwardName: request.requireAwardNameDisclosure,
  revealHonorsCode: request.requireHonorsCodeDisclosure,
  revealGraduationYear: request.requireGraduationYearDisclosure,
  revealGraduationMonth: request.requireGraduationMonthDisclosure,
  revealFinalGrade: request.requireFinalGradeDisclosure,
  revealCreditsEarned: request.requireCreditsEarnedDisclosure,
});

class TranscriptRecorder {
  readonly entries: UniversityProtocolTranscriptEntry[] = [];

  record(
    phase: UniversityProtocolTranscriptEntry["phase"],
    message: UniversityProtocolMessage,
    summary: string,
  ): void {
    this.entries.push({
      phase,
      type: message.type,
      from: message.from,
      to: message.to,
      threadIdHex: hex(message.envelope.threadId),
      messageIdHex: hex(message.envelope.messageId),
      respondsToHex: hex(message.envelope.respondsToMessageId),
      summary,
    });
  }
}

class UniversityStudentAgent {
  readonly profile: AgentProfile;
  storedIssuedCredential: StoredIssuedCredential | undefined;
  readonly receivedResults: UniversityPresentationResultBody[] = [];

  constructor(readonly record: StudentRecord) {
    this.profile = studentProfileForStudent(record);
  }

  sendIssuanceRequest(
    bus: MessageBus,
    issuerPartyId: string,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const message: ProtocolMessage<UniversityIssuanceRequestBody> = {
      type: "issuance:request",
      from: this.profile.partyId,
      to: issuerPartyId,
      envelope: createEnvelope(
        `university-issuance-request:${this.record.studentId}`,
        `university-issuance:${this.record.studentId}`,
        true,
      ),
      body: {
        studentId: this.record.studentId,
        holderDidUrl: this.record.holderDidUrl,
        holderMethodId: this.record.holderMethodId,
        claimValues: this.record.diplomaClaimValues,
      },
    };

    bus.send(message);
    messages.push(message);
    transcript.record(
      "issuance",
      message,
      `Student ${this.record.studentId} requested diploma issuance`,
    );
  }

  receiveIssuanceResult(message: ProtocolMessage<UniversityIssuanceResultBody>): void {
    this.storedIssuedCredential = {
      fixture: {
        issuer: createUniversityDiplomaFixture({
          issuerConfig: signerOptionsFor(issuerProfileForUniversity(readJson<UniversityProfile>(dataPaths.university))),
        }).issuer,
        holder: createUniversityDiplomaFixture({
          holderConfig: signerOptionsFor(this.profile),
        }).holder,
        claims: message.body.credential.claims,
        credential: message.body.credential,
        credentialProof: message.body.credentialProof,
        presentationRequest: createUniversityDiplomaFixture().presentationRequest,
        presentation: createUniversityDiplomaFixture().presentation,
        presentationProof: createUniversityDiplomaFixture().presentationProof,
      },
      issuedAt: message.body.issuedAt,
      credentialProofCreatedAt: message.body.credentialProofCreatedAt,
      presentationProofCreatedAt: message.body.presentationProofCreatedAt,
      issuanceChallengeHash: message.body.issuanceChallengeHash,
    };
  }

  receivePresentationRequestAndSendSubmission(
    bus: MessageBus,
    message: ProtocolMessage<UniversityPresentationRequestBody>,
    issuerProfile: AgentProfile,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    if (!this.storedIssuedCredential) {
      throw new Error(`Student ${this.record.studentId} has no issued diploma credential`);
    }

    const fixture = createUniversityDiplomaFixture({
      issuerConfig: signerOptionsFor(issuerProfile),
      holderConfig: signerOptionsFor(this.profile),
      claimOverrides: encodeClaims(this.record),
      request: requestOptionsFromRequest(message.body.request),
      disclosure: disclosureOptionsFromRequest(message.body.request),
      verifierChallengeHash: message.body.request.verifierChallengeHash,
      issuanceChallengeHash: this.storedIssuedCredential.issuanceChallengeHash,
      issuedAt: this.storedIssuedCredential.issuedAt,
      credentialProofCreatedAt: this.storedIssuedCredential.credentialProofCreatedAt,
      presentationProofCreatedAt: this.storedIssuedCredential.presentationProofCreatedAt,
    });

    const storedRoot = universityDiplomaPureCircuits.universityDiplomaCredentialBodyRoot(
      this.storedIssuedCredential.fixture.credential,
    );
    const rebuiltRoot = universityDiplomaPureCircuits.universityDiplomaCredentialBodyRoot(
      fixture.credential,
    );
    if (hex(storedRoot) !== hex(rebuiltRoot)) {
      throw new Error(`Rebuilt university diploma root drift for ${this.record.studentId}`);
    }

    const submission: ProtocolMessage<UniversityPresentationSubmissionBody> = {
      type: "presentation:submission",
      from: this.profile.partyId,
      to: message.from,
      envelope: createEnvelope(
        `university-presentation-submission:${message.body.kind}:${this.record.studentId}`,
        `university-presentation:${message.body.kind}:${this.record.studentId}`,
        false,
        message.envelope.messageId,
        message.envelope.threadId,
      ),
      body: {
        kind: message.body.kind,
        studentId: this.record.studentId,
        credential: fixture.credential,
        credentialProof: fixture.credentialProof,
        request: message.body.request,
        presentation: fixture.presentation,
        presentationProof: fixture.presentationProof,
      },
    };

    bus.send(submission);
    messages.push(submission);
    transcript.record(
      message.body.kind === "jobApplication" ? "jobApplications" : "discounts",
      submission,
      `Student ${this.record.studentId} submitted a ${message.body.kind} presentation`,
    );
  }

  receivePresentationResult(message: ProtocolMessage<UniversityPresentationResultBody>): void {
    this.receivedResults.push(message.body);
  }
}

class UniversityIssuerProtocolAgent {
  readonly profile: AgentProfile;

  constructor(readonly university: UniversityProfile) {
    this.profile = issuerProfileForUniversity(university);
  }

  processIssuanceBatches(
    bus: MessageBus,
    studentsById: ReadonlyMap<string, UniversityStudentAgent>,
    batches: readonly IssuanceBatchRecord[],
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): readonly string[] {
    const drained = bus.drain(this.profile.partyId) as Array<ProtocolMessage<UniversityIssuanceRequestBody>>;
    const requestsByStudentId = new Map(drained.map((message) => [message.body.studentId, message]));
    const issuedStudentIds: string[] = [];

    for (const [batchIndex, batch] of batches.entries()) {
      for (const [studentOffset, studentId] of batch.studentIds.entries()) {
        const request = requestsByStudentId.get(studentId);
        const student = studentsById.get(studentId);
        if (!request || !student) {
          throw new Error(`Missing student issuance request for ${studentId}`);
        }
        if (!student.record.graduationEligible) {
          throw new Error(`Student ${studentId} is not graduation eligible`);
        }

        const batchOrdinal = batchIndex * this.university.batchSize + studentOffset;
        const issuedAt = 40_000n + BigInt(batchOrdinal);
        const credentialProofCreatedAt = 50_000n + BigInt(batchOrdinal);
        const presentationProofCreatedAt = 60_000n + BigInt(batchOrdinal);
        const issuanceChallengeHash = sha256(`university-issuance:${studentId}`);
        const fixture = createUniversityDiplomaFixture({
          issuerConfig: signerOptionsFor(this.profile),
          holderConfig: signerOptionsFor(student.profile),
          claimOverrides: encodeClaims(student.record),
          issuanceChallengeHash,
          issuedAt,
          credentialProofCreatedAt,
          presentationProofCreatedAt,
        });

        const result: ProtocolMessage<UniversityIssuanceResultBody> = {
          type: "issuance:result",
          from: this.profile.partyId,
          to: student.profile.partyId,
          envelope: createEnvelope(
            `university-issuance-result:${studentId}`,
            `university-issuance:${studentId}`,
            false,
            request.envelope.messageId,
            request.envelope.threadId,
          ),
          body: {
            studentId,
            credential: fixture.credential,
            credentialProof: fixture.credentialProof,
            issuedAt,
            credentialProofCreatedAt,
            presentationProofCreatedAt,
            issuanceChallengeHash,
          },
        };

        bus.send(result);
        messages.push(result);
        transcript.record(
          "issuance",
          result,
          `University issued diploma credential to ${studentId} in ${batch.batchId}`,
        );
        issuedStudentIds.push(studentId);
      }
    }

    return issuedStudentIds;
  }
}

class UniversityCompanyVerifierAgent {
  readonly profile: AgentProfile;
  readonly simulator = new UniversityVerifierSimulator();
  acceptedCount = 0;

  constructor(readonly company: CompanyRecord) {
    this.profile = verifierProfile(
      company.companyId,
      company.verifierDidUrl,
      company.verifierMethodId,
    );
  }

  sendRequest(
    bus: MessageBus,
    student: UniversityStudentAgent,
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const policy = this.company.requestPolicy;
    const request = this.simulator.universityJobApplicationRequest(
      issuerVerificationMethodRef,
      sha256(`job-application:${this.company.companyId}:${student.record.studentId}`),
      policy.requireDiplomaIdDisclosure ?? false,
      policy.requireStudentIdDisclosure ?? false,
      policy.requireFacultyNameDisclosure ?? false,
      policy.requireHonorsCodeDisclosure ?? false,
      policy.requireGraduationMonthDisclosure ?? false,
      policy.requireFinalGradeDisclosure ?? false,
      policy.requireCreditsEarnedDisclosure ?? false,
    );

    const message: ProtocolMessage<UniversityPresentationRequestBody> = {
      type: "presentation:request",
      from: this.profile.partyId,
      to: student.profile.partyId,
      envelope: createEnvelope(
        `job-request:${this.company.companyId}:${student.record.studentId}`,
        `job-application:${this.company.companyId}:${student.record.studentId}`,
        true,
      ),
      body: {
        kind: "jobApplication",
        studentId: student.record.studentId,
        request,
        requestedRole: student.record.requestedJobRole,
        verifierId: this.company.companyId,
      },
    };

    bus.send(message);
    messages.push(message);
    transcript.record(
      "jobApplications",
      message,
      `Company ${this.company.companyId} requested a diploma presentation from ${student.record.studentId}`,
    );
  }

  receiveSubmissionAndSendResult(
    bus: MessageBus,
    message: ProtocolMessage<UniversityPresentationSubmissionBody>,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    let accepted = true;
    let reason = "job application accepted";

    try {
      this.simulator.verifyUniversityDiplomaForJobApplication(
        message.body.credential,
        message.body.credentialProof,
        message.body.request,
        message.body.presentation,
        message.body.presentationProof,
      );
      this.acceptedCount += 1;
    } catch (error) {
      accepted = false;
      reason = error instanceof Error ? error.message : String(error);
    }

    const result: ProtocolMessage<UniversityPresentationResultBody> = {
      type: "presentation:result",
      from: this.profile.partyId,
      to: message.from,
      envelope: createEnvelope(
        `job-result:${this.company.companyId}:${message.body.studentId}`,
        `job-application:${this.company.companyId}:${message.body.studentId}`,
        false,
        message.envelope.messageId,
        message.envelope.threadId,
      ),
      body: {
        kind: "jobApplication",
        studentId: message.body.studentId,
        accepted,
        reason,
      },
    };

    bus.send(result);
    messages.push(result);
    transcript.record(
      "jobApplications",
      result,
      `Company ${this.company.companyId} returned ${accepted ? "accepted" : "rejected"} for ${message.body.studentId}`,
    );
  }
}

class UniversityMallVerifierAgent {
  readonly profile: AgentProfile;
  readonly simulator = new UniversityVerifierSimulator();
  acceptedCount = 0;
  rejectedCount = 0;

  constructor(readonly mall: MallRecord) {
    this.profile = verifierProfile(mall.mallId, mall.verifierDidUrl, mall.verifierMethodId);
  }

  sendRequest(
    bus: MessageBus,
    student: UniversityStudentAgent,
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    const minimumFinalGrade = BigInt(this.mall.requestPolicy.minimumFinalGrade ?? 0);
    const request = this.simulator.universityMallDiscountRequest(
      issuerVerificationMethodRef,
      sha256(`discount:${this.mall.mallId}:${student.record.studentId}`),
      minimumFinalGrade,
    );

    const message: ProtocolMessage<UniversityPresentationRequestBody> = {
      type: "presentation:request",
      from: this.profile.partyId,
      to: student.profile.partyId,
      envelope: createEnvelope(
        `discount-request:${this.mall.mallId}:${student.record.studentId}`,
        `discount:${this.mall.mallId}:${student.record.studentId}`,
        true,
      ),
      body: {
        kind: "mallDiscount",
        studentId: student.record.studentId,
        request,
        verifierId: this.mall.mallId,
      },
    };

    bus.send(message);
    messages.push(message);
    transcript.record(
      "discounts",
      message,
      `Mall ${this.mall.mallId} requested a diploma presentation from ${student.record.studentId}`,
    );
  }

  receiveSubmissionAndSendResult(
    bus: MessageBus,
    message: ProtocolMessage<UniversityPresentationSubmissionBody>,
    transcript: TranscriptRecorder,
    messages: UniversityProtocolMessage[],
  ): void {
    let accepted = true;
    let reason = "grade is strictly greater than 90";

    try {
      this.simulator.verifyUniversityDiplomaForMallDiscount(
        message.body.credential,
        message.body.credentialProof,
        message.body.request,
        message.body.presentation,
        message.body.presentationProof,
      );
      this.acceptedCount += 1;
    } catch {
      accepted = false;
      reason = "grade does not satisfy the mall threshold";
      this.rejectedCount += 1;
    }

    const result: ProtocolMessage<UniversityPresentationResultBody> = {
      type: "presentation:result",
      from: this.profile.partyId,
      to: message.from,
      envelope: createEnvelope(
        `discount-result:${this.mall.mallId}:${message.body.studentId}`,
        `discount:${this.mall.mallId}:${message.body.studentId}`,
        false,
        message.envelope.messageId,
        message.envelope.threadId,
      ),
      body: {
        kind: "mallDiscount",
        studentId: message.body.studentId,
        accepted,
        reason,
      },
    };

    bus.send(result);
    messages.push(result);
    transcript.record(
      "discounts",
      result,
      `Mall ${this.mall.mallId} returned ${accepted ? "accepted" : "rejected"} for ${message.body.studentId}`,
    );
  }
}

export class UniversityProtocolFlowRunner {
  readonly university = readJson<UniversityProfile>(dataPaths.university);
  readonly students = readJson<StudentRecord[]>(dataPaths.students);
  readonly companies = readJson<CompanyRecord[]>(dataPaths.companies);
  readonly mall = readJson<MallRecord>(dataPaths.mall);
  readonly issuanceBatches = readJson<IssuanceBatchRecord[]>(dataPaths.issuanceBatches);
  readonly discountApplicants = readJson<DiscountApplicantRecord[]>(dataPaths.discountApplicants);
  readonly bus = new MessageBus();
  readonly transcript = new TranscriptRecorder();
  readonly issuanceMessages: UniversityProtocolMessage[] = [];
  readonly jobMessages: UniversityProtocolMessage[] = [];
  readonly discountMessages: UniversityProtocolMessage[] = [];
  readonly issuer = new UniversityIssuerProtocolAgent(this.university);
  readonly studentAgents = new Map(
    this.students.map((student) => [student.studentId, new UniversityStudentAgent(student)]),
  );
  readonly companyAgents = new Map(
    this.companies.map((company) => [company.companyId, new UniversityCompanyVerifierAgent(company)]),
  );
  readonly mallAgent = new UniversityMallVerifierAgent(this.mall);

  runAll(): UniversityProtocolFlowResult {
    const issuedStudentIds = this.runIssuance();
    this.runJobApplications();
    this.runDiscounts();

    const companyAcceptedCounts = Object.fromEntries(
      [...this.companyAgents.entries()].map(([companyId, agent]) => [companyId, agent.acceptedCount]),
    );
    const discountOutcomes = Object.fromEntries(
      this.discountApplicants.map((applicant) => {
        const student = this.studentAgents.get(applicant.studentId)!;
        const lastResult = student.receivedResults.filter(
          (result) => result.kind === "mallDiscount",
        ).at(-1);
        return [applicant.studentId, lastResult?.accepted ? "accepted" : "rejected"] as const;
      }),
    );

    return {
      issuance: {
        requestCount: this.issuanceMessages.filter((message) => message.type === "issuance:request").length,
        resultCount: this.issuanceMessages.filter((message) => message.type === "issuance:result").length,
        batchCount: this.issuanceBatches.length,
        issuedStudentIds,
        messages: this.issuanceMessages,
      },
      jobApplications: {
        requestCount: this.jobMessages.filter((message) => message.type === "presentation:request").length,
        submissionCount: this.jobMessages.filter((message) => message.type === "presentation:submission").length,
        resultCount: this.jobMessages.filter((message) => message.type === "presentation:result").length,
        acceptedCount: Object.values(companyAcceptedCounts).reduce((sum, count) => sum + count, 0),
        companyAcceptedCounts,
        messages: this.jobMessages,
      },
      discounts: {
        requestCount: this.discountMessages.filter((message) => message.type === "presentation:request").length,
        submissionCount: this.discountMessages.filter((message) => message.type === "presentation:submission").length,
        resultCount: this.discountMessages.filter((message) => message.type === "presentation:result").length,
        acceptedCount: this.mallAgent.acceptedCount,
        rejectedCount: this.mallAgent.rejectedCount,
        outcomes: discountOutcomes,
        messages: this.discountMessages,
      },
      transcript: this.transcript.entries,
    };
  }

  private runIssuance(): readonly string[] {
    for (const student of this.studentAgents.values()) {
      student.sendIssuanceRequest(
        this.bus,
        this.issuer.profile.partyId,
        this.transcript,
        this.issuanceMessages,
      );
    }

    const issuedStudentIds = this.issuer.processIssuanceBatches(
      this.bus,
      this.studentAgents,
      this.issuanceBatches,
      this.transcript,
      this.issuanceMessages,
    );

    for (const studentId of issuedStudentIds) {
      const result = this.bus.receive(studentId) as ProtocolMessage<UniversityIssuanceResultBody> | undefined;
      if (!result) {
        throw new Error(`Missing issuance result delivery for ${studentId}`);
      }
      this.studentAgents.get(studentId)!.receiveIssuanceResult(result);
    }

    return issuedStudentIds;
  }

  private runJobApplications(): void {
    for (const student of this.studentAgents.values()) {
      const issued = student.storedIssuedCredential;
      if (!issued) {
        throw new Error(`Student ${student.record.studentId} has no issued credential`);
      }
      const companyAgent = this.companyAgents.get(student.record.assignedCompanyId);
      if (!companyAgent) {
        throw new Error(`Missing company ${student.record.assignedCompanyId}`);
      }

      companyAgent.sendRequest(
        this.bus,
        student,
        issued.fixture.credential.issuerVerificationMethodRef,
        this.transcript,
        this.jobMessages,
      );
    }

    for (const student of this.studentAgents.values()) {
      const request = this.bus.receive(student.profile.partyId) as ProtocolMessage<UniversityPresentationRequestBody> | undefined;
      if (!request) {
        throw new Error(`Missing job request for ${student.record.studentId}`);
      }
      student.receivePresentationRequestAndSendSubmission(
        this.bus,
        request,
        this.issuer.profile,
        this.transcript,
        this.jobMessages,
      );
    }

    for (const companyAgent of this.companyAgents.values()) {
      const submissions = this.bus.drain(companyAgent.profile.partyId) as Array<ProtocolMessage<UniversityPresentationSubmissionBody>>;
      for (const submission of submissions) {
        companyAgent.receiveSubmissionAndSendResult(
          this.bus,
          submission,
          this.transcript,
          this.jobMessages,
        );
      }
    }

    for (const student of this.studentAgents.values()) {
      const result = this.bus.receive(student.profile.partyId) as ProtocolMessage<UniversityPresentationResultBody> | undefined;
      if (!result) {
        throw new Error(`Missing job application result for ${student.record.studentId}`);
      }
      student.receivePresentationResult(result);
    }
  }

  private runDiscounts(): void {
    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId);
      if (!student || !student.storedIssuedCredential) {
        throw new Error(`Missing issued student for discount applicant ${applicant.studentId}`);
      }
      this.mallAgent.sendRequest(
        this.bus,
        student,
        student.storedIssuedCredential.fixture.credential.issuerVerificationMethodRef,
        this.transcript,
        this.discountMessages,
      );
    }

    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId)!;
      const request = this.bus.receive(student.profile.partyId) as ProtocolMessage<UniversityPresentationRequestBody> | undefined;
      if (!request) {
        throw new Error(`Missing discount request for ${student.record.studentId}`);
      }
      student.receivePresentationRequestAndSendSubmission(
        this.bus,
        request,
        this.issuer.profile,
        this.transcript,
        this.discountMessages,
      );
    }

    const submissions = this.bus.drain(this.mallAgent.profile.partyId) as Array<ProtocolMessage<UniversityPresentationSubmissionBody>>;
    for (const submission of submissions) {
      this.mallAgent.receiveSubmissionAndSendResult(
        this.bus,
        submission,
        this.transcript,
        this.discountMessages,
      );
    }

    for (const applicant of this.discountApplicants) {
      const student = this.studentAgents.get(applicant.studentId)!;
      const result = this.bus.receive(student.profile.partyId) as ProtocolMessage<UniversityPresentationResultBody> | undefined;
      if (!result) {
        throw new Error(`Missing discount result for ${student.record.studentId}`);
      }
      student.receivePresentationResult(result);
    }
  }
}
