#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./run.sh [target] [--light]

Targets:
  full             Run the complete non-Docker release gate (default)
  lint             Run repository policy checks and package lint
  build            Build every retained workspace
  typecheck        Build and typecheck every retained workspace
  test             Build and test every retained workspace
  conformance      Run TypeScript and Compact conformance vectors
  package          Pack and clean-consumer test all public packages
  clean-artifacts  Remove generated artifacts
  targets          Print this target list

The repository has no Docker lane. --light is accepted for workspace runner
compatibility and runs the same authoritative gate as the default command.
EOF
}

target="full"
if [[ $# -gt 0 && "$1" != -* ]]; then
  target="$1"
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --light)
      shift
      ;;
    -h|--help)
      target="targets"
      shift
      ;;
    *)
      echo "[run] Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

node ./tooling/scripts/ensure-node-24.mjs

case "$target" in
  full)
    pnpm run ci:lint
    pnpm run build:all
    pnpm run ci:typecheck:from-artifacts
    pnpm run test:core-conformance:from-artifacts
    pnpm run test:all:from-artifacts
    pnpm run artifacts:pack
    ;;
  lint)
    pnpm run ci:lint
    ;;
  build)
    pnpm run build:all
    ;;
  typecheck)
    pnpm run ci:typecheck
    ;;
  test)
    pnpm run build:all
    pnpm run test:all:from-artifacts
    ;;
  conformance)
    pnpm run test:core-conformance
    ;;
  package)
    pnpm run artifacts:pack
    ;;
  clean-artifacts)
    pnpm run clean:artifacts
    ;;
  targets|help|-h|--help)
    usage
    ;;
  *)
    echo "[run] Unknown target: $target" >&2
    usage >&2
    exit 1
    ;;
esac
