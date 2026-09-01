#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  releaseCandidateFiles,
  workspaceCatalog,
} from "./workspace-catalog.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const pnpmInvocation = (args) => {
  if (process.platform !== "win32") {
    return { command: "pnpm", args };
  }
  if (!process.env.npm_execpath) {
    throw new Error("Windows release checks must be invoked through pnpm");
  }
  return {
    command: process.execPath,
    args: [process.env.npm_execpath, ...args],
  };
};
const errors = [];
const installLifecycleHooks = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
];

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
const releasePackages = workspaceCatalog.filter(
  (entry) => entry.releaseStage !== "internal",
);
const releaseContract = readFileSync(
  path.join(repoRoot, "docs/architecture/package-release-contract.md"),
  "utf8",
);

const compactSourcePaths = (entry) => {
  const packageRoot = path.join(repoRoot, entry.path);
  const srcRoot = path.join(packageRoot, "src");
  if (!existsSync(srcRoot)) {
    return [];
  }

  const sources = [];
  const stack = [srcRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const child of readdirSync(current)) {
      const childPath = path.join(current, child);
      if (statSync(childPath).isDirectory()) {
        stack.push(childPath);
      } else if (child.endsWith(".compact")) {
        sources.push(
          path.relative(packageRoot, childPath).split(path.sep).join("/"),
        );
      }
    }
  }

  return sources.sort();
};

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

const assertReleaseManifest = (entry) => {
  const packageJson = packageJsonByWorkspace.get(entry.path);
  const label = `${entry.path}/package.json`;
  const compactSources = compactSourcePaths(entry);
  const isSupported = entry.releaseStage === "supported";

  assert(entry.packageClass === "dist", `${entry.path} release package must be a dist package`);
  assert(
    packageJson.private === !isSupported,
    `${label} private must match release stage ${entry.releaseStage}`,
  );
  if (isSupported) {
    assert(
      packageJson.publishConfig?.access === "public",
      `${label} supported package must publish with public access`,
    );
    assert(
      packageJson.publishConfig?.registry === "https://registry.npmjs.org/",
      `${label} supported package must select the npmjs registry`,
    );
    assert(
      packageJson.publishConfig?.provenance === true,
      `${label} supported package must require npm provenance`,
    );
  } else {
    assert(
      packageJson.publishConfig === undefined,
      `${label} candidate must not select a registry before publication approval`,
    );
  }
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
  for (const field of ["main", "module", "types"]) {
    assert(
      typeof packageJson[field] === "string" &&
        packageJson[field].replace(/^\.\//u, "").startsWith("dist/"),
      `${label} ${field} must point at dist/`,
    );
  }
  assert(packageJson.engines?.node === ">=24", `${label} must declare the supported Node engine`);
  assert(
    packageJson.midnight?.releaseStage === entry.releaseStage,
    `${label} must declare ${entry.releaseStage} release metadata`,
  );
  assert(packageJson.scripts?.prepack === "pnpm run build", `${label} must build deterministically during prepack`);
  for (const lifecycleHook of installLifecycleHooks) {
    assert(
      packageJson.scripts?.[lifecycleHook] === undefined,
      `${label} must not run ${lifecycleHook} in a consumer install`,
    );
  }
  assert(
    typeof entry.consumerFixture === "string" && entry.consumerFixture.length > 0,
    `${entry.path} must declare a clean-consumer fixture`,
  );
  assert(existsSync(path.join(repoRoot, entry.path, "CHANGELOG.md")), `${entry.path} must include CHANGELOG.md`);
  const readmePreamble = readFileSync(
    path.join(repoRoot, entry.path, "README.md"),
    "utf8",
  )
    .split(/\r?\n/u)
    .slice(0, 10)
    .join("\n");
  assert(
    readmePreamble.includes(`> Release stage: \`${entry.releaseStage}\``),
    `${entry.path}/README.md must identify the ${entry.releaseStage} release stage`,
  );

  const expectedFiles = releaseCandidateFiles(compactSources.length > 0);
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
  if (compactSources.length > 0 && isRecord(packageJson.exports)) {
    const compactExports = Object.entries(packageJson.exports).filter(
      ([subpath, target]) =>
        subpath.endsWith(".compact") &&
        typeof target === "string" &&
        target.endsWith(".compact"),
    );
    assert(
      compactExports.length > 0,
      `${label} must expose at least one explicit Compact export`,
    );
  }

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

const wildcardMatches = (target, value) => {
  const segments = target.split("*");
  if (segments.length === 1) return target === value;
  if (!value.startsWith(segments[0])) return false;
  let cursor = segments[0].length;
  for (const segment of segments.slice(1, -1)) {
    if (segment.length === 0) {
      if (value[cursor] === undefined || value[cursor] === "/") return false;
      cursor += 1;
      continue;
    }
    const next = value.indexOf(segment, cursor + 1);
    if (next < 0 || value.slice(cursor, next).includes("/")) return false;
    cursor = next + segment.length;
  }
  const suffix = segments.at(-1);
  if (!value.endsWith(suffix)) return false;
  const suffixStart = value.length - suffix.length;
  return suffixStart >= cursor + 1 && !value.slice(cursor, suffixStart).includes("/");
};

const assertReleaseTarball = (entry, tarballDirectory) => {
  const sourcePackageJson = packageJsonByWorkspace.get(entry.path);
  const compactSources = compactSourcePaths(entry);
  const declaredCompactSources = entry.path === "packages/core/compact"
    ? new Set(sourcePackageJson.midnight?.compactSources ?? [])
    : null;
  if (declaredCompactSources) {
    assert(
      declaredCompactSources.size === compactSources.length &&
        compactSources.every((sourcePath) => declaredCompactSources.has(sourcePath)),
      `${entry.path} compactSources metadata must exactly match tracked Compact sources`,
    );
  }
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
  const forbiddenCandidateArtifact = /(?:verification-v1|passport|birth|university|proving|verifying|zkir|bzkir|deployment|wallet|signing|seed|secret|witness|credential-secret|private-key)/iu;
  const forbiddenGeneratedContent = [
    /verification[-_]v1/iu,
    /(?:birth|university|passport|family(?:claim|predicate|credential))/iu,
    /\b(?:statusRegistryAuthority|statusRegistryRoot|mutateStatusRegistry|updateStatusRegistry|statusRegistryWitness)\b/iu,
    /(?:proving|verification)[_-]?(?:key|artifact|circuit)/iu,
    /(?:deployment|wallet|signing|private[_-]?key|secret[_-]?(?:key|material|value)|witness[_-]?(?:value|secret|material))/iu,
    /\.(?:zkir|bzkir|prover|wasm|pk|vk)$/iu,
  ];
  const stripComments = (text) => text
    .replace(/\/\*[\s\S]*?\*\//gu, "")
    .replace(/(^|\s)\/\/.*$/gmu, "$1");

  for (const entryPath of entries) {
    if (entry.path === "packages/core/compact") {
      assert(!forbiddenCandidateArtifact.test(entryPath), `${label} contains forbidden candidate artifact ${entryPath}`);
    }
    assert(
      !path.posix.isAbsolute(entryPath) &&
        !entryPath.split("/").includes(".."),
      `${label} contains unsafe path ${entryPath}`,
    );
    // pnpm pack emits files but no bare package/ directory entry.
    const isCandidateCompact = entry.path === "packages/core/compact";
    const isPackageSource = entryPath.startsWith("package/src/") && entryPath.endsWith(".compact");
    const isDistPath = entryPath.startsWith("package/dist/");
    const isDeclaredSource = isCandidateCompact && isPackageSource &&
      declaredCompactSources.has(entryPath.slice("package/".length));
    const allowed =
      [
        "package/package.json",
        "package/LICENSE",
        "package/README.md",
        "package/CHANGELOG.md",
      ].includes(entryPath) ||
      isDistPath ||
      isDeclaredSource ||
      (entryPath.startsWith("package/src/") && !isCandidateCompact);
    assert(allowed, `${label} contains undeclared release file ${entryPath}`);
    if (isCandidateCompact && isPackageSource) {
      const sourcePath = entryPath.slice("package/".length);
      assert(
        declaredCompactSources.has(sourcePath),
        `${label} contains undeclared Compact source ${entryPath}`,
      );
    }
    if (isCandidateCompact && isDistPath) {
      const relative = entryPath.slice("package/dist/".length);
      const generatedOutputAllowlist = new Set([
        "compact-build.json",
        "compact-value-codec.d.ts",
        "compact-value-codec.d.ts.map",
        "compact-value-codec.js",
        "compact-value-codec.js.map",
        "contract.d.ts",
        "contract.d.ts.map",
        "contract.js",
        "contract.js.map",
        "index.d.ts",
        "index.d.ts.map",
        "index.js",
        "index.js.map",
        "jubjub.d.ts",
        "jubjub.d.ts.map",
        "jubjub.js",
        "jubjub.js.map",
        "holder-binding/same-holder.d.ts",
        "holder-binding/same-holder.d.ts.map",
        "holder-binding/same-holder.js",
        "holder-binding/same-holder.js.map",
        "managed/credentials/contract/index.d.ts",
        "managed/credentials/contract/index.js",
        "managed/credentials/contract/index.js.map",
        "managed/same-holder/contract/index.d.ts",
        "managed/same-holder/contract/index.js",
        "managed/same-holder/contract/index.js.map",
      ]);
      const compactDistSources = new Set(
        [...declaredCompactSources].map((sourcePath) => sourcePath.replace(/^src\//u, "")),
      );
      const generatedAllowed = relative.endsWith("/") ||
        generatedOutputAllowlist.has(relative) ||
        compactDistSources.has(relative);
      assert(generatedAllowed, `${label} contains undeclared generated output ${entryPath}`);
    }
    if (isCandidateCompact && (isPackageSource || (isDistPath && !entryPath.endsWith("/")))) {
      const content = execFileSync("tar", ["-xOf", tarballPath, entryPath], { encoding: "utf8" });
      const executableContent = stripComments(content);
      for (const pattern of forbiddenGeneratedContent) {
        assert(!pattern.test(executableContent), `${label} contains forbidden generated content ${pattern} in ${entryPath}`);
      }
    }
  }

  const declaredPackageEntries = [
    sourcePackageJson.main,
    sourcePackageJson.types,
  ]
    .filter((entryPath) => typeof entryPath === "string")
    .map((entryPath) => `package/${entryPath.replace(/^\.\//u, "")}`);
  for (const requiredEntry of [
    "package/package.json",
    "package/LICENSE",
    "package/README.md",
    "package/CHANGELOG.md",
    ...declaredPackageEntries,
    ...compactSources.map((sourcePath) => `package/${sourcePath}`),
  ]) {
    assert(entrySet.has(requiredEntry), `${label} must include ${requiredEntry}`);
  }

  const packedPackageJson = JSON.parse(
    execFileSync("tar", ["-xOf", tarballPath, "package/package.json"], {
      encoding: "utf8",
    }),
  );
  assert(packedPackageJson.name === sourcePackageJson.name, `${label} package name drifted`);
  if (entry.path === "packages/core/compact") {
    assert(packedPackageJson.private === false, `${label} supported package must be public`);
    assert(packedPackageJson.midnight?.releaseStage === "supported", `${label} must be supported`);
  }
  assert(packedPackageJson.version === sourcePackageJson.version, `${label} package version drifted`);
  assert(
    packedPackageJson.private === (entry.releaseStage !== "supported"),
    `${label} private must match release stage ${entry.releaseStage}`,
  );
  if (entry.releaseStage === "supported") {
    assert(
      packedPackageJson.publishConfig?.access === "public",
      `${label} must retain public npm access`,
    );
    assert(
      packedPackageJson.publishConfig?.registry ===
        "https://registry.npmjs.org/",
      `${label} must retain the npmjs registry`,
    );
    assert(
      packedPackageJson.publishConfig?.provenance === true,
      `${label} must retain npm provenance`,
    );
  } else {
    assert(
      packedPackageJson.publishConfig === undefined,
      `${label} candidate must not select a registry`,
    );
  }
  for (const lifecycleHook of installLifecycleHooks) {
    assert(
      packedPackageJson.scripts?.[lifecycleHook] === undefined,
      `${label} must not run ${lifecycleHook} in a consumer install`,
    );
  }

  visitExportMap(packedPackageJson.exports, `${label} exports`, (target, targetLabel) => {
    const packedTarget = `package/${target.slice(2)}`;
    if (packedTarget.includes("*")) {
      const pattern = (entryPath) => wildcardMatches(packedTarget, entryPath);
      assert(
        entries.some((entryPath) => pattern(entryPath)),
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
    const invocation = pnpmInvocation([
      "--dir",
      entry.path,
      "pack",
      "--pack-destination",
      repeatDirectory,
    ]);
    const result = spawnSync(invocation.command, invocation.args, {
      cwd: repoRoot,
      stdio: "inherit",
    });
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

assert(
  releasePackages.length > 0,
  "workspace catalog must declare at least one candidate or supported package",
);
assert(
  supportedPackages.length > 0,
  "registry enablement must declare at least one supported package",
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
for (const entry of releasePackages) {
  assertReleaseManifest(entry);
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
      for (const entry of releasePackages) {
        assertReleaseTarball(entry, tarballDirectory);
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
  `[check-release-package-contract] Validated ${releaseCandidates.length} candidate(s) and ${supportedPackages.length} supported package(s).`,
);
