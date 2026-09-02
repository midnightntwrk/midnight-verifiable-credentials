import type {
  CapabilityProviderCatalogV1,
  CredentialDeploymentAssemblyV1,
  CredentialDeploymentRole,
  CredentialFamilyProfileV1,
  CredentialPackageDomain,
  CredentialProfileDenyRule,
  ExactCredentialPackageRequirement,
  VersionedCapabilityReference,
} from "./composition-types.js";
import { CredentialModelError } from "./errors.js";

const semanticVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u;
const packageNamePattern =
  /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u;
const digestPattern = /^sha256:[0-9a-f]{64}$/u;

export const CREDENTIAL_DEPLOYMENT_ROLES: readonly CredentialDeploymentRole[] =
  Object.freeze([
  "session",
  "storage",
  "key-custody",
  "signing",
  "did-resolver",
  "trust-resolver",
  "wallet",
  "connector",
  "network",
  "transport",
  "proof-executor",
  "artifact-resolver",
  "status-registry",
  "status-proof",
  "status-authority",
  "status-mutation",
  "replay",
  "verification",
  "registration",
  "anchoring",
] as const);

export const CREDENTIAL_PROFILE_DENY_RULES: readonly CredentialProfileDenyRule[] =
  Object.freeze([
  "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION",
  "STATUS_EVIDENCE_REQUIRED",
  "CALLER_TIME_WITH_LEDGER_AUTHORITY",
  "ATOMIC_REPLAY_REQUIRED",
  "DISABLED_CAPABILITY_DEPENDENCY",
  "LEDGER_COMMIT_REQUIRED",
  "UNTESTED_COMBINATION",
] as const);

const packageDomains = [
  "family",
  "compact",
  "proof",
  "holder-binding",
  "status-registry",
  "status-proof",
  "status-authority",
  "status-mutation",
  "signing",
  "did",
  "trust",
  "protocol",
  "replay",
  "session",
  "storage",
  "wallet",
  "network",
  "transport",
  "artifact",
  "verification",
  "registration",
  "anchoring",
] as const satisfies readonly CredentialPackageDomain[];

const at = (path: string, field: string): string =>
  path.length === 0 ? field : `${path}.${field}`;

const fail = (
  code: CredentialModelError["code"],
  path: string,
  message: string,
): never => {
  throw new CredentialModelError(code, path, message);
};

const object = (value: unknown, path: string): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail("INVALID_DESCRIPTOR", path, "must be an object");
  }
  return value as Record<string, unknown>;
};

const exactObject = (
  value: unknown,
  path: string,
  fields: readonly string[],
): Record<string, unknown> => {
  const candidate = object(value, path);
  for (const field of fields) {
    if (!Object.hasOwn(candidate, field)) {
      fail("MISSING_FIELD", at(path, field), "is required");
    }
  }
  for (const field of Object.keys(candidate)) {
    if (!fields.includes(field)) {
      fail("UNKNOWN_FIELD", at(path, field), "is not admitted by format v1");
    }
  }
  return candidate;
};

const array = (value: unknown, path: string): readonly unknown[] => {
  if (!Array.isArray(value)) {
    fail("INVALID_DESCRIPTOR", path, "must be an array");
  }
  const values = value as readonly unknown[];
  for (let index = 0; index < values.length; index += 1) {
    if (!Object.hasOwn(values, index)) {
      fail("INVALID_DESCRIPTOR", `${path}[${index}]`, "sparse arrays are forbidden");
    }
  }
  return values;
};

const identifier = (value: unknown, path: string): string => {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    fail("INVALID_IDENTIFIER", path, "must be a non-empty trimmed string");
  }
  return value as string;
};

const version = (value: unknown, path: string): string => {
  if (typeof value !== "string" || !semanticVersionPattern.test(value)) {
    fail("INVALID_VERSION", path, "must be an exact semantic version");
  }
  return value as string;
};

const oneOf = <T extends string>(
  value: unknown,
  path: string,
  values: readonly T[],
): T => {
  if (typeof value !== "string" || !values.includes(value as T)) {
    fail("UNSUPPORTED_VALUE", path, `must be one of ${values.join(", ")}`);
  }
  return value as T;
};

const boolean = (value: unknown, path: string): boolean => {
  if (typeof value !== "boolean") {
    fail("INVALID_DESCRIPTOR", path, "must be a boolean");
  }
  return value as boolean;
};

const unique = (
  values: readonly unknown[],
  path: string,
  identity: (value: unknown, path: string) => string,
): void => {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    const itemPath = `${path}[${index}]`;
    const id = identity(value, itemPath);
    if (seen.has(id)) fail("DUPLICATE_ID", itemPath, `duplicates '${id}'`);
    seen.add(id);
  });
};

const capability = (
  value: unknown,
  path: string,
): VersionedCapabilityReference => {
  const candidate = exactObject(value, path, ["id", "version"]);
  identifier(candidate.id, at(path, "id"));
  version(candidate.version, at(path, "version"));
  return value as VersionedCapabilityReference;
};

const packageRequirement = (
  value: unknown,
  path: string,
): ExactCredentialPackageRequirement => {
  const candidate = exactObject(value, path, [
    "name",
    "version",
    "exports",
    "domain",
  ]);
  if (
    typeof candidate.name !== "string" ||
    !packageNamePattern.test(candidate.name)
  ) {
    fail("INVALID_PACKAGE_REQUIREMENT", at(path, "name"), "must be a valid npm package name");
  }
  version(candidate.version, at(path, "version"));
  const exports = array(candidate.exports, at(path, "exports"));
  const exportPaths = new Set<string>();
  exports.forEach((exportPath, index) => {
    const exportValue = identifier(exportPath, `${path}.exports[${index}]`);
    if (exportValue !== "." && !exportValue.startsWith("./")) {
      fail(
        "INVALID_PACKAGE_REQUIREMENT",
        `${path}.exports[${index}]`,
        "must be '.' or an explicit subpath beginning './'",
      );
    }
    if (exportPaths.has(exportValue)) {
      fail("DUPLICATE_ID", `${path}.exports[${index}]`, `duplicates '${exportValue}'`);
    }
    exportPaths.add(exportValue);
  });
  oneOf(candidate.domain, at(path, "domain"), packageDomains);
  return value as ExactCredentialPackageRequirement;
};

const validateFamilyReference = (value: unknown, path: string): void => {
  const candidate = exactObject(value, path, [
    "id",
    "version",
    "schemaId",
    "schemaVersion",
  ]);
  identifier(candidate.id, at(path, "id"));
  version(candidate.version, at(path, "version"));
  identifier(candidate.schemaId, at(path, "schemaId"));
  version(candidate.schemaVersion, at(path, "schemaVersion"));
};

const validateSemantics = (value: unknown): void => {
  const semantics = exactObject(value, "semantics", [
    "claims",
    "holderBinding",
    "issuance",
    "presentation",
    "verification",
    "status",
    "did",
    "trust",
    "trustedTime",
    "mutation",
    "protocols",
  ]);

  const claims = array(semantics.claims, "semantics.claims");
  unique(claims, "semantics.claims", (claim, path) => {
    const candidate = exactObject(claim, path, ["claimId", "disclosure"]);
    const id = identifier(candidate.claimId, at(path, "claimId"));
    oneOf(candidate.disclosure, at(path, "disclosure"), [
      "public",
      "selective",
      "committed",
      "predicate-only",
    ]);
    return id;
  });

  const holder = exactObject(semantics.holderBinding, "semantics.holderBinding", [
    "mode",
    "capability",
  ]);
  const holderMode = oneOf(holder.mode, "semantics.holderBinding.mode", [
    "explicit-did",
    "secret",
    "blinded-secret",
    "offchain-did",
  ]);
  capability(holder.capability, "semantics.holderBinding.capability");

  const issuance = exactObject(semantics.issuance, "semantics.issuance", [
    "credential",
    "registration",
    "anchoring",
  ]);
  oneOf(issuance.credential, "semantics.issuance.credential", [
    "issuer-local-issuance-v1",
  ]);
  oneOf(issuance.registration, "semantics.issuance.registration", [
    "disabled",
    "ledger-registration-v1",
  ]);
  oneOf(issuance.anchoring, "semantics.issuance.anchoring", [
    "disabled",
    "ledger-anchoring-v1",
  ]);

  const presentation = exactObject(
    semantics.presentation,
    "semantics.presentation",
    ["capability", "preparation", "proofGeneration"],
  );
  capability(presentation.capability, "semantics.presentation.capability");
  oneOf(presentation.preparation, "semantics.presentation.preparation", [
    "holder-wallet-v1",
  ]);
  const proofGeneration = exactObject(
    presentation.proofGeneration,
    "semantics.presentation.proofGeneration",
    ["capability", "witnessPolicy"],
  );
  capability(
    proofGeneration.capability,
    "semantics.presentation.proofGeneration.capability",
  );
  oneOf(
    proofGeneration.witnessPolicy,
    "semantics.presentation.proofGeneration.witnessPolicy",
    ["public-only", "private-compatible"],
  );

  const verification = exactObject(
    semantics.verification,
    "semantics.verification",
    ["profile", "location", "authority", "commitState", "privateInputSources"],
  );
  const verificationProfile = oneOf(
    verification.profile,
    "semantics.verification.profile",
    ["ledger-local-v1", "ledger-attested-v1", "offchain-public-v1"],
  );
  const verificationLocation = oneOf(
    verification.location,
    "semantics.verification.location",
    ["ledger", "local-process"],
  );
  const authority = oneOf(
    verification.authority,
    "semantics.verification.authority",
    ["ledger-local", "ledger-attested", "local-process"],
  );
  const commitState = oneOf(
    verification.commitState,
    "semantics.verification.commitState",
    [
      "committed",
      "submitted",
      "included",
      "finalized-reverted",
      "local-attempt",
      "simulation",
      "not-applicable",
    ],
  );
  const privateInputs = array(
    verification.privateInputSources,
    "semantics.verification.privateInputSources",
  );
  privateInputs.forEach((source, index) =>
    oneOf(source, `semantics.verification.privateInputSources[${index}]`, [
      "hidden-holder",
      "private-predicate",
      "same-holder",
      "private-status",
    ]),
  );

  const status = object(semantics.status, "semantics.status");
  const statusMode = oneOf(status.mode, "semantics.status.mode", [
    "disabled",
    "ledger-local",
    "authority-attested",
  ]);
  if (statusMode === "disabled") {
    exactObject(status, "semantics.status", ["mode"]);
  } else {
    const evidenceFields = [
      "capability",
      "namespace",
      "authority",
      "rootVersion",
      "freshnessPolicy",
      "evidence",
      "privacy",
      "authenticated",
    ];
    if (evidenceFields.some((field) => !Object.hasOwn(status, field))) {
      fail(
        "STATUS_EVIDENCE_REQUIRED",
        "semantics.status.evidence",
        "enabled status requires authenticated namespace, authority, root/version, freshness, and proof evidence",
      );
    }
    const enabled = exactObject(semantics.status, "semantics.status", [
      "mode",
      ...evidenceFields,
    ]);
    capability(enabled.capability, "semantics.status.capability");
    for (const field of ["namespace", "authority", "rootVersion", "freshnessPolicy"] as const) {
      identifier(enabled[field], `semantics.status.${field}`);
    }
    const statusEvidence = oneOf(enabled.evidence, "semantics.status.evidence", [
      "membership",
      "non-membership",
      "challenge-bound-attestation",
    ]);
    if (
      (statusMode === "authority-attested" &&
        statusEvidence !== "challenge-bound-attestation") ||
      (statusMode === "ledger-local" &&
        statusEvidence === "challenge-bound-attestation")
    ) {
      fail(
        "CONTRADICTORY_PROFILE",
        "semantics.status.evidence",
        `${statusMode} status cannot use ${statusEvidence} evidence`,
      );
    }
    oneOf(enabled.privacy, "semantics.status.privacy", ["public", "private"]);
    if (enabled.authenticated !== true) {
      fail(
        "STATUS_EVIDENCE_REQUIRED",
        "semantics.status.authenticated",
        "status evidence must be authenticated",
      );
    }
  }

  const did = exactObject(semantics.did, "semantics.did", [
    "method",
    "relationship",
    "network",
    "versionEvidence",
  ]);
  for (const field of ["method", "relationship", "network", "versionEvidence"] as const) {
    identifier(did[field], `semantics.did.${field}`);
  }

  const trust = exactObject(semantics.trust, "semantics.trust", [
    "scope",
    "epochEvidence",
  ]);
  identifier(trust.scope, "semantics.trust.scope");
  identifier(trust.epochEvidence, "semantics.trust.epochEvidence");

  const trustedTime = exactObject(semantics.trustedTime, "semantics.trustedTime", [
    "source",
    "evidence",
    "freshnessPolicy",
  ]);
  const timeSource = oneOf(trustedTime.source, "semantics.trustedTime.source", [
    "none",
    "ledger",
    "attested",
    "caller",
  ]);
  oneOf(trustedTime.evidence, "semantics.trustedTime.evidence", [
    "not-required",
    "ledger-time",
    "challenge-bound-attestation",
    "caller-assertion",
  ]);
  identifier(trustedTime.freshnessPolicy, "semantics.trustedTime.freshnessPolicy");

  const mutation = exactObject(semantics.mutation, "semantics.mutation", [
    "location",
    "nullifier",
    "consumption",
  ]);
  const mutationLocation = oneOf(mutation.location, "semantics.mutation.location", [
    "none",
    "ledger",
  ]);
  const nullifier = oneOf(mutation.nullifier, "semantics.mutation.nullifier", [
    "none",
    "contract-derived",
    "caller",
  ]);
  const consumption = oneOf(
    mutation.consumption,
    "semantics.mutation.consumption",
    ["none", "atomic", "separate"],
  );

  const protocols = array(semantics.protocols, "semantics.protocols");
  if (protocols.length === 0) {
    fail("MISSING_FIELD", "semantics.protocols", "must explicitly declare disabled or admitted protocols");
  }
  protocols.forEach((protocol, index) =>
    oneOf(protocol, `semantics.protocols[${index}]`, [
      "disabled",
      "canonical-reference",
      "oid4vci-1.0-final",
      "oid4vp-1.0-final",
      "dcql",
    ]),
  );

  const timeEvidence = {
    none: "not-required",
    ledger: "ledger-time",
    attested: "challenge-bound-attestation",
    caller: "caller-assertion",
  } as const;
  if (trustedTime.evidence !== timeEvidence[timeSource]) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.trustedTime.evidence",
      `${timeSource} time requires ${timeEvidence[timeSource]} evidence`,
    );
  }
  if (
    statusMode !== "disabled" &&
    timeSource === "none"
  ) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.trustedTime.source",
      "enabled status freshness requires an authoritative time source",
    );
  }
  if (protocols.includes("disabled") && protocols.length !== 1) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.protocols",
      "disabled protocol cannot be combined with admitted protocols",
    );
  }

  const expectedVerification = {
    "ledger-local-v1": ["ledger", "ledger-local"],
    "ledger-attested-v1": ["ledger", "ledger-attested"],
    "offchain-public-v1": ["local-process", "local-process"],
  } as const;
  const [expectedLocation, expectedAuthority] = expectedVerification[verificationProfile];
  if (
    verificationLocation !== expectedLocation ||
    authority !== expectedAuthority
  ) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.verification",
      `${verificationProfile} requires ${expectedLocation}/${expectedAuthority}`,
    );
  }
  const privateInputValues = privateInputs as readonly string[];
  const hiddenHolder = holderMode === "secret" || holderMode === "blinded-secret";
  const privateClaims = claims.some((claim) => {
    const disclosure = (claim as Record<string, unknown>).disclosure;
    return disclosure === "committed" || disclosure === "predicate-only";
  });
  const privateStatus = statusMode !== "disabled" && status.privacy === "private";
  if (
    verificationProfile === "offchain-public-v1" &&
    (privateInputs.length > 0 || hiddenHolder || privateClaims || privateStatus)
  ) {
    fail(
      "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION",
      "semantics.verification.privateInputSources",
      "public-only verification cannot consume hidden or private inputs",
    );
  }
  if (
    (hiddenHolder && !privateInputValues.includes("hidden-holder")) ||
    (privateClaims && !privateInputValues.includes("private-predicate")) ||
    (privateStatus && !privateInputValues.includes("private-status"))
  ) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.verification.privateInputSources",
      "all family-required private verification inputs must be declared",
    );
  }
  if (
    privateInputs.length > 0 &&
    proofGeneration.witnessPolicy !== "private-compatible"
  ) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.presentation.proofGeneration.witnessPolicy",
      "private verification inputs require a private-compatible prover",
    );
  }
  if (authority !== "local-process" && commitState !== "committed") {
    fail(
      "LEDGER_COMMIT_REQUIRED",
      "semantics.verification.commitState",
      "ledger authority requires successful committed execution",
    );
  }
  if (authority === "local-process" && commitState !== "not-applicable") {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.verification.commitState",
      "local-process authority cannot claim a ledger commit state",
    );
  }
  if (authority !== "local-process" && timeSource === "caller") {
    fail(
      "CALLER_TIME_WITH_LEDGER_AUTHORITY",
      "semantics.trustedTime.source",
      "caller-controlled time cannot support ledger authority",
    );
  }
  if (
    mutationLocation === "ledger" &&
    (nullifier !== "contract-derived" || consumption !== "atomic")
  ) {
    fail(
      "ATOMIC_REPLAY_REQUIRED",
      "semantics.mutation",
      "ledger mutation requires a contract-derived nullifier consumed atomically",
    );
  }
  if (mutationLocation === "ledger" && authority === "local-process") {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.mutation.location",
      "local-process results cannot protect ledger business mutations",
    );
  }
  if (
    mutationLocation === "none" &&
    (nullifier !== "none" || consumption !== "none")
  ) {
    fail(
      "CONTRADICTORY_PROFILE",
      "semantics.mutation",
      "no mutation requires explicit no-replay values",
    );
  }
};

const validateRequirements = (
  value: unknown,
  disabledDomains: ReadonlySet<CredentialPackageDomain>,
  disabledRoles: ReadonlySet<CredentialDeploymentRole>,
): void => {
  const requirements = exactObject(value, "requirements", [
    "packages",
    "compactEntrypoints",
    "circuits",
    "artifacts",
    "providers",
  ]);
  const packages = array(requirements.packages, "requirements.packages");
  unique(packages, "requirements.packages", (entry, path) =>
    packageRequirement(entry, path).name,
  );
  packages.forEach((entry, index) => {
    const domain = (entry as ExactCredentialPackageRequirement).domain;
    if (disabledDomains.has(domain)) {
      fail(
        "DISABLED_CAPABILITY_DEPENDENCY",
        `requirements.packages[${index}].domain`,
        `disabled capability cannot retain ${domain} packages`,
      );
    }
  });

  const entrypoints = array(
    requirements.compactEntrypoints,
    "requirements.compactEntrypoints",
  );
  unique(entrypoints, "requirements.compactEntrypoints", (entry, path) => {
    const candidate = exactObject(entry, path, [
      "id",
      "packageName",
      "exportPath",
      "sourcePath",
    ]);
    const id = identifier(candidate.id, at(path, "id"));
    identifier(candidate.packageName, at(path, "packageName"));
    const exportPath = identifier(candidate.exportPath, at(path, "exportPath"));
    if (exportPath !== "." && !exportPath.startsWith("./")) {
      fail("INVALID_DESCRIPTOR", at(path, "exportPath"), "must be a package export path");
    }
    identifier(candidate.sourcePath, at(path, "sourcePath"));
    return id;
  });

  const circuits = array(requirements.circuits, "requirements.circuits");
  unique(circuits, "requirements.circuits", (entry, path) => {
    const candidate = exactObject(entry, path, ["id", "semanticVersion", "entrypointId"]);
    const id = identifier(candidate.id, at(path, "id"));
    version(candidate.semanticVersion, at(path, "semanticVersion"));
    identifier(candidate.entrypointId, at(path, "entrypointId"));
    return id;
  });

  const artifacts = array(requirements.artifacts, "requirements.artifacts");
  unique(artifacts, "requirements.artifacts", (entry, path) => {
    const candidate = exactObject(entry, path, [
      "id",
      "mediaType",
      "artifactClass",
      "circuitId",
      "digestAlgorithm",
      "trusted",
    ]);
    const id = identifier(candidate.id, at(path, "id"));
    identifier(candidate.mediaType, at(path, "mediaType"));
    oneOf(candidate.artifactClass, at(path, "artifactClass"), [
      "prover-key",
      "verifier-key",
      "zkir",
      "bzkir",
      "circuit-metadata",
    ]);
    const circuitId = identifier(candidate.circuitId, at(path, "circuitId"));
    if (!circuits.some((entry) => (entry as { readonly id?: unknown }).id === circuitId)) {
      fail("CAPABILITY_NOT_PROVIDED", at(path, "circuitId"), "must identify a required circuit");
    }
    oneOf(candidate.digestAlgorithm, at(path, "digestAlgorithm"), ["sha256"]);
    if (candidate.trusted !== true) {
      fail("INVALID_DESCRIPTOR", at(path, "trusted"), "must explicitly require trusted artifacts");
    }
    return id;
  });

  const providers = array(requirements.providers, "requirements.providers");
  unique(providers, "requirements.providers", (entry, path) => {
    const candidate = exactObject(entry, path, ["id", "capability", "role"]);
    const id = identifier(candidate.id, at(path, "id"));
    capability(candidate.capability, at(path, "capability"));
    const role = oneOf(candidate.role, at(path, "role"), CREDENTIAL_DEPLOYMENT_ROLES);
    if (disabledRoles.has(role)) {
      fail(
        "DISABLED_CAPABILITY_DEPENDENCY",
        at(path, "role"),
        `disabled capability cannot require a ${role} provider`,
      );
    }
    return id;
  });
};

const maturityReference = (
  value: unknown,
  path: string,
  values: readonly string[],
): void => {
  const candidate = exactObject(value, path, ["subjectId", "value"]);
  identifier(candidate.subjectId, at(path, "subjectId"));
  oneOf(candidate.value, at(path, "value"), values);
};

export function assertCredentialFamilyProfileV1(
  value: unknown,
): asserts value is CredentialFamilyProfileV1 {
  const profile = exactObject(value, "", [
    "formatVersion",
    "id",
    "version",
    "family",
    "semantics",
    "requirements",
    "compatibility",
    "conformance",
    "maturity",
  ]);
  if (profile.formatVersion !== 1) {
    fail("UNSUPPORTED_VALUE", "formatVersion", "must be 1");
  }
  identifier(profile.id, "id");
  version(profile.version, "version");
  validateFamilyReference(profile.family, "family");
  validateSemantics(profile.semantics);
  const semantics = profile.semantics as CredentialFamilyProfileV1["semantics"];
  const disabledDomains = new Set<CredentialPackageDomain>();
  const disabledRoles = new Set<CredentialDeploymentRole>();
  if (semantics.status.mode === "disabled") {
    for (const domain of [
      "status-registry",
      "status-proof",
      "status-authority",
      "status-mutation",
    ] as const) {
      disabledDomains.add(domain);
      disabledRoles.add(domain);
    }
  }
  for (const [disabled, domain] of [
    [semantics.issuance.registration === "disabled", "registration"],
    [semantics.issuance.anchoring === "disabled", "anchoring"],
    [semantics.mutation.location === "none", "replay"],
  ] as const) {
    if (disabled) {
      disabledDomains.add(domain);
      disabledRoles.add(domain);
    }
  }
  if (semantics.protocols.length === 1 && semantics.protocols[0] === "disabled") {
    disabledDomains.add("protocol");
  }
  validateRequirements(profile.requirements, disabledDomains, disabledRoles);

  const compatibility = exactObject(profile.compatibility, "compatibility", [
    "deniedRules",
  ]);
  const deniedRules = array(
    compatibility.deniedRules,
    "compatibility.deniedRules",
  );
  deniedRules.forEach((rule, index) =>
    oneOf(rule, `compatibility.deniedRules[${index}]`, CREDENTIAL_PROFILE_DENY_RULES),
  );
  for (const requiredRule of CREDENTIAL_PROFILE_DENY_RULES) {
    if (!deniedRules.includes(requiredRule)) {
      fail(
        "MISSING_REQUIRED_RULE",
        "compatibility.deniedRules",
        `must declare mandatory deny rule ${requiredRule}`,
      );
    }
  }

  const conformance = exactObject(profile.conformance, "conformance", [
    "fixtureId",
    "evidenceDisposition",
    "evidenceIds",
  ]);
  identifier(conformance.fixtureId, "conformance.fixtureId");
  const disposition = oneOf(
    conformance.evidenceDisposition,
    "conformance.evidenceDisposition",
    ["tested", "untested", "unsupported"],
  );
  const evidenceIds = array(conformance.evidenceIds, "conformance.evidenceIds");
  evidenceIds.forEach((evidenceId, index) =>
    identifier(evidenceId, `conformance.evidenceIds[${index}]`),
  );
  if (disposition !== "tested" || evidenceIds.length === 0) {
    fail(
      "UNTESTED_COMBINATION",
      "conformance.evidenceDisposition",
      "resolution requires an identified tested conformance fixture",
    );
  }

  const maturity = exactObject(profile.maturity, "maturity", [
    "api",
    "security",
    "standards",
    "production",
  ]);
  maturityReference(maturity.api, "maturity.api", [
    "prototype",
    "reference",
    "supported",
  ]);
  maturityReference(maturity.security, "maturity.security", [
    "unassessed",
    "design-reviewed",
    "implementation-reviewed",
    "independently-assured",
  ]);
  maturityReference(maturity.standards, "maturity.standards", [
    "not-applicable",
    "inspired",
    "profile-targeted",
    "conformant",
  ]);
  maturityReference(maturity.production, "maturity.production", [
    "not-assessed",
    "experimental",
    "candidate",
    "production-approved",
  ]);
}

export function assertCredentialDeploymentAssemblyV1(
  value: unknown,
): asserts value is CredentialDeploymentAssemblyV1 {
  const assembly = exactObject(value, "", [
    "formatVersion",
    "id",
    "version",
    "profile",
    "components",
    "artifacts",
    "deployments",
  ]);
  if (assembly.formatVersion !== 1) {
    fail("UNSUPPORTED_VALUE", "formatVersion", "must be 1");
  }
  identifier(assembly.id, "id");
  version(assembly.version, "version");
  const profile = exactObject(assembly.profile, "profile", ["id", "version"]);
  identifier(profile.id, "profile.id");
  version(profile.version, "profile.version");

  const components = exactObject(
    assembly.components,
    "components",
    CREDENTIAL_DEPLOYMENT_ROLES,
  );
  for (const role of CREDENTIAL_DEPLOYMENT_ROLES) {
    const path = `components.${role}`;
    const component = object(components[role], path);
    const state = oneOf(component.state, `${path}.state`, ["disabled", "selected"]);
    if (state === "disabled") {
      exactObject(component, path, ["state"]);
    } else {
      const selected = exactObject(component, path, [
        "state",
        "requirementId",
        "provider",
        "instanceId",
      ]);
      identifier(selected.requirementId, `${path}.requirementId`);
      capability(selected.provider, `${path}.provider`);
      identifier(selected.instanceId, `${path}.instanceId`);
    }
  }

  const artifacts = array(assembly.artifacts, "artifacts");
  unique(artifacts, "artifacts", (entry, path) => {
    const candidate = exactObject(entry, path, [
      "requirementId",
      "id",
      "version",
      "buildManifestDigest",
      "deploymentManifestDigest",
      "digest",
      "bytes",
      "signerKeyId",
      "profile",
      "circuit",
      "deploymentId",
    ]);
    const requirementId = identifier(candidate.requirementId, at(path, "requirementId"));
    identifier(candidate.id, at(path, "id"));
    version(candidate.version, at(path, "version"));
    for (const field of ["buildManifestDigest", "deploymentManifestDigest", "digest"] as const) {
      if (typeof candidate[field] !== "string" || !digestPattern.test(candidate[field] as string)) {
        fail("INVALID_DESCRIPTOR", at(path, field), "must be a sha256 digest identity");
      }
    }
    if (!Number.isSafeInteger(candidate.bytes) || (candidate.bytes as number) <= 0) {
      fail("INVALID_DESCRIPTOR", at(path, "bytes"), "must be a positive safe integer");
    }
    identifier(candidate.signerKeyId, at(path, "signerKeyId"));
    capability(candidate.profile, at(path, "profile"));
    capability(candidate.circuit, at(path, "circuit"));
    identifier(candidate.deploymentId, at(path, "deploymentId"));
    return requirementId;
  });

  const deployments = array(assembly.deployments, "deployments");
  unique(deployments, "deployments", (entry, path) => {
    const candidate = exactObject(entry, path, [
      "id",
      "version",
      "kind",
      "domain",
      "identity",
      "networkId",
      "chainId",
      "contractAddress",
      "profile",
      "immutableInputs",
    ]);
    const id = identifier(candidate.id, at(path, "id"));
    version(candidate.version, at(path, "version"));
    oneOf(candidate.kind, at(path, "kind"), [
      "compact-contract",
      "local-service",
      "network-service",
    ]);
    oneOf(candidate.domain, at(path, "domain"), packageDomains);
    identifier(candidate.identity, at(path, "identity"));
    identifier(candidate.networkId, at(path, "networkId"));
    identifier(candidate.chainId, at(path, "chainId"));
    identifier(candidate.contractAddress, at(path, "contractAddress"));
    capability(candidate.profile, at(path, "profile"));
    const immutableInputs = object(candidate.immutableInputs, at(path, "immutableInputs"));
    for (const [key, input] of Object.entries(immutableInputs)) {
      identifier(key, `${path}.immutableInputs`);
      identifier(input, `${path}.immutableInputs.${key}`);
    }
    return id;
  });
}

export function assertCapabilityProviderCatalogV1(
  value: unknown,
): asserts value is CapabilityProviderCatalogV1 {
  const catalog = exactObject(value, "", ["formatVersion", "providers"]);
  if (catalog.formatVersion !== 1) {
    fail("UNSUPPORTED_VALUE", "formatVersion", "must be 1");
  }
  const providers = array(catalog.providers, "providers");
  unique(providers, "providers", (entry, path) => {
    const provider = exactObject(entry, path, [
      "id",
      "version",
      "roles",
      "capabilities",
      "packages",
      "witnessPolicy",
      "atomicReplay",
    ]);
    const id = identifier(provider.id, at(path, "id"));
    version(provider.version, at(path, "version"));
    const roles = array(provider.roles, at(path, "roles"));
    roles.forEach((role, index) =>
      oneOf(role, `${path}.roles[${index}]`, CREDENTIAL_DEPLOYMENT_ROLES),
    );
    const capabilities = array(provider.capabilities, at(path, "capabilities"));
    unique(capabilities, at(path, "capabilities"), (entryCapability, capabilityPath) => {
      const reference = capability(entryCapability, capabilityPath);
      return `${reference.id}@${reference.version}`;
    });
    const packages = array(provider.packages, at(path, "packages"));
    unique(packages, at(path, "packages"), (entryPackage, packagePath) =>
      packageRequirement(entryPackage, packagePath).name,
    );
    oneOf(provider.witnessPolicy, at(path, "witnessPolicy"), [
      "public-only",
      "private-compatible",
    ]);
    boolean(provider.atomicReplay, at(path, "atomicReplay"));
    return `${id}@${provider.version as string}`;
  });
}
