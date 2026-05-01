<!--
  This file is part of midnightntwrk/midnight-verifiable-credentials.
  Copyright (C) 2026 Midnight Foundation
  SPDX-License-Identifier: Apache-2.0
-->

# Lightweight Holder Binding Extension Plan

## Issue

- [#6](https://github.com/midnightntwrk/midnight-verifiable-credentials/issues/6)

## Goal

Add lightweight Midnight VC holder-binding profiles for prototypes and demos
that do not want to require full DID deployment and DID resolution.

## Why `JubjubHolderBinding` is still needed

Yes, we really need it.

Reason:

- it is the smallest viable prototype binding profile
- it matches the current Midnight proof suite directly
- it works for NightFi and Passport-style demos immediately
- it remains useful even after offchain Midnight DID exists

`OffchainMidnightHolderBinding` should build on the same idea, not replace it.

## New binding profiles

### 1. `JubjubHolderBinding`

Bind the credential holder directly to a JubJub public key.

Purpose:

- local issuer/holder demos
- contract examples
- prototype issuance and presentation without DID resolution

### 2. `OffchainMidnightHolderBinding`

Carry:

- holder offchain DID state hash
- holder method id
- holder JubJub public key

Purpose:

- DID-shaped demo flows
- portable examples that use the offchain Midnight DID extension

## Current implementation constraint

The generic `Proof` type still carries a DID-oriented `VerificationMethodRef`.
That means the new lightweight binding profiles currently enforce holder
ownership through `proof.publicKey`, not through `proof.signerVerificationMethodRef`.

This is acceptable for the first slice because the cryptographic property that
matters most for the demo is proof-of-possession of the bound holder key.

## Recommended follow-up

Later, if we want offchain DID binding to be first-class all the way through the
proof object, we should consider a more general signer reference abstraction.
That is a larger proof-model change and should not block the lightweight binding
profiles now.
