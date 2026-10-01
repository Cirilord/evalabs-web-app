'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import { deleteAutomationSchema } from './schema/delete-automation.schema';

export const deleteAutomation = actionClient
  .inputSchema(deleteAutomationSchema)
  .action(async ({ parsedInput: { automationId } }) => {
    await prisma.automation.delete({ where: { id: automationId } });
    revalidatePath('/');
  });
