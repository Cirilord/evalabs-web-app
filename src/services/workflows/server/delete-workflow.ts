import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type WorkflowIdentifier, type WorkflowIdInput } from '../types';

export async function deleteWorkflow(input: WorkflowIdInput): Promise<WorkflowIdentifier> {
  const workflow = await prisma.workflow.delete({
    select: { id: true },
    where: { id: input.workflowId },
  });

  return workflow;
}
