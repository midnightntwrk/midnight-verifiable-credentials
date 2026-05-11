import {
  type CircuitContext,
  type CircuitResults,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";

import {
  Contract,
  type HelloFamilyCredential,
  type HelloFamilyPresentation,
  type HelloFamilyPresentationRequest,
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
      createConstructorContext({}, "0".repeat(64)),
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
    issuerVerificationMethodRef: HelloFamilyCredential["issuerVerificationMethodRef"],
    verifierChallengeHash: Uint8Array,
    requireBytesValueDisclosure: boolean,
  ): HelloFamilyPresentationRequest {
    return pureCircuits.helloVerifierRequest(
      issuerVerificationMethodRef,
      verifierChallengeHash,
      requireBytesValueDisclosure,
    );
  }

  public verifyHelloFamilyPresentationForHelloVerifier(
    credential: HelloFamilyCredential,
    credentialProof: Proof,
    request: HelloFamilyPresentationRequest,
    presentation: HelloFamilyPresentation,
    presentationProof: Proof,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyHelloFamilyPresentationForHelloVerifier(
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
