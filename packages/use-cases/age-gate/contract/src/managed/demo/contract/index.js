import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var HolderBindingProfile;
(function (HolderBindingProfile) {
  HolderBindingProfile[HolderBindingProfile['explicitDid'] = 0] = 'explicitDid';
  HolderBindingProfile[HolderBindingProfile['secretHolder'] = 1] = 'secretHolder';
  HolderBindingProfile[HolderBindingProfile['blindedSecretHolder'] = 2] = 'blindedSecretHolder';
})(HolderBindingProfile || (HolderBindingProfile = {}));

export var StatusType;
(function (StatusType) {
  StatusType[StatusType['revocationRegistry'] = 0] = 'revocationRegistry';
})(StatusType || (StatusType = {}));

export var AccessDecision;
(function (AccessDecision) {
  AccessDecision[AccessDecision['noDecision'] = 0] = 'noDecision';
  AccessDecision[AccessDecision['approved'] = 1] = 'approved';
  AccessDecision[AccessDecision['unknownCapability'] = 2] = 'unknownCapability';
  AccessDecision[AccessDecision['alreadyConsumed'] = 3] = 'alreadyConsumed';
})(AccessDecision || (AccessDecision = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_2 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _SchemaRef_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment())));
  }
  fromValue(value_0) {
    return {
      packageId: _descriptor_2.fromValue(value_0),
      schemaId: _descriptor_2.fromValue(value_0),
      majorVersion: _descriptor_1.fromValue(value_0),
      minorVersion: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.packageId).concat(_descriptor_2.toValue(value_0.schemaId).concat(_descriptor_1.toValue(value_0.majorVersion).concat(_descriptor_1.toValue(value_0.minorVersion))));
  }
}

const _descriptor_4 = new _SchemaRef_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_2.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.bytes);
  }
}

const _descriptor_5 = new _ContractAddress_0();

class _VerificationMethodRef_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      didContractAddress: _descriptor_5.fromValue(value_0),
      methodId: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.didContractAddress).concat(_descriptor_2.toValue(value_0.methodId));
  }
}

const _descriptor_6 = new _VerificationMethodRef_0();

class _ExplicitHolderBinding_0 {
  alignment() {
    return _descriptor_6.alignment();
  }
  fromValue(value_0) {
    return {
      holderVerificationMethodRef: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.holderVerificationMethodRef);
  }
}

const _descriptor_7 = new _ExplicitHolderBinding_0();

class _NoStatusBinding_0 {
  alignment() {
    return [];
  }
  fromValue(value_0) {
    return {
    }
  }
  toValue(value_0) {
    return [];
  }
}

const _descriptor_8 = new _NoStatusBinding_0();

const _descriptor_9 = __compactRuntime.CompactTypeBoolean;

class _NoPublicClaims_0 {
  alignment() {
    return [];
  }
  fromValue(value_0) {
    return {
    }
  }
  toValue(value_0) {
    return [];
  }
}

const _descriptor_10 = new _NoPublicClaims_0();

class _BirthCredentialClaimCommitments_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      subjectIdCommitment: _descriptor_2.fromValue(value_0),
      legalNameCommitment: _descriptor_2.fromValue(value_0),
      birthDateCommitment: _descriptor_2.fromValue(value_0),
      birthCountryCodeCommitment: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.subjectIdCommitment).concat(_descriptor_2.toValue(value_0.legalNameCommitment).concat(_descriptor_2.toValue(value_0.birthDateCommitment).concat(_descriptor_2.toValue(value_0.birthCountryCodeCommitment))));
  }
}

const _descriptor_11 = new _BirthCredentialClaimCommitments_0();

class _Credential_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment().concat(_descriptor_8.alignment().concat(_descriptor_3.alignment().concat(_descriptor_9.alignment().concat(_descriptor_3.alignment().concat(_descriptor_10.alignment().concat(_descriptor_11.alignment().concat(_descriptor_2.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBinding: _descriptor_7.fromValue(value_0),
      statusBinding: _descriptor_8.fromValue(value_0),
      issuedAt: _descriptor_3.fromValue(value_0),
      hasExpiration: _descriptor_9.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0),
      claims: _descriptor_10.fromValue(value_0),
      claimCommitments: _descriptor_11.fromValue(value_0),
      claimRoot: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_7.toValue(value_0.holderBinding).concat(_descriptor_8.toValue(value_0.statusBinding).concat(_descriptor_3.toValue(value_0.issuedAt).concat(_descriptor_9.toValue(value_0.hasExpiration).concat(_descriptor_3.toValue(value_0.expiresAt).concat(_descriptor_10.toValue(value_0.claims).concat(_descriptor_11.toValue(value_0.claimCommitments).concat(_descriptor_2.toValue(value_0.claimRoot)))))))))));
  }
}

const _descriptor_12 = new _Credential_0();

const _descriptor_13 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_14 = __compactRuntime.CompactTypeField;

class _Signature_0 {
  alignment() {
    return _descriptor_13.alignment().concat(_descriptor_14.alignment());
  }
  fromValue(value_0) {
    return {
      r: _descriptor_13.fromValue(value_0),
      s: _descriptor_14.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.r).concat(_descriptor_14.toValue(value_0.s));
  }
}

const _descriptor_15 = new _Signature_0();

class _Proof_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_3.alignment().concat(_descriptor_2.alignment().concat(_descriptor_13.alignment().concat(_descriptor_15.alignment()))));
  }
  fromValue(value_0) {
    return {
      signerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      createdAt: _descriptor_3.fromValue(value_0),
      challengeHash: _descriptor_2.fromValue(value_0),
      publicKey: _descriptor_13.fromValue(value_0),
      signature: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.signerVerificationMethodRef).concat(_descriptor_3.toValue(value_0.createdAt).concat(_descriptor_2.toValue(value_0.challengeHash).concat(_descriptor_13.toValue(value_0.publicKey).concat(_descriptor_15.toValue(value_0.signature)))));
  }
}

const _descriptor_16 = new _Proof_0();

const _descriptor_17 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class _BirthCredentialDisclosures_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_17.alignment()))))));
  }
  fromValue(value_0) {
    return {
      revealSubjectIdCommitment: _descriptor_9.fromValue(value_0),
      subjectIdCommitment: _descriptor_2.fromValue(value_0),
      revealBirthCountryCode: _descriptor_9.fromValue(value_0),
      birthCountryCodePadded: _descriptor_2.fromValue(value_0),
      birthCountryCodeOpening: _descriptor_2.fromValue(value_0),
      proveAgeOverThreshold: _descriptor_9.fromValue(value_0),
      ageThresholdYears: _descriptor_17.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.revealSubjectIdCommitment).concat(_descriptor_2.toValue(value_0.subjectIdCommitment).concat(_descriptor_9.toValue(value_0.revealBirthCountryCode).concat(_descriptor_2.toValue(value_0.birthCountryCodePadded).concat(_descriptor_2.toValue(value_0.birthCountryCodeOpening).concat(_descriptor_9.toValue(value_0.proveAgeOverThreshold).concat(_descriptor_17.toValue(value_0.ageThresholdYears)))))));
  }
}

const _descriptor_18 = new _BirthCredentialDisclosures_0();

class _Presentation_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_4.alignment().concat(_descriptor_2.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment().concat(_descriptor_18.alignment())))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      credentialClaimRoot: _descriptor_2.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBinding: _descriptor_7.fromValue(value_0),
      disclosed: _descriptor_18.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_2.toValue(value_0.credentialClaimRoot).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_7.toValue(value_0.holderBinding).concat(_descriptor_18.toValue(value_0.disclosed))))));
  }
}

const _descriptor_19 = new _Presentation_0();

const _descriptor_20 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

class _BirthCredentialPresentationRequest_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_17.alignment().concat(_descriptor_2.alignment())))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      requireSubjectIdCommitmentDisclosure: _descriptor_9.fromValue(value_0),
      requireBirthCountryDisclosure: _descriptor_9.fromValue(value_0),
      requireAgeOverThreshold: _descriptor_9.fromValue(value_0),
      requestedAgeThresholdYears: _descriptor_17.fromValue(value_0),
      verifierChallengeHash: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_9.toValue(value_0.requireSubjectIdCommitmentDisclosure).concat(_descriptor_9.toValue(value_0.requireBirthCountryDisclosure).concat(_descriptor_9.toValue(value_0.requireAgeOverThreshold).concat(_descriptor_17.toValue(value_0.requestedAgeThresholdYears).concat(_descriptor_2.toValue(value_0.verifierChallengeHash))))))));
  }
}

const _descriptor_21 = new _BirthCredentialPresentationRequest_0();

class _ProtocolMessageEnvelope_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_9.alignment().concat(_descriptor_3.alignment())))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      messageId: _descriptor_2.fromValue(value_0),
      threadId: _descriptor_2.fromValue(value_0),
      initialMessage: _descriptor_9.fromValue(value_0),
      respondsToMessageId: _descriptor_2.fromValue(value_0),
      createdAt: _descriptor_3.fromValue(value_0),
      hasExpiresAt: _descriptor_9.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.messageId).concat(_descriptor_2.toValue(value_0.threadId).concat(_descriptor_9.toValue(value_0.initialMessage).concat(_descriptor_2.toValue(value_0.respondsToMessageId).concat(_descriptor_3.toValue(value_0.createdAt).concat(_descriptor_9.toValue(value_0.hasExpiresAt).concat(_descriptor_3.toValue(value_0.expiresAt))))))));
  }
}

const _descriptor_22 = new _ProtocolMessageEnvelope_0();

class _BirthCredentialVerificationResultBody_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_17.alignment());
  }
  fromValue(value_0) {
    return {
      credentialRoot: _descriptor_2.fromValue(value_0),
      verifiedThresholdYears: _descriptor_17.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.credentialRoot).concat(_descriptor_17.toValue(value_0.verifiedThresholdYears));
  }
}

const _descriptor_23 = new _BirthCredentialVerificationResultBody_0();

class _ResultMessage_0 {
  alignment() {
    return _descriptor_22.alignment().concat(_descriptor_9.alignment().concat(_descriptor_23.alignment()));
  }
  fromValue(value_0) {
    return {
      envelope: _descriptor_22.fromValue(value_0),
      approved: _descriptor_9.fromValue(value_0),
      body: _descriptor_23.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_22.toValue(value_0.envelope).concat(_descriptor_9.toValue(value_0.approved).concat(_descriptor_23.toValue(value_0.body)));
  }
}

const _descriptor_24 = new _ResultMessage_0();

const _descriptor_25 = new __compactRuntime.CompactTypeEnum(2, 1);

class _BirthCredentialVerificationSubmissionBody_0 {
  alignment() {
    return _descriptor_12.alignment().concat(_descriptor_16.alignment().concat(_descriptor_19.alignment().concat(_descriptor_16.alignment())));
  }
  fromValue(value_0) {
    return {
      credential: _descriptor_12.fromValue(value_0),
      credentialProof: _descriptor_16.fromValue(value_0),
      presentation: _descriptor_19.fromValue(value_0),
      presentationProof: _descriptor_16.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_12.toValue(value_0.credential).concat(_descriptor_16.toValue(value_0.credentialProof).concat(_descriptor_19.toValue(value_0.presentation).concat(_descriptor_16.toValue(value_0.presentationProof))));
  }
}

const _descriptor_26 = new _BirthCredentialVerificationSubmissionBody_0();

class _SubmissionMessage_0 {
  alignment() {
    return _descriptor_22.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_25.alignment().concat(_descriptor_2.alignment().concat(_descriptor_26.alignment())))));
  }
  fromValue(value_0) {
    return {
      envelope: _descriptor_22.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBindingProfile: _descriptor_25.fromValue(value_0),
      challengeHash: _descriptor_2.fromValue(value_0),
      body: _descriptor_26.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_22.toValue(value_0.envelope).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_25.toValue(value_0.holderBindingProfile).concat(_descriptor_2.toValue(value_0.challengeHash).concat(_descriptor_26.toValue(value_0.body))))));
  }
}

const _descriptor_27 = new _SubmissionMessage_0();

class _CredentialProtocolFeatures_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment())));
  }
  fromValue(value_0) {
    return {
      supportsSelectiveDisclosure: _descriptor_9.fromValue(value_0),
      supportsPredicateProofs: _descriptor_9.fromValue(value_0),
      supportsVerifierScopedPseudonym: _descriptor_9.fromValue(value_0),
      supportsSameHolderProof: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.supportsSelectiveDisclosure).concat(_descriptor_9.toValue(value_0.supportsPredicateProofs).concat(_descriptor_9.toValue(value_0.supportsVerifierScopedPseudonym).concat(_descriptor_9.toValue(value_0.supportsSameHolderProof))));
  }
}

const _descriptor_28 = new _CredentialProtocolFeatures_0();

class _BirthCredentialVerificationRequestBody_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_17.alignment())));
  }
  fromValue(value_0) {
    return {
      requireSubjectIdCommitmentDisclosure: _descriptor_9.fromValue(value_0),
      requireBirthCountryDisclosure: _descriptor_9.fromValue(value_0),
      requireAgeOverThreshold: _descriptor_9.fromValue(value_0),
      requestedAgeThresholdYears: _descriptor_17.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.requireSubjectIdCommitmentDisclosure).concat(_descriptor_9.toValue(value_0.requireBirthCountryDisclosure).concat(_descriptor_9.toValue(value_0.requireAgeOverThreshold).concat(_descriptor_17.toValue(value_0.requestedAgeThresholdYears))));
  }
}

const _descriptor_29 = new _BirthCredentialVerificationRequestBody_0();

class _RequestMessage_0 {
  alignment() {
    return _descriptor_22.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_25.alignment().concat(_descriptor_28.alignment().concat(_descriptor_2.alignment().concat(_descriptor_29.alignment()))))));
  }
  fromValue(value_0) {
    return {
      envelope: _descriptor_22.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBindingProfile: _descriptor_25.fromValue(value_0),
      features: _descriptor_28.fromValue(value_0),
      verifierChallengeHash: _descriptor_2.fromValue(value_0),
      body: _descriptor_29.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_22.toValue(value_0.envelope).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_25.toValue(value_0.holderBindingProfile).concat(_descriptor_28.toValue(value_0.features).concat(_descriptor_2.toValue(value_0.verifierChallengeHash).concat(_descriptor_29.toValue(value_0.body)))))));
  }
}

const _descriptor_30 = new _RequestMessage_0();

class _BirthCredentialIssuanceRequestBody_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_13.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment()))));
  }
  fromValue(value_0) {
    return {
      holderBinding: _descriptor_7.fromValue(value_0),
      holderPublicKey: _descriptor_13.fromValue(value_0),
      holderChallengeHash: _descriptor_2.fromValue(value_0),
      requestExpiration: _descriptor_9.fromValue(value_0),
      requestedExpirationDays: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.holderBinding).concat(_descriptor_13.toValue(value_0.holderPublicKey).concat(_descriptor_2.toValue(value_0.holderChallengeHash).concat(_descriptor_9.toValue(value_0.requestExpiration).concat(_descriptor_1.toValue(value_0.requestedExpirationDays)))));
  }
}

const _descriptor_31 = new _BirthCredentialIssuanceRequestBody_0();

class _RequestMessage_1 {
  alignment() {
    return _descriptor_22.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_25.alignment().concat(_descriptor_31.alignment()))));
  }
  fromValue(value_0) {
    return {
      envelope: _descriptor_22.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBindingProfile: _descriptor_25.fromValue(value_0),
      body: _descriptor_31.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_22.toValue(value_0.envelope).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_25.toValue(value_0.holderBindingProfile).concat(_descriptor_31.toValue(value_0.body)))));
  }
}

const _descriptor_32 = new _RequestMessage_1();

class _BirthCredentialIssuanceResultBody_0 {
  alignment() {
    return _descriptor_12.alignment().concat(_descriptor_16.alignment().concat(_descriptor_13.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      credential: _descriptor_12.fromValue(value_0),
      credentialProof: _descriptor_16.fromValue(value_0),
      holderPublicKey: _descriptor_13.fromValue(value_0),
      issuanceChallengeHash: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_12.toValue(value_0.credential).concat(_descriptor_16.toValue(value_0.credentialProof).concat(_descriptor_13.toValue(value_0.holderPublicKey).concat(_descriptor_2.toValue(value_0.issuanceChallengeHash))));
  }
}

const _descriptor_33 = new _BirthCredentialIssuanceResultBody_0();

class _ResultMessage_1 {
  alignment() {
    return _descriptor_22.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_25.alignment().concat(_descriptor_33.alignment()))));
  }
  fromValue(value_0) {
    return {
      envelope: _descriptor_22.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBindingProfile: _descriptor_25.fromValue(value_0),
      body: _descriptor_33.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_22.toValue(value_0.envelope).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_25.toValue(value_0.holderBindingProfile).concat(_descriptor_33.toValue(value_0.body)))));
  }
}

const _descriptor_34 = new _ResultMessage_1();

class _BirthCredentialIssuanceOfferBody_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_1.alignment().concat(_descriptor_9.alignment()));
  }
  fromValue(value_0) {
    return {
      supportsExpiration: _descriptor_9.fromValue(value_0),
      defaultExpirationDays: _descriptor_1.fromValue(value_0),
      requiresHolderPublicKey: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.supportsExpiration).concat(_descriptor_1.toValue(value_0.defaultExpirationDays).concat(_descriptor_9.toValue(value_0.requiresHolderPublicKey)));
  }
}

const _descriptor_35 = new _BirthCredentialIssuanceOfferBody_0();

class _OfferMessage_0 {
  alignment() {
    return _descriptor_22.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_25.alignment().concat(_descriptor_28.alignment().concat(_descriptor_35.alignment())))));
  }
  fromValue(value_0) {
    return {
      envelope: _descriptor_22.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBindingProfile: _descriptor_25.fromValue(value_0),
      features: _descriptor_28.fromValue(value_0),
      body: _descriptor_35.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_22.toValue(value_0.envelope).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_25.toValue(value_0.holderBindingProfile).concat(_descriptor_28.toValue(value_0.features).concat(_descriptor_35.toValue(value_0.body))))));
  }
}

const _descriptor_36 = new _OfferMessage_0();

const _descriptor_37 = new __compactRuntime.CompactTypeEnum(0, 0);

class _StatusRegistryRef_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_6.alignment());
  }
  fromValue(value_0) {
    return {
      registryId: _descriptor_2.fromValue(value_0),
      authorityVerificationMethodRef: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.registryId).concat(_descriptor_6.toValue(value_0.authorityVerificationMethodRef));
  }
}

const _descriptor_38 = new _StatusRegistryRef_0();

class _RegistryBoundStatusBinding_0 {
  alignment() {
    return _descriptor_37.alignment().concat(_descriptor_38.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      statusType: _descriptor_37.fromValue(value_0),
      registryRef: _descriptor_38.fromValue(value_0),
      statusHandleCommitment: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_37.toValue(value_0.statusType).concat(_descriptor_38.toValue(value_0.registryRef).concat(_descriptor_2.toValue(value_0.statusHandleCommitment)));
  }
}

const _descriptor_39 = new _RegistryBoundStatusBinding_0();

class _SchemaCapabilities_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment())));
  }
  fromValue(value_0) {
    return {
      supportsSelectiveDisclosure: _descriptor_9.fromValue(value_0),
      supportsPredicateProofs: _descriptor_9.fromValue(value_0),
      supportsVerifierScopedPseudonym: _descriptor_9.fromValue(value_0),
      supportsSameHolderProof: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.supportsSelectiveDisclosure).concat(_descriptor_9.toValue(value_0.supportsPredicateProofs).concat(_descriptor_9.toValue(value_0.supportsVerifierScopedPseudonym).concat(_descriptor_9.toValue(value_0.supportsSameHolderProof))));
  }
}

const _descriptor_40 = new _SchemaCapabilities_0();

class _SecretHolderBinding_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      holderSecretCommitment: _descriptor_2.fromValue(value_0),
      requestChallengeResponse: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.holderSecretCommitment).concat(_descriptor_2.toValue(value_0.requestChallengeResponse));
  }
}

const _descriptor_41 = new _SecretHolderBinding_0();

class _BlindedSecretHolderBinding_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      blindedHolderSecretCommitment: _descriptor_2.fromValue(value_0),
      issuerNonce: _descriptor_2.fromValue(value_0),
      requestChallengeResponse: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.blindedHolderSecretCommitment).concat(_descriptor_2.toValue(value_0.issuerNonce).concat(_descriptor_2.toValue(value_0.requestChallengeResponse)));
  }
}

const _descriptor_42 = new _BlindedSecretHolderBinding_0();

class _OffchainMidnightHolderBinding_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_13.alignment()));
  }
  fromValue(value_0) {
    return {
      holderDidStateHash: _descriptor_2.fromValue(value_0),
      holderMethodId: _descriptor_2.fromValue(value_0),
      holderPublicKey: _descriptor_13.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.holderDidStateHash).concat(_descriptor_2.toValue(value_0.holderMethodId).concat(_descriptor_13.toValue(value_0.holderPublicKey)));
  }
}

const _descriptor_43 = new _OffchainMidnightHolderBinding_0();

class _JubjubHolderBinding_0 {
  alignment() {
    return _descriptor_13.alignment();
  }
  fromValue(value_0) {
    return {
      holderPublicKey: _descriptor_13.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.holderPublicKey);
  }
}

const _descriptor_44 = new _JubjubHolderBinding_0();

class _SchemaFamilyResolutionHint_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      hasResolverHint: _descriptor_9.fromValue(value_0),
      resolverHint: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.hasResolverHint).concat(_descriptor_2.toValue(value_0.resolverHint));
  }
}

const _descriptor_45 = new _SchemaFamilyResolutionHint_0();

class _SchemaDescriptor_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_40.alignment().concat(_descriptor_45.alignment()));
  }
  fromValue(value_0) {
    return {
      schema: _descriptor_4.fromValue(value_0),
      capabilities: _descriptor_40.fromValue(value_0),
      familyResolutionHint: _descriptor_45.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.schema).concat(_descriptor_40.toValue(value_0.capabilities).concat(_descriptor_45.toValue(value_0.familyResolutionHint)));
  }
}

const _descriptor_46 = new _SchemaDescriptor_0();

const _descriptor_47 = new __compactRuntime.CompactTypeVector(4, _descriptor_2);

const _descriptor_48 = new __compactRuntime.CompactTypeVector(5, _descriptor_2);

const _descriptor_49 = new __compactRuntime.CompactTypeVector(3, _descriptor_2);

class _Either_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_9.fromValue(value_0),
      left: _descriptor_2.fromValue(value_0),
      right: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.is_left).concat(_descriptor_2.toValue(value_0.left).concat(_descriptor_2.toValue(value_0.right)));
  }
}

const _descriptor_50 = new _Either_0();

const _descriptor_51 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.holderBirthDateDays) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named holderBirthDateDays');
    }
    if (typeof(witnesses_0.holderBirthDateOpening) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named holderBirthDateOpening');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      noSchemaFamilyResolverHint(context, ...args_1) {
        return { result: pureCircuits.noSchemaFamilyResolverHint(...args_1), context };
      },
      assertValidSchemaRef(context, ...args_1) {
        return { result: pureCircuits.assertValidSchemaRef(...args_1), context };
      },
      assertValidSchemaCapabilities(context, ...args_1) {
        return { result: pureCircuits.assertValidSchemaCapabilities(...args_1), context };
      },
      assertValidSchemaFamilyResolutionHint(context, ...args_1) {
        return { result: pureCircuits.assertValidSchemaFamilyResolutionHint(...args_1), context };
      },
      assertValidSchemaDescriptor(context, ...args_1) {
        return { result: pureCircuits.assertValidSchemaDescriptor(...args_1), context };
      },
      assertMatchingSchemaCapabilities(context, ...args_1) {
        return { result: pureCircuits.assertMatchingSchemaCapabilities(...args_1), context };
      },
      verifySignature(context, ...args_1) {
        return { result: pureCircuits.verifySignature(...args_1), context };
      },
      issuanceContextTag(context, ...args_1) {
        return { result: pureCircuits.issuanceContextTag(...args_1), context };
      },
      presentationContextTag(context, ...args_1) {
        return { result: pureCircuits.presentationContextTag(...args_1), context };
      },
      issuanceProofPayloadRoot(context, ...args_1) {
        return { result: pureCircuits.issuanceProofPayloadRoot(...args_1), context };
      },
      presentationProofPayloadRoot(context, ...args_1) {
        return { result: pureCircuits.presentationProofPayloadRoot(...args_1), context };
      },
      issuanceProofChallenge(context, ...args_1) {
        return { result: pureCircuits.issuanceProofChallenge(...args_1), context };
      },
      presentationProofChallenge(context, ...args_1) {
        return { result: pureCircuits.presentationProofChallenge(...args_1), context };
      },
      assertValidIssuanceContextProof(context, ...args_1) {
        return { result: pureCircuits.assertValidIssuanceContextProof(...args_1), context };
      },
      assertValidPresentationContextProof(context, ...args_1) {
        return { result: pureCircuits.assertValidPresentationContextProof(...args_1), context };
      },
      assertValidExplicitHolderBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidExplicitHolderBinding(...args_1), context };
      },
      assertMatchingExplicitHolderBindings(context, ...args_1) {
        return { result: pureCircuits.assertMatchingExplicitHolderBindings(...args_1), context };
      },
      assertProofMatchesExplicitHolderBinding(context, ...args_1) {
        return { result: pureCircuits.assertProofMatchesExplicitHolderBinding(...args_1), context };
      },
      assertValidJubjubHolderBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidJubjubHolderBinding(...args_1), context };
      },
      assertMatchingJubjubHolderBindings(context, ...args_1) {
        return { result: pureCircuits.assertMatchingJubjubHolderBindings(...args_1), context };
      },
      assertProofMatchesJubjubHolderBinding(context, ...args_1) {
        return { result: pureCircuits.assertProofMatchesJubjubHolderBinding(...args_1), context };
      },
      assertValidOffchainMidnightHolderBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidOffchainMidnightHolderBinding(...args_1), context };
      },
      assertMatchingOffchainMidnightHolderBindings(context, ...args_1) {
        return { result: pureCircuits.assertMatchingOffchainMidnightHolderBindings(...args_1), context };
      },
      assertProofMatchesOffchainMidnightHolderBinding(context, ...args_1) {
        return { result: pureCircuits.assertProofMatchesOffchainMidnightHolderBinding(...args_1), context };
      },
      noSecretHolderChallengeResponse(context, ...args_1) {
        return { result: pureCircuits.noSecretHolderChallengeResponse(...args_1), context };
      },
      secretHolderBindingCommitment(context, ...args_1) {
        return { result: pureCircuits.secretHolderBindingCommitment(...args_1), context };
      },
      secretHolderBindingChallengeResponse(context, ...args_1) {
        return { result: pureCircuits.secretHolderBindingChallengeResponse(...args_1), context };
      },
      verifierScopedPseudonym(context, ...args_1) {
        return { result: pureCircuits.verifierScopedPseudonym(...args_1), context };
      },
      assertVerifierScopedPseudonym(context, ...args_1) {
        return { result: pureCircuits.assertVerifierScopedPseudonym(...args_1), context };
      },
      blindedSecretHolderCommitment(context, ...args_1) {
        return { result: pureCircuits.blindedSecretHolderCommitment(...args_1), context };
      },
      assertValidSecretHolderCredentialBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidSecretHolderCredentialBinding(...args_1), context };
      },
      assertValidSecretHolderPresentationBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidSecretHolderPresentationBinding(...args_1), context };
      },
      assertMatchingSecretHolderBindings(context, ...args_1) {
        return { result: pureCircuits.assertMatchingSecretHolderBindings(...args_1), context };
      },
      assertValidBlindedSecretHolderCredentialBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidBlindedSecretHolderCredentialBinding(...args_1), context };
      },
      assertValidBlindedSecretHolderPresentationBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidBlindedSecretHolderPresentationBinding(...args_1), context };
      },
      assertMatchingBlindedSecretHolderBindings(context, ...args_1) {
        return { result: pureCircuits.assertMatchingBlindedSecretHolderBindings(...args_1), context };
      },
      assertSecretHolderBindingWitness(context, ...args_1) {
        return { result: pureCircuits.assertSecretHolderBindingWitness(...args_1), context };
      },
      assertBlindedSecretHolderBindingWitness(context, ...args_1) {
        return { result: pureCircuits.assertBlindedSecretHolderBindingWitness(...args_1), context };
      },
      protocolFeaturesAsSchemaCapabilities(context, ...args_1) {
        return { result: pureCircuits.protocolFeaturesAsSchemaCapabilities(...args_1), context };
      },
      assertProtocolFeaturesMatchSchemaCapabilities(context, ...args_1) {
        return { result: pureCircuits.assertProtocolFeaturesMatchSchemaCapabilities(...args_1), context };
      },
      noProtocolResponseReference(context, ...args_1) {
        return { result: pureCircuits.noProtocolResponseReference(...args_1), context };
      },
      assertValidVerificationMethodRef(context, ...args_1) {
        return { result: pureCircuits.assertValidVerificationMethodRef(...args_1), context };
      },
      assertMatchingSchemaRefs(context, ...args_1) {
        return { result: pureCircuits.assertMatchingSchemaRefs(...args_1), context };
      },
      assertValidProtocolMessageEnvelope(context, ...args_1) {
        return { result: pureCircuits.assertValidProtocolMessageEnvelope(...args_1), context };
      },
      assertProtocolResponseEnvelope(context, ...args_1) {
        return { result: pureCircuits.assertProtocolResponseEnvelope(...args_1), context };
      },
      assertValidStatusRegistryRef(context, ...args_1) {
        return { result: pureCircuits.assertValidStatusRegistryRef(...args_1), context };
      },
      assertValidNoStatusBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidNoStatusBinding(...args_1), context };
      },
      assertValidRegistryBoundStatusBinding(context, ...args_1) {
        return { result: pureCircuits.assertValidRegistryBoundStatusBinding(...args_1), context };
      },
      registryBoundStatusBindingRoot(context, ...args_1) {
        return { result: pureCircuits.registryBoundStatusBindingRoot(...args_1), context };
      },
      birthCredentialClaimRoot(context, ...args_1) {
        return { result: pureCircuits.birthCredentialClaimRoot(...args_1), context };
      },
      subjectIdCommitment(context, ...args_1) {
        return { result: pureCircuits.subjectIdCommitment(...args_1), context };
      },
      birthDateCommitment(context, ...args_1) {
        return { result: pureCircuits.birthDateCommitment(...args_1), context };
      },
      legalNameCommitment(context, ...args_1) {
        return { result: pureCircuits.legalNameCommitment(...args_1), context };
      },
      birthCountryCodeCommitment(context, ...args_1) {
        return { result: pureCircuits.birthCountryCodeCommitment(...args_1), context };
      },
      birthCredentialBodyRoot(context, ...args_1) {
        return { result: pureCircuits.birthCredentialBodyRoot(...args_1), context };
      },
      birthCredentialPresentationBodyRoot(context, ...args_1) {
        return { result: pureCircuits.birthCredentialPresentationBodyRoot(...args_1), context };
      },
      birthCredentialPresentationRequestBodyRoot(context, ...args_1) {
        return { result: pureCircuits.birthCredentialPresentationRequestBodyRoot(...args_1), context };
      },
      assertValidBirthSchemaRef(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthSchemaRef(...args_1), context };
      },
      assertValidBirthCredentialPresentationRequest(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialPresentationRequest(...args_1), context };
      },
      birthCredentialPresentationRequestFromProtocol(context, ...args_1) {
        return { result: pureCircuits.birthCredentialPresentationRequestFromProtocol(...args_1), context };
      },
      assertValidBirthCredentialIssuanceOffer(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialIssuanceOffer(...args_1), context };
      },
      assertValidBirthCredentialIssuanceRequest(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialIssuanceRequest(...args_1), context };
      },
      assertBirthCredentialIssuanceRequestMatchesOffer(context, ...args_1) {
        return { result: pureCircuits.assertBirthCredentialIssuanceRequestMatchesOffer(...args_1), context };
      },
      assertValidBirthCredentialIssuanceResult(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialIssuanceResult(...args_1), context };
      },
      assertBirthCredentialIssuanceResultMatchesRequest(context, ...args_1) {
        return { result: pureCircuits.assertBirthCredentialIssuanceResultMatchesRequest(...args_1), context };
      },
      assertValidBirthCredentialVerificationRequestMessage(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialVerificationRequestMessage(...args_1), context };
      },
      assertValidBirthCredentialVerificationSubmissionMessage(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialVerificationSubmissionMessage(...args_1), context };
      },
      assertBirthCredentialVerificationSubmissionMatchesRequest(context, ...args_1) {
        return { result: pureCircuits.assertBirthCredentialVerificationSubmissionMatchesRequest(...args_1), context };
      },
      assertValidBirthCredentialVerificationResultMessage(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialVerificationResultMessage(...args_1), context };
      },
      assertBirthCredentialVerificationResultMatchesSubmission(context, ...args_1) {
        return { result: pureCircuits.assertBirthCredentialVerificationResultMatchesSubmission(...args_1), context };
      },
      assertValidBirthCredential(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredential(...args_1), context };
      },
      assertValidBirthCredentialPresentation(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialPresentation(...args_1), context };
      },
      assertBirthPresentationSatisfiesRequest(context, ...args_1) {
        return { result: pureCircuits.assertBirthPresentationSatisfiesRequest(...args_1), context };
      },
      assertValidBirthCredentialAgePredicate(context, ...args_1) {
        return { result: pureCircuits.assertValidBirthCredentialAgePredicate(...args_1), context };
      },
      ageGateRequestForPolicy(context, ...args_1) {
        return { result: pureCircuits.ageGateRequestForPolicy(...args_1), context };
      },
      ageGateRequest: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`ageGateRequest: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerVerificationMethodRef_0 = args_1[1];
        const verifierChallengeHash_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('ageGateRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'demo.compact line 74 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(issuerVerificationMethodRef_0) === 'object' && typeof(issuerVerificationMethodRef_0.didContractAddress) === 'object' && issuerVerificationMethodRef_0.didContractAddress.bytes.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.didContractAddress.bytes.length === 32 && issuerVerificationMethodRef_0.methodId.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.methodId.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.methodId.length === 32)) {
          __compactRuntime.typeError('ageGateRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'demo.compact line 74 char 1',
                                     'struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>',
                                     issuerVerificationMethodRef_0)
        }
        if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
          __compactRuntime.typeError('ageGateRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'demo.compact line 74 char 1',
                                     'Bytes<32>',
                                     verifierChallengeHash_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_6.toValue(issuerVerificationMethodRef_0).concat(_descriptor_2.toValue(verifierChallengeHash_0)),
            alignment: _descriptor_6.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._ageGateRequest_0(context,
                                                partialProofData,
                                                issuerVerificationMethodRef_0,
                                                verifierChallengeHash_0);
        partialProofData.output = { value: _descriptor_21.toValue(result_0), alignment: _descriptor_21.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      issueBirthCredential: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`issueBirthCredential: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const holderPublicKey_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('issueBirthCredential',
                                     'argument 1 (as invoked from Typescript)',
                                     'demo.compact line 99 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('issueBirthCredential',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'demo.compact line 99 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('issueBirthCredential',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'demo.compact line 99 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_12.toValue(credential_0).concat(_descriptor_16.toValue(credentialProof_0).concat(_descriptor_13.toValue(holderPublicKey_0))),
            alignment: _descriptor_12.alignment().concat(_descriptor_16.alignment().concat(_descriptor_13.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._issueBirthCredential_0(context,
                                                      partialProofData,
                                                      credential_0,
                                                      credentialProof_0,
                                                      holderPublicKey_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      verifyBirthPresentation: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`verifyBirthPresentation: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const presentation_0 = args_1[3];
        const presentationProof_0 = args_1[4];
        const currentDay_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifyBirthPresentation',
                                     'argument 1 (as invoked from Typescript)',
                                     'demo.compact line 122 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('verifyBirthPresentation',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'demo.compact line 122 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyBirthPresentation',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'demo.compact line 122 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
          __compactRuntime.typeError('verifyBirthPresentation',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'demo.compact line 122 char 1',
                                     'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                     presentation_0)
        }
        if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyBirthPresentation',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'demo.compact line 122 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     presentationProof_0)
        }
        if (!(typeof(currentDay_0) === 'bigint' && currentDay_0 >= 0n && currentDay_0 <= 4294967295n)) {
          __compactRuntime.typeError('verifyBirthPresentation',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'demo.compact line 122 char 1',
                                     'Uint<0..4294967296>',
                                     currentDay_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_12.toValue(credential_0).concat(_descriptor_16.toValue(credentialProof_0).concat(_descriptor_19.toValue(presentation_0).concat(_descriptor_16.toValue(presentationProof_0).concat(_descriptor_20.toValue(currentDay_0))))),
            alignment: _descriptor_12.alignment().concat(_descriptor_16.alignment().concat(_descriptor_19.alignment().concat(_descriptor_16.alignment().concat(_descriptor_20.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifyBirthPresentation_0(context,
                                                         partialProofData,
                                                         credential_0,
                                                         credentialProof_0,
                                                         presentation_0,
                                                         presentationProof_0,
                                                         currentDay_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      verifyBirthPresentationForRequest: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`verifyBirthPresentationForRequest: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const request_0 = args_1[3];
        const presentation_0 = args_1[4];
        const presentationProof_0 = args_1[5];
        const currentDay_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.requireAgeOverThreshold) === 'boolean' && typeof(request_0.requestedAgeThresholdYears) === 'bigint' && request_0.requestedAgeThresholdYears >= 0n && request_0.requestedAgeThresholdYears <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'struct BirthCredentialPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                     request_0)
        }
        if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                     presentation_0)
        }
        if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     presentationProof_0)
        }
        if (!(typeof(currentDay_0) === 'bigint' && currentDay_0 >= 0n && currentDay_0 <= 4294967295n)) {
          __compactRuntime.typeError('verifyBirthPresentationForRequest',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'demo.compact line 175 char 1',
                                     'Uint<0..4294967296>',
                                     currentDay_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_12.toValue(credential_0).concat(_descriptor_16.toValue(credentialProof_0).concat(_descriptor_21.toValue(request_0).concat(_descriptor_19.toValue(presentation_0).concat(_descriptor_16.toValue(presentationProof_0).concat(_descriptor_20.toValue(currentDay_0)))))),
            alignment: _descriptor_12.alignment().concat(_descriptor_16.alignment().concat(_descriptor_21.alignment().concat(_descriptor_19.alignment().concat(_descriptor_16.alignment().concat(_descriptor_20.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifyBirthPresentationForRequest_0(context,
                                                                   partialProofData,
                                                                   credential_0,
                                                                   credentialProof_0,
                                                                   request_0,
                                                                   presentation_0,
                                                                   presentationProof_0,
                                                                   currentDay_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      issueAgeGateCapability: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`issueAgeGateCapability: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const presentation_0 = args_1[3];
        const presentationProof_0 = args_1[4];
        const verifierChallengeHash_0 = args_1[5];
        const currentDay_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 1 (as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                     presentation_0)
        }
        if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     presentationProof_0)
        }
        if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'Bytes<32>',
                                     verifierChallengeHash_0)
        }
        if (!(typeof(currentDay_0) === 'bigint' && currentDay_0 >= 0n && currentDay_0 <= 4294967295n)) {
          __compactRuntime.typeError('issueAgeGateCapability',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'demo.compact line 201 char 1',
                                     'Uint<0..4294967296>',
                                     currentDay_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_12.toValue(credential_0).concat(_descriptor_16.toValue(credentialProof_0).concat(_descriptor_19.toValue(presentation_0).concat(_descriptor_16.toValue(presentationProof_0).concat(_descriptor_2.toValue(verifierChallengeHash_0).concat(_descriptor_20.toValue(currentDay_0)))))),
            alignment: _descriptor_12.alignment().concat(_descriptor_16.alignment().concat(_descriptor_19.alignment().concat(_descriptor_16.alignment().concat(_descriptor_2.alignment().concat(_descriptor_20.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._issueAgeGateCapability_0(context,
                                                        partialProofData,
                                                        credential_0,
                                                        credentialProof_0,
                                                        presentation_0,
                                                        presentationProof_0,
                                                        verifierChallengeHash_0,
                                                        currentDay_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      claimAgeGateCapability: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`claimAgeGateCapability: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const capability_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('claimAgeGateCapability',
                                     'argument 1 (as invoked from Typescript)',
                                     'demo.compact line 235 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(capability_0.buffer instanceof ArrayBuffer && capability_0.BYTES_PER_ELEMENT === 1 && capability_0.length === 32)) {
          __compactRuntime.typeError('claimAgeGateCapability',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'demo.compact line 235 char 1',
                                     'Bytes<32>',
                                     capability_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(capability_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._claimAgeGateCapability_0(context,
                                                        partialProofData,
                                                        capability_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      ageGateRequest: this.circuits.ageGateRequest,
      issueBirthCredential: this.circuits.issueBirthCredential,
      verifyBirthPresentation: this.circuits.verifyBirthPresentation,
      verifyBirthPresentationForRequest: this.circuits.verifyBirthPresentationForRequest,
      issueAgeGateCapability: this.circuits.issueAgeGateCapability,
      claimAgeGateCapability: this.circuits.claimAgeGateCapability
    };
    this.provableCircuits = {
      ageGateRequest: this.circuits.ageGateRequest,
      issueBirthCredential: this.circuits.issueBirthCredential,
      verifyBirthPresentation: this.circuits.verifyBirthPresentation,
      verifyBirthPresentationForRequest: this.circuits.verifyBirthPresentationForRequest,
      issueAgeGateCapability: this.circuits.issueAgeGateCapability,
      claimAgeGateCapability: this.circuits.claimAgeGateCapability
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    let stateValue_2 = __compactRuntime.StateValue.newArray();
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(stateValue_2);
    let stateValue_1 = __compactRuntime.StateValue.newArray();
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(stateValue_1);
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('ageGateRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('issueBirthCredential', new __compactRuntime.ContractOperation());
    state_0.setOperation('verifyBirthPresentation', new __compactRuntime.ContractOperation());
    state_0.setOperation('verifyBirthPresentationForRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('issueAgeGateCapability', new __compactRuntime.ContractOperation());
    state_0.setOperation('claimAgeGateCapability', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(0n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(0n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_20.toValue(0n),
                                                                                              alignment: _descriptor_20.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(0n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(1n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(0n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(1n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(0n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(2n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(false),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(3n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(4n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(5n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(6n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_20.toValue(0n),
                                                                                              alignment: _descriptor_20.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(7n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(0n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(8n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(9n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(10n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(11n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(12n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(13n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(14n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(0n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(0n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_20.toValue(tmp_0),
                                                                                              alignment: _descriptor_20.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 18n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(1n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(tmp_1),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(2n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(true),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(5n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array([118, 99, 45, 100, 101, 109, 111, 58, 110, 111, 110, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_2 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(6n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_20.toValue(tmp_2),
                                                                                              alignment: _descriptor_20.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_3 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(7n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(tmp_3),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(8n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array([118, 99, 45, 100, 101, 109, 111, 58, 110, 111, 45, 114, 101, 113, 117, 101, 115, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(13n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array([118, 99, 45, 100, 101, 109, 111, 58, 110, 111, 45, 99, 97, 112, 97, 98, 105, 108, 105, 116, 121, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(14n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_13, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_3, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_49, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_39, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_48, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_19, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_21, value_0);
    return result_0;
  }
  _persistentHash_6(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_12, value_0);
    return result_0;
  }
  _persistentHash_7(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_47, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_20,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_1(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_2,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _upgradeFromTransient_0(x_0) {
    const result_0 = __compactRuntime.upgradeFromTransient(x_0);
    return result_0;
  }
  _jubjubPointX_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointX(np_0);
    return result_0;
  }
  _jubjubPointY_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointY(np_0);
    return result_0;
  }
  _ecAdd_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecAdd(a_0, b_0);
    return result_0;
  }
  _ecMul_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecMul(a_0, b_0);
    return result_0;
  }
  _ecMulGenerator_0(b_0) {
    const result_0 = __compactRuntime.ecMulGenerator(b_0);
    return result_0;
  }
  _noSchemaFamilyResolverHint_0() {
    return new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 115, 99, 104, 101, 109, 97, 58, 110, 111, 45, 104, 105, 110, 116, 0, 0, 0, 0, 0, 0]);
  }
  _assertValidSchemaRef_0(schema_0) {
    __compactRuntime.assert(!this._equal_0(schema_0.packageId,
                                           new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Schema package id must be set');
    __compactRuntime.assert(!this._equal_1(schema_0.schemaId,
                                           new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Schema id must be set');
    let t_0;
    __compactRuntime.assert((t_0 = schema_0.majorVersion, t_0 > 0n),
                            'Schema major version must be positive');
    return [];
  }
  _assertValidSchemaCapabilities_0(capabilities_0) { return []; }
  _assertValidSchemaFamilyResolutionHint_0(hint_0) {
    const noHint_0 = this._noSchemaFamilyResolverHint_0();
    if (hint_0.hasResolverHint) {
      __compactRuntime.assert(!this._equal_2(hint_0.resolverHint, noHint_0),
                              'Schema resolver hint must be set');
      __compactRuntime.assert(!this._equal_3(hint_0.resolverHint,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Schema resolver hint must not be empty');
    } else {
      __compactRuntime.assert(this._equal_4(hint_0.resolverHint, noHint_0),
                              'Absent schema resolver hint must use the no-hint sentinel');
    }
    return [];
  }
  _assertValidSchemaDescriptor_0(descriptor_0) {
    this._assertValidSchemaRef_0(descriptor_0.schema);
    this._assertValidSchemaCapabilities_0(descriptor_0.capabilities);
    this._assertValidSchemaFamilyResolutionHint_0(descriptor_0.familyResolutionHint);
    return [];
  }
  _assertMatchingSchemaCapabilities_0(expected_0, actual_0) {
    __compactRuntime.assert(expected_0.supportsSelectiveDisclosure
                            ===
                            actual_0.supportsSelectiveDisclosure
                            &&
                            expected_0.supportsPredicateProofs
                            ===
                            actual_0.supportsPredicateProofs
                            &&
                            expected_0.supportsVerifierScopedPseudonym
                            ===
                            actual_0.supportsVerifierScopedPseudonym
                            &&
                            expected_0.supportsSameHolderProof
                            ===
                            actual_0.supportsSameHolderProof,
                            'Schema capabilities mismatch');
    return [];
  }
  _verifySignature_0(pk_0, signature_0, challenge_0) {
    const leftSide_0 = this._ecMulGenerator_0(signature_0.s);
    const cPk_0 = this._ecMul_0(pk_0, challenge_0);
    const rightSide_0 = this._ecAdd_0(signature_0.r, cPk_0);
    const xMatches_0 = this._jubjubPointX_0(leftSide_0)
                       ===
                       this._jubjubPointX_0(rightSide_0);
    const yMatches_0 = this._jubjubPointY_0(leftSide_0)
                       ===
                       this._jubjubPointY_0(rightSide_0);
    __compactRuntime.assert(xMatches_0 && yMatches_0,
                            'Signature verification failed');
    return xMatches_0 && yMatches_0;
  }
  _issuanceContextTag_0() {
    return new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 105, 115, 115, 117, 97, 110, 99, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _presentationContextTag_0() {
    return new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 112, 114, 101, 115, 101, 110, 116, 97, 116, 105, 111, 110, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _proofPayloadRootForContext_0(bodyRoot_0, contextTag_0, proof_0) {
    return this._persistentHash_3([bodyRoot_0,
                                   contextTag_0,
                                   this._persistentHash_0(proof_0.signerVerificationMethodRef),
                                   this._upgradeFromTransient_0(this._transientHash_1(proof_0.createdAt)),
                                   proof_0.challengeHash]);
  }
  _proofChallengeForContext_0(bodyRoot_0, contextTag_0, proof_0) {
    return this._degradeToTransient_0(this._persistentHash_1([this._proofPayloadRootForContext_0(bodyRoot_0,
                                                                                                 contextTag_0,
                                                                                                 proof_0),
                                                              this._upgradeFromTransient_0(this._transientHash_0(proof_0.publicKey)),
                                                              this._upgradeFromTransient_0(this._transientHash_0(proof_0.signature.r))]));
  }
  _assertValidProofForContext_0(bodyRoot_0, contextTag_0, proof_0) {
    __compactRuntime.assert(this._verifySignature_0(proof_0.publicKey,
                                                    proof_0.signature,
                                                    this._proofChallengeForContext_0(bodyRoot_0,
                                                                                     contextTag_0,
                                                                                     proof_0)),
                            'Proof verification failed');
    return [];
  }
  _issuanceProofPayloadRoot_0(bodyRoot_0, proof_0) {
    return this._proofPayloadRootForContext_0(bodyRoot_0,
                                              this._issuanceContextTag_0(),
                                              proof_0);
  }
  _presentationProofPayloadRoot_0(bodyRoot_0, proof_0) {
    return this._proofPayloadRootForContext_0(bodyRoot_0,
                                              this._presentationContextTag_0(),
                                              proof_0);
  }
  _issuanceProofChallenge_0(bodyRoot_0, proof_0) {
    return this._proofChallengeForContext_0(bodyRoot_0,
                                            this._issuanceContextTag_0(),
                                            proof_0);
  }
  _presentationProofChallenge_0(bodyRoot_0, proof_0) {
    return this._proofChallengeForContext_0(bodyRoot_0,
                                            this._presentationContextTag_0(),
                                            proof_0);
  }
  _assertValidIssuanceContextProof_0(bodyRoot_0, proof_0) {
    this._assertValidProofForContext_0(bodyRoot_0,
                                       this._issuanceContextTag_0(),
                                       proof_0);
    return [];
  }
  _assertValidPresentationContextProof_0(bodyRoot_0, proof_0) {
    this._assertValidProofForContext_0(bodyRoot_0,
                                       this._presentationContextTag_0(),
                                       proof_0);
    return [];
  }
  _credentialBodyRoot_0(credential_0) {
    return this._persistentHash_6(credential_0);
  }
  _assertValidCredentialEnvelope_0(credential_0, expectedClaimRoot_0) {
    __compactRuntime.assert(this._equal_5(credential_0.version, 1n),
                            'Credential version mismatch');
    __compactRuntime.assert(this._equal_6(credential_0.claimRoot,
                                          expectedClaimRoot_0),
                            'Credential claim root mismatch');
    if (credential_0.hasExpiration) {
      let t_0;
      __compactRuntime.assert((t_0 = credential_0.expiresAt,
                               t_0 >= credential_0.issuedAt),
                              'Expiration must not precede issuance');
    }
    return [];
  }
  _assertValidCredentialProof_0(credential_0, proof_0) {
    const bodyRoot_0 = this._credentialBodyRoot_0(credential_0);
    this._assertValidCredentialProofForBodyRoot_0(credential_0,
                                                  proof_0,
                                                  bodyRoot_0);
    return [];
  }
  _assertValidCredentialProofForBodyRoot_0(credential_0, proof_0, bodyRoot_0) {
    __compactRuntime.assert(this._equal_7(credential_0.issuerVerificationMethodRef.didContractAddress,
                                          proof_0.signerVerificationMethodRef.didContractAddress),
                            'Issuer proof contract address does not match issuer verification method');
    __compactRuntime.assert(this._equal_8(credential_0.issuerVerificationMethodRef.methodId,
                                          proof_0.signerVerificationMethodRef.methodId),
                            'Issuer proof method reference does not match issuer verification method');
    this._assertValidIssuanceContextProof_0(bodyRoot_0, proof_0);
    return [];
  }
  _presentationBodyRoot_0(presentation_0) {
    return this._persistentHash_4(presentation_0);
  }
  _assertValidPresentationEnvelope_0(presentation_0) {
    __compactRuntime.assert(this._equal_9(presentation_0.version, 1n),
                            'Presentation version mismatch');
    return [];
  }
  _assertMatchingCredentialPresentation_0(credential_0, presentation_0) {
    __compactRuntime.assert(this._equal_10(presentation_0.credentialClaimRoot,
                                           credential_0.claimRoot),
                            'Presentation must reference the credential claim root');
    __compactRuntime.assert(this._equal_11(presentation_0.issuerVerificationMethodRef.didContractAddress,
                                           credential_0.issuerVerificationMethodRef.didContractAddress),
                            'Presentation issuer contract does not match credential issuer');
    __compactRuntime.assert(this._equal_12(presentation_0.issuerVerificationMethodRef.methodId,
                                           credential_0.issuerVerificationMethodRef.methodId),
                            'Presentation issuer method reference does not match credential issuer');
    return [];
  }
  _assertValidExplicitHolderBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_13(binding_0.holderVerificationMethodRef.didContractAddress.bytes,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Explicit holder binding DID contract address must be set');
    __compactRuntime.assert(!this._equal_14(binding_0.holderVerificationMethodRef.methodId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Explicit holder binding method reference must be set');
    return [];
  }
  _assertMatchingExplicitHolderBindings_0(credentialBinding_0,
                                          presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_15(presentationBinding_0.holderVerificationMethodRef.didContractAddress,
                                           credentialBinding_0.holderVerificationMethodRef.didContractAddress),
                            'Presentation holder contract does not match credential holder binding');
    __compactRuntime.assert(this._equal_16(presentationBinding_0.holderVerificationMethodRef.methodId,
                                           credentialBinding_0.holderVerificationMethodRef.methodId),
                            'Presentation holder method reference does not match credential holder binding');
    return [];
  }
  _assertProofMatchesExplicitHolderBinding_0(binding_0, presentationProof_0) {
    __compactRuntime.assert(this._equal_17(binding_0.holderVerificationMethodRef.didContractAddress,
                                           presentationProof_0.signerVerificationMethodRef.didContractAddress),
                            'Presentation proof signer must match holder binding');
    __compactRuntime.assert(this._equal_18(binding_0.holderVerificationMethodRef.methodId,
                                           presentationProof_0.signerVerificationMethodRef.methodId),
                            'Presentation proof signer method reference must match holder binding');
    return [];
  }
  _assertValidJubjubHolderBinding_0(binding_0) {
    __compactRuntime.assert(this._jubjubPointX_0(binding_0.holderPublicKey)
                            !==
                            0n
                            ||
                            this._jubjubPointY_0(binding_0.holderPublicKey)
                            !==
                            0n,
                            'Jubjub holder binding public key must be set');
    return [];
  }
  _assertMatchingJubjubHolderBindings_0(credentialBinding_0,
                                        presentationBinding_0)
  {
    __compactRuntime.assert(this._jubjubPointX_0(presentationBinding_0.holderPublicKey)
                            ===
                            this._jubjubPointX_0(credentialBinding_0.holderPublicKey)
                            &&
                            this._jubjubPointY_0(presentationBinding_0.holderPublicKey)
                            ===
                            this._jubjubPointY_0(credentialBinding_0.holderPublicKey),
                            'Presentation Jubjub holder key does not match the credential holder binding');
    return [];
  }
  _assertProofMatchesJubjubHolderBinding_0(binding_0, presentationProof_0) {
    __compactRuntime.assert(this._jubjubPointX_0(binding_0.holderPublicKey)
                            ===
                            this._jubjubPointX_0(presentationProof_0.publicKey)
                            &&
                            this._jubjubPointY_0(binding_0.holderPublicKey)
                            ===
                            this._jubjubPointY_0(presentationProof_0.publicKey),
                            'Presentation proof public key must match the Jubjub holder binding');
    return [];
  }
  _assertValidOffchainMidnightHolderBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_19(binding_0.holderDidStateHash,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Offchain Midnight holder state hash must be set');
    __compactRuntime.assert(!this._equal_20(binding_0.holderMethodId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Offchain Midnight holder method id must be set');
    const jubjubBinding_0 = { holderPublicKey: binding_0.holderPublicKey };
    this._assertValidJubjubHolderBinding_0(jubjubBinding_0);
    return [];
  }
  _assertMatchingOffchainMidnightHolderBindings_0(credentialBinding_0,
                                                  presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_21(presentationBinding_0.holderDidStateHash,
                                           credentialBinding_0.holderDidStateHash),
                            'Offchain Midnight holder state hash does not match the credential holder binding');
    __compactRuntime.assert(this._equal_22(presentationBinding_0.holderMethodId,
                                           credentialBinding_0.holderMethodId),
                            'Offchain Midnight holder method id does not match the credential holder binding');
    const credentialJubjubBinding_0 = { holderPublicKey:
                                          credentialBinding_0.holderPublicKey };
    const presentationJubjubBinding_0 = { holderPublicKey:
                                            presentationBinding_0.holderPublicKey };
    this._assertMatchingJubjubHolderBindings_0(credentialJubjubBinding_0,
                                               presentationJubjubBinding_0);
    return [];
  }
  _assertProofMatchesOffchainMidnightHolderBinding_0(binding_0,
                                                     presentationProof_0)
  {
    const jubjubBinding_0 = { holderPublicKey: binding_0.holderPublicKey };
    this._assertProofMatchesJubjubHolderBinding_0(jubjubBinding_0,
                                                  presentationProof_0);
    return [];
  }
  _noSecretHolderChallengeResponse_0() {
    return new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 110, 111, 45, 104, 111, 108, 100, 101, 114, 45, 114, 101, 115, 112, 111, 110, 115, 101, 0, 0]);
  }
  _secretHolderBindingCommitment_0(holderSecret_0, opening_0) {
    return this._persistentCommit_1(holderSecret_0, opening_0);
  }
  _secretHolderBindingChallengeResponse_0(holderSecret_0,
                                          verifierChallengeHash_0)
  {
    return this._persistentHash_1([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 111, 108, 100, 101, 114, 45, 99, 104, 97, 108, 108, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   holderSecret_0,
                                   verifierChallengeHash_0]);
  }
  _verifierScopedPseudonym_0(holderSecret_0, verifierDomainHash_0) {
    return this._persistentHash_1([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 111, 108, 100, 101, 114, 45, 112, 115, 101, 117, 100, 111, 110, 121, 109, 0, 0, 0, 0]),
                                   holderSecret_0,
                                   verifierDomainHash_0]);
  }
  _assertVerifierScopedPseudonym_0(pseudonym_0,
                                   holderSecret_0,
                                   verifierDomainHash_0)
  {
    __compactRuntime.assert(this._equal_23(pseudonym_0,
                                           this._verifierScopedPseudonym_0(holderSecret_0,
                                                                           verifierDomainHash_0)),
                            'Verifier-scoped pseudonym does not match the holder secret and verifier domain');
    return [];
  }
  _blindedSecretHolderCommitment_0(holderSecretCommitment_0,
                                   issuerNonce_0,
                                   blindingFactor_0)
  {
    return this._persistentHash_7([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 98, 108, 105, 110, 100, 45, 104, 111, 108, 100, 101, 114, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   holderSecretCommitment_0,
                                   issuerNonce_0,
                                   blindingFactor_0]);
  }
  _assertValidSecretHolderCredentialBinding_0(binding_0) {
    __compactRuntime.assert(this._equal_24(binding_0.requestChallengeResponse,
                                           this._noSecretHolderChallengeResponse_0()),
                            'Credential secret holder binding must not embed a request challenge response');
    return [];
  }
  _assertValidSecretHolderPresentationBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_25(binding_0.requestChallengeResponse,
                                            this._noSecretHolderChallengeResponse_0()),
                            'Presentation secret holder binding must include a request challenge response');
    return [];
  }
  _assertMatchingSecretHolderBindings_0(credentialBinding_0,
                                        presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_26(credentialBinding_0.holderSecretCommitment,
                                           presentationBinding_0.holderSecretCommitment),
                            'Presentation holder secret commitment does not match the credential holder binding');
    return [];
  }
  _assertValidBlindedSecretHolderCredentialBinding_0(binding_0) {
    __compactRuntime.assert(this._equal_27(binding_0.requestChallengeResponse,
                                           this._noSecretHolderChallengeResponse_0()),
                            'Credential blinded holder binding must not embed a request challenge response');
    return [];
  }
  _assertValidBlindedSecretHolderPresentationBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_28(binding_0.requestChallengeResponse,
                                            this._noSecretHolderChallengeResponse_0()),
                            'Presentation blinded holder binding must include a request challenge response');
    return [];
  }
  _assertMatchingBlindedSecretHolderBindings_0(credentialBinding_0,
                                               presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_29(credentialBinding_0.blindedHolderSecretCommitment,
                                           presentationBinding_0.blindedHolderSecretCommitment),
                            'Presentation blinded holder commitment does not match the credential holder binding');
    __compactRuntime.assert(this._equal_30(credentialBinding_0.issuerNonce,
                                           presentationBinding_0.issuerNonce),
                            'Presentation issuer nonce does not match the credential holder binding');
    return [];
  }
  _assertSecretHolderBindingWitness_0(binding_0,
                                      verifierChallengeHash_0,
                                      holderSecret_0,
                                      opening_0)
  {
    __compactRuntime.assert(this._equal_31(this._secretHolderBindingCommitment_0(holderSecret_0,
                                                                                 opening_0),
                                           binding_0.holderSecretCommitment),
                            'Holder secret witness does not match the holder-binding commitment');
    __compactRuntime.assert(this._equal_32(this._secretHolderBindingChallengeResponse_0(holderSecret_0,
                                                                                        verifierChallengeHash_0),
                                           binding_0.requestChallengeResponse),
                            'Holder secret challenge response does not match the verifier challenge');
    return [];
  }
  _assertBlindedSecretHolderBindingWitness_0(binding_0,
                                             verifierChallengeHash_0,
                                             holderSecret_0,
                                             opening_0,
                                             blindingFactor_0)
  {
    const holderCommitment_0 = this._secretHolderBindingCommitment_0(holderSecret_0,
                                                                     opening_0);
    __compactRuntime.assert(this._equal_33(this._blindedSecretHolderCommitment_0(holderCommitment_0,
                                                                                 binding_0.issuerNonce,
                                                                                 blindingFactor_0),
                                           binding_0.blindedHolderSecretCommitment),
                            'Blinded holder commitment does not match the hidden holder secret witness');
    __compactRuntime.assert(this._equal_34(this._secretHolderBindingChallengeResponse_0(holderSecret_0,
                                                                                        verifierChallengeHash_0),
                                           binding_0.requestChallengeResponse),
                            'Blinded holder challenge response does not match the verifier challenge');
    return [];
  }
  _protocolFeaturesAsSchemaCapabilities_0(features_0) {
    return { supportsSelectiveDisclosure: features_0.supportsSelectiveDisclosure,
             supportsPredicateProofs: features_0.supportsPredicateProofs,
             supportsVerifierScopedPseudonym:
               features_0.supportsVerifierScopedPseudonym,
             supportsSameHolderProof: features_0.supportsSameHolderProof };
  }
  _assertProtocolFeaturesMatchSchemaCapabilities_0(features_0, capabilities_0) {
    this._assertMatchingSchemaCapabilities_0(this._protocolFeaturesAsSchemaCapabilities_0(features_0),
                                             capabilities_0);
    return [];
  }
  _noProtocolResponseReference_0() {
    return new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 112, 114, 111, 116, 111, 99, 111, 108, 58, 110, 111, 110, 101, 0, 0, 0, 0, 0, 0, 0]);
  }
  _assertValidVerificationMethodRef_0(verificationMethodRef_0) {
    __compactRuntime.assert(!this._equal_35(verificationMethodRef_0.methodId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Verification method reference must be set');
    return [];
  }
  _assertMatchingSchemaRefs_0(expected_0, actual_0) {
    this._assertValidSchemaRef_0(expected_0);
    this._assertValidSchemaRef_0(actual_0);
    __compactRuntime.assert(this._equal_36(expected_0.packageId,
                                           actual_0.packageId)
                            &&
                            this._equal_37(expected_0.schemaId,
                                           actual_0.schemaId)
                            &&
                            this._equal_38(expected_0.majorVersion,
                                           actual_0.majorVersion)
                            &&
                            this._equal_39(expected_0.minorVersion,
                                           actual_0.minorVersion),
                            'Schema reference mismatch');
    return [];
  }
  _assertValidProtocolMessageEnvelope_0(envelope_0) {
    const noResponse_0 = this._noProtocolResponseReference_0();
    __compactRuntime.assert(this._equal_40(envelope_0.version, 1n),
                            'Protocol message version mismatch');
    __compactRuntime.assert(!this._equal_41(envelope_0.messageId, noResponse_0),
                            'Protocol message id must be set');
    __compactRuntime.assert(!this._equal_42(envelope_0.threadId, noResponse_0),
                            'Protocol thread id must be set');
    if (envelope_0.initialMessage) {
      __compactRuntime.assert(this._equal_43(envelope_0.respondsToMessageId,
                                             noResponse_0),
                              'Initial protocol message must not reference a previous message');
    } else {
      __compactRuntime.assert(!this._equal_44(envelope_0.respondsToMessageId,
                                              noResponse_0),
                              'Protocol response message must reference a previous message');
    }
    if (envelope_0.hasExpiresAt) {
      let t_0;
      __compactRuntime.assert((t_0 = envelope_0.expiresAt,
                               t_0 >= envelope_0.createdAt),
                              'Protocol message expiration must not precede creation');
    }
    return [];
  }
  _assertProtocolResponseEnvelope_0(requestEnvelope_0, responseEnvelope_0) {
    this._assertValidProtocolMessageEnvelope_0(requestEnvelope_0);
    this._assertValidProtocolMessageEnvelope_0(responseEnvelope_0);
    __compactRuntime.assert(!responseEnvelope_0.initialMessage,
                            'Protocol response must not be initial');
    __compactRuntime.assert(this._equal_45(responseEnvelope_0.threadId,
                                           requestEnvelope_0.threadId),
                            'Protocol response thread id does not match the request thread id');
    __compactRuntime.assert(this._equal_46(responseEnvelope_0.respondsToMessageId,
                                           requestEnvelope_0.messageId),
                            'Protocol response does not reference the request message id');
    let t_0;
    __compactRuntime.assert((t_0 = responseEnvelope_0.createdAt,
                             t_0 >= requestEnvelope_0.createdAt),
                            'Protocol response creation time must not precede the request');
    return [];
  }
  _assertValidOfferMessage_0(offer_0) {
    this._assertValidProtocolMessageEnvelope_0(offer_0.envelope);
    __compactRuntime.assert(offer_0.envelope.initialMessage,
                            'Issuance offer must be the initial message');
    this._assertValidVerificationMethodRef_0(offer_0.issuerVerificationMethodRef);
    return [];
  }
  _assertValidRequestMessage_0(request_0) {
    this._assertValidProtocolMessageEnvelope_0(request_0.envelope);
    __compactRuntime.assert(!request_0.envelope.initialMessage,
                            'Issuance request must be a response message');
    this._assertValidVerificationMethodRef_0(request_0.issuerVerificationMethodRef);
    return [];
  }
  _assertOfferRequestAlignment_0(offer_0, request_0) {
    this._assertValidOfferMessage_0(offer_0);
    this._assertValidRequestMessage_0(request_0);
    this._assertProtocolResponseEnvelope_0(offer_0.envelope, request_0.envelope);
    this._assertMatchingSchemaRefs_0(offer_0.schema, request_0.schema);
    __compactRuntime.assert(this._equal_47(offer_0.issuerVerificationMethodRef.didContractAddress,
                                           request_0.issuerVerificationMethodRef.didContractAddress)
                            &&
                            this._equal_48(offer_0.issuerVerificationMethodRef.methodId,
                                           request_0.issuerVerificationMethodRef.methodId),
                            'Issuance request issuer verification method does not match the offer');
    __compactRuntime.assert(offer_0.holderBindingProfile
                            ===
                            request_0.holderBindingProfile,
                            'Issuance request holder binding profile does not match the offer');
    return [];
  }
  _assertValidResultMessage_0(result_0) {
    this._assertValidProtocolMessageEnvelope_0(result_0.envelope);
    __compactRuntime.assert(!result_0.envelope.initialMessage,
                            'Issuance result must be a response message');
    this._assertValidVerificationMethodRef_0(result_0.issuerVerificationMethodRef);
    return [];
  }
  _assertRequestResultAlignment_0(request_0, result_0) {
    this._assertValidRequestMessage_0(request_0);
    this._assertValidResultMessage_0(result_0);
    this._assertProtocolResponseEnvelope_0(request_0.envelope, result_0.envelope);
    this._assertMatchingSchemaRefs_0(request_0.schema, result_0.schema);
    __compactRuntime.assert(this._equal_49(request_0.issuerVerificationMethodRef.didContractAddress,
                                           result_0.issuerVerificationMethodRef.didContractAddress)
                            &&
                            this._equal_50(request_0.issuerVerificationMethodRef.methodId,
                                           result_0.issuerVerificationMethodRef.methodId),
                            'Issuance result issuer verification method does not match the request');
    __compactRuntime.assert(request_0.holderBindingProfile
                            ===
                            result_0.holderBindingProfile,
                            'Issuance result holder binding profile does not match the request');
    return [];
  }
  _assertValidRequestMessage_1(request_0) {
    this._assertValidProtocolMessageEnvelope_0(request_0.envelope);
    __compactRuntime.assert(request_0.envelope.initialMessage,
                            'Presentation request must be the initial message');
    this._assertValidVerificationMethodRef_0(request_0.issuerVerificationMethodRef);
    return [];
  }
  _assertValidSubmissionMessage_0(submission_0) {
    this._assertValidProtocolMessageEnvelope_0(submission_0.envelope);
    __compactRuntime.assert(!submission_0.envelope.initialMessage,
                            'Presentation submission must be a response message');
    this._assertValidVerificationMethodRef_0(submission_0.issuerVerificationMethodRef);
    return [];
  }
  _assertRequestSubmissionAlignment_0(request_0, submission_0) {
    this._assertValidRequestMessage_1(request_0);
    this._assertValidSubmissionMessage_0(submission_0);
    this._assertProtocolResponseEnvelope_0(request_0.envelope,
                                           submission_0.envelope);
    this._assertMatchingSchemaRefs_0(request_0.schema, submission_0.schema);
    __compactRuntime.assert(this._equal_51(request_0.issuerVerificationMethodRef.didContractAddress,
                                           submission_0.issuerVerificationMethodRef.didContractAddress)
                            &&
                            this._equal_52(request_0.issuerVerificationMethodRef.methodId,
                                           submission_0.issuerVerificationMethodRef.methodId),
                            'Presentation submission issuer verification method does not match the request');
    __compactRuntime.assert(request_0.holderBindingProfile
                            ===
                            submission_0.holderBindingProfile,
                            'Presentation submission holder binding profile does not match the request');
    __compactRuntime.assert(this._equal_53(request_0.verifierChallengeHash,
                                           submission_0.challengeHash),
                            'Presentation submission challenge does not match the request challenge');
    return [];
  }
  _assertValidResultMessage_1(result_0) {
    this._assertValidProtocolMessageEnvelope_0(result_0.envelope);
    __compactRuntime.assert(!result_0.envelope.initialMessage,
                            'Presentation result must be a response message');
    return [];
  }
  _assertSubmissionResultAlignment_0(submission_0, result_0) {
    this._assertValidSubmissionMessage_0(submission_0);
    this._assertValidResultMessage_1(result_0);
    this._assertProtocolResponseEnvelope_0(submission_0.envelope,
                                           result_0.envelope);
    return [];
  }
  _assertValidStatusRegistryRef_0(registryRef_0) {
    __compactRuntime.assert(!this._equal_54(registryRef_0.registryId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Status registry id must be set');
    this._assertValidVerificationMethodRef_0(registryRef_0.authorityVerificationMethodRef);
    return [];
  }
  _assertValidNoStatusBinding_0(binding_0) { return []; }
  _assertValidRegistryBoundStatusBinding_0(binding_0) {
    __compactRuntime.assert(binding_0.statusType === 0,
                            'Registry-bound status type must be revocationRegistry');
    this._assertValidStatusRegistryRef_0(binding_0.registryRef);
    __compactRuntime.assert(!this._equal_55(binding_0.statusHandleCommitment,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Status handle commitment must be set');
    return [];
  }
  _registryBoundStatusBindingRoot_0(binding_0) {
    this._assertValidRegistryBoundStatusBinding_0(binding_0);
    return this._persistentHash_2(binding_0);
  }
  _birthCredentialClaimRoot_0(commitments_0) {
    return this._persistentHash_3([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 98, 105, 114, 116, 104, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   commitments_0.subjectIdCommitment,
                                   commitments_0.legalNameCommitment,
                                   commitments_0.birthDateCommitment,
                                   commitments_0.birthCountryCodeCommitment]);
  }
  _subjectIdCommitment_0(subjectId_0, opening_0) {
    return this._persistentCommit_1(subjectId_0, opening_0);
  }
  _birthDateCommitment_0(birthDateDays_0, opening_0) {
    return this._persistentCommit_0(birthDateDays_0, opening_0);
  }
  _legalNameCommitment_0(legalNamePadded_0, opening_0) {
    return this._persistentCommit_1(legalNamePadded_0, opening_0);
  }
  _birthCountryCodeCommitment_0(birthCountryCodePadded_0, opening_0) {
    return this._persistentCommit_1(birthCountryCodePadded_0, opening_0);
  }
  _birthCredentialBodyRoot_0(credential_0) {
    return this._credentialBodyRoot_0(credential_0);
  }
  _birthCredentialPresentationBodyRoot_0(presentation_0) {
    return this._presentationBodyRoot_0(presentation_0);
  }
  _birthCredentialPresentationRequestBodyRoot_0(request_0) {
    return this._persistentHash_5(request_0);
  }
  _assertValidBirthSchemaRef_0(schema_0) {
    __compactRuntime.assert(this._equal_56(schema_0.packageId,
                                           new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 45, 100, 105, 100, 58, 118, 99, 58, 98, 105, 114, 116, 104, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Unexpected schema package identifier');
    __compactRuntime.assert(this._equal_57(schema_0.schemaId,
                                           new Uint8Array([98, 105, 114, 116, 104, 45, 99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Unexpected schema identifier');
    __compactRuntime.assert(this._equal_58(schema_0.majorVersion, 1n),
                            'Birth credential major version mismatch');
    return [];
  }
  _assertValidBirthCredentialPresentationRequest_0(request_0) {
    __compactRuntime.assert(this._equal_59(request_0.version, 1n),
                            'Presentation request version mismatch');
    this._assertValidBirthSchemaRef_0(request_0.schema);
    this._assertValidVerificationMethodRef_0(request_0.issuerVerificationMethodRef);
    if (request_0.requireAgeOverThreshold) {
      let t_0;
      __compactRuntime.assert((t_0 = request_0.requestedAgeThresholdYears,
                               t_0 > 0n),
                              'Requested age threshold must be positive');
    } else {
      __compactRuntime.assert(this._equal_60(request_0.requestedAgeThresholdYears,
                                             0n),
                              'Requested age threshold must be zero when disabled');
    }
    return [];
  }
  _birthCredentialPresentationRequestFromProtocol_0(request_0) {
    return { version: request_0.envelope.version,
             schema: request_0.schema,
             issuerVerificationMethodRef: request_0.issuerVerificationMethodRef,
             requireSubjectIdCommitmentDisclosure:
               request_0.body.requireSubjectIdCommitmentDisclosure,
             requireBirthCountryDisclosure:
               request_0.body.requireBirthCountryDisclosure,
             requireAgeOverThreshold: request_0.body.requireAgeOverThreshold,
             requestedAgeThresholdYears:
               request_0.body.requestedAgeThresholdYears,
             verifierChallengeHash: request_0.verifierChallengeHash };
  }
  _assertValidBirthCredentialIssuanceOffer_0(offer_0) {
    this._assertValidOfferMessage_0(offer_0);
    this._assertValidBirthSchemaRef_0(offer_0.schema);
    __compactRuntime.assert(offer_0.holderBindingProfile === 0,
                            'Birth credential issuance offer must use explicit DID holder binding');
    if (offer_0.body.supportsExpiration) {
      let t_0;
      __compactRuntime.assert((t_0 = offer_0.body.defaultExpirationDays,
                               t_0 > 0n),
                              'Birth credential issuance offer default expiration must be positive when supported');
    } else {
      __compactRuntime.assert(this._equal_61(offer_0.body.defaultExpirationDays,
                                             0n),
                              'Birth credential issuance offer default expiration must be zero when expiration is disabled');
    }
    return [];
  }
  _assertValidBirthCredentialIssuanceRequest_0(request_0) {
    this._assertValidRequestMessage_0(request_0);
    this._assertValidBirthSchemaRef_0(request_0.schema);
    __compactRuntime.assert(request_0.holderBindingProfile === 0,
                            'Birth credential issuance request must use explicit DID holder binding');
    this._assertValidExplicitHolderBinding_0(request_0.body.holderBinding);
    __compactRuntime.assert(!this._equal_62(request_0.body.holderChallengeHash,
                                            this._noProtocolResponseReference_0()),
                            'Birth credential issuance request holder challenge must be set');
    if (request_0.body.requestExpiration) {
      let t_0;
      __compactRuntime.assert((t_0 = request_0.body.requestedExpirationDays,
                               t_0 > 0n),
                              'Birth credential issuance request expiration days must be positive when requested');
    } else {
      __compactRuntime.assert(this._equal_63(request_0.body.requestedExpirationDays,
                                             0n),
                              'Birth credential issuance request expiration days must be zero when disabled');
    }
    return [];
  }
  _assertBirthCredentialIssuanceRequestMatchesOffer_0(offer_0, request_0) {
    this._assertValidBirthCredentialIssuanceOffer_0(offer_0);
    this._assertValidBirthCredentialIssuanceRequest_0(request_0);
    this._assertOfferRequestAlignment_0(offer_0, request_0);
    if (request_0.body.requestExpiration) {
      __compactRuntime.assert(offer_0.body.supportsExpiration,
                              'Birth credential issuance request cannot require expiration when the offer disables it');
    }
    return [];
  }
  _assertValidBirthCredentialIssuanceResult_0(result_0) {
    this._assertValidResultMessage_0(result_0);
    this._assertValidBirthSchemaRef_0(result_0.schema);
    __compactRuntime.assert(result_0.holderBindingProfile === 0,
                            'Birth credential issuance result must use explicit DID holder binding');
    this._assertValidBirthCredential_0(result_0.body.credential,
                                       result_0.body.credentialProof);
    __compactRuntime.assert(this._equal_64(result_0.body.credentialProof.challengeHash,
                                           result_0.body.issuanceChallengeHash),
                            'Birth credential issuance result challenge must match the issuer proof challenge');
    return [];
  }
  _assertBirthCredentialIssuanceResultMatchesRequest_0(request_0, result_0) {
    this._assertValidBirthCredentialIssuanceRequest_0(request_0);
    this._assertValidBirthCredentialIssuanceResult_0(result_0);
    this._assertRequestResultAlignment_0(request_0, result_0);
    __compactRuntime.assert(this._equal_65(request_0.body.holderChallengeHash,
                                           result_0.body.issuanceChallengeHash),
                            'Birth credential issuance result challenge must match the request challenge');
    this._assertMatchingExplicitHolderBindings_0(request_0.body.holderBinding,
                                                 result_0.body.credential.holderBinding);
    __compactRuntime.assert(this._jubjubPointX_0(request_0.body.holderPublicKey)
                            ===
                            this._jubjubPointX_0(result_0.body.holderPublicKey)
                            &&
                            this._jubjubPointY_0(request_0.body.holderPublicKey)
                            ===
                            this._jubjubPointY_0(result_0.body.holderPublicKey),
                            'Birth credential issuance result holder public key does not match the request');
    return [];
  }
  _assertValidBirthCredentialVerificationRequestMessage_0(request_0) {
    this._assertValidRequestMessage_1(request_0);
    this._assertValidBirthSchemaRef_0(request_0.schema);
    __compactRuntime.assert(request_0.holderBindingProfile === 0,
                            'Birth credential verification request must use explicit DID holder binding');
    this._assertValidBirthCredentialPresentationRequest_0(this._birthCredentialPresentationRequestFromProtocol_0(request_0));
    return [];
  }
  _assertValidBirthCredentialVerificationSubmissionMessage_0(submission_0) {
    this._assertValidSubmissionMessage_0(submission_0);
    this._assertValidBirthSchemaRef_0(submission_0.schema);
    __compactRuntime.assert(submission_0.holderBindingProfile === 0,
                            'Birth credential verification submission must use explicit DID holder binding');
    this._assertValidBirthCredentialPresentation_0(submission_0.body.credential,
                                                   submission_0.body.credentialProof,
                                                   submission_0.body.presentation,
                                                   submission_0.body.presentationProof);
    __compactRuntime.assert(this._equal_66(submission_0.body.presentationProof.challengeHash,
                                           submission_0.challengeHash),
                            'Birth credential verification submission challenge must match the presentation proof challenge');
    return [];
  }
  _assertBirthCredentialVerificationSubmissionMatchesRequest_0(request_0,
                                                               submission_0)
  {
    this._assertValidBirthCredentialVerificationRequestMessage_0(request_0);
    this._assertValidBirthCredentialVerificationSubmissionMessage_0(submission_0);
    this._assertRequestSubmissionAlignment_0(request_0, submission_0);
    this._assertBirthPresentationSatisfiesRequest_0(submission_0.body.credential,
                                                    this._birthCredentialPresentationRequestFromProtocol_0(request_0),
                                                    submission_0.body.presentation,
                                                    submission_0.body.presentationProof);
    return [];
  }
  _assertValidBirthCredentialVerificationResultMessage_0(result_0) {
    this._assertValidResultMessage_1(result_0);
    if (result_0.approved) {
      __compactRuntime.assert(!this._equal_67(result_0.body.credentialRoot,
                                              this._noProtocolResponseReference_0()),
                              'Birth credential verification result must include a credential root when approved');
    }
    return [];
  }
  _assertBirthCredentialVerificationResultMatchesSubmission_0(submission_0,
                                                              result_0)
  {
    this._assertValidBirthCredentialVerificationSubmissionMessage_0(submission_0);
    this._assertValidBirthCredentialVerificationResultMessage_0(result_0);
    this._assertSubmissionResultAlignment_0(submission_0, result_0);
    if (result_0.approved) {
      __compactRuntime.assert(this._equal_68(result_0.body.credentialRoot,
                                             this._birthCredentialBodyRoot_0(submission_0.body.credential)),
                              'Birth credential verification result credential root does not match the submission');
    }
    return [];
  }
  _assertValidBirthCredential_0(credential_0, proof_0) {
    this._assertValidBirthSchemaRef_0(credential_0.schema);
    this._assertValidCredentialEnvelope_0(credential_0,
                                          this._birthCredentialClaimRoot_0(credential_0.claimCommitments));
    this._assertValidNoStatusBinding_0(credential_0.statusBinding);
    this._assertValidExplicitHolderBinding_0(credential_0.holderBinding);
    this._assertValidCredentialProof_0(credential_0, proof_0);
    return [];
  }
  _assertValidBirthCredentialPresentation_0(credential_0,
                                            credentialProof_0,
                                            presentation_0,
                                            presentationProof_0)
  {
    this._assertValidBirthCredential_0(credential_0, credentialProof_0);
    this._assertValidBirthSchemaRef_0(presentation_0.schema);
    this._assertValidPresentationEnvelope_0(presentation_0);
    this._assertMatchingCredentialPresentation_0(credential_0, presentation_0);
    this._assertValidExplicitHolderBinding_0(presentation_0.holderBinding);
    this._assertMatchingExplicitHolderBindings_0(credential_0.holderBinding,
                                                 presentation_0.holderBinding);
    if (presentation_0.disclosed.revealSubjectIdCommitment) {
      __compactRuntime.assert(this._equal_69(presentation_0.disclosed.subjectIdCommitment,
                                             credential_0.claimCommitments.subjectIdCommitment),
                              'Presentation subject commitment does not match the credential');
    }
    if (presentation_0.disclosed.revealBirthCountryCode) {
      __compactRuntime.assert(this._equal_70(this._birthCountryCodeCommitment_0(presentation_0.disclosed.birthCountryCodePadded,
                                                                                presentation_0.disclosed.birthCountryCodeOpening),
                                             credential_0.claimCommitments.birthCountryCodeCommitment),
                              'Presentation birth-country disclosure does not match the credential');
    }
    if (presentation_0.disclosed.proveAgeOverThreshold) {
      let t_0;
      __compactRuntime.assert((t_0 = presentation_0.disclosed.ageThresholdYears,
                               t_0 > 0n),
                              'Age threshold must be positive');
    }
    this._assertProofMatchesExplicitHolderBinding_0(presentation_0.holderBinding,
                                                    presentationProof_0);
    this._assertValidPresentationContextProof_0(this._birthCredentialPresentationBodyRoot_0(presentation_0),
                                                presentationProof_0);
    return [];
  }
  _assertBirthPresentationSatisfiesRequest_0(credential_0,
                                             request_0,
                                             presentation_0,
                                             presentationProof_0)
  {
    this._assertValidBirthCredentialPresentationRequest_0(request_0);
    this._assertValidBirthSchemaRef_0(presentation_0.schema);
    this._assertMatchingSchemaRefs_0(request_0.schema, credential_0.schema);
    this._assertMatchingSchemaRefs_0(request_0.schema, presentation_0.schema);
    __compactRuntime.assert(this._equal_71(request_0.issuerVerificationMethodRef.didContractAddress,
                                           credential_0.issuerVerificationMethodRef.didContractAddress),
                            'Presentation request issuer contract does not match the credential issuer');
    __compactRuntime.assert(this._equal_72(request_0.issuerVerificationMethodRef.methodId,
                                           credential_0.issuerVerificationMethodRef.methodId),
                            'Presentation request issuer method reference does not match the credential issuer');
    __compactRuntime.assert(this._equal_73(presentationProof_0.challengeHash,
                                           request_0.verifierChallengeHash),
                            'Presentation proof challenge does not match the request challenge');
    if (request_0.requireSubjectIdCommitmentDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealSubjectIdCommitment,
                              'Presentation request requires the subject-id commitment disclosure');
    }
    if (request_0.requireBirthCountryDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealBirthCountryCode,
                              'Presentation request requires the birth-country disclosure');
    }
    if (request_0.requireAgeOverThreshold) {
      __compactRuntime.assert(presentation_0.disclosed.proveAgeOverThreshold,
                              'Presentation request requires the age-over-threshold predicate');
      __compactRuntime.assert(this._equal_74(presentation_0.disclosed.ageThresholdYears,
                                             request_0.requestedAgeThresholdYears),
                              'Presentation age threshold does not match the request');
    }
    return [];
  }
  _assertValidBirthCredentialAgePredicate_0(credential_0,
                                            presentation_0,
                                            currentDay_0,
                                            birthDateDays_0,
                                            birthDateOpening_0)
  {
    __compactRuntime.assert(presentation_0.disclosed.proveAgeOverThreshold,
                            'Presentation must request the age-over-threshold predicate');
    __compactRuntime.assert(this._equal_75(this._birthDateCommitment_0(birthDateDays_0,
                                                                       birthDateOpening_0),
                                           credential_0.claimCommitments.birthDateCommitment),
                            'Birth-date witness does not match credential commitment');
    __compactRuntime.assert(currentDay_0 >= birthDateDays_0,
                            'Current day must not precede the birth date witness');
    let t_0;
    __compactRuntime.assert((t_0 = (__compactRuntime.assert(currentDay_0
                                                            >=
                                                            birthDateDays_0,
                                                            'result of subtraction would be negative'),
                                    currentDay_0 - birthDateDays_0),
                             t_0
                             >=
                             presentation_0.disclosed.ageThresholdYears * 365n),
                            'Age predicate does not satisfy the requested threshold');
    return [];
  }
  _holderBirthDateDays_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.holderBirthDateDays(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 4294967295n)) {
      __compactRuntime.typeError('holderBirthDateDays',
                                 'return value',
                                 'demo.compact line 32 char 1',
                                 'Uint<0..4294967296>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_20.toValue(result_0),
      alignment: _descriptor_20.alignment()
    });
    return result_0;
  }
  _holderBirthDateOpening_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.holderBirthDateOpening(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('holderBirthDateOpening',
                                 'return value',
                                 'demo.compact line 33 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _ageGateRequestForPolicy_0(issuerVerificationMethodRef_0,
                             verifierChallengeHash_0,
                             requireBirthCountryDisclosure_0,
                             requestedAgeThresholdYears_0)
  {
    return { version: 1n,
             schema:
               { packageId:
                   new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 45, 100, 105, 100, 58, 118, 99, 58, 98, 105, 114, 116, 104, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                 schemaId:
                   new Uint8Array([98, 105, 114, 116, 104, 45, 99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                 majorVersion: 1n,
                 minorVersion: 0n },
             issuerVerificationMethodRef: issuerVerificationMethodRef_0,
             requireSubjectIdCommitmentDisclosure: false,
             requireBirthCountryDisclosure: requireBirthCountryDisclosure_0,
             requireAgeOverThreshold: true,
             requestedAgeThresholdYears: requestedAgeThresholdYears_0,
             verifierChallengeHash: verifierChallengeHash_0 };
  }
  _ageGateRequest_0(context,
                    partialProofData,
                    issuerVerificationMethodRef_0,
                    verifierChallengeHash_0)
  {
    return this._ageGateRequestForPolicy_0(issuerVerificationMethodRef_0,
                                           verifierChallengeHash_0,
                                           _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                     partialProofData,
                                                                                                     [
                                                                                                      { dup: { n: 0 } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_17.toValue(1n),
                                                                                                                                 alignment: _descriptor_17.alignment() } },
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_17.toValue(2n),
                                                                                                                                 alignment: _descriptor_17.alignment() } }] } },
                                                                                                      { popeq: { cached: false,
                                                                                                                 result: undefined } }]).value),
                                           _descriptor_17.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                      partialProofData,
                                                                                                      [
                                                                                                       { dup: { n: 0 } },
                                                                                                       { idx: { cached: false,
                                                                                                                pushPath: false,
                                                                                                                path: [
                                                                                                                       { tag: 'value',
                                                                                                                         value: { value: _descriptor_17.toValue(1n),
                                                                                                                                  alignment: _descriptor_17.alignment() } },
                                                                                                                       { tag: 'value',
                                                                                                                         value: { value: _descriptor_17.toValue(1n),
                                                                                                                                  alignment: _descriptor_17.alignment() } }] } },
                                                                                                       { popeq: { cached: false,
                                                                                                                  result: undefined } }]).value));
  }
  _ageGateCapability_0(credentialRoot_0,
                       verifierChallengeHash_0,
                       issuanceIndex_0)
  {
    return this._persistentHash_7([new Uint8Array([118, 99, 45, 100, 101, 109, 111, 58, 97, 103, 101, 45, 103, 97, 116, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   credentialRoot_0,
                                   verifierChallengeHash_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        issuanceIndex_0,
                                                                        'demo.compact line 95 char 6')]);
  }
  _issueBirthCredential_0(context,
                          partialProofData,
                          credential_0,
                          credentialProof_0,
                          holderPublicKey_0)
  {
    const credentialRoot_0 = this._birthCredentialBodyRoot_0(credential_0);
    this._assertValidBirthCredential_0(credential_0, credentialProof_0);
    __compactRuntime.assert(!_descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_17.toValue(3n),
                                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(credentialRoot_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Credential has already been issued into the demo contract');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(3n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(credentialRoot_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(4n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(credentialRoot_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(holderPublicKey_0),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(0n),
                                                                  alignment: _descriptor_17.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_0),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _verifyBirthPresentation_0(context,
                             partialProofData,
                             credential_0,
                             credentialProof_0,
                             presentation_0,
                             presentationProof_0,
                             currentDay_0)
  {
    const credentialRoot_0 = this._birthCredentialBodyRoot_0(credential_0);
    const disclosedPresentationProofPublicKey_0 = presentationProof_0.publicKey;
    this._assertValidBirthCredentialPresentation_0(credential_0,
                                                   credentialProof_0,
                                                   presentation_0,
                                                   presentationProof_0);
    __compactRuntime.assert(_descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_17.toValue(1n),
                                                                                                                  alignment: _descriptor_17.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_17.toValue(3n),
                                                                                                                  alignment: _descriptor_17.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(credentialRoot_0),
                                                                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Credential was not issued by the demo contract');
    __compactRuntime.assert(this._jubjubPointX_0(_descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                            partialProofData,
                                                                                                            [
                                                                                                             { dup: { n: 0 } },
                                                                                                             { idx: { cached: false,
                                                                                                                      pushPath: false,
                                                                                                                      path: [
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_17.toValue(1n),
                                                                                                                                        alignment: _descriptor_17.alignment() } },
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_17.toValue(4n),
                                                                                                                                        alignment: _descriptor_17.alignment() } }] } },
                                                                                                             { idx: { cached: false,
                                                                                                                      pushPath: false,
                                                                                                                      path: [
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_2.toValue(credentialRoot_0),
                                                                                                                                        alignment: _descriptor_2.alignment() } }] } },
                                                                                                             { popeq: { cached: false,
                                                                                                                        result: undefined } }]).value))
                            ===
                            this._jubjubPointX_0(disclosedPresentationProofPublicKey_0)
                            &&
                            this._jubjubPointY_0(_descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                            partialProofData,
                                                                                                            [
                                                                                                             { dup: { n: 0 } },
                                                                                                             { idx: { cached: false,
                                                                                                                      pushPath: false,
                                                                                                                      path: [
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_17.toValue(1n),
                                                                                                                                        alignment: _descriptor_17.alignment() } },
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_17.toValue(4n),
                                                                                                                                        alignment: _descriptor_17.alignment() } }] } },
                                                                                                             { idx: { cached: false,
                                                                                                                      pushPath: false,
                                                                                                                      path: [
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_2.toValue(credentialRoot_0),
                                                                                                                                        alignment: _descriptor_2.alignment() } }] } },
                                                                                                             { popeq: { cached: false,
                                                                                                                        result: undefined } }]).value))
                            ===
                            this._jubjubPointY_0(disclosedPresentationProofPublicKey_0),
                            'Issued credential holder key does not match the supplied presentation proof');
    if (credential_0.hasExpiration) {
      __compactRuntime.assert(currentDay_0 <= credential_0.expiresAt,
                              'Credential has expired for the supplied verification day');
    }
    this._assertValidBirthCredentialAgePredicate_0(credential_0,
                                                   presentation_0,
                                                   currentDay_0,
                                                   this._holderBirthDateDays_0(context,
                                                                               partialProofData),
                                                   this._holderBirthDateOpening_0(context,
                                                                                  partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(5n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(credentialRoot_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(6n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_20.toValue(currentDay_0),
                                                                                              alignment: _descriptor_20.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = presentation_0.disclosed.ageThresholdYears;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(7n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(tmp_0),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(0n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_1),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _verifyBirthPresentationForRequest_0(context,
                                       partialProofData,
                                       credential_0,
                                       credentialProof_0,
                                       request_0,
                                       presentation_0,
                                       presentationProof_0,
                                       currentDay_0)
  {
    this._verifyBirthPresentation_0(context,
                                    partialProofData,
                                    credential_0,
                                    credentialProof_0,
                                    presentation_0,
                                    presentationProof_0,
                                    currentDay_0);
    this._assertBirthPresentationSatisfiesRequest_0(credential_0,
                                                    request_0,
                                                    presentation_0,
                                                    presentationProof_0);
    const tmp_0 = request_0.verifierChallengeHash;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(8n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _issueAgeGateCapability_0(context,
                            partialProofData,
                            credential_0,
                            credentialProof_0,
                            presentation_0,
                            presentationProof_0,
                            verifierChallengeHash_0,
                            currentDay_0)
  {
    const request_0 = this._ageGateRequest_0(context,
                                             partialProofData,
                                             credential_0.issuerVerificationMethodRef,
                                             verifierChallengeHash_0);
    const capability_0 = this._ageGateCapability_0(this._birthCredentialBodyRoot_0(credential_0),
                                                   verifierChallengeHash_0,
                                                   _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                             partialProofData,
                                                                                                             [
                                                                                                              { dup: { n: 0 } },
                                                                                                              { idx: { cached: false,
                                                                                                                       pushPath: false,
                                                                                                                       path: [
                                                                                                                              { tag: 'value',
                                                                                                                                value: { value: _descriptor_17.toValue(1n),
                                                                                                                                         alignment: _descriptor_17.alignment() } },
                                                                                                                              { tag: 'value',
                                                                                                                                value: { value: _descriptor_17.toValue(9n),
                                                                                                                                         alignment: _descriptor_17.alignment() } }] } },
                                                                                                              { popeq: { cached: true,
                                                                                                                         result: undefined } }]).value));
    this._verifyBirthPresentationForRequest_0(context,
                                              partialProofData,
                                              credential_0,
                                              credentialProof_0,
                                              request_0,
                                              presentation_0,
                                              presentationProof_0,
                                              currentDay_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(11n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(capability_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(9n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_0),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(13n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(capability_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_17.toValue(1n),
                                                                  alignment: _descriptor_17.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(14n),
                                                                                              alignment: _descriptor_17.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return capability_0;
  }
  _claimAgeGateCapability_0(context, partialProofData, capability_0) {
    const disclosedCapability_0 = capability_0;
    if (_descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                  partialProofData,
                                                                  [
                                                                   { dup: { n: 0 } },
                                                                   { idx: { cached: false,
                                                                            pushPath: false,
                                                                            path: [
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_17.toValue(1n),
                                                                                              alignment: _descriptor_17.alignment() } },
                                                                                   { tag: 'value',
                                                                                     value: { value: _descriptor_17.toValue(11n),
                                                                                              alignment: _descriptor_17.alignment() } }] } },
                                                                   { push: { storage: false,
                                                                             value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(disclosedCapability_0),
                                                                                                                          alignment: _descriptor_2.alignment() }).encode() } },
                                                                   'member',
                                                                   { popeq: { cached: true,
                                                                              result: undefined } }]).value))
    {
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(1n),
                                                                    alignment: _descriptor_17.alignment() } },
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(11n),
                                                                    alignment: _descriptor_17.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(disclosedCapability_0),
                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                         { rem: { cached: false } },
                                         { ins: { cached: true, n: 2 } }]);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(1n),
                                                                    alignment: _descriptor_17.alignment() } },
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(12n),
                                                                    alignment: _descriptor_17.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(disclosedCapability_0),
                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newNull().encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 2 } }]);
      const tmp_0 = 1n;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(1n),
                                                                    alignment: _descriptor_17.alignment() } },
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(10n),
                                                                    alignment: _descriptor_17.alignment() } }] } },
                                         { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                                { value: _descriptor_1.toValue(tmp_0),
                                                                  alignment: _descriptor_1.alignment() }
                                                                  .value
                                                              )) } },
                                         { ins: { cached: true, n: 2 } }]);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_17.toValue(1n),
                                                                    alignment: _descriptor_17.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(14n),
                                                                                                alignment: _descriptor_17.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(1),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
      return 1;
    } else {
      if (_descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_17.toValue(1n),
                                                                                                alignment: _descriptor_17.alignment() } },
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_17.toValue(12n),
                                                                                                alignment: _descriptor_17.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(disclosedCapability_0),
                                                                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value))
      {
        __compactRuntime.queryLedgerState(context,
                                          partialProofData,
                                          [
                                           { idx: { cached: false,
                                                    pushPath: true,
                                                    path: [
                                                           { tag: 'value',
                                                             value: { value: _descriptor_17.toValue(1n),
                                                                      alignment: _descriptor_17.alignment() } }] } },
                                           { push: { storage: false,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(14n),
                                                                                                  alignment: _descriptor_17.alignment() }).encode() } },
                                           { push: { storage: true,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(3),
                                                                                                  alignment: _descriptor_0.alignment() }).encode() } },
                                           { ins: { cached: false, n: 1 } },
                                           { ins: { cached: true, n: 1 } }]);
        return 3;
      } else {
        __compactRuntime.queryLedgerState(context,
                                          partialProofData,
                                          [
                                           { idx: { cached: false,
                                                    pushPath: true,
                                                    path: [
                                                           { tag: 'value',
                                                             value: { value: _descriptor_17.toValue(1n),
                                                                      alignment: _descriptor_17.alignment() } }] } },
                                           { push: { storage: false,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_17.toValue(14n),
                                                                                                  alignment: _descriptor_17.alignment() }).encode() } },
                                           { push: { storage: true,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(2),
                                                                                                  alignment: _descriptor_0.alignment() }).encode() } },
                                           { ins: { cached: false, n: 1 } },
                                           { ins: { cached: true, n: 1 } }]);
        return 2;
      }
    }
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_12(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_16(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_17(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_18(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_19(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_20(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_21(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_22(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_23(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_24(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_25(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_26(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_27(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_28(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_29(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_30(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_31(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_32(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_33(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_34(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_35(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_36(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_37(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_38(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_39(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_40(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_41(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_42(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_43(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_44(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_45(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_46(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_47(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_48(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_49(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_50(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_51(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_52(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_53(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_54(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_55(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_56(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_57(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_58(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_59(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_60(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_61(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_62(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_63(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_64(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_65(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_66(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_67(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_68(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_69(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_70(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_71(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_72(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_73(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_74(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_75(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get contractVersion() {
      return _descriptor_20.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(0n),
                                                                                                    alignment: _descriptor_17.alignment() } },
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(0n),
                                                                                                    alignment: _descriptor_17.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get issuedCredentialCount() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(0n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get verifiedPresentationCount() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(0n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get minimumAccessAgeYears() {
      return _descriptor_17.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(1n),
                                                                                                    alignment: _descriptor_17.alignment() } },
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(1n),
                                                                                                    alignment: _descriptor_17.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get ageGateRequiresBirthCountryDisclosure() {
      return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(2n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    issuedCredentialClaimRoots: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(3n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(3n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'demo.compact line 19 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(3n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[3];
        return self_0.asMap().keys().map((elem) => _descriptor_2.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    issuedCredentialHolderPublicKeys: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(4n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(4n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'demo.compact line 20 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(4n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'demo.compact line 20 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_17.toValue(1n),
                                                                                                      alignment: _descriptor_17.alignment() } },
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_17.toValue(4n),
                                                                                                      alignment: _descriptor_17.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(key_0),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_13.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get lastVerifiedCredentialRoot() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(5n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedCurrentDay() {
      return _descriptor_20.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(1n),
                                                                                                    alignment: _descriptor_17.alignment() } },
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(6n),
                                                                                                    alignment: _descriptor_17.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get lastVerifiedThresholdYears() {
      return _descriptor_17.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(1n),
                                                                                                    alignment: _descriptor_17.alignment() } },
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_17.toValue(7n),
                                                                                                    alignment: _descriptor_17.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get lastVerifiedRequestChallenge() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(8n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get issuedAccessCapabilityCount() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(9n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get consumedAccessCapabilityCount() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(10n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    activeAccessCapabilities: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(11n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(11n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'demo.compact line 27 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(11n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[11];
        return self_0.asMap().keys().map((elem) => _descriptor_2.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    consumedAccessCapabilities: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(12n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(12n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'demo.compact line 28 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(1n),
                                                                                                     alignment: _descriptor_17.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_17.toValue(12n),
                                                                                                     alignment: _descriptor_17.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[12];
        return self_0.asMap().keys().map((elem) => _descriptor_2.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    get lastIssuedAccessCapability() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(13n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastBusinessDecision() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(1n),
                                                                                                   alignment: _descriptor_17.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_17.toValue(14n),
                                                                                                   alignment: _descriptor_17.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  holderBirthDateDays: (...args) => undefined,
  holderBirthDateOpening: (...args) => undefined
});
export const pureCircuits = {
  noSchemaFamilyResolverHint: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`noSchemaFamilyResolverHint: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._noSchemaFamilyResolverHint_0();
  },
  assertValidSchemaRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidSchemaRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const schema_0 = args_0[0];
    if (!(typeof(schema_0) === 'object' && schema_0.packageId.buffer instanceof ArrayBuffer && schema_0.packageId.BYTES_PER_ELEMENT === 1 && schema_0.packageId.length === 32 && schema_0.schemaId.buffer instanceof ArrayBuffer && schema_0.schemaId.BYTES_PER_ELEMENT === 1 && schema_0.schemaId.length === 32 && typeof(schema_0.majorVersion) === 'bigint' && schema_0.majorVersion >= 0n && schema_0.majorVersion <= 65535n && typeof(schema_0.minorVersion) === 'bigint' && schema_0.minorVersion >= 0n && schema_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertValidSchemaRef',
                                 'argument 1',
                                 'types.compact line 30 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 schema_0)
    }
    return _dummyContract._assertValidSchemaRef_0(schema_0);
  },
  assertValidSchemaCapabilities: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidSchemaCapabilities: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const capabilities_0 = args_0[0];
    if (!(typeof(capabilities_0) === 'object' && typeof(capabilities_0.supportsSelectiveDisclosure) === 'boolean' && typeof(capabilities_0.supportsPredicateProofs) === 'boolean' && typeof(capabilities_0.supportsVerifierScopedPseudonym) === 'boolean' && typeof(capabilities_0.supportsSameHolderProof) === 'boolean')) {
      __compactRuntime.typeError('assertValidSchemaCapabilities',
                                 'argument 1',
                                 'types.compact line 36 char 1',
                                 'struct SchemaCapabilities<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>',
                                 capabilities_0)
    }
    return _dummyContract._assertValidSchemaCapabilities_0(capabilities_0);
  },
  assertValidSchemaFamilyResolutionHint: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidSchemaFamilyResolutionHint: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const hint_0 = args_0[0];
    if (!(typeof(hint_0) === 'object' && typeof(hint_0.hasResolverHint) === 'boolean' && hint_0.resolverHint.buffer instanceof ArrayBuffer && hint_0.resolverHint.BYTES_PER_ELEMENT === 1 && hint_0.resolverHint.length === 32)) {
      __compactRuntime.typeError('assertValidSchemaFamilyResolutionHint',
                                 'argument 1',
                                 'types.compact line 43 char 1',
                                 'struct SchemaFamilyResolutionHint<hasResolverHint: Boolean, resolverHint: Bytes<32>>',
                                 hint_0)
    }
    return _dummyContract._assertValidSchemaFamilyResolutionHint_0(hint_0);
  },
  assertValidSchemaDescriptor: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidSchemaDescriptor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const descriptor_0 = args_0[0];
    if (!(typeof(descriptor_0) === 'object' && typeof(descriptor_0.schema) === 'object' && descriptor_0.schema.packageId.buffer instanceof ArrayBuffer && descriptor_0.schema.packageId.BYTES_PER_ELEMENT === 1 && descriptor_0.schema.packageId.length === 32 && descriptor_0.schema.schemaId.buffer instanceof ArrayBuffer && descriptor_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && descriptor_0.schema.schemaId.length === 32 && typeof(descriptor_0.schema.majorVersion) === 'bigint' && descriptor_0.schema.majorVersion >= 0n && descriptor_0.schema.majorVersion <= 65535n && typeof(descriptor_0.schema.minorVersion) === 'bigint' && descriptor_0.schema.minorVersion >= 0n && descriptor_0.schema.minorVersion <= 65535n && typeof(descriptor_0.capabilities) === 'object' && typeof(descriptor_0.capabilities.supportsSelectiveDisclosure) === 'boolean' && typeof(descriptor_0.capabilities.supportsPredicateProofs) === 'boolean' && typeof(descriptor_0.capabilities.supportsVerifierScopedPseudonym) === 'boolean' && typeof(descriptor_0.capabilities.supportsSameHolderProof) === 'boolean' && typeof(descriptor_0.familyResolutionHint) === 'object' && typeof(descriptor_0.familyResolutionHint.hasResolverHint) === 'boolean' && descriptor_0.familyResolutionHint.resolverHint.buffer instanceof ArrayBuffer && descriptor_0.familyResolutionHint.resolverHint.BYTES_PER_ELEMENT === 1 && descriptor_0.familyResolutionHint.resolverHint.length === 32)) {
      __compactRuntime.typeError('assertValidSchemaDescriptor',
                                 'argument 1',
                                 'types.compact line 61 char 1',
                                 'struct SchemaDescriptor<schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, capabilities: struct SchemaCapabilities<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>, familyResolutionHint: struct SchemaFamilyResolutionHint<hasResolverHint: Boolean, resolverHint: Bytes<32>>>',
                                 descriptor_0)
    }
    return _dummyContract._assertValidSchemaDescriptor_0(descriptor_0);
  },
  assertMatchingSchemaCapabilities: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingSchemaCapabilities: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const expected_0 = args_0[0];
    const actual_0 = args_0[1];
    if (!(typeof(expected_0) === 'object' && typeof(expected_0.supportsSelectiveDisclosure) === 'boolean' && typeof(expected_0.supportsPredicateProofs) === 'boolean' && typeof(expected_0.supportsVerifierScopedPseudonym) === 'boolean' && typeof(expected_0.supportsSameHolderProof) === 'boolean')) {
      __compactRuntime.typeError('assertMatchingSchemaCapabilities',
                                 'argument 1',
                                 'types.compact line 69 char 1',
                                 'struct SchemaCapabilities<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>',
                                 expected_0)
    }
    if (!(typeof(actual_0) === 'object' && typeof(actual_0.supportsSelectiveDisclosure) === 'boolean' && typeof(actual_0.supportsPredicateProofs) === 'boolean' && typeof(actual_0.supportsVerifierScopedPseudonym) === 'boolean' && typeof(actual_0.supportsSameHolderProof) === 'boolean')) {
      __compactRuntime.typeError('assertMatchingSchemaCapabilities',
                                 'argument 2',
                                 'types.compact line 69 char 1',
                                 'struct SchemaCapabilities<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>',
                                 actual_0)
    }
    return _dummyContract._assertMatchingSchemaCapabilities_0(expected_0,
                                                              actual_0);
  },
  verifySignature: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`verifySignature: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const pk_0 = args_0[0];
    const signature_0 = args_0[1];
    const challenge_0 = args_0[2];
    if (!(typeof(signature_0) === 'object' && true && typeof(signature_0.s) === 'bigint' && signature_0.s >= 0 && signature_0.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('verifySignature',
                                 'argument 2',
                                 'proofs.compact line 4 char 1',
                                 'struct Signature<r: Opaque<"JubjubPoint">, s: Field>',
                                 signature_0)
    }
    if (!(typeof(challenge_0) === 'bigint' && challenge_0 >= 0 && challenge_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('verifySignature',
                                 'argument 3',
                                 'proofs.compact line 4 char 1',
                                 'Field',
                                 challenge_0)
    }
    return _dummyContract._verifySignature_0(pk_0, signature_0, challenge_0);
  },
  issuanceContextTag: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`issuanceContextTag: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._issuanceContextTag_0();
  },
  presentationContextTag: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`presentationContextTag: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._presentationContextTag_0();
  },
  issuanceProofPayloadRoot: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`issuanceProofPayloadRoot: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('issuanceProofPayloadRoot',
                                 'argument 1',
                                 'proofs.compact line 76 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('issuanceProofPayloadRoot',
                                 'argument 2',
                                 'proofs.compact line 76 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._issuanceProofPayloadRoot_0(bodyRoot_0, proof_0);
  },
  presentationProofPayloadRoot: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`presentationProofPayloadRoot: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('presentationProofPayloadRoot',
                                 'argument 1',
                                 'proofs.compact line 83 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('presentationProofPayloadRoot',
                                 'argument 2',
                                 'proofs.compact line 83 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._presentationProofPayloadRoot_0(bodyRoot_0, proof_0);
  },
  issuanceProofChallenge: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`issuanceProofChallenge: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('issuanceProofChallenge',
                                 'argument 1',
                                 'proofs.compact line 90 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('issuanceProofChallenge',
                                 'argument 2',
                                 'proofs.compact line 90 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._issuanceProofChallenge_0(bodyRoot_0, proof_0);
  },
  presentationProofChallenge: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`presentationProofChallenge: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('presentationProofChallenge',
                                 'argument 1',
                                 'proofs.compact line 97 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('presentationProofChallenge',
                                 'argument 2',
                                 'proofs.compact line 97 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._presentationProofChallenge_0(bodyRoot_0, proof_0);
  },
  assertValidIssuanceContextProof: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidIssuanceContextProof: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('assertValidIssuanceContextProof',
                                 'argument 1',
                                 'proofs.compact line 110 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidIssuanceContextProof',
                                 'argument 2',
                                 'proofs.compact line 110 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidIssuanceContextProof_0(bodyRoot_0, proof_0);
  },
  assertValidPresentationContextProof: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidPresentationContextProof: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('assertValidPresentationContextProof',
                                 'argument 1',
                                 'proofs.compact line 117 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidPresentationContextProof',
                                 'argument 2',
                                 'proofs.compact line 117 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidPresentationContextProof_0(bodyRoot_0,
                                                                 proof_0);
  },
  assertValidExplicitHolderBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidExplicitHolderBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && typeof(binding_0.holderVerificationMethodRef) === 'object' && typeof(binding_0.holderVerificationMethodRef.didContractAddress) === 'object' && binding_0.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && binding_0.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && binding_0.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && binding_0.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && binding_0.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && binding_0.holderVerificationMethodRef.methodId.length === 32)) {
      __compactRuntime.typeError('assertValidExplicitHolderBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 7 char 1',
                                 'struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>',
                                 binding_0)
    }
    return _dummyContract._assertValidExplicitHolderBinding_0(binding_0);
  },
  assertMatchingExplicitHolderBindings: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingExplicitHolderBindings: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credentialBinding_0 = args_0[0];
    const presentationBinding_0 = args_0[1];
    if (!(typeof(credentialBinding_0) === 'object' && typeof(credentialBinding_0.holderVerificationMethodRef) === 'object' && typeof(credentialBinding_0.holderVerificationMethodRef.didContractAddress) === 'object' && credentialBinding_0.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialBinding_0.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialBinding_0.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialBinding_0.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialBinding_0.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialBinding_0.holderVerificationMethodRef.methodId.length === 32)) {
      __compactRuntime.typeError('assertMatchingExplicitHolderBindings',
                                 'argument 1',
                                 'holder-bindings.compact line 20 char 1',
                                 'struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>',
                                 credentialBinding_0)
    }
    if (!(typeof(presentationBinding_0) === 'object' && typeof(presentationBinding_0.holderVerificationMethodRef) === 'object' && typeof(presentationBinding_0.holderVerificationMethodRef.didContractAddress) === 'object' && presentationBinding_0.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationBinding_0.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationBinding_0.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationBinding_0.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationBinding_0.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationBinding_0.holderVerificationMethodRef.methodId.length === 32)) {
      __compactRuntime.typeError('assertMatchingExplicitHolderBindings',
                                 'argument 2',
                                 'holder-bindings.compact line 20 char 1',
                                 'struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>',
                                 presentationBinding_0)
    }
    return _dummyContract._assertMatchingExplicitHolderBindings_0(credentialBinding_0,
                                                                  presentationBinding_0);
  },
  assertProofMatchesExplicitHolderBinding: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertProofMatchesExplicitHolderBinding: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    const presentationProof_0 = args_0[1];
    if (!(typeof(binding_0) === 'object' && typeof(binding_0.holderVerificationMethodRef) === 'object' && typeof(binding_0.holderVerificationMethodRef.didContractAddress) === 'object' && binding_0.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && binding_0.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && binding_0.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && binding_0.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && binding_0.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && binding_0.holderVerificationMethodRef.methodId.length === 32)) {
      __compactRuntime.typeError('assertProofMatchesExplicitHolderBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 36 char 1',
                                 'struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>',
                                 binding_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertProofMatchesExplicitHolderBinding',
                                 'argument 2',
                                 'holder-bindings.compact line 36 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertProofMatchesExplicitHolderBinding_0(binding_0,
                                                                     presentationProof_0);
  },
  assertValidJubjubHolderBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidJubjubHolderBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && true)) {
      __compactRuntime.typeError('assertValidJubjubHolderBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 52 char 1',
                                 'struct JubjubHolderBinding<holderPublicKey: Opaque<"JubjubPoint">>',
                                 binding_0)
    }
    return _dummyContract._assertValidJubjubHolderBinding_0(binding_0);
  },
  assertMatchingJubjubHolderBindings: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingJubjubHolderBindings: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credentialBinding_0 = args_0[0];
    const presentationBinding_0 = args_0[1];
    if (!(typeof(credentialBinding_0) === 'object' && true)) {
      __compactRuntime.typeError('assertMatchingJubjubHolderBindings',
                                 'argument 1',
                                 'holder-bindings.compact line 67 char 1',
                                 'struct JubjubHolderBinding<holderPublicKey: Opaque<"JubjubPoint">>',
                                 credentialBinding_0)
    }
    if (!(typeof(presentationBinding_0) === 'object' && true)) {
      __compactRuntime.typeError('assertMatchingJubjubHolderBindings',
                                 'argument 2',
                                 'holder-bindings.compact line 67 char 1',
                                 'struct JubjubHolderBinding<holderPublicKey: Opaque<"JubjubPoint">>',
                                 presentationBinding_0)
    }
    return _dummyContract._assertMatchingJubjubHolderBindings_0(credentialBinding_0,
                                                                presentationBinding_0);
  },
  assertProofMatchesJubjubHolderBinding: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertProofMatchesJubjubHolderBinding: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    const presentationProof_0 = args_0[1];
    if (!(typeof(binding_0) === 'object' && true)) {
      __compactRuntime.typeError('assertProofMatchesJubjubHolderBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 80 char 1',
                                 'struct JubjubHolderBinding<holderPublicKey: Opaque<"JubjubPoint">>',
                                 binding_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertProofMatchesJubjubHolderBinding',
                                 'argument 2',
                                 'holder-bindings.compact line 80 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertProofMatchesJubjubHolderBinding_0(binding_0,
                                                                   presentationProof_0);
  },
  assertValidOffchainMidnightHolderBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidOffchainMidnightHolderBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.holderDidStateHash.buffer instanceof ArrayBuffer && binding_0.holderDidStateHash.BYTES_PER_ELEMENT === 1 && binding_0.holderDidStateHash.length === 32 && binding_0.holderMethodId.buffer instanceof ArrayBuffer && binding_0.holderMethodId.BYTES_PER_ELEMENT === 1 && binding_0.holderMethodId.length === 32 && true)) {
      __compactRuntime.typeError('assertValidOffchainMidnightHolderBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 93 char 1',
                                 'struct OffchainMidnightHolderBinding<holderDidStateHash: Bytes<32>, holderMethodId: Bytes<32>, holderPublicKey: Opaque<"JubjubPoint">>',
                                 binding_0)
    }
    return _dummyContract._assertValidOffchainMidnightHolderBinding_0(binding_0);
  },
  assertMatchingOffchainMidnightHolderBindings: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingOffchainMidnightHolderBindings: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credentialBinding_0 = args_0[0];
    const presentationBinding_0 = args_0[1];
    if (!(typeof(credentialBinding_0) === 'object' && credentialBinding_0.holderDidStateHash.buffer instanceof ArrayBuffer && credentialBinding_0.holderDidStateHash.BYTES_PER_ELEMENT === 1 && credentialBinding_0.holderDidStateHash.length === 32 && credentialBinding_0.holderMethodId.buffer instanceof ArrayBuffer && credentialBinding_0.holderMethodId.BYTES_PER_ELEMENT === 1 && credentialBinding_0.holderMethodId.length === 32 && true)) {
      __compactRuntime.typeError('assertMatchingOffchainMidnightHolderBindings',
                                 'argument 1',
                                 'holder-bindings.compact line 114 char 1',
                                 'struct OffchainMidnightHolderBinding<holderDidStateHash: Bytes<32>, holderMethodId: Bytes<32>, holderPublicKey: Opaque<"JubjubPoint">>',
                                 credentialBinding_0)
    }
    if (!(typeof(presentationBinding_0) === 'object' && presentationBinding_0.holderDidStateHash.buffer instanceof ArrayBuffer && presentationBinding_0.holderDidStateHash.BYTES_PER_ELEMENT === 1 && presentationBinding_0.holderDidStateHash.length === 32 && presentationBinding_0.holderMethodId.buffer instanceof ArrayBuffer && presentationBinding_0.holderMethodId.BYTES_PER_ELEMENT === 1 && presentationBinding_0.holderMethodId.length === 32 && true)) {
      __compactRuntime.typeError('assertMatchingOffchainMidnightHolderBindings',
                                 'argument 2',
                                 'holder-bindings.compact line 114 char 1',
                                 'struct OffchainMidnightHolderBinding<holderDidStateHash: Bytes<32>, holderMethodId: Bytes<32>, holderPublicKey: Opaque<"JubjubPoint">>',
                                 presentationBinding_0)
    }
    return _dummyContract._assertMatchingOffchainMidnightHolderBindings_0(credentialBinding_0,
                                                                          presentationBinding_0);
  },
  assertProofMatchesOffchainMidnightHolderBinding: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertProofMatchesOffchainMidnightHolderBinding: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    const presentationProof_0 = args_0[1];
    if (!(typeof(binding_0) === 'object' && binding_0.holderDidStateHash.buffer instanceof ArrayBuffer && binding_0.holderDidStateHash.BYTES_PER_ELEMENT === 1 && binding_0.holderDidStateHash.length === 32 && binding_0.holderMethodId.buffer instanceof ArrayBuffer && binding_0.holderMethodId.BYTES_PER_ELEMENT === 1 && binding_0.holderMethodId.length === 32 && true)) {
      __compactRuntime.typeError('assertProofMatchesOffchainMidnightHolderBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 140 char 1',
                                 'struct OffchainMidnightHolderBinding<holderDidStateHash: Bytes<32>, holderMethodId: Bytes<32>, holderPublicKey: Opaque<"JubjubPoint">>',
                                 binding_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertProofMatchesOffchainMidnightHolderBinding',
                                 'argument 2',
                                 'holder-bindings.compact line 140 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertProofMatchesOffchainMidnightHolderBinding_0(binding_0,
                                                                             presentationProof_0);
  },
  noSecretHolderChallengeResponse: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`noSecretHolderChallengeResponse: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._noSecretHolderChallengeResponse_0();
  },
  secretHolderBindingCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`secretHolderBindingCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const holderSecret_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(holderSecret_0.buffer instanceof ArrayBuffer && holderSecret_0.BYTES_PER_ELEMENT === 1 && holderSecret_0.length === 32)) {
      __compactRuntime.typeError('secretHolderBindingCommitment',
                                 'argument 1',
                                 'holder-bindings.compact line 157 char 1',
                                 'Bytes<32>',
                                 holderSecret_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('secretHolderBindingCommitment',
                                 'argument 2',
                                 'holder-bindings.compact line 157 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._secretHolderBindingCommitment_0(holderSecret_0,
                                                           opening_0);
  },
  secretHolderBindingChallengeResponse: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`secretHolderBindingChallengeResponse: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const holderSecret_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    if (!(holderSecret_0.buffer instanceof ArrayBuffer && holderSecret_0.BYTES_PER_ELEMENT === 1 && holderSecret_0.length === 32)) {
      __compactRuntime.typeError('secretHolderBindingChallengeResponse',
                                 'argument 1',
                                 'holder-bindings.compact line 164 char 1',
                                 'Bytes<32>',
                                 holderSecret_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('secretHolderBindingChallengeResponse',
                                 'argument 2',
                                 'holder-bindings.compact line 164 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    return _dummyContract._secretHolderBindingChallengeResponse_0(holderSecret_0,
                                                                  verifierChallengeHash_0);
  },
  verifierScopedPseudonym: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verifierScopedPseudonym: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const holderSecret_0 = args_0[0];
    const verifierDomainHash_0 = args_0[1];
    if (!(holderSecret_0.buffer instanceof ArrayBuffer && holderSecret_0.BYTES_PER_ELEMENT === 1 && holderSecret_0.length === 32)) {
      __compactRuntime.typeError('verifierScopedPseudonym',
                                 'argument 1',
                                 'holder-bindings.compact line 175 char 1',
                                 'Bytes<32>',
                                 holderSecret_0)
    }
    if (!(verifierDomainHash_0.buffer instanceof ArrayBuffer && verifierDomainHash_0.BYTES_PER_ELEMENT === 1 && verifierDomainHash_0.length === 32)) {
      __compactRuntime.typeError('verifierScopedPseudonym',
                                 'argument 2',
                                 'holder-bindings.compact line 175 char 1',
                                 'Bytes<32>',
                                 verifierDomainHash_0)
    }
    return _dummyContract._verifierScopedPseudonym_0(holderSecret_0,
                                                     verifierDomainHash_0);
  },
  assertVerifierScopedPseudonym: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`assertVerifierScopedPseudonym: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const pseudonym_0 = args_0[0];
    const holderSecret_0 = args_0[1];
    const verifierDomainHash_0 = args_0[2];
    if (!(pseudonym_0.buffer instanceof ArrayBuffer && pseudonym_0.BYTES_PER_ELEMENT === 1 && pseudonym_0.length === 32)) {
      __compactRuntime.typeError('assertVerifierScopedPseudonym',
                                 'argument 1',
                                 'holder-bindings.compact line 186 char 1',
                                 'Bytes<32>',
                                 pseudonym_0)
    }
    if (!(holderSecret_0.buffer instanceof ArrayBuffer && holderSecret_0.BYTES_PER_ELEMENT === 1 && holderSecret_0.length === 32)) {
      __compactRuntime.typeError('assertVerifierScopedPseudonym',
                                 'argument 2',
                                 'holder-bindings.compact line 186 char 1',
                                 'Bytes<32>',
                                 holderSecret_0)
    }
    if (!(verifierDomainHash_0.buffer instanceof ArrayBuffer && verifierDomainHash_0.BYTES_PER_ELEMENT === 1 && verifierDomainHash_0.length === 32)) {
      __compactRuntime.typeError('assertVerifierScopedPseudonym',
                                 'argument 3',
                                 'holder-bindings.compact line 186 char 1',
                                 'Bytes<32>',
                                 verifierDomainHash_0)
    }
    return _dummyContract._assertVerifierScopedPseudonym_0(pseudonym_0,
                                                           holderSecret_0,
                                                           verifierDomainHash_0);
  },
  blindedSecretHolderCommitment: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`blindedSecretHolderCommitment: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const holderSecretCommitment_0 = args_0[0];
    const issuerNonce_0 = args_0[1];
    const blindingFactor_0 = args_0[2];
    if (!(holderSecretCommitment_0.buffer instanceof ArrayBuffer && holderSecretCommitment_0.BYTES_PER_ELEMENT === 1 && holderSecretCommitment_0.length === 32)) {
      __compactRuntime.typeError('blindedSecretHolderCommitment',
                                 'argument 1',
                                 'holder-bindings.compact line 197 char 1',
                                 'Bytes<32>',
                                 holderSecretCommitment_0)
    }
    if (!(issuerNonce_0.buffer instanceof ArrayBuffer && issuerNonce_0.BYTES_PER_ELEMENT === 1 && issuerNonce_0.length === 32)) {
      __compactRuntime.typeError('blindedSecretHolderCommitment',
                                 'argument 2',
                                 'holder-bindings.compact line 197 char 1',
                                 'Bytes<32>',
                                 issuerNonce_0)
    }
    if (!(blindingFactor_0.buffer instanceof ArrayBuffer && blindingFactor_0.BYTES_PER_ELEMENT === 1 && blindingFactor_0.length === 32)) {
      __compactRuntime.typeError('blindedSecretHolderCommitment',
                                 'argument 3',
                                 'holder-bindings.compact line 197 char 1',
                                 'Bytes<32>',
                                 blindingFactor_0)
    }
    return _dummyContract._blindedSecretHolderCommitment_0(holderSecretCommitment_0,
                                                           issuerNonce_0,
                                                           blindingFactor_0);
  },
  assertValidSecretHolderCredentialBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidSecretHolderCredentialBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.holderSecretCommitment.buffer instanceof ArrayBuffer && binding_0.holderSecretCommitment.BYTES_PER_ELEMENT === 1 && binding_0.holderSecretCommitment.length === 32 && binding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && binding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && binding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertValidSecretHolderCredentialBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 213 char 1',
                                 'struct SecretHolderBinding<holderSecretCommitment: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._assertValidSecretHolderCredentialBinding_0(binding_0);
  },
  assertValidSecretHolderPresentationBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidSecretHolderPresentationBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.holderSecretCommitment.buffer instanceof ArrayBuffer && binding_0.holderSecretCommitment.BYTES_PER_ELEMENT === 1 && binding_0.holderSecretCommitment.length === 32 && binding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && binding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && binding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertValidSecretHolderPresentationBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 222 char 1',
                                 'struct SecretHolderBinding<holderSecretCommitment: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._assertValidSecretHolderPresentationBinding_0(binding_0);
  },
  assertMatchingSecretHolderBindings: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingSecretHolderBindings: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credentialBinding_0 = args_0[0];
    const presentationBinding_0 = args_0[1];
    if (!(typeof(credentialBinding_0) === 'object' && credentialBinding_0.holderSecretCommitment.buffer instanceof ArrayBuffer && credentialBinding_0.holderSecretCommitment.BYTES_PER_ELEMENT === 1 && credentialBinding_0.holderSecretCommitment.length === 32 && credentialBinding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && credentialBinding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && credentialBinding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertMatchingSecretHolderBindings',
                                 'argument 1',
                                 'holder-bindings.compact line 231 char 1',
                                 'struct SecretHolderBinding<holderSecretCommitment: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 credentialBinding_0)
    }
    if (!(typeof(presentationBinding_0) === 'object' && presentationBinding_0.holderSecretCommitment.buffer instanceof ArrayBuffer && presentationBinding_0.holderSecretCommitment.BYTES_PER_ELEMENT === 1 && presentationBinding_0.holderSecretCommitment.length === 32 && presentationBinding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && presentationBinding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && presentationBinding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertMatchingSecretHolderBindings',
                                 'argument 2',
                                 'holder-bindings.compact line 231 char 1',
                                 'struct SecretHolderBinding<holderSecretCommitment: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 presentationBinding_0)
    }
    return _dummyContract._assertMatchingSecretHolderBindings_0(credentialBinding_0,
                                                                presentationBinding_0);
  },
  assertValidBlindedSecretHolderCredentialBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBlindedSecretHolderCredentialBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.blindedHolderSecretCommitment.buffer instanceof ArrayBuffer && binding_0.blindedHolderSecretCommitment.BYTES_PER_ELEMENT === 1 && binding_0.blindedHolderSecretCommitment.length === 32 && binding_0.issuerNonce.buffer instanceof ArrayBuffer && binding_0.issuerNonce.BYTES_PER_ELEMENT === 1 && binding_0.issuerNonce.length === 32 && binding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && binding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && binding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertValidBlindedSecretHolderCredentialBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 241 char 1',
                                 'struct BlindedSecretHolderBinding<blindedHolderSecretCommitment: Bytes<32>, issuerNonce: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._assertValidBlindedSecretHolderCredentialBinding_0(binding_0);
  },
  assertValidBlindedSecretHolderPresentationBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBlindedSecretHolderPresentationBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.blindedHolderSecretCommitment.buffer instanceof ArrayBuffer && binding_0.blindedHolderSecretCommitment.BYTES_PER_ELEMENT === 1 && binding_0.blindedHolderSecretCommitment.length === 32 && binding_0.issuerNonce.buffer instanceof ArrayBuffer && binding_0.issuerNonce.BYTES_PER_ELEMENT === 1 && binding_0.issuerNonce.length === 32 && binding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && binding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && binding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertValidBlindedSecretHolderPresentationBinding',
                                 'argument 1',
                                 'holder-bindings.compact line 250 char 1',
                                 'struct BlindedSecretHolderBinding<blindedHolderSecretCommitment: Bytes<32>, issuerNonce: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._assertValidBlindedSecretHolderPresentationBinding_0(binding_0);
  },
  assertMatchingBlindedSecretHolderBindings: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingBlindedSecretHolderBindings: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credentialBinding_0 = args_0[0];
    const presentationBinding_0 = args_0[1];
    if (!(typeof(credentialBinding_0) === 'object' && credentialBinding_0.blindedHolderSecretCommitment.buffer instanceof ArrayBuffer && credentialBinding_0.blindedHolderSecretCommitment.BYTES_PER_ELEMENT === 1 && credentialBinding_0.blindedHolderSecretCommitment.length === 32 && credentialBinding_0.issuerNonce.buffer instanceof ArrayBuffer && credentialBinding_0.issuerNonce.BYTES_PER_ELEMENT === 1 && credentialBinding_0.issuerNonce.length === 32 && credentialBinding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && credentialBinding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && credentialBinding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertMatchingBlindedSecretHolderBindings',
                                 'argument 1',
                                 'holder-bindings.compact line 259 char 1',
                                 'struct BlindedSecretHolderBinding<blindedHolderSecretCommitment: Bytes<32>, issuerNonce: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 credentialBinding_0)
    }
    if (!(typeof(presentationBinding_0) === 'object' && presentationBinding_0.blindedHolderSecretCommitment.buffer instanceof ArrayBuffer && presentationBinding_0.blindedHolderSecretCommitment.BYTES_PER_ELEMENT === 1 && presentationBinding_0.blindedHolderSecretCommitment.length === 32 && presentationBinding_0.issuerNonce.buffer instanceof ArrayBuffer && presentationBinding_0.issuerNonce.BYTES_PER_ELEMENT === 1 && presentationBinding_0.issuerNonce.length === 32 && presentationBinding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && presentationBinding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && presentationBinding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertMatchingBlindedSecretHolderBindings',
                                 'argument 2',
                                 'holder-bindings.compact line 259 char 1',
                                 'struct BlindedSecretHolderBinding<blindedHolderSecretCommitment: Bytes<32>, issuerNonce: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 presentationBinding_0)
    }
    return _dummyContract._assertMatchingBlindedSecretHolderBindings_0(credentialBinding_0,
                                                                       presentationBinding_0);
  },
  assertSecretHolderBindingWitness: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`assertSecretHolderBindingWitness: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    const holderSecret_0 = args_0[2];
    const opening_0 = args_0[3];
    if (!(typeof(binding_0) === 'object' && binding_0.holderSecretCommitment.buffer instanceof ArrayBuffer && binding_0.holderSecretCommitment.BYTES_PER_ELEMENT === 1 && binding_0.holderSecretCommitment.length === 32 && binding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && binding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && binding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertSecretHolderBindingWitness',
                                 'argument 1',
                                 'holder-bindings.compact line 279 char 1',
                                 'struct SecretHolderBinding<holderSecretCommitment: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 binding_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('assertSecretHolderBindingWitness',
                                 'argument 2',
                                 'holder-bindings.compact line 279 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    if (!(holderSecret_0.buffer instanceof ArrayBuffer && holderSecret_0.BYTES_PER_ELEMENT === 1 && holderSecret_0.length === 32)) {
      __compactRuntime.typeError('assertSecretHolderBindingWitness',
                                 'argument 3',
                                 'holder-bindings.compact line 279 char 1',
                                 'Bytes<32>',
                                 holderSecret_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('assertSecretHolderBindingWitness',
                                 'argument 4',
                                 'holder-bindings.compact line 279 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._assertSecretHolderBindingWitness_0(binding_0,
                                                              verifierChallengeHash_0,
                                                              holderSecret_0,
                                                              opening_0);
  },
  assertBlindedSecretHolderBindingWitness: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`assertBlindedSecretHolderBindingWitness: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    const holderSecret_0 = args_0[2];
    const opening_0 = args_0[3];
    const blindingFactor_0 = args_0[4];
    if (!(typeof(binding_0) === 'object' && binding_0.blindedHolderSecretCommitment.buffer instanceof ArrayBuffer && binding_0.blindedHolderSecretCommitment.BYTES_PER_ELEMENT === 1 && binding_0.blindedHolderSecretCommitment.length === 32 && binding_0.issuerNonce.buffer instanceof ArrayBuffer && binding_0.issuerNonce.BYTES_PER_ELEMENT === 1 && binding_0.issuerNonce.length === 32 && binding_0.requestChallengeResponse.buffer instanceof ArrayBuffer && binding_0.requestChallengeResponse.BYTES_PER_ELEMENT === 1 && binding_0.requestChallengeResponse.length === 32)) {
      __compactRuntime.typeError('assertBlindedSecretHolderBindingWitness',
                                 'argument 1',
                                 'holder-bindings.compact line 296 char 1',
                                 'struct BlindedSecretHolderBinding<blindedHolderSecretCommitment: Bytes<32>, issuerNonce: Bytes<32>, requestChallengeResponse: Bytes<32>>',
                                 binding_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('assertBlindedSecretHolderBindingWitness',
                                 'argument 2',
                                 'holder-bindings.compact line 296 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    if (!(holderSecret_0.buffer instanceof ArrayBuffer && holderSecret_0.BYTES_PER_ELEMENT === 1 && holderSecret_0.length === 32)) {
      __compactRuntime.typeError('assertBlindedSecretHolderBindingWitness',
                                 'argument 3',
                                 'holder-bindings.compact line 296 char 1',
                                 'Bytes<32>',
                                 holderSecret_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('assertBlindedSecretHolderBindingWitness',
                                 'argument 4',
                                 'holder-bindings.compact line 296 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    if (!(blindingFactor_0.buffer instanceof ArrayBuffer && blindingFactor_0.BYTES_PER_ELEMENT === 1 && blindingFactor_0.length === 32)) {
      __compactRuntime.typeError('assertBlindedSecretHolderBindingWitness',
                                 'argument 5',
                                 'holder-bindings.compact line 296 char 1',
                                 'Bytes<32>',
                                 blindingFactor_0)
    }
    return _dummyContract._assertBlindedSecretHolderBindingWitness_0(binding_0,
                                                                     verifierChallengeHash_0,
                                                                     holderSecret_0,
                                                                     opening_0,
                                                                     blindingFactor_0);
  },
  protocolFeaturesAsSchemaCapabilities: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`protocolFeaturesAsSchemaCapabilities: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const features_0 = args_0[0];
    if (!(typeof(features_0) === 'object' && typeof(features_0.supportsSelectiveDisclosure) === 'boolean' && typeof(features_0.supportsPredicateProofs) === 'boolean' && typeof(features_0.supportsVerifierScopedPseudonym) === 'boolean' && typeof(features_0.supportsSameHolderProof) === 'boolean')) {
      __compactRuntime.typeError('protocolFeaturesAsSchemaCapabilities',
                                 'argument 1',
                                 'protocols.compact line 20 char 1',
                                 'struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>',
                                 features_0)
    }
    return _dummyContract._protocolFeaturesAsSchemaCapabilities_0(features_0);
  },
  assertProtocolFeaturesMatchSchemaCapabilities: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertProtocolFeaturesMatchSchemaCapabilities: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const features_0 = args_0[0];
    const capabilities_0 = args_0[1];
    if (!(typeof(features_0) === 'object' && typeof(features_0.supportsSelectiveDisclosure) === 'boolean' && typeof(features_0.supportsPredicateProofs) === 'boolean' && typeof(features_0.supportsVerifierScopedPseudonym) === 'boolean' && typeof(features_0.supportsSameHolderProof) === 'boolean')) {
      __compactRuntime.typeError('assertProtocolFeaturesMatchSchemaCapabilities',
                                 'argument 1',
                                 'protocols.compact line 31 char 1',
                                 'struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>',
                                 features_0)
    }
    if (!(typeof(capabilities_0) === 'object' && typeof(capabilities_0.supportsSelectiveDisclosure) === 'boolean' && typeof(capabilities_0.supportsPredicateProofs) === 'boolean' && typeof(capabilities_0.supportsVerifierScopedPseudonym) === 'boolean' && typeof(capabilities_0.supportsSameHolderProof) === 'boolean')) {
      __compactRuntime.typeError('assertProtocolFeaturesMatchSchemaCapabilities',
                                 'argument 2',
                                 'protocols.compact line 31 char 1',
                                 'struct SchemaCapabilities<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>',
                                 capabilities_0)
    }
    return _dummyContract._assertProtocolFeaturesMatchSchemaCapabilities_0(features_0,
                                                                           capabilities_0);
  },
  noProtocolResponseReference: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`noProtocolResponseReference: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._noProtocolResponseReference_0();
  },
  assertValidVerificationMethodRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidVerificationMethodRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const verificationMethodRef_0 = args_0[0];
    if (!(typeof(verificationMethodRef_0) === 'object' && typeof(verificationMethodRef_0.didContractAddress) === 'object' && verificationMethodRef_0.didContractAddress.bytes.buffer instanceof ArrayBuffer && verificationMethodRef_0.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && verificationMethodRef_0.didContractAddress.bytes.length === 32 && verificationMethodRef_0.methodId.buffer instanceof ArrayBuffer && verificationMethodRef_0.methodId.BYTES_PER_ELEMENT === 1 && verificationMethodRef_0.methodId.length === 32)) {
      __compactRuntime.typeError('assertValidVerificationMethodRef',
                                 'argument 1',
                                 'protocols.compact line 56 char 1',
                                 'struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>',
                                 verificationMethodRef_0)
    }
    return _dummyContract._assertValidVerificationMethodRef_0(verificationMethodRef_0);
  },
  assertMatchingSchemaRefs: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertMatchingSchemaRefs: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const expected_0 = args_0[0];
    const actual_0 = args_0[1];
    if (!(typeof(expected_0) === 'object' && expected_0.packageId.buffer instanceof ArrayBuffer && expected_0.packageId.BYTES_PER_ELEMENT === 1 && expected_0.packageId.length === 32 && expected_0.schemaId.buffer instanceof ArrayBuffer && expected_0.schemaId.BYTES_PER_ELEMENT === 1 && expected_0.schemaId.length === 32 && typeof(expected_0.majorVersion) === 'bigint' && expected_0.majorVersion >= 0n && expected_0.majorVersion <= 65535n && typeof(expected_0.minorVersion) === 'bigint' && expected_0.minorVersion >= 0n && expected_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertMatchingSchemaRefs',
                                 'argument 1',
                                 'protocols.compact line 65 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 expected_0)
    }
    if (!(typeof(actual_0) === 'object' && actual_0.packageId.buffer instanceof ArrayBuffer && actual_0.packageId.BYTES_PER_ELEMENT === 1 && actual_0.packageId.length === 32 && actual_0.schemaId.buffer instanceof ArrayBuffer && actual_0.schemaId.BYTES_PER_ELEMENT === 1 && actual_0.schemaId.length === 32 && typeof(actual_0.majorVersion) === 'bigint' && actual_0.majorVersion >= 0n && actual_0.majorVersion <= 65535n && typeof(actual_0.minorVersion) === 'bigint' && actual_0.minorVersion >= 0n && actual_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertMatchingSchemaRefs',
                                 'argument 2',
                                 'protocols.compact line 65 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 actual_0)
    }
    return _dummyContract._assertMatchingSchemaRefs_0(expected_0, actual_0);
  },
  assertValidProtocolMessageEnvelope: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidProtocolMessageEnvelope: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const envelope_0 = args_0[0];
    if (!(typeof(envelope_0) === 'object' && typeof(envelope_0.version) === 'bigint' && envelope_0.version >= 0n && envelope_0.version <= 65535n && envelope_0.messageId.buffer instanceof ArrayBuffer && envelope_0.messageId.BYTES_PER_ELEMENT === 1 && envelope_0.messageId.length === 32 && envelope_0.threadId.buffer instanceof ArrayBuffer && envelope_0.threadId.BYTES_PER_ELEMENT === 1 && envelope_0.threadId.length === 32 && typeof(envelope_0.initialMessage) === 'boolean' && envelope_0.respondsToMessageId.buffer instanceof ArrayBuffer && envelope_0.respondsToMessageId.BYTES_PER_ELEMENT === 1 && envelope_0.respondsToMessageId.length === 32 && typeof(envelope_0.createdAt) === 'bigint' && envelope_0.createdAt >= 0n && envelope_0.createdAt <= 18446744073709551615n && typeof(envelope_0.hasExpiresAt) === 'boolean' && typeof(envelope_0.expiresAt) === 'bigint' && envelope_0.expiresAt >= 0n && envelope_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('assertValidProtocolMessageEnvelope',
                                 'argument 1',
                                 'protocols.compact line 80 char 1',
                                 'struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>',
                                 envelope_0)
    }
    return _dummyContract._assertValidProtocolMessageEnvelope_0(envelope_0);
  },
  assertProtocolResponseEnvelope: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertProtocolResponseEnvelope: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const requestEnvelope_0 = args_0[0];
    const responseEnvelope_0 = args_0[1];
    if (!(typeof(requestEnvelope_0) === 'object' && typeof(requestEnvelope_0.version) === 'bigint' && requestEnvelope_0.version >= 0n && requestEnvelope_0.version <= 65535n && requestEnvelope_0.messageId.buffer instanceof ArrayBuffer && requestEnvelope_0.messageId.BYTES_PER_ELEMENT === 1 && requestEnvelope_0.messageId.length === 32 && requestEnvelope_0.threadId.buffer instanceof ArrayBuffer && requestEnvelope_0.threadId.BYTES_PER_ELEMENT === 1 && requestEnvelope_0.threadId.length === 32 && typeof(requestEnvelope_0.initialMessage) === 'boolean' && requestEnvelope_0.respondsToMessageId.buffer instanceof ArrayBuffer && requestEnvelope_0.respondsToMessageId.BYTES_PER_ELEMENT === 1 && requestEnvelope_0.respondsToMessageId.length === 32 && typeof(requestEnvelope_0.createdAt) === 'bigint' && requestEnvelope_0.createdAt >= 0n && requestEnvelope_0.createdAt <= 18446744073709551615n && typeof(requestEnvelope_0.hasExpiresAt) === 'boolean' && typeof(requestEnvelope_0.expiresAt) === 'bigint' && requestEnvelope_0.expiresAt >= 0n && requestEnvelope_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('assertProtocolResponseEnvelope',
                                 'argument 1',
                                 'protocols.compact line 106 char 1',
                                 'struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>',
                                 requestEnvelope_0)
    }
    if (!(typeof(responseEnvelope_0) === 'object' && typeof(responseEnvelope_0.version) === 'bigint' && responseEnvelope_0.version >= 0n && responseEnvelope_0.version <= 65535n && responseEnvelope_0.messageId.buffer instanceof ArrayBuffer && responseEnvelope_0.messageId.BYTES_PER_ELEMENT === 1 && responseEnvelope_0.messageId.length === 32 && responseEnvelope_0.threadId.buffer instanceof ArrayBuffer && responseEnvelope_0.threadId.BYTES_PER_ELEMENT === 1 && responseEnvelope_0.threadId.length === 32 && typeof(responseEnvelope_0.initialMessage) === 'boolean' && responseEnvelope_0.respondsToMessageId.buffer instanceof ArrayBuffer && responseEnvelope_0.respondsToMessageId.BYTES_PER_ELEMENT === 1 && responseEnvelope_0.respondsToMessageId.length === 32 && typeof(responseEnvelope_0.createdAt) === 'bigint' && responseEnvelope_0.createdAt >= 0n && responseEnvelope_0.createdAt <= 18446744073709551615n && typeof(responseEnvelope_0.hasExpiresAt) === 'boolean' && typeof(responseEnvelope_0.expiresAt) === 'bigint' && responseEnvelope_0.expiresAt >= 0n && responseEnvelope_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('assertProtocolResponseEnvelope',
                                 'argument 2',
                                 'protocols.compact line 106 char 1',
                                 'struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>',
                                 responseEnvelope_0)
    }
    return _dummyContract._assertProtocolResponseEnvelope_0(requestEnvelope_0,
                                                            responseEnvelope_0);
  },
  assertValidStatusRegistryRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidStatusRegistryRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const registryRef_0 = args_0[0];
    if (!(typeof(registryRef_0) === 'object' && registryRef_0.registryId.buffer instanceof ArrayBuffer && registryRef_0.registryId.BYTES_PER_ELEMENT === 1 && registryRef_0.registryId.length === 32 && typeof(registryRef_0.authorityVerificationMethodRef) === 'object' && typeof(registryRef_0.authorityVerificationMethodRef.didContractAddress) === 'object' && registryRef_0.authorityVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && registryRef_0.authorityVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && registryRef_0.authorityVerificationMethodRef.didContractAddress.bytes.length === 32 && registryRef_0.authorityVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && registryRef_0.authorityVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && registryRef_0.authorityVerificationMethodRef.methodId.length === 32)) {
      __compactRuntime.typeError('assertValidStatusRegistryRef',
                                 'argument 1',
                                 'status-bindings.compact line 24 char 1',
                                 'struct StatusRegistryRef<registryId: Bytes<32>, authorityVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>',
                                 registryRef_0)
    }
    return _dummyContract._assertValidStatusRegistryRef_0(registryRef_0);
  },
  assertValidNoStatusBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidNoStatusBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object')) {
      __compactRuntime.typeError('assertValidNoStatusBinding',
                                 'argument 1',
                                 'status-bindings.compact line 34 char 1',
                                 'struct NoStatusBinding<>',
                                 binding_0)
    }
    return _dummyContract._assertValidNoStatusBinding_0(binding_0);
  },
  assertValidRegistryBoundStatusBinding: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidRegistryBoundStatusBinding: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && typeof(binding_0.statusType) === 'number' && binding_0.statusType >= 0 && binding_0.statusType <= 0 && typeof(binding_0.registryRef) === 'object' && binding_0.registryRef.registryId.buffer instanceof ArrayBuffer && binding_0.registryRef.registryId.BYTES_PER_ELEMENT === 1 && binding_0.registryRef.registryId.length === 32 && typeof(binding_0.registryRef.authorityVerificationMethodRef) === 'object' && typeof(binding_0.registryRef.authorityVerificationMethodRef.didContractAddress) === 'object' && binding_0.registryRef.authorityVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && binding_0.registryRef.authorityVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && binding_0.registryRef.authorityVerificationMethodRef.didContractAddress.bytes.length === 32 && binding_0.registryRef.authorityVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && binding_0.registryRef.authorityVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && binding_0.registryRef.authorityVerificationMethodRef.methodId.length === 32 && binding_0.statusHandleCommitment.buffer instanceof ArrayBuffer && binding_0.statusHandleCommitment.BYTES_PER_ELEMENT === 1 && binding_0.statusHandleCommitment.length === 32)) {
      __compactRuntime.typeError('assertValidRegistryBoundStatusBinding',
                                 'argument 1',
                                 'status-bindings.compact line 41 char 1',
                                 'struct RegistryBoundStatusBinding<statusType: Enum<StatusType, revocationRegistry>, registryRef: struct StatusRegistryRef<registryId: Bytes<32>, authorityVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusHandleCommitment: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._assertValidRegistryBoundStatusBinding_0(binding_0);
  },
  registryBoundStatusBindingRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`registryBoundStatusBindingRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && typeof(binding_0.statusType) === 'number' && binding_0.statusType >= 0 && binding_0.statusType <= 0 && typeof(binding_0.registryRef) === 'object' && binding_0.registryRef.registryId.buffer instanceof ArrayBuffer && binding_0.registryRef.registryId.BYTES_PER_ELEMENT === 1 && binding_0.registryRef.registryId.length === 32 && typeof(binding_0.registryRef.authorityVerificationMethodRef) === 'object' && typeof(binding_0.registryRef.authorityVerificationMethodRef.didContractAddress) === 'object' && binding_0.registryRef.authorityVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && binding_0.registryRef.authorityVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && binding_0.registryRef.authorityVerificationMethodRef.didContractAddress.bytes.length === 32 && binding_0.registryRef.authorityVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && binding_0.registryRef.authorityVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && binding_0.registryRef.authorityVerificationMethodRef.methodId.length === 32 && binding_0.statusHandleCommitment.buffer instanceof ArrayBuffer && binding_0.statusHandleCommitment.BYTES_PER_ELEMENT === 1 && binding_0.statusHandleCommitment.length === 32)) {
      __compactRuntime.typeError('registryBoundStatusBindingRoot',
                                 'argument 1',
                                 'status-bindings.compact line 55 char 1',
                                 'struct RegistryBoundStatusBinding<statusType: Enum<StatusType, revocationRegistry>, registryRef: struct StatusRegistryRef<registryId: Bytes<32>, authorityVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusHandleCommitment: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._registryBoundStatusBindingRoot_0(binding_0);
  },
  birthCredentialClaimRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`birthCredentialClaimRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const commitments_0 = args_0[0];
    if (!(typeof(commitments_0) === 'object' && commitments_0.subjectIdCommitment.buffer instanceof ArrayBuffer && commitments_0.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && commitments_0.subjectIdCommitment.length === 32 && commitments_0.legalNameCommitment.buffer instanceof ArrayBuffer && commitments_0.legalNameCommitment.BYTES_PER_ELEMENT === 1 && commitments_0.legalNameCommitment.length === 32 && commitments_0.birthDateCommitment.buffer instanceof ArrayBuffer && commitments_0.birthDateCommitment.BYTES_PER_ELEMENT === 1 && commitments_0.birthDateCommitment.length === 32 && commitments_0.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && commitments_0.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && commitments_0.birthCountryCodeCommitment.length === 32)) {
      __compactRuntime.typeError('birthCredentialClaimRoot',
                                 'argument 1',
                                 'claims.compact line 11 char 1',
                                 'struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>',
                                 commitments_0)
    }
    return _dummyContract._birthCredentialClaimRoot_0(commitments_0);
  },
  subjectIdCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`subjectIdCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const subjectId_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(subjectId_0.buffer instanceof ArrayBuffer && subjectId_0.BYTES_PER_ELEMENT === 1 && subjectId_0.length === 32)) {
      __compactRuntime.typeError('subjectIdCommitment',
                                 'argument 1',
                                 'claims.compact line 26 char 1',
                                 'Bytes<32>',
                                 subjectId_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('subjectIdCommitment',
                                 'argument 2',
                                 'claims.compact line 26 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._subjectIdCommitment_0(subjectId_0, opening_0);
  },
  birthDateCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`birthDateCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const birthDateDays_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(typeof(birthDateDays_0) === 'bigint' && birthDateDays_0 >= 0n && birthDateDays_0 <= 4294967295n)) {
      __compactRuntime.typeError('birthDateCommitment',
                                 'argument 1',
                                 'claims.compact line 33 char 1',
                                 'Uint<0..4294967296>',
                                 birthDateDays_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('birthDateCommitment',
                                 'argument 2',
                                 'claims.compact line 33 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._birthDateCommitment_0(birthDateDays_0, opening_0);
  },
  legalNameCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`legalNameCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const legalNamePadded_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(legalNamePadded_0.buffer instanceof ArrayBuffer && legalNamePadded_0.BYTES_PER_ELEMENT === 1 && legalNamePadded_0.length === 32)) {
      __compactRuntime.typeError('legalNameCommitment',
                                 'argument 1',
                                 'claims.compact line 40 char 1',
                                 'Bytes<32>',
                                 legalNamePadded_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('legalNameCommitment',
                                 'argument 2',
                                 'claims.compact line 40 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._legalNameCommitment_0(legalNamePadded_0, opening_0);
  },
  birthCountryCodeCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`birthCountryCodeCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const birthCountryCodePadded_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(birthCountryCodePadded_0.buffer instanceof ArrayBuffer && birthCountryCodePadded_0.BYTES_PER_ELEMENT === 1 && birthCountryCodePadded_0.length === 32)) {
      __compactRuntime.typeError('birthCountryCodeCommitment',
                                 'argument 1',
                                 'claims.compact line 47 char 1',
                                 'Bytes<32>',
                                 birthCountryCodePadded_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('birthCountryCodeCommitment',
                                 'argument 2',
                                 'claims.compact line 47 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._birthCountryCodeCommitment_0(birthCountryCodePadded_0,
                                                        opening_0);
  },
  birthCredentialBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`birthCredentialBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('birthCredentialBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 4 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    return _dummyContract._birthCredentialBodyRoot_0(credential_0);
  },
  birthCredentialPresentationBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`birthCredentialPresentationBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const presentation_0 = args_0[0];
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
      __compactRuntime.typeError('birthCredentialPresentationBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 8 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                 presentation_0)
    }
    return _dummyContract._birthCredentialPresentationBodyRoot_0(presentation_0);
  },
  birthCredentialPresentationRequestBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`birthCredentialPresentationRequestBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.requireAgeOverThreshold) === 'boolean' && typeof(request_0.requestedAgeThresholdYears) === 'bigint' && request_0.requestedAgeThresholdYears >= 0n && request_0.requestedAgeThresholdYears <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('birthCredentialPresentationRequestBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 14 char 1',
                                 'struct BirthCredentialPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._birthCredentialPresentationRequestBodyRoot_0(request_0);
  },
  assertValidBirthSchemaRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthSchemaRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const schema_0 = args_0[0];
    if (!(typeof(schema_0) === 'object' && schema_0.packageId.buffer instanceof ArrayBuffer && schema_0.packageId.BYTES_PER_ELEMENT === 1 && schema_0.packageId.length === 32 && schema_0.schemaId.buffer instanceof ArrayBuffer && schema_0.schemaId.BYTES_PER_ELEMENT === 1 && schema_0.schemaId.length === 32 && typeof(schema_0.majorVersion) === 'bigint' && schema_0.majorVersion >= 0n && schema_0.majorVersion <= 65535n && typeof(schema_0.minorVersion) === 'bigint' && schema_0.minorVersion >= 0n && schema_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertValidBirthSchemaRef',
                                 'argument 1',
                                 'helpers.compact line 23 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 schema_0)
    }
    return _dummyContract._assertValidBirthSchemaRef_0(schema_0);
  },
  assertValidBirthCredentialPresentationRequest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialPresentationRequest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.requireAgeOverThreshold) === 'boolean' && typeof(request_0.requestedAgeThresholdYears) === 'bigint' && request_0.requestedAgeThresholdYears >= 0n && request_0.requestedAgeThresholdYears <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertValidBirthCredentialPresentationRequest',
                                 'argument 1',
                                 'helpers.compact line 29 char 1',
                                 'struct BirthCredentialPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._assertValidBirthCredentialPresentationRequest_0(request_0);
  },
  birthCredentialPresentationRequestFromProtocol: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`birthCredentialPresentationRequestFromProtocol: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.envelope) === 'object' && typeof(request_0.envelope.version) === 'bigint' && request_0.envelope.version >= 0n && request_0.envelope.version <= 65535n && request_0.envelope.messageId.buffer instanceof ArrayBuffer && request_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.messageId.length === 32 && request_0.envelope.threadId.buffer instanceof ArrayBuffer && request_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && request_0.envelope.threadId.length === 32 && typeof(request_0.envelope.initialMessage) === 'boolean' && request_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && request_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.respondsToMessageId.length === 32 && typeof(request_0.envelope.createdAt) === 'bigint' && request_0.envelope.createdAt >= 0n && request_0.envelope.createdAt <= 18446744073709551615n && typeof(request_0.envelope.hasExpiresAt) === 'boolean' && typeof(request_0.envelope.expiresAt) === 'bigint' && request_0.envelope.expiresAt >= 0n && request_0.envelope.expiresAt <= 18446744073709551615n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.holderBindingProfile) === 'number' && request_0.holderBindingProfile >= 0 && request_0.holderBindingProfile <= 2 && typeof(request_0.features) === 'object' && typeof(request_0.features.supportsSelectiveDisclosure) === 'boolean' && typeof(request_0.features.supportsPredicateProofs) === 'boolean' && typeof(request_0.features.supportsVerifierScopedPseudonym) === 'boolean' && typeof(request_0.features.supportsSameHolderProof) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32 && typeof(request_0.body) === 'object' && typeof(request_0.body.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.body.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.body.requireAgeOverThreshold) === 'boolean' && typeof(request_0.body.requestedAgeThresholdYears) === 'bigint' && request_0.body.requestedAgeThresholdYears >= 0n && request_0.body.requestedAgeThresholdYears <= 255n)) {
      __compactRuntime.typeError('birthCredentialPresentationRequestFromProtocol',
                                 'argument 1',
                                 'helpers.compact line 44 char 1',
                                 'struct RequestMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, features: struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>, verifierChallengeHash: Bytes<32>, body: struct BirthCredentialVerificationRequestBody<requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>>>',
                                 request_0)
    }
    return _dummyContract._birthCredentialPresentationRequestFromProtocol_0(request_0);
  },
  assertValidBirthCredentialIssuanceOffer: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialIssuanceOffer: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const offer_0 = args_0[0];
    if (!(typeof(offer_0) === 'object' && typeof(offer_0.envelope) === 'object' && typeof(offer_0.envelope.version) === 'bigint' && offer_0.envelope.version >= 0n && offer_0.envelope.version <= 65535n && offer_0.envelope.messageId.buffer instanceof ArrayBuffer && offer_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && offer_0.envelope.messageId.length === 32 && offer_0.envelope.threadId.buffer instanceof ArrayBuffer && offer_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && offer_0.envelope.threadId.length === 32 && typeof(offer_0.envelope.initialMessage) === 'boolean' && offer_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && offer_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && offer_0.envelope.respondsToMessageId.length === 32 && typeof(offer_0.envelope.createdAt) === 'bigint' && offer_0.envelope.createdAt >= 0n && offer_0.envelope.createdAt <= 18446744073709551615n && typeof(offer_0.envelope.hasExpiresAt) === 'boolean' && typeof(offer_0.envelope.expiresAt) === 'bigint' && offer_0.envelope.expiresAt >= 0n && offer_0.envelope.expiresAt <= 18446744073709551615n && typeof(offer_0.schema) === 'object' && offer_0.schema.packageId.buffer instanceof ArrayBuffer && offer_0.schema.packageId.BYTES_PER_ELEMENT === 1 && offer_0.schema.packageId.length === 32 && offer_0.schema.schemaId.buffer instanceof ArrayBuffer && offer_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && offer_0.schema.schemaId.length === 32 && typeof(offer_0.schema.majorVersion) === 'bigint' && offer_0.schema.majorVersion >= 0n && offer_0.schema.majorVersion <= 65535n && typeof(offer_0.schema.minorVersion) === 'bigint' && offer_0.schema.minorVersion >= 0n && offer_0.schema.minorVersion <= 65535n && typeof(offer_0.issuerVerificationMethodRef) === 'object' && typeof(offer_0.issuerVerificationMethodRef.didContractAddress) === 'object' && offer_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && offer_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && offer_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && offer_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && offer_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && offer_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(offer_0.holderBindingProfile) === 'number' && offer_0.holderBindingProfile >= 0 && offer_0.holderBindingProfile <= 2 && typeof(offer_0.features) === 'object' && typeof(offer_0.features.supportsSelectiveDisclosure) === 'boolean' && typeof(offer_0.features.supportsPredicateProofs) === 'boolean' && typeof(offer_0.features.supportsVerifierScopedPseudonym) === 'boolean' && typeof(offer_0.features.supportsSameHolderProof) === 'boolean' && typeof(offer_0.body) === 'object' && typeof(offer_0.body.supportsExpiration) === 'boolean' && typeof(offer_0.body.defaultExpirationDays) === 'bigint' && offer_0.body.defaultExpirationDays >= 0n && offer_0.body.defaultExpirationDays <= 65535n && typeof(offer_0.body.requiresHolderPublicKey) === 'boolean')) {
      __compactRuntime.typeError('assertValidBirthCredentialIssuanceOffer',
                                 'argument 1',
                                 'validation.compact line 5 char 1',
                                 'struct OfferMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, features: struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>, body: struct BirthCredentialIssuanceOfferBody<supportsExpiration: Boolean, defaultExpirationDays: Uint<0..65536>, requiresHolderPublicKey: Boolean>>',
                                 offer_0)
    }
    return _dummyContract._assertValidBirthCredentialIssuanceOffer_0(offer_0);
  },
  assertValidBirthCredentialIssuanceRequest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialIssuanceRequest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.envelope) === 'object' && typeof(request_0.envelope.version) === 'bigint' && request_0.envelope.version >= 0n && request_0.envelope.version <= 65535n && request_0.envelope.messageId.buffer instanceof ArrayBuffer && request_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.messageId.length === 32 && request_0.envelope.threadId.buffer instanceof ArrayBuffer && request_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && request_0.envelope.threadId.length === 32 && typeof(request_0.envelope.initialMessage) === 'boolean' && request_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && request_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.respondsToMessageId.length === 32 && typeof(request_0.envelope.createdAt) === 'bigint' && request_0.envelope.createdAt >= 0n && request_0.envelope.createdAt <= 18446744073709551615n && typeof(request_0.envelope.hasExpiresAt) === 'boolean' && typeof(request_0.envelope.expiresAt) === 'bigint' && request_0.envelope.expiresAt >= 0n && request_0.envelope.expiresAt <= 18446744073709551615n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.holderBindingProfile) === 'number' && request_0.holderBindingProfile >= 0 && request_0.holderBindingProfile <= 2 && typeof(request_0.body) === 'object' && typeof(request_0.body.holderBinding) === 'object' && typeof(request_0.body.holderBinding.holderVerificationMethodRef) === 'object' && typeof(request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.body.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.body.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.body.holderBinding.holderVerificationMethodRef.methodId.length === 32 && true && request_0.body.holderChallengeHash.buffer instanceof ArrayBuffer && request_0.body.holderChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.body.holderChallengeHash.length === 32 && typeof(request_0.body.requestExpiration) === 'boolean' && typeof(request_0.body.requestedExpirationDays) === 'bigint' && request_0.body.requestedExpirationDays >= 0n && request_0.body.requestedExpirationDays <= 65535n)) {
      __compactRuntime.typeError('assertValidBirthCredentialIssuanceRequest',
                                 'argument 1',
                                 'validation.compact line 27 char 1',
                                 'struct RequestMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, body: struct BirthCredentialIssuanceRequestBody<holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, holderPublicKey: Opaque<"JubjubPoint">, holderChallengeHash: Bytes<32>, requestExpiration: Boolean, requestedExpirationDays: Uint<0..65536>>>',
                                 request_0)
    }
    return _dummyContract._assertValidBirthCredentialIssuanceRequest_0(request_0);
  },
  assertBirthCredentialIssuanceRequestMatchesOffer: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertBirthCredentialIssuanceRequestMatchesOffer: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const offer_0 = args_0[0];
    const request_0 = args_0[1];
    if (!(typeof(offer_0) === 'object' && typeof(offer_0.envelope) === 'object' && typeof(offer_0.envelope.version) === 'bigint' && offer_0.envelope.version >= 0n && offer_0.envelope.version <= 65535n && offer_0.envelope.messageId.buffer instanceof ArrayBuffer && offer_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && offer_0.envelope.messageId.length === 32 && offer_0.envelope.threadId.buffer instanceof ArrayBuffer && offer_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && offer_0.envelope.threadId.length === 32 && typeof(offer_0.envelope.initialMessage) === 'boolean' && offer_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && offer_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && offer_0.envelope.respondsToMessageId.length === 32 && typeof(offer_0.envelope.createdAt) === 'bigint' && offer_0.envelope.createdAt >= 0n && offer_0.envelope.createdAt <= 18446744073709551615n && typeof(offer_0.envelope.hasExpiresAt) === 'boolean' && typeof(offer_0.envelope.expiresAt) === 'bigint' && offer_0.envelope.expiresAt >= 0n && offer_0.envelope.expiresAt <= 18446744073709551615n && typeof(offer_0.schema) === 'object' && offer_0.schema.packageId.buffer instanceof ArrayBuffer && offer_0.schema.packageId.BYTES_PER_ELEMENT === 1 && offer_0.schema.packageId.length === 32 && offer_0.schema.schemaId.buffer instanceof ArrayBuffer && offer_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && offer_0.schema.schemaId.length === 32 && typeof(offer_0.schema.majorVersion) === 'bigint' && offer_0.schema.majorVersion >= 0n && offer_0.schema.majorVersion <= 65535n && typeof(offer_0.schema.minorVersion) === 'bigint' && offer_0.schema.minorVersion >= 0n && offer_0.schema.minorVersion <= 65535n && typeof(offer_0.issuerVerificationMethodRef) === 'object' && typeof(offer_0.issuerVerificationMethodRef.didContractAddress) === 'object' && offer_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && offer_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && offer_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && offer_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && offer_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && offer_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(offer_0.holderBindingProfile) === 'number' && offer_0.holderBindingProfile >= 0 && offer_0.holderBindingProfile <= 2 && typeof(offer_0.features) === 'object' && typeof(offer_0.features.supportsSelectiveDisclosure) === 'boolean' && typeof(offer_0.features.supportsPredicateProofs) === 'boolean' && typeof(offer_0.features.supportsVerifierScopedPseudonym) === 'boolean' && typeof(offer_0.features.supportsSameHolderProof) === 'boolean' && typeof(offer_0.body) === 'object' && typeof(offer_0.body.supportsExpiration) === 'boolean' && typeof(offer_0.body.defaultExpirationDays) === 'bigint' && offer_0.body.defaultExpirationDays >= 0n && offer_0.body.defaultExpirationDays <= 65535n && typeof(offer_0.body.requiresHolderPublicKey) === 'boolean')) {
      __compactRuntime.typeError('assertBirthCredentialIssuanceRequestMatchesOffer',
                                 'argument 1',
                                 'validation.compact line 54 char 1',
                                 'struct OfferMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, features: struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>, body: struct BirthCredentialIssuanceOfferBody<supportsExpiration: Boolean, defaultExpirationDays: Uint<0..65536>, requiresHolderPublicKey: Boolean>>',
                                 offer_0)
    }
    if (!(typeof(request_0) === 'object' && typeof(request_0.envelope) === 'object' && typeof(request_0.envelope.version) === 'bigint' && request_0.envelope.version >= 0n && request_0.envelope.version <= 65535n && request_0.envelope.messageId.buffer instanceof ArrayBuffer && request_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.messageId.length === 32 && request_0.envelope.threadId.buffer instanceof ArrayBuffer && request_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && request_0.envelope.threadId.length === 32 && typeof(request_0.envelope.initialMessage) === 'boolean' && request_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && request_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.respondsToMessageId.length === 32 && typeof(request_0.envelope.createdAt) === 'bigint' && request_0.envelope.createdAt >= 0n && request_0.envelope.createdAt <= 18446744073709551615n && typeof(request_0.envelope.hasExpiresAt) === 'boolean' && typeof(request_0.envelope.expiresAt) === 'bigint' && request_0.envelope.expiresAt >= 0n && request_0.envelope.expiresAt <= 18446744073709551615n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.holderBindingProfile) === 'number' && request_0.holderBindingProfile >= 0 && request_0.holderBindingProfile <= 2 && typeof(request_0.body) === 'object' && typeof(request_0.body.holderBinding) === 'object' && typeof(request_0.body.holderBinding.holderVerificationMethodRef) === 'object' && typeof(request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.body.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.body.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.body.holderBinding.holderVerificationMethodRef.methodId.length === 32 && true && request_0.body.holderChallengeHash.buffer instanceof ArrayBuffer && request_0.body.holderChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.body.holderChallengeHash.length === 32 && typeof(request_0.body.requestExpiration) === 'boolean' && typeof(request_0.body.requestedExpirationDays) === 'bigint' && request_0.body.requestedExpirationDays >= 0n && request_0.body.requestedExpirationDays <= 65535n)) {
      __compactRuntime.typeError('assertBirthCredentialIssuanceRequestMatchesOffer',
                                 'argument 2',
                                 'validation.compact line 54 char 1',
                                 'struct RequestMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, body: struct BirthCredentialIssuanceRequestBody<holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, holderPublicKey: Opaque<"JubjubPoint">, holderChallengeHash: Bytes<32>, requestExpiration: Boolean, requestedExpirationDays: Uint<0..65536>>>',
                                 request_0)
    }
    return _dummyContract._assertBirthCredentialIssuanceRequestMatchesOffer_0(offer_0,
                                                                              request_0);
  },
  assertValidBirthCredentialIssuanceResult: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialIssuanceResult: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const result_0 = args_0[0];
    if (!(typeof(result_0) === 'object' && typeof(result_0.envelope) === 'object' && typeof(result_0.envelope.version) === 'bigint' && result_0.envelope.version >= 0n && result_0.envelope.version <= 65535n && result_0.envelope.messageId.buffer instanceof ArrayBuffer && result_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.messageId.length === 32 && result_0.envelope.threadId.buffer instanceof ArrayBuffer && result_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && result_0.envelope.threadId.length === 32 && typeof(result_0.envelope.initialMessage) === 'boolean' && result_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && result_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.respondsToMessageId.length === 32 && typeof(result_0.envelope.createdAt) === 'bigint' && result_0.envelope.createdAt >= 0n && result_0.envelope.createdAt <= 18446744073709551615n && typeof(result_0.envelope.hasExpiresAt) === 'boolean' && typeof(result_0.envelope.expiresAt) === 'bigint' && result_0.envelope.expiresAt >= 0n && result_0.envelope.expiresAt <= 18446744073709551615n && typeof(result_0.schema) === 'object' && result_0.schema.packageId.buffer instanceof ArrayBuffer && result_0.schema.packageId.BYTES_PER_ELEMENT === 1 && result_0.schema.packageId.length === 32 && result_0.schema.schemaId.buffer instanceof ArrayBuffer && result_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && result_0.schema.schemaId.length === 32 && typeof(result_0.schema.majorVersion) === 'bigint' && result_0.schema.majorVersion >= 0n && result_0.schema.majorVersion <= 65535n && typeof(result_0.schema.minorVersion) === 'bigint' && result_0.schema.minorVersion >= 0n && result_0.schema.minorVersion <= 65535n && typeof(result_0.issuerVerificationMethodRef) === 'object' && typeof(result_0.issuerVerificationMethodRef.didContractAddress) === 'object' && result_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(result_0.holderBindingProfile) === 'number' && result_0.holderBindingProfile >= 0 && result_0.holderBindingProfile <= 2 && typeof(result_0.body) === 'object' && typeof(result_0.body.credential) === 'object' && typeof(result_0.body.credential.version) === 'bigint' && result_0.body.credential.version >= 0n && result_0.body.credential.version <= 65535n && typeof(result_0.body.credential.schema) === 'object' && result_0.body.credential.schema.packageId.buffer instanceof ArrayBuffer && result_0.body.credential.schema.packageId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.schema.packageId.length === 32 && result_0.body.credential.schema.schemaId.buffer instanceof ArrayBuffer && result_0.body.credential.schema.schemaId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.schema.schemaId.length === 32 && typeof(result_0.body.credential.schema.majorVersion) === 'bigint' && result_0.body.credential.schema.majorVersion >= 0n && result_0.body.credential.schema.majorVersion <= 65535n && typeof(result_0.body.credential.schema.minorVersion) === 'bigint' && result_0.body.credential.schema.minorVersion >= 0n && result_0.body.credential.schema.minorVersion <= 65535n && typeof(result_0.body.credential.issuerVerificationMethodRef) === 'object' && typeof(result_0.body.credential.issuerVerificationMethodRef.didContractAddress) === 'object' && result_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.body.credential.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.body.credential.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.issuerVerificationMethodRef.methodId.length === 32 && typeof(result_0.body.credential.holderBinding) === 'object' && typeof(result_0.body.credential.holderBinding.holderVerificationMethodRef) === 'object' && typeof(result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(result_0.body.credential.statusBinding) === 'object' && typeof(result_0.body.credential.issuedAt) === 'bigint' && result_0.body.credential.issuedAt >= 0n && result_0.body.credential.issuedAt <= 18446744073709551615n && typeof(result_0.body.credential.hasExpiration) === 'boolean' && typeof(result_0.body.credential.expiresAt) === 'bigint' && result_0.body.credential.expiresAt >= 0n && result_0.body.credential.expiresAt <= 18446744073709551615n && typeof(result_0.body.credential.claims) === 'object' && typeof(result_0.body.credential.claimCommitments) === 'object' && result_0.body.credential.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.subjectIdCommitment.length === 32 && result_0.body.credential.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.legalNameCommitment.length === 32 && result_0.body.credential.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.birthDateCommitment.length === 32 && result_0.body.credential.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.birthCountryCodeCommitment.length === 32 && result_0.body.credential.claimRoot.buffer instanceof ArrayBuffer && result_0.body.credential.claimRoot.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimRoot.length === 32 && typeof(result_0.body.credentialProof) === 'object' && typeof(result_0.body.credentialProof.signerVerificationMethodRef) === 'object' && typeof(result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress) === 'object' && result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.body.credentialProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.body.credentialProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.body.credentialProof.signerVerificationMethodRef.methodId.length === 32 && typeof(result_0.body.credentialProof.createdAt) === 'bigint' && result_0.body.credentialProof.createdAt >= 0n && result_0.body.credentialProof.createdAt <= 18446744073709551615n && result_0.body.credentialProof.challengeHash.buffer instanceof ArrayBuffer && result_0.body.credentialProof.challengeHash.BYTES_PER_ELEMENT === 1 && result_0.body.credentialProof.challengeHash.length === 32 && true && typeof(result_0.body.credentialProof.signature) === 'object' && true && typeof(result_0.body.credentialProof.signature.s) === 'bigint' && result_0.body.credentialProof.signature.s >= 0 && result_0.body.credentialProof.signature.s <= __compactRuntime.MAX_FIELD && true && result_0.body.issuanceChallengeHash.buffer instanceof ArrayBuffer && result_0.body.issuanceChallengeHash.BYTES_PER_ELEMENT === 1 && result_0.body.issuanceChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertValidBirthCredentialIssuanceResult',
                                 'argument 1',
                                 'validation.compact line 69 char 1',
                                 'struct ResultMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, body: struct BirthCredentialIssuanceResultBody<credential: struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>, credentialProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>, holderPublicKey: Opaque<"JubjubPoint">, issuanceChallengeHash: Bytes<32>>>',
                                 result_0)
    }
    return _dummyContract._assertValidBirthCredentialIssuanceResult_0(result_0);
  },
  assertBirthCredentialIssuanceResultMatchesRequest: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertBirthCredentialIssuanceResultMatchesRequest: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    const result_0 = args_0[1];
    if (!(typeof(request_0) === 'object' && typeof(request_0.envelope) === 'object' && typeof(request_0.envelope.version) === 'bigint' && request_0.envelope.version >= 0n && request_0.envelope.version <= 65535n && request_0.envelope.messageId.buffer instanceof ArrayBuffer && request_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.messageId.length === 32 && request_0.envelope.threadId.buffer instanceof ArrayBuffer && request_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && request_0.envelope.threadId.length === 32 && typeof(request_0.envelope.initialMessage) === 'boolean' && request_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && request_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.respondsToMessageId.length === 32 && typeof(request_0.envelope.createdAt) === 'bigint' && request_0.envelope.createdAt >= 0n && request_0.envelope.createdAt <= 18446744073709551615n && typeof(request_0.envelope.hasExpiresAt) === 'boolean' && typeof(request_0.envelope.expiresAt) === 'bigint' && request_0.envelope.expiresAt >= 0n && request_0.envelope.expiresAt <= 18446744073709551615n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.holderBindingProfile) === 'number' && request_0.holderBindingProfile >= 0 && request_0.holderBindingProfile <= 2 && typeof(request_0.body) === 'object' && typeof(request_0.body.holderBinding) === 'object' && typeof(request_0.body.holderBinding.holderVerificationMethodRef) === 'object' && typeof(request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.body.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.body.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.body.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.body.holderBinding.holderVerificationMethodRef.methodId.length === 32 && true && request_0.body.holderChallengeHash.buffer instanceof ArrayBuffer && request_0.body.holderChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.body.holderChallengeHash.length === 32 && typeof(request_0.body.requestExpiration) === 'boolean' && typeof(request_0.body.requestedExpirationDays) === 'bigint' && request_0.body.requestedExpirationDays >= 0n && request_0.body.requestedExpirationDays <= 65535n)) {
      __compactRuntime.typeError('assertBirthCredentialIssuanceResultMatchesRequest',
                                 'argument 1',
                                 'validation.compact line 88 char 1',
                                 'struct RequestMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, body: struct BirthCredentialIssuanceRequestBody<holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, holderPublicKey: Opaque<"JubjubPoint">, holderChallengeHash: Bytes<32>, requestExpiration: Boolean, requestedExpirationDays: Uint<0..65536>>>',
                                 request_0)
    }
    if (!(typeof(result_0) === 'object' && typeof(result_0.envelope) === 'object' && typeof(result_0.envelope.version) === 'bigint' && result_0.envelope.version >= 0n && result_0.envelope.version <= 65535n && result_0.envelope.messageId.buffer instanceof ArrayBuffer && result_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.messageId.length === 32 && result_0.envelope.threadId.buffer instanceof ArrayBuffer && result_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && result_0.envelope.threadId.length === 32 && typeof(result_0.envelope.initialMessage) === 'boolean' && result_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && result_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.respondsToMessageId.length === 32 && typeof(result_0.envelope.createdAt) === 'bigint' && result_0.envelope.createdAt >= 0n && result_0.envelope.createdAt <= 18446744073709551615n && typeof(result_0.envelope.hasExpiresAt) === 'boolean' && typeof(result_0.envelope.expiresAt) === 'bigint' && result_0.envelope.expiresAt >= 0n && result_0.envelope.expiresAt <= 18446744073709551615n && typeof(result_0.schema) === 'object' && result_0.schema.packageId.buffer instanceof ArrayBuffer && result_0.schema.packageId.BYTES_PER_ELEMENT === 1 && result_0.schema.packageId.length === 32 && result_0.schema.schemaId.buffer instanceof ArrayBuffer && result_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && result_0.schema.schemaId.length === 32 && typeof(result_0.schema.majorVersion) === 'bigint' && result_0.schema.majorVersion >= 0n && result_0.schema.majorVersion <= 65535n && typeof(result_0.schema.minorVersion) === 'bigint' && result_0.schema.minorVersion >= 0n && result_0.schema.minorVersion <= 65535n && typeof(result_0.issuerVerificationMethodRef) === 'object' && typeof(result_0.issuerVerificationMethodRef.didContractAddress) === 'object' && result_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(result_0.holderBindingProfile) === 'number' && result_0.holderBindingProfile >= 0 && result_0.holderBindingProfile <= 2 && typeof(result_0.body) === 'object' && typeof(result_0.body.credential) === 'object' && typeof(result_0.body.credential.version) === 'bigint' && result_0.body.credential.version >= 0n && result_0.body.credential.version <= 65535n && typeof(result_0.body.credential.schema) === 'object' && result_0.body.credential.schema.packageId.buffer instanceof ArrayBuffer && result_0.body.credential.schema.packageId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.schema.packageId.length === 32 && result_0.body.credential.schema.schemaId.buffer instanceof ArrayBuffer && result_0.body.credential.schema.schemaId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.schema.schemaId.length === 32 && typeof(result_0.body.credential.schema.majorVersion) === 'bigint' && result_0.body.credential.schema.majorVersion >= 0n && result_0.body.credential.schema.majorVersion <= 65535n && typeof(result_0.body.credential.schema.minorVersion) === 'bigint' && result_0.body.credential.schema.minorVersion >= 0n && result_0.body.credential.schema.minorVersion <= 65535n && typeof(result_0.body.credential.issuerVerificationMethodRef) === 'object' && typeof(result_0.body.credential.issuerVerificationMethodRef.didContractAddress) === 'object' && result_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.body.credential.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.body.credential.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.issuerVerificationMethodRef.methodId.length === 32 && typeof(result_0.body.credential.holderBinding) === 'object' && typeof(result_0.body.credential.holderBinding.holderVerificationMethodRef) === 'object' && typeof(result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(result_0.body.credential.statusBinding) === 'object' && typeof(result_0.body.credential.issuedAt) === 'bigint' && result_0.body.credential.issuedAt >= 0n && result_0.body.credential.issuedAt <= 18446744073709551615n && typeof(result_0.body.credential.hasExpiration) === 'boolean' && typeof(result_0.body.credential.expiresAt) === 'bigint' && result_0.body.credential.expiresAt >= 0n && result_0.body.credential.expiresAt <= 18446744073709551615n && typeof(result_0.body.credential.claims) === 'object' && typeof(result_0.body.credential.claimCommitments) === 'object' && result_0.body.credential.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.subjectIdCommitment.length === 32 && result_0.body.credential.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.legalNameCommitment.length === 32 && result_0.body.credential.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.birthDateCommitment.length === 32 && result_0.body.credential.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && result_0.body.credential.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimCommitments.birthCountryCodeCommitment.length === 32 && result_0.body.credential.claimRoot.buffer instanceof ArrayBuffer && result_0.body.credential.claimRoot.BYTES_PER_ELEMENT === 1 && result_0.body.credential.claimRoot.length === 32 && typeof(result_0.body.credentialProof) === 'object' && typeof(result_0.body.credentialProof.signerVerificationMethodRef) === 'object' && typeof(result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress) === 'object' && result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && result_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && result_0.body.credentialProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && result_0.body.credentialProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && result_0.body.credentialProof.signerVerificationMethodRef.methodId.length === 32 && typeof(result_0.body.credentialProof.createdAt) === 'bigint' && result_0.body.credentialProof.createdAt >= 0n && result_0.body.credentialProof.createdAt <= 18446744073709551615n && result_0.body.credentialProof.challengeHash.buffer instanceof ArrayBuffer && result_0.body.credentialProof.challengeHash.BYTES_PER_ELEMENT === 1 && result_0.body.credentialProof.challengeHash.length === 32 && true && typeof(result_0.body.credentialProof.signature) === 'object' && true && typeof(result_0.body.credentialProof.signature.s) === 'bigint' && result_0.body.credentialProof.signature.s >= 0 && result_0.body.credentialProof.signature.s <= __compactRuntime.MAX_FIELD && true && result_0.body.issuanceChallengeHash.buffer instanceof ArrayBuffer && result_0.body.issuanceChallengeHash.BYTES_PER_ELEMENT === 1 && result_0.body.issuanceChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertBirthCredentialIssuanceResultMatchesRequest',
                                 'argument 2',
                                 'validation.compact line 88 char 1',
                                 'struct ResultMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, body: struct BirthCredentialIssuanceResultBody<credential: struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>, credentialProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>, holderPublicKey: Opaque<"JubjubPoint">, issuanceChallengeHash: Bytes<32>>>',
                                 result_0)
    }
    return _dummyContract._assertBirthCredentialIssuanceResultMatchesRequest_0(request_0,
                                                                               result_0);
  },
  assertValidBirthCredentialVerificationRequestMessage: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialVerificationRequestMessage: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.envelope) === 'object' && typeof(request_0.envelope.version) === 'bigint' && request_0.envelope.version >= 0n && request_0.envelope.version <= 65535n && request_0.envelope.messageId.buffer instanceof ArrayBuffer && request_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.messageId.length === 32 && request_0.envelope.threadId.buffer instanceof ArrayBuffer && request_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && request_0.envelope.threadId.length === 32 && typeof(request_0.envelope.initialMessage) === 'boolean' && request_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && request_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.respondsToMessageId.length === 32 && typeof(request_0.envelope.createdAt) === 'bigint' && request_0.envelope.createdAt >= 0n && request_0.envelope.createdAt <= 18446744073709551615n && typeof(request_0.envelope.hasExpiresAt) === 'boolean' && typeof(request_0.envelope.expiresAt) === 'bigint' && request_0.envelope.expiresAt >= 0n && request_0.envelope.expiresAt <= 18446744073709551615n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.holderBindingProfile) === 'number' && request_0.holderBindingProfile >= 0 && request_0.holderBindingProfile <= 2 && typeof(request_0.features) === 'object' && typeof(request_0.features.supportsSelectiveDisclosure) === 'boolean' && typeof(request_0.features.supportsPredicateProofs) === 'boolean' && typeof(request_0.features.supportsVerifierScopedPseudonym) === 'boolean' && typeof(request_0.features.supportsSameHolderProof) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32 && typeof(request_0.body) === 'object' && typeof(request_0.body.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.body.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.body.requireAgeOverThreshold) === 'boolean' && typeof(request_0.body.requestedAgeThresholdYears) === 'bigint' && request_0.body.requestedAgeThresholdYears >= 0n && request_0.body.requestedAgeThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertValidBirthCredentialVerificationRequestMessage',
                                 'argument 1',
                                 'validation.compact line 113 char 1',
                                 'struct RequestMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, features: struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>, verifierChallengeHash: Bytes<32>, body: struct BirthCredentialVerificationRequestBody<requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>>>',
                                 request_0)
    }
    return _dummyContract._assertValidBirthCredentialVerificationRequestMessage_0(request_0);
  },
  assertValidBirthCredentialVerificationSubmissionMessage: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialVerificationSubmissionMessage: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const submission_0 = args_0[0];
    if (!(typeof(submission_0) === 'object' && typeof(submission_0.envelope) === 'object' && typeof(submission_0.envelope.version) === 'bigint' && submission_0.envelope.version >= 0n && submission_0.envelope.version <= 65535n && submission_0.envelope.messageId.buffer instanceof ArrayBuffer && submission_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.messageId.length === 32 && submission_0.envelope.threadId.buffer instanceof ArrayBuffer && submission_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.threadId.length === 32 && typeof(submission_0.envelope.initialMessage) === 'boolean' && submission_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && submission_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.respondsToMessageId.length === 32 && typeof(submission_0.envelope.createdAt) === 'bigint' && submission_0.envelope.createdAt >= 0n && submission_0.envelope.createdAt <= 18446744073709551615n && typeof(submission_0.envelope.hasExpiresAt) === 'boolean' && typeof(submission_0.envelope.expiresAt) === 'bigint' && submission_0.envelope.expiresAt >= 0n && submission_0.envelope.expiresAt <= 18446744073709551615n && typeof(submission_0.schema) === 'object' && submission_0.schema.packageId.buffer instanceof ArrayBuffer && submission_0.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.schema.packageId.length === 32 && submission_0.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.schema.schemaId.length === 32 && typeof(submission_0.schema.majorVersion) === 'bigint' && submission_0.schema.majorVersion >= 0n && submission_0.schema.majorVersion <= 65535n && typeof(submission_0.schema.minorVersion) === 'bigint' && submission_0.schema.minorVersion >= 0n && submission_0.schema.minorVersion <= 65535n && typeof(submission_0.issuerVerificationMethodRef) === 'object' && typeof(submission_0.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.holderBindingProfile) === 'number' && submission_0.holderBindingProfile >= 0 && submission_0.holderBindingProfile <= 2 && submission_0.challengeHash.buffer instanceof ArrayBuffer && submission_0.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.challengeHash.length === 32 && typeof(submission_0.body) === 'object' && typeof(submission_0.body.credential) === 'object' && typeof(submission_0.body.credential.version) === 'bigint' && submission_0.body.credential.version >= 0n && submission_0.body.credential.version <= 65535n && typeof(submission_0.body.credential.schema) === 'object' && submission_0.body.credential.schema.packageId.buffer instanceof ArrayBuffer && submission_0.body.credential.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.schema.packageId.length === 32 && submission_0.body.credential.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.body.credential.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.schema.schemaId.length === 32 && typeof(submission_0.body.credential.schema.majorVersion) === 'bigint' && submission_0.body.credential.schema.majorVersion >= 0n && submission_0.body.credential.schema.majorVersion <= 65535n && typeof(submission_0.body.credential.schema.minorVersion) === 'bigint' && submission_0.body.credential.schema.minorVersion >= 0n && submission_0.body.credential.schema.minorVersion <= 65535n && typeof(submission_0.body.credential.issuerVerificationMethodRef) === 'object' && typeof(submission_0.body.credential.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credential.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credential.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credential.holderBinding) === 'object' && typeof(submission_0.body.credential.holderBinding.holderVerificationMethodRef) === 'object' && typeof(submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credential.statusBinding) === 'object' && typeof(submission_0.body.credential.issuedAt) === 'bigint' && submission_0.body.credential.issuedAt >= 0n && submission_0.body.credential.issuedAt <= 18446744073709551615n && typeof(submission_0.body.credential.hasExpiration) === 'boolean' && typeof(submission_0.body.credential.expiresAt) === 'bigint' && submission_0.body.credential.expiresAt >= 0n && submission_0.body.credential.expiresAt <= 18446744073709551615n && typeof(submission_0.body.credential.claims) === 'object' && typeof(submission_0.body.credential.claimCommitments) === 'object' && submission_0.body.credential.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.subjectIdCommitment.length === 32 && submission_0.body.credential.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.legalNameCommitment.length === 32 && submission_0.body.credential.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.birthDateCommitment.length === 32 && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.length === 32 && submission_0.body.credential.claimRoot.buffer instanceof ArrayBuffer && submission_0.body.credential.claimRoot.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimRoot.length === 32 && typeof(submission_0.body.credentialProof) === 'object' && typeof(submission_0.body.credentialProof.signerVerificationMethodRef) === 'object' && typeof(submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credentialProof.createdAt) === 'bigint' && submission_0.body.credentialProof.createdAt >= 0n && submission_0.body.credentialProof.createdAt <= 18446744073709551615n && submission_0.body.credentialProof.challengeHash.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.challengeHash.length === 32 && true && typeof(submission_0.body.credentialProof.signature) === 'object' && true && typeof(submission_0.body.credentialProof.signature.s) === 'bigint' && submission_0.body.credentialProof.signature.s >= 0 && submission_0.body.credentialProof.signature.s <= __compactRuntime.MAX_FIELD && typeof(submission_0.body.presentation) === 'object' && typeof(submission_0.body.presentation.version) === 'bigint' && submission_0.body.presentation.version >= 0n && submission_0.body.presentation.version <= 65535n && typeof(submission_0.body.presentation.schema) === 'object' && submission_0.body.presentation.schema.packageId.buffer instanceof ArrayBuffer && submission_0.body.presentation.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.schema.packageId.length === 32 && submission_0.body.presentation.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.body.presentation.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.schema.schemaId.length === 32 && typeof(submission_0.body.presentation.schema.majorVersion) === 'bigint' && submission_0.body.presentation.schema.majorVersion >= 0n && submission_0.body.presentation.schema.majorVersion <= 65535n && typeof(submission_0.body.presentation.schema.minorVersion) === 'bigint' && submission_0.body.presentation.schema.minorVersion >= 0n && submission_0.body.presentation.schema.minorVersion <= 65535n && submission_0.body.presentation.credentialClaimRoot.buffer instanceof ArrayBuffer && submission_0.body.presentation.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.credentialClaimRoot.length === 32 && typeof(submission_0.body.presentation.issuerVerificationMethodRef) === 'object' && typeof(submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentation.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentation.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentation.holderBinding) === 'object' && typeof(submission_0.body.presentation.holderBinding.holderVerificationMethodRef) === 'object' && typeof(submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentation.disclosed) === 'object' && typeof(submission_0.body.presentation.disclosed.revealSubjectIdCommitment) === 'boolean' && submission_0.body.presentation.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.subjectIdCommitment.length === 32 && typeof(submission_0.body.presentation.disclosed.revealBirthCountryCode) === 'boolean' && submission_0.body.presentation.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.birthCountryCodePadded.length === 32 && submission_0.body.presentation.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.birthCountryCodeOpening.length === 32 && typeof(submission_0.body.presentation.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(submission_0.body.presentation.disclosed.ageThresholdYears) === 'bigint' && submission_0.body.presentation.disclosed.ageThresholdYears >= 0n && submission_0.body.presentation.disclosed.ageThresholdYears <= 255n && typeof(submission_0.body.presentationProof) === 'object' && typeof(submission_0.body.presentationProof.signerVerificationMethodRef) === 'object' && typeof(submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentationProof.createdAt) === 'bigint' && submission_0.body.presentationProof.createdAt >= 0n && submission_0.body.presentationProof.createdAt <= 18446744073709551615n && submission_0.body.presentationProof.challengeHash.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.challengeHash.length === 32 && true && typeof(submission_0.body.presentationProof.signature) === 'object' && true && typeof(submission_0.body.presentationProof.signature.s) === 'bigint' && submission_0.body.presentationProof.signature.s >= 0 && submission_0.body.presentationProof.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidBirthCredentialVerificationSubmissionMessage',
                                 'argument 1',
                                 'validation.compact line 127 char 1',
                                 'struct SubmissionMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, challengeHash: Bytes<32>, body: struct BirthCredentialVerificationSubmissionBody<credential: struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>, credentialProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>, presentation: struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>, presentationProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>>>',
                                 submission_0)
    }
    return _dummyContract._assertValidBirthCredentialVerificationSubmissionMessage_0(submission_0);
  },
  assertBirthCredentialVerificationSubmissionMatchesRequest: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertBirthCredentialVerificationSubmissionMatchesRequest: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    const submission_0 = args_0[1];
    if (!(typeof(request_0) === 'object' && typeof(request_0.envelope) === 'object' && typeof(request_0.envelope.version) === 'bigint' && request_0.envelope.version >= 0n && request_0.envelope.version <= 65535n && request_0.envelope.messageId.buffer instanceof ArrayBuffer && request_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.messageId.length === 32 && request_0.envelope.threadId.buffer instanceof ArrayBuffer && request_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && request_0.envelope.threadId.length === 32 && typeof(request_0.envelope.initialMessage) === 'boolean' && request_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && request_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && request_0.envelope.respondsToMessageId.length === 32 && typeof(request_0.envelope.createdAt) === 'bigint' && request_0.envelope.createdAt >= 0n && request_0.envelope.createdAt <= 18446744073709551615n && typeof(request_0.envelope.hasExpiresAt) === 'boolean' && typeof(request_0.envelope.expiresAt) === 'bigint' && request_0.envelope.expiresAt >= 0n && request_0.envelope.expiresAt <= 18446744073709551615n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.holderBindingProfile) === 'number' && request_0.holderBindingProfile >= 0 && request_0.holderBindingProfile <= 2 && typeof(request_0.features) === 'object' && typeof(request_0.features.supportsSelectiveDisclosure) === 'boolean' && typeof(request_0.features.supportsPredicateProofs) === 'boolean' && typeof(request_0.features.supportsVerifierScopedPseudonym) === 'boolean' && typeof(request_0.features.supportsSameHolderProof) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32 && typeof(request_0.body) === 'object' && typeof(request_0.body.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.body.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.body.requireAgeOverThreshold) === 'boolean' && typeof(request_0.body.requestedAgeThresholdYears) === 'bigint' && request_0.body.requestedAgeThresholdYears >= 0n && request_0.body.requestedAgeThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertBirthCredentialVerificationSubmissionMatchesRequest',
                                 'argument 1',
                                 'validation.compact line 148 char 1',
                                 'struct RequestMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, features: struct CredentialProtocolFeatures<supportsSelectiveDisclosure: Boolean, supportsPredicateProofs: Boolean, supportsVerifierScopedPseudonym: Boolean, supportsSameHolderProof: Boolean>, verifierChallengeHash: Bytes<32>, body: struct BirthCredentialVerificationRequestBody<requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>>>',
                                 request_0)
    }
    if (!(typeof(submission_0) === 'object' && typeof(submission_0.envelope) === 'object' && typeof(submission_0.envelope.version) === 'bigint' && submission_0.envelope.version >= 0n && submission_0.envelope.version <= 65535n && submission_0.envelope.messageId.buffer instanceof ArrayBuffer && submission_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.messageId.length === 32 && submission_0.envelope.threadId.buffer instanceof ArrayBuffer && submission_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.threadId.length === 32 && typeof(submission_0.envelope.initialMessage) === 'boolean' && submission_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && submission_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.respondsToMessageId.length === 32 && typeof(submission_0.envelope.createdAt) === 'bigint' && submission_0.envelope.createdAt >= 0n && submission_0.envelope.createdAt <= 18446744073709551615n && typeof(submission_0.envelope.hasExpiresAt) === 'boolean' && typeof(submission_0.envelope.expiresAt) === 'bigint' && submission_0.envelope.expiresAt >= 0n && submission_0.envelope.expiresAt <= 18446744073709551615n && typeof(submission_0.schema) === 'object' && submission_0.schema.packageId.buffer instanceof ArrayBuffer && submission_0.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.schema.packageId.length === 32 && submission_0.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.schema.schemaId.length === 32 && typeof(submission_0.schema.majorVersion) === 'bigint' && submission_0.schema.majorVersion >= 0n && submission_0.schema.majorVersion <= 65535n && typeof(submission_0.schema.minorVersion) === 'bigint' && submission_0.schema.minorVersion >= 0n && submission_0.schema.minorVersion <= 65535n && typeof(submission_0.issuerVerificationMethodRef) === 'object' && typeof(submission_0.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.holderBindingProfile) === 'number' && submission_0.holderBindingProfile >= 0 && submission_0.holderBindingProfile <= 2 && submission_0.challengeHash.buffer instanceof ArrayBuffer && submission_0.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.challengeHash.length === 32 && typeof(submission_0.body) === 'object' && typeof(submission_0.body.credential) === 'object' && typeof(submission_0.body.credential.version) === 'bigint' && submission_0.body.credential.version >= 0n && submission_0.body.credential.version <= 65535n && typeof(submission_0.body.credential.schema) === 'object' && submission_0.body.credential.schema.packageId.buffer instanceof ArrayBuffer && submission_0.body.credential.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.schema.packageId.length === 32 && submission_0.body.credential.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.body.credential.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.schema.schemaId.length === 32 && typeof(submission_0.body.credential.schema.majorVersion) === 'bigint' && submission_0.body.credential.schema.majorVersion >= 0n && submission_0.body.credential.schema.majorVersion <= 65535n && typeof(submission_0.body.credential.schema.minorVersion) === 'bigint' && submission_0.body.credential.schema.minorVersion >= 0n && submission_0.body.credential.schema.minorVersion <= 65535n && typeof(submission_0.body.credential.issuerVerificationMethodRef) === 'object' && typeof(submission_0.body.credential.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credential.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credential.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credential.holderBinding) === 'object' && typeof(submission_0.body.credential.holderBinding.holderVerificationMethodRef) === 'object' && typeof(submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credential.statusBinding) === 'object' && typeof(submission_0.body.credential.issuedAt) === 'bigint' && submission_0.body.credential.issuedAt >= 0n && submission_0.body.credential.issuedAt <= 18446744073709551615n && typeof(submission_0.body.credential.hasExpiration) === 'boolean' && typeof(submission_0.body.credential.expiresAt) === 'bigint' && submission_0.body.credential.expiresAt >= 0n && submission_0.body.credential.expiresAt <= 18446744073709551615n && typeof(submission_0.body.credential.claims) === 'object' && typeof(submission_0.body.credential.claimCommitments) === 'object' && submission_0.body.credential.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.subjectIdCommitment.length === 32 && submission_0.body.credential.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.legalNameCommitment.length === 32 && submission_0.body.credential.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.birthDateCommitment.length === 32 && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.length === 32 && submission_0.body.credential.claimRoot.buffer instanceof ArrayBuffer && submission_0.body.credential.claimRoot.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimRoot.length === 32 && typeof(submission_0.body.credentialProof) === 'object' && typeof(submission_0.body.credentialProof.signerVerificationMethodRef) === 'object' && typeof(submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credentialProof.createdAt) === 'bigint' && submission_0.body.credentialProof.createdAt >= 0n && submission_0.body.credentialProof.createdAt <= 18446744073709551615n && submission_0.body.credentialProof.challengeHash.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.challengeHash.length === 32 && true && typeof(submission_0.body.credentialProof.signature) === 'object' && true && typeof(submission_0.body.credentialProof.signature.s) === 'bigint' && submission_0.body.credentialProof.signature.s >= 0 && submission_0.body.credentialProof.signature.s <= __compactRuntime.MAX_FIELD && typeof(submission_0.body.presentation) === 'object' && typeof(submission_0.body.presentation.version) === 'bigint' && submission_0.body.presentation.version >= 0n && submission_0.body.presentation.version <= 65535n && typeof(submission_0.body.presentation.schema) === 'object' && submission_0.body.presentation.schema.packageId.buffer instanceof ArrayBuffer && submission_0.body.presentation.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.schema.packageId.length === 32 && submission_0.body.presentation.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.body.presentation.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.schema.schemaId.length === 32 && typeof(submission_0.body.presentation.schema.majorVersion) === 'bigint' && submission_0.body.presentation.schema.majorVersion >= 0n && submission_0.body.presentation.schema.majorVersion <= 65535n && typeof(submission_0.body.presentation.schema.minorVersion) === 'bigint' && submission_0.body.presentation.schema.minorVersion >= 0n && submission_0.body.presentation.schema.minorVersion <= 65535n && submission_0.body.presentation.credentialClaimRoot.buffer instanceof ArrayBuffer && submission_0.body.presentation.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.credentialClaimRoot.length === 32 && typeof(submission_0.body.presentation.issuerVerificationMethodRef) === 'object' && typeof(submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentation.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentation.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentation.holderBinding) === 'object' && typeof(submission_0.body.presentation.holderBinding.holderVerificationMethodRef) === 'object' && typeof(submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentation.disclosed) === 'object' && typeof(submission_0.body.presentation.disclosed.revealSubjectIdCommitment) === 'boolean' && submission_0.body.presentation.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.subjectIdCommitment.length === 32 && typeof(submission_0.body.presentation.disclosed.revealBirthCountryCode) === 'boolean' && submission_0.body.presentation.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.birthCountryCodePadded.length === 32 && submission_0.body.presentation.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.birthCountryCodeOpening.length === 32 && typeof(submission_0.body.presentation.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(submission_0.body.presentation.disclosed.ageThresholdYears) === 'bigint' && submission_0.body.presentation.disclosed.ageThresholdYears >= 0n && submission_0.body.presentation.disclosed.ageThresholdYears <= 255n && typeof(submission_0.body.presentationProof) === 'object' && typeof(submission_0.body.presentationProof.signerVerificationMethodRef) === 'object' && typeof(submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentationProof.createdAt) === 'bigint' && submission_0.body.presentationProof.createdAt >= 0n && submission_0.body.presentationProof.createdAt <= 18446744073709551615n && submission_0.body.presentationProof.challengeHash.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.challengeHash.length === 32 && true && typeof(submission_0.body.presentationProof.signature) === 'object' && true && typeof(submission_0.body.presentationProof.signature.s) === 'bigint' && submission_0.body.presentationProof.signature.s >= 0 && submission_0.body.presentationProof.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertBirthCredentialVerificationSubmissionMatchesRequest',
                                 'argument 2',
                                 'validation.compact line 148 char 1',
                                 'struct SubmissionMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, challengeHash: Bytes<32>, body: struct BirthCredentialVerificationSubmissionBody<credential: struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>, credentialProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>, presentation: struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>, presentationProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>>>',
                                 submission_0)
    }
    return _dummyContract._assertBirthCredentialVerificationSubmissionMatchesRequest_0(request_0,
                                                                                       submission_0);
  },
  assertValidBirthCredentialVerificationResultMessage: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialVerificationResultMessage: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const result_0 = args_0[0];
    if (!(typeof(result_0) === 'object' && typeof(result_0.envelope) === 'object' && typeof(result_0.envelope.version) === 'bigint' && result_0.envelope.version >= 0n && result_0.envelope.version <= 65535n && result_0.envelope.messageId.buffer instanceof ArrayBuffer && result_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.messageId.length === 32 && result_0.envelope.threadId.buffer instanceof ArrayBuffer && result_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && result_0.envelope.threadId.length === 32 && typeof(result_0.envelope.initialMessage) === 'boolean' && result_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && result_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.respondsToMessageId.length === 32 && typeof(result_0.envelope.createdAt) === 'bigint' && result_0.envelope.createdAt >= 0n && result_0.envelope.createdAt <= 18446744073709551615n && typeof(result_0.envelope.hasExpiresAt) === 'boolean' && typeof(result_0.envelope.expiresAt) === 'bigint' && result_0.envelope.expiresAt >= 0n && result_0.envelope.expiresAt <= 18446744073709551615n && typeof(result_0.approved) === 'boolean' && typeof(result_0.body) === 'object' && result_0.body.credentialRoot.buffer instanceof ArrayBuffer && result_0.body.credentialRoot.BYTES_PER_ELEMENT === 1 && result_0.body.credentialRoot.length === 32 && typeof(result_0.body.verifiedThresholdYears) === 'bigint' && result_0.body.verifiedThresholdYears >= 0n && result_0.body.verifiedThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertValidBirthCredentialVerificationResultMessage',
                                 'argument 1',
                                 'validation.compact line 166 char 1',
                                 'struct ResultMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, approved: Boolean, body: struct BirthCredentialVerificationResultBody<credentialRoot: Bytes<32>, verifiedThresholdYears: Uint<0..256>>>',
                                 result_0)
    }
    return _dummyContract._assertValidBirthCredentialVerificationResultMessage_0(result_0);
  },
  assertBirthCredentialVerificationResultMatchesSubmission: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertBirthCredentialVerificationResultMatchesSubmission: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const submission_0 = args_0[0];
    const result_0 = args_0[1];
    if (!(typeof(submission_0) === 'object' && typeof(submission_0.envelope) === 'object' && typeof(submission_0.envelope.version) === 'bigint' && submission_0.envelope.version >= 0n && submission_0.envelope.version <= 65535n && submission_0.envelope.messageId.buffer instanceof ArrayBuffer && submission_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.messageId.length === 32 && submission_0.envelope.threadId.buffer instanceof ArrayBuffer && submission_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.threadId.length === 32 && typeof(submission_0.envelope.initialMessage) === 'boolean' && submission_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && submission_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && submission_0.envelope.respondsToMessageId.length === 32 && typeof(submission_0.envelope.createdAt) === 'bigint' && submission_0.envelope.createdAt >= 0n && submission_0.envelope.createdAt <= 18446744073709551615n && typeof(submission_0.envelope.hasExpiresAt) === 'boolean' && typeof(submission_0.envelope.expiresAt) === 'bigint' && submission_0.envelope.expiresAt >= 0n && submission_0.envelope.expiresAt <= 18446744073709551615n && typeof(submission_0.schema) === 'object' && submission_0.schema.packageId.buffer instanceof ArrayBuffer && submission_0.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.schema.packageId.length === 32 && submission_0.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.schema.schemaId.length === 32 && typeof(submission_0.schema.majorVersion) === 'bigint' && submission_0.schema.majorVersion >= 0n && submission_0.schema.majorVersion <= 65535n && typeof(submission_0.schema.minorVersion) === 'bigint' && submission_0.schema.minorVersion >= 0n && submission_0.schema.minorVersion <= 65535n && typeof(submission_0.issuerVerificationMethodRef) === 'object' && typeof(submission_0.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.holderBindingProfile) === 'number' && submission_0.holderBindingProfile >= 0 && submission_0.holderBindingProfile <= 2 && submission_0.challengeHash.buffer instanceof ArrayBuffer && submission_0.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.challengeHash.length === 32 && typeof(submission_0.body) === 'object' && typeof(submission_0.body.credential) === 'object' && typeof(submission_0.body.credential.version) === 'bigint' && submission_0.body.credential.version >= 0n && submission_0.body.credential.version <= 65535n && typeof(submission_0.body.credential.schema) === 'object' && submission_0.body.credential.schema.packageId.buffer instanceof ArrayBuffer && submission_0.body.credential.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.schema.packageId.length === 32 && submission_0.body.credential.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.body.credential.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.schema.schemaId.length === 32 && typeof(submission_0.body.credential.schema.majorVersion) === 'bigint' && submission_0.body.credential.schema.majorVersion >= 0n && submission_0.body.credential.schema.majorVersion <= 65535n && typeof(submission_0.body.credential.schema.minorVersion) === 'bigint' && submission_0.body.credential.schema.minorVersion >= 0n && submission_0.body.credential.schema.minorVersion <= 65535n && typeof(submission_0.body.credential.issuerVerificationMethodRef) === 'object' && typeof(submission_0.body.credential.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credential.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credential.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credential.holderBinding) === 'object' && typeof(submission_0.body.credential.holderBinding.holderVerificationMethodRef) === 'object' && typeof(submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credential.statusBinding) === 'object' && typeof(submission_0.body.credential.issuedAt) === 'bigint' && submission_0.body.credential.issuedAt >= 0n && submission_0.body.credential.issuedAt <= 18446744073709551615n && typeof(submission_0.body.credential.hasExpiration) === 'boolean' && typeof(submission_0.body.credential.expiresAt) === 'bigint' && submission_0.body.credential.expiresAt >= 0n && submission_0.body.credential.expiresAt <= 18446744073709551615n && typeof(submission_0.body.credential.claims) === 'object' && typeof(submission_0.body.credential.claimCommitments) === 'object' && submission_0.body.credential.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.subjectIdCommitment.length === 32 && submission_0.body.credential.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.legalNameCommitment.length === 32 && submission_0.body.credential.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.birthDateCommitment.length === 32 && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimCommitments.birthCountryCodeCommitment.length === 32 && submission_0.body.credential.claimRoot.buffer instanceof ArrayBuffer && submission_0.body.credential.claimRoot.BYTES_PER_ELEMENT === 1 && submission_0.body.credential.claimRoot.length === 32 && typeof(submission_0.body.credentialProof) === 'object' && typeof(submission_0.body.credentialProof.signerVerificationMethodRef) === 'object' && typeof(submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.signerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.credentialProof.createdAt) === 'bigint' && submission_0.body.credentialProof.createdAt >= 0n && submission_0.body.credentialProof.createdAt <= 18446744073709551615n && submission_0.body.credentialProof.challengeHash.buffer instanceof ArrayBuffer && submission_0.body.credentialProof.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.body.credentialProof.challengeHash.length === 32 && true && typeof(submission_0.body.credentialProof.signature) === 'object' && true && typeof(submission_0.body.credentialProof.signature.s) === 'bigint' && submission_0.body.credentialProof.signature.s >= 0 && submission_0.body.credentialProof.signature.s <= __compactRuntime.MAX_FIELD && typeof(submission_0.body.presentation) === 'object' && typeof(submission_0.body.presentation.version) === 'bigint' && submission_0.body.presentation.version >= 0n && submission_0.body.presentation.version <= 65535n && typeof(submission_0.body.presentation.schema) === 'object' && submission_0.body.presentation.schema.packageId.buffer instanceof ArrayBuffer && submission_0.body.presentation.schema.packageId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.schema.packageId.length === 32 && submission_0.body.presentation.schema.schemaId.buffer instanceof ArrayBuffer && submission_0.body.presentation.schema.schemaId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.schema.schemaId.length === 32 && typeof(submission_0.body.presentation.schema.majorVersion) === 'bigint' && submission_0.body.presentation.schema.majorVersion >= 0n && submission_0.body.presentation.schema.majorVersion <= 65535n && typeof(submission_0.body.presentation.schema.minorVersion) === 'bigint' && submission_0.body.presentation.schema.minorVersion >= 0n && submission_0.body.presentation.schema.minorVersion <= 65535n && submission_0.body.presentation.credentialClaimRoot.buffer instanceof ArrayBuffer && submission_0.body.presentation.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.credentialClaimRoot.length === 32 && typeof(submission_0.body.presentation.issuerVerificationMethodRef) === 'object' && typeof(submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentation.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentation.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.issuerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentation.holderBinding) === 'object' && typeof(submission_0.body.presentation.holderBinding.holderVerificationMethodRef) === 'object' && typeof(submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentation.disclosed) === 'object' && typeof(submission_0.body.presentation.disclosed.revealSubjectIdCommitment) === 'boolean' && submission_0.body.presentation.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.subjectIdCommitment.length === 32 && typeof(submission_0.body.presentation.disclosed.revealBirthCountryCode) === 'boolean' && submission_0.body.presentation.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.birthCountryCodePadded.length === 32 && submission_0.body.presentation.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && submission_0.body.presentation.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && submission_0.body.presentation.disclosed.birthCountryCodeOpening.length === 32 && typeof(submission_0.body.presentation.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(submission_0.body.presentation.disclosed.ageThresholdYears) === 'bigint' && submission_0.body.presentation.disclosed.ageThresholdYears >= 0n && submission_0.body.presentation.disclosed.ageThresholdYears <= 255n && typeof(submission_0.body.presentationProof) === 'object' && typeof(submission_0.body.presentationProof.signerVerificationMethodRef) === 'object' && typeof(submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress) === 'object' && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.signerVerificationMethodRef.methodId.length === 32 && typeof(submission_0.body.presentationProof.createdAt) === 'bigint' && submission_0.body.presentationProof.createdAt >= 0n && submission_0.body.presentationProof.createdAt <= 18446744073709551615n && submission_0.body.presentationProof.challengeHash.buffer instanceof ArrayBuffer && submission_0.body.presentationProof.challengeHash.BYTES_PER_ELEMENT === 1 && submission_0.body.presentationProof.challengeHash.length === 32 && true && typeof(submission_0.body.presentationProof.signature) === 'object' && true && typeof(submission_0.body.presentationProof.signature.s) === 'bigint' && submission_0.body.presentationProof.signature.s >= 0 && submission_0.body.presentationProof.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertBirthCredentialVerificationResultMatchesSubmission',
                                 'argument 1',
                                 'validation.compact line 178 char 1',
                                 'struct SubmissionMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBindingProfile: Enum<HolderBindingProfile, explicitDid, secretHolder, blindedSecretHolder>, challengeHash: Bytes<32>, body: struct BirthCredentialVerificationSubmissionBody<credential: struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>, credentialProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>, presentation: struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>, presentationProof: struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>>>',
                                 submission_0)
    }
    if (!(typeof(result_0) === 'object' && typeof(result_0.envelope) === 'object' && typeof(result_0.envelope.version) === 'bigint' && result_0.envelope.version >= 0n && result_0.envelope.version <= 65535n && result_0.envelope.messageId.buffer instanceof ArrayBuffer && result_0.envelope.messageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.messageId.length === 32 && result_0.envelope.threadId.buffer instanceof ArrayBuffer && result_0.envelope.threadId.BYTES_PER_ELEMENT === 1 && result_0.envelope.threadId.length === 32 && typeof(result_0.envelope.initialMessage) === 'boolean' && result_0.envelope.respondsToMessageId.buffer instanceof ArrayBuffer && result_0.envelope.respondsToMessageId.BYTES_PER_ELEMENT === 1 && result_0.envelope.respondsToMessageId.length === 32 && typeof(result_0.envelope.createdAt) === 'bigint' && result_0.envelope.createdAt >= 0n && result_0.envelope.createdAt <= 18446744073709551615n && typeof(result_0.envelope.hasExpiresAt) === 'boolean' && typeof(result_0.envelope.expiresAt) === 'bigint' && result_0.envelope.expiresAt >= 0n && result_0.envelope.expiresAt <= 18446744073709551615n && typeof(result_0.approved) === 'boolean' && typeof(result_0.body) === 'object' && result_0.body.credentialRoot.buffer instanceof ArrayBuffer && result_0.body.credentialRoot.BYTES_PER_ELEMENT === 1 && result_0.body.credentialRoot.length === 32 && typeof(result_0.body.verifiedThresholdYears) === 'bigint' && result_0.body.verifiedThresholdYears >= 0n && result_0.body.verifiedThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertBirthCredentialVerificationResultMatchesSubmission',
                                 'argument 2',
                                 'validation.compact line 178 char 1',
                                 'struct ResultMessage<envelope: struct ProtocolMessageEnvelope<version: Uint<0..65536>, messageId: Bytes<32>, threadId: Bytes<32>, initialMessage: Boolean, respondsToMessageId: Bytes<32>, createdAt: Uint<0..18446744073709551616>, hasExpiresAt: Boolean, expiresAt: Uint<0..18446744073709551616>>, approved: Boolean, body: struct BirthCredentialVerificationResultBody<credentialRoot: Bytes<32>, verifiedThresholdYears: Uint<0..256>>>',
                                 result_0)
    }
    return _dummyContract._assertBirthCredentialVerificationResultMatchesSubmission_0(submission_0,
                                                                                      result_0);
  },
  assertValidBirthCredential: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredential: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidBirthCredential',
                                 'argument 1',
                                 'validation.compact line 199 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidBirthCredential',
                                 'argument 2',
                                 'validation.compact line 199 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidBirthCredential_0(credential_0, proof_0);
  },
  assertValidBirthCredentialPresentation: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialPresentation: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const presentation_0 = args_0[2];
    const presentationProof_0 = args_0[3];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidBirthCredentialPresentation',
                                 'argument 1',
                                 'validation.compact line 213 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidBirthCredentialPresentation',
                                 'argument 2',
                                 'validation.compact line 213 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertValidBirthCredentialPresentation',
                                 'argument 3',
                                 'validation.compact line 213 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidBirthCredentialPresentation',
                                 'argument 4',
                                 'validation.compact line 213 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertValidBirthCredentialPresentation_0(credential_0,
                                                                    credentialProof_0,
                                                                    presentation_0,
                                                                    presentationProof_0);
  },
  assertBirthPresentationSatisfiesRequest: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`assertBirthPresentationSatisfiesRequest: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const request_0 = args_0[1];
    const presentation_0 = args_0[2];
    const presentationProof_0 = args_0[3];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertBirthPresentationSatisfiesRequest',
                                 'argument 1',
                                 'validation.compact line 265 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireSubjectIdCommitmentDisclosure) === 'boolean' && typeof(request_0.requireBirthCountryDisclosure) === 'boolean' && typeof(request_0.requireAgeOverThreshold) === 'boolean' && typeof(request_0.requestedAgeThresholdYears) === 'bigint' && request_0.requestedAgeThresholdYears >= 0n && request_0.requestedAgeThresholdYears <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertBirthPresentationSatisfiesRequest',
                                 'argument 2',
                                 'validation.compact line 265 char 1',
                                 'struct BirthCredentialPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireSubjectIdCommitmentDisclosure: Boolean, requireBirthCountryDisclosure: Boolean, requireAgeOverThreshold: Boolean, requestedAgeThresholdYears: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertBirthPresentationSatisfiesRequest',
                                 'argument 3',
                                 'validation.compact line 265 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertBirthPresentationSatisfiesRequest',
                                 'argument 4',
                                 'validation.compact line 265 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertBirthPresentationSatisfiesRequest_0(credential_0,
                                                                     request_0,
                                                                     presentation_0,
                                                                     presentationProof_0);
  },
  assertValidBirthCredentialAgePredicate: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`assertValidBirthCredentialAgePredicate: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const presentation_0 = args_0[1];
    const currentDay_0 = args_0[2];
    const birthDateDays_0 = args_0[3];
    const birthDateOpening_0 = args_0[4];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.subjectIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.subjectIdCommitment.length === 32 && credential_0.claimCommitments.legalNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.legalNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.legalNameCommitment.length === 32 && credential_0.claimCommitments.birthDateCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthDateCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthDateCommitment.length === 32 && credential_0.claimCommitments.birthCountryCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.birthCountryCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.birthCountryCodeCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidBirthCredentialAgePredicate',
                                 'argument 1',
                                 'validation.compact line 317 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct NoPublicClaims<>, claimCommitments: struct BirthCredentialClaimCommitments<subjectIdCommitment: Bytes<32>, legalNameCommitment: Bytes<32>, birthDateCommitment: Bytes<32>, birthCountryCodeCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealSubjectIdCommitment) === 'boolean' && presentation_0.disclosed.subjectIdCommitment.buffer instanceof ArrayBuffer && presentation_0.disclosed.subjectIdCommitment.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.subjectIdCommitment.length === 32 && typeof(presentation_0.disclosed.revealBirthCountryCode) === 'boolean' && presentation_0.disclosed.birthCountryCodePadded.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodePadded.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodePadded.length === 32 && presentation_0.disclosed.birthCountryCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.birthCountryCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.birthCountryCodeOpening.length === 32 && typeof(presentation_0.disclosed.proveAgeOverThreshold) === 'boolean' && typeof(presentation_0.disclosed.ageThresholdYears) === 'bigint' && presentation_0.disclosed.ageThresholdYears >= 0n && presentation_0.disclosed.ageThresholdYears <= 255n)) {
      __compactRuntime.typeError('assertValidBirthCredentialAgePredicate',
                                 'argument 2',
                                 'validation.compact line 317 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct BirthCredentialDisclosures<revealSubjectIdCommitment: Boolean, subjectIdCommitment: Bytes<32>, revealBirthCountryCode: Boolean, birthCountryCodePadded: Bytes<32>, birthCountryCodeOpening: Bytes<32>, proveAgeOverThreshold: Boolean, ageThresholdYears: Uint<0..256>>>',
                                 presentation_0)
    }
    if (!(typeof(currentDay_0) === 'bigint' && currentDay_0 >= 0n && currentDay_0 <= 4294967295n)) {
      __compactRuntime.typeError('assertValidBirthCredentialAgePredicate',
                                 'argument 3',
                                 'validation.compact line 317 char 1',
                                 'Uint<0..4294967296>',
                                 currentDay_0)
    }
    if (!(typeof(birthDateDays_0) === 'bigint' && birthDateDays_0 >= 0n && birthDateDays_0 <= 4294967295n)) {
      __compactRuntime.typeError('assertValidBirthCredentialAgePredicate',
                                 'argument 4',
                                 'validation.compact line 317 char 1',
                                 'Uint<0..4294967296>',
                                 birthDateDays_0)
    }
    if (!(birthDateOpening_0.buffer instanceof ArrayBuffer && birthDateOpening_0.BYTES_PER_ELEMENT === 1 && birthDateOpening_0.length === 32)) {
      __compactRuntime.typeError('assertValidBirthCredentialAgePredicate',
                                 'argument 5',
                                 'validation.compact line 317 char 1',
                                 'Bytes<32>',
                                 birthDateOpening_0)
    }
    return _dummyContract._assertValidBirthCredentialAgePredicate_0(credential_0,
                                                                    presentation_0,
                                                                    currentDay_0,
                                                                    birthDateDays_0,
                                                                    birthDateOpening_0);
  },
  ageGateRequestForPolicy: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`ageGateRequestForPolicy: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const issuerVerificationMethodRef_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    const requireBirthCountryDisclosure_0 = args_0[2];
    const requestedAgeThresholdYears_0 = args_0[3];
    if (!(typeof(issuerVerificationMethodRef_0) === 'object' && typeof(issuerVerificationMethodRef_0.didContractAddress) === 'object' && issuerVerificationMethodRef_0.didContractAddress.bytes.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.didContractAddress.bytes.length === 32 && issuerVerificationMethodRef_0.methodId.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.methodId.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.methodId.length === 32)) {
      __compactRuntime.typeError('ageGateRequestForPolicy',
                                 'argument 1',
                                 'demo.compact line 51 char 1',
                                 'struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>',
                                 issuerVerificationMethodRef_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('ageGateRequestForPolicy',
                                 'argument 2',
                                 'demo.compact line 51 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    if (!(typeof(requireBirthCountryDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('ageGateRequestForPolicy',
                                 'argument 3',
                                 'demo.compact line 51 char 1',
                                 'Boolean',
                                 requireBirthCountryDisclosure_0)
    }
    if (!(typeof(requestedAgeThresholdYears_0) === 'bigint' && requestedAgeThresholdYears_0 >= 0n && requestedAgeThresholdYears_0 <= 255n)) {
      __compactRuntime.typeError('ageGateRequestForPolicy',
                                 'argument 4',
                                 'demo.compact line 51 char 1',
                                 'Uint<0..256>',
                                 requestedAgeThresholdYears_0)
    }
    return _dummyContract._ageGateRequestForPolicy_0(issuerVerificationMethodRef_0,
                                                     verifierChallengeHash_0,
                                                     requireBirthCountryDisclosure_0,
                                                     requestedAgeThresholdYears_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
