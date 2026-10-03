import { type WorkflowGraph } from '@/lib/workflows';

export type StartDetailsPanelProps = Readonly<{
  graph: WorkflowGraph;
  onInputsChange: (inputs: WorkflowGraph['inputs']) => void;
}>;
