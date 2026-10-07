export type BrowserSqliteQuery = Readonly<{
  args: unknown[];
  sql: string;
}>;

export type BrowserMigration = Readonly<{
  checksum: string;
  finishedAt: string | null;
}>;

export type BrowserSqliteQueryResult = Readonly<{
  columnNames: string[];
  rows: unknown[][];
}>;

export type BrowserSqliteWorkerRequest = Readonly<{
  id: number;
  payload?: BrowserSqliteQuery;
  type: 'close' | 'execute' | 'executeScript' | 'query';
}>;

export type BrowserSqliteWorkerResponse = Readonly<{
  error?: string;
  id: number;
  result?: BrowserSqliteQueryResult | number | null;
}>;
