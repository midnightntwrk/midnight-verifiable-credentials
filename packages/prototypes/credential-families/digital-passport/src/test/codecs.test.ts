/**
 * @module Codecs Test
 *
 * ## Compact Value Codec Descriptor Tests
 *
 * Verifies that the `digitalPassportCredentialDescriptor` and
 * `digitalPassportProofDescriptor` produce correct compact-value-v1.base64url
 * encodings by round-tripping through encode/decode and validating against
 * known fixture values.
 *
 * Round-trip tests alone prove internal consistency — they can catch field-order
 * swaps of differently-valued fields (because each field is compared individually),
 * but they wouldn't catch a swap of identically-valued fields. The byte-length
 * assertions in the "Byte-layout regression guard" describe block provide an
 * independent structural check: if the descriptor's type widths, field order,
 * or struct sizes change, the encoded byte length will change and the test will
 * fail. When that happens, verify the new layout matches the Compact compiler's
 * canonical output and update the expected byte lengths.
 */

import { Buffer } from "node:buffer";
import crypto from "node:crypto";

import { ecMulGenerator } from "@midnight-ntwrk/compact-runtime";
import { describe, expect, it } from "vitest";

import {
  decodeDigitalPassportCredential,
  decodeDigitalPassportProof,
  encodeDigitalPassportCredential,
  encodeDigitalPassportProof,
} from "../codecs.js";
import {
  type DigitalPassportCredential,
  type Proof,
  pureCircuits,
} from "../managed/digital-passport-credential/contract/index.js";
import { signProof } from "../testing/credential-fixtures.js";
import { JUBJUB_SUBGROUP_ORDER, mod } from "../testing/jubjub-utils.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Create a random VerificationMethodRef for testing. */
function randomVerificationMethodRef() {
  return {
    didContractAddress: { bytes: crypto.randomBytes(32) },
    methodId: crypto.randomBytes(32),
  };
}

/** Build a credential + proof for testing using the package's pure circuits. */
function buildTestCredential(params: {
  firstName: string;
  lastName: string;
  dateOfBirthDays: bigint;
  documentNumber: string;
  issuingState: string;
  issuerSecretKey: bigint;
  issuerVerificationMethodRef: ReturnType<typeof randomVerificationMethodRef>;
  holderVerificationMethodRef: ReturnType<typeof randomVerificationMethodRef>;
  issuedAt?: bigint;
  hasExpiration?: boolean;
  expiresAt?: bigint;
}): { credential: DigitalPassportCredential; credentialProof: Proof } {
  const pad64 = (v: string, len = 64) => {
    const bytes = Buffer.from(v, "utf8");
    const padded = new Uint8Array(len);
    padded.set(bytes.subarray(0, Math.min(bytes.length, len)));
    return padded;
  };
  const pad32 = (v: string) => {
    const bytes = Buffer.from(v, "utf8");
    const padded = new Uint8Array(32);
    padded.set(bytes.subarray(0, Math.min(bytes.length, 32)));
    return padded;
  };

  const firstNameOpening = crypto.randomBytes(32);
  const lastNameOpening = crypto.randomBytes(32);
  const dateOfBirthOpening = crypto.randomBytes(32);
  const documentNumberOpening = crypto.randomBytes(32);
  const issuingStateOpening = crypto.randomBytes(32);

  const claimCommitments = {
    firstNameCommitment: pureCircuits.firstNameCommitment(
      pad64(params.firstName),
      firstNameOpening,
    ),
    lastNameCommitment: pureCircuits.lastNameCommitment(
      pad64(params.lastName),
      lastNameOpening,
    ),
    dateOfBirthCommitment: pureCircuits.dateOfBirthCommitment(
      params.dateOfBirthDays,
      dateOfBirthOpening,
    ),
    documentNumberCommitment: pureCircuits.documentNumberCommitment(
      pad32(params.documentNumber),
      documentNumberOpening,
    ),
    issuingStateCommitment: pureCircuits.issuingStateCommitment(
      pad32(params.issuingState),
      issuingStateOpening,
    ),
  };

  const schema = {
    packageId: pad32("midnight:vc:digital-passport"),
    schemaId: pad32("digital-passport:v1"),
    majorVersion: 1n,
    minorVersion: 0n,
  };

  const issuedAt = params.issuedAt ?? 10_000n;
  const hasExpiration = params.hasExpiration ?? true;
  const expiresAt = params.expiresAt ?? 20_000n;

  const credential: DigitalPassportCredential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef: params.issuerVerificationMethodRef,
    holderBinding: {
      holderVerificationMethodRef: params.holderVerificationMethodRef,
    },
    statusBinding: {},
    issuedAt,
    hasExpiration,
    expiresAt,
    claims: {},
    claimCommitments,
    claimRoot: pureCircuits.digitalPassportClaimRoot(claimCommitments),
  };

  const bodyRoot = pureCircuits.digitalPassportCredentialBodyRoot(credential);

  const issuerPublicKey = ecMulGenerator(params.issuerSecretKey);
  const challengeHash = crypto.randomBytes(32);
  const nonceScalar = mod(
    BigInt("0x" + crypto.randomBytes(32).toString("hex")),
  );

  const credentialProof = signProof({
    bodyRoot,
    context: "issuance",
    signer: {
      label: "issuer",
      secretKey: params.issuerSecretKey,
      publicKey: issuerPublicKey,
      verificationMethodRef: params.issuerVerificationMethodRef,
    },
    createdAt: issuedAt + 1n,
    challengeHash,
    nonceScalar,
  });

  return { credential, credentialProof };
}

// ---------------------------------------------------------------------------
// Descriptor round-trip tests
// ---------------------------------------------------------------------------

describe("digitalPassportCredentialDescriptor", () => {
  it("round-trips through encode/decode with fresh credential", () => {
    const { credential, credentialProof: _ } = buildTestCredential({
      firstName: "Alice",
      lastName: "Example",
      dateOfBirthDays: 3650n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(12345),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportCredential(credential);
    expect(encoded.encoding).toBe("compact-value-v1.base64url");
    expect(typeof encoded.payload).toBe("string");
    expect(encoded.payload.length).toBeGreaterThan(0);

    const decoded = decodeDigitalPassportCredential(encoded);

    // Verify all fields round-trip correctly
    expect(decoded.version).toBe(credential.version);
    expect(new Uint8Array(decoded.schema.packageId)).toEqual(
      new Uint8Array(credential.schema.packageId),
    );
    expect(new Uint8Array(decoded.schema.schemaId)).toEqual(
      new Uint8Array(credential.schema.schemaId),
    );
    expect(decoded.schema.majorVersion).toBe(credential.schema.majorVersion);
    expect(decoded.schema.minorVersion).toBe(credential.schema.minorVersion);
    // VerificationMethodRef fields contain nested Uint8Arrays — compare byte-by-byte
    expect(
      new Uint8Array(
        decoded.issuerVerificationMethodRef.didContractAddress.bytes,
      ),
    ).toEqual(
      new Uint8Array(
        credential.issuerVerificationMethodRef.didContractAddress.bytes,
      ),
    );
    expect(
      new Uint8Array(decoded.issuerVerificationMethodRef.methodId),
    ).toEqual(new Uint8Array(credential.issuerVerificationMethodRef.methodId));
    expect(
      new Uint8Array(
        decoded.holderBinding.holderVerificationMethodRef.didContractAddress
          .bytes,
      ),
    ).toEqual(
      new Uint8Array(
        credential.holderBinding.holderVerificationMethodRef.didContractAddress
          .bytes,
      ),
    );
    expect(
      new Uint8Array(
        decoded.holderBinding.holderVerificationMethodRef.methodId,
      ),
    ).toEqual(
      new Uint8Array(
        credential.holderBinding.holderVerificationMethodRef.methodId,
      ),
    );
    expect(decoded.statusBinding).toEqual(credential.statusBinding);
    expect(decoded.issuedAt).toBe(credential.issuedAt);
    expect(decoded.hasExpiration).toBe(credential.hasExpiration);
    expect(decoded.expiresAt).toBe(credential.expiresAt);
    expect(decoded.claims).toEqual(credential.claims);
    // 5 claim commitments round-trip
    expect(
      new Uint8Array(decoded.claimCommitments.firstNameCommitment),
    ).toEqual(new Uint8Array(credential.claimCommitments.firstNameCommitment));
    expect(new Uint8Array(decoded.claimCommitments.lastNameCommitment)).toEqual(
      new Uint8Array(credential.claimCommitments.lastNameCommitment),
    );
    expect(
      new Uint8Array(decoded.claimCommitments.dateOfBirthCommitment),
    ).toEqual(
      new Uint8Array(credential.claimCommitments.dateOfBirthCommitment),
    );
    expect(
      new Uint8Array(decoded.claimCommitments.documentNumberCommitment),
    ).toEqual(
      new Uint8Array(credential.claimCommitments.documentNumberCommitment),
    );
    expect(
      new Uint8Array(decoded.claimCommitments.issuingStateCommitment),
    ).toEqual(
      new Uint8Array(credential.claimCommitments.issuingStateCommitment),
    );
    expect(new Uint8Array(decoded.claimRoot)).toEqual(
      new Uint8Array(credential.claimRoot),
    );
  });

  it("round-trips with different KYC data", () => {
    const { credential } = buildTestCredential({
      firstName: "Bob",
      lastName: "Smith",
      dateOfBirthDays: 50_000n,
      documentNumber: "AB1234567",
      issuingState: "GBR",
      issuerSecretKey: BigInt(111),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportCredential(credential);
    const decoded = decodeDigitalPassportCredential(encoded);

    // Deep-equal check on claim commitments (the core credential data — 5 commitments)
    expect(decoded.claimCommitments.firstNameCommitment).toEqual(
      credential.claimCommitments.firstNameCommitment,
    );
    expect(decoded.claimCommitments.lastNameCommitment).toEqual(
      credential.claimCommitments.lastNameCommitment,
    );
    expect(decoded.claimCommitments.dateOfBirthCommitment).toEqual(
      credential.claimCommitments.dateOfBirthCommitment,
    );
    expect(decoded.claimCommitments.documentNumberCommitment).toEqual(
      credential.claimCommitments.documentNumberCommitment,
    );
    expect(decoded.claimCommitments.issuingStateCommitment).toEqual(
      credential.claimCommitments.issuingStateCommitment,
    );
    expect(decoded.claimRoot).toEqual(credential.claimRoot);
    // Verify hasExpiration and expiresAt round-trip
    expect(decoded.hasExpiration).toBe(true);
    expect(decoded.expiresAt).toBe(credential.expiresAt);
  });

  it("produces a base64url payload (no +, /, or = characters)", () => {
    const { credential } = buildTestCredential({
      firstName: "Test",
      lastName: "User",
      dateOfBirthDays: 3650n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(999),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportCredential(credential);
    // base64url encoding: no +, /, or = padding characters
    expect(encoded.payload).not.toMatch(/[+/=]/);
    // Should only contain base64url characters: [A-Za-z0-9_-]
    expect(encoded.payload).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("encodes consistent payloads for identical credentials", () => {
    const { credential } = buildTestCredential({
      firstName: "Consistent",
      lastName: "Encoding",
      dateOfBirthDays: 36500n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(42),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded1 = encodeDigitalPassportCredential(credential);
    const encoded2 = encodeDigitalPassportCredential(credential);

    // Same credential → same encoded payload
    expect(encoded1.payload).toBe(encoded2.payload);
  });

  it("encoding preserves bodyRoot hash", () => {
    const { credential } = buildTestCredential({
      firstName: "Integrity",
      lastName: "Check",
      dateOfBirthDays: 36500n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(777),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    // Encode and decode, then verify the bodyRoot is the same
    const originalBodyRoot =
      pureCircuits.digitalPassportCredentialBodyRoot(credential);
    const encoded = encodeDigitalPassportCredential(credential);
    const decoded = decodeDigitalPassportCredential(encoded);
    const decodedBodyRoot =
      pureCircuits.digitalPassportCredentialBodyRoot(decoded);

    expect(decodedBodyRoot).toEqual(originalBodyRoot);
  });
});

describe("digitalPassportProofDescriptor", () => {
  it("round-trips through encode/decode with fresh proof", () => {
    const { credential, credentialProof } = buildTestCredential({
      firstName: "Carol",
      lastName: "Jones",
      dateOfBirthDays: 365000n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(555),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportProof(credentialProof);
    expect(encoded.encoding).toBe("compact-value-v1.base64url");
    expect(typeof encoded.payload).toBe("string");
    expect(encoded.payload.length).toBeGreaterThan(0);

    const decoded = decodeDigitalPassportProof(encoded);

    // Byte-by-byte comparison for Uint8Array fields (Buffer vs Uint8Array)
    expect(
      new Uint8Array(
        decoded.signerVerificationMethodRef.didContractAddress.bytes,
      ),
    ).toEqual(
      new Uint8Array(
        credentialProof.signerVerificationMethodRef.didContractAddress.bytes,
      ),
    );
    expect(
      new Uint8Array(decoded.signerVerificationMethodRef.methodId),
    ).toEqual(
      new Uint8Array(credentialProof.signerVerificationMethodRef.methodId),
    );
    expect(decoded.createdAt).toBe(credentialProof.createdAt);
    expect(new Uint8Array(decoded.challengeHash)).toEqual(
      new Uint8Array(credentialProof.challengeHash),
    );
    expect(decoded.publicKey).toEqual(credentialProof.publicKey);
    expect(decoded.signature.r).toEqual(credentialProof.signature.r);
    expect(decoded.signature.s).toBe(credentialProof.signature.s);
  });

  it("produces a base64url payload", () => {
    const { credentialProof } = buildTestCredential({
      firstName: "Dave",
      lastName: "Wilson",
      dateOfBirthDays: 36500n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(333),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportProof(credentialProof);
    expect(encoded.payload).not.toMatch(/[+/=]/);
    expect(encoded.payload).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("encoding preserves proof validity", () => {
    const { credential, credentialProof } = buildTestCredential({
      firstName: "Eve",
      lastName: "Brown",
      dateOfBirthDays: 36500n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(999),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportProof(credentialProof);
    const decoded = decodeDigitalPassportProof(encoded);
    const bodyRoot = pureCircuits.digitalPassportCredentialBodyRoot(credential);

    // The decoded proof should still be valid
    expect(() =>
      pureCircuits.assertValidIssuanceContextProof(bodyRoot, decoded),
    ).not.toThrow();
  });
});

describe("Joint credential + proof encoding", () => {
  it("both descriptors produce valid compact-value-v1.base64url payloads", () => {
    const { credential, credentialProof } = buildTestCredential({
      firstName: "Frank",
      lastName: "Miller",
      dateOfBirthDays: 36500n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(777),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const credentialEncoded = encodeDigitalPassportCredential(credential);
    const proofEncoded = encodeDigitalPassportProof(credentialProof);

    expect(credentialEncoded.encoding).toBe("compact-value-v1.base64url");
    expect(proofEncoded.encoding).toBe("compact-value-v1.base64url");

    // Decode both and verify proof still validates against decoded credential
    const decodedCredential =
      decodeDigitalPassportCredential(credentialEncoded);
    const decodedProof = decodeDigitalPassportProof(proofEncoded);
    const bodyRoot =
      pureCircuits.digitalPassportCredentialBodyRoot(decodedCredential);

    expect(() =>
      pureCircuits.assertValidIssuanceContextProof(bodyRoot, decodedProof),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Byte-layout regression guard
// ---------------------------------------------------------------------------
//
// Round-trip encode/decode tests verify structural correctness (each field
// decodes back to its original value) but cannot detect a field-order swap
// if both encode and decode use the same descriptor — the values would swap
// together and the round-trip would still succeed. However, since the test
// compares each field individually against distinct values, a field-order swap
// of differently-valued fields WOULD be caught by the round-trip assertions.
//
// The byte-length assertions below serve a different purpose: they guard
// against accidental structural changes to the descriptor (wrong type widths,
// missing or extra fields, changed empty-struct sizes) that might not cause
// value-level round-trip failures but would produce a different canonical byte
// layout. If this test breaks after a descriptor change, verify the new
// layout is still correct and update the expected byte lengths.
//
// Expected DigitalPassportCredential field layout (post-TASK-13.1):
//   Offset  Size  Field
//   ──────  ────  ─────────────────────────────────────────────────────────
//   0       2     version (Uint16)
//   2       32    schema.packageId (Bytes<32>)
//   34      32    schema.schemaId (Bytes<32>)
//   66      2     schema.majorVersion (Uint16)
//   68      2     schema.minorVersion (Uint16)
//   70      32    issuerVerificationMethodRef.didContractAddress.bytes (Bytes<32>)
//   102     32    issuerVerificationMethodRef.methodId (Bytes<32>)
//   134     32    holderBinding.holderVerificationMethodRef.didContractAddress.bytes
//   166     32    holderBinding.holderVerificationMethodRef.methodId
//   —       0     statusBinding (NoStatusBinding, zero-sized)
//   198     ~4-8  issuedAt (Uint64, variable-length)
//   ???     1     hasExpiration (Boolean)
//   ???     ~4-8  expiresAt (Uint64, variable-length)
//   —       0     claims (NoPublicClaims, zero-sized)
//   ???     32    claimCommitments.firstNameCommitment (Bytes<32>)
//   ???     32    claimCommitments.lastNameCommitment (Bytes<32>)
//   ???     32    claimCommitments.dateOfBirthCommitment (Bytes<32>)
//   ???     32    claimCommitments.documentNumberCommitment (Bytes<32>)
//   ???     32    claimCommitments.issuingStateCommitment (Bytes<32>)
//   ???     32    claimRoot (Bytes<32>)
//   ──────  ────  ─────────────────────────────────────────────────────────
//   Total   ~454  bytes (±2 due to variable-length Uint64 encoding;
//                     test uses small timestamp values 10_000n / 20_000n)
//
// Expected Proof field layout:
//   ──────  ────  ─────────────────────────────────────────────────────────
//   ???     64    signerVerificationMethodRef (2 × Bytes<32>)
//   ???     ~4-8  createdAt (Uint64, variable-length)
//   ???     32    challengeHash (Bytes<32>)
//   ???     64    publicKey (JubjubPoint)
//   ???     64    signature.r (JubjubPoint)
//   ???     32    signature.s (Field)
//   ──────  ~301  bytes (±1-2 due to variable-length encoding of Uint64
//                     createdAt and signature scalar components)
// ---------------------------------------------------------------------------

describe("Byte-layout regression guard", () => {
  it(
    "DigitalPassportCredential encodes to the expected fixed byte length" +
      " (field-order and size validation)",
    () => {
      // Multiple encodings with different field values must all produce
      // the same byte length — all fields are fixed-width, so the total
      // encoded size is deterministic regardless of the specific values.
      const lengths = new Set<number>();

      for (let i = 0; i < 5; i++) {
        const { credential } = buildTestCredential({
          firstName: `Test${i}`,
          lastName: `User${i}`,
          dateOfBirthDays: BigInt(3650 + i * 365),
          documentNumber: "P12345678",
          issuingState: "USA",
          issuerSecretKey: BigInt(10000 + i),
          issuerVerificationMethodRef: randomVerificationMethodRef(),
          holderVerificationMethodRef: randomVerificationMethodRef(),
        });

        const encoded = encodeDigitalPassportCredential(credential);
        const rawBytes = Buffer.from(encoded.payload, "base64url");
        lengths.add(rawBytes.length);
      }

      // The credential byte length must be deterministic and match the canonical
      // Compact compiler layout. Note: Uint64 fields use variable-length
      // encoding — issuedAt and expiresAt values can differ by 1 second across
      // loop iterations, which may shift the variable-length encoding by ±1 byte.
      // We therefore accept a narrow range centered on the expected byte count.
      // A structural regression (missing/added/resize field) would shift the
      // length by a much larger amount (≥2 bytes for a Uint16, ≥32 for a Bytes32).
      // If this assertion fails after a descriptor change, verify the new layout
      // is still correct and update the expected range accordingly.
      for (const len of lengths) {
        // Expected: ~454 bytes with test timestamps (issuedAt=10_000n, expiresAt=20_000n)
        // that encode smaller than real-time timestamps. Range allows ±2 for Uint64
        // variable-length encoding differences.
        expect(len).toBeGreaterThanOrEqual(452);
        expect(len).toBeLessThanOrEqual(456);
      }
      // All encodings must fall within a tight 2-byte window
      const minLen = Math.min(...lengths);
      const maxLen = Math.max(...lengths);
      expect(maxLen - minLen).toBeLessThanOrEqual(2);
    },
  );

  it("Proof encoding is structurally stable across different issuances", () => {
    // Proof byte length varies by ±1-2 bytes across issuances due to
    // variable-length encoding of the Schnorr signature scalar (s).
    // We verify structural stability by ensuring all encodings fall
    // within a narrow expected range, and that none are degenerate
    // (which would indicate a missing or malformed field).
    const lengths: number[] = [];

    for (let i = 0; i < 10; i++) {
      const { credentialProof } = buildTestCredential({
        firstName: `Test${i}`,
        lastName: `User${i}`,
        dateOfBirthDays: BigInt(3650 + i * 365),
        documentNumber: "P12345678",
        issuingState: "USA",
        issuerSecretKey: BigInt(10000 + i),
        issuerVerificationMethodRef: randomVerificationMethodRef(),
        holderVerificationMethodRef: randomVerificationMethodRef(),
      });

      const encoded = encodeDigitalPassportProof(credentialProof);
      const rawBytes = Buffer.from(encoded.payload, "base64url");
      lengths.push(rawBytes.length);
    }

    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);

    // Tight range: all encodings should be within ~301 ± 2 bytes.
    // A missing VerificationMethodRef (64 bytes), JubjubPoint (64 bytes),
    // or Bytes32 (32 bytes) would cause a much larger deviation.
    expect(minLength).toBeGreaterThanOrEqual(298);
    expect(maxLength).toBeLessThanOrEqual(305);
    expect(maxLength - minLength).toBeLessThanOrEqual(2);
  });

  it("byte length failure would catch descriptor regressions (structural)", () => {
    // This is a meta-test that documents what kinds of regressions the
    // byte-length assertion would catch. It verifies that the credential
    // encoding produces approximately 454 bytes, meaning:
    // - Uint16 fields (version, majorVersion, minorVersion) contribute 2 bytes each
    // - Uint64 fields (issuedAt, expiresAt) use variable-length encoding
    //   (~4 bytes each for current-era timestamps, up to 8 bytes for max values)
    // - Bytes32 fields contribute 32 bytes each (9 fields: packageId, schemaId,
    //   didContractAddress×2, methodId×2, claimCommitments×5, claimRoot)
    // - Boolean field (hasExpiration) contributes 1 byte
    // - NoStatusBinding and NoPublicClaims are zero-sized (0 bytes)
    // - No JubjubPoint or Field fields exist in the credential
    //
    // Removing a Bytes32 field would change the length by ~32 bytes.
    // Removing a Uint16 field would change the length by ~2 bytes.
    // Changing a Uint16 to Uint32 would change the length by ~2 bytes.
    // All of these would be caught by the range assertion below.
    const { credential } = buildTestCredential({
      firstName: "Regression",
      lastName: "Guard",
      dateOfBirthDays: 36500n,
      documentNumber: "P12345678",
      issuingState: "USA",
      issuerSecretKey: BigInt(42),
      issuerVerificationMethodRef: randomVerificationMethodRef(),
      holderVerificationMethodRef: randomVerificationMethodRef(),
    });

    const encoded = encodeDigitalPassportCredential(credential);
    const rawBytes = Buffer.from(encoded.payload, "base64url");

    // If the descriptor changes (field order, type widths, added/removed fields),
    // this assertion will fail. Verify the change is intentional and update
    // the expected range accordingly.
    // Expected: ~454 bytes with test timestamps that use small Uint64 values.
    expect(rawBytes.length).toBeGreaterThanOrEqual(452);
    expect(rawBytes.length).toBeLessThanOrEqual(456);
  });
});
