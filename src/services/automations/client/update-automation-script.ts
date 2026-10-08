import 'client-only';

import { prisma } from '@/lib/prisma/client';

import { type AutomationIdentifier, type UpdateAutomationScriptInput } from '../types';

export async function updateAutomationScript(
  input: UpdateAutomationScriptInput
): Promise<AutomationIdentifier> {
  const automation = await prisma.automation.update({
    data: { script: input.script },
    select: { id: true },
    where: { id: input.automationId },
  });

  return automation;
}
