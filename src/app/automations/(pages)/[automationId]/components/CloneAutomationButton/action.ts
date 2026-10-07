'use server';

/*
 * Temporarily disabled while local-only persistence is implemented.
 *
 * import { revalidatePath } from 'next/cache';
 *
 * import { actionClient } from '@/lib/safe-action';
 * import { cloneAutomation } from '@/services/automations/server/clone-automation';
 *
 * import { cloneAutomationSchema } from './schema/clone-automation.schema';
 *
 * export const cloneAutomationAction = actionClient
 *   .inputSchema(cloneAutomationSchema)
 *   .action(async ({ parsedInput }) => {
 *     const automation = await cloneAutomation(parsedInput);
 *
 *     revalidatePath('/');
 *
 *     return automation;
 *   });
 */
