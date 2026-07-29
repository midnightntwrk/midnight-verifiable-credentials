#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
node ./tooling/scripts/check-run-target-catalog.mjs
