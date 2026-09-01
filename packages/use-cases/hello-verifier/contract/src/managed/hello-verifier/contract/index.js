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

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(452312848583266388373324160190187140051835877600158453279131187530910662655n, 31);

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _SchemaRef_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment())));
  }
  fromValue(value_0) {
    return {
      packageId: _descriptor_1.fromValue(value_0),
      schemaId: _descriptor_1.fromValue(value_0),
      majorVersion: _descriptor_3.fromValue(value_0),
      minorVersion: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.packageId).concat(_descriptor_1.toValue(value_0.schemaId).concat(_descriptor_3.toValue(value_0.majorVersion).concat(_descriptor_3.toValue(value_0.minorVersion))));
  }
}

const _descriptor_4 = new _SchemaRef_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_5 = new _ContractAddress_0();

class _VerificationMethodRef_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      didContractAddress: _descriptor_5.fromValue(value_0),
      methodId: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.didContractAddress).concat(_descriptor_1.toValue(value_0.methodId));
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

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_11 = __compactRuntime.CompactTypeField;

const _descriptor_12 = new __compactRuntime.CompactTypeVector(2, _descriptor_2);

const _descriptor_13 = new __compactRuntime.CompactTypeVector(2, _descriptor_9);

const _descriptor_14 = new __compactRuntime.CompactTypeBytes(16);

const _descriptor_15 = new __compactRuntime.CompactTypeVector(2, _descriptor_14);

const _descriptor_16 = new __compactRuntime.CompactTypeVector(2, _descriptor_11);

class _HelloFamilyClaims_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_10.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_11.alignment().concat(_descriptor_12.alignment().concat(_descriptor_13.alignment().concat(_descriptor_15.alignment().concat(_descriptor_16.alignment()))))))));
  }
  fromValue(value_0) {
    return {
      booleanValue: _descriptor_2.fromValue(value_0),
      smallUintValue: _descriptor_10.fromValue(value_0),
      bigUnsignedValue: _descriptor_0.fromValue(value_0),
      bytesValue: _descriptor_1.fromValue(value_0),
      fieldValue: _descriptor_11.fromValue(value_0),
      booleanVector: _descriptor_12.fromValue(value_0),
      uintVector: _descriptor_13.fromValue(value_0),
      bytesVector: _descriptor_15.fromValue(value_0),
      fieldVector: _descriptor_16.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.booleanValue).concat(_descriptor_10.toValue(value_0.smallUintValue).concat(_descriptor_0.toValue(value_0.bigUnsignedValue).concat(_descriptor_1.toValue(value_0.bytesValue).concat(_descriptor_11.toValue(value_0.fieldValue).concat(_descriptor_12.toValue(value_0.booleanVector).concat(_descriptor_13.toValue(value_0.uintVector).concat(_descriptor_15.toValue(value_0.bytesVector).concat(_descriptor_16.toValue(value_0.fieldVector)))))))));
  }
}

const _descriptor_17 = new _HelloFamilyClaims_0();

class _NoClaimCommitments_0 {
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

const _descriptor_18 = new _NoClaimCommitments_0();

class _Credential_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment().concat(_descriptor_8.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_17.alignment().concat(_descriptor_18.alignment().concat(_descriptor_1.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_3.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBinding: _descriptor_7.fromValue(value_0),
      statusBinding: _descriptor_8.fromValue(value_0),
      issuedAt: _descriptor_9.fromValue(value_0),
      hasExpiration: _descriptor_2.fromValue(value_0),
      expiresAt: _descriptor_9.fromValue(value_0),
      claims: _descriptor_17.fromValue(value_0),
      claimCommitments: _descriptor_18.fromValue(value_0),
      claimRoot: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.version).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_7.toValue(value_0.holderBinding).concat(_descriptor_8.toValue(value_0.statusBinding).concat(_descriptor_9.toValue(value_0.issuedAt).concat(_descriptor_2.toValue(value_0.hasExpiration).concat(_descriptor_9.toValue(value_0.expiresAt).concat(_descriptor_17.toValue(value_0.claims).concat(_descriptor_18.toValue(value_0.claimCommitments).concat(_descriptor_1.toValue(value_0.claimRoot)))))))))));
  }
}

const _descriptor_19 = new _Credential_0();

const _descriptor_20 = __compactRuntime.CompactTypeJubjubPoint;

class _Signature_0 {
  alignment() {
    return _descriptor_20.alignment().concat(_descriptor_11.alignment());
  }
  fromValue(value_0) {
    return {
      r: _descriptor_20.fromValue(value_0),
      s: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_20.toValue(value_0.r).concat(_descriptor_11.toValue(value_0.s));
  }
}

const _descriptor_21 = new _Signature_0();

class _Proof_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment().concat(_descriptor_20.alignment().concat(_descriptor_21.alignment()))));
  }
  fromValue(value_0) {
    return {
      signerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      createdAt: _descriptor_9.fromValue(value_0),
      challengeHash: _descriptor_1.fromValue(value_0),
      publicKey: _descriptor_20.fromValue(value_0),
      signature: _descriptor_21.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.signerVerificationMethodRef).concat(_descriptor_9.toValue(value_0.createdAt).concat(_descriptor_1.toValue(value_0.challengeHash).concat(_descriptor_20.toValue(value_0.publicKey).concat(_descriptor_21.toValue(value_0.signature)))));
  }
}

const _descriptor_22 = new _Proof_0();

class _HelloFamilyPresentationRequest_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_6.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment()))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_3.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      requireBooleanValueDisclosure: _descriptor_2.fromValue(value_0),
      requireBytesValueDisclosure: _descriptor_2.fromValue(value_0),
      requireBigUnsignedValueDisclosure: _descriptor_2.fromValue(value_0),
      verifierChallengeHash: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.version).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_2.toValue(value_0.requireBooleanValueDisclosure).concat(_descriptor_2.toValue(value_0.requireBytesValueDisclosure).concat(_descriptor_2.toValue(value_0.requireBigUnsignedValueDisclosure).concat(_descriptor_1.toValue(value_0.verifierChallengeHash)))))));
  }
}

const _descriptor_23 = new _HelloFamilyPresentationRequest_0();

class _HelloFamilyDisclosures_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))));
  }
  fromValue(value_0) {
    return {
      revealBooleanValue: _descriptor_2.fromValue(value_0),
      booleanValue: _descriptor_2.fromValue(value_0),
      revealBytesValue: _descriptor_2.fromValue(value_0),
      bytesValue: _descriptor_1.fromValue(value_0),
      revealBigUnsignedValue: _descriptor_2.fromValue(value_0),
      bigUnsignedValue: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.revealBooleanValue).concat(_descriptor_2.toValue(value_0.booleanValue).concat(_descriptor_2.toValue(value_0.revealBytesValue).concat(_descriptor_1.toValue(value_0.bytesValue).concat(_descriptor_2.toValue(value_0.revealBigUnsignedValue).concat(_descriptor_0.toValue(value_0.bigUnsignedValue))))));
  }
}

const _descriptor_24 = new _HelloFamilyDisclosures_0();

class _Presentation_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_1.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment().concat(_descriptor_24.alignment())))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_3.fromValue(value_0),
      schema: _descriptor_4.fromValue(value_0),
      credentialClaimRoot: _descriptor_1.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_6.fromValue(value_0),
      holderBinding: _descriptor_7.fromValue(value_0),
      disclosed: _descriptor_24.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.version).concat(_descriptor_4.toValue(value_0.schema).concat(_descriptor_1.toValue(value_0.credentialClaimRoot).concat(_descriptor_6.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_7.toValue(value_0.holderBinding).concat(_descriptor_24.toValue(value_0.disclosed))))));
  }
}

const _descriptor_25 = new _Presentation_0();

const _descriptor_26 = new __compactRuntime.CompactTypeEnum(0, 0);

class _StatusRegistryRef_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_6.alignment());
  }
  fromValue(value_0) {
    return {
      registryId: _descriptor_1.fromValue(value_0),
      authorityVerificationMethodRef: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.registryId).concat(_descriptor_6.toValue(value_0.authorityVerificationMethodRef));
  }
}

const _descriptor_27 = new _StatusRegistryRef_0();

class _RegistryBoundStatusBinding_0 {
  alignment() {
    return _descriptor_26.alignment().concat(_descriptor_27.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      statusType: _descriptor_26.fromValue(value_0),
      registryRef: _descriptor_27.fromValue(value_0),
      statusHandleCommitment: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_26.toValue(value_0.statusType).concat(_descriptor_27.toValue(value_0.registryRef).concat(_descriptor_1.toValue(value_0.statusHandleCommitment)));
  }
}

const _descriptor_28 = new _RegistryBoundStatusBinding_0();

class _ProtocolMessageEnvelope_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment())))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_3.fromValue(value_0),
      messageId: _descriptor_1.fromValue(value_0),
      threadId: _descriptor_1.fromValue(value_0),
      initialMessage: _descriptor_2.fromValue(value_0),
      respondsToMessageId: _descriptor_1.fromValue(value_0),
      createdAt: _descriptor_9.fromValue(value_0),
      hasExpiresAt: _descriptor_2.fromValue(value_0),
      expiresAt: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.version).concat(_descriptor_1.toValue(value_0.messageId).concat(_descriptor_1.toValue(value_0.threadId).concat(_descriptor_2.toValue(value_0.initialMessage).concat(_descriptor_1.toValue(value_0.respondsToMessageId).concat(_descriptor_9.toValue(value_0.createdAt).concat(_descriptor_2.toValue(value_0.hasExpiresAt).concat(_descriptor_9.toValue(value_0.expiresAt))))))));
  }
}

const _descriptor_29 = new _ProtocolMessageEnvelope_0();

class _CredentialProtocolFeatures_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      supportsSelectiveDisclosure: _descriptor_2.fromValue(value_0),
      supportsPredicateProofs: _descriptor_2.fromValue(value_0),
      supportsVerifierScopedPseudonym: _descriptor_2.fromValue(value_0),
      supportsSameHolderProof: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.supportsSelectiveDisclosure).concat(_descriptor_2.toValue(value_0.supportsPredicateProofs).concat(_descriptor_2.toValue(value_0.supportsVerifierScopedPseudonym).concat(_descriptor_2.toValue(value_0.supportsSameHolderProof))));
  }
}

const _descriptor_30 = new _CredentialProtocolFeatures_0();

class _SchemaCapabilities_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      supportsSelectiveDisclosure: _descriptor_2.fromValue(value_0),
      supportsPredicateProofs: _descriptor_2.fromValue(value_0),
      supportsVerifierScopedPseudonym: _descriptor_2.fromValue(value_0),
      supportsSameHolderProof: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.supportsSelectiveDisclosure).concat(_descriptor_2.toValue(value_0.supportsPredicateProofs).concat(_descriptor_2.toValue(value_0.supportsVerifierScopedPseudonym).concat(_descriptor_2.toValue(value_0.supportsSameHolderProof))));
  }
}

const _descriptor_31 = new _SchemaCapabilities_0();

class _SecretHolderBinding_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      holderSecretCommitment: _descriptor_1.fromValue(value_0),
      requestChallengeResponse: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.holderSecretCommitment).concat(_descriptor_1.toValue(value_0.requestChallengeResponse));
  }
}

const _descriptor_32 = new _SecretHolderBinding_0();

class _BlindedSecretHolderBinding_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      blindedHolderSecretCommitment: _descriptor_1.fromValue(value_0),
      issuerNonce: _descriptor_1.fromValue(value_0),
      requestChallengeResponse: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.blindedHolderSecretCommitment).concat(_descriptor_1.toValue(value_0.issuerNonce).concat(_descriptor_1.toValue(value_0.requestChallengeResponse)));
  }
}

const _descriptor_33 = new _BlindedSecretHolderBinding_0();

class _OffchainMidnightHolderBinding_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_20.alignment()));
  }
  fromValue(value_0) {
    return {
      holderDidStateHash: _descriptor_1.fromValue(value_0),
      holderMethodId: _descriptor_1.fromValue(value_0),
      holderPublicKey: _descriptor_20.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.holderDidStateHash).concat(_descriptor_1.toValue(value_0.holderMethodId).concat(_descriptor_20.toValue(value_0.holderPublicKey)));
  }
}

const _descriptor_34 = new _OffchainMidnightHolderBinding_0();

class _JubjubHolderBinding_0 {
  alignment() {
    return _descriptor_20.alignment();
  }
  fromValue(value_0) {
    return {
      holderPublicKey: _descriptor_20.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_20.toValue(value_0.holderPublicKey);
  }
}

const _descriptor_35 = new _JubjubHolderBinding_0();

class _SchemaFamilyResolutionHint_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      hasResolverHint: _descriptor_2.fromValue(value_0),
      resolverHint: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.hasResolverHint).concat(_descriptor_1.toValue(value_0.resolverHint));
  }
}

const _descriptor_36 = new _SchemaFamilyResolutionHint_0();

class _SchemaDescriptor_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_31.alignment().concat(_descriptor_36.alignment()));
  }
  fromValue(value_0) {
    return {
      schema: _descriptor_4.fromValue(value_0),
      capabilities: _descriptor_31.fromValue(value_0),
      familyResolutionHint: _descriptor_36.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.schema).concat(_descriptor_31.toValue(value_0.capabilities).concat(_descriptor_36.toValue(value_0.familyResolutionHint)));
  }
}

const _descriptor_37 = new _SchemaDescriptor_0();

const _descriptor_38 = new __compactRuntime.CompactTypeVector(2, _descriptor_1);

const _descriptor_39 = new __compactRuntime.CompactTypeVector(3, _descriptor_1);

const _descriptor_40 = new __compactRuntime.CompactTypeVector(4, _descriptor_1);

const _descriptor_41 = new __compactRuntime.CompactTypeVector(5, _descriptor_1);

class _Either_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_1.fromValue(value_0),
      right: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_1.toValue(value_0.left).concat(_descriptor_1.toValue(value_0.right)));
  }
}

const _descriptor_42 = new _Either_0();

const _descriptor_43 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_44 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

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
      helloFamilyClaimPayloadRoot(context, ...args_1) {
        return { result: pureCircuits.helloFamilyClaimPayloadRoot(...args_1), context };
      },
      helloFamilyClaimRoot(context, ...args_1) {
        return { result: pureCircuits.helloFamilyClaimRoot(...args_1), context };
      },
      helloFamilyCredentialBodyRoot(context, ...args_1) {
        return { result: pureCircuits.helloFamilyCredentialBodyRoot(...args_1), context };
      },
      helloFamilyPresentationBodyRoot(context, ...args_1) {
        return { result: pureCircuits.helloFamilyPresentationBodyRoot(...args_1), context };
      },
      helloFamilyPresentationRequestBodyRoot(context, ...args_1) {
        return { result: pureCircuits.helloFamilyPresentationRequestBodyRoot(...args_1), context };
      },
      assertValidHelloFamilySchemaRef(context, ...args_1) {
        return { result: pureCircuits.assertValidHelloFamilySchemaRef(...args_1), context };
      },
      assertValidHelloFamilyPresentationRequest(context, ...args_1) {
        return { result: pureCircuits.assertValidHelloFamilyPresentationRequest(...args_1), context };
      },
      assertValidHelloFamilyCredential(context, ...args_1) {
        return { result: pureCircuits.assertValidHelloFamilyCredential(...args_1), context };
      },
      assertValidHelloFamilyPresentation(context, ...args_1) {
        return { result: pureCircuits.assertValidHelloFamilyPresentation(...args_1), context };
      },
      assertHelloFamilyPresentationSatisfiesRequest(context, ...args_1) {
        return { result: pureCircuits.assertHelloFamilyPresentationSatisfiesRequest(...args_1), context };
      },
      helloVerifierRequest(context, ...args_1) {
        return { result: pureCircuits.helloVerifierRequest(...args_1), context };
      },
      verifyHelloFamilyPresentationForHelloVerifier: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`verifyHelloFamilyPresentationForHelloVerifier: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const request_0 = args_1[3];
        const presentation_0 = args_1[4];
        const presentationProof_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifyHelloFamilyPresentationForHelloVerifier',
                                     'argument 1 (as invoked from Typescript)',
                                     'hello-verifier.compact line 50 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claims.booleanValue) === 'boolean' && typeof(credential_0.claims.smallUintValue) === 'bigint' && credential_0.claims.smallUintValue >= 0n && credential_0.claims.smallUintValue <= 255n && typeof(credential_0.claims.bigUnsignedValue) === 'bigint' && credential_0.claims.bigUnsignedValue >= 0n && credential_0.claims.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && credential_0.claims.bytesValue.buffer instanceof ArrayBuffer && credential_0.claims.bytesValue.BYTES_PER_ELEMENT === 1 && credential_0.claims.bytesValue.length === 32 && typeof(credential_0.claims.fieldValue) === 'bigint' && credential_0.claims.fieldValue >= 0 && credential_0.claims.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims.booleanVector) && credential_0.claims.booleanVector.length === 2 && credential_0.claims.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(credential_0.claims.uintVector) && credential_0.claims.uintVector.length === 2 && credential_0.claims.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(credential_0.claims.bytesVector) && credential_0.claims.bytesVector.length === 2 && credential_0.claims.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(credential_0.claims.fieldVector) && credential_0.claims.fieldVector.length === 2 && credential_0.claims.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD) && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('verifyHelloFamilyPresentationForHelloVerifier',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'hello-verifier.compact line 50 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyHelloFamilyPresentationForHelloVerifier',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'hello-verifier.compact line 50 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireBooleanValueDisclosure) === 'boolean' && typeof(request_0.requireBytesValueDisclosure) === 'boolean' && typeof(request_0.requireBigUnsignedValueDisclosure) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
          __compactRuntime.typeError('verifyHelloFamilyPresentationForHelloVerifier',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'hello-verifier.compact line 50 char 1',
                                     'struct HelloFamilyPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireBooleanValueDisclosure: Boolean, requireBytesValueDisclosure: Boolean, requireBigUnsignedValueDisclosure: Boolean, verifierChallengeHash: Bytes<32>>',
                                     request_0)
        }
        if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealBooleanValue) === 'boolean' && typeof(presentation_0.disclosed.booleanValue) === 'boolean' && typeof(presentation_0.disclosed.revealBytesValue) === 'boolean' && presentation_0.disclosed.bytesValue.buffer instanceof ArrayBuffer && presentation_0.disclosed.bytesValue.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.bytesValue.length === 32 && typeof(presentation_0.disclosed.revealBigUnsignedValue) === 'boolean' && typeof(presentation_0.disclosed.bigUnsignedValue) === 'bigint' && presentation_0.disclosed.bigUnsignedValue >= 0n && presentation_0.disclosed.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
          __compactRuntime.typeError('verifyHelloFamilyPresentationForHelloVerifier',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'hello-verifier.compact line 50 char 1',
                                     'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct HelloFamilyDisclosures<revealBooleanValue: Boolean, booleanValue: Boolean, revealBytesValue: Boolean, bytesValue: Bytes<32>, revealBigUnsignedValue: Boolean, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>>>',
                                     presentation_0)
        }
        if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyHelloFamilyPresentationForHelloVerifier',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'hello-verifier.compact line 50 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     presentationProof_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_19.toValue(credential_0).concat(_descriptor_22.toValue(credentialProof_0).concat(_descriptor_23.toValue(request_0).concat(_descriptor_25.toValue(presentation_0).concat(_descriptor_22.toValue(presentationProof_0))))),
            alignment: _descriptor_19.alignment().concat(_descriptor_22.alignment().concat(_descriptor_23.alignment().concat(_descriptor_25.alignment().concat(_descriptor_22.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifyHelloFamilyPresentationForHelloVerifier_0(context,
                                                                               partialProofData,
                                                                               credential_0,
                                                                               credentialProof_0,
                                                                               request_0,
                                                                               presentation_0,
                                                                               presentationProof_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      verifyHelloFamilyPresentationForHelloVerifier: this.circuits.verifyHelloFamilyPresentationForHelloVerifier
    };
    this.provableCircuits = {
      verifyHelloFamilyPresentationForHelloVerifier: this.circuits.verifyHelloFamilyPresentationForHelloVerifier
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
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('verifyHelloFamilyPresentationForHelloVerifier', new __compactRuntime.ContractOperation());
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
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_44.toValue(0n),
                                                                                              alignment: _descriptor_44.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(1n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(0n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(false),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(5n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(6n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_44.toValue(tmp_0),
                                                                                              alignment: _descriptor_44.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array([104, 101, 108, 108, 111, 45, 118, 101, 114, 105, 102, 105, 101, 114, 58, 110, 111, 110, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array([104, 101, 108, 108, 111, 45, 118, 101, 114, 105, 102, 105, 101, 114, 58, 110, 111, 45, 114, 101, 113, 117, 101, 115, 116, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(false),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(5n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(6n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_20, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_9, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_41, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_39, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_40, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_28, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_17, value_0);
    return result_0;
  }
  _persistentHash_6(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_38, value_0);
    return result_0;
  }
  _persistentHash_7(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_25, value_0);
    return result_0;
  }
  _persistentHash_8(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_23, value_0);
    return result_0;
  }
  _persistentHash_9(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_19, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_1,
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
    return this._persistentHash_0([bodyRoot_0,
                                   contextTag_0,
                                   this._persistentHash_1(proof_0.signerVerificationMethodRef),
                                   this._upgradeFromTransient_0(this._transientHash_1(proof_0.createdAt)),
                                   proof_0.challengeHash]);
  }
  _proofChallengeForContext_0(bodyRoot_0, contextTag_0, proof_0) {
    return this._degradeToTransient_0(this._persistentHash_2([this._proofPayloadRootForContext_0(bodyRoot_0,
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
    return this._persistentHash_9(credential_0);
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
    return this._persistentHash_7(presentation_0);
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
    return this._persistentCommit_0(holderSecret_0, opening_0);
  }
  _secretHolderBindingChallengeResponse_0(holderSecret_0,
                                          verifierChallengeHash_0)
  {
    return this._persistentHash_2([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 111, 108, 100, 101, 114, 45, 99, 104, 97, 108, 108, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   holderSecret_0,
                                   verifierChallengeHash_0]);
  }
  _verifierScopedPseudonym_0(holderSecret_0, verifierDomainHash_0) {
    return this._persistentHash_2([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 111, 108, 100, 101, 114, 45, 112, 115, 101, 117, 100, 111, 110, 121, 109, 0, 0, 0, 0]),
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
    return this._persistentHash_3([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 98, 108, 105, 110, 100, 45, 104, 111, 108, 100, 101, 114, 0, 0, 0, 0, 0, 0, 0, 0]),
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
  _assertValidStatusRegistryRef_0(registryRef_0) {
    __compactRuntime.assert(!this._equal_47(registryRef_0.registryId,
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
    __compactRuntime.assert(!this._equal_48(binding_0.statusHandleCommitment,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Status handle commitment must be set');
    return [];
  }
  _registryBoundStatusBindingRoot_0(binding_0) {
    this._assertValidRegistryBoundStatusBinding_0(binding_0);
    return this._persistentHash_4(binding_0);
  }
  _helloFamilyClaimPayloadRoot_0(claims_0) {
    return this._persistentHash_5(claims_0);
  }
  _helloFamilyClaimRoot_0(claims_0) {
    return this._persistentHash_6([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 101, 108, 108, 111, 45, 102, 97, 109, 105, 108, 121, 58, 118, 49, 0, 0, 0, 0, 0]),
                                   this._helloFamilyClaimPayloadRoot_0(claims_0)]);
  }
  _helloFamilyCredentialBodyRoot_0(credential_0) {
    return this._credentialBodyRoot_0(credential_0);
  }
  _helloFamilyPresentationBodyRoot_0(presentation_0) {
    return this._presentationBodyRoot_0(presentation_0);
  }
  _helloFamilyPresentationRequestBodyRoot_0(request_0) {
    return this._persistentHash_8(request_0);
  }
  _assertValidHelloFamilySchemaRef_0(schema_0) {
    __compactRuntime.assert(this._equal_49(schema_0.packageId,
                                           new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 101, 108, 108, 111, 45, 102, 97, 109, 105, 108, 121, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Hello-family package id mismatch');
    __compactRuntime.assert(this._equal_50(schema_0.schemaId,
                                           new Uint8Array([104, 101, 108, 108, 111, 45, 102, 97, 109, 105, 108, 121, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Hello-family schema id mismatch');
    __compactRuntime.assert(this._equal_51(schema_0.majorVersion, 1n),
                            'Hello-family major version mismatch');
    return [];
  }
  _assertValidHelloFamilyPresentationRequest_0(request_0) {
    __compactRuntime.assert(this._equal_52(request_0.version, 1n),
                            'Hello-family request version mismatch');
    this._assertValidHelloFamilySchemaRef_0(request_0.schema);
    this._assertValidVerificationMethodRef_0(request_0.issuerVerificationMethodRef);
    __compactRuntime.assert(!this._equal_53(request_0.verifierChallengeHash,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Hello-family verifier challenge must be set');
    return [];
  }
  _assertValidHelloFamilyCredential_0(credential_0, proof_0) {
    this._assertValidHelloFamilySchemaRef_0(credential_0.schema);
    this._assertValidCredentialEnvelope_0(credential_0,
                                          this._helloFamilyClaimRoot_0(credential_0.claims));
    this._assertValidExplicitHolderBinding_0(credential_0.holderBinding);
    this._assertValidNoStatusBinding_0(credential_0.statusBinding);
    this._assertValidCredentialProof_0(credential_0, proof_0);
    return [];
  }
  _assertValidHelloFamilyPresentation_0(credential_0,
                                        credentialProof_0,
                                        presentation_0,
                                        presentationProof_0)
  {
    this._assertValidHelloFamilyCredential_0(credential_0, credentialProof_0);
    this._assertValidHelloFamilySchemaRef_0(presentation_0.schema);
    this._assertValidPresentationEnvelope_0(presentation_0);
    this._assertMatchingCredentialPresentation_0(credential_0, presentation_0);
    this._assertValidExplicitHolderBinding_0(presentation_0.holderBinding);
    this._assertMatchingExplicitHolderBindings_0(credential_0.holderBinding,
                                                 presentation_0.holderBinding);
    this._assertProofMatchesExplicitHolderBinding_0(presentation_0.holderBinding,
                                                    presentationProof_0);
    this._assertValidPresentationContextProof_0(this._helloFamilyPresentationBodyRoot_0(presentation_0),
                                                presentationProof_0);
    if (presentation_0.disclosed.revealBooleanValue) {
      __compactRuntime.assert(presentation_0.disclosed.booleanValue
                              ===
                              credential_0.claims.booleanValue,
                              'Hello-family boolean disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealBytesValue) {
      __compactRuntime.assert(this._equal_54(presentation_0.disclosed.bytesValue,
                                             credential_0.claims.bytesValue),
                              'Hello-family bytes disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealBigUnsignedValue) {
      __compactRuntime.assert(this._equal_55(presentation_0.disclosed.bigUnsignedValue,
                                             credential_0.claims.bigUnsignedValue),
                              'Hello-family bigint-like disclosure does not match the credential');
    }
    return [];
  }
  _assertHelloFamilyPresentationSatisfiesRequest_0(credential_0,
                                                   credentialProof_0,
                                                   request_0,
                                                   presentation_0,
                                                   presentationProof_0)
  {
    this._assertValidHelloFamilyPresentationRequest_0(request_0);
    this._assertValidHelloFamilyPresentation_0(credential_0,
                                               credentialProof_0,
                                               presentation_0,
                                               presentationProof_0);
    this._assertMatchingSchemaRefs_0(request_0.schema, credential_0.schema);
    this._assertMatchingSchemaRefs_0(request_0.schema, presentation_0.schema);
    __compactRuntime.assert(this._equal_56(request_0.issuerVerificationMethodRef.didContractAddress,
                                           credential_0.issuerVerificationMethodRef.didContractAddress),
                            'Hello-family request issuer contract does not match the credential issuer');
    __compactRuntime.assert(this._equal_57(request_0.issuerVerificationMethodRef.methodId,
                                           credential_0.issuerVerificationMethodRef.methodId),
                            'Hello-family request issuer method does not match the credential issuer');
    __compactRuntime.assert(this._equal_58(presentationProof_0.challengeHash,
                                           request_0.verifierChallengeHash),
                            'Hello-family presentation proof challenge does not match the request');
    if (request_0.requireBooleanValueDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealBooleanValue,
                              'Hello-family request requires boolean disclosure');
    }
    if (request_0.requireBytesValueDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealBytesValue,
                              'Hello-family request requires bytes disclosure');
    }
    if (request_0.requireBigUnsignedValueDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealBigUnsignedValue,
                              'Hello-family request requires bigint-like disclosure');
    }
    return [];
  }
  _helloVerifierRequest_0(issuerVerificationMethodRef_0,
                          verifierChallengeHash_0,
                          requireBytesValueDisclosure_0)
  {
    return { version: 1n,
             schema:
               { packageId:
                   new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 101, 108, 108, 111, 45, 102, 97, 109, 105, 108, 121, 0, 0, 0, 0, 0, 0, 0, 0]),
                 schemaId:
                   new Uint8Array([104, 101, 108, 108, 111, 45, 102, 97, 109, 105, 108, 121, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                 majorVersion: 1n,
                 minorVersion: 0n },
             issuerVerificationMethodRef: issuerVerificationMethodRef_0,
             requireBooleanValueDisclosure: true,
             requireBytesValueDisclosure: requireBytesValueDisclosure_0,
             requireBigUnsignedValueDisclosure: true,
             verifierChallengeHash: verifierChallengeHash_0 };
  }
  _verifyHelloFamilyPresentationForHelloVerifier_0(context,
                                                   partialProofData,
                                                   credential_0,
                                                   credentialProof_0,
                                                   request_0,
                                                   presentation_0,
                                                   presentationProof_0)
  {
    const credentialRoot_0 = this._helloFamilyCredentialBodyRoot_0(credential_0);
    __compactRuntime.assert(request_0.requireBooleanValueDisclosure,
                            'Hello-verifier starter requires boolean disclosure');
    __compactRuntime.assert(request_0.requireBigUnsignedValueDisclosure,
                            'Hello-verifier starter requires big-unsigned disclosure');
    this._assertHelloFamilyPresentationSatisfiesRequest_0(credential_0,
                                                          credentialProof_0,
                                                          request_0,
                                                          presentation_0,
                                                          presentationProof_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(credentialRoot_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = request_0.verifierChallengeHash;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = presentation_0.disclosed.booleanValue;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_1),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_2 = presentation_0.disclosed.bigUnsignedValue;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(5n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const revealedBytesValue_0 = presentation_0.disclosed.revealBytesValue;
    if (revealedBytesValue_0) {
      const tmp_3 = presentation_0.disclosed.bytesValue;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(6n),
                                                                                                alignment: _descriptor_10.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_3),
                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    } else {
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(6n),
                                                                                                alignment: _descriptor_10.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    }
    const tmp_4 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_3.toValue(tmp_4),
                                                                alignment: _descriptor_3.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
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
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_48(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_49(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_50(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_51(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_52(x0, y0) {
    if (x0 !== y0) { return false; }
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
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_56(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_57(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_58(x0, y0) {
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
      return _descriptor_44.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_10.toValue(0n),
                                                                                                    alignment: _descriptor_10.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get successfulVerificationCount() {
      return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedCredentialRoot() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(2n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedRequestChallenge() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(3n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedBooleanValue() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(4n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedBigUnsignedValue() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(5n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedBytesValue() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(6n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
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
  helloFamilyClaimPayloadRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`helloFamilyClaimPayloadRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    if (!(typeof(claims_0) === 'object' && typeof(claims_0.booleanValue) === 'boolean' && typeof(claims_0.smallUintValue) === 'bigint' && claims_0.smallUintValue >= 0n && claims_0.smallUintValue <= 255n && typeof(claims_0.bigUnsignedValue) === 'bigint' && claims_0.bigUnsignedValue >= 0n && claims_0.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && claims_0.bytesValue.buffer instanceof ArrayBuffer && claims_0.bytesValue.BYTES_PER_ELEMENT === 1 && claims_0.bytesValue.length === 32 && typeof(claims_0.fieldValue) === 'bigint' && claims_0.fieldValue >= 0 && claims_0.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(claims_0.booleanVector) && claims_0.booleanVector.length === 2 && claims_0.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(claims_0.uintVector) && claims_0.uintVector.length === 2 && claims_0.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(claims_0.bytesVector) && claims_0.bytesVector.length === 2 && claims_0.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(claims_0.fieldVector) && claims_0.fieldVector.length === 2 && claims_0.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD))) {
      __compactRuntime.typeError('helloFamilyClaimPayloadRoot',
                                 'argument 1',
                                 'claims.compact line 17 char 1',
                                 'struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>',
                                 claims_0)
    }
    return _dummyContract._helloFamilyClaimPayloadRoot_0(claims_0);
  },
  helloFamilyClaimRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`helloFamilyClaimRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    if (!(typeof(claims_0) === 'object' && typeof(claims_0.booleanValue) === 'boolean' && typeof(claims_0.smallUintValue) === 'bigint' && claims_0.smallUintValue >= 0n && claims_0.smallUintValue <= 255n && typeof(claims_0.bigUnsignedValue) === 'bigint' && claims_0.bigUnsignedValue >= 0n && claims_0.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && claims_0.bytesValue.buffer instanceof ArrayBuffer && claims_0.bytesValue.BYTES_PER_ELEMENT === 1 && claims_0.bytesValue.length === 32 && typeof(claims_0.fieldValue) === 'bigint' && claims_0.fieldValue >= 0 && claims_0.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(claims_0.booleanVector) && claims_0.booleanVector.length === 2 && claims_0.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(claims_0.uintVector) && claims_0.uintVector.length === 2 && claims_0.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(claims_0.bytesVector) && claims_0.bytesVector.length === 2 && claims_0.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(claims_0.fieldVector) && claims_0.fieldVector.length === 2 && claims_0.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD))) {
      __compactRuntime.typeError('helloFamilyClaimRoot',
                                 'argument 1',
                                 'claims.compact line 23 char 1',
                                 'struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>',
                                 claims_0)
    }
    return _dummyContract._helloFamilyClaimRoot_0(claims_0);
  },
  helloFamilyCredentialBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`helloFamilyCredentialBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claims.booleanValue) === 'boolean' && typeof(credential_0.claims.smallUintValue) === 'bigint' && credential_0.claims.smallUintValue >= 0n && credential_0.claims.smallUintValue <= 255n && typeof(credential_0.claims.bigUnsignedValue) === 'bigint' && credential_0.claims.bigUnsignedValue >= 0n && credential_0.claims.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && credential_0.claims.bytesValue.buffer instanceof ArrayBuffer && credential_0.claims.bytesValue.BYTES_PER_ELEMENT === 1 && credential_0.claims.bytesValue.length === 32 && typeof(credential_0.claims.fieldValue) === 'bigint' && credential_0.claims.fieldValue >= 0 && credential_0.claims.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims.booleanVector) && credential_0.claims.booleanVector.length === 2 && credential_0.claims.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(credential_0.claims.uintVector) && credential_0.claims.uintVector.length === 2 && credential_0.claims.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(credential_0.claims.bytesVector) && credential_0.claims.bytesVector.length === 2 && credential_0.claims.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(credential_0.claims.fieldVector) && credential_0.claims.fieldVector.length === 2 && credential_0.claims.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD) && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('helloFamilyCredentialBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 4 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    return _dummyContract._helloFamilyCredentialBodyRoot_0(credential_0);
  },
  helloFamilyPresentationBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`helloFamilyPresentationBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const presentation_0 = args_0[0];
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealBooleanValue) === 'boolean' && typeof(presentation_0.disclosed.booleanValue) === 'boolean' && typeof(presentation_0.disclosed.revealBytesValue) === 'boolean' && presentation_0.disclosed.bytesValue.buffer instanceof ArrayBuffer && presentation_0.disclosed.bytesValue.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.bytesValue.length === 32 && typeof(presentation_0.disclosed.revealBigUnsignedValue) === 'boolean' && typeof(presentation_0.disclosed.bigUnsignedValue) === 'bigint' && presentation_0.disclosed.bigUnsignedValue >= 0n && presentation_0.disclosed.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('helloFamilyPresentationBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 10 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct HelloFamilyDisclosures<revealBooleanValue: Boolean, booleanValue: Boolean, revealBytesValue: Boolean, bytesValue: Bytes<32>, revealBigUnsignedValue: Boolean, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>>>',
                                 presentation_0)
    }
    return _dummyContract._helloFamilyPresentationBodyRoot_0(presentation_0);
  },
  helloFamilyPresentationRequestBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`helloFamilyPresentationRequestBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireBooleanValueDisclosure) === 'boolean' && typeof(request_0.requireBytesValueDisclosure) === 'boolean' && typeof(request_0.requireBigUnsignedValueDisclosure) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('helloFamilyPresentationRequestBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 16 char 1',
                                 'struct HelloFamilyPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireBooleanValueDisclosure: Boolean, requireBytesValueDisclosure: Boolean, requireBigUnsignedValueDisclosure: Boolean, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._helloFamilyPresentationRequestBodyRoot_0(request_0);
  },
  assertValidHelloFamilySchemaRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidHelloFamilySchemaRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const schema_0 = args_0[0];
    if (!(typeof(schema_0) === 'object' && schema_0.packageId.buffer instanceof ArrayBuffer && schema_0.packageId.BYTES_PER_ELEMENT === 1 && schema_0.packageId.length === 32 && schema_0.schemaId.buffer instanceof ArrayBuffer && schema_0.schemaId.BYTES_PER_ELEMENT === 1 && schema_0.schemaId.length === 32 && typeof(schema_0.majorVersion) === 'bigint' && schema_0.majorVersion >= 0n && schema_0.majorVersion <= 65535n && typeof(schema_0.minorVersion) === 'bigint' && schema_0.minorVersion >= 0n && schema_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertValidHelloFamilySchemaRef',
                                 'argument 1',
                                 'helpers.compact line 25 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 schema_0)
    }
    return _dummyContract._assertValidHelloFamilySchemaRef_0(schema_0);
  },
  assertValidHelloFamilyPresentationRequest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidHelloFamilyPresentationRequest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireBooleanValueDisclosure) === 'boolean' && typeof(request_0.requireBytesValueDisclosure) === 'boolean' && typeof(request_0.requireBigUnsignedValueDisclosure) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertValidHelloFamilyPresentationRequest',
                                 'argument 1',
                                 'helpers.compact line 37 char 1',
                                 'struct HelloFamilyPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireBooleanValueDisclosure: Boolean, requireBytesValueDisclosure: Boolean, requireBigUnsignedValueDisclosure: Boolean, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._assertValidHelloFamilyPresentationRequest_0(request_0);
  },
  assertValidHelloFamilyCredential: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidHelloFamilyCredential: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claims.booleanValue) === 'boolean' && typeof(credential_0.claims.smallUintValue) === 'bigint' && credential_0.claims.smallUintValue >= 0n && credential_0.claims.smallUintValue <= 255n && typeof(credential_0.claims.bigUnsignedValue) === 'bigint' && credential_0.claims.bigUnsignedValue >= 0n && credential_0.claims.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && credential_0.claims.bytesValue.buffer instanceof ArrayBuffer && credential_0.claims.bytesValue.BYTES_PER_ELEMENT === 1 && credential_0.claims.bytesValue.length === 32 && typeof(credential_0.claims.fieldValue) === 'bigint' && credential_0.claims.fieldValue >= 0 && credential_0.claims.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims.booleanVector) && credential_0.claims.booleanVector.length === 2 && credential_0.claims.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(credential_0.claims.uintVector) && credential_0.claims.uintVector.length === 2 && credential_0.claims.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(credential_0.claims.bytesVector) && credential_0.claims.bytesVector.length === 2 && credential_0.claims.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(credential_0.claims.fieldVector) && credential_0.claims.fieldVector.length === 2 && credential_0.claims.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD) && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidHelloFamilyCredential',
                                 'argument 1',
                                 'helpers.compact line 52 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidHelloFamilyCredential',
                                 'argument 2',
                                 'helpers.compact line 52 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidHelloFamilyCredential_0(credential_0,
                                                              proof_0);
  },
  assertValidHelloFamilyPresentation: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`assertValidHelloFamilyPresentation: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const presentation_0 = args_0[2];
    const presentationProof_0 = args_0[3];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claims.booleanValue) === 'boolean' && typeof(credential_0.claims.smallUintValue) === 'bigint' && credential_0.claims.smallUintValue >= 0n && credential_0.claims.smallUintValue <= 255n && typeof(credential_0.claims.bigUnsignedValue) === 'bigint' && credential_0.claims.bigUnsignedValue >= 0n && credential_0.claims.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && credential_0.claims.bytesValue.buffer instanceof ArrayBuffer && credential_0.claims.bytesValue.BYTES_PER_ELEMENT === 1 && credential_0.claims.bytesValue.length === 32 && typeof(credential_0.claims.fieldValue) === 'bigint' && credential_0.claims.fieldValue >= 0 && credential_0.claims.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims.booleanVector) && credential_0.claims.booleanVector.length === 2 && credential_0.claims.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(credential_0.claims.uintVector) && credential_0.claims.uintVector.length === 2 && credential_0.claims.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(credential_0.claims.bytesVector) && credential_0.claims.bytesVector.length === 2 && credential_0.claims.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(credential_0.claims.fieldVector) && credential_0.claims.fieldVector.length === 2 && credential_0.claims.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD) && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidHelloFamilyPresentation',
                                 'argument 1',
                                 'helpers.compact line 66 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidHelloFamilyPresentation',
                                 'argument 2',
                                 'helpers.compact line 66 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealBooleanValue) === 'boolean' && typeof(presentation_0.disclosed.booleanValue) === 'boolean' && typeof(presentation_0.disclosed.revealBytesValue) === 'boolean' && presentation_0.disclosed.bytesValue.buffer instanceof ArrayBuffer && presentation_0.disclosed.bytesValue.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.bytesValue.length === 32 && typeof(presentation_0.disclosed.revealBigUnsignedValue) === 'boolean' && typeof(presentation_0.disclosed.bigUnsignedValue) === 'bigint' && presentation_0.disclosed.bigUnsignedValue >= 0n && presentation_0.disclosed.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('assertValidHelloFamilyPresentation',
                                 'argument 3',
                                 'helpers.compact line 66 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct HelloFamilyDisclosures<revealBooleanValue: Boolean, booleanValue: Boolean, revealBytesValue: Boolean, bytesValue: Bytes<32>, revealBigUnsignedValue: Boolean, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidHelloFamilyPresentation',
                                 'argument 4',
                                 'helpers.compact line 66 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertValidHelloFamilyPresentation_0(credential_0,
                                                                credentialProof_0,
                                                                presentation_0,
                                                                presentationProof_0);
  },
  assertHelloFamilyPresentationSatisfiesRequest: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`assertHelloFamilyPresentationSatisfiesRequest: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const request_0 = args_0[2];
    const presentation_0 = args_0[3];
    const presentationProof_0 = args_0[4];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && typeof(credential_0.claims.booleanValue) === 'boolean' && typeof(credential_0.claims.smallUintValue) === 'bigint' && credential_0.claims.smallUintValue >= 0n && credential_0.claims.smallUintValue <= 255n && typeof(credential_0.claims.bigUnsignedValue) === 'bigint' && credential_0.claims.bigUnsignedValue >= 0n && credential_0.claims.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n && credential_0.claims.bytesValue.buffer instanceof ArrayBuffer && credential_0.claims.bytesValue.BYTES_PER_ELEMENT === 1 && credential_0.claims.bytesValue.length === 32 && typeof(credential_0.claims.fieldValue) === 'bigint' && credential_0.claims.fieldValue >= 0 && credential_0.claims.fieldValue <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims.booleanVector) && credential_0.claims.booleanVector.length === 2 && credential_0.claims.booleanVector.every((t) => typeof(t) === 'boolean') && Array.isArray(credential_0.claims.uintVector) && credential_0.claims.uintVector.length === 2 && credential_0.claims.uintVector.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && Array.isArray(credential_0.claims.bytesVector) && credential_0.claims.bytesVector.length === 2 && credential_0.claims.bytesVector.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16) && Array.isArray(credential_0.claims.fieldVector) && credential_0.claims.fieldVector.length === 2 && credential_0.claims.fieldVector.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD) && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertHelloFamilyPresentationSatisfiesRequest',
                                 'argument 1',
                                 'helpers.compact line 116 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct HelloFamilyClaims<booleanValue: Boolean, smallUintValue: Uint<0..256>, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>, bytesValue: Bytes<32>, fieldValue: Field, booleanVector: Vector<2, Boolean>, uintVector: Vector<2, Uint<0..18446744073709551616>>, bytesVector: Vector<2, Bytes<16>>, fieldVector: Vector<2, Field>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertHelloFamilyPresentationSatisfiesRequest',
                                 'argument 2',
                                 'helpers.compact line 116 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireBooleanValueDisclosure) === 'boolean' && typeof(request_0.requireBytesValueDisclosure) === 'boolean' && typeof(request_0.requireBigUnsignedValueDisclosure) === 'boolean' && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertHelloFamilyPresentationSatisfiesRequest',
                                 'argument 3',
                                 'helpers.compact line 116 char 1',
                                 'struct HelloFamilyPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireBooleanValueDisclosure: Boolean, requireBytesValueDisclosure: Boolean, requireBigUnsignedValueDisclosure: Boolean, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealBooleanValue) === 'boolean' && typeof(presentation_0.disclosed.booleanValue) === 'boolean' && typeof(presentation_0.disclosed.revealBytesValue) === 'boolean' && presentation_0.disclosed.bytesValue.buffer instanceof ArrayBuffer && presentation_0.disclosed.bytesValue.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.bytesValue.length === 32 && typeof(presentation_0.disclosed.revealBigUnsignedValue) === 'boolean' && typeof(presentation_0.disclosed.bigUnsignedValue) === 'bigint' && presentation_0.disclosed.bigUnsignedValue >= 0n && presentation_0.disclosed.bigUnsignedValue <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('assertHelloFamilyPresentationSatisfiesRequest',
                                 'argument 4',
                                 'helpers.compact line 116 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct HelloFamilyDisclosures<revealBooleanValue: Boolean, booleanValue: Boolean, revealBytesValue: Boolean, bytesValue: Bytes<32>, revealBigUnsignedValue: Boolean, bigUnsignedValue: Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertHelloFamilyPresentationSatisfiesRequest',
                                 'argument 5',
                                 'helpers.compact line 116 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertHelloFamilyPresentationSatisfiesRequest_0(credential_0,
                                                                           credentialProof_0,
                                                                           request_0,
                                                                           presentation_0,
                                                                           presentationProof_0);
  },
  helloVerifierRequest: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`helloVerifierRequest: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const issuerVerificationMethodRef_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    const requireBytesValueDisclosure_0 = args_0[2];
    if (!(typeof(issuerVerificationMethodRef_0) === 'object' && typeof(issuerVerificationMethodRef_0.didContractAddress) === 'object' && issuerVerificationMethodRef_0.didContractAddress.bytes.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.didContractAddress.bytes.length === 32 && issuerVerificationMethodRef_0.methodId.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.methodId.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.methodId.length === 32)) {
      __compactRuntime.typeError('helloVerifierRequest',
                                 'argument 1',
                                 'hello-verifier.compact line 26 char 1',
                                 'struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>',
                                 issuerVerificationMethodRef_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('helloVerifierRequest',
                                 'argument 2',
                                 'hello-verifier.compact line 26 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    if (!(typeof(requireBytesValueDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('helloVerifierRequest',
                                 'argument 3',
                                 'hello-verifier.compact line 26 char 1',
                                 'Boolean',
                                 requireBytesValueDisclosure_0)
    }
    return _dummyContract._helloVerifierRequest_0(issuerVerificationMethodRef_0,
                                                  verifierChallengeHash_0,
                                                  requireBytesValueDisclosure_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
