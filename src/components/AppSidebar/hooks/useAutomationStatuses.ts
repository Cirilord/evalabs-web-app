import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

export type AutomationStatus = Readonly<{
  automationId: string;
  status: 'failed' | 'preparing' | 'running' | 'succeeded' | null;
}>;

async function fetchAutomationStatuses(): Promise<readonly AutomationStatus[]> {
  const response = await fetch('/api/automations/status');

  if (!response.ok) throw new Error('Could not fetch automation statuses.');

  return response.json() as Promise<readonly AutomationStatus[]>;
}

export function useAutomationStatuses() {
  return useQuery({
    queryFn: fetchAutomationStatuses,
    queryKey: queryKeys.automationStatuses,
  });
}
