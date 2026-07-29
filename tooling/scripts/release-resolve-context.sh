#!/usr/bin/env bash
set -euo pipefail

output_file="${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"
event_name="${GITHUB_EVENT_NAME:?GITHUB_EVENT_NAME is required}"
ref_name="${GITHUB_REF_NAME:?GITHUB_REF_NAME is required}"

if [[ "${event_name}" != "workflow_dispatch" ]]; then
  echo "::error::npm publication must be started with workflow_dispatch."
  exit 1
fi

channel="${DISPATCH_CHANNEL:-}"
version="${DISPATCH_VERSION:-}"
rc_index="${DISPATCH_RC_INDEX:-}"

if [[ -n "${version}" && ! "${version}" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
  echo "::error::version must be a stable semantic version such as 0.1.0."
  exit 1
fi

case "${channel}" in
  snapshot)
    if [[ "${ref_name}" != "develop" ]]; then
      echo "::error::snapshot publication is only allowed from develop."
      exit 1
    fi
    if [[ -n "${rc_index}" ]]; then
      echo "::error::rc_index is only valid for rc publication."
      exit 1
    fi
    ;;
  rc)
    if [[ "${ref_name}" != "develop" && "${ref_name}" != "main" ]]; then
      echo "::error::rc publication is only allowed from develop or main."
      exit 1
    fi
    if [[ ! "${rc_index}" =~ ^[1-9][0-9]*$ ]]; then
      echo "::error::rc_index must be a positive integer for rc publication."
      exit 1
    fi
    ;;
  release)
    if [[ "${ref_name}" != "main" ]]; then
      echo "::error::stable publication is only allowed from main."
      exit 1
    fi
    if [[ -n "${rc_index}" ]]; then
      echo "::error::rc_index is only valid for rc publication."
      exit 1
    fi
    ;;
  *)
    echo "::error::unsupported publication channel: ${channel}"
    exit 1
    ;;
esac

{
  echo "channel=${channel}"
  echo "version=${version}"
  echo "rc_index=${rc_index}"
} >> "${output_file}"
