import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findWorkflowStatuses } from '@/services/workflows/client/find-workflow-statuses';

export function useWorkflowStatuses() {
  return useQuery({
    queryFn: findWorkflowStatuses,
    queryKey: queryKeys.workflowStatuses,
  });
}
