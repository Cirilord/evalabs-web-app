import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type CompleteAutomationRunInput, type RunIdentifier } from '../types';

export async function completeAutomationRun(
  input: CompleteAutomationRunInput
): Promise<RunIdentifier> {
  const run = await prisma.run.update({
    data: {
      error: input.error,
      finishedAt: new Date(),
      logs: input.logs,
      outputsJson: input.outputs as never,
      runnerVersion: input.runnerVersion,
      status: input.status,
    },
    select: { id: true },
    where: { id: input.runId },
  });

  return run;
}
