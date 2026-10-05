import { readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';

const root = resolve(import.meta.dirname);

const findHtmlEntries = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === 'src') return [];
  const path = join(directory, entry.name);
  if (entry.isDirectory()) return findHtmlEntries(path);
  return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
});

const input = Object.fromEntries(findHtmlEntries(root).map((path) => {
  const name = relative(root, path).replaceAll(sep, '/').replace(/\.html$/, '').replace(/\/index$/, '') || 'index';
  return [name, path];
}));

export default defineConfig({
  root,
  plugins: [injectHTML()],
  build: {
    outDir: 'dist',
    assetsDir: '_vite',
    emptyOutDir: true,
    rollupOptions: { input },
  },
});
