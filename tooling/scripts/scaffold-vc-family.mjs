import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");

const usage = `Usage:
  node ./tooling/scripts/scaffold-vc-family.mjs --slug my-family [--out credentials-my-family] [--holder explicit|hidden]

Behavior:
  - generates a minimal repo-aligned family package scaffold
  - requires the output directory to stay inside the current VC repository
  - does not add the package to root workspaces automatically
  - does not overwrite an existing directory
`;

const parseArgs = (argv) => {
  const args = {
    holder: "explicit",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];
    switch (current) {
      case "--slug":
        args.slug = next;
        index += 1;
        break;
      case "--out":
        args.out = next;
        index += 1;
        break;
      case "--holder":
        args.holder = next;
        index += 1;
        break;
      case "--help":
      case "-h":
        console.log(usage);
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${current}`);
    }
  }

  if (!args.slug) {
    throw new Error("--slug is required");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.slug)) {
    throw new Error("--slug must be kebab-case");
  }
  if (!["explicit", "hidden"].includes(args.holder)) {
    throw new Error("--holder must be either 'explicit' or 'hidden'");
  }

  return args;
};

const toPascalCase = (value) =>
  value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");

const buildFiles = ({
  packageDirName,
  packageName,
  familyStem,
  familyDirName,
  familyPascal,
  holder,
}) => {
  const holderLine =
    holder === "hidden"
      ? "Status: starter scaffold for a hidden-holder family package."
      : "Status: starter scaffold for an explicit-holder family package.";

  return new Map([
    [
      "README.md",
      `# ${packageDirName}

${holderLine}

Purpose:

- give engineers a real package skeleton instead of another blank folder
- keep naming, scripts, and directory layout aligned with the VC repository
- make the next customization steps explicit

Generated shape:

\`\`\`text
${packageDirName}/
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── scripts/
│   ├── align-runtime-version.mjs
│   ├── ensure-compact-package-aliases.mjs
│   ├── find-repo-root.mjs
│   └── strip-managed-sourcemaps.mjs
└── src/
    ├── ${familyStem}.compact
    ├── index.ts
    ├── ${familyDirName}/
    │   ├── claims.compact
    │   ├── model.compact
    │   ├── requests.compact
    │   └── validation.compact
    └── test/
        ├── capability-profiles.test.ts
        └── protocol.test.ts
\`\`\`

Next steps:

1. rename placeholder claims, requests, and result structs to match the real schema
2. replace the placeholder validation circuit with family-specific verification logic
3. decide whether this family is explicit-holder or hidden-holder in actual proof semantics
4. wire the package into the root workspace only after the scaffold has a real owner and validation path
`,
    ],
    [
      "package.json",
      JSON.stringify(
        {
          name: packageName,
          version: "0.1.0",
          license: "Apache-2.0",
          private: true,
          type: "module",
          engines: {
            node: ">=24",
            npm: ">=10",
          },
          main: "dist/index.js",
          module: "dist/index.js",
          types: "./dist/index.d.ts",
          exports: {
            ".": {
              types: "./dist/index.d.ts",
              require: "./dist/index.js",
              import: "./dist/index.js",
              default: "./dist/index.js",
            },
            [`./managed/${familyStem}/contract/index.js`]: {
              types: `./dist/managed/${familyStem}/contract/index.d.ts`,
              import: `./dist/managed/${familyStem}/contract/index.js`,
              default: `./dist/managed/${familyStem}/contract/index.js`,
            },
          },
          typesVersions: {
            "*": {
              [`managed/${familyStem}/contract/index.js`]: [
                `dist/managed/${familyStem}/contract/index.d.ts`,
              ],
            },
          },
          scripts: {
            contract: "npm run compact",
            compact: `node ./scripts/ensure-compact-package-aliases.mjs && compact compile src/${familyStem}.compact src/managed/${familyStem} && node ./scripts/align-runtime-version.mjs && node ./scripts/strip-managed-sourcemaps.mjs`,
            test: "vitest run",
            "test:ci": "vitest run",
            prepack: "npm run build",
            clean: "rm -rf dist && rm -rf coverage && rm -rf reports && rm -rf src/managed",
            build: `npm run compact && rm -rf dist && tsc -b tsconfig.build.json --force && mkdir -p dist && cp -Rf ./src/managed ./dist/ && cp ./src/${familyStem}.compact ./dist && cp -Rf ./src/${familyDirName} ./dist/`,
            lint: "eslint src --ignore-pattern 'src/managed/**'",
            "lint:fix": "eslint src --fix --ignore-pattern 'src/managed/**'",
            typecheck: "npm run compact && tsc -p tsconfig.json --noEmit",
            all: "npm run compact && npm run build && npm run test:ci",
          },
          dependencies: {
            "@midnight-ntwrk/compact-runtime": "*",
            "@midnight-ntwrk/midnight-did-credentials": "*",
          },
          files: [
            "dist/**",
            "src/**/*.compact",
            "README.md",
            "scripts/*.mjs",
            "package.json",
            "tsconfig.json",
            "tsconfig.build.json",
          ],
        },
        null,
        2,
      ) + "\n",
    ],
    [
      "tsconfig.json",
      `{
  "include": ["src/**/*.ts"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "lib": ["ESNext"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strict": true,
    "isolatedModules": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
`,
    ],
    [
      "tsconfig.build.json",
      `{
  "extends": "./tsconfig.json",
  "exclude": ["src/test/**/*.ts"],
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true,
    "declarationMap": true
  }
}
`,
    ],
    [
      "scripts/find-repo-root.mjs",
      `import { readFile } from "node:fs/promises";
import path from "node:path";

export const findRepoRoot = async (startDir) => {
  let currentDir = startDir;

  while (true) {
    const packageJsonPath = path.join(currentDir, "package.json");
    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
      if (Array.isArray(packageJson.workspaces)) {
        return currentDir;
      }
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
        throw error;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error("Could not locate the Midnight VC repository root");
    }
    currentDir = parentDir;
  }
};
`,
    ],
    [
      "scripts/ensure-compact-package-aliases.mjs",
      `import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { findRepoRoot } from "./find-repo-root.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = await findRepoRoot(packageRoot);
const helperPath = path.join(
  repoRoot,
  "tooling",
  "scripts",
  "ensure-compact-package-aliases.mjs",
);

await import(pathToFileURL(helperPath).href);
`,
    ],
    [
      "scripts/align-runtime-version.mjs",
      `import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { findRepoRoot } from "./find-repo-root.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = await findRepoRoot(packageRoot);
const runtimePackage = JSON.parse(
  await readFile(
    path.join(
      repoRoot,
      "node_modules",
      "@midnight-ntwrk",
      "compact-runtime",
      "package.json",
    ),
    "utf8",
  ),
);
const runtimeVersion = runtimePackage.version;
const targetFile = path.join(
  packageRoot,
  "src",
  "managed",
  "${familyStem}",
  "contract",
  "index.js",
);
const source = await readFile(targetFile, "utf8");
const next = source.replace(
  /checkRuntimeVersion\\('\\d+\\.\\d+\\.\\d+'\\);/,
  \`checkRuntimeVersion('\${runtimeVersion}');\`,
);
if (next !== source) {
  await writeFile(targetFile, next, "utf8");
}
`,
    ],
    [
      "scripts/strip-managed-sourcemaps.mjs",
      `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const managedDir = path.resolve(rootDir, "..", "src", "managed");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const next = content.replace(/\\n\\/\\/# sourceMappingURL=.*$/m, "");
    if (next !== content) {
      fs.writeFileSync(fullPath, next, "utf8");
    }
  }
}

if (fs.existsSync(managedDir)) {
  walk(managedDir);
}
`,
    ],
    [
      `src/${familyStem}.compact`,
      `pragma language_version >= 0.20;

import CompactStandardLibrary;

import "./${familyDirName}/requests" prefix Requests_;
import "./${familyDirName}/validation" prefix Validation_;

export circuit verify${familyPascal}PresentationForRequest(
  request: Requests_${familyPascal}VerificationRequest,
  submission: Requests_${familyPascal}VerificationSubmission,
): Validation_${familyPascal}VerificationResult {
  return Validation_verify${familyPascal}PresentationForRequest(
    request,
    submission,
  );
}
`,
    ],
    [
      `src/${familyDirName}/claims.compact`,
      `export struct ${familyPascal}Claims {
  placeholderCommitment: Bytes<32>,
}

export circuit ${familyPascal.charAt(0).toLowerCase() + familyPascal.slice(1)}ClaimRoot(
  claims: ${familyPascal}Claims
): Bytes<32> {
  return persistentHash<${familyPascal}Claims>(claims);
}
`,
    ],
    [
      `src/${familyDirName}/model.compact`,
      `export struct ${familyPascal}Credential {
  claims: ${familyPascal}Claims,
}

export struct ${familyPascal}Presentation {
  credentialRoot: Bytes<32>,
}
`,
    ],
    [
      `src/${familyDirName}/requests.compact`,
      `export struct ${familyPascal}VerificationRequest {
  verifierChallengeHash: Bytes<32>,
}

export struct ${familyPascal}VerificationSubmission {
  credential: ${familyPascal}Credential,
  presentation: ${familyPascal}Presentation,
}
`,
    ],
    [
      `src/${familyDirName}/validation.compact`,
      `export struct ${familyPascal}VerificationResult {
  approved: Boolean,
}

export circuit verify${familyPascal}PresentationForRequest(
  request: ${familyPascal}VerificationRequest,
  submission: ${familyPascal}VerificationSubmission,
): ${familyPascal}VerificationResult {
  assert(
    request.verifierChallengeHash != pad(32, ""),
    "${familyPascal} verification request challenge must be set"
  );
  assert(
    submission.presentation.credentialRoot
      == ${familyPascal.charAt(0).toLowerCase() + familyPascal.slice(1)}ClaimRoot(submission.credential.claims),
    "${familyPascal} presentation root does not match the credential claims"
  );
  return ${familyPascal}VerificationResult {
    approved: true,
  };
}
`,
    ],
    [
      "src/index.ts",
      `export * from "./managed/${familyStem}/contract/index.js";\n`,
    ],
    [
      "src/test/capability-profiles.test.ts",
      `import { describe, it } from "vitest";

describe("${packageDirName}: capability profiles", () => {
  it.todo("document and test the intended holder-binding and capability composition profile");
});
`,
    ],
    [
      "src/test/protocol.test.ts",
      `import { describe, it } from "vitest";

describe("${packageDirName}: protocol semantics", () => {
  it.todo("replace the placeholder verification semantics with family-specific issuance and presentation tests");
});
`,
    ],
  ]);
};

const main = async () => {
  try {
    const { slug, out, holder } = parseArgs(process.argv.slice(2));
    const requestedOutputPath = out ?? `credentials-${slug}`;
    const packageRoot = path.resolve(process.cwd(), requestedOutputPath);
    const packageRelativeToRepo = path.relative(repoRoot, packageRoot);
    if (
      packageRelativeToRepo.startsWith("..") ||
      path.isAbsolute(packageRelativeToRepo)
    ) {
      throw new Error(
        "--out must resolve to a path inside the Midnight VC repository",
      );
    }
    const packageDirName = path.basename(packageRoot);
    const familyStem = `${slug}-credential`;
    const familyPascal = `${toPascalCase(slug)}Credential`;
    const familyDirName = familyStem;
    const packageName = `@midnight-ntwrk/midnight-did-${packageDirName}`;
    const files = buildFiles({
      packageDirName,
      packageName,
      familyStem,
      familyDirName,
      familyPascal,
      holder,
    });

    await mkdir(path.dirname(packageRoot), { recursive: true });
    await mkdir(packageRoot, { recursive: false });
    for (const [relativePath, content] of files.entries()) {
      const targetPath = path.join(packageRoot, relativePath);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, content, "utf8");
    }

    console.log(`Scaffold created at ${packageRoot}`);
  } catch (error) {
    console.error(
      error instanceof Error ? `${error.message}\n\n${usage}` : String(error),
    );
    process.exit(1);
  }
};

await main();
