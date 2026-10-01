'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { updateAutomationScriptSchema } from './schema/update-automation-script.schema';

export const updateAutomationScript = actionClient
  .inputSchema(updateAutomationScriptSchema)
  .action(async ({ parsedInput: { automationId, script } }) => {
    await prisma.automation.update({
      data: { script, scriptPath: null, scriptSource: 'managed' },
      where: { id: automationId },
    });

    revalidatePath(`/automations/${automationId}`);
  });
