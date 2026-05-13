#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

readonly boundary_scan_root="."
readonly -a rg_args=(
  --glob '*.{js,mjs,cjs,ts,tsx,jsx}'
  --glob '!**/node_modules/**'
  --glob '!**/dist/**'
  --glob '!**/coverage/**'
  --glob '!**/reports/**'
)
readonly -a grep_args=(
  --recursive
  --line-number
  --binary-files=without-match
  --include='*.js'
  --include='*.mjs'
  --include='*.cjs'
  --include='*.ts'
  --include='*.tsx'
  --include='*.jsx'
  --exclude-dir=node_modules
  --exclude-dir=dist
  --exclude-dir=coverage
  --exclude-dir=reports
)

readonly sibling_managed_contract_pattern='\.\./(\.\./)*[^./][^/]*/src/managed/.+/contract/index\.js'
readonly sibling_testing_surface_pattern='\.\./(\.\./)*[^./][^/]*/src/testing\.js'
readonly sibling_source_pattern='\.\./(\.\./)*[^./][^/]*/src/'
readonly root_contract_namespace_pattern='^export \* as .+Contract from "\./managed/.+/contract/index\.js";$'
readonly -a root_contract_surface_files=(
  core/primitives/credentials/src/index.ts
  prototypes/credential-families/birth/src/index.ts
  prototypes/credential-families/birth-secret/src/index.ts
  prototypes/credential-families/hello-family/src/index.ts
  prototypes/credential-families/dummy-claims/src/index.ts
  prototypes/credential-families/university-diploma/src/index.ts
  use-cases/age-gate/contract/src/index.ts
  use-cases/hello-verifier/contract/src/index.ts
  core/capabilities/same-holder/src/index.ts
)

echo "[boundary-check] Verifying workspace consumers do not import sibling package sources"

run_boundary_search() {
  local pattern="$1"
  local output

  if command -v rg >/dev/null 2>&1; then
    set +e
    output="$(rg -n "${rg_args[@]}" "${pattern}" "${boundary_scan_root}" 2>&1)"
    local status=$?
    set -e

    case "${status}" in
      0|1)
        printf '%s' "${output}"
        ;;
      *)
        echo "[boundary-check] rg failed while scanning for pattern: ${pattern}" >&2
        printf '%s\n' "${output}" >&2
        exit 2
        ;;
    esac
    return
  fi

  set +e
  output="$(grep -nE "${pattern}" "${grep_args[@]}" "${boundary_scan_root}" 2>&1)"
  local status=$?
  set -e

  case "${status}" in
    0|1)
      printf '%s' "${output}"
      ;;
    *)
      echo "[boundary-check] grep failed while scanning for pattern: ${pattern}" >&2
      printf '%s\n' "${output}" >&2
      exit 2
      ;;
  esac
}

run_file_search() {
  local pattern="$1"
  shift
  local output

  if command -v rg >/dev/null 2>&1; then
    set +e
    output="$(rg -n "${pattern}" "$@" 2>&1)"
    local status=$?
    set -e

    case "${status}" in
      0|1)
        printf '%s' "${output}"
        ;;
      *)
        echo "[boundary-check] rg failed while scanning explicit files for pattern: ${pattern}" >&2
        printf '%s\n' "${output}" >&2
        exit 2
        ;;
    esac
    return
  fi

  set +e
  output="$(grep -nE "${pattern}" "$@" 2>&1)"
  local status=$?
  set -e

  case "${status}" in
    0|1)
      printf '%s' "${output}"
      ;;
    *)
      echo "[boundary-check] grep failed while scanning explicit files for pattern: ${pattern}" >&2
      printf '%s\n' "${output}" >&2
      exit 2
      ;;
  esac
}

managed_matches="$(run_boundary_search "${sibling_managed_contract_pattern}")"
testing_matches="$(run_boundary_search "${sibling_testing_surface_pattern}")"
source_matches="$(run_boundary_search "${sibling_source_pattern}")"
root_contract_namespace_matches="$(
  run_file_search "${root_contract_namespace_pattern}" "${root_contract_surface_files[@]}"
)"
if [[ -n "${source_matches}" ]]; then
  source_matches="$(printf '%s\n' "${source_matches}" | grep -vE '/src/managed/.+/contract/index\.js|/src/testing\.js' || true)"
fi
found_violation=0

if [[ -n "${managed_matches}" ]]; then
  echo "[boundary-check] Forbidden sibling managed-contract source imports detected:"
  printf '%s\n' "${managed_matches}"
  echo
  echo "[boundary-check] Use exported package surfaces such as:"
  echo "  @midnight-ntwrk/<package>/managed/.../contract/index.js"
  found_violation=1
fi

if [[ -n "${testing_matches}" ]]; then
  echo "[boundary-check] Forbidden sibling testing source imports detected:"
  printf '%s\n' "${testing_matches}"
  echo
  echo "[boundary-check] Use exported package testing surfaces instead of sibling src/testing.js paths."
  found_violation=1
fi

if [[ -n "${source_matches}" ]]; then
  echo "[boundary-check] Forbidden sibling package source imports detected:"
  printf '%s\n' "${source_matches}"
  echo
  echo "[boundary-check] Import from exported package entrypoints or dedicated testing surfaces instead of ../<package>/src/... paths."
  found_violation=1
fi

if [[ -n "${root_contract_namespace_matches}" ]]; then
  echo "[boundary-check] Forbidden duplicate root contract namespace exports detected:"
  printf '%s\n' "${root_contract_namespace_matches}"
  echo
  echo "[boundary-check] Use stable subpaths such as ./contract or ./contract-revocation instead of re-introducing root *Contract namespace aliases."
  found_violation=1
fi

if [[ "${found_violation}" -ne 0 ]]; then
  exit 1
fi

echo "[boundary-check] OK"
