#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-$(git rev-parse --show-toplevel)}"
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

verify_managed_dist_mirror() {
  local source_root="$1"
  local dist_root="${source_root%/src/managed}/dist/managed"

  if [[ ! -d "$dist_root" ]]; then
    echo "[verify-ci-build-outputs] Missing dist mirror: ${dist_root#"$ROOT_DIR/"}" >&2
    exit 1
  fi

  while IFS= read -r -d '' source_file; do
    local relative_file="${source_file#"$source_root/"}"
    # The artifact manifest validates source-side reuse only. Package build
    # scripts intentionally omit it from published dist/managed mirrors.
    [[ "$relative_file" == ".compact-artifact.json" ]] && continue
    if [[ ! -f "$dist_root/$relative_file" ]]; then
      echo "[verify-ci-build-outputs] Missing dist mirror file: ${dist_root#"$ROOT_DIR/"}/$relative_file" >&2
      exit 1
    fi
  done < <(find "$source_root" -type f -print0)
}

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

    if [[ "$relative_path" == */src/managed ]]; then
      verify_managed_dist_mirror "$absolute_path"
    fi
  fi
done

echo "[verify-ci-build-outputs] Verified ${#required_paths[@]} build output paths across ${#groups[@]} groups"
