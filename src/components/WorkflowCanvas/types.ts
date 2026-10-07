import { type WorkflowGraph, type WorkflowRunnable } from '@/lib/workflows';
import { type WorkflowRunHistory } from '@/services/workflows/types';

export { type WorkflowRunHistory } from '@/services/workflows/types';

export type WorkflowCanvasProps = Readonly<{
  catalog: WorkflowRunnable[];
  graph: WorkflowGraph;
  runs: readonly WorkflowRunHistory[];
}>;
