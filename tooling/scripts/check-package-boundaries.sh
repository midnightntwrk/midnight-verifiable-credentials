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

node --input-type=module <<'NODE'
import { readFileSync } from "node:fs";

const readManifest = (path) => JSON.parse(readFileSync(path, "utf8"));
const model = readManifest("packages/core/model/package.json");
const compact = readManifest("packages/core/compact/package.json");
const didBinding = readManifest("packages/credential-did-midnight/package.json");
const internalPrefix = "@midnight-ntwrk/credential-";
const internalDependencies = (manifest) =>
  Object.keys(manifest.dependencies ?? {}).filter((name) =>
    name.startsWith(internalPrefix),
  );

for (const manifest of [model, compact]) {
  if (internalDependencies(manifest).length > 0) {
    throw new Error(`${manifest.name} must remain independent from VC packages`);
  }
}
if (
  JSON.stringify(internalDependencies(didBinding)) !==
    JSON.stringify(["@midnight-ntwrk/credential-compact"]) ||
  didBinding.dependencies["@midnight-ntwrk/credential-compact"] !==
    "workspace:*"
) {
  throw new Error(
    "credential-did-midnight must depend one-way on credential-compact via workspace:*",
  );
}
NODE

echo "[boundary-check] Package graph OK"
