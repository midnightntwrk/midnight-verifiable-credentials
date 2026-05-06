#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

required_paths=(
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
  credentials-offchain-did/dist
  credentials-openid/dist
  credentials-protocol/dist
)

for relative_path in "${required_paths[@]}"; do
  absolute_path="$ROOT_DIR/$relative_path"
  if [[ ! -e "$absolute_path" ]]; then
    echo "[verify-ci-build-outputs] Missing path: $relative_path" >&2
    exit 1
  fi

  if [[ -d "$absolute_path" ]] && [[ -z "$(find "$absolute_path" -mindepth 1 -print -quit)" ]]; then
    echo "[verify-ci-build-outputs] Empty directory: $relative_path" >&2
    exit 1
  fi
done

echo "[verify-ci-build-outputs] Verified ${#required_paths[@]} build output paths"
