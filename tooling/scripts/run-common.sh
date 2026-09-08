#!/usr/bin/env bash

if [[ -n "${MIDNIGHT_RUN_COMMON_SH_LOADED:-}" ]]; then
  return 0
fi
MIDNIGHT_RUN_COMMON_SH_LOADED=1

run_common_repo_root() {
  git rev-parse --show-toplevel
}

run_common_catalog() {
  node "$(run_common_repo_root)/tooling/scripts/run-target-catalog.mjs" "$@"
}

run_common_light_targets_output="$(run_common_catalog --light-targets)" || {
  echo "[run-common] Failed to load light targets" >&2
  return 1 2>/dev/null || exit 1
}
if [[ -z "${run_common_light_targets_output}" ]]; then
  echo "[run-common] Light target catalog is empty" >&2
  return 1 2>/dev/null || exit 1
fi

run_common_light_supported_targets=()
while IFS= read -r target; do
  if [[ -n "${target}" ]]; then
    run_common_light_supported_targets+=("${target}")
  fi
done <<< "${run_common_light_targets_output}"
unset run_common_light_targets_output

run_common_print_light_targets() {
  local joined="${run_common_light_supported_targets[*]}"
  printf '%s\n' "${joined// /, }"
}

run_common_release_targets_output="$(run_common_catalog --release-gate-targets)" || {
  echo "[run-common] Failed to load release-gate targets" >&2
  return 1 2>/dev/null || exit 1
}
if [[ -z "${run_common_release_targets_output}" ]]; then
  echo "[run-common] Release-gate target catalog is empty" >&2
  return 1 2>/dev/null || exit 1
fi

run_common_release_gate_targets=()
while IFS= read -r target; do
  if [[ -n "${target}" ]]; then
    run_common_release_gate_targets+=("${target}")
  fi
done <<< "${run_common_release_targets_output}"
unset run_common_release_targets_output

run_common_print_release_gate_targets() {
  local joined="${run_common_release_gate_targets[*]-}"
  printf '%s\n' "${joined// /, }"
}

run_common_target_supports_light() {
  local candidate="$1"
  local target
  for target in "${run_common_light_supported_targets[@]}"; do
    if [[ "$target" == "$candidate" ]]; then
      return 0
    fi
  done
  return 1
}

run_common_target_exists() {
  local candidate="$1"
  run_common_catalog --has-target "${candidate}" >/dev/null 2>&1
}

run_common_apply_light_mode() {
  local arg
  for arg in "$@"; do
    case "$arg" in
      --light)
        export SKIP_LONG_RUNNING=1
        ;;
    esac
  done
}

run_common_ensure_node() {
  node "$(git rev-parse --show-toplevel)/tooling/scripts/ensure-node-24.mjs"
}

run_common_ensure_runtime_helpers() {
  node "$(git rev-parse --show-toplevel)/tooling/scripts/ensure-onchain-runtime-cjs.mjs"
  node "$(git rev-parse --show-toplevel)/tooling/scripts/ensure-rollup-native.mjs"
}
