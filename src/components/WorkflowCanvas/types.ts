import { type WorkflowGraph, type WorkflowRunnable } from '@/lib/workflows';

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

export type WorkflowCanvasProps = Readonly<{
  catalog: WorkflowRunnable[];
  graph: WorkflowGraph;
  runs: readonly WorkflowRunHistory[];
}>;
