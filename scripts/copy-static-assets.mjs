import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = join(root, 'assets');
const destination = join(root, 'dist', 'assets');

const copyDirectory = (from, to) => {
  mkdirSync(to, { recursive: true });
  readdirSync(from, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = join(from, entry.name);
    const destinationPath = join(to, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath);
    if (entry.isFile()) {
      mkdirSync(dirname(destinationPath), { recursive: true });
      copyFileSync(sourcePath, destinationPath);
    }
  });
};

copyDirectory(source, destination);
