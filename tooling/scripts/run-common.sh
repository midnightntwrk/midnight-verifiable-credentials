#!/usr/bin/env bash

if [[ -n "${MIDNIGHT_RUN_COMMON_SH_LOADED:-}" ]]; then
  return 0
fi
MIDNIGHT_RUN_COMMON_SH_LOADED=1

run_common_light_supported_targets=(full build typecheck test hello-smoke dummy-claims-lab)

run_common_print_light_targets() {
  local joined="${run_common_light_supported_targets[*]}"
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

run_common_cleanup_test_infra() {
  "$(git rev-parse --show-toplevel)/tooling/scripts/cleanup-test-infra.sh" || true
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

run_common_setup_cleanup_trap() {
  run_common_cleanup_test_infra
  trap 'run_common_cleanup_test_infra' EXIT INT TERM
}

run_common_ensure_node() {
  node "$(git rev-parse --show-toplevel)/tooling/scripts/ensure-node-24.mjs"
}

run_common_ensure_runtime_helpers() {
  node "$(git rev-parse --show-toplevel)/tooling/scripts/ensure-onchain-runtime-cjs.mjs"
  node "$(git rev-parse --show-toplevel)/tooling/scripts/ensure-rollup-native.mjs"
}

run_common_auto_proof_server_image() {
  local caller="${1:-run}"
  if [[ -z "${PROOF_SERVER_IMAGE:-}" ]] \
    && command -v docker >/dev/null 2>&1 \
    && docker image inspect proof-server-bootstrap:8.0.3 >/dev/null 2>&1; then
    export PROOF_SERVER_IMAGE="proof-server-bootstrap:8.0.3"
    echo "[${caller}] Using local bootstrapped proof server image: ${PROOF_SERVER_IMAGE}"
  fi
}

run_common_artifacts_ready() {
  local profile="${1:-all}"

  case "$profile" in
    managed-light)
      [[ -f "core/primitives/credentials/src/managed/credentials/contract/index.js" ]] \
        && [[ -f "registry/status-registry/src/managed/revocation-registry/contract/index.js" ]] \
        && [[ -f "core/capabilities/same-holder/src/managed/same-holder/contract/index.js" ]] \
        && [[ -f "core/primitives/iso-registry/src/managed/iso-registry/contract/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth/src/managed/birth-credential/contract/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth-secret/src/managed/secret-birth-credential/contract/index.js" ]] \
        && [[ -f "prototypes/credential-families/hello-family/src/managed/hello-family-credential/contract/index.js" ]]
      ;;
    managed-all)
      run_common_artifacts_ready managed-light \
        && [[ -f "use-cases/age-gate/contract/src/managed/demo/contract/index.js" ]] \
        && [[ -f "use-cases/age-gate/contract/src/managed/demo-revocation/contract/index.js" ]] \
        && [[ -f "use-cases/hello-verifier/contract/src/managed/hello-verifier/contract/index.js" ]]
      ;;
    managed-revocation)
      [[ -f "core/primitives/credentials/src/managed/credentials/contract/index.js" ]] \
        && [[ -f "registry/status-registry/src/managed/revocation-registry/contract/index.js" ]] \
        && [[ -f "core/capabilities/same-holder/src/managed/same-holder/contract/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth/src/managed/birth-credential/contract/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth-secret/src/managed/secret-birth-credential/contract/index.js" ]] \
        && [[ -f "use-cases/age-gate/contract/src/managed/demo/contract/index.js" ]] \
        && [[ -f "use-cases/age-gate/contract/src/managed/demo-revocation/contract/index.js" ]]
      ;;
    managed-hello-smoke)
      [[ -f "core/primitives/credentials/src/managed/credentials/contract/index.js" ]] \
        && [[ -f "registry/status-registry/src/managed/revocation-registry/contract/index.js" ]] \
        && [[ -f "core/capabilities/same-holder/src/managed/same-holder/contract/index.js" ]] \
        && [[ -f "core/primitives/iso-registry/src/managed/iso-registry/contract/index.js" ]] \
        && [[ -f "prototypes/credential-families/hello-family/src/managed/hello-family-credential/contract/index.js" ]] \
        && [[ -f "use-cases/hello-verifier/contract/src/managed/hello-verifier/contract/index.js" ]]
      ;;
    managed-dummy-claims-lab)
      run_common_artifacts_ready managed-hello-smoke \
        && [[ -f "prototypes/credential-families/dummy-claims/src/managed/dummy-claims-credential/contract/index.js" ]] \
        && [[ -f "use-cases/hello-verifier/contract/src/managed/dummy-claims-verifier/contract/index.js" ]]
      ;;
    light)
      [[ -f "core/primitives/credentials/dist/index.js" ]] \
        && [[ -f "registry/status-registry/dist/index.js" ]] \
        && [[ -f "core/capabilities/same-holder/dist/index.js" ]] \
        && [[ -f "core/primitives/iso-registry/dist/index.js" ]] \
        && [[ -f "components/adapters/offchain-did/dist/index.js" ]] \
        && [[ -f "protocols/openid/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth-secret/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/hello-family/dist/index.js" ]]
      ;;
    all)
      run_common_artifacts_ready light \
        && [[ -f "use-cases/age-gate/contract/dist/index.js" ]] \
        && [[ -f "use-cases/hello-verifier/contract/dist/index.js" ]] \
        && [[ -f "components/orchestration/protocol/dist/index.js" ]]
      ;;
    revocation)
      [[ -f "core/primitives/credentials/dist/index.js" ]] \
        && [[ -f "registry/status-registry/dist/index.js" ]] \
        && [[ -f "core/capabilities/same-holder/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth-secret/dist/index.js" ]] \
        && [[ -f "use-cases/age-gate/contract/dist/index.js" ]]
      ;;
    integration-demo-contract)
      [[ -f "core/primitives/credentials/dist/index.js" ]] \
        && [[ -f "registry/status-registry/dist/index.js" ]] \
        && [[ -f "core/capabilities/same-holder/dist/index.js" ]] \
        && [[ -f "core/primitives/iso-registry/dist/index.js" ]] \
        && [[ -f "components/adapters/offchain-did/dist/index.js" ]] \
        && [[ -f "protocols/openid/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth/dist/index.js" ]] \
        && [[ -f "prototypes/credential-families/birth-secret/dist/index.js" ]] \
        && [[ -f "use-cases/age-gate/contract/dist/index.js" ]]
      ;;
    integration-protocol)
      run_common_artifacts_ready integration-demo-contract \
        && [[ -f "components/orchestration/protocol/dist/index.js" ]]
      ;;
    *)
      echo "[run] Unknown artifact profile: $profile" >&2
      return 1
      ;;
  esac
}

run_common_ensure_artifacts() {
  local caller="${1:-run}"
  local profile="${2:-all}"
  local build_cmd

  if run_common_artifacts_ready "$profile"; then
    echo "[${caller}] Reusing existing ${profile} build artifacts"
    return 0
  fi

  case "$profile" in
    managed-light)
      build_cmd="npm run build:light"
      ;;
    managed-all)
      build_cmd="npm run build:all"
      ;;
    managed-revocation)
      build_cmd="npm run build:revocation"
      ;;
    managed-hello-smoke)
      build_cmd="npm run build:starter-smoke-prereqs"
      ;;
    managed-dummy-claims-lab)
      build_cmd="npm run build:dummy-claims-lab-prereqs"
      ;;
    light)
      build_cmd="npm run build:light"
      ;;
    all)
      build_cmd="npm run build:all"
      ;;
    revocation)
      build_cmd="npm run build:revocation"
      ;;
    integration-demo-contract)
      build_cmd="npm run build:integration-prereqs:demo-contract"
      ;;
    integration-protocol)
      build_cmd="npm run build:integration-prereqs:protocol"
      ;;
    *)
      echo "[${caller}] Unknown artifact profile: $profile" >&2
      return 1
      ;;
  esac

  echo "[${caller}] Build missing ${profile} artifacts"
  eval "$build_cmd"
}

run_common_ensure_contract_artifacts() {
  local caller="${1:-run}"
  if [[ ! -f "contract/src/managed/did/contract/index.js" ]]; then
    echo "[${caller}] Generate contract managed artifacts"
    npm run contract -w contract
  fi
}
