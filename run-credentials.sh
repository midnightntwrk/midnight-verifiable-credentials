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
run_common_ensure_node
run_common_ensure_runtime_helpers
node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs

if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
  echo "[credentials] Complete non-Docker release gate"
  for target in "${run_common_release_gate_targets[@]}"; do
    echo "[credentials] Release target: ${target}"
    if run_common_target_supports_light "$target"; then
      ./run.sh "$target" --light
    else
      ./run.sh "$target"
    fi
    if [[ "$target" == "build" ]]; then
      export MIDNIGHT_RELEASE_GATE_BUILD_READY=1
    fi
  done
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

echo "[credentials] Done"
