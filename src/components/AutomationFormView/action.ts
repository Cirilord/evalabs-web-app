'use server';

/*
 * Temporarily disabled while local-only persistence is implemented.
 *
 * import { revalidatePath } from 'next/cache';
 * import { redirect } from 'next/navigation';
 *
 * import { actionClient } from '@/lib/safe-action';
 * import { createAutomation } from '@/services/automations/server/create-automation';
 * import { updateAutomation } from '@/services/automations/server/update-automation';
 *
 * import { createAutomationSchema } from './schema/automation-form.schema';
 *
 * export const createAutomationAction = actionClient
 *   .inputSchema(createAutomationSchema)
 *   .action(async ({ parsedInput: automationData }) => {
 *     const automation = await createAutomation(automationData);
 *
 *     revalidatePath('/');
 *     redirect(`/automations/${automation.id}`);
 *   });
 *
 * export const updateAutomationAction = actionClient
 *   .inputSchema(createAutomationSchema.extend({ id: createAutomationSchema.shape.name.uuid() }))
 *   .action(async ({ parsedInput: automationData }) => {
 *     const automation = await updateAutomation(automationData);
 *
 *     revalidatePath('/');
 *     revalidatePath(`/automations/${automation.id}`);
 *     redirect(`/automations/${automation.id}`);
 *   });
 */
