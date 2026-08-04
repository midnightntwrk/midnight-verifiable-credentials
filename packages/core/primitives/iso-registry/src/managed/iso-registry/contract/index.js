import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.15.0');

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _RegionCode_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      country: _descriptor_0.fromValue(value_0),
      subdivision: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.country).concat(_descriptor_0.toValue(value_0.subdivision));
  }
}

const _descriptor_1 = new _RegionCode_0();

class _CountryCode_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      value: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.value);
  }
}

const _descriptor_2 = new _CountryCode_0();

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_4 = __compactRuntime.CompactTypeBoolean;

const _descriptor_5 = new __compactRuntime.CompactTypeBytes(32);

class _Either_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_4.fromValue(value_0),
      left: _descriptor_5.fromValue(value_0),
      right: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_left).concat(_descriptor_5.toValue(value_0.left).concat(_descriptor_5.toValue(value_0.right)));
  }
}

const _descriptor_6 = new _Either_0();

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_5.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.bytes);
  }
}

const _descriptor_8 = new _ContractAddress_0();

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

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
      assertCountryEquals(context, ...args_1) {
        return { result: pureCircuits.assertCountryEquals(...args_1), context };
      },
      assertRegionCountryEquals(context, ...args_1) {
        return { result: pureCircuits.assertRegionCountryEquals(...args_1), context };
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
  _assertCountryEquals_0(actual_0, expected_0) {
    __compactRuntime.assert(this._equal_0(actual_0.value, expected_0),
                            'Country code does not match expected value');
    return [];
  }
  _assertRegionCountryEquals_0(region_0, expectedCountry_0) {
    __compactRuntime.assert(this._equal_1(region_0.country, expectedCountry_0),
                            'Region country does not match expected value');
    return [];
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
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
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {
  assertCountryEquals: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertCountryEquals: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const actual_0 = args_0[0];
    const expected_0 = args_0[1];
    if (!(typeof(actual_0) === 'object' && typeof(actual_0.value) === 'bigint' && actual_0.value >= 0n && actual_0.value <= 65535n)) {
      __compactRuntime.typeError('assertCountryEquals',
                                 'argument 1',
                                 'codes.compact line 22 char 1',
                                 'struct CountryCode<value: Uint<0..65536>>',
                                 actual_0)
    }
    if (!(typeof(expected_0) === 'bigint' && expected_0 >= 0n && expected_0 <= 65535n)) {
      __compactRuntime.typeError('assertCountryEquals',
                                 'argument 2',
                                 'codes.compact line 22 char 1',
                                 'Uint<0..65536>',
                                 expected_0)
    }
    return _dummyContract._assertCountryEquals_0(actual_0, expected_0);
  },
  assertRegionCountryEquals: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assertRegionCountryEquals: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const region_0 = args_0[0];
    const expectedCountry_0 = args_0[1];
    if (!(typeof(region_0) === 'object' && typeof(region_0.country) === 'bigint' && region_0.country >= 0n && region_0.country <= 65535n && typeof(region_0.subdivision) === 'bigint' && region_0.subdivision >= 0n && region_0.subdivision <= 65535n)) {
      __compactRuntime.typeError('assertRegionCountryEquals',
                                 'argument 1',
                                 'codes.compact line 29 char 1',
                                 'struct RegionCode<country: Uint<0..65536>, subdivision: Uint<0..65536>>',
                                 region_0)
    }
    if (!(typeof(expectedCountry_0) === 'bigint' && expectedCountry_0 >= 0n && expectedCountry_0 <= 65535n)) {
      __compactRuntime.typeError('assertRegionCountryEquals',
                                 'argument 2',
                                 'codes.compact line 29 char 1',
                                 'Uint<0..65536>',
                                 expectedCountry_0)
    }
    return _dummyContract._assertRegionCountryEquals_0(region_0,
                                                       expectedCountry_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
