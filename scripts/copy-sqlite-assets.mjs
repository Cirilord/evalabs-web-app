import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sqliteAssets = [
  ['index.mjs', 'sqlite3.mjs'],
  ['sqlite3-opfs-async-proxy.js', 'sqlite3-opfs-async-proxy.js'],
  ['sqlite3.wasm', 'sqlite3.wasm'],
];

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const sourceDirectory = resolve(rootDirectory, 'node_modules/@sqlite.org/sqlite-wasm/dist');
const targetDirectory = resolve(rootDirectory, 'public/sqlite');
const prismaMigrationsDirectory = resolve(rootDirectory, 'prisma/migrations');
const prismaMigrationsTargetDirectory = resolve(rootDirectory, 'public/prisma/migrations');

await mkdir(targetDirectory, { recursive: true });

await Promise.all(
  sqliteAssets.map(([sourceFileName, targetFileName]) =>
    copyFile(resolve(sourceDirectory, sourceFileName), resolve(targetDirectory, targetFileName))
  )
);

const migrationDirectoryNames = (await readdir(prismaMigrationsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

await mkdir(prismaMigrationsTargetDirectory, { recursive: true });

await Promise.all(
  migrationDirectoryNames.map((migrationDirectoryName) =>
    copyFile(
      resolve(prismaMigrationsDirectory, migrationDirectoryName, 'migration.sql'),
      resolve(prismaMigrationsTargetDirectory, `${migrationDirectoryName}.sql`)
    )
  )
);

await writeFile(
  resolve(rootDirectory, 'public/prisma/migrations.json'),
  JSON.stringify(migrationDirectoryNames)
);
