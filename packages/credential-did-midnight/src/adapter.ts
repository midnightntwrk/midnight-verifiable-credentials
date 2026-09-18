import {
  SignerRole,
  VerificationRelationship,
} from "@midnight-ntwrk/credential-compact";
import {
  CurveType,
  decodeBase64UrlBytes32,
  KeyType,
  MidnightNetwork,
  parseMidnightDID,
  resolveDIDURLReference,
  VerificationMethodType,
} from "@midnight-ntwrk/midnight-did-domain";
import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";

import type {
  CreateMidnightDIDSignerDescriptorOptions,
  MidnightDIDHolderBinding,
  MidnightDIDMethodBinding,
  MidnightDIDSignerDescriptor,
  MidnightDIDVerificationRelationship,
  ResolveMidnightDIDMethodBindingOptions,
} from "./types.js";

const UINT64_MAX = (1n << 64n) - 1n;
const compactRelationships = {
  assertionMethod: VerificationRelationship.assertionMethod,
  authentication: VerificationRelationship.authentication,
  capabilityInvocation: VerificationRelationship.capabilityInvocation,
} as const satisfies Record<
  MidnightDIDVerificationRelationship,
  VerificationRelationship
>;

const bytesToBigIntLE = (bytes: Uint8Array): bigint => {
  let value = 0n;
  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    value = (value << 8n) | BigInt(bytes[index] ?? 0);
  }
  return value;
};

const hexToBytes32 = (value: string): Uint8Array => {
  if (!/^[0-9a-f]{64}$/u.test(value)) {
    throw new Error(
      "Midnight DID contract address must be 32-byte lowercase hex",
    );
  }
  return Uint8Array.from(
    value.match(/.{2}/gu)?.map((octet) => Number.parseInt(octet, 16)) ?? [],
  );
};

const requireBytes32 = (value: Uint8Array, label: string): Uint8Array => {
  if (value.length !== 32) {
    throw new Error(`${label} must contain exactly 32 bytes`);
  }
  if (value.every((byte) => byte === 0)) {
    throw new Error(`${label} must not be zero`);
  }
  return new Uint8Array(value);
};

const requirePositiveUint64 = (value: bigint, label: string): bigint => {
  if (value < 1n || value > UINT64_MAX) {
    throw new Error(`${label} must be a positive uint64`);
  }
  return value;
};

const parseStateVersion = (versionId: string | null | undefined): bigint => {
  if (!/^[1-9]\d*$/u.test(versionId ?? "")) {
    throw new Error(
      "Midnight DID resolution must provide a positive versionId",
    );
  }
  const version = BigInt(versionId ?? "0");
  if (version > UINT64_MAX) {
    throw new Error("Midnight DID versionId must fit into uint64");
  }
  return version;
};

const resolveMethodId = (
  reference: string,
  did: string,
  label: string,
): string => {
  try {
    return resolveDIDURLReference(reference, did);
  } catch (error) {
    throw new Error(`${label} is not a valid subject-bound DID URL`, {
      cause: error,
    });
  }
};

const canonicalFragment = (absoluteMethodId: string, did: string): string => {
  const prefix = `${did}#`;
  if (!absoluteMethodId.startsWith(prefix)) {
    throw new Error(
      "Midnight DID verification method must be a fragment of the resolved DID",
    );
  }
  const fragment = absoluteMethodId.slice(did.length);
  if (fragment === "#" || fragment.slice(1).includes("#")) {
    throw new Error("Midnight DID verification method fragment is invalid");
  }
  return fragment;
};

const cloneMethodBinding = (
  binding: MidnightDIDMethodBinding,
): MidnightDIDMethodBinding => ({
  verificationMethodRef: {
    controllerAddress: {
      bytes: new Uint8Array(
        binding.verificationMethodRef.controllerAddress.bytes,
      ),
    },
    methodId: new Uint8Array(binding.verificationMethodRef.methodId),
  },
  publicKey: { ...binding.publicKey },
  didStateVersion: binding.didStateVersion,
  verificationRelationship: binding.verificationRelationship,
});

export const midnightDIDMethodId = (
  canonicalMethodFragment: string,
): Uint8Array => {
  if (!/^#[^#]+$/u.test(canonicalMethodFragment)) {
    throw new Error(
      "Midnight DID method identifier must be a non-empty canonical fragment",
    );
  }
  return sha256(utf8ToBytes(canonicalMethodFragment));
};

export const resolveMidnightDIDMethodBinding = async ({
  resolver,
  did,
  verificationMethodId,
  relationship,
}: ResolveMidnightDIDMethodBindingOptions): Promise<MidnightDIDMethodBinding> => {
  const parsed = parseMidnightDID(did);
  if (parsed.network === MidnightNetwork.Offchain) {
    throw new Error(
      "Offchain Midnight DIDs cannot supply a Compact contract controller address",
    );
  }

  const result = await resolver.resolveResult(did);
  if (result === null) {
    throw new Error(`Midnight DID could not be resolved: ${did}`);
  }
  if (result.didDocument.id !== did) {
    throw new Error(
      "Resolved Midnight DID document subject does not match request",
    );
  }
  if (result.didDocumentMetadata.deactivated === true) {
    throw new Error("Resolved Midnight DID is deactivated");
  }

  const absoluteMethodId = resolveMethodId(
    verificationMethodId,
    did,
    "verificationMethodId",
  );
  const fragment = canonicalFragment(absoluteMethodId, did);
  const method = result.didDocument.verificationMethod?.find(
    (candidate) =>
      resolveMethodId(String(candidate.id), did, "DID document method id") ===
      absoluteMethodId,
  );
  if (method === undefined) {
    throw new Error(
      `Verification method is absent from the DID document: ${fragment}`,
    );
  }
  if (String(method.controller) !== String(did)) {
    throw new Error(
      "Verification method controller does not match the DID subject",
    );
  }
  if (method.type !== VerificationMethodType.JsonWebKey) {
    throw new Error("Midnight DID verification method must use JsonWebKey");
  }
  if (
    method.publicKeyJwk.kty !== KeyType.EC ||
    method.publicKeyJwk.crv !== CurveType.Jubjub ||
    method.publicKeyJwk.y === undefined
  ) {
    throw new Error("Midnight VC proofs require a native EC/Jubjub DID key");
  }

  const relationshipEntries = result.didDocument[relationship] ?? [];
  const relationshipContainsMethod = relationshipEntries.some(
    (candidate) =>
      resolveMethodId(String(candidate), did, `${relationship} method id`) ===
      absoluteMethodId,
  );
  if (!relationshipContainsMethod) {
    throw new Error(
      `Verification method is not authorized for ${relationship}: ${fragment}`,
    );
  }

  const x = decodeBase64UrlBytes32(method.publicKeyJwk.x, "Jubjub x");
  const y = decodeBase64UrlBytes32(method.publicKeyJwk.y, "Jubjub y");
  return {
    verificationMethodRef: {
      controllerAddress: { bytes: hexToBytes32(String(parsed.id)) },
      methodId: midnightDIDMethodId(fragment),
    },
    publicKey: {
      x: bytesToBigIntLE(x),
      y: bytesToBigIntLE(y),
    },
    didStateVersion: parseStateVersion(result.didDocumentMetadata.versionId),
    verificationRelationship: compactRelationships[relationship],
  };
};

export const createMidnightDIDHolderBinding = (
  methodBinding: MidnightDIDMethodBinding,
): MidnightDIDHolderBinding => {
  if (
    methodBinding.verificationRelationship !==
    VerificationRelationship.authentication
  ) {
    throw new Error("Midnight DID holder binding requires authentication");
  }
  const method = cloneMethodBinding(methodBinding);
  return {
    explicitBinding: {
      holderVerificationMethodRef: method.verificationMethodRef,
    },
    methodBinding: method,
  };
};

export const createMidnightDIDSignerDescriptor = (
  methodBinding: MidnightDIDMethodBinding,
  options: CreateMidnightDIDSignerDescriptorOptions,
): MidnightDIDSignerDescriptor => {
  if (
    options.role === SignerRole.issuer &&
    methodBinding.verificationRelationship !==
      VerificationRelationship.assertionMethod
  ) {
    throw new Error(
      "Midnight DID issuer authorization requires assertionMethod",
    );
  }
  if (
    options.role === SignerRole.verifier &&
    methodBinding.verificationRelationship ===
      VerificationRelationship.assertionMethod
  ) {
    throw new Error(
      "Midnight DID verifier authorization requires authentication or capabilityInvocation",
    );
  }

  const method = cloneMethodBinding(methodBinding);
  return {
    version: 1n,
    authorizationId: requireBytes32(options.authorizationId, "authorizationId"),
    decisionSequence: requirePositiveUint64(
      options.decisionSequence,
      "decisionSequence",
    ),
    state: options.state,
    role: options.role,
    signerVerificationMethodRef: method.verificationMethodRef,
    signerPublicKey: method.publicKey,
    didStateVersion: method.didStateVersion,
    verificationRelationship: method.verificationRelationship,
    scopeCommitment: requireBytes32(options.scopeCommitment, "scopeCommitment"),
    policyCommitment: requireBytes32(
      options.policyCommitment,
      "policyCommitment",
    ),
  };
};
