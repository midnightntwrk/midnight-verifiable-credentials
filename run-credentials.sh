#!/usr/bin/env bash
set -euo pipefail

source ./scripts/run-common.sh

run_common_apply_light_mode "$@"
run_common_setup_cleanup_trap
run_common_ensure_node
run_common_ensure_runtime_helpers
node ./scripts/ensure-midnight-did-package-aliases.mjs
node ./scripts/ensure-midnight-did-api-paths.mjs
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
  echo "[credentials] Turbo-aware light build lane"
  npm run ci:build:light
else
  echo "[credentials] Turbo-aware full build lane"
  npm run ci:build
fi

if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
  echo "[credentials] Skip standalone integrations (SKIP_LONG_RUNNING=1)"
elif docker info >/dev/null 2>&1; then
  run_credentials_integration_target \
    "Standalone demo-contract integration" \
    npm run test:integration -w credentials-demo-contract
  run_credentials_integration_target \
    "Standalone protocol integration" \
    npm run test:integration -w credentials-protocol
else
  echo "[credentials] Skipping standalone integrations (docker unavailable)"
fi

echo "[credentials] Done"
