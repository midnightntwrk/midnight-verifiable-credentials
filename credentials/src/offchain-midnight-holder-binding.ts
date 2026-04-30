import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TextEncoder } from "node:util";

import type { OffchainMidnightHolderBinding } from "./managed/credentials/contract/index.js";

const textEncoder = new TextEncoder();
const BYTES32_LENGTH = 32;
const HEX_BYTES32_LENGTH = BYTES32_LENGTH * 2;
const OFFCHAIN_METHOD_ID_DOMAIN = "midnight:offchain:holder-method-id:v1";

type ResolvedPortableOffchainMidnightDID = {
  readonly did: string;
  readonly parsed: {
    readonly did: string;
    readonly stateHash: string;
  };
  readonly state: {
    readonly verificationMethod: readonly {
      readonly id: string;
      readonly publicKeyJwk: {
        readonly crv: string;
        readonly x: string;
        readonly y?: string;
      };
      readonly relationships: {
        readonly authentication: boolean;
      };
    }[];
  };
};

type ResolvePortableOffchainMidnightDID = (
  input: string,
) => ResolvedPortableOffchainMidnightDID;

const locateOffchainMidnightDidModule = (): string => {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));
  while (true) {
    const candidates = [
      path.join(
        currentDir,
        "node_modules",
        "@midnight-ntwrk",
        "midnight-did",
        "dist",
        "offchain-midnight-did.js",
      ),
      path.join(currentDir, "midnight-did", "dist", "offchain-midnight-did.js"),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  throw new Error(
    "Unable to locate @midnight-ntwrk/midnight-did/dist/offchain-midnight-did.js",
  );
};

const loadResolvePortableOffchainMidnightDID =
  async (): Promise<ResolvePortableOffchainMidnightDID> => {
    const moduleUrl = pathToFileURL(locateOffchainMidnightDidModule()).href;
    const offchainModule = (await import(moduleUrl)) as {
      readonly resolvePortableOffchainMidnightDID?: ResolvePortableOffchainMidnightDID;
    };
    if (
      typeof offchainModule.resolvePortableOffchainMidnightDID !== "function"
    ) {
      throw new Error(
        "@midnight-ntwrk/midnight-did offchain module does not expose resolvePortableOffchainMidnightDID",
      );
    }
    return offchainModule.resolvePortableOffchainMidnightDID;
  };

const resolvePortableOffchainMidnightDID =
  await loadResolvePortableOffchainMidnightDID();

export type ResolvedOffchainMidnightHolderBinding = {
  readonly binding: OffchainMidnightHolderBinding;
  readonly did: string;
  readonly parsed: ResolvedPortableOffchainMidnightDID["parsed"];
  readonly method: ResolvedPortableOffchainMidnightDID["state"]["verificationMethod"][number];
};

const decodeBase64Url = (value: string): Uint8Array => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return new Uint8Array(Buffer.from(`${normalized}${padding}`, "base64"));
};

const decodeBigEndianUnsigned = (value: Uint8Array): bigint => {
  let result = 0n;
  for (const byte of value) {
    result = (result << 8n) + BigInt(byte);
  }
  return result;
};

const hashNormalizedMethodReference = (value: string): Uint8Array =>
  new Uint8Array(
    createHash("sha256")
      .update(OFFCHAIN_METHOD_ID_DOMAIN)
      .update("\0")
      .update(textEncoder.encode(value))
      .digest(),
  );

const hexToBytes32 = (value: string): Uint8Array => {
  if (value.length !== HEX_BYTES32_LENGTH) {
    throw new Error("Offchain Midnight state hash must be 32 bytes");
  }
  return Uint8Array.from(Buffer.from(value, "hex"));
};

const normalizeMethodReference = (
  methodReference: string,
  did: string,
): string => {
  if (methodReference.startsWith("#")) {
    return methodReference;
  }
  if (methodReference.startsWith("did:")) {
    const [subject, fragment] = methodReference.split("#", 2);
    if (!fragment) {
      throw new Error(
        "Offchain Midnight holder method reference must include a fragment",
      );
    }
    if (subject !== did) {
      throw new Error(
        "Offchain Midnight holder method reference must belong to the resolved DID",
      );
    }
    return `#${fragment}`;
  }
  return `#${methodReference}`;
};

const isJubjubAuthenticationMethod = (
  method: ResolvedPortableOffchainMidnightDID["state"]["verificationMethod"][number],
): boolean =>
  method.publicKeyJwk.crv === "Jubjub" && method.relationships.authentication;

const selectMethod = ({
  did,
  verificationMethod,
  methodId,
}: {
  readonly did: string;
  readonly verificationMethod: readonly ResolvedPortableOffchainMidnightDID["state"]["verificationMethod"][number][];
  readonly methodId?: string;
}): ResolvedPortableOffchainMidnightDID["state"]["verificationMethod"][number] => {
  if (methodId) {
    const normalizedMethodId = normalizeMethodReference(methodId, did);
    const selected = verificationMethod.find(
      (method) => method.id === normalizedMethodId,
    );
    if (!selected) {
      throw new Error(
        `Offchain Midnight DID does not contain verification method "${normalizedMethodId}"`,
      );
    }
    if (selected.publicKeyJwk.crv !== "Jubjub") {
      throw new Error(
        `Offchain Midnight verification method "${normalizedMethodId}" is not a Jubjub key`,
      );
    }
    if (!selected.relationships.authentication) {
      throw new Error(
        `Offchain Midnight verification method "${normalizedMethodId}" is not marked for authentication`,
      );
    }
    return selected;
  }

  const jubjubAuthenticationMethods = verificationMethod.filter(
    isJubjubAuthenticationMethod,
  );
  if (jubjubAuthenticationMethods.length !== 1) {
    throw new Error(
      "Offchain Midnight DID must contain exactly one Jubjub authentication method when holderMethodId is omitted",
    );
  }
  return jubjubAuthenticationMethods[0]!;
};

export const createOffchainMidnightHolderBindingFromDidUrl = ({
  portableDidUrl,
  holderMethodId,
}: {
  readonly portableDidUrl: string;
  readonly holderMethodId?: string;
}): ResolvedOffchainMidnightHolderBinding => {
  const resolved = resolvePortableOffchainMidnightDID(portableDidUrl);
  const method = selectMethod({
    did: resolved.did,
    verificationMethod: resolved.state.verificationMethod,
    methodId: holderMethodId,
  });
  const publicKeyJwk = method.publicKeyJwk;
  if (publicKeyJwk.crv !== "Jubjub" || !publicKeyJwk.y) {
    throw new Error(
      `Offchain Midnight verification method "${method.id}" is not a Jubjub key`,
    );
  }

  return {
    did: resolved.did,
    parsed: resolved.parsed,
    method,
    binding: {
      holderDidStateHash: hexToBytes32(resolved.parsed.stateHash),
      holderMethodId: hashNormalizedMethodReference(method.id),
      holderPublicKey: {
        x: decodeBigEndianUnsigned(decodeBase64Url(publicKeyJwk.x)),
        y: decodeBigEndianUnsigned(decodeBase64Url(publicKeyJwk.y)),
      },
    },
  };
};
