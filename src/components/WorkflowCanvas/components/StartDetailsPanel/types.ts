import { type WorkflowGraph } from '@/lib/workflows';

export type StartDetailsPanelProps = Readonly<{
  graph: WorkflowGraph;
  onClose: () => void;
  onInputsChange: (inputs: WorkflowGraph['inputs']) => void;
}>;
