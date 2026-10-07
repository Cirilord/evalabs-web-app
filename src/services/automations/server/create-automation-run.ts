import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type AutomationRunInput, type RunIdentifier } from '../types';

export async function createAutomationRun(input: AutomationRunInput): Promise<RunIdentifier> {
  const run = await prisma.run.create({
    data: {
      automationId: input.automationId,
      inputsJson: input.inputs as never,
      outputsJson: {},
      runnerVersion: input.runnerVersion,
      startedAt: new Date(),
      status: 'running',
    },
    select: { id: true },
  });

  return run;
}
