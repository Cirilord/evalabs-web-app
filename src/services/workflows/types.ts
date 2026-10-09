import { type WorkflowGraph, type WorkflowRunnable } from '@/lib/workflows';

export type WorkflowIdentifier = Readonly<{
  id: string;
}>;

export type WorkflowIdInput = Readonly<{
  workflowId: string;
}>;

export type WorkflowRunHistory = Readonly<{
  error: string;
  finishedAt: Date | null;
  id: string;
  inputs: Record<string, unknown>;
  logs: string;
  nodeRuns: readonly WorkflowNodeRunHistory[];
  outputs: Record<string, unknown>;
  startedAt: Date;
  status: string;
}>;

export type WorkflowNodeRunHistory = Readonly<{
  error: string;
  finishedAt: Date | null;
  id: string;
  inputs: Record<string, unknown>;
  logs: string;
  nodeName: string;
  outputs: Record<string, unknown>;
  startedAt: Date;
  status: string;
  workflowNodeId: string;
}>;

export type WorkflowCanvasData = Readonly<{
  catalog: WorkflowRunnable[];
  graph: WorkflowGraph;
  runs: readonly WorkflowRunHistory[];
}>;

export type WorkflowListItem = Readonly<{
  id: string;
  name: string;
}>;

export type WorkflowStatus = Readonly<{
  status: 'failed' | 'preparing' | 'running' | 'skipped' | 'succeeded' | null;
  workflowId: string;
}>;

export type SaveWorkflowInput = WorkflowGraph;

export type CreateWorkflowRunInput = Readonly<{
  inputs: Record<string, unknown>;
  workflowId: string;
}>;

export type CompleteWorkflowRunInput = Readonly<{
  error: string;
  logs: string;
  outputs: Record<string, unknown>;
  runId: string;
  status: 'failed' | 'succeeded';
}>;

export type CreateWorkflowNodeRunInput = Readonly<{
  inputs: Record<string, unknown>;
  nodeName: string;
  workflowNodeId: string;
  workflowRunId: string;
}>;

export type CompleteWorkflowNodeRunInput = Readonly<{
  error: string;
  logs: string;
  nodeRunId: string;
  outputs: Record<string, unknown>;
  status: 'failed' | 'succeeded';
}>;

export type WorkflowRunIdentifier = Readonly<{
  id: string;
  startedAt: Date;
}>;

export type WorkflowNodeRunIdentifier = Readonly<{
  id: string;
  startedAt: Date;
}>;

export type AutomationPersistenceRecord = Readonly<{
  description: string;
  id: string;
  inputsJson: unknown;
  librariesJson: unknown;
  name: string;
  outputsJson: unknown;
  script: string;
}>;

export type WorkflowNodeRunPersistenceRecord = Readonly<{
  error: string;
  finishedAt: Date | null;
  id: string;
  inputsJson: unknown;
  logs: string;
  nodeName: string;
  outputsJson: unknown;
  startedAt: Date;
  status: string;
  workflowNodeId: string;
}>;

export type WorkflowRunPersistenceRecord = Readonly<{
  error: string;
  finishedAt: Date | null;
  id: string;
  inputsJson: unknown;
  logs: string;
  nodeRuns: ReadonlyArray<WorkflowNodeRunPersistenceRecord>;
  outputsJson: unknown;
  startedAt: Date;
  status: string;
}>;

export type WorkflowPersistenceRecord = Readonly<{
  connections: ReadonlyArray<
    Readonly<{
      id: string;
      sourceNodeId: string;
      sourceOutputName: string;
      targetInputName: string;
      targetNodeId: string;
    }>
  >;
  description: string;
  id: string;
  inputsJson: unknown;
  name: string;
  nodes: ReadonlyArray<
    Readonly<{
      fixedInputsJson: unknown;
      id: string;
      inputBindingsJson: unknown;
      positionX: number;
      positionY: number;
      runnableId: string;
      runnableType: 'automation' | 'workflow';
    }>
  >;
  outputBindingsJson: unknown;
  outputJson: unknown;
  outputsJson: unknown;
  startJson: unknown;
}>;
