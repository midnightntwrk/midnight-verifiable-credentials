#!/usr/bin/env bash
set -euo pipefail

source ./tooling/scripts/run-common.sh

run_common_apply_light_mode "$@"
run_common_setup_cleanup_trap
run_common_ensure_node
run_common_ensure_runtime_helpers
node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs
node ./tooling/scripts/ensure-midnight-did-api-paths.mjs
run_common_auto_proof_server_image "credentials"

run_credentials_integration_target() {
  local label="$1"
  shift

  run_common_cleanup_test_infra
  echo "[credentials] ${label}"
  "$@"
  run_common_cleanup_test_infra
}

echo "[credentials] Lint"
if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
  echo "[credentials] Light wrapper lanes"
  ./run.sh lint
  ./run.sh typecheck --light
  ./run.sh build --light
  ./run.sh test --light
else
  echo "[credentials] Full wrapper lanes"
  ./run.sh lint
  ./run.sh typecheck
  ./run.sh build
  ./run.sh test
fi

echo "[credentials] BDD smoke lane"
./run.sh bdd

if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
  echo "[credentials] Skip standalone integrations (SKIP_LONG_RUNNING=1)"
elif docker info >/dev/null 2>&1; then
  run_credentials_integration_target \
    "Standalone demo-contract integration" \
    ./run.sh integration-demo-contract
  run_credentials_integration_target \
    "Standalone protocol integration" \
    ./run.sh integration-protocol
else
  echo "[credentials] Skipping standalone integrations (docker unavailable)"
fi

echo "[credentials] Done"
