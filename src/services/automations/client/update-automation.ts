import 'client-only';

import { prisma } from '@/lib/prisma/client';

import { type AutomationIdentifier, type UpdateAutomationInput } from '../types';

export async function updateAutomation(
  input: UpdateAutomationInput
): Promise<AutomationIdentifier> {
  const automation = await prisma.automation.update({
    data: {
      description: input.description,
      inputsJson: input.inputs,
      librariesJson: input.libraries,
      name: input.name,
      outputsJson: input.outputs,
      script: input.script,
    },
    select: { id: true },
    where: { id: input.id },
  });

  return automation;
}
