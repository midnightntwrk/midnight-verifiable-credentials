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

export type UniversityDiplomaClaims = { diplomaId: Uint8Array;
                                        studentId: Uint8Array;
                                        graduateName: Uint8Array;
                                        universityName: Uint8Array;
                                        facultyName: Uint8Array;
                                        awardName: Uint8Array;
                                        honorsCode: Uint8Array;
                                        graduationYear: bigint;
                                        graduationMonth: bigint;
                                        finalGrade: bigint;
                                        creditsEarned: bigint
                                      };

export type UniversityDiplomaProductionPublicClaims = { universityName: Uint8Array;
                                                        awardName: Uint8Array;
                                                        graduationYear: bigint
                                                      };

export type UniversityDiplomaClaimCommitments = { diplomaIdCommitment: Uint8Array;
                                                  studentIdCommitment: Uint8Array;
                                                  graduateNameCommitment: Uint8Array;
                                                  facultyNameCommitment: Uint8Array;
                                                  honorsCodeCommitment: Uint8Array;
                                                  graduationMonthCommitment: Uint8Array;
                                                  finalGradeCommitment: Uint8Array;
                                                  creditsEarnedCommitment: Uint8Array
                                                };

export type UniversityDiplomaDisclosures = { revealDiplomaId: boolean;
                                             diplomaId: Uint8Array;
                                             revealStudentId: boolean;
                                             studentId: Uint8Array;
                                             revealGraduateName: boolean;
                                             graduateName: Uint8Array;
                                             revealUniversityName: boolean;
                                             universityName: Uint8Array;
                                             revealFacultyName: boolean;
                                             facultyName: Uint8Array;
                                             revealAwardName: boolean;
                                             awardName: Uint8Array;
                                             revealHonorsCode: boolean;
                                             honorsCode: Uint8Array;
                                             revealGraduationYear: boolean;
                                             graduationYear: bigint;
                                             revealGraduationMonth: boolean;
                                             graduationMonth: bigint;
                                             revealFinalGrade: boolean;
                                             finalGrade: bigint;
                                             revealCreditsEarned: boolean;
                                             creditsEarned: bigint
                                           };

export type UniversityDiplomaPresentationRequest = { version: bigint;
                                                     schema: SchemaRef;
                                                     issuerVerificationMethodRef: VerificationMethodRef;
                                                     requireDiplomaIdDisclosure: boolean;
                                                     requireStudentIdDisclosure: boolean;
                                                     requireGraduateNameDisclosure: boolean;
                                                     requireUniversityNameDisclosure: boolean;
                                                     requireFacultyNameDisclosure: boolean;
                                                     requireAwardNameDisclosure: boolean;
                                                     requireHonorsCodeDisclosure: boolean;
                                                     requireGraduationYearDisclosure: boolean;
                                                     requireGraduationMonthDisclosure: boolean;
                                                     requireFinalGradeDisclosure: boolean;
                                                     requireCreditsEarnedDisclosure: boolean;
                                                     enforceMinimumFinalGrade: boolean;
                                                     minimumFinalGrade: bigint;
                                                     verifierChallengeHash: Uint8Array
                                                   };

export type UniversityDiplomaProductionDisclosures = { revealDiplomaId: boolean;
                                                       diplomaId: Uint8Array;
                                                       diplomaIdOpening: Uint8Array;
                                                       revealStudentId: boolean;
                                                       studentId: Uint8Array;
                                                       studentIdOpening: Uint8Array;
                                                       revealGraduateName: boolean;
                                                       graduateName: Uint8Array;
                                                       graduateNameOpening: Uint8Array;
                                                       revealUniversityName: boolean;
                                                       universityName: Uint8Array;
                                                       revealFacultyName: boolean;
                                                       facultyName: Uint8Array;
                                                       facultyNameOpening: Uint8Array;
                                                       revealAwardName: boolean;
                                                       awardName: Uint8Array;
                                                       revealHonorsCode: boolean;
                                                       honorsCode: Uint8Array;
                                                       honorsCodeOpening: Uint8Array;
                                                       revealGraduationYear: boolean;
                                                       graduationYear: bigint;
                                                       revealGraduationMonth: boolean;
                                                       graduationMonth: bigint;
                                                       graduationMonthOpening: Uint8Array;
                                                       revealFinalGrade: boolean;
                                                       finalGrade: bigint;
                                                       finalGradeOpening: Uint8Array;
                                                       revealCreditsEarned: boolean;
                                                       creditsEarned: bigint;
                                                       creditsEarnedOpening: Uint8Array
                                                     };

export type UniversityDiplomaProductionPresentationRequest = { version: bigint;
                                                               schema: SchemaRef;
                                                               issuerVerificationMethodRef: VerificationMethodRef;
                                                               requireDiplomaIdDisclosure: boolean;
                                                               requireStudentIdDisclosure: boolean;
                                                               requireGraduateNameDisclosure: boolean;
                                                               requireUniversityNameDisclosure: boolean;
                                                               requireFacultyNameDisclosure: boolean;
                                                               requireAwardNameDisclosure: boolean;
                                                               requireHonorsCodeDisclosure: boolean;
                                                               requireGraduationYearDisclosure: boolean;
                                                               requireGraduationMonthDisclosure: boolean;
                                                               requireFinalGradeDisclosure: boolean;
                                                               requireCreditsEarnedDisclosure: boolean;
                                                               enforceMinimumFinalGrade: boolean;
                                                               minimumFinalGrade: bigint;
                                                               verifierChallengeHash: Uint8Array
                                                             };

export type UniversityDiplomaProductionFinalGradePredicateWitness = { finalGrade: bigint;
                                                                      finalGradeOpening: Uint8Array
                                                                    };

export type UniversityDiplomaProductionCreditsEarnedPredicateWitness = { creditsEarned: bigint;
                                                                         creditsEarnedOpening: Uint8Array
                                                                       };

export type UniversityDiplomaCredential = { version: bigint,
                                            schema: SchemaRef,
                                            issuerVerificationMethodRef: VerificationMethodRef,
                                            holderBinding: ExplicitHolderBinding,
                                            statusBinding: NoStatusBinding,
                                            issuedAt: bigint,
                                            hasExpiration: boolean,
                                            expiresAt: bigint,
                                            claims: UniversityDiplomaClaims,
                                            claimCommitments: NoClaimCommitments,
                                            claimRoot: Uint8Array
                                          };

export type UniversityDiplomaProductionCredential = { version: bigint,
                                                      schema: SchemaRef,
                                                      issuerVerificationMethodRef: VerificationMethodRef,
                                                      holderBinding: ExplicitHolderBinding,
                                                      statusBinding: NoStatusBinding,
                                                      issuedAt: bigint,
                                                      hasExpiration: boolean,
                                                      expiresAt: bigint,
                                                      claims: UniversityDiplomaProductionPublicClaims,
                                                      claimCommitments: UniversityDiplomaClaimCommitments,
                                                      claimRoot: Uint8Array
                                                    };

export type UniversityDiplomaPresentation = { version: bigint,
                                              schema: SchemaRef,
                                              credentialClaimRoot: Uint8Array,
                                              issuerVerificationMethodRef: VerificationMethodRef,
                                              holderBinding: ExplicitHolderBinding,
                                              disclosed: UniversityDiplomaDisclosures
                                            };

export type UniversityDiplomaProductionPresentation = { version: bigint,
                                                        schema: SchemaRef,
                                                        credentialClaimRoot: Uint8Array,
                                                        issuerVerificationMethodRef: VerificationMethodRef,
                                                        holderBinding: ExplicitHolderBinding,
                                                        disclosed: UniversityDiplomaProductionDisclosures
                                                      };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  verifyUniversityDiplomaForJobApplication(context: __compactRuntime.CircuitContext<PS>,
                                           credential_0: UniversityDiplomaProductionCredential,
                                           credentialProof_0: Proof,
                                           request_0: UniversityDiplomaProductionPresentationRequest,
                                           presentation_0: UniversityDiplomaProductionPresentation,
                                           presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  verifyUniversityDiplomaForMallDiscount(context: __compactRuntime.CircuitContext<PS>,
                                         credential_0: UniversityDiplomaProductionCredential,
                                         credentialProof_0: Proof,
                                         request_0: UniversityDiplomaProductionPresentationRequest,
                                         presentation_0: UniversityDiplomaProductionPresentation,
                                         presentationProof_0: Proof,
                                         finalGradePredicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  verifyUniversityDiplomaForJobApplication(context: __compactRuntime.CircuitContext<PS>,
                                           credential_0: UniversityDiplomaProductionCredential,
                                           credentialProof_0: Proof,
                                           request_0: UniversityDiplomaProductionPresentationRequest,
                                           presentation_0: UniversityDiplomaProductionPresentation,
                                           presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  verifyUniversityDiplomaForMallDiscount(context: __compactRuntime.CircuitContext<PS>,
                                         credential_0: UniversityDiplomaProductionCredential,
                                         credentialProof_0: Proof,
                                         request_0: UniversityDiplomaProductionPresentationRequest,
                                         presentation_0: UniversityDiplomaProductionPresentation,
                                         presentationProof_0: Proof,
                                         finalGradePredicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness): __compactRuntime.CircuitResults<PS, []>;
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
  universityDiplomaClaimPayloadRoot(claims_0: UniversityDiplomaClaims): Uint8Array;
  universityDiplomaClaimRoot(claims_0: UniversityDiplomaClaims): Uint8Array;
  universityDiplomaProductionPublicClaimsRoot(publicClaims_0: UniversityDiplomaProductionPublicClaims): Uint8Array;
  universityDiplomaClaimCommitmentsRoot(claimCommitments_0: UniversityDiplomaClaimCommitments): Uint8Array;
  universityDiplomaProductionClaimRoot(publicClaims_0: UniversityDiplomaProductionPublicClaims,
                                       claimCommitments_0: UniversityDiplomaClaimCommitments): Uint8Array;
  universityDiplomaIdCommitment(diplomaId_0: Uint8Array, opening_0: Uint8Array): Uint8Array;
  universityDiplomaStudentIdCommitment(studentId_0: Uint8Array,
                                       opening_0: Uint8Array): Uint8Array;
  universityDiplomaGraduateNameCommitment(graduateName_0: Uint8Array,
                                          opening_0: Uint8Array): Uint8Array;
  universityDiplomaFacultyNameCommitment(facultyName_0: Uint8Array,
                                         opening_0: Uint8Array): Uint8Array;
  universityDiplomaHonorsCodeCommitment(honorsCode_0: Uint8Array,
                                        opening_0: Uint8Array): Uint8Array;
  universityDiplomaGraduationMonthCommitment(graduationMonth_0: bigint,
                                             opening_0: Uint8Array): Uint8Array;
  universityDiplomaFinalGradeCommitment(finalGrade_0: bigint,
                                        opening_0: Uint8Array): Uint8Array;
  universityDiplomaCreditsEarnedCommitment(creditsEarned_0: bigint,
                                           opening_0: Uint8Array): Uint8Array;
  universityDiplomaCredentialBodyRoot(credential_0: UniversityDiplomaCredential): Uint8Array;
  universityDiplomaProductionCredentialBodyRoot(credential_0: UniversityDiplomaProductionCredential): Uint8Array;
  universityDiplomaProductionPresentationBodyRoot(presentation_0: UniversityDiplomaProductionPresentation): Uint8Array;
  universityDiplomaPresentationBodyRoot(presentation_0: UniversityDiplomaPresentation): Uint8Array;
  universityDiplomaPresentationRequestBodyRoot(request_0: UniversityDiplomaPresentationRequest): Uint8Array;
  universityDiplomaProductionPresentationRequestBodyRoot(request_0: UniversityDiplomaProductionPresentationRequest): Uint8Array;
  assertValidUniversityDiplomaSchemaRef(schema_0: SchemaRef): [];
  assertValidUniversityDiplomaProductionSchemaRef(schema_0: SchemaRef): [];
  assertValidUniversityDiplomaPresentationRequest(request_0: UniversityDiplomaPresentationRequest): [];
  assertValidUniversityDiplomaProductionPresentationRequest(request_0: UniversityDiplomaProductionPresentationRequest): [];
  assertValidUniversityDiplomaClaims(claims_0: UniversityDiplomaClaims): [];
  assertValidUniversityDiplomaProductionPublicClaims(publicClaims_0: UniversityDiplomaProductionPublicClaims): [];
  assertValidUniversityDiplomaCredential(credential_0: UniversityDiplomaCredential,
                                         proof_0: Proof): [];
  assertValidUniversityDiplomaProductionCredential(credential_0: UniversityDiplomaProductionCredential,
                                                   proof_0: Proof): [];
  assertUniversityDiplomaProductionDisclosuresMatchCredential(credential_0: UniversityDiplomaProductionCredential,
                                                              disclosed_0: UniversityDiplomaProductionDisclosures): [];
  assertUniversityDiplomaProductionFinalGradeAtLeast(credential_0: UniversityDiplomaProductionCredential,
                                                     predicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness,
                                                     minimumFinalGrade_0: bigint): [];
  assertUniversityDiplomaProductionCreditsEarnedAtLeast(credential_0: UniversityDiplomaProductionCredential,
                                                        predicateWitness_0: UniversityDiplomaProductionCreditsEarnedPredicateWitness,
                                                        minimumCreditsEarned_0: bigint): [];
  assertValidUniversityDiplomaProductionPresentation(credential_0: UniversityDiplomaProductionCredential,
                                                     credentialProof_0: Proof,
                                                     presentation_0: UniversityDiplomaProductionPresentation,
                                                     presentationProof_0: Proof): [];
  assertValidUniversityDiplomaPresentation(credential_0: UniversityDiplomaCredential,
                                           credentialProof_0: Proof,
                                           presentation_0: UniversityDiplomaPresentation,
                                           presentationProof_0: Proof): [];
  assertUniversityDiplomaPresentationSatisfiesRequest(credential_0: UniversityDiplomaCredential,
                                                      credentialProof_0: Proof,
                                                      request_0: UniversityDiplomaPresentationRequest,
                                                      presentation_0: UniversityDiplomaPresentation,
                                                      presentationProof_0: Proof): [];
  assertUniversityDiplomaProductionPresentationSatisfiesRequestCore(credential_0: UniversityDiplomaProductionCredential,
                                                                    credentialProof_0: Proof,
                                                                    request_0: UniversityDiplomaProductionPresentationRequest,
                                                                    presentation_0: UniversityDiplomaProductionPresentation,
                                                                    presentationProof_0: Proof): [];
  assertUniversityDiplomaProductionPresentationSatisfiesRequest(credential_0: UniversityDiplomaProductionCredential,
                                                                credentialProof_0: Proof,
                                                                request_0: UniversityDiplomaProductionPresentationRequest,
                                                                presentation_0: UniversityDiplomaProductionPresentation,
                                                                presentationProof_0: Proof): [];
  assertValidUniversityDiplomaProductionPredicatePresentationRequest(request_0: UniversityDiplomaProductionPresentationRequest): [];
  assertUniversityDiplomaProductionPresentationSatisfiesRequestWithFinalGradePredicate(credential_0: UniversityDiplomaProductionCredential,
                                                                                       credentialProof_0: Proof,
                                                                                       request_0: UniversityDiplomaProductionPresentationRequest,
                                                                                       presentation_0: UniversityDiplomaProductionPresentation,
                                                                                       presentationProof_0: Proof,
                                                                                       finalGradePredicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness): [];
  universityDiplomaSchemaRef(): SchemaRef;
  universityJobApplicationRequest(issuerVerificationMethodRef_0: VerificationMethodRef,
                                  verifierChallengeHash_0: Uint8Array,
                                  requireDiplomaIdDisclosure_0: boolean,
                                  requireStudentIdDisclosure_0: boolean,
                                  requireFacultyNameDisclosure_0: boolean,
                                  requireHonorsCodeDisclosure_0: boolean,
                                  requireGraduationMonthDisclosure_0: boolean,
                                  requireFinalGradeDisclosure_0: boolean,
                                  requireCreditsEarnedDisclosure_0: boolean): UniversityDiplomaProductionPresentationRequest;
  universityMallDiscountRequest(issuerVerificationMethodRef_0: VerificationMethodRef,
                                verifierChallengeHash_0: Uint8Array,
                                minimumFinalGrade_0: bigint): UniversityDiplomaProductionPresentationRequest;
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
  universityDiplomaClaimPayloadRoot(context: __compactRuntime.CircuitContext<PS>,
                                    claims_0: UniversityDiplomaClaims): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaClaimRoot(context: __compactRuntime.CircuitContext<PS>,
                             claims_0: UniversityDiplomaClaims): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaProductionPublicClaimsRoot(context: __compactRuntime.CircuitContext<PS>,
                                              publicClaims_0: UniversityDiplomaProductionPublicClaims): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaClaimCommitmentsRoot(context: __compactRuntime.CircuitContext<PS>,
                                        claimCommitments_0: UniversityDiplomaClaimCommitments): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaProductionClaimRoot(context: __compactRuntime.CircuitContext<PS>,
                                       publicClaims_0: UniversityDiplomaProductionPublicClaims,
                                       claimCommitments_0: UniversityDiplomaClaimCommitments): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaIdCommitment(context: __compactRuntime.CircuitContext<PS>,
                                diplomaId_0: Uint8Array,
                                opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaStudentIdCommitment(context: __compactRuntime.CircuitContext<PS>,
                                       studentId_0: Uint8Array,
                                       opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaGraduateNameCommitment(context: __compactRuntime.CircuitContext<PS>,
                                          graduateName_0: Uint8Array,
                                          opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaFacultyNameCommitment(context: __compactRuntime.CircuitContext<PS>,
                                         facultyName_0: Uint8Array,
                                         opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaHonorsCodeCommitment(context: __compactRuntime.CircuitContext<PS>,
                                        honorsCode_0: Uint8Array,
                                        opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaGraduationMonthCommitment(context: __compactRuntime.CircuitContext<PS>,
                                             graduationMonth_0: bigint,
                                             opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaFinalGradeCommitment(context: __compactRuntime.CircuitContext<PS>,
                                        finalGrade_0: bigint,
                                        opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaCreditsEarnedCommitment(context: __compactRuntime.CircuitContext<PS>,
                                           creditsEarned_0: bigint,
                                           opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaCredentialBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                      credential_0: UniversityDiplomaCredential): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaProductionCredentialBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                                credential_0: UniversityDiplomaProductionCredential): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaProductionPresentationBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                                  presentation_0: UniversityDiplomaProductionPresentation): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaPresentationBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                        presentation_0: UniversityDiplomaPresentation): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaPresentationRequestBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                               request_0: UniversityDiplomaPresentationRequest): __compactRuntime.CircuitResults<PS, Uint8Array>;
  universityDiplomaProductionPresentationRequestBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                                         request_0: UniversityDiplomaProductionPresentationRequest): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidUniversityDiplomaSchemaRef(context: __compactRuntime.CircuitContext<PS>,
                                        schema_0: SchemaRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaProductionSchemaRef(context: __compactRuntime.CircuitContext<PS>,
                                                  schema_0: SchemaRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaPresentationRequest(context: __compactRuntime.CircuitContext<PS>,
                                                  request_0: UniversityDiplomaPresentationRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaProductionPresentationRequest(context: __compactRuntime.CircuitContext<PS>,
                                                            request_0: UniversityDiplomaProductionPresentationRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaClaims(context: __compactRuntime.CircuitContext<PS>,
                                     claims_0: UniversityDiplomaClaims): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaProductionPublicClaims(context: __compactRuntime.CircuitContext<PS>,
                                                     publicClaims_0: UniversityDiplomaProductionPublicClaims): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaCredential(context: __compactRuntime.CircuitContext<PS>,
                                         credential_0: UniversityDiplomaCredential,
                                         proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaProductionCredential(context: __compactRuntime.CircuitContext<PS>,
                                                   credential_0: UniversityDiplomaProductionCredential,
                                                   proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaProductionDisclosuresMatchCredential(context: __compactRuntime.CircuitContext<PS>,
                                                              credential_0: UniversityDiplomaProductionCredential,
                                                              disclosed_0: UniversityDiplomaProductionDisclosures): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaProductionFinalGradeAtLeast(context: __compactRuntime.CircuitContext<PS>,
                                                     credential_0: UniversityDiplomaProductionCredential,
                                                     predicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness,
                                                     minimumFinalGrade_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaProductionCreditsEarnedAtLeast(context: __compactRuntime.CircuitContext<PS>,
                                                        credential_0: UniversityDiplomaProductionCredential,
                                                        predicateWitness_0: UniversityDiplomaProductionCreditsEarnedPredicateWitness,
                                                        minimumCreditsEarned_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaProductionPresentation(context: __compactRuntime.CircuitContext<PS>,
                                                     credential_0: UniversityDiplomaProductionCredential,
                                                     credentialProof_0: Proof,
                                                     presentation_0: UniversityDiplomaProductionPresentation,
                                                     presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaPresentation(context: __compactRuntime.CircuitContext<PS>,
                                           credential_0: UniversityDiplomaCredential,
                                           credentialProof_0: Proof,
                                           presentation_0: UniversityDiplomaPresentation,
                                           presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaPresentationSatisfiesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                      credential_0: UniversityDiplomaCredential,
                                                      credentialProof_0: Proof,
                                                      request_0: UniversityDiplomaPresentationRequest,
                                                      presentation_0: UniversityDiplomaPresentation,
                                                      presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaProductionPresentationSatisfiesRequestCore(context: __compactRuntime.CircuitContext<PS>,
                                                                    credential_0: UniversityDiplomaProductionCredential,
                                                                    credentialProof_0: Proof,
                                                                    request_0: UniversityDiplomaProductionPresentationRequest,
                                                                    presentation_0: UniversityDiplomaProductionPresentation,
                                                                    presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaProductionPresentationSatisfiesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                credential_0: UniversityDiplomaProductionCredential,
                                                                credentialProof_0: Proof,
                                                                request_0: UniversityDiplomaProductionPresentationRequest,
                                                                presentation_0: UniversityDiplomaProductionPresentation,
                                                                presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidUniversityDiplomaProductionPredicatePresentationRequest(context: __compactRuntime.CircuitContext<PS>,
                                                                     request_0: UniversityDiplomaProductionPresentationRequest): __compactRuntime.CircuitResults<PS, []>;
  assertUniversityDiplomaProductionPresentationSatisfiesRequestWithFinalGradePredicate(context: __compactRuntime.CircuitContext<PS>,
                                                                                       credential_0: UniversityDiplomaProductionCredential,
                                                                                       credentialProof_0: Proof,
                                                                                       request_0: UniversityDiplomaProductionPresentationRequest,
                                                                                       presentation_0: UniversityDiplomaProductionPresentation,
                                                                                       presentationProof_0: Proof,
                                                                                       finalGradePredicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness): __compactRuntime.CircuitResults<PS, []>;
  universityDiplomaSchemaRef(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, SchemaRef>;
  universityJobApplicationRequest(context: __compactRuntime.CircuitContext<PS>,
                                  issuerVerificationMethodRef_0: VerificationMethodRef,
                                  verifierChallengeHash_0: Uint8Array,
                                  requireDiplomaIdDisclosure_0: boolean,
                                  requireStudentIdDisclosure_0: boolean,
                                  requireFacultyNameDisclosure_0: boolean,
                                  requireHonorsCodeDisclosure_0: boolean,
                                  requireGraduationMonthDisclosure_0: boolean,
                                  requireFinalGradeDisclosure_0: boolean,
                                  requireCreditsEarnedDisclosure_0: boolean): __compactRuntime.CircuitResults<PS, UniversityDiplomaProductionPresentationRequest>;
  universityMallDiscountRequest(context: __compactRuntime.CircuitContext<PS>,
                                issuerVerificationMethodRef_0: VerificationMethodRef,
                                verifierChallengeHash_0: Uint8Array,
                                minimumFinalGrade_0: bigint): __compactRuntime.CircuitResults<PS, UniversityDiplomaProductionPresentationRequest>;
  verifyUniversityDiplomaForJobApplication(context: __compactRuntime.CircuitContext<PS>,
                                           credential_0: UniversityDiplomaProductionCredential,
                                           credentialProof_0: Proof,
                                           request_0: UniversityDiplomaProductionPresentationRequest,
                                           presentation_0: UniversityDiplomaProductionPresentation,
                                           presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  verifyUniversityDiplomaForMallDiscount(context: __compactRuntime.CircuitContext<PS>,
                                         credential_0: UniversityDiplomaProductionCredential,
                                         credentialProof_0: Proof,
                                         request_0: UniversityDiplomaProductionPresentationRequest,
                                         presentation_0: UniversityDiplomaProductionPresentation,
                                         presentationProof_0: Proof,
                                         finalGradePredicateWitness_0: UniversityDiplomaProductionFinalGradePredicateWitness): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly contractVersion: bigint;
  readonly successfulJobApplicationVerificationCount: bigint;
  readonly successfulDiscountVerificationCount: bigint;
  readonly lastVerifiedCredentialRoot: Uint8Array;
  readonly lastVerifiedRequestChallenge: Uint8Array;
  readonly lastVerifiedGraduateName: Uint8Array;
  readonly lastVerifiedUniversityName: Uint8Array;
  readonly lastVerifiedAwardName: Uint8Array;
  readonly lastVerifiedGraduationYear: bigint;
  readonly lastVerifiedFinalGrade: bigint;
  readonly lastVerifiedDiscountThreshold: bigint;
  readonly lastVerifiedVerifierKind: bigint;
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
