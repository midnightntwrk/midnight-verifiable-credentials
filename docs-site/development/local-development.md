# Local Development

## Install

```bash
pnpm install --frozen-lockfile
```

## Validate Core Packages

```bash
./run.sh --light
```

The light lane is the complete non-Docker release gate. Focused targets include
`lint`, `build`, `typecheck`, `test`, `conformance`, and `package`.

## Work on Documentation

```bash
pnpm run docs:dev
```

The development server listens on `http://127.0.0.1:4173`. Validate and build
the production site with:

```bash
pnpm run docs:validate
pnpm run docs:build
```

Canonical specification and package documentation remain in their owning
repository directories. The site synchronizes those sources before each build;
do not edit generated site copies.
