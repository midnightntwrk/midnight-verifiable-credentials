import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";

import type { Ledger } from "./managed/hello-verifier/contract/index.js";

export type HelloVerifierPrivateState = {
  readonly holderBirthDateDays: bigint;
  readonly holderBirthDateOpening: Uint8Array;
};

export const helloVerifierWitnesses = {
  holderBirthDateDays: ({
    privateState,
  }: WitnessContext<Ledger, HelloVerifierPrivateState>): [
    HelloVerifierPrivateState,
    bigint,
  ] => [privateState, privateState.holderBirthDateDays],
  holderBirthDateOpening: ({
    privateState,
  }: WitnessContext<Ledger, HelloVerifierPrivateState>): [
    HelloVerifierPrivateState,
    Uint8Array,
  ] => [privateState, privateState.holderBirthDateOpening],
};
