import 'client-only';

import { findWorkflowCanvasData } from '@/services/workflows/client/find-workflow-canvas-data';

import { saveWorkflow } from './save-workflow';
import { type WorkflowIdentifier, type WorkflowIdInput } from '../types';
import { cloneWorkflowGraph } from '../utils';

export async function cloneWorkflow(input: WorkflowIdInput): Promise<WorkflowIdentifier> {
  const data = await findWorkflowCanvasData(input.workflowId);

  if (!data) {
    throw new Error('Workflow not found.');
  }

  const clonedWorkflow = await saveWorkflow(cloneWorkflowGraph(data.graph));

  return clonedWorkflow;
}
