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
  type RevocationAccessDecision,
  type RevocationRegistryState,
  type SecretBirthCredential,
  type SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
  type SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
  type SecretBirthCredentialVerificationLiveStatusInputs,
  type SecretBirthCredentialVerificationLiveStatusRequest,
  type SecretBirthCredentialVerificationRevokedSetStatusInputs,
  type SecretBirthCredentialVerificationRevokedSetStatusRequest,
  type SecretBirthCredentialVerificationSubmission,
  type SecretBirthCredentialWithStatusBinding,
  type VerificationMethodRef,
} from "./managed/demo-revocation/contract/index.js";
import {
  type CredentialsDemoRevocationPrivateState,
  revocationWitnesses,
} from "./revocation-witnesses.js";

const DEFAULT_REFERENCE_LEDGER_TIME = 1_103_760_010n;

export class CredentialsDemoRevocationSimulator {
  readonly contract: Contract<CredentialsDemoRevocationPrivateState>;
  circuitContext: CircuitContext<CredentialsDemoRevocationPrivateState>;

  constructor() {
    this.contract = new Contract<CredentialsDemoRevocationPrivateState>(
      revocationWitnesses,
    );
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext(
        {
          holderSecret: new Uint8Array(32),
          holderSecretOpening: new Uint8Array(32),
          holderBindingBlindingFactor: new Uint8Array(32),
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

  public setHolderWitnesses({
    holderSecret,
    holderSecretOpening,
    holderBindingBlindingFactor,
    holderBirthDateDays,
    holderBirthDateOpening,
  }: {
    readonly holderSecret: Uint8Array;
    readonly holderSecretOpening: Uint8Array;
    readonly holderBindingBlindingFactor: Uint8Array;
    readonly holderBirthDateDays: bigint;
    readonly holderBirthDateOpening: Uint8Array;
  }): void {
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      this.circuitContext.currentZswapLocalState,
      this.circuitContext.currentQueryContext.state,
      {
        ...this.circuitContext.currentPrivateState,
        holderSecret,
        holderSecretOpening,
        holderBindingBlindingFactor,
        holderBirthDateDays,
        holderBirthDateOpening,
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
    circuitFn: () => CircuitResults<CredentialsDemoRevocationPrivateState, T>,
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

  public issueSecretBirthCredential(
    credential: SecretBirthCredential,
    credentialProof: Proof,
  ): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.issueSecretBirthCredential(
        this.circuitContext,
        credential,
        credentialProof,
      ),
    );
  }

  public initializeLiveStatusRegistry(registryId: Uint8Array): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.initializeLiveStatusRegistry(
        this.circuitContext,
        registryId,
      ),
    );
  }

  public revokeLiveStatusHandle(statusHandle: Uint8Array): void {
    this.executeCircuit(() =>
      this.contract.impureCircuits.revokeLiveStatusHandle(
        this.circuitContext,
        statusHandle,
      ),
    );
  }

  public revocationAwareVerifierSuppliedRootRequest(
    issuerVerificationMethodRef: VerificationMethodRef,
    verifierIdentityDigest: Uint8Array,
    verifierChallengeHash: Uint8Array,
    registryState: RevocationRegistryState,
    trustedTime = DEFAULT_REFERENCE_LEDGER_TIME,
  ): SecretBirthCredentialVerificationRevokedSetStatusRequest {
    this.setLedgerTime(trustedTime);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.revocationAwareVerifierSuppliedRootRequest(
        this.circuitContext,
        issuerVerificationMethodRef,
        verifierIdentityDigest,
        verifierChallengeHash,
        registryState,
        trustedTime,
      ),
    );
  }

  public revocationAwareAuthorityAttestedRequest(
    issuerVerificationMethodRef: VerificationMethodRef,
    verifierIdentityDigest: Uint8Array,
    verifierChallengeHash: Uint8Array,
    registryState: RevocationRegistryState,
    trustedTime = DEFAULT_REFERENCE_LEDGER_TIME,
  ): SecretBirthCredentialVerificationAuthorityAttestedStatusRequest {
    this.setLedgerTime(trustedTime);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.revocationAwareAuthorityAttestedRequest(
        this.circuitContext,
        issuerVerificationMethodRef,
        verifierIdentityDigest,
        verifierChallengeHash,
        registryState,
        trustedTime,
      ),
    );
  }

  public revocationAwareLiveStatusRequest(
    issuerVerificationMethodRef: VerificationMethodRef,
    verifierIdentityDigest: Uint8Array,
    verifierChallengeHash: Uint8Array,
    trustedTime = DEFAULT_REFERENCE_LEDGER_TIME,
  ): SecretBirthCredentialVerificationLiveStatusRequest {
    this.setLedgerTime(trustedTime);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.revocationAwareLiveStatusRequest(
        this.circuitContext,
        issuerVerificationMethodRef,
        verifierIdentityDigest,
        verifierChallengeHash,
        trustedTime,
      ),
    );
  }

  public issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
    credentialWithStatus: SecretBirthCredentialWithStatusBinding,
    request: SecretBirthCredentialVerificationRevokedSetStatusRequest,
    submission: SecretBirthCredentialVerificationSubmission,
    statusInputs: SecretBirthCredentialVerificationRevokedSetStatusInputs,
    currentDay: bigint,
    ledgerTimeSeconds = submission.envelope.createdAt,
  ): Uint8Array {
    this.setLedgerTime(ledgerTimeSeconds);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.issueRevocationAwareCapabilityWithVerifierSuppliedRoot(
        this.circuitContext,
        credentialWithStatus,
        request,
        submission,
        statusInputs,
        currentDay,
      ),
    );
  }

  public issueRevocationAwareCapabilityWithAuthorityAttestation(
    credentialWithStatus: SecretBirthCredentialWithStatusBinding,
    request: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
    submission: SecretBirthCredentialVerificationSubmission,
    statusInputs: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
    currentDay: bigint,
    currentTime: bigint,
    ledgerTimeSeconds = currentTime,
  ): Uint8Array {
    this.setLedgerTime(ledgerTimeSeconds);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.issueRevocationAwareCapabilityWithAuthorityAttestation(
        this.circuitContext,
        credentialWithStatus,
        request,
        submission,
        statusInputs,
        currentDay,
        currentTime,
      ),
    );
  }

  public issueRevocationAwareCapabilityWithLiveStatus(
    credentialWithStatus: SecretBirthCredentialWithStatusBinding,
    request: SecretBirthCredentialVerificationLiveStatusRequest,
    submission: SecretBirthCredentialVerificationSubmission,
    statusInputs: SecretBirthCredentialVerificationLiveStatusInputs,
    currentDay: bigint,
    ledgerTimeSeconds = submission.envelope.createdAt,
  ): Uint8Array {
    this.setLedgerTime(ledgerTimeSeconds);
    return this.executeCircuit(() =>
      this.contract.impureCircuits.issueRevocationAwareCapabilityWithLiveStatus(
        this.circuitContext,
        credentialWithStatus,
        request,
        submission,
        statusInputs,
        currentDay,
      ),
    );
  }

  public claimRevocationAwareCapability(
    capability: Uint8Array,
  ): RevocationAccessDecision {
    return this.executeCircuit(() =>
      this.contract.impureCircuits.claimRevocationAwareCapability(
        this.circuitContext,
        capability,
      ),
    );
  }
}
