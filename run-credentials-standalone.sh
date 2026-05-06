#!/usr/bin/env bash
set -euo pipefail

source ./tooling/scripts/run-common.sh

run_common_setup_cleanup_trap
run_common_ensure_node
run_common_ensure_runtime_helpers
node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs
node ./tooling/scripts/ensure-midnight-did-api-paths.mjs
node ./tooling/scripts/ensure-compact-package-aliases.mjs
run_common_auto_proof_server_image "credentials-standalone"

if ! docker info >/dev/null 2>&1; then
  echo "[credentials-standalone] Docker is required for standalone Midnight VC validation"
  exit 1
fi

echo "[credentials-standalone] Shared integration prerequisites"
npm run build:integration-prereqs

echo "[credentials-standalone] Demo verifier contract integration"
npm run test:integration:demo-contract

echo "[credentials-standalone] Birth protocol integration"
npm run test:integration:protocol

echo "[credentials-standalone] Done"
