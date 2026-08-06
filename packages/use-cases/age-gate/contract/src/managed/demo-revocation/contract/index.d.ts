import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type SchemaRef = { packageId: Uint8Array;
                          schemaId: Uint8Array;
                          majorVersion: bigint;
                          minorVersion: bigint
                        };

export type SchemaCapabilities = { supportsSelectiveDisclosure: boolean;
                                   supportsPredicateProofs: boolean;
                                   supportsVerifierScopedPseudonym: boolean;
                                   supportsSameHolderProof: boolean
                                 };

export type SchemaFamilyResolutionHint = { hasResolverHint: boolean;
                                           resolverHint: Uint8Array
                                         };

export type SchemaDescriptor = { schema: SchemaRef;
                                 capabilities: SchemaCapabilities;
                                 familyResolutionHint: SchemaFamilyResolutionHint
                               };

export type VerificationMethodRef = { didContractAddress: { bytes: Uint8Array };
                                      methodId: Uint8Array
                                    };

export type NoPublicClaims = {  };

export type NoClaimCommitments = {  };

export type Signature = { r: __compactRuntime.JubjubPoint; s: bigint };

export type ExplicitHolderBinding = { holderVerificationMethodRef: VerificationMethodRef
                                    };

export type JubjubHolderBinding = { holderPublicKey: __compactRuntime.JubjubPoint
                                  };

export type OffchainMidnightHolderBinding = { holderDidStateHash: Uint8Array;
                                              holderMethodId: Uint8Array;
                                              holderPublicKey: __compactRuntime.JubjubPoint
                                            };

export type SecretHolderBinding = { holderSecretCommitment: Uint8Array;
                                    requestChallengeResponse: Uint8Array
                                  };

export type BlindedSecretHolderBinding = { blindedHolderSecretCommitment: Uint8Array;
                                           issuerNonce: Uint8Array;
                                           requestChallengeResponse: Uint8Array
                                         };

export type Proof = { signerVerificationMethodRef: VerificationMethodRef;
                      createdAt: bigint;
                      challengeHash: Uint8Array;
                      publicKey: __compactRuntime.JubjubPoint;
                      signature: Signature
                    };

export enum HolderBindingProfile { explicitDid = 0,
                                   secretHolder = 1,
                                   blindedSecretHolder = 2
}

export type CredentialProtocolFeatures = { supportsSelectiveDisclosure: boolean;
                                           supportsPredicateProofs: boolean;
                                           supportsVerifierScopedPseudonym: boolean;
                                           supportsSameHolderProof: boolean
                                         };

export type ProtocolMessageEnvelope = { version: bigint;
                                        messageId: Uint8Array;
                                        threadId: Uint8Array;
                                        initialMessage: boolean;
                                        respondsToMessageId: Uint8Array;
                                        createdAt: bigint;
                                        hasExpiresAt: boolean;
                                        expiresAt: bigint
                                      };

export type StatusRegistryRef = { registryId: Uint8Array;
                                  authorityVerificationMethodRef: VerificationMethodRef
                                };

export type NoStatusBinding = {  };

export enum StatusType { revocationRegistry = 0 }

export type RegistryBoundStatusBinding = { statusType: StatusType;
                                           registryRef: StatusRegistryRef;
                                           statusHandleCommitment: Uint8Array
                                         };

export type CredentialBindingV1 = { domain: Uint8Array;
                                    version: bigint;
                                    mode: bigint;
                                    credentialFamilyDigest: Uint8Array;
                                    schemaDigest: Uint8Array;
                                    verifierContractDigest: Uint8Array;
                                    challengeDigest: Uint8Array;
                                    credentialRoot: Uint8Array
                                  };

export type HolderBindingV1 = { domain: Uint8Array;
                                version: bigint;
                                mode: bigint;
                                verifierContractDigest: Uint8Array;
                                challengeDigest: Uint8Array;
                                subjectBindingDigest: Uint8Array
                              };

export type ConsentBindingV1 = { domain: Uint8Array;
                                 version: bigint;
                                 profile: bigint;
                                 networkIdDigest: Uint8Array;
                                 verifierContractDigest: Uint8Array;
                                 deploymentDigest: Uint8Array;
                                 audienceDigest: Uint8Array;
                                 originMode: bigint;
                                 originDigest: Uint8Array;
                                 requestIdDigest: Uint8Array;
                                 challengeDigest: Uint8Array;
                                 expiresAt: bigint;
                                 credentialFamilyDigest: Uint8Array;
                                 schemaDigest: Uint8Array;
                                 disclosureDigest: Uint8Array;
                                 predicateDigest: Uint8Array;
                                 statusMode: bigint;
                                 statusRegistryDigest: Uint8Array;
                                 statusRoot: Uint8Array;
                                 statusRegistryVersion: bigint;
                                 statusFreshnessPolicyDigest: Uint8Array;
                                 policyDigest: Uint8Array;
                                 actionClassDigest: Uint8Array;
                                 actionInvocationDigest: Uint8Array;
                                 artifactManifestDigest: Uint8Array;
                                 replayPolicy: bigint
                               };

export type PresentationBindingV1 = { domain: Uint8Array;
                                      version: bigint;
                                      credentialBindingDigest: Uint8Array;
                                      holderBindingDigest: Uint8Array;
                                      disclosureDigest: Uint8Array;
                                      predicateDigest: Uint8Array;
                                      consentDigest: Uint8Array
                                    };

export type EvidenceBindingV1 = { domain: Uint8Array;
                                  version: bigint;
                                  mode: bigint;
                                  authorityDigest: Uint8Array;
                                  subjectDigest: Uint8Array;
                                  stateAnchorDigest: Uint8Array;
                                  statementDigest: Uint8Array;
                                  createdAt: bigint;
                                  expiresAt: bigint
                                };

export type AnchorEvidenceReceiptV1 = { domain: Uint8Array;
                                        version: bigint;
                                        issuerEvidenceDigest: Uint8Array;
                                        trustEvidenceDigest: Uint8Array;
                                        statusEvidenceDigest: Uint8Array;
                                        timeEvidenceDigest: Uint8Array;
                                        artifactEvidenceDigest: Uint8Array;
                                        connectorEvidenceDigest: Uint8Array
                                      };

export type DecisionNullifierMaterialV1 = { domain: Uint8Array;
                                            version: bigint;
                                            deploymentDigest: Uint8Array;
                                            verifierContractDigest: Uint8Array;
                                            replayPolicy: bigint;
                                            replayScopeDigest: Uint8Array
                                          };

export type SyntheticVerificationExtensionV1 = { domain: Uint8Array;
                                                 version: bigint;
                                                 familyDigest: Uint8Array;
                                                 valueDigest: Uint8Array
                                               };

export type VerificationTranscriptV1 = { domain: Uint8Array;
                                         version: bigint;
                                         profile: bigint;
                                         authority: bigint;
                                         networkIdDigest: Uint8Array;
                                         verifierContractDigest: Uint8Array;
                                         deploymentDigest: Uint8Array;
                                         audienceDigest: Uint8Array;
                                         originMode: bigint;
                                         originDigest: Uint8Array;
                                         connectorEvidenceDigest: Uint8Array;
                                         requestIdDigest: Uint8Array;
                                         challengeDigest: Uint8Array;
                                         expiresAt: bigint;
                                         credentialFamilyDigest: Uint8Array;
                                         schemaDigest: Uint8Array;
                                         credentialBindingMode: bigint;
                                         credentialBindingDigest: Uint8Array;
                                         disclosureDigest: Uint8Array;
                                         predicateDigest: Uint8Array;
                                         holderBindingDigest: Uint8Array;
                                         policyDigest: Uint8Array;
                                         actionClassDigest: Uint8Array;
                                         actionInvocationDigest: Uint8Array;
                                         consentDigest: Uint8Array;
                                         presentationBindingDigest: Uint8Array;
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
                                         nullifierMode: bigint;
                                         replayPolicy: bigint;
                                         replayScopeDigest: Uint8Array;
                                         decisionNullifier: Uint8Array
                                       };

export type VerificationPublicInputsV1 = { transcript: VerificationTranscriptV1;
                                           issuerEvidence: EvidenceBindingV1;
                                           trustEvidence: EvidenceBindingV1;
                                           statusEvidence: EvidenceBindingV1;
                                           timeEvidence: EvidenceBindingV1;
                                           artifactEvidence: EvidenceBindingV1;
                                           connectorEvidence: EvidenceBindingV1
                                         };

export type SyntheticVerificationAttemptV1 = { proofStatus: bigint;
                                               decisionStatus: bigint;
                                               authority: bigint;
                                               executionStatus: bigint;
                                               transcriptDigest: Uint8Array
                                             };

export enum StatusCapabilityKind { noStatus = 0,
                                   publicStatus = 1,
                                   revokedSetNonMembership = 2,
                                   authorityAttestedStatus = 3
}

export type NoStatusCapability = {  };

export type RevokedSetNonMembershipStatusCapability = { statusType: StatusType;
                                                        registryRef: StatusRegistryRef;
                                                        statusHandleCommitment: Uint8Array
                                                      };

export type AuthorityAttestedStatusCapability = { statusType: StatusType;
                                                  registryRef: StatusRegistryRef;
                                                  statusHandleCommitment: Uint8Array
                                                };

export type VerifierStatusPolicy = { requireStatus: boolean;
                                     acceptedStatusCapability: StatusCapabilityKind;
                                     enforceRegistryId: boolean;
                                     acceptedRegistryId: Uint8Array;
                                     enforceAttestationMaxAge: boolean;
                                     maxAttestationAge: bigint
                                   };

export type RevocationRegistryState = { registryId: Uint8Array;
                                        revokedRoot: Uint8Array;
                                        registryVersion: bigint
                                      };

export type RevokedSetStatusRequest = { registryState: RevocationRegistryState;
                                        verifierChallengeHash: Uint8Array
                                      };

export type RevokedSetNonMembershipWitnessInput = { registryState: RevocationRegistryState;
                                                    statusHandle: Uint8Array;
                                                    statusHandleOpening: Uint8Array
                                                  };

export type LiveStatusWitnessInput = { statusHandle: Uint8Array;
                                       statusHandleOpening: Uint8Array
                                     };

export type RevokedSetNonMembershipStatusProofProtocol = { request: RevokedSetStatusRequest;
                                                           witnessInput: RevokedSetNonMembershipWitnessInput
                                                         };

export type AuthorityAttestedStatusStatement = { registryState: RevocationRegistryState;
                                                 statusHandleCommitment: Uint8Array;
                                                 verifierChallengeHash: Uint8Array;
                                                 hasExpiration: boolean;
                                                 expiresAt: bigint
                                               };

export type AuthorityAttestedStatusProof = { statement: AuthorityAttestedStatusStatement;
                                             proof: Proof
                                           };

export type AuthorityAttestedStatusProofProtocol = { request: RevokedSetStatusRequest;
                                                     attestation: AuthorityAttestedStatusProof
                                                   };

export type BirthCredentialClaimCommitments = { subjectIdCommitment: Uint8Array;
                                                legalNameCommitment: Uint8Array;
                                                birthDateCommitment: Uint8Array;
                                                birthCountryCodeCommitment: Uint8Array
                                              };

export type SecretBirthCredentialDisclosures = { revealSubjectIdCommitment: boolean;
                                                 subjectIdCommitment: Uint8Array;
                                                 revealBirthCountryCode: boolean;
                                                 birthCountryCodePadded: Uint8Array;
                                                 birthCountryCodeOpening: Uint8Array;
                                                 revealVerifierScopedPseudonym: boolean;
                                                 verifierScopedPseudonym: Uint8Array;
                                                 proveAgeOverThreshold: boolean;
                                                 ageThresholdYears: bigint
                                               };

export type SecretBirthCredentialPresentationRequest = { version: bigint;
                                                         schema: SchemaRef;
                                                         issuerVerificationMethodRef: VerificationMethodRef;
                                                         requireSubjectIdCommitmentDisclosure: boolean;
                                                         requireBirthCountryDisclosure: boolean;
                                                         requireVerifierScopedPseudonym: boolean;
                                                         verifierDomainHash: Uint8Array;
                                                         requireAgeOverThreshold: boolean;
                                                         requestedAgeThresholdYears: bigint;
                                                         verifierChallengeHash: Uint8Array
                                                       };

export type SecretBirthCredential = { version: bigint,
                                      schema: SchemaRef,
                                      issuerVerificationMethodRef: VerificationMethodRef,
                                      holderBinding: BlindedSecretHolderBinding,
                                      statusBinding: NoStatusBinding,
                                      issuedAt: bigint,
                                      hasExpiration: boolean,
                                      expiresAt: bigint,
                                      claims: NoPublicClaims,
                                      claimCommitments: BirthCredentialClaimCommitments,
                                      claimRoot: Uint8Array
                                    };

export type SecretBirthStatusCredential = { version: bigint,
                                            schema: SchemaRef,
                                            issuerVerificationMethodRef: VerificationMethodRef,
                                            holderBinding: BlindedSecretHolderBinding,
                                            statusBinding: RegistryBoundStatusBinding,
                                            issuedAt: bigint,
                                            hasExpiration: boolean,
                                            expiresAt: bigint,
                                            claims: NoPublicClaims,
                                            claimCommitments: BirthCredentialClaimCommitments,
                                            claimRoot: Uint8Array
                                          };

export type SecretBirthCredentialPresentation = { version: bigint,
                                                  schema: SchemaRef,
                                                  credentialClaimRoot: Uint8Array,
                                                  issuerVerificationMethodRef: VerificationMethodRef,
                                                  holderBinding: BlindedSecretHolderBinding,
                                                  disclosed: SecretBirthCredentialDisclosures
                                                };

export type SecretBirthCredentialWithStatusBinding = { credential: SecretBirthStatusCredential;
                                                       credentialProof: Proof
                                                     };

export type SecretBirthCredentialVerificationAuthorityAttestedStatusRequest = { verificationRequest: SecretBirthCredentialVerificationRequest;
                                                                                statusPolicy: VerifierStatusPolicy;
                                                                                statusRequest: RevokedSetStatusRequest
                                                                              };

export type SecretBirthCredentialVerificationRevokedSetStatusRequest = { verificationRequest: SecretBirthCredentialVerificationRequest;
                                                                         statusPolicy: VerifierStatusPolicy;
                                                                         statusRequest: RevokedSetStatusRequest
                                                                       };

export type SecretBirthCredentialVerificationLiveStatusRequest = { verificationRequest: SecretBirthCredentialVerificationRequest;
                                                                   statusPolicy: VerifierStatusPolicy
                                                                 };

export type SecretBirthCredentialVerificationRevokedSetStatusInputs = { statusProofProtocol: RevokedSetNonMembershipStatusProofProtocol
                                                                      };

export type SecretBirthCredentialVerificationLiveStatusInputs = { witnessInput: LiveStatusWitnessInput
                                                                };

export type SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs = { statusProofProtocol: AuthorityAttestedStatusProofProtocol
                                                                                     };

export type SecretBirthCredentialIssuanceOfferBody = { supportsExpiration: boolean;
                                                       defaultExpirationDays: bigint;
                                                       offerExpiresAtDay: bigint;
                                                       requiresHolderSecret: boolean
                                                     };

export type SecretBirthCredentialIssuanceRequestBody = { holderSecretCommitment: Uint8Array;
                                                         holderBindingBlindingFactor: Uint8Array;
                                                         holderChallengeHash: Uint8Array;
                                                         requestExpiration: boolean;
                                                         requestedExpirationDays: bigint;
                                                         requestExpiresAtDay: bigint
                                                       };

export type SecretBirthCredentialIssuanceResultBody = { credential: SecretBirthCredential;
                                                        credentialProof: Proof;
                                                        issuanceChallengeHash: Uint8Array
                                                      };

export type SecretBirthCredentialVerificationRequestBody = { requireSubjectIdCommitmentDisclosure: boolean;
                                                             requireBirthCountryDisclosure: boolean;
                                                             requireVerifierScopedPseudonym: boolean;
                                                             verifierDomainHash: Uint8Array;
                                                             requireAgeOverThreshold: boolean;
                                                             requestedAgeThresholdYears: bigint
                                                           };

export type SecretBirthCredentialVerificationSubmissionBody = { credential: SecretBirthCredential;
                                                                credentialProof: Proof;
                                                                presentation: SecretBirthCredentialPresentation
                                                              };

export type SecretBirthCredentialVerificationResultBody = { credentialRoot: Uint8Array;
                                                            verifiedThresholdYears: bigint;
                                                            hasVerifierScopedPseudonym: boolean;
                                                            verifierScopedPseudonym: Uint8Array
                                                          };

export type SecretBirthCredentialIssuanceOffer = { envelope: ProtocolMessageEnvelope,
                                                   schema: SchemaRef,
                                                   issuerVerificationMethodRef: VerificationMethodRef,
                                                   holderBindingProfile: HolderBindingProfile,
                                                   features: CredentialProtocolFeatures,
                                                   body: SecretBirthCredentialIssuanceOfferBody
                                                 };

export type SecretBirthCredentialIssuanceRequest = { envelope: ProtocolMessageEnvelope,
                                                     schema: SchemaRef,
                                                     issuerVerificationMethodRef: VerificationMethodRef,
                                                     holderBindingProfile: HolderBindingProfile,
                                                     body: SecretBirthCredentialIssuanceRequestBody
                                                   };

export type SecretBirthCredentialIssuanceResult = { envelope: ProtocolMessageEnvelope,
                                                    schema: SchemaRef,
                                                    issuerVerificationMethodRef: VerificationMethodRef,
                                                    holderBindingProfile: HolderBindingProfile,
                                                    body: SecretBirthCredentialIssuanceResultBody
                                                  };

export type SecretBirthCredentialVerificationRequest = { envelope: ProtocolMessageEnvelope,
                                                         schema: SchemaRef,
                                                         issuerVerificationMethodRef: VerificationMethodRef,
                                                         holderBindingProfile: HolderBindingProfile,
                                                         features: CredentialProtocolFeatures,
                                                         verifierChallengeHash: Uint8Array,
                                                         body: SecretBirthCredentialVerificationRequestBody
                                                       };

export type SecretBirthCredentialVerificationSubmission = { envelope: ProtocolMessageEnvelope,
                                                            schema: SchemaRef,
                                                            issuerVerificationMethodRef: VerificationMethodRef,
                                                            holderBindingProfile: HolderBindingProfile,
                                                            challengeHash: Uint8Array,
                                                            body: SecretBirthCredentialVerificationSubmissionBody
                                                          };

export type SecretBirthCredentialVerificationResult = { envelope: ProtocolMessageEnvelope,
                                                        approved: boolean,
                                                        body: SecretBirthCredentialVerificationResultBody
                                                      };

export enum RevocationVerificationMode { noVerification = 0,
                                         sameContractLiveStatus = 1,
                                         verifierSuppliedRoot = 2,
                                         authorityAttested = 3
}

export enum RevocationAccessDecision { noDecision = 0,
                                       approved = 1,
                                       unknownCapability = 2,
                                       alreadyConsumed = 3
}

export type Witnesses<PS> = {
  holderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  holderSecretOpening(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  holderBindingBlindingFactor(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  holderBirthDateDays(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  holderBirthDateOpening(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  initializeLiveStatusRegistry(context: __compactRuntime.CircuitContext<PS>,
                               registryId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeLiveStatusHandle(context: __compactRuntime.CircuitContext<PS>,
                         statusHandle_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revocationAwareAgeGateVerificationRequest(context: __compactRuntime.CircuitContext<PS>,
                                            issuerVerificationMethodRef_0: VerificationMethodRef,
                                            verifierDomainHash_0: Uint8Array,
                                            verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationRequest>;
  revocationAwareVerifierSuppliedRootRequest(context: __compactRuntime.CircuitContext<PS>,
                                             issuerVerificationMethodRef_0: VerificationMethodRef,
                                             verifierDomainHash_0: Uint8Array,
                                             verifierChallengeHash_0: Uint8Array,
                                             registryState_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationRevokedSetStatusRequest>;
  revocationAwareAuthorityAttestedRequest(context: __compactRuntime.CircuitContext<PS>,
                                          issuerVerificationMethodRef_0: VerificationMethodRef,
                                          verifierDomainHash_0: Uint8Array,
                                          verifierChallengeHash_0: Uint8Array,
                                          registryState_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationAuthorityAttestedStatusRequest>;
  revocationAwareLiveStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                   issuerVerificationMethodRef_0: VerificationMethodRef,
                                   verifierDomainHash_0: Uint8Array,
                                   verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationLiveStatusRequest>;
  issueSecretBirthCredential(context: __compactRuntime.CircuitContext<PS>,
                             credential_0: SecretBirthCredential,
                             credentialProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  issueRevocationAwareCapabilityWithVerifierSuppliedRoot(context: __compactRuntime.CircuitContext<PS>,
                                                         credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                         request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest,
                                                         submission_0: SecretBirthCredentialVerificationSubmission,
                                                         statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs,
                                                         currentDay_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueRevocationAwareCapabilityWithLiveStatus(context: __compactRuntime.CircuitContext<PS>,
                                               credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                               request_0: SecretBirthCredentialVerificationLiveStatusRequest,
                                               submission_0: SecretBirthCredentialVerificationSubmission,
                                               statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs,
                                               currentDay_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueRevocationAwareCapabilityWithAuthorityAttestation(context: __compactRuntime.CircuitContext<PS>,
                                                         credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                         request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
                                                         submission_0: SecretBirthCredentialVerificationSubmission,
                                                         statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
                                                         currentDay_0: bigint,
                                                         currentTime_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claimRevocationAwareCapability(context: __compactRuntime.CircuitContext<PS>,
                                 capability_0: Uint8Array): __compactRuntime.CircuitResults<PS, RevocationAccessDecision>;
}

export type ProvableCircuits<PS> = {
  initializeLiveStatusRegistry(context: __compactRuntime.CircuitContext<PS>,
                               registryId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeLiveStatusHandle(context: __compactRuntime.CircuitContext<PS>,
                         statusHandle_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revocationAwareAgeGateVerificationRequest(context: __compactRuntime.CircuitContext<PS>,
                                            issuerVerificationMethodRef_0: VerificationMethodRef,
                                            verifierDomainHash_0: Uint8Array,
                                            verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationRequest>;
  revocationAwareVerifierSuppliedRootRequest(context: __compactRuntime.CircuitContext<PS>,
                                             issuerVerificationMethodRef_0: VerificationMethodRef,
                                             verifierDomainHash_0: Uint8Array,
                                             verifierChallengeHash_0: Uint8Array,
                                             registryState_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationRevokedSetStatusRequest>;
  revocationAwareAuthorityAttestedRequest(context: __compactRuntime.CircuitContext<PS>,
                                          issuerVerificationMethodRef_0: VerificationMethodRef,
                                          verifierDomainHash_0: Uint8Array,
                                          verifierChallengeHash_0: Uint8Array,
                                          registryState_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationAuthorityAttestedStatusRequest>;
  revocationAwareLiveStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                   issuerVerificationMethodRef_0: VerificationMethodRef,
                                   verifierDomainHash_0: Uint8Array,
                                   verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationLiveStatusRequest>;
  issueSecretBirthCredential(context: __compactRuntime.CircuitContext<PS>,
                             credential_0: SecretBirthCredential,
                             credentialProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  issueRevocationAwareCapabilityWithVerifierSuppliedRoot(context: __compactRuntime.CircuitContext<PS>,
                                                         credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                         request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest,
                                                         submission_0: SecretBirthCredentialVerificationSubmission,
                                                         statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs,
                                                         currentDay_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueRevocationAwareCapabilityWithLiveStatus(context: __compactRuntime.CircuitContext<PS>,
                                               credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                               request_0: SecretBirthCredentialVerificationLiveStatusRequest,
                                               submission_0: SecretBirthCredentialVerificationSubmission,
                                               statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs,
                                               currentDay_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueRevocationAwareCapabilityWithAuthorityAttestation(context: __compactRuntime.CircuitContext<PS>,
                                                         credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                         request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
                                                         submission_0: SecretBirthCredentialVerificationSubmission,
                                                         statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
                                                         currentDay_0: bigint,
                                                         currentTime_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claimRevocationAwareCapability(context: __compactRuntime.CircuitContext<PS>,
                                 capability_0: Uint8Array): __compactRuntime.CircuitResults<PS, RevocationAccessDecision>;
}

export type PureCircuits = {
  noSchemaFamilyResolverHint(): Uint8Array;
  assertValidSchemaRef(schema_0: SchemaRef): [];
  assertValidSchemaCapabilities(capabilities_0: SchemaCapabilities): [];
  assertValidSchemaFamilyResolutionHint(hint_0: SchemaFamilyResolutionHint): [];
  assertValidSchemaDescriptor(descriptor_0: SchemaDescriptor): [];
  assertMatchingSchemaCapabilities(expected_0: SchemaCapabilities,
                                   actual_0: SchemaCapabilities): [];
  verifySignature(pk_0: __compactRuntime.JubjubPoint,
                  signature_0: Signature,
                  challenge_0: bigint): boolean;
  issuanceContextTag(): Uint8Array;
  presentationContextTag(): Uint8Array;
  statusAttestationContextTag(): Uint8Array;
  issuanceProofPayloadRoot(bodyRoot_0: Uint8Array, proof_0: Proof): Uint8Array;
  presentationProofPayloadRoot(bodyRoot_0: Uint8Array, proof_0: Proof): Uint8Array;
  issuanceProofChallenge(bodyRoot_0: Uint8Array, proof_0: Proof): bigint;
  presentationProofChallenge(bodyRoot_0: Uint8Array, proof_0: Proof): bigint;
  assertValidIssuanceContextProof(bodyRoot_0: Uint8Array, proof_0: Proof): [];
  assertValidPresentationContextProof(bodyRoot_0: Uint8Array, proof_0: Proof): [];
  statusAttestationProofPayloadRoot(bodyRoot_0: Uint8Array, proof_0: Proof): Uint8Array;
  statusAttestationProofChallenge(bodyRoot_0: Uint8Array, proof_0: Proof): bigint;
  assertValidStatusAttestationContextProof(bodyRoot_0: Uint8Array,
                                           proof_0: Proof): [];
  assertValidExplicitHolderBinding(binding_0: ExplicitHolderBinding): [];
  assertMatchingExplicitHolderBindings(credentialBinding_0: ExplicitHolderBinding,
                                       presentationBinding_0: ExplicitHolderBinding): [];
  assertProofMatchesExplicitHolderBinding(binding_0: ExplicitHolderBinding,
                                          presentationProof_0: Proof): [];
  assertValidJubjubHolderBinding(binding_0: JubjubHolderBinding): [];
  assertMatchingJubjubHolderBindings(credentialBinding_0: JubjubHolderBinding,
                                     presentationBinding_0: JubjubHolderBinding): [];
  assertProofMatchesJubjubHolderBinding(binding_0: JubjubHolderBinding,
                                        presentationProof_0: Proof): [];
  assertValidOffchainMidnightHolderBinding(binding_0: OffchainMidnightHolderBinding): [];
  assertMatchingOffchainMidnightHolderBindings(credentialBinding_0: OffchainMidnightHolderBinding,
                                               presentationBinding_0: OffchainMidnightHolderBinding): [];
  assertProofMatchesOffchainMidnightHolderBinding(binding_0: OffchainMidnightHolderBinding,
                                                  presentationProof_0: Proof): [];
  noSecretHolderChallengeResponse(): Uint8Array;
  secretHolderBindingCommitment(holderSecret_0: Uint8Array,
                                opening_0: Uint8Array): Uint8Array;
  secretHolderBindingChallengeResponse(holderSecret_0: Uint8Array,
                                       verifierChallengeHash_0: Uint8Array): Uint8Array;
  verifierScopedPseudonym(holderSecret_0: Uint8Array,
                          verifierDomainHash_0: Uint8Array): Uint8Array;
  assertVerifierScopedPseudonym(pseudonym_0: Uint8Array,
                                holderSecret_0: Uint8Array,
                                verifierDomainHash_0: Uint8Array): [];
  blindedSecretHolderCommitment(holderSecretCommitment_0: Uint8Array,
                                issuerNonce_0: Uint8Array,
                                blindingFactor_0: Uint8Array): Uint8Array;
  assertValidSecretHolderCredentialBinding(binding_0: SecretHolderBinding): [];
  assertValidSecretHolderPresentationBinding(binding_0: SecretHolderBinding): [];
  assertMatchingSecretHolderBindings(credentialBinding_0: SecretHolderBinding,
                                     presentationBinding_0: SecretHolderBinding): [];
  assertValidBlindedSecretHolderCredentialBinding(binding_0: BlindedSecretHolderBinding): [];
  assertValidBlindedSecretHolderPresentationBinding(binding_0: BlindedSecretHolderBinding): [];
  assertMatchingBlindedSecretHolderBindings(credentialBinding_0: BlindedSecretHolderBinding,
                                            presentationBinding_0: BlindedSecretHolderBinding): [];
  assertSecretHolderBindingWitness(binding_0: SecretHolderBinding,
                                   verifierChallengeHash_0: Uint8Array,
                                   holderSecret_0: Uint8Array,
                                   opening_0: Uint8Array): [];
  assertBlindedSecretHolderBindingWitness(binding_0: BlindedSecretHolderBinding,
                                          verifierChallengeHash_0: Uint8Array,
                                          holderSecret_0: Uint8Array,
                                          opening_0: Uint8Array,
                                          blindingFactor_0: Uint8Array): [];
  protocolFeaturesAsSchemaCapabilities(features_0: CredentialProtocolFeatures): SchemaCapabilities;
  assertProtocolFeaturesMatchSchemaCapabilities(features_0: CredentialProtocolFeatures,
                                                capabilities_0: SchemaCapabilities): [];
  noProtocolResponseReference(): Uint8Array;
  assertValidVerificationMethodRef(verificationMethodRef_0: VerificationMethodRef): [];
  assertMatchingSchemaRefs(expected_0: SchemaRef, actual_0: SchemaRef): [];
  assertValidProtocolMessageEnvelope(envelope_0: ProtocolMessageEnvelope): [];
  assertProtocolResponseEnvelope(requestEnvelope_0: ProtocolMessageEnvelope,
                                 responseEnvelope_0: ProtocolMessageEnvelope): [];
  assertValidStatusRegistryRef(registryRef_0: StatusRegistryRef): [];
  assertValidNoStatusBinding(binding_0: NoStatusBinding): [];
  assertValidRegistryBoundStatusBinding(binding_0: RegistryBoundStatusBinding): [];
  registryBoundStatusBindingRoot(binding_0: RegistryBoundStatusBinding): Uint8Array;
  verificationTranscriptDomainV1(): Uint8Array;
  decisionNullifierDomainV1(): Uint8Array;
  credentialBindingDomainV1(): Uint8Array;
  holderBindingDomainV1(): Uint8Array;
  consentBindingDomainV1(): Uint8Array;
  presentationBindingDomainV1(): Uint8Array;
  issuerEvidenceDomainV1(): Uint8Array;
  trustEvidenceDomainV1(): Uint8Array;
  statusEvidenceDomainV1(): Uint8Array;
  timeEvidenceDomainV1(): Uint8Array;
  artifactEvidenceDomainV1(): Uint8Array;
  connectorEvidenceDomainV1(): Uint8Array;
  anchorEvidenceReceiptDomainV1(): Uint8Array;
  syntheticVerificationExtensionDomainV1(): Uint8Array;
  credentialBindingV1Digest(binding_0: CredentialBindingV1): Uint8Array;
  holderBindingV1Digest(binding_0: HolderBindingV1): Uint8Array;
  consentBindingV1Digest(binding_0: ConsentBindingV1): Uint8Array;
  presentationBindingV1Digest(binding_0: PresentationBindingV1): Uint8Array;
  evidenceBindingV1Digest(binding_0: EvidenceBindingV1): Uint8Array;
  anchorEvidenceReceiptV1Digest(receipt_0: AnchorEvidenceReceiptV1): Uint8Array;
  decisionNullifierMaterialV1Digest(material_0: DecisionNullifierMaterialV1): Uint8Array;
  syntheticVerificationExtensionV1Digest(extension_0: SyntheticVerificationExtensionV1): Uint8Array;
  verificationTranscriptV1Digest(transcript_0: VerificationTranscriptV1): Uint8Array;
  assertValidEvidenceBindingV1(binding_0: EvidenceBindingV1,
                               expectedDomain_0: Uint8Array): [];
  assertValidVerificationTranscriptV1(transcript_0: VerificationTranscriptV1): [];
  assertValidVerificationPublicInputsV1(inputs_0: VerificationPublicInputsV1): [];
  syntheticUnavailableAuthorityVerificationV1(inputs_0: VerificationPublicInputsV1,
                                              expectedTranscriptDigest_0: Uint8Array): SyntheticVerificationAttemptV1;
  assertSameSecretHolderBindingWitnesses(firstBinding_0: SecretHolderBinding,
                                         secondBinding_0: SecretHolderBinding,
                                         verifierChallengeHash_0: Uint8Array,
                                         holderSecret_0: Uint8Array,
                                         firstOpening_0: Uint8Array,
                                         secondOpening_0: Uint8Array): [];
  assertSameSecretHolderBindingWitnesses3(firstBinding_0: SecretHolderBinding,
                                          secondBinding_0: SecretHolderBinding,
                                          thirdBinding_0: SecretHolderBinding,
                                          verifierChallengeHash_0: Uint8Array,
                                          holderSecret_0: Uint8Array,
                                          firstOpening_0: Uint8Array,
                                          secondOpening_0: Uint8Array,
                                          thirdOpening_0: Uint8Array): [];
  assertSameBlindedSecretHolderBindingWitnesses(firstBinding_0: BlindedSecretHolderBinding,
                                                secondBinding_0: BlindedSecretHolderBinding,
                                                verifierChallengeHash_0: Uint8Array,
                                                holderSecret_0: Uint8Array,
                                                firstOpening_0: Uint8Array,
                                                firstBlindingFactor_0: Uint8Array,
                                                secondOpening_0: Uint8Array,
                                                secondBlindingFactor_0: Uint8Array): [];
  assertSameBlindedSecretHolderBindingWitnesses3(firstBinding_0: BlindedSecretHolderBinding,
                                                 secondBinding_0: BlindedSecretHolderBinding,
                                                 thirdBinding_0: BlindedSecretHolderBinding,
                                                 verifierChallengeHash_0: Uint8Array,
                                                 holderSecret_0: Uint8Array,
                                                 firstOpening_0: Uint8Array,
                                                 firstBlindingFactor_0: Uint8Array,
                                                 secondOpening_0: Uint8Array,
                                                 secondBlindingFactor_0: Uint8Array,
                                                 thirdOpening_0: Uint8Array,
                                                 thirdBlindingFactor_0: Uint8Array): [];
  assertValidNoStatusCapability(capability_0: NoStatusCapability): [];
  assertValidRevokedSetNonMembershipStatusCapability(capability_0: RevokedSetNonMembershipStatusCapability): [];
  assertValidAuthorityAttestedStatusCapability(capability_0: AuthorityAttestedStatusCapability): [];
  assertValidVerifierStatusPolicy(policy_0: VerifierStatusPolicy): [];
  assertValidRevocationRegistryState(state_0: RevocationRegistryState): [];
  assertValidRevokedSetStatusRequest(request_0: RevokedSetStatusRequest): [];
  revokedSetStatusHandleCommitment(statusHandle_0: Uint8Array,
                                   opening_0: Uint8Array): Uint8Array;
  revokedSetStatusHandle(credentialClaimRoot_0: Uint8Array,
                         registryId_0: Uint8Array,
                         issuerStatusSalt_0: Uint8Array): Uint8Array;
  assertValidRevokedSetNonMembershipWitnessInput(witnessInput_0: RevokedSetNonMembershipWitnessInput): [];
  assertValidLiveStatusWitnessInput(witnessInput_0: LiveStatusWitnessInput): [];
  assertValidRevokedSetNonMembershipStatusProofProtocol(protocol_0: RevokedSetNonMembershipStatusProofProtocol): [];
  assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(binding_0: RegistryBoundStatusBinding,
                                                                                    protocol_0: RevokedSetNonMembershipStatusProofProtocol): [];
  assertRevokedSetNonMembershipWitnessMatchesBinding(binding_0: RegistryBoundStatusBinding,
                                                     witnessInput_0: RevokedSetNonMembershipWitnessInput): [];
  assertLiveStatusWitnessMatchesBinding(binding_0: RegistryBoundStatusBinding,
                                        witnessInput_0: LiveStatusWitnessInput): [];
  authorityAttestedStatusStatementRoot(statement_0: AuthorityAttestedStatusStatement): Uint8Array;
  assertValidAuthorityAttestedStatusStatement(statement_0: AuthorityAttestedStatusStatement): [];
  assertValidAuthorityAttestedStatusProof(attestation_0: AuthorityAttestedStatusProof): [];
  assertValidAuthorityAttestedStatusProofProtocol(protocol_0: AuthorityAttestedStatusProofProtocol): [];
  assertRegistryBoundStatusBindingMatchesAuthorityAttestedStatusProofProtocol(binding_0: RegistryBoundStatusBinding,
                                                                              protocol_0: AuthorityAttestedStatusProofProtocol,
                                                                              currentTime_0: bigint): [];
  assertAuthorityAttestedStatusProofMatchesBinding(binding_0: RegistryBoundStatusBinding,
                                                   attestation_0: AuthorityAttestedStatusProof): [];
  assertAuthorityAttestedStatusProofMatchesRequest(request_0: RevokedSetStatusRequest,
                                                   attestation_0: AuthorityAttestedStatusProof,
                                                   currentTime_0: bigint): [];
  assertAuthorityAttestedStatusProofFreshEnough(policy_0: VerifierStatusPolicy,
                                                attestation_0: AuthorityAttestedStatusProof,
                                                currentTime_0: bigint): [];
  assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipBinding(policy_0: VerifierStatusPolicy,
                                                                  binding_0: RegistryBoundStatusBinding,
                                                                  witnessInput_0: RevokedSetNonMembershipWitnessInput): [];
  assertVerifierStatusPolicyAcceptsLiveStatusBinding(policy_0: VerifierStatusPolicy,
                                                     binding_0: RegistryBoundStatusBinding,
                                                     witnessInput_0: LiveStatusWitnessInput): [];
  assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipStatusProofProtocol(policy_0: VerifierStatusPolicy,
                                                                              binding_0: RegistryBoundStatusBinding,
                                                                              protocol_0: RevokedSetNonMembershipStatusProofProtocol): [];
  assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusBinding(policy_0: VerifierStatusPolicy,
                                                                  binding_0: RegistryBoundStatusBinding,
                                                                  request_0: RevokedSetStatusRequest,
                                                                  attestation_0: AuthorityAttestedStatusProof,
                                                                  currentTime_0: bigint): [];
  assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(policy_0: VerifierStatusPolicy,
                                                                        binding_0: RegistryBoundStatusBinding,
                                                                        protocol_0: AuthorityAttestedStatusProofProtocol,
                                                                        currentTime_0: bigint): [];
  birthCredentialClaimRoot(commitments_0: BirthCredentialClaimCommitments): Uint8Array;
  subjectIdCommitment(subjectId_0: Uint8Array, opening_0: Uint8Array): Uint8Array;
  birthDateCommitment(birthDateDays_0: bigint, opening_0: Uint8Array): Uint8Array;
  legalNameCommitment(legalNamePadded_0: Uint8Array, opening_0: Uint8Array): Uint8Array;
  birthCountryCodeCommitment(birthCountryCodePadded_0: Uint8Array,
                             opening_0: Uint8Array): Uint8Array;
  secretBirthCredentialBodyRoot(credential_0: SecretBirthCredential): Uint8Array;
  secretBirthCredentialRegistryBoundStatusBodyRoot(credential_0: SecretBirthStatusCredential): Uint8Array;
  secretBirthCredentialWithStatusBindingBodyRoot(credentialWithStatus_0: SecretBirthCredentialWithStatusBinding): Uint8Array;
  secretBirthCredentialPresentationBodyRoot(presentation_0: SecretBirthCredentialPresentation): Uint8Array;
  secretBirthCredentialPresentationRequestBodyRoot(request_0: SecretBirthCredentialPresentationRequest): Uint8Array;
  assertValidSecretBirthSchemaRef(schema_0: SchemaRef): [];
  assertValidSecretBirthCredentialPresentationRequest(request_0: SecretBirthCredentialPresentationRequest): [];
  secretBirthCredentialPresentationRequestFromProtocol(request_0: SecretBirthCredentialVerificationRequest): SecretBirthCredentialPresentationRequest;
  secretBirthCredentialWithoutStatusBinding(credential_0: SecretBirthStatusCredential): SecretBirthCredential;
  assertValidSecretBirthCredentialIssuanceOffer(offer_0: SecretBirthCredentialIssuanceOffer): [];
  assertValidSecretBirthCredentialIssuanceRequest(request_0: SecretBirthCredentialIssuanceRequest): [];
  assertSecretBirthCredentialIssuanceRequestMatchesOffer(offer_0: SecretBirthCredentialIssuanceOffer,
                                                         request_0: SecretBirthCredentialIssuanceRequest): [];
  assertValidSecretBirthCredentialIssuanceResult(result_0: SecretBirthCredentialIssuanceResult): [];
  assertSecretBirthCredentialIssuanceResultMatchesRequest(request_0: SecretBirthCredentialIssuanceRequest,
                                                          result_0: SecretBirthCredentialIssuanceResult): [];
  assertValidSecretBirthCredentialVerificationRequestMessage(request_0: SecretBirthCredentialVerificationRequest): [];
  assertValidSecretBirthCredentialVerificationSubmissionMessage(submission_0: SecretBirthCredentialVerificationSubmission): [];
  assertSecretBirthCredentialVerificationSubmissionMatchesRequest(request_0: SecretBirthCredentialVerificationRequest,
                                                                  submission_0: SecretBirthCredentialVerificationSubmission,
                                                                  holderSecret_0: Uint8Array,
                                                                  holderSecretOpening_0: Uint8Array,
                                                                  holderBindingBlindingFactor_0: Uint8Array): [];
  assertValidSecretBirthCredentialVerificationResultMessage(result_0: SecretBirthCredentialVerificationResult): [];
  assertSecretBirthCredentialVerificationResultMatchesSubmission(submission_0: SecretBirthCredentialVerificationSubmission,
                                                                 result_0: SecretBirthCredentialVerificationResult): [];
  assertValidSecretBirthCredential(credential_0: SecretBirthCredential,
                                   proof_0: Proof): [];
  assertValidSecretBirthCredentialPresentation(credential_0: SecretBirthCredential,
                                               credentialProof_0: Proof,
                                               presentation_0: SecretBirthCredentialPresentation): [];
  assertSecretBirthPresentationSatisfiesRequest(credential_0: SecretBirthCredential,
                                                credentialProof_0: Proof,
                                                request_0: SecretBirthCredentialPresentationRequest,
                                                presentation_0: SecretBirthCredentialPresentation,
                                                holderSecret_0: Uint8Array,
                                                holderSecretOpening_0: Uint8Array,
                                                holderBindingBlindingFactor_0: Uint8Array): [];
  assertValidSecretBirthCredentialAgePredicate(credential_0: SecretBirthCredential,
                                               presentation_0: SecretBirthCredentialPresentation,
                                               currentDay_0: bigint,
                                               birthDateDays_0: bigint,
                                               birthDateOpening_0: Uint8Array): [];
  assertSameHolderSecretBirthPresentations(firstCredential_0: SecretBirthCredential,
                                           firstCredentialProof_0: Proof,
                                           firstRequest_0: SecretBirthCredentialVerificationRequest,
                                           firstPresentation_0: SecretBirthCredentialPresentation,
                                           secondCredential_0: SecretBirthCredential,
                                           secondCredentialProof_0: Proof,
                                           secondRequest_0: SecretBirthCredentialVerificationRequest,
                                           secondPresentation_0: SecretBirthCredentialPresentation,
                                           holderSecret_0: Uint8Array,
                                           firstHolderSecretOpening_0: Uint8Array,
                                           firstHolderBindingBlindingFactor_0: Uint8Array,
                                           secondHolderSecretOpening_0: Uint8Array,
                                           secondHolderBindingBlindingFactor_0: Uint8Array): [];
  assertSameHolderSecretBirthPresentations3(firstCredential_0: SecretBirthCredential,
                                            firstCredentialProof_0: Proof,
                                            firstRequest_0: SecretBirthCredentialVerificationRequest,
                                            firstPresentation_0: SecretBirthCredentialPresentation,
                                            secondCredential_0: SecretBirthCredential,
                                            secondCredentialProof_0: Proof,
                                            secondRequest_0: SecretBirthCredentialVerificationRequest,
                                            secondPresentation_0: SecretBirthCredentialPresentation,
                                            thirdCredential_0: SecretBirthCredential,
                                            thirdCredentialProof_0: Proof,
                                            thirdRequest_0: SecretBirthCredentialVerificationRequest,
                                            thirdPresentation_0: SecretBirthCredentialPresentation,
                                            holderSecret_0: Uint8Array,
                                            firstHolderSecretOpening_0: Uint8Array,
                                            firstHolderBindingBlindingFactor_0: Uint8Array,
                                            secondHolderSecretOpening_0: Uint8Array,
                                            secondHolderBindingBlindingFactor_0: Uint8Array,
                                            thirdHolderSecretOpening_0: Uint8Array,
                                            thirdHolderBindingBlindingFactor_0: Uint8Array): [];
  assertValidSecretBirthCredentialWithStatusBinding(credentialWithStatus_0: SecretBirthCredentialWithStatusBinding): [];
  assertValidSecretBirthCredentialVerificationAuthorityAttestedStatusRequest(request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest): [];
  assertValidSecretBirthCredentialVerificationRevokedSetStatusRequest(request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest): [];
  assertValidSecretBirthCredentialVerificationLiveStatusRequest(request_0: SecretBirthCredentialVerificationLiveStatusRequest): [];
  assertValidSecretBirthCredentialVerificationRevokedSetStatusInputs(statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs): [];
  assertValidSecretBirthCredentialVerificationLiveStatusInputs(statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs): [];
  assertValidSecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs(statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs): [];
  assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                                                  request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest,
                                                                                  submission_0: SecretBirthCredentialVerificationSubmission,
                                                                                  statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs,
                                                                                  holderSecret_0: Uint8Array,
                                                                                  holderSecretOpening_0: Uint8Array,
                                                                                  holderBindingBlindingFactor_0: Uint8Array): [];
  assertSecretBirthCredentialVerificationSubmissionMatchesLiveStatusRequest(credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                                            request_0: SecretBirthCredentialVerificationLiveStatusRequest,
                                                                            submission_0: SecretBirthCredentialVerificationSubmission,
                                                                            statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs,
                                                                            holderSecret_0: Uint8Array,
                                                                            holderSecretOpening_0: Uint8Array,
                                                                            holderBindingBlindingFactor_0: Uint8Array): [];
  assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                                                                 request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
                                                                                                 submission_0: SecretBirthCredentialVerificationSubmission,
                                                                                                 statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
                                                                                                 holderSecret_0: Uint8Array,
                                                                                                 holderSecretOpening_0: Uint8Array,
                                                                                                 holderBindingBlindingFactor_0: Uint8Array,
                                                                                                 currentTime_0: bigint): [];
}

export type Circuits<PS> = {
  noSchemaFamilyResolverHint(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidSchemaRef(context: __compactRuntime.CircuitContext<PS>,
                       schema_0: SchemaRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidSchemaCapabilities(context: __compactRuntime.CircuitContext<PS>,
                                capabilities_0: SchemaCapabilities): __compactRuntime.CircuitResults<PS, []>;
  assertValidSchemaFamilyResolutionHint(context: __compactRuntime.CircuitContext<PS>,
                                        hint_0: SchemaFamilyResolutionHint): __compactRuntime.CircuitResults<PS, []>;
  assertValidSchemaDescriptor(context: __compactRuntime.CircuitContext<PS>,
                              descriptor_0: SchemaDescriptor): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingSchemaCapabilities(context: __compactRuntime.CircuitContext<PS>,
                                   expected_0: SchemaCapabilities,
                                   actual_0: SchemaCapabilities): __compactRuntime.CircuitResults<PS, []>;
  verifySignature(context: __compactRuntime.CircuitContext<PS>,
                  pk_0: __compactRuntime.JubjubPoint,
                  signature_0: Signature,
                  challenge_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  issuanceContextTag(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  presentationContextTag(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  statusAttestationContextTag(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issuanceProofPayloadRoot(context: __compactRuntime.CircuitContext<PS>,
                           bodyRoot_0: Uint8Array,
                           proof_0: Proof): __compactRuntime.CircuitResults<PS, Uint8Array>;
  presentationProofPayloadRoot(context: __compactRuntime.CircuitContext<PS>,
                               bodyRoot_0: Uint8Array,
                               proof_0: Proof): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issuanceProofChallenge(context: __compactRuntime.CircuitContext<PS>,
                         bodyRoot_0: Uint8Array,
                         proof_0: Proof): __compactRuntime.CircuitResults<PS, bigint>;
  presentationProofChallenge(context: __compactRuntime.CircuitContext<PS>,
                             bodyRoot_0: Uint8Array,
                             proof_0: Proof): __compactRuntime.CircuitResults<PS, bigint>;
  assertValidIssuanceContextProof(context: __compactRuntime.CircuitContext<PS>,
                                  bodyRoot_0: Uint8Array,
                                  proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidPresentationContextProof(context: __compactRuntime.CircuitContext<PS>,
                                      bodyRoot_0: Uint8Array,
                                      proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  statusAttestationProofPayloadRoot(context: __compactRuntime.CircuitContext<PS>,
                                    bodyRoot_0: Uint8Array,
                                    proof_0: Proof): __compactRuntime.CircuitResults<PS, Uint8Array>;
  statusAttestationProofChallenge(context: __compactRuntime.CircuitContext<PS>,
                                  bodyRoot_0: Uint8Array,
                                  proof_0: Proof): __compactRuntime.CircuitResults<PS, bigint>;
  assertValidStatusAttestationContextProof(context: __compactRuntime.CircuitContext<PS>,
                                           bodyRoot_0: Uint8Array,
                                           proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidExplicitHolderBinding(context: __compactRuntime.CircuitContext<PS>,
                                   binding_0: ExplicitHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingExplicitHolderBindings(context: __compactRuntime.CircuitContext<PS>,
                                       credentialBinding_0: ExplicitHolderBinding,
                                       presentationBinding_0: ExplicitHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertProofMatchesExplicitHolderBinding(context: __compactRuntime.CircuitContext<PS>,
                                          binding_0: ExplicitHolderBinding,
                                          presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidJubjubHolderBinding(context: __compactRuntime.CircuitContext<PS>,
                                 binding_0: JubjubHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingJubjubHolderBindings(context: __compactRuntime.CircuitContext<PS>,
                                     credentialBinding_0: JubjubHolderBinding,
                                     presentationBinding_0: JubjubHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertProofMatchesJubjubHolderBinding(context: __compactRuntime.CircuitContext<PS>,
                                        binding_0: JubjubHolderBinding,
                                        presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidOffchainMidnightHolderBinding(context: __compactRuntime.CircuitContext<PS>,
                                           binding_0: OffchainMidnightHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingOffchainMidnightHolderBindings(context: __compactRuntime.CircuitContext<PS>,
                                               credentialBinding_0: OffchainMidnightHolderBinding,
                                               presentationBinding_0: OffchainMidnightHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertProofMatchesOffchainMidnightHolderBinding(context: __compactRuntime.CircuitContext<PS>,
                                                  binding_0: OffchainMidnightHolderBinding,
                                                  presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  noSecretHolderChallengeResponse(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretHolderBindingCommitment(context: __compactRuntime.CircuitContext<PS>,
                                holderSecret_0: Uint8Array,
                                opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretHolderBindingChallengeResponse(context: __compactRuntime.CircuitContext<PS>,
                                       holderSecret_0: Uint8Array,
                                       verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verifierScopedPseudonym(context: __compactRuntime.CircuitContext<PS>,
                          holderSecret_0: Uint8Array,
                          verifierDomainHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertVerifierScopedPseudonym(context: __compactRuntime.CircuitContext<PS>,
                                pseudonym_0: Uint8Array,
                                holderSecret_0: Uint8Array,
                                verifierDomainHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  blindedSecretHolderCommitment(context: __compactRuntime.CircuitContext<PS>,
                                holderSecretCommitment_0: Uint8Array,
                                issuerNonce_0: Uint8Array,
                                blindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidSecretHolderCredentialBinding(context: __compactRuntime.CircuitContext<PS>,
                                           binding_0: SecretHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretHolderPresentationBinding(context: __compactRuntime.CircuitContext<PS>,
                                             binding_0: SecretHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingSecretHolderBindings(context: __compactRuntime.CircuitContext<PS>,
                                     credentialBinding_0: SecretHolderBinding,
                                     presentationBinding_0: SecretHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertValidBlindedSecretHolderCredentialBinding(context: __compactRuntime.CircuitContext<PS>,
                                                  binding_0: BlindedSecretHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertValidBlindedSecretHolderPresentationBinding(context: __compactRuntime.CircuitContext<PS>,
                                                    binding_0: BlindedSecretHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingBlindedSecretHolderBindings(context: __compactRuntime.CircuitContext<PS>,
                                            credentialBinding_0: BlindedSecretHolderBinding,
                                            presentationBinding_0: BlindedSecretHolderBinding): __compactRuntime.CircuitResults<PS, []>;
  assertSecretHolderBindingWitness(context: __compactRuntime.CircuitContext<PS>,
                                   binding_0: SecretHolderBinding,
                                   verifierChallengeHash_0: Uint8Array,
                                   holderSecret_0: Uint8Array,
                                   opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertBlindedSecretHolderBindingWitness(context: __compactRuntime.CircuitContext<PS>,
                                          binding_0: BlindedSecretHolderBinding,
                                          verifierChallengeHash_0: Uint8Array,
                                          holderSecret_0: Uint8Array,
                                          opening_0: Uint8Array,
                                          blindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  protocolFeaturesAsSchemaCapabilities(context: __compactRuntime.CircuitContext<PS>,
                                       features_0: CredentialProtocolFeatures): __compactRuntime.CircuitResults<PS, SchemaCapabilities>;
  assertProtocolFeaturesMatchSchemaCapabilities(context: __compactRuntime.CircuitContext<PS>,
                                                features_0: CredentialProtocolFeatures,
                                                capabilities_0: SchemaCapabilities): __compactRuntime.CircuitResults<PS, []>;
  noProtocolResponseReference(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidVerificationMethodRef(context: __compactRuntime.CircuitContext<PS>,
                                   verificationMethodRef_0: VerificationMethodRef): __compactRuntime.CircuitResults<PS, []>;
  assertMatchingSchemaRefs(context: __compactRuntime.CircuitContext<PS>,
                           expected_0: SchemaRef,
                           actual_0: SchemaRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidProtocolMessageEnvelope(context: __compactRuntime.CircuitContext<PS>,
                                     envelope_0: ProtocolMessageEnvelope): __compactRuntime.CircuitResults<PS, []>;
  assertProtocolResponseEnvelope(context: __compactRuntime.CircuitContext<PS>,
                                 requestEnvelope_0: ProtocolMessageEnvelope,
                                 responseEnvelope_0: ProtocolMessageEnvelope): __compactRuntime.CircuitResults<PS, []>;
  assertValidStatusRegistryRef(context: __compactRuntime.CircuitContext<PS>,
                               registryRef_0: StatusRegistryRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidNoStatusBinding(context: __compactRuntime.CircuitContext<PS>,
                             binding_0: NoStatusBinding): __compactRuntime.CircuitResults<PS, []>;
  assertValidRegistryBoundStatusBinding(context: __compactRuntime.CircuitContext<PS>,
                                        binding_0: RegistryBoundStatusBinding): __compactRuntime.CircuitResults<PS, []>;
  registryBoundStatusBindingRoot(context: __compactRuntime.CircuitContext<PS>,
                                 binding_0: RegistryBoundStatusBinding): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verificationTranscriptDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  decisionNullifierDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  credentialBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  consentBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  presentationBindingDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issuerEvidenceDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  trustEvidenceDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  statusEvidenceDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  timeEvidenceDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  artifactEvidenceDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  connectorEvidenceDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  anchorEvidenceReceiptDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  syntheticVerificationExtensionDomainV1(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  credentialBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                            binding_0: CredentialBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                        binding_0: HolderBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  consentBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                         binding_0: ConsentBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  presentationBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                              binding_0: PresentationBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  evidenceBindingV1Digest(context: __compactRuntime.CircuitContext<PS>,
                          binding_0: EvidenceBindingV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  anchorEvidenceReceiptV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                receipt_0: AnchorEvidenceReceiptV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  decisionNullifierMaterialV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                    material_0: DecisionNullifierMaterialV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  syntheticVerificationExtensionV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                         extension_0: SyntheticVerificationExtensionV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verificationTranscriptV1Digest(context: __compactRuntime.CircuitContext<PS>,
                                 transcript_0: VerificationTranscriptV1): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidEvidenceBindingV1(context: __compactRuntime.CircuitContext<PS>,
                               binding_0: EvidenceBindingV1,
                               expectedDomain_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertValidVerificationTranscriptV1(context: __compactRuntime.CircuitContext<PS>,
                                      transcript_0: VerificationTranscriptV1): __compactRuntime.CircuitResults<PS, []>;
  assertValidVerificationPublicInputsV1(context: __compactRuntime.CircuitContext<PS>,
                                        inputs_0: VerificationPublicInputsV1): __compactRuntime.CircuitResults<PS, []>;
  syntheticUnavailableAuthorityVerificationV1(context: __compactRuntime.CircuitContext<PS>,
                                              inputs_0: VerificationPublicInputsV1,
                                              expectedTranscriptDigest_0: Uint8Array): __compactRuntime.CircuitResults<PS, SyntheticVerificationAttemptV1>;
  assertSameSecretHolderBindingWitnesses(context: __compactRuntime.CircuitContext<PS>,
                                         firstBinding_0: SecretHolderBinding,
                                         secondBinding_0: SecretHolderBinding,
                                         verifierChallengeHash_0: Uint8Array,
                                         holderSecret_0: Uint8Array,
                                         firstOpening_0: Uint8Array,
                                         secondOpening_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSameSecretHolderBindingWitnesses3(context: __compactRuntime.CircuitContext<PS>,
                                          firstBinding_0: SecretHolderBinding,
                                          secondBinding_0: SecretHolderBinding,
                                          thirdBinding_0: SecretHolderBinding,
                                          verifierChallengeHash_0: Uint8Array,
                                          holderSecret_0: Uint8Array,
                                          firstOpening_0: Uint8Array,
                                          secondOpening_0: Uint8Array,
                                          thirdOpening_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSameBlindedSecretHolderBindingWitnesses(context: __compactRuntime.CircuitContext<PS>,
                                                firstBinding_0: BlindedSecretHolderBinding,
                                                secondBinding_0: BlindedSecretHolderBinding,
                                                verifierChallengeHash_0: Uint8Array,
                                                holderSecret_0: Uint8Array,
                                                firstOpening_0: Uint8Array,
                                                firstBlindingFactor_0: Uint8Array,
                                                secondOpening_0: Uint8Array,
                                                secondBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSameBlindedSecretHolderBindingWitnesses3(context: __compactRuntime.CircuitContext<PS>,
                                                 firstBinding_0: BlindedSecretHolderBinding,
                                                 secondBinding_0: BlindedSecretHolderBinding,
                                                 thirdBinding_0: BlindedSecretHolderBinding,
                                                 verifierChallengeHash_0: Uint8Array,
                                                 holderSecret_0: Uint8Array,
                                                 firstOpening_0: Uint8Array,
                                                 firstBlindingFactor_0: Uint8Array,
                                                 secondOpening_0: Uint8Array,
                                                 secondBlindingFactor_0: Uint8Array,
                                                 thirdOpening_0: Uint8Array,
                                                 thirdBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertValidNoStatusCapability(context: __compactRuntime.CircuitContext<PS>,
                                capability_0: NoStatusCapability): __compactRuntime.CircuitResults<PS, []>;
  assertValidRevokedSetNonMembershipStatusCapability(context: __compactRuntime.CircuitContext<PS>,
                                                     capability_0: RevokedSetNonMembershipStatusCapability): __compactRuntime.CircuitResults<PS, []>;
  assertValidAuthorityAttestedStatusCapability(context: __compactRuntime.CircuitContext<PS>,
                                               capability_0: AuthorityAttestedStatusCapability): __compactRuntime.CircuitResults<PS, []>;
  assertValidVerifierStatusPolicy(context: __compactRuntime.CircuitContext<PS>,
                                  policy_0: VerifierStatusPolicy): __compactRuntime.CircuitResults<PS, []>;
  assertValidRevocationRegistryState(context: __compactRuntime.CircuitContext<PS>,
                                     state_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, []>;
  assertValidRevokedSetStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                     request_0: RevokedSetStatusRequest): __compactRuntime.CircuitResults<PS, []>;
  revokedSetStatusHandleCommitment(context: __compactRuntime.CircuitContext<PS>,
                                   statusHandle_0: Uint8Array,
                                   opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  revokedSetStatusHandle(context: __compactRuntime.CircuitContext<PS>,
                         credentialClaimRoot_0: Uint8Array,
                         registryId_0: Uint8Array,
                         issuerStatusSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidRevokedSetNonMembershipWitnessInput(context: __compactRuntime.CircuitContext<PS>,
                                                 witnessInput_0: RevokedSetNonMembershipWitnessInput): __compactRuntime.CircuitResults<PS, []>;
  assertValidLiveStatusWitnessInput(context: __compactRuntime.CircuitContext<PS>,
                                    witnessInput_0: LiveStatusWitnessInput): __compactRuntime.CircuitResults<PS, []>;
  assertValidRevokedSetNonMembershipStatusProofProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                        protocol_0: RevokedSetNonMembershipStatusProofProtocol): __compactRuntime.CircuitResults<PS, []>;
  assertRegistryBoundStatusBindingMatchesRevokedSetNonMembershipStatusProofProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                                                    binding_0: RegistryBoundStatusBinding,
                                                                                    protocol_0: RevokedSetNonMembershipStatusProofProtocol): __compactRuntime.CircuitResults<PS, []>;
  assertRevokedSetNonMembershipWitnessMatchesBinding(context: __compactRuntime.CircuitContext<PS>,
                                                     binding_0: RegistryBoundStatusBinding,
                                                     witnessInput_0: RevokedSetNonMembershipWitnessInput): __compactRuntime.CircuitResults<PS, []>;
  assertLiveStatusWitnessMatchesBinding(context: __compactRuntime.CircuitContext<PS>,
                                        binding_0: RegistryBoundStatusBinding,
                                        witnessInput_0: LiveStatusWitnessInput): __compactRuntime.CircuitResults<PS, []>;
  authorityAttestedStatusStatementRoot(context: __compactRuntime.CircuitContext<PS>,
                                       statement_0: AuthorityAttestedStatusStatement): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidAuthorityAttestedStatusStatement(context: __compactRuntime.CircuitContext<PS>,
                                              statement_0: AuthorityAttestedStatusStatement): __compactRuntime.CircuitResults<PS, []>;
  assertValidAuthorityAttestedStatusProof(context: __compactRuntime.CircuitContext<PS>,
                                          attestation_0: AuthorityAttestedStatusProof): __compactRuntime.CircuitResults<PS, []>;
  assertValidAuthorityAttestedStatusProofProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                  protocol_0: AuthorityAttestedStatusProofProtocol): __compactRuntime.CircuitResults<PS, []>;
  assertRegistryBoundStatusBindingMatchesAuthorityAttestedStatusProofProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                                              binding_0: RegistryBoundStatusBinding,
                                                                              protocol_0: AuthorityAttestedStatusProofProtocol,
                                                                              currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertAuthorityAttestedStatusProofMatchesBinding(context: __compactRuntime.CircuitContext<PS>,
                                                   binding_0: RegistryBoundStatusBinding,
                                                   attestation_0: AuthorityAttestedStatusProof): __compactRuntime.CircuitResults<PS, []>;
  assertAuthorityAttestedStatusProofMatchesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                   request_0: RevokedSetStatusRequest,
                                                   attestation_0: AuthorityAttestedStatusProof,
                                                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertAuthorityAttestedStatusProofFreshEnough(context: __compactRuntime.CircuitContext<PS>,
                                                policy_0: VerifierStatusPolicy,
                                                attestation_0: AuthorityAttestedStatusProof,
                                                currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipBinding(context: __compactRuntime.CircuitContext<PS>,
                                                                  policy_0: VerifierStatusPolicy,
                                                                  binding_0: RegistryBoundStatusBinding,
                                                                  witnessInput_0: RevokedSetNonMembershipWitnessInput): __compactRuntime.CircuitResults<PS, []>;
  assertVerifierStatusPolicyAcceptsLiveStatusBinding(context: __compactRuntime.CircuitContext<PS>,
                                                     policy_0: VerifierStatusPolicy,
                                                     binding_0: RegistryBoundStatusBinding,
                                                     witnessInput_0: LiveStatusWitnessInput): __compactRuntime.CircuitResults<PS, []>;
  assertVerifierStatusPolicyAcceptsRevokedSetNonMembershipStatusProofProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                                              policy_0: VerifierStatusPolicy,
                                                                              binding_0: RegistryBoundStatusBinding,
                                                                              protocol_0: RevokedSetNonMembershipStatusProofProtocol): __compactRuntime.CircuitResults<PS, []>;
  assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusBinding(context: __compactRuntime.CircuitContext<PS>,
                                                                  policy_0: VerifierStatusPolicy,
                                                                  binding_0: RegistryBoundStatusBinding,
                                                                  request_0: RevokedSetStatusRequest,
                                                                  attestation_0: AuthorityAttestedStatusProof,
                                                                  currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertVerifierStatusPolicyAcceptsAuthorityAttestedStatusProofProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                                        policy_0: VerifierStatusPolicy,
                                                                        binding_0: RegistryBoundStatusBinding,
                                                                        protocol_0: AuthorityAttestedStatusProofProtocol,
                                                                        currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  birthCredentialClaimRoot(context: __compactRuntime.CircuitContext<PS>,
                           commitments_0: BirthCredentialClaimCommitments): __compactRuntime.CircuitResults<PS, Uint8Array>;
  subjectIdCommitment(context: __compactRuntime.CircuitContext<PS>,
                      subjectId_0: Uint8Array,
                      opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  birthDateCommitment(context: __compactRuntime.CircuitContext<PS>,
                      birthDateDays_0: bigint,
                      opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  legalNameCommitment(context: __compactRuntime.CircuitContext<PS>,
                      legalNamePadded_0: Uint8Array,
                      opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  birthCountryCodeCommitment(context: __compactRuntime.CircuitContext<PS>,
                             birthCountryCodePadded_0: Uint8Array,
                             opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretBirthCredentialBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                credential_0: SecretBirthCredential): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretBirthCredentialRegistryBoundStatusBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                                   credential_0: SecretBirthStatusCredential): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretBirthCredentialWithStatusBindingBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                                 credentialWithStatus_0: SecretBirthCredentialWithStatusBinding): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretBirthCredentialPresentationBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                            presentation_0: SecretBirthCredentialPresentation): __compactRuntime.CircuitResults<PS, Uint8Array>;
  secretBirthCredentialPresentationRequestBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                                   request_0: SecretBirthCredentialPresentationRequest): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidSecretBirthSchemaRef(context: __compactRuntime.CircuitContext<PS>,
                                  schema_0: SchemaRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialPresentationRequest(context: __compactRuntime.CircuitContext<PS>,
                                                      request_0: SecretBirthCredentialPresentationRequest): __compactRuntime.CircuitResults<PS, []>;
  secretBirthCredentialPresentationRequestFromProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                       request_0: SecretBirthCredentialVerificationRequest): __compactRuntime.CircuitResults<PS, SecretBirthCredentialPresentationRequest>;
  secretBirthCredentialWithoutStatusBinding(context: __compactRuntime.CircuitContext<PS>,
                                            credential_0: SecretBirthStatusCredential): __compactRuntime.CircuitResults<PS, SecretBirthCredential>;
  assertValidSecretBirthCredentialIssuanceOffer(context: __compactRuntime.CircuitContext<PS>,
                                                offer_0: SecretBirthCredentialIssuanceOffer): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialIssuanceRequest(context: __compactRuntime.CircuitContext<PS>,
                                                  request_0: SecretBirthCredentialIssuanceRequest): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialIssuanceRequestMatchesOffer(context: __compactRuntime.CircuitContext<PS>,
                                                         offer_0: SecretBirthCredentialIssuanceOffer,
                                                         request_0: SecretBirthCredentialIssuanceRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialIssuanceResult(context: __compactRuntime.CircuitContext<PS>,
                                                 result_0: SecretBirthCredentialIssuanceResult): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialIssuanceResultMatchesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                          request_0: SecretBirthCredentialIssuanceRequest,
                                                          result_0: SecretBirthCredentialIssuanceResult): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationRequestMessage(context: __compactRuntime.CircuitContext<PS>,
                                                             request_0: SecretBirthCredentialVerificationRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationSubmissionMessage(context: __compactRuntime.CircuitContext<PS>,
                                                                submission_0: SecretBirthCredentialVerificationSubmission): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialVerificationSubmissionMatchesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                  request_0: SecretBirthCredentialVerificationRequest,
                                                                  submission_0: SecretBirthCredentialVerificationSubmission,
                                                                  holderSecret_0: Uint8Array,
                                                                  holderSecretOpening_0: Uint8Array,
                                                                  holderBindingBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationResultMessage(context: __compactRuntime.CircuitContext<PS>,
                                                            result_0: SecretBirthCredentialVerificationResult): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialVerificationResultMatchesSubmission(context: __compactRuntime.CircuitContext<PS>,
                                                                 submission_0: SecretBirthCredentialVerificationSubmission,
                                                                 result_0: SecretBirthCredentialVerificationResult): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredential(context: __compactRuntime.CircuitContext<PS>,
                                   credential_0: SecretBirthCredential,
                                   proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialPresentation(context: __compactRuntime.CircuitContext<PS>,
                                               credential_0: SecretBirthCredential,
                                               credentialProof_0: Proof,
                                               presentation_0: SecretBirthCredentialPresentation): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthPresentationSatisfiesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                credential_0: SecretBirthCredential,
                                                credentialProof_0: Proof,
                                                request_0: SecretBirthCredentialPresentationRequest,
                                                presentation_0: SecretBirthCredentialPresentation,
                                                holderSecret_0: Uint8Array,
                                                holderSecretOpening_0: Uint8Array,
                                                holderBindingBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialAgePredicate(context: __compactRuntime.CircuitContext<PS>,
                                               credential_0: SecretBirthCredential,
                                               presentation_0: SecretBirthCredentialPresentation,
                                               currentDay_0: bigint,
                                               birthDateDays_0: bigint,
                                               birthDateOpening_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSameHolderSecretBirthPresentations(context: __compactRuntime.CircuitContext<PS>,
                                           firstCredential_0: SecretBirthCredential,
                                           firstCredentialProof_0: Proof,
                                           firstRequest_0: SecretBirthCredentialVerificationRequest,
                                           firstPresentation_0: SecretBirthCredentialPresentation,
                                           secondCredential_0: SecretBirthCredential,
                                           secondCredentialProof_0: Proof,
                                           secondRequest_0: SecretBirthCredentialVerificationRequest,
                                           secondPresentation_0: SecretBirthCredentialPresentation,
                                           holderSecret_0: Uint8Array,
                                           firstHolderSecretOpening_0: Uint8Array,
                                           firstHolderBindingBlindingFactor_0: Uint8Array,
                                           secondHolderSecretOpening_0: Uint8Array,
                                           secondHolderBindingBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSameHolderSecretBirthPresentations3(context: __compactRuntime.CircuitContext<PS>,
                                            firstCredential_0: SecretBirthCredential,
                                            firstCredentialProof_0: Proof,
                                            firstRequest_0: SecretBirthCredentialVerificationRequest,
                                            firstPresentation_0: SecretBirthCredentialPresentation,
                                            secondCredential_0: SecretBirthCredential,
                                            secondCredentialProof_0: Proof,
                                            secondRequest_0: SecretBirthCredentialVerificationRequest,
                                            secondPresentation_0: SecretBirthCredentialPresentation,
                                            thirdCredential_0: SecretBirthCredential,
                                            thirdCredentialProof_0: Proof,
                                            thirdRequest_0: SecretBirthCredentialVerificationRequest,
                                            thirdPresentation_0: SecretBirthCredentialPresentation,
                                            holderSecret_0: Uint8Array,
                                            firstHolderSecretOpening_0: Uint8Array,
                                            firstHolderBindingBlindingFactor_0: Uint8Array,
                                            secondHolderSecretOpening_0: Uint8Array,
                                            secondHolderBindingBlindingFactor_0: Uint8Array,
                                            thirdHolderSecretOpening_0: Uint8Array,
                                            thirdHolderBindingBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialWithStatusBinding(context: __compactRuntime.CircuitContext<PS>,
                                                    credentialWithStatus_0: SecretBirthCredentialWithStatusBinding): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationAuthorityAttestedStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                             request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationRevokedSetStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                      request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationLiveStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                request_0: SecretBirthCredentialVerificationLiveStatusRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationRevokedSetStatusInputs(context: __compactRuntime.CircuitContext<PS>,
                                                                     statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationLiveStatusInputs(context: __compactRuntime.CircuitContext<PS>,
                                                               statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs): __compactRuntime.CircuitResults<PS, []>;
  assertValidSecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs(context: __compactRuntime.CircuitContext<PS>,
                                                                                    statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialVerificationSubmissionMatchesRevokedSetStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                                  credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                                                  request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest,
                                                                                  submission_0: SecretBirthCredentialVerificationSubmission,
                                                                                  statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs,
                                                                                  holderSecret_0: Uint8Array,
                                                                                  holderSecretOpening_0: Uint8Array,
                                                                                  holderBindingBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialVerificationSubmissionMatchesLiveStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                            credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                                            request_0: SecretBirthCredentialVerificationLiveStatusRequest,
                                                                            submission_0: SecretBirthCredentialVerificationSubmission,
                                                                            statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs,
                                                                            holderSecret_0: Uint8Array,
                                                                            holderSecretOpening_0: Uint8Array,
                                                                            holderBindingBlindingFactor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  assertSecretBirthCredentialVerificationSubmissionMatchesAuthorityAttestedStatusProtocolRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                                                 credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                                                                 request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
                                                                                                 submission_0: SecretBirthCredentialVerificationSubmission,
                                                                                                 statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
                                                                                                 holderSecret_0: Uint8Array,
                                                                                                 holderSecretOpening_0: Uint8Array,
                                                                                                 holderBindingBlindingFactor_0: Uint8Array,
                                                                                                 currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  initializeLiveStatusRegistry(context: __compactRuntime.CircuitContext<PS>,
                               registryId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeLiveStatusHandle(context: __compactRuntime.CircuitContext<PS>,
                         statusHandle_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revocationAwareAgeGateVerificationRequest(context: __compactRuntime.CircuitContext<PS>,
                                            issuerVerificationMethodRef_0: VerificationMethodRef,
                                            verifierDomainHash_0: Uint8Array,
                                            verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationRequest>;
  revocationAwareVerifierSuppliedRootRequest(context: __compactRuntime.CircuitContext<PS>,
                                             issuerVerificationMethodRef_0: VerificationMethodRef,
                                             verifierDomainHash_0: Uint8Array,
                                             verifierChallengeHash_0: Uint8Array,
                                             registryState_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationRevokedSetStatusRequest>;
  revocationAwareAuthorityAttestedRequest(context: __compactRuntime.CircuitContext<PS>,
                                          issuerVerificationMethodRef_0: VerificationMethodRef,
                                          verifierDomainHash_0: Uint8Array,
                                          verifierChallengeHash_0: Uint8Array,
                                          registryState_0: RevocationRegistryState): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationAuthorityAttestedStatusRequest>;
  revocationAwareLiveStatusRequest(context: __compactRuntime.CircuitContext<PS>,
                                   issuerVerificationMethodRef_0: VerificationMethodRef,
                                   verifierDomainHash_0: Uint8Array,
                                   verifierChallengeHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, SecretBirthCredentialVerificationLiveStatusRequest>;
  issueSecretBirthCredential(context: __compactRuntime.CircuitContext<PS>,
                             credential_0: SecretBirthCredential,
                             credentialProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  issueRevocationAwareCapabilityWithVerifierSuppliedRoot(context: __compactRuntime.CircuitContext<PS>,
                                                         credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                         request_0: SecretBirthCredentialVerificationRevokedSetStatusRequest,
                                                         submission_0: SecretBirthCredentialVerificationSubmission,
                                                         statusInputs_0: SecretBirthCredentialVerificationRevokedSetStatusInputs,
                                                         currentDay_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueRevocationAwareCapabilityWithLiveStatus(context: __compactRuntime.CircuitContext<PS>,
                                               credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                               request_0: SecretBirthCredentialVerificationLiveStatusRequest,
                                               submission_0: SecretBirthCredentialVerificationSubmission,
                                               statusInputs_0: SecretBirthCredentialVerificationLiveStatusInputs,
                                               currentDay_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issueRevocationAwareCapabilityWithAuthorityAttestation(context: __compactRuntime.CircuitContext<PS>,
                                                         credentialWithStatus_0: SecretBirthCredentialWithStatusBinding,
                                                         request_0: SecretBirthCredentialVerificationAuthorityAttestedStatusRequest,
                                                         submission_0: SecretBirthCredentialVerificationSubmission,
                                                         statusInputs_0: SecretBirthCredentialVerificationAuthorityAttestedStatusProtocolInputs,
                                                         currentDay_0: bigint,
                                                         currentTime_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claimRevocationAwareCapability(context: __compactRuntime.CircuitContext<PS>,
                                 capability_0: Uint8Array): __compactRuntime.CircuitResults<PS, RevocationAccessDecision>;
}

export type Ledger = {
  readonly contractVersion: bigint;
  readonly issuedCredentialCount: bigint;
  readonly verifiedPresentationCount: bigint;
  readonly minimumAccessAgeYears: bigint;
  readonly requireVerifierScopedPseudonym: boolean;
  issuedCredentialClaimRoots: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly lastVerifiedCredentialRoot: Uint8Array;
  readonly lastVerifiedCurrentDay: bigint;
  readonly lastVerifiedCurrentTime: bigint;
  readonly lastVerifiedThresholdYears: bigint;
  readonly lastVerifiedRequestChallenge: Uint8Array;
  readonly lastVerifiedStatusRegistryId: Uint8Array;
  readonly lastVerifiedRevokedRoot: Uint8Array;
  readonly lastVerificationMode: RevocationVerificationMode;
  readonly issuedAccessCapabilityCount: bigint;
  readonly consumedAccessCapabilityCount: bigint;
  activeAccessCapabilities: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  consumedAccessCapabilities: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly lastIssuedAccessCapability: Uint8Array;
  readonly lastBusinessDecision: RevocationAccessDecision;
  readonly liveStatusRegistryInitialized: boolean;
  readonly liveStatusRegistryId: Uint8Array;
  liveRevokedStatusHandles: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
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
