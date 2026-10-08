import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type AutomationIdentifier, type CreateAutomationInput } from '../types';

export async function createAutomation(
  input: CreateAutomationInput
): Promise<AutomationIdentifier> {
  const automation = await prisma.automation.create({
    data: {
      description: input.description,
      id: crypto.randomUUID(),
      inputsJson: input.inputs,
      librariesJson: input.libraries,
      name: input.name,
      outputsJson: input.outputs,
      script: input.script,
    },
    select: { id: true },
  });

  return automation;
}
