'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { createAutomationSchema } from './schema/create-automation.schema';

export const createAutomation = actionClient
  .inputSchema(createAutomationSchema)
  .action(async ({ parsedInput: automationData }) => {
    const automation = await prisma.automation.create({
      data: {
        description: automationData.description,
        inputsJson: automationData.inputs,
        librariesJson: automationData.libraries,
        name: automationData.name,
        outputsJson: automationData.outputs,
        script: automationData.script,
        scriptPath: automationData.scriptMode === 'file' ? automationData.scriptPath : null,
        scriptSource: automationData.scriptMode,
      },
    });

    revalidatePath('/');

    return { id: automation.id };
  });
