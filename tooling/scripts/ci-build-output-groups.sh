#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CI_BUILD_CONE_CATALOG="$ROOT_DIR/tooling/scripts/ci-build-cone-catalog.mjs"

ci_build_output_groups() {
  node "$CI_BUILD_CONE_CATALOG" --groups
}

ci_build_input_packages() {
  local group="${1:?usage: ci_build_input_packages <group>}"

  node "$CI_BUILD_CONE_CATALOG" --input-packages "$group"
}

ci_build_output_paths() {
  local group="${1:?usage: ci_build_output_paths <group>}"

  node "$CI_BUILD_CONE_CATALOG" --output-paths "$group"
}
