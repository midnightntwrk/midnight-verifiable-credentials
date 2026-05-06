#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE_PATH="${1:?usage: restore-ci-build-outputs.sh <archive.tar.gz>}"

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "[restore-ci-build-outputs] Archive not found: $ARCHIVE_PATH" >&2
  exit 1
fi

tar -C "$ROOT_DIR" -xzf "$ARCHIVE_PATH"

echo "[restore-ci-build-outputs] Restored build outputs from $ARCHIVE_PATH"
