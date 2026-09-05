import { TextEncoder } from "node:util";

import {
  type CircuitContext,
  type CircuitResults,
  createCircuitContext,
  createConstructorContext,
  type JubjubPoint,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";

import {
  type AccessDecision,
  type AgeGateDecisionReceiptV1,
  type BirthCredential,
  type BirthCredentialPresentation,
  type BirthCredentialPresentationRequest,
  Contract,
  type Ledger,
  ledger,
  type Proof,
  pureCircuits,
  type VerificationTranscriptV1,
} from "./managed/demo/contract/index.js";
import {
  type CredentialsDemoPrivateState,
  witnesses,
} from "./witnesses.js";

export interface AgeGateDeploymentContextV1 {
  readonly networkIdDigest: Uint8Array;
  readonly deploymentDigest: Uint8Array;
  readonly verifierContractDigest: Uint8Array;
}

const fixedContextDigest = (label: string): Uint8Array => {
  const value = new Uint8Array(32);
  value.set(new TextEncoder().encode(label).slice(0, 32));
  return value;
};

export const DEFAULT_AGE_GATE_DEPLOYMENT_CONTEXT_V1: AgeGateDeploymentContextV1 = {
  networkIdDigest: fixedContextDigest("vc-demo:network:undeployed"),
  deploymentDigest: fixedContextDigest("vc-demo:age-gate:deployment:v1"),
  verifierContractDigest: fixedContextDigest("vc-demo:age-gate:verifier:v1"),
};

export interface SerializedCompetingTransactionV1<T> {
  readonly speculative: T;
  readonly committed: boolean;
  readonly serialized: T;
}

export class CredentialsDemoSimulator {
  readonly contract: Contract<CredentialsDemoPrivateState>;
  circuitContext: CircuitContext<CredentialsDemoPrivateState>;

  constructor(
    restoredContext?: CircuitContext<CredentialsDemoPrivateState>,
    deploymentContext: AgeGateDeploymentContextV1 = DEFAULT_AGE_GATE_DEPLOYMENT_CONTEXT_V1,
  ) {
    this.contract = new Contract<CredentialsDemoPrivateState>(witnesses);
    if (restoredContext !== undefined) {
      this.circuitContext = restoredContext;
      return;
    }
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
      deploymentContext.networkIdDigest,
      deploymentContext.deploymentDigest,
      deploymentContext.verifierContractDigest,
    );
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      currentZswapLocalState,
      currentContractState,
      currentPrivateState,
    );
  }

  public restart(): CredentialsDemoSimulator {
    return new CredentialsDemoSimulator(this.circuitContext);
  }

  public fork(): CredentialsDemoSimulator {
    return new CredentialsDemoSimulator(this.circuitContext);
  }

  public tryCommitCircuitContext(
    expectedBase: CircuitContext<CredentialsDemoPrivateState>,
    candidate: CircuitContext<CredentialsDemoPrivateState>,
  ): boolean {
    if (this.circuitContext !== expectedBase) {
      return false;
    }
    this.circuitContext = candidate;
    return true;
  }

  public serializeCompetingTransactions<T>(
    transactions: readonly ((relay: CredentialsDemoSimulator) => T)[],
  ): readonly SerializedCompetingTransactionV1<T>[] {
    const expectedBase = this.circuitContext;
    const relays = transactions.map(() => this.fork());
    const speculative = transactions.map((transaction, index) =>
      transaction(relays[index]!),
    );

    return transactions.map((transaction, index) => {
      const committed = this.tryCommitCircuitContext(
        expectedBase,
        relays[index]!.circuitContext,
      );
      return {
        speculative: speculative[index]!,
        committed,
        serialized: committed ? speculative[index]! : transaction(this),
      };
    });
  }

  public simulateRolledBackTransaction<T>(transaction: () => T): T {
    const snapshot = this.circuitContext;
    const result = transaction();
    this.circuitContext = snapshot;
    return result;
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

  private setLedgerTime(secondsSinceEpoch: bigint): void {
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      this.circuitContext.currentZswapLocalState,
      this.circuitContext.currentQueryContext.state,
      this.circuitContext.currentPrivateState,
      undefined,
      undefined,
      Number(secondsSinceEpoch),
    );
  }

  private executeCircuit<T>(
    circuitFn: () => CircuitResults<CredentialsDemoPrivateState, T>,
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

  public issueBirthCredential(
    credential: BirthCredential,
    credentialProof: Proof,
    holderPublicKey: JubjubPoint,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.issueBirthCredential(
        this.circuitContext,
        credential,
        credentialProof,
        holderPublicKey,
      ),
    );
  }

  public verifyBirthPresentation(
    credential: BirthCredential,
    credentialProof: Proof,
    presentation: BirthCredentialPresentation,
    presentationProof: Proof,
    currentDay: bigint,
    ledgerTimeSeconds = currentDay * 86_400n,
  ): void {
    this.setLedgerTime(ledgerTimeSeconds);
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyBirthPresentation(
        this.circuitContext,
        credential,
        credentialProof,
        presentation,
        presentationProof,
        currentDay,
      ),
    );
  }

  public verifyBirthPresentationForRequest(
    credential: BirthCredential,
    credentialProof: Proof,
    request: BirthCredentialPresentationRequest,
    presentation: BirthCredentialPresentation,
    presentationProof: Proof,
    currentDay: bigint,
    ledgerTimeSeconds = currentDay * 86_400n,
  ): void {
    this.setLedgerTime(ledgerTimeSeconds);
    this.executeCircuit(() =>
      this.contract.impureCircuits.verifyBirthPresentationForRequest(
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

  public ageGateRequest(
    issuerVerificationMethodRef: BirthCredential["issuerVerificationMethodRef"],
    verifierChallengeHash: Uint8Array,
  ): BirthCredentialPresentationRequest {
    const state = this.getLedger();
    return pureCircuits.ageGateRequestForPolicy(
      issuerVerificationMethodRef,
      verifierChallengeHash,
      state.ageGateRequiresBirthCountryDisclosure,
      state.minimumAccessAgeYears,
    );
  }

  public issueAgeGateRequest(
    credential: BirthCredential,
    verifierChallengeHash: Uint8Array,
    currentDay: bigint,
    expiresAt: bigint,
    ledgerTimeSeconds = currentDay * 86_400n,
  ): Uint8Array {
    this.setLedgerTime(ledgerTimeSeconds);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.issueAgeGateRequest(
        this.circuitContext,
        credential.issuerVerificationMethodRef,
        verifierChallengeHash,
        currentDay,
        expiresAt,
      ),
    );
  }

  public ageGateDecisionTranscript(
    credential: BirthCredential,
    presentation: BirthCredentialPresentation,
    verifierChallengeHash: Uint8Array,
    currentDay: bigint,
    requestExpiresAt: bigint = currentDay + 1n,
  ): VerificationTranscriptV1 {
    const requestIdDigest = this.issueAgeGateRequest(
      credential,
      verifierChallengeHash,
      currentDay,
      requestExpiresAt,
    );
    return this.ageGateDecisionTranscriptForIssuedRequest(
      credential,
      presentation,
      verifierChallengeHash,
      currentDay,
      requestIdDigest,
    );
  }

  public ageGateDecisionTranscriptForIssuedRequest(
    credential: BirthCredential,
    presentation: BirthCredentialPresentation,
    verifierChallengeHash: Uint8Array,
    currentDay: bigint,
    requestIdDigest: Uint8Array,
  ): VerificationTranscriptV1 {
    const state = this.getLedger();
    return pureCircuits.ageGateDecisionTranscriptForContextV1(
      state.verificationNetworkIdDigest,
      state.verificationDeploymentDigest,
      state.verificationVerifierContractDigest,
      credential,
      presentation,
      verifierChallengeHash,
      currentDay,
      requestIdDigest,
      state.issuedAgeGateRequests.lookup(requestIdDigest).expiresAt,
    );
  }

  public issueAgeGateCapability(
    credential: BirthCredential,
    credentialProof: Proof,
    presentation: BirthCredentialPresentation,
    presentationProof: Proof,
    verifierChallengeHash: Uint8Array,
    currentDay: bigint,
    transcript: VerificationTranscriptV1,
    ledgerTimeSeconds = currentDay * 86_400n,
  ): AgeGateDecisionReceiptV1 {
    this.setLedgerTime(ledgerTimeSeconds);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.issueAgeGateCapability(
        this.circuitContext,
        credential,
        credentialProof,
        presentation,
        presentationProof,
        verifierChallengeHash,
        currentDay,
        transcript.requestIdDigest,
        pureCircuits.verificationTranscriptV1Digest(transcript),
      ),
    );
  }

  public claimAgeGateCapability(
    capability: Uint8Array,
  ): AccessDecision {
    return this.executeCircuit(() =>
      this.contract.impureCircuits.claimAgeGateCapability(
        this.circuitContext,
        capability,
      ),
    );
  }
}
