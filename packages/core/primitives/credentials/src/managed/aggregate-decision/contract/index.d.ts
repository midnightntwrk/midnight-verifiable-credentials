import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type AggregateChildDecisionBindingV1 = { domain: Uint8Array;
                                                version: bigint;
                                                familyDigest: Uint8Array;
                                                schemaDigest: Uint8Array;
                                                transcriptDigest: Uint8Array;
                                                anchorEvidenceDigest: Uint8Array;
                                                issuerDidDigest: Uint8Array;
                                                issuerMethodDigest: Uint8Array;
                                                issuerRelationship: bigint;
                                                issuerEvidenceDigest: Uint8Array;
                                                trustScopeDigest: Uint8Array;
                                                trustEvidenceDigest: Uint8Array;
                                                statusMode: bigint;
                                                statusRegistryDigest: Uint8Array;
                                                statusRoot: Uint8Array;
                                                statusRegistryVersion: bigint;
                                                statusFreshnessPolicyDigest: Uint8Array;
                                                statusEvidenceDigest: Uint8Array;
                                                timeMode: bigint;
                                                trustedTime: bigint;
                                                timeEvidenceDigest: Uint8Array;
                                                artifactManifestDigest: Uint8Array;
                                                artifactEvidenceDigest: Uint8Array;
                                                holderBindingDigest: Uint8Array;
                                                profile: bigint;
                                                resultKind: bigint;
                                                proofStatus: bigint;
                                                decisionStatus: bigint;
                                                executionStatus: bigint;
                                                authority: bigint;
                                                decisionNullifier: Uint8Array;
                                                transactionDigest: Uint8Array;
                                                atomicMutation: bigint
                                              };

export type AggregateChildSetV1 = { domain: Uint8Array;
                                    version: bigint;
                                    childCount: bigint;
                                    firstChildDigest: Uint8Array;
                                    secondChildDigest: Uint8Array;
                                    thirdChildDigest: Uint8Array
                                  };

export type AggregateSameHolderBindingV1 = { domain: Uint8Array;
                                             version: bigint;
                                             mode: bigint;
                                             verifierContractDigest: Uint8Array;
                                             challengeDigest: Uint8Array;
                                             childCount: bigint;
                                             firstHolderBindingDigest: Uint8Array;
                                             secondHolderBindingDigest: Uint8Array;
                                             thirdHolderBindingDigest: Uint8Array;
                                             childSetDigest: Uint8Array;
                                             proofDigest: Uint8Array
                                           };

export type AggregateRequestBindingV1 = { domain: Uint8Array;
                                          version: bigint;
                                          networkIdDigest: Uint8Array;
                                          verifierContractDigest: Uint8Array;
                                          deploymentDigest: Uint8Array;
                                          audienceDigest: Uint8Array;
                                          requestIdDigest: Uint8Array;
                                          challengeDigest: Uint8Array;
                                          expiresAt: bigint;
                                          policyDigest: Uint8Array;
                                          actionClassDigest: Uint8Array;
                                          actionInvocationDigest: Uint8Array;
                                          replayPolicy: bigint;
                                          replayScopeDigest: Uint8Array
                                        };

export type AggregateDecisionNullifierMaterialV1 = { domain: Uint8Array;
                                                     version: bigint;
                                                     deploymentDigest: Uint8Array;
                                                     verifierContractDigest: Uint8Array;
                                                     requestBindingDigest: Uint8Array;
                                                     childSetDigest: Uint8Array;
                                                     actionClassDigest: Uint8Array;
                                                     actionInvocationDigest: Uint8Array;
                                                     replayPolicy: bigint;
                                                     replayScopeDigest: Uint8Array;
                                                     sameHolderBindingDigest: Uint8Array;
                                                     policyDigest: Uint8Array
                                                   };

export type AggregateDecisionTranscriptV1 = { domain: Uint8Array;
                                              version: bigint;
                                              authority: bigint;
                                              childCount: bigint;
                                              requestBindingDigest: Uint8Array;
                                              childSetDigest: Uint8Array;
                                              sameHolderBindingDigest: Uint8Array;
                                              aggregateTrustedTime: bigint;
                                              nullifierMode: bigint;
                                              decisionNullifier: Uint8Array
                                            };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
}

export type ProvableCircuits<PS> = {
}

export type PureCircuits = {
  aggregateChildDecisionBindingDomainV1(): Uint8Array;
  aggregateChildSetDomainV1(): Uint8Array;
  aggregateRequestBindingDomainV1(): Uint8Array;
  aggregateSameHolderBindingDomainV1(): Uint8Array;
  aggregateDecisionTranscriptDomainV1(): Uint8Array;
  aggregateDecisionNullifierDomainV1(): Uint8Array;
  aggregateChildDecisionBindingV1Digest(binding_0: AggregateChildDecisionBindingV1): Uint8Array;
  aggregateChildSetV1Digest(childSet_0: AggregateChildSetV1): Uint8Array;
  aggregateRequestBindingV1Digest(request_0: AggregateRequestBindingV1): Uint8Array;
  aggregateSameHolderBindingV1Digest(binding_0: AggregateSameHolderBindingV1): Uint8Array;
  aggregateDecisionNullifierMaterialV1Digest(material_0: AggregateDecisionNullifierMaterialV1): Uint8Array;
  aggregateDecisionTranscriptV1Digest(transcript_0: AggregateDecisionTranscriptV1): Uint8Array;
}

export type Circuits<PS> = {
  aggregateChildDecisionBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateChildSetDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateRequestBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateSameHolderBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateDecisionTranscriptDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateDecisionNullifierDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateChildDecisionBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                        binding_0: AggregateChildDecisionBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateChildSetV1Digest(context: __compactRuntime.CircuitContext<PS>,
                            childSet_0: AggregateChildSetV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateRequestBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                  request_0: AggregateRequestBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateSameHolderBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                     binding_0: AggregateSameHolderBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateDecisionNullifierMaterialV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                             material_0: AggregateDecisionNullifierMaterialV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  aggregateDecisionTranscriptV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                      transcript_0: AggregateDecisionTranscriptV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
