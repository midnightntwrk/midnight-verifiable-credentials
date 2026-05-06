#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
if [[ $# -eq 0 ]]; then
  echo "[restore-ci-build-outputs] usage: restore-ci-build-outputs.sh <archive.tar.gz> [archive.tar.gz ...]" >&2
  exit 1
fi

for archive_path in "$@"; do
  if [[ ! -f "$archive_path" ]]; then
    echo "[restore-ci-build-outputs] Archive not found: $archive_path" >&2
    exit 1
  fi

  tar -C "$ROOT_DIR" -xzf "$archive_path"
  echo "[restore-ci-build-outputs] Restored build outputs from $archive_path"
done
