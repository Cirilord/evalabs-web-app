'use client';

import 'client-only';

import { PrismaClient } from '@/generated/prisma-browser/client';

import { PrismaBrowserSqlite3 } from './adapter';

const prismaAdapter = new PrismaBrowserSqlite3();

const windowForPrisma = window as Window &
  typeof globalThis & {
    prisma?: PrismaClient;
  };

export const prisma = windowForPrisma.prisma ?? new PrismaClient({ adapter: prismaAdapter });

windowForPrisma.prisma = prisma;
