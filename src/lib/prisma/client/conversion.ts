import {
  type ColumnType,
  ColumnTypeEnum,
  type ResultValue,
  type SqlQuery,
} from '@prisma/driver-adapter-utils';

function normalizeArgument(value: unknown, argType?: { scalarType?: string }): unknown {
  if (typeof value === 'string' && argType?.scalarType === 'int') {
    return Number.parseInt(value, 10);
  }
  if (typeof value === 'string' && argType?.scalarType === 'bigint') {
    return BigInt(value);
  }
  if (typeof value === 'string' && ['decimal', 'float'].includes(argType?.scalarType ?? '')) {
    return Number.parseFloat(value);
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'string' && argType?.scalarType === 'datetime') {
    value = new Date(value);
  }
  if (value instanceof Date) {
    return value.toISOString().replace('Z', '+00:00');
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  return value;
}

export function inferColumnType(values: ResultValue[]): ColumnType {
  const value = values.find((item) => item !== null);

  if (typeof value === 'boolean') {
    return ColumnTypeEnum.Boolean;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? ColumnTypeEnum.Int64 : ColumnTypeEnum.Double;
  }
  if (value instanceof Uint8Array) {
    return ColumnTypeEnum.Bytes;
  }

  return ColumnTypeEnum.Text;
}

export function normalizeArguments({
  args,
  argTypes,
}: Pick<SqlQuery, 'args' | 'argTypes'>): unknown[] {
  return args.map((value, index) => normalizeArgument(value, argTypes[index]));
}

export function normalizeResultValue(value: unknown): ResultValue {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (Array.isArray(value)) {
    return value.map(normalizeResultValue);
  }

  return JSON.stringify(value) ?? null;
}

export function toAdapterError(error: unknown): Error {
  return new Error(error instanceof Error ? error.message : String(error));
}
