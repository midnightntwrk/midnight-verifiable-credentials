#!/usr/bin/env bash
set -euo pipefail

source ./tooling/scripts/run-common.sh

run_common_usage() {
  cat <<'EOF'
Usage:
  ./run.sh [target] [--light]

Targets:
  full                       Full repository validation pipeline (default)
  lint                       Package-boundary checks and lint
  typecheck                  TypeScript typecheck lanes
  build                      Build lanes
  test                       Package test lanes (non-Docker, excludes BDD)
  bdd                        Serenity/JS BDD smoke scenarios
  bdd-negative               Serenity/JS BDD negative-path scenarios
  bdd-all                    Full Serenity/JS BDD scenario set
  revocation                 Revocation-focused CI lane
  integration                Both standalone Docker integration lanes
  integration-demo-contract  Standalone demo-contract integration only
  integration-protocol       Standalone protocol integration only
  targets                    Print this target list
  help                       Print this target list

Options:
  --light                    Use light-mode variants when the target supports it
EOF
}

run_common_repo_setup() {
  run_common_apply_light_mode "$@"
  run_common_setup_cleanup_trap
  run_common_ensure_node
  run_common_ensure_runtime_helpers
  node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs
  node ./tooling/scripts/ensure-midnight-did-api-paths.mjs
  run_common_auto_proof_server_image "run"
}

run_common_integration_target() {
  local label="$1"
  shift

  run_common_cleanup_test_infra
  echo "[run] ${label}"
  "$@"
  run_common_cleanup_test_infra
}

target="full"

if [[ $# -gt 0 ]]; then
  case "$1" in
    full|lint|typecheck|build|test|bdd|bdd-negative|bdd-all|revocation|integration|integration-demo-contract|integration-protocol|targets|help|-h|--help)
      target="$1"
      shift
      ;;
  esac
fi

case "$target" in
  full)
    exec ./run-credentials.sh "$@"
    ;;
  targets|help|-h|--help)
    run_common_usage
    exit 0
    ;;
esac

run_common_repo_setup "$@"

case "$target" in
  lint)
    echo "[run] Lint lane"
    npm run ci:lint
    ;;
  typecheck)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light typecheck lane"
      npm run typecheck:light
    else
      echo "[run] Full typecheck lane"
      npm run ci:typecheck
    fi
    ;;
  build)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light build lane"
      npm run build:light
    else
      echo "[run] Full build lane"
      npm run build:all
    fi
    ;;
  test)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light package test lane"
      npm run test:light
    else
      echo "[run] Full package test lane"
      npm run test:all
    fi
    ;;
  bdd)
    echo "[run] BDD smoke lane"
    npm run test:bdd:smoke
    ;;
  bdd-negative)
    echo "[run] BDD negative lane"
    npm run test:bdd:negative
    ;;
  bdd-all)
    echo "[run] BDD full lane"
    npm run test:bdd:all
    ;;
  revocation)
    echo "[run] Revocation-focused lane"
    npm run ci:revocation
    ;;
  integration)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone demo-contract integration" \
        npm run ci:integration:demo-contract
      run_common_integration_target \
        "Standalone protocol integration" \
        npm run ci:integration:protocol
    else
      echo "[run] Docker unavailable; cannot run standalone integrations"
      exit 1
    fi
    ;;
  integration-demo-contract)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone demo-contract integration" \
        npm run ci:integration:demo-contract
    else
      echo "[run] Docker unavailable; cannot run demo-contract integration"
      exit 1
    fi
    ;;
  integration-protocol)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone protocol integration" \
        npm run ci:integration:protocol
    else
      echo "[run] Docker unavailable; cannot run protocol integration"
      exit 1
    fi
    ;;
  *)
    echo "[run] Unknown target: $target" >&2
    run_common_usage >&2
    exit 1
    ;;
esac
