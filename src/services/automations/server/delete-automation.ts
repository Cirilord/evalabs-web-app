import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type AutomationIdentifier, type AutomationIdInput } from '../types';

export async function deleteAutomation(input: AutomationIdInput): Promise<AutomationIdentifier> {
  const automation = await prisma.automation.delete({
    select: { id: true },
    where: { id: input.automationId },
  });

  return automation;
}
