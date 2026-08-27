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

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class _SchemaRef_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment())));
  }
  fromValue(value_0) {
    return {
      packageId: _descriptor_0.fromValue(value_0),
      schemaId: _descriptor_0.fromValue(value_0),
      majorVersion: _descriptor_1.fromValue(value_0),
      minorVersion: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.packageId).concat(_descriptor_0.toValue(value_0.schemaId).concat(_descriptor_1.toValue(value_0.majorVersion).concat(_descriptor_1.toValue(value_0.minorVersion))));
  }
}

const _descriptor_3 = new _SchemaRef_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_4 = new _ContractAddress_0();

class _VerificationMethodRef_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      didContractAddress: _descriptor_4.fromValue(value_0),
      methodId: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.didContractAddress).concat(_descriptor_0.toValue(value_0.methodId));
  }
}

const _descriptor_5 = new _VerificationMethodRef_0();

class _ExplicitHolderBinding_0 {
  alignment() {
    return _descriptor_5.alignment();
  }
  fromValue(value_0) {
    return {
      holderVerificationMethodRef: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.holderVerificationMethodRef);
  }
}

const _descriptor_6 = new _ExplicitHolderBinding_0();

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

const _descriptor_7 = new _NoStatusBinding_0();

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_9 = __compactRuntime.CompactTypeBoolean;

const _descriptor_10 = new __compactRuntime.CompactTypeBytes(16);

class _UniversityDiplomaClaims_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_10.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_10.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      diplomaId: _descriptor_0.fromValue(value_0),
      studentId: _descriptor_10.fromValue(value_0),
      graduateName: _descriptor_0.fromValue(value_0),
      universityName: _descriptor_0.fromValue(value_0),
      facultyName: _descriptor_0.fromValue(value_0),
      awardName: _descriptor_0.fromValue(value_0),
      honorsCode: _descriptor_10.fromValue(value_0),
      graduationYear: _descriptor_1.fromValue(value_0),
      graduationMonth: _descriptor_2.fromValue(value_0),
      finalGrade: _descriptor_2.fromValue(value_0),
      creditsEarned: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.diplomaId).concat(_descriptor_10.toValue(value_0.studentId).concat(_descriptor_0.toValue(value_0.graduateName).concat(_descriptor_0.toValue(value_0.universityName).concat(_descriptor_0.toValue(value_0.facultyName).concat(_descriptor_0.toValue(value_0.awardName).concat(_descriptor_10.toValue(value_0.honorsCode).concat(_descriptor_1.toValue(value_0.graduationYear).concat(_descriptor_2.toValue(value_0.graduationMonth).concat(_descriptor_2.toValue(value_0.finalGrade).concat(_descriptor_1.toValue(value_0.creditsEarned)))))))))));
  }
}

const _descriptor_11 = new _UniversityDiplomaClaims_0();

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

const _descriptor_12 = new _NoClaimCommitments_0();

class _Credential_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_5.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment().concat(_descriptor_8.alignment().concat(_descriptor_9.alignment().concat(_descriptor_8.alignment().concat(_descriptor_11.alignment().concat(_descriptor_12.alignment().concat(_descriptor_0.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_3.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      holderBinding: _descriptor_6.fromValue(value_0),
      statusBinding: _descriptor_7.fromValue(value_0),
      issuedAt: _descriptor_8.fromValue(value_0),
      hasExpiration: _descriptor_9.fromValue(value_0),
      expiresAt: _descriptor_8.fromValue(value_0),
      claims: _descriptor_11.fromValue(value_0),
      claimCommitments: _descriptor_12.fromValue(value_0),
      claimRoot: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_3.toValue(value_0.schema).concat(_descriptor_5.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_6.toValue(value_0.holderBinding).concat(_descriptor_7.toValue(value_0.statusBinding).concat(_descriptor_8.toValue(value_0.issuedAt).concat(_descriptor_9.toValue(value_0.hasExpiration).concat(_descriptor_8.toValue(value_0.expiresAt).concat(_descriptor_11.toValue(value_0.claims).concat(_descriptor_12.toValue(value_0.claimCommitments).concat(_descriptor_0.toValue(value_0.claimRoot)))))))))));
  }
}

const _descriptor_13 = new _Credential_0();

const _descriptor_14 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_15 = __compactRuntime.CompactTypeField;

class _Signature_0 {
  alignment() {
    return _descriptor_14.alignment().concat(_descriptor_15.alignment());
  }
  fromValue(value_0) {
    return {
      r: _descriptor_14.fromValue(value_0),
      s: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_14.toValue(value_0.r).concat(_descriptor_15.toValue(value_0.s));
  }
}

const _descriptor_16 = new _Signature_0();

class _Proof_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_14.alignment().concat(_descriptor_16.alignment()))));
  }
  fromValue(value_0) {
    return {
      signerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      createdAt: _descriptor_8.fromValue(value_0),
      challengeHash: _descriptor_0.fromValue(value_0),
      publicKey: _descriptor_14.fromValue(value_0),
      signature: _descriptor_16.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.signerVerificationMethodRef).concat(_descriptor_8.toValue(value_0.createdAt).concat(_descriptor_0.toValue(value_0.challengeHash).concat(_descriptor_14.toValue(value_0.publicKey).concat(_descriptor_16.toValue(value_0.signature)))));
  }
}

const _descriptor_17 = new _Proof_0();

class _UniversityDiplomaPresentationRequest_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_5.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()))))))))))))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_3.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      requireDiplomaIdDisclosure: _descriptor_9.fromValue(value_0),
      requireStudentIdDisclosure: _descriptor_9.fromValue(value_0),
      requireGraduateNameDisclosure: _descriptor_9.fromValue(value_0),
      requireUniversityNameDisclosure: _descriptor_9.fromValue(value_0),
      requireFacultyNameDisclosure: _descriptor_9.fromValue(value_0),
      requireAwardNameDisclosure: _descriptor_9.fromValue(value_0),
      requireHonorsCodeDisclosure: _descriptor_9.fromValue(value_0),
      requireGraduationYearDisclosure: _descriptor_9.fromValue(value_0),
      requireGraduationMonthDisclosure: _descriptor_9.fromValue(value_0),
      requireFinalGradeDisclosure: _descriptor_9.fromValue(value_0),
      requireCreditsEarnedDisclosure: _descriptor_9.fromValue(value_0),
      enforceMinimumFinalGrade: _descriptor_9.fromValue(value_0),
      minimumFinalGrade: _descriptor_2.fromValue(value_0),
      verifierChallengeHash: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_3.toValue(value_0.schema).concat(_descriptor_5.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_9.toValue(value_0.requireDiplomaIdDisclosure).concat(_descriptor_9.toValue(value_0.requireStudentIdDisclosure).concat(_descriptor_9.toValue(value_0.requireGraduateNameDisclosure).concat(_descriptor_9.toValue(value_0.requireUniversityNameDisclosure).concat(_descriptor_9.toValue(value_0.requireFacultyNameDisclosure).concat(_descriptor_9.toValue(value_0.requireAwardNameDisclosure).concat(_descriptor_9.toValue(value_0.requireHonorsCodeDisclosure).concat(_descriptor_9.toValue(value_0.requireGraduationYearDisclosure).concat(_descriptor_9.toValue(value_0.requireGraduationMonthDisclosure).concat(_descriptor_9.toValue(value_0.requireFinalGradeDisclosure).concat(_descriptor_9.toValue(value_0.requireCreditsEarnedDisclosure).concat(_descriptor_9.toValue(value_0.enforceMinimumFinalGrade).concat(_descriptor_2.toValue(value_0.minimumFinalGrade).concat(_descriptor_0.toValue(value_0.verifierChallengeHash)))))))))))))))));
  }
}

const _descriptor_18 = new _UniversityDiplomaPresentationRequest_0();

class _UniversityDiplomaDisclosures_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_10.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_10.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment())))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      revealDiplomaId: _descriptor_9.fromValue(value_0),
      diplomaId: _descriptor_0.fromValue(value_0),
      revealStudentId: _descriptor_9.fromValue(value_0),
      studentId: _descriptor_10.fromValue(value_0),
      revealGraduateName: _descriptor_9.fromValue(value_0),
      graduateName: _descriptor_0.fromValue(value_0),
      revealUniversityName: _descriptor_9.fromValue(value_0),
      universityName: _descriptor_0.fromValue(value_0),
      revealFacultyName: _descriptor_9.fromValue(value_0),
      facultyName: _descriptor_0.fromValue(value_0),
      revealAwardName: _descriptor_9.fromValue(value_0),
      awardName: _descriptor_0.fromValue(value_0),
      revealHonorsCode: _descriptor_9.fromValue(value_0),
      honorsCode: _descriptor_10.fromValue(value_0),
      revealGraduationYear: _descriptor_9.fromValue(value_0),
      graduationYear: _descriptor_1.fromValue(value_0),
      revealGraduationMonth: _descriptor_9.fromValue(value_0),
      graduationMonth: _descriptor_2.fromValue(value_0),
      revealFinalGrade: _descriptor_9.fromValue(value_0),
      finalGrade: _descriptor_2.fromValue(value_0),
      revealCreditsEarned: _descriptor_9.fromValue(value_0),
      creditsEarned: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.revealDiplomaId).concat(_descriptor_0.toValue(value_0.diplomaId).concat(_descriptor_9.toValue(value_0.revealStudentId).concat(_descriptor_10.toValue(value_0.studentId).concat(_descriptor_9.toValue(value_0.revealGraduateName).concat(_descriptor_0.toValue(value_0.graduateName).concat(_descriptor_9.toValue(value_0.revealUniversityName).concat(_descriptor_0.toValue(value_0.universityName).concat(_descriptor_9.toValue(value_0.revealFacultyName).concat(_descriptor_0.toValue(value_0.facultyName).concat(_descriptor_9.toValue(value_0.revealAwardName).concat(_descriptor_0.toValue(value_0.awardName).concat(_descriptor_9.toValue(value_0.revealHonorsCode).concat(_descriptor_10.toValue(value_0.honorsCode).concat(_descriptor_9.toValue(value_0.revealGraduationYear).concat(_descriptor_1.toValue(value_0.graduationYear).concat(_descriptor_9.toValue(value_0.revealGraduationMonth).concat(_descriptor_2.toValue(value_0.graduationMonth).concat(_descriptor_9.toValue(value_0.revealFinalGrade).concat(_descriptor_2.toValue(value_0.finalGrade).concat(_descriptor_9.toValue(value_0.revealCreditsEarned).concat(_descriptor_1.toValue(value_0.creditsEarned))))))))))))))))))))));
  }
}

const _descriptor_19 = new _UniversityDiplomaDisclosures_0();

class _Presentation_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_6.alignment().concat(_descriptor_19.alignment())))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_3.fromValue(value_0),
      credentialClaimRoot: _descriptor_0.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      holderBinding: _descriptor_6.fromValue(value_0),
      disclosed: _descriptor_19.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_3.toValue(value_0.schema).concat(_descriptor_0.toValue(value_0.credentialClaimRoot).concat(_descriptor_5.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_6.toValue(value_0.holderBinding).concat(_descriptor_19.toValue(value_0.disclosed))))));
  }
}

const _descriptor_20 = new _Presentation_0();

class _UniversityDiplomaProductionPublicClaims_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      universityName: _descriptor_0.fromValue(value_0),
      awardName: _descriptor_0.fromValue(value_0),
      graduationYear: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.universityName).concat(_descriptor_0.toValue(value_0.awardName).concat(_descriptor_1.toValue(value_0.graduationYear)));
  }
}

const _descriptor_21 = new _UniversityDiplomaProductionPublicClaims_0();

class _UniversityDiplomaClaimCommitments_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))));
  }
  fromValue(value_0) {
    return {
      diplomaIdCommitment: _descriptor_0.fromValue(value_0),
      studentIdCommitment: _descriptor_0.fromValue(value_0),
      graduateNameCommitment: _descriptor_0.fromValue(value_0),
      facultyNameCommitment: _descriptor_0.fromValue(value_0),
      honorsCodeCommitment: _descriptor_0.fromValue(value_0),
      graduationMonthCommitment: _descriptor_0.fromValue(value_0),
      finalGradeCommitment: _descriptor_0.fromValue(value_0),
      creditsEarnedCommitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.diplomaIdCommitment).concat(_descriptor_0.toValue(value_0.studentIdCommitment).concat(_descriptor_0.toValue(value_0.graduateNameCommitment).concat(_descriptor_0.toValue(value_0.facultyNameCommitment).concat(_descriptor_0.toValue(value_0.honorsCodeCommitment).concat(_descriptor_0.toValue(value_0.graduationMonthCommitment).concat(_descriptor_0.toValue(value_0.finalGradeCommitment).concat(_descriptor_0.toValue(value_0.creditsEarnedCommitment))))))));
  }
}

const _descriptor_22 = new _UniversityDiplomaClaimCommitments_0();

class _Credential_1 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_5.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment().concat(_descriptor_8.alignment().concat(_descriptor_9.alignment().concat(_descriptor_8.alignment().concat(_descriptor_21.alignment().concat(_descriptor_22.alignment().concat(_descriptor_0.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_3.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      holderBinding: _descriptor_6.fromValue(value_0),
      statusBinding: _descriptor_7.fromValue(value_0),
      issuedAt: _descriptor_8.fromValue(value_0),
      hasExpiration: _descriptor_9.fromValue(value_0),
      expiresAt: _descriptor_8.fromValue(value_0),
      claims: _descriptor_21.fromValue(value_0),
      claimCommitments: _descriptor_22.fromValue(value_0),
      claimRoot: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_3.toValue(value_0.schema).concat(_descriptor_5.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_6.toValue(value_0.holderBinding).concat(_descriptor_7.toValue(value_0.statusBinding).concat(_descriptor_8.toValue(value_0.issuedAt).concat(_descriptor_9.toValue(value_0.hasExpiration).concat(_descriptor_8.toValue(value_0.expiresAt).concat(_descriptor_21.toValue(value_0.claims).concat(_descriptor_22.toValue(value_0.claimCommitments).concat(_descriptor_0.toValue(value_0.claimRoot)))))))))));
  }
}

const _descriptor_23 = new _Credential_1();

class _UniversityDiplomaProductionPresentationRequest_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_5.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()))))))))))))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_3.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      requireDiplomaIdDisclosure: _descriptor_9.fromValue(value_0),
      requireStudentIdDisclosure: _descriptor_9.fromValue(value_0),
      requireGraduateNameDisclosure: _descriptor_9.fromValue(value_0),
      requireUniversityNameDisclosure: _descriptor_9.fromValue(value_0),
      requireFacultyNameDisclosure: _descriptor_9.fromValue(value_0),
      requireAwardNameDisclosure: _descriptor_9.fromValue(value_0),
      requireHonorsCodeDisclosure: _descriptor_9.fromValue(value_0),
      requireGraduationYearDisclosure: _descriptor_9.fromValue(value_0),
      requireGraduationMonthDisclosure: _descriptor_9.fromValue(value_0),
      requireFinalGradeDisclosure: _descriptor_9.fromValue(value_0),
      requireCreditsEarnedDisclosure: _descriptor_9.fromValue(value_0),
      enforceMinimumFinalGrade: _descriptor_9.fromValue(value_0),
      minimumFinalGrade: _descriptor_2.fromValue(value_0),
      verifierChallengeHash: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_3.toValue(value_0.schema).concat(_descriptor_5.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_9.toValue(value_0.requireDiplomaIdDisclosure).concat(_descriptor_9.toValue(value_0.requireStudentIdDisclosure).concat(_descriptor_9.toValue(value_0.requireGraduateNameDisclosure).concat(_descriptor_9.toValue(value_0.requireUniversityNameDisclosure).concat(_descriptor_9.toValue(value_0.requireFacultyNameDisclosure).concat(_descriptor_9.toValue(value_0.requireAwardNameDisclosure).concat(_descriptor_9.toValue(value_0.requireHonorsCodeDisclosure).concat(_descriptor_9.toValue(value_0.requireGraduationYearDisclosure).concat(_descriptor_9.toValue(value_0.requireGraduationMonthDisclosure).concat(_descriptor_9.toValue(value_0.requireFinalGradeDisclosure).concat(_descriptor_9.toValue(value_0.requireCreditsEarnedDisclosure).concat(_descriptor_9.toValue(value_0.enforceMinimumFinalGrade).concat(_descriptor_2.toValue(value_0.minimumFinalGrade).concat(_descriptor_0.toValue(value_0.verifierChallengeHash)))))))))))))))));
  }
}

const _descriptor_24 = new _UniversityDiplomaProductionPresentationRequest_0();

class _UniversityDiplomaProductionDisclosures_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_10.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_10.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment())))))))))))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      revealDiplomaId: _descriptor_9.fromValue(value_0),
      diplomaId: _descriptor_0.fromValue(value_0),
      diplomaIdOpening: _descriptor_0.fromValue(value_0),
      revealStudentId: _descriptor_9.fromValue(value_0),
      studentId: _descriptor_10.fromValue(value_0),
      studentIdOpening: _descriptor_0.fromValue(value_0),
      revealGraduateName: _descriptor_9.fromValue(value_0),
      graduateName: _descriptor_0.fromValue(value_0),
      graduateNameOpening: _descriptor_0.fromValue(value_0),
      revealUniversityName: _descriptor_9.fromValue(value_0),
      universityName: _descriptor_0.fromValue(value_0),
      revealFacultyName: _descriptor_9.fromValue(value_0),
      facultyName: _descriptor_0.fromValue(value_0),
      facultyNameOpening: _descriptor_0.fromValue(value_0),
      revealAwardName: _descriptor_9.fromValue(value_0),
      awardName: _descriptor_0.fromValue(value_0),
      revealHonorsCode: _descriptor_9.fromValue(value_0),
      honorsCode: _descriptor_10.fromValue(value_0),
      honorsCodeOpening: _descriptor_0.fromValue(value_0),
      revealGraduationYear: _descriptor_9.fromValue(value_0),
      graduationYear: _descriptor_1.fromValue(value_0),
      revealGraduationMonth: _descriptor_9.fromValue(value_0),
      graduationMonth: _descriptor_2.fromValue(value_0),
      graduationMonthOpening: _descriptor_0.fromValue(value_0),
      revealFinalGrade: _descriptor_9.fromValue(value_0),
      finalGrade: _descriptor_2.fromValue(value_0),
      finalGradeOpening: _descriptor_0.fromValue(value_0),
      revealCreditsEarned: _descriptor_9.fromValue(value_0),
      creditsEarned: _descriptor_1.fromValue(value_0),
      creditsEarnedOpening: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.revealDiplomaId).concat(_descriptor_0.toValue(value_0.diplomaId).concat(_descriptor_0.toValue(value_0.diplomaIdOpening).concat(_descriptor_9.toValue(value_0.revealStudentId).concat(_descriptor_10.toValue(value_0.studentId).concat(_descriptor_0.toValue(value_0.studentIdOpening).concat(_descriptor_9.toValue(value_0.revealGraduateName).concat(_descriptor_0.toValue(value_0.graduateName).concat(_descriptor_0.toValue(value_0.graduateNameOpening).concat(_descriptor_9.toValue(value_0.revealUniversityName).concat(_descriptor_0.toValue(value_0.universityName).concat(_descriptor_9.toValue(value_0.revealFacultyName).concat(_descriptor_0.toValue(value_0.facultyName).concat(_descriptor_0.toValue(value_0.facultyNameOpening).concat(_descriptor_9.toValue(value_0.revealAwardName).concat(_descriptor_0.toValue(value_0.awardName).concat(_descriptor_9.toValue(value_0.revealHonorsCode).concat(_descriptor_10.toValue(value_0.honorsCode).concat(_descriptor_0.toValue(value_0.honorsCodeOpening).concat(_descriptor_9.toValue(value_0.revealGraduationYear).concat(_descriptor_1.toValue(value_0.graduationYear).concat(_descriptor_9.toValue(value_0.revealGraduationMonth).concat(_descriptor_2.toValue(value_0.graduationMonth).concat(_descriptor_0.toValue(value_0.graduationMonthOpening).concat(_descriptor_9.toValue(value_0.revealFinalGrade).concat(_descriptor_2.toValue(value_0.finalGrade).concat(_descriptor_0.toValue(value_0.finalGradeOpening).concat(_descriptor_9.toValue(value_0.revealCreditsEarned).concat(_descriptor_1.toValue(value_0.creditsEarned).concat(_descriptor_0.toValue(value_0.creditsEarnedOpening))))))))))))))))))))))))))))));
  }
}

const _descriptor_25 = new _UniversityDiplomaProductionDisclosures_0();

class _Presentation_1 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_6.alignment().concat(_descriptor_25.alignment())))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      schema: _descriptor_3.fromValue(value_0),
      credentialClaimRoot: _descriptor_0.fromValue(value_0),
      issuerVerificationMethodRef: _descriptor_5.fromValue(value_0),
      holderBinding: _descriptor_6.fromValue(value_0),
      disclosed: _descriptor_25.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_3.toValue(value_0.schema).concat(_descriptor_0.toValue(value_0.credentialClaimRoot).concat(_descriptor_5.toValue(value_0.issuerVerificationMethodRef).concat(_descriptor_6.toValue(value_0.holderBinding).concat(_descriptor_25.toValue(value_0.disclosed))))));
  }
}

const _descriptor_26 = new _Presentation_1();

class _UniversityDiplomaProductionCreditsEarnedPredicateWitness_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      creditsEarned: _descriptor_1.fromValue(value_0),
      creditsEarnedOpening: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.creditsEarned).concat(_descriptor_0.toValue(value_0.creditsEarnedOpening));
  }
}

const _descriptor_27 = new _UniversityDiplomaProductionCreditsEarnedPredicateWitness_0();

class _UniversityDiplomaProductionFinalGradePredicateWitness_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      finalGrade: _descriptor_2.fromValue(value_0),
      finalGradeOpening: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.finalGrade).concat(_descriptor_0.toValue(value_0.finalGradeOpening));
  }
}

const _descriptor_28 = new _UniversityDiplomaProductionFinalGradePredicateWitness_0();

class _VerificationTranscriptV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))))))))))))))))))))))))))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      profile: _descriptor_2.fromValue(value_0),
      authority: _descriptor_2.fromValue(value_0),
      networkIdDigest: _descriptor_0.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      deploymentDigest: _descriptor_0.fromValue(value_0),
      audienceDigest: _descriptor_0.fromValue(value_0),
      originMode: _descriptor_2.fromValue(value_0),
      originDigest: _descriptor_0.fromValue(value_0),
      connectorEvidenceDigest: _descriptor_0.fromValue(value_0),
      requestIdDigest: _descriptor_0.fromValue(value_0),
      challengeDigest: _descriptor_0.fromValue(value_0),
      expiresAt: _descriptor_8.fromValue(value_0),
      credentialFamilyDigest: _descriptor_0.fromValue(value_0),
      schemaDigest: _descriptor_0.fromValue(value_0),
      credentialBindingMode: _descriptor_2.fromValue(value_0),
      credentialBindingDigest: _descriptor_0.fromValue(value_0),
      disclosureDigest: _descriptor_0.fromValue(value_0),
      predicateDigest: _descriptor_0.fromValue(value_0),
      holderBindingDigest: _descriptor_0.fromValue(value_0),
      policyDigest: _descriptor_0.fromValue(value_0),
      actionClassDigest: _descriptor_0.fromValue(value_0),
      actionInvocationDigest: _descriptor_0.fromValue(value_0),
      consentDigest: _descriptor_0.fromValue(value_0),
      presentationBindingDigest: _descriptor_0.fromValue(value_0),
      issuerDidDigest: _descriptor_0.fromValue(value_0),
      issuerMethodDigest: _descriptor_0.fromValue(value_0),
      issuerRelationship: _descriptor_2.fromValue(value_0),
      issuerEvidenceDigest: _descriptor_0.fromValue(value_0),
      trustScopeDigest: _descriptor_0.fromValue(value_0),
      trustEvidenceDigest: _descriptor_0.fromValue(value_0),
      statusMode: _descriptor_2.fromValue(value_0),
      statusRegistryDigest: _descriptor_0.fromValue(value_0),
      statusRoot: _descriptor_0.fromValue(value_0),
      statusRegistryVersion: _descriptor_8.fromValue(value_0),
      statusFreshnessPolicyDigest: _descriptor_0.fromValue(value_0),
      statusEvidenceDigest: _descriptor_0.fromValue(value_0),
      timeMode: _descriptor_2.fromValue(value_0),
      trustedTime: _descriptor_8.fromValue(value_0),
      timeEvidenceDigest: _descriptor_0.fromValue(value_0),
      artifactManifestDigest: _descriptor_0.fromValue(value_0),
      artifactEvidenceDigest: _descriptor_0.fromValue(value_0),
      nullifierMode: _descriptor_2.fromValue(value_0),
      replayPolicy: _descriptor_2.fromValue(value_0),
      replayScopeDigest: _descriptor_0.fromValue(value_0),
      decisionNullifier: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.profile).concat(_descriptor_2.toValue(value_0.authority).concat(_descriptor_0.toValue(value_0.networkIdDigest).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.deploymentDigest).concat(_descriptor_0.toValue(value_0.audienceDigest).concat(_descriptor_2.toValue(value_0.originMode).concat(_descriptor_0.toValue(value_0.originDigest).concat(_descriptor_0.toValue(value_0.connectorEvidenceDigest).concat(_descriptor_0.toValue(value_0.requestIdDigest).concat(_descriptor_0.toValue(value_0.challengeDigest).concat(_descriptor_8.toValue(value_0.expiresAt).concat(_descriptor_0.toValue(value_0.credentialFamilyDigest).concat(_descriptor_0.toValue(value_0.schemaDigest).concat(_descriptor_2.toValue(value_0.credentialBindingMode).concat(_descriptor_0.toValue(value_0.credentialBindingDigest).concat(_descriptor_0.toValue(value_0.disclosureDigest).concat(_descriptor_0.toValue(value_0.predicateDigest).concat(_descriptor_0.toValue(value_0.holderBindingDigest).concat(_descriptor_0.toValue(value_0.policyDigest).concat(_descriptor_0.toValue(value_0.actionClassDigest).concat(_descriptor_0.toValue(value_0.actionInvocationDigest).concat(_descriptor_0.toValue(value_0.consentDigest).concat(_descriptor_0.toValue(value_0.presentationBindingDigest).concat(_descriptor_0.toValue(value_0.issuerDidDigest).concat(_descriptor_0.toValue(value_0.issuerMethodDigest).concat(_descriptor_2.toValue(value_0.issuerRelationship).concat(_descriptor_0.toValue(value_0.issuerEvidenceDigest).concat(_descriptor_0.toValue(value_0.trustScopeDigest).concat(_descriptor_0.toValue(value_0.trustEvidenceDigest).concat(_descriptor_2.toValue(value_0.statusMode).concat(_descriptor_0.toValue(value_0.statusRegistryDigest).concat(_descriptor_0.toValue(value_0.statusRoot).concat(_descriptor_8.toValue(value_0.statusRegistryVersion).concat(_descriptor_0.toValue(value_0.statusFreshnessPolicyDigest).concat(_descriptor_0.toValue(value_0.statusEvidenceDigest).concat(_descriptor_2.toValue(value_0.timeMode).concat(_descriptor_8.toValue(value_0.trustedTime).concat(_descriptor_0.toValue(value_0.timeEvidenceDigest).concat(_descriptor_0.toValue(value_0.artifactManifestDigest).concat(_descriptor_0.toValue(value_0.artifactEvidenceDigest).concat(_descriptor_2.toValue(value_0.nullifierMode).concat(_descriptor_2.toValue(value_0.replayPolicy).concat(_descriptor_0.toValue(value_0.replayScopeDigest).concat(_descriptor_0.toValue(value_0.decisionNullifier)))))))))))))))))))))))))))))))))))))))))))))));
  }
}

const _descriptor_29 = new _VerificationTranscriptV1_0();

class _EvidenceBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_8.alignment()))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      mode: _descriptor_2.fromValue(value_0),
      authorityDigest: _descriptor_0.fromValue(value_0),
      subjectDigest: _descriptor_0.fromValue(value_0),
      stateAnchorDigest: _descriptor_0.fromValue(value_0),
      statementDigest: _descriptor_0.fromValue(value_0),
      createdAt: _descriptor_8.fromValue(value_0),
      expiresAt: _descriptor_8.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.mode).concat(_descriptor_0.toValue(value_0.authorityDigest).concat(_descriptor_0.toValue(value_0.subjectDigest).concat(_descriptor_0.toValue(value_0.stateAnchorDigest).concat(_descriptor_0.toValue(value_0.statementDigest).concat(_descriptor_8.toValue(value_0.createdAt).concat(_descriptor_8.toValue(value_0.expiresAt)))))))));
  }
}

const _descriptor_30 = new _EvidenceBindingV1_0();

class _VerificationPublicInputsV1_0 {
  alignment() {
    return _descriptor_29.alignment().concat(_descriptor_30.alignment().concat(_descriptor_30.alignment().concat(_descriptor_30.alignment().concat(_descriptor_30.alignment().concat(_descriptor_30.alignment().concat(_descriptor_30.alignment()))))));
  }
  fromValue(value_0) {
    return {
      transcript: _descriptor_29.fromValue(value_0),
      issuerEvidence: _descriptor_30.fromValue(value_0),
      trustEvidence: _descriptor_30.fromValue(value_0),
      statusEvidence: _descriptor_30.fromValue(value_0),
      timeEvidence: _descriptor_30.fromValue(value_0),
      artifactEvidence: _descriptor_30.fromValue(value_0),
      connectorEvidence: _descriptor_30.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_29.toValue(value_0.transcript).concat(_descriptor_30.toValue(value_0.issuerEvidence).concat(_descriptor_30.toValue(value_0.trustEvidence).concat(_descriptor_30.toValue(value_0.statusEvidence).concat(_descriptor_30.toValue(value_0.timeEvidence).concat(_descriptor_30.toValue(value_0.artifactEvidence).concat(_descriptor_30.toValue(value_0.connectorEvidence)))))));
  }
}

const _descriptor_31 = new _VerificationPublicInputsV1_0();

class _SyntheticVerificationAttemptV1_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()))));
  }
  fromValue(value_0) {
    return {
      proofStatus: _descriptor_2.fromValue(value_0),
      decisionStatus: _descriptor_2.fromValue(value_0),
      authority: _descriptor_2.fromValue(value_0),
      executionStatus: _descriptor_2.fromValue(value_0),
      transcriptDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.proofStatus).concat(_descriptor_2.toValue(value_0.decisionStatus).concat(_descriptor_2.toValue(value_0.authority).concat(_descriptor_2.toValue(value_0.executionStatus).concat(_descriptor_0.toValue(value_0.transcriptDigest)))));
  }
}

const _descriptor_32 = new _SyntheticVerificationAttemptV1_0();

class _DecisionNullifierMaterialV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      deploymentDigest: _descriptor_0.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      replayPolicy: _descriptor_2.fromValue(value_0),
      replayScopeDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.deploymentDigest).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_2.toValue(value_0.replayPolicy).concat(_descriptor_0.toValue(value_0.replayScopeDigest))))));
  }
}

const _descriptor_33 = new _DecisionNullifierMaterialV1_0();

class _SyntheticVerificationExtensionV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      familyDigest: _descriptor_0.fromValue(value_0),
      valueDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.familyDigest).concat(_descriptor_0.toValue(value_0.valueDigest))));
  }
}

const _descriptor_34 = new _SyntheticVerificationExtensionV1_0();

class _AnchorEvidenceReceiptV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      issuerEvidenceDigest: _descriptor_0.fromValue(value_0),
      trustEvidenceDigest: _descriptor_0.fromValue(value_0),
      statusEvidenceDigest: _descriptor_0.fromValue(value_0),
      timeEvidenceDigest: _descriptor_0.fromValue(value_0),
      artifactEvidenceDigest: _descriptor_0.fromValue(value_0),
      connectorEvidenceDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.issuerEvidenceDigest).concat(_descriptor_0.toValue(value_0.trustEvidenceDigest).concat(_descriptor_0.toValue(value_0.statusEvidenceDigest).concat(_descriptor_0.toValue(value_0.timeEvidenceDigest).concat(_descriptor_0.toValue(value_0.artifactEvidenceDigest).concat(_descriptor_0.toValue(value_0.connectorEvidenceDigest))))))));
  }
}

const _descriptor_35 = new _AnchorEvidenceReceiptV1_0();

class _ConsentBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment())))))))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      profile: _descriptor_2.fromValue(value_0),
      networkIdDigest: _descriptor_0.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      deploymentDigest: _descriptor_0.fromValue(value_0),
      audienceDigest: _descriptor_0.fromValue(value_0),
      originMode: _descriptor_2.fromValue(value_0),
      originDigest: _descriptor_0.fromValue(value_0),
      requestIdDigest: _descriptor_0.fromValue(value_0),
      challengeDigest: _descriptor_0.fromValue(value_0),
      expiresAt: _descriptor_8.fromValue(value_0),
      credentialFamilyDigest: _descriptor_0.fromValue(value_0),
      schemaDigest: _descriptor_0.fromValue(value_0),
      disclosureDigest: _descriptor_0.fromValue(value_0),
      predicateDigest: _descriptor_0.fromValue(value_0),
      statusMode: _descriptor_2.fromValue(value_0),
      statusRegistryDigest: _descriptor_0.fromValue(value_0),
      statusRoot: _descriptor_0.fromValue(value_0),
      statusRegistryVersion: _descriptor_8.fromValue(value_0),
      statusFreshnessPolicyDigest: _descriptor_0.fromValue(value_0),
      policyDigest: _descriptor_0.fromValue(value_0),
      actionClassDigest: _descriptor_0.fromValue(value_0),
      actionInvocationDigest: _descriptor_0.fromValue(value_0),
      artifactManifestDigest: _descriptor_0.fromValue(value_0),
      replayPolicy: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.profile).concat(_descriptor_0.toValue(value_0.networkIdDigest).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.deploymentDigest).concat(_descriptor_0.toValue(value_0.audienceDigest).concat(_descriptor_2.toValue(value_0.originMode).concat(_descriptor_0.toValue(value_0.originDigest).concat(_descriptor_0.toValue(value_0.requestIdDigest).concat(_descriptor_0.toValue(value_0.challengeDigest).concat(_descriptor_8.toValue(value_0.expiresAt).concat(_descriptor_0.toValue(value_0.credentialFamilyDigest).concat(_descriptor_0.toValue(value_0.schemaDigest).concat(_descriptor_0.toValue(value_0.disclosureDigest).concat(_descriptor_0.toValue(value_0.predicateDigest).concat(_descriptor_2.toValue(value_0.statusMode).concat(_descriptor_0.toValue(value_0.statusRegistryDigest).concat(_descriptor_0.toValue(value_0.statusRoot).concat(_descriptor_8.toValue(value_0.statusRegistryVersion).concat(_descriptor_0.toValue(value_0.statusFreshnessPolicyDigest).concat(_descriptor_0.toValue(value_0.policyDigest).concat(_descriptor_0.toValue(value_0.actionClassDigest).concat(_descriptor_0.toValue(value_0.actionInvocationDigest).concat(_descriptor_0.toValue(value_0.artifactManifestDigest).concat(_descriptor_2.toValue(value_0.replayPolicy))))))))))))))))))))))))));
  }
}

const _descriptor_36 = new _ConsentBindingV1_0();

class _PresentationBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      credentialBindingDigest: _descriptor_0.fromValue(value_0),
      holderBindingDigest: _descriptor_0.fromValue(value_0),
      disclosureDigest: _descriptor_0.fromValue(value_0),
      predicateDigest: _descriptor_0.fromValue(value_0),
      consentDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.credentialBindingDigest).concat(_descriptor_0.toValue(value_0.holderBindingDigest).concat(_descriptor_0.toValue(value_0.disclosureDigest).concat(_descriptor_0.toValue(value_0.predicateDigest).concat(_descriptor_0.toValue(value_0.consentDigest)))))));
  }
}

const _descriptor_37 = new _PresentationBindingV1_0();

class _CredentialBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      mode: _descriptor_2.fromValue(value_0),
      credentialFamilyDigest: _descriptor_0.fromValue(value_0),
      schemaDigest: _descriptor_0.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      challengeDigest: _descriptor_0.fromValue(value_0),
      credentialRoot: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.mode).concat(_descriptor_0.toValue(value_0.credentialFamilyDigest).concat(_descriptor_0.toValue(value_0.schemaDigest).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.challengeDigest).concat(_descriptor_0.toValue(value_0.credentialRoot))))))));
  }
}

const _descriptor_38 = new _CredentialBindingV1_0();

class _HolderBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      mode: _descriptor_2.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      challengeDigest: _descriptor_0.fromValue(value_0),
      subjectBindingDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.mode).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.challengeDigest).concat(_descriptor_0.toValue(value_0.subjectBindingDigest))))));
  }
}

const _descriptor_39 = new _HolderBindingV1_0();

const _descriptor_40 = new __compactRuntime.CompactTypeEnum(0, 0);

class _StatusRegistryRef_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_5.alignment());
  }
  fromValue(value_0) {
    return {
      registryId: _descriptor_0.fromValue(value_0),
      authorityVerificationMethodRef: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.registryId).concat(_descriptor_5.toValue(value_0.authorityVerificationMethodRef));
  }
}

const _descriptor_41 = new _StatusRegistryRef_0();

class _RegistryBoundStatusBinding_0 {
  alignment() {
    return _descriptor_40.alignment().concat(_descriptor_41.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      statusType: _descriptor_40.fromValue(value_0),
      registryRef: _descriptor_41.fromValue(value_0),
      statusHandleCommitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_40.toValue(value_0.statusType).concat(_descriptor_41.toValue(value_0.registryRef).concat(_descriptor_0.toValue(value_0.statusHandleCommitment)));
  }
}

const _descriptor_42 = new _RegistryBoundStatusBinding_0();

class _ProtocolMessageEnvelope_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_9.alignment().concat(_descriptor_8.alignment())))))));
  }
  fromValue(value_0) {
    return {
      version: _descriptor_1.fromValue(value_0),
      messageId: _descriptor_0.fromValue(value_0),
      threadId: _descriptor_0.fromValue(value_0),
      initialMessage: _descriptor_9.fromValue(value_0),
      respondsToMessageId: _descriptor_0.fromValue(value_0),
      createdAt: _descriptor_8.fromValue(value_0),
      hasExpiresAt: _descriptor_9.fromValue(value_0),
      expiresAt: _descriptor_8.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.messageId).concat(_descriptor_0.toValue(value_0.threadId).concat(_descriptor_9.toValue(value_0.initialMessage).concat(_descriptor_0.toValue(value_0.respondsToMessageId).concat(_descriptor_8.toValue(value_0.createdAt).concat(_descriptor_9.toValue(value_0.hasExpiresAt).concat(_descriptor_8.toValue(value_0.expiresAt))))))));
  }
}

const _descriptor_43 = new _ProtocolMessageEnvelope_0();

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

const _descriptor_44 = new _CredentialProtocolFeatures_0();

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

const _descriptor_45 = new _SchemaCapabilities_0();

class _BlindedSecretHolderBinding_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      blindedHolderSecretCommitment: _descriptor_0.fromValue(value_0),
      issuerNonce: _descriptor_0.fromValue(value_0),
      requestChallengeResponse: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.blindedHolderSecretCommitment).concat(_descriptor_0.toValue(value_0.issuerNonce).concat(_descriptor_0.toValue(value_0.requestChallengeResponse)));
  }
}

const _descriptor_46 = new _BlindedSecretHolderBinding_0();

class _SecretHolderBinding_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      holderSecretCommitment: _descriptor_0.fromValue(value_0),
      requestChallengeResponse: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.holderSecretCommitment).concat(_descriptor_0.toValue(value_0.requestChallengeResponse));
  }
}

const _descriptor_47 = new _SecretHolderBinding_0();

class _OffchainMidnightHolderBinding_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_14.alignment()));
  }
  fromValue(value_0) {
    return {
      holderDidStateHash: _descriptor_0.fromValue(value_0),
      holderMethodId: _descriptor_0.fromValue(value_0),
      holderPublicKey: _descriptor_14.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.holderDidStateHash).concat(_descriptor_0.toValue(value_0.holderMethodId).concat(_descriptor_14.toValue(value_0.holderPublicKey)));
  }
}

const _descriptor_48 = new _OffchainMidnightHolderBinding_0();

class _JubjubHolderBinding_0 {
  alignment() {
    return _descriptor_14.alignment();
  }
  fromValue(value_0) {
    return {
      holderPublicKey: _descriptor_14.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_14.toValue(value_0.holderPublicKey);
  }
}

const _descriptor_49 = new _JubjubHolderBinding_0();

class _SchemaFamilyResolutionHint_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      hasResolverHint: _descriptor_9.fromValue(value_0),
      resolverHint: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.hasResolverHint).concat(_descriptor_0.toValue(value_0.resolverHint));
  }
}

const _descriptor_50 = new _SchemaFamilyResolutionHint_0();

class _SchemaDescriptor_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_45.alignment().concat(_descriptor_50.alignment()));
  }
  fromValue(value_0) {
    return {
      schema: _descriptor_3.fromValue(value_0),
      capabilities: _descriptor_45.fromValue(value_0),
      familyResolutionHint: _descriptor_50.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.schema).concat(_descriptor_45.toValue(value_0.capabilities).concat(_descriptor_50.toValue(value_0.familyResolutionHint)));
  }
}

const _descriptor_51 = new _SchemaDescriptor_0();

const _descriptor_52 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

const _descriptor_53 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_54 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_55 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_9.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_56 = new _Either_0();

const _descriptor_57 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_58 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

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
      statusAttestationContextTag(context, ...args_1) {
        return { result: pureCircuits.statusAttestationContextTag(...args_1), context };
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
      statusAttestationProofPayloadRoot(context, ...args_1) {
        return { result: pureCircuits.statusAttestationProofPayloadRoot(...args_1), context };
      },
      statusAttestationProofChallenge(context, ...args_1) {
        return { result: pureCircuits.statusAttestationProofChallenge(...args_1), context };
      },
      assertValidStatusAttestationContextProof(context, ...args_1) {
        return { result: pureCircuits.assertValidStatusAttestationContextProof(...args_1), context };
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
      verificationTranscriptDomainV1(context, ...args_1) {
        return { result: pureCircuits.verificationTranscriptDomainV1(...args_1), context };
      },
      decisionNullifierDomainV1(context, ...args_1) {
        return { result: pureCircuits.decisionNullifierDomainV1(...args_1), context };
      },
      credentialBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.credentialBindingDomainV1(...args_1), context };
      },
      holderBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.holderBindingDomainV1(...args_1), context };
      },
      consentBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.consentBindingDomainV1(...args_1), context };
      },
      presentationBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.presentationBindingDomainV1(...args_1), context };
      },
      issuerEvidenceDomainV1(context, ...args_1) {
        return { result: pureCircuits.issuerEvidenceDomainV1(...args_1), context };
      },
      trustEvidenceDomainV1(context, ...args_1) {
        return { result: pureCircuits.trustEvidenceDomainV1(...args_1), context };
      },
      statusEvidenceDomainV1(context, ...args_1) {
        return { result: pureCircuits.statusEvidenceDomainV1(...args_1), context };
      },
      timeEvidenceDomainV1(context, ...args_1) {
        return { result: pureCircuits.timeEvidenceDomainV1(...args_1), context };
      },
      artifactEvidenceDomainV1(context, ...args_1) {
        return { result: pureCircuits.artifactEvidenceDomainV1(...args_1), context };
      },
      connectorEvidenceDomainV1(context, ...args_1) {
        return { result: pureCircuits.connectorEvidenceDomainV1(...args_1), context };
      },
      anchorEvidenceReceiptDomainV1(context, ...args_1) {
        return { result: pureCircuits.anchorEvidenceReceiptDomainV1(...args_1), context };
      },
      syntheticVerificationExtensionDomainV1(context, ...args_1) {
        return { result: pureCircuits.syntheticVerificationExtensionDomainV1(...args_1), context };
      },
      credentialBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.credentialBindingV1Digest(...args_1), context };
      },
      holderBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.holderBindingV1Digest(...args_1), context };
      },
      consentBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.consentBindingV1Digest(...args_1), context };
      },
      presentationBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.presentationBindingV1Digest(...args_1), context };
      },
      evidenceBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.evidenceBindingV1Digest(...args_1), context };
      },
      anchorEvidenceReceiptV1Digest(context, ...args_1) {
        return { result: pureCircuits.anchorEvidenceReceiptV1Digest(...args_1), context };
      },
      decisionNullifierMaterialV1Digest(context, ...args_1) {
        return { result: pureCircuits.decisionNullifierMaterialV1Digest(...args_1), context };
      },
      syntheticVerificationExtensionV1Digest(context, ...args_1) {
        return { result: pureCircuits.syntheticVerificationExtensionV1Digest(...args_1), context };
      },
      verificationTranscriptV1Digest(context, ...args_1) {
        return { result: pureCircuits.verificationTranscriptV1Digest(...args_1), context };
      },
      assertValidEvidenceBindingV1(context, ...args_1) {
        return { result: pureCircuits.assertValidEvidenceBindingV1(...args_1), context };
      },
      assertValidVerificationTranscriptV1(context, ...args_1) {
        return { result: pureCircuits.assertValidVerificationTranscriptV1(...args_1), context };
      },
      assertValidVerificationPublicInputsV1(context, ...args_1) {
        return { result: pureCircuits.assertValidVerificationPublicInputsV1(...args_1), context };
      },
      syntheticUnavailableAuthorityVerificationV1(context, ...args_1) {
        return { result: pureCircuits.syntheticUnavailableAuthorityVerificationV1(...args_1), context };
      },
      universityDiplomaClaimPayloadRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaClaimPayloadRoot(...args_1), context };
      },
      universityDiplomaClaimRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaClaimRoot(...args_1), context };
      },
      universityDiplomaProductionPublicClaimsRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaProductionPublicClaimsRoot(...args_1), context };
      },
      universityDiplomaClaimCommitmentsRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaClaimCommitmentsRoot(...args_1), context };
      },
      universityDiplomaProductionClaimRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaProductionClaimRoot(...args_1), context };
      },
      universityDiplomaIdCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaIdCommitment(...args_1), context };
      },
      universityDiplomaStudentIdCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaStudentIdCommitment(...args_1), context };
      },
      universityDiplomaGraduateNameCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaGraduateNameCommitment(...args_1), context };
      },
      universityDiplomaFacultyNameCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaFacultyNameCommitment(...args_1), context };
      },
      universityDiplomaHonorsCodeCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaHonorsCodeCommitment(...args_1), context };
      },
      universityDiplomaGraduationMonthCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaGraduationMonthCommitment(...args_1), context };
      },
      universityDiplomaFinalGradeCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaFinalGradeCommitment(...args_1), context };
      },
      universityDiplomaCreditsEarnedCommitment(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaCreditsEarnedCommitment(...args_1), context };
      },
      universityDiplomaCredentialBodyRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaCredentialBodyRoot(...args_1), context };
      },
      universityDiplomaProductionCredentialBodyRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaProductionCredentialBodyRoot(...args_1), context };
      },
      universityDiplomaProductionPresentationBodyRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaProductionPresentationBodyRoot(...args_1), context };
      },
      universityDiplomaPresentationBodyRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaPresentationBodyRoot(...args_1), context };
      },
      universityDiplomaPresentationRequestBodyRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaPresentationRequestBodyRoot(...args_1), context };
      },
      universityDiplomaProductionPresentationRequestBodyRoot(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaProductionPresentationRequestBodyRoot(...args_1), context };
      },
      assertValidUniversityDiplomaSchemaRef(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaSchemaRef(...args_1), context };
      },
      assertValidUniversityDiplomaProductionSchemaRef(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaProductionSchemaRef(...args_1), context };
      },
      assertValidUniversityDiplomaPresentationRequest(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaPresentationRequest(...args_1), context };
      },
      assertValidUniversityDiplomaProductionPresentationRequest(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaProductionPresentationRequest(...args_1), context };
      },
      assertValidUniversityDiplomaClaims(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaClaims(...args_1), context };
      },
      assertValidUniversityDiplomaProductionPublicClaims(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaProductionPublicClaims(...args_1), context };
      },
      assertValidUniversityDiplomaCredential(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaCredential(...args_1), context };
      },
      assertValidUniversityDiplomaProductionCredential(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaProductionCredential(...args_1), context };
      },
      assertUniversityDiplomaProductionDisclosuresMatchCredential(context, ...args_1) {
        return { result: pureCircuits.assertUniversityDiplomaProductionDisclosuresMatchCredential(...args_1), context };
      },
      assertUniversityDiplomaProductionFinalGradeAtLeast(context, ...args_1) {
        return { result: pureCircuits.assertUniversityDiplomaProductionFinalGradeAtLeast(...args_1), context };
      },
      assertUniversityDiplomaProductionCreditsEarnedAtLeast(context, ...args_1) {
        return { result: pureCircuits.assertUniversityDiplomaProductionCreditsEarnedAtLeast(...args_1), context };
      },
      assertValidUniversityDiplomaProductionPresentation(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaProductionPresentation(...args_1), context };
      },
      assertValidUniversityDiplomaPresentation(context, ...args_1) {
        return { result: pureCircuits.assertValidUniversityDiplomaPresentation(...args_1), context };
      },
      assertUniversityDiplomaPresentationSatisfiesRequest(context, ...args_1) {
        return { result: pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(...args_1), context };
      },
      assertUniversityDiplomaProductionPresentationSatisfiesRequest(context, ...args_1) {
        return { result: pureCircuits.assertUniversityDiplomaProductionPresentationSatisfiesRequest(...args_1), context };
      },
      universityDiplomaSchemaRef(context, ...args_1) {
        return { result: pureCircuits.universityDiplomaSchemaRef(...args_1), context };
      },
      universityJobApplicationRequest(context, ...args_1) {
        return { result: pureCircuits.universityJobApplicationRequest(...args_1), context };
      },
      universityMallDiscountRequest(context, ...args_1) {
        return { result: pureCircuits.universityMallDiscountRequest(...args_1), context };
      },
      verifyUniversityDiplomaForJobApplication: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`verifyUniversityDiplomaForJobApplication: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const request_0 = args_1[3];
        const presentation_0 = args_1[4];
        const presentationProof_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForJobApplication',
                                     'argument 1 (as invoked from Typescript)',
                                     'university-verifier.compact line 113 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.diplomaId.buffer instanceof ArrayBuffer && credential_0.claims.diplomaId.BYTES_PER_ELEMENT === 1 && credential_0.claims.diplomaId.length === 32 && credential_0.claims.studentId.buffer instanceof ArrayBuffer && credential_0.claims.studentId.BYTES_PER_ELEMENT === 1 && credential_0.claims.studentId.length === 16 && credential_0.claims.graduateName.buffer instanceof ArrayBuffer && credential_0.claims.graduateName.BYTES_PER_ELEMENT === 1 && credential_0.claims.graduateName.length === 32 && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.facultyName.buffer instanceof ArrayBuffer && credential_0.claims.facultyName.BYTES_PER_ELEMENT === 1 && credential_0.claims.facultyName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && credential_0.claims.honorsCode.buffer instanceof ArrayBuffer && credential_0.claims.honorsCode.BYTES_PER_ELEMENT === 1 && credential_0.claims.honorsCode.length === 16 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claims.graduationMonth) === 'bigint' && credential_0.claims.graduationMonth >= 0n && credential_0.claims.graduationMonth <= 255n && typeof(credential_0.claims.finalGrade) === 'bigint' && credential_0.claims.finalGrade >= 0n && credential_0.claims.finalGrade <= 255n && typeof(credential_0.claims.creditsEarned) === 'bigint' && credential_0.claims.creditsEarned >= 0n && credential_0.claims.creditsEarned <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForJobApplication',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'university-verifier.compact line 113 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForJobApplication',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'university-verifier.compact line 113 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForJobApplication',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'university-verifier.compact line 113 char 1',
                                     'struct UniversityDiplomaPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                     request_0)
        }
        if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForJobApplication',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'university-verifier.compact line 113 char 1',
                                     'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, revealGraduateName: Boolean, graduateName: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>>>',
                                     presentation_0)
        }
        if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForJobApplication',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'university-verifier.compact line 113 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     presentationProof_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_13.toValue(credential_0).concat(_descriptor_17.toValue(credentialProof_0).concat(_descriptor_18.toValue(request_0).concat(_descriptor_20.toValue(presentation_0).concat(_descriptor_17.toValue(presentationProof_0))))),
            alignment: _descriptor_13.alignment().concat(_descriptor_17.alignment().concat(_descriptor_18.alignment().concat(_descriptor_20.alignment().concat(_descriptor_17.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifyUniversityDiplomaForJobApplication_0(context,
                                                                          partialProofData,
                                                                          credential_0,
                                                                          credentialProof_0,
                                                                          request_0,
                                                                          presentation_0,
                                                                          presentationProof_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      verifyUniversityDiplomaForMallDiscount: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`verifyUniversityDiplomaForMallDiscount: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const credentialProof_0 = args_1[2];
        const request_0 = args_1[3];
        const presentation_0 = args_1[4];
        const presentationProof_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForMallDiscount',
                                     'argument 1 (as invoked from Typescript)',
                                     'university-verifier.compact line 172 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.diplomaId.buffer instanceof ArrayBuffer && credential_0.claims.diplomaId.BYTES_PER_ELEMENT === 1 && credential_0.claims.diplomaId.length === 32 && credential_0.claims.studentId.buffer instanceof ArrayBuffer && credential_0.claims.studentId.BYTES_PER_ELEMENT === 1 && credential_0.claims.studentId.length === 16 && credential_0.claims.graduateName.buffer instanceof ArrayBuffer && credential_0.claims.graduateName.BYTES_PER_ELEMENT === 1 && credential_0.claims.graduateName.length === 32 && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.facultyName.buffer instanceof ArrayBuffer && credential_0.claims.facultyName.BYTES_PER_ELEMENT === 1 && credential_0.claims.facultyName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && credential_0.claims.honorsCode.buffer instanceof ArrayBuffer && credential_0.claims.honorsCode.BYTES_PER_ELEMENT === 1 && credential_0.claims.honorsCode.length === 16 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claims.graduationMonth) === 'bigint' && credential_0.claims.graduationMonth >= 0n && credential_0.claims.graduationMonth <= 255n && typeof(credential_0.claims.finalGrade) === 'bigint' && credential_0.claims.finalGrade >= 0n && credential_0.claims.finalGrade <= 255n && typeof(credential_0.claims.creditsEarned) === 'bigint' && credential_0.claims.creditsEarned >= 0n && credential_0.claims.creditsEarned <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForMallDiscount',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'university-verifier.compact line 172 char 1',
                                     'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                     credential_0)
        }
        if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForMallDiscount',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'university-verifier.compact line 172 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     credentialProof_0)
        }
        if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForMallDiscount',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'university-verifier.compact line 172 char 1',
                                     'struct UniversityDiplomaPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                     request_0)
        }
        if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForMallDiscount',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'university-verifier.compact line 172 char 1',
                                     'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, revealGraduateName: Boolean, graduateName: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>>>',
                                     presentation_0)
        }
        if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('verifyUniversityDiplomaForMallDiscount',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'university-verifier.compact line 172 char 1',
                                     'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                     presentationProof_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_13.toValue(credential_0).concat(_descriptor_17.toValue(credentialProof_0).concat(_descriptor_18.toValue(request_0).concat(_descriptor_20.toValue(presentation_0).concat(_descriptor_17.toValue(presentationProof_0))))),
            alignment: _descriptor_13.alignment().concat(_descriptor_17.alignment().concat(_descriptor_18.alignment().concat(_descriptor_20.alignment().concat(_descriptor_17.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifyUniversityDiplomaForMallDiscount_0(context,
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
      verifyUniversityDiplomaForJobApplication: this.circuits.verifyUniversityDiplomaForJobApplication,
      verifyUniversityDiplomaForMallDiscount: this.circuits.verifyUniversityDiplomaForMallDiscount
    };
    this.provableCircuits = {
      verifyUniversityDiplomaForJobApplication: this.circuits.verifyUniversityDiplomaForJobApplication,
      verifyUniversityDiplomaForMallDiscount: this.circuits.verifyUniversityDiplomaForMallDiscount
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
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('verifyUniversityDiplomaForJobApplication', new __compactRuntime.ContractOperation());
    state_0.setOperation('verifyUniversityDiplomaForMallDiscount', new __compactRuntime.ContractOperation());
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_58.toValue(0n),
                                                                                              alignment: _descriptor_58.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(1n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(2n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(3n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(4n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(5n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(6n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(7n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(8n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(9n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(10n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(11n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_58.toValue(tmp_0),
                                                                                              alignment: _descriptor_58.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(3n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([117, 110, 105, 118, 101, 114, 115, 105, 116, 121, 58, 110, 111, 110, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(4n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([117, 110, 105, 118, 101, 114, 115, 105, 116, 121, 58, 110, 111, 45, 114, 101, 113, 117, 101, 115, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(5n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(6n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(7n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(8n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_1),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_2 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(9n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_2),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_3 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(10n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_3),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_4 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(11n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_4),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_14, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_8, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_55, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_5, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_54, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_42, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_38, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_39, value_0);
    return result_0;
  }
  _persistentHash_6(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_36, value_0);
    return result_0;
  }
  _persistentHash_7(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_37, value_0);
    return result_0;
  }
  _persistentHash_8(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_30, value_0);
    return result_0;
  }
  _persistentHash_9(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_35, value_0);
    return result_0;
  }
  _persistentHash_10(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_33, value_0);
    return result_0;
  }
  _persistentHash_11(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_34, value_0);
    return result_0;
  }
  _persistentHash_12(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_29, value_0);
    return result_0;
  }
  _persistentHash_13(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_14(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_21, value_0);
    return result_0;
  }
  _persistentHash_15(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_53, value_0);
    return result_0;
  }
  _persistentHash_16(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_22, value_0);
    return result_0;
  }
  _persistentHash_17(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_52, value_0);
    return result_0;
  }
  _persistentHash_18(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_26, value_0);
    return result_0;
  }
  _persistentHash_19(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentHash_20(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_18, value_0);
    return result_0;
  }
  _persistentHash_21(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_24, value_0);
    return result_0;
  }
  _persistentHash_22(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_23, value_0);
    return result_0;
  }
  _persistentHash_23(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_13, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_0,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_1(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_10,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_2(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_2,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_3(value_0, rand_0) {
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
  _statusAttestationContextTag_0() {
    return new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 115, 116, 97, 116, 117, 115, 45, 97, 116, 116, 101, 115, 116, 97, 116, 105, 111, 110, 0, 0]);
  }
  _proofPayloadRootForContext_0(bodyRoot_0, contextTag_0, proof_0) {
    return this._persistentHash_0([bodyRoot_0,
                                   contextTag_0,
                                   this._persistentHash_1(proof_0.signerVerificationMethodRef),
                                   this._upgradeFromTransient_0(this._transientHash_1(proof_0.createdAt)),
                                   proof_0.challengeHash]);
  }
  _proofChallengeForContext_0(bodyRoot_0, contextTag_0, proof_0) {
    return this._degradeToTransient_0(this._persistentHash_17([this._proofPayloadRootForContext_0(bodyRoot_0,
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
  _statusAttestationProofPayloadRoot_0(bodyRoot_0, proof_0) {
    return this._proofPayloadRootForContext_0(bodyRoot_0,
                                              this._statusAttestationContextTag_0(),
                                              proof_0);
  }
  _statusAttestationProofChallenge_0(bodyRoot_0, proof_0) {
    return this._proofChallengeForContext_0(bodyRoot_0,
                                            this._statusAttestationContextTag_0(),
                                            proof_0);
  }
  _assertValidStatusAttestationContextProof_0(bodyRoot_0, proof_0) {
    this._assertValidProofForContext_0(bodyRoot_0,
                                       this._statusAttestationContextTag_0(),
                                       proof_0);
    return [];
  }
  _credentialBodyRoot_0(credential_0) {
    return this._persistentHash_22(credential_0);
  }
  _credentialBodyRoot_1(credential_0) {
    return this._persistentHash_23(credential_0);
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
  _assertValidCredentialEnvelope_1(credential_0, expectedClaimRoot_0) {
    __compactRuntime.assert(this._equal_7(credential_0.version, 1n),
                            'Credential version mismatch');
    __compactRuntime.assert(this._equal_8(credential_0.claimRoot,
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
    const bodyRoot_0 = this._credentialBodyRoot_1(credential_0);
    this._assertValidCredentialProofForBodyRoot_1(credential_0,
                                                  proof_0,
                                                  bodyRoot_0);
    return [];
  }
  _assertValidCredentialProof_1(credential_0, proof_0) {
    const bodyRoot_0 = this._credentialBodyRoot_0(credential_0);
    this._assertValidCredentialProofForBodyRoot_0(credential_0,
                                                  proof_0,
                                                  bodyRoot_0);
    return [];
  }
  _assertValidCredentialProofForBodyRoot_0(credential_0, proof_0, bodyRoot_0) {
    __compactRuntime.assert(this._equal_9(credential_0.issuerVerificationMethodRef.didContractAddress,
                                          proof_0.signerVerificationMethodRef.didContractAddress),
                            'Issuer proof contract address does not match issuer verification method');
    __compactRuntime.assert(this._equal_10(credential_0.issuerVerificationMethodRef.methodId,
                                           proof_0.signerVerificationMethodRef.methodId),
                            'Issuer proof method reference does not match issuer verification method');
    this._assertValidIssuanceContextProof_0(bodyRoot_0, proof_0);
    return [];
  }
  _assertValidCredentialProofForBodyRoot_1(credential_0, proof_0, bodyRoot_0) {
    __compactRuntime.assert(this._equal_11(credential_0.issuerVerificationMethodRef.didContractAddress,
                                           proof_0.signerVerificationMethodRef.didContractAddress),
                            'Issuer proof contract address does not match issuer verification method');
    __compactRuntime.assert(this._equal_12(credential_0.issuerVerificationMethodRef.methodId,
                                           proof_0.signerVerificationMethodRef.methodId),
                            'Issuer proof method reference does not match issuer verification method');
    this._assertValidIssuanceContextProof_0(bodyRoot_0, proof_0);
    return [];
  }
  _presentationBodyRoot_0(presentation_0) {
    return this._persistentHash_18(presentation_0);
  }
  _presentationBodyRoot_1(presentation_0) {
    return this._persistentHash_19(presentation_0);
  }
  _assertValidPresentationEnvelope_0(presentation_0) {
    __compactRuntime.assert(this._equal_13(presentation_0.version, 1n),
                            'Presentation version mismatch');
    return [];
  }
  _assertValidPresentationEnvelope_1(presentation_0) {
    __compactRuntime.assert(this._equal_14(presentation_0.version, 1n),
                            'Presentation version mismatch');
    return [];
  }
  _assertMatchingCredentialPresentation_0(credential_0, presentation_0) {
    __compactRuntime.assert(this._equal_15(presentation_0.credentialClaimRoot,
                                           credential_0.claimRoot),
                            'Presentation must reference the credential claim root');
    __compactRuntime.assert(this._equal_16(presentation_0.issuerVerificationMethodRef.didContractAddress,
                                           credential_0.issuerVerificationMethodRef.didContractAddress),
                            'Presentation issuer contract does not match credential issuer');
    __compactRuntime.assert(this._equal_17(presentation_0.issuerVerificationMethodRef.methodId,
                                           credential_0.issuerVerificationMethodRef.methodId),
                            'Presentation issuer method reference does not match credential issuer');
    return [];
  }
  _assertMatchingCredentialPresentation_1(credential_0, presentation_0) {
    __compactRuntime.assert(this._equal_18(presentation_0.credentialClaimRoot,
                                           credential_0.claimRoot),
                            'Presentation must reference the credential claim root');
    __compactRuntime.assert(this._equal_19(presentation_0.issuerVerificationMethodRef.didContractAddress,
                                           credential_0.issuerVerificationMethodRef.didContractAddress),
                            'Presentation issuer contract does not match credential issuer');
    __compactRuntime.assert(this._equal_20(presentation_0.issuerVerificationMethodRef.methodId,
                                           credential_0.issuerVerificationMethodRef.methodId),
                            'Presentation issuer method reference does not match credential issuer');
    return [];
  }
  _assertValidExplicitHolderBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_21(binding_0.holderVerificationMethodRef.didContractAddress.bytes,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Explicit holder binding DID contract address must be set');
    __compactRuntime.assert(!this._equal_22(binding_0.holderVerificationMethodRef.methodId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Explicit holder binding method reference must be set');
    return [];
  }
  _assertMatchingExplicitHolderBindings_0(credentialBinding_0,
                                          presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_23(presentationBinding_0.holderVerificationMethodRef.didContractAddress,
                                           credentialBinding_0.holderVerificationMethodRef.didContractAddress),
                            'Presentation holder contract does not match credential holder binding');
    __compactRuntime.assert(this._equal_24(presentationBinding_0.holderVerificationMethodRef.methodId,
                                           credentialBinding_0.holderVerificationMethodRef.methodId),
                            'Presentation holder method reference does not match credential holder binding');
    return [];
  }
  _assertProofMatchesExplicitHolderBinding_0(binding_0, presentationProof_0) {
    __compactRuntime.assert(this._equal_25(binding_0.holderVerificationMethodRef.didContractAddress,
                                           presentationProof_0.signerVerificationMethodRef.didContractAddress),
                            'Presentation proof signer must match holder binding');
    __compactRuntime.assert(this._equal_26(binding_0.holderVerificationMethodRef.methodId,
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
    __compactRuntime.assert(!this._equal_27(binding_0.holderDidStateHash,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Offchain Midnight holder state hash must be set');
    __compactRuntime.assert(!this._equal_28(binding_0.holderMethodId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Offchain Midnight holder method id must be set');
    const jubjubBinding_0 = { holderPublicKey: binding_0.holderPublicKey };
    this._assertValidJubjubHolderBinding_0(jubjubBinding_0);
    return [];
  }
  _assertMatchingOffchainMidnightHolderBindings_0(credentialBinding_0,
                                                  presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_29(presentationBinding_0.holderDidStateHash,
                                           credentialBinding_0.holderDidStateHash),
                            'Offchain Midnight holder state hash does not match the credential holder binding');
    __compactRuntime.assert(this._equal_30(presentationBinding_0.holderMethodId,
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
    return this._persistentHash_17([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 111, 108, 100, 101, 114, 45, 99, 104, 97, 108, 108, 0, 0, 0, 0, 0, 0, 0, 0]),
                                    holderSecret_0,
                                    verifierChallengeHash_0]);
  }
  _verifierScopedPseudonym_0(holderSecret_0, verifierDomainHash_0) {
    return this._persistentHash_17([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 104, 111, 108, 100, 101, 114, 45, 112, 115, 101, 117, 100, 111, 110, 121, 109, 0, 0, 0, 0]),
                                    holderSecret_0,
                                    verifierDomainHash_0]);
  }
  _assertVerifierScopedPseudonym_0(pseudonym_0,
                                   holderSecret_0,
                                   verifierDomainHash_0)
  {
    __compactRuntime.assert(this._equal_31(pseudonym_0,
                                           this._verifierScopedPseudonym_0(holderSecret_0,
                                                                           verifierDomainHash_0)),
                            'Verifier-scoped pseudonym does not match the holder secret and verifier domain');
    return [];
  }
  _blindedSecretHolderCommitment_0(holderSecretCommitment_0,
                                   issuerNonce_0,
                                   blindingFactor_0)
  {
    return this._persistentHash_2([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 98, 108, 105, 110, 100, 45, 104, 111, 108, 100, 101, 114, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   holderSecretCommitment_0,
                                   issuerNonce_0,
                                   blindingFactor_0]);
  }
  _assertValidSecretHolderCredentialBinding_0(binding_0) {
    __compactRuntime.assert(this._equal_32(binding_0.requestChallengeResponse,
                                           this._noSecretHolderChallengeResponse_0()),
                            'Credential secret holder binding must not embed a request challenge response');
    return [];
  }
  _assertValidSecretHolderPresentationBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_33(binding_0.requestChallengeResponse,
                                            this._noSecretHolderChallengeResponse_0()),
                            'Presentation secret holder binding must include a request challenge response');
    return [];
  }
  _assertMatchingSecretHolderBindings_0(credentialBinding_0,
                                        presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_34(credentialBinding_0.holderSecretCommitment,
                                           presentationBinding_0.holderSecretCommitment),
                            'Presentation holder secret commitment does not match the credential holder binding');
    return [];
  }
  _assertValidBlindedSecretHolderCredentialBinding_0(binding_0) {
    __compactRuntime.assert(this._equal_35(binding_0.requestChallengeResponse,
                                           this._noSecretHolderChallengeResponse_0()),
                            'Credential blinded holder binding must not embed a request challenge response');
    return [];
  }
  _assertValidBlindedSecretHolderPresentationBinding_0(binding_0) {
    __compactRuntime.assert(!this._equal_36(binding_0.requestChallengeResponse,
                                            this._noSecretHolderChallengeResponse_0()),
                            'Presentation blinded holder binding must include a request challenge response');
    return [];
  }
  _assertMatchingBlindedSecretHolderBindings_0(credentialBinding_0,
                                               presentationBinding_0)
  {
    __compactRuntime.assert(this._equal_37(credentialBinding_0.blindedHolderSecretCommitment,
                                           presentationBinding_0.blindedHolderSecretCommitment),
                            'Presentation blinded holder commitment does not match the credential holder binding');
    __compactRuntime.assert(this._equal_38(credentialBinding_0.issuerNonce,
                                           presentationBinding_0.issuerNonce),
                            'Presentation issuer nonce does not match the credential holder binding');
    return [];
  }
  _assertSecretHolderBindingWitness_0(binding_0,
                                      verifierChallengeHash_0,
                                      holderSecret_0,
                                      opening_0)
  {
    __compactRuntime.assert(this._equal_39(this._secretHolderBindingCommitment_0(holderSecret_0,
                                                                                 opening_0),
                                           binding_0.holderSecretCommitment),
                            'Holder secret witness does not match the holder-binding commitment');
    __compactRuntime.assert(this._equal_40(this._secretHolderBindingChallengeResponse_0(holderSecret_0,
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
    __compactRuntime.assert(this._equal_41(this._blindedSecretHolderCommitment_0(holderCommitment_0,
                                                                                 binding_0.issuerNonce,
                                                                                 blindingFactor_0),
                                           binding_0.blindedHolderSecretCommitment),
                            'Blinded holder commitment does not match the hidden holder secret witness');
    __compactRuntime.assert(this._equal_42(this._secretHolderBindingChallengeResponse_0(holderSecret_0,
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
    __compactRuntime.assert(!this._equal_43(verificationMethodRef_0.methodId,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Verification method reference must be set');
    return [];
  }
  _assertMatchingSchemaRefs_0(expected_0, actual_0) {
    this._assertValidSchemaRef_0(expected_0);
    this._assertValidSchemaRef_0(actual_0);
    __compactRuntime.assert(this._equal_44(expected_0.packageId,
                                           actual_0.packageId)
                            &&
                            this._equal_45(expected_0.schemaId,
                                           actual_0.schemaId)
                            &&
                            this._equal_46(expected_0.majorVersion,
                                           actual_0.majorVersion)
                            &&
                            this._equal_47(expected_0.minorVersion,
                                           actual_0.minorVersion),
                            'Schema reference mismatch');
    return [];
  }
  _assertValidProtocolMessageEnvelope_0(envelope_0) {
    const noResponse_0 = this._noProtocolResponseReference_0();
    __compactRuntime.assert(this._equal_48(envelope_0.version, 1n),
                            'Protocol message version mismatch');
    __compactRuntime.assert(!this._equal_49(envelope_0.messageId, noResponse_0),
                            'Protocol message id must be set');
    __compactRuntime.assert(!this._equal_50(envelope_0.threadId, noResponse_0),
                            'Protocol thread id must be set');
    if (envelope_0.initialMessage) {
      __compactRuntime.assert(this._equal_51(envelope_0.respondsToMessageId,
                                             noResponse_0),
                              'Initial protocol message must not reference a previous message');
    } else {
      __compactRuntime.assert(!this._equal_52(envelope_0.respondsToMessageId,
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
    __compactRuntime.assert(this._equal_53(responseEnvelope_0.threadId,
                                           requestEnvelope_0.threadId),
                            'Protocol response thread id does not match the request thread id');
    __compactRuntime.assert(this._equal_54(responseEnvelope_0.respondsToMessageId,
                                           requestEnvelope_0.messageId),
                            'Protocol response does not reference the request message id');
    let t_0;
    __compactRuntime.assert((t_0 = responseEnvelope_0.createdAt,
                             t_0 >= requestEnvelope_0.createdAt),
                            'Protocol response creation time must not precede the request');
    return [];
  }
  _assertValidStatusRegistryRef_0(registryRef_0) {
    __compactRuntime.assert(!this._equal_55(registryRef_0.registryId,
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
    __compactRuntime.assert(!this._equal_56(binding_0.statusHandleCommitment,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Status handle commitment must be set');
    return [];
  }
  _registryBoundStatusBindingRoot_0(binding_0) {
    this._assertValidRegistryBoundStatusBinding_0(binding_0);
    return this._persistentHash_3(binding_0);
  }
  _verificationTranscriptDomainV1_0() {
    return Uint8Array.from([63n,
                            56n,
                            198n,
                            42n,
                            226n,
                            146n,
                            255n,
                            163n,
                            85n,
                            187n,
                            202n,
                            78n,
                            63n,
                            155n,
                            233n,
                            169n,
                            228n,
                            52n,
                            193n,
                            68n,
                            91n,
                            24n,
                            169n,
                            37n,
                            242n,
                            190n,
                            97n,
                            118n,
                            32n,
                            251n,
                            193n,
                            12n],
                           Number);
  }
  _decisionNullifierDomainV1_0() {
    return Uint8Array.from([150n,
                            193n,
                            181n,
                            12n,
                            161n,
                            39n,
                            108n,
                            151n,
                            225n,
                            194n,
                            187n,
                            12n,
                            143n,
                            1n,
                            148n,
                            3n,
                            4n,
                            131n,
                            155n,
                            165n,
                            198n,
                            201n,
                            124n,
                            196n,
                            237n,
                            66n,
                            55n,
                            63n,
                            48n,
                            37n,
                            90n,
                            75n],
                           Number);
  }
  _credentialBindingDomainV1_0() {
    return Uint8Array.from([197n,
                            76n,
                            106n,
                            241n,
                            201n,
                            229n,
                            63n,
                            246n,
                            221n,
                            145n,
                            181n,
                            205n,
                            148n,
                            35n,
                            112n,
                            124n,
                            22n,
                            165n,
                            60n,
                            37n,
                            187n,
                            26n,
                            77n,
                            143n,
                            7n,
                            56n,
                            253n,
                            137n,
                            123n,
                            111n,
                            95n,
                            226n],
                           Number);
  }
  _holderBindingDomainV1_0() {
    return Uint8Array.from([10n,
                            229n,
                            146n,
                            114n,
                            36n,
                            95n,
                            86n,
                            43n,
                            108n,
                            113n,
                            63n,
                            80n,
                            208n,
                            34n,
                            224n,
                            200n,
                            4n,
                            191n,
                            144n,
                            18n,
                            121n,
                            175n,
                            1n,
                            246n,
                            210n,
                            196n,
                            206n,
                            105n,
                            219n,
                            233n,
                            54n,
                            250n],
                           Number);
  }
  _consentBindingDomainV1_0() {
    return Uint8Array.from([160n,
                            174n,
                            47n,
                            177n,
                            91n,
                            75n,
                            4n,
                            222n,
                            121n,
                            133n,
                            41n,
                            51n,
                            125n,
                            153n,
                            228n,
                            35n,
                            136n,
                            50n,
                            209n,
                            242n,
                            171n,
                            94n,
                            164n,
                            13n,
                            50n,
                            220n,
                            107n,
                            8n,
                            241n,
                            221n,
                            19n,
                            217n],
                           Number);
  }
  _presentationBindingDomainV1_0() {
    return Uint8Array.from([149n,
                            92n,
                            149n,
                            199n,
                            150n,
                            200n,
                            77n,
                            200n,
                            31n,
                            220n,
                            39n,
                            104n,
                            181n,
                            120n,
                            26n,
                            117n,
                            215n,
                            158n,
                            204n,
                            213n,
                            134n,
                            114n,
                            63n,
                            105n,
                            137n,
                            50n,
                            103n,
                            99n,
                            33n,
                            229n,
                            146n,
                            47n],
                           Number);
  }
  _issuerEvidenceDomainV1_0() {
    return Uint8Array.from([175n,
                            31n,
                            160n,
                            178n,
                            143n,
                            18n,
                            160n,
                            85n,
                            254n,
                            204n,
                            216n,
                            140n,
                            165n,
                            232n,
                            157n,
                            64n,
                            156n,
                            102n,
                            4n,
                            249n,
                            109n,
                            99n,
                            97n,
                            14n,
                            5n,
                            212n,
                            173n,
                            31n,
                            244n,
                            25n,
                            27n,
                            5n],
                           Number);
  }
  _trustEvidenceDomainV1_0() {
    return Uint8Array.from([77n,
                            24n,
                            69n,
                            2n,
                            30n,
                            35n,
                            237n,
                            22n,
                            151n,
                            143n,
                            238n,
                            11n,
                            179n,
                            153n,
                            72n,
                            141n,
                            187n,
                            10n,
                            61n,
                            61n,
                            199n,
                            188n,
                            55n,
                            127n,
                            149n,
                            80n,
                            161n,
                            189n,
                            57n,
                            217n,
                            221n,
                            246n],
                           Number);
  }
  _statusEvidenceDomainV1_0() {
    return Uint8Array.from([143n,
                            211n,
                            194n,
                            11n,
                            93n,
                            158n,
                            116n,
                            195n,
                            106n,
                            154n,
                            16n,
                            164n,
                            233n,
                            41n,
                            124n,
                            202n,
                            9n,
                            22n,
                            107n,
                            239n,
                            173n,
                            27n,
                            82n,
                            204n,
                            122n,
                            39n,
                            176n,
                            212n,
                            28n,
                            235n,
                            132n,
                            150n],
                           Number);
  }
  _timeEvidenceDomainV1_0() {
    return Uint8Array.from([137n,
                            91n,
                            137n,
                            109n,
                            119n,
                            1n,
                            230n,
                            4n,
                            84n,
                            96n,
                            224n,
                            200n,
                            155n,
                            253n,
                            135n,
                            204n,
                            50n,
                            196n,
                            217n,
                            142n,
                            166n,
                            118n,
                            87n,
                            210n,
                            64n,
                            228n,
                            102n,
                            115n,
                            211n,
                            162n,
                            239n,
                            124n],
                           Number);
  }
  _artifactEvidenceDomainV1_0() {
    return Uint8Array.from([148n,
                            245n,
                            89n,
                            240n,
                            254n,
                            64n,
                            233n,
                            41n,
                            79n,
                            80n,
                            127n,
                            211n,
                            99n,
                            183n,
                            138n,
                            81n,
                            126n,
                            78n,
                            48n,
                            47n,
                            159n,
                            187n,
                            90n,
                            96n,
                            170n,
                            87n,
                            160n,
                            245n,
                            117n,
                            49n,
                            155n,
                            66n],
                           Number);
  }
  _connectorEvidenceDomainV1_0() {
    return Uint8Array.from([189n,
                            30n,
                            23n,
                            233n,
                            241n,
                            100n,
                            32n,
                            42n,
                            226n,
                            107n,
                            197n,
                            74n,
                            238n,
                            164n,
                            15n,
                            230n,
                            24n,
                            153n,
                            72n,
                            167n,
                            47n,
                            146n,
                            129n,
                            163n,
                            210n,
                            75n,
                            208n,
                            140n,
                            114n,
                            90n,
                            89n,
                            88n],
                           Number);
  }
  _anchorEvidenceReceiptDomainV1_0() {
    return Uint8Array.from([47n,
                            144n,
                            220n,
                            178n,
                            165n,
                            229n,
                            193n,
                            110n,
                            106n,
                            62n,
                            232n,
                            14n,
                            25n,
                            54n,
                            230n,
                            84n,
                            252n,
                            215n,
                            216n,
                            148n,
                            194n,
                            211n,
                            9n,
                            206n,
                            8n,
                            13n,
                            232n,
                            172n,
                            64n,
                            155n,
                            90n,
                            157n],
                           Number);
  }
  _syntheticVerificationExtensionDomainV1_0() {
    return Uint8Array.from([239n,
                            132n,
                            52n,
                            116n,
                            67n,
                            117n,
                            88n,
                            64n,
                            32n,
                            33n,
                            134n,
                            225n,
                            242n,
                            167n,
                            74n,
                            111n,
                            9n,
                            46n,
                            7n,
                            122n,
                            148n,
                            106n,
                            138n,
                            10n,
                            252n,
                            137n,
                            206n,
                            93n,
                            182n,
                            119n,
                            170n,
                            172n],
                           Number);
  }
  _credentialBindingV1Digest_0(binding_0) {
    return this._persistentHash_4(binding_0);
  }
  _holderBindingV1Digest_0(binding_0) {
    return this._persistentHash_5(binding_0);
  }
  _consentBindingV1Digest_0(binding_0) {
    return this._persistentHash_6(binding_0);
  }
  _presentationBindingV1Digest_0(binding_0) {
    return this._persistentHash_7(binding_0);
  }
  _evidenceBindingV1Digest_0(binding_0) {
    return this._persistentHash_8(binding_0);
  }
  _anchorEvidenceReceiptV1Digest_0(receipt_0) {
    return this._persistentHash_9(receipt_0);
  }
  _decisionNullifierMaterialV1Digest_0(material_0) {
    return this._persistentHash_10(material_0);
  }
  _syntheticVerificationExtensionV1Digest_0(extension_0) {
    return this._persistentHash_11(extension_0);
  }
  _verificationTranscriptV1Digest_0(transcript_0) {
    return this._persistentHash_12(transcript_0);
  }
  _assertValidEvidenceBindingV1_0(binding_0, expectedDomain_0) {
    __compactRuntime.assert(this._equal_57(binding_0.domain, expectedDomain_0),
                            'Evidence domain does not match its class');
    __compactRuntime.assert(this._equal_58(binding_0.version, 1n),
                            'Evidence version must be 1');
    let t_0;
    __compactRuntime.assert((t_0 = binding_0.mode, t_0 <= 4n),
                            'Evidence mode is unknown');
    if (this._equal_59(binding_0.mode, 0n)) {
      __compactRuntime.assert(this._equal_60(binding_0.authorityDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Not-required evidence authority must be zero');
      __compactRuntime.assert(this._equal_61(binding_0.subjectDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Not-required evidence subject must be zero');
      __compactRuntime.assert(this._equal_62(binding_0.stateAnchorDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Not-required evidence anchor must be zero');
      __compactRuntime.assert(this._equal_63(binding_0.statementDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Not-required evidence statement must be zero');
      __compactRuntime.assert(this._equal_64(binding_0.createdAt, 0n),
                              'Not-required evidence creation time must be zero');
      __compactRuntime.assert(this._equal_65(binding_0.expiresAt, 0n),
                              'Not-required evidence expiry must be zero');
    }
    if (this._equal_66(binding_0.mode, 1n)) {
      __compactRuntime.assert(this._equal_67(binding_0.authorityDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Unavailable evidence authority must be zero');
      __compactRuntime.assert(!this._equal_68(binding_0.subjectDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Unavailable evidence subject must be scoped');
      __compactRuntime.assert(this._equal_69(binding_0.stateAnchorDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Unavailable evidence anchor must be zero');
      __compactRuntime.assert(this._equal_70(binding_0.statementDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Unavailable evidence statement must be zero');
      __compactRuntime.assert(this._equal_71(binding_0.createdAt, 0n),
                              'Unavailable evidence creation time must be zero');
      __compactRuntime.assert(this._equal_72(binding_0.expiresAt, 0n),
                              'Unavailable evidence expiry must be zero');
    }
    let t_1;
    if (t_1 = binding_0.mode, t_1 >= 2n) {
      __compactRuntime.assert(!this._equal_73(binding_0.authorityDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Accepted evidence authority must be set');
      __compactRuntime.assert(!this._equal_74(binding_0.subjectDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Accepted evidence subject must be set');
      __compactRuntime.assert(!this._equal_75(binding_0.stateAnchorDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Accepted evidence anchor must be set');
      __compactRuntime.assert(!this._equal_76(binding_0.statementDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Accepted evidence statement must be set');
      let t_2;
      __compactRuntime.assert((t_2 = binding_0.expiresAt, t_2 > 0n),
                              'Accepted evidence expiry must be set');
      let t_3;
      __compactRuntime.assert((t_3 = binding_0.createdAt,
                               t_3 <= binding_0.expiresAt),
                              'Evidence interval must be ordered');
    }
    return [];
  }
  _assertValidVerificationTranscriptV1_0(transcript_0) {
    __compactRuntime.assert(this._equal_77(transcript_0.domain,
                                           this._verificationTranscriptDomainV1_0()),
                            'Transcript domain must be V1');
    __compactRuntime.assert(this._equal_78(transcript_0.version, 1n),
                            'Transcript version must be 1');
    let t_0, t_1;
    __compactRuntime.assert((t_1 = transcript_0.profile, t_1 >= 1n)
                            &&
                            (t_0 = transcript_0.profile, t_0 <= 3n),
                            'Verification profile is unknown');
    let t_2, t_3;
    __compactRuntime.assert((t_3 = transcript_0.authority, t_3 >= 1n)
                            &&
                            (t_2 = transcript_0.authority, t_2 <= 3n),
                            'Verification authority is unknown');
    let t_4, t_5;
    __compactRuntime.assert((t_5 = transcript_0.credentialBindingMode, t_5 >= 1n)
                            &&
                            (t_4 = transcript_0.credentialBindingMode, t_4 <= 2n),
                            'Credential binding mode is unknown');
    let t_6;
    __compactRuntime.assert((t_6 = transcript_0.originMode, t_6 <= 2n),
                            'Origin mode is unknown');
    let t_7, t_8;
    __compactRuntime.assert((t_8 = transcript_0.issuerRelationship, t_8 >= 1n)
                            &&
                            (t_7 = transcript_0.issuerRelationship, t_7 <= 3n),
                            'Issuer relationship is unknown');
    let t_9;
    __compactRuntime.assert((t_9 = transcript_0.statusMode, t_9 <= 3n),
                            'Status mode is unknown');
    let t_10;
    __compactRuntime.assert((t_10 = transcript_0.timeMode, t_10 <= 2n),
                            'Time mode is unknown');
    let t_11;
    __compactRuntime.assert((t_11 = transcript_0.nullifierMode, t_11 <= 1n),
                            'Nullifier mode is unknown');
    let t_12;
    __compactRuntime.assert((t_12 = transcript_0.replayPolicy, t_12 <= 3n),
                            'Replay policy is unknown');
    if (this._equal_79(transcript_0.profile, 1n)) {
      __compactRuntime.assert(this._equal_80(transcript_0.authority, 1n),
                              'Ledger-local profile requires ledger-local target authority');
      __compactRuntime.assert(this._equal_81(transcript_0.originMode, 0n),
                              'Ledger-local profile cannot claim browser origin authority');
    }
    if (this._equal_82(transcript_0.profile, 2n)) {
      __compactRuntime.assert(this._equal_83(transcript_0.authority, 2n),
                              'Ledger-attested profile requires ledger-attested target authority');
      let t_13;
      __compactRuntime.assert((t_13 = transcript_0.originMode, t_13 <= 1n),
                              'Ledger-attested origin must be none or wallet-attested');
    }
    if (this._equal_84(transcript_0.profile, 3n)) {
      __compactRuntime.assert(this._equal_85(transcript_0.authority, 3n),
                              'Off-chain profile requires local-process authority');
      __compactRuntime.assert(this._equal_86(transcript_0.originMode, 0n)
                              ||
                              this._equal_87(transcript_0.originMode, 2n),
                              'Off-chain origin must be none or local-request');
    }
    if (this._equal_88(transcript_0.originMode, 0n)) {
      __compactRuntime.assert(this._equal_89(transcript_0.originDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-origin digest must be zero');
    } else {
      __compactRuntime.assert(!this._equal_90(transcript_0.originDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Enabled origin digest must be set');
    }
    __compactRuntime.assert(!this._equal_91(transcript_0.networkIdDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Network digest must be set');
    __compactRuntime.assert(!this._equal_92(transcript_0.verifierContractDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Verifier contract digest must be set');
    __compactRuntime.assert(!this._equal_93(transcript_0.deploymentDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Deployment digest must be set');
    __compactRuntime.assert(!this._equal_94(transcript_0.audienceDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Audience digest must be set');
    __compactRuntime.assert(!this._equal_95(transcript_0.connectorEvidenceDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Connector evidence digest must be set');
    __compactRuntime.assert(!this._equal_96(transcript_0.requestIdDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Request id digest must be set');
    __compactRuntime.assert(!this._equal_97(transcript_0.challengeDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Challenge digest must be set');
    let t_14;
    __compactRuntime.assert((t_14 = transcript_0.expiresAt, t_14 > 0n),
                            'Transcript expiry must be set');
    __compactRuntime.assert(!this._equal_98(transcript_0.credentialFamilyDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Credential family digest must be set');
    __compactRuntime.assert(!this._equal_99(transcript_0.schemaDigest,
                                            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Schema digest must be set');
    __compactRuntime.assert(!this._equal_100(transcript_0.credentialBindingDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Credential binding digest must be set');
    __compactRuntime.assert(!this._equal_101(transcript_0.disclosureDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Disclosure digest must be set');
    __compactRuntime.assert(!this._equal_102(transcript_0.predicateDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Predicate digest must be set');
    __compactRuntime.assert(!this._equal_103(transcript_0.holderBindingDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Holder binding digest must be set');
    __compactRuntime.assert(!this._equal_104(transcript_0.policyDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Policy digest must be set');
    __compactRuntime.assert(!this._equal_105(transcript_0.consentDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Consent digest must be set');
    __compactRuntime.assert(!this._equal_106(transcript_0.presentationBindingDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Presentation binding digest must be set');
    __compactRuntime.assert(!this._equal_107(transcript_0.issuerDidDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Issuer DID digest must be set');
    __compactRuntime.assert(!this._equal_108(transcript_0.issuerMethodDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Issuer method digest must be set');
    __compactRuntime.assert(!this._equal_109(transcript_0.issuerEvidenceDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Issuer evidence digest must be set');
    __compactRuntime.assert(!this._equal_110(transcript_0.trustScopeDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Trust scope digest must be set');
    __compactRuntime.assert(!this._equal_111(transcript_0.trustEvidenceDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Trust evidence digest must be set');
    __compactRuntime.assert(!this._equal_112(transcript_0.statusEvidenceDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Status evidence digest must be set');
    __compactRuntime.assert(!this._equal_113(transcript_0.timeEvidenceDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Time evidence digest must be set');
    __compactRuntime.assert(!this._equal_114(transcript_0.artifactManifestDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Artifact manifest digest must be set');
    __compactRuntime.assert(!this._equal_115(transcript_0.artifactEvidenceDigest,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Artifact evidence digest must be set');
    if (this._equal_116(transcript_0.statusMode, 0n)) {
      __compactRuntime.assert(this._equal_117(transcript_0.statusRegistryDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-status registry must be zero');
      __compactRuntime.assert(this._equal_118(transcript_0.statusRoot,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-status root must be zero');
      __compactRuntime.assert(this._equal_119(transcript_0.statusRegistryVersion,
                                              0n),
                              'No-status registry version must be zero');
      __compactRuntime.assert(this._equal_120(transcript_0.statusFreshnessPolicyDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-status freshness policy must be zero');
    } else {
      __compactRuntime.assert(!this._equal_121(transcript_0.statusRegistryDigest,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Enabled status registry must be set');
      let t_15;
      __compactRuntime.assert((t_15 = transcript_0.statusRegistryVersion,
                               t_15 > 0n),
                              'Enabled status registry version must be positive');
      __compactRuntime.assert(!this._equal_122(transcript_0.statusFreshnessPolicyDigest,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Enabled status freshness policy must be set');
    }
    if (this._equal_123(transcript_0.timeMode, 0n)) {
      __compactRuntime.assert(this._equal_124(transcript_0.trustedTime, 0n),
                              'No-time mode requires zero trusted time');
    } else {
      let t_16;
      __compactRuntime.assert((t_16 = transcript_0.trustedTime, t_16 > 0n),
                              'Enabled time mode requires trusted time');
    }
    if (this._equal_125(transcript_0.nullifierMode, 0n)) {
      __compactRuntime.assert(this._equal_126(transcript_0.replayPolicy, 0n),
                              'No-nullifier mode requires no replay policy');
      __compactRuntime.assert(this._equal_127(transcript_0.actionClassDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-nullifier action class must be zero');
      __compactRuntime.assert(this._equal_128(transcript_0.actionInvocationDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-nullifier action invocation must be zero');
      __compactRuntime.assert(this._equal_129(transcript_0.replayScopeDigest,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-nullifier replay scope must be zero');
      __compactRuntime.assert(this._equal_130(transcript_0.decisionNullifier,
                                              new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'No-nullifier decision nullifier must be zero');
    } else {
      __compactRuntime.assert(!this._equal_131(transcript_0.profile, 3n),
                              'Off-chain verification cannot require a nullifier');
      let t_17;
      __compactRuntime.assert((t_17 = transcript_0.replayPolicy, t_17 >= 1n),
                              'Required nullifier needs a replay policy');
      __compactRuntime.assert(!this._equal_132(transcript_0.actionClassDigest,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Required nullifier action class must be set');
      __compactRuntime.assert(!this._equal_133(transcript_0.actionInvocationDigest,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Required nullifier action invocation must be set');
      __compactRuntime.assert(!this._equal_134(transcript_0.replayScopeDigest,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Required nullifier replay scope must be set');
      __compactRuntime.assert(!this._equal_135(transcript_0.decisionNullifier,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'Required decision nullifier must be set');
    }
    return [];
  }
  _assertValidVerificationPublicInputsV1_0(inputs_0) {
    this._assertValidVerificationTranscriptV1_0(inputs_0.transcript);
    this._assertValidEvidenceBindingV1_0(inputs_0.issuerEvidence,
                                         this._issuerEvidenceDomainV1_0());
    this._assertValidEvidenceBindingV1_0(inputs_0.trustEvidence,
                                         this._trustEvidenceDomainV1_0());
    this._assertValidEvidenceBindingV1_0(inputs_0.statusEvidence,
                                         this._statusEvidenceDomainV1_0());
    this._assertValidEvidenceBindingV1_0(inputs_0.timeEvidence,
                                         this._timeEvidenceDomainV1_0());
    this._assertValidEvidenceBindingV1_0(inputs_0.artifactEvidence,
                                         this._artifactEvidenceDomainV1_0());
    this._assertValidEvidenceBindingV1_0(inputs_0.connectorEvidence,
                                         this._connectorEvidenceDomainV1_0());
    __compactRuntime.assert(this._equal_136(inputs_0.transcript.issuerEvidenceDigest,
                                            this._evidenceBindingV1Digest_0(inputs_0.issuerEvidence)),
                            'Issuer evidence digest mismatch');
    __compactRuntime.assert(this._equal_137(inputs_0.transcript.trustEvidenceDigest,
                                            this._evidenceBindingV1Digest_0(inputs_0.trustEvidence)),
                            'Trust evidence digest mismatch');
    __compactRuntime.assert(this._equal_138(inputs_0.transcript.statusEvidenceDigest,
                                            this._evidenceBindingV1Digest_0(inputs_0.statusEvidence)),
                            'Status evidence digest mismatch');
    __compactRuntime.assert(this._equal_139(inputs_0.transcript.timeEvidenceDigest,
                                            this._evidenceBindingV1Digest_0(inputs_0.timeEvidence)),
                            'Time evidence digest mismatch');
    __compactRuntime.assert(this._equal_140(inputs_0.transcript.artifactEvidenceDigest,
                                            this._evidenceBindingV1Digest_0(inputs_0.artifactEvidence)),
                            'Artifact evidence digest mismatch');
    __compactRuntime.assert(this._equal_141(inputs_0.transcript.connectorEvidenceDigest,
                                            this._evidenceBindingV1Digest_0(inputs_0.connectorEvidence)),
                            'Connector evidence digest mismatch');
    if (this._equal_142(inputs_0.transcript.statusMode, 0n)) {
      __compactRuntime.assert(this._equal_143(inputs_0.statusEvidence.mode, 0n),
                              'No-status mode requires not-required status evidence');
    } else {
      __compactRuntime.assert(!this._equal_144(inputs_0.statusEvidence.mode, 0n),
                              'Enabled status mode requires status evidence');
    }
    if (this._equal_145(inputs_0.transcript.timeMode, 0n)) {
      __compactRuntime.assert(this._equal_146(inputs_0.timeEvidence.mode, 0n),
                              'No-time mode requires not-required time evidence');
    } else {
      __compactRuntime.assert(!this._equal_147(inputs_0.timeEvidence.mode, 0n),
                              'Enabled time mode requires time evidence');
    }
    if (this._equal_148(inputs_0.transcript.originMode, 0n)
        ||
        this._equal_149(inputs_0.transcript.originMode, 2n))
    {
      __compactRuntime.assert(this._equal_150(inputs_0.connectorEvidence.mode,
                                              0n),
                              'Unattested origin requires not-required connector evidence');
    } else {
      __compactRuntime.assert(!this._equal_151(inputs_0.connectorEvidence.mode,
                                               0n),
                              'Wallet-attested origin requires connector evidence');
    }
    return [];
  }
  _syntheticUnavailableAuthorityVerificationV1_0(inputs_0,
                                                 expectedTranscriptDigest_0)
  {
    this._assertValidVerificationPublicInputsV1_0(inputs_0);
    const transcriptDigest_0 = this._verificationTranscriptV1Digest_0(inputs_0.transcript);
    __compactRuntime.assert(this._equal_152(transcriptDigest_0,
                                            expectedTranscriptDigest_0),
                            'Transcript proof binding mismatch');
    __compactRuntime.assert(this._equal_153(inputs_0.transcript.profile, 1n)
                            ||
                            this._equal_154(inputs_0.transcript.profile, 2n),
                            'Synthetic authority fixture requires a ledger target profile');
    __compactRuntime.assert(this._equal_155(inputs_0.issuerEvidence.mode, 1n)
                            ||
                            this._equal_156(inputs_0.trustEvidence.mode, 1n)
                            ||
                            this._equal_157(inputs_0.statusEvidence.mode, 1n)
                            ||
                            this._equal_158(inputs_0.timeEvidence.mode, 1n)
                            ||
                            this._equal_159(inputs_0.artifactEvidence.mode, 1n)
                            ||
                            this._equal_160(inputs_0.connectorEvidence.mode, 1n),
                            'Synthetic authority fixture requires unavailable evidence');
    return { proofStatus: 2n,
             decisionStatus: 0n,
             authority: 3n,
             executionStatus: 0n,
             transcriptDigest: transcriptDigest_0 };
  }
  _universityDiplomaClaimPayloadRoot_0(claims_0) {
    return this._persistentHash_13(claims_0);
  }
  _universityDiplomaClaimRoot_0(claims_0) {
    return this._persistentHash_15([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 118, 49, 0, 0, 0, 0, 0, 0]),
                                    this._universityDiplomaClaimPayloadRoot_0(claims_0)]);
  }
  _universityDiplomaProductionPublicClaimsRoot_0(publicClaims_0) {
    return this._persistentHash_15([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 112, 117, 98, 108, 105, 99, 0, 0]),
                                    this._persistentHash_14(publicClaims_0)]);
  }
  _universityDiplomaClaimCommitmentsRoot_0(claimCommitments_0) {
    return this._persistentHash_15([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 112, 114, 105, 118, 97, 116, 101, 0]),
                                    this._persistentHash_16(claimCommitments_0)]);
  }
  _universityDiplomaProductionClaimRoot_0(publicClaims_0, claimCommitments_0) {
    return this._persistentHash_17([new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 118, 50, 0, 0, 0, 0, 0, 0]),
                                    this._universityDiplomaProductionPublicClaimsRoot_0(publicClaims_0),
                                    this._universityDiplomaClaimCommitmentsRoot_0(claimCommitments_0)]);
  }
  _universityDiplomaIdCommitment_0(diplomaId_0, opening_0) {
    return this._persistentCommit_0(diplomaId_0, opening_0);
  }
  _universityDiplomaStudentIdCommitment_0(studentId_0, opening_0) {
    return this._persistentCommit_1(studentId_0, opening_0);
  }
  _universityDiplomaGraduateNameCommitment_0(graduateName_0, opening_0) {
    return this._persistentCommit_0(graduateName_0, opening_0);
  }
  _universityDiplomaFacultyNameCommitment_0(facultyName_0, opening_0) {
    return this._persistentCommit_0(facultyName_0, opening_0);
  }
  _universityDiplomaHonorsCodeCommitment_0(honorsCode_0, opening_0) {
    return this._persistentCommit_1(honorsCode_0, opening_0);
  }
  _universityDiplomaGraduationMonthCommitment_0(graduationMonth_0, opening_0) {
    return this._persistentCommit_2(graduationMonth_0, opening_0);
  }
  _universityDiplomaFinalGradeCommitment_0(finalGrade_0, opening_0) {
    return this._persistentCommit_2(finalGrade_0, opening_0);
  }
  _universityDiplomaCreditsEarnedCommitment_0(creditsEarned_0, opening_0) {
    return this._persistentCommit_3(creditsEarned_0, opening_0);
  }
  _universityDiplomaCredentialBodyRoot_0(credential_0) {
    return this._credentialBodyRoot_1(credential_0);
  }
  _universityDiplomaProductionCredentialBodyRoot_0(credential_0) {
    return this._credentialBodyRoot_0(credential_0);
  }
  _universityDiplomaProductionPresentationBodyRoot_0(presentation_0) {
    return this._presentationBodyRoot_0(presentation_0);
  }
  _universityDiplomaPresentationBodyRoot_0(presentation_0) {
    return this._presentationBodyRoot_1(presentation_0);
  }
  _universityDiplomaPresentationRequestBodyRoot_0(request_0) {
    return this._persistentHash_20(request_0);
  }
  _universityDiplomaProductionPresentationRequestBodyRoot_0(request_0) {
    return this._persistentHash_21(request_0);
  }
  _assertValidUniversityDiplomaSchemaRef_0(schema_0) {
    __compactRuntime.assert(this._equal_161(schema_0.packageId,
                                            new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma package id mismatch');
    __compactRuntime.assert(this._equal_162(schema_0.schemaId,
                                            new Uint8Array([117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma schema id mismatch');
    __compactRuntime.assert(this._equal_163(schema_0.majorVersion, 1n),
                            'University-diploma major version mismatch');
    return [];
  }
  _assertValidUniversityDiplomaProductionSchemaRef_0(schema_0) {
    __compactRuntime.assert(this._equal_164(schema_0.packageId,
                                            new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production package id mismatch');
    __compactRuntime.assert(this._equal_165(schema_0.schemaId,
                                            new Uint8Array([117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production schema id mismatch');
    __compactRuntime.assert(this._equal_166(schema_0.majorVersion, 2n),
                            'University-diploma production major version mismatch');
    return [];
  }
  _assertValidUniversityDiplomaPresentationRequest_0(request_0) {
    __compactRuntime.assert(this._equal_167(request_0.version, 1n),
                            'University-diploma request version mismatch');
    this._assertValidUniversityDiplomaSchemaRef_0(request_0.schema);
    this._assertValidVerificationMethodRef_0(request_0.issuerVerificationMethodRef);
    __compactRuntime.assert(!this._equal_168(request_0.verifierChallengeHash,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma verifier challenge must be set');
    let t_0;
    __compactRuntime.assert((t_0 = request_0.minimumFinalGrade, t_0 <= 100n),
                            'University-diploma minimum final grade must be at most 100');
    if (request_0.enforceMinimumFinalGrade) {
      __compactRuntime.assert(request_0.requireFinalGradeDisclosure,
                              'University-diploma minimum-grade request must require final grade disclosure');
    }
    return [];
  }
  _assertValidUniversityDiplomaProductionPresentationRequest_0(request_0) {
    __compactRuntime.assert(this._equal_169(request_0.version, 1n),
                            'University-diploma production request version mismatch');
    this._assertValidUniversityDiplomaProductionSchemaRef_0(request_0.schema);
    this._assertValidVerificationMethodRef_0(request_0.issuerVerificationMethodRef);
    __compactRuntime.assert(!this._equal_170(request_0.verifierChallengeHash,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production verifier challenge must be set');
    let t_0;
    __compactRuntime.assert((t_0 = request_0.minimumFinalGrade, t_0 <= 100n),
                            'University-diploma production minimum final grade must be at most 100');
    if (request_0.enforceMinimumFinalGrade) {
      __compactRuntime.assert(request_0.requireFinalGradeDisclosure,
                              'University-diploma production minimum-grade request must require final grade disclosure');
    }
    return [];
  }
  _assertValidUniversityDiplomaClaims_0(claims_0) {
    let t_0;
    __compactRuntime.assert((t_0 = claims_0.graduationMonth, t_0 >= 1n),
                            'University-diploma graduation month must be at least 1');
    let t_1;
    __compactRuntime.assert((t_1 = claims_0.graduationMonth, t_1 <= 12n),
                            'University-diploma graduation month must be at most 12');
    let t_2;
    __compactRuntime.assert((t_2 = claims_0.finalGrade, t_2 <= 100n),
                            'University-diploma final grade must be at most 100');
    let t_3;
    __compactRuntime.assert((t_3 = claims_0.creditsEarned, t_3 > 0n),
                            'University-diploma credits earned must be positive');
    return [];
  }
  _assertValidUniversityDiplomaProductionPublicClaims_0(publicClaims_0) {
    __compactRuntime.assert(!this._equal_171(publicClaims_0.universityName,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production university name must be set');
    __compactRuntime.assert(!this._equal_172(publicClaims_0.awardName,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production award name must be set');
    let t_0;
    __compactRuntime.assert((t_0 = publicClaims_0.graduationYear, t_0 > 0n),
                            'University-diploma production graduation year must be set');
    return [];
  }
  _assertValidUniversityDiplomaCredential_0(credential_0, proof_0) {
    this._assertValidUniversityDiplomaSchemaRef_0(credential_0.schema);
    this._assertValidUniversityDiplomaClaims_0(credential_0.claims);
    this._assertValidCredentialEnvelope_0(credential_0,
                                          this._universityDiplomaClaimRoot_0(credential_0.claims));
    this._assertValidExplicitHolderBinding_0(credential_0.holderBinding);
    this._assertValidNoStatusBinding_0(credential_0.statusBinding);
    this._assertValidCredentialProof_0(credential_0, proof_0);
    return [];
  }
  _assertValidUniversityDiplomaProductionCredential_0(credential_0, proof_0) {
    this._assertValidUniversityDiplomaProductionSchemaRef_0(credential_0.schema);
    this._assertValidUniversityDiplomaProductionPublicClaims_0(credential_0.claims);
    this._assertValidCredentialEnvelope_1(credential_0,
                                          this._universityDiplomaProductionClaimRoot_0(credential_0.claims,
                                                                                       credential_0.claimCommitments));
    this._assertValidExplicitHolderBinding_0(credential_0.holderBinding);
    this._assertValidNoStatusBinding_0(credential_0.statusBinding);
    this._assertValidCredentialProof_1(credential_0, proof_0);
    return [];
  }
  _assertUniversityDiplomaProductionDisclosuresMatchCredential_0(credential_0,
                                                                 disclosed_0)
  {
    if (disclosed_0.revealDiplomaId) {
      __compactRuntime.assert(!this._equal_173(disclosed_0.diplomaIdOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production diploma id opening must be set');
      __compactRuntime.assert(this._equal_174(this._universityDiplomaIdCommitment_0(disclosed_0.diplomaId,
                                                                                    disclosed_0.diplomaIdOpening),
                                              credential_0.claimCommitments.diplomaIdCommitment),
                              'University-diploma production diploma id disclosure commitment mismatch');
    }
    if (disclosed_0.revealStudentId) {
      __compactRuntime.assert(!this._equal_175(disclosed_0.studentIdOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production student id opening must be set');
      __compactRuntime.assert(this._equal_176(this._universityDiplomaStudentIdCommitment_0(disclosed_0.studentId,
                                                                                           disclosed_0.studentIdOpening),
                                              credential_0.claimCommitments.studentIdCommitment),
                              'University-diploma production student id disclosure commitment mismatch');
    }
    if (disclosed_0.revealGraduateName) {
      __compactRuntime.assert(!this._equal_177(disclosed_0.graduateNameOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production graduate name opening must be set');
      __compactRuntime.assert(this._equal_178(this._universityDiplomaGraduateNameCommitment_0(disclosed_0.graduateName,
                                                                                              disclosed_0.graduateNameOpening),
                                              credential_0.claimCommitments.graduateNameCommitment),
                              'University-diploma production graduate name disclosure commitment mismatch');
    }
    if (disclosed_0.revealUniversityName) {
      __compactRuntime.assert(this._equal_179(disclosed_0.universityName,
                                              credential_0.claims.universityName),
                              'University-diploma production university name disclosure does not match the credential');
    }
    if (disclosed_0.revealFacultyName) {
      __compactRuntime.assert(!this._equal_180(disclosed_0.facultyNameOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production faculty name opening must be set');
      __compactRuntime.assert(this._equal_181(this._universityDiplomaFacultyNameCommitment_0(disclosed_0.facultyName,
                                                                                             disclosed_0.facultyNameOpening),
                                              credential_0.claimCommitments.facultyNameCommitment),
                              'University-diploma production faculty name disclosure commitment mismatch');
    }
    if (disclosed_0.revealAwardName) {
      __compactRuntime.assert(this._equal_182(disclosed_0.awardName,
                                              credential_0.claims.awardName),
                              'University-diploma production award name disclosure does not match the credential');
    }
    if (disclosed_0.revealHonorsCode) {
      __compactRuntime.assert(!this._equal_183(disclosed_0.honorsCodeOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production honors code opening must be set');
      __compactRuntime.assert(this._equal_184(this._universityDiplomaHonorsCodeCommitment_0(disclosed_0.honorsCode,
                                                                                            disclosed_0.honorsCodeOpening),
                                              credential_0.claimCommitments.honorsCodeCommitment),
                              'University-diploma production honors code disclosure commitment mismatch');
    }
    if (disclosed_0.revealGraduationYear) {
      __compactRuntime.assert(this._equal_185(disclosed_0.graduationYear,
                                              credential_0.claims.graduationYear),
                              'University-diploma production graduation year disclosure does not match the credential');
    }
    if (disclosed_0.revealGraduationMonth) {
      __compactRuntime.assert(!this._equal_186(disclosed_0.graduationMonthOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production graduation month opening must be set');
      __compactRuntime.assert(this._equal_187(this._universityDiplomaGraduationMonthCommitment_0(disclosed_0.graduationMonth,
                                                                                                 disclosed_0.graduationMonthOpening),
                                              credential_0.claimCommitments.graduationMonthCommitment),
                              'University-diploma production graduation month disclosure commitment mismatch');
    }
    if (disclosed_0.revealFinalGrade) {
      __compactRuntime.assert(!this._equal_188(disclosed_0.finalGradeOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production final grade opening must be set');
      __compactRuntime.assert(this._equal_189(this._universityDiplomaFinalGradeCommitment_0(disclosed_0.finalGrade,
                                                                                            disclosed_0.finalGradeOpening),
                                              credential_0.claimCommitments.finalGradeCommitment),
                              'University-diploma production final grade disclosure commitment mismatch');
    }
    if (disclosed_0.revealCreditsEarned) {
      __compactRuntime.assert(!this._equal_190(disclosed_0.creditsEarnedOpening,
                                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                              'University-diploma production credits earned opening must be set');
      __compactRuntime.assert(this._equal_191(this._universityDiplomaCreditsEarnedCommitment_0(disclosed_0.creditsEarned,
                                                                                               disclosed_0.creditsEarnedOpening),
                                              credential_0.claimCommitments.creditsEarnedCommitment),
                              'University-diploma production credits earned disclosure commitment mismatch');
    }
    return [];
  }
  _assertUniversityDiplomaProductionFinalGradeAtLeast_0(credential_0,
                                                        predicateWitness_0,
                                                        minimumFinalGrade_0)
  {
    __compactRuntime.assert(minimumFinalGrade_0 <= 100n,
                            'University-diploma production minimum final grade must be at most 100');
    let t_0;
    __compactRuntime.assert((t_0 = predicateWitness_0.finalGrade, t_0 <= 100n),
                            'University-diploma production final grade witness must be at most 100');
    __compactRuntime.assert(!this._equal_192(predicateWitness_0.finalGradeOpening,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production final grade predicate opening must be set');
    __compactRuntime.assert(this._equal_193(this._universityDiplomaFinalGradeCommitment_0(predicateWitness_0.finalGrade,
                                                                                          predicateWitness_0.finalGradeOpening),
                                            credential_0.claimCommitments.finalGradeCommitment),
                            'University-diploma production final grade predicate commitment mismatch');
    let t_1;
    __compactRuntime.assert((t_1 = predicateWitness_0.finalGrade,
                             t_1 >= minimumFinalGrade_0),
                            'University-diploma production final grade predicate is below the verifier minimum');
    return [];
  }
  _assertUniversityDiplomaProductionCreditsEarnedAtLeast_0(credential_0,
                                                           predicateWitness_0,
                                                           minimumCreditsEarned_0)
  {
    __compactRuntime.assert(minimumCreditsEarned_0 > 0n,
                            'University-diploma production minimum credits earned must be positive');
    let t_0;
    __compactRuntime.assert((t_0 = predicateWitness_0.creditsEarned, t_0 > 0n),
                            'University-diploma production credits earned witness must be positive');
    __compactRuntime.assert(!this._equal_194(predicateWitness_0.creditsEarnedOpening,
                                             new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'University-diploma production credits earned predicate opening must be set');
    __compactRuntime.assert(this._equal_195(this._universityDiplomaCreditsEarnedCommitment_0(predicateWitness_0.creditsEarned,
                                                                                             predicateWitness_0.creditsEarnedOpening),
                                            credential_0.claimCommitments.creditsEarnedCommitment),
                            'University-diploma production credits earned predicate commitment mismatch');
    let t_1;
    __compactRuntime.assert((t_1 = predicateWitness_0.creditsEarned,
                             t_1 >= minimumCreditsEarned_0),
                            'University-diploma production credits earned predicate is below the verifier minimum');
    return [];
  }
  _assertValidUniversityDiplomaProductionPresentation_0(credential_0,
                                                        credentialProof_0,
                                                        presentation_0,
                                                        presentationProof_0)
  {
    this._assertValidUniversityDiplomaProductionCredential_0(credential_0,
                                                             credentialProof_0);
    this._assertValidUniversityDiplomaProductionSchemaRef_0(presentation_0.schema);
    this._assertValidPresentationEnvelope_0(presentation_0);
    this._assertMatchingCredentialPresentation_0(credential_0, presentation_0);
    this._assertValidExplicitHolderBinding_0(presentation_0.holderBinding);
    this._assertMatchingExplicitHolderBindings_0(credential_0.holderBinding,
                                                 presentation_0.holderBinding);
    this._assertProofMatchesExplicitHolderBinding_0(presentation_0.holderBinding,
                                                    presentationProof_0);
    this._assertValidPresentationContextProof_0(this._universityDiplomaProductionPresentationBodyRoot_0(presentation_0),
                                                presentationProof_0);
    this._assertUniversityDiplomaProductionDisclosuresMatchCredential_0(credential_0,
                                                                        presentation_0.disclosed);
    return [];
  }
  _assertValidUniversityDiplomaPresentation_0(credential_0,
                                              credentialProof_0,
                                              presentation_0,
                                              presentationProof_0)
  {
    this._assertValidUniversityDiplomaCredential_0(credential_0,
                                                   credentialProof_0);
    this._assertValidUniversityDiplomaSchemaRef_0(presentation_0.schema);
    this._assertValidPresentationEnvelope_1(presentation_0);
    this._assertMatchingCredentialPresentation_1(credential_0, presentation_0);
    this._assertValidExplicitHolderBinding_0(presentation_0.holderBinding);
    this._assertMatchingExplicitHolderBindings_0(credential_0.holderBinding,
                                                 presentation_0.holderBinding);
    this._assertProofMatchesExplicitHolderBinding_0(presentation_0.holderBinding,
                                                    presentationProof_0);
    this._assertValidPresentationContextProof_0(this._universityDiplomaPresentationBodyRoot_0(presentation_0),
                                                presentationProof_0);
    if (presentation_0.disclosed.revealDiplomaId) {
      __compactRuntime.assert(this._equal_196(presentation_0.disclosed.diplomaId,
                                              credential_0.claims.diplomaId),
                              'University-diploma diploma id disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealStudentId) {
      __compactRuntime.assert(this._equal_197(presentation_0.disclosed.studentId,
                                              credential_0.claims.studentId),
                              'University-diploma student id disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealGraduateName) {
      __compactRuntime.assert(this._equal_198(presentation_0.disclosed.graduateName,
                                              credential_0.claims.graduateName),
                              'University-diploma graduate name disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealUniversityName) {
      __compactRuntime.assert(this._equal_199(presentation_0.disclosed.universityName,
                                              credential_0.claims.universityName),
                              'University-diploma university name disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealFacultyName) {
      __compactRuntime.assert(this._equal_200(presentation_0.disclosed.facultyName,
                                              credential_0.claims.facultyName),
                              'University-diploma faculty name disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealAwardName) {
      __compactRuntime.assert(this._equal_201(presentation_0.disclosed.awardName,
                                              credential_0.claims.awardName),
                              'University-diploma award name disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealHonorsCode) {
      __compactRuntime.assert(this._equal_202(presentation_0.disclosed.honorsCode,
                                              credential_0.claims.honorsCode),
                              'University-diploma honors code disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealGraduationYear) {
      __compactRuntime.assert(this._equal_203(presentation_0.disclosed.graduationYear,
                                              credential_0.claims.graduationYear),
                              'University-diploma graduation year disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealGraduationMonth) {
      __compactRuntime.assert(this._equal_204(presentation_0.disclosed.graduationMonth,
                                              credential_0.claims.graduationMonth),
                              'University-diploma graduation month disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealFinalGrade) {
      __compactRuntime.assert(this._equal_205(presentation_0.disclosed.finalGrade,
                                              credential_0.claims.finalGrade),
                              'University-diploma final grade disclosure does not match the credential');
    }
    if (presentation_0.disclosed.revealCreditsEarned) {
      __compactRuntime.assert(this._equal_206(presentation_0.disclosed.creditsEarned,
                                              credential_0.claims.creditsEarned),
                              'University-diploma credits disclosure does not match the credential');
    }
    return [];
  }
  _assertUniversityDiplomaPresentationSatisfiesRequest_0(credential_0,
                                                         credentialProof_0,
                                                         request_0,
                                                         presentation_0,
                                                         presentationProof_0)
  {
    this._assertValidUniversityDiplomaPresentationRequest_0(request_0);
    this._assertValidUniversityDiplomaPresentation_0(credential_0,
                                                     credentialProof_0,
                                                     presentation_0,
                                                     presentationProof_0);
    this._assertMatchingSchemaRefs_0(request_0.schema, credential_0.schema);
    this._assertMatchingSchemaRefs_0(request_0.schema, presentation_0.schema);
    __compactRuntime.assert(this._equal_207(request_0.issuerVerificationMethodRef.didContractAddress,
                                            credential_0.issuerVerificationMethodRef.didContractAddress),
                            'University-diploma request issuer contract does not match the credential issuer');
    __compactRuntime.assert(this._equal_208(request_0.issuerVerificationMethodRef.methodId,
                                            credential_0.issuerVerificationMethodRef.methodId),
                            'University-diploma request issuer method does not match the credential issuer');
    __compactRuntime.assert(this._equal_209(presentationProof_0.challengeHash,
                                            request_0.verifierChallengeHash),
                            'University-diploma presentation proof challenge does not match the request');
    if (request_0.requireDiplomaIdDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealDiplomaId,
                              'University-diploma request requires diploma id disclosure');
    }
    if (request_0.requireStudentIdDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealStudentId,
                              'University-diploma request requires student id disclosure');
    }
    if (request_0.requireGraduateNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealGraduateName,
                              'University-diploma request requires graduate name disclosure');
    }
    if (request_0.requireUniversityNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealUniversityName,
                              'University-diploma request requires university name disclosure');
    }
    if (request_0.requireFacultyNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealFacultyName,
                              'University-diploma request requires faculty name disclosure');
    }
    if (request_0.requireAwardNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealAwardName,
                              'University-diploma request requires award name disclosure');
    }
    if (request_0.requireHonorsCodeDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealHonorsCode,
                              'University-diploma request requires honors code disclosure');
    }
    if (request_0.requireGraduationYearDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealGraduationYear,
                              'University-diploma request requires graduation year disclosure');
    }
    if (request_0.requireGraduationMonthDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealGraduationMonth,
                              'University-diploma request requires graduation month disclosure');
    }
    if (request_0.requireFinalGradeDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealFinalGrade,
                              'University-diploma request requires final grade disclosure');
    }
    if (request_0.requireCreditsEarnedDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealCreditsEarned,
                              'University-diploma request requires credits disclosure');
    }
    if (request_0.enforceMinimumFinalGrade) {
      __compactRuntime.assert(presentation_0.disclosed.revealFinalGrade,
                              'University-diploma minimum-grade request requires final grade disclosure');
      let t_0;
      __compactRuntime.assert((t_0 = presentation_0.disclosed.finalGrade,
                               t_0 >= request_0.minimumFinalGrade),
                              'University-diploma disclosed final grade is below the verifier minimum');
    }
    return [];
  }
  _assertUniversityDiplomaProductionPresentationSatisfiesRequest_0(credential_0,
                                                                   credentialProof_0,
                                                                   request_0,
                                                                   presentation_0,
                                                                   presentationProof_0)
  {
    this._assertValidUniversityDiplomaProductionPresentationRequest_0(request_0);
    this._assertValidUniversityDiplomaProductionPresentation_0(credential_0,
                                                               credentialProof_0,
                                                               presentation_0,
                                                               presentationProof_0);
    this._assertMatchingSchemaRefs_0(request_0.schema, credential_0.schema);
    this._assertMatchingSchemaRefs_0(request_0.schema, presentation_0.schema);
    __compactRuntime.assert(this._equal_210(request_0.issuerVerificationMethodRef.didContractAddress,
                                            credential_0.issuerVerificationMethodRef.didContractAddress),
                            'University-diploma production request issuer contract does not match the credential issuer');
    __compactRuntime.assert(this._equal_211(request_0.issuerVerificationMethodRef.methodId,
                                            credential_0.issuerVerificationMethodRef.methodId),
                            'University-diploma production request issuer method does not match the credential issuer');
    __compactRuntime.assert(this._equal_212(presentationProof_0.challengeHash,
                                            request_0.verifierChallengeHash),
                            'University-diploma production presentation proof challenge does not match the request');
    if (request_0.requireDiplomaIdDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealDiplomaId,
                              'University-diploma production request requires diploma id disclosure');
    }
    if (request_0.requireStudentIdDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealStudentId,
                              'University-diploma production request requires student id disclosure');
    }
    if (request_0.requireGraduateNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealGraduateName,
                              'University-diploma production request requires graduate name disclosure');
    }
    if (request_0.requireUniversityNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealUniversityName,
                              'University-diploma production request requires university name disclosure');
    }
    if (request_0.requireFacultyNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealFacultyName,
                              'University-diploma production request requires faculty name disclosure');
    }
    if (request_0.requireAwardNameDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealAwardName,
                              'University-diploma production request requires award name disclosure');
    }
    if (request_0.requireHonorsCodeDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealHonorsCode,
                              'University-diploma production request requires honors code disclosure');
    }
    if (request_0.requireGraduationYearDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealGraduationYear,
                              'University-diploma production request requires graduation year disclosure');
    }
    if (request_0.requireGraduationMonthDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealGraduationMonth,
                              'University-diploma production request requires graduation month disclosure');
    }
    if (request_0.requireFinalGradeDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealFinalGrade,
                              'University-diploma production request requires final grade disclosure');
    }
    if (request_0.requireCreditsEarnedDisclosure) {
      __compactRuntime.assert(presentation_0.disclosed.revealCreditsEarned,
                              'University-diploma production request requires credits disclosure');
    }
    if (request_0.enforceMinimumFinalGrade) {
      __compactRuntime.assert(presentation_0.disclosed.revealFinalGrade,
                              'University-diploma production minimum-grade request requires final grade disclosure');
      let t_0;
      __compactRuntime.assert((t_0 = presentation_0.disclosed.finalGrade,
                               t_0 >= request_0.minimumFinalGrade),
                              'University-diploma production disclosed final grade is below the verifier minimum');
    }
    return [];
  }
  _universityDiplomaSchemaRef_0() {
    return { packageId:
               new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 118, 99, 58, 117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
             schemaId:
               new Uint8Array([117, 110, 105, 45, 100, 105, 112, 108, 111, 109, 97, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
             majorVersion: 1n,
             minorVersion: 0n };
  }
  _universityJobApplicationRequest_0(issuerVerificationMethodRef_0,
                                     verifierChallengeHash_0,
                                     requireDiplomaIdDisclosure_0,
                                     requireStudentIdDisclosure_0,
                                     requireFacultyNameDisclosure_0,
                                     requireHonorsCodeDisclosure_0,
                                     requireGraduationMonthDisclosure_0,
                                     requireFinalGradeDisclosure_0,
                                     requireCreditsEarnedDisclosure_0)
  {
    return { version: 1n,
             schema: this._universityDiplomaSchemaRef_0(),
             issuerVerificationMethodRef: issuerVerificationMethodRef_0,
             requireDiplomaIdDisclosure: requireDiplomaIdDisclosure_0,
             requireStudentIdDisclosure: requireStudentIdDisclosure_0,
             requireGraduateNameDisclosure: true,
             requireUniversityNameDisclosure: true,
             requireFacultyNameDisclosure: requireFacultyNameDisclosure_0,
             requireAwardNameDisclosure: true,
             requireHonorsCodeDisclosure: requireHonorsCodeDisclosure_0,
             requireGraduationYearDisclosure: true,
             requireGraduationMonthDisclosure:
               requireGraduationMonthDisclosure_0,
             requireFinalGradeDisclosure: requireFinalGradeDisclosure_0,
             requireCreditsEarnedDisclosure: requireCreditsEarnedDisclosure_0,
             enforceMinimumFinalGrade: false,
             minimumFinalGrade: 0n,
             verifierChallengeHash: verifierChallengeHash_0 };
  }
  _universityMallDiscountRequest_0(issuerVerificationMethodRef_0,
                                   verifierChallengeHash_0,
                                   minimumFinalGrade_0)
  {
    __compactRuntime.assert(minimumFinalGrade_0 <= 100n,
                            'University discount threshold must be <= 100');
    return { version: 1n,
             schema: this._universityDiplomaSchemaRef_0(),
             issuerVerificationMethodRef: issuerVerificationMethodRef_0,
             requireDiplomaIdDisclosure: false,
             requireStudentIdDisclosure: false,
             requireGraduateNameDisclosure: false,
             requireUniversityNameDisclosure: true,
             requireFacultyNameDisclosure: false,
             requireAwardNameDisclosure: false,
             requireHonorsCodeDisclosure: false,
             requireGraduationYearDisclosure: false,
             requireGraduationMonthDisclosure: false,
             requireFinalGradeDisclosure: true,
             requireCreditsEarnedDisclosure: false,
             enforceMinimumFinalGrade: true,
             minimumFinalGrade: minimumFinalGrade_0,
             verifierChallengeHash: verifierChallengeHash_0 };
  }
  _verifyUniversityDiplomaForJobApplication_0(context,
                                              partialProofData,
                                              credential_0,
                                              credentialProof_0,
                                              request_0,
                                              presentation_0,
                                              presentationProof_0)
  {
    const credentialRoot_0 = this._universityDiplomaCredentialBodyRoot_0(credential_0);
    __compactRuntime.assert(request_0.requireGraduateNameDisclosure,
                            'University job application requires graduate-name disclosure');
    __compactRuntime.assert(request_0.requireUniversityNameDisclosure,
                            'University job application requires university-name disclosure');
    __compactRuntime.assert(request_0.requireAwardNameDisclosure,
                            'University job application requires award-name disclosure');
    __compactRuntime.assert(request_0.requireGraduationYearDisclosure,
                            'University job application requires graduation-year disclosure');
    __compactRuntime.assert(!request_0.enforceMinimumFinalGrade,
                            'University job application request must not enforce a minimum grade');
    this._assertUniversityDiplomaPresentationSatisfiesRequest_0(credential_0,
                                                                credentialProof_0,
                                                                request_0,
                                                                presentation_0,
                                                                presentationProof_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(3n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(credentialRoot_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = request_0.verifierChallengeHash;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(4n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = presentation_0.disclosed.graduateName;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(5n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_2 = presentation_0.disclosed.universityName;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(6n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_3 = presentation_0.disclosed.awardName;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(7n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_3),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_4 = presentation_0.disclosed.graduationYear;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(8n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_4),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const requireFinalGradeDisclosure_0 = request_0.requireFinalGradeDisclosure;
    if (requireFinalGradeDisclosure_0) {
      const tmp_5 = presentation_0.disclosed.finalGrade;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(9n),
                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_5),
                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    } else {
      const tmp_6 = 0n;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(9n),
                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_6),
                                                                                                alignment: _descriptor_2.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    }
    const tmp_7 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(10n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_7),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_8 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(11n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_8),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_9 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(1n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_9),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _verifyUniversityDiplomaForMallDiscount_0(context,
                                            partialProofData,
                                            credential_0,
                                            credentialProof_0,
                                            request_0,
                                            presentation_0,
                                            presentationProof_0)
  {
    const credentialRoot_0 = this._universityDiplomaCredentialBodyRoot_0(credential_0);
    __compactRuntime.assert(request_0.requireUniversityNameDisclosure,
                            'University mall discount requires university-name disclosure');
    __compactRuntime.assert(request_0.requireFinalGradeDisclosure,
                            'University mall discount requires final-grade disclosure');
    __compactRuntime.assert(request_0.enforceMinimumFinalGrade,
                            'University mall discount request must enforce a minimum grade');
    this._assertUniversityDiplomaPresentationSatisfiesRequest_0(credential_0,
                                                                credentialProof_0,
                                                                request_0,
                                                                presentation_0,
                                                                presentationProof_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(3n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(credentialRoot_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = request_0.verifierChallengeHash;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(4n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(5n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = presentation_0.disclosed.universityName;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(6n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(7n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_2 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(8n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_2),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_3 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(9n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_3),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_4 = request_0.minimumFinalGrade;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(10n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_4),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_5 = 2n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(11n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_5),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_6 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(2n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_6),
                                                                alignment: _descriptor_1.alignment() }
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
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
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
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_16(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_17(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_18(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_19(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
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
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_24(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_25(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
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
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_39(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_40(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
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
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_47(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_48(x0, y0) {
    if (x0 !== y0) { return false; }
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
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
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
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_61(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_62(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_63(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_64(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_65(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_66(x0, y0) {
    if (x0 !== y0) { return false; }
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
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_72(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_73(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_74(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_75(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_76(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_77(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_78(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_79(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_80(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_81(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_82(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_83(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_84(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_85(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_86(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_87(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_88(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_89(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_90(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_91(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_92(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_93(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_94(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_95(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_96(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_97(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_98(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_99(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_100(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_101(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_102(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_103(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_104(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_105(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_106(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_107(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_108(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_109(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_110(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_111(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_112(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_113(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_114(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_115(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_116(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_117(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_118(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_119(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_120(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_121(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_122(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_123(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_124(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_125(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_126(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_127(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_128(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_129(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_130(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_131(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_132(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_133(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_134(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_135(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_136(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_137(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_138(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_139(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_140(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_141(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_142(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_143(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_144(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_145(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_146(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_147(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_148(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_149(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_150(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_151(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_152(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_153(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_154(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_155(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_156(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_157(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_158(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_159(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_160(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_161(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_162(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_163(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_164(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_165(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_166(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_167(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_168(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_169(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_170(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_171(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_172(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_173(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_174(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_175(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_176(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_177(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_178(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_179(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_180(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_181(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_182(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_183(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_184(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_185(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_186(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_187(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_188(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_189(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_190(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_191(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_192(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_193(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_194(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_195(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_196(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_197(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_198(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_199(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_200(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_201(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_202(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_203(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_204(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_205(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_206(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_207(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_208(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_209(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_210(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_211(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_212(x0, y0) {
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
      return _descriptor_58.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_2.toValue(0n),
                                                                                                    alignment: _descriptor_2.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get successfulJobApplicationVerificationCount() {
      return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(1n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get successfulDiscountVerificationCount() {
      return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(2n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedCredentialRoot() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(3n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedRequestChallenge() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(4n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedGraduateName() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(5n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedUniversityName() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(6n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedAwardName() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(7n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedGraduationYear() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(8n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedFinalGrade() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(9n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedDiscountThreshold() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(10n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedVerifierKind() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(11n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
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
  statusAttestationContextTag: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`statusAttestationContextTag: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._statusAttestationContextTag_0();
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
                                 'proofs.compact line 80 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('issuanceProofPayloadRoot',
                                 'argument 2',
                                 'proofs.compact line 80 char 1',
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
                                 'proofs.compact line 87 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('presentationProofPayloadRoot',
                                 'argument 2',
                                 'proofs.compact line 87 char 1',
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
                                 'proofs.compact line 94 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('issuanceProofChallenge',
                                 'argument 2',
                                 'proofs.compact line 94 char 1',
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
                                 'proofs.compact line 101 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('presentationProofChallenge',
                                 'argument 2',
                                 'proofs.compact line 101 char 1',
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
                                 'proofs.compact line 114 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidIssuanceContextProof',
                                 'argument 2',
                                 'proofs.compact line 114 char 1',
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
                                 'proofs.compact line 121 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidPresentationContextProof',
                                 'argument 2',
                                 'proofs.compact line 121 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidPresentationContextProof_0(bodyRoot_0,
                                                                 proof_0);
  },
  statusAttestationProofPayloadRoot: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`statusAttestationProofPayloadRoot: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('statusAttestationProofPayloadRoot',
                                 'argument 1',
                                 'proofs.compact line 128 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('statusAttestationProofPayloadRoot',
                                 'argument 2',
                                 'proofs.compact line 128 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._statusAttestationProofPayloadRoot_0(bodyRoot_0,
                                                               proof_0);
  },
  statusAttestationProofChallenge: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`statusAttestationProofChallenge: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('statusAttestationProofChallenge',
                                 'argument 1',
                                 'proofs.compact line 135 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('statusAttestationProofChallenge',
                                 'argument 2',
                                 'proofs.compact line 135 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._statusAttestationProofChallenge_0(bodyRoot_0, proof_0);
  },
  assertValidStatusAttestationContextProof: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidStatusAttestationContextProof: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const bodyRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(bodyRoot_0.buffer instanceof ArrayBuffer && bodyRoot_0.BYTES_PER_ELEMENT === 1 && bodyRoot_0.length === 32)) {
      __compactRuntime.typeError('assertValidStatusAttestationContextProof',
                                 'argument 1',
                                 'proofs.compact line 142 char 1',
                                 'Bytes<32>',
                                 bodyRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidStatusAttestationContextProof',
                                 'argument 2',
                                 'proofs.compact line 142 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidStatusAttestationContextProof_0(bodyRoot_0,
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
  verificationTranscriptDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`verificationTranscriptDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._verificationTranscriptDomainV1_0();
  },
  decisionNullifierDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`decisionNullifierDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._decisionNullifierDomainV1_0();
  },
  credentialBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`credentialBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._credentialBindingDomainV1_0();
  },
  holderBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`holderBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._holderBindingDomainV1_0();
  },
  consentBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`consentBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._consentBindingDomainV1_0();
  },
  presentationBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`presentationBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._presentationBindingDomainV1_0();
  },
  issuerEvidenceDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`issuerEvidenceDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._issuerEvidenceDomainV1_0();
  },
  trustEvidenceDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`trustEvidenceDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._trustEvidenceDomainV1_0();
  },
  statusEvidenceDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`statusEvidenceDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._statusEvidenceDomainV1_0();
  },
  timeEvidenceDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`timeEvidenceDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._timeEvidenceDomainV1_0();
  },
  artifactEvidenceDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`artifactEvidenceDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._artifactEvidenceDomainV1_0();
  },
  connectorEvidenceDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`connectorEvidenceDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._connectorEvidenceDomainV1_0();
  },
  anchorEvidenceReceiptDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`anchorEvidenceReceiptDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._anchorEvidenceReceiptDomainV1_0();
  },
  syntheticVerificationExtensionDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`syntheticVerificationExtensionDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._syntheticVerificationExtensionDomainV1_0();
  },
  credentialBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`credentialBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && typeof(binding_0.mode) === 'bigint' && binding_0.mode >= 0n && binding_0.mode <= 255n && binding_0.credentialFamilyDigest.buffer instanceof ArrayBuffer && binding_0.credentialFamilyDigest.BYTES_PER_ELEMENT === 1 && binding_0.credentialFamilyDigest.length === 32 && binding_0.schemaDigest.buffer instanceof ArrayBuffer && binding_0.schemaDigest.BYTES_PER_ELEMENT === 1 && binding_0.schemaDigest.length === 32 && binding_0.verifierContractDigest.buffer instanceof ArrayBuffer && binding_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && binding_0.verifierContractDigest.length === 32 && binding_0.challengeDigest.buffer instanceof ArrayBuffer && binding_0.challengeDigest.BYTES_PER_ELEMENT === 1 && binding_0.challengeDigest.length === 32 && binding_0.credentialRoot.buffer instanceof ArrayBuffer && binding_0.credentialRoot.BYTES_PER_ELEMENT === 1 && binding_0.credentialRoot.length === 32)) {
      __compactRuntime.typeError('credentialBindingV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 227 char 1',
                                 'struct CredentialBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>, verifierContractDigest: Bytes<32>, challengeDigest: Bytes<32>, credentialRoot: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._credentialBindingV1Digest_0(binding_0);
  },
  holderBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`holderBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && typeof(binding_0.mode) === 'bigint' && binding_0.mode >= 0n && binding_0.mode <= 255n && binding_0.verifierContractDigest.buffer instanceof ArrayBuffer && binding_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && binding_0.verifierContractDigest.length === 32 && binding_0.challengeDigest.buffer instanceof ArrayBuffer && binding_0.challengeDigest.BYTES_PER_ELEMENT === 1 && binding_0.challengeDigest.length === 32 && binding_0.subjectBindingDigest.buffer instanceof ArrayBuffer && binding_0.subjectBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.subjectBindingDigest.length === 32)) {
      __compactRuntime.typeError('holderBindingV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 233 char 1',
                                 'struct HolderBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, verifierContractDigest: Bytes<32>, challengeDigest: Bytes<32>, subjectBindingDigest: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._holderBindingV1Digest_0(binding_0);
  },
  consentBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`consentBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && typeof(binding_0.profile) === 'bigint' && binding_0.profile >= 0n && binding_0.profile <= 255n && binding_0.networkIdDigest.buffer instanceof ArrayBuffer && binding_0.networkIdDigest.BYTES_PER_ELEMENT === 1 && binding_0.networkIdDigest.length === 32 && binding_0.verifierContractDigest.buffer instanceof ArrayBuffer && binding_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && binding_0.verifierContractDigest.length === 32 && binding_0.deploymentDigest.buffer instanceof ArrayBuffer && binding_0.deploymentDigest.BYTES_PER_ELEMENT === 1 && binding_0.deploymentDigest.length === 32 && binding_0.audienceDigest.buffer instanceof ArrayBuffer && binding_0.audienceDigest.BYTES_PER_ELEMENT === 1 && binding_0.audienceDigest.length === 32 && typeof(binding_0.originMode) === 'bigint' && binding_0.originMode >= 0n && binding_0.originMode <= 255n && binding_0.originDigest.buffer instanceof ArrayBuffer && binding_0.originDigest.BYTES_PER_ELEMENT === 1 && binding_0.originDigest.length === 32 && binding_0.requestIdDigest.buffer instanceof ArrayBuffer && binding_0.requestIdDigest.BYTES_PER_ELEMENT === 1 && binding_0.requestIdDigest.length === 32 && binding_0.challengeDigest.buffer instanceof ArrayBuffer && binding_0.challengeDigest.BYTES_PER_ELEMENT === 1 && binding_0.challengeDigest.length === 32 && typeof(binding_0.expiresAt) === 'bigint' && binding_0.expiresAt >= 0n && binding_0.expiresAt <= 18446744073709551615n && binding_0.credentialFamilyDigest.buffer instanceof ArrayBuffer && binding_0.credentialFamilyDigest.BYTES_PER_ELEMENT === 1 && binding_0.credentialFamilyDigest.length === 32 && binding_0.schemaDigest.buffer instanceof ArrayBuffer && binding_0.schemaDigest.BYTES_PER_ELEMENT === 1 && binding_0.schemaDigest.length === 32 && binding_0.disclosureDigest.buffer instanceof ArrayBuffer && binding_0.disclosureDigest.BYTES_PER_ELEMENT === 1 && binding_0.disclosureDigest.length === 32 && binding_0.predicateDigest.buffer instanceof ArrayBuffer && binding_0.predicateDigest.BYTES_PER_ELEMENT === 1 && binding_0.predicateDigest.length === 32 && typeof(binding_0.statusMode) === 'bigint' && binding_0.statusMode >= 0n && binding_0.statusMode <= 255n && binding_0.statusRegistryDigest.buffer instanceof ArrayBuffer && binding_0.statusRegistryDigest.BYTES_PER_ELEMENT === 1 && binding_0.statusRegistryDigest.length === 32 && binding_0.statusRoot.buffer instanceof ArrayBuffer && binding_0.statusRoot.BYTES_PER_ELEMENT === 1 && binding_0.statusRoot.length === 32 && typeof(binding_0.statusRegistryVersion) === 'bigint' && binding_0.statusRegistryVersion >= 0n && binding_0.statusRegistryVersion <= 18446744073709551615n && binding_0.statusFreshnessPolicyDigest.buffer instanceof ArrayBuffer && binding_0.statusFreshnessPolicyDigest.BYTES_PER_ELEMENT === 1 && binding_0.statusFreshnessPolicyDigest.length === 32 && binding_0.policyDigest.buffer instanceof ArrayBuffer && binding_0.policyDigest.BYTES_PER_ELEMENT === 1 && binding_0.policyDigest.length === 32 && binding_0.actionClassDigest.buffer instanceof ArrayBuffer && binding_0.actionClassDigest.BYTES_PER_ELEMENT === 1 && binding_0.actionClassDigest.length === 32 && binding_0.actionInvocationDigest.buffer instanceof ArrayBuffer && binding_0.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && binding_0.actionInvocationDigest.length === 32 && binding_0.artifactManifestDigest.buffer instanceof ArrayBuffer && binding_0.artifactManifestDigest.BYTES_PER_ELEMENT === 1 && binding_0.artifactManifestDigest.length === 32 && typeof(binding_0.replayPolicy) === 'bigint' && binding_0.replayPolicy >= 0n && binding_0.replayPolicy <= 255n)) {
      __compactRuntime.typeError('consentBindingV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 239 char 1',
                                 'struct ConsentBindingV1<domain: Bytes<32>, version: Uint<0..65536>, profile: Uint<0..256>, networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>, audienceDigest: Bytes<32>, originMode: Uint<0..256>, originDigest: Bytes<32>, requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<0..18446744073709551616>, credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>, disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>, statusMode: Uint<0..256>, statusRegistryDigest: Bytes<32>, statusRoot: Bytes<32>, statusRegistryVersion: Uint<0..18446744073709551616>, statusFreshnessPolicyDigest: Bytes<32>, policyDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, artifactManifestDigest: Bytes<32>, replayPolicy: Uint<0..256>>',
                                 binding_0)
    }
    return _dummyContract._consentBindingV1Digest_0(binding_0);
  },
  presentationBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`presentationBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && binding_0.credentialBindingDigest.buffer instanceof ArrayBuffer && binding_0.credentialBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.credentialBindingDigest.length === 32 && binding_0.holderBindingDigest.buffer instanceof ArrayBuffer && binding_0.holderBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.holderBindingDigest.length === 32 && binding_0.disclosureDigest.buffer instanceof ArrayBuffer && binding_0.disclosureDigest.BYTES_PER_ELEMENT === 1 && binding_0.disclosureDigest.length === 32 && binding_0.predicateDigest.buffer instanceof ArrayBuffer && binding_0.predicateDigest.BYTES_PER_ELEMENT === 1 && binding_0.predicateDigest.length === 32 && binding_0.consentDigest.buffer instanceof ArrayBuffer && binding_0.consentDigest.BYTES_PER_ELEMENT === 1 && binding_0.consentDigest.length === 32)) {
      __compactRuntime.typeError('presentationBindingV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 245 char 1',
                                 'struct PresentationBindingV1<domain: Bytes<32>, version: Uint<0..65536>, credentialBindingDigest: Bytes<32>, holderBindingDigest: Bytes<32>, disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>, consentDigest: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._presentationBindingV1Digest_0(binding_0);
  },
  evidenceBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`evidenceBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && typeof(binding_0.mode) === 'bigint' && binding_0.mode >= 0n && binding_0.mode <= 255n && binding_0.authorityDigest.buffer instanceof ArrayBuffer && binding_0.authorityDigest.BYTES_PER_ELEMENT === 1 && binding_0.authorityDigest.length === 32 && binding_0.subjectDigest.buffer instanceof ArrayBuffer && binding_0.subjectDigest.BYTES_PER_ELEMENT === 1 && binding_0.subjectDigest.length === 32 && binding_0.stateAnchorDigest.buffer instanceof ArrayBuffer && binding_0.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && binding_0.stateAnchorDigest.length === 32 && binding_0.statementDigest.buffer instanceof ArrayBuffer && binding_0.statementDigest.BYTES_PER_ELEMENT === 1 && binding_0.statementDigest.length === 32 && typeof(binding_0.createdAt) === 'bigint' && binding_0.createdAt >= 0n && binding_0.createdAt <= 18446744073709551615n && typeof(binding_0.expiresAt) === 'bigint' && binding_0.expiresAt >= 0n && binding_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('evidenceBindingV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 251 char 1',
                                 'struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>',
                                 binding_0)
    }
    return _dummyContract._evidenceBindingV1Digest_0(binding_0);
  },
  anchorEvidenceReceiptV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`anchorEvidenceReceiptV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const receipt_0 = args_0[0];
    if (!(typeof(receipt_0) === 'object' && receipt_0.domain.buffer instanceof ArrayBuffer && receipt_0.domain.BYTES_PER_ELEMENT === 1 && receipt_0.domain.length === 32 && typeof(receipt_0.version) === 'bigint' && receipt_0.version >= 0n && receipt_0.version <= 65535n && receipt_0.issuerEvidenceDigest.buffer instanceof ArrayBuffer && receipt_0.issuerEvidenceDigest.BYTES_PER_ELEMENT === 1 && receipt_0.issuerEvidenceDigest.length === 32 && receipt_0.trustEvidenceDigest.buffer instanceof ArrayBuffer && receipt_0.trustEvidenceDigest.BYTES_PER_ELEMENT === 1 && receipt_0.trustEvidenceDigest.length === 32 && receipt_0.statusEvidenceDigest.buffer instanceof ArrayBuffer && receipt_0.statusEvidenceDigest.BYTES_PER_ELEMENT === 1 && receipt_0.statusEvidenceDigest.length === 32 && receipt_0.timeEvidenceDigest.buffer instanceof ArrayBuffer && receipt_0.timeEvidenceDigest.BYTES_PER_ELEMENT === 1 && receipt_0.timeEvidenceDigest.length === 32 && receipt_0.artifactEvidenceDigest.buffer instanceof ArrayBuffer && receipt_0.artifactEvidenceDigest.BYTES_PER_ELEMENT === 1 && receipt_0.artifactEvidenceDigest.length === 32 && receipt_0.connectorEvidenceDigest.buffer instanceof ArrayBuffer && receipt_0.connectorEvidenceDigest.BYTES_PER_ELEMENT === 1 && receipt_0.connectorEvidenceDigest.length === 32)) {
      __compactRuntime.typeError('anchorEvidenceReceiptV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 257 char 1',
                                 'struct AnchorEvidenceReceiptV1<domain: Bytes<32>, version: Uint<0..65536>, issuerEvidenceDigest: Bytes<32>, trustEvidenceDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>, timeEvidenceDigest: Bytes<32>, artifactEvidenceDigest: Bytes<32>, connectorEvidenceDigest: Bytes<32>>',
                                 receipt_0)
    }
    return _dummyContract._anchorEvidenceReceiptV1Digest_0(receipt_0);
  },
  decisionNullifierMaterialV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`decisionNullifierMaterialV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const material_0 = args_0[0];
    if (!(typeof(material_0) === 'object' && material_0.domain.buffer instanceof ArrayBuffer && material_0.domain.BYTES_PER_ELEMENT === 1 && material_0.domain.length === 32 && typeof(material_0.version) === 'bigint' && material_0.version >= 0n && material_0.version <= 65535n && material_0.deploymentDigest.buffer instanceof ArrayBuffer && material_0.deploymentDigest.BYTES_PER_ELEMENT === 1 && material_0.deploymentDigest.length === 32 && material_0.verifierContractDigest.buffer instanceof ArrayBuffer && material_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && material_0.verifierContractDigest.length === 32 && typeof(material_0.replayPolicy) === 'bigint' && material_0.replayPolicy >= 0n && material_0.replayPolicy <= 255n && material_0.replayScopeDigest.buffer instanceof ArrayBuffer && material_0.replayScopeDigest.BYTES_PER_ELEMENT === 1 && material_0.replayScopeDigest.length === 32)) {
      __compactRuntime.typeError('decisionNullifierMaterialV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 263 char 1',
                                 'struct DecisionNullifierMaterialV1<domain: Bytes<32>, version: Uint<0..65536>, deploymentDigest: Bytes<32>, verifierContractDigest: Bytes<32>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>>',
                                 material_0)
    }
    return _dummyContract._decisionNullifierMaterialV1Digest_0(material_0);
  },
  syntheticVerificationExtensionV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`syntheticVerificationExtensionV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const extension_0 = args_0[0];
    if (!(typeof(extension_0) === 'object' && extension_0.domain.buffer instanceof ArrayBuffer && extension_0.domain.BYTES_PER_ELEMENT === 1 && extension_0.domain.length === 32 && typeof(extension_0.version) === 'bigint' && extension_0.version >= 0n && extension_0.version <= 65535n && extension_0.familyDigest.buffer instanceof ArrayBuffer && extension_0.familyDigest.BYTES_PER_ELEMENT === 1 && extension_0.familyDigest.length === 32 && extension_0.valueDigest.buffer instanceof ArrayBuffer && extension_0.valueDigest.BYTES_PER_ELEMENT === 1 && extension_0.valueDigest.length === 32)) {
      __compactRuntime.typeError('syntheticVerificationExtensionV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 269 char 1',
                                 'struct SyntheticVerificationExtensionV1<domain: Bytes<32>, version: Uint<0..65536>, familyDigest: Bytes<32>, valueDigest: Bytes<32>>',
                                 extension_0)
    }
    return _dummyContract._syntheticVerificationExtensionV1Digest_0(extension_0);
  },
  verificationTranscriptV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`verificationTranscriptV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const transcript_0 = args_0[0];
    if (!(typeof(transcript_0) === 'object' && transcript_0.domain.buffer instanceof ArrayBuffer && transcript_0.domain.BYTES_PER_ELEMENT === 1 && transcript_0.domain.length === 32 && typeof(transcript_0.version) === 'bigint' && transcript_0.version >= 0n && transcript_0.version <= 65535n && typeof(transcript_0.profile) === 'bigint' && transcript_0.profile >= 0n && transcript_0.profile <= 255n && typeof(transcript_0.authority) === 'bigint' && transcript_0.authority >= 0n && transcript_0.authority <= 255n && transcript_0.networkIdDigest.buffer instanceof ArrayBuffer && transcript_0.networkIdDigest.BYTES_PER_ELEMENT === 1 && transcript_0.networkIdDigest.length === 32 && transcript_0.verifierContractDigest.buffer instanceof ArrayBuffer && transcript_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && transcript_0.verifierContractDigest.length === 32 && transcript_0.deploymentDigest.buffer instanceof ArrayBuffer && transcript_0.deploymentDigest.BYTES_PER_ELEMENT === 1 && transcript_0.deploymentDigest.length === 32 && transcript_0.audienceDigest.buffer instanceof ArrayBuffer && transcript_0.audienceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.audienceDigest.length === 32 && typeof(transcript_0.originMode) === 'bigint' && transcript_0.originMode >= 0n && transcript_0.originMode <= 255n && transcript_0.originDigest.buffer instanceof ArrayBuffer && transcript_0.originDigest.BYTES_PER_ELEMENT === 1 && transcript_0.originDigest.length === 32 && transcript_0.connectorEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.connectorEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.connectorEvidenceDigest.length === 32 && transcript_0.requestIdDigest.buffer instanceof ArrayBuffer && transcript_0.requestIdDigest.BYTES_PER_ELEMENT === 1 && transcript_0.requestIdDigest.length === 32 && transcript_0.challengeDigest.buffer instanceof ArrayBuffer && transcript_0.challengeDigest.BYTES_PER_ELEMENT === 1 && transcript_0.challengeDigest.length === 32 && typeof(transcript_0.expiresAt) === 'bigint' && transcript_0.expiresAt >= 0n && transcript_0.expiresAt <= 18446744073709551615n && transcript_0.credentialFamilyDigest.buffer instanceof ArrayBuffer && transcript_0.credentialFamilyDigest.BYTES_PER_ELEMENT === 1 && transcript_0.credentialFamilyDigest.length === 32 && transcript_0.schemaDigest.buffer instanceof ArrayBuffer && transcript_0.schemaDigest.BYTES_PER_ELEMENT === 1 && transcript_0.schemaDigest.length === 32 && typeof(transcript_0.credentialBindingMode) === 'bigint' && transcript_0.credentialBindingMode >= 0n && transcript_0.credentialBindingMode <= 255n && transcript_0.credentialBindingDigest.buffer instanceof ArrayBuffer && transcript_0.credentialBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.credentialBindingDigest.length === 32 && transcript_0.disclosureDigest.buffer instanceof ArrayBuffer && transcript_0.disclosureDigest.BYTES_PER_ELEMENT === 1 && transcript_0.disclosureDigest.length === 32 && transcript_0.predicateDigest.buffer instanceof ArrayBuffer && transcript_0.predicateDigest.BYTES_PER_ELEMENT === 1 && transcript_0.predicateDigest.length === 32 && transcript_0.holderBindingDigest.buffer instanceof ArrayBuffer && transcript_0.holderBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.holderBindingDigest.length === 32 && transcript_0.policyDigest.buffer instanceof ArrayBuffer && transcript_0.policyDigest.BYTES_PER_ELEMENT === 1 && transcript_0.policyDigest.length === 32 && transcript_0.actionClassDigest.buffer instanceof ArrayBuffer && transcript_0.actionClassDigest.BYTES_PER_ELEMENT === 1 && transcript_0.actionClassDigest.length === 32 && transcript_0.actionInvocationDigest.buffer instanceof ArrayBuffer && transcript_0.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && transcript_0.actionInvocationDigest.length === 32 && transcript_0.consentDigest.buffer instanceof ArrayBuffer && transcript_0.consentDigest.BYTES_PER_ELEMENT === 1 && transcript_0.consentDigest.length === 32 && transcript_0.presentationBindingDigest.buffer instanceof ArrayBuffer && transcript_0.presentationBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.presentationBindingDigest.length === 32 && transcript_0.issuerDidDigest.buffer instanceof ArrayBuffer && transcript_0.issuerDidDigest.BYTES_PER_ELEMENT === 1 && transcript_0.issuerDidDigest.length === 32 && transcript_0.issuerMethodDigest.buffer instanceof ArrayBuffer && transcript_0.issuerMethodDigest.BYTES_PER_ELEMENT === 1 && transcript_0.issuerMethodDigest.length === 32 && typeof(transcript_0.issuerRelationship) === 'bigint' && transcript_0.issuerRelationship >= 0n && transcript_0.issuerRelationship <= 255n && transcript_0.issuerEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.issuerEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.issuerEvidenceDigest.length === 32 && transcript_0.trustScopeDigest.buffer instanceof ArrayBuffer && transcript_0.trustScopeDigest.BYTES_PER_ELEMENT === 1 && transcript_0.trustScopeDigest.length === 32 && transcript_0.trustEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.trustEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.trustEvidenceDigest.length === 32 && typeof(transcript_0.statusMode) === 'bigint' && transcript_0.statusMode >= 0n && transcript_0.statusMode <= 255n && transcript_0.statusRegistryDigest.buffer instanceof ArrayBuffer && transcript_0.statusRegistryDigest.BYTES_PER_ELEMENT === 1 && transcript_0.statusRegistryDigest.length === 32 && transcript_0.statusRoot.buffer instanceof ArrayBuffer && transcript_0.statusRoot.BYTES_PER_ELEMENT === 1 && transcript_0.statusRoot.length === 32 && typeof(transcript_0.statusRegistryVersion) === 'bigint' && transcript_0.statusRegistryVersion >= 0n && transcript_0.statusRegistryVersion <= 18446744073709551615n && transcript_0.statusFreshnessPolicyDigest.buffer instanceof ArrayBuffer && transcript_0.statusFreshnessPolicyDigest.BYTES_PER_ELEMENT === 1 && transcript_0.statusFreshnessPolicyDigest.length === 32 && transcript_0.statusEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.statusEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.statusEvidenceDigest.length === 32 && typeof(transcript_0.timeMode) === 'bigint' && transcript_0.timeMode >= 0n && transcript_0.timeMode <= 255n && typeof(transcript_0.trustedTime) === 'bigint' && transcript_0.trustedTime >= 0n && transcript_0.trustedTime <= 18446744073709551615n && transcript_0.timeEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.timeEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.timeEvidenceDigest.length === 32 && transcript_0.artifactManifestDigest.buffer instanceof ArrayBuffer && transcript_0.artifactManifestDigest.BYTES_PER_ELEMENT === 1 && transcript_0.artifactManifestDigest.length === 32 && transcript_0.artifactEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.artifactEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.artifactEvidenceDigest.length === 32 && typeof(transcript_0.nullifierMode) === 'bigint' && transcript_0.nullifierMode >= 0n && transcript_0.nullifierMode <= 255n && typeof(transcript_0.replayPolicy) === 'bigint' && transcript_0.replayPolicy >= 0n && transcript_0.replayPolicy <= 255n && transcript_0.replayScopeDigest.buffer instanceof ArrayBuffer && transcript_0.replayScopeDigest.BYTES_PER_ELEMENT === 1 && transcript_0.replayScopeDigest.length === 32 && transcript_0.decisionNullifier.buffer instanceof ArrayBuffer && transcript_0.decisionNullifier.BYTES_PER_ELEMENT === 1 && transcript_0.decisionNullifier.length === 32)) {
      __compactRuntime.typeError('verificationTranscriptV1Digest',
                                 'argument 1',
                                 'verification-v1.compact line 275 char 1',
                                 'struct VerificationTranscriptV1<domain: Bytes<32>, version: Uint<0..65536>, profile: Uint<0..256>, authority: Uint<0..256>, networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>, audienceDigest: Bytes<32>, originMode: Uint<0..256>, originDigest: Bytes<32>, connectorEvidenceDigest: Bytes<32>, requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<0..18446744073709551616>, credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>, credentialBindingMode: Uint<0..256>, credentialBindingDigest: Bytes<32>, disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>, holderBindingDigest: Bytes<32>, policyDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, consentDigest: Bytes<32>, presentationBindingDigest: Bytes<32>, issuerDidDigest: Bytes<32>, issuerMethodDigest: Bytes<32>, issuerRelationship: Uint<0..256>, issuerEvidenceDigest: Bytes<32>, trustScopeDigest: Bytes<32>, trustEvidenceDigest: Bytes<32>, statusMode: Uint<0..256>, statusRegistryDigest: Bytes<32>, statusRoot: Bytes<32>, statusRegistryVersion: Uint<0..18446744073709551616>, statusFreshnessPolicyDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>, timeMode: Uint<0..256>, trustedTime: Uint<0..18446744073709551616>, timeEvidenceDigest: Bytes<32>, artifactManifestDigest: Bytes<32>, artifactEvidenceDigest: Bytes<32>, nullifierMode: Uint<0..256>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>, decisionNullifier: Bytes<32>>',
                                 transcript_0)
    }
    return _dummyContract._verificationTranscriptV1Digest_0(transcript_0);
  },
  assertValidEvidenceBindingV1: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidEvidenceBindingV1: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    const expectedDomain_0 = args_0[1];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && typeof(binding_0.mode) === 'bigint' && binding_0.mode >= 0n && binding_0.mode <= 255n && binding_0.authorityDigest.buffer instanceof ArrayBuffer && binding_0.authorityDigest.BYTES_PER_ELEMENT === 1 && binding_0.authorityDigest.length === 32 && binding_0.subjectDigest.buffer instanceof ArrayBuffer && binding_0.subjectDigest.BYTES_PER_ELEMENT === 1 && binding_0.subjectDigest.length === 32 && binding_0.stateAnchorDigest.buffer instanceof ArrayBuffer && binding_0.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && binding_0.stateAnchorDigest.length === 32 && binding_0.statementDigest.buffer instanceof ArrayBuffer && binding_0.statementDigest.BYTES_PER_ELEMENT === 1 && binding_0.statementDigest.length === 32 && typeof(binding_0.createdAt) === 'bigint' && binding_0.createdAt >= 0n && binding_0.createdAt <= 18446744073709551615n && typeof(binding_0.expiresAt) === 'bigint' && binding_0.expiresAt >= 0n && binding_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('assertValidEvidenceBindingV1',
                                 'argument 1',
                                 'verification-v1.compact line 281 char 1',
                                 'struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>',
                                 binding_0)
    }
    if (!(expectedDomain_0.buffer instanceof ArrayBuffer && expectedDomain_0.BYTES_PER_ELEMENT === 1 && expectedDomain_0.length === 32)) {
      __compactRuntime.typeError('assertValidEvidenceBindingV1',
                                 'argument 2',
                                 'verification-v1.compact line 281 char 1',
                                 'Bytes<32>',
                                 expectedDomain_0)
    }
    return _dummyContract._assertValidEvidenceBindingV1_0(binding_0,
                                                          expectedDomain_0);
  },
  assertValidVerificationTranscriptV1: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidVerificationTranscriptV1: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const transcript_0 = args_0[0];
    if (!(typeof(transcript_0) === 'object' && transcript_0.domain.buffer instanceof ArrayBuffer && transcript_0.domain.BYTES_PER_ELEMENT === 1 && transcript_0.domain.length === 32 && typeof(transcript_0.version) === 'bigint' && transcript_0.version >= 0n && transcript_0.version <= 65535n && typeof(transcript_0.profile) === 'bigint' && transcript_0.profile >= 0n && transcript_0.profile <= 255n && typeof(transcript_0.authority) === 'bigint' && transcript_0.authority >= 0n && transcript_0.authority <= 255n && transcript_0.networkIdDigest.buffer instanceof ArrayBuffer && transcript_0.networkIdDigest.BYTES_PER_ELEMENT === 1 && transcript_0.networkIdDigest.length === 32 && transcript_0.verifierContractDigest.buffer instanceof ArrayBuffer && transcript_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && transcript_0.verifierContractDigest.length === 32 && transcript_0.deploymentDigest.buffer instanceof ArrayBuffer && transcript_0.deploymentDigest.BYTES_PER_ELEMENT === 1 && transcript_0.deploymentDigest.length === 32 && transcript_0.audienceDigest.buffer instanceof ArrayBuffer && transcript_0.audienceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.audienceDigest.length === 32 && typeof(transcript_0.originMode) === 'bigint' && transcript_0.originMode >= 0n && transcript_0.originMode <= 255n && transcript_0.originDigest.buffer instanceof ArrayBuffer && transcript_0.originDigest.BYTES_PER_ELEMENT === 1 && transcript_0.originDigest.length === 32 && transcript_0.connectorEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.connectorEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.connectorEvidenceDigest.length === 32 && transcript_0.requestIdDigest.buffer instanceof ArrayBuffer && transcript_0.requestIdDigest.BYTES_PER_ELEMENT === 1 && transcript_0.requestIdDigest.length === 32 && transcript_0.challengeDigest.buffer instanceof ArrayBuffer && transcript_0.challengeDigest.BYTES_PER_ELEMENT === 1 && transcript_0.challengeDigest.length === 32 && typeof(transcript_0.expiresAt) === 'bigint' && transcript_0.expiresAt >= 0n && transcript_0.expiresAt <= 18446744073709551615n && transcript_0.credentialFamilyDigest.buffer instanceof ArrayBuffer && transcript_0.credentialFamilyDigest.BYTES_PER_ELEMENT === 1 && transcript_0.credentialFamilyDigest.length === 32 && transcript_0.schemaDigest.buffer instanceof ArrayBuffer && transcript_0.schemaDigest.BYTES_PER_ELEMENT === 1 && transcript_0.schemaDigest.length === 32 && typeof(transcript_0.credentialBindingMode) === 'bigint' && transcript_0.credentialBindingMode >= 0n && transcript_0.credentialBindingMode <= 255n && transcript_0.credentialBindingDigest.buffer instanceof ArrayBuffer && transcript_0.credentialBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.credentialBindingDigest.length === 32 && transcript_0.disclosureDigest.buffer instanceof ArrayBuffer && transcript_0.disclosureDigest.BYTES_PER_ELEMENT === 1 && transcript_0.disclosureDigest.length === 32 && transcript_0.predicateDigest.buffer instanceof ArrayBuffer && transcript_0.predicateDigest.BYTES_PER_ELEMENT === 1 && transcript_0.predicateDigest.length === 32 && transcript_0.holderBindingDigest.buffer instanceof ArrayBuffer && transcript_0.holderBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.holderBindingDigest.length === 32 && transcript_0.policyDigest.buffer instanceof ArrayBuffer && transcript_0.policyDigest.BYTES_PER_ELEMENT === 1 && transcript_0.policyDigest.length === 32 && transcript_0.actionClassDigest.buffer instanceof ArrayBuffer && transcript_0.actionClassDigest.BYTES_PER_ELEMENT === 1 && transcript_0.actionClassDigest.length === 32 && transcript_0.actionInvocationDigest.buffer instanceof ArrayBuffer && transcript_0.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && transcript_0.actionInvocationDigest.length === 32 && transcript_0.consentDigest.buffer instanceof ArrayBuffer && transcript_0.consentDigest.BYTES_PER_ELEMENT === 1 && transcript_0.consentDigest.length === 32 && transcript_0.presentationBindingDigest.buffer instanceof ArrayBuffer && transcript_0.presentationBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.presentationBindingDigest.length === 32 && transcript_0.issuerDidDigest.buffer instanceof ArrayBuffer && transcript_0.issuerDidDigest.BYTES_PER_ELEMENT === 1 && transcript_0.issuerDidDigest.length === 32 && transcript_0.issuerMethodDigest.buffer instanceof ArrayBuffer && transcript_0.issuerMethodDigest.BYTES_PER_ELEMENT === 1 && transcript_0.issuerMethodDigest.length === 32 && typeof(transcript_0.issuerRelationship) === 'bigint' && transcript_0.issuerRelationship >= 0n && transcript_0.issuerRelationship <= 255n && transcript_0.issuerEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.issuerEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.issuerEvidenceDigest.length === 32 && transcript_0.trustScopeDigest.buffer instanceof ArrayBuffer && transcript_0.trustScopeDigest.BYTES_PER_ELEMENT === 1 && transcript_0.trustScopeDigest.length === 32 && transcript_0.trustEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.trustEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.trustEvidenceDigest.length === 32 && typeof(transcript_0.statusMode) === 'bigint' && transcript_0.statusMode >= 0n && transcript_0.statusMode <= 255n && transcript_0.statusRegistryDigest.buffer instanceof ArrayBuffer && transcript_0.statusRegistryDigest.BYTES_PER_ELEMENT === 1 && transcript_0.statusRegistryDigest.length === 32 && transcript_0.statusRoot.buffer instanceof ArrayBuffer && transcript_0.statusRoot.BYTES_PER_ELEMENT === 1 && transcript_0.statusRoot.length === 32 && typeof(transcript_0.statusRegistryVersion) === 'bigint' && transcript_0.statusRegistryVersion >= 0n && transcript_0.statusRegistryVersion <= 18446744073709551615n && transcript_0.statusFreshnessPolicyDigest.buffer instanceof ArrayBuffer && transcript_0.statusFreshnessPolicyDigest.BYTES_PER_ELEMENT === 1 && transcript_0.statusFreshnessPolicyDigest.length === 32 && transcript_0.statusEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.statusEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.statusEvidenceDigest.length === 32 && typeof(transcript_0.timeMode) === 'bigint' && transcript_0.timeMode >= 0n && transcript_0.timeMode <= 255n && typeof(transcript_0.trustedTime) === 'bigint' && transcript_0.trustedTime >= 0n && transcript_0.trustedTime <= 18446744073709551615n && transcript_0.timeEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.timeEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.timeEvidenceDigest.length === 32 && transcript_0.artifactManifestDigest.buffer instanceof ArrayBuffer && transcript_0.artifactManifestDigest.BYTES_PER_ELEMENT === 1 && transcript_0.artifactManifestDigest.length === 32 && transcript_0.artifactEvidenceDigest.buffer instanceof ArrayBuffer && transcript_0.artifactEvidenceDigest.BYTES_PER_ELEMENT === 1 && transcript_0.artifactEvidenceDigest.length === 32 && typeof(transcript_0.nullifierMode) === 'bigint' && transcript_0.nullifierMode >= 0n && transcript_0.nullifierMode <= 255n && typeof(transcript_0.replayPolicy) === 'bigint' && transcript_0.replayPolicy >= 0n && transcript_0.replayPolicy <= 255n && transcript_0.replayScopeDigest.buffer instanceof ArrayBuffer && transcript_0.replayScopeDigest.BYTES_PER_ELEMENT === 1 && transcript_0.replayScopeDigest.length === 32 && transcript_0.decisionNullifier.buffer instanceof ArrayBuffer && transcript_0.decisionNullifier.BYTES_PER_ELEMENT === 1 && transcript_0.decisionNullifier.length === 32)) {
      __compactRuntime.typeError('assertValidVerificationTranscriptV1',
                                 'argument 1',
                                 'verification-v1.compact line 317 char 1',
                                 'struct VerificationTranscriptV1<domain: Bytes<32>, version: Uint<0..65536>, profile: Uint<0..256>, authority: Uint<0..256>, networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>, audienceDigest: Bytes<32>, originMode: Uint<0..256>, originDigest: Bytes<32>, connectorEvidenceDigest: Bytes<32>, requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<0..18446744073709551616>, credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>, credentialBindingMode: Uint<0..256>, credentialBindingDigest: Bytes<32>, disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>, holderBindingDigest: Bytes<32>, policyDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, consentDigest: Bytes<32>, presentationBindingDigest: Bytes<32>, issuerDidDigest: Bytes<32>, issuerMethodDigest: Bytes<32>, issuerRelationship: Uint<0..256>, issuerEvidenceDigest: Bytes<32>, trustScopeDigest: Bytes<32>, trustEvidenceDigest: Bytes<32>, statusMode: Uint<0..256>, statusRegistryDigest: Bytes<32>, statusRoot: Bytes<32>, statusRegistryVersion: Uint<0..18446744073709551616>, statusFreshnessPolicyDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>, timeMode: Uint<0..256>, trustedTime: Uint<0..18446744073709551616>, timeEvidenceDigest: Bytes<32>, artifactManifestDigest: Bytes<32>, artifactEvidenceDigest: Bytes<32>, nullifierMode: Uint<0..256>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>, decisionNullifier: Bytes<32>>',
                                 transcript_0)
    }
    return _dummyContract._assertValidVerificationTranscriptV1_0(transcript_0);
  },
  assertValidVerificationPublicInputsV1: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidVerificationPublicInputsV1: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const inputs_0 = args_0[0];
    if (!(typeof(inputs_0) === 'object' && typeof(inputs_0.transcript) === 'object' && inputs_0.transcript.domain.buffer instanceof ArrayBuffer && inputs_0.transcript.domain.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.domain.length === 32 && typeof(inputs_0.transcript.version) === 'bigint' && inputs_0.transcript.version >= 0n && inputs_0.transcript.version <= 65535n && typeof(inputs_0.transcript.profile) === 'bigint' && inputs_0.transcript.profile >= 0n && inputs_0.transcript.profile <= 255n && typeof(inputs_0.transcript.authority) === 'bigint' && inputs_0.transcript.authority >= 0n && inputs_0.transcript.authority <= 255n && inputs_0.transcript.networkIdDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.networkIdDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.networkIdDigest.length === 32 && inputs_0.transcript.verifierContractDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.verifierContractDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.verifierContractDigest.length === 32 && inputs_0.transcript.deploymentDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.deploymentDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.deploymentDigest.length === 32 && inputs_0.transcript.audienceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.audienceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.audienceDigest.length === 32 && typeof(inputs_0.transcript.originMode) === 'bigint' && inputs_0.transcript.originMode >= 0n && inputs_0.transcript.originMode <= 255n && inputs_0.transcript.originDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.originDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.originDigest.length === 32 && inputs_0.transcript.connectorEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.connectorEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.connectorEvidenceDigest.length === 32 && inputs_0.transcript.requestIdDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.requestIdDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.requestIdDigest.length === 32 && inputs_0.transcript.challengeDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.challengeDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.challengeDigest.length === 32 && typeof(inputs_0.transcript.expiresAt) === 'bigint' && inputs_0.transcript.expiresAt >= 0n && inputs_0.transcript.expiresAt <= 18446744073709551615n && inputs_0.transcript.credentialFamilyDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.credentialFamilyDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.credentialFamilyDigest.length === 32 && inputs_0.transcript.schemaDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.schemaDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.schemaDigest.length === 32 && typeof(inputs_0.transcript.credentialBindingMode) === 'bigint' && inputs_0.transcript.credentialBindingMode >= 0n && inputs_0.transcript.credentialBindingMode <= 255n && inputs_0.transcript.credentialBindingDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.credentialBindingDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.credentialBindingDigest.length === 32 && inputs_0.transcript.disclosureDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.disclosureDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.disclosureDigest.length === 32 && inputs_0.transcript.predicateDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.predicateDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.predicateDigest.length === 32 && inputs_0.transcript.holderBindingDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.holderBindingDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.holderBindingDigest.length === 32 && inputs_0.transcript.policyDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.policyDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.policyDigest.length === 32 && inputs_0.transcript.actionClassDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.actionClassDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.actionClassDigest.length === 32 && inputs_0.transcript.actionInvocationDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.actionInvocationDigest.length === 32 && inputs_0.transcript.consentDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.consentDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.consentDigest.length === 32 && inputs_0.transcript.presentationBindingDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.presentationBindingDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.presentationBindingDigest.length === 32 && inputs_0.transcript.issuerDidDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.issuerDidDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.issuerDidDigest.length === 32 && inputs_0.transcript.issuerMethodDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.issuerMethodDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.issuerMethodDigest.length === 32 && typeof(inputs_0.transcript.issuerRelationship) === 'bigint' && inputs_0.transcript.issuerRelationship >= 0n && inputs_0.transcript.issuerRelationship <= 255n && inputs_0.transcript.issuerEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.issuerEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.issuerEvidenceDigest.length === 32 && inputs_0.transcript.trustScopeDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.trustScopeDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.trustScopeDigest.length === 32 && inputs_0.transcript.trustEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.trustEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.trustEvidenceDigest.length === 32 && typeof(inputs_0.transcript.statusMode) === 'bigint' && inputs_0.transcript.statusMode >= 0n && inputs_0.transcript.statusMode <= 255n && inputs_0.transcript.statusRegistryDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.statusRegistryDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusRegistryDigest.length === 32 && inputs_0.transcript.statusRoot.buffer instanceof ArrayBuffer && inputs_0.transcript.statusRoot.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusRoot.length === 32 && typeof(inputs_0.transcript.statusRegistryVersion) === 'bigint' && inputs_0.transcript.statusRegistryVersion >= 0n && inputs_0.transcript.statusRegistryVersion <= 18446744073709551615n && inputs_0.transcript.statusFreshnessPolicyDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.statusFreshnessPolicyDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusFreshnessPolicyDigest.length === 32 && inputs_0.transcript.statusEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.statusEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusEvidenceDigest.length === 32 && typeof(inputs_0.transcript.timeMode) === 'bigint' && inputs_0.transcript.timeMode >= 0n && inputs_0.transcript.timeMode <= 255n && typeof(inputs_0.transcript.trustedTime) === 'bigint' && inputs_0.transcript.trustedTime >= 0n && inputs_0.transcript.trustedTime <= 18446744073709551615n && inputs_0.transcript.timeEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.timeEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.timeEvidenceDigest.length === 32 && inputs_0.transcript.artifactManifestDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.artifactManifestDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.artifactManifestDigest.length === 32 && inputs_0.transcript.artifactEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.artifactEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.artifactEvidenceDigest.length === 32 && typeof(inputs_0.transcript.nullifierMode) === 'bigint' && inputs_0.transcript.nullifierMode >= 0n && inputs_0.transcript.nullifierMode <= 255n && typeof(inputs_0.transcript.replayPolicy) === 'bigint' && inputs_0.transcript.replayPolicy >= 0n && inputs_0.transcript.replayPolicy <= 255n && inputs_0.transcript.replayScopeDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.replayScopeDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.replayScopeDigest.length === 32 && inputs_0.transcript.decisionNullifier.buffer instanceof ArrayBuffer && inputs_0.transcript.decisionNullifier.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.decisionNullifier.length === 32 && typeof(inputs_0.issuerEvidence) === 'object' && inputs_0.issuerEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.domain.length === 32 && typeof(inputs_0.issuerEvidence.version) === 'bigint' && inputs_0.issuerEvidence.version >= 0n && inputs_0.issuerEvidence.version <= 65535n && typeof(inputs_0.issuerEvidence.mode) === 'bigint' && inputs_0.issuerEvidence.mode >= 0n && inputs_0.issuerEvidence.mode <= 255n && inputs_0.issuerEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.authorityDigest.length === 32 && inputs_0.issuerEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.subjectDigest.length === 32 && inputs_0.issuerEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.stateAnchorDigest.length === 32 && inputs_0.issuerEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.statementDigest.length === 32 && typeof(inputs_0.issuerEvidence.createdAt) === 'bigint' && inputs_0.issuerEvidence.createdAt >= 0n && inputs_0.issuerEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.issuerEvidence.expiresAt) === 'bigint' && inputs_0.issuerEvidence.expiresAt >= 0n && inputs_0.issuerEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.trustEvidence) === 'object' && inputs_0.trustEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.domain.length === 32 && typeof(inputs_0.trustEvidence.version) === 'bigint' && inputs_0.trustEvidence.version >= 0n && inputs_0.trustEvidence.version <= 65535n && typeof(inputs_0.trustEvidence.mode) === 'bigint' && inputs_0.trustEvidence.mode >= 0n && inputs_0.trustEvidence.mode <= 255n && inputs_0.trustEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.authorityDigest.length === 32 && inputs_0.trustEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.subjectDigest.length === 32 && inputs_0.trustEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.stateAnchorDigest.length === 32 && inputs_0.trustEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.statementDigest.length === 32 && typeof(inputs_0.trustEvidence.createdAt) === 'bigint' && inputs_0.trustEvidence.createdAt >= 0n && inputs_0.trustEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.trustEvidence.expiresAt) === 'bigint' && inputs_0.trustEvidence.expiresAt >= 0n && inputs_0.trustEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.statusEvidence) === 'object' && inputs_0.statusEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.domain.length === 32 && typeof(inputs_0.statusEvidence.version) === 'bigint' && inputs_0.statusEvidence.version >= 0n && inputs_0.statusEvidence.version <= 65535n && typeof(inputs_0.statusEvidence.mode) === 'bigint' && inputs_0.statusEvidence.mode >= 0n && inputs_0.statusEvidence.mode <= 255n && inputs_0.statusEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.authorityDigest.length === 32 && inputs_0.statusEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.subjectDigest.length === 32 && inputs_0.statusEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.stateAnchorDigest.length === 32 && inputs_0.statusEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.statementDigest.length === 32 && typeof(inputs_0.statusEvidence.createdAt) === 'bigint' && inputs_0.statusEvidence.createdAt >= 0n && inputs_0.statusEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.statusEvidence.expiresAt) === 'bigint' && inputs_0.statusEvidence.expiresAt >= 0n && inputs_0.statusEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.timeEvidence) === 'object' && inputs_0.timeEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.domain.length === 32 && typeof(inputs_0.timeEvidence.version) === 'bigint' && inputs_0.timeEvidence.version >= 0n && inputs_0.timeEvidence.version <= 65535n && typeof(inputs_0.timeEvidence.mode) === 'bigint' && inputs_0.timeEvidence.mode >= 0n && inputs_0.timeEvidence.mode <= 255n && inputs_0.timeEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.authorityDigest.length === 32 && inputs_0.timeEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.subjectDigest.length === 32 && inputs_0.timeEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.stateAnchorDigest.length === 32 && inputs_0.timeEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.statementDigest.length === 32 && typeof(inputs_0.timeEvidence.createdAt) === 'bigint' && inputs_0.timeEvidence.createdAt >= 0n && inputs_0.timeEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.timeEvidence.expiresAt) === 'bigint' && inputs_0.timeEvidence.expiresAt >= 0n && inputs_0.timeEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.artifactEvidence) === 'object' && inputs_0.artifactEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.domain.length === 32 && typeof(inputs_0.artifactEvidence.version) === 'bigint' && inputs_0.artifactEvidence.version >= 0n && inputs_0.artifactEvidence.version <= 65535n && typeof(inputs_0.artifactEvidence.mode) === 'bigint' && inputs_0.artifactEvidence.mode >= 0n && inputs_0.artifactEvidence.mode <= 255n && inputs_0.artifactEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.authorityDigest.length === 32 && inputs_0.artifactEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.subjectDigest.length === 32 && inputs_0.artifactEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.stateAnchorDigest.length === 32 && inputs_0.artifactEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.statementDigest.length === 32 && typeof(inputs_0.artifactEvidence.createdAt) === 'bigint' && inputs_0.artifactEvidence.createdAt >= 0n && inputs_0.artifactEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.artifactEvidence.expiresAt) === 'bigint' && inputs_0.artifactEvidence.expiresAt >= 0n && inputs_0.artifactEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.connectorEvidence) === 'object' && inputs_0.connectorEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.domain.length === 32 && typeof(inputs_0.connectorEvidence.version) === 'bigint' && inputs_0.connectorEvidence.version >= 0n && inputs_0.connectorEvidence.version <= 65535n && typeof(inputs_0.connectorEvidence.mode) === 'bigint' && inputs_0.connectorEvidence.mode >= 0n && inputs_0.connectorEvidence.mode <= 255n && inputs_0.connectorEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.authorityDigest.length === 32 && inputs_0.connectorEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.subjectDigest.length === 32 && inputs_0.connectorEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.stateAnchorDigest.length === 32 && inputs_0.connectorEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.statementDigest.length === 32 && typeof(inputs_0.connectorEvidence.createdAt) === 'bigint' && inputs_0.connectorEvidence.createdAt >= 0n && inputs_0.connectorEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.connectorEvidence.expiresAt) === 'bigint' && inputs_0.connectorEvidence.expiresAt >= 0n && inputs_0.connectorEvidence.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('assertValidVerificationPublicInputsV1',
                                 'argument 1',
                                 'verification-v1.compact line 411 char 1',
                                 'struct VerificationPublicInputsV1<transcript: struct VerificationTranscriptV1<domain: Bytes<32>, version: Uint<0..65536>, profile: Uint<0..256>, authority: Uint<0..256>, networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>, audienceDigest: Bytes<32>, originMode: Uint<0..256>, originDigest: Bytes<32>, connectorEvidenceDigest: Bytes<32>, requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<0..18446744073709551616>, credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>, credentialBindingMode: Uint<0..256>, credentialBindingDigest: Bytes<32>, disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>, holderBindingDigest: Bytes<32>, policyDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, consentDigest: Bytes<32>, presentationBindingDigest: Bytes<32>, issuerDidDigest: Bytes<32>, issuerMethodDigest: Bytes<32>, issuerRelationship: Uint<0..256>, issuerEvidenceDigest: Bytes<32>, trustScopeDigest: Bytes<32>, trustEvidenceDigest: Bytes<32>, statusMode: Uint<0..256>, statusRegistryDigest: Bytes<32>, statusRoot: Bytes<32>, statusRegistryVersion: Uint<0..18446744073709551616>, statusFreshnessPolicyDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>, timeMode: Uint<0..256>, trustedTime: Uint<0..18446744073709551616>, timeEvidenceDigest: Bytes<32>, artifactManifestDigest: Bytes<32>, artifactEvidenceDigest: Bytes<32>, nullifierMode: Uint<0..256>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>, decisionNullifier: Bytes<32>>, issuerEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, trustEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, statusEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, timeEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, artifactEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, connectorEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>>',
                                 inputs_0)
    }
    return _dummyContract._assertValidVerificationPublicInputsV1_0(inputs_0);
  },
  syntheticUnavailableAuthorityVerificationV1: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`syntheticUnavailableAuthorityVerificationV1: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const inputs_0 = args_0[0];
    const expectedTranscriptDigest_0 = args_0[1];
    if (!(typeof(inputs_0) === 'object' && typeof(inputs_0.transcript) === 'object' && inputs_0.transcript.domain.buffer instanceof ArrayBuffer && inputs_0.transcript.domain.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.domain.length === 32 && typeof(inputs_0.transcript.version) === 'bigint' && inputs_0.transcript.version >= 0n && inputs_0.transcript.version <= 65535n && typeof(inputs_0.transcript.profile) === 'bigint' && inputs_0.transcript.profile >= 0n && inputs_0.transcript.profile <= 255n && typeof(inputs_0.transcript.authority) === 'bigint' && inputs_0.transcript.authority >= 0n && inputs_0.transcript.authority <= 255n && inputs_0.transcript.networkIdDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.networkIdDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.networkIdDigest.length === 32 && inputs_0.transcript.verifierContractDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.verifierContractDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.verifierContractDigest.length === 32 && inputs_0.transcript.deploymentDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.deploymentDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.deploymentDigest.length === 32 && inputs_0.transcript.audienceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.audienceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.audienceDigest.length === 32 && typeof(inputs_0.transcript.originMode) === 'bigint' && inputs_0.transcript.originMode >= 0n && inputs_0.transcript.originMode <= 255n && inputs_0.transcript.originDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.originDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.originDigest.length === 32 && inputs_0.transcript.connectorEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.connectorEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.connectorEvidenceDigest.length === 32 && inputs_0.transcript.requestIdDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.requestIdDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.requestIdDigest.length === 32 && inputs_0.transcript.challengeDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.challengeDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.challengeDigest.length === 32 && typeof(inputs_0.transcript.expiresAt) === 'bigint' && inputs_0.transcript.expiresAt >= 0n && inputs_0.transcript.expiresAt <= 18446744073709551615n && inputs_0.transcript.credentialFamilyDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.credentialFamilyDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.credentialFamilyDigest.length === 32 && inputs_0.transcript.schemaDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.schemaDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.schemaDigest.length === 32 && typeof(inputs_0.transcript.credentialBindingMode) === 'bigint' && inputs_0.transcript.credentialBindingMode >= 0n && inputs_0.transcript.credentialBindingMode <= 255n && inputs_0.transcript.credentialBindingDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.credentialBindingDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.credentialBindingDigest.length === 32 && inputs_0.transcript.disclosureDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.disclosureDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.disclosureDigest.length === 32 && inputs_0.transcript.predicateDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.predicateDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.predicateDigest.length === 32 && inputs_0.transcript.holderBindingDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.holderBindingDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.holderBindingDigest.length === 32 && inputs_0.transcript.policyDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.policyDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.policyDigest.length === 32 && inputs_0.transcript.actionClassDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.actionClassDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.actionClassDigest.length === 32 && inputs_0.transcript.actionInvocationDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.actionInvocationDigest.length === 32 && inputs_0.transcript.consentDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.consentDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.consentDigest.length === 32 && inputs_0.transcript.presentationBindingDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.presentationBindingDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.presentationBindingDigest.length === 32 && inputs_0.transcript.issuerDidDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.issuerDidDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.issuerDidDigest.length === 32 && inputs_0.transcript.issuerMethodDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.issuerMethodDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.issuerMethodDigest.length === 32 && typeof(inputs_0.transcript.issuerRelationship) === 'bigint' && inputs_0.transcript.issuerRelationship >= 0n && inputs_0.transcript.issuerRelationship <= 255n && inputs_0.transcript.issuerEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.issuerEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.issuerEvidenceDigest.length === 32 && inputs_0.transcript.trustScopeDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.trustScopeDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.trustScopeDigest.length === 32 && inputs_0.transcript.trustEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.trustEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.trustEvidenceDigest.length === 32 && typeof(inputs_0.transcript.statusMode) === 'bigint' && inputs_0.transcript.statusMode >= 0n && inputs_0.transcript.statusMode <= 255n && inputs_0.transcript.statusRegistryDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.statusRegistryDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusRegistryDigest.length === 32 && inputs_0.transcript.statusRoot.buffer instanceof ArrayBuffer && inputs_0.transcript.statusRoot.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusRoot.length === 32 && typeof(inputs_0.transcript.statusRegistryVersion) === 'bigint' && inputs_0.transcript.statusRegistryVersion >= 0n && inputs_0.transcript.statusRegistryVersion <= 18446744073709551615n && inputs_0.transcript.statusFreshnessPolicyDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.statusFreshnessPolicyDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusFreshnessPolicyDigest.length === 32 && inputs_0.transcript.statusEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.statusEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.statusEvidenceDigest.length === 32 && typeof(inputs_0.transcript.timeMode) === 'bigint' && inputs_0.transcript.timeMode >= 0n && inputs_0.transcript.timeMode <= 255n && typeof(inputs_0.transcript.trustedTime) === 'bigint' && inputs_0.transcript.trustedTime >= 0n && inputs_0.transcript.trustedTime <= 18446744073709551615n && inputs_0.transcript.timeEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.timeEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.timeEvidenceDigest.length === 32 && inputs_0.transcript.artifactManifestDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.artifactManifestDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.artifactManifestDigest.length === 32 && inputs_0.transcript.artifactEvidenceDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.artifactEvidenceDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.artifactEvidenceDigest.length === 32 && typeof(inputs_0.transcript.nullifierMode) === 'bigint' && inputs_0.transcript.nullifierMode >= 0n && inputs_0.transcript.nullifierMode <= 255n && typeof(inputs_0.transcript.replayPolicy) === 'bigint' && inputs_0.transcript.replayPolicy >= 0n && inputs_0.transcript.replayPolicy <= 255n && inputs_0.transcript.replayScopeDigest.buffer instanceof ArrayBuffer && inputs_0.transcript.replayScopeDigest.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.replayScopeDigest.length === 32 && inputs_0.transcript.decisionNullifier.buffer instanceof ArrayBuffer && inputs_0.transcript.decisionNullifier.BYTES_PER_ELEMENT === 1 && inputs_0.transcript.decisionNullifier.length === 32 && typeof(inputs_0.issuerEvidence) === 'object' && inputs_0.issuerEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.domain.length === 32 && typeof(inputs_0.issuerEvidence.version) === 'bigint' && inputs_0.issuerEvidence.version >= 0n && inputs_0.issuerEvidence.version <= 65535n && typeof(inputs_0.issuerEvidence.mode) === 'bigint' && inputs_0.issuerEvidence.mode >= 0n && inputs_0.issuerEvidence.mode <= 255n && inputs_0.issuerEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.authorityDigest.length === 32 && inputs_0.issuerEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.subjectDigest.length === 32 && inputs_0.issuerEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.stateAnchorDigest.length === 32 && inputs_0.issuerEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.issuerEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.issuerEvidence.statementDigest.length === 32 && typeof(inputs_0.issuerEvidence.createdAt) === 'bigint' && inputs_0.issuerEvidence.createdAt >= 0n && inputs_0.issuerEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.issuerEvidence.expiresAt) === 'bigint' && inputs_0.issuerEvidence.expiresAt >= 0n && inputs_0.issuerEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.trustEvidence) === 'object' && inputs_0.trustEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.domain.length === 32 && typeof(inputs_0.trustEvidence.version) === 'bigint' && inputs_0.trustEvidence.version >= 0n && inputs_0.trustEvidence.version <= 65535n && typeof(inputs_0.trustEvidence.mode) === 'bigint' && inputs_0.trustEvidence.mode >= 0n && inputs_0.trustEvidence.mode <= 255n && inputs_0.trustEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.authorityDigest.length === 32 && inputs_0.trustEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.subjectDigest.length === 32 && inputs_0.trustEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.stateAnchorDigest.length === 32 && inputs_0.trustEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.trustEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.trustEvidence.statementDigest.length === 32 && typeof(inputs_0.trustEvidence.createdAt) === 'bigint' && inputs_0.trustEvidence.createdAt >= 0n && inputs_0.trustEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.trustEvidence.expiresAt) === 'bigint' && inputs_0.trustEvidence.expiresAt >= 0n && inputs_0.trustEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.statusEvidence) === 'object' && inputs_0.statusEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.domain.length === 32 && typeof(inputs_0.statusEvidence.version) === 'bigint' && inputs_0.statusEvidence.version >= 0n && inputs_0.statusEvidence.version <= 65535n && typeof(inputs_0.statusEvidence.mode) === 'bigint' && inputs_0.statusEvidence.mode >= 0n && inputs_0.statusEvidence.mode <= 255n && inputs_0.statusEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.authorityDigest.length === 32 && inputs_0.statusEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.subjectDigest.length === 32 && inputs_0.statusEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.stateAnchorDigest.length === 32 && inputs_0.statusEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.statusEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.statusEvidence.statementDigest.length === 32 && typeof(inputs_0.statusEvidence.createdAt) === 'bigint' && inputs_0.statusEvidence.createdAt >= 0n && inputs_0.statusEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.statusEvidence.expiresAt) === 'bigint' && inputs_0.statusEvidence.expiresAt >= 0n && inputs_0.statusEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.timeEvidence) === 'object' && inputs_0.timeEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.domain.length === 32 && typeof(inputs_0.timeEvidence.version) === 'bigint' && inputs_0.timeEvidence.version >= 0n && inputs_0.timeEvidence.version <= 65535n && typeof(inputs_0.timeEvidence.mode) === 'bigint' && inputs_0.timeEvidence.mode >= 0n && inputs_0.timeEvidence.mode <= 255n && inputs_0.timeEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.authorityDigest.length === 32 && inputs_0.timeEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.subjectDigest.length === 32 && inputs_0.timeEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.stateAnchorDigest.length === 32 && inputs_0.timeEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.timeEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.timeEvidence.statementDigest.length === 32 && typeof(inputs_0.timeEvidence.createdAt) === 'bigint' && inputs_0.timeEvidence.createdAt >= 0n && inputs_0.timeEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.timeEvidence.expiresAt) === 'bigint' && inputs_0.timeEvidence.expiresAt >= 0n && inputs_0.timeEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.artifactEvidence) === 'object' && inputs_0.artifactEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.domain.length === 32 && typeof(inputs_0.artifactEvidence.version) === 'bigint' && inputs_0.artifactEvidence.version >= 0n && inputs_0.artifactEvidence.version <= 65535n && typeof(inputs_0.artifactEvidence.mode) === 'bigint' && inputs_0.artifactEvidence.mode >= 0n && inputs_0.artifactEvidence.mode <= 255n && inputs_0.artifactEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.authorityDigest.length === 32 && inputs_0.artifactEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.subjectDigest.length === 32 && inputs_0.artifactEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.stateAnchorDigest.length === 32 && inputs_0.artifactEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.artifactEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.artifactEvidence.statementDigest.length === 32 && typeof(inputs_0.artifactEvidence.createdAt) === 'bigint' && inputs_0.artifactEvidence.createdAt >= 0n && inputs_0.artifactEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.artifactEvidence.expiresAt) === 'bigint' && inputs_0.artifactEvidence.expiresAt >= 0n && inputs_0.artifactEvidence.expiresAt <= 18446744073709551615n && typeof(inputs_0.connectorEvidence) === 'object' && inputs_0.connectorEvidence.domain.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.domain.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.domain.length === 32 && typeof(inputs_0.connectorEvidence.version) === 'bigint' && inputs_0.connectorEvidence.version >= 0n && inputs_0.connectorEvidence.version <= 65535n && typeof(inputs_0.connectorEvidence.mode) === 'bigint' && inputs_0.connectorEvidence.mode >= 0n && inputs_0.connectorEvidence.mode <= 255n && inputs_0.connectorEvidence.authorityDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.authorityDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.authorityDigest.length === 32 && inputs_0.connectorEvidence.subjectDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.subjectDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.subjectDigest.length === 32 && inputs_0.connectorEvidence.stateAnchorDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.stateAnchorDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.stateAnchorDigest.length === 32 && inputs_0.connectorEvidence.statementDigest.buffer instanceof ArrayBuffer && inputs_0.connectorEvidence.statementDigest.BYTES_PER_ELEMENT === 1 && inputs_0.connectorEvidence.statementDigest.length === 32 && typeof(inputs_0.connectorEvidence.createdAt) === 'bigint' && inputs_0.connectorEvidence.createdAt >= 0n && inputs_0.connectorEvidence.createdAt <= 18446744073709551615n && typeof(inputs_0.connectorEvidence.expiresAt) === 'bigint' && inputs_0.connectorEvidence.expiresAt >= 0n && inputs_0.connectorEvidence.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('syntheticUnavailableAuthorityVerificationV1',
                                 'argument 1',
                                 'verification-v1.compact line 446 char 1',
                                 'struct VerificationPublicInputsV1<transcript: struct VerificationTranscriptV1<domain: Bytes<32>, version: Uint<0..65536>, profile: Uint<0..256>, authority: Uint<0..256>, networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>, audienceDigest: Bytes<32>, originMode: Uint<0..256>, originDigest: Bytes<32>, connectorEvidenceDigest: Bytes<32>, requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<0..18446744073709551616>, credentialFamilyDigest: Bytes<32>, schemaDigest: Bytes<32>, credentialBindingMode: Uint<0..256>, credentialBindingDigest: Bytes<32>, disclosureDigest: Bytes<32>, predicateDigest: Bytes<32>, holderBindingDigest: Bytes<32>, policyDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, consentDigest: Bytes<32>, presentationBindingDigest: Bytes<32>, issuerDidDigest: Bytes<32>, issuerMethodDigest: Bytes<32>, issuerRelationship: Uint<0..256>, issuerEvidenceDigest: Bytes<32>, trustScopeDigest: Bytes<32>, trustEvidenceDigest: Bytes<32>, statusMode: Uint<0..256>, statusRegistryDigest: Bytes<32>, statusRoot: Bytes<32>, statusRegistryVersion: Uint<0..18446744073709551616>, statusFreshnessPolicyDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>, timeMode: Uint<0..256>, trustedTime: Uint<0..18446744073709551616>, timeEvidenceDigest: Bytes<32>, artifactManifestDigest: Bytes<32>, artifactEvidenceDigest: Bytes<32>, nullifierMode: Uint<0..256>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>, decisionNullifier: Bytes<32>>, issuerEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, trustEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, statusEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, timeEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, artifactEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>, connectorEvidence: struct EvidenceBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, authorityDigest: Bytes<32>, subjectDigest: Bytes<32>, stateAnchorDigest: Bytes<32>, statementDigest: Bytes<32>, createdAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>>',
                                 inputs_0)
    }
    if (!(expectedTranscriptDigest_0.buffer instanceof ArrayBuffer && expectedTranscriptDigest_0.BYTES_PER_ELEMENT === 1 && expectedTranscriptDigest_0.length === 32)) {
      __compactRuntime.typeError('syntheticUnavailableAuthorityVerificationV1',
                                 'argument 2',
                                 'verification-v1.compact line 446 char 1',
                                 'Bytes<32>',
                                 expectedTranscriptDigest_0)
    }
    return _dummyContract._syntheticUnavailableAuthorityVerificationV1_0(inputs_0,
                                                                         expectedTranscriptDigest_0);
  },
  universityDiplomaClaimPayloadRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaClaimPayloadRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    if (!(typeof(claims_0) === 'object' && claims_0.diplomaId.buffer instanceof ArrayBuffer && claims_0.diplomaId.BYTES_PER_ELEMENT === 1 && claims_0.diplomaId.length === 32 && claims_0.studentId.buffer instanceof ArrayBuffer && claims_0.studentId.BYTES_PER_ELEMENT === 1 && claims_0.studentId.length === 16 && claims_0.graduateName.buffer instanceof ArrayBuffer && claims_0.graduateName.BYTES_PER_ELEMENT === 1 && claims_0.graduateName.length === 32 && claims_0.universityName.buffer instanceof ArrayBuffer && claims_0.universityName.BYTES_PER_ELEMENT === 1 && claims_0.universityName.length === 32 && claims_0.facultyName.buffer instanceof ArrayBuffer && claims_0.facultyName.BYTES_PER_ELEMENT === 1 && claims_0.facultyName.length === 32 && claims_0.awardName.buffer instanceof ArrayBuffer && claims_0.awardName.BYTES_PER_ELEMENT === 1 && claims_0.awardName.length === 32 && claims_0.honorsCode.buffer instanceof ArrayBuffer && claims_0.honorsCode.BYTES_PER_ELEMENT === 1 && claims_0.honorsCode.length === 16 && typeof(claims_0.graduationYear) === 'bigint' && claims_0.graduationYear >= 0n && claims_0.graduationYear <= 65535n && typeof(claims_0.graduationMonth) === 'bigint' && claims_0.graduationMonth >= 0n && claims_0.graduationMonth <= 255n && typeof(claims_0.finalGrade) === 'bigint' && claims_0.finalGrade >= 0n && claims_0.finalGrade <= 255n && typeof(claims_0.creditsEarned) === 'bigint' && claims_0.creditsEarned >= 0n && claims_0.creditsEarned <= 65535n)) {
      __compactRuntime.typeError('universityDiplomaClaimPayloadRoot',
                                 'argument 1',
                                 'claims.compact line 18 char 1',
                                 'struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>',
                                 claims_0)
    }
    return _dummyContract._universityDiplomaClaimPayloadRoot_0(claims_0);
  },
  universityDiplomaClaimRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaClaimRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    if (!(typeof(claims_0) === 'object' && claims_0.diplomaId.buffer instanceof ArrayBuffer && claims_0.diplomaId.BYTES_PER_ELEMENT === 1 && claims_0.diplomaId.length === 32 && claims_0.studentId.buffer instanceof ArrayBuffer && claims_0.studentId.BYTES_PER_ELEMENT === 1 && claims_0.studentId.length === 16 && claims_0.graduateName.buffer instanceof ArrayBuffer && claims_0.graduateName.BYTES_PER_ELEMENT === 1 && claims_0.graduateName.length === 32 && claims_0.universityName.buffer instanceof ArrayBuffer && claims_0.universityName.BYTES_PER_ELEMENT === 1 && claims_0.universityName.length === 32 && claims_0.facultyName.buffer instanceof ArrayBuffer && claims_0.facultyName.BYTES_PER_ELEMENT === 1 && claims_0.facultyName.length === 32 && claims_0.awardName.buffer instanceof ArrayBuffer && claims_0.awardName.BYTES_PER_ELEMENT === 1 && claims_0.awardName.length === 32 && claims_0.honorsCode.buffer instanceof ArrayBuffer && claims_0.honorsCode.BYTES_PER_ELEMENT === 1 && claims_0.honorsCode.length === 16 && typeof(claims_0.graduationYear) === 'bigint' && claims_0.graduationYear >= 0n && claims_0.graduationYear <= 65535n && typeof(claims_0.graduationMonth) === 'bigint' && claims_0.graduationMonth >= 0n && claims_0.graduationMonth <= 255n && typeof(claims_0.finalGrade) === 'bigint' && claims_0.finalGrade >= 0n && claims_0.finalGrade <= 255n && typeof(claims_0.creditsEarned) === 'bigint' && claims_0.creditsEarned >= 0n && claims_0.creditsEarned <= 65535n)) {
      __compactRuntime.typeError('universityDiplomaClaimRoot',
                                 'argument 1',
                                 'claims.compact line 24 char 1',
                                 'struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>',
                                 claims_0)
    }
    return _dummyContract._universityDiplomaClaimRoot_0(claims_0);
  },
  universityDiplomaProductionPublicClaimsRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaProductionPublicClaimsRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const publicClaims_0 = args_0[0];
    if (!(typeof(publicClaims_0) === 'object' && publicClaims_0.universityName.buffer instanceof ArrayBuffer && publicClaims_0.universityName.BYTES_PER_ELEMENT === 1 && publicClaims_0.universityName.length === 32 && publicClaims_0.awardName.buffer instanceof ArrayBuffer && publicClaims_0.awardName.BYTES_PER_ELEMENT === 1 && publicClaims_0.awardName.length === 32 && typeof(publicClaims_0.graduationYear) === 'bigint' && publicClaims_0.graduationYear >= 0n && publicClaims_0.graduationYear <= 65535n)) {
      __compactRuntime.typeError('universityDiplomaProductionPublicClaimsRoot',
                                 'argument 1',
                                 'claims.compact line 54 char 1',
                                 'struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>',
                                 publicClaims_0)
    }
    return _dummyContract._universityDiplomaProductionPublicClaimsRoot_0(publicClaims_0);
  },
  universityDiplomaClaimCommitmentsRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaClaimCommitmentsRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const claimCommitments_0 = args_0[0];
    if (!(typeof(claimCommitments_0) === 'object' && claimCommitments_0.diplomaIdCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.diplomaIdCommitment.length === 32 && claimCommitments_0.studentIdCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.studentIdCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.studentIdCommitment.length === 32 && claimCommitments_0.graduateNameCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.graduateNameCommitment.length === 32 && claimCommitments_0.facultyNameCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.facultyNameCommitment.length === 32 && claimCommitments_0.honorsCodeCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.honorsCodeCommitment.length === 32 && claimCommitments_0.graduationMonthCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.graduationMonthCommitment.length === 32 && claimCommitments_0.finalGradeCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.finalGradeCommitment.length === 32 && claimCommitments_0.creditsEarnedCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.creditsEarnedCommitment.length === 32)) {
      __compactRuntime.typeError('universityDiplomaClaimCommitmentsRoot',
                                 'argument 1',
                                 'claims.compact line 63 char 1',
                                 'struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>',
                                 claimCommitments_0)
    }
    return _dummyContract._universityDiplomaClaimCommitmentsRoot_0(claimCommitments_0);
  },
  universityDiplomaProductionClaimRoot: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaProductionClaimRoot: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const publicClaims_0 = args_0[0];
    const claimCommitments_0 = args_0[1];
    if (!(typeof(publicClaims_0) === 'object' && publicClaims_0.universityName.buffer instanceof ArrayBuffer && publicClaims_0.universityName.BYTES_PER_ELEMENT === 1 && publicClaims_0.universityName.length === 32 && publicClaims_0.awardName.buffer instanceof ArrayBuffer && publicClaims_0.awardName.BYTES_PER_ELEMENT === 1 && publicClaims_0.awardName.length === 32 && typeof(publicClaims_0.graduationYear) === 'bigint' && publicClaims_0.graduationYear >= 0n && publicClaims_0.graduationYear <= 65535n)) {
      __compactRuntime.typeError('universityDiplomaProductionClaimRoot',
                                 'argument 1',
                                 'claims.compact line 72 char 1',
                                 'struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>',
                                 publicClaims_0)
    }
    if (!(typeof(claimCommitments_0) === 'object' && claimCommitments_0.diplomaIdCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.diplomaIdCommitment.length === 32 && claimCommitments_0.studentIdCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.studentIdCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.studentIdCommitment.length === 32 && claimCommitments_0.graduateNameCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.graduateNameCommitment.length === 32 && claimCommitments_0.facultyNameCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.facultyNameCommitment.length === 32 && claimCommitments_0.honorsCodeCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.honorsCodeCommitment.length === 32 && claimCommitments_0.graduationMonthCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.graduationMonthCommitment.length === 32 && claimCommitments_0.finalGradeCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.finalGradeCommitment.length === 32 && claimCommitments_0.creditsEarnedCommitment.buffer instanceof ArrayBuffer && claimCommitments_0.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && claimCommitments_0.creditsEarnedCommitment.length === 32)) {
      __compactRuntime.typeError('universityDiplomaProductionClaimRoot',
                                 'argument 2',
                                 'claims.compact line 72 char 1',
                                 'struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>',
                                 claimCommitments_0)
    }
    return _dummyContract._universityDiplomaProductionClaimRoot_0(publicClaims_0,
                                                                  claimCommitments_0);
  },
  universityDiplomaIdCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaIdCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const diplomaId_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(diplomaId_0.buffer instanceof ArrayBuffer && diplomaId_0.BYTES_PER_ELEMENT === 1 && diplomaId_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaIdCommitment',
                                 'argument 1',
                                 'claims.compact line 85 char 1',
                                 'Bytes<32>',
                                 diplomaId_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaIdCommitment',
                                 'argument 2',
                                 'claims.compact line 85 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaIdCommitment_0(diplomaId_0,
                                                           opening_0);
  },
  universityDiplomaStudentIdCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaStudentIdCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const studentId_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(studentId_0.buffer instanceof ArrayBuffer && studentId_0.BYTES_PER_ELEMENT === 1 && studentId_0.length === 16)) {
      __compactRuntime.typeError('universityDiplomaStudentIdCommitment',
                                 'argument 1',
                                 'claims.compact line 92 char 1',
                                 'Bytes<16>',
                                 studentId_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaStudentIdCommitment',
                                 'argument 2',
                                 'claims.compact line 92 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaStudentIdCommitment_0(studentId_0,
                                                                  opening_0);
  },
  universityDiplomaGraduateNameCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaGraduateNameCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const graduateName_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(graduateName_0.buffer instanceof ArrayBuffer && graduateName_0.BYTES_PER_ELEMENT === 1 && graduateName_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaGraduateNameCommitment',
                                 'argument 1',
                                 'claims.compact line 99 char 1',
                                 'Bytes<32>',
                                 graduateName_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaGraduateNameCommitment',
                                 'argument 2',
                                 'claims.compact line 99 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaGraduateNameCommitment_0(graduateName_0,
                                                                     opening_0);
  },
  universityDiplomaFacultyNameCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaFacultyNameCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const facultyName_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(facultyName_0.buffer instanceof ArrayBuffer && facultyName_0.BYTES_PER_ELEMENT === 1 && facultyName_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaFacultyNameCommitment',
                                 'argument 1',
                                 'claims.compact line 106 char 1',
                                 'Bytes<32>',
                                 facultyName_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaFacultyNameCommitment',
                                 'argument 2',
                                 'claims.compact line 106 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaFacultyNameCommitment_0(facultyName_0,
                                                                    opening_0);
  },
  universityDiplomaHonorsCodeCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaHonorsCodeCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const honorsCode_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(honorsCode_0.buffer instanceof ArrayBuffer && honorsCode_0.BYTES_PER_ELEMENT === 1 && honorsCode_0.length === 16)) {
      __compactRuntime.typeError('universityDiplomaHonorsCodeCommitment',
                                 'argument 1',
                                 'claims.compact line 113 char 1',
                                 'Bytes<16>',
                                 honorsCode_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaHonorsCodeCommitment',
                                 'argument 2',
                                 'claims.compact line 113 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaHonorsCodeCommitment_0(honorsCode_0,
                                                                   opening_0);
  },
  universityDiplomaGraduationMonthCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaGraduationMonthCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const graduationMonth_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(typeof(graduationMonth_0) === 'bigint' && graduationMonth_0 >= 0n && graduationMonth_0 <= 255n)) {
      __compactRuntime.typeError('universityDiplomaGraduationMonthCommitment',
                                 'argument 1',
                                 'claims.compact line 120 char 1',
                                 'Uint<0..256>',
                                 graduationMonth_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaGraduationMonthCommitment',
                                 'argument 2',
                                 'claims.compact line 120 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaGraduationMonthCommitment_0(graduationMonth_0,
                                                                        opening_0);
  },
  universityDiplomaFinalGradeCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaFinalGradeCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const finalGrade_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(typeof(finalGrade_0) === 'bigint' && finalGrade_0 >= 0n && finalGrade_0 <= 255n)) {
      __compactRuntime.typeError('universityDiplomaFinalGradeCommitment',
                                 'argument 1',
                                 'claims.compact line 130 char 1',
                                 'Uint<0..256>',
                                 finalGrade_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaFinalGradeCommitment',
                                 'argument 2',
                                 'claims.compact line 130 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaFinalGradeCommitment_0(finalGrade_0,
                                                                   opening_0);
  },
  universityDiplomaCreditsEarnedCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`universityDiplomaCreditsEarnedCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const creditsEarned_0 = args_0[0];
    const opening_0 = args_0[1];
    if (!(typeof(creditsEarned_0) === 'bigint' && creditsEarned_0 >= 0n && creditsEarned_0 <= 65535n)) {
      __compactRuntime.typeError('universityDiplomaCreditsEarnedCommitment',
                                 'argument 1',
                                 'claims.compact line 140 char 1',
                                 'Uint<0..65536>',
                                 creditsEarned_0)
    }
    if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
      __compactRuntime.typeError('universityDiplomaCreditsEarnedCommitment',
                                 'argument 2',
                                 'claims.compact line 140 char 1',
                                 'Bytes<32>',
                                 opening_0)
    }
    return _dummyContract._universityDiplomaCreditsEarnedCommitment_0(creditsEarned_0,
                                                                      opening_0);
  },
  universityDiplomaCredentialBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaCredentialBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.diplomaId.buffer instanceof ArrayBuffer && credential_0.claims.diplomaId.BYTES_PER_ELEMENT === 1 && credential_0.claims.diplomaId.length === 32 && credential_0.claims.studentId.buffer instanceof ArrayBuffer && credential_0.claims.studentId.BYTES_PER_ELEMENT === 1 && credential_0.claims.studentId.length === 16 && credential_0.claims.graduateName.buffer instanceof ArrayBuffer && credential_0.claims.graduateName.BYTES_PER_ELEMENT === 1 && credential_0.claims.graduateName.length === 32 && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.facultyName.buffer instanceof ArrayBuffer && credential_0.claims.facultyName.BYTES_PER_ELEMENT === 1 && credential_0.claims.facultyName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && credential_0.claims.honorsCode.buffer instanceof ArrayBuffer && credential_0.claims.honorsCode.BYTES_PER_ELEMENT === 1 && credential_0.claims.honorsCode.length === 16 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claims.graduationMonth) === 'bigint' && credential_0.claims.graduationMonth >= 0n && credential_0.claims.graduationMonth <= 255n && typeof(credential_0.claims.finalGrade) === 'bigint' && credential_0.claims.finalGrade >= 0n && credential_0.claims.finalGrade <= 255n && typeof(credential_0.claims.creditsEarned) === 'bigint' && credential_0.claims.creditsEarned >= 0n && credential_0.claims.creditsEarned <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('universityDiplomaCredentialBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 4 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    return _dummyContract._universityDiplomaCredentialBodyRoot_0(credential_0);
  },
  universityDiplomaProductionCredentialBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaProductionCredentialBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('universityDiplomaProductionCredentialBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 10 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    return _dummyContract._universityDiplomaProductionCredentialBodyRoot_0(credential_0);
  },
  universityDiplomaProductionPresentationBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaProductionPresentationBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const presentation_0 = args_0[0];
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && presentation_0.disclosed.diplomaIdOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaIdOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaIdOpening.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && presentation_0.disclosed.studentIdOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentIdOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentIdOpening.length === 32 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && presentation_0.disclosed.graduateNameOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateNameOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateNameOpening.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && presentation_0.disclosed.facultyNameOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyNameOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyNameOpening.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && presentation_0.disclosed.honorsCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCodeOpening.length === 32 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && presentation_0.disclosed.graduationMonthOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduationMonthOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduationMonthOpening.length === 32 && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && presentation_0.disclosed.finalGradeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.finalGradeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.finalGradeOpening.length === 32 && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n && presentation_0.disclosed.creditsEarnedOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.creditsEarnedOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.creditsEarnedOpening.length === 32)) {
      __compactRuntime.typeError('universityDiplomaProductionPresentationBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 16 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaProductionDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, diplomaIdOpening: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, studentIdOpening: Bytes<32>, revealGraduateName: Boolean, graduateName: Bytes<32>, graduateNameOpening: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, facultyNameOpening: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, honorsCodeOpening: Bytes<32>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, graduationMonthOpening: Bytes<32>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, finalGradeOpening: Bytes<32>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>, creditsEarnedOpening: Bytes<32>>>',
                                 presentation_0)
    }
    return _dummyContract._universityDiplomaProductionPresentationBodyRoot_0(presentation_0);
  },
  universityDiplomaPresentationBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaPresentationBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const presentation_0 = args_0[0];
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n)) {
      __compactRuntime.typeError('universityDiplomaPresentationBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 24 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, revealGraduateName: Boolean, graduateName: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>>>',
                                 presentation_0)
    }
    return _dummyContract._universityDiplomaPresentationBodyRoot_0(presentation_0);
  },
  universityDiplomaPresentationRequestBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaPresentationRequestBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('universityDiplomaPresentationRequestBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 30 char 1',
                                 'struct UniversityDiplomaPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._universityDiplomaPresentationRequestBodyRoot_0(request_0);
  },
  universityDiplomaProductionPresentationRequestBodyRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`universityDiplomaProductionPresentationRequestBodyRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('universityDiplomaProductionPresentationRequestBodyRoot',
                                 'argument 1',
                                 'helpers.compact line 36 char 1',
                                 'struct UniversityDiplomaProductionPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._universityDiplomaProductionPresentationRequestBodyRoot_0(request_0);
  },
  assertValidUniversityDiplomaSchemaRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaSchemaRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const schema_0 = args_0[0];
    if (!(typeof(schema_0) === 'object' && schema_0.packageId.buffer instanceof ArrayBuffer && schema_0.packageId.BYTES_PER_ELEMENT === 1 && schema_0.packageId.length === 32 && schema_0.schemaId.buffer instanceof ArrayBuffer && schema_0.schemaId.BYTES_PER_ELEMENT === 1 && schema_0.schemaId.length === 32 && typeof(schema_0.majorVersion) === 'bigint' && schema_0.majorVersion >= 0n && schema_0.majorVersion <= 65535n && typeof(schema_0.minorVersion) === 'bigint' && schema_0.minorVersion >= 0n && schema_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaSchemaRef',
                                 'argument 1',
                                 'helpers.compact line 45 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 schema_0)
    }
    return _dummyContract._assertValidUniversityDiplomaSchemaRef_0(schema_0);
  },
  assertValidUniversityDiplomaProductionSchemaRef: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaProductionSchemaRef: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const schema_0 = args_0[0];
    if (!(typeof(schema_0) === 'object' && schema_0.packageId.buffer instanceof ArrayBuffer && schema_0.packageId.BYTES_PER_ELEMENT === 1 && schema_0.packageId.length === 32 && schema_0.schemaId.buffer instanceof ArrayBuffer && schema_0.schemaId.BYTES_PER_ELEMENT === 1 && schema_0.schemaId.length === 32 && typeof(schema_0.majorVersion) === 'bigint' && schema_0.majorVersion >= 0n && schema_0.majorVersion <= 65535n && typeof(schema_0.minorVersion) === 'bigint' && schema_0.minorVersion >= 0n && schema_0.minorVersion <= 65535n)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionSchemaRef',
                                 'argument 1',
                                 'helpers.compact line 57 char 1',
                                 'struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>',
                                 schema_0)
    }
    return _dummyContract._assertValidUniversityDiplomaProductionSchemaRef_0(schema_0);
  },
  assertValidUniversityDiplomaPresentationRequest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaPresentationRequest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaPresentationRequest',
                                 'argument 1',
                                 'helpers.compact line 72 char 1',
                                 'struct UniversityDiplomaPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._assertValidUniversityDiplomaPresentationRequest_0(request_0);
  },
  assertValidUniversityDiplomaProductionPresentationRequest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaProductionPresentationRequest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionPresentationRequest',
                                 'argument 1',
                                 'helpers.compact line 94 char 1',
                                 'struct UniversityDiplomaProductionPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._assertValidUniversityDiplomaProductionPresentationRequest_0(request_0);
  },
  assertValidUniversityDiplomaClaims: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaClaims: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    if (!(typeof(claims_0) === 'object' && claims_0.diplomaId.buffer instanceof ArrayBuffer && claims_0.diplomaId.BYTES_PER_ELEMENT === 1 && claims_0.diplomaId.length === 32 && claims_0.studentId.buffer instanceof ArrayBuffer && claims_0.studentId.BYTES_PER_ELEMENT === 1 && claims_0.studentId.length === 16 && claims_0.graduateName.buffer instanceof ArrayBuffer && claims_0.graduateName.BYTES_PER_ELEMENT === 1 && claims_0.graduateName.length === 32 && claims_0.universityName.buffer instanceof ArrayBuffer && claims_0.universityName.BYTES_PER_ELEMENT === 1 && claims_0.universityName.length === 32 && claims_0.facultyName.buffer instanceof ArrayBuffer && claims_0.facultyName.BYTES_PER_ELEMENT === 1 && claims_0.facultyName.length === 32 && claims_0.awardName.buffer instanceof ArrayBuffer && claims_0.awardName.BYTES_PER_ELEMENT === 1 && claims_0.awardName.length === 32 && claims_0.honorsCode.buffer instanceof ArrayBuffer && claims_0.honorsCode.BYTES_PER_ELEMENT === 1 && claims_0.honorsCode.length === 16 && typeof(claims_0.graduationYear) === 'bigint' && claims_0.graduationYear >= 0n && claims_0.graduationYear <= 65535n && typeof(claims_0.graduationMonth) === 'bigint' && claims_0.graduationMonth >= 0n && claims_0.graduationMonth <= 255n && typeof(claims_0.finalGrade) === 'bigint' && claims_0.finalGrade >= 0n && claims_0.finalGrade <= 255n && typeof(claims_0.creditsEarned) === 'bigint' && claims_0.creditsEarned >= 0n && claims_0.creditsEarned <= 65535n)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaClaims',
                                 'argument 1',
                                 'helpers.compact line 119 char 1',
                                 'struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>',
                                 claims_0)
    }
    return _dummyContract._assertValidUniversityDiplomaClaims_0(claims_0);
  },
  assertValidUniversityDiplomaProductionPublicClaims: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaProductionPublicClaims: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const publicClaims_0 = args_0[0];
    if (!(typeof(publicClaims_0) === 'object' && publicClaims_0.universityName.buffer instanceof ArrayBuffer && publicClaims_0.universityName.BYTES_PER_ELEMENT === 1 && publicClaims_0.universityName.length === 32 && publicClaims_0.awardName.buffer instanceof ArrayBuffer && publicClaims_0.awardName.BYTES_PER_ELEMENT === 1 && publicClaims_0.awardName.length === 32 && typeof(publicClaims_0.graduationYear) === 'bigint' && publicClaims_0.graduationYear >= 0n && publicClaims_0.graduationYear <= 65535n)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionPublicClaims',
                                 'argument 1',
                                 'helpers.compact line 128 char 1',
                                 'struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>',
                                 publicClaims_0)
    }
    return _dummyContract._assertValidUniversityDiplomaProductionPublicClaims_0(publicClaims_0);
  },
  assertValidUniversityDiplomaCredential: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaCredential: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.diplomaId.buffer instanceof ArrayBuffer && credential_0.claims.diplomaId.BYTES_PER_ELEMENT === 1 && credential_0.claims.diplomaId.length === 32 && credential_0.claims.studentId.buffer instanceof ArrayBuffer && credential_0.claims.studentId.BYTES_PER_ELEMENT === 1 && credential_0.claims.studentId.length === 16 && credential_0.claims.graduateName.buffer instanceof ArrayBuffer && credential_0.claims.graduateName.BYTES_PER_ELEMENT === 1 && credential_0.claims.graduateName.length === 32 && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.facultyName.buffer instanceof ArrayBuffer && credential_0.claims.facultyName.BYTES_PER_ELEMENT === 1 && credential_0.claims.facultyName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && credential_0.claims.honorsCode.buffer instanceof ArrayBuffer && credential_0.claims.honorsCode.BYTES_PER_ELEMENT === 1 && credential_0.claims.honorsCode.length === 16 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claims.graduationMonth) === 'bigint' && credential_0.claims.graduationMonth >= 0n && credential_0.claims.graduationMonth <= 255n && typeof(credential_0.claims.finalGrade) === 'bigint' && credential_0.claims.finalGrade >= 0n && credential_0.claims.finalGrade <= 255n && typeof(credential_0.claims.creditsEarned) === 'bigint' && credential_0.claims.creditsEarned >= 0n && credential_0.claims.creditsEarned <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaCredential',
                                 'argument 1',
                                 'helpers.compact line 151 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaCredential',
                                 'argument 2',
                                 'helpers.compact line 151 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidUniversityDiplomaCredential_0(credential_0,
                                                                    proof_0);
  },
  assertValidUniversityDiplomaProductionCredential: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaProductionCredential: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionCredential',
                                 'argument 1',
                                 'helpers.compact line 166 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.signerVerificationMethodRef) === 'object' && typeof(proof_0.signerVerificationMethodRef.didContractAddress) === 'object' && proof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && proof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && proof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && proof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(proof_0.createdAt) === 'bigint' && proof_0.createdAt >= 0n && proof_0.createdAt <= 18446744073709551615n && proof_0.challengeHash.buffer instanceof ArrayBuffer && proof_0.challengeHash.BYTES_PER_ELEMENT === 1 && proof_0.challengeHash.length === 32 && true && typeof(proof_0.signature) === 'object' && true && typeof(proof_0.signature.s) === 'bigint' && proof_0.signature.s >= 0 && proof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionCredential',
                                 'argument 2',
                                 'helpers.compact line 166 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 proof_0)
    }
    return _dummyContract._assertValidUniversityDiplomaProductionCredential_0(credential_0,
                                                                              proof_0);
  },
  assertUniversityDiplomaProductionDisclosuresMatchCredential: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertUniversityDiplomaProductionDisclosuresMatchCredential: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const disclosed_0 = args_0[1];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionDisclosuresMatchCredential',
                                 'argument 1',
                                 'helpers.compact line 184 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(disclosed_0) === 'object' && typeof(disclosed_0.revealDiplomaId) === 'boolean' && disclosed_0.diplomaId.buffer instanceof ArrayBuffer && disclosed_0.diplomaId.BYTES_PER_ELEMENT === 1 && disclosed_0.diplomaId.length === 32 && disclosed_0.diplomaIdOpening.buffer instanceof ArrayBuffer && disclosed_0.diplomaIdOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.diplomaIdOpening.length === 32 && typeof(disclosed_0.revealStudentId) === 'boolean' && disclosed_0.studentId.buffer instanceof ArrayBuffer && disclosed_0.studentId.BYTES_PER_ELEMENT === 1 && disclosed_0.studentId.length === 16 && disclosed_0.studentIdOpening.buffer instanceof ArrayBuffer && disclosed_0.studentIdOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.studentIdOpening.length === 32 && typeof(disclosed_0.revealGraduateName) === 'boolean' && disclosed_0.graduateName.buffer instanceof ArrayBuffer && disclosed_0.graduateName.BYTES_PER_ELEMENT === 1 && disclosed_0.graduateName.length === 32 && disclosed_0.graduateNameOpening.buffer instanceof ArrayBuffer && disclosed_0.graduateNameOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.graduateNameOpening.length === 32 && typeof(disclosed_0.revealUniversityName) === 'boolean' && disclosed_0.universityName.buffer instanceof ArrayBuffer && disclosed_0.universityName.BYTES_PER_ELEMENT === 1 && disclosed_0.universityName.length === 32 && typeof(disclosed_0.revealFacultyName) === 'boolean' && disclosed_0.facultyName.buffer instanceof ArrayBuffer && disclosed_0.facultyName.BYTES_PER_ELEMENT === 1 && disclosed_0.facultyName.length === 32 && disclosed_0.facultyNameOpening.buffer instanceof ArrayBuffer && disclosed_0.facultyNameOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.facultyNameOpening.length === 32 && typeof(disclosed_0.revealAwardName) === 'boolean' && disclosed_0.awardName.buffer instanceof ArrayBuffer && disclosed_0.awardName.BYTES_PER_ELEMENT === 1 && disclosed_0.awardName.length === 32 && typeof(disclosed_0.revealHonorsCode) === 'boolean' && disclosed_0.honorsCode.buffer instanceof ArrayBuffer && disclosed_0.honorsCode.BYTES_PER_ELEMENT === 1 && disclosed_0.honorsCode.length === 16 && disclosed_0.honorsCodeOpening.buffer instanceof ArrayBuffer && disclosed_0.honorsCodeOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.honorsCodeOpening.length === 32 && typeof(disclosed_0.revealGraduationYear) === 'boolean' && typeof(disclosed_0.graduationYear) === 'bigint' && disclosed_0.graduationYear >= 0n && disclosed_0.graduationYear <= 65535n && typeof(disclosed_0.revealGraduationMonth) === 'boolean' && typeof(disclosed_0.graduationMonth) === 'bigint' && disclosed_0.graduationMonth >= 0n && disclosed_0.graduationMonth <= 255n && disclosed_0.graduationMonthOpening.buffer instanceof ArrayBuffer && disclosed_0.graduationMonthOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.graduationMonthOpening.length === 32 && typeof(disclosed_0.revealFinalGrade) === 'boolean' && typeof(disclosed_0.finalGrade) === 'bigint' && disclosed_0.finalGrade >= 0n && disclosed_0.finalGrade <= 255n && disclosed_0.finalGradeOpening.buffer instanceof ArrayBuffer && disclosed_0.finalGradeOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.finalGradeOpening.length === 32 && typeof(disclosed_0.revealCreditsEarned) === 'boolean' && typeof(disclosed_0.creditsEarned) === 'bigint' && disclosed_0.creditsEarned >= 0n && disclosed_0.creditsEarned <= 65535n && disclosed_0.creditsEarnedOpening.buffer instanceof ArrayBuffer && disclosed_0.creditsEarnedOpening.BYTES_PER_ELEMENT === 1 && disclosed_0.creditsEarnedOpening.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionDisclosuresMatchCredential',
                                 'argument 2',
                                 'helpers.compact line 184 char 1',
                                 'struct UniversityDiplomaProductionDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, diplomaIdOpening: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, studentIdOpening: Bytes<32>, revealGraduateName: Boolean, graduateName: Bytes<32>, graduateNameOpening: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, facultyNameOpening: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, honorsCodeOpening: Bytes<32>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, graduationMonthOpening: Bytes<32>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, finalGradeOpening: Bytes<32>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>, creditsEarnedOpening: Bytes<32>>',
                                 disclosed_0)
    }
    return _dummyContract._assertUniversityDiplomaProductionDisclosuresMatchCredential_0(credential_0,
                                                                                         disclosed_0);
  },
  assertUniversityDiplomaProductionFinalGradeAtLeast: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`assertUniversityDiplomaProductionFinalGradeAtLeast: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const predicateWitness_0 = args_0[1];
    const minimumFinalGrade_0 = args_0[2];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionFinalGradeAtLeast',
                                 'argument 1',
                                 'helpers.compact line 311 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(predicateWitness_0) === 'object' && typeof(predicateWitness_0.finalGrade) === 'bigint' && predicateWitness_0.finalGrade >= 0n && predicateWitness_0.finalGrade <= 255n && predicateWitness_0.finalGradeOpening.buffer instanceof ArrayBuffer && predicateWitness_0.finalGradeOpening.BYTES_PER_ELEMENT === 1 && predicateWitness_0.finalGradeOpening.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionFinalGradeAtLeast',
                                 'argument 2',
                                 'helpers.compact line 311 char 1',
                                 'struct UniversityDiplomaProductionFinalGradePredicateWitness<finalGrade: Uint<0..256>, finalGradeOpening: Bytes<32>>',
                                 predicateWitness_0)
    }
    if (!(typeof(minimumFinalGrade_0) === 'bigint' && minimumFinalGrade_0 >= 0n && minimumFinalGrade_0 <= 255n)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionFinalGradeAtLeast',
                                 'argument 3',
                                 'helpers.compact line 311 char 1',
                                 'Uint<0..256>',
                                 minimumFinalGrade_0)
    }
    return _dummyContract._assertUniversityDiplomaProductionFinalGradeAtLeast_0(credential_0,
                                                                                predicateWitness_0,
                                                                                minimumFinalGrade_0);
  },
  assertUniversityDiplomaProductionCreditsEarnedAtLeast: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`assertUniversityDiplomaProductionCreditsEarnedAtLeast: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const predicateWitness_0 = args_0[1];
    const minimumCreditsEarned_0 = args_0[2];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionCreditsEarnedAtLeast',
                                 'argument 1',
                                 'helpers.compact line 345 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(predicateWitness_0) === 'object' && typeof(predicateWitness_0.creditsEarned) === 'bigint' && predicateWitness_0.creditsEarned >= 0n && predicateWitness_0.creditsEarned <= 65535n && predicateWitness_0.creditsEarnedOpening.buffer instanceof ArrayBuffer && predicateWitness_0.creditsEarnedOpening.BYTES_PER_ELEMENT === 1 && predicateWitness_0.creditsEarnedOpening.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionCreditsEarnedAtLeast',
                                 'argument 2',
                                 'helpers.compact line 345 char 1',
                                 'struct UniversityDiplomaProductionCreditsEarnedPredicateWitness<creditsEarned: Uint<0..65536>, creditsEarnedOpening: Bytes<32>>',
                                 predicateWitness_0)
    }
    if (!(typeof(minimumCreditsEarned_0) === 'bigint' && minimumCreditsEarned_0 >= 0n && minimumCreditsEarned_0 <= 65535n)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionCreditsEarnedAtLeast',
                                 'argument 3',
                                 'helpers.compact line 345 char 1',
                                 'Uint<0..65536>',
                                 minimumCreditsEarned_0)
    }
    return _dummyContract._assertUniversityDiplomaProductionCreditsEarnedAtLeast_0(credential_0,
                                                                                   predicateWitness_0,
                                                                                   minimumCreditsEarned_0);
  },
  assertValidUniversityDiplomaProductionPresentation: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaProductionPresentation: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const presentation_0 = args_0[2];
    const presentationProof_0 = args_0[3];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionPresentation',
                                 'argument 1',
                                 'helpers.compact line 380 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionPresentation',
                                 'argument 2',
                                 'helpers.compact line 380 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && presentation_0.disclosed.diplomaIdOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaIdOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaIdOpening.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && presentation_0.disclosed.studentIdOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentIdOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentIdOpening.length === 32 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && presentation_0.disclosed.graduateNameOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateNameOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateNameOpening.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && presentation_0.disclosed.facultyNameOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyNameOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyNameOpening.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && presentation_0.disclosed.honorsCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCodeOpening.length === 32 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && presentation_0.disclosed.graduationMonthOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduationMonthOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduationMonthOpening.length === 32 && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && presentation_0.disclosed.finalGradeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.finalGradeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.finalGradeOpening.length === 32 && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n && presentation_0.disclosed.creditsEarnedOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.creditsEarnedOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.creditsEarnedOpening.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionPresentation',
                                 'argument 3',
                                 'helpers.compact line 380 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaProductionDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, diplomaIdOpening: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, studentIdOpening: Bytes<32>, revealGraduateName: Boolean, graduateName: Bytes<32>, graduateNameOpening: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, facultyNameOpening: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, honorsCodeOpening: Bytes<32>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, graduationMonthOpening: Bytes<32>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, finalGradeOpening: Bytes<32>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>, creditsEarnedOpening: Bytes<32>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaProductionPresentation',
                                 'argument 4',
                                 'helpers.compact line 380 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertValidUniversityDiplomaProductionPresentation_0(credential_0,
                                                                                credentialProof_0,
                                                                                presentation_0,
                                                                                presentationProof_0);
  },
  assertValidUniversityDiplomaPresentation: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`assertValidUniversityDiplomaPresentation: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const presentation_0 = args_0[2];
    const presentationProof_0 = args_0[3];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.diplomaId.buffer instanceof ArrayBuffer && credential_0.claims.diplomaId.BYTES_PER_ELEMENT === 1 && credential_0.claims.diplomaId.length === 32 && credential_0.claims.studentId.buffer instanceof ArrayBuffer && credential_0.claims.studentId.BYTES_PER_ELEMENT === 1 && credential_0.claims.studentId.length === 16 && credential_0.claims.graduateName.buffer instanceof ArrayBuffer && credential_0.claims.graduateName.BYTES_PER_ELEMENT === 1 && credential_0.claims.graduateName.length === 32 && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.facultyName.buffer instanceof ArrayBuffer && credential_0.claims.facultyName.BYTES_PER_ELEMENT === 1 && credential_0.claims.facultyName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && credential_0.claims.honorsCode.buffer instanceof ArrayBuffer && credential_0.claims.honorsCode.BYTES_PER_ELEMENT === 1 && credential_0.claims.honorsCode.length === 16 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claims.graduationMonth) === 'bigint' && credential_0.claims.graduationMonth >= 0n && credential_0.claims.graduationMonth <= 255n && typeof(credential_0.claims.finalGrade) === 'bigint' && credential_0.claims.finalGrade >= 0n && credential_0.claims.finalGrade <= 255n && typeof(credential_0.claims.creditsEarned) === 'bigint' && credential_0.claims.creditsEarned >= 0n && credential_0.claims.creditsEarned <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaPresentation',
                                 'argument 1',
                                 'helpers.compact line 414 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaPresentation',
                                 'argument 2',
                                 'helpers.compact line 414 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaPresentation',
                                 'argument 3',
                                 'helpers.compact line 414 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, revealGraduateName: Boolean, graduateName: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertValidUniversityDiplomaPresentation',
                                 'argument 4',
                                 'helpers.compact line 414 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertValidUniversityDiplomaPresentation_0(credential_0,
                                                                      credentialProof_0,
                                                                      presentation_0,
                                                                      presentationProof_0);
  },
  assertUniversityDiplomaPresentationSatisfiesRequest: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`assertUniversityDiplomaPresentationSatisfiesRequest: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const request_0 = args_0[2];
    const presentation_0 = args_0[3];
    const presentationProof_0 = args_0[4];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.diplomaId.buffer instanceof ArrayBuffer && credential_0.claims.diplomaId.BYTES_PER_ELEMENT === 1 && credential_0.claims.diplomaId.length === 32 && credential_0.claims.studentId.buffer instanceof ArrayBuffer && credential_0.claims.studentId.BYTES_PER_ELEMENT === 1 && credential_0.claims.studentId.length === 16 && credential_0.claims.graduateName.buffer instanceof ArrayBuffer && credential_0.claims.graduateName.BYTES_PER_ELEMENT === 1 && credential_0.claims.graduateName.length === 32 && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.facultyName.buffer instanceof ArrayBuffer && credential_0.claims.facultyName.BYTES_PER_ELEMENT === 1 && credential_0.claims.facultyName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && credential_0.claims.honorsCode.buffer instanceof ArrayBuffer && credential_0.claims.honorsCode.BYTES_PER_ELEMENT === 1 && credential_0.claims.honorsCode.length === 16 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claims.graduationMonth) === 'bigint' && credential_0.claims.graduationMonth >= 0n && credential_0.claims.graduationMonth <= 255n && typeof(credential_0.claims.finalGrade) === 'bigint' && credential_0.claims.finalGrade >= 0n && credential_0.claims.finalGrade <= 255n && typeof(credential_0.claims.creditsEarned) === 'bigint' && credential_0.claims.creditsEarned >= 0n && credential_0.claims.creditsEarned <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaPresentationSatisfiesRequest',
                                 'argument 1',
                                 'helpers.compact line 516 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaClaims<diplomaId: Bytes<32>, studentId: Bytes<16>, graduateName: Bytes<32>, universityName: Bytes<32>, facultyName: Bytes<32>, awardName: Bytes<32>, honorsCode: Bytes<16>, graduationYear: Uint<0..65536>, graduationMonth: Uint<0..256>, finalGrade: Uint<0..256>, creditsEarned: Uint<0..65536>>, claimCommitments: struct NoClaimCommitments<>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertUniversityDiplomaPresentationSatisfiesRequest',
                                 'argument 2',
                                 'helpers.compact line 516 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaPresentationSatisfiesRequest',
                                 'argument 3',
                                 'helpers.compact line 516 char 1',
                                 'struct UniversityDiplomaPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n)) {
      __compactRuntime.typeError('assertUniversityDiplomaPresentationSatisfiesRequest',
                                 'argument 4',
                                 'helpers.compact line 516 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, revealGraduateName: Boolean, graduateName: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertUniversityDiplomaPresentationSatisfiesRequest',
                                 'argument 5',
                                 'helpers.compact line 516 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertUniversityDiplomaPresentationSatisfiesRequest_0(credential_0,
                                                                                 credentialProof_0,
                                                                                 request_0,
                                                                                 presentation_0,
                                                                                 presentationProof_0);
  },
  assertUniversityDiplomaProductionPresentationSatisfiesRequest: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`assertUniversityDiplomaProductionPresentationSatisfiesRequest: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    const credentialProof_0 = args_0[1];
    const request_0 = args_0[2];
    const presentation_0 = args_0[3];
    const presentationProof_0 = args_0[4];
    if (!(typeof(credential_0) === 'object' && typeof(credential_0.version) === 'bigint' && credential_0.version >= 0n && credential_0.version <= 65535n && typeof(credential_0.schema) === 'object' && credential_0.schema.packageId.buffer instanceof ArrayBuffer && credential_0.schema.packageId.BYTES_PER_ELEMENT === 1 && credential_0.schema.packageId.length === 32 && credential_0.schema.schemaId.buffer instanceof ArrayBuffer && credential_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schema.schemaId.length === 32 && typeof(credential_0.schema.majorVersion) === 'bigint' && credential_0.schema.majorVersion >= 0n && credential_0.schema.majorVersion <= 65535n && typeof(credential_0.schema.minorVersion) === 'bigint' && credential_0.schema.minorVersion >= 0n && credential_0.schema.minorVersion <= 65535n && typeof(credential_0.issuerVerificationMethodRef) === 'object' && typeof(credential_0.issuerVerificationMethodRef.didContractAddress) === 'object' && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(credential_0.holderBinding) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(credential_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && credential_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credential_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credential_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(credential_0.statusBinding) === 'object' && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.hasExpiration) === 'boolean' && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && typeof(credential_0.claims) === 'object' && credential_0.claims.universityName.buffer instanceof ArrayBuffer && credential_0.claims.universityName.BYTES_PER_ELEMENT === 1 && credential_0.claims.universityName.length === 32 && credential_0.claims.awardName.buffer instanceof ArrayBuffer && credential_0.claims.awardName.BYTES_PER_ELEMENT === 1 && credential_0.claims.awardName.length === 32 && typeof(credential_0.claims.graduationYear) === 'bigint' && credential_0.claims.graduationYear >= 0n && credential_0.claims.graduationYear <= 65535n && typeof(credential_0.claimCommitments) === 'object' && credential_0.claimCommitments.diplomaIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.diplomaIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.diplomaIdCommitment.length === 32 && credential_0.claimCommitments.studentIdCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.studentIdCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.studentIdCommitment.length === 32 && credential_0.claimCommitments.graduateNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduateNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduateNameCommitment.length === 32 && credential_0.claimCommitments.facultyNameCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.facultyNameCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.facultyNameCommitment.length === 32 && credential_0.claimCommitments.honorsCodeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.honorsCodeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.honorsCodeCommitment.length === 32 && credential_0.claimCommitments.graduationMonthCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.graduationMonthCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.graduationMonthCommitment.length === 32 && credential_0.claimCommitments.finalGradeCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.finalGradeCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.finalGradeCommitment.length === 32 && credential_0.claimCommitments.creditsEarnedCommitment.buffer instanceof ArrayBuffer && credential_0.claimCommitments.creditsEarnedCommitment.BYTES_PER_ELEMENT === 1 && credential_0.claimCommitments.creditsEarnedCommitment.length === 32 && credential_0.claimRoot.buffer instanceof ArrayBuffer && credential_0.claimRoot.BYTES_PER_ELEMENT === 1 && credential_0.claimRoot.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionPresentationSatisfiesRequest',
                                 'argument 1',
                                 'helpers.compact line 625 char 1',
                                 'struct Credential<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, statusBinding: struct NoStatusBinding<>, issuedAt: Uint<0..18446744073709551616>, hasExpiration: Boolean, expiresAt: Uint<0..18446744073709551616>, claims: struct UniversityDiplomaProductionPublicClaims<universityName: Bytes<32>, awardName: Bytes<32>, graduationYear: Uint<0..65536>>, claimCommitments: struct UniversityDiplomaClaimCommitments<diplomaIdCommitment: Bytes<32>, studentIdCommitment: Bytes<32>, graduateNameCommitment: Bytes<32>, facultyNameCommitment: Bytes<32>, honorsCodeCommitment: Bytes<32>, graduationMonthCommitment: Bytes<32>, finalGradeCommitment: Bytes<32>, creditsEarnedCommitment: Bytes<32>>, claimRoot: Bytes<32>>',
                                 credential_0)
    }
    if (!(typeof(credentialProof_0) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef) === 'object' && typeof(credentialProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && credentialProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && credentialProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && credentialProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(credentialProof_0.createdAt) === 'bigint' && credentialProof_0.createdAt >= 0n && credentialProof_0.createdAt <= 18446744073709551615n && credentialProof_0.challengeHash.buffer instanceof ArrayBuffer && credentialProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && credentialProof_0.challengeHash.length === 32 && true && typeof(credentialProof_0.signature) === 'object' && true && typeof(credentialProof_0.signature.s) === 'bigint' && credentialProof_0.signature.s >= 0 && credentialProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionPresentationSatisfiesRequest',
                                 'argument 2',
                                 'helpers.compact line 625 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 credentialProof_0)
    }
    if (!(typeof(request_0) === 'object' && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && typeof(request_0.schema) === 'object' && request_0.schema.packageId.buffer instanceof ArrayBuffer && request_0.schema.packageId.BYTES_PER_ELEMENT === 1 && request_0.schema.packageId.length === 32 && request_0.schema.schemaId.buffer instanceof ArrayBuffer && request_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && request_0.schema.schemaId.length === 32 && typeof(request_0.schema.majorVersion) === 'bigint' && request_0.schema.majorVersion >= 0n && request_0.schema.majorVersion <= 65535n && typeof(request_0.schema.minorVersion) === 'bigint' && request_0.schema.minorVersion >= 0n && request_0.schema.minorVersion <= 65535n && typeof(request_0.issuerVerificationMethodRef) === 'object' && typeof(request_0.issuerVerificationMethodRef.didContractAddress) === 'object' && request_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && request_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && request_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && request_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(request_0.requireDiplomaIdDisclosure) === 'boolean' && typeof(request_0.requireStudentIdDisclosure) === 'boolean' && typeof(request_0.requireGraduateNameDisclosure) === 'boolean' && typeof(request_0.requireUniversityNameDisclosure) === 'boolean' && typeof(request_0.requireFacultyNameDisclosure) === 'boolean' && typeof(request_0.requireAwardNameDisclosure) === 'boolean' && typeof(request_0.requireHonorsCodeDisclosure) === 'boolean' && typeof(request_0.requireGraduationYearDisclosure) === 'boolean' && typeof(request_0.requireGraduationMonthDisclosure) === 'boolean' && typeof(request_0.requireFinalGradeDisclosure) === 'boolean' && typeof(request_0.requireCreditsEarnedDisclosure) === 'boolean' && typeof(request_0.enforceMinimumFinalGrade) === 'boolean' && typeof(request_0.minimumFinalGrade) === 'bigint' && request_0.minimumFinalGrade >= 0n && request_0.minimumFinalGrade <= 255n && request_0.verifierChallengeHash.buffer instanceof ArrayBuffer && request_0.verifierChallengeHash.BYTES_PER_ELEMENT === 1 && request_0.verifierChallengeHash.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionPresentationSatisfiesRequest',
                                 'argument 3',
                                 'helpers.compact line 625 char 1',
                                 'struct UniversityDiplomaProductionPresentationRequest<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, requireDiplomaIdDisclosure: Boolean, requireStudentIdDisclosure: Boolean, requireGraduateNameDisclosure: Boolean, requireUniversityNameDisclosure: Boolean, requireFacultyNameDisclosure: Boolean, requireAwardNameDisclosure: Boolean, requireHonorsCodeDisclosure: Boolean, requireGraduationYearDisclosure: Boolean, requireGraduationMonthDisclosure: Boolean, requireFinalGradeDisclosure: Boolean, requireCreditsEarnedDisclosure: Boolean, enforceMinimumFinalGrade: Boolean, minimumFinalGrade: Uint<0..256>, verifierChallengeHash: Bytes<32>>',
                                 request_0)
    }
    if (!(typeof(presentation_0) === 'object' && typeof(presentation_0.version) === 'bigint' && presentation_0.version >= 0n && presentation_0.version <= 65535n && typeof(presentation_0.schema) === 'object' && presentation_0.schema.packageId.buffer instanceof ArrayBuffer && presentation_0.schema.packageId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.packageId.length === 32 && presentation_0.schema.schemaId.buffer instanceof ArrayBuffer && presentation_0.schema.schemaId.BYTES_PER_ELEMENT === 1 && presentation_0.schema.schemaId.length === 32 && typeof(presentation_0.schema.majorVersion) === 'bigint' && presentation_0.schema.majorVersion >= 0n && presentation_0.schema.majorVersion <= 65535n && typeof(presentation_0.schema.minorVersion) === 'bigint' && presentation_0.schema.minorVersion >= 0n && presentation_0.schema.minorVersion <= 65535n && presentation_0.credentialClaimRoot.buffer instanceof ArrayBuffer && presentation_0.credentialClaimRoot.BYTES_PER_ELEMENT === 1 && presentation_0.credentialClaimRoot.length === 32 && typeof(presentation_0.issuerVerificationMethodRef) === 'object' && typeof(presentation_0.issuerVerificationMethodRef.didContractAddress) === 'object' && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.issuerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.issuerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.issuerVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.holderBinding) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef) === 'object' && typeof(presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress) === 'object' && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.didContractAddress.bytes.length === 32 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentation_0.holderBinding.holderVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentation_0.holderBinding.holderVerificationMethodRef.methodId.length === 32 && typeof(presentation_0.disclosed) === 'object' && typeof(presentation_0.disclosed.revealDiplomaId) === 'boolean' && presentation_0.disclosed.diplomaId.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaId.length === 32 && presentation_0.disclosed.diplomaIdOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.diplomaIdOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.diplomaIdOpening.length === 32 && typeof(presentation_0.disclosed.revealStudentId) === 'boolean' && presentation_0.disclosed.studentId.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentId.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentId.length === 16 && presentation_0.disclosed.studentIdOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.studentIdOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.studentIdOpening.length === 32 && typeof(presentation_0.disclosed.revealGraduateName) === 'boolean' && presentation_0.disclosed.graduateName.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateName.length === 32 && presentation_0.disclosed.graduateNameOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduateNameOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduateNameOpening.length === 32 && typeof(presentation_0.disclosed.revealUniversityName) === 'boolean' && presentation_0.disclosed.universityName.buffer instanceof ArrayBuffer && presentation_0.disclosed.universityName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.universityName.length === 32 && typeof(presentation_0.disclosed.revealFacultyName) === 'boolean' && presentation_0.disclosed.facultyName.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyName.length === 32 && presentation_0.disclosed.facultyNameOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.facultyNameOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.facultyNameOpening.length === 32 && typeof(presentation_0.disclosed.revealAwardName) === 'boolean' && presentation_0.disclosed.awardName.buffer instanceof ArrayBuffer && presentation_0.disclosed.awardName.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.awardName.length === 32 && typeof(presentation_0.disclosed.revealHonorsCode) === 'boolean' && presentation_0.disclosed.honorsCode.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCode.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCode.length === 16 && presentation_0.disclosed.honorsCodeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.honorsCodeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.honorsCodeOpening.length === 32 && typeof(presentation_0.disclosed.revealGraduationYear) === 'boolean' && typeof(presentation_0.disclosed.graduationYear) === 'bigint' && presentation_0.disclosed.graduationYear >= 0n && presentation_0.disclosed.graduationYear <= 65535n && typeof(presentation_0.disclosed.revealGraduationMonth) === 'boolean' && typeof(presentation_0.disclosed.graduationMonth) === 'bigint' && presentation_0.disclosed.graduationMonth >= 0n && presentation_0.disclosed.graduationMonth <= 255n && presentation_0.disclosed.graduationMonthOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.graduationMonthOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.graduationMonthOpening.length === 32 && typeof(presentation_0.disclosed.revealFinalGrade) === 'boolean' && typeof(presentation_0.disclosed.finalGrade) === 'bigint' && presentation_0.disclosed.finalGrade >= 0n && presentation_0.disclosed.finalGrade <= 255n && presentation_0.disclosed.finalGradeOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.finalGradeOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.finalGradeOpening.length === 32 && typeof(presentation_0.disclosed.revealCreditsEarned) === 'boolean' && typeof(presentation_0.disclosed.creditsEarned) === 'bigint' && presentation_0.disclosed.creditsEarned >= 0n && presentation_0.disclosed.creditsEarned <= 65535n && presentation_0.disclosed.creditsEarnedOpening.buffer instanceof ArrayBuffer && presentation_0.disclosed.creditsEarnedOpening.BYTES_PER_ELEMENT === 1 && presentation_0.disclosed.creditsEarnedOpening.length === 32)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionPresentationSatisfiesRequest',
                                 'argument 4',
                                 'helpers.compact line 625 char 1',
                                 'struct Presentation<version: Uint<0..65536>, schema: struct SchemaRef<packageId: Bytes<32>, schemaId: Bytes<32>, majorVersion: Uint<0..65536>, minorVersion: Uint<0..65536>>, credentialClaimRoot: Bytes<32>, issuerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, holderBinding: struct ExplicitHolderBinding<holderVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>>, disclosed: struct UniversityDiplomaProductionDisclosures<revealDiplomaId: Boolean, diplomaId: Bytes<32>, diplomaIdOpening: Bytes<32>, revealStudentId: Boolean, studentId: Bytes<16>, studentIdOpening: Bytes<32>, revealGraduateName: Boolean, graduateName: Bytes<32>, graduateNameOpening: Bytes<32>, revealUniversityName: Boolean, universityName: Bytes<32>, revealFacultyName: Boolean, facultyName: Bytes<32>, facultyNameOpening: Bytes<32>, revealAwardName: Boolean, awardName: Bytes<32>, revealHonorsCode: Boolean, honorsCode: Bytes<16>, honorsCodeOpening: Bytes<32>, revealGraduationYear: Boolean, graduationYear: Uint<0..65536>, revealGraduationMonth: Boolean, graduationMonth: Uint<0..256>, graduationMonthOpening: Bytes<32>, revealFinalGrade: Boolean, finalGrade: Uint<0..256>, finalGradeOpening: Bytes<32>, revealCreditsEarned: Boolean, creditsEarned: Uint<0..65536>, creditsEarnedOpening: Bytes<32>>>',
                                 presentation_0)
    }
    if (!(typeof(presentationProof_0) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef) === 'object' && typeof(presentationProof_0.signerVerificationMethodRef.didContractAddress) === 'object' && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.didContractAddress.bytes.length === 32 && presentationProof_0.signerVerificationMethodRef.methodId.buffer instanceof ArrayBuffer && presentationProof_0.signerVerificationMethodRef.methodId.BYTES_PER_ELEMENT === 1 && presentationProof_0.signerVerificationMethodRef.methodId.length === 32 && typeof(presentationProof_0.createdAt) === 'bigint' && presentationProof_0.createdAt >= 0n && presentationProof_0.createdAt <= 18446744073709551615n && presentationProof_0.challengeHash.buffer instanceof ArrayBuffer && presentationProof_0.challengeHash.BYTES_PER_ELEMENT === 1 && presentationProof_0.challengeHash.length === 32 && true && typeof(presentationProof_0.signature) === 'object' && true && typeof(presentationProof_0.signature.s) === 'bigint' && presentationProof_0.signature.s >= 0 && presentationProof_0.signature.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('assertUniversityDiplomaProductionPresentationSatisfiesRequest',
                                 'argument 5',
                                 'helpers.compact line 625 char 1',
                                 'struct Proof<signerVerificationMethodRef: struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>, createdAt: Uint<0..18446744073709551616>, challengeHash: Bytes<32>, publicKey: Opaque<"JubjubPoint">, signature: struct Signature<r: Opaque<"JubjubPoint">, s: Field>>',
                                 presentationProof_0)
    }
    return _dummyContract._assertUniversityDiplomaProductionPresentationSatisfiesRequest_0(credential_0,
                                                                                           credentialProof_0,
                                                                                           request_0,
                                                                                           presentation_0,
                                                                                           presentationProof_0);
  },
  universityDiplomaSchemaRef: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`universityDiplomaSchemaRef: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._universityDiplomaSchemaRef_0();
  },
  universityJobApplicationRequest: (...args_0) => {
    if (args_0.length !== 9) {
      throw new __compactRuntime.CompactError(`universityJobApplicationRequest: expected 9 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const issuerVerificationMethodRef_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    const requireDiplomaIdDisclosure_0 = args_0[2];
    const requireStudentIdDisclosure_0 = args_0[3];
    const requireFacultyNameDisclosure_0 = args_0[4];
    const requireHonorsCodeDisclosure_0 = args_0[5];
    const requireGraduationMonthDisclosure_0 = args_0[6];
    const requireFinalGradeDisclosure_0 = args_0[7];
    const requireCreditsEarnedDisclosure_0 = args_0[8];
    if (!(typeof(issuerVerificationMethodRef_0) === 'object' && typeof(issuerVerificationMethodRef_0.didContractAddress) === 'object' && issuerVerificationMethodRef_0.didContractAddress.bytes.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.didContractAddress.bytes.length === 32 && issuerVerificationMethodRef_0.methodId.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.methodId.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.methodId.length === 32)) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 1',
                                 'university-verifier.compact line 43 char 1',
                                 'struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>',
                                 issuerVerificationMethodRef_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 2',
                                 'university-verifier.compact line 43 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    if (!(typeof(requireDiplomaIdDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 3',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireDiplomaIdDisclosure_0)
    }
    if (!(typeof(requireStudentIdDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 4',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireStudentIdDisclosure_0)
    }
    if (!(typeof(requireFacultyNameDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 5',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireFacultyNameDisclosure_0)
    }
    if (!(typeof(requireHonorsCodeDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 6',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireHonorsCodeDisclosure_0)
    }
    if (!(typeof(requireGraduationMonthDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 7',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireGraduationMonthDisclosure_0)
    }
    if (!(typeof(requireFinalGradeDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 8',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireFinalGradeDisclosure_0)
    }
    if (!(typeof(requireCreditsEarnedDisclosure_0) === 'boolean')) {
      __compactRuntime.typeError('universityJobApplicationRequest',
                                 'argument 9',
                                 'university-verifier.compact line 43 char 1',
                                 'Boolean',
                                 requireCreditsEarnedDisclosure_0)
    }
    return _dummyContract._universityJobApplicationRequest_0(issuerVerificationMethodRef_0,
                                                             verifierChallengeHash_0,
                                                             requireDiplomaIdDisclosure_0,
                                                             requireStudentIdDisclosure_0,
                                                             requireFacultyNameDisclosure_0,
                                                             requireHonorsCodeDisclosure_0,
                                                             requireGraduationMonthDisclosure_0,
                                                             requireFinalGradeDisclosure_0,
                                                             requireCreditsEarnedDisclosure_0);
  },
  universityMallDiscountRequest: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`universityMallDiscountRequest: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const issuerVerificationMethodRef_0 = args_0[0];
    const verifierChallengeHash_0 = args_0[1];
    const minimumFinalGrade_0 = args_0[2];
    if (!(typeof(issuerVerificationMethodRef_0) === 'object' && typeof(issuerVerificationMethodRef_0.didContractAddress) === 'object' && issuerVerificationMethodRef_0.didContractAddress.bytes.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.didContractAddress.bytes.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.didContractAddress.bytes.length === 32 && issuerVerificationMethodRef_0.methodId.buffer instanceof ArrayBuffer && issuerVerificationMethodRef_0.methodId.BYTES_PER_ELEMENT === 1 && issuerVerificationMethodRef_0.methodId.length === 32)) {
      __compactRuntime.typeError('universityMallDiscountRequest',
                                 'argument 1',
                                 'university-verifier.compact line 76 char 1',
                                 'struct VerificationMethodRef<didContractAddress: struct ContractAddress<bytes: Bytes<32>>, methodId: Bytes<32>>',
                                 issuerVerificationMethodRef_0)
    }
    if (!(verifierChallengeHash_0.buffer instanceof ArrayBuffer && verifierChallengeHash_0.BYTES_PER_ELEMENT === 1 && verifierChallengeHash_0.length === 32)) {
      __compactRuntime.typeError('universityMallDiscountRequest',
                                 'argument 2',
                                 'university-verifier.compact line 76 char 1',
                                 'Bytes<32>',
                                 verifierChallengeHash_0)
    }
    if (!(typeof(minimumFinalGrade_0) === 'bigint' && minimumFinalGrade_0 >= 0n && minimumFinalGrade_0 <= 255n)) {
      __compactRuntime.typeError('universityMallDiscountRequest',
                                 'argument 3',
                                 'university-verifier.compact line 76 char 1',
                                 'Uint<0..256>',
                                 minimumFinalGrade_0)
    }
    return _dummyContract._universityMallDiscountRequest_0(issuerVerificationMethodRef_0,
                                                           verifierChallengeHash_0,
                                                           minimumFinalGrade_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
