import {
  type WorkflowGraph,
  type WorkflowInput,
  type WorkflowOutput,
  type WorkflowRunnable,
} from '@/lib/workflows';

import {
  type AutomationPersistenceRecord,
  type WorkflowPersistenceRecord,
  type WorkflowRunHistory,
  type WorkflowRunPersistenceRecord,
} from './types';

export function toWorkflowGraph(workflow: WorkflowPersistenceRecord): WorkflowGraph {
  const output = workflow.outputJson as Partial<WorkflowGraph['output']>;

  return {
    connections: [...workflow.connections],
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
      ...(output as Omit<WorkflowGraph['output'], 'fixedOutputs' | 'sources'>),
      fixedOutputs: output.fixedOutputs ?? {},
      sources: output.sources ?? [],
    },
    outputBindings: workflow.outputBindingsJson as WorkflowGraph['outputBindings'],
    outputs: workflow.outputsJson as WorkflowOutput[],
    start: workflow.startJson as WorkflowGraph['start'],
  };
}

export function toWorkflowRunHistory(
  runs: ReadonlyArray<WorkflowRunPersistenceRecord>
): WorkflowRunHistory[] {
  return runs.map((run) => ({
    error: run.error,
    finishedAt: run.finishedAt,
    id: run.id,
    inputs: run.inputsJson as Record<string, unknown>,
    logs: run.logs,
    nodeRuns: run.nodeRuns.map((nodeRun) => ({
      error: nodeRun.error,
      finishedAt: nodeRun.finishedAt,
      id: nodeRun.id,
      inputs: nodeRun.inputsJson as Record<string, unknown>,
      logs: nodeRun.logs,
      nodeName: nodeRun.nodeName,
      outputs: nodeRun.outputsJson as Record<string, unknown>,
      startedAt: nodeRun.startedAt,
      status: nodeRun.status,
      workflowNodeId: nodeRun.workflowNodeId,
    })),
    outputs: run.outputsJson as Record<string, unknown>,
    startedAt: run.startedAt,
    status: run.status,
  }));
}

export function toWorkflowCatalog(
  automations: ReadonlyArray<AutomationPersistenceRecord>,
  workflows: ReadonlyArray<WorkflowPersistenceRecord>
): WorkflowRunnable[] {
  return [
    ...automations.map(
      (automation) =>
        ({
          description: automation.description,
          id: automation.id,
          inputs: automation.inputsJson as WorkflowInput[],
          libraries: automation.librariesJson,
          name: automation.name,
          outputs: automation.outputsJson as WorkflowOutput[],
          script: automation.script,
          type: 'automation',
        }) as WorkflowRunnable
    ),
    ...workflows.map(
      (workflow) =>
        ({
          description: workflow.description,
          graph: toWorkflowGraph(workflow),
          id: workflow.id,
          inputs: workflow.inputsJson as WorkflowInput[],
          name: workflow.name,
          outputs: workflow.outputsJson as WorkflowOutput[],
          type: 'workflow',
        }) as WorkflowRunnable
    ),
  ];
}
