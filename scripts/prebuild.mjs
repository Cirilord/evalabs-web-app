import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const prismaCliPath = resolve(rootDirectory, 'node_modules/prisma/build/index.js');

function run(command, arguments_) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, { cwd: rootDirectory, stdio: 'inherit' });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 'unknown'}.`));
    });
  });
}

await run(process.execPath, [prismaCliPath, 'generate']);
await import('./copy-sqlite-assets.mjs');
