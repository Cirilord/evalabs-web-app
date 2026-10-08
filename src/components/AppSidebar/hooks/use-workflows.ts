import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findWorkflows } from '@/services/workflows/client/find-workflows';

export function useWorkflows() {
  return useQuery({
    queryFn: findWorkflows,
    queryKey: queryKeys.workflows,
  });
}
