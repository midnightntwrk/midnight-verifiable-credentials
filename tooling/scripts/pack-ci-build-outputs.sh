#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
source "$ROOT_DIR/tooling/scripts/ci-build-output-groups.sh"

DEST_DIR="${1:-$ROOT_DIR/.artifacts/ci-build-outputs}"
shift || true

groups=("$@")
if [[ ${#groups[@]} -eq 0 ]]; then
  while IFS= read -r group; do
    [[ -z "$group" ]] && continue
    groups+=("$group")
  done < <(ci_build_output_groups)
fi

mkdir -p "$DEST_DIR"

for group in "${groups[@]}"; do
  existing_paths=()
  while IFS= read -r relative_path; do
    [[ -z "$relative_path" ]] && continue
    if [[ -e "$ROOT_DIR/$relative_path" ]]; then
      existing_paths+=("$relative_path")
    fi
  done < <(ci_build_output_paths "$group")

  if [[ ${#existing_paths[@]} -eq 0 ]]; then
    echo "[pack-ci-build-outputs] No build outputs found for group: $group" >&2
    exit 1
  fi

  archive_path="$DEST_DIR/ci-build-${group}.tar.gz"
  rm -f "$archive_path"
  tar -C "$ROOT_DIR" -czf "$archive_path" "${existing_paths[@]}"
  echo "[pack-ci-build-outputs] Packed group '$group' with ${#existing_paths[@]} paths into $archive_path"
done
