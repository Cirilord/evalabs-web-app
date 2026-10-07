import 'client-only';

import { prisma } from '@/lib/prisma/client';

import { type CreateWorkflowNodeRunInput, type WorkflowNodeRunIdentifier } from '../types';

export async function createWorkflowNodeRun(
  input: CreateWorkflowNodeRunInput
): Promise<WorkflowNodeRunIdentifier> {
  const workflowNodeRun = await prisma.workflowNodeRun.create({
    data: {
      inputsJson: input.inputs as never,
      nodeName: input.nodeName,
      outputsJson: {},
      startedAt: new Date(),
      status: 'running',
      workflowNodeId: input.workflowNodeId,
      workflowRunId: input.workflowRunId,
    },
    select: { id: true, startedAt: true },
  });

  return workflowNodeRun;
}
