'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { completeAutomationRunSchema, runAutomationSchema } from './schema/run-automation.schema';

export const completeAutomationRun = actionClient
  .inputSchema(completeAutomationRunSchema)
  .action(async ({ parsedInput: { error, logs, outputs, runId, status } }) => {
    const run = await prisma.run.update({
      data: {
        error,
        finishedAt: new Date(),
        logs,
        outputsJson: outputs as never,
        runnerVersion: 'Pyodide 314.0.7',
        status,
      },
      where: { id: runId },
    });

    revalidatePath(`/automations/${run.automationId}`);
  });

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
        status: 'running',
      },
    });

    revalidatePath(`/automations/${automationId}`);

    return { id: run.id };
  });
