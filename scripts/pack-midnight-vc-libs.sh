#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST_DIR="${1:-}"

if [[ -z "$DEST_DIR" ]]; then
  echo "Usage: $0 <destination-dir>" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
rm -f "$DEST_DIR"/*.tgz

workspaces=(
  credentials
  credentials-same-holder
  credentials-iso-registry
  credentials-openid
  credentials-protocol
  credentials-birth
  credentials-birth-secret
)

cd "$ROOT_DIR"
for workspace in "${workspaces[@]}"; do
  echo "[pack-midnight-vc-libs] Packing ${workspace} -> ${DEST_DIR}"
  npm pack --pack-destination "$DEST_DIR" -w "$workspace"
done
