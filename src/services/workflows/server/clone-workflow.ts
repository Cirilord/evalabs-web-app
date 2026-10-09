import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { saveWorkflow } from './save-workflow';
import {
  type WorkflowIdentifier,
  type WorkflowIdInput,
  type WorkflowPersistenceRecord,
} from '../types';
import { cloneWorkflowGraph, toWorkflowGraph } from '../utils';

export async function cloneWorkflow(input: WorkflowIdInput): Promise<WorkflowIdentifier> {
  const workflow = await prisma.workflow.findUnique({
    include: { connections: true, nodes: true },
    where: { id: input.workflowId },
  });

  if (!workflow) {
    throw new Error('Workflow not found.');
  }

  const clonedWorkflow = await saveWorkflow(
    cloneWorkflowGraph(toWorkflowGraph(workflow as WorkflowPersistenceRecord))
  );

  return clonedWorkflow;
}
