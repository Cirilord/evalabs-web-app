import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const standaloneDirectory = resolve(rootDirectory, '.next/standalone');

await mkdir(standaloneDirectory, { recursive: true });
await Promise.all([
  cp(resolve(rootDirectory, 'public'), resolve(standaloneDirectory, 'public'), { recursive: true }),
  cp(resolve(rootDirectory, '.next/static'), resolve(standaloneDirectory, '.next/static'), {
    recursive: true,
  }),
]);
