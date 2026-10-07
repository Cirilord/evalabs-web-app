import 'server-only';

import { type Automation, type Run } from '@/generated/prisma-server/client';
import { prisma } from '@/lib/prisma/server';

import { type AutomationWithRuns } from '../types';

export async function findAutomation(
  automationId: string
): Promise<AutomationWithRuns<Automation, Run> | null> {
  const automation = await prisma.automation.findUnique({
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
      },
    },
    where: { id: automationId },
  });

  return automation;
}
