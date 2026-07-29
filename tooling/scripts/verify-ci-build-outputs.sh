#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
source "$ROOT_DIR/tooling/scripts/ci-build-output-groups.sh"

groups=("$@")
if [[ ${#groups[@]} -eq 0 ]]; then
  while IFS= read -r group; do
    [[ -z "$group" ]] && continue
    groups+=("$group")
  done < <(ci_build_output_groups)
fi

required_paths=()
for group in "${groups[@]}"; do
  while IFS= read -r relative_path; do
    [[ -z "$relative_path" ]] && continue
    required_paths+=("$relative_path")
  done < <(ci_build_output_paths "$group")
done

for relative_path in "${required_paths[@]}"; do
  absolute_path="$ROOT_DIR/$relative_path"
  if [[ ! -e "$absolute_path" ]]; then
    echo "[verify-ci-build-outputs] Missing path: $relative_path" >&2
    exit 1
  fi

  if [[ -d "$absolute_path" ]]; then
    if [[ -z "$(find "$absolute_path" -type f -print -quit)" ]]; then
      echo "[verify-ci-build-outputs] Directory has no files: $relative_path" >&2
      exit 1
    fi

    if [[ "$relative_path" == */src/managed ]] && [[ -z "$(find "$absolute_path" -path '*/compiler/contract-info.json' -print -quit)" ]]; then
      echo "[verify-ci-build-outputs] Missing compiler metadata in: $relative_path" >&2
      exit 1
    fi
  fi
done

echo "[verify-ci-build-outputs] Verified ${#required_paths[@]} build output paths across ${#groups[@]} groups"
