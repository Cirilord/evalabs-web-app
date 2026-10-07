import 'server-only';

import { prisma } from '@/lib/prisma/server';
import { type WorkflowRunnable } from '@/lib/workflows';

import { toWorkflowCatalog } from '../utils';

export async function findWorkflowCatalog(): Promise<WorkflowRunnable[]> {
  const [automations, workflows] = await Promise.all([
    prisma.automation.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.workflow.findMany({
      include: { connections: true, nodes: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);
  const catalog = toWorkflowCatalog(automations, workflows);

  return catalog;
}
