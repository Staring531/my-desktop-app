import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative) => readFile(path.join(root, relative), 'utf8');
const issues = [];
const registry = JSON.parse(await read('docs/traceability/ui-traceability.json'));

function assert(condition, message) {
  if (!condition) issues.push(message);
}

async function exists(relative) {
  try {
    await access(path.join(root, relative), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const allRecords = [...registry.screens, ...registry.overlays];
const ids = new Set();
for (const record of allRecords) {
  assert(typeof record.id === 'string' && record.id.length > 0, 'A traceability record has no id.');
  if (ids.has(record.id)) issues.push(\`Duplicate traceability id: \${record.id}\`);
  ids.add(record.id);
  assert(typeof record.name === 'string' && record.name.length > 0, \`\${record.id}: missing name.\`);
  for (const field of ['flows', 'businessRules', 'acceptanceCriteria']) {
    assert(Array.isArray(record[field]), \`\${record.id}: \${field} must be an array.\`);
  }
  for (const field of ['renderer', 'design']) {
    const values = field === 'design' ? Object.values(record.design ?? {}) : record.renderer ?? [];
    for (const value of values) {
      const relative = value.split('#')[0];
      if (relative.includes('/') && !(await exists(relative))) {
        issues.push(\`\${record.id}: referenced file does not exist: \${relative}\`);
      }
    }
  }
}

const [prd, flows, components, pages] = await Promise.all([
  read('docs/product/04-prd.md'),
  read('docs/ui-ux/02-user-flows.md'),
  read('docs/ui-ux/11-component-specifications.md'),
  read('docs/ui-ux/12-page-specifications.md'),
]);
for (const record of allRecords) {
  for (const id of record.businessRules ?? []) assert(prd.includes(id), \`\${record.id}: unknown business rule \${id}\`);
  for (const id of record.acceptanceCriteria ?? []) assert(prd.includes(id), \`\${record.id}: unknown acceptance criterion \${id}\`);
  for (const id of record.flows ?? []) assert(flows.includes(id), \`\${record.id}: unknown flow \${id}\`);
  for (const id of record.components ?? []) assert(components.includes(id), \`\${record.id}: unknown component \${id}\`);
  if (record.id.startsWith('S-')) assert(pages.includes(record.id), \`\${record.id}: missing page specification.\`);
}

if (issues.length > 0) {
  console.error('UI traceability validation failed:');
  for (const issue of issues) console.error(\`- \${issue}\`);
  process.exitCode = 1;
} else {
  console.log(\`UI traceability registry is valid (\${registry.screens.length} screens, \${registry.overlays.length} overlays).\`);
}
