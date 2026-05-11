import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import {
  type ResolvedPortableOffchainMidnightDID,
  resolvePortableOffchainMidnightDID,
} from "@midnight-ntwrk/midnight-did";
import type { OffchainMidnightHolderBinding as CoreOffchainMidnightHolderBinding } from "@midnight-ntwrk/midnight-did-credentials";
import {
  createPortableOffchainMidnightDIDUrl,
  CurveType,
  KeyType,
} from "@midnight-ntwrk/midnight-did-domain";

const textEncoder = new TextEncoder();
const BYTES32_LENGTH = 32;
const HEX_BYTES32_LENGTH = BYTES32_LENGTH * 2;
const OFFCHAIN_DID_METHOD_ID_DOMAIN = "midnight:offchain:holder-method-id:v1";

type OffchainVerificationMethod =
  ResolvedPortableOffchainMidnightDID["state"]["verificationMethod"][number];

export type OffchainDIDHolderBinding = CoreOffchainMidnightHolderBinding;

/** @deprecated Use OffchainDIDHolderBinding instead. */
export type OffchainMidnightHolderBinding = OffchainDIDHolderBinding;

export type ResolvedOffchainDIDHolderBinding = {
  readonly binding: OffchainDIDHolderBinding;
  readonly did: string;
  readonly parsed: ResolvedPortableOffchainMidnightDID["parsed"];
  readonly method: OffchainVerificationMethod;
};

/** @deprecated Use ResolvedOffchainDIDHolderBinding instead. */
export type ResolvedOffchainMidnightHolderBinding =
  ResolvedOffchainDIDHolderBinding;

const decodeBase64Url = (value: string): Uint8Array => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return new Uint8Array(Buffer.from(`${normalized}${padding}`, "base64"));
};

const encodeBase64Url = (value: bigint): string => {
  let hex = value.toString(16);
  if (hex.length > HEX_BYTES32_LENGTH) {
    throw new Error("Offchain DID Jubjub coordinate must fit in 32 bytes");
  }
  hex = hex.padStart(HEX_BYTES32_LENGTH, "0");
  return Buffer.from(hex, "hex").toString("base64url");
};

const decodeBigEndianUnsigned = (value: Uint8Array): bigint => {
  let result = 0n;
  for (const byte of value) {
    result = (result << 8n) + BigInt(byte);
  }
  return result;
};

/**
 * Domain separation plus a NUL separator prevent accidental collisions between
 * this method-id hash context and any future hash context using concatenation.
 */
export const hashOffchainDIDMethodId = (
  normalizedFragment: string,
): Uint8Array =>
  new Uint8Array(
    createHash("sha256")
      .update(OFFCHAIN_DID_METHOD_ID_DOMAIN)
      .update("\0")
      .update(textEncoder.encode(normalizedFragment))
      .digest(),
  );

/** @deprecated Use hashOffchainDIDMethodId instead. */
export const hashOffchainMidnightMethodId = hashOffchainDIDMethodId;

const hexToBytes32 = (value: string): Uint8Array => {
  if (value.length !== HEX_BYTES32_LENGTH) {
    throw new Error("Offchain DID state hash must be 32 bytes");
  }
  return Uint8Array.from(Buffer.from(value, "hex"));
};

const splitDidFragment = (
  methodReference: string,
): { subject: string; fragment: string } => {
  const fragmentIndex = methodReference.indexOf("#");
  const lastFragmentIndex = methodReference.lastIndexOf("#");
  if (fragmentIndex === -1) {
    throw new Error("Offchain DID method reference must include a fragment");
  }
  if (fragmentIndex !== lastFragmentIndex) {
    throw new Error("Offchain DID method reference must contain only one fragment separator");
  }
  const subject = methodReference.slice(0, fragmentIndex);
  const fragment = methodReference.slice(fragmentIndex + 1);
  if (!fragment) {
    throw new Error("Offchain DID method reference must include a non-empty fragment");
  }
  return { subject, fragment };
};

export const normalizeOffchainDIDMethodReference = (
  methodReference: string,
  did: string,
): string => {
  if (methodReference.startsWith("#")) {
    if (methodReference.length === 1 || methodReference.slice(1).includes("#")) {
      throw new Error("Offchain DID method reference must contain exactly one non-empty fragment");
    }
    return methodReference;
  }
  if (methodReference.startsWith("did:")) {
    const { subject, fragment } = splitDidFragment(methodReference);
    if (subject !== did) {
      throw new Error(
        "Offchain DID holder method reference must belong to the resolved DID",
      );
    }
    return `#${fragment}`;
  }
  if (methodReference.includes("#")) {
    throw new Error("Offchain DID method reference must be either a fragment, a full DID URL, or a bare fragment identifier");
  }
  return `#${methodReference}`;
};

/** @deprecated Use normalizeOffchainDIDMethodReference instead. */
export const normalizeOffchainMidnightMethodReference =
  normalizeOffchainDIDMethodReference;

export const createPortableOffchainDIDUrlForJubjubHolder = ({
  publicKey,
  methodId = "#holder-key-1",
}: {
  readonly publicKey: { readonly x: bigint; readonly y: bigint };
  readonly methodId?: string;
}): string =>
  createPortableOffchainMidnightDIDUrl({
    version: 1,
    alsoKnownAs: [],
    verificationMethod: [
      {
        id: methodId,
        publicKeyJwk: {
          kty: KeyType.EC,
          crv: CurveType.Jubjub,
          x: encodeBase64Url(publicKey.x),
          y: encodeBase64Url(publicKey.y),
        },
        relationships: {
          authentication: true,
          assertionMethod: false,
          keyAgreement: false,
          capabilityInvocation: false,
          capabilityDelegation: false,
        },
      },
    ],
    service: [],
  });

const isJubjubAuthenticationMethod = (
  method: OffchainVerificationMethod,
): boolean =>
  method.publicKeyJwk.crv === "Jubjub" && method.relationships.authentication;

const selectMethod = ({
  did,
  verificationMethod,
  methodId,
}: {
  readonly did: string;
  readonly verificationMethod: readonly OffchainVerificationMethod[];
  readonly methodId?: string;
}): OffchainVerificationMethod => {
  if (methodId) {
    const normalizedMethodId = normalizeOffchainDIDMethodReference(
      methodId,
      did,
    );
    const selected = verificationMethod.find(
      (method) => method.id === normalizedMethodId,
    );
    if (!selected) {
      throw new Error(
        `Offchain DID does not contain verification method "${normalizedMethodId}"`,
      );
    }
    if (selected.publicKeyJwk.crv !== "Jubjub") {
      throw new Error(
        `Offchain DID verification method "${normalizedMethodId}" is not a Jubjub key`,
      );
    }
    if (!selected.relationships.authentication) {
      throw new Error(
        `Offchain DID verification method "${normalizedMethodId}" is not marked for authentication`,
      );
    }
    return selected;
  }

  const jubjubAuthenticationMethods = verificationMethod.filter(
    isJubjubAuthenticationMethod,
  );
  if (jubjubAuthenticationMethods.length !== 1) {
    throw new Error(
      "Offchain DID must contain exactly one Jubjub authentication method when holderMethodId is omitted",
    );
  }
  return jubjubAuthenticationMethods[0]!;
};

export const createOffchainDIDHolderBindingFromDidUrl = ({
  portableDidUrl,
  holderMethodId,
}: {
  readonly portableDidUrl: string;
  readonly holderMethodId?: string;
}): ResolvedOffchainDIDHolderBinding => {
  const resolved = resolvePortableOffchainMidnightDID(portableDidUrl);
  const method = selectMethod({
    did: resolved.did,
    verificationMethod: resolved.state.verificationMethod,
    methodId: holderMethodId,
  });
  const publicKeyJwk = method.publicKeyJwk;
  if (publicKeyJwk.crv !== "Jubjub" || !publicKeyJwk.y) {
    throw new Error(
      `Offchain DID verification method "${method.id}" is not a Jubjub key`,
    );
  }

  return {
    did: resolved.did,
    parsed: resolved.parsed,
    method,
    binding: {
      holderDidStateHash: hexToBytes32(resolved.parsed.stateHash),
      holderMethodId: hashOffchainDIDMethodId(method.id),
      holderPublicKey: {
        x: decodeBigEndianUnsigned(decodeBase64Url(publicKeyJwk.x)),
        y: decodeBigEndianUnsigned(decodeBase64Url(publicKeyJwk.y)),
      },
    },
  };
};

/** @deprecated Use createOffchainDIDHolderBindingFromDidUrl instead. */
export const createOffchainMidnightHolderBindingFromDidUrl =
  createOffchainDIDHolderBindingFromDidUrl;
