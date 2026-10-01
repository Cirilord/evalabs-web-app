'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { cloneAutomationSchema } from './schema/clone-automation.schema';

function getCloneName(name: string) {
  const suffix = ' copy';

  return `${name.slice(0, 100 - suffix.length).trimEnd()}${suffix}`;
}

export const cloneAutomation = actionClient
  .inputSchema(cloneAutomationSchema)
  .action(async ({ parsedInput: { automationId } }) => {
    const automation = await prisma.automation.findUnique({ where: { id: automationId } });

    if (!automation) {
      throw new Error('Automation not found.');
    }

    const clonedAutomation = await prisma.automation.create({
      data: {
        description: automation.description,
        inputsJson: automation.inputsJson as never,
        librariesJson: automation.librariesJson as never,
        name: getCloneName(automation.name),
        outputsJson: automation.outputsJson as never,
        script: automation.script,
        scriptPath: automation.scriptPath,
        scriptSource: automation.scriptSource,
      },
    });

    revalidatePath('/');

    return { id: clonedAutomation.id };
  });
