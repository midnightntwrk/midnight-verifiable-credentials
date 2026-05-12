#!/usr/bin/env bash
set -euo pipefail

source ./tooling/scripts/run-common.sh

run_common_usage() {
  cat <<'EOF'
Usage:
  ./run.sh [target] [--light]
  ./run.sh <root-npm-script> [--light] [-- <script args...>]

Targets:
  full                       Full repository validation pipeline (default)
  lint                       Package-boundary checks and lint
  typecheck                  TypeScript typecheck lanes
  build                      Build lanes
  test                       Package test lanes (non-Docker, excludes BDD)
  bdd                        Serenity/JS BDD smoke scenarios
  bdd-negative               Serenity/JS BDD negative-path scenarios
  bdd-all                    Full Serenity/JS BDD scenario set
  university-bdd             Executable university diploma BDD scenarios
  university-protocol        Protocol-style multi-party university flow lane
  university-protocol-stress 100-student protocol stress lane with summary output
  hello-smoke                Smallest DID -> VC -> verifier handoff lane
  dummy-claims-lab           Broad direct claim-surface verifier lane
  revocation                 Revocation-focused CI lane
  integration                Both standalone Docker integration lanes
  integration-demo-contract  Standalone demo-contract integration only
  integration-protocol       Standalone protocol integration only
  targets                    Print this target list
  help                       Print this target list

Options:
  --light                    Use reduced-scope or restored-artifact variants when supported; ignored otherwise

Targets that currently honor `--light`:
EOF
  printf '  '
  run_common_print_light_targets

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
  case "$1" in
    full|lint|typecheck|build|test|bdd|bdd-negative|bdd-all|university-bdd|university-protocol|university-protocol-stress|hello-smoke|dummy-claims-lab|revocation|integration|integration-demo-contract|integration-protocol|targets|help|-h|--help)
      target="$1"
      shift
      ;;
    *)
      if [[ "$1" != -* ]] && run_common_root_script_exists "$1"; then
        target="$1"
        target_kind="npm-script"
        shift
      fi
      ;;
  esac
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
    *)
      forward_args+=("$1")
      shift
      ;;
  esac
done

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
esac

if [[ "$light_requested" == "1" && "$target_kind" == "wrapper" ]] && ! run_common_target_supports_light "$target"; then
  echo "[run] Warning: --light is ignored by target '$target'" >&2
fi

if [[ ${#raw_args[@]} -gt 0 ]]; then
  run_common_repo_setup "${raw_args[@]}"
else
  run_common_repo_setup
fi

if [[ "$target_kind" == "npm-script" ]]; then
  echo "[run] Root npm script: $target"
  if [[ ${#forward_args[@]} -gt 0 ]]; then
    npm run "$target" -- "${forward_args[@]}"
  else
    npm run "$target"
  fi
  exit 0
fi

case "$target" in
  lint)
    echo "[run] Lint lane"
    npm run ci:lint
    ;;
  typecheck)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light typecheck lane"
      run_common_ensure_artifacts "run" managed-light
      npm run typecheck:light:from-artifacts
    else
      echo "[run] Full typecheck lane"
      run_common_ensure_artifacts "run" managed-all
      npm run ci:typecheck:from-artifacts
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
      run_common_ensure_artifacts "run" managed-light
      npm run test:light:from-artifacts
    else
      echo "[run] Full package test lane"
      run_common_ensure_artifacts "run" managed-all
      npm run test:all:from-artifacts
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
  university-bdd)
    echo "[run] University diploma BDD lane"
    npm run ci:university-bdd
    ;;
  university-protocol)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light university protocol lane"
      run_common_ensure_artifacts "run" managed-university-protocol
      npm run ci:university-protocol:from-artifacts
    else
      echo "[run] University protocol lane"
      npm run ci:university-protocol
    fi
    ;;
  university-protocol-stress)
    echo "[run] University protocol stress lane"
    npm run ci:university-protocol:stress
    ;;
  hello-smoke)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light DID + VC hello smoke lane"
      run_common_ensure_artifacts "run" managed-hello-smoke
      npm run ci:hello-smoke:from-artifacts
    else
      # NOTE: the default lane stays package-local and build-light on purpose.
      # `hello-family` and `hello-verifier` already compile the Compact surfaces
      # they need inside their own typecheck/pretest commands, so the root lane
      # does not prebuild shared artifacts unless `--light` explicitly asks for
      # restored-artifact parity with CI.
      echo "[run] DID + VC hello smoke lane"
      npm run ci:hello-smoke
    fi
    ;;
  dummy-claims-lab)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light dummy-claims verifier lab lane"
      run_common_ensure_artifacts "run" managed-dummy-claims-lab
      npm run ci:dummy-claims-lab:from-artifacts
    else
      # NOTE: this lab lane intentionally stays narrower than `hello-smoke`.
      # It validates the broad claim-surface family and the dedicated verifier
      # lab test file without re-running the whole starter path.
      echo "[run] Dummy-claims verifier lab lane"
      npm run ci:dummy-claims-lab
    fi
    ;;
  revocation)
    echo "[run] Revocation-focused lane"
    npm run lint:revocation
    run_common_ensure_artifacts "run" managed-revocation
    npm run typecheck:revocation:from-artifacts
    npm run test:revocation:from-artifacts
    ;;
  integration)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone demo-contract integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-demo-contract && npm run ci:integration:demo-contract:from-artifacts'
      run_common_integration_target \
        "Standalone protocol integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-protocol && npm run ci:integration:protocol:from-artifacts'
    else
      echo "[run] Docker unavailable; cannot run standalone integrations"
      exit 1
    fi
    ;;
  integration-demo-contract)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone demo-contract integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-demo-contract && npm run ci:integration:demo-contract:from-artifacts'
    else
      echo "[run] Docker unavailable; cannot run demo-contract integration"
      exit 1
    fi
    ;;
  integration-protocol)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone protocol integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-protocol && npm run ci:integration:protocol:from-artifacts'
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
