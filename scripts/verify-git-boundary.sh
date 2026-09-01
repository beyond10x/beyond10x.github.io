#!/usr/bin/env bash

set -euo pipefail

readonly bot_login='b10x-bot[bot]'
readonly bot_email='316511680+b10x-bot[bot]@users.noreply.github.com'

fail() {
  printf 'git boundary verification failed: %s\n' "$*" >&2
  exit 1
}

verify_github_attribution() {
  local metadata_path=$1
  local expected_sha=$2
  local label=$3
  node --input-type=module - "$metadata_path" "$expected_sha" "$bot_login" "$label" <<'NODE'
import {readFileSync} from 'node:fs';

const [metadataPath, expectedSha, expectedLogin, label] = process.argv.slice(2);
let metadata;
try {
  metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
} catch (error) {
  process.stderr.write(`git boundary verification failed: invalid ${label} API metadata: ${error.message}\n`);
  process.exit(1);
}
if (metadata.sha !== expectedSha) {
  process.stderr.write(`git boundary verification failed: ${label} API metadata names a different commit\n`);
  process.exit(1);
}
if (metadata.author?.login !== expectedLogin || metadata.committer?.login !== expectedLogin) {
  process.stderr.write(`git boundary verification failed: GitHub does not attribute both ${label} commit roles to the Atlas b10x bot\n`);
  process.exit(1);
}
NODE
}

if [[ $# -ne 6 ]]; then
  fail 'usage: verify-git-boundary.sh <artifact-directory> <published-sha> <publisher-remote> <website-remote> <publisher-metadata-json> <website-metadata-json>'
fi

readonly artifact_directory=$1
readonly published_sha=$2
readonly publisher_remote=$3
readonly website_remote=$4
readonly publisher_metadata_json=$5
readonly website_metadata_json=$6
script_directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd) \
  || fail 'could not resolve verifier directory'
readonly script_directory

[[ $published_sha =~ ^[0-9a-f]{40}$ && ! $published_sha =~ ^0+$ ]] \
  || fail 'published SHA must be a non-zero full lowercase Git commit'
[[ -d $artifact_directory ]] || fail "artifact directory does not exist: $artifact_directory"
[[ -f $publisher_metadata_json && ! -L $publisher_metadata_json ]] \
  || fail 'publisher commit metadata must be a regular file'
[[ -f $website_metadata_json && ! -L $website_metadata_json ]] \
  || fail 'Website commit metadata must be a regular file'

checked_out_sha=$(git -C "$artifact_directory" rev-parse --verify HEAD^{commit}) \
  || fail 'could not resolve the checked-out artifact commit'
readonly checked_out_sha
[[ $checked_out_sha == "$published_sha" ]] \
  || fail "artifact checkout is $checked_out_sha, expected $published_sha"

published_ref=$(git ls-remote --refs "$publisher_remote" refs/heads/published) \
  || fail 'could not read the publisher remote'
readonly published_ref
[[ -n $published_ref && $published_ref != *$'\n'* ]] \
  || fail 'publisher remote must advertise exactly one published branch head'
readonly remote_sha=${published_ref%%$'\t'*}
readonly remote_ref=${published_ref#*$'\t'}
[[ $remote_ref == 'refs/heads/published' && $remote_sha =~ ^[0-9a-f]{40}$ ]] \
  || fail 'publisher remote returned an invalid published branch head'
[[ $remote_sha == "$published_sha" ]] \
  || fail "requested commit is not the current published branch head ($remote_sha)"

mapfile -t identity < <(git -C "$artifact_directory" show -s --format='%an%n%ae%n%cn%n%ce' "$published_sha")
[[ ${#identity[@]} -eq 4 ]] || fail 'could not read the publisher commit identity'
[[ ${identity[0]} == "$bot_login" && ${identity[1]} == "$bot_email" ]] \
  || fail 'publisher commit author is not the Atlas b10x bot'
[[ ${identity[2]} == "$bot_login" && ${identity[3]} == "$bot_email" ]] \
  || fail 'publisher commit committer is not the Atlas b10x bot'

verify_github_attribution "$publisher_metadata_json" "$published_sha" 'publisher'

website_commit=$(node --input-type=module - "$artifact_directory/PROVENANCE.json" <<'NODE'
import {readFileSync} from 'node:fs';

const provenance = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (typeof provenance.websiteCommit !== 'string') process.exit(1);
process.stdout.write(provenance.websiteCommit);
NODE
) || fail 'could not read websiteCommit from artifact provenance'
readonly website_commit
[[ $website_commit =~ ^[0-9a-f]{40}$ && ! $website_commit =~ ^0+$ ]] \
  || fail 'artifact provenance has an invalid or zero Website commit'

verification_directory=$(mktemp -d)
readonly verification_directory
trap 'rm -rf -- "$verification_directory"' EXIT
readonly verification_repository="$verification_directory/website.git"
git init --bare --quiet "$verification_repository"
git -C "$verification_repository" fetch --quiet --no-tags "$website_remote" \
  '+refs/heads/main:refs/remotes/website/main'
git -C "$verification_repository" cat-file -e "$website_commit^{commit}" 2>/dev/null \
  || fail "Website commit $website_commit does not exist in Website main history"
git -C "$verification_repository" merge-base --is-ancestor \
  "$website_commit" refs/remotes/website/main \
  || fail "Website commit $website_commit is not an ancestor of Website main"

mapfile -t website_identity < <(git -C "$verification_repository" show -s --format='%an%n%ae%n%cn%n%ce' "$website_commit")
[[ ${#website_identity[@]} -eq 4 ]] || fail 'could not read the Website commit identity'
[[ ${website_identity[0]} == "$bot_login" && ${website_identity[1]} == "$bot_email" ]] \
  || fail 'Website commit author is not the Atlas b10x bot'
[[ ${website_identity[2]} == "$bot_login" && ${website_identity[3]} == "$bot_email" ]] \
  || fail 'Website commit committer is not the Atlas b10x bot'
verify_github_attribution "$website_metadata_json" "$website_commit" 'Website'

readonly sources_lock_file="$verification_directory/sources.lock.json"
readonly legacy_routes_file="$verification_directory/legacy-routes.json"
git -C "$verification_repository" show "${website_commit}:sources.lock.json" > "$sources_lock_file" \
  || fail 'could not read sources.lock.json from the verified Website commit'
git -C "$verification_repository" show "${website_commit}:legacy-routes.json" > "$legacy_routes_file" \
  || fail 'could not read legacy-routes.json from the verified Website commit'
node "$script_directory/verify-website-inputs.mjs" \
  "$artifact_directory/PROVENANCE.json" \
  "$sources_lock_file" \
  "$legacy_routes_file"

printf 'verified published head %s and Website main ancestor %s\n' \
  "$published_sha" "$website_commit"
