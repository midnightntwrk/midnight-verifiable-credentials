import { execFileSync } from "node:child_process";

const cleanPublicRegistryEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) =>
      !/^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(name) &&
      !/^NPM_CONFIG_/iu.test(name),
  ),
);

const publicRegistryReadOptions = (packageName, registry) => {
  const scope = /^(@[^/]+)\//u.exec(packageName)?.[1];
  return [
    "--registry",
    registry,
    ...(scope === undefined ? [] : [`--${scope}:registry=${registry}`]),
    "--prefer-online",
    "--userconfig",
    "/dev/null",
    "--globalconfig",
    // Metadata subprocesses ignore stdin, making this a distinct empty config.
    "/dev/stdin",
  ];
};

export const readPublicRegistryMetadata = ({
  args,
  npmCommand,
  packageName,
  registry,
}) =>
  execFileSync(
    npmCommand,
    [
      ...args,
      ...publicRegistryReadOptions(packageName, registry),
    ],
    {
      encoding: "utf8",
      env: cleanPublicRegistryEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  ).trim();

export const publicPackageExists = ({
  npmCommand,
  packageName,
  registry,
}) => {
  for (const selector of ["*", "rc", "snapshot"]) {
    try {
      readPublicRegistryMetadata({
        args: ["view", `${packageName}@${selector}`, "version", "--json"],
        npmCommand,
        packageName,
        registry,
      });
      return true;
    } catch (error) {
      if (error.stderr === undefined || error.stderr === null) {
        throw error;
      }
      const stderr = String(error.stderr ?? "");
      if (/(?:E404|404 Not Found)/u.test(stderr)) {
        continue;
      }
      throw new Error(
        `npm package lookup failed for ${packageName}: ${stderr.trim()}`,
      );
    }
  }
  return false;
};
