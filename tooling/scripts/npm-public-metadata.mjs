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
