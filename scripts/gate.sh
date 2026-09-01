#!/usr/bin/env bash

set -euo pipefail

repository_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
readonly repository_root

bash -n "$repository_root/scripts/verify-git-boundary.sh"
node --check "$repository_root/scripts/verify-artifact.mjs"
node --check "$repository_root/scripts/verify-website-inputs.mjs"
node --test "$repository_root"/tests/*.test.mjs
