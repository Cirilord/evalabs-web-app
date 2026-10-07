import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type CompleteWorkflowRunInput, type WorkflowIdentifier } from '../types';

export async function completeWorkflowRun(
  input: CompleteWorkflowRunInput
): Promise<WorkflowIdentifier> {
  const workflowRun = await prisma.workflowRun.update({
    data: {
      error: input.error,
      finishedAt: new Date(),
      logs: input.logs,
      outputsJson: input.outputs as never,
      status: input.status,
    },
    select: { id: true },
    where: { id: input.runId },
  });

  return workflowRun;
}
