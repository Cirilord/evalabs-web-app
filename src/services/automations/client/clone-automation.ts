import 'client-only';

import { prisma } from '@/lib/prisma/client';

import { type AutomationIdentifier, type AutomationIdInput } from '../types';
import { getCloneAutomationName } from '../utils';

export async function cloneAutomation(input: AutomationIdInput): Promise<AutomationIdentifier> {
  const automation = await prisma.automation.findUnique({ where: { id: input.automationId } });

  if (!automation) throw new Error('Automation not found.');

  const clonedAutomation = await prisma.automation.create({
    data: {
      description: automation.description,
      inputsJson: automation.inputsJson as never,
      librariesJson: automation.librariesJson as never,
      name: getCloneAutomationName(automation.name),
      outputsJson: automation.outputsJson as never,
      script: automation.script,
      scriptPath: automation.scriptPath,
      scriptSource: automation.scriptSource,
    },
    select: { id: true },
  });

  return clonedAutomation;
}
