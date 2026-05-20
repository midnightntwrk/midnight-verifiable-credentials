import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";

import type { Ledger } from "./managed/demo-revocation/contract/index.js";

export type CredentialsDemoRevocationPrivateState = {
  readonly holderSecret: Uint8Array;
  readonly holderSecretOpening: Uint8Array;
  readonly holderBindingBlindingFactor: Uint8Array;
  readonly holderBirthDateDays: bigint;
  readonly holderBirthDateOpening: Uint8Array;
};

export const revocationWitnesses = {
  holderSecret: ({
    privateState,
  }: WitnessContext<Ledger, CredentialsDemoRevocationPrivateState>): [
    CredentialsDemoRevocationPrivateState,
    Uint8Array,
  ] => [privateState, privateState.holderSecret],
  holderSecretOpening: ({
    privateState,
  }: WitnessContext<Ledger, CredentialsDemoRevocationPrivateState>): [
    CredentialsDemoRevocationPrivateState,
    Uint8Array,
  ] => [privateState, privateState.holderSecretOpening],
  holderBindingBlindingFactor: ({
    privateState,
  }: WitnessContext<Ledger, CredentialsDemoRevocationPrivateState>): [
    CredentialsDemoRevocationPrivateState,
    Uint8Array,
  ] => [privateState, privateState.holderBindingBlindingFactor],
  holderBirthDateDays: ({
    privateState,
  }: WitnessContext<Ledger, CredentialsDemoRevocationPrivateState>): [
    CredentialsDemoRevocationPrivateState,
    bigint,
  ] => [privateState, privateState.holderBirthDateDays],
  holderBirthDateOpening: ({
    privateState,
  }: WitnessContext<Ledger, CredentialsDemoRevocationPrivateState>): [
    CredentialsDemoRevocationPrivateState,
    Uint8Array,
  ] => [privateState, privateState.holderBirthDateOpening],
};
