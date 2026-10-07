import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type AutomationRunStatus } from '../types';

export async function findAutomationStatuses(): Promise<AutomationRunStatus[]> {
  const automations = await prisma.automation.findMany({
    select: {
      id: true,
      runs: {
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        select: { status: true },
        take: 1,
      },
    },
  });
  const automationStatuses = automations.map((automation) => ({
    automationId: automation.id,
    status: automation.runs[0]?.status ?? null,
  }));

  return automationStatuses;
}
