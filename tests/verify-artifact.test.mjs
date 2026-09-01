import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, test} from 'node:test';
import {
  artifactFacts,
  canonicalJson,
  deploymentFromProvenance,
  sha256,
  verifyArtifact,
} from '../scripts/verify-artifact.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, {recursive: true, force: true})));
});

test('accepts an exact production artifact and all cross-checked metadata', async () => {
  const {root, provenance} = await createArtifact();
  const result = await verifyArtifact(root);

  assert.equal(result.websiteCommit, provenance.websiteCommit);
  assert.equal(result.sourceCount, 2);
  assert.equal(result.routeCount, 2);
  assert.equal(result.fileCount, 4);
  assert.equal(result.artifactSha256, provenance.artifactSha256);
});

test('uses the Website contract file ordering, routes, and digest formulas exactly', async () => {
  const {root} = await createArtifact();
  const facts = await artifactFacts(root);

  assert.deepEqual(facts, {
    files: [
      {path: '404.html', sha256: 'd22047afb6d676fbf3a81f1a8d3673b11533db87faf637f3cb2462c598ebe1a5', size: 19},
      {path: 'asset.txt', sha256: 'd4e4877bac978b7952f0d544fc52ebff5411d351d129f1f056fa43f11da9af2b', size: 8},
      {path: 'guide/index.html', sha256: 'cbb8b557a33831cf58019935e8bdf076d65542e0e77e2cf6aaa9ac7e61d99732', size: 15},
      {path: 'index.html', sha256: '0baa1cf4be508c24f0bb5007d05095d89071d30302a089513fd8629dd68629b6', size: 19},
    ],
    routes: ['/', '/guide/'],
    artifactSha256: '5b2ff318704836a1efa94de34f3424970e1dd5d485747b77546798f92fba32d0',
    routesSha256: '9da92a3a93820adece04268c7ca31b2997d4f0d6c43f896257973b2092e70741',
  });
});

test('requires byte-identical public provenance', async () => {
  const {root} = await createArtifact();
  await writeFile(path.join(root, '.well-known/b10x-docs.json'), '{}\n');

  await assert.rejects(verifyArtifact(root), /differ byte-for-byte/);
});

test('detects payload tampering independently of declared metadata', async () => {
  const {root} = await createArtifact();
  await writeFile(path.join(root, 'index.html'), '<h1>tampered</h1>\n');

  await assert.rejects(verifyArtifact(root), /file inventory does not match/);
});

test('cross-checks the route digest against the actual routes', async () => {
  const {root, provenance} = await createArtifact();
  const changed = {...provenance, routesSha256: 'f'.repeat(64)};
  await writeProvenance(root, changed);

  await assert.rejects(verifyArtifact(root), /routesSha256 does not match/);
});

test('requires exact canonical deployment metadata', async () => {
  const {root, provenance} = await createArtifact();
  const deployment = {...deploymentFromProvenance(provenance), routeCount: 999};
  await writeFile(path.join(root, '._b10x/deployment.json'), canonicalJson(deployment));

  await assert.rejects(verifyArtifact(root), /does not exactly match/);
});

test('rejects bootstrap provenance at the public deployment boundary', async () => {
  const {root, provenance} = await createArtifact();
  const bootstrap = {...provenance, bootstrap: true};
  await writeProvenance(root, bootstrap);

  await assert.rejects(verifyArtifact(root), /production provenance, not bootstrap/);
});

test('requires a nonempty rooted route inventory', async () => {
  const {root} = await createArtifact({routes: false});

  await assert.rejects(verifyArtifact(root), /routes must be a nonempty array/);
});

async function createArtifact({routes = true} = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'b10x-pages-artifact-'));
  temporaryDirectories.push(root);
  await Promise.all([
    mkdir(path.join(root, '.well-known'), {recursive: true}),
    mkdir(path.join(root, '._b10x'), {recursive: true}),
  ]);
  if (routes) {
    await mkdir(path.join(root, 'guide'), {recursive: true});
    await Promise.all([
      writeFile(path.join(root, 'index.html'), '<h1>beyond10x</h1>\n'),
      writeFile(path.join(root, 'guide/index.html'), '<h1>Guide</h1>\n'),
      writeFile(path.join(root, '404.html'), '<h1>Not found</h1>\n'),
      writeFile(path.join(root, 'asset.txt'), 'payload\n'),
    ]);
  } else {
    await writeFile(path.join(root, 'asset.txt'), 'payload without a route\n');
  }

  const facts = await artifactFacts(root);
  const provenance = {
    schema: 'b10x-website-provenance/v1',
    websiteCommit: '1'.repeat(40),
    sourcesLockSha256: sha256(Buffer.from('source lock\n')),
    legacyRoutesSha256: sha256(Buffer.from('legacy routes\n')),
    routesSha256: facts.routesSha256,
    artifactSha256: facts.artifactSha256,
    sourceCommits: {
      atlas: '2'.repeat(40),
      website: '3'.repeat(40),
    },
    routes: facts.routes,
    files: facts.files,
  };
  await writeProvenance(root, provenance);
  return {root, provenance};
}

async function writeProvenance(root, provenance) {
  const bytes = canonicalJson(provenance);
  await Promise.all([
    writeFile(path.join(root, 'PROVENANCE.json'), bytes),
    writeFile(path.join(root, '.well-known/b10x-docs.json'), bytes),
    writeFile(path.join(root, '._b10x/deployment.json'), canonicalJson(deploymentFromProvenance(provenance))),
  ]);
  assert.deepEqual(await readFile(path.join(root, 'PROVENANCE.json')), await readFile(path.join(root, '.well-known/b10x-docs.json')));
}
