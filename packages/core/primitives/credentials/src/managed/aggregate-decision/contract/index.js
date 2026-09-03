import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class _AggregateDecisionNullifierMaterialV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      deploymentDigest: _descriptor_0.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      requestBindingDigest: _descriptor_0.fromValue(value_0),
      childSetDigest: _descriptor_0.fromValue(value_0),
      actionClassDigest: _descriptor_0.fromValue(value_0),
      actionInvocationDigest: _descriptor_0.fromValue(value_0),
      replayPolicy: _descriptor_2.fromValue(value_0),
      replayScopeDigest: _descriptor_0.fromValue(value_0),
      sameHolderBindingDigest: _descriptor_0.fromValue(value_0),
      policyDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.deploymentDigest).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.requestBindingDigest).concat(_descriptor_0.toValue(value_0.childSetDigest).concat(_descriptor_0.toValue(value_0.actionClassDigest).concat(_descriptor_0.toValue(value_0.actionInvocationDigest).concat(_descriptor_2.toValue(value_0.replayPolicy).concat(_descriptor_0.toValue(value_0.replayScopeDigest).concat(_descriptor_0.toValue(value_0.sameHolderBindingDigest).concat(_descriptor_0.toValue(value_0.policyDigest))))))))))));
  }
}

const _descriptor_3 = new _AggregateDecisionNullifierMaterialV1_0();

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _AggregateDecisionTranscriptV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      authority: _descriptor_2.fromValue(value_0),
      childCount: _descriptor_2.fromValue(value_0),
      requestBindingDigest: _descriptor_0.fromValue(value_0),
      childSetDigest: _descriptor_0.fromValue(value_0),
      sameHolderBindingDigest: _descriptor_0.fromValue(value_0),
      aggregateTrustedTime: _descriptor_4.fromValue(value_0),
      nullifierMode: _descriptor_2.fromValue(value_0),
      decisionNullifier: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.authority).concat(_descriptor_2.toValue(value_0.childCount).concat(_descriptor_0.toValue(value_0.requestBindingDigest).concat(_descriptor_0.toValue(value_0.childSetDigest).concat(_descriptor_0.toValue(value_0.sameHolderBindingDigest).concat(_descriptor_4.toValue(value_0.aggregateTrustedTime).concat(_descriptor_2.toValue(value_0.nullifierMode).concat(_descriptor_0.toValue(value_0.decisionNullifier))))))))));
  }
}

const _descriptor_5 = new _AggregateDecisionTranscriptV1_0();

class _AggregateRequestBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))))))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      networkIdDigest: _descriptor_0.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      deploymentDigest: _descriptor_0.fromValue(value_0),
      audienceDigest: _descriptor_0.fromValue(value_0),
      requestIdDigest: _descriptor_0.fromValue(value_0),
      challengeDigest: _descriptor_0.fromValue(value_0),
      expiresAt: _descriptor_4.fromValue(value_0),
      policyDigest: _descriptor_0.fromValue(value_0),
      actionClassDigest: _descriptor_0.fromValue(value_0),
      actionInvocationDigest: _descriptor_0.fromValue(value_0),
      replayPolicy: _descriptor_2.fromValue(value_0),
      replayScopeDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.networkIdDigest).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.deploymentDigest).concat(_descriptor_0.toValue(value_0.audienceDigest).concat(_descriptor_0.toValue(value_0.requestIdDigest).concat(_descriptor_0.toValue(value_0.challengeDigest).concat(_descriptor_4.toValue(value_0.expiresAt).concat(_descriptor_0.toValue(value_0.policyDigest).concat(_descriptor_0.toValue(value_0.actionClassDigest).concat(_descriptor_0.toValue(value_0.actionInvocationDigest).concat(_descriptor_2.toValue(value_0.replayPolicy).concat(_descriptor_0.toValue(value_0.replayScopeDigest))))))))))))));
  }
}

const _descriptor_6 = new _AggregateRequestBindingV1_0();

class _AggregateSameHolderBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      mode: _descriptor_2.fromValue(value_0),
      verifierContractDigest: _descriptor_0.fromValue(value_0),
      challengeDigest: _descriptor_0.fromValue(value_0),
      childCount: _descriptor_2.fromValue(value_0),
      firstHolderBindingDigest: _descriptor_0.fromValue(value_0),
      secondHolderBindingDigest: _descriptor_0.fromValue(value_0),
      thirdHolderBindingDigest: _descriptor_0.fromValue(value_0),
      childSetDigest: _descriptor_0.fromValue(value_0),
      proofDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.mode).concat(_descriptor_0.toValue(value_0.verifierContractDigest).concat(_descriptor_0.toValue(value_0.challengeDigest).concat(_descriptor_2.toValue(value_0.childCount).concat(_descriptor_0.toValue(value_0.firstHolderBindingDigest).concat(_descriptor_0.toValue(value_0.secondHolderBindingDigest).concat(_descriptor_0.toValue(value_0.thirdHolderBindingDigest).concat(_descriptor_0.toValue(value_0.childSetDigest).concat(_descriptor_0.toValue(value_0.proofDigest)))))))))));
  }
}

const _descriptor_7 = new _AggregateSameHolderBindingV1_0();

class _AggregateChildDecisionBindingV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment()))))))))))))))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      familyDigest: _descriptor_0.fromValue(value_0),
      schemaDigest: _descriptor_0.fromValue(value_0),
      transcriptDigest: _descriptor_0.fromValue(value_0),
      anchorEvidenceDigest: _descriptor_0.fromValue(value_0),
      issuerDidDigest: _descriptor_0.fromValue(value_0),
      issuerMethodDigest: _descriptor_0.fromValue(value_0),
      issuerRelationship: _descriptor_2.fromValue(value_0),
      issuerEvidenceDigest: _descriptor_0.fromValue(value_0),
      trustScopeDigest: _descriptor_0.fromValue(value_0),
      trustEvidenceDigest: _descriptor_0.fromValue(value_0),
      statusMode: _descriptor_2.fromValue(value_0),
      statusRegistryDigest: _descriptor_0.fromValue(value_0),
      statusRoot: _descriptor_0.fromValue(value_0),
      statusRegistryVersion: _descriptor_4.fromValue(value_0),
      statusFreshnessPolicyDigest: _descriptor_0.fromValue(value_0),
      statusEvidenceDigest: _descriptor_0.fromValue(value_0),
      timeMode: _descriptor_2.fromValue(value_0),
      trustedTime: _descriptor_4.fromValue(value_0),
      timeEvidenceDigest: _descriptor_0.fromValue(value_0),
      artifactManifestDigest: _descriptor_0.fromValue(value_0),
      artifactEvidenceDigest: _descriptor_0.fromValue(value_0),
      holderBindingDigest: _descriptor_0.fromValue(value_0),
      profile: _descriptor_2.fromValue(value_0),
      resultKind: _descriptor_2.fromValue(value_0),
      proofStatus: _descriptor_2.fromValue(value_0),
      decisionStatus: _descriptor_2.fromValue(value_0),
      executionStatus: _descriptor_2.fromValue(value_0),
      authority: _descriptor_2.fromValue(value_0),
      decisionNullifier: _descriptor_0.fromValue(value_0),
      transactionDigest: _descriptor_0.fromValue(value_0),
      atomicMutation: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_0.toValue(value_0.familyDigest).concat(_descriptor_0.toValue(value_0.schemaDigest).concat(_descriptor_0.toValue(value_0.transcriptDigest).concat(_descriptor_0.toValue(value_0.anchorEvidenceDigest).concat(_descriptor_0.toValue(value_0.issuerDidDigest).concat(_descriptor_0.toValue(value_0.issuerMethodDigest).concat(_descriptor_2.toValue(value_0.issuerRelationship).concat(_descriptor_0.toValue(value_0.issuerEvidenceDigest).concat(_descriptor_0.toValue(value_0.trustScopeDigest).concat(_descriptor_0.toValue(value_0.trustEvidenceDigest).concat(_descriptor_2.toValue(value_0.statusMode).concat(_descriptor_0.toValue(value_0.statusRegistryDigest).concat(_descriptor_0.toValue(value_0.statusRoot).concat(_descriptor_4.toValue(value_0.statusRegistryVersion).concat(_descriptor_0.toValue(value_0.statusFreshnessPolicyDigest).concat(_descriptor_0.toValue(value_0.statusEvidenceDigest).concat(_descriptor_2.toValue(value_0.timeMode).concat(_descriptor_4.toValue(value_0.trustedTime).concat(_descriptor_0.toValue(value_0.timeEvidenceDigest).concat(_descriptor_0.toValue(value_0.artifactManifestDigest).concat(_descriptor_0.toValue(value_0.artifactEvidenceDigest).concat(_descriptor_0.toValue(value_0.holderBindingDigest).concat(_descriptor_2.toValue(value_0.profile).concat(_descriptor_2.toValue(value_0.resultKind).concat(_descriptor_2.toValue(value_0.proofStatus).concat(_descriptor_2.toValue(value_0.decisionStatus).concat(_descriptor_2.toValue(value_0.executionStatus).concat(_descriptor_2.toValue(value_0.authority).concat(_descriptor_0.toValue(value_0.decisionNullifier).concat(_descriptor_0.toValue(value_0.transactionDigest).concat(_descriptor_2.toValue(value_0.atomicMutation)))))))))))))))))))))))))))))))));
  }
}

const _descriptor_8 = new _AggregateChildDecisionBindingV1_0();

class _AggregateChildSetV1_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      version: _descriptor_1.fromValue(value_0),
      childCount: _descriptor_2.fromValue(value_0),
      firstChildDigest: _descriptor_0.fromValue(value_0),
      secondChildDigest: _descriptor_0.fromValue(value_0),
      thirdChildDigest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_1.toValue(value_0.version).concat(_descriptor_2.toValue(value_0.childCount).concat(_descriptor_0.toValue(value_0.firstChildDigest).concat(_descriptor_0.toValue(value_0.secondChildDigest).concat(_descriptor_0.toValue(value_0.thirdChildDigest))))));
  }
}

const _descriptor_9 = new _AggregateChildSetV1_0();

const _descriptor_10 = __compactRuntime.CompactTypeBoolean;

class _Either_0 {
  alignment() {
    return _descriptor_10.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_10.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_10.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_11 = new _Either_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

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

const _descriptor_13 = new _ContractAddress_0();

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
      aggregateChildDecisionBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.aggregateChildDecisionBindingDomainV1(...args_1), context };
      },
      aggregateChildSetDomainV1(context, ...args_1) {
        return { result: pureCircuits.aggregateChildSetDomainV1(...args_1), context };
      },
      aggregateRequestBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.aggregateRequestBindingDomainV1(...args_1), context };
      },
      aggregateSameHolderBindingDomainV1(context, ...args_1) {
        return { result: pureCircuits.aggregateSameHolderBindingDomainV1(...args_1), context };
      },
      aggregateDecisionTranscriptDomainV1(context, ...args_1) {
        return { result: pureCircuits.aggregateDecisionTranscriptDomainV1(...args_1), context };
      },
      aggregateDecisionNullifierDomainV1(context, ...args_1) {
        return { result: pureCircuits.aggregateDecisionNullifierDomainV1(...args_1), context };
      },
      aggregateChildDecisionBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.aggregateChildDecisionBindingV1Digest(...args_1), context };
      },
      aggregateChildSetV1Digest(context, ...args_1) {
        return { result: pureCircuits.aggregateChildSetV1Digest(...args_1), context };
      },
      aggregateRequestBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.aggregateRequestBindingV1Digest(...args_1), context };
      },
      aggregateSameHolderBindingV1Digest(context, ...args_1) {
        return { result: pureCircuits.aggregateSameHolderBindingV1Digest(...args_1), context };
      },
      aggregateDecisionNullifierMaterialV1Digest(context, ...args_1) {
        return { result: pureCircuits.aggregateDecisionNullifierMaterialV1Digest(...args_1), context };
      },
      aggregateDecisionTranscriptV1Digest(context, ...args_1) {
        return { result: pureCircuits.aggregateDecisionTranscriptV1Digest(...args_1), context };
      }
    };
    this.impureCircuits = {};
    this.provableCircuits = {};
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
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_7, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_3, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_5, value_0);
    return result_0;
  }
  _aggregateChildDecisionBindingDomainV1_0() {
    return Uint8Array.from([148n,
                            20n,
                            30n,
                            32n,
                            118n,
                            193n,
                            93n,
                            42n,
                            139n,
                            115n,
                            76n,
                            98n,
                            250n,
                            221n,
                            86n,
                            32n,
                            128n,
                            105n,
                            246n,
                            47n,
                            208n,
                            104n,
                            177n,
                            144n,
                            43n,
                            252n,
                            92n,
                            79n,
                            5n,
                            144n,
                            72n,
                            73n],
                           Number);
  }
  _aggregateChildSetDomainV1_0() {
    return Uint8Array.from([163n,
                            232n,
                            37n,
                            188n,
                            111n,
                            32n,
                            145n,
                            165n,
                            250n,
                            229n,
                            121n,
                            225n,
                            77n,
                            191n,
                            137n,
                            136n,
                            43n,
                            113n,
                            144n,
                            106n,
                            126n,
                            130n,
                            145n,
                            106n,
                            215n,
                            221n,
                            10n,
                            245n,
                            133n,
                            91n,
                            112n,
                            227n],
                           Number);
  }
  _aggregateRequestBindingDomainV1_0() {
    return Uint8Array.from([13n,
                            132n,
                            112n,
                            83n,
                            182n,
                            17n,
                            179n,
                            85n,
                            155n,
                            81n,
                            22n,
                            99n,
                            18n,
                            11n,
                            81n,
                            174n,
                            38n,
                            16n,
                            193n,
                            134n,
                            15n,
                            88n,
                            56n,
                            237n,
                            99n,
                            81n,
                            233n,
                            1n,
                            80n,
                            250n,
                            52n,
                            123n],
                           Number);
  }
  _aggregateSameHolderBindingDomainV1_0() {
    return Uint8Array.from([254n,
                            110n,
                            78n,
                            67n,
                            171n,
                            233n,
                            198n,
                            234n,
                            122n,
                            165n,
                            14n,
                            198n,
                            45n,
                            246n,
                            221n,
                            42n,
                            219n,
                            199n,
                            73n,
                            122n,
                            194n,
                            252n,
                            22n,
                            86n,
                            40n,
                            97n,
                            21n,
                            29n,
                            185n,
                            14n,
                            189n,
                            124n],
                           Number);
  }
  _aggregateDecisionTranscriptDomainV1_0() {
    return Uint8Array.from([152n,
                            68n,
                            248n,
                            125n,
                            191n,
                            179n,
                            155n,
                            204n,
                            85n,
                            183n,
                            164n,
                            132n,
                            31n,
                            96n,
                            72n,
                            13n,
                            161n,
                            123n,
                            157n,
                            254n,
                            198n,
                            105n,
                            44n,
                            193n,
                            114n,
                            221n,
                            144n,
                            71n,
                            119n,
                            66n,
                            24n,
                            79n],
                           Number);
  }
  _aggregateDecisionNullifierDomainV1_0() {
    return Uint8Array.from([180n,
                            78n,
                            103n,
                            246n,
                            104n,
                            233n,
                            239n,
                            33n,
                            102n,
                            36n,
                            15n,
                            209n,
                            104n,
                            32n,
                            198n,
                            140n,
                            53n,
                            102n,
                            61n,
                            207n,
                            70n,
                            181n,
                            182n,
                            201n,
                            88n,
                            57n,
                            37n,
                            241n,
                            205n,
                            127n,
                            10n,
                            156n],
                           Number);
  }
  _aggregateChildDecisionBindingV1Digest_0(binding_0) {
    return this._persistentHash_0(binding_0);
  }
  _aggregateChildSetV1Digest_0(childSet_0) {
    return this._persistentHash_1(childSet_0);
  }
  _aggregateRequestBindingV1Digest_0(request_0) {
    return this._persistentHash_2(request_0);
  }
  _aggregateSameHolderBindingV1Digest_0(binding_0) {
    return this._persistentHash_3(binding_0);
  }
  _aggregateDecisionNullifierMaterialV1Digest_0(material_0) {
    return this._persistentHash_4(material_0);
  }
  _aggregateDecisionTranscriptV1Digest_0(transcript_0) {
    return this._persistentHash_5(transcript_0);
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
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {
  aggregateChildDecisionBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`aggregateChildDecisionBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._aggregateChildDecisionBindingDomainV1_0();
  },
  aggregateChildSetDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`aggregateChildSetDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._aggregateChildSetDomainV1_0();
  },
  aggregateRequestBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`aggregateRequestBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._aggregateRequestBindingDomainV1_0();
  },
  aggregateSameHolderBindingDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`aggregateSameHolderBindingDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._aggregateSameHolderBindingDomainV1_0();
  },
  aggregateDecisionTranscriptDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`aggregateDecisionTranscriptDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._aggregateDecisionTranscriptDomainV1_0();
  },
  aggregateDecisionNullifierDomainV1: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`aggregateDecisionNullifierDomainV1: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._aggregateDecisionNullifierDomainV1_0();
  },
  aggregateChildDecisionBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`aggregateChildDecisionBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && binding_0.familyDigest.buffer instanceof ArrayBuffer && binding_0.familyDigest.BYTES_PER_ELEMENT === 1 && binding_0.familyDigest.length === 32 && binding_0.schemaDigest.buffer instanceof ArrayBuffer && binding_0.schemaDigest.BYTES_PER_ELEMENT === 1 && binding_0.schemaDigest.length === 32 && binding_0.transcriptDigest.buffer instanceof ArrayBuffer && binding_0.transcriptDigest.BYTES_PER_ELEMENT === 1 && binding_0.transcriptDigest.length === 32 && binding_0.anchorEvidenceDigest.buffer instanceof ArrayBuffer && binding_0.anchorEvidenceDigest.BYTES_PER_ELEMENT === 1 && binding_0.anchorEvidenceDigest.length === 32 && binding_0.issuerDidDigest.buffer instanceof ArrayBuffer && binding_0.issuerDidDigest.BYTES_PER_ELEMENT === 1 && binding_0.issuerDidDigest.length === 32 && binding_0.issuerMethodDigest.buffer instanceof ArrayBuffer && binding_0.issuerMethodDigest.BYTES_PER_ELEMENT === 1 && binding_0.issuerMethodDigest.length === 32 && typeof(binding_0.issuerRelationship) === 'bigint' && binding_0.issuerRelationship >= 0n && binding_0.issuerRelationship <= 255n && binding_0.issuerEvidenceDigest.buffer instanceof ArrayBuffer && binding_0.issuerEvidenceDigest.BYTES_PER_ELEMENT === 1 && binding_0.issuerEvidenceDigest.length === 32 && binding_0.trustScopeDigest.buffer instanceof ArrayBuffer && binding_0.trustScopeDigest.BYTES_PER_ELEMENT === 1 && binding_0.trustScopeDigest.length === 32 && binding_0.trustEvidenceDigest.buffer instanceof ArrayBuffer && binding_0.trustEvidenceDigest.BYTES_PER_ELEMENT === 1 && binding_0.trustEvidenceDigest.length === 32 && typeof(binding_0.statusMode) === 'bigint' && binding_0.statusMode >= 0n && binding_0.statusMode <= 255n && binding_0.statusRegistryDigest.buffer instanceof ArrayBuffer && binding_0.statusRegistryDigest.BYTES_PER_ELEMENT === 1 && binding_0.statusRegistryDigest.length === 32 && binding_0.statusRoot.buffer instanceof ArrayBuffer && binding_0.statusRoot.BYTES_PER_ELEMENT === 1 && binding_0.statusRoot.length === 32 && typeof(binding_0.statusRegistryVersion) === 'bigint' && binding_0.statusRegistryVersion >= 0n && binding_0.statusRegistryVersion <= 18446744073709551615n && binding_0.statusFreshnessPolicyDigest.buffer instanceof ArrayBuffer && binding_0.statusFreshnessPolicyDigest.BYTES_PER_ELEMENT === 1 && binding_0.statusFreshnessPolicyDigest.length === 32 && binding_0.statusEvidenceDigest.buffer instanceof ArrayBuffer && binding_0.statusEvidenceDigest.BYTES_PER_ELEMENT === 1 && binding_0.statusEvidenceDigest.length === 32 && typeof(binding_0.timeMode) === 'bigint' && binding_0.timeMode >= 0n && binding_0.timeMode <= 255n && typeof(binding_0.trustedTime) === 'bigint' && binding_0.trustedTime >= 0n && binding_0.trustedTime <= 18446744073709551615n && binding_0.timeEvidenceDigest.buffer instanceof ArrayBuffer && binding_0.timeEvidenceDigest.BYTES_PER_ELEMENT === 1 && binding_0.timeEvidenceDigest.length === 32 && binding_0.artifactManifestDigest.buffer instanceof ArrayBuffer && binding_0.artifactManifestDigest.BYTES_PER_ELEMENT === 1 && binding_0.artifactManifestDigest.length === 32 && binding_0.artifactEvidenceDigest.buffer instanceof ArrayBuffer && binding_0.artifactEvidenceDigest.BYTES_PER_ELEMENT === 1 && binding_0.artifactEvidenceDigest.length === 32 && binding_0.holderBindingDigest.buffer instanceof ArrayBuffer && binding_0.holderBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.holderBindingDigest.length === 32 && typeof(binding_0.profile) === 'bigint' && binding_0.profile >= 0n && binding_0.profile <= 255n && typeof(binding_0.resultKind) === 'bigint' && binding_0.resultKind >= 0n && binding_0.resultKind <= 255n && typeof(binding_0.proofStatus) === 'bigint' && binding_0.proofStatus >= 0n && binding_0.proofStatus <= 255n && typeof(binding_0.decisionStatus) === 'bigint' && binding_0.decisionStatus >= 0n && binding_0.decisionStatus <= 255n && typeof(binding_0.executionStatus) === 'bigint' && binding_0.executionStatus >= 0n && binding_0.executionStatus <= 255n && typeof(binding_0.authority) === 'bigint' && binding_0.authority >= 0n && binding_0.authority <= 255n && binding_0.decisionNullifier.buffer instanceof ArrayBuffer && binding_0.decisionNullifier.BYTES_PER_ELEMENT === 1 && binding_0.decisionNullifier.length === 32 && binding_0.transactionDigest.buffer instanceof ArrayBuffer && binding_0.transactionDigest.BYTES_PER_ELEMENT === 1 && binding_0.transactionDigest.length === 32 && typeof(binding_0.atomicMutation) === 'bigint' && binding_0.atomicMutation >= 0n && binding_0.atomicMutation <= 255n)) {
      __compactRuntime.typeError('aggregateChildDecisionBindingV1Digest',
                                 'argument 1',
                                 'src/./credentials/aggregate-decision-v1.compact line 133 char 1',
                                 'struct AggregateChildDecisionBindingV1<domain: Bytes<32>, version: Uint<0..65536>, familyDigest: Bytes<32>, schemaDigest: Bytes<32>, transcriptDigest: Bytes<32>, anchorEvidenceDigest: Bytes<32>, issuerDidDigest: Bytes<32>, issuerMethodDigest: Bytes<32>, issuerRelationship: Uint<0..256>, issuerEvidenceDigest: Bytes<32>, trustScopeDigest: Bytes<32>, trustEvidenceDigest: Bytes<32>, statusMode: Uint<0..256>, statusRegistryDigest: Bytes<32>, statusRoot: Bytes<32>, statusRegistryVersion: Uint<0..18446744073709551616>, statusFreshnessPolicyDigest: Bytes<32>, statusEvidenceDigest: Bytes<32>, timeMode: Uint<0..256>, trustedTime: Uint<0..18446744073709551616>, timeEvidenceDigest: Bytes<32>, artifactManifestDigest: Bytes<32>, artifactEvidenceDigest: Bytes<32>, holderBindingDigest: Bytes<32>, profile: Uint<0..256>, resultKind: Uint<0..256>, proofStatus: Uint<0..256>, decisionStatus: Uint<0..256>, executionStatus: Uint<0..256>, authority: Uint<0..256>, decisionNullifier: Bytes<32>, transactionDigest: Bytes<32>, atomicMutation: Uint<0..256>>',
                                 binding_0)
    }
    return _dummyContract._aggregateChildDecisionBindingV1Digest_0(binding_0);
  },
  aggregateChildSetV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`aggregateChildSetV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const childSet_0 = args_0[0];
    if (!(typeof(childSet_0) === 'object' && childSet_0.domain.buffer instanceof ArrayBuffer && childSet_0.domain.BYTES_PER_ELEMENT === 1 && childSet_0.domain.length === 32 && typeof(childSet_0.version) === 'bigint' && childSet_0.version >= 0n && childSet_0.version <= 65535n && typeof(childSet_0.childCount) === 'bigint' && childSet_0.childCount >= 0n && childSet_0.childCount <= 255n && childSet_0.firstChildDigest.buffer instanceof ArrayBuffer && childSet_0.firstChildDigest.BYTES_PER_ELEMENT === 1 && childSet_0.firstChildDigest.length === 32 && childSet_0.secondChildDigest.buffer instanceof ArrayBuffer && childSet_0.secondChildDigest.BYTES_PER_ELEMENT === 1 && childSet_0.secondChildDigest.length === 32 && childSet_0.thirdChildDigest.buffer instanceof ArrayBuffer && childSet_0.thirdChildDigest.BYTES_PER_ELEMENT === 1 && childSet_0.thirdChildDigest.length === 32)) {
      __compactRuntime.typeError('aggregateChildSetV1Digest',
                                 'argument 1',
                                 'src/./credentials/aggregate-decision-v1.compact line 139 char 1',
                                 'struct AggregateChildSetV1<domain: Bytes<32>, version: Uint<0..65536>, childCount: Uint<0..256>, firstChildDigest: Bytes<32>, secondChildDigest: Bytes<32>, thirdChildDigest: Bytes<32>>',
                                 childSet_0)
    }
    return _dummyContract._aggregateChildSetV1Digest_0(childSet_0);
  },
  aggregateRequestBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`aggregateRequestBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const request_0 = args_0[0];
    if (!(typeof(request_0) === 'object' && request_0.domain.buffer instanceof ArrayBuffer && request_0.domain.BYTES_PER_ELEMENT === 1 && request_0.domain.length === 32 && typeof(request_0.version) === 'bigint' && request_0.version >= 0n && request_0.version <= 65535n && request_0.networkIdDigest.buffer instanceof ArrayBuffer && request_0.networkIdDigest.BYTES_PER_ELEMENT === 1 && request_0.networkIdDigest.length === 32 && request_0.verifierContractDigest.buffer instanceof ArrayBuffer && request_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && request_0.verifierContractDigest.length === 32 && request_0.deploymentDigest.buffer instanceof ArrayBuffer && request_0.deploymentDigest.BYTES_PER_ELEMENT === 1 && request_0.deploymentDigest.length === 32 && request_0.audienceDigest.buffer instanceof ArrayBuffer && request_0.audienceDigest.BYTES_PER_ELEMENT === 1 && request_0.audienceDigest.length === 32 && request_0.requestIdDigest.buffer instanceof ArrayBuffer && request_0.requestIdDigest.BYTES_PER_ELEMENT === 1 && request_0.requestIdDigest.length === 32 && request_0.challengeDigest.buffer instanceof ArrayBuffer && request_0.challengeDigest.BYTES_PER_ELEMENT === 1 && request_0.challengeDigest.length === 32 && typeof(request_0.expiresAt) === 'bigint' && request_0.expiresAt >= 0n && request_0.expiresAt <= 18446744073709551615n && request_0.policyDigest.buffer instanceof ArrayBuffer && request_0.policyDigest.BYTES_PER_ELEMENT === 1 && request_0.policyDigest.length === 32 && request_0.actionClassDigest.buffer instanceof ArrayBuffer && request_0.actionClassDigest.BYTES_PER_ELEMENT === 1 && request_0.actionClassDigest.length === 32 && request_0.actionInvocationDigest.buffer instanceof ArrayBuffer && request_0.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && request_0.actionInvocationDigest.length === 32 && typeof(request_0.replayPolicy) === 'bigint' && request_0.replayPolicy >= 0n && request_0.replayPolicy <= 255n && request_0.replayScopeDigest.buffer instanceof ArrayBuffer && request_0.replayScopeDigest.BYTES_PER_ELEMENT === 1 && request_0.replayScopeDigest.length === 32)) {
      __compactRuntime.typeError('aggregateRequestBindingV1Digest',
                                 'argument 1',
                                 'src/./credentials/aggregate-decision-v1.compact line 145 char 1',
                                 'struct AggregateRequestBindingV1<domain: Bytes<32>, version: Uint<0..65536>, networkIdDigest: Bytes<32>, verifierContractDigest: Bytes<32>, deploymentDigest: Bytes<32>, audienceDigest: Bytes<32>, requestIdDigest: Bytes<32>, challengeDigest: Bytes<32>, expiresAt: Uint<0..18446744073709551616>, policyDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>>',
                                 request_0)
    }
    return _dummyContract._aggregateRequestBindingV1Digest_0(request_0);
  },
  aggregateSameHolderBindingV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`aggregateSameHolderBindingV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const binding_0 = args_0[0];
    if (!(typeof(binding_0) === 'object' && binding_0.domain.buffer instanceof ArrayBuffer && binding_0.domain.BYTES_PER_ELEMENT === 1 && binding_0.domain.length === 32 && typeof(binding_0.version) === 'bigint' && binding_0.version >= 0n && binding_0.version <= 65535n && typeof(binding_0.mode) === 'bigint' && binding_0.mode >= 0n && binding_0.mode <= 255n && binding_0.verifierContractDigest.buffer instanceof ArrayBuffer && binding_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && binding_0.verifierContractDigest.length === 32 && binding_0.challengeDigest.buffer instanceof ArrayBuffer && binding_0.challengeDigest.BYTES_PER_ELEMENT === 1 && binding_0.challengeDigest.length === 32 && typeof(binding_0.childCount) === 'bigint' && binding_0.childCount >= 0n && binding_0.childCount <= 255n && binding_0.firstHolderBindingDigest.buffer instanceof ArrayBuffer && binding_0.firstHolderBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.firstHolderBindingDigest.length === 32 && binding_0.secondHolderBindingDigest.buffer instanceof ArrayBuffer && binding_0.secondHolderBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.secondHolderBindingDigest.length === 32 && binding_0.thirdHolderBindingDigest.buffer instanceof ArrayBuffer && binding_0.thirdHolderBindingDigest.BYTES_PER_ELEMENT === 1 && binding_0.thirdHolderBindingDigest.length === 32 && binding_0.childSetDigest.buffer instanceof ArrayBuffer && binding_0.childSetDigest.BYTES_PER_ELEMENT === 1 && binding_0.childSetDigest.length === 32 && binding_0.proofDigest.buffer instanceof ArrayBuffer && binding_0.proofDigest.BYTES_PER_ELEMENT === 1 && binding_0.proofDigest.length === 32)) {
      __compactRuntime.typeError('aggregateSameHolderBindingV1Digest',
                                 'argument 1',
                                 'src/./credentials/aggregate-decision-v1.compact line 151 char 1',
                                 'struct AggregateSameHolderBindingV1<domain: Bytes<32>, version: Uint<0..65536>, mode: Uint<0..256>, verifierContractDigest: Bytes<32>, challengeDigest: Bytes<32>, childCount: Uint<0..256>, firstHolderBindingDigest: Bytes<32>, secondHolderBindingDigest: Bytes<32>, thirdHolderBindingDigest: Bytes<32>, childSetDigest: Bytes<32>, proofDigest: Bytes<32>>',
                                 binding_0)
    }
    return _dummyContract._aggregateSameHolderBindingV1Digest_0(binding_0);
  },
  aggregateDecisionNullifierMaterialV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`aggregateDecisionNullifierMaterialV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const material_0 = args_0[0];
    if (!(typeof(material_0) === 'object' && material_0.domain.buffer instanceof ArrayBuffer && material_0.domain.BYTES_PER_ELEMENT === 1 && material_0.domain.length === 32 && typeof(material_0.version) === 'bigint' && material_0.version >= 0n && material_0.version <= 65535n && material_0.deploymentDigest.buffer instanceof ArrayBuffer && material_0.deploymentDigest.BYTES_PER_ELEMENT === 1 && material_0.deploymentDigest.length === 32 && material_0.verifierContractDigest.buffer instanceof ArrayBuffer && material_0.verifierContractDigest.BYTES_PER_ELEMENT === 1 && material_0.verifierContractDigest.length === 32 && material_0.requestBindingDigest.buffer instanceof ArrayBuffer && material_0.requestBindingDigest.BYTES_PER_ELEMENT === 1 && material_0.requestBindingDigest.length === 32 && material_0.childSetDigest.buffer instanceof ArrayBuffer && material_0.childSetDigest.BYTES_PER_ELEMENT === 1 && material_0.childSetDigest.length === 32 && material_0.actionClassDigest.buffer instanceof ArrayBuffer && material_0.actionClassDigest.BYTES_PER_ELEMENT === 1 && material_0.actionClassDigest.length === 32 && material_0.actionInvocationDigest.buffer instanceof ArrayBuffer && material_0.actionInvocationDigest.BYTES_PER_ELEMENT === 1 && material_0.actionInvocationDigest.length === 32 && typeof(material_0.replayPolicy) === 'bigint' && material_0.replayPolicy >= 0n && material_0.replayPolicy <= 255n && material_0.replayScopeDigest.buffer instanceof ArrayBuffer && material_0.replayScopeDigest.BYTES_PER_ELEMENT === 1 && material_0.replayScopeDigest.length === 32 && material_0.sameHolderBindingDigest.buffer instanceof ArrayBuffer && material_0.sameHolderBindingDigest.BYTES_PER_ELEMENT === 1 && material_0.sameHolderBindingDigest.length === 32 && material_0.policyDigest.buffer instanceof ArrayBuffer && material_0.policyDigest.BYTES_PER_ELEMENT === 1 && material_0.policyDigest.length === 32)) {
      __compactRuntime.typeError('aggregateDecisionNullifierMaterialV1Digest',
                                 'argument 1',
                                 'src/./credentials/aggregate-decision-v1.compact line 157 char 1',
                                 'struct AggregateDecisionNullifierMaterialV1<domain: Bytes<32>, version: Uint<0..65536>, deploymentDigest: Bytes<32>, verifierContractDigest: Bytes<32>, requestBindingDigest: Bytes<32>, childSetDigest: Bytes<32>, actionClassDigest: Bytes<32>, actionInvocationDigest: Bytes<32>, replayPolicy: Uint<0..256>, replayScopeDigest: Bytes<32>, sameHolderBindingDigest: Bytes<32>, policyDigest: Bytes<32>>',
                                 material_0)
    }
    return _dummyContract._aggregateDecisionNullifierMaterialV1Digest_0(material_0);
  },
  aggregateDecisionTranscriptV1Digest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`aggregateDecisionTranscriptV1Digest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const transcript_0 = args_0[0];
    if (!(typeof(transcript_0) === 'object' && transcript_0.domain.buffer instanceof ArrayBuffer && transcript_0.domain.BYTES_PER_ELEMENT === 1 && transcript_0.domain.length === 32 && typeof(transcript_0.version) === 'bigint' && transcript_0.version >= 0n && transcript_0.version <= 65535n && typeof(transcript_0.authority) === 'bigint' && transcript_0.authority >= 0n && transcript_0.authority <= 255n && typeof(transcript_0.childCount) === 'bigint' && transcript_0.childCount >= 0n && transcript_0.childCount <= 255n && transcript_0.requestBindingDigest.buffer instanceof ArrayBuffer && transcript_0.requestBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.requestBindingDigest.length === 32 && transcript_0.childSetDigest.buffer instanceof ArrayBuffer && transcript_0.childSetDigest.BYTES_PER_ELEMENT === 1 && transcript_0.childSetDigest.length === 32 && transcript_0.sameHolderBindingDigest.buffer instanceof ArrayBuffer && transcript_0.sameHolderBindingDigest.BYTES_PER_ELEMENT === 1 && transcript_0.sameHolderBindingDigest.length === 32 && typeof(transcript_0.aggregateTrustedTime) === 'bigint' && transcript_0.aggregateTrustedTime >= 0n && transcript_0.aggregateTrustedTime <= 18446744073709551615n && typeof(transcript_0.nullifierMode) === 'bigint' && transcript_0.nullifierMode >= 0n && transcript_0.nullifierMode <= 255n && transcript_0.decisionNullifier.buffer instanceof ArrayBuffer && transcript_0.decisionNullifier.BYTES_PER_ELEMENT === 1 && transcript_0.decisionNullifier.length === 32)) {
      __compactRuntime.typeError('aggregateDecisionTranscriptV1Digest',
                                 'argument 1',
                                 'src/./credentials/aggregate-decision-v1.compact line 163 char 1',
                                 'struct AggregateDecisionTranscriptV1<domain: Bytes<32>, version: Uint<0..65536>, authority: Uint<0..256>, childCount: Uint<0..256>, requestBindingDigest: Bytes<32>, childSetDigest: Bytes<32>, sameHolderBindingDigest: Bytes<32>, aggregateTrustedTime: Uint<0..18446744073709551616>, nullifierMode: Uint<0..256>, decisionNullifier: Bytes<32>>',
                                 transcript_0)
    }
    return _dummyContract._aggregateDecisionTranscriptV1Digest_0(transcript_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
