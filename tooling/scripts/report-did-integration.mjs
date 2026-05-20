#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const args = new Set(process.argv.slice(2));
const check = args.has("--check");
const json = args.has("--json");
const siblingDidRoot = path.resolve(repoRoot, "..", "midnight-did");
const didVendorRoot = path.join(repoRoot, "tooling/vendor/midnight-did");
const errors = [];
const warnings = [];
const vendorOnlyDidPackages = new Set([
  // Secret custody moved out of midnight-did with the resolver extraction, but
  // VC standalone fixtures still consume the last packed artifact until the
  // resolver package becomes the distribution source.
  "@midnight-ntwrk/midnight-did-secret-storage",
]);

const readJson = (absolutePath) => JSON.parse(readFileSync(absolutePath, "utf8"));
const npmPackFileName = (packageName, version) =>
  `${packageName.replace(/^@/u, "").replaceAll("/", "-")}-${version}.tgz`;
const gitValue = (args) => {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};

const findPackageJsonFiles = (root) => {
  const results = [];
  const skip = new Set([".git", "node_modules", "dist", "coverage", "reports", "target"]);

  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) {
          walk(absolutePath);
        }
        continue;
      }

      if (entry.isFile() && entry.name === "package.json") {
        results.push(absolutePath);
      }
    }
  };

  walk(root);
  return results.sort();
};

const loadDidPackages = () => {
  const packages = new Map();

  if (!existsSync(path.join(siblingDidRoot, "package.json"))) {
    warnings.push("Sibling midnight-did checkout was not found; using vendor specs only.");
    return packages;
  }

  const rootPackage = readJson(path.join(siblingDidRoot, "package.json"));
  for (const workspacePath of rootPackage.workspaces ?? []) {
    const packageJsonPath = path.join(siblingDidRoot, workspacePath, "package.json");
    if (!existsSync(packageJsonPath)) {
      warnings.push(`DID workspace package is missing package.json: ${workspacePath}`);
      continue;
    }

    const packageJson = readJson(packageJsonPath);
    if (!packageJson.name?.startsWith("@midnight-ntwrk/midnight-did")) {
      continue;
    }

    packages.set(packageJson.name, {
      name: packageJson.name,
      version: packageJson.version,
      path: workspacePath,
      tarball: npmPackFileName(packageJson.name, packageJson.version),
      distIndex: existsSync(path.join(siblingDidRoot, workspacePath, "dist/index.js")),
      managedIndex: existsSync(path.join(siblingDidRoot, workspacePath, "src/managed")),
    });
  }

  return packages;
};

const didPackages = loadDidPackages();
const vendorTarballs = existsSync(didVendorRoot)
  ? readdirSync(didVendorRoot).filter((entry) => entry.endsWith(".tgz")).sort()
  : [];
const references = [];

for (const packageJsonPath of findPackageJsonFiles(repoRoot)) {
  const packageJson = readJson(packageJsonPath);
  const dependencyScopes = [
    packageJson.dependencies ?? {},
    packageJson.devDependencies ?? {},
    packageJson.peerDependencies ?? {},
    packageJson.optionalDependencies ?? {},
  ];

  for (const dependencies of dependencyScopes) {
    for (const [dependencyName, spec] of Object.entries(dependencies)) {
      if (!dependencyName.startsWith("@midnight-ntwrk/midnight-did")) {
        continue;
      }

      if (dependencyName.startsWith("@midnight-ntwrk/midnight-did-credentials")) {
        continue;
      }

      if (
        dependencyName === "@midnight-ntwrk/midnight-did-standalone-environment" ||
        dependencyName === "@midnight-ntwrk/midnight-did-university-protocol" ||
        dependencyName === "@midnight-ntwrk/midnight-did-university-verifier-contract"
      ) {
        continue;
      }

      const consumerPackageJson = path.relative(repoRoot, packageJsonPath).split(path.sep).join("/");
      const didPackage = didPackages.get(dependencyName);
      const expectedTarball = didPackage?.tarball ?? spec.match(/([^/]+\.tgz)$/u)?.[1] ?? null;
      const expectedFileSpec = expectedTarball
        ? `file:${path.relative(path.dirname(packageJsonPath), path.join(didVendorRoot, expectedTarball)).split(path.sep).join("/")}`
        : null;
      const vendorOnly = vendorOnlyDidPackages.has(dependencyName);
      const reference = {
        dependencyName,
        spec,
        expectedFileSpec,
        expectedTarball,
        consumer: packageJson.name ?? consumerPackageJson,
        packageJson: consumerPackageJson,
        vendorOnly,
        siblingPackagePresent: Boolean(didPackage),
        fileSpecMatchesCurrentVersion: expectedFileSpec ? spec === expectedFileSpec : false,
        vendorTarballPresent: expectedTarball ? vendorTarballs.includes(expectedTarball) : false,
      };

      references.push(reference);

      if (!didPackage && didPackages.size > 0 && !vendorOnly) {
        errors.push(`${reference.consumer} references ${dependencyName}, but sibling DID does not provide it`);
      }

      if (spec.startsWith("file:") && expectedFileSpec && !reference.fileSpecMatchesCurrentVersion) {
        errors.push(
          `${reference.consumer} references ${dependencyName} as ${spec}; expected ${expectedFileSpec}`,
        );
      }

      if (spec.startsWith("file:") && expectedTarball && !reference.vendorTarballPresent) {
        errors.push(
          `${reference.consumer} references ${dependencyName}, but vendor tarball is missing: ${expectedTarball}`,
        );
      }
    }
  }
}

const report = {
  repository: "midnight-verifiable-credentials",
  generatedAt: new Date().toISOString(),
  git: {
    branch: gitValue(["branch", "--show-current"]),
    commit: gitValue(["rev-parse", "--short", "HEAD"]),
  },
  siblingDid: {
    path: siblingDidRoot,
    present: didPackages.size > 0,
    packages: [...didPackages.values()].sort((a, b) => a.name.localeCompare(b.name)),
  },
  vendor: {
    path: didVendorRoot,
    tarballs: vendorTarballs,
  },
  references: references.sort((a, b) =>
    `${a.consumer}:${a.dependencyName}`.localeCompare(`${b.consumer}:${b.dependencyName}`),
  ),
  errors,
  warnings,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("# VC DID Integration Report");
  console.log(`Repository: ${report.repository}`);
  console.log(`Branch: ${report.git.branch ?? "unknown"}`);
  console.log(`Commit: ${report.git.commit ?? "unknown"}`);
  console.log("");
  console.log("## Sibling DID Packages");
  if (report.siblingDid.packages.length === 0) {
    console.log("- sibling DID checkout not found");
  } else {
    for (const didPackage of report.siblingDid.packages) {
      console.log(
        `- ${didPackage.name}@${didPackage.version} (${didPackage.path}) dist=${didPackage.distIndex ? "yes" : "no"} managed=${didPackage.managedIndex ? "yes" : "no"}`,
      );
    }
  }

  console.log("");
  console.log("## DID Vendor References");
  if (report.references.length === 0) {
    console.log("- no DID package references found");
  } else {
    for (const reference of report.references) {
      console.log(
        `- ${reference.consumer}: ${reference.dependencyName} -> ${reference.spec} vendor=${reference.vendorTarballPresent ? "yes" : "no"}`,
      );
    }
  }

  if (warnings.length > 0) {
    console.log("");
    console.log("## Warnings");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.log("");
    console.log("## Errors");
    for (const error of errors) {
      console.log(`- ${error}`);
    }
  }
}

if (check && errors.length > 0) {
  process.exit(1);
}
