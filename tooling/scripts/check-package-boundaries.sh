#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "[boundary-check] Verifying workspaces do not import sibling sources"

readonly pattern='\.\./(\.\./)*[^./][^/]*/src/'
readonly -a search_args=(
  --glob '*.{js,mjs,cjs,ts,tsx,jsx}'
  --glob '!**/node_modules/**'
  --glob '!**/dist/**'
  --glob '!**/coverage/**'
  --glob '!**/reports/**'
)

if command -v rg >/dev/null 2>&1; then
  set +e
  matches="$(rg -n "${search_args[@]}" "${pattern}" . 2>&1)"
  status=$?
  set -e
else
  set +e
  matches="$(grep -nE --recursive --binary-files=without-match \
    --include='*.js' --include='*.mjs' --include='*.cjs' \
    --include='*.ts' --include='*.tsx' --include='*.jsx' \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
    --exclude-dir=reports "${pattern}" . 2>&1)"
  status=$?
  set -e
fi

if [[ "${status}" -gt 1 ]]; then
  printf '%s\n' "${matches}" >&2
  exit "${status}"
fi

if [[ "${status}" -eq 0 ]]; then
  echo "[boundary-check] Forbidden sibling source imports detected:"
  printf '%s\n' "${matches}"
  echo "[boundary-check] Import from package exports instead." >&2
  exit 1
fi

echo "[boundary-check] OK"
