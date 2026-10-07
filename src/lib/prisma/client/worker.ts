import { type Database } from '@sqlite.org/sqlite-wasm';

import {
  type BrowserMigration,
  type BrowserSqliteQuery,
  type BrowserSqliteQueryResult,
  type BrowserSqliteWorkerRequest,
  type BrowserSqliteWorkerResponse,
} from './types';

const DATABASE_FILE_NAME = '/evalabs.sqlite3';
const MIGRATIONS_MANIFEST_URL = new URL('/prisma/migrations.json', self.location.origin).href;
const SQLITE_MODULE_URL = new URL('/sqlite/sqlite3.mjs', self.location.origin).href;

let databasePromise: Promise<Database> | undefined;

async function getDatabase(): Promise<Database> {
  databasePromise ??= loadSqlite().then(async (sqlite3) => {
    if (!sqlite3.oo1.OpfsDb) {
      throw new Error(
        'Persistent browser storage is unavailable. Use a secure, cross-origin isolated browser context.'
      );
    }

    const database = new sqlite3.oo1.OpfsDb(DATABASE_FILE_NAME);

    database.exec('PRAGMA foreign_keys = ON');
    await applyBrowserMigrations(database);

    return database;
  });

  return databasePromise;
}

async function applyBrowserMigrations(database: Database): Promise<void> {
  const response = await fetch(MIGRATIONS_MANIFEST_URL);

  if (!response.ok) {
    throw new Error('Browser database migrations could not be loaded.');
  }

  const migrationDirectoryNames: string[] = await response.json();
  const appliedMigrations = getAppliedMigrations(database);

  for (const migrationDirectoryName of migrationDirectoryNames) {
    const migrationUrl = new URL(
      `/prisma/migrations/${migrationDirectoryName}.sql`,
      self.location.origin
    ).href;
    const migrationResponse = await fetch(migrationUrl);

    if (!migrationResponse.ok) {
      throw new Error(
        `Browser database migration \"${migrationDirectoryName}\" could not be loaded.`
      );
    }

    const migrationSql = await migrationResponse.text();
    const checksum = await getChecksum(migrationSql);
    const appliedMigration = appliedMigrations.get(migrationDirectoryName);

    if (appliedMigration) {
      if (appliedMigration.checksum !== checksum) {
        throw new Error(`Browser database migration \"${migrationDirectoryName}\" has changed.`);
      }

      if (!appliedMigration.finishedAt) {
        throw new Error(`Browser database migration \"${migrationDirectoryName}\" did not finish.`);
      }

      continue;
    }

    insertStartedMigration(database, migrationDirectoryName, checksum);
    database.exec('BEGIN');

    try {
      database.exec(migrationSql);
      finishMigration(database, migrationDirectoryName);
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
}

async function getChecksum(migrationSql: string): Promise<string> {
  const data = new TextEncoder().encode(migrationSql);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer), (value) =>
    value.toString(16).padStart(2, '0')
  ).join('');
}

function getAppliedMigrations(database: Database): Map<string, BrowserMigration> {
  database.exec(`
    CREATE TABLE IF NOT EXISTS "_browser_migrations" (
      "id" VARCHAR(36) NOT NULL PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "migration_name" VARCHAR(255) NOT NULL UNIQUE,
      "finished_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const statement = database.prepare(
    'SELECT "migration_name", "checksum", "finished_at" FROM "_browser_migrations"'
  );
  const migrations = new Map<string, BrowserMigration>();

  try {
    while (statement.step()) {
      const [migrationName, checksum, finishedAt] = statement.get([]);

      migrations.set(String(migrationName), {
        checksum: String(checksum),
        finishedAt: finishedAt ? String(finishedAt) : null,
      });
    }
  } finally {
    statement.finalize();
  }

  return migrations;
}

function insertStartedMigration(
  database: Database,
  migrationDirectoryName: string,
  checksum: string
): void {
  const statement = database.prepare(
    'INSERT INTO "_browser_migrations" ("id", "checksum", "migration_name") VALUES (?, ?, ?)'
  );

  try {
    statement.bind([crypto.randomUUID(), checksum, migrationDirectoryName]);
    statement.step();
  } finally {
    statement.finalize();
  }
}

function finishMigration(database: Database, migrationDirectoryName: string): void {
  const statement = database.prepare(
    'UPDATE "_browser_migrations" SET "finished_at" = CURRENT_TIMESTAMP WHERE "migration_name" = ?'
  );

  try {
    statement.bind([migrationDirectoryName]);
    statement.step();
  } finally {
    statement.finalize();
  }
}

async function loadSqlite() {
  const { default: sqlite3InitModule } = await import(/* webpackIgnore: true */ SQLITE_MODULE_URL);

  return sqlite3InitModule();
}

async function closeDatabase(): Promise<null> {
  const database = await databasePromise;
  database?.close();
  databasePromise = undefined;

  return null;
}

async function execute(query: BrowserSqliteQuery): Promise<number> {
  const database = await getDatabase();
  const statement = database.prepare(query.sql);

  try {
    if (query.args.length > 0) {
      statement.bind(query.args as never[]);
    }
    statement.step();

    return database.changes();
  } finally {
    statement.finalize();
  }
}

async function executeScript(sql: string): Promise<null> {
  const database = await getDatabase();
  database.exec(sql);

  return null;
}

async function query(queryRequest: BrowserSqliteQuery): Promise<BrowserSqliteQueryResult> {
  const database = await getDatabase();
  const statement = database.prepare(queryRequest.sql);

  try {
    if (queryRequest.args.length > 0) {
      statement.bind(queryRequest.args as never[]);
    }

    const columnNames = statement.getColumnNames();
    const rows: unknown[][] = [];

    while (statement.step()) {
      rows.push(statement.get([]));
    }

    return { columnNames, rows };
  } finally {
    statement.finalize();
  }
}

async function handleRequest(
  request: BrowserSqliteWorkerRequest
): Promise<BrowserSqliteQueryResult | number | null> {
  switch (request.type) {
    case 'close':
      return closeDatabase();
    case 'execute':
      if (!request.payload) {
        throw new Error('A query payload is required.');
      }
      return execute(request.payload);
    case 'executeScript':
      if (!request.payload) {
        throw new Error('A query payload is required.');
      }
      return executeScript(request.payload.sql);
    case 'query':
      if (!request.payload) {
        throw new Error('A query payload is required.');
      }
      return query(request.payload);
  }
}

self.addEventListener('message', (event: MessageEvent<BrowserSqliteWorkerRequest>) => {
  void handleRequest(event.data)
    .then((result) => {
      const response: BrowserSqliteWorkerResponse = { id: event.data.id, result };
      self.postMessage(response);
    })
    .catch((error: unknown) => {
      const response: BrowserSqliteWorkerResponse = {
        error: error instanceof Error ? error.message : String(error),
        id: event.data.id,
      };
      self.postMessage(response);
    });
});
