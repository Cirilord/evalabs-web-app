'use server';

/*
 * Temporarily disabled while local-only persistence is implemented.
 *
 * import { revalidatePath } from 'next/cache';
 *
 * import { actionClient } from '@/lib/safe-action';
 * import { completeWorkflowNodeRun as completeWorkflowNodeRunService } from '@/services/workflows/server/complete-workflow-node-run';
 * import { completeWorkflowRun as completeWorkflowRunService } from '@/services/workflows/server/complete-workflow-run';
 * import { createWorkflowNodeRun as createWorkflowNodeRunService } from '@/services/workflows/server/create-workflow-node-run';
 * import { createWorkflowRun as createWorkflowRunService } from '@/services/workflows/server/create-workflow-run';
 * import { saveWorkflow as saveWorkflowService } from '@/services/workflows/server/save-workflow';
 *
 * import {
 *   completeWorkflowNodeRunSchema,
 *   completeWorkflowRunSchema,
 *   createWorkflowNodeRunSchema,
 *   createWorkflowRunSchema,
 *   workflowSchema,
 * } from './schema/workflow.schema';
 *
 * export const saveWorkflow = actionClient
 *   .inputSchema(workflowSchema)
 *   .action(async ({ parsedInput: workflow }) => {
 *     const savedWorkflow = await saveWorkflowService(workflow);
 *
 *     revalidatePath('/');
 *     revalidatePath(`/workflows/${savedWorkflow.id}`);
 *
 *     return savedWorkflow;
 *   });
 *
 * export const createWorkflowRun = actionClient
 *   .inputSchema(createWorkflowRunSchema)
 *   .action(async ({ parsedInput }) => {
 *     const workflowRun = await createWorkflowRunService(parsedInput);
 *
 *     revalidatePath(`/workflows/${parsedInput.workflowId}`);
 *
 *     return workflowRun;
 *   });
 *
 * export const completeWorkflowRun = actionClient
 *   .inputSchema(completeWorkflowRunSchema)
 *   .action(async ({ parsedInput }) => {
 *     const workflowRun = await completeWorkflowRunService(parsedInput);
 *
 *     return workflowRun;
 *   });
 *
 * export const createWorkflowNodeRun = actionClient
 *   .inputSchema(createWorkflowNodeRunSchema)
 *   .action(async ({ parsedInput }) => {
 *     const workflowNodeRun = await createWorkflowNodeRunService(parsedInput);
 *
 *     return workflowNodeRun;
 *   });
 *
 * export const completeWorkflowNodeRun = actionClient
 *   .inputSchema(completeWorkflowNodeRunSchema)
 *   .action(async ({ parsedInput }) => {
 *     const workflowNodeRun = await completeWorkflowNodeRunService(parsedInput);
 *
 *     return workflowNodeRun;
 *   });
 */
