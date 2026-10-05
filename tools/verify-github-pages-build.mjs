import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const base = '/Siemsup.ru/';
const files = [];

const collect = (directory) => readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) collect(path);
  if (entry.isFile() && /\.(html|js|css)$/.test(entry.name)) files.push(path);
});

assert.ok(existsSync(join(root, '.nojekyll')), 'dist/.nojekyll is required for GitHub Pages');
collect(root);
assert.ok(files.length > 0, 'GitHub Pages build must contain site files');

for (const path of files) {
  const source = readFileSync(path, 'utf8');
  assert.equal(/(?:href|src|action)=["']\/(?!Siemsup\.ru\/|\/|#)/.test(source), false, `Unprefixed HTML route: ${path}`);
  assert.equal(/["'`]\/(?!Siemsup\.ru\/|\/|#)/.test(source), false, `Unprefixed static route: ${path}`);
}

const home = readFileSync(join(root, 'index.html'), 'utf8');
const pages = readFileSync(join(root, 'assets', 'js', 'pages.js'), 'utf8');
assert.ok(home.includes('href="/Siemsup.ru/catalog/"'), 'Home must link to the catalog in GitHub Pages');
assert.ok(pages.includes('`/Siemsup.ru/assets/${path}`'), 'Dynamic assets must use the GitHub Pages base path');

console.log(`GitHub Pages build verified: ${files.length} files`);
