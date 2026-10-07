import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findWorkflowCanvasData } from '@/services/workflows/client/find-workflow-canvas-data';

export function useWorkflowCanvasData(workflowId: string) {
  return useQuery({
    queryFn: () => findWorkflowCanvasData(workflowId),
    queryKey: queryKeys.workflow(workflowId),
  });
}
