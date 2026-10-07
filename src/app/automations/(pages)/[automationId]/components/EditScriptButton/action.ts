'use server';

/*
 * Temporarily disabled while local-only persistence is implemented.
 *
 * import { revalidatePath } from 'next/cache';
 *
 * import { actionClient } from '@/lib/safe-action';
 * import { updateAutomationScript } from '@/services/automations/server/update-automation-script';
 *
 * import { updateAutomationScriptSchema } from './schema/update-automation-script.schema';
 *
 * export const updateAutomationScriptAction = actionClient
 *   .inputSchema(updateAutomationScriptSchema)
 *   .action(async ({ parsedInput }) => {
 *     const automation = await updateAutomationScript(parsedInput);
 *
 *     revalidatePath(`/automations/${automation.id}`);
 *   });
 */
