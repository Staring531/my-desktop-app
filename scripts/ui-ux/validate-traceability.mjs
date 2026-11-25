import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative) => readFile(path.join(root, relative), 'utf8');
const issues = [];
const warnings = [];
const registry = JSON.parse(await read('docs/traceability/ui-traceability.json'));
const schema = JSON.parse(await read('docs/traceability/ui-traceability.schema.json'));

function assert(condition, message) {
  if (!condition) issues.push(message);
}

function hasId(source, id) {
  const escaped = id.replace(/[.*+?^{}()|[\]\\]/gu, '\\$&');
  return new RegExp('(^|[^A-Z0-9-])' + escaped + '($|[^A-Z0-9-])', 'u').test(source);
}

async function exists(relative) {
  try {
    await access(path.join(root, relative), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

assert(registry.schemaVersion === '1.0.0', 'Unsupported traceability schemaVersion.');
assert(typeof registry.standardVersion === 'string', 'Missing standardVersion.');
assert(typeof registry.project === 'string', 'Missing project identity.');
assert(Array.isArray(registry.screens), 'screens must be an array.');
assert(Array.isArray(registry.overlays), 'overlays must be an array.');
assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'Traceability schema must use JSON Schema 2020-12.');

const screens = registry.screens ?? [];
const overlays = registry.overlays ?? [];
const allRecords = [...screens, ...overlays];
const ids = new Set();

for (const record of allRecords) {
  assert(typeof record.id === 'string' && record.id.length > 0, 'A traceability record has no id.');
  if (ids.has(record.id)) issues.push('Duplicate traceability id: ' + record.id);
  ids.add(record.id);

  assert(typeof record.name === 'string' && record.name.length > 0, record.id + ': missing name.');
  for (const field of ['flows', 'businessRules', 'acceptanceCriteria']) {
    assert(Array.isArray(record[field]), record.id + ': ' + field + ' must be an array.');
  }
  for (const field of ['components', 'renderer', 'uiModel', 'ipc', 'main', 'application', 'domain', 'persistence', 'tests']) {
    if (record[field] !== undefined) {
      assert(Array.isArray(record[field]), record.id + ': ' + field + ' must be an array when present.');
    }
  }
  assert(record.design === undefined || (typeof record.design === 'object' && !Array.isArray(record.design)),
    record.id + ': design must be an object when present.');

  const fileReferences = [
    ...Object.values(record.design ?? {}),
    ...(record.renderer ?? []),
    ...(record.tests ?? []),
  ];
  for (const value of fileReferences) {
    if (typeof value !== 'string' || !value.includes('/')) continue;
    const relative = value.split('#')[0];
    if (!(await exists(relative))) {
      issues.push(record.id + ': referenced file does not exist: ' + relative);
    }
  }

  if (Array.isArray(record.tests) && record.tests.length === 0) {
    warnings.push(record.id + ': no test mapping recorded; test coverage remains unverified.');
  }
}

for (const [layer, relative] of Object.entries(registry.architecture ?? {})) {
  assert(typeof relative === 'string' && relative.length > 0, 'architecture.' + layer + ' must be a path.');
  if (typeof relative === 'string' && !(await exists(relative))) {
    issues.push('architecture.' + layer + ': path does not exist: ' + relative);
  }
}

const [prd, flows, components, pages] = await Promise.all([
  read('docs/product/04-prd.md'),
  read('docs/ui-ux/02-user-flows.md'),
  read('docs/ui-ux/11-component-specifications.md'),
  read('docs/ui-ux/12-page-specifications.md'),
]);

for (const record of allRecords) {
  for (const id of record.businessRules ?? []) {
    assert(hasId(prd, id), record.id + ': unknown business rule ' + id);
  }
  for (const id of record.acceptanceCriteria ?? []) {
    assert(hasId(prd, id), record.id + ': unknown acceptance criterion ' + id);
  }
  for (const id of record.flows ?? []) {
    assert(hasId(flows, id), record.id + ': unknown flow ' + id);
  }
  for (const id of record.components ?? []) {
    assert(hasId(components, id), record.id + ': unknown component ' + id);
  }
  if (record.id.startsWith('S-')) {
    assert(hasId(pages, record.id), record.id + ': missing page specification.');
  }
}

if (issues.length > 0) {
  console.error('UI traceability validation failed:');
  for (const issue of issues) console.error('- ' + issue);
  process.exitCode = 1;
} else {
  console.log('UI traceability registry is structurally valid (' + screens.length + ' screens, ' + overlays.length + ' overlays).');
  for (const warning of warnings) console.warn('WARN: ' + warning);
}
