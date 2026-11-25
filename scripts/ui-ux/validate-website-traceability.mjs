import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registryPath = 'docs/traceability/website-ui-traceability.json';
const registry = JSON.parse(await readFile(path.join(root, registryPath), 'utf8'));
const issues = [];
const ids = new Set();
const routes = new Set();
const allowedStatuses = new Set(['PASS', 'FAIL', 'BLOCKED', 'NOT RUN', 'NOT VERIFIED']);

async function exists(relative) {
  try {
    await access(path.join(root, relative), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

if (registry.schemaVersion !== '1.0.0') issues.push('Unsupported website traceability schemaVersion.');
if (!Array.isArray(registry.screens) || registry.screens.length === 0) {
  issues.push('screens must be a non-empty array.');
}

for (const screen of registry.screens ?? []) {
  if (typeof screen.id !== 'string' || screen.id.length === 0) issues.push('A screen is missing its id.');
  if (ids.has(screen.id)) issues.push(`Duplicate screen id: ${screen.id}`);
  ids.add(screen.id);

  if (typeof screen.route === 'string') {
    if (routes.has(screen.route)) issues.push('Duplicate route: ' + screen.route);
    routes.add(screen.route);
  }
  if (!allowedStatuses.has(screen.status)) issues.push(screen.id + ': invalid evidence status: ' + screen.status);

  for (const field of ['route', 'name', 'page']) {
    if (typeof screen[field] !== 'string' || screen[field].length === 0) {
      issues.push(`${screen.id}: missing ${field}.`);
    }
  }

  for (const field of ['components', 'tests']) {
    if (!Array.isArray(screen[field])) {
      issues.push(`${screen.id}: ${field} must be an array.`);
      continue;
    }
    for (const relative of screen[field]) {
      if (!(await exists(relative))) issues.push(`${screen.id}: referenced ${field} file does not exist: ${relative}`);
    }
  }

  if (!(await exists(screen.page))) issues.push(`${screen.id}: page file does not exist: ${screen.page}`);
}

for (const field of ['tokenSource', 'generatedTokens']) {
  if (typeof registry[field] !== 'string' || !(await exists(registry[field]))) {
    issues.push(`Missing or invalid ${field} path.`);
  }
}

if (issues.length > 0) {
  console.error('Website traceability validation failed:');
  for (const issue of issues) console.error('- ' + issue);
  process.exitCode = 1;
} else {
  console.log(`Website traceability registry is structurally valid (${registry.screens.length} routes).`);
}
