'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { createAutomationSchema } from './schema/automation-form.schema';

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
    redirect(`/automations/${automation.id}`);
  });

export const updateAutomation = actionClient
  .inputSchema(createAutomationSchema.extend({ id: createAutomationSchema.shape.name.uuid() }))
  .action(async ({ parsedInput: automationData }) => {
    const automation = await prisma.automation.update({
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
      where: { id: automationData.id },
    });

    revalidatePath('/');
    revalidatePath(`/automations/${automation.id}`);
    redirect(`/automations/${automation.id}`);
  });
