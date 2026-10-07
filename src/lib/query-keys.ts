export const queryKeys = {
  automation: (automationId: string) => ['automations', automationId] as const,
  automations: ['automations'],
  automationStatuses: ['automations', 'statuses'],
  workflow: (workflowId: string) => ['workflows', workflowId] as const,
  workflowCatalog: ['workflows', 'catalog'],
  workflows: ['workflows'],
  workflowStatuses: ['workflows', 'statuses'],
} as const;
