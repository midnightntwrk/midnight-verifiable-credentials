#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
DEST_DIR="${1:-}"

if [[ -z "$DEST_DIR" ]]; then
  echo "Usage: $0 <destination-dir>" >&2
  exit 1
fi

"$ROOT_DIR/tooling/scripts/pack-artifacts.sh" "$DEST_DIR"
