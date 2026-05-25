# @midnight-ntwrk/midnight-did-credentials-passport-kyc

> Maturity: `reference`
> Package class: `dist`

Status: starter scaffold for an explicit-holder family package built on `ExplicitHolderBinding` and `NoStatusBinding`.

Purpose:

- give engineers a real thin-core family package skeleton instead of another blank folder
- keep naming, scripts, and directory layout aligned with the current VC repository
- make the next customization steps explicit

Generated location:

- `prototypes/credential-families/passport-kyc`

Generated claim mode:

- `commitment`: commitment-only claims (`claims` is `NoPublicClaims` and `claimCommitments` carries private digests)

Generated shape:

```text
prototypes/credential-families/passport-kyc/
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
    ├── passport-kyc-credential.compact
    ├── contract.ts
    ├── index.ts
    ├── passport-kyc-credential/
    │   ├── claims.compact
    │   ├── helpers.compact
    │   └── model.compact
    └── test/
        ├── claim-root.test.ts
        ├── package-surfaces.test.ts
        └── presentation-request.test.ts
```

Next steps:

1. rename the placeholder claim/disclosure/request structs to the real schema vocabulary
2. replace the placeholder schema id and package id with the real family identifiers
3. replace the example disclosure gate with real family proof and request semantics
4. add a dedicated `./testing` surface only when another package truly needs fixtures from this family
5. wire the package into root workspaces only after it has a real owner and validation path

Current Compact claim-shape guardrails:

- The generated family is commitment-only: raw placeholder values stay outside the credential body, `credential.claims` uses `NoPublicClaims`, and `credential.claimCommitments` carries private digests.
- native direct Compact claim fields today should stay within:
  - `Boolean`
  - `Uint<n>`
  - `Bytes<n>`
  - `Field`
  - vectors and nested structs built only from those supported kinds
- do not model `String`, `Int<n>`, or `Float<n>` as if they were native
  Compact claim fields
- do not model `Vector<k, T>` when `T` is itself an unsupported field kind
- prefer flat claims by default; use nested structs only when they reflect a
  real domain grouping
- keep `claims` for intentionally public/direct values only
- keep `claimCommitments` for private disclosure or predicate-only digests only

Reference packages:

- smallest starter family:
  - `packages/prototypes/credential-families/hello-family`
- broad direct claim-surface laboratory:
  - `packages/prototypes/credential-families/dummy-claims`
- mixed public/private claim-representation laboratory:
  - `packages/prototypes/credential-families/mixed-claims`
