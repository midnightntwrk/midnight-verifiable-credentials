import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { parse } from "yaml";

let isolatedPnpmConfigHome;
const getIsolatedPnpmConfigHome = () => {
  isolatedPnpmConfigHome ??= path.join(
    os.tmpdir(),
    `midnight-vc-pnpm-config-${process.pid}-${randomUUID()}`,
  );
  return isolatedPnpmConfigHome;
};

const fail = (message) => {
  throw new Error(`[pnpm-supply-policy] ${message}`);
};

const exactVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u;

const requiredSecurityOverrideSelectors = [
  "algoliasearch",
  "brace-expansion@1",
  "brace-expansion@2",
  "brace-expansion@5",
  "js-yaml",
  "postcss",
  "vite",
];

const packageNameFromPolicy = (policy) => {
  const separator = policy.lastIndexOf("@");
  if (separator <= 0) {
    fail(`policy selector must include an exact version: ${policy}`);
  }
  const versions = policy
    .slice(separator + 1)
    .split("||")
    .map((version) => version.trim());
  if (versions.some((version) => !exactVersionPattern.test(version))) {
    fail(`policy selector must use exact semantic versions: ${policy}`);
  }
  return policy.slice(0, separator);
};

const validatePolicies = (name, policies) => {
  if (!Array.isArray(policies) || policies.some((value) => typeof value !== "string")) {
    fail(`${name} must be an array of package selectors`);
  }
  const packageNames = new Set();
  for (const policy of policies) {
    if (policy.includes("*") || policy.startsWith("!")) {
      fail(`${name} must not contain broad selector ${policy}`);
    }
    const packageName = packageNameFromPolicy(policy);
    if (packageNames.has(packageName)) {
      fail(`${name} contains more than one selector for ${packageName}`);
    }
    packageNames.add(packageName);
  }
  return [...policies];
};

export const validateRootPnpmSupplyPolicy = (policy) => {
  if (
    policy.overrides === null ||
    typeof policy.overrides !== "object" ||
    Array.isArray(policy.overrides)
  ) {
    fail("overrides must contain the required security pins");
  }
  for (const selector of requiredSecurityOverrideSelectors) {
    if (!exactVersionPattern.test(policy.overrides[selector] ?? "")) {
      fail(`overrides must pin ${selector} to an exact version`);
    }
  }
  const allowBuildEntries =
    policy.allowBuilds === null ||
    typeof policy.allowBuilds !== "object" ||
    Array.isArray(policy.allowBuilds)
      ? []
      : Object.entries(policy.allowBuilds);
  const isEsbuildSelector = (packageSelector) =>
    packageSelector === "esbuild" ||
    (packageSelector.startsWith("esbuild@") &&
      exactVersionPattern.test(packageSelector.slice("esbuild@".length)));
  if (
    !allowBuildEntries.some(
      ([packageSelector, allowed]) =>
        isEsbuildSelector(packageSelector) && allowed === true,
    ) ||
    allowBuildEntries.some(
      ([packageSelector, allowed]) =>
        allowed !== false &&
        !(isEsbuildSelector(packageSelector) && allowed === true),
    )
  ) {
    fail("allowBuilds must approve only esbuild and deny every other entry");
  }
  if (policy.blockExoticSubdeps !== true) {
    fail("blockExoticSubdeps must be true");
  }
  if (policy.dangerouslyAllowAllBuilds !== false) {
    fail("dangerouslyAllowAllBuilds must be false");
  }
  if (policy.engineStrict !== true) {
    fail("engineStrict must be true");
  }
  if (policy.pmOnFail !== "error") {
    fail('pmOnFail must be "error"');
  }
  if (policy.strictDepBuilds !== true) {
    fail("strictDepBuilds must be true");
  }
  if (policy.verifyStoreIntegrity !== true) {
    fail("verifyStoreIntegrity must be true");
  }
  if (
    !Number.isInteger(policy.minimumReleaseAge) ||
    policy.minimumReleaseAge < 10080
  ) {
    fail("minimumReleaseAge must enforce at least a seven-day cooldown");
  }
  if (policy.minimumReleaseAgeIgnoreMissingTime !== false) {
    fail("minimumReleaseAgeIgnoreMissingTime must be false");
  }
  if (policy.minimumReleaseAgeExcludePrune !== false) {
    fail("minimumReleaseAgeExcludePrune must be false");
  }
  if (policy.minimumReleaseAgeStrict !== true) {
    fail("minimumReleaseAgeStrict must be true");
  }
  if (policy.trustPolicy !== "no-downgrade") {
    fail('trustPolicy must be "no-downgrade"');
  }
  if (policy.trustPolicyIgnoreAfter !== undefined) {
    fail("trustPolicyIgnoreAfter must not weaken provenance enforcement");
  }
  if (policy.trustLockfile !== false) {
    fail("trustLockfile must be false");
  }
  return {
    allowBuilds: { ...policy.allowBuilds },
    blockExoticSubdeps: true,
    dangerouslyAllowAllBuilds: false,
    engineStrict: true,
    minimumReleaseAge: policy.minimumReleaseAge,
    minimumReleaseAgeExcludePrune: false,
    minimumReleaseAgeIgnoreMissingTime: false,
    minimumReleaseAgeStrict: true,
    minimumReleaseAgeExclude: validatePolicies(
      "minimumReleaseAgeExclude",
      policy.minimumReleaseAgeExclude ?? [],
    ),
    overrides: { ...policy.overrides },
    pmOnFail: "error",
    trustPolicy: "no-downgrade",
    trustPolicyExclude: validatePolicies(
      "trustPolicyExclude",
      policy.trustPolicyExclude ?? [],
    ),
    trustLockfile: false,
    strictDepBuilds: true,
    verifyStoreIntegrity: true,
  };
};

const pnpmPolicyNames = [
  "allowbuilds",
  "blockexoticsubdeps",
  "dangerouslyallowallbuilds",
  "enginestrict",
  "globalconfig",
  "minimumreleaseage",
  "minimumreleaseageexclude",
  "minimumreleaseageexcludeprune",
  "minimumreleaseageignoremissingtime",
  "minimumreleaseagestrict",
  "overrides",
  "pmonfail",
  "registry",
  "strictdepbuilds",
  "trustlockfile",
  "trustpolicy",
  "trustpolicyexclude",
  "trustpolicyignoreafter",
  "userconfig",
  "verifystoreintegrity",
];
const pnpmPolicyEnvironmentNames = new Set(
  ["npmconfig", "pnpmconfig"].flatMap((prefix) =>
    pnpmPolicyNames.map((name) => `${prefix}${name}`),
  ),
);

export const sanitizePnpmPolicyEnvironment = (
  sourceEnvironment = process.env,
) => {
  const environment = { ...sourceEnvironment };
  for (const environmentName of Object.keys(environment)) {
    const normalizedName = environmentName
      .toLowerCase()
      .replaceAll(/[^a-z0-9]/gu, "");
    if (pnpmPolicyEnvironmentNames.has(normalizedName)) {
      delete environment[environmentName];
    }
  }
  environment.NPM_CONFIG_USERCONFIG = os.devNull;
  environment.NPM_CONFIG_GLOBALCONFIG = os.devNull;
  environment.PNPM_CONFIG_PM_ON_FAIL = "error";
  // Consumer verification must not inherit omitted weakening keys from pnpm's
  // global YAML config. Registry endpoints are passed explicitly when needed.
  environment.XDG_CONFIG_HOME = getIsolatedPnpmConfigHome();
  return environment;
};

const readProjectPnpmConfigList = (
  repoRoot,
  sourceEnvironment = process.env,
) => {
  const environment = sanitizePnpmPolicyEnvironment(sourceEnvironment);
  return JSON.parse(
    execFileSync(
      "pnpm",
      ["config", "list", "--location", "project", "--json"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: environment,
      },
    ).trim(),
  );
};

export const readRootPnpmSupplyPolicy = (
  repoRoot,
  sourceEnvironment = process.env,
) => {
  if (existsSync(path.join(repoRoot, ".npmrc"))) {
    fail("root .npmrc is not allowed; define project policy in pnpm-workspace.yaml");
  }
  const workspacePath = path.join(repoRoot, "pnpm-workspace.yaml");
  let declaredConfig;
  try {
    declaredConfig = parse(readFileSync(workspacePath, "utf8"));
  } catch (error) {
    fail(
      `cannot read pnpm-workspace.yaml: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (
    declaredConfig === null ||
    typeof declaredConfig !== "object" ||
    Array.isArray(declaredConfig)
  ) {
    fail("pnpm-workspace.yaml must contain a mapping");
  }
  if (declaredConfig.pmOnFail !== "error") {
    fail('pmOnFail must be "error" in pnpm-workspace.yaml');
  }
  const config = readProjectPnpmConfigList(repoRoot, sourceEnvironment);
  return validateRootPnpmSupplyPolicy({
    allowBuilds: config.allowBuilds,
    blockExoticSubdeps: config.blockExoticSubdeps,
    dangerouslyAllowAllBuilds: config.dangerouslyAllowAllBuilds,
    engineStrict: config.engineStrict,
    minimumReleaseAge: config.minimumReleaseAge,
    minimumReleaseAgeExcludePrune: config.minimumReleaseAgeExcludePrune,
    minimumReleaseAgeIgnoreMissingTime:
      config.minimumReleaseAgeIgnoreMissingTime,
    minimumReleaseAgeStrict: config.minimumReleaseAgeStrict,
    minimumReleaseAgeExclude: config.minimumReleaseAgeExclude ?? [],
    overrides: config.overrides,
    pmOnFail: declaredConfig.pmOnFail,
    trustPolicy: config.trustPolicy,
    trustPolicyExclude: config.trustPolicyExclude ?? [],
    trustPolicyIgnoreAfter: config.trustPolicyIgnoreAfter,
    trustLockfile: config.trustLockfile,
    strictDepBuilds: config.strictDepBuilds,
    verifyStoreIntegrity: config.verifyStoreIntegrity,
  });
};

export const createConsumerPnpmWorkspace = ({
  rootPolicy,
  overrides = {},
  publishedPackageNames = [],
  expectedVersion,
}) => {
  const consumerOverrides = { ...rootPolicy.overrides, ...overrides };
  const minimumReleaseAgeExclude = [...rootPolicy.minimumReleaseAgeExclude];
  if (publishedPackageNames.length > 0 && typeof expectedVersion !== "string") {
    fail("registry verification requires an expected version");
  }
  if (
    expectedVersion !== undefined &&
    !exactVersionPattern.test(expectedVersion)
  ) {
    fail(`registry verification version is invalid: ${expectedVersion}`);
  }
  for (const packageName of publishedPackageNames) {
    const existingIndex = minimumReleaseAgeExclude.findIndex(
      (policy) => packageNameFromPolicy(policy) === packageName,
    );
    if (existingIndex === -1) {
      minimumReleaseAgeExclude.push(`${packageName}@${expectedVersion}`);
      continue;
    }
    const existingVersions = minimumReleaseAgeExclude[existingIndex]
      .slice(minimumReleaseAgeExclude[existingIndex].lastIndexOf("@") + 1)
      .split("||")
      .map((version) => version.trim());
    if (!existingVersions.includes(expectedVersion)) {
      minimumReleaseAgeExclude[existingIndex] =
        `${minimumReleaseAgeExclude[existingIndex]} || ${expectedVersion}`;
    }
  }

  return `${JSON.stringify(
    {
      packages: ["."],
      allowBuilds: rootPolicy.allowBuilds,
      ...(Object.keys(consumerOverrides).length === 0
        ? {}
        : { overrides: consumerOverrides }),
      pmOnFail: rootPolicy.pmOnFail,
      blockExoticSubdeps: rootPolicy.blockExoticSubdeps,
      dangerouslyAllowAllBuilds: rootPolicy.dangerouslyAllowAllBuilds,
      engineStrict: rootPolicy.engineStrict,
      minimumReleaseAge: rootPolicy.minimumReleaseAge,
      minimumReleaseAgeExcludePrune:
        rootPolicy.minimumReleaseAgeExcludePrune,
      minimumReleaseAgeIgnoreMissingTime:
        rootPolicy.minimumReleaseAgeIgnoreMissingTime,
      minimumReleaseAgeStrict: rootPolicy.minimumReleaseAgeStrict,
      ...(minimumReleaseAgeExclude.length === 0
        ? {}
        : { minimumReleaseAgeExclude }),
      trustPolicy: rootPolicy.trustPolicy,
      ...(rootPolicy.trustPolicyExclude.length === 0
        ? {}
        : { trustPolicyExclude: rootPolicy.trustPolicyExclude }),
      trustLockfile: rootPolicy.trustLockfile,
      strictDepBuilds: rootPolicy.strictDepBuilds,
      verifyStoreIntegrity: rootPolicy.verifyStoreIntegrity,
    },
    null,
    2,
  )}\n`;
};
