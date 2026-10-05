import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'dist');
const base = '/Siemsup.ru/';
const textExtensions = new Set(['.html', '.js', '.css', '.json']);

const rewrite = (source) => source.replace(/(["'`])\/(?!Siemsup\.ru\/|\/)/g, `$1${base}`);

const processDirectory = (directory) => readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) processDirectory(path);
  if (entry.isFile() && textExtensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) writeFileSync(path, rewrite(readFileSync(path, 'utf8')));
});

processDirectory(root);
writeFileSync(join(root, '.nojekyll'), '');
