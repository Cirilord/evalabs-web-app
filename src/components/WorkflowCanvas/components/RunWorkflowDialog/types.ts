import { type WorkflowInput } from '@/lib/workflows';

export type RunWorkflowDialogProps = Readonly<{
  defaultOpen?: boolean;
  inputs: WorkflowInput[];
  isRunning: boolean;
  onRun: (
    values: Record<string, boolean | number | string>,
    files: Record<string, File>
  ) => Promise<void>;
}>;
