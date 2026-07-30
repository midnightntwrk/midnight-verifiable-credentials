import {
  type CircuitContext,
  type CircuitResults,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";

import {
  Contract,
  type Ledger,
  ledger,
  type Proof,
  pureCircuits,
  type UniversityDiplomaCredential,
  type UniversityDiplomaPresentation,
  type UniversityDiplomaPresentationRequest,
} from "./managed/university-verifier/contract/index.js";
import {
  type UniversityVerifierPrivateState,
  universityVerifierWitnesses,
} from "./witnesses.js";

export type UniversityJobApplicationRequestOptions = {
  readonly requireDiplomaIdDisclosure?: boolean;
  readonly requireStudentIdDisclosure?: boolean;
  readonly requireFacultyNameDisclosure?: boolean;
  readonly requireHonorsCodeDisclosure?: boolean;
  readonly requireGraduationMonthDisclosure?: boolean;
  readonly requireFinalGradeDisclosure?: boolean;
  readonly requireCreditsEarnedDisclosure?: boolean;
};

export class UniversityVerifierSimulator {
  readonly contract: Contract<UniversityVerifierPrivateState>;
  circuitContext: CircuitContext<UniversityVerifierPrivateState>;

  constructor() {
    this.contract = new Contract<UniversityVerifierPrivateState>(
      universityVerifierWitnesses,
    );
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(createConstructorContext({}, "0".repeat(64)));
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      currentZswapLocalState,
      currentContractState,
      currentPrivateState,
    );
  }

  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  private executeCircuit<T>(
    circuitFn: () => CircuitResults<UniversityVerifierPrivateState, T>,
  ): T {
    const result = circuitFn();
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      result.context.currentZswapLocalState,
      result.context.currentQueryContext.state,
      result.context.currentPrivateState,
    );
    return result.result;
  }

  universityJobApplicationRequest(
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    verifierChallengeHash: Uint8Array,
    options: UniversityJobApplicationRequestOptions = {},
  ): UniversityDiplomaPresentationRequest {
    const {
      requireDiplomaIdDisclosure = false,
      requireStudentIdDisclosure = false,
      requireFacultyNameDisclosure = false,
      requireHonorsCodeDisclosure = false,
      requireGraduationMonthDisclosure = false,
      requireFinalGradeDisclosure = false,
      requireCreditsEarnedDisclosure = false,
    } = options;

    return pureCircuits.universityJobApplicationRequest(
      issuerVerificationMethodRef,
      verifierChallengeHash,
      requireDiplomaIdDisclosure,
      requireStudentIdDisclosure,
      requireFacultyNameDisclosure,
      requireHonorsCodeDisclosure,
      requireGraduationMonthDisclosure,
      requireFinalGradeDisclosure,
      requireCreditsEarnedDisclosure,
    );
  }

  universityMallDiscountRequest(
    issuerVerificationMethodRef: UniversityDiplomaCredential["issuerVerificationMethodRef"],
    verifierChallengeHash: Uint8Array,
    minimumFinalGrade: bigint,
  ): UniversityDiplomaPresentationRequest {
    return pureCircuits.universityMallDiscountRequest(
      issuerVerificationMethodRef,
      verifierChallengeHash,
      minimumFinalGrade,
    );
  }

  verifyUniversityDiplomaForJobApplication(
    credential: UniversityDiplomaCredential,
    credentialProof: Proof,
    request: UniversityDiplomaPresentationRequest,
    presentation: UniversityDiplomaPresentation,
    presentationProof: Proof,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyUniversityDiplomaForJobApplication(
        this.circuitContext,
        credential,
        credentialProof,
        request,
        presentation,
        presentationProof,
      ),
    );
  }

  verifyUniversityDiplomaForMallDiscount(
    credential: UniversityDiplomaCredential,
    credentialProof: Proof,
    request: UniversityDiplomaPresentationRequest,
    presentation: UniversityDiplomaPresentation,
    presentationProof: Proof,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyUniversityDiplomaForMallDiscount(
        this.circuitContext,
        credential,
        credentialProof,
        request,
        presentation,
        presentationProof,
      ),
    );
  }
}
