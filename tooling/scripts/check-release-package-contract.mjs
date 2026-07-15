#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceCatalog } from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const errors = [];

const assert = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const packageJsonByWorkspace = new Map(
  workspaceCatalog.map((entry) => [
    entry.path,
    readJson(path.join(repoRoot, entry.path, "package.json")),
  ]),
);
const workspaceByPackageName = new Map(
  workspaceCatalog.map((entry) => [
    packageJsonByWorkspace.get(entry.path).name,
    entry,
  ]),
);
const releaseCandidates = workspaceCatalog.filter(
  (entry) => entry.releaseStage === "candidate",
);
const supportedPackages = workspaceCatalog.filter(
  (entry) => entry.releaseStage === "supported",
);
const releaseContract = readFileSync(
  path.join(repoRoot, "docs/architecture/package-release-contract.md"),
  "utf8",
);

const visitExportMap = (value, label, visitor) => {
  if (typeof value === "string") {
    visitor(value, label);
    return;
  }
  assert(isRecord(value), `${label} must be a string or object`);
  if (!isRecord(value)) {
    return;
  }
  for (const [condition, nested] of Object.entries(value)) {
    assert(condition !== "require", `${label} must not declare a CommonJS require condition`);
    visitExportMap(nested, `${label}.${condition}`, visitor);
  }
};

const assertCandidateManifest = (entry) => {
  const packageJson = packageJsonByWorkspace.get(entry.path);
  const label = `${entry.path}/package.json`;

  assert(entry.packageClass === "dist", `${entry.path} release candidate must be a dist package`);
  assert(packageJson.private === true, `${label} must remain private before publication approval`);
  assert(packageJson.publishConfig === undefined, `${label} must not select a registry before publication approval`);
  assert(/^0\.\d+\.\d+(?:[-+].*)?$/u.test(packageJson.version), `${label} must use a pre-1.0 semantic version`);
  assert(typeof packageJson.description === "string" && packageJson.description.length > 0, `${label} must define description`);
  assert(Array.isArray(packageJson.keywords) && packageJson.keywords.length > 0, `${label} must define keywords`);
  assert(isRecord(packageJson.repository), `${label} must define repository metadata`);
  assert(packageJson.repository?.type === "git", `${label} repository.type must be git`);
  assert(
    packageJson.repository?.url ===
      "git+https://github.com/midnightntwrk/midnight-verifiable-credentials.git",
    `${label} repository.url must identify this repository`,
  );
  assert(packageJson.repository?.directory === entry.path, `${label} repository.directory must identify the workspace`);
  assert(Array.isArray(packageJson.sideEffects), `${label} must declare explicit sideEffects metadata`);
  assert(packageJson.type === "module", `${label} must be ESM-only`);
  assert(packageJson.engines?.node === ">=24", `${label} must declare the supported Node engine`);
  assert(packageJson.midnight?.releaseStage === "candidate", `${label} must declare candidate release metadata`);
  assert(packageJson.scripts?.prepack === "pnpm run build", `${label} must build deterministically during prepack`);
  assert(existsSync(path.join(repoRoot, entry.path, "CHANGELOG.md")), `${entry.path} must include CHANGELOG.md`);
  const readmePreamble = readFileSync(
    path.join(repoRoot, entry.path, "README.md"),
    "utf8",
  )
    .split(/\r?\n/u)
    .slice(0, 10)
    .join("\n");
  assert(
    readmePreamble.includes("> Release stage: `candidate`"),
    `${entry.path}/README.md must identify the candidate release stage`,
  );

  const expectedFiles = [
    "dist/**",
    "src/**/*.compact",
    "README.md",
    "CHANGELOG.md",
    "package.json",
  ];
  assert(
    JSON.stringify(packageJson.files) === JSON.stringify(expectedFiles),
    `${label} files must contain only the audited release-candidate surface`,
  );

  assert(isRecord(packageJson.exports), `${label} must define exports`);
  if (isRecord(packageJson.exports)) {
    visitExportMap(packageJson.exports, `${label} exports`, (target, targetLabel) => {
      assert(target.startsWith("./dist/"), `${targetLabel} must point at ./dist/`);
    });
  }
  assert(
    packageJson.exports?.["./credentials.compact"] === "./dist/credentials.compact",
    `${label} must export ./credentials.compact`,
  );
  assert(
    packageJson.exports?.["./credentials/*.compact"] ===
      "./dist/credentials/*.compact",
    `${label} must export audited Compact modules`,
  );

  for (const dependencyType of [
    "dependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    for (const [dependencyName, range] of Object.entries(
      packageJson[dependencyType] ?? {},
    )) {
      assert(
        typeof range === "string" &&
          range !== "*" &&
          /^(?:[~^]|>=|<=|>|<)?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(
            range,
          ) &&
          !/^(?:file|link|workspace|git(?:\+[^:]+)?|https?):/u.test(range),
        `${label} ${dependencyType}.${dependencyName} must use a release-compatible version range`,
      );
      const dependencyWorkspace = workspaceByPackageName.get(dependencyName);
      if (dependencyWorkspace !== undefined) {
        assert(
          dependencyWorkspace.releaseStage !== "internal",
          `${label} cannot release against internal workspace ${dependencyName}`,
        );
      }
    }
  }
};

const tarballName = (packageJson) =>
  `${packageJson.name.slice(1).replace("/", "-")}-${packageJson.version}.tgz`;

const wildcardPattern = (target) => {
  const escaped = target.replace(/[.+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`^${escaped.replaceAll("*", "[^/]+")}$`, "u");
};

const assertCandidateTarball = (entry, tarballDirectory) => {
  const sourcePackageJson = packageJsonByWorkspace.get(entry.path);
  const tarballPath = path.join(tarballDirectory, tarballName(sourcePackageJson));
  const label = path.relative(repoRoot, tarballPath);
  assert(existsSync(tarballPath), `${label} is missing`);
  if (!existsSync(tarballPath)) {
    return;
  }

  const entries = execFileSync("tar", ["-tzf", tarballPath], {
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  const entrySet = new Set(entries);

  for (const entryPath of entries) {
    assert(
      !path.posix.isAbsolute(entryPath) &&
        !entryPath.split("/").includes(".."),
      `${label} contains unsafe path ${entryPath}`,
    );
    const allowed =
      [
        "package/package.json",
        "package/LICENSE",
        "package/README.md",
        "package/CHANGELOG.md",
      ].includes(entryPath) ||
      entryPath.startsWith("package/dist/") ||
      (entryPath.startsWith("package/src/") &&
        (entryPath.endsWith(".compact") || entryPath.endsWith("/")));
    assert(allowed, `${label} contains undeclared release file ${entryPath}`);
  }

  for (const requiredEntry of [
    "package/package.json",
    "package/LICENSE",
    "package/README.md",
    "package/CHANGELOG.md",
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/src/credentials.compact",
  ]) {
    assert(entrySet.has(requiredEntry), `${label} must include ${requiredEntry}`);
  }

  const packedPackageJson = JSON.parse(
    execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], {
      encoding: "utf8",
    }),
  );
  assert(packedPackageJson.name === sourcePackageJson.name, `${label} package name drifted`);
  assert(packedPackageJson.version === sourcePackageJson.version, `${label} package version drifted`);
  assert(packedPackageJson.private === true, `${label} must remain private`);
  assert(packedPackageJson.publishConfig === undefined, `${label} must not select a registry`);

  visitExportMap(packedPackageJson.exports, `${label} exports`, (target, targetLabel) => {
    const packedTarget = `package/${target.slice(2)}`;
    if (packedTarget.includes("*")) {
      const pattern = wildcardPattern(packedTarget);
      assert(
        entries.some((entryPath) => pattern.test(entryPath)),
        `${targetLabel} wildcard has no packaged target`,
      );
    } else {
      assert(entrySet.has(packedTarget), `${targetLabel} target ${packedTarget} is missing`);
    }
  });

  const repeatDirectory = mkdtempSync(
    path.join(os.tmpdir(), "midnight-vc-release-pack-"),
  );
  try {
    const result = spawnSync(
      "pnpm",
      [
        "--dir",
        entry.path,
        "pack",
        "--pack-destination",
        repeatDirectory,
      ],
      {
        cwd: repoRoot,
        shell: process.platform === "win32",
        stdio: "inherit",
      },
    );
    assert(
      result.status === 0,
      `${label} reproducibility pack failed with status ${result.status}`,
    );
    const repeatTarballPath = path.join(
      repeatDirectory,
      tarballName(sourcePackageJson),
    );
    assert(existsSync(repeatTarballPath), `${label} reproducibility pack is missing`);
    if (result.status === 0 && existsSync(repeatTarballPath)) {
      const digest = (filePath) =>
        createHash("sha256").update(readFileSync(filePath)).digest("hex");
      assert(
        digest(tarballPath) === digest(repeatTarballPath),
        `${label} is not byte-for-byte reproducible`,
      );
    }
  } finally {
    rmSync(repeatDirectory, { recursive: true, force: true });
  }
};

assert(releaseCandidates.length > 0, "workspace catalog must declare at least one release candidate");
assert(
  supportedPackages.length === 0,
  "supported packages require an approved registry, provenance, and publication workflow",
);
for (const entry of workspaceCatalog.filter(
  (workspace) => workspace.packageClass === "dist",
)) {
  const packageName = packageJsonByWorkspace.get(entry.path).name;
  assert(
    releaseContract.includes(
      `| \`${packageName}\` | \`${entry.releaseStage}\` |`,
    ),
    `${packageName} must have a synchronized release-stage inventory row`,
  );
}
for (const entry of releaseCandidates) {
  assertCandidateManifest(entry);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  assert(
    args.length === 2 && args[0] === "--tarballs",
    "Usage: check-release-package-contract.mjs [--tarballs <directory>]",
  );
  if (args.length === 2 && args[0] === "--tarballs") {
    const tarballDirectory = path.resolve(repoRoot, args[1]);
    assert(existsSync(tarballDirectory), `${args[1]} tarball directory is missing`);
    if (existsSync(tarballDirectory)) {
      for (const entry of releaseCandidates) {
        assertCandidateTarball(entry, tarballDirectory);
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-release-package-contract] ${error}`);
  }
  process.exit(1);
}

console.log(
  `[check-release-package-contract] Validated ${releaseCandidates.length} release candidate(s).`,
);
