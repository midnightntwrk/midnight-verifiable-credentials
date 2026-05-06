#!/usr/bin/env bash
set -euo pipefail

ci_build_output_groups() {
  printf '%s\n' foundation birth-family age-gate protocol
}

ci_build_output_paths() {
  local group="${1:?usage: ci_build_output_paths <group>}"

  case "$group" in
    foundation)
      cat <<'EOF'
credentials/src/managed
credentials/dist
credentials-status-registry/src/managed
credentials-status-registry/dist
credentials-same-holder/src/managed
credentials-same-holder/dist
credentials-iso-registry/src/managed
credentials-iso-registry/dist
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
