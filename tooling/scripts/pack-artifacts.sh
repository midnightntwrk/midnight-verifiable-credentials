#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
DEST_DIR="${1:-$ROOT_DIR/tooling/artifacts/npm}"

workspaces=(
  core/primitives/credentials
  registry/status-registry
  core/capabilities/same-holder
  core/primitives/iso-registry
  components/adapters/offchain-did
  protocols/openid
  components/orchestration/protocol
  prototypes/credential-families/birth
  prototypes/credential-families/birth-secret
  components/integration/standalone-environment
)

mkdir -p "$DEST_DIR"
rm -f "$DEST_DIR"/*.tgz

cd "$ROOT_DIR"
for workspace in "${workspaces[@]}"; do
  echo "[pack-artifacts] Packing ${workspace} -> ${DEST_DIR}"
  npm pack --pack-destination "$DEST_DIR" -w "$workspace"
done
