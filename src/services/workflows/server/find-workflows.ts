import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type WorkflowListItem } from '../types';

export async function findWorkflows(): Promise<WorkflowListItem[]> {
  const workflows = await prisma.workflow.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true },
  });

  return workflows;
}
