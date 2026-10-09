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

export function getCloneWorkflowName(name: string): string {
  const suffix = ' copy';

  return `${name.slice(0, 100 - suffix.length).trimEnd()}${suffix}`;
}

export function cloneWorkflowGraph(graph: WorkflowGraph): WorkflowGraph {
  const nodeIds = new Map(graph.nodes.map((node) => [node.id, crypto.randomUUID()]));
  const startId = crypto.randomUUID();
  const outputId = crypto.randomUUID();

  return {
    ...graph,
    connections: graph.connections.map((connection) => ({
      ...connection,
      id: crypto.randomUUID(),
      sourceNodeId: nodeIds.get(connection.sourceNodeId) ?? connection.sourceNodeId,
      targetNodeId: nodeIds.get(connection.targetNodeId) ?? connection.targetNodeId,
    })),
    id: crypto.randomUUID(),
    name: getCloneWorkflowName(graph.name),
    nodes: graph.nodes.map((node) => ({ ...node, id: nodeIds.get(node.id) ?? node.id })),
    output: {
      ...graph.output,
      id: outputId,
      sources: graph.output.sources.map((source) => nodeIds.get(source) ?? source),
    },
    outputBindings: Object.fromEntries(
      Object.entries(graph.outputBindings).map(([name, binding]) => [
        name,
        { ...binding, nodeId: nodeIds.get(binding.nodeId) ?? binding.nodeId },
      ])
    ),
    start: {
      ...graph.start,
      id: startId,
      targets: graph.start.targets.map((target) => nodeIds.get(target) ?? target),
    },
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
