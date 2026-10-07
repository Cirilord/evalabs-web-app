import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type CreateWorkflowRunInput, type WorkflowRunIdentifier } from '../types';

export async function createWorkflowRun(
  input: CreateWorkflowRunInput
): Promise<WorkflowRunIdentifier> {
  const workflowRun = await prisma.workflowRun.create({
    data: {
      inputsJson: input.inputs as never,
      outputsJson: {},
      startedAt: new Date(),
      status: 'running',
      workflowId: input.workflowId,
    },
    select: { id: true, startedAt: true },
  });

  return workflowRun;
}
