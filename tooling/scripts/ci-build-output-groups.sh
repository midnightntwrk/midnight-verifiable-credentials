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
packages/core/primitives/credentials
packages/registry/status-registry
packages/core/capabilities/same-holder
packages/core/primitives/iso-registry
packages/components/adapters/offchain-did
packages/protocols/openid
EOF
      ;;
    birth-family)
      cat <<'EOF'
packages/core/primitives/credentials
packages/registry/status-registry
packages/core/capabilities/same-holder
packages/core/primitives/iso-registry
packages/components/adapters/offchain-did
packages/protocols/openid
packages/prototypes/credential-families/birth
packages/prototypes/credential-families/birth-secret
packages/prototypes/credential-families/hello-family
packages/prototypes/credential-families/dummy-claims
packages/prototypes/credential-families/mixed-claims
packages/prototypes/credential-families/university-diploma
EOF
      ;;
    age-gate)
      cat <<'EOF'
packages/core/primitives/credentials
packages/registry/status-registry
packages/core/capabilities/same-holder
packages/core/primitives/iso-registry
packages/components/adapters/offchain-did
packages/protocols/openid
packages/prototypes/credential-families/birth
packages/prototypes/credential-families/birth-secret
packages/prototypes/credential-families/hello-family
packages/prototypes/credential-families/dummy-claims
packages/prototypes/credential-families/mixed-claims
packages/prototypes/credential-families/university-diploma
packages/use-cases/age-gate/contract
packages/use-cases/hello-verifier/contract
EOF
      ;;
    protocol)
      cat <<'EOF'
packages/core/primitives/credentials
packages/registry/status-registry
packages/core/capabilities/same-holder
packages/core/primitives/iso-registry
packages/components/adapters/offchain-did
packages/protocols/openid
packages/prototypes/credential-families/birth
packages/prototypes/credential-families/birth-secret
packages/use-cases/age-gate/contract
packages/components/orchestration/protocol
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
packages/core/primitives/credentials/src/managed
packages/core/primitives/credentials/dist
packages/registry/status-registry/src/managed
packages/registry/status-registry/dist
packages/core/capabilities/same-holder/src/managed
packages/core/capabilities/same-holder/dist
packages/core/primitives/iso-registry/src/managed
packages/core/primitives/iso-registry/dist
packages/components/adapters/offchain-did/dist
packages/protocols/openid/dist
EOF
      ;;
    birth-family)
      cat <<'EOF'
packages/prototypes/credential-families/birth/src/managed
packages/prototypes/credential-families/birth/dist
packages/prototypes/credential-families/birth-secret/src/managed
packages/prototypes/credential-families/birth-secret/dist
packages/prototypes/credential-families/hello-family/src/managed
packages/prototypes/credential-families/hello-family/dist
packages/prototypes/credential-families/dummy-claims/src/managed
packages/prototypes/credential-families/dummy-claims/dist
packages/prototypes/credential-families/mixed-claims/src/managed
packages/prototypes/credential-families/mixed-claims/dist
packages/prototypes/credential-families/university-diploma/src/managed
packages/prototypes/credential-families/university-diploma/dist
EOF
      ;;
    age-gate)
      cat <<'EOF'
packages/use-cases/age-gate/contract/src/managed
packages/use-cases/age-gate/contract/dist
packages/use-cases/hello-verifier/contract/src/managed
packages/use-cases/hello-verifier/contract/dist
EOF
      ;;
    protocol)
      cat <<'EOF'
packages/components/orchestration/protocol/dist
EOF
      ;;
    *)
      echo "[ci-build-output-groups] Unknown group: $group" >&2
      return 1
      ;;
  esac
}
