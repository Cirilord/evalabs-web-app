'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { runAutomationSchema } from './schema/run-automation.schema';

export const runAutomation = actionClient
  .inputSchema(runAutomationSchema)
  .action(async ({ parsedInput: { automationId, inputs } }) => {
    const now = new Date();
    const run = await prisma.run.create({
      data: {
        automationId,
        inputsJson: inputs as never,
        outputsJson: {},
        startedAt: now,
        status: 'preparing',
      },
    });

    revalidatePath(`/automations/${automationId}`);

    return { id: run.id };
  });
