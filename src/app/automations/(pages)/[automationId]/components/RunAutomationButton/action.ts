'use server';

/*
 * Temporarily disabled while local-only persistence is implemented.
 *
 * import { revalidatePath } from 'next/cache';
 *
 * import { actionClient } from '@/lib/safe-action';
 * import { completeAutomationRun } from '@/services/automations/server/complete-automation-run';
 * import { createAutomationRun } from '@/services/automations/server/create-automation-run';
 *
 * import { completeAutomationRunSchema, runAutomationSchema } from './schema/run-automation.schema';
 *
 * export const completeAutomationRunAction = actionClient
 *   .inputSchema(completeAutomationRunSchema)
 *   .action(async ({ parsedInput }) => {
 *     await completeAutomationRun(parsedInput);
 *   });
 *
 * export const createAutomationRunAction = actionClient
 *   .inputSchema(runAutomationSchema)
 *   .action(async ({ parsedInput }) => {
 *     const run = await createAutomationRun(parsedInput);
 *
 *     revalidatePath(`/automations/${parsedInput.automationId}`);
 *
 *     return run;
 *   });
 */
