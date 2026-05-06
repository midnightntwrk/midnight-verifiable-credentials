#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
source "$ROOT_DIR/tooling/scripts/ci-build-output-groups.sh"

root_inputs=(
  package.json
  package-lock.json
  turbo.json
  tsconfig.json
  .eslintrc.json
)

include_file() {
  local path="$1"
  case "$path" in
    *.md|review/*|*/coverage/*|*/dist/*|*/reports/*|*/src/managed/*|*/src/test/*)
      return 1
      ;;
    *)
      return 0
      ;;
  esac
}

inputs=()
groups=("$@")
if [[ ${#groups[@]} -eq 0 ]]; then
  while IFS= read -r group; do
    [[ -z "$group" ]] && continue
    groups+=("$group")
  done < <(ci_build_output_groups)
fi

for path in "${root_inputs[@]}"; do
  if [[ -f "$ROOT_DIR/$path" ]]; then
    inputs+=("$path")
  fi
done

package_inputs=()
for group in "${groups[@]}"; do
  while IFS= read -r package_path; do
    [[ -z "$package_path" ]] && continue
    package_inputs+=("$package_path")
  done < <(ci_build_input_packages "$group")
done

if [[ ${#package_inputs[@]} -gt 0 ]]; then
  while IFS= read -r -d '' path; do
    include_file "$path" || continue
    inputs+=("$path")
  done < <(git -C "$ROOT_DIR" ls-files -z -- "${package_inputs[@]}")
fi

while IFS= read -r -d '' path; do
  include_file "$path" || continue
  inputs+=("$path")
done < <(git -C "$ROOT_DIR" ls-files -z -- tooling/scripts)

if [[ ${#inputs[@]} -eq 0 ]]; then
  echo "[hash-ci-build-inputs] No build inputs found" >&2
  exit 1
fi

hash_manifest="$(mktemp)"
trap 'rm -f "$hash_manifest"' EXIT

while IFS= read -r path; do
  printf '%s\0' "$path" >> "$hash_manifest"
  shasum -a 256 "$ROOT_DIR/$path" | awk '{print $1}' | tr -d '\n' >> "$hash_manifest"
  printf '\0' >> "$hash_manifest"
done < <(printf '%s\n' "${inputs[@]}" | sort -u)

shasum -a 256 "$hash_manifest" | awk '{print $1}'
