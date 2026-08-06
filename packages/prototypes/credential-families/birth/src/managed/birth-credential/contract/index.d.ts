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

export type BirthCredentialClaimCommitments = { subjectIdCommitment: Uint8Array;
                                                legalNameCommitment: Uint8Array;
                                                birthDateCommitment: Uint8Array;
                                                birthCountryCodeCommitment: Uint8Array
                                              };

export type BirthCredentialDisclosures = { revealSubjectIdCommitment: boolean;
                                           subjectIdCommitment: Uint8Array;
                                           revealBirthCountryCode: boolean;
                                           birthCountryCodePadded: Uint8Array;
                                           birthCountryCodeOpening: Uint8Array;
                                           proveAgeOverThreshold: boolean;
                                           ageThresholdYears: bigint
                                         };

export type BirthCredentialPresentationRequest = { version: bigint;
                                                   schema: SchemaRef;
                                                   issuerVerificationMethodRef: VerificationMethodRef;
                                                   requireSubjectIdCommitmentDisclosure: boolean;
                                                   requireBirthCountryDisclosure: boolean;
                                                   requireAgeOverThreshold: boolean;
                                                   requestedAgeThresholdYears: bigint;
                                                   verifierChallengeHash: Uint8Array
                                                 };

export type BirthCredential = { version: bigint,
                                schema: SchemaRef,
                                issuerVerificationMethodRef: VerificationMethodRef,
                                holderBinding: ExplicitHolderBinding,
                                statusBinding: NoStatusBinding,
                                issuedAt: bigint,
                                hasExpiration: boolean,
                                expiresAt: bigint,
                                claims: NoPublicClaims,
                                claimCommitments: BirthCredentialClaimCommitments,
                                claimRoot: Uint8Array
                              };

export type BirthCredentialPresentation = { version: bigint,
                                            schema: SchemaRef,
                                            credentialClaimRoot: Uint8Array,
                                            issuerVerificationMethodRef: VerificationMethodRef,
                                            holderBinding: ExplicitHolderBinding,
                                            disclosed: BirthCredentialDisclosures
                                          };

export type BirthCredentialIssuanceOfferBody = { supportsExpiration: boolean;
                                                 defaultExpirationDays: bigint;
                                                 requiresHolderPublicKey: boolean
                                               };

export type BirthCredentialIssuanceRequestBody = { holderBinding: ExplicitHolderBinding;
                                                   holderPublicKey: __compactRuntime.JubjubPoint;
                                                   holderChallengeHash: Uint8Array;
                                                   requestExpiration: boolean;
                                                   requestedExpirationDays: bigint
                                                 };

export type BirthCredentialIssuanceResultBody = { credential: BirthCredential;
                                                  credentialProof: Proof;
                                                  holderPublicKey: __compactRuntime.JubjubPoint;
                                                  issuanceChallengeHash: Uint8Array
                                                };

export type BirthCredentialVerificationRequestBody = { requireSubjectIdCommitmentDisclosure: boolean;
                                                       requireBirthCountryDisclosure: boolean;
                                                       requireAgeOverThreshold: boolean;
                                                       requestedAgeThresholdYears: bigint
                                                     };

export type BirthCredentialVerificationSubmissionBody = { credential: BirthCredential;
                                                          credentialProof: Proof;
                                                          presentation: BirthCredentialPresentation;
                                                          presentationProof: Proof
                                                        };

export type BirthCredentialVerificationResultBody = { credentialRoot: Uint8Array;
                                                      verifiedThresholdYears: bigint
                                                    };

export type BirthCredentialIssuanceOffer = { envelope: ProtocolMessageEnvelope,
                                             schema: SchemaRef,
                                             issuerVerificationMethodRef: VerificationMethodRef,
                                             holderBindingProfile: HolderBindingProfile,
                                             features: CredentialProtocolFeatures,
                                             body: BirthCredentialIssuanceOfferBody
                                           };

export type BirthCredentialIssuanceRequest = { envelope: ProtocolMessageEnvelope,
                                               schema: SchemaRef,
                                               issuerVerificationMethodRef: VerificationMethodRef,
                                               holderBindingProfile: HolderBindingProfile,
                                               body: BirthCredentialIssuanceRequestBody
                                             };

export type BirthCredentialIssuanceResult = { envelope: ProtocolMessageEnvelope,
                                              schema: SchemaRef,
                                              issuerVerificationMethodRef: VerificationMethodRef,
                                              holderBindingProfile: HolderBindingProfile,
                                              body: BirthCredentialIssuanceResultBody
                                            };

export type BirthCredentialVerificationRequest = { envelope: ProtocolMessageEnvelope,
                                                   schema: SchemaRef,
                                                   issuerVerificationMethodRef: VerificationMethodRef,
                                                   holderBindingProfile: HolderBindingProfile,
                                                   features: CredentialProtocolFeatures,
                                                   verifierChallengeHash: Uint8Array,
                                                   body: BirthCredentialVerificationRequestBody
                                                 };

export type BirthCredentialVerificationSubmission = { envelope: ProtocolMessageEnvelope,
                                                      schema: SchemaRef,
                                                      issuerVerificationMethodRef: VerificationMethodRef,
                                                      holderBindingProfile: HolderBindingProfile,
                                                      challengeHash: Uint8Array,
                                                      body: BirthCredentialVerificationSubmissionBody
                                                    };

export type BirthCredentialVerificationResult = { envelope: ProtocolMessageEnvelope,
                                                  approved: boolean,
                                                  body: BirthCredentialVerificationResultBody
                                                };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
}

export type ProvableCircuits<PS> = {
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
  birthCredentialClaimRoot(commitments_0: BirthCredentialClaimCommitments): Uint8Array;
  subjectIdCommitment(subjectId_0: Uint8Array, opening_0: Uint8Array): Uint8Array;
  birthDateCommitment(birthDateDays_0: bigint, opening_0: Uint8Array): Uint8Array;
  legalNameCommitment(legalNamePadded_0: Uint8Array, opening_0: Uint8Array): Uint8Array;
  birthCountryCodeCommitment(birthCountryCodePadded_0: Uint8Array,
                             opening_0: Uint8Array): Uint8Array;
  birthCredentialBodyRoot(credential_0: BirthCredential): Uint8Array;
  birthCredentialPresentationBodyRoot(presentation_0: BirthCredentialPresentation): Uint8Array;
  birthCredentialPresentationRequestBodyRoot(request_0: BirthCredentialPresentationRequest): Uint8Array;
  assertValidBirthSchemaRef(schema_0: SchemaRef): [];
  assertValidBirthCredentialPresentationRequest(request_0: BirthCredentialPresentationRequest): [];
  birthCredentialPresentationRequestFromProtocol(request_0: BirthCredentialVerificationRequest): BirthCredentialPresentationRequest;
  assertValidBirthCredentialIssuanceOffer(offer_0: BirthCredentialIssuanceOffer): [];
  assertValidBirthCredentialIssuanceRequest(request_0: BirthCredentialIssuanceRequest): [];
  assertBirthCredentialIssuanceRequestMatchesOffer(offer_0: BirthCredentialIssuanceOffer,
                                                   request_0: BirthCredentialIssuanceRequest): [];
  assertValidBirthCredentialIssuanceResult(result_0: BirthCredentialIssuanceResult): [];
  assertBirthCredentialIssuanceResultMatchesRequest(request_0: BirthCredentialIssuanceRequest,
                                                    result_0: BirthCredentialIssuanceResult): [];
  assertValidBirthCredentialVerificationRequestMessage(request_0: BirthCredentialVerificationRequest): [];
  assertValidBirthCredentialVerificationSubmissionMessage(submission_0: BirthCredentialVerificationSubmission): [];
  assertBirthCredentialVerificationSubmissionMatchesRequest(request_0: BirthCredentialVerificationRequest,
                                                            submission_0: BirthCredentialVerificationSubmission): [];
  assertValidBirthCredentialVerificationResultMessage(result_0: BirthCredentialVerificationResult): [];
  assertBirthCredentialVerificationResultMatchesSubmission(submission_0: BirthCredentialVerificationSubmission,
                                                           result_0: BirthCredentialVerificationResult): [];
  assertValidBirthCredential(credential_0: BirthCredential, proof_0: Proof): [];
  assertValidBirthCredentialPresentation(credential_0: BirthCredential,
                                         credentialProof_0: Proof,
                                         presentation_0: BirthCredentialPresentation,
                                         presentationProof_0: Proof): [];
  assertBirthPresentationSatisfiesRequest(credential_0: BirthCredential,
                                          request_0: BirthCredentialPresentationRequest,
                                          presentation_0: BirthCredentialPresentation,
                                          presentationProof_0: Proof): [];
  assertValidBirthCredentialAgePredicate(credential_0: BirthCredential,
                                         presentation_0: BirthCredentialPresentation,
                                         currentDay_0: bigint,
                                         birthDateDays_0: bigint,
                                         birthDateOpening_0: Uint8Array): [];
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
  birthCredentialBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                          credential_0: BirthCredential): __compactRuntime.CircuitResults<PS, Uint8Array>;
  birthCredentialPresentationBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                      presentation_0: BirthCredentialPresentation): __compactRuntime.CircuitResults<PS, Uint8Array>;
  birthCredentialPresentationRequestBodyRoot(context: __compactRuntime.CircuitContext<PS>,
                                             request_0: BirthCredentialPresentationRequest): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assertValidBirthSchemaRef(context: __compactRuntime.CircuitContext<PS>,
                            schema_0: SchemaRef): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialPresentationRequest(context: __compactRuntime.CircuitContext<PS>,
                                                request_0: BirthCredentialPresentationRequest): __compactRuntime.CircuitResults<PS, []>;
  birthCredentialPresentationRequestFromProtocol(context: __compactRuntime.CircuitContext<PS>,
                                                 request_0: BirthCredentialVerificationRequest): __compactRuntime.CircuitResults<PS, BirthCredentialPresentationRequest>;
  assertValidBirthCredentialIssuanceOffer(context: __compactRuntime.CircuitContext<PS>,
                                          offer_0: BirthCredentialIssuanceOffer): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialIssuanceRequest(context: __compactRuntime.CircuitContext<PS>,
                                            request_0: BirthCredentialIssuanceRequest): __compactRuntime.CircuitResults<PS, []>;
  assertBirthCredentialIssuanceRequestMatchesOffer(context: __compactRuntime.CircuitContext<PS>,
                                                   offer_0: BirthCredentialIssuanceOffer,
                                                   request_0: BirthCredentialIssuanceRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialIssuanceResult(context: __compactRuntime.CircuitContext<PS>,
                                           result_0: BirthCredentialIssuanceResult): __compactRuntime.CircuitResults<PS, []>;
  assertBirthCredentialIssuanceResultMatchesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                    request_0: BirthCredentialIssuanceRequest,
                                                    result_0: BirthCredentialIssuanceResult): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialVerificationRequestMessage(context: __compactRuntime.CircuitContext<PS>,
                                                       request_0: BirthCredentialVerificationRequest): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialVerificationSubmissionMessage(context: __compactRuntime.CircuitContext<PS>,
                                                          submission_0: BirthCredentialVerificationSubmission): __compactRuntime.CircuitResults<PS, []>;
  assertBirthCredentialVerificationSubmissionMatchesRequest(context: __compactRuntime.CircuitContext<PS>,
                                                            request_0: BirthCredentialVerificationRequest,
                                                            submission_0: BirthCredentialVerificationSubmission): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialVerificationResultMessage(context: __compactRuntime.CircuitContext<PS>,
                                                      result_0: BirthCredentialVerificationResult): __compactRuntime.CircuitResults<PS, []>;
  assertBirthCredentialVerificationResultMatchesSubmission(context: __compactRuntime.CircuitContext<PS>,
                                                           submission_0: BirthCredentialVerificationSubmission,
                                                           result_0: BirthCredentialVerificationResult): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredential(context: __compactRuntime.CircuitContext<PS>,
                             credential_0: BirthCredential,
                             proof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialPresentation(context: __compactRuntime.CircuitContext<PS>,
                                         credential_0: BirthCredential,
                                         credentialProof_0: Proof,
                                         presentation_0: BirthCredentialPresentation,
                                         presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertBirthPresentationSatisfiesRequest(context: __compactRuntime.CircuitContext<PS>,
                                          credential_0: BirthCredential,
                                          request_0: BirthCredentialPresentationRequest,
                                          presentation_0: BirthCredentialPresentation,
                                          presentationProof_0: Proof): __compactRuntime.CircuitResults<PS, []>;
  assertValidBirthCredentialAgePredicate(context: __compactRuntime.CircuitContext<PS>,
                                         credential_0: BirthCredential,
                                         presentation_0: BirthCredentialPresentation,
                                         currentDay_0: bigint,
                                         birthDateDays_0: bigint,
                                         birthDateOpening_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
