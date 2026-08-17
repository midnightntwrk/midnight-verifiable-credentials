import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");

const usage = `Usage:
  node ./tooling/scripts/scaffold-vc-family.mjs --slug my-family [--out packages/prototypes/credential-families/my-family] [--holder explicit|hidden] [--claim-mode public|commitment|mixed]

Behavior:
  - generates a thin-core VC family package scaffold aligned with the current repository layout
  - requires the output directory to stay inside the current VC repository
  - defaults to packages/prototypes/credential-families/<slug>
  - defaults to commitment-only claim storage so private placeholders do not leak into public claims
  - does not add the package to root workspaces automatically
  - does not overwrite an existing directory
`;

const parseArgs = (argv) => {
  const args = {
    claimMode: "commitment",
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
      case "--claim-mode":
        args.claimMode = next;
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
  if (args.slug.length > 17) {
    throw new Error("--slug must be 17 characters or fewer so generated Compact tags fit in Bytes<32>");
  }
  if (!["explicit", "hidden"].includes(args.holder)) {
    throw new Error("--holder must be either 'explicit' or 'hidden'");
  }
  if (!["public", "commitment", "mixed"].includes(args.claimMode)) {
    throw new Error("--claim-mode must be one of 'public', 'commitment', or 'mixed'");
  }

  return args;
};

const toPascalCase = (value) =>
  value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");

const toImportPath = (fromDir, toDir) => {
  const relative = path.relative(fromDir, toDir).split(path.sep).join("/");
  return relative.startsWith(".") ? relative : `./${relative}`;
};

const claimModeDescriptions = {
  public:
    "public/direct claims only (`claims` carries raw values and `claimCommitments` is `NoClaimCommitments`)",
  commitment:
    "commitment-only claims (`claims` is `NoPublicClaims` and `claimCommitments` carries private digests)",
  mixed:
    "mixed public/direct plus committed/private claims (`claims` and `claimCommitments` are both populated)",
};

const buildClaimSurface = ({ slug, familyPascal, familyCamel, claimMode }) => {
  const publicClaimsType =
    claimMode === "commitment" ? "NoPublicClaims" : `${familyPascal}PublicClaims`;
  const claimCommitmentsType =
    claimMode === "public" ? "NoClaimCommitments" : `${familyPascal}ClaimCommitments`;
  const privateDisclosureFields = [
    "  revealPrimaryClaim: Boolean,",
    "  primaryClaimValuePadded: Bytes<32>,",
    "  primaryClaimOpening: Bytes<32>,",
  ].join("\n");
  const publicDisclosureField =
    claimMode === "commitment" ? "" : `  publicClaims: ${familyPascal}PublicClaims,`;
  const disclosureFields =
    claimMode === "public"
      ? [publicDisclosureField, "  revealPrimaryClaim: Boolean,"].join("\n")
      : [publicDisclosureField, privateDisclosureFields].filter(Boolean).join("\n");
  const publicDisclosureValidation =
    claimMode === "commitment"
      ? ""
      : `  assert(
    presentation.disclosed.publicClaims == credential.claims,
    "${familyPascal} public claims disclosure does not match credential claims"
  );`;

  if (claimMode === "public") {
    return {
      publicClaimsType,
      claimCommitmentsType,
      claimRootInvocation: `${familyCamel}ClaimRoot(credential.claims)`,
      disclosureFields,
      publicDisclosureValidation,
      readmeRepresentation:
        "The generated family is public/direct-only: raw values live in `credential.claims`, and `credential.claimCommitments` uses `NoClaimCommitments`.",
      claimsFile: `export struct ${familyPascal}PublicClaims {
  subjectTypeCode: Uint<16>,
  primaryClaimCode: Bytes<32>,
  contextCode: Bytes<32>,
}

export pure circuit ${familyCamel}ClaimRoot(
  claims: ${familyPascal}PublicClaims
): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "midnight:vc:${slug}:v1"),
    persistentHash<${familyPascal}PublicClaims>(claims)
  ]);
}
`,
    };
  }

  if (claimMode === "mixed") {
    return {
      publicClaimsType,
      claimCommitmentsType,
      claimRootInvocation: `${familyCamel}ClaimRoot(credential.claims, credential.claimCommitments)`,
      disclosureFields,
      publicDisclosureValidation,
      readmeRepresentation:
        "The generated family is mixed: public metadata lives in `credential.claims`, and private placeholder values live in `credential.claimCommitments`.",
      claimsFile: `export struct ${familyPascal}PublicClaims {
  credentialTypeCode: Uint<16>,
  issuerJurisdictionCode: Bytes<2>,
  assuranceLevel: Uint<8>,
}

export struct ${familyPascal}ClaimCommitments {
  subjectIdCommitment: Bytes<32>,
  primaryClaimCommitment: Bytes<32>,
  contextCommitment: Bytes<32>,
}

export pure circuit ${familyCamel}PublicClaimsRoot(
  claims: ${familyPascal}PublicClaims
): Bytes<32> {
  return persistentHash<${familyPascal}PublicClaims>(claims);
}

export pure circuit ${familyCamel}ClaimCommitmentsRoot(
  claimCommitments: ${familyPascal}ClaimCommitments
): Bytes<32> {
  return persistentHash<${familyPascal}ClaimCommitments>(claimCommitments);
}

export pure circuit ${familyCamel}ClaimRoot(
  claims: ${familyPascal}PublicClaims,
  claimCommitments: ${familyPascal}ClaimCommitments
): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "midnight:vc:${slug}:v1"),
    ${familyCamel}PublicClaimsRoot(claims),
    ${familyCamel}ClaimCommitmentsRoot(claimCommitments)
  ]);
}
`,
    };
  }

  return {
    publicClaimsType,
    claimCommitmentsType,
    claimRootInvocation: `${familyCamel}ClaimRoot(credential.claimCommitments)`,
    disclosureFields,
    publicDisclosureValidation,
    readmeRepresentation:
      "The generated family is commitment-only: raw placeholder values stay outside the credential body, `credential.claims` uses `NoPublicClaims`, and `credential.claimCommitments` carries private digests.",
    claimsFile: `export struct ${familyPascal}ClaimCommitments {
  subjectIdCommitment: Bytes<32>,
  primaryClaimCommitment: Bytes<32>,
  contextCommitment: Bytes<32>,
}

export pure circuit ${familyCamel}ClaimRoot(
  claimCommitments: ${familyPascal}ClaimCommitments
): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "midnight:vc:${slug}:v1"),
    persistentHash<${familyPascal}ClaimCommitments>(claimCommitments)
  ]);
}
`,
  };
};

const buildFiles = ({
  slug,
  packageName,
  packageRoot,
  packageRelativeToRepo,
  familyStem,
  familyPascal,
  holder,
  claimMode,
}) => {
  const srcDir = path.join(packageRoot, "src");
  const coreDir = path.join(repoRoot, "core", "primitives", "credentials", "src", "credentials");
  const coreImport = toImportPath(srcDir, coreDir);
  const holderType = holder === "hidden" ? "BlindedSecretHolderBinding" : "ExplicitHolderBinding";
  const holderValidation =
    holder === "hidden"
      ? "assertValidBlindedSecretHolderCredentialBinding(credential.holderBinding);"
      : "assertValidExplicitHolderBinding(credential.holderBinding);";
  const holderMatch =
    holder === "hidden"
      ? "assertMatchingBlindedSecretHolderBindings(credential.holderBinding, presentation.holderBinding);"
      : "assertMatchingExplicitHolderBindings(credential.holderBinding, presentation.holderBinding);";
  const packageId = `midnight:vc:${slug}`;
  const schemaId = `${slug}:v1`;
  const familyCamel = familyPascal.charAt(0).toLowerCase() + familyPascal.slice(1);
  const claimSurface = buildClaimSurface({ slug, familyPascal, familyCamel, claimMode });
  const holderStatusLine =
    holder === "hidden"
      ? "Status: starter scaffold for a hidden-holder family package built on `BlindedSecretHolderBinding` and `NoStatusBinding`."
      : "Status: starter scaffold for an explicit-holder family package built on `ExplicitHolderBinding` and `NoStatusBinding`.";

  return new Map([
    [
      "README.md",
      `# ${packageName}

${holderStatusLine}

Purpose:

- give engineers a real thin-core family package skeleton instead of another blank folder
- keep naming, scripts, and directory layout aligned with the current VC repository
- make the next customization steps explicit

Generated location:

- \`${packageRelativeToRepo}\`

Generated claim mode:

- \`${claimMode}\`: ${claimModeDescriptions[claimMode]}

Generated shape:

\`\`\`text
${packageRelativeToRepo}/
├── README.md
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── scripts/
│   ├── ensure-compact-package-aliases.mjs
│   ├── find-repo-root.mjs
│   └── strip-managed-sourcemaps.mjs
└── src/
    ├── ${familyStem}.compact
    ├── contract.ts
    ├── index.ts
    ├── ${familyStem}/
    │   ├── claims.compact
    │   ├── helpers.compact
    │   └── model.compact
    └── test/
        ├── claim-root.test.ts
        ├── package-surfaces.test.ts
        └── presentation-request.test.ts
\`\`\`

Next steps:

1. rename the placeholder claim/disclosure/request structs to the real schema vocabulary
2. replace the placeholder schema id and package id with the real family identifiers
3. replace the example disclosure gate with real family proof and request semantics
4. add a dedicated \`./testing\` surface only when another package truly needs fixtures from this family
5. wire the package into root workspaces only after it has a real owner and validation path

Current Compact claim-shape guardrails:

- ${claimSurface.readmeRepresentation}
- native direct Compact claim fields today should stay within:
  - \`Boolean\`
  - \`Uint<n>\`
  - \`Bytes<n>\`
  - \`Field\`
  - vectors and nested structs built only from those supported kinds
- do not model \`String\`, \`Int<n>\`, or \`Float<n>\` as if they were native
  Compact claim fields
- do not model \`Vector<k, T>\` when \`T\` is itself an unsupported field kind
- prefer flat claims by default; use nested structs only when they reflect a
  real domain grouping
- keep \`claims\` for intentionally public/direct values only
- keep \`claimCommitments\` for private disclosure or predicate-only digests only

Reference packages:

- smallest starter family:
  - \`packages/prototypes/credential-families/hello-family\`
- broad direct claim-surface laboratory:
  - \`packages/prototypes/credential-families/dummy-claims\`
- mixed public/private claim-representation laboratory:
  - \`packages/prototypes/credential-families/mixed-claims\`
`,
    ],
    [
      "eslint.config.mjs",
      `import js from '@eslint/js';
import plugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: ['./node_modules/**', './dist/**', './build/**', './src/managed/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
      prettier: pluginPrettier,
      import: pluginImport,
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      'import/no-unused-modules': [1, { unusedExports: true }],
      'no-duplicate-imports': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            '@midnight-ntwrk/midnight-did-domain',
            '@midnight-ntwrk/midnight-did',
            '@midnight-ntwrk/midnight-did-api',
          ],
        },
      ],
    }
  }
];
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
            pnpm: ">=10",
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
            "./contract": {
              types: "./dist/contract.d.ts",
              require: "./dist/contract.js",
              import: "./dist/contract.js",
              default: "./dist/contract.js",
            },
            [`./managed/${familyStem}/contract/index.js`]: {
              types: `./dist/managed/${familyStem}/contract/index.d.ts`,
              import: `./dist/managed/${familyStem}/contract/index.js`,
              default: `./dist/managed/${familyStem}/contract/index.js`,
            },
          },
          typesVersions: {
            "*": {
              contract: ["dist/contract.d.ts"],
              [`managed/${familyStem}/contract/index.js`]: [`dist/managed/${familyStem}/contract/index.d.ts`],
            },
          },
          scripts: {
            contract: "pnpm run compact",
            compact: `node ./scripts/ensure-compact-package-aliases.mjs && compact compile src/${familyStem}.compact src/managed/${familyStem} && node ./scripts/strip-managed-sourcemaps.mjs`,
            test: "vitest run",
            "test:ci": "vitest run",
            prepack: "pnpm run build",
            clean: "rm -rf dist && rm -rf coverage && rm -rf reports && rm -rf src/managed",
            build: `pnpm run compact && rm -rf dist && mkdir -p dist && tsc -b tsconfig.build.json --force && cp -Rf ./src/managed ./dist/ && cp ./src/${familyStem}.compact ./dist && cp -Rf ./src/${familyStem} ./dist/`,
            lint: "eslint src --ignore-pattern 'src/managed/**'",
            "lint:fix": "eslint src --fix --ignore-pattern 'src/managed/**'",
            typecheck: "pnpm run compact && tsc -p tsconfig.json --noEmit",
            all: "pnpm run compact && pnpm run build && pnpm run test:ci",
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
      "scripts/strip-managed-sourcemaps.mjs",
      `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const managedDir = path.resolve(rootDir, "..", "src", "managed");

const walk = (dir) => {
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
};

if (fs.existsSync(managedDir)) {
  walk(managedDir);
}
`,
    ],
    [
      `src/${familyStem}.compact`,
      `pragma language_version >= 0.20;

import CompactStandardLibrary;

include "${coreImport}";
include "./${familyStem}/claims";
include "./${familyStem}/model";

import VC<${claimSurface.publicClaimsType}, ${claimSurface.claimCommitmentsType}, ${holderType}, NoStatusBinding>;
import VP<${familyPascal}Disclosures, ${holderType}>;
import CredentialPresentationRelations<
  ${claimSurface.publicClaimsType},
  ${claimSurface.claimCommitmentsType},
  ${familyPascal}Disclosures,
  ${holderType},
  NoStatusBinding
> prefix ${familyPascal}Presentation_;

export type ${familyPascal}Credential = Credential;
export type ${familyPascal}Presentation = Presentation;
include "./${familyStem}/helpers";
`,
    ],
    [
      `src/${familyStem}/claims.compact`,
      claimSurface.claimsFile,
    ],
    [
      `src/${familyStem}/model.compact`,
      `export struct ${familyPascal}Disclosures {
${claimSurface.disclosureFields}
}

export struct ${familyPascal}PresentationRequest {
  version: Uint<16>,
  schema: SchemaRef,
  issuerVerificationMethodRef: VerificationMethodRef,
  requirePrimaryClaimDisclosure: Boolean,
  verifierChallengeHash: Bytes<32>,
}
`,
    ],
    [
      `src/${familyStem}/helpers.compact`,
      `export pure circuit ${familyCamel}CredentialBodyRoot(
  credential: ${familyPascal}Credential
): Bytes<32> {
  return credentialBodyRoot(credential);
}

export pure circuit ${familyCamel}PresentationBodyRoot(
  presentation: ${familyPascal}Presentation
): Bytes<32> {
  return presentationBodyRoot(presentation);
}

export pure circuit ${familyCamel}PresentationRequestBodyRoot(
  request: ${familyPascal}PresentationRequest
): Bytes<32> {
  return persistentHash<${familyPascal}PresentationRequest>(request);
}

export pure circuit assertValid${familyPascal}SchemaRef(
  schema: SchemaRef
): [] {
  assert(
    schema.packageId == pad(32, "${packageId}"),
    "${familyPascal} package id mismatch"
  );
  assert(
    schema.schemaId == pad(32, "${schemaId}"),
    "${familyPascal} schema id mismatch"
  );
  assert(schema.majorVersion == 1, "${familyPascal} major version mismatch");
}

export pure circuit assertValid${familyPascal}PresentationRequest(
  request: ${familyPascal}PresentationRequest
): [] {
  assert(request.version == 1, "${familyPascal} request version mismatch");
  assertValid${familyPascal}SchemaRef(request.schema);
  assert(
    request.verifierChallengeHash != pad(32, ""),
    "${familyPascal} verifier challenge must be set"
  );
}

export pure circuit assertValid${familyPascal}Credential(
  credential: ${familyPascal}Credential,
  proof: Proof
): [] {
  assertValid${familyPascal}SchemaRef(credential.schema);
  assertValidCredentialEnvelope(
    credential,
    ${claimSurface.claimRootInvocation}
  );
  ${holderValidation}
  assertValidNoStatusBinding(credential.statusBinding);
  assertValidCredentialProof(credential, proof);
}

export pure circuit assertValid${familyPascal}Presentation(
  credential: ${familyPascal}Credential,
  presentation: ${familyPascal}Presentation
): [] {
  assertValid${familyPascal}SchemaRef(presentation.schema);
  assertValidPresentationEnvelope(presentation);
  ${familyPascal}Presentation_assertMatchingCredentialPresentation(
    credential,
    presentation
  );
  ${holderMatch}${claimSurface.publicDisclosureValidation ? `\n${claimSurface.publicDisclosureValidation}` : ""}
}

export pure circuit assert${familyPascal}PresentationSatisfiesRequest(
  request: ${familyPascal}PresentationRequest,
  presentation: ${familyPascal}Presentation
): [] {
  assertValid${familyPascal}PresentationRequest(request);
  assertValid${familyPascal}SchemaRef(presentation.schema);
  if (request.requirePrimaryClaimDisclosure) {
    assert(
      presentation.disclosed.revealPrimaryClaim,
      "${familyPascal} request requires primary claim disclosure"
    );
  }
}
`,
    ],
    ["src/index.ts", `export * from "./managed/${familyStem}/contract/index.js";\n`],
    ["src/contract.ts", `export * from "./managed/${familyStem}/contract/index.js";\n`],
    [
      "src/test/package-surfaces.test.ts",
      `import { describe, expect, it } from "vitest";

import packageJson from "../../package.json" with { type: "json" };

describe("${slug} scaffold package surfaces", () => {
  it("exports the default root and contract subpath", () => {
    expect(packageJson.exports["."]).toBeDefined();
    expect(packageJson.exports["./contract"]).toBeDefined();
  });
});
`,
    ],
    [
      "src/test/claim-root.test.ts",
      `import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const claimsSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "${familyStem}",
    "claims.compact",
  ),
  "utf8",
);

describe("${slug} scaffold claim root", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:${slug}:v1");
  });
});
`,
    ],
    [
      "src/test/presentation-request.test.ts",
      `import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const modelSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "${familyStem}",
    "model.compact",
  ),
  "utf8",
);

describe("${slug} scaffold presentation request", () => {
  it("keeps an explicit verifier challenge in the request shape", () => {
    expect(modelSource).toContain("verifierChallengeHash");
  });
});
`,
    ],
  ]);
};

const main = async () => {
  try {
    const { slug, out, holder, claimMode } = parseArgs(process.argv.slice(2));
    const requestedOutputPath = out ?? path.join("prototypes", "credential-families", slug);
    const packageRoot = path.resolve(process.cwd(), requestedOutputPath);
    const packageRelativeToRepo = path.relative(repoRoot, packageRoot);
    if (packageRelativeToRepo.startsWith("..") || path.isAbsolute(packageRelativeToRepo)) {
      throw new Error("--out must resolve to a path inside the Midnight VC repository");
    }

    const familyStem = `${slug}-credential`;
    const familyPascal = toPascalCase(slug);
    const packageName = `@midnight-ntwrk/midnight-did-credentials-${slug}`;

    const files = buildFiles({
      slug,
      packageName,
      packageRoot,
      packageRelativeToRepo,
      familyStem,
      familyPascal,
      holder,
      claimMode,
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
