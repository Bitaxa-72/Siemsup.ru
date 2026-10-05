const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const focusedScripts = [
  'pages-data.js',
  'pages-components.js',
  'pages-commerce.js',
  'pages-information.js',
  'pages-legal.js',
  'pages-interactions.js',
  'pages.js',
];
const focusedStyles = ['pages-core.css', 'pages-catalog.css', 'pages-content.css'];

const collectHtml = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(directory, entry.name);
  if (entry.isDirectory() && !['assets', 'docs', '.git', '.superpowers'].includes(entry.name)) return collectHtml(full);
  return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
});

test('homepage stays byte-identical during internal redesign', () => {
  const content = fs.readFileSync(path.join(root, 'index.html'));
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  assert.equal(hash, '76378e4fd7aa99d66730413fbaccdad82d1ab1a35f1f6c7dbab341e1d0134a4d');
});

test('internal renderer is split into focused files', () => {
  const missing = focusedScripts.filter((file) => !fs.existsSync(path.join(root, 'assets/js', file)));
  assert.deepEqual(missing, []);
});

test('legacy internal styles are no longer linked by route wrappers', () => {
  const homepage = path.join(root, 'index.html');
  const offenders = collectHtml(root)
    .filter((file) => file !== homepage)
    .filter((file) => /(?:pages\.css|pages-modern\.css)/.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(root, file));
  assert.deepEqual(offenders, []);
});

test('internal source files stay below 600 lines', () => {
  const files = [
    ...focusedScripts.map((file) => path.join(root, 'assets/js', file)),
    ...focusedStyles.map((file) => path.join(root, 'assets/css', file)),
  ];
  const violations = files.flatMap((file) => {
    if (!fs.existsSync(file)) return [path.relative(root, file)];
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).length > 600 ? [path.relative(root, file)] : [];
  });
  assert.deepEqual(violations, []);
});
