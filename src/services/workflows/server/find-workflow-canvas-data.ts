import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type WorkflowCanvasData } from '../types';
import { toWorkflowCatalog, toWorkflowGraph, toWorkflowRunHistory } from '../utils';

export async function findWorkflowCanvasData(
  workflowId: string
): Promise<WorkflowCanvasData | null> {
  const [workflow, automations, workflows] = await Promise.all([
    prisma.workflow.findUnique({
      include: {
        connections: true,
        nodes: true,
        runs: {
          include: { nodeRuns: { orderBy: { startedAt: 'asc' } } },
          orderBy: { startedAt: 'desc' },
        },
      },
      where: { id: workflowId },
    }),
    prisma.automation.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.workflow.findMany({
      include: { connections: true, nodes: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  if (!workflow) {
    return null;
  }

  const data = {
    catalog: toWorkflowCatalog(automations, workflows),
    graph: toWorkflowGraph(workflow),
    runs: toWorkflowRunHistory(workflow.runs),
  };

  return data;
}
