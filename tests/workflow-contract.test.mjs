import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(path.join(root, '.github/workflows/pages.yml'), 'utf8');

test('deployment remains a manual bot-only action from main', () => {
  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^\s{2}(?:push|pull_request|schedule):/m);
  assert.match(workflow, /github\.actor == 'b10x-bot\[bot\]'/);
  assert.match(workflow, /github\.triggering_actor == 'b10x-bot\[bot\]'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /github\.sha == inputs\.control_sha/);
});

test('the caller pins the accepted immutable Website deployment runtime', () => {
  assert.equal(count('beyond10x/website/.github/workflows/deploy-root.yml@4a09142bebf7174c0ae7363566261bb54b94bbb1'), 1);
  assert.equal(count('uses:'), 1);
  assert.match(workflow, /permissions: \{\}/);
  assert.match(workflow, /control_sha: \$\{\{ inputs\.control_sha \}\}/);
});

test('the minimal caller contains no executable steps or mutable action refs', () => {
  assert.doesNotMatch(workflow, /^\s+steps:/m);
  assert.doesNotMatch(workflow, /\brun:/);
  assert.doesNotMatch(workflow, /uses: .*@(main|master|v\d+)/);
});

function count(value) {
  return workflow.split(value).length - 1;
}
