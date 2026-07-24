#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { supportedWorkspacePaths } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const parseArgs = (args) => {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    switch (args[index]) {
      case "--tarballs":
        options.tarballs = args[++index];
        break;
      case "--output":
        options.output = args[++index];
        break;
      default:
        throw new Error(`unknown argument: ${args[index]}`);
    }
  }
  if (options.tarballs === undefined || options.output === undefined) {
    throw new Error(
      "usage: generate-release-sbom.mjs --tarballs <directory> --output <directory>",
    );
  }
  return options;
};

const options = parseArgs(process.argv.slice(2));
const tarballRoot = path.resolve(repoRoot, options.tarballs);
const outputRoot = path.resolve(repoRoot, options.output);
mkdirSync(outputRoot, { recursive: true });

const created = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : new Date().toISOString();
const commit =
  process.env.GITHUB_SHA ??
  "0000000000000000000000000000000000000000";
const npmPurl = (packageName, version) => {
  if (!packageName.startsWith("@")) {
    return `pkg:npm/${encodeURIComponent(packageName)}@${version}`;
  }
  const [scope, name] = packageName.split("/");
  return `pkg:npm/${encodeURIComponent(scope)}/${encodeURIComponent(name)}@${version}`;
};

for (const workspacePath of supportedWorkspacePaths) {
  const packageJson = JSON.parse(
    readFileSync(path.join(repoRoot, workspacePath, "package.json"), "utf8"),
  );
  const artifactName = `${packageJson.name
    .slice(1)
    .replace("/", "-")}-${packageJson.version}.tgz`;
  const artifactPath = path.join(tarballRoot, artifactName);
  const digest = createHash("sha256")
    .update(readFileSync(artifactPath))
    .digest("hex");
  const packageSpdxId = "SPDXRef-Package";
  const document = {
    spdxVersion: "SPDX-2.3",
    dataLicense: "CC0-1.0",
    SPDXID: "SPDXRef-DOCUMENT",
    name: `${packageJson.name}-${packageJson.version}`,
    documentNamespace:
      `https://github.com/midnightntwrk/midnight-verifiable-credentials/` +
      `sbom/${encodeURIComponent(packageJson.name)}/${packageJson.version}/${digest}`,
    creationInfo: {
      created,
      creators: ["Organization: Midnight Network"],
    },
    packages: [
      {
        name: packageJson.name,
        SPDXID: packageSpdxId,
        versionInfo: packageJson.version,
        packageFileName: artifactName,
        downloadLocation: "NOASSERTION",
        filesAnalyzed: false,
        licenseConcluded: "NOASSERTION",
        licenseDeclared: packageJson.license,
        copyrightText: "NOASSERTION",
        checksums: [
          {
            algorithm: "SHA256",
            checksumValue: digest,
          },
        ],
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: npmPurl(
              packageJson.name,
              packageJson.version,
            ),
          },
          {
            referenceCategory: "OTHER",
            referenceType: "vcs",
            referenceLocator:
              `git+https://github.com/midnightntwrk/midnight-verifiable-credentials.git@${commit}`,
          },
        ],
      },
    ],
    relationships: [
      {
        spdxElementId: "SPDXRef-DOCUMENT",
        relationshipType: "DESCRIBES",
        relatedSpdxElement: packageSpdxId,
      },
    ],
  };

  const outputPath = path.join(
    outputRoot,
    artifactName.replace(/\.tgz$/u, ".spdx.json"),
  );
  writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  process.stdout.write(
    `[generate-release-sbom] ${path.relative(repoRoot, outputPath)}\n`,
  );
}
