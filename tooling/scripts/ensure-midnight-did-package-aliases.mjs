import { access, lstat, mkdir, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const aliasPath = path.join(repoRoot, 'node_modules', '@midnight-ntwrk', 'contract');
const target = 'midnight-did-contract';
const didDistDir = path.join(
  repoRoot,
  'node_modules',
  '@midnight-ntwrk',
  'midnight-did',
  'dist',
);
const didEntrypoint = path.join(didDistDir, 'index.js');
const didLedgerToDomain = path.join(didDistDir, 'ledger-to-domain.js');
const didEntrypointContents = `export { LedgerToDomain } from "./ledger-to-domain.js";
export * from "./midnight.js";
export * from "./midnight-did-document.js";
export * from "./midnight-did-resolver.js";
export * from "./offchain-midnight-did.js";
`;
const didLedgerToDomainContents = 'import { DIDContract } from "@midnight-ntwrk/midnight-did-contract";\nimport { createService, createVerificationMethod, CurveType, encodeFieldElement, KeyType, normalizeServiceEndpoint, ServiceEndpointSchema, VerificationMethodRelationType, VerificationMethodType, } from "@midnight-ntwrk/midnight-did-domain";\nimport { createMidnightDIDString, } from "./midnight.js";\nimport { createMidnightDIDDocument, } from "./midnight-did-document.js";\nconst bytesToHex = (bytes) => {\n    let hex = "";\n    for (const byte of bytes) {\n        hex += Number(byte).toString(16).padStart(2, "0");\n    }\n    return hex;\n};\nconst LedgerCurveType = DIDContract.CurveType;\nconst LedgerKeyType = DIDContract.KeyType;\nconst LedgerVerificationMethodType = DIDContract.VerificationMethodType;\nconst LedgerVerificationMethodRelation = DIDContract.VerificationMethodRelation;\nexport class LedgerToDomain {\n    static KeyTypeMap = {\n        [LedgerKeyType.EC]: KeyType.EC,\n        [LedgerKeyType.RSA]: KeyType.RSA,\n        [LedgerKeyType.oct]: KeyType.oct,\n        [LedgerKeyType.OKP]: KeyType.OKP,\n    };\n    static CurveTypeMap = {\n        [LedgerCurveType.Ed25519]: CurveType.Ed25519,\n        [LedgerCurveType.Jubjub]: CurveType.Jubjub,\n        [LedgerCurveType.P256]: CurveType.P256,\n    };\n    static VerificationMethodTypeMap = {\n        [LedgerVerificationMethodType.Undefined]: VerificationMethodType.Undefined,\n        [LedgerVerificationMethodType.JsonWebKey]: VerificationMethodType.JsonWebKey,\n    };\n    static VerificationMethodRelationMap = {\n        [LedgerVerificationMethodRelation.Undefined]: VerificationMethodRelationType.Undefined,\n        [LedgerVerificationMethodRelation.Authentication]: VerificationMethodRelationType.Authentication,\n        [LedgerVerificationMethodRelation.AssertionMethod]: VerificationMethodRelationType.AssertionMethod,\n        [LedgerVerificationMethodRelation.KeyAgreement]: VerificationMethodRelationType.KeyAgreement,\n        [LedgerVerificationMethodRelation.CapabilityInvocation]: VerificationMethodRelationType.CapabilityInvocation,\n        [LedgerVerificationMethodRelation.CapabilityDelegation]: VerificationMethodRelationType.CapabilityDelegation,\n    };\n    static publicKeyJwk(publicKeyJwk) {\n        const kty = this.KeyTypeMap[publicKeyJwk.kty];\n        const crv = this.CurveTypeMap[publicKeyJwk.crv];\n        const x = encodeFieldElement(publicKeyJwk.x);\n        const y = encodeFieldElement(publicKeyJwk.y);\n        if (kty === KeyType.OKP &&\n            crv === CurveType.Ed25519 &&\n            publicKeyJwk.y === 0n)\n            return { kty, crv, x };\n        return { kty, crv, x, y };\n    }\n    static service(service) {\n        const rawId = service.id.trim();\n        const needsFragmentPrefix = rawId.startsWith("//") ||\n            (!rawId.startsWith("did:") &&\n                !rawId.startsWith("#") &&\n                !rawId.startsWith("/") &&\n                !rawId.startsWith(".") &&\n                !rawId.startsWith("?"));\n        const serviceId = needsFragmentPrefix ? `#${rawId}` : rawId;\n        const serviceEndpoint = this.parseServiceEndpoint(service.serviceEndpoint);\n        const serviceType = this.parseServiceType(service.typ ??\n            service.type ??\n            "");\n        return {\n            id: serviceId,\n            type: serviceType,\n            serviceEndpoint,\n        };\n    }\n    static parseServiceType(raw) {\n        const value = raw.trim();\n        if (value.length === 0) {\n            throw new Error("Invalid service type: empty value");\n        }\n        if (value.startsWith("[")) {\n            try {\n                const parsed = JSON.parse(value);\n                if (Array.isArray(parsed) &&\n                    parsed.length > 0 &&\n                    parsed.every((entry) => typeof entry === "string" && entry.trim().length > 0) &&\n                    new Set(parsed.map((entry) => entry.trim())).size === parsed.length) {\n                    return parsed.map((entry) => entry.trim());\n                }\n            }\n            catch {\n                throw new Error("Invalid service type: malformed JSON array");\n            }\n            throw new Error("Invalid service type: expected non-empty unique strings");\n        }\n        return value;\n    }\n    static parseServiceEndpoint(endpoint) {\n        const normalize = (value) => normalizeServiceEndpoint(value);\n        if (Array.isArray(endpoint)) {\n            const filtered = endpoint\n                .map((value) => (typeof value === "string" ? value.trim() : ""))\n                .filter((value) => value !== "");\n            if (filtered.length === 0) {\n                throw new Error("Invalid serviceEndpoint: empty legacy endpoint array");\n            }\n            if (filtered.length === 1)\n                return normalize(filtered[0]);\n            return normalize(filtered);\n        }\n        if (typeof endpoint === "string") {\n            const raw = endpoint.trim();\n            if (raw === "") {\n                throw new Error("Invalid serviceEndpoint: empty value");\n            }\n            try {\n                const parsed = JSON.parse(raw);\n                return normalize(ServiceEndpointSchema.parse(parsed));\n            }\n            catch {\n                const direct = ServiceEndpointSchema.safeParse(raw);\n                if (direct.success) {\n                    return normalize(direct.data);\n                }\n                throw new Error("Invalid serviceEndpoint: malformed JSON payload");\n            }\n        }\n        const parsed = ServiceEndpointSchema.safeParse(endpoint);\n        if (parsed.success) {\n            return normalize(parsed.data);\n        }\n        throw new Error("Invalid serviceEndpoint: unsupported endpoint shape");\n    }\n    static verificationMethodId(id) {\n        const rawId = id.trim();\n        if (rawId.startsWith("did:")) {\n            if (rawId.includes("#"))\n                return rawId;\n            return `${rawId}#${rawId.slice(rawId.lastIndexOf(":") + 1)}`;\n        }\n        const needsFragmentPrefix = !rawId.startsWith("#") &&\n            !rawId.startsWith("/") &&\n            !rawId.startsWith(".") &&\n            !rawId.startsWith("?");\n        return needsFragmentPrefix ? `#${rawId}` : rawId;\n    }\n    static absoluteDidUrlReference(did, id) {\n        const normalized = this.verificationMethodId(id);\n        if (normalized.startsWith("did:"))\n            return normalized;\n        return `${did}${normalized}`;\n    }\n    static toJSON(ledger) {\n        const created = this.timestampToIsoString(ledger.created);\n        const updated = this.timestampToIsoString(ledger.updated);\n        return {\n            id: bytesToHex(ledger.id.bytes),\n            version: Number(ledger.version.toString()),\n            active: ledger.active,\n            operationCount: Number(ledger.operationCount.toString()),\n            created,\n            updated,\n            deactivated: ledger.deactivated,\n            alsoKnownAs: Array.from(ledger.alsoKnownAs),\n            verificationMethods: Array.from(ledger.verificationMethods, ([id, method]) => ({\n                id: this.verificationMethodId(id),\n                type: method.typ,\n                publicKeyJwk: this.publicKeyJwk(method.publicKeyJwk),\n            })),\n            authenticationRelation: Array.from(ledger.authenticationRelation, (value) => this.verificationMethodId(value)),\n            assertionMethodRelation: Array.from(ledger.assertionMethodRelation, (value) => this.verificationMethodId(value)),\n            keyAgreementRelation: Array.from(ledger.keyAgreementRelation, (value) => this.verificationMethodId(value)),\n            capabilityInvocationRelation: Array.from(ledger.capabilityInvocationRelation, (value) => this.verificationMethodId(value)),\n            capabilityDelegationRelation: Array.from(ledger.capabilityDelegationRelation, (value) => this.verificationMethodId(value)),\n            services: Array.from(ledger.services, ([, service]) => this.service(service)),\n        };\n    }\n    static ledgerStateToDIDDocument(ledger, network, contractAddress) {\n        const did = createMidnightDIDString(contractAddress, network);\n        const verificationMethod = [];\n        const verificationMethodIds = new Set();\n        for (const [id, method] of ledger.verificationMethods) {\n            const verificationMethodType = LedgerToDomain.VerificationMethodTypeMap[method.typ];\n            if (verificationMethodType !== VerificationMethodType.JsonWebKey) {\n                throw new Error(`Unsupported verification method type for id \'${id}\': ${verificationMethodType}`);\n            }\n            verificationMethod.push(createVerificationMethod({\n                id: this.absoluteDidUrlReference(did, id),\n                type: verificationMethodType,\n                controller: did,\n                publicKeyJwk: this.publicKeyJwk(method.publicKeyJwk),\n            }));\n            verificationMethodIds.add(id);\n        }\n        const assertRelationTargetsExist = (relationName, relation) => {\n            if (relation.isEmpty())\n                return;\n            for (const methodId of relation) {\n                if (!verificationMethodIds.has(methodId)) {\n                    throw new Error(`${relationName} references missing verification method \'${this.absoluteDidUrlReference(did, methodId)}\'`);\n                }\n            }\n        };\n        assertRelationTargetsExist("authentication", ledger.authenticationRelation);\n        assertRelationTargetsExist("assertionMethod", ledger.assertionMethodRelation);\n        assertRelationTargetsExist("keyAgreement", ledger.keyAgreementRelation);\n        assertRelationTargetsExist("capabilityInvocation", ledger.capabilityInvocationRelation);\n        assertRelationTargetsExist("capabilityDelegation", ledger.capabilityDelegationRelation);\n        const mapRelation = (relation) => relation.isEmpty()\n            ? undefined\n            : Array.from(relation, (value) => this.verificationMethodId(value));\n        const assertionMethod = mapRelation(ledger.assertionMethodRelation);\n        const authentication = mapRelation(ledger.authenticationRelation);\n        const capabilityDelegation = mapRelation(ledger.capabilityDelegationRelation);\n        const capabilityInvocation = mapRelation(ledger.capabilityInvocationRelation);\n        const keyAgreement = mapRelation(ledger.keyAgreementRelation);\n        const service = ledger.services.isEmpty()\n            ? undefined\n            : Array.from(ledger.services, ([, s]) => {\n                const parsed = this.service(s);\n                return createService({\n                    id: this.absoluteDidUrlReference(did, s.id),\n                    type: parsed.type,\n                    serviceEndpoint: parsed.serviceEndpoint,\n                });\n            });\n        const alsoKnownAs = ledger.alsoKnownAs.isEmpty()\n            ? undefined\n            : Array.from(ledger.alsoKnownAs);\n        return createMidnightDIDDocument({\n            id: did,\n            verificationMethod,\n            authentication,\n            assertionMethod,\n            keyAgreement,\n            capabilityInvocation,\n            capabilityDelegation,\n            service,\n            alsoKnownAs,\n        });\n    }\n    static ledgerStateToMetadata(ledger) {\n        const created = this.timestampToIsoString(ledger.created);\n        const updated = this.timestampToIsoString(ledger.updated);\n        const deactivatedAt = ledger.deactivated\n            ? this.timestampToIsoString(ledger.updated)\n            : undefined;\n        const isDeactivated = ledger.deactivated || !ledger.active;\n        const metadata = {\n            created,\n            updated,\n            deactivated: isDeactivated ? true : undefined,\n            versionId: ledger.version.toString(),\n        };\n        if (isDeactivated && deactivatedAt !== undefined) {\n            metadata.updated = deactivatedAt;\n        }\n        return metadata;\n    }\n    static timestampToIsoString(timestamp) {\n        if (timestamp === 0n)\n            return undefined;\n        const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);\n        if (timestamp > maxSafe || timestamp < 0n)\n            return undefined;\n        const milliseconds = Number(timestamp);\n        if (Number.isNaN(milliseconds))\n            return undefined;\n        const iso = new Date(milliseconds).toISOString();\n        return iso.replace(/\\.\\d{3}Z$/, "Z");\n    }\n}\n//# sourceMappingURL=ledger-to-domain.js.map';
const didContractDistDir = path.join(
  repoRoot,
  'node_modules',
  '@midnight-ntwrk',
  'midnight-did-contract',
  'dist',
);
const didContractEntrypoint = path.join(didContractDistDir, 'index.js');
const didContractWitnesses = path.join(didContractDistDir, 'witnesses.js');
const didContractEntrypointContents = 'export * as DIDContract from "./managed/did/contract/index.js";\nexport * from "./witnesses.js";\n';
const didContractWitnessesContents = '// This file is part of midnightntwrk/midnight-did.\n// Copyright (C) 2025 Midnight Foundation\n// SPDX-License-Identifier: Apache-2.0\n// Licensed under the Apache License, Version 2.0 (the "License");\n// You may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n// http://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an "AS IS" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nconst TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;\nexport const witnesses = {\n    localSecretKey: ({ privateState }) => [privateState, privateState.secretKey],\n    currentTimestamp: ({ privateState }) => [\n        privateState,\n        BigInt(Date.now())\n    ],\n    getSchnorrReduction: ({ privateState }, challengeHash) => {\n        // Shared Schnorr witness contract:\n        // q = floor(challengeHash / 2^248)\n        // r = challengeHash mod 2^248\n        const q = challengeHash / TWO_248;\n        const r = challengeHash % TWO_248;\n        return [privateState, [q, r]];\n    }\n};\n//# sourceMappingURL=witnesses.js.map';
const didSecretStorageDistDir = path.join(
  repoRoot,
  'node_modules',
  '@midnight-ntwrk',
  'midnight-did-secret-storage',
  'dist',
);
const didSecretStorageEntrypoint = path.join(didSecretStorageDistDir, 'index.js');
const didSecretStorageEntrypointContents = 'export { parseSeed, seedToBuffer } from "./seed.js";\n';

await mkdir(path.dirname(aliasPath), { recursive: true });
let aliasReady = false;
try {
  const stat = await lstat(aliasPath);
  if (stat.isSymbolicLink()) {
    const existing = await readlink(aliasPath);
    if (existing === target) {
      aliasReady = true;
    }
  }
  if (!aliasReady) {
    await rm(aliasPath, { recursive: true, force: true });
  }
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
}
if (!aliasReady) {
  await symlink(target, aliasPath, 'dir');
}

try {
  await access(didEntrypoint);
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
  await mkdir(didDistDir, { recursive: true });
  await writeFile(didEntrypoint, didEntrypointContents);
}

try {
  await access(didLedgerToDomain);
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
  await mkdir(didDistDir, { recursive: true });
  await writeFile(didLedgerToDomain, didLedgerToDomainContents);
}

try {
  await access(didContractEntrypoint);
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
  await mkdir(didContractDistDir, { recursive: true });
  await writeFile(didContractEntrypoint, didContractEntrypointContents);
}

try {
  await access(didContractWitnesses);
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
  await mkdir(didContractDistDir, { recursive: true });
  await writeFile(didContractWitnesses, didContractWitnessesContents);
}

try {
  await access(didSecretStorageEntrypoint);
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
  await mkdir(didSecretStorageDistDir, { recursive: true });
  await writeFile(didSecretStorageEntrypoint, didSecretStorageEntrypointContents);
}
