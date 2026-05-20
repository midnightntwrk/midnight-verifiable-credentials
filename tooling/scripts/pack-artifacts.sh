#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
DEST_DIR="${1:-$ROOT_DIR/tooling/artifacts/npm}"

workspaces=(
  packages/core/primitives/credentials
  packages/registry/status-registry
  packages/core/capabilities/same-holder
  packages/core/primitives/iso-registry
  packages/components/adapters/offchain-did
  packages/protocols/openid
  packages/components/orchestration/protocol
  packages/prototypes/credential-families/birth
  packages/prototypes/credential-families/birth-secret
  packages/prototypes/credential-families/hello-family
  packages/prototypes/credential-families/dummy-claims
  packages/prototypes/credential-families/university-diploma
  packages/components/integration/standalone-environment
)

mkdir -p "$DEST_DIR"
rm -f "$DEST_DIR"/*.tgz

cd "$ROOT_DIR"
for workspace in "${workspaces[@]}"; do
  echo "[pack-artifacts] Packing ${workspace} -> ${DEST_DIR}"
  npm pack --pack-destination "$DEST_DIR" -w "$workspace"
done
