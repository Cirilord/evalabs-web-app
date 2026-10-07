import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type CompleteWorkflowNodeRunInput, type WorkflowIdentifier } from '../types';

export async function completeWorkflowNodeRun(
  input: CompleteWorkflowNodeRunInput
): Promise<WorkflowIdentifier> {
  const workflowNodeRun = await prisma.workflowNodeRun.update({
    data: {
      error: input.error,
      finishedAt: new Date(),
      logs: input.logs,
      outputsJson: input.outputs as never,
      status: input.status,
    },
    select: { id: true },
    where: { id: input.nodeRunId },
  });

  return workflowNodeRun;
}
