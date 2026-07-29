import {
  type CircuitContext,
  type CircuitResults,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";

import {
  Contract,
  type DummyClaimsCredential,
  type DummyClaimsPresentation,
  type DummyClaimsPresentationRequest,
  type Ledger,
  ledger,
  type Proof,
  pureCircuits,
} from "./managed/dummy-claims-verifier/contract/index.js";
import {
  type DummyClaimsVerifierPrivateState,
  dummyClaimsVerifierWitnesses,
} from "./witnesses.js";

export class DummyClaimsVerifierSimulator {
  readonly contract: Contract<DummyClaimsVerifierPrivateState>;
  circuitContext: CircuitContext<DummyClaimsVerifierPrivateState>;

  constructor() {
    this.contract = new Contract<DummyClaimsVerifierPrivateState>(
      dummyClaimsVerifierWitnesses,
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

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  private executeCircuit<T>(
    circuitFn: () => CircuitResults<DummyClaimsVerifierPrivateState, T>,
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

  public dummyClaimsVerifierRequest(
    issuerVerificationMethodRef: DummyClaimsCredential["issuerVerificationMethodRef"],
    verifierChallengeHash: Uint8Array,
  ): DummyClaimsPresentationRequest {
    return pureCircuits.dummyClaimsVerifierRequest(
      issuerVerificationMethodRef,
      verifierChallengeHash,
    );
  }

  public verifyDummyClaimsPresentationForDummyClaimsVerifier(
    credential: DummyClaimsCredential,
    credentialProof: Proof,
    request: DummyClaimsPresentationRequest,
    presentation: DummyClaimsPresentation,
    presentationProof: Proof,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyDummyClaimsPresentationForDummyClaimsVerifier(
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
