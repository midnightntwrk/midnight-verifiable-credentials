import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type CountryCode = { value: bigint };

export type CurrencyCode = { value: bigint };

export type LanguageCode = { value: bigint };

export type RegionCode = { country: bigint; subdivision: bigint };

export type GenderCode = { value: bigint };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
}

export type ProvableCircuits<PS> = {
}

export type PureCircuits = {
  assertCountryEquals(actual_0: CountryCode, expected_0: bigint): [];
  assertRegionCountryEquals(region_0: RegionCode, expectedCountry_0: bigint): [];
}

export type Circuits<PS> = {
  assertCountryEquals(context: __compactRuntime.CircuitContext<PS>,
                      actual_0: CountryCode,
                      expected_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assertRegionCountryEquals(context: __compactRuntime.CircuitContext<PS>,
                            region_0: RegionCode,
                            expectedCountry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
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
