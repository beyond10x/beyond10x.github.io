#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {lstat, readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const provenancePath = 'PROVENANCE.json';
const publicProvenancePath = '.well-known/b10x-docs.json';
const deploymentPath = '._b10x/deployment.json';
const metadataPaths = new Set([provenancePath, publicProvenancePath, deploymentPath]);
const provenanceKeys = [
  'schema',
  'websiteCommit',
  'sourcesLockSha256',
  'legacyRoutesSha256',
  'routesSha256',
  'artifactSha256',
  'sourceCommits',
  'routes',
  'files',
];
const hex40 = /^[0-9a-f]{40}$/;
const hex64 = /^[0-9a-f]{64}$/;

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'));
}

export function assertPortableRelativePath(value, label = 'path') {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('\\') || /[?#]/.test(value) || /%(?:2e|2f|5c)/i.test(value) || /\p{Cc}/u.test(value)) {
    throw new Error(`${label} is not a portable relative path: ${String(value)}`);
  }
  const segments = value.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`${label} is not canonical: ${value}`);
  }
  if (segments.some((segment) => ['.git', '.gitattributes', '.gitignore'].includes(segment.toLowerCase()))) {
    throw new Error(`${label} contains forbidden Git metadata: ${value}`);
  }
  return value;
}

export function deploymentFromProvenance(provenance) {
  return {
    schema: 'b10x-docs-deployment/v1',
    websiteCommit: provenance.websiteCommit,
    sourcesLockSha256: provenance.sourcesLockSha256,
    legacyRoutesSha256: provenance.legacyRoutesSha256,
    routesSha256: provenance.routesSha256,
    artifactSha256: provenance.artifactSha256,
    sourceCount: Object.keys(provenance.sourceCommits).length,
    routeCount: provenance.routes.length,
    fileCount: provenance.files.length,
    bootstrap: provenance.bootstrap === true,
  };
}

export async function artifactFacts(root) {
  const files = [];
  for (const file of await walk(root)) {
    if (metadataPaths.has(file.relative)) continue;
    const bytes = await readFile(file.absolute);
    files.push({path: file.relative, sha256: sha256(bytes), size: bytes.byteLength});
  }
  files.sort((left, right) => compareUtf8(left.path, right.path));
  const routes = files
    .map((file) => file.path)
    .filter((file) => file.endsWith('.html') && file !== '404.html')
    .map((file) => file === 'index.html'
      ? '/'
      : file.endsWith('/index.html')
        ? `/${file.slice(0, -'index.html'.length)}`
        : `/${file}`)
    .sort(compareUtf8);
  return {
    files,
    routes,
    artifactSha256: sha256(Buffer.from(files.map((file) => `${file.sha256}  ${file.path}\n`).join(''))),
    routesSha256: sha256(Buffer.from(`${routes.join('\n')}\n`)),
  };
}

export async function verifyArtifact(root) {
  const artifactRoot = path.resolve(root);
  const rootStat = await lstat(artifactRoot);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error('artifact root must be a real directory');
  }

  const [provenanceBytes, publicProvenanceBytes] = await Promise.all([
    readRequiredRegularFile(artifactRoot, provenancePath),
    readRequiredRegularFile(artifactRoot, publicProvenancePath),
    readRequiredRegularFile(artifactRoot, deploymentPath),
  ]);
  if (!provenanceBytes.equals(publicProvenanceBytes)) {
    throw new Error('PROVENANCE.json and .well-known/b10x-docs.json differ byte-for-byte');
  }

  const provenance = parseJson(provenanceBytes, provenancePath);
  requirePlainObject(provenance, provenancePath);
  if (provenanceBytes.toString('utf8') !== canonicalJson(provenance)) {
    throw new Error(`${provenancePath} is not canonical JSON`);
  }
  if (Object.hasOwn(provenance, 'bootstrap')) {
    throw new Error('published artifacts must use production provenance, not bootstrap provenance');
  }
  assertExactKeys(provenance, provenanceKeys, provenancePath);
  if (provenance.schema !== 'b10x-website-provenance/v1') {
    throw new Error('invalid website provenance schema');
  }
  requireNonzeroHex(provenance.websiteCommit, hex40, 'websiteCommit');
  for (const field of ['sourcesLockSha256', 'legacyRoutesSha256', 'routesSha256', 'artifactSha256']) {
    requireNonzeroHex(provenance[field], hex64, field);
  }
  validateSourceCommits(provenance.sourceCommits);
  if (!Array.isArray(provenance.files) || provenance.files.length === 0) {
    throw new Error('provenance files must be a nonempty array');
  }
  if (!Array.isArray(provenance.routes) || provenance.routes.length === 0) {
    throw new Error('provenance routes must be a nonempty array');
  }

  const facts = await artifactFacts(artifactRoot);
  if (facts.files.length === 0) throw new Error('published artifact contains no payload files');
  if (facts.routes.length === 0) throw new Error('published artifact contains no routes');
  if (facts.routes[0] !== '/' || new Set(facts.routes).size !== facts.routes.length) {
    throw new Error('published routes must be unique and include the root route');
  }
  for (const route of facts.routes) {
    if (!route.startsWith('/')) throw new Error(`published route is not rooted: ${route}`);
  }

  if (canonicalJson(provenance.files) !== canonicalJson(facts.files)) {
    throw new Error('provenance file inventory does not match the artifact bytes');
  }
  if (canonicalJson(provenance.routes) !== canonicalJson(facts.routes)) {
    throw new Error('provenance route inventory does not match the artifact files');
  }
  if (provenance.artifactSha256 !== facts.artifactSha256) {
    throw new Error('provenance artifactSha256 does not match the artifact bytes');
  }
  if (provenance.routesSha256 !== facts.routesSha256) {
    throw new Error('provenance routesSha256 does not match the route inventory');
  }

  const deploymentBytes = await readRequiredRegularFile(artifactRoot, deploymentPath);
  const expectedDeployment = canonicalJson(deploymentFromProvenance(provenance));
  if (deploymentBytes.toString('utf8') !== expectedDeployment) {
    throw new Error('._b10x/deployment.json does not exactly match the verified provenance');
  }

  return {
    websiteCommit: provenance.websiteCommit,
    sourceCount: Object.keys(provenance.sourceCommits).length,
    routeCount: facts.routes.length,
    fileCount: facts.files.length,
    artifactSha256: facts.artifactSha256,
  };
}

async function walk(root, directory = root) {
  const output = [];
  const entries = await readdir(directory, {withFileTypes: true});
  entries.sort((left, right) => compareUtf8(left.name, right.name));
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (relative === '.git') continue;
    assertPortableRelativePath(relative, 'artifact path');
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`artifact contains a symbolic link: ${relative}`);
    if (stat.isDirectory()) output.push(...await walk(root, absolute));
    else if (stat.isFile()) output.push({absolute, relative});
    else throw new Error(`artifact contains a non-regular entry: ${relative}`);
  }
  return output;
}

async function readRequiredRegularFile(root, relative) {
  const absolute = path.join(root, ...relative.split('/'));
  let stat;
  try {
    stat = await lstat(absolute);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`required artifact metadata is missing: ${relative}`);
    throw error;
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`required artifact metadata is not a regular file: ${relative}`);
  }
  return readFile(absolute);
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function requirePlainObject(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must contain a JSON object`);
  }
}

function assertExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort(compareUtf8);
  const wanted = [...expected].sort(compareUtf8);
  if (actual.join('\n') !== wanted.join('\n')) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function requireNonzeroHex(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value) || /^0+$/.test(value)) {
    throw new Error(`${label} must be a non-zero lowercase hexadecimal digest`);
  }
}

function validateSourceCommits(sourceCommits) {
  requirePlainObject(sourceCommits, 'sourceCommits');
  const repositories = Object.keys(sourceCommits);
  if (repositories.length === 0) throw new Error('sourceCommits must not be empty');
  if (repositories.join('\n') !== [...repositories].sort(compareUtf8).join('\n')) {
    throw new Error('sourceCommits must be sorted by repository name');
  }
  for (const repository of repositories) {
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(repository)) {
      throw new Error(`sourceCommits contains an invalid repository name: ${repository}`);
    }
    requireNonzeroHex(sourceCommits[repository], hex40, `sourceCommits.${repository}`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = process.argv[2];
  if (!root || process.argv.length !== 3) {
    process.stderr.write('usage: node scripts/verify-artifact.mjs <artifact-directory>\n');
    process.exitCode = 2;
  } else {
    try {
      const result = await verifyArtifact(root);
      process.stdout.write(`verified ${result.routeCount} routes, ${result.fileCount} files, ${result.sourceCount} sources, and artifact ${result.artifactSha256}\n`);
    } catch (error) {
      process.stderr.write(`artifact verification failed: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
