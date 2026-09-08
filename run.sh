#!/usr/bin/env bash
set -euo pipefail

source ./tooling/scripts/run-common.sh

run_common_usage() {
  cat <<'EOF'
Usage:
  ./run.sh [target] [--light]
  ./run.sh <root-pnpm-script> [--light] [-- <script args...>]

Options:
  --light                    Use the complete non-Docker release gate or a target's light variant

EOF
  run_common_catalog --targets

  cat <<'EOF'

Targets that currently honor `--light`:
EOF
  printf '  '
  run_common_print_light_targets

  cat <<'EOF'

The default `--light` gate runs these non-Docker release targets:
EOF
  printf '  '
  run_common_print_release_gate_targets

  if command -v node >/dev/null 2>&1; then
    echo
    echo "Root package.json scripts also run directly through ./run.sh:"
    node <<'EOF'
const scripts = require("./package.json").scripts ?? {};
const excluded = new Set(["postinstall"]);
for (const name of Object.keys(scripts).sort()) {
  if (excluded.has(name)) {
    continue;
  }
  console.log(`  ${name}`);
}
EOF
  fi
}

run_common_repo_setup() {
  run_common_apply_light_mode "$@"
  run_common_ensure_node
  run_common_ensure_runtime_helpers
  node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs
}

run_common_root_script_exists() {
  local script_name="$1"

  node -e '
    const scripts = require("./package.json").scripts ?? {};
    const excluded = new Set(["postinstall"]);
    const name = process.argv[1];
    process.exit(
      Object.prototype.hasOwnProperty.call(scripts, name) && !excluded.has(name)
        ? 0
        : 1
    );
  ' "$script_name"
}

target="full"
target_kind="wrapper"
light_requested=0
forward_args=()

if [[ $# -gt 0 ]]; then
  if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    target="$1"
    shift
  elif [[ "$1" != -* ]] && run_common_target_exists "$1"; then
    target="$1"
    shift
  elif [[ "$1" != -* ]] && run_common_root_script_exists "$1"; then
    target="$1"
    target_kind="pnpm-script"
    shift
  elif [[ "$1" != -* ]]; then
    echo "[run] Unknown target: $1" >&2
    run_common_usage >&2
    exit 1
  fi
fi

raw_args=("$@")

while [[ $# -gt 0 ]]; do
  case "$1" in
    --light)
      light_requested=1
      shift
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        forward_args+=("$1")
        shift
      done
      ;;
    -*)
      echo "[run] Unknown option: $1" >&2
      echo "[run] Pass script arguments after --." >&2
      exit 1
      ;;
    *)
      echo "[run] Unexpected argument: $1" >&2
      echo "[run] Pass script arguments after --." >&2
      exit 1
      ;;
  esac
done

if [[ "$target_kind" == "wrapper" && ${#forward_args[@]} -gt 0 && "$target" != "clean-artifacts" ]]; then
  echo "[run] Target '$target' does not accept forwarded arguments" >&2
  exit 1
fi

case "$target" in
  full)
    if [[ ${#raw_args[@]} -gt 0 ]]; then
      exec ./run-credentials.sh "${raw_args[@]}"
    else
      exec ./run-credentials.sh
    fi
    ;;
  targets|help|-h|--help)
    run_common_usage
    exit 0
    ;;
  clean-artifacts)
    run_common_ensure_node
    if [[ ${#forward_args[@]} -gt 0 ]]; then
      node ./tooling/scripts/clean-artifacts.mjs "${forward_args[@]}"
    else
      node ./tooling/scripts/clean-artifacts.mjs
    fi
    exit 0
    ;;
  integration-report)
    run_common_ensure_node
    node ./tooling/scripts/report-did-integration.mjs
    exit 0
    ;;
  check-integration)
    run_common_ensure_node
    node ./tooling/scripts/report-did-integration.mjs --check
    exit 0
    ;;
esac

if [[ "$light_requested" == "1" && "$target_kind" == "wrapper" ]] && ! run_common_target_supports_light "$target"; then
  echo "[run] Warning: --light is ignored by target '$target'" >&2
fi

if [[ ${#raw_args[@]} -gt 0 ]]; then
  run_common_repo_setup "${raw_args[@]}"
else
  run_common_repo_setup
fi

if [[ "$target_kind" == "pnpm-script" ]]; then
  echo "[run] Root pnpm script: $target"
  if [[ ${#forward_args[@]} -gt 0 ]]; then
    pnpm run "$target" -- "${forward_args[@]}"
  else
    pnpm run "$target"
  fi
  exit 0
fi

case "$target" in
  lint)
    echo "[run] Lint lane"
    pnpm run ci:lint
    ;;
  typecheck)
    if [[ "${MIDNIGHT_RELEASE_GATE_BUILD_READY:-0}" == "1" ]]; then
      echo "[run] Reuse release-gate build for typecheck lane"
      pnpm run typecheck:all:from-artifacts
    elif [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light typecheck lane"
      pnpm run typecheck:light
    else
      echo "[run] Full typecheck lane"
      pnpm run ci:typecheck
    fi
    ;;
  build)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light build lane"
      pnpm run build:light
    else
      echo "[run] Full build lane"
      pnpm run build:all
    fi
    ;;
  test)
    if [[ "${MIDNIGHT_RELEASE_GATE_BUILD_READY:-0}" == "1" ]]; then
      echo "[run] Reuse release-gate build for package test lane"
      pnpm run test:all:from-artifacts
    elif [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light package test lane"
      pnpm run test:light
    else
      echo "[run] Full package test lane"
      pnpm run test:all
    fi
    ;;
  conformance)
    if [[ "${MIDNIGHT_RELEASE_GATE_BUILD_READY:-0}" == "1" ]]; then
      echo "[run] Reuse release-gate build for core conformance lane"
      pnpm run test:core-conformance:from-artifacts
    else
      echo "[run] Core conformance lane"
      pnpm run test:core-conformance
    fi
    ;;
  package)
    echo "[run] Package artifact lane"
    pnpm run artifacts:pack
    ;;
  *)
    echo "[run] Unknown target: $target" >&2
    run_common_usage >&2
    exit 1
    ;;
esac
