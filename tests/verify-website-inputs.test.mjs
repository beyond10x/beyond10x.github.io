import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, test} from 'node:test';
import {
  sourceRepositories,
  verifyWebsiteInputs,
} from '../scripts/verify-website-inputs.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, {recursive: true, force: true})));
});

test('grounds both claimed digests in exact files from the Website commit', async () => {
  const fixture = await createFixture();
  const result = await verifyWebsiteInputs(...fixture.paths);

  assert.equal(result.sourceCount, 23);
  assert.equal(result.redirectCount, 1);
  assert.equal(result.sourcesLockSha256, fixture.provenance.sourcesLockSha256);
  assert.equal(result.legacyRoutesSha256, fixture.provenance.legacyRoutesSha256);
});

test('rejects a source-lock digest copied from any other bytes', async () => {
  const fixture = await createFixture({sourcesLockDigest: 'f'.repeat(64)});

  await assert.rejects(verifyWebsiteInputs(...fixture.paths), /sourcesLockSha256 does not match/);
});

test('rejects a legacy-route digest copied from any other bytes', async () => {
  const fixture = await createFixture({legacyRoutesDigest: 'e'.repeat(64)});

  await assert.rejects(verifyWebsiteInputs(...fixture.paths), /legacyRoutesSha256 does not match/);
});

test('requires the exact sorted 23-repository Website roster', async () => {
  const fixture = await createFixture({omitLastRepository: true});

  await assert.rejects(verifyWebsiteInputs(...fixture.paths), /exact sorted 23-repository roster/);
});

test('requires every locked source commit to equal provenance', async () => {
  const fixture = await createFixture({mismatchedProvenanceCommit: true});

  await assert.rejects(verifyWebsiteInputs(...fixture.paths), /do not exactly match provenance/);
});

test('requires the accepted source-lock and legacy-route schemas', async () => {
  const badLock = await createFixture({sourcesLockSchema: 'example.invalid/v1'});
  await assert.rejects(verifyWebsiteInputs(...badLock.paths), /schema b10x-sources\/v1/);

  const badRoutes = await createFixture({legacyRoutesSchema: 'example.invalid/v1'});
  await assert.rejects(verifyWebsiteInputs(...badRoutes.paths), /schema b10x-redirects\/v1/);
});

async function createFixture({
  legacyRoutesDigest,
  legacyRoutesSchema = 'b10x-redirects/v1',
  mismatchedProvenanceCommit = false,
  omitLastRepository = false,
  sourcesLockDigest,
  sourcesLockSchema = 'b10x-sources/v1',
} = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'b10x-website-inputs-'));
  temporaryDirectories.push(root);
  const repositories = omitLastRepository ? sourceRepositories.slice(0, -1) : sourceRepositories;
  const sources = repositories.map((repository) => ({
    repository,
    url: `https://github.com/beyond10x/${repository}`,
    commit: sha256(Buffer.from(`commit:${repository}`)).slice(0, 40),
    manifestPath: 'b10x.docs.yaml',
    manifestSha256: sha256(Buffer.from(`manifest:${repository}`)),
    contentSha256: sha256(Buffer.from(`content:${repository}`)),
  }));
  const sourcesLockBytes = Buffer.from(`${JSON.stringify({schema: sourcesLockSchema, sources}, null, 2)}\n`);
  const legacyRoutesBytes = Buffer.from(`${JSON.stringify({
    schema: legacyRoutesSchema,
    redirects: [{from: '/old', to: '/new/', type: 'html'}],
  }, null, 2)}\n`);
  const sourceCommits = Object.fromEntries(sources.map((source) => [source.repository, source.commit]));
  if (mismatchedProvenanceCommit) sourceCommits.aep = 'a'.repeat(40);
  const provenance = {
    sourcesLockSha256: sourcesLockDigest ?? sha256(sourcesLockBytes),
    legacyRoutesSha256: legacyRoutesDigest ?? sha256(legacyRoutesBytes),
    sourceCommits,
  };
  const provenancePath = path.join(root, 'PROVENANCE.json');
  const sourcesLockPath = path.join(root, 'sources.lock.json');
  const legacyRoutesPath = path.join(root, 'legacy-routes.json');
  await Promise.all([
    writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`),
    writeFile(sourcesLockPath, sourcesLockBytes),
    writeFile(legacyRoutesPath, legacyRoutesBytes),
  ]);
  return {paths: [provenancePath, sourcesLockPath, legacyRoutesPath], provenance};
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
