export type WorkflowPortType = 'boolean' | 'file' | 'number' | 'text';

export type WorkflowInput = Readonly<{
  description: string;
  name: string;
  required: boolean;
  type: WorkflowPortType;
}>;

export type WorkflowOutput = Readonly<{
  description: string;
  name: string;
  type: WorkflowPortType;
}>;

export type WorkflowNode = Readonly<{
  fixedInputs: Record<string, boolean | number | string>;
  id: string;
  inputBindings: Record<string, string>;
  positionX: number;
  positionY: number;
  runnableId: string;
  runnableType: 'automation' | 'workflow';
}>;

export type WorkflowConnection = Readonly<{
  id: string;
  sourceNodeId: string;
  sourceOutputName: string;
  targetInputName: string;
  targetNodeId: string;
}>;

export type WorkflowGraph = Readonly<{
  connections: WorkflowConnection[];
  description: string;
  id: string;
  inputs: WorkflowInput[];
  name: string;
  nodes: WorkflowNode[];
  output: Readonly<{
    fixedOutputs: Record<string, boolean | number | string>;
    id: string;
    positionX: number;
    positionY: number;
    sources: string[];
  }>;
  outputBindings: Record<string, Readonly<{ nodeId: string; outputName: string }>>;
  outputs: WorkflowOutput[];
  start: Readonly<{ id: string; positionX: number; positionY: number; targets: string[] }>;
}>;

export type WorkflowRunnable = Readonly<{
  description: string;
  graph?: WorkflowGraph;
  id: string;
  inputs: WorkflowInput[];
  libraries?: ReadonlyArray<Readonly<{ name: string; version: string }>>;
  name: string;
  outputs: WorkflowOutput[];
  script?: string;
  type: 'automation' | 'workflow';
}>;

export type WorkflowError = Readonly<{
  key:
    | 'workflow.errorDisconnectedNode'
    | 'workflow.errorInvalidConnection'
    | 'workflow.errorInvalidOutputBinding'
    | 'workflow.errorMissingInput'
    | 'workflow.errorPortNames'
    | 'workflow.errorWorkflowName';
  values?: Record<string, string>;
}>;

export function getWorkflowErrors(
  graph: WorkflowGraph,
  catalog: WorkflowRunnable[]
): WorkflowError[] {
  const errors: WorkflowError[] = [];

  if (!graph.name.trim()) errors.push({ key: 'workflow.errorWorkflowName' });

  for (const ports of [graph.inputs, graph.outputs]) {
    if (
      ports.some((port) => !port.name.trim()) ||
      new Set(ports.map((port) => port.name)).size !== ports.length
    ) {
      errors.push({ key: 'workflow.errorPortNames' });
    }
  }

  for (const node of graph.nodes) {
    const runnable = catalog.find(
      (item) => item.id === node.runnableId && item.type === node.runnableType
    );
    const connectedFromStart = graph.start.targets.includes(node.id);
    const hasIncomingConnection = graph.connections.some(
      (connection) => connection.targetNodeId === node.id
    );

    if (!connectedFromStart && !hasIncomingConnection) {
      errors.push({
        key: 'workflow.errorDisconnectedNode',
        values: { name: runnable?.name ?? node.runnableId },
      });
    }

    for (const input of runnable?.inputs ?? []) {
      const hasConnection = graph.connections.some(
        (connection) =>
          connection.targetNodeId === node.id && connection.targetInputName === input.name
      );
      const hasFixedValue = Object.hasOwn(node.fixedInputs, input.name);
      const hasStartBinding = connectedFromStart && Boolean(node.inputBindings[input.name]);

      if (input.required && !hasConnection && !hasFixedValue && !hasStartBinding) {
        errors.push({
          key: 'workflow.errorMissingInput',
          values: { name: input.name, runnable: runnable?.name ?? node.runnableId },
        });
      }
    }
  }

  for (const connection of graph.connections) {
    const sourceNode = graph.nodes.find((node) => node.id === connection.sourceNodeId);
    const targetNode = graph.nodes.find((node) => node.id === connection.targetNodeId);
    const sourceRunnable = sourceNode
      ? catalog.find(
          (item) => item.id === sourceNode.runnableId && item.type === sourceNode.runnableType
        )
      : undefined;
    const targetRunnable = targetNode
      ? catalog.find(
          (item) => item.id === targetNode.runnableId && item.type === targetNode.runnableType
        )
      : undefined;
    const sourceOutput = sourceRunnable?.outputs.find(
      (output) => output.name === connection.sourceOutputName
    );
    const targetInput = targetRunnable?.inputs.find(
      (input) => input.name === connection.targetInputName
    );

    const hasInvalidSourceOutput = connection.sourceOutputName !== '' && sourceOutput === undefined;
    const hasInvalidTargetInput =
      connection.targetInputName !== '' &&
      (targetInput === undefined ||
        sourceOutput === undefined ||
        sourceOutput.type !== targetInput.type);

    if (!sourceNode || !targetNode || hasInvalidSourceOutput || hasInvalidTargetInput) {
      errors.push({ key: 'workflow.errorInvalidConnection' });
    }
  }

  for (const output of graph.outputs) {
    const binding = graph.outputBindings[output.name];
    const sourceNode = graph.nodes.find((node) => node.id === binding?.nodeId);
    const sourceRunnable = sourceNode
      ? catalog.find(
          (item) => item.id === sourceNode.runnableId && item.type === sourceNode.runnableType
        )
      : undefined;
    const validBinding = sourceRunnable?.outputs.some(
      (sourceOutput) =>
        sourceOutput.name === binding?.outputName && sourceOutput.type === output.type
    );
    const fixedOutput = graph.output.fixedOutputs[output.name];
    const validFixedOutput =
      Object.hasOwn(graph.output.fixedOutputs, output.name) &&
      (output.type === 'number'
        ? typeof fixedOutput === 'number' && Number.isFinite(fixedOutput)
        : typeof fixedOutput === (output.type === 'boolean' ? 'boolean' : 'string'));

    if (!validBinding && !validFixedOutput) {
      errors.push({
        key: 'workflow.errorInvalidOutputBinding',
        values: { name: output.name || '(unnamed)' },
      });
    }
  }

  return Array.from(
    new Map(errors.map((error) => [`${error.key}:${JSON.stringify(error.values)}`, error])).values()
  );
}

export function configureWorkflowOutputs(
  graph: WorkflowGraph,
  outputs: WorkflowOutput[]
): WorkflowGraph {
  const outputNames = new Map(
    graph.outputs.map((port, index) => [
      port.name,
      outputs.some((output) => output.name === port.name)
        ? port.name
        : graph.outputs.length === outputs.length
          ? outputs[index]?.name
          : undefined,
    ])
  );

  return {
    ...graph,
    output: {
      ...graph.output,
      fixedOutputs: Object.fromEntries(
        Object.entries(graph.output.fixedOutputs).flatMap(([name, value]) => {
          const renamedOutput = outputNames.get(name);

          return renamedOutput === undefined ? [] : [[renamedOutput, value]];
        })
      ),
    },
    outputBindings: Object.fromEntries(
      Object.entries(graph.outputBindings).flatMap(([name, binding]) => {
        const renamedOutput = outputNames.get(name);

        return renamedOutput === undefined ? [] : [[renamedOutput, binding]];
      })
    ),
    outputs,
  };
}

export function createWorkflowGraph(name: string): WorkflowGraph {
  return {
    connections: [],
    description: '',
    id: crypto.randomUUID(),
    inputs: [],
    name,
    nodes: [],
    output: {
      fixedOutputs: {},
      id: crypto.randomUUID(),
      positionX: 760,
      positionY: 240,
      sources: [],
    },
    outputBindings: {},
    outputs: [],
    start: { id: crypto.randomUUID(), positionX: 80, positionY: 240, targets: [] },
  };
}
