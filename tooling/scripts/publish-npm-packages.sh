#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
version="${VERSION:?VERSION is required}"
npm_tag="${NPM_TAG:?NPM_TAG is required}"
registry="${NPM_REGISTRY:-https://registry.npmjs.org/}"
publish_access="${NPM_ACCESS:-public}"
artifact_directory="${ARTIFACT_DIRECTORY:-${repo_root}/tooling/artifacts/npm}"
token="${NODE_AUTH_TOKEN:-${NPM_TOKEN:-}}"
promote_latest="${PROMOTE_LATEST:-false}"
npm_command="${NPM_COMMAND:-npm}"

if [[ "${registry}" != "https://registry.npmjs.org/" ]]; then
  echo "::error::public releases must use https://registry.npmjs.org/."
  exit 1
fi
if [[ "${publish_access}" != "public" ]]; then
  echo "::error::supported packages must publish with public access."
  exit 1
fi
if [[ ! "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "::error::VERSION must be a semantic version."
  exit 1
fi
if [[ ! "${npm_tag}" =~ ^[0-9A-Za-z._-]+$ ]]; then
  echo "::error::NPM_TAG contains unsupported characters."
  exit 1
fi
if [[ "${promote_latest}" != "true" && "${promote_latest}" != "false" ]]; then
  echo "::error::PROMOTE_LATEST must be true or false."
  exit 1
fi

npmrc="$(mktemp)"
view_stderr="${npmrc}.view-stderr"
cleanup() {
  rm -f "${npmrc}" "${view_stderr}"
}
trap cleanup EXIT

registry_host="$(node -e 'console.log(new URL(process.argv[1]).host)' "${registry}")"
echo "registry=${registry}" > "${npmrc}"
if [[ -n "${token}" ]]; then
  echo "::add-mask::${token}"
  echo "//${registry_host}/:_authToken=${token}" >> "${npmrc}"
fi
export NPM_CONFIG_USERCONFIG="${npmrc}"

read_tag() {
  local package_name="$1"
  local tag="$2"
  local output
  local stderr_output
  local status

  if output="$("${npm_command}" view "${package_name}" "dist-tags.${tag}" --registry "${registry}" 2>"${view_stderr}")"; then
    stderr_output="$(<"${view_stderr}")"
    if [[ -n "${stderr_output}" ]]; then
      printf '%s\n' "${stderr_output}" >&2
    fi
    printf '%s\n' "${output}"
    return 0
  else
    status=$?
  fi
  stderr_output="$(<"${view_stderr}")"
  if grep -Eq "(E404|404 Not Found)" <<< "${output}"$'\n'"${stderr_output}"; then
    return 0
  fi
  echo "::error::npm view failed for ${package_name} tag ${tag}: ${output}${stderr_output}" >&2
  return "${status}"
}

published_version() {
  local package_name="$1"
  local output
  local stderr_output
  local status

  if output="$("${npm_command}" view "${package_name}@${version}" version --registry "${registry}" 2>"${view_stderr}")"; then
    stderr_output="$(<"${view_stderr}")"
    if [[ -n "${stderr_output}" ]]; then
      printf '%s\n' "${stderr_output}" >&2
    fi
    printf '%s\n' "${output}"
    return 0
  else
    status=$?
  fi
  stderr_output="$(<"${view_stderr}")"
  if grep -Eq "(E404|404 Not Found)" <<< "${output}"$'\n'"${stderr_output}"; then
    return 0
  fi
  echo "::error::npm view failed for ${package_name}@${version}: ${output}${stderr_output}" >&2
  return "${status}"
}

ensure_npm_dist_tags() {
  local package_name="$1"
  local current_latest

  if [[ -z "${token}" ]]; then
    echo "::error::dist-tag updates require the scoped npm token; npm OIDC authorizes publication only." >&2
    return 1
  fi

  echo "[publish-npm-packages] Ensuring ${package_name}@${version} has npm dist-tag ${npm_tag}"
  "${npm_command}" dist-tag add "${package_name}@${version}" "${npm_tag}" --registry "${registry}"
  if [[ "${npm_tag}" == "latest" ]]; then
    return 0
  fi

  current_latest="$(read_tag "${package_name}" latest)"
  if [[ "${promote_latest}" == "true" ]]; then
    echo "[publish-npm-packages] Promoting ${package_name}@${version} to latest"
    "${npm_command}" dist-tag add "${package_name}@${version}" latest --registry "${registry}"
  elif [[ "${current_latest}" == "${version}" ]]; then
    echo "[publish-npm-packages] Removing unintended latest tag from ${package_name}@${version}"
    "${npm_command}" dist-tag rm "${package_name}" latest --registry "${registry}"
  fi
}

workspaces=()
while IFS= read -r workspace; do
  if [[ -n "${workspace}" ]]; then
    workspaces+=("${workspace}")
  fi
done < <(
  node "${repo_root}/tooling/scripts/workspace-catalog.mjs" --publishable-paths
)
if [[ "${#workspaces[@]}" -eq 0 ]]; then
  echo "::error::workspace catalog has no supported publishable packages."
  exit 1
fi

for workspace in "${workspaces[@]}"; do
  package_json="${repo_root}/${workspace}/package.json"
  package_name="$(node -e 'const fs = require("node:fs"); const value = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); console.log(value.name);' "${package_json}")"
  package_version="$(node -e 'const fs = require("node:fs"); const value = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); console.log(value.version);' "${package_json}")"
  tarball_name="${package_name#@}"
  tarball_name="${tarball_name/\//-}-${version}.tgz"
  tarball_path="${artifact_directory}/${tarball_name}"

  if [[ "${package_version}" != "${version}" ]]; then
    echo "::error::${package_name} manifest version ${package_version} does not match ${version}."
    exit 1
  fi
  if [[ ! -f "${tarball_path}" ]]; then
    echo "::error::tested tarball is missing: ${tarball_path}."
    exit 1
  fi

  existing_version="$(published_version "${package_name}")"
  if [[ "${existing_version}" == "${version}" ]]; then
    current_tag="$(read_tag "${package_name}" "${npm_tag}")"
    if [[ "${current_tag}" == "${version}" ]]; then
      echo "[publish-npm-packages] ${package_name}@${version} and tag ${npm_tag} already exist; checking dist-tags."
    else
      echo "[publish-npm-packages] ${package_name}@${version} exists; repairing ${npm_tag}."
    fi
    ensure_npm_dist_tags "${package_name}"
    continue
  fi

  echo "[publish-npm-packages] Publishing tested ${tarball_name} with tag ${npm_tag}."
  "${npm_command}" publish "${tarball_path}" \
    --access "${publish_access}" \
    --provenance \
    --registry "${registry}" \
    --tag "${npm_tag}"
  ensure_npm_dist_tags "${package_name}"
done
