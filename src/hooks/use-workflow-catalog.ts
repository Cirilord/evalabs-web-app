import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findWorkflowCatalog } from '@/services/workflows/client/find-workflow-catalog';

export function useWorkflowCatalog() {
  return useQuery({
    queryFn: findWorkflowCatalog,
    queryKey: queryKeys.workflowCatalog,
  });
}
