'use server';

/*
 * Temporarily disabled while local-only persistence is implemented.
 *
 * import { revalidatePath } from 'next/cache';
 *
 * import { actionClient } from '@/lib/safe-action';
 * import { deleteAutomation } from '@/services/automations/server/delete-automation';
 *
 * import { deleteAutomationSchema } from './schema/delete-automation.schema';
 *
 * export const deleteAutomationAction = actionClient
 *   .inputSchema(deleteAutomationSchema)
 *   .action(async ({ parsedInput }) => {
 *     await deleteAutomation(parsedInput);
 *
 *     revalidatePath('/');
 *   });
 */
