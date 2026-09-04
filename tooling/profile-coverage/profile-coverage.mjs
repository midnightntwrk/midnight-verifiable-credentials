#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CREDENTIAL_DEPLOYMENT_ROLES,
  CREDENTIAL_PROFILE_DENY_RULES,
  assertCredentialFamilyProfileV1,
  resolveCredentialComposition,
} from "../../packages/core/model/dist/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const prototypeRoot = "packages/prototypes/credential-families";
const manifestRelativePaths = [
  "birth/conformance/composition-manifest.json",
  "birth-secret/conformance/composition-manifest.json",
  "digital-passport/conformance/composition-manifest.json",
  "dummy-claims/conformance/composition-manifest.json",
  "hello-family/conformance/composition-manifest.json",
  "mixed-claims/conformance/composition-manifest.json",
  "university-diploma/conformance/composition-manifest.json",
].map((relativePath) => `${prototypeRoot}/${relativePath}`);

export const GENERATED_PATHS = Object.freeze({
  reportJson: "tooling/profile-coverage/generated/profile-coverage.json",
  reportMarkdown: "docs/testing/prototype-profile-coverage.md",
  prototypeReadme: "packages/prototypes/credential-families/README.md",
});

export const COVERAGE_AXES = Object.freeze([
  { id: "holderBinding", values: ["explicit-did", "secret", "blinded-secret", "offchain-did"] },
  { id: "status", values: ["disabled", "ledger-local", "authority-attested"] },
  { id: "verification", values: ["ledger-local-v1", "ledger-attested-v1", "offchain-public-v1"] },
  { id: "protocol", values: ["disabled", "canonical-reference", "oid4vp-1.0-final"] },
  { id: "composition", values: ["single", "same-holder"] },
  { id: "mutation", values: ["none", "atomic-ledger"] },
]);

export const FIXED_AXES = Object.freeze([
  {
    id: "issuance.credential",
    value: "issuer-local-issuance-v1",
    rationale: "Issue #493 varies composition compatibility, not the issuer implementation mechanism reserved for #494+.",
    securityInteractions: ["holderBinding", "protocol"],
    evidence: ["tooling/profile-coverage/profile-coverage.test.mjs#L142"],
  },
  {
    id: "presentation.preparation",
    value: "holder-wallet-v1",
    rationale: "The holder-wallet boundary is fixed so private-witness and verification-location interactions remain attributable.",
    securityInteractions: ["holderBinding", "verification"],
    evidence: ["tooling/profile-coverage/profile-coverage.test.mjs#L142"],
  },
  {
    id: "did.method",
    value: "did:midnight",
    rationale: "DID-method agility is not independently supported by the retained fixtures, so the method stays explicit while holder-binding and verification interactions vary.",
    securityInteractions: ["holderBinding", "verification"],
    evidence: ["tooling/profile-coverage/profile-coverage.test.mjs#L142"],
  },
  {
    id: "trust.scope",
    value: "coverage-fixture",
    rationale: "The matrix uses fixture-only trust and must not turn coverage selection into a production trust-root claim.",
    securityInteractions: ["status", "protocol"],
    evidence: ["tooling/profile-coverage/profile-coverage.test.mjs#L142"],
  },
]);

export const MANDATORY_HIGHER_ORDER_IDS = Object.freeze([
  "hidden-holder-status-onchain-verification",
  "no-status-dependency-absence",
  "openid-protocol-capability-selection",
  "same-holder-composition",
  "side-effecting-atomic-replay",
]);

const mandatoryRows = Object.freeze([
  {
    id: MANDATORY_HIGHER_ORDER_IDS[0],
    values: { holderBinding: "secret", status: "ledger-local", verification: "ledger-local-v1", protocol: "disabled", composition: "single", mutation: "none" },
    boundary: "Hidden-holder plus authenticated status is resolved only through an on-ledger verification profile.",
  },
  {
    id: MANDATORY_HIGHER_ORDER_IDS[1],
    values: { holderBinding: "explicit-did", status: "disabled", verification: "offchain-public-v1", protocol: "disabled", composition: "single", mutation: "none" },
    boundary: "Disabled status resolves without status package, provider, or deployment edges.",
  },
  {
    id: MANDATORY_HIGHER_ORDER_IDS[2],
    values: { holderBinding: "explicit-did", status: "disabled", verification: "ledger-local-v1", protocol: "oid4vp-1.0-final", composition: "single", mutation: "none" },
    boundary: "This row proves OpenID protocol-capability selection only; it does not prove transcript binding or OpenID conformance.",
  },
  {
    id: MANDATORY_HIGHER_ORDER_IDS[3],
    values: { holderBinding: "blinded-secret", status: "disabled", verification: "ledger-local-v1", protocol: "disabled", composition: "same-holder", mutation: "none" },
    boundary: "Same-holder is exercised as reference composition evidence, not as production authority approval.",
  },
  {
    id: MANDATORY_HIGHER_ORDER_IDS[4],
    values: { holderBinding: "explicit-did", status: "disabled", verification: "ledger-local-v1", protocol: "disabled", composition: "single", mutation: "atomic-ledger" },
    boundary: "A side-effecting row selects a contract-derived nullifier and an atomic replay provider.",
  },
]);

const exactFields = (value, expected, label) => {
  assert.equal(typeof value, "object", `${label} must be an object`);
  assert.ok(value !== null && !Array.isArray(value), `${label} must be an object`);
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), `${label} fields drifted`);
};

export const validateEvidenceReference = (reference) => {
  const [relativePath, fragment = ""] = reference.split("#", 2);
  const absolutePath = path.resolve(repoRoot, relativePath);
  assert.ok(existsSync(absolutePath), `${reference} does not exist`);
  if (fragment.length === 0) return true;
  if (fragment.startsWith("/")) {
    let value = JSON.parse(readFileSync(absolutePath, "utf8"));
    for (const encodedPart of fragment.slice(1).split("/")) {
      const part = decodeURIComponent(encodedPart).replaceAll("~1", "/").replaceAll("~0", "~");
      assert.ok(value !== null && typeof value === "object" && Object.hasOwn(value, part), `${reference} has no JSON pointer target`);
      value = value[part];
    }
    return true;
  }
  const line = /^L([1-9]\d*)$/u.exec(fragment);
  assert.ok(line, `${reference} must use an RFC 6901 JSON pointer or #L<line>`);
  const lines = readFileSync(absolutePath, "utf8").split(/\r?\n/u);
  assert.ok(Number(line[1]) <= lines.length, `${reference} line is outside the file`);
  assert.ok(lines[Number(line[1]) - 1].trim().length > 0, `${reference} points to a blank line`);
  return true;
};

const compactPackageWorkspaces = Object.freeze({
  "profile-coverage-fixture-family": "tooling/profile-coverage/fixtures",
  "@midnight-ntwrk/credential-compact": "packages/core/compact",
  "@midnight-ntwrk/midnight-did-credentials-status-registry": "packages/registry/status-registry",
  "@midnight-ntwrk/midnight-did-credentials-same-holder": "packages/core/capabilities/same-holder",
});

const packageExportTarget = (descriptor) => {
  if (typeof descriptor === "string") return descriptor;
  assert.ok(descriptor !== null && typeof descriptor === "object", "package export must be a string or condition map");
  for (const condition of ["import", "require", "default"]) {
    if (typeof descriptor[condition] === "string") return descriptor[condition];
  }
  assert.fail("package export has no runtime target");
};

export const resolveCompactExportSource = (workspace, entrypoint) => {
  const packageJsonPath = path.resolve(repoRoot, workspace, "package.json");
  const workspacePackage = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  assert.equal(entrypoint.packageName, workspacePackage.name, `${entrypoint.id} package owner drifted`);
  assert.ok(Object.hasOwn(workspacePackage.exports, entrypoint.exportPath), `${entrypoint.id} export ${entrypoint.exportPath} is not declared`);
  const exportTarget = packageExportTarget(workspacePackage.exports[entrypoint.exportPath]);
  assert.match(exportTarget, /\.compact$/u, `${entrypoint.id} export must target Compact source`);
  const packageRelativeSource = exportTarget.startsWith("./dist/")
    ? `src/${exportTarget.slice("./dist/".length)}`
    : exportTarget.startsWith("./src/")
      ? exportTarget.slice(2)
      : exportTarget.slice(2);
  const resolved = path.relative(repoRoot, path.resolve(repoRoot, workspace, packageRelativeSource));
  assert.equal(resolved, entrypoint.sourcePath, `${entrypoint.id} export target does not map to declared source`);
  assert.ok(existsSync(path.resolve(repoRoot, resolved)), `${entrypoint.id} source does not exist`);
  return resolved;
};

export const resolveKnownCompactExportSource = (entrypoint) => {
  const workspace = compactPackageWorkspaces[entrypoint.packageName];
  assert.ok(workspace, `${entrypoint.id} has no known Compact package workspace`);
  return resolveCompactExportSource(workspace, entrypoint);
};

export const loadPrototypeManifests = () =>
  manifestRelativePaths.map((relativePath) =>
    JSON.parse(readFileSync(path.resolve(repoRoot, relativePath), "utf8")),
  );

const disabledComponents = () => Object.fromEntries(
  CREDENTIAL_DEPLOYMENT_ROLES.map((role) => [role, { state: "disabled" }]),
);

const materializeFamilyDefinition = (metadata) => ({
  id: metadata.id,
  version: metadata.version,
  schema: metadata.schema,
  capabilities: metadata.capabilities,
  artifacts: metadata.artifacts,
  composition: metadata.composition,
  credentialCodec: {
    mediaType: "application/json",
    encode: JSON.stringify,
    decode: JSON.parse,
  },
  presentationCodec: {
    mediaType: "application/json",
    encode: JSON.stringify,
    decode: JSON.parse,
  },
});

const fixtureCompositionInput = (profile, familyMetadata) => {
  const proofRequirement = profile.requirements.providers.find(
    ({ role }) => role === "proof-executor",
  );
  assert.ok(proofRequirement, `${profile.id} requires a proof-executor binding`);
  const providerId = `provider.${profile.id}.proof-executor`;
  const instanceId = `${providerId}.instance@1`;
  const components = disabledComponents();
  components["proof-executor"] = {
    state: "selected",
    requirementId: proofRequirement.id,
    provider: { id: providerId, version: "1.0.0" },
    instanceId,
  };
  return {
    family: materializeFamilyDefinition(familyMetadata),
    profile,
    assembly: {
      formatVersion: 1,
      id: `assembly.${profile.id}`,
      version: "1.0.0",
      profile: { id: profile.id, version: profile.version },
      components,
      artifacts: [],
      deployments: [],
    },
    catalog: {
      formatVersion: 1,
      providers: [{
        id: providerId,
        version: "1.0.0",
        roles: ["proof-executor"],
        capabilities: [proofRequirement.capability],
        packages: [],
        witnessPolicy: profile.semantics.presentation.proofGeneration.witnessPolicy,
        atomicReplay: false,
      }],
    },
  };
};

export const validatePrototypeManifests = (manifests = loadPrototypeManifests()) =>
  manifests.map((manifest) => {
    exactFields(manifest, ["formatVersion", "prototype", "familyDefinition", "profile", "evidence"], `manifest ${manifest.prototype?.id ?? "unknown"}`);
    assert.equal(manifest.formatVersion, 1);
    exactFields(manifest.prototype, ["id", "workspace", "hypothesis", "owner", "limitations", "exitCriterion"], `manifest ${manifest.prototype.id}.prototype`);
    exactFields(manifest.evidence, ["fixture", "graph", "happyPath", "negatives"], `manifest ${manifest.prototype.id}.evidence`);
    assert.ok(manifest.prototype.hypothesis.length > 0);
    assert.ok(manifest.prototype.owner.length > 0);
    assert.ok(manifest.prototype.limitations.length > 0);
    assert.ok(manifest.prototype.exitCriterion.length > 0);
    assert.ok(manifest.evidence.negatives.length > 0);
    for (const reference of [manifest.familyDefinition, manifest.evidence.fixture, manifest.evidence.graph, manifest.evidence.happyPath, ...manifest.evidence.negatives]) {
      validateEvidenceReference(reference);
    }
    assert.match(manifest.evidence.happyPath, /#L[1-9]\d*$/u);
    assert.ok(manifest.evidence.negatives.every((reference) => /#L[1-9]\d*$/u.test(reference)));
    assertCredentialFamilyProfileV1(manifest.profile);
    assert.deepEqual(manifest.profile.compatibility.deniedRules, CREDENTIAL_PROFILE_DENY_RULES);

    const workspacePackage = JSON.parse(readFileSync(path.resolve(repoRoot, manifest.prototype.workspace, "package.json"), "utf8"));
    const familyRequirement = manifest.profile.requirements.packages.find((requirement) => requirement.domain === "family");
    assert.equal(familyRequirement.name, workspacePackage.name);
    assert.equal(familyRequirement.version, workspacePackage.version);
    assert.ok(familyRequirement.exports.every((exportPath) => Object.hasOwn(workspacePackage.exports, exportPath)));
    assert.equal(
      manifest.familyDefinition,
      `${manifest.prototype.workspace}/conformance/family-definition.json`,
      "family metadata must be independently owned by the prototype workspace",
    );
    for (const entrypoint of manifest.profile.requirements.compactEntrypoints) {
      resolveCompactExportSource(manifest.prototype.workspace, entrypoint);
    }
    const familyMetadata = JSON.parse(readFileSync(path.resolve(repoRoot, manifest.familyDefinition), "utf8"));
    assert.equal(familyMetadata.formatVersion, 1);

    return resolveCredentialComposition(fixtureCompositionInput(manifest.profile, familyMetadata));
  });

const cartesian = (axes, index = 0, values = {}) => {
  if (index === axes.length) return [{ values }];
  const axis = axes[index];
  return axis.values.flatMap((value) => cartesian(axes, index + 1, { ...values, [axis.id]: value }));
};

const incompatibility = (values) => {
  const hidden = values.holderBinding === "secret" || values.holderBinding === "blinded-secret";
  if (values.composition === "same-holder" && !hidden) {
    return { code: "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION", message: "same-holder composition is admitted only for hidden-holder rows" };
  }
  if ((hidden || values.composition === "same-holder") && values.verification === "offchain-public-v1") {
    return { code: "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION", message: "public-only verification cannot consume hidden-holder or same-holder witnesses" };
  }
  if (values.holderBinding === "offchain-did" && values.verification !== "offchain-public-v1") {
    return { code: "UNTESTED_COMBINATION", message: "offchain DID holder binding cannot be mixed with ledger verification profiles" };
  }
  if (values.status === "ledger-local" && values.verification !== "ledger-local-v1") {
    return { code: "STATUS_EVIDENCE_REQUIRED", message: "ledger-local status requires ledger-local verification" };
  }
  if (values.status === "authority-attested" && values.verification !== "ledger-attested-v1") {
    return { code: "STATUS_EVIDENCE_REQUIRED", message: "authority-attested status requires ledger-attested verification" };
  }
  if (values.mutation === "atomic-ledger" && values.verification === "offchain-public-v1") {
    return { code: "ATOMIC_REPLAY_REQUIRED", message: "ledger mutation requires a ledger verification authority and atomic replay" };
  }
  return null;
};

const valueTarget = (axis, value) => `value:${axis}=${value}`;
const pairTarget = (leftAxis, leftValue, rightAxis, rightValue) =>
  `pair:${leftAxis}=${leftValue}|${rightAxis}=${rightValue}`;

const targetsFor = (values) => {
  const targets = [];
  for (const axis of COVERAGE_AXES) targets.push(valueTarget(axis.id, values[axis.id]));
  for (let left = 0; left < COVERAGE_AXES.length; left += 1) {
    for (let right = left + 1; right < COVERAGE_AXES.length; right += 1) {
      const leftAxis = COVERAGE_AXES[left];
      const rightAxis = COVERAGE_AXES[right];
      targets.push(pairTarget(leftAxis.id, values[leftAxis.id], rightAxis.id, values[rightAxis.id]));
    }
  }
  return targets;
};

const valuesKey = (values) => COVERAGE_AXES.map((axis) => values[axis.id]).join("|");

const coverageEvidence = (rowIndex) => ({
  fixture: `${GENERATED_PATHS.reportJson}#/positiveRows/${rowIndex}/fixture`,
  graph: `${GENERATED_PATHS.reportJson}#/positiveRows/${rowIndex}/resolvedGraph`,
  happyPath: "tooling/profile-coverage/profile-coverage.test.mjs#L88",
  negatives: [`${GENERATED_PATHS.reportJson}#/negativeRows`],
});

const generatedProfileInput = (rowId, values) => {
  const packageName = "profile-coverage-fixture-family";
  const hidden = values.holderBinding === "secret" || values.holderBinding === "blinded-secret";
  const privateInputSources = [
    ...(hidden ? ["hidden-holder"] : []),
    ...(values.composition === "same-holder" ? ["same-holder"] : []),
  ];
  const proofCapabilityId = values.composition === "same-holder" ? "proof.same-holder" : "proof.compact";
  const holderCapability = { id: `holder.${values.holderBinding}`, version: "1.0.0" };
  const proofCapability = { id: proofCapabilityId, version: "1.0.0" };
  const presentationCapability = { id: "presentation.vp", version: "1.0.0" };
  const verification = {
    "ledger-local-v1": ["ledger", "ledger-local", "committed"],
    "ledger-attested-v1": ["ledger", "ledger-attested", "committed"],
    "offchain-public-v1": ["local-process", "local-process", "not-applicable"],
  }[values.verification];
  const statusCapability = { id: `status.${values.status}`, version: "1.0.0" };
  const status = values.status === "disabled"
    ? { mode: "disabled" }
    : {
        mode: values.status,
        capability: statusCapability,
        namespace: `coverage:${rowId}`,
        authority: "coverage-authority",
        rootVersion: "1",
        freshnessPolicy: "coverage-window-v1",
        evidence: values.status === "ledger-local" ? "non-membership" : "challenge-bound-attestation",
        privacy: "public",
        authenticated: true,
      };
  const trustedTime = values.status === "disabled"
    ? { source: "none", evidence: "not-required", freshnessPolicy: "not-required" }
    : values.status === "ledger-local"
      ? { source: "ledger", evidence: "ledger-time", freshnessPolicy: "coverage-window-v1" }
      : { source: "attested", evidence: "challenge-bound-attestation", freshnessPolicy: "coverage-window-v1" };
  const atomic = values.mutation === "atomic-ledger";
  const verificationPackage = { name: "@midnight-ntwrk/credential-compact", version: "0.1.0", exports: ["./credentials.compact"], domain: "verification" };
  const statusPackage = {
    name: "@midnight-ntwrk/midnight-did-credentials-status-registry",
    version: "0.1.0",
    exports: [values.status === "ledger-local" ? "./revocation-registry.compact" : "./status-proof-protocol.compact"],
    domain: "status-registry",
  };
  const protocolPackage = values.protocol === "oid4vp-1.0-final"
    ? { name: "@midnight-ntwrk/midnight-did-credentials-openid", version: "0.1.0", exports: ["."], domain: "protocol" }
    : { name: "@midnight-ntwrk/credential-model", version: "0.1.0", exports: ["."], domain: "protocol" };
  const sameHolderPackage = { name: "@midnight-ntwrk/midnight-did-credentials-same-holder", version: "0.1.0", exports: ["./same-holder/composable.compact"], domain: "proof" };
  const providerSpecs = [
    {
      id: "verification",
      role: "verification",
      capability: { id: `verification.${values.verification}`, version: "1.0.0" },
      package: verificationPackage,
      witnessPolicy: privateInputSources.length > 0 ? "private-compatible" : "public-only",
      atomicReplay: false,
    },
    {
      id: "proof-executor",
      role: "proof-executor",
      capability: proofCapability,
      package: values.composition === "same-holder"
        ? sameHolderPackage
        : { name: "@midnight-ntwrk/midnight-did-credentials-same-holder", version: "0.1.0", exports: ["./same-holder.compact"], domain: "proof" },
      witnessPolicy: privateInputSources.length > 0
        ? "private-compatible"
        : "public-only",
      atomicReplay: false,
    },
    ...(values.status === "disabled"
      ? []
      : [{
          id: "status-registry",
          role: "status-registry",
          capability: statusCapability,
          package: statusPackage,
          witnessPolicy: "private-compatible",
          atomicReplay: false,
        }]),
    ...(values.protocol === "disabled"
      ? []
      : [{
          id: "protocol-transport",
          role: "transport",
          capability: { id: `protocol.${values.protocol}`, version: "1.0.0" },
          package: protocolPackage,
          witnessPolicy: "public-only",
          atomicReplay: false,
        }]),
    ...(atomic
      ? [{
          id: "atomic-replay",
          role: "replay",
          capability: { id: "replay.atomic", version: "1.0.0" },
          package: { name: "fixture-atomic-replay", version: "1.0.0", exports: ["."], domain: "replay" },
          witnessPolicy: "private-compatible",
          atomicReplay: true,
        }]
      : []),
  ];
  const holderPackage = values.holderBinding === "offchain-did"
    ? { name: "@midnight-ntwrk/midnight-did-credentials-offchain-did", version: "0.1.0", exports: ["."], domain: "holder-binding" }
    : { name: "@midnight-ntwrk/midnight-did-credentials", version: "0.1.0", exports: ["./credentials.compact"], domain: "holder-binding" };
  const profile = {
    formatVersion: 1,
    id: `coverage.${rowId}`,
    version: "1.0.0",
    family: { id: "coverage.fixture.family", version: "1.0.0", schemaId: "urn:coverage:fixture:family", schemaVersion: "1.0.0" },
    semantics: {
      claims: [{ claimId: "fixtureClaim", disclosure: "public" }],
      holderBinding: { mode: values.holderBinding, capability: holderCapability },
      issuance: { credential: "issuer-local-issuance-v1", registration: "disabled", anchoring: "disabled" },
      presentation: {
        capability: presentationCapability,
        preparation: "holder-wallet-v1",
        proofGeneration: { capability: proofCapability, witnessPolicy: privateInputSources.length > 0 ? "private-compatible" : "public-only" },
      },
      verification: { profile: values.verification, location: verification[0], authority: verification[1], commitState: verification[2], privateInputSources },
      status,
      did: { method: "did:midnight", relationship: "assertionMethod", network: "coverage-fixture", versionEvidence: "coverage-v1" },
      trust: { scope: "coverage-fixture", epochEvidence: "coverage-v1" },
      trustedTime,
      mutation: atomic
        ? { location: "ledger", nullifier: "contract-derived", consumption: "atomic" }
        : { location: "none", nullifier: "none", consumption: "none" },
      protocols: [values.protocol],
    },
    requirements: {
      packages: [
        { name: packageName, version: "1.0.0", exports: ["./family.compact"], domain: "family" },
        holderPackage,
      ],
      compactEntrypoints: [
        { id: `compact.${rowId}`, packageName, exportPath: "./family.compact", sourcePath: "tooling/profile-coverage/fixtures/family.compact" },
        { id: `compact.${rowId}.verification`, packageName: verificationPackage.name, exportPath: verificationPackage.exports[0], sourcePath: "packages/core/compact/src/credentials.compact" },
        ...(values.status === "disabled"
          ? []
          : [{ id: `compact.${rowId}.status`, packageName: statusPackage.name, exportPath: statusPackage.exports[0], sourcePath: `packages/registry/status-registry/src/${statusPackage.exports[0].slice(2)}` }]),
        ...(values.composition === "same-holder"
          ? [{ id: `compact.${rowId}.same-holder`, packageName: sameHolderPackage.name, exportPath: sameHolderPackage.exports[0], sourcePath: "packages/core/capabilities/same-holder/src/same-holder/composable.compact" }]
          : []),
      ],
      circuits: [
        { id: `circuit.${rowId}`, semanticVersion: "1.0.0", entrypointId: `compact.${rowId}` },
        { id: `circuit.${rowId}.verification`, semanticVersion: "1.0.0", entrypointId: `compact.${rowId}.verification` },
        ...(values.status === "disabled"
          ? []
          : [{ id: `circuit.${rowId}.status`, semanticVersion: "1.0.0", entrypointId: `compact.${rowId}.status` }]),
        ...(values.composition === "same-holder"
          ? [{ id: `circuit.${rowId}.same-holder`, semanticVersion: "1.0.0", entrypointId: `compact.${rowId}.same-holder` }]
          : []),
      ],
      artifacts: [],
      providers: providerSpecs.map((provider) => ({
        id: `requirement.${provider.id}`,
        capability: provider.capability,
        role: provider.role,
      })),
    },
    compatibility: { deniedRules: CREDENTIAL_PROFILE_DENY_RULES },
    conformance: { fixtureId: `fixture:${rowId}`, evidenceDisposition: "tested", evidenceIds: [`fixture:${rowId}:resolve`] },
    maturity: {
      api: { subjectId: `fixture:${rowId}`, value: "prototype" },
      security: { subjectId: `fixture:${rowId}`, value: "unassessed" },
      standards: { subjectId: `fixture:${rowId}`, value: values.protocol === "oid4vp-1.0-final" ? "inspired" : "not-applicable" },
      production: { subjectId: `fixture:${rowId}`, value: "not-assessed" },
    },
  };
  const familyMetadata = JSON.parse(readFileSync(path.resolve(repoRoot, "tooling/profile-coverage/fixtures/family-definition.json"), "utf8"));
  const input = fixtureCompositionInput(profile, familyMetadata);
  const deploymentAuthority = (id, identity) => ({
    id,
    version: "1.0.0",
    identity,
    networkId: `network.${rowId}`,
    chainId: `chain.${rowId}`,
    contractAddress: `contract.${id}`,
    profile: { id: profile.id, version: profile.version },
  });
  input.assembly.deployments = [
    {
      ...deploymentAuthority(`holder.${rowId}`, `holder:${values.holderBinding}`),
      kind: "local-service",
      domain: "holder-binding",
      immutableInputs: { profile: values.holderBinding },
    },
    ...providerSpecs.map((provider) => ({
      ...deploymentAuthority(`deployment.${provider.id}.${rowId}`, `${provider.id}:${rowId}`),
      kind: provider.role === "verification" && values.verification !== "offchain-public-v1" ? "compact-contract" : "local-service",
      domain: provider.package.domain,
      immutableInputs: { capability: `${provider.capability.id}@${provider.capability.version}` },
    })),
  ];
  input.catalog.providers = providerSpecs.map((provider) => ({
    id: `provider.${provider.id}`,
    version: "1.0.0",
    roles: [provider.role],
    capabilities: [provider.capability],
    packages: [provider.package],
    witnessPolicy: provider.witnessPolicy,
    atomicReplay: provider.atomicReplay,
  }));
  for (const provider of providerSpecs) {
    input.assembly.components[provider.role] = {
      state: "selected",
      requirementId: `requirement.${provider.id}`,
      provider: { id: `provider.${provider.id}`, version: "1.0.0" },
      instanceId: `${provider.id}:${rowId}`,
    };
  }
  return input;
};

export const enumerateAllowedCandidates = () => cartesian(COVERAGE_AXES)
  .filter((candidate) => incompatibility(candidate.values) === null)
  .sort((left, right) => valuesKey(left.values).localeCompare(valuesKey(right.values)));

const negativeFixture = (rule) => {
  const profile = structuredClone(generatedProfileInput("deny-fixture", {
    holderBinding: "explicit-did",
    status: "disabled",
    verification: "offchain-public-v1",
    protocol: "disabled",
    composition: "single",
    mutation: "none",
  }).profile);
  if (rule === "PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION") {
    profile.semantics.holderBinding = { mode: "secret", capability: { id: "holder.secret", version: "1.0.0" } };
    profile.semantics.verification.privateInputSources = ["hidden-holder"];
  } else if (rule === "STATUS_EVIDENCE_REQUIRED") {
    profile.semantics.status = { mode: "ledger-local", capability: { id: "status.ledger-local", version: "1.0.0" }, namespace: "coverage", authority: "coverage" };
  } else if (rule === "CALLER_TIME_WITH_LEDGER_AUTHORITY") {
    profile.semantics.verification = { profile: "ledger-local-v1", location: "ledger", authority: "ledger-local", commitState: "committed", privateInputSources: [] };
    profile.semantics.trustedTime = { source: "caller", evidence: "caller-assertion", freshnessPolicy: "coverage-window-v1" };
  } else if (rule === "ATOMIC_REPLAY_REQUIRED") {
    profile.semantics.mutation = { location: "ledger", nullifier: "caller", consumption: "separate" };
  } else if (rule === "DISABLED_CAPABILITY_DEPENDENCY") {
    profile.requirements.packages.push({ name: "fixture-disabled-status", version: "1.0.0", exports: ["."], domain: "status-registry" });
  } else if (rule === "LEDGER_COMMIT_REQUIRED") {
    profile.semantics.verification = { profile: "ledger-attested-v1", location: "ledger", authority: "ledger-attested", commitState: "submitted", privateInputSources: [] };
  } else if (rule === "UNTESTED_COMBINATION") {
    profile.conformance.evidenceDisposition = "untested";
  }
  return { id: `deny:${rule}`, profile };
};

export const executeNegativeFixture = (rule) => {
  const fixture = negativeFixture(rule);
  try {
    assertCredentialFamilyProfileV1(fixture.profile);
  } catch (error) {
    assert.equal(error?.code, rule, `${fixture.id} must throw its own deny-rule code`);
    return { thrownCode: error.code, path: error.path };
  }
  assert.fail(`${fixture.id} did not execute a negative assertion`);
};

const negativeRows = () => CREDENTIAL_PROFILE_DENY_RULES.map((rule, index) => ({
  id: `negative-${String(index + 1).padStart(2, "0")}-${rule.toLowerCase().replaceAll("_", "-")}`,
  supported: false,
  rule,
  fixture: negativeFixture(rule),
  assertion: executeNegativeFixture(rule),
  unsupportedRationale: {
    code: rule,
    message: {
      PRIVATE_INPUTS_WITH_PUBLIC_ONLY_VERIFICATION: "Hidden/private inputs cannot be sent to a public-only verifier.",
      STATUS_EVIDENCE_REQUIRED: "Enabled status without authenticated freshness and proof evidence is unsupported.",
      CALLER_TIME_WITH_LEDGER_AUTHORITY: "Caller-controlled time cannot establish ledger-authoritative freshness.",
      ATOMIC_REPLAY_REQUIRED: "Side effects without contract-derived atomic replay consumption are unsupported.",
      DISABLED_CAPABILITY_DEPENDENCY: "A disabled capability cannot retain package, provider, or deployment edges.",
      LEDGER_COMMIT_REQUIRED: "Ledger authority cannot be claimed for an uncommitted attempt.",
      UNTESTED_COMBINATION: "A profile without identified tested conformance evidence is unsupported.",
    }[rule],
  },
  evidence: {
    fixture: `${GENERATED_PATHS.reportJson}#/negativeRows/${index}/fixture`,
    graph: "packages/core/model/src/composition-validation.ts#L43",
    happyPath: `${GENERATED_PATHS.reportJson}#/negativeRows/${index}/assertion`,
    negatives: [`${GENERATED_PATHS.reportJson}#/negativeRows/${index}/assertion`],
  },
}));

export const generateCoverageReport = () => {
  const manifests = loadPrototypeManifests();
  const prototypeGraphs = validatePrototypeManifests(manifests);
  const candidates = enumerateAllowedCandidates();
  const allTargets = new Set(candidates.flatMap((candidate) => targetsFor(candidate.values)));
  const uncovered = new Set(allTargets);
  const selected = [];
  const selectedKeys = new Set();

  const select = (candidate, mandatoryHigherOrder = null, boundary = null) => {
    const key = valuesKey(candidate.values);
    if (selectedKeys.has(key)) {
      const existing = selected.find((row) => valuesKey(row.values) === key);
      if (mandatoryHigherOrder !== null) {
        existing.mandatoryHigherOrder = mandatoryHigherOrder;
        existing.securityBoundary = boundary;
      }
      return;
    }
    selectedKeys.add(key);
    selected.push({ values: candidate.values, mandatoryHigherOrder, securityBoundary: boundary });
    for (const target of targetsFor(candidate.values)) uncovered.delete(target);
  };

  for (const mandatory of mandatoryRows) {
    const candidate = candidates.find((entry) => valuesKey(entry.values) === valuesKey(mandatory.values));
    assert.ok(candidate, `mandatory row ${mandatory.id} must be allowed`);
    select(candidate, mandatory.id, mandatory.boundary);
  }

  while (uncovered.size > 0) {
    let best = null;
    let bestScore = -1;
    for (const candidate of candidates) {
      if (selectedKeys.has(valuesKey(candidate.values))) continue;
      const score = targetsFor(candidate.values).filter((target) => uncovered.has(target)).length;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    assert.ok(best !== null && bestScore > 0, "coverage target is not satisfiable");
    select(best);
  }

  selected.sort((left, right) => {
    const leftMandatory = left.mandatoryHigherOrder === null ? Number.MAX_SAFE_INTEGER : MANDATORY_HIGHER_ORDER_IDS.indexOf(left.mandatoryHigherOrder);
    const rightMandatory = right.mandatoryHigherOrder === null ? Number.MAX_SAFE_INTEGER : MANDATORY_HIGHER_ORDER_IDS.indexOf(right.mandatoryHigherOrder);
    return leftMandatory - rightMandatory || valuesKey(left.values).localeCompare(valuesKey(right.values));
  });

  const positiveRows = selected.map((row, index) => {
    const id = `positive-${String(index + 1).padStart(2, "0")}`;
    const input = generatedProfileInput(id, row.values);
    const resolvedGraph = resolveCredentialComposition(input);
    return {
      id,
      supported: true,
      values: row.values,
      mandatoryHigherOrder: row.mandatoryHigherOrder,
      securityBoundary: row.securityBoundary,
      fixture: { profile: input.profile, assembly: input.assembly, catalog: input.catalog },
      resolvedGraph,
      behaviorEvidence: row.values.composition === "same-holder"
        ? {
            kind: "two-binding-compact-circuit",
            bindingCount: 2,
            bindingIds: [`${id}:credential-binding-a`, `${id}:credential-binding-b`],
            sharedHiddenWitness: `${id}:holder-secret-witness`,
            circuit: "assertSameBlindedSecretHolderBindingWitnesses",
            executableTest: "packages/core/capabilities/same-holder/src/test/same-holder-capability.test.ts#L10",
            authoritative: false,
          }
        : null,
      evidence: coverageEvidence(index),
    };
  });
  const achievedTargets = new Set(positiveRows.flatMap((row) => targetsFor(row.values)));
  const uncoveredTargets = [...allTargets].filter((target) => !achievedTargets.has(target));

  return {
    formatVersion: 1,
    generatedBy: "tooling/profile-coverage/profile-coverage.mjs",
    guarantees: {
      scope: "independently-selectable-axes-only",
      statement: "Every supported value and every allowed pair across independently selectable axes appears in at least one selected positive row.",
      exhaustiveCartesianCoverage: false,
      allowedCandidateRows: candidates.length,
      selectedPositiveRows: positiveRows.length,
      supportedValueTargets: [...allTargets].filter((target) => target.startsWith("value:")).length,
      allowedPairTargets: [...allTargets].filter((target) => target.startsWith("pair:")).length,
      uncoveredSupportedValues: uncoveredTargets.filter((target) => target.startsWith("value:")),
      uncoveredAllowedPairs: uncoveredTargets.filter((target) => target.startsWith("pair:")),
    },
    axes: COVERAGE_AXES,
    fixedAxes: FIXED_AXES,
    compatibilityDenyRules: CREDENTIAL_PROFILE_DENY_RULES,
    retainedPrototypeManifests: manifests.map((manifest, index) => ({
      prototype: manifest.prototype,
      familyDefinition: manifest.familyDefinition,
      profile: manifest.profile,
      evidence: manifest.evidence,
      resolvedGraph: prototypeGraphs[index],
    })),
    positiveRows,
    negativeRows: negativeRows(),
  };
};

const markdownCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const table = (headers, rows) => [
  `| ${headers.join(" | ")} |`,
  `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
].join("\n");

const renderReportMarkdown = (report) => `# Prototype profile coverage\n\nGenerated by \`${report.generatedBy}\`. Run \`pnpm run profile-coverage:generate\` to update and \`pnpm run check:profile-coverage\` to detect drift.\n\n## Exact achieved guarantee\n\nThis matrix covers **every supported value and every allowed pair across independently selectable axes** admitted by the explicit constraints. It selected ${report.guarantees.selectedPositiveRows} positive rows from ${report.guarantees.allowedCandidateRows} allowed finite candidates, covering ${report.guarantees.supportedValueTargets} value targets and ${report.guarantees.allowedPairTargets} allowed-pair targets with zero uncovered targets. It **does not claim exhaustive Cartesian coverage**, OpenID conformance, production readiness, or authority-mechanism assurance. Fixed axes are not counted as independently selectable pairwise dimensions.\n\n## Independently selectable axes\n\n${table(["Axis", "Supported values"], report.axes.map((axis) => [axis.id, axis.values.map((value) => `\`${value}\``).join(", ")]))}\n\n## Fixed axes and security interactions\n\n${table(["Axis", "Fixed value", "Rationale", "Varied-axis interactions", "Evidence"], report.fixedAxes.map((axis) => [axis.id, `\`${axis.value}\``, axis.rationale, axis.securityInteractions.join(", "), axis.evidence.map((item) => `[evidence](../../${item})`).join(", ")]))}\n\n## Mandatory higher-order rows\n\n${table(["Row", "Requirement", "Tuple", "Boundary", "Behavior evidence"], report.positiveRows.filter((row) => row.mandatoryHigherOrder !== null).map((row) => [row.id, row.mandatoryHigherOrder, Object.entries(row.values).map(([axis, value]) => `${axis}=\`${value}\``).join("; "), row.securityBoundary, row.behaviorEvidence === null ? "composition graph only" : `[two-binding circuit test](../../${row.behaviorEvidence.executableTest}) (${row.behaviorEvidence.authoritative ? "authoritative" : "non-authoritative"})`]))}\n\n## Forbidden compatibility negatives\n\n${table(["Rule", "Machine-readable rationale", "Negative evidence"], report.negativeRows.map((row) => [row.rule, `${row.unsupportedRationale.code}: ${row.unsupportedRationale.message}`, row.evidence.negatives.map((item) => `[test](../../${item})`).join(", ")]))}\n\n## Positive rows\n\n${table(["Row", ...report.axes.map((axis) => axis.id), "Fixture / graph / happy / negative evidence"], report.positiveRows.map((row) => [row.id, ...report.axes.map((axis) => row.values[axis.id]), `[fixture](../../${row.evidence.fixture}) [graph](../../${row.evidence.graph}) [happy](../../${row.evidence.happyPath}) [negative](../../${row.evidence.negatives[0]})`]))}\n`;

const renderPrototypeReadme = (report) => {
  const manifests = report.retainedPrototypeManifests;
  return `# Retained credential-family prototype evidence\n\nThis generated catalog is private conformance evidence, not a product or production-readiness catalog. Source manifests live in each prototype's \`conformance/composition-manifest.json\`. The exact finite coverage guarantee is documented in [the profile coverage report](../../../docs/testing/prototype-profile-coverage.md).\n\n## Capability matrix\n\n${table(["Prototype", "Holder binding", "Status", "Verification", "Protocols"], manifests.map(({ prototype, profile }) => [prototype.id, profile.semantics.holderBinding.mode, profile.semantics.status.mode, profile.semantics.verification.profile, profile.semantics.protocols.join(", ")]))}\n\n## Maturity matrix\n\n${table(["Prototype", "API", "Security", "Standards", "Production"], manifests.map(({ prototype, profile }) => [prototype.id, profile.maturity.api.value, profile.maturity.security.value, profile.maturity.standards.value, profile.maturity.production.value]))}\n\n## Package and artifact matrix\n\n${table(["Prototype", "Exact packages", "Compact entrypoints", "Trusted artifacts"], manifests.map(({ prototype, profile }) => [prototype.id, profile.requirements.packages.map((item) => `${item.name}@${item.version}`).join(", "), profile.requirements.compactEntrypoints.map((item) => item.sourcePath).join(", "), profile.requirements.artifacts.length === 0 ? "none declared" : profile.requirements.artifacts.map((item) => item.id).join(", ")]))}\n\n## Privacy and trust matrix\n\n${table(["Prototype", "Claim disclosures", "Private inputs", "DID / trust scope", "Limitations"], manifests.map(({ prototype, profile }) => [prototype.id, [...new Set(profile.semantics.claims.map((claim) => claim.disclosure))].join(", "), profile.semantics.verification.privateInputSources.join(", ") || "none", `${profile.semantics.did.method}; ${profile.semantics.trust.scope}`, prototype.limitations.join(" ")]))}\n\n## Test evidence matrix\n\n${table(["Prototype", "Fixture", "Resolved graph", "Happy path", "Negative evidence"], manifests.map(({ prototype, familyDefinition, evidence }, index) => [prototype.id, `[fixture](../../../${evidence.fixture})`, `[definition](../../../${familyDefinition}) [resolved graph](../../../${GENERATED_PATHS.reportJson}#/retainedPrototypeManifests/${index}/resolvedGraph)`, `[happy](../../../${evidence.happyPath})`, evidence.negatives.map((item) => `[negative](../../../${item})`).join(", ")]))}\n`;
};

export const renderGeneratedOutputs = () => {
  const report = generateCoverageReport();
  return {
    [GENERATED_PATHS.reportJson]: `${JSON.stringify(report, null, 2)}\n`,
    [GENERATED_PATHS.reportMarkdown]: renderReportMarkdown(report),
    [GENERATED_PATHS.prototypeReadme]: renderPrototypeReadme(report),
  };
};

export const updateGeneratedOutputs = () => {
  const outputs = renderGeneratedOutputs();
  for (const [relativePath, content] of Object.entries(outputs)) {
    const absolutePath = path.resolve(repoRoot, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content);
  }
  return outputs;
};

export const checkGeneratedOutputs = () => {
  const outputs = renderGeneratedOutputs();
  const drifted = Object.entries(outputs)
    .filter(([relativePath, content]) => !existsSync(path.resolve(repoRoot, relativePath)) || readFileSync(path.resolve(repoRoot, relativePath), "utf8") !== content)
    .map(([relativePath]) => relativePath);
  assert.deepEqual(drifted, [], `generated profile coverage drifted: ${drifted.join(", ")}`);
  return outputs;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "--check";
  if (command === "--update") {
    const outputs = updateGeneratedOutputs();
    console.log(`[profile-coverage] updated ${Object.keys(outputs).length} generated surfaces`);
  } else if (command === "--check") {
    const outputs = checkGeneratedOutputs();
    console.log(`[profile-coverage] OK: ${loadPrototypeManifests().length} manifests; ${Object.keys(outputs).length} generated surfaces are current`);
  } else {
    console.error("Usage: profile-coverage.mjs [--check|--update]");
    process.exitCode = 1;
  }
}
