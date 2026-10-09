import { type WorkflowRunHistory } from '@/services/workflows/types';

export type RunDetailsButtonProps = Readonly<{
  run: WorkflowRunHistory;
}>;
