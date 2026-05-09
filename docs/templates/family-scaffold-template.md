# Credential Family Scaffold Template

Status: starter template for adding a new VC family package.

Use this when the generic `credentials` package is not enough and you need a
schema-specific family with its own claims, disclosures, request shape, and
validation rules.

Fastest repo-local path:

```bash
npm run scaffold:family -- --slug example-family
```

That generator now creates a thin-core family package skeleton under:

- `prototypes/credential-families/<slug>`

The generated package includes:

- package metadata
- ESLint and TypeScript config
- thin-core Compact root and family subfiles
- helper scripts for Compact aliasing and managed-runtime cleanup
- placeholder tests for package surfaces and core schema scaffolding

It does not add the package to root workspaces automatically.

## Package shape

A minimal family package should have these parts:

```text
prototypes/credential-families/example-family/
├── README.md
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── scripts/
│   ├── align-runtime-version.mjs
│   ├── ensure-compact-package-aliases.mjs
│   ├── find-repo-root.mjs
│   └── strip-managed-sourcemaps.mjs
└── src/
    ├── example-family-credential.compact
    ├── contract.ts
    ├── index.ts
    ├── example-family-credential/
    │   ├── claims.compact
    │   ├── model.compact
    │   └── helpers.compact
    └── test/
        ├── claim-root.test.ts
        ├── package-surfaces.test.ts
        └── presentation-request.test.ts
```

## Compact root template

```compact
pragma language_version >= 0.20;

import CompactStandardLibrary;

include "../../../core/primitives/credentials/src/credentials";
include "./example-family-credential/claims";
include "./example-family-credential/model";

import VC<ExampleFamilyCredentialClaims, ExplicitHolderBinding, NoStatusBinding>;
import VP<ExampleFamilyDisclosures, ExplicitHolderBinding>;
import CredentialPresentationRelations<
  ExampleFamilyCredentialClaims,
  ExampleFamilyDisclosures,
  ExplicitHolderBinding,
  NoStatusBinding
> prefix ExampleFamilyPresentation_;

export type ExampleFamilyCredential = Credential;
export type ExampleFamilyPresentation = Presentation;
include "./example-family-credential/helpers";
```

## What belongs in the family package

Put these here:

- schema-specific claims and disclosures
- typed verifier request shapes
- schema-specific predicates and disclosure rules
- schema-specific holder-binding combinations if the schema really needs them

Do not put these here:

- generic VC/VP envelope types
- generic DID and holder-binding primitives
- issue/present protocol adapters
- OpenID message framing
- demo/business-contract logic

## Runtime surface rule

Expose only:

- generated/runtime family mirror via `src/index.ts`
- `./contract` when downstream code needs the managed Compact output directly
- optional `./testing` only when another package truly needs fixtures from this
  family

Avoid:

- cross-package imports from another package's `src/test/**`
- exporting the full transitive `credentials` core surface again unless there
  is a specific compatibility reason

## First tests to add

1. claim-root domain separation
2. package export surface sanity
3. verifier-request challenge presence
4. then real family happy-path verification
5. wrong-holder-binding rejection
6. predicate/disclosure boundary tests

## Best current references

Explicit-holder family reference:

- `prototypes/credential-families/birth`

Hidden-holder family reference:

- `prototypes/credential-families/birth-secret`

Capability composition reference:

- `core/capabilities/same-holder`

## Packaging rule

If external consumers need fixtures or test helpers, promote them to an explicit
package surface such as:

- `src/testing.ts`
- `src/testing/...`

Do not rely on sibling imports into `src/test/**`.
