import 'client-only';

import { prisma } from '@/lib/prisma/client';

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
      scriptPath: input.scriptMode === 'file' ? input.scriptPath : null,
      scriptSource: input.scriptMode,
    },
    select: { id: true },
  });

  return automation;
}
