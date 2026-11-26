import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = path.join(root, 'docs/ui-ux/personal-time/tokens/design-tokens.json');
const cssPath = path.join(root, 'apps/website/app/globals.css');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const css = await readFile(cssPath, 'utf8');
const tokens = new Map();

function visit(node, parts = []) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  if (Object.hasOwn(node, '$value')) {
    const name = parts.join('-');
    if (tokens.has(name)) throw new Error(`Duplicate token: ${name}`);
    tokens.set(name, node.$value);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === '$schema' || key === 'meta') continue;
    visit(value, [...parts, key]);
  }
}

visit(source);

function resolve(name, visiting = new Set()) {
  if (visiting.has(name))
    throw new Error(`Circular token reference: ${[...visiting, name].join(' -> ')}`);
  const value = tokens.get(name);
  if (value === undefined) throw new Error(`Unresolved token reference: ${name}`);
  visiting.add(name);
  let resolved = value;
  if (typeof value === 'string') {
    const reference = /^\{([^}]+)\}$/u.exec(value);
    if (reference) resolved = resolve(reference[1].replaceAll('.', '-'), visiting);
  } else if (typeof value === 'number') {
    resolved = String(value);
  } else if (value && typeof value === 'object') {
    const transparent =
      typeof value.color === 'string' && /(?:00|transparent)$/iu.test(value.color);
    const zero = ['offsetX', 'offsetY', 'blur', 'spread'].every((key) => value[key] === '0px');
    resolved = transparent && zero ? 'none' : JSON.stringify(value);
  }
  visiting.delete(name);
  return resolved;
}

for (const name of tokens.keys()) resolve(name);

const cssVariableToToken = {
  '--color-canvas': 'semantic-color-canvas',
  '--color-surface': 'semantic-color-surface',
  '--color-text-primary': 'semantic-color-text-primary',
  '--color-text-meta': 'semantic-color-text-meta',
  '--color-text-on-action': 'semantic-color-text-on-action',
  '--color-border-hairline': 'semantic-color-border-hairline',
  '--color-border-field': 'semantic-color-border-field',
  '--color-action': 'semantic-color-action-primary',
  '--color-focus': 'semantic-color-focus',
  '--color-selection-wash': 'semantic-color-selection-wash',
  '--color-selection-mark': 'semantic-color-selection-mark',
  '--font-family': 'semantic-font-family',
  '--font-figures': 'semantic-font-figures',
  '--weight-body': 'semantic-font-body-weight',
  '--weight-title': 'semantic-font-title-weight',
  '--weight-action': 'component-button-primary-weight',
  '--size-title': 'component-page-title-size',
  '--line-title': 'component-page-title-line',
  '--track-title': 'component-page-title-track',
  '--size-body': 'semantic-font-body-size',
  '--line-body': 'semantic-font-body-line',
  '--size-occurrence': 'component-row-title-size',
  '--line-occurrence': 'component-row-title-line',
  '--weight-occurrence': 'component-row-title-weight',
  '--size-meta': 'semantic-font-meta-size',
  '--line-meta': 'semantic-font-meta-line',
  '--size-name': 'semantic-font-name-size',
  '--line-facts': 'component-row-facts-line',
  '--size-action': 'component-button-quiet-size',
  '--size-label': 'semantic-font-label-size',
  '--line-label': 'semantic-font-label-line',
  '--size-day': 'component-day-size',
  '--line-day': 'component-day-line',
  '--weight-day': 'component-day-weight',
  '--track-day': 'component-day-track',
  '--content-max': 'component-page-content-max',
  '--padding-block': 'component-page-padding-block',
  '--padding-inline': 'component-page-padding-inline',
  '--padding-end': 'component-page-padding-end',
  '--stack-below': 'component-page-stack-below',
  '--control-height': 'component-field-height',
  '--radius': 'component-field-radius',
  '--field-padding': 'component-field-padding-inline',
  '--label-gap': 'component-field-label-gap',
  '--rule': 'component-field-border-width',
  '--button-padding': 'component-button-padding-inline',
  '--focus-width': 'component-button-focus-width',
  '--focus-offset': 'component-button-focus-offset',
  '--facts-size': 'component-row-facts-size',
  '--row-gap-block': 'component-row-gap-block',
  '--row-gap-inline': 'component-row-gap-inline',
  '--row-pad-block': 'component-row-padding-block',
  '--row-pad-inline': 'component-row-padding-inline',
  '--selected-width': 'component-row-selected-mark-width',
  '--day-gap': 'component-day-gap',
  '--day-pad': 'component-day-pad',
  '--space-inline': 'semantic-space-inline',
  '--tool-gap': 'semantic-space-tool-gap',
  '--tool-top': 'semantic-space-tool-top',
  '--meta-gap': 'semantic-space-meta-gap',
  '--choice-gap': 'semantic-space-choice-gap',
  '--name-gap': 'semantic-space-name-gap',
  '--motion': 'semantic-motion-feedback',
  '--color-sidebar': 'semantic-color-sidebar',
  '--color-sidebar-muted': 'semantic-color-sidebar-muted',
  '--color-sidebar-active': 'semantic-color-sidebar-active',
  '--color-accent-soft': 'semantic-color-accent-soft',
  '--color-success': 'semantic-color-success',
  '--color-success-wash': 'semantic-color-success-wash',
  '--color-warning': 'semantic-color-warning',
  '--color-warning-wash': 'semantic-color-warning-wash',
  '--color-danger': 'semantic-color-danger',
  '--color-danger-wash': 'semantic-color-danger-wash',
  '--color-sidebar-outline': 'semantic-color-sidebar-outline',
  '--shadow-card': 'semantic-elevation-card',
  '--shadow-soft': 'semantic-elevation-soft',
  '--radius-card': 'component-card-radius',
  '--radius-pill': 'primitive-radius-pill',
  '--sidebar-width': 'component-navigation-width',
  '--card-padding': 'component-card-padding',
  '--section-gap': 'semantic-space-section',
};

function normalize(value) {
  return String(value).trim().toLowerCase().replace(/['"]/gu, '').replace(/\s+/gu, ' ');
}

const rootMatch = /:root\s*\{(?<body>[\s\S]*?)\n\}/u.exec(css);
if (!rootMatch) throw new Error('apps/website/app/globals.css has no :root block');
const declared = new Map();
for (const match of rootMatch.groups.body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/gu)) {
  declared.set(`--${match[1]}`, match[2].trim());
}

const failures = [];
for (const [cssName, tokenName] of Object.entries(cssVariableToToken)) {
  if (!declared.has(cssName)) {
    failures.push(`${cssName} is missing from :root`);
    continue;
  }
  const actual = normalize(declared.get(cssName));
  const expected = normalize(resolve(tokenName));
  if (actual !== expected)
    failures.push(`${cssName} is ${actual}; ${tokenName} resolves to ${expected}`);
}
for (const cssName of declared.keys()) {
  if (!Object.hasOwn(cssVariableToToken, cssName))
    failures.push(`${cssName} is not mapped to a personal-time token`);
}
const stackBelow = normalize(resolve('component-page-stack-below'));
const media = css.match(/@media\s*\(\s*max-width:\s*([^)]+)\)/u);
if (!media) {
  failures.push('The stylesheet has no max-width stack rule');
} else if (normalize(media[1]) !== stackBelow) {
  failures.push(
    `The stack media query is ${media[1].trim()}; component-page-stack-below is ${stackBelow}`,
  );
}

const checkedProperties = new Set([
  'color',
  'background',
  'background-color',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'border-width',
  'border-radius',
  'outline',
  'outline-color',
  'outline-width',
  'outline-offset',
  'font',
  'font-size',
  'font-weight',
  'font-family',
  'line-height',
  'font-variant-numeric',
  'gap',
  'row-gap',
  'column-gap',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'padding-block',
  'padding-inline',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'min-height',
  'height',
  'width',
  'max-width',
  'min-width',
  'box-shadow',
  'text-shadow',
  'transition',
  'animation',
]);
const keywords = new Set([
  '0',
  '0px',
  'auto',
  '100%',
  'transparent',
  'inherit',
  'none',
  'solid',
  'inset',
]);

function partsOf(value) {
  const parts = [];
  let current = '';
  let depth = 0;
  for (const character of value) {
    if (character === '(') depth += 1;
    if (character === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && /\s/u.test(character)) {
      if (current) parts.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  if (current) parts.push(current);
  return parts;
}

function partAllowed(property, part) {
  if (keywords.has(part.toLowerCase())) return true;
  if (property === 'border-radius' && part === '50%') return true;
  const variable = /^var\((--[\w-]+)\)$/u.exec(part);
  if (variable) return declared.has(variable[1]);
  if (/^calc\(/u.test(part)) {
    const names = [...part.matchAll(/var\((--[\w-]+)\)/gu)].map((match) => match[1]);
    if (names.length === 0 || names.some((name) => !declared.has(name))) return false;
    const remainder = part.replace(/var\(--[\w-]+\)/gu, '');
    return !/(#|px|rem|em)/iu.test(remainder);
  }
  return false;
}

let depth = 0;
let inRoot = false;
const lines = css.split('\n');
for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  if (depth === 0 && /:root\b/u.test(line)) inRoot = true;
  if (!inRoot) {
    for (const match of line.matchAll(/(?<property>[\w-]+)\s*:\s*(?<value>[^;]+);/gu)) {
      const property = match.groups.property;
      const value = match.groups.value.trim();
      if (!checkedProperties.has(property)) continue;
      const rejected = partsOf(value).filter((part) => !partAllowed(property, part));
      if (rejected.length > 0) {
        failures.push(`${cssPath}:${index + 1} ${property}: ${value} uses ${rejected.join(', ')}`);
      }
    }
  }
  const opens = line.match(/\{/gu)?.length ?? 0;
  const closes = line.match(/\}/gu)?.length ?? 0;
  depth += opens - closes;
  if (inRoot && depth === 0) inRoot = false;
}

if (failures.length > 0) {
  console.error('Website design tokens are out of sync:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Website stylesheet matches the Personal Time design-token map (${tokens.size} tokens, ${declared.size} custom properties).`,
  );
}
