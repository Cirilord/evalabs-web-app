import {
  type SqlDriverAdapter,
  type SqlDriverAdapterFactory,
  type SqlQuery,
  type SqlResultSet,
  type Transaction,
} from '@prisma/driver-adapter-utils';

import {
  inferColumnType,
  normalizeArguments,
  normalizeResultValue,
  toAdapterError,
} from './conversion';
import {
  type BrowserSqliteQuery,
  type BrowserSqliteQueryResult,
  type BrowserSqliteWorkerRequest,
  type BrowserSqliteWorkerResponse,
} from './types';

function createResultSet(result: BrowserSqliteQueryResult): SqlResultSet {
  const rows = result.rows.map((row) => row.map(normalizeResultValue));

  return {
    columnNames: result.columnNames,
    columnTypes: result.columnNames.map((_, index) =>
      inferColumnType(rows.map((row) => row[index] ?? null))
    ),
    rows,
  };
}

class Mutex {
  private tail = Promise.resolve();

  public async acquire(): Promise<() => void> {
    let release: () => void;
    const previous = this.tail;

    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    return release!;
  }
}

class PrismaBrowserSqlite3Worker {
  private readonly pending = new Map<
    number,
    Readonly<{
      reject: (reason?: unknown) => void;
      resolve: (value: unknown) => void;
    }>
  >();
  private readonly worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  private requestId = 0;

  public constructor() {
    this.worker.addEventListener('error', (event) => {
      this.rejectPending(event.message);
    });
    this.worker.addEventListener('message', (event: MessageEvent<BrowserSqliteWorkerResponse>) => {
      const pendingRequest = this.pending.get(event.data.id);
      if (!pendingRequest) return;

      this.pending.delete(event.data.id);

      if (event.data.error) {
        pendingRequest.reject(new Error(event.data.error));
        return;
      }

      pendingRequest.resolve(event.data.result);
    });
  }

  public async close(): Promise<void> {
    try {
      await this.request({ id: this.nextRequestId(), type: 'close' });
    } finally {
      this.worker.terminate();
      this.rejectPending('The SQLite worker was terminated.');
    }
  }

  public async execute(query: BrowserSqliteQuery): Promise<number> {
    return this.request({
      id: this.nextRequestId(),
      payload: query,
      type: 'execute',
    }) as Promise<number>;
  }

  public async executeScript(sql: string): Promise<void> {
    await this.request({
      id: this.nextRequestId(),
      payload: { args: [], sql },
      type: 'executeScript',
    });
  }

  public async query(query: BrowserSqliteQuery): Promise<BrowserSqliteQueryResult> {
    return this.request({
      id: this.nextRequestId(),
      payload: query,
      type: 'query',
    }) as Promise<BrowserSqliteQueryResult>;
  }

  private nextRequestId(): number {
    this.requestId += 1;

    return this.requestId;
  }

  private request(request: BrowserSqliteWorkerRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.pending.set(request.id, { reject, resolve });
      this.worker.postMessage(request);
    });
  }

  private rejectPending(message: string): void {
    this.pending.forEach((pendingRequest) => pendingRequest.reject(new Error(message)));
    this.pending.clear();
  }
}

class PrismaBrowserSqlite3Transaction implements Transaction {
  public readonly adapterName = '@evalabs/prisma-browser-sqlite';
  public readonly options = { usePhantomQuery: false };
  public readonly provider = 'sqlite' as const;
  private finished = false;

  public constructor(
    private readonly worker: PrismaBrowserSqlite3Worker,
    private readonly release: () => void
  ) {}

  public async commit(): Promise<void> {
    this.finish();
  }

  public async createSavepoint(name: string): Promise<void> {
    await this.executeRaw({ argTypes: [], args: [], sql: `SAVEPOINT ${name}` });
  }

  public async executeRaw({ sql, args, argTypes }: SqlQuery): Promise<number> {
    try {
      return await this.worker.execute({ args: normalizeArguments({ args, argTypes }), sql });
    } catch (error) {
      throw toAdapterError(error);
    }
  }

  public async queryRaw({ sql, args, argTypes }: SqlQuery): Promise<SqlResultSet> {
    try {
      return createResultSet(
        await this.worker.query({ args: normalizeArguments({ args, argTypes }), sql })
      );
    } catch (error) {
      throw toAdapterError(error);
    }
  }

  public async releaseSavepoint(name: string): Promise<void> {
    await this.executeRaw({ argTypes: [], args: [], sql: `RELEASE ${name}` });
  }

  public async rollback(): Promise<void> {
    this.finish();
  }

  public async rollbackToSavepoint(name: string): Promise<void> {
    await this.executeRaw({ argTypes: [], args: [], sql: `ROLLBACK TO ${name}` });
  }

  private finish(): void {
    if (!this.finished) {
      this.finished = true;
      this.release();
    }
  }
}

class PrismaBrowserSqlite3DriverAdapter implements SqlDriverAdapter {
  public readonly adapterName = '@evalabs/prisma-browser-sqlite';
  public readonly provider = 'sqlite' as const;

  public constructor(
    private readonly worker: PrismaBrowserSqlite3Worker,
    private readonly mutex: Mutex
  ) {}

  public async dispose(): Promise<void> {
    await this.worker.close();
  }

  public async executeRaw({ sql, args, argTypes }: SqlQuery): Promise<number> {
    const release = await this.mutex.acquire();

    try {
      return await this.worker.execute({ args: normalizeArguments({ args, argTypes }), sql });
    } catch (error) {
      throw toAdapterError(error);
    } finally {
      release();
    }
  }

  public async executeScript(script: string): Promise<void> {
    const release = await this.mutex.acquire();

    try {
      await this.worker.executeScript(script);
    } catch (error) {
      throw toAdapterError(error);
    } finally {
      release();
    }
  }

  public async queryRaw({ sql, args, argTypes }: SqlQuery): Promise<SqlResultSet> {
    const release = await this.mutex.acquire();

    try {
      return createResultSet(
        await this.worker.query({ args: normalizeArguments({ args, argTypes }), sql })
      );
    } catch (error) {
      throw toAdapterError(error);
    } finally {
      release();
    }
  }

  public async startTransaction(): Promise<Transaction> {
    const release = await this.mutex.acquire();

    try {
      await this.worker.execute({ args: [], sql: 'BEGIN' });

      return new PrismaBrowserSqlite3Transaction(this.worker, release);
    } catch (error) {
      release();
      throw toAdapterError(error);
    }
  }
}

export class PrismaBrowserSqlite3 implements SqlDriverAdapterFactory {
  public readonly adapterName = '@evalabs/prisma-browser-sqlite';
  public readonly provider = 'sqlite' as const;

  private readonly mutex = new Mutex();
  private readonly worker = new PrismaBrowserSqlite3Worker();

  public async connect(): Promise<SqlDriverAdapter> {
    return new PrismaBrowserSqlite3DriverAdapter(this.worker, this.mutex);
  }
}
