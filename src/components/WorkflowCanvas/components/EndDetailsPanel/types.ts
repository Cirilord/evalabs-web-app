import { type WorkflowGraph, type WorkflowRunnable } from '@/lib/workflows';

export type EndDetailsPanelProps = Readonly<{
  catalog: WorkflowRunnable[];
  graph: WorkflowGraph;
  onFixedOutputsChange: (fixedOutputs: WorkflowGraph['output']['fixedOutputs']) => void;
  onOutputBindingsChange: (outputBindings: WorkflowGraph['outputBindings']) => void;
  onOutputsChange: (outputs: WorkflowGraph['outputs']) => void;
}>;
