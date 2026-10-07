import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type WorkflowStatus } from '../types';

export async function findWorkflowStatuses(): Promise<WorkflowStatus[]> {
  const workflows = await prisma.workflow.findMany({
    select: {
      id: true,
      runs: {
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        select: { status: true },
        take: 1,
      },
    },
  });
  const workflowStatuses = workflows.map((workflow) => ({
    status: workflow.runs[0]?.status ?? null,
    workflowId: workflow.id,
  }));

  return workflowStatuses;
}
