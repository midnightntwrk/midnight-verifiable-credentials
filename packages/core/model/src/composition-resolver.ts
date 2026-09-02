import type {
  CapabilityProviderDescriptor,
  ExactCredentialPackageRequirement,
  ProviderRequirement,
  ResolveCredentialCompositionInput,
  ResolvedCredentialCompositionV1,
  ResolvedProviderIdentity,
} from "./composition-types.js";
import {
  assertCapabilityProviderCatalogV1,
  assertCredentialDeploymentAssemblyV1,
  assertCredentialFamilyProfileV1,
} from "./composition-validation.js";
import { CredentialModelError } from "./errors.js";
import { assertCredentialFamilyDefinition } from "./validation.js";

const incompatible = (
  code: CredentialModelError["code"],
  path: string,
  message: string,
): never => {
  throw new CredentialModelError(code, path, message);
};

const providerKey = (id: string, version: string): string => `${id}@${version}`;

const mergePackages = (
  packageSets: readonly (readonly ExactCredentialPackageRequirement[])[],
): ExactCredentialPackageRequirement[] => {
  const byName = new Map<string, ExactCredentialPackageRequirement>();
  for (const requirement of packageSets.flat()) {
    const existing = byName.get(requirement.name);
    if (existing === undefined) {
      byName.set(requirement.name, requirement);
      continue;
    }
    if (
      existing.version !== requirement.version ||
      existing.domain !== requirement.domain
    ) {
      incompatible(
        "PACKAGE_VERSION_CONFLICT",
        `resolved.packages.${requirement.name}`,
        `conflicting exact package identities ${existing.version}/${existing.domain} and ${requirement.version}/${requirement.domain}`,
      );
    }
    byName.set(requirement.name, {
      ...existing,
      exports: [...new Set([...existing.exports, ...requirement.exports])].sort(),
    });
  }
  return [...byName.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
};

const assertFamilyIdentity = (input: ResolveCredentialCompositionInput): void => {
  const expected = input.profile.family;
  const actual = {
    id: input.family.id,
    version: input.family.version,
    schemaId: input.family.schema.id,
    schemaVersion: input.family.schema.version,
  };
  for (const field of ["id", "version", "schemaId", "schemaVersion"] as const) {
    if (expected[field] !== actual[field]) {
      incompatible(
        "FAMILY_IDENTITY_MISMATCH",
        `profile.family.${field}`,
        `expected '${actual[field]}' but received '${expected[field]}'`,
      );
    }
  }

  const familyClaims = new Map(
    input.family.schema.claims.map((claim) => [claim.id, claim.disclosure]),
  );
  if (
    familyClaims.size !== input.profile.semantics.claims.length ||
    input.profile.semantics.claims.some(
      (claim) => familyClaims.get(claim.claimId) !== claim.disclosure,
    )
  ) {
    incompatible(
      "FAMILY_IDENTITY_MISMATCH",
      "profile.semantics.claims",
      "profile claim semantics must exactly match the referenced family definition",
    );
  }
};

interface ParsedSemanticVersion {
  readonly core: readonly [number, number, number];
  readonly prerelease: readonly string[] | null;
}

const parseSemanticVersion = (value: string): ParsedSemanticVersion | null => {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/u.exec(
    value,
  );
  if (match === null) return null;
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] === undefined ? null : match[4].split("."),
  };
};

const compareVersionCore = (
  left: readonly [number, number, number],
  right: readonly [number, number, number],
): number => {
  for (let index = 0; index < 3; index += 1) {
    const difference = left[index] - right[index];
    if (difference !== 0) return difference;
  }
  return 0;
};

const compareSemanticVersion = (
  left: ParsedSemanticVersion,
  right: ParsedSemanticVersion,
): number => {
  const coreComparison = compareVersionCore(left.core, right.core);
  if (coreComparison !== 0) return coreComparison;
  if (left.prerelease === null) return right.prerelease === null ? 0 : 1;
  if (right.prerelease === null) return -1;
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];
    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    if (leftPart === rightPart) continue;
    const leftNumeric = /^\d+$/u.test(leftPart);
    const rightNumeric = /^\d+$/u.test(rightPart);
    if (leftNumeric && rightNumeric) return Number(leftPart) - Number(rightPart);
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return leftPart.localeCompare(rightPart);
  }
  return 0;
};

const satisfiesFamilyPackageVersion = (
  exactVersion: string,
  requirement: string,
): boolean => {
  const range = /^(\^|~|>=|<=|>|<)?(.+)$/u.exec(requirement);
  const exact = parseSemanticVersion(exactVersion);
  const required = parseSemanticVersion(range?.[2] ?? "");
  if (range === null || exact === null || required === null) return false;
  const operator = range[1] ?? "=";
  const comparison = compareSemanticVersion(exact, required);
  if (operator === "=") return exactVersion === requirement;
  if (
    exact.prerelease !== null &&
    (required.prerelease === null ||
      compareVersionCore(exact.core, required.core) !== 0)
  ) {
    return false;
  }
  if (operator === ">=") return comparison >= 0;
  if (operator === "<=") return comparison <= 0;
  if (operator === ">") return comparison > 0;
  if (operator === "<") return comparison < 0;
  const [major, minor, patch] = required.core;
  const upperCore: readonly [number, number, number] =
    operator === "~"
      ? [major, minor + 1, 0]
      : major !== 0
        ? [major + 1, 0, 0]
        : minor !== 0
          ? [0, minor + 1, 0]
          : [0, 0, patch + 1];
  return comparison >= 0 && compareVersionCore(exact.core, upperCore) < 0;
};

const assertFamilyRequirements = (
  input: ResolveCredentialCompositionInput,
): void => {
  for (const familyPackage of input.family.composition.packages) {
    const profilePackage = input.profile.requirements.packages.find(
      (requirement) => requirement.name === familyPackage.name,
    );
    if (
      profilePackage === undefined ||
      !satisfiesFamilyPackageVersion(profilePackage.version, familyPackage.version) ||
      (familyPackage.exports ?? []).some(
        (exportPath) => !profilePackage.exports.includes(exportPath),
      )
    ) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `profile.requirements.packages.${familyPackage.name}`,
        "profile must pin an exact package identity satisfying every family composition requirement",
      );
    }
  }

  const profileCapabilityByKind = {
    "holder-binding": input.profile.semantics.holderBinding.capability,
    proof: input.profile.semantics.presentation.proofGeneration.capability,
    presentation: input.profile.semantics.presentation.capability,
    status:
      input.profile.semantics.status.mode === "disabled"
        ? null
        : input.profile.semantics.status.capability,
  } as const;
  for (const familyCapability of input.family.capabilities.filter(
    (capability) => capability.required,
  )) {
    const capability = profileCapabilityByKind[familyCapability.kind];
    const matched =
      capability !== null &&
      capability.id === familyCapability.id &&
      (familyCapability.version === undefined ||
        capability.version === familyCapability.version);
    if (!matched) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `profile.requirements.capabilities.${familyCapability.id}`,
        "profile must bind every required family capability",
      );
    }
  }

  const artifactClassesByPurpose = {
    prover: ["prover-key"],
    verifier: ["verifier-key"],
    circuit: ["zkir", "bzkir"],
    metadata: ["circuit-metadata"],
  } as const;
  for (const familyArtifact of input.family.artifacts.filter(
    (artifact) => artifact.optional !== true,
  )) {
    const profileArtifact = input.profile.requirements.artifacts.find(
      (artifact) => artifact.id === familyArtifact.id,
    );
    if (
      profileArtifact === undefined ||
      profileArtifact.mediaType !== familyArtifact.mediaType ||
      !(artifactClassesByPurpose[familyArtifact.purpose] as readonly string[]).includes(
        profileArtifact.artifactClass,
      )
    ) {
      incompatible(
        "MISSING_ARTIFACT",
        `profile.requirements.artifacts.${familyArtifact.id}`,
        "profile must carry every required family artifact into exact resolution",
      );
    }
  }
};

const assertProfileAssemblyIdentity = (
  input: ResolveCredentialCompositionInput,
): void => {
  for (const field of ["id", "version"] as const) {
    if (input.assembly.profile[field] !== input.profile[field]) {
      incompatible(
        "PROFILE_ASSEMBLY_MISMATCH",
        `assembly.profile.${field}`,
        `assembly binds '${input.assembly.profile[field]}' instead of '${input.profile[field]}'`,
      );
    }
  }
};

interface ProviderResolution {
  readonly identities: readonly ResolvedProviderIdentity[];
  readonly descriptors: readonly CapabilityProviderDescriptor[];
}

const resolveProviders = (
  input: ResolveCredentialCompositionInput,
): ProviderResolution => {
  const providerCatalog = new Map(
    input.catalog.providers.map((provider) => [
      providerKey(provider.id, provider.version),
      provider,
    ]),
  );
  const requirements = new Map(
    input.profile.requirements.providers.map((requirement) => [
      requirement.id,
      requirement,
    ]),
  );
  const identities: ResolvedProviderIdentity[] = [];
  const descriptors: CapabilityProviderDescriptor[] = [];

  for (const [role, component] of Object.entries(input.assembly.components)) {
    if (component.state === "disabled") continue;
    const requirement = requirements.get(component.requirementId);
    if (requirement === undefined || requirement.role !== role) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `assembly.components.${role}.requirementId`,
        "selected component must bind one exact profile provider requirement for the same role",
      );
    }
    const matchedRequirement = requirement as ProviderRequirement;
    const descriptor = providerCatalog.get(
      providerKey(component.provider.id, component.provider.version),
    );
    if (descriptor === undefined) {
      incompatible(
        "UNKNOWN_PROVIDER",
        `assembly.components.${role}.provider`,
        `provider '${providerKey(component.provider.id, component.provider.version)}' is not cataloged`,
      );
    }
    const matchedDescriptor = descriptor as CapabilityProviderDescriptor;
    if (!matchedDescriptor.roles.includes(matchedRequirement.role)) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `assembly.components.${role}.provider`,
        `provider does not admit role '${matchedRequirement.role}'`,
      );
    }
    const providesCapability = matchedDescriptor.capabilities.some(
      (provided) =>
        provided.id === matchedRequirement.capability.id &&
        provided.version === matchedRequirement.capability.version,
    );
    if (!providesCapability) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `assembly.components.${role}.provider`,
        `provider does not supply '${providerKey(matchedRequirement.capability.id, matchedRequirement.capability.version)}'`,
      );
    }
    identities.push({
      requirementId: matchedRequirement.id,
      role: matchedRequirement.role,
      providerId: matchedDescriptor.id,
      providerVersion: matchedDescriptor.version,
      instanceId: component.instanceId,
    });
    descriptors.push(matchedDescriptor);
  }

  for (const requirement of input.profile.requirements.providers) {
    if (!identities.some((identity) => identity.requirementId === requirement.id)) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `assembly.components.${requirement.role}`,
        `required capability '${providerKey(requirement.capability.id, requirement.capability.version)}' is not selected`,
      );
    }
  }

  const privateVerification =
    input.profile.semantics.verification.privateInputSources.length > 0 ||
    ["secret", "blinded-secret"].includes(
      input.profile.semantics.holderBinding.mode,
    ) ||
    (input.profile.semantics.status.mode !== "disabled" &&
      input.profile.semantics.status.privacy === "private");
  if (
    privateVerification &&
    identities.some(
      (identity, index) =>
        identity.role === "proof-executor" &&
        descriptors[index]?.witnessPolicy === "public-only",
    )
  ) {
    incompatible(
      "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION",
      "assembly.components.proof-executor.provider",
      "selected proof provider is public-only",
    );
  }

  if (input.profile.semantics.mutation.location === "ledger") {
    const replayComponent = input.assembly.components.replay;
    const replayDescriptor =
      replayComponent.state === "selected"
        ? providerCatalog.get(
            providerKey(
              replayComponent.provider.id,
              replayComponent.provider.version,
            ),
          )
        : undefined;
    if (replayDescriptor?.atomicReplay !== true) {
      incompatible(
        "ATOMIC_REPLAY_REQUIRED",
        "assembly.components.replay",
        "side-effecting assembly requires an explicitly selected atomic replay provider",
      );
    }
  }

  return {
    identities: identities.sort((left, right) =>
      left.requirementId.localeCompare(right.requirementId),
    ),
    descriptors,
  };
};

const isDisabledDomain = (
  input: ResolveCredentialCompositionInput,
  domain: string,
): boolean =>
  (input.profile.semantics.status.mode === "disabled" &&
    domain.startsWith("status-")) ||
  (input.profile.semantics.issuance.registration === "disabled" &&
    domain === "registration") ||
  (input.profile.semantics.issuance.anchoring === "disabled" &&
    domain === "anchoring") ||
  (input.profile.semantics.mutation.location === "none" && domain === "replay") ||
  (input.profile.semantics.protocols.length === 1 &&
    input.profile.semantics.protocols[0] === "disabled" &&
    domain === "protocol");

const assertDisabledAssemblySelections = (
  input: ResolveCredentialCompositionInput,
): void => {
  for (const [role, component] of Object.entries(input.assembly.components)) {
    if (component.state === "selected" && isDisabledDomain(input, role)) {
      incompatible(
        "DISABLED_CAPABILITY_DEPENDENCY",
        `assembly.components.${role}`,
        `disabled capability cannot select a ${role} provider`,
      );
    }
  }
};

const assertDisabledCapabilityGraph = (
  input: ResolveCredentialCompositionInput,
  packages: readonly ExactCredentialPackageRequirement[],
  providers: readonly ResolvedProviderIdentity[],
): void => {
  const disabledPackage = packages.find((entry) =>
    isDisabledDomain(input, entry.domain),
  );
  if (disabledPackage !== undefined) {
    incompatible(
      "DISABLED_CAPABILITY_DEPENDENCY",
      `resolved.packages.${disabledPackage.name}`,
      `disabled capability cannot retain ${disabledPackage.domain} packages`,
    );
  }
  const disabledProvider = providers.find((entry) =>
    isDisabledDomain(input, entry.role),
  );
  if (disabledProvider !== undefined) {
    incompatible(
      "DISABLED_CAPABILITY_DEPENDENCY",
      `assembly.components.${disabledProvider.role}`,
      `disabled capability cannot select ${disabledProvider.role} providers`,
    );
  }
  const disabledDeployment = input.assembly.deployments.find((entry) =>
    isDisabledDomain(input, entry.domain),
  );
  if (disabledDeployment !== undefined) {
    incompatible(
      "DISABLED_CAPABILITY_DEPENDENCY",
      `assembly.deployments.${disabledDeployment.id}`,
      `disabled capability cannot retain ${disabledDeployment.domain} deployments`,
    );
  }
};

const resolveArtifacts = (input: ResolveCredentialCompositionInput) => {
  const concrete = new Map(
    input.assembly.artifacts.map((artifact) => [artifact.requirementId, artifact]),
  );
  const deployments = new Map(
    input.assembly.deployments.map((deployment) => [deployment.id, deployment]),
  );
  for (const deployment of input.assembly.deployments) {
    if (
      deployment.profile.id !== input.profile.id ||
      deployment.profile.version !== input.profile.version
    ) {
      incompatible(
        "CONTRADICTORY_PROFILE",
        `assembly.deployments.${deployment.id}.profile`,
        "every deployment identity must bind the selected profile and version",
      );
    }
  }
  for (const artifact of input.assembly.artifacts) {
    if (
      !input.profile.requirements.artifacts.some(
        (requirement) => requirement.id === artifact.requirementId,
      )
    ) {
      incompatible(
        "CONTRADICTORY_PROFILE",
        `assembly.artifacts.${artifact.requirementId}`,
        "assembly contains an artifact not required by the profile",
      );
    }
  }
  return input.profile.requirements.artifacts.map((requirement) => {
    const artifact = concrete.get(requirement.id);
    if (artifact === undefined) {
      incompatible(
        "MISSING_ARTIFACT",
        `assembly.artifacts.${requirement.id}`,
        "profile artifact requirement has no concrete digest identity",
      );
    }
    const resolved = artifact as NonNullable<typeof artifact>;
    if (
      resolved.profile.id !== input.profile.id ||
      resolved.profile.version !== input.profile.version
    ) {
      incompatible(
        "CONTRADICTORY_PROFILE",
        `assembly.artifacts.${requirement.id}.profile`,
        "artifact identity must bind the selected profile and version",
      );
    }
    const circuit = input.profile.requirements.circuits.find(
      (entry) => entry.id === requirement.circuitId,
    );
    if (
      circuit === undefined ||
      resolved.circuit.id !== circuit.id ||
      resolved.circuit.version !== circuit.semanticVersion
    ) {
      incompatible(
        "CONTRADICTORY_PROFILE",
        `assembly.artifacts.${requirement.id}.circuit`,
        "artifact identity must bind the required circuit and semantic version",
      );
    }
    const deployment = deployments.get(resolved.deploymentId);
    if (deployment === undefined) {
      incompatible(
        "CONTRADICTORY_PROFILE",
        `assembly.artifacts.${requirement.id}.deploymentId`,
        "artifact identity must bind a selected immutable deployment",
      );
    }
    const selectedDeployment = deployment as NonNullable<typeof deployment>;
    if (
      selectedDeployment.profile.id !== input.profile.id ||
      selectedDeployment.profile.version !== input.profile.version
    ) {
      incompatible(
        "CONTRADICTORY_PROFILE",
        `assembly.deployments.${selectedDeployment.id}.profile`,
        "deployment identity must bind the selected profile and version",
      );
    }
    return {
      requirementId: requirement.id,
      requirement,
      artifact: resolved,
    };
  });
};

const assertCompactGraph = (
  input: ResolveCredentialCompositionInput,
  packages: readonly ExactCredentialPackageRequirement[],
): void => {
  for (const entrypoint of input.profile.requirements.compactEntrypoints) {
    const owner = packages.find((entry) => entry.name === entrypoint.packageName);
    if (owner === undefined || !owner.exports.includes(entrypoint.exportPath)) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `profile.requirements.compactEntrypoints.${entrypoint.id}`,
        "Compact entrypoint must resolve through an exact package export",
      );
    }
  }
  const entrypointIds = new Set(
    input.profile.requirements.compactEntrypoints.map((entrypoint) => entrypoint.id),
  );
  for (const circuit of input.profile.requirements.circuits) {
    if (!entrypointIds.has(circuit.entrypointId)) {
      incompatible(
        "CAPABILITY_NOT_PROVIDED",
        `profile.requirements.circuits.${circuit.id}`,
        "circuit must bind an admitted Compact entrypoint",
      );
    }
  }
};

export const resolveCredentialComposition = (
  input: ResolveCredentialCompositionInput,
): ResolvedCredentialCompositionV1 => {
  assertCredentialFamilyDefinition(input.family);
  assertCredentialFamilyProfileV1(input.profile);
  assertCredentialDeploymentAssemblyV1(input.assembly);
  assertCapabilityProviderCatalogV1(input.catalog);
  assertFamilyIdentity(input);
  assertFamilyRequirements(input);
  assertProfileAssemblyIdentity(input);
  assertDisabledAssemblySelections(input);

  const providerResolution = resolveProviders(input);
  const packages = mergePackages([
    input.profile.requirements.packages,
    ...providerResolution.descriptors.map((provider) => provider.packages),
  ]);
  assertDisabledCapabilityGraph(
    input,
    packages,
    providerResolution.identities,
  );
  assertCompactGraph(input, packages);
  const artifacts = resolveArtifacts(input);
  const exports = packages.flatMap((entry) =>
    entry.exports.map((exportPath) => ({
      packageName: entry.name,
      exportPath,
    })),
  );

  return {
    formatVersion: 1,
    family: input.profile.family,
    profile: { id: input.profile.id, version: input.profile.version },
    assembly: { id: input.assembly.id, version: input.assembly.version },
    packages,
    exports,
    compactEntrypoints: input.profile.requirements.compactEntrypoints,
    circuits: input.profile.requirements.circuits,
    artifacts,
    providers: providerResolution.identities,
    deployments: input.assembly.deployments,
    conformance: input.profile.conformance,
  };
};
