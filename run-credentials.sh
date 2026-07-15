#!/usr/bin/env bash
set -euo pipefail

source ./tooling/scripts/run-common.sh

for arg in "$@"; do
  if [[ "$arg" != "--light" ]]; then
    echo "[credentials] Unknown option: $arg" >&2
    echo "Usage: ./run-credentials.sh [--light]" >&2
    exit 1
  fi
done

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

if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
  echo "[credentials] Complete non-Docker release gate"
  for target in "${run_common_release_gate_targets[@]}"; do
    echo "[credentials] Release target: ${target}"
    ./run.sh "$target" --light
    if [[ "$target" == "build" ]]; then
      export MIDNIGHT_RELEASE_GATE_BUILD_READY=1
    fi
  done
  echo "[credentials] Standalone Docker integrations are the only excluded release targets"
  echo "[credentials] Done"
  exit 0
fi

echo "[credentials] Complete release gate"
for target in "${run_common_release_gate_targets[@]}"; do
  echo "[credentials] Release target: ${target}"
  ./run.sh "$target"
  if [[ "$target" == "build" ]]; then
    export MIDNIGHT_RELEASE_GATE_BUILD_READY=1
  fi
done

if docker info >/dev/null 2>&1; then
  run_credentials_integration_target \
    "University standalone-hybrid BDD" \
    ./run.sh university-bdd-standalone
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
