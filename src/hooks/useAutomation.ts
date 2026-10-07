import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findAutomation } from '@/services/automations/client/find-automation';

export function useAutomation(automationId: string) {
  return useQuery({
    queryFn: () => findAutomation(automationId),
    queryKey: queryKeys.automation(automationId),
  });
}
