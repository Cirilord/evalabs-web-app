import { notFound } from 'next/navigation';

import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { type WorkflowRunHistory } from '@/components/WorkflowCanvas/types';
import { prisma } from '@/lib/prisma';
import {
  type WorkflowGraph,
  type WorkflowInput,
  type WorkflowOutput,
  type WorkflowRunnable,
} from '@/lib/workflows';

import { type WorkflowDetailsPageProps } from './types';

export default async function WorkflowDetailsPage(props: WorkflowDetailsPageProps) {
  const { params } = props;
  const { workflowId } = await params;
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

  if (!workflow) notFound();

  const graph: WorkflowGraph = {
    connections: workflow.connections,
    description: workflow.description,
    id: workflow.id,
    inputs: workflow.inputsJson as WorkflowInput[],
    name: workflow.name,
    nodes: workflow.nodes.map((node) => ({
      fixedInputs: node.fixedInputsJson as WorkflowGraph['nodes'][number]['fixedInputs'],
      id: node.id,
      inputBindings: node.inputBindingsJson as WorkflowGraph['nodes'][number]['inputBindings'],
      positionX: node.positionX,
      positionY: node.positionY,
      runnableId: node.runnableId,
      runnableType: node.runnableType,
    })),
    output: {
      ...(workflow.outputJson as Omit<WorkflowGraph['output'], 'fixedOutputs' | 'sources'> & {
        fixedOutputs?: WorkflowGraph['output']['fixedOutputs'];
        sources?: string[];
      }),
      fixedOutputs: (workflow.outputJson as Partial<WorkflowGraph['output']>).fixedOutputs ?? {},
      sources: (workflow.outputJson as Partial<WorkflowGraph['output']>).sources ?? [],
    },
    outputBindings: workflow.outputBindingsJson as WorkflowGraph['outputBindings'],
    outputs: workflow.outputsJson as WorkflowOutput[],
    start: workflow.startJson as WorkflowGraph['start'],
  };
  const catalog = [
    ...automations.map((automation) => ({
      description: automation.description,
      id: automation.id,
      inputs: automation.inputsJson as WorkflowInput[],
      libraries: automation.librariesJson as unknown as NonNullable<WorkflowRunnable['libraries']>,
      name: automation.name,
      outputs: automation.outputsJson as WorkflowOutput[],
      script: automation.script,
      type: 'automation' as const,
    })),
    ...workflows.map((item) => ({
      description: item.description,
      graph: {
        connections: item.connections,
        description: item.description,
        id: item.id,
        inputs: item.inputsJson as WorkflowInput[],
        name: item.name,
        nodes: item.nodes.map((node) => ({
          fixedInputs: node.fixedInputsJson as WorkflowGraph['nodes'][number]['fixedInputs'],
          id: node.id,
          inputBindings: node.inputBindingsJson as WorkflowGraph['nodes'][number]['inputBindings'],
          positionX: node.positionX,
          positionY: node.positionY,
          runnableId: node.runnableId,
          runnableType: node.runnableType,
        })),
        output: {
          ...(item.outputJson as Omit<WorkflowGraph['output'], 'fixedOutputs' | 'sources'> & {
            fixedOutputs?: WorkflowGraph['output']['fixedOutputs'];
            sources?: string[];
          }),
          fixedOutputs: (item.outputJson as Partial<WorkflowGraph['output']>).fixedOutputs ?? {},
          sources: (item.outputJson as Partial<WorkflowGraph['output']>).sources ?? [],
        },
        outputBindings: item.outputBindingsJson as WorkflowGraph['outputBindings'],
        outputs: item.outputsJson as WorkflowOutput[],
        start: item.startJson as WorkflowGraph['start'],
      },
      id: item.id,
      inputs: item.inputsJson as WorkflowInput[],
      name: item.name,
      outputs: item.outputsJson as WorkflowOutput[],
      type: 'workflow' as const,
    })),
  ];

  const runs: readonly WorkflowRunHistory[] = workflow.runs.map((run) => ({
    error: run.error,
    finishedAt: run.finishedAt,
    id: run.id,
    inputs: run.inputsJson as WorkflowRunHistory['inputs'],
    logs: run.logs,
    nodeRuns: run.nodeRuns.map((nodeRun) => ({
      error: nodeRun.error,
      finishedAt: nodeRun.finishedAt,
      id: nodeRun.id,
      inputs: nodeRun.inputsJson as WorkflowRunHistory['inputs'],
      logs: nodeRun.logs,
      nodeName: nodeRun.nodeName,
      outputs: nodeRun.outputsJson as WorkflowRunHistory['outputs'],
      startedAt: nodeRun.startedAt,
      status: nodeRun.status,
      workflowNodeId: nodeRun.workflowNodeId,
    })),
    outputs: run.outputsJson as WorkflowRunHistory['outputs'],
    startedAt: run.startedAt,
    status: run.status,
  }));

  return <WorkflowCanvas catalog={catalog} graph={graph} runs={runs} />;
}
