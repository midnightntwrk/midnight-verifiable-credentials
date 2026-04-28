#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESTINATION=""

usage() {
  cat >&2 <<USAGE
Usage: $0 --destination <path>

Refresh local packed VC dependencies from the midnight-verifiable-credentials repository.

Arguments:
  --destination <path>  Target examples repo root, libs root, or concrete output dir
USAGE
}

resolve_dest_dir() {
  local destination="$1"

  if [[ -d "$destination/libs" ]] || [[ -f "$destination/package.json" ]]; then
    printf '%s/libs/midnight-verifiable-credentials\n' "$destination"
  elif [[ "$(basename "$destination")" == "libs" ]]; then
    printf '%s/midnight-verifiable-credentials\n' "$destination"
  else
    printf '%s\n' "$destination"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --destination)
      DESTINATION="${2:-}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[upgrade-libs] Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

if [[ -z "$DESTINATION" ]]; then
  usage
  exit 1
fi

VC_DEST="$(resolve_dest_dir "$DESTINATION")"
"$ROOT_DIR/scripts/pack-midnight-vc-libs.sh" "$VC_DEST"
echo "[upgrade-libs] VC tarballs refreshed in $VC_DEST"
