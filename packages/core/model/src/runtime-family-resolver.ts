import { resolveCredentialComposition } from "./composition-resolver.js";
import type {
  CredentialFamilyReference,
  ResolvedCredentialCompositionV1,
} from "./composition-types.js";
import { CredentialModelError } from "./errors.js";
import type {
  ResolveRuntimeCredentialFamilyInput,
  RuntimeCredentialFamilyAuthenticatedMetadataV1,
  RuntimeCredentialFamilyPublicSurfaceV1,
  RuntimeCredentialFamilyRecordV1,
  RuntimeCredentialFamilyResolution,
  RuntimeCredentialFamilyUnsupported,
  RuntimeCredentialFamilyUnsupportedCode,
} from "./runtime-family-types.js";
import type { CredentialFamilyDefinition } from "./types.js";

const semanticVersion =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;
const sha256Digest = /^[0-9a-f]{64}$/u;

type UnknownRecord = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.trim() === value;

const isVersion = (value: unknown): value is string =>
  typeof value === "string" && semanticVersion.test(value);

const ownValue = (value: UnknownRecord, key: string): unknown => {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined || !("value" in descriptor)) {
    throw new TypeError(`Expected a data property for '${key}'.`);
  }
  return descriptor.value;
};

const snapshotData = (value: unknown): unknown => {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value;
  }
  if (typeof value !== "object") {
    throw new TypeError("Expected declarative metadata.");
  }
  if (Array.isArray(value)) {
    const result: unknown[] = [];
    for (let index = 0; index < value.length; index += 1) {
      result.push(
        snapshotData(ownValue(value as unknown as UnknownRecord, String(index))),
      );
    }
    return Object.freeze(result);
  }
  const source = value as UnknownRecord;
  const result: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;
  for (const key of Object.keys(source)) {
    result[key] = snapshotData(ownValue(source, key));
  }
  return Object.freeze(result);
};

const snapshotCodec = (value: unknown): UnknownRecord => {
  if (!isRecord(value)) throw new TypeError("Expected a codec object.");
  const mediaType = ownValue(value, "mediaType");
  const encode = ownValue(value, "encode");
  const decode = ownValue(value, "decode");
  return Object.freeze({ mediaType, encode, decode });
};

const snapshotFamily = (
  value: unknown,
): CredentialFamilyDefinition<unknown, unknown, unknown, unknown> => {
  if (!isRecord(value)) throw new TypeError("Expected a family definition.");
  return Object.freeze({
    id: snapshotData(ownValue(value, "id")),
    version: snapshotData(ownValue(value, "version")),
    schema: snapshotData(ownValue(value, "schema")),
    capabilities: snapshotData(ownValue(value, "capabilities")),
    artifacts: snapshotData(ownValue(value, "artifacts")),
    composition: snapshotData(ownValue(value, "composition")),
    credentialCodec: snapshotCodec(ownValue(value, "credentialCodec")),
    presentationCodec: snapshotCodec(ownValue(value, "presentationCodec")),
  }) as unknown as CredentialFamilyDefinition<unknown, unknown, unknown, unknown>;
};

const snapshotRuntimeRecord = (
  value: unknown,
): RuntimeCredentialFamilyRecordV1 => {
  if (!isRecord(value) || ownValue(value, "formatVersion") !== 1) {
    throw new TypeError("Expected runtime record format version 1.");
  }
  const surfaceSource = ownValue(value, "publicSurface");
  if (!isRecord(surfaceSource)) {
    throw new TypeError("Expected a public surface object.");
  }
  const publicSurface = Object.freeze({
    formatVersion: snapshotData(ownValue(surfaceSource, "formatVersion")),
    family: snapshotData(ownValue(surfaceSource, "family")),
    profile: snapshotData(ownValue(surfaceSource, "profile")),
    package: snapshotData(ownValue(surfaceSource, "package")),
    artifact: snapshotData(ownValue(surfaceSource, "artifact")),
    value: ownValue(surfaceSource, "value"),
  });
  return Object.freeze({
    formatVersion: 1,
    family: snapshotFamily(ownValue(value, "family")),
    profile: snapshotData(ownValue(value, "profile")),
    assembly: snapshotData(ownValue(value, "assembly")),
    catalog: snapshotData(ownValue(value, "catalog")),
    publicSurface,
    authentication: snapshotData(ownValue(value, "authentication")),
  }) as unknown as RuntimeCredentialFamilyRecordV1;
};

const unsupported = (
  reference: CredentialFamilyReference,
  code: RuntimeCredentialFamilyUnsupportedCode,
  diagnostic: string,
  registryId?: string,
): RuntimeCredentialFamilyUnsupported => ({
  status: "unsupported",
  code,
  reference,
  ...(registryId === undefined ? {} : { registryId }),
  diagnostic,
});

const isReference = (value: unknown): value is CredentialFamilyReference =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isVersion(value.version) &&
  isNonEmptyString(value.schemaId) &&
  isVersion(value.schemaVersion);

const familyReferenceFromRecord = (
  value: UnknownRecord,
): CredentialFamilyReference | null => {
  if (!isNonEmptyString(value.id) || !isVersion(value.version)) return null;
  if (!isRecord(value.schema)) return null;
  if (!isNonEmptyString(value.schema.id) || !isVersion(value.schema.version)) {
    return null;
  }
  return {
    id: value.id,
    version: value.version,
    schemaId: value.schema.id,
    schemaVersion: value.schema.version,
  };
};

const referencesEqual = (
  left: CredentialFamilyReference,
  right: CredentialFamilyReference,
): boolean =>
  left.id === right.id &&
  left.version === right.version &&
  left.schemaId === right.schemaId &&
  left.schemaVersion === right.schemaVersion;

const referenceMismatchCode = (
  expected: CredentialFamilyReference,
  actual: CredentialFamilyReference,
): RuntimeCredentialFamilyUnsupportedCode =>
  expected.id === actual.id &&
  expected.schemaId === actual.schemaId &&
  (expected.version !== actual.version ||
    expected.schemaVersion !== actual.schemaVersion)
    ? "VERSION_MISMATCH"
    : "INCOMPATIBLE_FAMILY";

const isProfileIdentity = (
  value: unknown,
): value is { readonly id: string; readonly version: string } =>
  isRecord(value) && isNonEmptyString(value.id) && isVersion(value.version);

const isPackageIdentity = (
  value: unknown,
): value is RuntimeCredentialFamilyPublicSurfaceV1["package"] =>
  isRecord(value) &&
  isNonEmptyString(value.name) &&
  isVersion(value.version) &&
  isNonEmptyString(value.exportPath);

const isArtifactIdentity = (
  value: unknown,
): value is RuntimeCredentialFamilyPublicSurfaceV1["artifact"] =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  value.digestAlgorithm === "sha256" &&
  typeof value.digest === "string" &&
  sha256Digest.test(value.digest);

const isAuthenticationEvidence = (
  value: unknown,
): value is RuntimeCredentialFamilyRecordV1["authentication"] =>
  isRecord(value) &&
  isNonEmptyString(value.scheme) &&
  isNonEmptyString(value.authority) &&
  isNonEmptyString(value.keyId) &&
  isNonEmptyString(value.signature);

const structuralModelErrorCodes = new Set<CredentialModelError["code"]>([
  "INVALID_IDENTIFIER",
  "INVALID_VERSION",
  "INVALID_DESCRIPTOR",
  "DUPLICATE_ID",
  "INVALID_PACKAGE_REQUIREMENT",
  "INVALID_CODEC",
  "MISSING_FIELD",
  "UNKNOWN_FIELD",
  "UNSUPPORTED_VALUE",
  "MISSING_REQUIRED_RULE",
]);

const modelDiagnostic = (error: unknown): string =>
  error instanceof CredentialModelError
    ? `Composition rejected ${error.code} at ${error.path}.`
    : "Composition input was invalid.";

const compositionFailureCode = (
  error: unknown,
): RuntimeCredentialFamilyUnsupportedCode =>
  error instanceof CredentialModelError && structuralModelErrorCodes.has(error.code)
    ? "INVALID_REGISTRY_RESPONSE"
    : "INCOMPATIBLE_FAMILY";

export const resolveRuntimeCredentialFamily = async <TSurface>(
  input: ResolveRuntimeCredentialFamilyInput<TSurface>,
): Promise<RuntimeCredentialFamilyResolution<TSurface>> => {
  if (!isReference(input.reference)) {
    return unsupported(
      input.reference,
      "INVALID_REFERENCE",
      "Family and schema identities require non-empty IDs and semantic versions.",
    );
  }

  const unavailableRegistries: string[] = [];
  for (const registry of input.registries) {
    const rawRegistry: unknown = registry;
    if (!isRecord(rawRegistry) || rawRegistry.formatVersion !== 1) {
      return unsupported(
        input.reference,
        "UNSUPPORTED_REGISTRY_VERSION",
        "Runtime family registries must implement contract format version 1.",
        isRecord(rawRegistry) && isNonEmptyString(rawRegistry.id)
          ? rawRegistry.id
          : undefined,
      );
    }
    if (
      !isNonEmptyString(rawRegistry.id) ||
      !isVersion(rawRegistry.version) ||
      typeof rawRegistry.resolve !== "function"
    ) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Runtime family registry identity or resolver function was invalid.",
      );
    }

    const registryIdentity = {
      id: rawRegistry.id,
      version: rawRegistry.version,
    };
    let candidate: unknown;
    try {
      candidate = await registry.resolve(input.reference);
    } catch {
      unavailableRegistries.push(registryIdentity.id);
      continue;
    }
    if (candidate === undefined) continue;
    let record: RuntimeCredentialFamilyRecordV1;
    try {
      record = snapshotRuntimeRecord(candidate);
    } catch {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Registry record fields could not be read safely.",
        registryIdentity.id,
      );
    }
    if (!isRecord(record.family)) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Registry record did not contain a credential family definition.",
        registryIdentity.id,
      );
    }

    const candidateReference = familyReferenceFromRecord(record.family);
    if (candidateReference === null) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Registry family identity was malformed.",
        registryIdentity.id,
      );
    }
    if (!referencesEqual(input.reference, candidateReference)) {
      return unsupported(
        input.reference,
        referenceMismatchCode(input.reference, candidateReference),
        "Registry returned a different family or schema identity.",
        registryIdentity.id,
      );
    }

    let composition: ResolvedCredentialCompositionV1;
    try {
      const resolved = resolveCredentialComposition({
        family: record.family,
        profile: record.profile,
        assembly: record.assembly,
        catalog: record.catalog,
      });
      composition = snapshotData(resolved) as ResolvedCredentialCompositionV1;
    } catch (error) {
      return unsupported(
        input.reference,
        compositionFailureCode(error),
        modelDiagnostic(error),
        registryIdentity.id,
      );
    }
    if (!referencesEqual(input.reference, composition.family)) {
      return unsupported(
        input.reference,
        referenceMismatchCode(input.reference, composition.family),
        "Resolved composition did not preserve the requested family identity.",
        registryIdentity.id,
      );
    }

    const surfaceSource: unknown = record.publicSurface;
    if (!isRecord(surfaceSource)) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Registry record did not contain a public family surface.",
        registryIdentity.id,
      );
    }
    let rawSurface: UnknownRecord;
    try {
      rawSurface = {
        formatVersion: surfaceSource.formatVersion,
        family: surfaceSource.family,
        profile: surfaceSource.profile,
        package: surfaceSource.package,
        artifact: surfaceSource.artifact,
        value: surfaceSource.value,
      };
    } catch {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Public family surface fields could not be read safely.",
        registryIdentity.id,
      );
    }
    if (
      rawSurface.formatVersion !== 1 ||
      !isReference(rawSurface.family) ||
      !isProfileIdentity(rawSurface.profile) ||
      !isPackageIdentity(rawSurface.package) ||
      !isArtifactIdentity(rawSurface.artifact)
    ) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Public family surface metadata was malformed.",
        registryIdentity.id,
      );
    }
    if (!referencesEqual(input.reference, rawSurface.family)) {
      return unsupported(
        input.reference,
        referenceMismatchCode(input.reference, rawSurface.family),
        "Public surface did not preserve the requested family identity.",
        registryIdentity.id,
      );
    }
    if (
      rawSurface.profile.id !== composition.profile.id ||
      rawSurface.profile.version !== composition.profile.version
    ) {
      return unsupported(
        input.reference,
        "INCOMPATIBLE_FAMILY",
        "Public surface profile identity did not match the resolved composition.",
        registryIdentity.id,
      );
    }

    const packageIdentity = rawSurface.package;
    const resolvedPackage = composition.packages.find(
      (entry) => entry.name === packageIdentity.name,
    );
    if (
      resolvedPackage === undefined ||
      resolvedPackage.version !== packageIdentity.version ||
      !resolvedPackage.exports.includes(packageIdentity.exportPath)
    ) {
      return unsupported(
        input.reference,
        "ARTIFACT_IDENTITY_MISMATCH",
        "Public surface package/export identity was not in the exact composition.",
        registryIdentity.id,
      );
    }

    const authenticationSource: unknown = record.authentication;
    if (!isRecord(authenticationSource)) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Registry authentication evidence was malformed.",
        registryIdentity.id,
      );
    }
    const authentication = Object.freeze({
      scheme: authenticationSource.scheme,
      authority: authenticationSource.authority,
      keyId: authenticationSource.keyId,
      signature: authenticationSource.signature,
    });
    if (!isAuthenticationEvidence(authentication)) {
      return unsupported(
        input.reference,
        "INVALID_REGISTRY_RESPONSE",
        "Registry authentication evidence was malformed.",
        registryIdentity.id,
      );
    }

    const publicSurface = Object.freeze({
      formatVersion: 1 as const,
      family: rawSurface.family,
      profile: rawSurface.profile,
      package: rawSurface.package,
      artifact: rawSurface.artifact,
    });
    const metadata = snapshotData({
      formatVersion: 1,
      family: composition.family,
      compositionInput: {
        family: {
          id: record.family.id,
          version: record.family.version,
          schema: record.family.schema,
          capabilities: record.family.capabilities,
          artifacts: record.family.artifacts,
          composition: record.family.composition,
        },
        profile: record.profile,
        assembly: record.assembly,
        catalog: record.catalog,
      },
      composition,
      publicSurface,
    }) as RuntimeCredentialFamilyAuthenticatedMetadataV1;
    const surfaceValue = rawSurface.value;
    let trustDecision;
    try {
      trustDecision = await input.trustVerifier.verify({
        registry: registryIdentity,
        metadata,
        authentication,
        surface: surfaceValue,
      });
    } catch {
      return unsupported(
        input.reference,
        "UNTRUSTED_FAMILY",
        "Runtime family authentication could not be verified.",
        registryIdentity.id,
      );
    }
    if (!isRecord(trustDecision) || trustDecision.trusted !== true) {
      return unsupported(
        input.reference,
        "UNTRUSTED_FAMILY",
        isRecord(trustDecision) && isNonEmptyString(trustDecision.reason)
          ? trustDecision.reason
          : "Runtime family authentication was rejected.",
        registryIdentity.id,
      );
    }
    let validatedSurface: TSurface;
    try {
      if (!input.validateSurface(surfaceValue)) {
        return unsupported(
          input.reference,
          "INCOMPATIBLE_FAMILY",
          "Authenticated public surface did not satisfy the consumer contract.",
          registryIdentity.id,
        );
      }
      validatedSurface = surfaceValue;
    } catch {
      return unsupported(
        input.reference,
        "INCOMPATIBLE_FAMILY",
        "Authenticated public surface guard failed.",
        registryIdentity.id,
      );
    }

    return {
      status: "resolved",
      reference: input.reference,
      registry: registryIdentity,
      composition,
      publicSurface,
      authentication,
      surface: validatedSurface,
    };
  }

  return unavailableRegistries.length > 0
    ? unsupported(
        input.reference,
        "REGISTRY_UNAVAILABLE",
        `No registry resolved the family; unavailable registries: ${unavailableRegistries.join(", ")}.`,
      )
    : unsupported(
        input.reference,
        "UNKNOWN_FAMILY",
        "No configured registry recognizes the requested family identity.",
      );
};
