#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"

root_inputs=(
  package.json
  package-lock.json
  turbo.json
  tsconfig.json
  .eslintrc.json
)

package_inputs=(
  credentials
  credentials-status-registry
  credentials-same-holder
  credentials-iso-registry
  credentials-offchain-did
  credentials-openid
  credentials-birth
  credentials-birth-secret
  credentials-demo-contract
  credentials-protocol
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

for path in "${root_inputs[@]}"; do
  if [[ -f "$ROOT_DIR/$path" ]]; then
    inputs+=("$path")
  fi
done

while IFS= read -r -d '' path; do
  include_file "$path" || continue
  inputs+=("$path")
done < <(git -C "$ROOT_DIR" ls-files -z -- "${package_inputs[@]}")

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
