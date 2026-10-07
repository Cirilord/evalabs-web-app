import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { findAutomationStatuses } from '@/services/automations/client/find-automation-statuses';
import { type AutomationRunStatus } from '@/services/automations/types';

export function useAutomationStatuses() {
  return useQuery<AutomationRunStatus[]>({
    queryFn: findAutomationStatuses,
    queryKey: queryKeys.automationStatuses,
  });
}
