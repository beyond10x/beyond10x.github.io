import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, test} from 'node:test';
import {sourceRepositories} from '../scripts/verify-website-inputs.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verifier = path.join(repositoryRoot, 'scripts/verify-git-boundary.sh');
const botName = 'b10x-bot[bot]';
const botEmail = '316511680+b10x-bot[bot]@users.noreply.github.com';
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, {recursive: true, force: true})));
});

test('accepts the exact published bot commit derived from Website main', async () => {
  const fixture = await createFixture();
  const result = runVerifier(fixture);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /verified published head/);
});

test('rejects a revision that is not the current published remote head', async () => {
  const fixture = await createFixture();
  await writeFile(path.join(fixture.publisherWork, 'new-artifact.txt'), 'new publication\n');
  git(['add', 'new-artifact.txt'], fixture.publisherWork);
  git(['commit', '-m', 'Advance published head'], fixture.publisherWork);
  git(['push', 'origin', 'published'], fixture.publisherWork);
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not the current published branch head/);
});

test('requires GitHub to attribute author and committer roles to the bot', async () => {
  const fixture = await createFixture({apiCommitter: 'someone-else'});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /both publisher commit roles/);
});

test('requires the immutable commit metadata itself to use the bot identity', async () => {
  const fixture = await createFixture({committerName: 'Human Operator', committerEmail: 'human@example.test'});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /committer is not the Atlas b10x bot/);
});

test('rejects a non-bot Git author even when the committer is the bot', async () => {
  const fixture = await createFixture({authorName: 'Human Author', authorEmail: 'author@example.test'});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /author is not the Atlas b10x bot/);
});

test('requires GitHub to attribute the Website commit to the bot', async () => {
  const fixture = await createFixture({websiteApiAuthor: 'someone-else'});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /both Website commit roles/);
});

test('requires the Website Git commit itself to use the bot identity', async () => {
  const fixture = await createFixture({websiteAuthorName: 'Human Author', websiteAuthorEmail: 'author@example.test'});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Website commit author is not the Atlas b10x bot/);
});

test('rejects a non-bot Website Git committer even when the author is the bot', async () => {
  const fixture = await createFixture({websiteCommitterName: 'Human Committer', websiteCommitterEmail: 'committer@example.test'});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Website commit committer is not the Atlas b10x bot/);
});

test('rejects a Website commit that is not in Website main history', async () => {
  const fixture = await createFixture({useUnrelatedWebsiteCommit: true});
  const result = runVerifier(fixture);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not exist in Website main history|is not an ancestor/);
});

function runVerifier(fixture) {
  return spawnSync('bash', [
    verifier,
    fixture.artifact,
    fixture.publishedSha,
    fixture.publisherRemote,
    fixture.websiteRemote,
    fixture.apiMetadata,
    fixture.websiteApiMetadata,
  ], {encoding: 'utf8'});
}

async function createFixture({
  apiAuthor = botName,
  apiCommitter = botName,
  authorName = botName,
  authorEmail = botEmail,
  committerName = botName,
  committerEmail = botEmail,
  websiteApiAuthor = botName,
  websiteApiCommitter = botName,
  websiteAuthorName = botName,
  websiteAuthorEmail = botEmail,
  websiteCommitterName = botName,
  websiteCommitterEmail = botEmail,
  useUnrelatedWebsiteCommit = false,
} = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'b10x-pages-git-boundary-'));
  temporaryDirectories.push(root);

  const websiteRemote = path.join(root, 'website.git');
  const websiteWork = path.join(root, 'website-work');
  const sourceInputs = createSourceInputs();
  git(['init', '--bare', websiteRemote]);
  git(['init', '--initial-branch=main', websiteWork]);
  configureIdentity(websiteWork, botName, botEmail);
  await Promise.all([
    writeFile(path.join(websiteWork, 'site.txt'), 'first\n'),
    writeFile(path.join(websiteWork, 'sources.lock.json'), sourceInputs.sourcesLockBytes),
    writeFile(path.join(websiteWork, 'legacy-routes.json'), sourceInputs.legacyRoutesBytes),
  ]);
  git(['add', 'site.txt', 'sources.lock.json', 'legacy-routes.json'], websiteWork);
  git(['commit', '-m', 'Initial Website'], websiteWork, {
    GIT_AUTHOR_NAME: websiteAuthorName,
    GIT_AUTHOR_EMAIL: websiteAuthorEmail,
    GIT_COMMITTER_NAME: websiteCommitterName,
    GIT_COMMITTER_EMAIL: websiteCommitterEmail,
  });
  const websiteCommit = git(['rev-parse', 'HEAD'], websiteWork).trim();
  await writeFile(path.join(websiteWork, 'site.txt'), 'second\n');
  git(['commit', '-am', 'Advance Website'], websiteWork);
  git(['remote', 'add', 'origin', websiteRemote], websiteWork);
  git(['push', 'origin', 'main'], websiteWork);

  git(['switch', '--orphan', 'unrelated'], websiteWork);
  await rm(path.join(websiteWork, 'site.txt'), {force: true});
  await writeFile(path.join(websiteWork, 'unrelated.txt'), 'unrelated\n');
  git(['add', '-A'], websiteWork);
  git(['commit', '-m', 'Unrelated Website history'], websiteWork);
  const unrelatedWebsiteCommit = git(['rev-parse', 'HEAD'], websiteWork).trim();
  git(['push', 'origin', 'unrelated'], websiteWork);

  const publisherRemote = path.join(root, 'publisher.git');
  const publisherWork = path.join(root, 'publisher-work');
  git(['init', '--bare', publisherRemote]);
  git(['init', '--initial-branch=published', publisherWork]);
  configureIdentity(publisherWork, botName, botEmail);
  const selectedWebsiteCommit = useUnrelatedWebsiteCommit ? unrelatedWebsiteCommit : websiteCommit;
  const provenance = {
    websiteCommit: selectedWebsiteCommit,
    sourcesLockSha256: sha256(sourceInputs.sourcesLockBytes),
    legacyRoutesSha256: sha256(sourceInputs.legacyRoutesBytes),
    sourceCommits: sourceInputs.sourceCommits,
  };
  await writeFile(path.join(publisherWork, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`);
  git(['add', 'PROVENANCE.json'], publisherWork);
  git(['commit', '-m', 'Publish Website artifact'], publisherWork, {
    GIT_AUTHOR_NAME: authorName,
    GIT_AUTHOR_EMAIL: authorEmail,
    GIT_COMMITTER_NAME: committerName,
    GIT_COMMITTER_EMAIL: committerEmail,
  });
  const publishedSha = git(['rev-parse', 'HEAD'], publisherWork).trim();
  git(['remote', 'add', 'origin', publisherRemote], publisherWork);
  git(['push', 'origin', 'published'], publisherWork);

  const artifact = path.join(root, 'artifact');
  git(['clone', '--quiet', '--branch', 'published', publisherRemote, artifact]);
  const apiMetadata = path.join(root, 'publisher-commit.json');
  await writeFile(apiMetadata, `${JSON.stringify({
    sha: publishedSha,
    author: {login: apiAuthor},
    committer: {login: apiCommitter},
  }, null, 2)}\n`);
  const websiteApiMetadata = path.join(root, 'website-commit.json');
  await writeFile(websiteApiMetadata, `${JSON.stringify({
    sha: selectedWebsiteCommit,
    author: {login: websiteApiAuthor},
    committer: {login: websiteApiCommitter},
  }, null, 2)}\n`);

  return {
    artifact,
    publishedSha,
    publisherRemote,
    publisherWork,
    websiteRemote,
    apiMetadata,
    websiteApiMetadata,
  };
}

function createSourceInputs() {
  const sources = sourceRepositories.map((repository) => ({
    repository,
    url: `https://github.com/beyond10x/${repository}`,
    commit: sha256(Buffer.from(`commit:${repository}`)).slice(0, 40),
    manifestPath: 'b10x.docs.yaml',
    manifestSha256: sha256(Buffer.from(`manifest:${repository}`)),
    contentSha256: sha256(Buffer.from(`content:${repository}`)),
  }));
  return {
    sourcesLockBytes: Buffer.from(`${JSON.stringify({schema: 'b10x-sources/v1', sources}, null, 2)}\n`),
    legacyRoutesBytes: Buffer.from(`${JSON.stringify({schema: 'b10x-redirects/v1', redirects: []}, null, 2)}\n`),
    sourceCommits: Object.fromEntries(sources.map((source) => [source.repository, source.commit])),
  };
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function configureIdentity(repository, name, email) {
  git(['config', 'user.name', name], repository);
  git(['config', 'user.email', email], repository);
}

function git(args, cwd, environment = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {...process.env, ...environment},
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
