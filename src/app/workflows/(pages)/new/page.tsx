import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { prisma } from '@/lib/prisma';
import { createWorkflowGraph, type WorkflowInput, type WorkflowOutput } from '@/lib/workflows';

import { type NewWorkflowPageProps } from './types';

export default async function NewWorkflowPage(props: NewWorkflowPageProps) {
  void props;
  const [automations, workflows] = await Promise.all([
    prisma.automation.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.workflow.findMany({ orderBy: { updatedAt: 'desc' } }),
  ]);
  const catalog = [
    ...automations.map((automation) => ({
      description: automation.description,
      id: automation.id,
      inputs: automation.inputsJson as WorkflowInput[],
      name: automation.name,
      outputs: automation.outputsJson as WorkflowOutput[],
      type: 'automation' as const,
    })),
    ...workflows.map((workflow) => ({
      description: workflow.description,
      id: workflow.id,
      inputs: workflow.inputsJson as WorkflowInput[],
      name: workflow.name,
      outputs: workflow.outputsJson as WorkflowOutput[],
      type: 'workflow' as const,
    })),
  ];

  return <WorkflowCanvas catalog={catalog} graph={createWorkflowGraph('New workflow')} runs={[]} />;
}
