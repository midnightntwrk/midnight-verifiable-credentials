#!/usr/bin/env bash
set -euo pipefail

ci_build_output_groups() {
  printf '%s\n' foundation birth-family age-gate protocol
}

ci_build_input_packages() {
  local group="${1:?usage: ci_build_input_packages <group>}"

  case "$group" in
    foundation)
      cat <<'EOF'
credentials
credentials-status-registry
credentials-same-holder
credentials-iso-registry
components/adapters/offchain-did
protocols/openid
EOF
      ;;
    birth-family)
      cat <<'EOF'
credentials
credentials-status-registry
credentials-same-holder
credentials-iso-registry
components/adapters/offchain-did
protocols/openid
credentials-birth
credentials-birth-secret
EOF
      ;;
    age-gate)
      cat <<'EOF'
credentials
credentials-status-registry
credentials-same-holder
credentials-iso-registry
components/adapters/offchain-did
protocols/openid
credentials-birth
credentials-birth-secret
use-cases/age-gate/contract
use-cases/hello-verifier/contract
EOF
      ;;
    protocol)
      cat <<'EOF'
credentials
credentials-status-registry
credentials-same-holder
credentials-iso-registry
components/adapters/offchain-did
protocols/openid
credentials-birth
credentials-birth-secret
use-cases/age-gate/contract
components/orchestration/protocol
EOF
      ;;
    *)
      echo "[ci-build-output-groups] Unknown group: $group" >&2
      return 1
      ;;
  esac
}

ci_build_output_paths() {
  local group="${1:?usage: ci_build_output_paths <group>}"

  case "$group" in
    foundation)
      cat <<'EOF'
core/primitives/credentials/src/managed
core/primitives/credentials/dist
registry/status-registry/src/managed
registry/status-registry/dist
core/capabilities/same-holder/src/managed
core/capabilities/same-holder/dist
core/primitives/iso-registry/src/managed
core/primitives/iso-registry/dist
components/adapters/offchain-did/dist
protocols/openid/dist
EOF
      ;;
    birth-family)
      cat <<'EOF'
credentials-birth/src/managed
credentials-birth/dist
credentials-birth-secret/src/managed
credentials-birth-secret/dist
EOF
      ;;
    age-gate)
      cat <<'EOF'
use-cases/age-gate/contract/src/managed
use-cases/age-gate/contract/dist
use-cases/hello-verifier/contract/src/managed
use-cases/hello-verifier/contract/dist
EOF
      ;;
    protocol)
      cat <<'EOF'
components/orchestration/protocol/dist
EOF
      ;;
    *)
      echo "[ci-build-output-groups] Unknown group: $group" >&2
      return 1
      ;;
  esac
}
