export const packageTarballName = (manifest) => {
  if (typeof manifest?.name !== "string" || typeof manifest?.version !== "string") {
    throw new TypeError("Package manifest must contain string name and version fields");
  }
  const archiveName = manifest.name.replace(/^@/u, "").replaceAll("/", "-");
  return `${archiveName}-${manifest.version}.tgz`;
};
