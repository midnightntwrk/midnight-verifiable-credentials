import { createHash } from "node:crypto";
import { TextEncoder } from "node:util";

import { jubjubPointX, jubjubPointY } from "@midnight-ntwrk/compact-runtime";
import type { JubjubPoint } from "@midnight-ntwrk/compact-runtime";

import type {
  DeployedMidnightDIDContract,
  MidnightDIDProviders,
} from "@midnight-ntwrk/midnight-did-api";
import {
  addSchnorrJubjubVerificationMethod,
  addVerificationMethodRelation,
  createDID,
  initPrivateState,
  resolve,
} from "@midnight-ntwrk/midnight-did-api";
import {
  CurveType,
  encodeBase64Url,
  KeyType,
  VerificationMethodRelationType,
} from "@midnight-ntwrk/midnight-did-domain";
import { TIMEOUTS } from "./standalone-config.js";

type Role = "issuer" | "holder" | "verifier";
const BYTES32_LENGTH = 32;

export interface ProtocolDidProfile {
  readonly role: Role;
  readonly didString: string;
  readonly contractAddress: string;
  readonly contract: DeployedMidnightDIDContract;
  readonly verificationMethodRef: string;
  readonly verificationMethodRefValue: {
    didContractAddress: { bytes: Uint8Array };
    methodId: Uint8Array;
  };
}

export interface DerivedProtocolDidSigner {
  readonly publicKey: JubjubPoint;
  readonly methodId?: string;
}

export const verifierChallengeForProfile = (
  didString: string,
  purpose: string,
): Uint8Array =>
  new Uint8Array(
    createHash("sha256")
      .update(`midnight:vc:verifier:${didString}:${purpose}`)
      .digest(),
  );

const hexToBytes = (value: string): Uint8Array =>
  Uint8Array.from(Buffer.from(value, "hex"));

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length >= length) return bytes.subarray(0, length);
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const bigintToBytes32 = (value: bigint): Uint8Array => {
  if (value < 0n) {
    throw new Error("Jubjub public key coordinate must be non-negative");
  }

  const bytes = new Uint8Array(BYTES32_LENGTH);
  let remaining = value;
  for (let index = BYTES32_LENGTH - 1; index >= 0; index -= 1) {
    bytes[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  if (remaining !== 0n) {
    throw new Error("Jubjub public key coordinate must fit in 32 bytes");
  }

  return bytes;
};

export const encodeJubjubCoordinateAsBase64UrlBytes32 = (
  value: bigint,
): string => encodeBase64Url(bigintToBytes32(value));

export const createJubjubPublicKeyJwk = (publicKey: JubjubPoint) => ({
  kty: KeyType.EC,
  crv: CurveType.Jubjub,
  x: encodeJubjubCoordinateAsBase64UrlBytes32(jubjubPointX(publicKey)),
  y: encodeJubjubCoordinateAsBase64UrlBytes32(jubjubPointY(publicKey)),
});

const createDidWithDustRetry = async (
  providers: MidnightDIDProviders,
  retries = TIMEOUTS.didCreationRetries,
  delayMs = TIMEOUTS.didCreationRetryDelay,
): Promise<DeployedMidnightDIDContract> => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await createDID(providers, await initPrivateState(providers));
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (
        attempt === retries ||
        !/Not enough Dust generated to pay the fee|could not balance dust/i.test(
          message,
        )
      ) {
        throw error;
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const defaultMethodIdForRole = (role: Role): string => `#${role}-key-1`;

const deployResolvedDidContract = async (
  providers: MidnightDIDProviders,
  role: Role,
  logPrefix: string,
): Promise<{
  readonly contract: DeployedMidnightDIDContract;
  readonly didString: string;
}> => {
  console.info(`[${logPrefix}] deploying ${role} DID`);
  const contract = await createDidWithDustRetry(providers);

  console.info(`[${logPrefix}] resolving ${role} DID`);
  const resolutionBeforeMethod = await resolve(providers, contract);
  const didString = resolutionBeforeMethod?.didDocument.id;
  if (didString === undefined) {
    throw new Error(`Failed to resolve ${role} DID after deployment`);
  }

  return {
    contract,
    didString,
  };
};

const publishDidProfile = async (
  contract: DeployedMidnightDIDContract,
  providers: MidnightDIDProviders,
  role: Role,
  didString: string,
  signer: DerivedProtocolDidSigner,
  logPrefix: string,
): Promise<ProtocolDidProfile> => {
  const methodId = signer.methodId ?? defaultMethodIdForRole(role);
  const verificationMethodRef = `${didString}${methodId}`;

  console.info(`[${logPrefix}] publishing verification method for ${role}`);
  await addSchnorrJubjubVerificationMethod(contract, {
    id: verificationMethodRef,
    publicKey: signer.publicKey,
  });

  await addVerificationMethodRelation(
    contract,
    providers,
    role === "issuer"
      ? VerificationMethodRelationType.AssertionMethod
      : VerificationMethodRelationType.Authentication,
    verificationMethodRef,
  );

  console.info(`[${logPrefix}] re-resolving ${role} DID`);
  const resolution = await resolve(providers, contract);
  if (!resolution) {
    throw new Error(`Failed to re-resolve ${role} DID after adding method`);
  }

  const methodFound = resolution.didDocument.verificationMethod?.some(
    (method: { id: string }) => method.id === verificationMethodRef,
  );
  if (!methodFound) {
    throw new Error(
      `Verification method ${verificationMethodRef} not found in resolved DID document`,
    );
  }

  return {
    role,
    didString,
    contractAddress: contract.deployTxData.public.contractAddress,
    contract,
    verificationMethodRef,
    verificationMethodRefValue: {
      didContractAddress: {
        bytes: hexToBytes(contract.deployTxData.public.contractAddress),
      },
      methodId: padText(methodId),
    },
  };
};

/**
 * Deploy a DID contract, register a verification method, and return
 * the complete profile with on-chain verification method reference.
 */
export const provisionDidProfile = async (
  providers: MidnightDIDProviders,
  role: Role,
  signer: { publicKey: JubjubPoint },
  logPrefix: string,
): Promise<ProtocolDidProfile> => {
  const { contract, didString } = await deployResolvedDidContract(
    providers,
    role,
    logPrefix,
  );
  return publishDidProfile(
    contract,
    providers,
    role,
    didString,
    {
      publicKey: signer.publicKey,
      methodId: defaultMethodIdForRole(role),
    },
    logPrefix,
  );
};

/**
 * Deploy a DID contract first, derive the signer from the resolved DID string,
 * then publish the matching verification method.
 *
 * This is useful when higher-level harnesses derive deterministic keys from the
 * final DID identifier and need the on-chain DID document to publish the same
 * verification material.
 */
export const provisionDerivedDidProfile = async (
  providers: MidnightDIDProviders,
  role: Role,
  signerFactory: (didString: string) => DerivedProtocolDidSigner,
  logPrefix: string,
): Promise<ProtocolDidProfile> => {
  const { contract, didString } = await deployResolvedDidContract(
    providers,
    role,
    logPrefix,
  );
  return publishDidProfile(
    contract,
    providers,
    role,
    didString,
    signerFactory(didString),
    logPrefix,
  );
};
