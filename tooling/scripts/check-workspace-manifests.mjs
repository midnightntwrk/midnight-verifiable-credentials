#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  allowedMaturityValues,
  allowedPackageClasses,
  allowedReleaseStages,
  workspaceCatalog,
  workspaceCatalogByPath,
} from "./workspace-catalog.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const errors = [];

const workspacesByPackageClass = (packageClass) =>
  new Set(
    workspaceCatalog
      .filter((entry) => entry.packageClass === packageClass)
      .map((entry) => entry.path),
  );

const sourceOnlyWorkspaces = workspacesByPackageClass("source-only");
const scenarioWorkspaces = workspacesByPackageClass("scenario");

const requiredDistFiles = [
  "dist/**",
  "README.md",
  "package.json",
  "tsconfig.json",
  "tsconfig.build.json",
];

const readJson = (relativePath) =>
  JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));

const assert = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const assertArrayIncludes = (array, expected, label) => {
  assert(Array.isArray(array), `${label} must be an array`);
  if (Array.isArray(array)) {
    assert(array.includes(expected), `${label} must include ${expected}`);
  }
};

const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);

const hasCompactSources = (workspace) => {
  const srcRoot = path.join(repoRoot, workspace, "src");
  if (!existsSync(srcRoot)) {
    return false;
  }

  const stack = [srcRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const entryPath = path.join(current, entry);
      const stats = statSync(entryPath);
      if (stats.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.endsWith(".compact")) {
        return true;
      }
    }
  }

  return false;
};

const assertDistExportLeaf = (value, label) => {
  assert(typeof value === "string", `${label} must be a string`);
  if (typeof value !== "string") {
    return;
  }

  assert(value.startsWith("./dist/"), `${label} must point at ./dist/`);
};

const assertDistExportMap = (value, label) => {
  if (typeof value === "string") {
    assertDistExportLeaf(value, label);
    return;
  }

  assert(isRecord(value), `${label} must be a string or object export`);
  if (!isRecord(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    assertDistExportMap(nestedValue, `${label}.${key}`);
  }
};

const assertTypesVersionsDistPaths = (value, label) => {
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      assert(typeof entry === "string", `${label}[${index}] must be a string`);
      if (typeof entry === "string") {
        assert(entry.startsWith("dist/"), `${label}[${index}] must point at dist/`);
      }
    }
    return;
  }

  assert(isRecord(value), `${label} must be an object or string array`);
  if (!isRecord(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    assertTypesVersionsDistPaths(nestedValue, `${label}.${key}`);
  }
};

const assertNoPublicEntrypoint = (packageJson, workspace) => {
  for (const field of ["main", "module", "types", "exports", "files"]) {
    assert(
      packageJson[field] === undefined,
      `${workspace} must not define ${field}; scenario packages are executable harnesses`,
    );
  }
};

const assertMaturityMetadata = (packageJson, workspace) => {
  const expected = workspaceCatalogByPath.get(workspace);
  assert(expected !== undefined, `${workspace} must have a checked maturity policy`);
  if (expected === undefined) {
    return;
  }
  assert(
    allowedMaturityValues.has(expected.maturity),
    `${workspace} maturity policy uses unsupported value: ${expected.maturity}`,
  );
  assert(
    allowedPackageClasses.has(expected.packageClass),
    `${workspace} package class policy uses unsupported value: ${expected.packageClass}`,
  );
  assert(
    allowedReleaseStages.has(expected.releaseStage),
    `${workspace} release policy uses unsupported value: ${expected.releaseStage}`,
  );

  assert(isRecord(packageJson.midnight), `${workspace} must define midnight metadata`);
  if (!isRecord(packageJson.midnight)) {
    return;
  }

  assert(
    allowedMaturityValues.has(packageJson.midnight.maturity),
    `${workspace} midnight.maturity uses unsupported value: ${packageJson.midnight.maturity}`,
  );
  assert(
    allowedPackageClasses.has(packageJson.midnight.packageClass),
    `${workspace} midnight.packageClass uses unsupported value: ${packageJson.midnight.packageClass}`,
  );
  assert(
    packageJson.midnight.maturity === expected.maturity,
    `${workspace} midnight.maturity must be ${expected.maturity}`,
  );
  assert(
    packageJson.midnight.packageClass === expected.packageClass,
    `${workspace} midnight.packageClass must be ${expected.packageClass}`,
  );
  assert(
    (packageJson.midnight.releaseStage ?? "internal") === expected.releaseStage,
    `${workspace} midnight.releaseStage must be ${expected.releaseStage}`,
  );

  const readmePath = path.join(repoRoot, workspace, "README.md");
  assert(existsSync(readmePath), `${workspace} must include README.md with maturity tags`);
  if (!existsSync(readmePath)) {
    return;
  }

  const readmePreamble = readFileSync(readmePath, "utf8")
    .split(/\r?\n/u)
    .slice(0, 8)
    .join("\n");
  assert(
    readmePreamble.includes(`> Maturity: \`${expected.maturity}\``),
    `${workspace} README.md must include maturity tag ${expected.maturity}`,
  );
  assert(
    readmePreamble.includes(`> Package class: \`${expected.packageClass}\``),
    `${workspace} README.md must include package class tag ${expected.packageClass}`,
  );
};

const assertRootExport = (packageJson, workspace) => {
  const rootExport = packageJson.exports?.["."];
  assert(
    isRecord(rootExport),
    `${workspace} must define exports["."]`,
  );

  if (!isRecord(rootExport)) {
    return;
  }

  for (const key of ["types", "import", "default"]) {
    assert(
      typeof rootExport[key] === "string" && rootExport[key].length > 0,
      `${workspace} exports["."] must define ${key}`,
    );
  }
};

const assertDistEntrypoints = (packageJson, workspace) => {
  assertRootExport(packageJson, workspace);
  assert(isRecord(packageJson.exports), `${workspace} exports must be an object`);
  if (isRecord(packageJson.exports)) {
    for (const [subpath, exportValue] of Object.entries(packageJson.exports)) {
      assertDistExportMap(exportValue, `${workspace} exports[${JSON.stringify(subpath)}]`);
    }
  }

  if (packageJson.typesVersions !== undefined) {
    assertTypesVersionsDistPaths(packageJson.typesVersions, `${workspace} typesVersions`);
  }
};

const assertDistPackage = (packageJson, workspace) => {
  const releaseStage = workspaceCatalogByPath.get(workspace).releaseStage;
  assert(packageJson.license === "Apache-2.0", `${workspace} must declare Apache-2.0 license`);
  assert(
    packageJson.private === (releaseStage !== "supported"),
    `${workspace} private must match release stage ${releaseStage}`,
  );
  assert(packageJson.type === "module", `${workspace} must be an ESM package`);
  assert(packageJson.main === "dist/index.js", `${workspace} main must be dist/index.js`);
  assert(packageJson.module === "dist/index.js", `${workspace} module must be dist/index.js`);
  assert(packageJson.types === "./dist/index.d.ts", `${workspace} types must be ./dist/index.d.ts`);
  assertDistEntrypoints(packageJson, workspace);

  const requiredFiles =
    releaseStage === "internal"
      ? requiredDistFiles
      : ["dist/**", "README.md", "CHANGELOG.md", "package.json"];
  for (const fileEntry of requiredFiles) {
    assertArrayIncludes(packageJson.files, fileEntry, `${workspace} files`);
  }

  if (hasCompactSources(workspace)) {
    assertArrayIncludes(packageJson.files, "src/**/*.compact", `${workspace} files`);
  }
};

const assertSourceOnlyPackage = (packageJson, workspace) => {
  // Private source-only harnesses expose TypeScript sources to workspace tests;
  // they must not look like publishable dist-backed packages.
  const forbiddenPublishHooks = [
    "prepack",
    "prepare",
    "prepublish",
    "prepublishOnly",
  ];

  assert(packageJson.license === "Apache-2.0", `${workspace} must declare Apache-2.0 license`);
  assert(packageJson.private === true, `${workspace} must remain private`);
  assert(packageJson.type === "module", `${workspace} must be an ESM package`);
  assert(packageJson.main === "src/index.ts", `${workspace} main must point to its source entrypoint`);
  assert(packageJson.module === undefined, `${workspace} must not define module`);
  assert(packageJson.types === undefined, `${workspace} must not define types`);
  assert(packageJson.exports === undefined, `${workspace} must not expose a dist export map`);
  for (const hook of forbiddenPublishHooks) {
    assert(
      packageJson.scripts?.[hook] === undefined,
      `${workspace} must not define ${hook}; source-only integration harnesses are not packed for distribution`,
    );
  }
  assertArrayIncludes(packageJson.files, "src/**/*.ts", `${workspace} files`);
  assertArrayIncludes(packageJson.files, "README.md", `${workspace} files`);
  assertArrayIncludes(packageJson.files, "package.json", `${workspace} files`);
  assertArrayIncludes(packageJson.files, "tsconfig.json", `${workspace} files`);
  assert(
    !packageJson.files?.some((entry) => /^\.?\/?dist(?:\/|$|\*)/u.test(entry)),
    `${workspace} files must not include dist outputs`,
  );
};

const assertScenarioPackage = (packageJson, workspace) => {
  assert(packageJson.license === "Apache-2.0", `${workspace} must declare Apache-2.0 license`);
  assert(packageJson.private === true, `${workspace} must remain private`);
  assert(packageJson.type === "module", `${workspace} must be an ESM package`);
  assert(packageJson.engines?.node === ">=24", `${workspace} must declare Node 24 engine`);
  assert(packageJson.engines?.pnpm === ">=10", `${workspace} must declare pnpm 10 engine`);
  assertNoPublicEntrypoint(packageJson, workspace);
};

const rootPackage = readJson("package.json");
const workspaces = rootPackage.workspaces ?? [];
assert(Array.isArray(workspaces), "root package.json workspaces must be an array");
assert(
  rootPackage.scripts?.["check:workspace-manifests"] ===
    "node ./tooling/scripts/check-workspace-manifests.mjs",
  "root package.json must expose check:workspace-manifests",
);
assert(
  rootPackage.scripts?.["ci:lint"]?.includes("pnpm run check:workspace-manifests"),
  "ci:lint must run check:workspace-manifests",
);
assert(
  workspaceCatalog.length === workspaces.length,
  "workspace maturity policy must classify every root workspace",
);
for (const { path: workspace } of workspaceCatalog) {
  assert(
    workspaces.includes(workspace),
    `workspace maturity policy references unknown workspace: ${workspace}`,
  );
}

for (const workspace of workspaces) {
  const packageJsonPath = path.join(workspace, "package.json");
  assert(existsSync(path.join(repoRoot, packageJsonPath)), `${workspace} is missing package.json`);

  if (!existsSync(path.join(repoRoot, packageJsonPath))) {
    continue;
  }

  const packageJson = readJson(packageJsonPath);
  assertMaturityMetadata(packageJson, workspace);

  if (scenarioWorkspaces.has(workspace)) {
    assertScenarioPackage(packageJson, workspace);
  } else if (sourceOnlyWorkspaces.has(workspace)) {
    assertSourceOnlyPackage(packageJson, workspace);
  } else {
    assertDistPackage(packageJson, workspace);
  }
}

const docsIndex = readFileSync(path.join(repoRoot, "docs/README.md"), "utf8");
assert(
  docsIndex.includes("architecture/workspace-package-manifest-discipline.md"),
  "docs/README.md must link workspace package-manifest discipline",
);

const readme = readFileSync(path.join(repoRoot, "README.md"), "utf8");
assert(
  readme.includes("docs/architecture/workspace-package-manifest-discipline.md"),
  "README.md must link workspace package-manifest discipline",
);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[check-workspace-manifests] ${error}`);
  }
  process.exit(1);
}

console.log("[check-workspace-manifests] Workspace package manifests are aligned.");
