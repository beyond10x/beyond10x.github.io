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
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
});

test('all actions stay pinned to the accepted immutable revisions', () => {
  assert.equal(count('actions/checkout@11d5960a326750d5838078e36cf38b85af677262'), 2);
  assert.equal(count('actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b'), 1);
  assert.equal(count('actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa'), 1);
  assert.equal(count('actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e'), 1);
});

test('controls and immutable artifact use separate checkouts and only _site is uploaded', () => {
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}\n\s+path: \.deployment-controls/);
  assert.match(workflow, /ref: \$\{\{ inputs\.published_sha \}\}\n\s+path: _site/);
  assert.match(workflow, /verify-git-boundary\.sh/);
  assert.match(workflow, /verify-artifact\.mjs _site/);
  assert.match(workflow, /repos\/beyond10x\/website\/commits\/\$WEBSITE_COMMIT/);
  assert.match(workflow, /b10x-pages-verification\/website-commit\.json/);
  assert.match(workflow, /actions\/upload-pages-artifact@[0-9a-f]{40}[\s\S]*?with:\n\s+path: _site/);
  assert.doesNotMatch(workflow, /persist-credentials:\s+true/);
});

function count(value) {
  return workflow.split(value).length - 1;
}
