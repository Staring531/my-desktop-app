import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = path.join(root, 'apps/website/tokens/design-tokens.json');
const outputPath = path.join(root, 'apps/website/app/tokens.generated.css');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const tokens = new Map();

function visit(node, parts = []) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  if (Object.hasOwn(node, '$value')) {
    const name = parts.join('-');
    if (tokens.has(name)) throw new Error(`Duplicate token: ${name}`);
    tokens.set(name, { type: node.$type, value: node.$value });
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === '$schema' || key === 'meta') continue;
    visit(value, [...parts, key]);
  }
}

visit(source);

function assertNoAliasCycles(name, visiting = new Set(), visited = new Set()) {
  if (visited.has(name)) return;
  if (visiting.has(name)) throw new Error(`Circular token reference: ${[...visiting, name].join(' -> ')}`);
  const token = tokens.get(name);
  if (token === undefined) throw new Error(`Unresolved token reference: ${name}`);
  visiting.add(name);
  if (typeof token.value === 'string') {
    const reference = /^\\{([^}]+)\\}$/u.exec(token.value);
    if (reference) assertNoAliasCycles(reference[1].replaceAll('.', '-'), visiting, visited);
  }
  visiting.delete(name);
  visited.add(name);
}

for (const name of tokens.keys()) assertNoAliasCycles(name);
if (tokens.size === 0) throw new Error('No website design tokens found');

function cssValue(tokenName, token) {
  const value = token.value;
  if (typeof value === 'string') {
    const reference = /^\\{([^}]+)\\}$/u.exec(value);
    if (reference) {
      const target = reference[1].replaceAll('.', '-');
      if (!tokens.has(target)) throw new Error(`Unresolved token reference: ${tokenName} -> ${target}`);
      return `var(--${target})`;
    }
    return value;
  }
  if (typeof value === 'number') return String(value);
  throw new Error(`Unsupported token value: ${tokenName}`);
}

const lines = [
  '/* Generated from apps/website/tokens/design-tokens.json. Do not edit by hand. */',
  ':root {',
];
for (const [name, token] of tokens) lines.push(`  --${name}: ${cssValue(name, token)};`);
lines.push('}', '');
const output = lines.join('\\n');
const check = process.argv.includes('--check');

if (check) {
  const current = await readFile(outputPath, 'utf8').catch(() => '');
  if (current !== output) {
    console.error('Website design token CSS is out of date. Run: node scripts/ui-ux/generate-website-design-tokens.mjs');
    process.exitCode = 1;
  } else {
    console.log(`Website design tokens are synchronized (${tokens.size} tokens).`);
  }
} else {
  await writeFile(outputPath, output, 'utf8');
  console.log(`Generated ${tokens.size} website design tokens at ${path.relative(root, outputPath)}.`);
}
