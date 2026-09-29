const fail = (message) => {
  throw new Error(`[pnpm-supply-policy] ${message}`);
};

const packageNameFromPolicy = (policy) => {
  const separator = policy.lastIndexOf("@");
  return separator > 0 ? policy.slice(0, separator) : policy;
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
  if (policy.minimumReleaseAge !== 10080) {
    fail("minimumReleaseAge must enforce a seven-day cooldown");
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

export const createConsumerPnpmWorkspace = ({
  rootPolicy,
  publishedPackageNames = [],
  expectedVersion,
}) => {
  const minimumReleaseAgeExclude = [...rootPolicy.minimumReleaseAgeExclude];
  if (publishedPackageNames.length > 0 && typeof expectedVersion !== "string") {
    fail("registry verification requires an expected version");
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
