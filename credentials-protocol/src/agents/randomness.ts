import { Buffer } from "node:buffer";

import { mod, sha256 } from "../shared/crypto.js";

export type ProtocolRandomnessFlow =
  | "explicit-issuance"
  | "explicit-presentation"
  | "blinded-secret-issuance"
  | "blinded-secret-presentation";

export type ProtocolRandomnessPurpose =
  | "holder-challenge"
  | "verifier-challenge"
  | "issuer-nonce"
  | "holder-binding-blinding-factor"
  | "signing-nonce";

export type ProtocolRandomnessContext = {
  readonly partyLabel: string;
  readonly flow: ProtocolRandomnessFlow;
  readonly purpose: ProtocolRandomnessPurpose;
  readonly sequence: number;
  readonly threadId?: Uint8Array;
  readonly respondsToMessageId?: Uint8Array;
};

export interface ProtocolRandomnessSource {
  nextChallengeHash(context: ProtocolRandomnessContext): Uint8Array;
  nextIssuerNonce(context: ProtocolRandomnessContext): Uint8Array;
  nextBlindingFactor(context: ProtocolRandomnessContext): Uint8Array;
  nextSigningNonceScalar(context: ProtocolRandomnessContext): bigint;
}

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  bytes.reduce((accumulator, byte) => (accumulator << 8n) + BigInt(byte), 0n);

const encodeContext = (
  kind: string,
  context: ProtocolRandomnessContext,
): string => {
  const parts = [
    "midnight:vc:protocol-randomness",
    kind,
    context.partyLabel,
    context.flow,
    context.purpose,
    `sequence:${context.sequence}`,
  ];

  if (context.threadId) {
    parts.push(`thread:${Buffer.from(context.threadId).toString("hex")}`);
  }
  if (context.respondsToMessageId) {
    parts.push(
      `respondsTo:${Buffer.from(context.respondsToMessageId).toString("hex")}`,
    );
  }

  return parts.join(":");
};

export class ReferenceDeterministicRandomnessSource
implements ProtocolRandomnessSource
{
  nextChallengeHash(context: ProtocolRandomnessContext): Uint8Array {
    return sha256(encodeContext("challenge-hash", context));
  }

  nextIssuerNonce(context: ProtocolRandomnessContext): Uint8Array {
    return sha256(encodeContext("issuer-nonce", context));
  }

  nextBlindingFactor(context: ProtocolRandomnessContext): Uint8Array {
    return sha256(encodeContext("blinding-factor", context));
  }

  nextSigningNonceScalar(context: ProtocolRandomnessContext): bigint {
    const scalar = mod( bytesToBigInt(sha256(encodeContext("signing-nonce", context))) );
    return scalar === 0n ? 1n : scalar;
  }
}

export const referenceProtocolRandomnessSource =
  new ReferenceDeterministicRandomnessSource();
