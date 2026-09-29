import { execFileSync } from "node:child_process";

const fail = (message) => {
  throw new Error(`[pnpm-supply-policy] ${message}`);
};

const exactVersionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u;

const packageNameFromPolicy = (policy) => {
  const separator = policy.lastIndexOf("@");
  if (separator <= 0) {
    fail(`policy selector must include an exact version: ${policy}`);
  }
  const versions = policy.slice(separator + 1).split(" || ");
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
  if (policy.blockExoticSubdeps !== true) {
    fail("blockExoticSubdeps must be true");
  }
  if (
    !Number.isInteger(policy.minimumReleaseAge) ||
    policy.minimumReleaseAge < 10080
  ) {
    fail("minimumReleaseAge must enforce at least a seven-day cooldown");
  }
  if (policy.trustPolicy !== "no-downgrade") {
    fail('trustPolicy must be "no-downgrade"');
  }
  if (policy.trustPolicyIgnoreAfter !== undefined) {
    fail("trustPolicyIgnoreAfter must not weaken provenance enforcement");
  }
  return {
    blockExoticSubdeps: true,
    minimumReleaseAge: policy.minimumReleaseAge,
    minimumReleaseAgeExclude: validatePolicies(
      "minimumReleaseAgeExclude",
      policy.minimumReleaseAgeExclude ?? [],
    ),
    trustPolicy: "no-downgrade",
    trustPolicyExclude: validatePolicies(
      "trustPolicyExclude",
      policy.trustPolicyExclude ?? [],
    ),
  };
};

const pnpmPolicyEnvironmentNames = [
  "block_exotic_subdeps",
  "minimum_release_age",
  "minimum_release_age_exclude",
  "trust_policy",
  "trust_policy_exclude",
  "trust_policy_ignore_after",
];

export const readProjectPnpmConfig = (
  repoRoot,
  name,
  sourceEnvironment = process.env,
) => {
  const environment = { ...sourceEnvironment };
  for (const configName of pnpmPolicyEnvironmentNames) {
    delete environment[`npm_config_${configName}`];
    delete environment[`NPM_CONFIG_${configName.toUpperCase()}`];
  }
  const output = execFileSync(
    "pnpm",
    ["config", "get", name, "--location", "project", "--json"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: environment,
    },
  ).trim();
  return output === "" ? undefined : JSON.parse(output);
};

export const createConsumerPnpmWorkspace = ({
  rootPolicy,
  publishedPackageNames = [],
  expectedVersion,
}) => {
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
    if (minimumReleaseAgeExclude[existingIndex] !== packageName) {
      minimumReleaseAgeExclude[existingIndex] =
        `${minimumReleaseAgeExclude[existingIndex]} || ${expectedVersion}`;
    }
  }

  return `${JSON.stringify(
    {
      packages: ["."],
      blockExoticSubdeps: rootPolicy.blockExoticSubdeps,
      minimumReleaseAge: rootPolicy.minimumReleaseAge,
      ...(minimumReleaseAgeExclude.length === 0
        ? {}
        : { minimumReleaseAgeExclude }),
      trustPolicy: rootPolicy.trustPolicy,
      ...(rootPolicy.trustPolicyExclude.length === 0
        ? {}
        : { trustPolicyExclude: rootPolicy.trustPolicyExclude }),
    },
    null,
    2,
  )}\n`;
};
