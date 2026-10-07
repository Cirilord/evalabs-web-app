import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findAutomations } from '@/services/automations/client/find-automations';

export function useAutomations() {
  return useQuery({
    queryFn: findAutomations,
    queryKey: queryKeys.automations,
  });
}
