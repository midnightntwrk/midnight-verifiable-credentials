#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST_DIR="${1:-}"

if [[ -z "$DEST_DIR" ]]; then
  echo "Usage: $0 <destination-dir>" >&2
  exit 1
fi

"$ROOT_DIR/scripts/pack-artifacts.sh" "$DEST_DIR"
