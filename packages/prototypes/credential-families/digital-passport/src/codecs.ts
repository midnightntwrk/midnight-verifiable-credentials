/**
 * @module Codecs
 *
 * ## Compact Value Codec Descriptors
 *
 * Defines `CompactType` descriptors for `DigitalPassportCredential` and `Proof`,
 * enabling compact-value-v1.base64url encoding/decoding via
 * `encodeCompactPayload` / `decodeCompactPayload` from
 * `@midnight-ntwrk/midnight-did-credentials-openid`.
 *
 * These descriptors must match the Compact compiler's generated binary layout
 * for the `digital-passport` credential family. Field order and width are
 * critical — any mismatch will corrupt the encoded payload and make it
 * undecodable by wallets.
 *
 * Modeled after `credentials-compliance/src/codecs.ts` and
 * `credentials-passport-secret/src/codecs.ts` in `midnight-identity-solution-examples`.
 */

import {
  type CompactType,
  CompactTypeBoolean,
  CompactTypeBytes,
  CompactTypeField,
  CompactTypeJubjubPoint,
  CompactTypeUnsignedInteger,
  type Value,
} from "@midnight-ntwrk/compact-runtime";
import {
  decodeCompactPayload,
  encodeCompactPayload,
  type EncodedCompactValue,
} from "@midnight-ntwrk/midnight-did-credentials-openid";

import type {
  DigitalPassportClaimCommitments,
  DigitalPassportCredential,
  ExplicitHolderBinding,
  NoPublicClaims,
  NoStatusBinding,
  Proof,
  SchemaRef,
  Signature,
  VerificationMethodRef,
} from "./managed/digital-passport-credential/contract/index.js";

// ---------------------------------------------------------------------------
// Primitive descriptors
// ---------------------------------------------------------------------------

/** Uint16 — unsigned 16-bit integer (max 65535, 2-byte width) */
const uint16 = new CompactTypeUnsignedInteger(BigInt(65535), 2);

/** Uint64 — unsigned 64-bit integer (max 2^64-1, 8-byte width) */
const uint64 = new CompactTypeUnsignedInteger(
  BigInt("18446744073709551615"),
  8,
);

/** Bytes32 — fixed 32-byte value */
const bytes32 = new CompactTypeBytes(32);

// ---------------------------------------------------------------------------
// Composite descriptors
// ---------------------------------------------------------------------------

/**
 * SchemaRef descriptor — matches the Compact binary layout for SchemaRef.
 *
 * Field order: packageId (Bytes<32>), schemaId (Bytes<32>),
 *              majorVersion (Uint<16>), minorVersion (Uint<16>)
 */
const schemaRefDescriptor: CompactType<SchemaRef> = {
  alignment: () =>
    bytes32
      .alignment()
      .concat(
        bytes32
          .alignment()
          .concat(uint16.alignment().concat(uint16.alignment())),
      ),
  fromValue: (value: Value): SchemaRef => ({
    packageId: bytes32.fromValue(value),
    schemaId: bytes32.fromValue(value),
    majorVersion: uint16.fromValue(value),
    minorVersion: uint16.fromValue(value),
  }),
  toValue: (value: SchemaRef): Value =>
    bytes32
      .toValue(value.packageId)
      .concat(
        bytes32
          .toValue(value.schemaId)
          .concat(
            uint16
              .toValue(value.majorVersion)
              .concat(uint16.toValue(value.minorVersion)),
          ),
      ),
};

/**
 * ContractAddress descriptor — wraps Bytes<32> in a `{ bytes: Uint8Array }` struct.
 *
 * This matches the `didContractAddress` field shape in VerificationMethodRef.
 */
const contractAddressDescriptor: CompactType<{ bytes: Uint8Array }> = {
  alignment: () => bytes32.alignment(),
  fromValue: (value: Value) => ({ bytes: bytes32.fromValue(value) }),
  toValue: (value: { bytes: Uint8Array }) => bytes32.toValue(value.bytes),
};

/**
 * VerificationMethodRef descriptor — matches the Compact binary layout.
 *
 * Field order: didContractAddress (ContractAddress), methodId (Bytes<32>)
 */
const verificationMethodRefDescriptor: CompactType<VerificationMethodRef> = {
  alignment: () =>
    contractAddressDescriptor.alignment().concat(bytes32.alignment()),
  fromValue: (value: Value): VerificationMethodRef => ({
    didContractAddress: contractAddressDescriptor.fromValue(value),
    methodId: bytes32.fromValue(value),
  }),
  toValue: (value: VerificationMethodRef): Value =>
    contractAddressDescriptor
      .toValue(value.didContractAddress)
      .concat(bytes32.toValue(value.methodId)),
};

/**
 * ExplicitHolderBinding descriptor — matches the Compact binary layout.
 *
 * Field order: holderVerificationMethodRef (VerificationMethodRef)
 */
const explicitHolderBindingDescriptor: CompactType<ExplicitHolderBinding> = {
  alignment: () => verificationMethodRefDescriptor.alignment(),
  fromValue: (value: Value): ExplicitHolderBinding => ({
    holderVerificationMethodRef:
      verificationMethodRefDescriptor.fromValue(value),
  }),
  toValue: (value: ExplicitHolderBinding): Value =>
    verificationMethodRefDescriptor.toValue(value.holderVerificationMethodRef),
};

/**
 * NoStatusBinding descriptor — zero-sized empty struct.
 *
 * Empty structs contribute zero bytes in the Compact binary layout.
 * Any non-zero alignment or value conversion would shift subsequent fields
 * and corrupt the encoded payload.
 */
const noStatusBindingDescriptor: CompactType<NoStatusBinding> = {
  alignment: () => [],
  fromValue: () => ({}),
  toValue: () => [],
};

/**
 * NoPublicClaims descriptor — zero-sized empty struct.
 *
 * Same as NoStatusBinding: contributes zero bytes in the Compact binary layout.
 */
const noPublicClaimsDescriptor: CompactType<NoPublicClaims> = {
  alignment: () => [],
  fromValue: () => ({}),
  toValue: () => [],
};

/**
 * DigitalPassportClaimCommitments descriptor — matches the Compact binary layout.
 *
 * Field order: firstNameCommitment (Bytes<32>),
 *              lastNameCommitment (Bytes<32>),
 *              dateOfBirthCommitment (Bytes<32>),
 *              documentNumberCommitment (Bytes<32>),
 *              issuingStateCommitment (Bytes<32>)
 */
const claimCommitmentsDescriptor: CompactType<DigitalPassportClaimCommitments> =
  {
    alignment: () =>
      bytes32
        .alignment()
        .concat(bytes32.alignment())
        .concat(bytes32.alignment())
        .concat(bytes32.alignment())
        .concat(bytes32.alignment()),
    fromValue: (value: Value): DigitalPassportClaimCommitments => ({
      firstNameCommitment: bytes32.fromValue(value),
      lastNameCommitment: bytes32.fromValue(value),
      dateOfBirthCommitment: bytes32.fromValue(value),
      documentNumberCommitment: bytes32.fromValue(value),
      issuingStateCommitment: bytes32.fromValue(value),
    }),
    toValue: (value: DigitalPassportClaimCommitments): Value =>
      bytes32
        .toValue(value.firstNameCommitment)
        .concat(
          bytes32
            .toValue(value.lastNameCommitment)
            .concat(
              bytes32
                .toValue(value.dateOfBirthCommitment)
                .concat(
                  bytes32
                    .toValue(value.documentNumberCommitment)
                    .concat(bytes32.toValue(value.issuingStateCommitment)),
                ),
            ),
        ),
  };

/**
 * Signature descriptor — matches the Compact binary layout.
 *
 * Field order: r (JubjubPoint), s (Field)
 */
const signatureDescriptor: CompactType<Signature> = {
  alignment: () =>
    CompactTypeJubjubPoint.alignment().concat(CompactTypeField.alignment()),
  fromValue: (value: Value): Signature => ({
    r: CompactTypeJubjubPoint.fromValue(value),
    s: CompactTypeField.fromValue(value),
  }),
  toValue: (value: Signature): Value =>
    CompactTypeJubjubPoint.toValue(value.r).concat(
      CompactTypeField.toValue(value.s),
    ),
};

/**
 * DigitalPassportCredential descriptor — matches the Compact compiler's
 * generated binary layout for the `digital-passport` family.
 *
 * Field order (must match Compact compiler output exactly):
 * 1. version (Uint<16>)
 * 2. schema (SchemaRef)
 * 3. issuerVerificationMethodRef (VerificationMethodRef)
 * 4. holderBinding (ExplicitHolderBinding)
 * 5. statusBinding (NoStatusBinding — zero-sized)
 * 6. issuedAt (Uint<64>)
 * 7. hasExpiration (Boolean)
 * 8. expiresAt (Uint<64>)
 * 9. claims (NoPublicClaims — zero-sized)
 * 10. claimCommitments (DigitalPassportClaimCommitments)
 * 11. claimRoot (Bytes<32>)
 */
export const digitalPassportCredentialDescriptor: CompactType<DigitalPassportCredential> =
  {
    alignment: () =>
      uint16
        .alignment()
        .concat(
          schemaRefDescriptor
            .alignment()
            .concat(
              verificationMethodRefDescriptor
                .alignment()
                .concat(
                  explicitHolderBindingDescriptor
                    .alignment()
                    .concat(
                      noStatusBindingDescriptor
                        .alignment()
                        .concat(
                          uint64
                            .alignment()
                            .concat(
                              CompactTypeBoolean.alignment().concat(
                                uint64
                                  .alignment()
                                  .concat(
                                    noPublicClaimsDescriptor
                                      .alignment()
                                      .concat(
                                        claimCommitmentsDescriptor
                                          .alignment()
                                          .concat(bytes32.alignment()),
                                      ),
                                  ),
                              ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
    fromValue: (value: Value): DigitalPassportCredential => ({
      version: uint16.fromValue(value),
      schema: schemaRefDescriptor.fromValue(value),
      issuerVerificationMethodRef:
        verificationMethodRefDescriptor.fromValue(value),
      holderBinding: explicitHolderBindingDescriptor.fromValue(value),
      statusBinding: noStatusBindingDescriptor.fromValue(value),
      issuedAt: uint64.fromValue(value),
      hasExpiration: CompactTypeBoolean.fromValue(value),
      expiresAt: uint64.fromValue(value),
      claims: noPublicClaimsDescriptor.fromValue(value),
      claimCommitments: claimCommitmentsDescriptor.fromValue(value),
      claimRoot: bytes32.fromValue(value),
    }),
    toValue: (value: DigitalPassportCredential): Value =>
      uint16
        .toValue(value.version)
        .concat(
          schemaRefDescriptor
            .toValue(value.schema)
            .concat(
              verificationMethodRefDescriptor
                .toValue(value.issuerVerificationMethodRef)
                .concat(
                  explicitHolderBindingDescriptor
                    .toValue(value.holderBinding)
                    .concat(
                      noStatusBindingDescriptor
                        .toValue(value.statusBinding)
                        .concat(
                          uint64
                            .toValue(value.issuedAt)
                            .concat(
                              CompactTypeBoolean.toValue(
                                value.hasExpiration,
                              ).concat(
                                uint64
                                  .toValue(value.expiresAt)
                                  .concat(
                                    noPublicClaimsDescriptor
                                      .toValue(value.claims)
                                      .concat(
                                        claimCommitmentsDescriptor
                                          .toValue(value.claimCommitments)
                                          .concat(
                                            bytes32.toValue(value.claimRoot),
                                          ),
                                      ),
                                  ),
                              ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
  };

/**
 * Proof descriptor — matches the Compact binary layout for proof types.
 *
 * Field order:
 * 1. signerVerificationMethodRef (VerificationMethodRef)
 * 2. createdAt (Uint<64>)
 * 3. challengeHash (Bytes<32>)
 * 4. publicKey (JubjubPoint)
 * 5. signature (Signature)
 */
export const digitalPassportProofDescriptor: CompactType<Proof> = {
  alignment: () =>
    verificationMethodRefDescriptor
      .alignment()
      .concat(
        uint64
          .alignment()
          .concat(
            bytes32
              .alignment()
              .concat(
                CompactTypeJubjubPoint.alignment().concat(
                  signatureDescriptor.alignment(),
                ),
              ),
          ),
      ),
  fromValue: (value: Value): Proof => ({
    signerVerificationMethodRef:
      verificationMethodRefDescriptor.fromValue(value),
    createdAt: uint64.fromValue(value),
    challengeHash: bytes32.fromValue(value),
    publicKey: CompactTypeJubjubPoint.fromValue(value),
    signature: signatureDescriptor.fromValue(value),
  }),
  toValue: (value: Proof): Value =>
    verificationMethodRefDescriptor
      .toValue(value.signerVerificationMethodRef)
      .concat(
        uint64
          .toValue(value.createdAt)
          .concat(
            bytes32
              .toValue(value.challengeHash)
              .concat(
                CompactTypeJubjubPoint.toValue(value.publicKey).concat(
                  signatureDescriptor.toValue(value.signature),
                ),
              ),
          ),
      ),
};

// ---------------------------------------------------------------------------
// Convenience encode/decode helpers
// ---------------------------------------------------------------------------

/**
 * Encode a DigitalPassportCredential as a compact-value-v1.base64url payload.
 */
export function encodeDigitalPassportCredential(
  credential: DigitalPassportCredential,
): EncodedCompactValue {
  return encodeCompactPayload(digitalPassportCredentialDescriptor, credential);
}

/**
 * Decode a compact-value-v1.base64url payload back into a DigitalPassportCredential.
 */
export function decodeDigitalPassportCredential(
  encoded: EncodedCompactValue,
): DigitalPassportCredential {
  return decodeCompactPayload(digitalPassportCredentialDescriptor, encoded);
}

/**
 * Encode a Proof as a compact-value-v1.base64url payload.
 */
export function encodeDigitalPassportProof(proof: Proof): EncodedCompactValue {
  return encodeCompactPayload(digitalPassportProofDescriptor, proof);
}

/**
 * Decode a compact-value-v1.base64url payload back into a Proof.
 */
export function decodeDigitalPassportProof(
  encoded: EncodedCompactValue,
): Proof {
  return decodeCompactPayload(digitalPassportProofDescriptor, encoded);
}
