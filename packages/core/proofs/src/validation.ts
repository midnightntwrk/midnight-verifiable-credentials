import { CredentialProofsError } from "./errors.js";
import { isEd25519Signature, MANIFEST_SIGNATURE_ALGORITHM } from "./serialization.js";
import type {
  BuildManifest,
  DeploymentManifest,
  ProofArtifactDescriptor,
  ProofCircuitDescriptor,
  ProofJob,
  ProofManifest,
  ProofResult,
  ProofVerificationResult,
} from "./types.js";

const versionPattern = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;
const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const packageNamePattern = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u;
const pathPattern = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[^\0]+$/u;
const identifier = (value: unknown, path: string): void => {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    throw new CredentialProofsError("INVALID_IDENTIFIER", path, "must be a non-empty trimmed string");
  }
};
const version = (value: unknown, path: string): void => {
  if (typeof value !== "string" || !versionPattern.test(value)) {
    throw new CredentialProofsError("INVALID_VERSION", path, "must be a semantic version");
  }
};
const digest = (value: unknown, path: string): void => {
  if (typeof value !== "string" || !digestPattern.test(value)) {
    throw new CredentialProofsError("INVALID_DIGEST", path, "must be a lowercase sha256 digest");
  }
};
const array = (value: unknown, path: string): void => {
  if (!Array.isArray(value)) {
    throw new CredentialProofsError("INVALID_MANIFEST", path, "must be an array");
  }
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      throw new CredentialProofsError("INVALID_MANIFEST", `${path}[${index}]`, "must not be a sparse array hole");
    }
  }
};
const unique = (values: readonly { readonly id: string }[], path: string): void => {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value.id)) {
      throw new CredentialProofsError("DUPLICATE_ID", `${path}[${index}].id`, `duplicates '${value.id}'`);
    }
    seen.add(value.id);
  });
};
const uniqueStrings = (values: readonly string[], path: string): void => {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      throw new CredentialProofsError("DUPLICATE_ID", `${path}[${index}]`, `duplicates '${value}'`);
    }
    seen.add(value);
  });
};
const scalar = (value: unknown, path: string): void => {
  if (typeof value === "string" || typeof value === "boolean") {
    return;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return;
  }
  throw new CredentialProofsError(
    "INVALID_MANIFEST",
    path,
    "must be a finite number, string, or boolean",
  );
};
const date = (value: unknown, path: string): number => {
  if (typeof value !== "string") {
    throw new CredentialProofsError("INVALID_TIMESTAMP", path, "must be an ISO-8601 UTC timestamp");
  }
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{3})?Z$/u.exec(value);
  const parsed = Date.parse(value);
  const canonical = match === null || Number.isNaN(parsed)
    ? undefined
    : new Date(parsed).toISOString().replace(/\.000Z$/u, match?.[2] === undefined ? "Z" : ".000Z");
  const expected = value;
  if (canonical === undefined || canonical !== expected) {
    throw new CredentialProofsError("INVALID_TIMESTAMP", path, "must be a valid ISO-8601 UTC timestamp");
  }
  return parsed;
};
const deepFreeze = <T>(value: T): T => {
  if (value !== null && typeof value === "object" && !ArrayBuffer.isView(value) && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};

export const assertProofJob = (job: ProofJob): void => {
  if (typeof job !== "object" || job === null || job.formatVersion !== 1) {
    throw new CredentialProofsError("INVALID_MANIFEST", "job", "must use formatVersion 1");
  }
  identifier(job.id, "job.id");
  version(job.version, "job.version");
  identifier(job.familyId, "job.familyId");
  identifier(job.circuitId, "job.circuitId");
  digest(job.proofManifestDigest, "job.proofManifestDigest");
  if (job.input === undefined) {
    throw new CredentialProofsError("INVALID_MANIFEST", "job.input", "must be present");
  }
};

export const assertProofResult = (result: ProofResult): void => {
  if (typeof result !== "object" || result === null || result.formatVersion !== 1) {
    throw new CredentialProofsError("INVALID_MANIFEST", "result", "must use formatVersion 1");
  }
  identifier(result.jobId, "result.jobId");
  digest(result.proofManifestDigest, "result.proofManifestDigest");
  if (result.proof === undefined) throw new CredentialProofsError("INVALID_MANIFEST", "result.proof", "must be present");
};

export const assertProofVerificationResult = (result: ProofVerificationResult): void => {
  if (typeof result !== "object" || result === null || result.formatVersion !== 1) {
    throw new CredentialProofsError("INVALID_MANIFEST", "verification", "must use formatVersion 1");
  }
  identifier(result.jobId, "verification.jobId");
  digest(result.proofManifestDigest, "verification.proofManifestDigest");
  if (typeof result.valid !== "boolean") throw new CredentialProofsError("INVALID_MANIFEST", "verification.valid", "must be a boolean");
  if (result.reason !== undefined) identifier(result.reason, "verification.reason");
};

export const assertProofManifest = (manifest: ProofManifest): void => {
  if (typeof manifest !== "object" || manifest === null || manifest.formatVersion !== 1 || manifest.manifestKind !== "proof") {
    throw new CredentialProofsError("INVALID_MANIFEST", "proof", "must use proof manifest formatVersion 1");
  }
  digest(manifest.manifestDigest, "proof.manifestDigest");
  identifier(manifest.id, "proof.id");
  version(manifest.version, "proof.version");
  identifier(manifest.familyId, "proof.familyId");
  identifier(manifest.circuitId, "proof.circuitId");
  identifier(manifest.proofSystem, "proof.proofSystem");
  identifier(manifest.proofFormat, "proof.proofFormat");
  identifier(manifest.publicInputEncoding, "proof.publicInputEncoding");
  array(manifest.artifactIds, "proof.artifactIds");
  manifest.artifactIds.forEach((id, index) => identifier(id, `proof.artifactIds[${index}]`));
  if (new Set(manifest.artifactIds).size !== manifest.artifactIds.length) {
    throw new CredentialProofsError("DUPLICATE_ID", "proof.artifactIds", "must not contain duplicates");
  }
};

const assertArtifact = (artifact: ProofArtifactDescriptor, index: number): void => {
  const path = `build.artifacts[${index}]`;
  if (typeof artifact !== "object" || artifact === null) throw new CredentialProofsError("INVALID_ARTIFACT", path, "must be an object");
  identifier(artifact.id, `${path}.id`);
  version(artifact.version, `${path}.version`);
  if (!["prover-key", "verifier-key", "circuit", "managed-code", "metadata"].includes(artifact.role)) {
    throw new CredentialProofsError("INVALID_ARTIFACT", `${path}.role`, "must be a supported artifact role");
  }
  identifier(artifact.mediaType, `${path}.mediaType`);
  if (typeof artifact.path !== "string" || !pathPattern.test(artifact.path)) {
    throw new CredentialProofsError("INVALID_ARTIFACT", `${path}.path`, "must be a relative path without parent traversal");
  }
  if (!Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0) {
    throw new CredentialProofsError("INVALID_ARTIFACT", `${path}.bytes`, "must be a non-negative safe integer");
  }
  digest(artifact.sha256, `${path}.sha256`);
  const expectedPath = artifact.role === "prover-key"
    ? /^keys\/[^/]+\.prover$/u
    : artifact.role === "verifier-key"
      ? /^keys\/[^/]+\.verifier$/u
      : artifact.role === "circuit"
        ? /^zkir\/[^/]+\.bzkir$/u
        : undefined;
  if (expectedPath !== undefined && !expectedPath.test(artifact.path)) {
    throw new CredentialProofsError(
      "INVALID_ARTIFACT",
      `${path}.path`,
      `does not match the ${artifact.role} artifact layout`,
    );
  }
};

const assertCircuit = (circuit: ProofCircuitDescriptor, index: number): void => {
  const path = `build.circuits[${index}]`;
  if (typeof circuit !== "object" || circuit === null) throw new CredentialProofsError("INVALID_MANIFEST", path, "must be an object");
  identifier(circuit.id, `${path}.id`);
  version(circuit.version, `${path}.version`);
  if (typeof circuit.parameters !== "object" || circuit.parameters === null || Array.isArray(circuit.parameters)) throw new CredentialProofsError("INVALID_MANIFEST", `${path}.parameters`, "must be a record");
  for (const [name, value] of Object.entries(circuit.parameters)) scalar(value, `${path}.parameters.${name}`);
  if (
    typeof circuit.metrics !== "object" ||
    circuit.metrics === null ||
    !Number.isSafeInteger(circuit.metrics.k) ||
    circuit.metrics.k <= 0 ||
    !Number.isSafeInteger(circuit.metrics.rows) ||
    circuit.metrics.rows <= 0
  ) {
    throw new CredentialProofsError("INVALID_MANIFEST", `${path}.metrics`, "must report positive safe-integer k and rows");
  }
  array(circuit.artifactIds, `${path}.artifactIds`);
  circuit.artifactIds.forEach((id, itemIndex) => identifier(id, `${path}.artifactIds[${itemIndex}]`));
  uniqueStrings(circuit.artifactIds, `${path}.artifactIds`);
};

export const assertBuildManifest = (manifest: BuildManifest): void => {
  if (typeof manifest !== "object" || manifest === null || manifest.formatVersion !== 1 || manifest.manifestKind !== "build") {
    throw new CredentialProofsError("INVALID_MANIFEST", "build", "must use build manifest formatVersion 1");
  }
  digest(manifest.manifestDigest, "build.manifestDigest");
  for (const [name, value] of Object.entries({ productId: manifest.productId, packageName: manifest.packageName, schemaId: manifest.schemaId, contractId: manifest.contractId, sourceCommit: manifest.sourceCommit })) identifier(value, `build.${name}`);
  if (!packageNamePattern.test(manifest.packageName)) throw new CredentialProofsError("INVALID_IDENTIFIER", "build.packageName", "must be a package name");
  if (manifest.cleanTree !== true) throw new CredentialProofsError("INVALID_MANIFEST", "build.cleanTree", "must be true for a reproducible build");
  if (typeof manifest.toolchain !== "object" || manifest.toolchain === null || Array.isArray(manifest.toolchain)) throw new CredentialProofsError("INVALID_MANIFEST", "build.toolchain", "must be a record");
  for (const [name, value] of Object.entries(manifest.toolchain)) identifier(value, `build.toolchain.${name}`);
  array(manifest.circuits, "build.circuits");
  manifest.circuits.forEach(assertCircuit);
  unique(manifest.circuits, "build.circuits");
  array(manifest.proofs, "build.proofs");
  manifest.proofs.forEach(assertProofManifest);
  unique(manifest.proofs, "build.proofs");
  array(manifest.artifacts, "build.artifacts");
  manifest.artifacts.forEach(assertArtifact);
  unique(manifest.artifacts, "build.artifacts");
  const artifactIds = new Set(manifest.artifacts.map((artifact) => artifact.id));
  const circuitIds = new Set(manifest.circuits.map((circuit) => circuit.id));
  for (const [index, circuit] of manifest.circuits.entries()) for (const [artifactIndex, artifactId] of circuit.artifactIds.entries()) if (!artifactIds.has(artifactId)) throw new CredentialProofsError("MISMATCHED_REFERENCE", `build.circuits[${index}].artifactIds[${artifactIndex}]`, `does not identify a build artifact`);
  for (const [index, proofManifest] of manifest.proofs.entries()) {
    if (!circuitIds.has(proofManifest.circuitId)) throw new CredentialProofsError("MISMATCHED_REFERENCE", `build.proofs[${index}].circuitId`, "does not identify a declared circuit");
    for (const [artifactIndex, artifactId] of proofManifest.artifactIds.entries()) if (!artifactIds.has(artifactId)) throw new CredentialProofsError("MISMATCHED_REFERENCE", `build.proofs[${index}].artifactIds[${artifactIndex}]`, `does not identify a build artifact`);
  }
  digest(manifest.lockfileDigest, "build.lockfileDigest");
  if (manifest.sbomReference !== undefined) identifier(manifest.sbomReference, "build.sbomReference");
  if (manifest.provenanceReference !== undefined) identifier(manifest.provenanceReference, "build.provenanceReference");
};

export const assertDeploymentManifest = (manifest: DeploymentManifest): void => {
  if (typeof manifest !== "object" || manifest === null || manifest.formatVersion !== 1 || manifest.manifestKind !== "deployment") {
    throw new CredentialProofsError("INVALID_MANIFEST", "deployment", "must use deployment manifest formatVersion 1");
  }
  digest(manifest.deploymentManifestDigest, "deployment.deploymentManifestDigest");
  for (const [name, value] of Object.entries({ deploymentId: manifest.deploymentId, deploymentIdentity: manifest.deploymentIdentity, networkId: manifest.networkId, chainId: manifest.chainId, contractAddress: manifest.contractAddress, deploymentTransaction: manifest.deploymentTransaction, governanceOwner: manifest.governanceOwner })) identifier(value, `deployment.${name}`);
  version(manifest.deploymentVersion, "deployment.deploymentVersion");
  if (typeof manifest.profile !== "object" || manifest.profile === null) throw new CredentialProofsError("INVALID_MANIFEST", "deployment.profile", "must be an object");
  identifier(manifest.profile.id, "deployment.profile.id");
  version(manifest.profile.version, "deployment.profile.version");
  digest(manifest.buildManifestDigest, "deployment.buildManifestDigest");
  digest(manifest.constructorDigest, "deployment.constructorDigest");
  array(manifest.acceptedReferences, "deployment.acceptedReferences");
  manifest.acceptedReferences.forEach((reference, index) => { identifier(reference.id, `deployment.acceptedReferences[${index}].id`); digest(reference.digest, `deployment.acceptedReferences[${index}].digest`); });
  unique(manifest.acceptedReferences, "deployment.acceptedReferences");
  if (typeof manifest.supportWindow !== "object" || manifest.supportWindow === null) throw new CredentialProofsError("INVALID_MANIFEST", "deployment.supportWindow", "must be an object");
  const notBefore = date(manifest.supportWindow.notBefore, "deployment.supportWindow.notBefore");
  if (manifest.supportWindow.notAfter !== undefined) {
    const notAfter = date(manifest.supportWindow.notAfter, "deployment.supportWindow.notAfter");
    if (notAfter < notBefore) throw new CredentialProofsError("INVALID_TIMESTAMP", "deployment.supportWindow", "notAfter must not precede notBefore");
  }
  if (manifest.predecessor !== undefined) digest(manifest.predecessor, "deployment.predecessor");
  if (manifest.successor !== undefined) digest(manifest.successor, "deployment.successor");
  if (manifest.deprecation !== undefined) identifier(manifest.deprecation, "deployment.deprecation");
  if (manifest.revocation !== undefined) identifier(manifest.revocation, "deployment.revocation");
  if (typeof manifest.signature !== "object" || manifest.signature === null) throw new CredentialProofsError("INVALID_MANIFEST", "deployment.signature", "must be an object");
  if (manifest.signature.algorithm !== MANIFEST_SIGNATURE_ALGORITHM) {
    throw new CredentialProofsError("INVALID_SIGNATURE", "deployment.signature.algorithm", "must be Ed25519");
  }
  identifier(manifest.signature.keyId, "deployment.signature.keyId");
  if (!isEd25519Signature(manifest.signature.value)) {
    throw new CredentialProofsError("INVALID_SIGNATURE", "deployment.signature.value", "must be a 64-byte unpadded base64url Ed25519 signature");
  }
};

export const defineProofJob = <TInput>(job: ProofJob<TInput>): ProofJob<TInput> => { assertProofJob(job); return deepFreeze(job); };
export const defineProofManifest = (manifest: ProofManifest): ProofManifest => { assertProofManifest(manifest); return deepFreeze(manifest); };
export const defineBuildManifest = (manifest: BuildManifest): BuildManifest => { assertBuildManifest(manifest); return deepFreeze(manifest); };
export const defineDeploymentManifest = (manifest: DeploymentManifest): DeploymentManifest => { assertDeploymentManifest(manifest); return deepFreeze(manifest); };

export const validateProofJob = assertProofJob;
export const validateProofResult = assertProofResult;
export const validateProofVerificationResult = assertProofVerificationResult;
export const validateProofManifest = assertProofManifest;
export const validateBuildManifest = assertBuildManifest;
export const validateDeploymentManifest = assertDeploymentManifest;
