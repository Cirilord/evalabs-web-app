import { type WorkflowGraph, type WorkflowRunnable } from '@/lib/workflows';

export type RunWorkflowButtonProps = Readonly<{
  catalog: WorkflowRunnable[];
  graph: WorkflowGraph;
}>;
