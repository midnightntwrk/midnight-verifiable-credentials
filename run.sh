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
  university-report-contract)
    run_common_ensure_node
    pnpm --silent run report:university-contract
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
      run_common_ensure_artifacts "run" managed-all
      pnpm run ci:typecheck:from-artifacts
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
      run_common_ensure_artifacts "run" managed-all
      pnpm run test:all:from-artifacts
    fi
    ;;
  trusted-time-capability)
    echo "[run] Compact trusted-time capability lane"
    pnpm run test:trusted-time-capability
    ;;
  package)
    echo "[run] Package artifact lane"
    pnpm run artifacts:pack
    ;;
  bdd)
    echo "[run] BDD smoke lane"
    pnpm run test:bdd:smoke
    ;;
  bdd-negative)
    echo "[run] BDD negative lane"
    pnpm run test:bdd:negative
    ;;
  bdd-all)
    echo "[run] BDD full lane"
    pnpm run test:bdd:all
    ;;
  university-bdd)
    echo "[run] University diploma BDD lane"
    pnpm run ci:university-bdd
    ;;
  university-bdd-proof-server)
    echo "[run] University diploma proof-server-contract BDD lane"
    pnpm run ci:university-bdd:proof-server
    ;;
  university-bdd-standalone)
    if docker info >/dev/null 2>&1; then
      echo "[run] University diploma standalone-hybrid BDD lane"
      pnpm run ci:university-bdd:standalone
    else
      echo "[run] Docker unavailable; cannot run university standalone-hybrid BDD lane"
      exit 1
    fi
    ;;
  university-batch-sweep)
    echo "[run] University issuance batch-sweep lane"
    pnpm run ci:university-batch-sweep
    ;;
  university-ci-matrix)
    echo "[run] University CI matrix contract lane"
    pnpm run ci:university-ci-matrix
    ;;
  university-data-profiles)
    echo "[run] University data-profile validation lane"
    pnpm run ci:university-data-profiles
    ;;
  university-policy-catalog)
    echo "[run] University policy-catalog validation lane"
    pnpm run ci:university-policy-catalog
    ;;
  university-protocol)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light university protocol lane"
      run_common_ensure_artifacts "run" managed-university-protocol
      pnpm run ci:university-protocol:from-artifacts
    else
      echo "[run] University protocol lane"
      pnpm run ci:university-protocol
    fi
    ;;
  university-protocol-export)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light university protocol export lane"
      run_common_ensure_artifacts "run" managed-university-protocol-export
      pnpm run ci:university-protocol:export:from-artifacts
    else
      echo "[run] University protocol export lane"
      pnpm run ci:university-protocol:export
    fi
    ;;
  university-protocol-cohort)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light university protocol cohort lane"
      run_common_ensure_artifacts "run" managed-university-protocol-cohort
      pnpm run ci:university-protocol:cohort:from-artifacts
    else
      echo "[run] University protocol cohort lane"
      pnpm run ci:university-protocol:cohort
    fi
    ;;
  university-protocol-stress)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light university protocol stress lane"
      run_common_ensure_artifacts "run" managed-university-protocol-stress
      pnpm run ci:university-protocol:stress:from-artifacts
    else
      echo "[run] University protocol stress lane"
      pnpm run ci:university-protocol:stress
    fi
    ;;
  university-summary)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light university summary lane"
      run_common_ensure_artifacts "run" managed-university-summary
      pnpm run ci:university-summary:from-artifacts
    else
      echo "[run] University summary lane"
      pnpm run ci:university-summary
    fi
    ;;
  hello-smoke)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light DID + VC hello smoke lane"
      run_common_ensure_artifacts "run" managed-hello-smoke
      pnpm run ci:hello-smoke:from-artifacts
    else
      # NOTE: the default lane stays package-local and build-light on purpose.
      # `hello-family` and `hello-verifier` already compile the Compact surfaces
      # they need inside their own typecheck/pretest commands, so the root lane
      # does not prebuild shared artifacts unless `--light` explicitly asks for
      # restored-artifact parity with CI.
      echo "[run] DID + VC hello smoke lane"
      pnpm run ci:hello-smoke
    fi
    ;;
  dummy-claims-lab)
    if [[ "${SKIP_LONG_RUNNING:-0}" == "1" ]]; then
      echo "[run] Light dummy-claims verifier lab lane"
      run_common_ensure_artifacts "run" managed-dummy-claims-lab
      pnpm run ci:dummy-claims-lab:from-artifacts
    else
      # NOTE: this lab lane intentionally stays narrower than `hello-smoke`.
      # It validates the broad claim-surface family and the dedicated verifier
      # lab test file without re-running the whole starter path.
      echo "[run] Dummy-claims verifier lab lane"
      pnpm run ci:dummy-claims-lab
    fi
    ;;
  revocation)
    echo "[run] Revocation-focused lane"
    pnpm run lint:revocation
    run_common_ensure_artifacts "run" managed-revocation
    pnpm run typecheck:revocation:from-artifacts
    pnpm run test:revocation:from-artifacts
    ;;
  integration)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone demo-contract integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-demo-contract && pnpm run ci:integration:demo-contract:from-artifacts'
      run_common_integration_target \
        "Standalone protocol integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-protocol && pnpm run ci:integration:protocol:from-artifacts'
    else
      echo "[run] Docker unavailable; cannot run standalone integrations"
      exit 1
    fi
    ;;
  integration-demo-contract)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone demo-contract integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-demo-contract && pnpm run ci:integration:demo-contract:from-artifacts'
    else
      echo "[run] Docker unavailable; cannot run demo-contract integration"
      exit 1
    fi
    ;;
  integration-protocol)
    if docker info >/dev/null 2>&1; then
      run_common_integration_target \
        "Standalone protocol integration" \
        bash -lc 'source ./tooling/scripts/run-common.sh && run_common_ensure_artifacts "run" integration-protocol && pnpm run ci:integration:protocol:from-artifacts'
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
