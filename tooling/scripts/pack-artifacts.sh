#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DEST_DIR="${1:-$ROOT_DIR/tooling/artifacts/npm}"
SKIP_CONSUMER_TESTS="${2:-}"

if [[ "$DEST_DIR" != /* ]]; then
  DEST_DIR="$PWD/$DEST_DIR"
fi

if [[ -n "$SKIP_CONSUMER_TESTS" && "$SKIP_CONSUMER_TESTS" != "--skip-consumer-tests" ]]; then
  echo "Usage: $0 [destination] [--skip-consumer-tests]" >&2
  exit 2
fi

workspace_output="$(node "$ROOT_DIR/tooling/scripts/workspace-catalog.mjs" --packable-paths)" || {
  echo "[pack-artifacts] Failed to load packable workspaces" >&2
  exit 1
}
if [[ -z "$workspace_output" ]]; then
  echo "[pack-artifacts] Packable workspace catalog is empty" >&2
  exit 1
fi

workspaces=()
while IFS= read -r workspace; do
  if [[ -n "$workspace" ]]; then
    workspaces+=("$workspace")
  fi
done <<< "$workspace_output"
unset workspace_output

mkdir -p "$DEST_DIR"
rm -f "$DEST_DIR"/*.tgz

cd "$ROOT_DIR"
for workspace in "${workspaces[@]}"; do
  echo "[pack-artifacts] Packing ${workspace} -> ${DEST_DIR}"
  pnpm --dir "$workspace" pack --pack-destination "$DEST_DIR"
done

actual_count="$(find "$DEST_DIR" -maxdepth 1 -type f -name '*.tgz' | wc -l | tr -d '[:space:]')"
expected_count="${#workspaces[@]}"
if [[ "$actual_count" != "$expected_count" ]]; then
  echo "[pack-artifacts] Expected ${expected_count} tarballs, found ${actual_count}" >&2
  exit 1
fi
if [[ "$SKIP_CONSUMER_TESTS" == "--skip-consumer-tests" ]]; then
  node "$ROOT_DIR/tooling/scripts/test-release-package-consumers.mjs" --validate-tarballs "$DEST_DIR"
else
  node "$ROOT_DIR/tooling/scripts/test-release-package-consumers.mjs" --tarballs "$DEST_DIR"
fi
echo "[pack-artifacts] Packed ${actual_count} tarballs"
