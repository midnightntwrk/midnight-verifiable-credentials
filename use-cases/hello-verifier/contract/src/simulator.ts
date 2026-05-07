import {
  type CircuitContext,
  type CircuitResults,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";

import {
  type BirthCredential,
  type BirthCredentialPresentation,
  type BirthCredentialPresentationRequest,
  Contract,
  type Ledger,
  ledger,
  type Proof,
  pureCircuits,
} from "./managed/hello-verifier/contract/index.js";
import {
  type HelloVerifierPrivateState,
  helloVerifierWitnesses,
} from "./witnesses.js";

export class HelloVerifierSimulator {
  readonly contract: Contract<HelloVerifierPrivateState>;
  circuitContext: CircuitContext<HelloVerifierPrivateState>;

  constructor() {
    this.contract = new Contract<HelloVerifierPrivateState>(
      helloVerifierWitnesses,
    );
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext(
        {
          holderBirthDateDays: 0n,
          holderBirthDateOpening: new Uint8Array(32),
        },
        "0".repeat(64),
      ),
    );
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      currentZswapLocalState,
      currentContractState,
      currentPrivateState,
    );
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public setAgeWitness(days: bigint, opening: Uint8Array): void {
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      this.circuitContext.currentZswapLocalState,
      this.circuitContext.currentQueryContext.state,
      {
        ...this.circuitContext.currentPrivateState,
        holderBirthDateDays: days,
        holderBirthDateOpening: opening,
      },
    );
  }

  private executeCircuit<T>(
    circuitFn: () => CircuitResults<HelloVerifierPrivateState, T>,
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

  public helloVerifierRequest(
    issuerVerificationMethodRef: BirthCredential["issuerVerificationMethodRef"],
    verifierChallengeHash: Uint8Array,
    requestedAgeThresholdYears: bigint,
  ): BirthCredentialPresentationRequest {
    return pureCircuits.helloVerifierRequest(
      issuerVerificationMethodRef,
      verifierChallengeHash,
      requestedAgeThresholdYears,
    );
  }

  public verifyBirthPresentationForHelloVerifier(
    credential: BirthCredential,
    credentialProof: Proof,
    request: BirthCredentialPresentationRequest,
    presentation: BirthCredentialPresentation,
    presentationProof: Proof,
    currentDay: bigint,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyBirthPresentationForHelloVerifier(
        this.circuitContext,
        credential,
        credentialProof,
        request,
        presentation,
        presentationProof,
        currentDay,
      ),
    );
  }
}
