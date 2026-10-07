import 'client-only';

import { prisma } from '@/lib/prisma/client';

import { type AutomationListItem } from '../types';

export async function findAutomations(): Promise<AutomationListItem[]> {
  const automations = await prisma.automation.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true },
  });

  return automations;
}
