#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
DEST_PATH="${1:-$ROOT_DIR/.artifacts/ci-build-outputs.tar.gz}"

paths=(
  credentials/src/managed
  credentials/dist
  credentials-status-registry/src/managed
  credentials-status-registry/dist
  credentials-same-holder/src/managed
  credentials-same-holder/dist
  credentials-iso-registry/src/managed
  credentials-iso-registry/dist
  credentials-birth/src/managed
  credentials-birth/dist
  credentials-birth-secret/src/managed
  credentials-birth-secret/dist
  credentials-demo-contract/src/managed
  credentials-demo-contract/dist
  components/adapters/offchain-did/dist
  protocols/openid/dist
  components/orchestration/protocol/dist
)

existing_paths=()
for relative_path in "${paths[@]}"; do
  if [[ -e "$ROOT_DIR/$relative_path" ]]; then
    existing_paths+=("$relative_path")
  fi
done

if [[ ${#existing_paths[@]} -eq 0 ]]; then
  echo "[pack-ci-build-outputs] No build outputs found to archive" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST_PATH")"
rm -f "$DEST_PATH"

tar -C "$ROOT_DIR" -czf "$DEST_PATH" "${existing_paths[@]}"

echo "[pack-ci-build-outputs] Packed ${#existing_paths[@]} paths into $DEST_PATH"
