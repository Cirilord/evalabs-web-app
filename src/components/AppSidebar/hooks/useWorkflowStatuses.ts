import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import { type SidebarItemStatus } from '../types';

export type WorkflowStatus = Readonly<{
  status: SidebarItemStatus | null;
  workflowId: string;
}>;

async function fetchWorkflowStatuses(): Promise<readonly WorkflowStatus[]> {
  const response = await fetch('/api/workflows/status');

  if (!response.ok) throw new Error('Could not fetch workflow statuses.');

  return response.json() as Promise<readonly WorkflowStatus[]>;
}

export function useWorkflowStatuses() {
  return useQuery({
    queryFn: fetchWorkflowStatuses,
    queryKey: queryKeys.workflowStatuses,
  });
}
