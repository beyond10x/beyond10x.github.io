#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const sourceRepositories = Object.freeze([
  'aep',
  'aep-service',
  'agent-platform',
  'agentic-principles',
  'agentplugins',
  'connectors',
  'devcenter',
  'docs-system',
  'entity-runtime',
  'ess',
  'eventlog',
  'harness',
  'identity',
  'metaharness',
  'research',
  'secrets',
  'substrate',
  'workflow',
  'worktree',
]);

const hex40 = /^[0-9a-f]{40}$/;
const hex64 = /^[0-9a-f]{64}$/;

export async function verifyWebsiteInputs(provenancePath, sourcesLockPath, legacyRoutesPath) {
  const [provenanceBytes, sourcesLockBytes, legacyRoutesBytes] = await Promise.all([
    readFile(provenancePath),
    readFile(sourcesLockPath),
    readFile(legacyRoutesPath),
  ]);
  const provenance = parseObject(provenanceBytes, 'artifact provenance');
  const sourcesLock = parseObject(sourcesLockBytes, 'Website sources.lock.json');
  const legacyRoutes = parseObject(legacyRoutesBytes, 'Website legacy-routes.json');

  if (sha256(sourcesLockBytes) !== provenance.sourcesLockSha256) {
    throw new Error('sourcesLockSha256 does not match sources.lock.json at the verified Website commit');
  }
  if (sha256(legacyRoutesBytes) !== provenance.legacyRoutesSha256) {
    throw new Error('legacyRoutesSha256 does not match legacy-routes.json at the verified Website commit');
  }

  if (sourcesLock.schema !== 'b10x-sources/v1' || !Array.isArray(sourcesLock.sources)) {
    throw new Error('Website source lock does not use schema b10x-sources/v1');
  }
  const actualRepositories = sourcesLock.sources.map((source) => source?.repository);
  if (actualRepositories.length !== sourceRepositories.length
    || actualRepositories.join('\n') !== sourceRepositories.join('\n')) {
    throw new Error('Website source lock does not contain the exact sorted 19-repository roster');
  }

  const lockedCommits = {};
  for (const source of sourcesLock.sources) {
    const label = `source lock entry ${source.repository}`;
    if (source.url !== `https://github.com/beyond10x/${source.repository}`) {
      throw new Error(`${label} has an unexpected source URL`);
    }
    if (source.manifestPath !== 'b10x.docs.yaml') {
      throw new Error(`${label} has an unexpected manifest path`);
    }
    requireNonzeroHex(source.commit, hex40, `${label} commit`);
    requireNonzeroHex(source.manifestSha256, hex64, `${label} manifestSha256`);
    requireNonzeroHex(source.contentSha256, hex64, `${label} contentSha256`);
    lockedCommits[source.repository] = source.commit;
  }
  if (canonicalJson(lockedCommits) !== canonicalJson(provenance.sourceCommits)) {
    throw new Error('Website source-lock commits do not exactly match provenance sourceCommits');
  }

  if (legacyRoutes.schema !== 'b10x-redirects/v1' || !Array.isArray(legacyRoutes.redirects)) {
    throw new Error('Website legacy routes do not use schema b10x-redirects/v1');
  }

  return {
    sourceCount: sourceRepositories.length,
    redirectCount: legacyRoutes.redirects.length,
    sourcesLockSha256: sha256(sourcesLockBytes),
    legacyRoutesSha256: sha256(legacyRoutesBytes),
  };
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseObject(bytes, label) {
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must contain a JSON object`);
  }
  return value;
}

function requireNonzeroHex(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value) || /^0+$/.test(value)) {
    throw new Error(`${label} must be non-zero lowercase hexadecimal`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 5) {
    process.stderr.write('usage: node scripts/verify-website-inputs.mjs <provenance> <sources.lock.json> <legacy-routes.json>\n');
    process.exitCode = 2;
  } else {
    try {
      const result = await verifyWebsiteInputs(...process.argv.slice(2));
      process.stdout.write(`verified ${result.sourceCount} Website sources and ${result.redirectCount} legacy redirects\n`);
    } catch (error) {
      process.stderr.write(`Website input verification failed: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
